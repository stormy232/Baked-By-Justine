/* ============================================================
   BAKED BY JUSTINE — auth.js  (v2)
   Login / Register popup, nav Sign In button, session handling

   Creator: Abdullah Musani
   Contributor: Ridwan Moalim
   ============================================================ */

/* ── State ── */
const Auth = {
  user: null,

  async checkSession() {
    try {
      const res  = await fetch('api/auth.php?action=session');
      const data = await res.json();
      if (data.logged_in) {
        this.user = data.user;
        renderNavUser(data.user);
      } else {
        if (!sessionStorage.getItem('bbj_auth_dismissed')) {
          setTimeout(() => openAuthModal('login'), 1000);
        }
      }
    } catch (e) {
      console.warn('Auth: PHP server not reachable.');
      if (!sessionStorage.getItem('bbj_auth_dismissed')) {
        setTimeout(() => openAuthModal('login'), 1000);
      }
    }
  },

  async logout() {
    try { await fetch('api/auth.php?action=logout'); } catch (e) {}
    this.user = null;
    renderNavGuest();
    showAuthToast('Signed out. See you soon! 👋');
  }
};

/* ══════════════════════════════════════════════════════════
   CSS — injected into <head>
══════════════════════════════════════════════════════════ */
(function injectCSS() {
  const s = document.createElement('style');
  s.textContent = `
#authOverlay {
  position: fixed;
  inset: 0;
  background: rgba(44,26,14,.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  opacity: 0;
  visibility: hidden;
  transition: opacity .3s ease, visibility .3s ease;
}
#authOverlay.open { opacity: 1; visibility: visible; }

#authModal {
  background: var(--cream, #fdf8f2);
  border-radius: 20px;
  width: 100%;
  max-width: 430px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(44,26,14,.4);
  transform: translateY(30px) scale(.96);
  transition: transform .4s cubic-bezier(.34,1.56,.64,1);
  position: relative;
}
#authOverlay.open #authModal { transform: translateY(0) scale(1); }

.am-header {
  background: #2c1a0e;
  padding: 1.6rem 1.8rem 1.4rem;
  position: relative;
}
.am-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 100% at 50% 0%, rgba(201,125,64,.25) 0%, transparent 70%);
  pointer-events: none;
}
.am-logo {
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: .45rem;
  position: relative;
  z-index: 1;
}
.am-logo span { color: #e8a96a; }
.am-close {
  position: absolute;
  top: 1rem; right: 1rem;
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: rgba(255,255,255,.12);
  color: rgba(255,255,255,.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: background .2s, color .2s;
}
.am-close:hover { background: rgba(255,255,255,.22); color: #fff; }

.am-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .35rem;
  background: rgba(255,255,255,.1);
  border-radius: 10px;
  padding: .25rem;
  position: relative;
  z-index: 1;
}
.am-tab {
  padding: .6rem;
  border: none;
  border-radius: 8px;
  font-family: 'Lato', sans-serif;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .2s;
  background: transparent;
  color: rgba(255,255,255,.5);
}
.am-tab.active {
  background: #c97d40;
  color: #fff;
  box-shadow: 0 3px 12px rgba(201,125,64,.5);
}

.am-body { padding: 1.6rem 1.8rem 1.8rem; }
.am-panel { display: none; }
.am-panel.active { display: block; }

.am-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: #2c1a0e;
  margin-bottom: .25rem;
  line-height: 1.2;
}
.am-title em { font-style: italic; color: #c97d40; }
.am-sub { font-size: .83rem; color: #9e8472; margin-bottom: 1.4rem; line-height: 1.55; }

.am-feedback {
  display: none;
  align-items: center;
  gap: .55rem;
  padding: .7rem .95rem;
  border-radius: 9px;
  font-size: .82rem;
  font-weight: 600;
  margin-bottom: 1rem;
  line-height: 1.4;
}
.am-feedback.visible { display: flex; animation: amFadeUp .25s ease; }
.am-feedback.success { background: rgba(74,138,64,.1);  border: 1px solid rgba(74,138,64,.25);  color: #3a7a34; }
.am-feedback.error   { background: rgba(192,57,43,.08); border: 1px solid rgba(192,57,43,.2);   color: #c0392b; }
.am-feedback.loading { background: rgba(201,125,64,.08);border: 1px solid rgba(201,125,64,.25); color: #c97d40; }
.am-feedback svg.spin { animation: amSpin .8s linear infinite; }

.am-form { display: flex; flex-direction: column; gap: .85rem; }
.am-row  { display: grid; grid-template-columns: 1fr 1fr; gap: .7rem; }
.am-group { display: flex; flex-direction: column; gap: .3rem; }
.am-group label {
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #9e8472;
}
.am-field-wrap { position: relative; }
.am-field-wrap input {
  width: 100%;
  padding: .72rem 2.4rem .72rem .95rem;
  font-family: 'Lato', sans-serif;
  font-size: .88rem;
  color: #4a3728;
  background: #f5ede0;
  border: 1.5px solid #e8d5bc;
  border-radius: 9px;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
  box-sizing: border-box;
}
.am-field-wrap input:focus {
  border-color: #c97d40;
  box-shadow: 0 0 0 3px rgba(201,125,64,.13);
  background: #fff;
}
.am-field-wrap input.err { border-color: #c0392b !important; }
.am-pw-toggle {
  position: absolute;
  right: .7rem; top: 50%;
  transform: translateY(-50%);
  background: none; border: none;
  cursor: pointer; color: #9e8472;
  display: flex; padding: 0;
  transition: color .2s;
}
.am-pw-toggle:hover { color: #c97d40; }
.am-field-err { font-size: .72rem; color: #c0392b; font-weight: 600; display: none; }
.am-field-err.show { display: block; animation: amFadeUp .2s ease; }

.am-pw-bars { display: flex; gap: 3px; margin-top: .3rem; }
.am-pw-bar  { height: 3px; flex: 1; border-radius: 2px; background: #e8d5bc; transition: background .3s; }
.am-pw-hint { font-size: .69rem; font-weight: 700; color: #9e8472; margin-top: .2rem; min-height: .85rem; }

.am-submit {
  width: 100%;
  padding: .88rem;
  margin-top: .2rem;
  background: #c97d40;
  color: #fff;
  border: none;
  border-radius: 50px;
  font-family: 'Lato', sans-serif;
  font-size: .88rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .45rem;
  transition: all .22s;
  box-shadow: 0 4px 16px rgba(201,125,64,.3);
}
.am-submit:hover:not(:disabled) {
  background: #e8a96a;
  transform: translateY(-2px);
  box-shadow: 0 7px 22px rgba(201,125,64,.42);
}
.am-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

.am-switch { text-align: center; margin-top: .9rem; font-size: .79rem; color: #9e8472; }
.am-switch button {
  background: none; border: none;
  color: #c97d40; font-weight: 700;
  cursor: pointer;
  font-family: 'Lato', sans-serif; font-size: .79rem;
  padding: 0;
  text-decoration: underline; text-underline-offset: 2px;
}
.am-guest { text-align: center; margin-top: .45rem; }
.am-guest button {
  background: none; border: none;
  color: #9e8472; font-size: .76rem;
  cursor: pointer;
  font-family: 'Lato', sans-serif; padding: 0;
  transition: color .2s;
}
.am-guest button:hover { color: #4a3728; }

/* Nav Sign In button */
#navAuthLi { position: relative; }
.nav-signin-btn {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .48rem 1rem;
  border: 2px solid #e8d5bc;
  border-radius: 50px;
  background: #fff;
  color: #4a3728;
  font-family: 'Lato', sans-serif;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all .2s;
  white-space: nowrap;
}
.nav-signin-btn:hover { border-color: #c97d40; color: #c97d40; }

.nav-user-pill {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .35rem .85rem .35rem .35rem;
  border: 2px solid #e8d5bc;
  border-radius: 50px;
  background: #fff;
  font-family: 'Lato', sans-serif;
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  transition: border-color .2s;
  white-space: nowrap;
  color: #4a3728;
}
.nav-user-pill:hover { border-color: #c97d40; }
.nav-avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c97d40, #e8a96a);
  color: #fff;
  font-size: .72rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.nav-dropdown {
  position: absolute;
  top: calc(100% + 8px); right: 0;
  background: #fff;
  border: 1px solid #e8d5bc;
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(44,26,14,.16);
  min-width: 195px;
  overflow: hidden;
  z-index: 200;
  opacity: 0; visibility: hidden;
  transform: translateY(-6px);
  transition: all .22s cubic-bezier(.34,1.4,.64,1);
}
.nav-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
.nd-header { padding: .9rem 1.1rem; background: #f5ede0; border-bottom: 1px solid #e8d5bc; }
.nd-name  { font-family: 'Playfair Display', serif; font-size: .92rem; font-weight: 700; color: #2c1a0e; }
.nd-email { font-size: .7rem; color: #9e8472; margin-top: .1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 165px; }
.nd-item {
  display: flex; align-items: center; gap: .55rem;
  padding: .7rem 1.1rem;
  font-family: 'Lato', sans-serif; font-size: .81rem; font-weight: 600;
  color: #4a3728; cursor: pointer;
  border: none; background: none;
  width: 100%; text-align: left;
  transition: background .15s, color .15s;
}
.nd-item:hover { background: #f5ede0; color: #c97d40; }
.nd-item.logout:hover { background: rgba(192,57,43,.06); color: #c0392b; }

#authToast {
  position: fixed;
  bottom: 1.8rem; left: 50%;
  transform: translateX(-50%) translateY(16px);
  background: #2c1a0e; color: #fff;
  padding: .75rem 1.6rem;
  border-radius: 50px;
  font-family: 'Lato', sans-serif;
  font-size: .86rem; font-weight: 600;
  z-index: 2000;
  opacity: 0; pointer-events: none;
  transition: opacity .3s, transform .3s;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,0,0,.25);
}
#authToast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

@keyframes amFadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
@keyframes amSpin   { to { transform: rotate(360deg); } }

@media (max-width: 500px) {
  #authModal { border-radius: 16px; }
  .am-row { grid-template-columns: 1fr; }
  .am-body { padding: 1.4rem 1.4rem 1.6rem; }
}
`;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════════════════════════════
   INJECT HTML
══════════════════════════════════════════════════════════ */
function injectAuthHTML() {
  


}

/* ══════════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════════ */
function injectNavBtn() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  const existing = document.getElementById('navAuthLi');
  if (existing) existing.remove();

  const li = document.createElement('li');
  

  const last = navLinks.lastElementChild;
  if (last) navLinks.insertBefore(li, last);
  else navLinks.appendChild(li);
}

function renderNavUser(user) {
  const li = document.getElementById('navAuthLi');
  if (!li) return;
  const init = (user.first_name || '?').charAt(0).toUpperCase();
  li.innerHTML = `
    <button class="nav-user-pill" id="navUserPill" onclick="toggleDropdown()">
      <div class="nav-avatar">${init}</div>
      ${user.first_name}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="nav-dropdown" id="navDropdown">
      <div class="nd-header">
        <div class="nd-name">${user.first_name} ${user.last_name || ''}</div>
        <div class="nd-email">${user.email}</div>
      </div>
      <button class="nd-item" onclick="closeDropdown()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        My Orders
      </button>
      <button class="nd-item logout" onclick="Auth.logout()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Sign Out
      </button>
    </div>`;
  document.addEventListener('click', outsideClick);
}

function renderNavGuest() {
  const li = document.getElementById('navAuthLi');
  if (!li) return;
  
  
}

function outsideClick(e) {
  const pill = document.getElementById('navUserPill');
  const drop = document.getElementById('navDropdown');
  if (pill && drop && !pill.contains(e.target) && !drop.contains(e.target)) closeDropdown();
}
function toggleDropdown() { document.getElementById('navDropdown')?.classList.toggle('open'); }
function closeDropdown()  { document.getElementById('navDropdown')?.classList.remove('open'); }

/* ══════════════════════════════════════════════════════════
   MODAL CONTROLS
══════════════════════════════════════════════════════════ */
function openAuthModal(tab) {
  switchTab(tab || 'login');
  document.getElementById('authOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const f = tab === 'register' ? document.getElementById('rgFirst') : document.getElementById('liEmail');
    if (f) f.focus();
  }, 420);
}
function closeAuthModal() {
  document.getElementById('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
  sessionStorage.setItem('bbj_auth_dismissed', '1');
}
function switchTab(tab) {
  document.getElementById('amTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('amTabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('amPanelLogin').classList.toggle('active', tab === 'login');
  document.getElementById('amPanelRegister').classList.toggle('active', tab === 'register');
  hideFeedback('fbLogin'); hideFeedback('fbRegister');
}

/* ══════════════════════════════════════════════════════════
   FEEDBACK
══════════════════════════════════════════════════════════ */
const _ICONS = {
  success: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  error:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  loading: `<svg class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".25"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>`
};
function showFeedback(id, type, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'am-feedback visible ' + type;
  el.innerHTML = _ICONS[type] + '<span>' + msg + '</span>';
}
function hideFeedback(id) {
  const el = document.getElementById(id);
  if (el) el.className = 'am-feedback';
}
function fieldErr(inputId, errId, show) {
  document.getElementById(inputId)?.classList.toggle('err', show);
  document.getElementById(errId)?.classList.toggle('show', show);
}

/* ══════════════════════════════════════════════════════════
   PASSWORD STRENGTH
══════════════════════════════════════════════════════════ */
function pwStrength(val) {
  const cols  = ['#c0392b','#e67e22','#f1c40f','#27ae60'];
  const names = ['Too short','Weak','Good','Strong ✓'];
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  [1,2,3,4].forEach(i => {
    const el = document.getElementById('pb' + i);
    if (el) el.style.background = i <= score ? cols[score-1] : '#e8d5bc';
  });
  const hint = document.getElementById('pwHint');
  if (hint) { hint.textContent = val.length ? (names[score-1]||'') : ''; hint.style.color = cols[score-1]||'#9e8472'; }
}

/* ══════════════════════════════════════════════════════════
   TOGGLE PASSWORD
══════════════════════════════════════════════════════════ */
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
let _toastTimer;
function showAuthToast(msg) {
  const t = document.getElementById('authToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ══════════════════════════════════════════════════════════
   API — LOGIN
══════════════════════════════════════════════════════════ */
async function doLogin() {
  const email = document.getElementById('liEmail').value.trim();
  const pw    = document.getElementById('liPw').value;
  let valid = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldErr('liEmail','liEmailErr',true); valid=false; }
  if (!pw) { fieldErr('liPw','liPwErr',true); valid=false; }
  if (!valid) return;

  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  showFeedback('fbLogin','loading','Signing you in…');

  try {
    const res  = await fetch('api/auth.php?action=login', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, password: pw })
    });
    const data = await res.json();
    if (data.success) {
      Auth.user = data.user;
      showFeedback('fbLogin','success', data.message || 'Signed in!');
      renderNavUser(data.user);
      showAuthToast('Welcome back, ' + data.user.first_name + '! 👋');
      setTimeout(closeAuthModal, 900);
    } else {
      showFeedback('fbLogin','error', data.error || 'Login failed.');
      btn.disabled = false;
    }
  } catch(e) {
    showFeedback('fbLogin','error','Cannot reach server. Make sure you\'re on localhost.');
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════
   API — REGISTER
══════════════════════════════════════════════════════════ */
async function doRegister() {
  const first = document.getElementById('rgFirst').value.trim();
  const last  = document.getElementById('rgLast').value.trim();
  const email = document.getElementById('rgEmail').value.trim();
  const pw    = document.getElementById('rgPw').value;
  let valid = true;
  if (!first)  { fieldErr('rgFirst','rgFirstErr',true); valid=false; }
  if (!last)   { fieldErr('rgLast','rgLastErr',true);   valid=false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldErr('rgEmail','rgEmailErr',true); valid=false; }
  if (pw.length < 8) { fieldErr('rgPw','rgPwErr',true); valid=false; }
  if (!valid) return;

  const btn = document.getElementById('btnRegister');
  btn.disabled = true;
  showFeedback('fbRegister','loading','Creating your account…');

  try {
    const res  = await fetch('api/auth.php?action=register', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ first_name: first, last_name: last, email, password: pw })
    });
    const data = await res.json();
    if (data.success) {
      Auth.user = data.user;
      showFeedback('fbRegister','success','Account created! Welcome to the bakery 🎉');
      renderNavUser(data.user);
      showAuthToast('Welcome, ' + data.user.first_name + '! 🎉');
      setTimeout(closeAuthModal, 1000);
    } else {
      showFeedback('fbRegister','error', data.error || 'Registration failed.');
      btn.disabled = false;
    }
  } catch(e) {
    showFeedback('fbRegister','error','Cannot reach server. Make sure you\'re on localhost.');
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════════════════════
   BOOT — uses window.load so ALL other scripts have run first
══════════════════════════════════════════════════════════ */
window.addEventListener('load', function() {
  injectAuthHTML();
  injectNavBtn();
  Auth.checkSession();
});
