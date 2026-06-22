const FB = 'https://fir-database-67c79-default-rtdb.firebaseio.com';

function fbGet(path) {
        return fetch(FB + path).then(r => {
                if (!r.ok) return r.text().then(t => { throw new Error('HTTP ' + r.status + ': ' + t); });
                return r.json();
        });
}

function fbPut(path, data) {
        return fetch(FB + path, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
        }).then(r => {
                if (!r.ok) return r.text().then(t => { throw new Error('HTTP ' + r.status + ': ' + t); });
                return r.json();
        });
}

function fbDelete(path) {
        return fetch(FB + path, { method: 'DELETE' }).then(r => {
                if (!r.ok) return r.text().then(t => { throw new Error('HTTP ' + r.status + ': ' + t); });
                return r.json();
        });
}

function escapeHtml(s) {
        if (s == null) return '';
        return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function escapeAttr(s) {
        if (s == null) return '';
        return String(s).replace(/'/g, "\\'");
}

function initials(name) {
        if (!name) return '?';
        return name.charAt(0).toUpperCase();
}

function launchGame(gameId) {
        window.location.href = 'brickbuild://Client/' + encodeURIComponent(gameId);
}

let currentUser = localStorage.getItem('bb_user') || null;

function showPanel(name) {
        document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
        const panel = document.getElementById('panel-' + name);
        if (panel) panel.classList.add('active');
        const btn = document.querySelector('.nav-btn[data-panel="' + name + '"]');
        if (btn) btn.classList.add('active');
        if (name === 'games') loadGames();
        if (name === 'users') loadUsers();
        if (name === 'catalog') loadCatalog();
}

function loadGames() {
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '<div class="loading">Loading games...</div>';
        fbGet('/games.json').then(data => {
                if (!data) { grid.innerHTML = '<div class="loading">No games yet.</div>'; return; }
                const games = Object.entries(data);
                if (games.length === 0) { grid.innerHTML = '<div class="loading">No games yet. Create one!</div>'; return; }
                grid.innerHTML = '';
                games.forEach(([gid, g]) => {
                        const card = document.createElement('div');
                        card.className = 'card game-card';
                        const author = g.author || 'Unknown';
                        card.innerHTML =
                                '<div class="card-title">' + escapeHtml(g.name || 'Untitled') + '</div>' +
                                '<div class="card-meta">by <a href="#" class="author-link" data-author="' + escapeHtml(author) + '">' + escapeHtml(author) + '</a></div>' +
                                '<div class="card-tag">Game</div>' +
                                '<button class="play-btn" data-gid="' + escapeHtml(gid) + '">Play</button>';
                        card.querySelector('.author-link').addEventListener('click', e => {
                                e.stopPropagation();
                                viewProfile(author);
                        });
                        card.querySelector('.play-btn').addEventListener('click', e => {
                                e.stopPropagation();
                                launchGame(gid);
                        });
                        card.addEventListener('click', () => launchGame(gid));
                        grid.appendChild(card);
                });
        }).catch(err => { grid.innerHTML = '<div class="loading">Failed to load: ' + escapeHtml(err.message) + '</div>'; });
}

function loadUsers() {
        const grid = document.getElementById('users-grid');
        grid.innerHTML = '<div class="loading">Loading users...</div>';
        fbGet('/users.json').then(data => {
                if (!data) { grid.innerHTML = '<div class="loading">No users yet.</div>'; return; }
                const names = Object.keys(data);
                if (names.length === 0) { grid.innerHTML = '<div class="loading">No users yet.</div>'; return; }
                grid.innerHTML = '';
                Promise.all(names.map(n => fbGet('/users/' + encodeURIComponent(n) + '/followers.json').catch(() => null))).then(fols => {
                        names.forEach((n, i) => {
                                const info = data[n] || {};
                                const fc = (fols[i] && typeof fols[i] === 'object') ? Object.keys(fols[i]).length : 0;
                                const card = document.createElement('div');
                                card.className = 'card user-card';
                                let avatarHtml;
                                if (info.avatar) {
                                        avatarHtml = '<div class="user-avatar"><img src="data:image/png;base64,' + info.avatar + '" alt=""></div>';
                                } else {
                                        avatarHtml = '<div class="user-avatar">' + initials(n) + '</div>';
                                }
                                card.innerHTML = avatarHtml +
                                        '<div class="user-name">' + escapeHtml(n) + '</div>' +
                                        '<div class="user-bio">' + escapeHtml(info.bio || '') + '</div>' +
                                        '<div class="user-followers">' + fc + ' followers</div>';
                                card.onclick = () => viewProfile(n);
                                grid.appendChild(card);
                        });
                });
        }).catch(err => { grid.innerHTML = '<div class="loading">Failed to load: ' + escapeHtml(err.message) + '</div>'; });
}

function loadCatalog() {
        const grid = document.getElementById('catalog-grid');
        grid.innerHTML = '<div class="loading">Loading catalog...</div>';
        fbGet('/catalog.json').then(data => {
                if (!data) { grid.innerHTML = '<div class="loading">Catalog is empty.</div>'; return; }
                const items = Object.entries(data);
                if (items.length === 0) { grid.innerHTML = '<div class="loading">Catalog is empty.</div>'; return; }
                grid.innerHTML = '';
                items.forEach(([iid, it]) => {
                        const card = document.createElement('div');
                        card.className = 'card catalog-card';
                        const author = it.author || 'Unknown';
                        let imgHtml = '';
                        if (it.image_data) {
                                imgHtml = '<div class="catalog-img"><img src="data:image/png;base64,' + it.image_data + '" alt=""></div>';
                        } else if (it.image_path) {
                                imgHtml = '<div class="catalog-img"><img src="' + escapeHtml(it.image_path) + '" alt=""></div>';
                        }
                        card.innerHTML = imgHtml +
                                '<div class="card-title">' + escapeHtml(it.name || 'Untitled') + '</div>' +
                                '<div class="card-meta">by <a href="#" class="author-link" data-author="' + escapeHtml(author) + '">' + escapeHtml(author) + '</a></div>' +
                                '<div class="card-tag">' + escapeHtml((it.type || 'item').charAt(0).toUpperCase() + (it.type || '').slice(1)) + '</div>';
                        card.querySelector('.author-link').addEventListener('click', e => {
                                e.stopPropagation();
                                viewProfile(author);
                        });
                        const capturedIid = iid;
                        card.addEventListener('click', () => viewItem(capturedIid));
                        grid.appendChild(card);
                });
        }).catch(err => { grid.innerHTML = '<div class="loading">Failed to load: ' + escapeHtml(err.message) + '</div>'; });
}

function viewItem(itemId) {
        showPanel('item');
        document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
        const content = document.getElementById('item-content');
        content.innerHTML = '<div class="loading">Loading item...</div>';
        fbGet('/catalog/' + encodeURIComponent(itemId) + '.json').then(item => {
                if (!item) {
                        content.innerHTML = '<div class="loading">Item not found.</div>';
                        return;
                }
                let imgHtml = '';
                if (item.image_data) {
                        imgHtml = '<div class="item-detail-img"><img src="data:image/png;base64,' + item.image_data + '" alt=""></div>';
                } else if (item.image_path) {
                        imgHtml = '<div class="item-detail-img"><img src="' + escapeHtml(item.image_path) + '" alt=""></div>';
                }
                const author = item.author || 'Unknown';
                const type = (item.type || 'item').charAt(0).toUpperCase() + (item.type || '').slice(1);
                content.innerHTML = '<div class="item-detail">' +
                        imgHtml +
                        '<h2>' + escapeHtml(item.name || 'Untitled') + '</h2>' +
                        '<div class="item-type">' + escapeHtml(type) + '</div>' +
                        '<div class="item-author">by <a href="#" id="item-author-link">' + escapeHtml(author) + '</a></div>' +
                        '<div class="item-price">Free</div>' +
                        '<button class="buy-btn" id="buy-btn" onclick="buyItem(\'' + escapeAttr(itemId) + '\')">Get Item</button>' +
                        '<p class="form-status" id="buy-status"></p>' +
                        '</div>';
                document.getElementById('item-author-link').addEventListener('click', e => {
                        e.preventDefault();
                        viewProfile(author);
                });
                if (currentUser) {
                        checkOwnedStatus(itemId);
                }
        }).catch(err => {
                content.innerHTML = '<div class="loading">Failed to load: ' + escapeHtml(err.message) + '</div>';
        });
}

function checkOwnedStatus(itemId) {
        fbGet('/users/' + encodeURIComponent(currentUser) + '/owned_items/' + encodeURIComponent(itemId) + '.json').then(val => {
                const btn = document.getElementById('buy-btn');
                if (!btn) return;
                if (val === true) {
                        btn.textContent = 'Owned';
                        btn.classList.add('owned');
                        btn.disabled = true;
                }
        }).catch(() => {});
}

function buyItem(itemId) {
        if (!currentUser) {
                alert('You must login first to get this item.');
                openAuthModal();
                return;
        }
        const btn = document.getElementById('buy-btn');
        const status = document.getElementById('buy-status');
        if (btn) { btn.disabled = true; btn.textContent = 'Adding...'; }
        fbPut('/users/' + encodeURIComponent(currentUser) + '/owned_items/' + encodeURIComponent(itemId) + '.json', true).then(() => {
                if (btn) {
                        btn.textContent = 'Owned';
                        btn.classList.add('owned');
                }
                if (status) {
                        status.textContent = 'Item added to your inventory!';
                        status.className = 'form-status ok';
                }
                alert('Item added to your inventory!');
        }).catch(err => {
                if (btn) { btn.disabled = false; btn.textContent = 'Get Item'; }
                if (status) {
                        status.textContent = 'Failed: ' + err.message;
                        status.className = 'form-status err';
                }
        });
}

function viewProfile(name) {
        if (!name || name === 'Unknown') {
                showPanel('users');
                alert('No author specified for this item.');
                return;
        }
        showPanel('profile');
        document.querySelectorAll('.nav-btn[data-panel]').forEach(b => b.classList.remove('active'));
        const content = document.getElementById('profile-content');
        content.innerHTML = '<div class="loading">Loading profile...</div>';
        const enc = encodeURIComponent(name);
        Promise.all([
                fbGet('/users/' + enc + '.json').catch(() => null),
                fbGet('/users/' + enc + '/followers.json').catch(() => null),
                fbGet('/games.json').catch(() => null)
        ]).then(results => {
                const info = results[0];
                const followers = results[1];
                const gamesData = results[2];
                if (!info) {
                        content.innerHTML = '<div class="profile-header"><div class="profile-avatar">' + initials(name) + '</div>' +
                                '<div class="profile-info"><h2>' + escapeHtml(name) + '</h2>' +
                                '<div class="profile-bio">This user does not have a website account.</div>' +
                                '<div class="profile-stats"><span><strong>0</strong> followers</span><span><strong>0</strong> games</span></div></div></div>';
                        return;
                }
                const fc = (followers && typeof followers === 'object') ? Object.keys(followers).length : 0;
                let userGames = [];
                if (gamesData) {
                        Object.entries(gamesData).forEach(([gid, g]) => {
                                if ((g.author || '') === name) {
                                        userGames.push({ id: gid, name: g.name || 'Untitled', author: g.author || '' });
                                }
                        });
                }
                let followBtnHtml = '';
                if (currentUser && currentUser !== name) {
                        followBtnHtml = '<button class="follow-btn" id="follow-btn" onclick="toggleFollow(\'' + escapeAttr(name) + '\')">Follow</button>';
                }
                let editBtnHtml = '';
                if (currentUser && currentUser === name) {
                        editBtnHtml = '<button class="edit-profile-btn" onclick="openEditProfile()">Edit Profile</button>';
                }
                let avatarHtml;
                if (info.avatar) {
                        avatarHtml = '<div class="profile-avatar"><img src="data:image/png;base64,' + info.avatar + '" alt="" style="width:100%;height:100%;object-fit:cover"></div>';
                } else {
                        avatarHtml = '<div class="profile-avatar">' + initials(name) + '</div>';
                }
                let gamesHtml = '';
                if (userGames.length > 0) {
                        gamesHtml = '<h2 style="margin-bottom:16px;font-size:22px;font-weight:800">Games by ' + escapeHtml(name) + '</h2><div class="grid">';
                        userGames.forEach(g => {
                                gamesHtml += '<div class="card game-card" onclick="launchGame(\'' + escapeAttr(g.id) + '\')">' +
                                        '<div class="card-title">' + escapeHtml(g.name) + '</div>' +
                                        '<div class="card-meta">by ' + escapeHtml(g.author) + '</div>' +
                                        '<div class="card-tag">Game</div>' +
                                        '<button class="play-btn" onclick="event.stopPropagation(); launchGame(\'' + escapeAttr(g.id) + '\')">Play</button>' +
                                        '</div>';
                        });
                        gamesHtml += '</div>';
                }
                content.innerHTML = '<div class="profile-header">' +
                        avatarHtml +
                        '<div class="profile-info"><h2>' + escapeHtml(name) + '</h2>' +
                        '<div class="profile-bio">' + escapeHtml(info.bio || 'No bio yet.') + '</div>' +
                        '<div class="profile-stats"><span><strong>' + fc + '</strong> followers</span><span><strong>' + userGames.length + '</strong> games</span></div>' +
                        editBtnHtml + '</div>' +
                        followBtnHtml + '</div>' + gamesHtml;
                if (currentUser && currentUser !== name) {
                        checkFollowStatus(name);
                }
        }).catch(err => {
                content.innerHTML = '<div class="loading">Failed to load profile: ' + escapeHtml(err.message) + '</div>';
        });
}

function checkFollowStatus(name) {
        if (!currentUser) return;
        fbGet('/users/' + encodeURIComponent(name) + '/followers/' + encodeURIComponent(currentUser) + '.json').then(val => {
                const btn = document.getElementById('follow-btn');
                if (!btn) return;
                if (val === true) {
                        btn.textContent = 'Following';
                        btn.classList.add('following');
                } else {
                        btn.textContent = 'Follow';
                        btn.classList.remove('following');
                }
        }).catch(() => {});
}

function toggleFollow(name) {
        if (!currentUser) { openAuthModal(); return; }
        const btn = document.getElementById('follow-btn');
        if (!btn) return;
        if (btn.classList.contains('following')) {
                fbDelete('/users/' + encodeURIComponent(name) + '/followers/' + encodeURIComponent(currentUser) + '.json').then(() => {
                        btn.textContent = 'Follow';
                        btn.classList.remove('following');
                        viewProfile(name);
                }).catch(() => {});
        } else {
                fbPut('/users/' + encodeURIComponent(name) + '/followers/' + encodeURIComponent(currentUser) + '.json', true).then(() => {
                        btn.textContent = 'Following';
                        btn.classList.add('following');
                        viewProfile(name);
                }).catch(() => {});
        }
}

function switchCreateTab(tab, btn) {
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('create-game-form').style.display = tab === 'game' ? 'block' : 'none';
        document.getElementById('create-shirt-form').style.display = tab === 'shirt' ? 'block' : 'none';
        document.getElementById('create-pants-form').style.display = tab === 'pants' ? 'block' : 'none';
}

function createGame() {
        const name = document.getElementById('game-name').value.trim();
        const status = document.getElementById('game-status');
        if (!name) { status.textContent = 'Enter a game name'; status.className = 'form-status err'; return; }
        if (!currentUser) { status.textContent = 'Login first'; status.className = 'form-status err'; openAuthModal(); return; }
        status.textContent = 'Creating...'; status.className = 'form-status';
        const gid = 'game_' + Date.now();
        fbPut('/games/' + gid + '.json', { name: name, author: currentUser, created_at: Date.now() / 1000 }).then(() => {
                status.textContent = 'Created! ID: ' + gid; status.className = 'form-status ok';
                document.getElementById('game-name').value = '';
        }).catch(err => { status.textContent = 'Failed: ' + err.message; status.className = 'form-status err'; });
}

function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        preview.innerHTML = '';
        if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                };
                reader.readAsDataURL(input.files[0]);
        }
}

function previewAvatar(input, previewId) {
        const preview = document.getElementById(previewId);
        preview.innerHTML = '';
        if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        preview.appendChild(img);
                };
                reader.readAsDataURL(input.files[0]);
        }
}

function openEditProfile() {
        if (!currentUser) return;
        const dlg = document.createElement('div');
        dlg.className = 'modal';
        dlg.style.display = 'flex';
        dlg.innerHTML = '<div class="modal-content">' +
                '<span class="close" id="edit-close">&times;</span>' +
                '<h3 style="margin-bottom:16px;font-size:18px;font-weight:700">Edit Profile</h3>' +
                '<textarea id="edit-bio" placeholder="Bio" class="input"></textarea>' +
                '<label class="file-label">New Avatar (square image):</label>' +
                '<input type="file" id="edit-avatar" accept="image/png,image/jpeg" class="file-input" onchange="previewAvatar(this, \'edit-avatar-preview\')">' +
                '<div id="edit-avatar-preview" class="avatar-preview"></div>' +
                '<button class="primary-btn" id="edit-save">Save</button>' +
                '<p class="form-status" id="edit-status"></p>' +
                '</div>';
        document.body.appendChild(dlg);
        document.getElementById('edit-close').onclick = () => dlg.remove();
        fbGet('/users/' + encodeURIComponent(currentUser) + '.json').then(info => {
                if (info && info.bio) document.getElementById('edit-bio').value = info.bio;
        });
        document.getElementById('edit-save').onclick = () => {
                const bio = document.getElementById('edit-bio').value.trim();
                const avatarInput = document.getElementById('edit-avatar');
                const status = document.getElementById('edit-status');
                status.textContent = 'Saving...'; status.className = 'form-status';
                if (avatarInput.files && avatarInput.files[0]) {
                        const img = new Image();
                        img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 128;
                                canvas.height = 128;
                                const ctx = canvas.getContext('2d');
                                const size = Math.min(img.width, img.height);
                                const sx = (img.width - size) / 2;
                                const sy = (img.height - size) / 2;
                                ctx.drawImage(img, sx, sy, size, size, 0, 0, 128, 128);
                                const dataUrl = canvas.toDataURL('image/png');
                                const base64 = dataUrl.split(',')[1];
                                saveProfile(bio, base64, status, dlg);
                        };
                        img.src = URL.createObjectURL(avatarInput.files[0]);
                } else {
                        saveProfile(bio, null, status, dlg);
                }
        };
}

function saveProfile(bio, avatarB64, status, dlg) {
        fbGet('/users/' + encodeURIComponent(currentUser) + '.json').then(info => {
                if (!info) { status.textContent = 'User not found'; status.className = 'form-status err'; return; }
                info.bio = bio;
                if (avatarB64) info.avatar = avatarB64;
                fbPut('/users/' + encodeURIComponent(currentUser) + '.json', info).then(() => {
                        status.textContent = 'Saved!'; status.className = 'form-status ok';
                        setTimeout(() => { dlg.remove(); viewProfile(currentUser); }, 800);
                }).catch(err => { status.textContent = 'Failed: ' + err.message; status.className = 'form-status err'; });
        });
}

function readImageAsBase64(input, callback) {
        if (!input.files || !input.files[0]) { callback(null); return; }
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = e => {
                const dataUrl = e.target.result;
                const base64 = dataUrl.split(',')[1];
                callback(base64);
        };
        reader.readAsDataURL(file);
}

function createShirt() {
        createClothingItem('shirt');
}

function createPants() {
        createClothingItem('pants');
}

function createClothingItem(type) {
        const nameInput = document.getElementById(type + '-name');
        const fileInput = document.getElementById(type + '-file');
        const status = document.getElementById(type + '-status');
        if (!nameInput || !fileInput || !status) {
                alert('Form not found: ' + type);
                return;
        }
        const name = nameInput.value.trim();
        if (!name) {
                status.textContent = 'Enter a name first';
                status.className = 'form-status err';
                alert('Enter a ' + type + ' name first');
                return;
        }
        if (!currentUser) {
                status.textContent = 'Login first';
                status.className = 'form-status err';
                alert('You must login before creating a ' + type);
                openAuthModal();
                return;
        }
        if (!fileInput.files || !fileInput.files[0]) {
                status.textContent = 'Pick an image (128x128)';
                status.className = 'form-status err';
                alert('Pick an image file (128x128 PNG or JPG) for your ' + type);
                return;
        }
        status.textContent = 'Uploading...';
        status.className = 'form-status';
        const img = new Image();
        img.onload = () => {
                if (img.width !== 128 || img.height !== 128) {
                        status.textContent = 'Image must be 128x128 (got ' + img.width + 'x' + img.height + ')';
                        status.className = 'form-status err';
                        alert('Image must be exactly 128x128 pixels. Yours is ' + img.width + 'x' + img.height + '.');
                        return;
                }
                readImageAsBase64(fileInput, base64 => {
                        if (!base64) {
                                status.textContent = 'Failed to read image';
                                status.className = 'form-status err';
                                alert('Failed to read image file');
                                return;
                        }
                        const itemId = type + '_' + Date.now();
                        const data = {
                                name: name,
                                type: type,
                                author: currentUser,
                                image_data: base64,
                                image_path: '',
                                created_at: Date.now() / 1000
                        };
                        fbPut('/catalog/' + itemId + '.json', data).then(() => {
                                status.textContent = 'Created! ID: ' + itemId;
                                status.className = 'form-status ok';
                                alert(type.charAt(0).toUpperCase() + type.slice(1) + ' "' + name + '" created successfully!');
                                nameInput.value = '';
                                fileInput.value = '';
                                document.getElementById(type + '-preview').innerHTML = '';
                        }).catch(err => { status.textContent = 'Failed: ' + err.message; status.className = 'form-status err'; });
                });
        };
        img.onerror = () => { status.textContent = 'Invalid image'; status.className = 'form-status err'; };
        img.src = URL.createObjectURL(fileInput.files[0]);
}

function openAuthModal() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }

function switchAuthTab(tab, btn) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
        document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
}

function doLogin() {
        const name = document.getElementById('login-name').value.trim();
        const pass = document.getElementById('login-pass').value;
        const status = document.getElementById('login-status');
        if (!name || !pass) { status.textContent = 'Enter name and password'; status.className = 'form-status err'; return; }
        status.textContent = 'Logging in...'; status.className = 'form-status';
        fbGet('/users/' + encodeURIComponent(name) + '.json').then(info => {
                if (!info) { status.textContent = 'User not found'; status.className = 'form-status err'; return; }
                if ((info.password || '') !== pass) { status.textContent = 'Wrong password'; status.className = 'form-status err'; return; }
                currentUser = name;
                localStorage.setItem('bb_user', name);
                updateUserChip();
                closeAuthModal();
                status.textContent = '';
        }).catch(err => { status.textContent = 'Login failed: ' + err.message; status.className = 'form-status err'; });
}

function doSignup() {
        const name = document.getElementById('signup-name').value.trim();
        const pass = document.getElementById('signup-pass').value;
        const bio = document.getElementById('signup-bio').value.trim();
        const avatarInput = document.getElementById('signup-avatar');
        const status = document.getElementById('signup-status');
        if (!name || !pass) { status.textContent = 'Enter name and password'; status.className = 'form-status err'; return; }
        status.textContent = 'Creating...'; status.className = 'form-status';
        fbGet('/users/' + encodeURIComponent(name) + '.json').then(existing => {
                if (existing) { status.textContent = 'Username taken'; status.className = 'form-status err'; return; }
                const finish = (avatarB64) => {
                        const data = { password: pass, bio: bio, avatar: avatarB64 || '' };
                        fbPut('/users/' + encodeURIComponent(name) + '.json', data).then(() => {
                                currentUser = name;
                                localStorage.setItem('bb_user', name);
                                updateUserChip();
                                closeAuthModal();
                                status.textContent = '';
                        }).catch(err => { status.textContent = 'Signup failed: ' + err.message; status.className = 'form-status err'; });
                };
                if (avatarInput.files && avatarInput.files[0]) {
                        const img = new Image();
                        img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 128;
                                canvas.height = 128;
                                const ctx = canvas.getContext('2d');
                                const size = Math.min(img.width, img.height);
                                const sx = (img.width - size) / 2;
                                const sy = (img.height - size) / 2;
                                ctx.drawImage(img, sx, sy, size, size, 0, 0, 128, 128);
                                const dataUrl = canvas.toDataURL('image/png');
                                finish(dataUrl.split(',')[1]);
                        };
                        img.src = URL.createObjectURL(avatarInput.files[0]);
                } else {
                        finish(null);
                }
        }).catch(err => { status.textContent = 'Signup failed: ' + err.message; status.className = 'form-status err'; });
}

function updateUserChip() {
        const chip = document.getElementById('current-user-chip');
        if (currentUser) {
                chip.textContent = '@' + currentUser;
                chip.style.display = 'inline';
                const loginBtn = document.querySelector('.nav-btn.ghost');
                if (loginBtn) { loginBtn.textContent = 'Logout'; loginBtn.onclick = doLogout; }
        } else {
                chip.style.display = 'none';
                const loginBtn = document.querySelector('.nav-btn.ghost');
                if (loginBtn) { loginBtn.textContent = 'Login'; loginBtn.onclick = openAuthModal; }
        }
}

function doLogout() {
        currentUser = null;
        localStorage.removeItem('bb_user');
        updateUserChip();
        showPanel('games');
}

updateUserChip();
showPanel('games');
