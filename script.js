const HTML = `
<div class="topbar">
<div class="topbar-inner">
<a class="brand" href="#" onclick="showPanel('games')">BrickBuild</a>
<nav class="nav">
<button class="nav-btn active" data-panel="games" onclick="showPanel('games')">Games</button>
<button class="nav-btn" data-panel="users" onclick="showPanel('users')">Users</button>
<button class="nav-btn" data-panel="create" onclick="showPanel('create')">Create</button>
<button class="nav-btn" data-panel="catalog" onclick="showPanel('catalog')">Catalog</button>
</nav>
<div class="auth-area">
<span id="current-user-chip" class="user-chip" style="display:none"></span>
<button class="nav-btn ghost" onclick="openAuthModal()">Login</button>
</div>
</div>
</div>

<div class="container">

<div id="panel-games" class="panel active">
<div class="panel-header">
<h1>Games</h1>
<button class="refresh-btn" onclick="loadGames()">Refresh</button>
</div>
<div id="games-grid" class="grid"><div class="loading">Loading games...</div></div>
</div>

<div id="panel-users" class="panel">
<div class="panel-header">
<h1>Users</h1>
<button class="refresh-btn" onclick="loadUsers()">Refresh</button>
</div>
<div id="users-grid" class="grid"><div class="loading">Loading users...</div></div>
</div>

<div id="panel-create" class="panel">
<div class="panel-header"><h1>Create</h1></div>
<div class="create-form">
<div class="form-tabs">
<button class="form-tab active" onclick="switchCreateTab('game', this)">Game</button>
<button class="form-tab" onclick="switchCreateTab('shirt', this)">Shirt</button>
<button class="form-tab" onclick="switchCreateTab('pants', this)">Pants</button>
</div>
<div id="create-game-form" class="form-section">
<h3>Create a Game</h3>
<input type="text" id="game-name" placeholder="Game name" class="input">
<button class="primary-btn" onclick="createGame()">Create Game</button>
<p class="form-status" id="game-status"></p>
</div>
<div id="create-shirt-form" class="form-section" style="display:none">
<h3>Create a Shirt</h3>
<p class="hint">Shirt creation is available in the game client. Use the Create tab in-game.</p>
</div>
<div id="create-pants-form" class="form-section" style="display:none">
<h3>Create Pants</h3>
<p class="hint">Pants creation is available in the game client. Use the Create tab in-game.</p>
</div>
</div>
</div>

<div id="panel-catalog" class="panel">
<div class="panel-header">
<h1>Catalog</h1>
<button class="refresh-btn" onclick="loadCatalog()">Refresh</button>
</div>
<div id="catalog-grid" class="grid"><div class="loading">Loading catalog...</div></div>
</div>

<div id="panel-profile" class="panel">
<div class="panel-header">
<button class="back-btn" onclick="showPanel('users')">&larr; Back</button>
</div>
<div id="profile-content"><div class="loading">Loading...</div></div>
</div>

</div>

<div id="auth-modal" class="modal" style="display:none">
<div class="modal-content">
<span class="close" onclick="closeAuthModal()">&times;</span>
<div class="auth-tabs">
<button class="auth-tab active" onclick="switchAuthTab('login', this)">Login</button>
<button class="auth-tab" onclick="switchAuthTab('signup', this)">Sign Up</button>
</div>
<div id="login-form" class="auth-form">
<input type="text" id="login-name" placeholder="Username" class="input">
<input type="password" id="login-pass" placeholder="Password" class="input">
<button class="primary-btn" onclick="doLogin()">Login</button>
<p class="form-status" id="login-status"></p>
</div>
<div id="signup-form" class="auth-form" style="display:none">
<input type="text" id="signup-name" placeholder="Username" class="input">
<input type="password" id="signup-pass" placeholder="Password" class="input">
<textarea id="signup-bio" placeholder="Bio (optional)" class="input"></textarea>
<button class="primary-btn" onclick="doSignup()">Sign Up</button>
<p class="form-status" id="signup-status"></p>
</div>
</div>
</div>
`;

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Montserrat', 'Gotham', sans-serif; background: #fff; color: #1a1a1a; line-height: 1.5; }
.topbar { background: #000; color: #fff; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
.topbar-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand { color: #fff; text-decoration: none; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
.nav { display: flex; gap: 4px; }
.nav-btn { background: transparent; border: none; color: #ccc; font-family: inherit; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.15s; }
.nav-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
.nav-btn.active { background: #fff; color: #000; }
.nav-btn.ghost { border: 1px solid #444; }
.auth-area { display: flex; align-items: center; gap: 12px; }
.user-chip { color: #00d4aa; font-size: 14px; font-weight: 600; }
.container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
.panel { display: none; }
.panel.active { display: block; }
.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.panel-header h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
.refresh-btn { background: #f0f0f0; border: 1px solid #ddd; color: #333; font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.refresh-btn:hover { background: #e5e5e5; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
.loading { grid-column: 1 / -1; text-align: center; color: #888; padding: 48px; font-size: 15px; }
.card { background: #fff; border: 1px solid #e8e8e8; border-radius: 12px; padding: 20px; transition: all 0.2s; cursor: pointer; }
.card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); border-color: #d0d0d0; }
.card-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; color: #1a1a1a; }
.card-meta { font-size: 13px; color: #888; }
.card-tag { display: inline-block; background: #f0f0f0; color: #555; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 12px; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.author-link { color: #0066cc; text-decoration: none; font-weight: 600; cursor: pointer; }
.author-link:hover { text-decoration: underline; }
.play-btn { background: #000; color: #fff; border: none; font-family: inherit; font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 6px; cursor: pointer; margin-top: 12px; display: block; width: 100%; }
.play-btn:hover { background: #222; transform: translateY(-1px); }
.game-card { cursor: pointer; }
.user-card { text-align: center; }
.user-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #00d4aa, #0088cc); margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; color: #fff; }
.user-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.user-bio { font-size: 13px; color: #888; margin-bottom: 8px; min-height: 19px; }
.user-followers { font-size: 12px; color: #666; }
.create-form { max-width: 480px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 12px; padding: 28px; }
.form-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #fff; border: 1px solid #e8e8e8; border-radius: 8px; padding: 4px; }
.form-tab { flex: 1; background: transparent; border: none; font-family: inherit; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 6px; cursor: pointer; color: #666; }
.form-tab.active { background: #000; color: #fff; }
.form-section h3 { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.input { width: 100%; font-family: inherit; font-size: 14px; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px; background: #fff; color: #1a1a1a; outline: none; }
.input:focus { border-color: #000; }
textarea.input { min-height: 80px; resize: vertical; }
.primary-btn { background: #000; color: #fff; border: none; font-family: inherit; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 8px; cursor: pointer; width: 100%; }
.primary-btn:hover { background: #222; transform: translateY(-1px); }
.form-status { font-size: 13px; margin-top: 12px; min-height: 18px; }
.form-status.ok { color: #00875a; }
.form-status.err { color: #de350b; }
.hint { font-size: 13px; color: #888; padding: 16px; background: #fff; border-radius: 8px; border: 1px dashed #ddd; }
.profile-header { display: flex; align-items: center; gap: 24px; padding: 32px; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 16px; margin-bottom: 32px; }
.profile-avatar { width: 96px; height: 96px; border-radius: 50%; background: linear-gradient(135deg, #00d4aa, #0088cc); display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: 800; color: #fff; flex-shrink: 0; }
.profile-info h2 { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
.profile-bio { font-size: 14px; color: #666; margin-bottom: 12px; }
.profile-stats { display: flex; gap: 24px; font-size: 14px; color: #555; }
.profile-stats strong { font-weight: 800; color: #1a1a1a; }
.follow-btn { background: #000; color: #fff; border: none; font-family: inherit; font-size: 13px; font-weight: 700; padding: 8px 18px; border-radius: 6px; cursor: pointer; margin-left: auto; }
.follow-btn.following { background: #f0f0f0; color: #333; border: 1px solid #ddd; }
.back-btn { background: #f0f0f0; border: 1px solid #ddd; font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.modal-content { background: #fff; border-radius: 12px; padding: 32px; width: 90%; max-width: 400px; position: relative; }
.close { position: absolute; top: 16px; right: 20px; font-size: 28px; cursor: pointer; color: #999; line-height: 1; }
.auth-tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #f0f0f0; border-radius: 8px; padding: 4px; }
.auth-tab { flex: 1; background: transparent; border: none; font-family: inherit; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 6px; cursor: pointer; color: #666; }
.auth-tab.active { background: #fff; color: #000; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
@media (max-width: 768px) { .topbar-inner { padding: 0 16px; gap: 8px; } .brand { font-size: 18px; } .nav-btn { padding: 6px 10px; font-size: 13px; } .container { padding: 20px 16px; } .panel-header h1 { font-size: 24px; } .grid { grid-template-columns: 1fr; } .profile-header { flex-direction: column; text-align: center; } }
`;

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
                                card.innerHTML = '<div class="user-avatar">' + initials(n) + '</div>' +
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
                        card.className = 'card';
                        const author = it.author || 'Unknown';
                        card.innerHTML = '<div class="card-title">' + escapeHtml(it.name || 'Untitled') + '</div>' +
                                '<div class="card-meta">by <a href="#" class="author-link" data-author="' + escapeHtml(author) + '">' + escapeHtml(author) + '</a></div>' +
                                '<div class="card-tag">' + escapeHtml((it.type || 'item').charAt(0).toUpperCase() + (it.type || '').slice(1)) + '</div>';
                        card.querySelector('.author-link').addEventListener('click', e => {
                                e.stopPropagation();
                                viewProfile(author);
                        });
                        grid.appendChild(card);
                });
        }).catch(err => { grid.innerHTML = '<div class="loading">Failed to load: ' + escapeHtml(err.message) + '</div>'; });
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
                        '<div class="profile-avatar">' + initials(name) + '</div>' +
                        '<div class="profile-info"><h2>' + escapeHtml(name) + '</h2>' +
                        '<div class="profile-bio">' + escapeHtml(info.bio || 'No bio yet.') + '</div>' +
                        '<div class="profile-stats"><span><strong>' + fc + '</strong> followers</span><span><strong>' + userGames.length + '</strong> games</span></div></div>' +
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
        const status = document.getElementById('signup-status');
        if (!name || !pass) { status.textContent = 'Enter name and password'; status.className = 'form-status err'; return; }
        status.textContent = 'Creating...'; status.className = 'form-status';
        fbGet('/users/' + encodeURIComponent(name) + '.json').then(existing => {
                if (existing) { status.textContent = 'Username taken'; status.className = 'form-status err'; return; }
                fbPut('/users/' + encodeURIComponent(name) + '.json', { password: pass, bio: bio, avatar: '' }).then(() => {
                        currentUser = name;
                        localStorage.setItem('bb_user', name);
                        updateUserChip();
                        closeAuthModal();
                        status.textContent = '';
                }).catch(err => { status.textContent = 'Signup failed: ' + err.message; status.className = 'form-status err'; });
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

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);
document.body.innerHTML = HTML;

const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap';
document.head.appendChild(fontLink);

const preconnect1 = document.createElement('link');
preconnect1.rel = 'preconnect';
preconnect1.href = 'https://fonts.googleapis.com';
document.head.appendChild(preconnect1);

const preconnect2 = document.createElement('link');
preconnect2.rel = 'preconnect';
preconnect2.href = 'https://fonts.gstatic.com';
preconnect2.crossOrigin = 'anonymous';
document.head.appendChild(preconnect2);

document.title = 'BrickBuild';

updateUserChip();
showPanel('games');
