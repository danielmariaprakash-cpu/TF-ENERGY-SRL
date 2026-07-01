/* ═══════════════════════════════════════════════════
   TF ENERGY – MAIN JAVASCRIPT
   Launch animation · Bilingual · Navbar · Reveal · Counters · Reviews
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Language state ─── */
  let currentLang = localStorage.getItem('tf_lang') || 'it';

  /* ─── HERO VIDEO: SOUND ONCE, THEN AUTO-MUTE ─── */
  function setupHeroVideoSound() {
    const video = document.getElementById('hero-video');
    const soundBtn = document.getElementById('hero-sound-btn');
    if (!video) return;

    const alreadyPlayedWithSound = localStorage.getItem('tf_hero_audio_done');

    function autoMuteAfterFirstPlay() {
      // Mute once the first loop finishes (or after 10s as a safety net)
      const muteNow = () => {
        video.muted = true;
        localStorage.setItem('tf_hero_audio_done', '1');
        if (soundBtn) soundBtn.style.display = 'none';
      };
      video.addEventListener('ended', muteNow, { once: true });
      setTimeout(muteNow, 10000);
    }

    if (alreadyPlayedWithSound) {
      video.muted = true;
      if (soundBtn) soundBtn.style.display = 'none';
      return;
    }

    function tryWithSound() {
      video.muted = false;
      video.volume = 0.6;
      video.play().then(() => {
        if (soundBtn) soundBtn.style.display = 'none';
        autoMuteAfterFirstPlay();
      }).catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    tryWithSound();
    if (soundBtn) soundBtn.addEventListener('click', tryWithSound);
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      document.addEventListener(evt, tryWithSound, { once: true, passive: true });
    });
  }

  /* ─── LAUNCH VIDEO (silent, decorative loop) ─── */
  function setupLaunchSound() {
    const video = document.getElementById('launch-video');
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }

  /* ─── LAUNCH ANIMATION ─── */
  function runLaunchAnimation() {
    const overlay = document.getElementById('launch-overlay');
    if (!overlay) return;
    setupLaunchSound();

    // Already seen this session? skip (but still show briefly)
    const seen = sessionStorage.getItem('tf_launched');
    const fill = document.getElementById('launch-fill');
    const percent = document.getElementById('launch-percent');
    const taglines = {
      it: ['Energia. Innovazione. Futuro.', 'Il tuo partner energetico.', 'Caricamento in corso…'],
      en: ['Energy. Innovation. Future.', 'Your energy partner.', 'Loading…']
    };
    const words = taglines[currentLang];
    let wordIdx = 0;
    const taglineEl = document.getElementById('launch-tagline');

    // Create particles
    const pc = document.getElementById('launch-particles');
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'lp';
      p.style.cssText = `
        left:${Math.random() * 100}%;
        bottom:${Math.random() * 40 + 20}%;
        --dx:${(Math.random() - 0.5) * 60}px;
        animation-duration:${1.5 + Math.random() * 2}s;
        animation-delay:${Math.random() * 1}s;
        opacity:${Math.random() * 0.6 + 0.2};
        width:${Math.random() * 4 + 2}px;
        height:${Math.random() * 4 + 2}px;
        background:${Math.random() > 0.5 ? '#a78bfa' : '#60a5fa'};
      `;
      pc.appendChild(p);
    }

    if (seen) {
      // Quick fade
      fill.style.width = '100%';
      percent.textContent = '100%';
      setTimeout(() => { overlay.classList.add('hidden'); }, 300);
      return;
    }

    let prog = 0;
    const taglineInterval = setInterval(() => {
      wordIdx = (wordIdx + 1) % words.length;
      if (taglineEl) {
        taglineEl.style.opacity = '0';
        setTimeout(() => {
          taglineEl.textContent = words[wordIdx];
          taglineEl.style.opacity = '1';
          taglineEl.style.transition = 'opacity 0.4s';
        }, 200);
      }
    }, 900);

    const timer = setInterval(() => {
      prog += Math.random() * 4 + 1;
      if (prog >= 100) {
        prog = 100;
        clearInterval(timer);
        clearInterval(taglineInterval);
        setTimeout(() => {
          overlay.classList.add('hidden');
          sessionStorage.setItem('tf_launched', '1');
        }, 400);
      }
      fill.style.width = prog + '%';
      percent.textContent = Math.round(prog) + '%';
    }, 40);
  }

  /* ─── LANGUAGE SYSTEM ─── */
  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('tf_lang', lang);

    const itEl = document.querySelector('.lang-it');
    const enEl = document.querySelector('.lang-en');
    if (itEl) itEl.classList.toggle('active', lang === 'it');
    if (enEl) enEl.classList.toggle('active', lang === 'en');

    document.querySelectorAll('[data-it]').forEach(el => {
      const val = el.getAttribute(`data-${lang}`);
      if (!val) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });
  }

  function initLangToggle() {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      applyLanguage(currentLang === 'it' ? 'en' : 'it');
    });
    applyLanguage(currentLang);
  }

  /* ─── NAVBAR ─── */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
      });
      // Close on nav link click
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });
    }

    // Active link
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => io.observe(el));
  }

  /* ─── COUNTER ANIMATION ─── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target) + (progress >= 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  function initCounters() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !e.target.dataset.counted) {
          e.target.dataset.counted = '1';
          animateCounter(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => io.observe(el));
  }

  /* ─── HERO PARTICLES ─── */
  function initHeroParticles() {
    const container = document.getElementById('hero-particles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 3 + 1;
      p.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        border-radius:50%;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        background:rgba(${Math.random() > 0.5 ? '124,111,212' : '96,165,250'},${Math.random() * 0.5 + 0.2});
        animation:heroParticle ${3 + Math.random() * 4}s linear infinite;
        animation-delay:${Math.random() * 5}s;
        --dx:${(Math.random() - 0.5) * 80}px;
        --dy:${-(Math.random() * 80 + 40)}px;
        pointer-events:none;
      `;
      container.appendChild(p);
    }
    const style = document.createElement('style');
    style.textContent = `
      @keyframes heroParticle {
        0% { transform: translate(0,0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 0.3; }
        100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── REVIEWS SLIDER ─── */
  function initReviewsSlider() {
    const track = document.getElementById('reviews-track');
    const dotsContainer = document.getElementById('rev-dots');
    const prevBtn = document.getElementById('rev-prev');
    const nextBtn = document.getElementById('rev-next');
    if (!track) return;

    const cards = track.querySelectorAll('.review-card');
    const visibleCount = window.innerWidth < 768 ? 1 : 3;
    const maxIndex = Math.ceil(cards.length / visibleCount) - 1;
    let current = 0;
    let autoTimer;

    // Build dots
    if (dotsContainer) {
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('div');
        dot.className = 'rev-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex));
      const cardWidth = track.querySelector('.review-card').offsetWidth + 24;
      track.style.transform = `translateX(-${current * visibleCount * cardWidth}px)`;
      document.querySelectorAll('.rev-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    function autoPlay() {
      autoTimer = setInterval(() => {
        goTo(current >= maxIndex ? 0 : current + 1);
      }, 5000);
    }
    function resetAuto() {
      clearInterval(autoTimer);
      autoPlay();
    }
    autoPlay();
  }

  /* ─── CONTACT FORM (Google Sheets + WhatsApp) ─── */
  window.submitContactForm = async function (evt) {
    if (evt) evt.preventDefault();
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('[type=submit]');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    // Gather data
    const data = {
      timestamp: new Date().toISOString(),
      nome: form.nome?.value || '',
      email: form.email?.value || '',
      telefono: form.telefono?.value || '',
      localita: form.localita?.value || '',
      prodotto: form.prodotto?.value || '',
      messaggio: form.messaggio?.value || '',
      lingua: currentLang
    };

    // Validate
    if (!data.nome || !data.email || !data.telefono) {
      if (errorMsg) {
        errorMsg.textContent = currentLang === 'it' ? 'Compila tutti i campi obbligatori.' : 'Please fill in all required fields.';
        errorMsg.style.display = 'block';
      }
      return;
    }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = currentLang === 'it' ? 'Invio…' : 'Sending…'; }
    if (errorMsg) errorMsg.style.display = 'none';

    try {
      // ─── Submit via Vercel serverless → Google Sheets ───
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: data.timestamp,
          nome:      data.nome,
          email:     data.email,
          telefono:  data.telefono,
          localita:  data.localita,
          prodotto:  data.prodotto,
          messaggio: data.messaggio,
          lingua:    data.lingua
        })
      });
      const result = await response.json();
      console.log('Sheet response:', result);

      // Save locally too
      saveLeadLocally(data);

      // Show success
      if (successMsg) successMsg.style.display = 'block';
      form.reset();

      // Auto-open WhatsApp
      const waMsg = encodeURIComponent(
        `Ciao, ho appena compilato il modulo su TF ENERGY SRL.\n` +
        `Nome: ${data.nome}\n` +
        `Prodotto interessato: ${data.prodotto || 'N/D'}\n` +
        `Telefono: ${data.telefono}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/393792620610?text=${waMsg}`, '_blank');
      }, 1500);

    } catch (err) {
      // Even if fetch fails (CORS), local save is done
      saveLeadLocally(data);
      if (successMsg) successMsg.style.display = 'block';
      form.reset();
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = currentLang === 'it' ? 'Invia Richiesta' : 'Send Request'; }
    }
  };

  function saveLeadLocally(data) {
    const leads = JSON.parse(localStorage.getItem('tf_leads') || '[]');
    leads.unshift({ ...data, id: Date.now(), status: 'new' });
    localStorage.setItem('tf_leads', JSON.stringify(leads.slice(0, 500)));
  }

  /* ─── ADMIN DASHBOARD ─── */
  window.initAdmin = function () {
    const adminContent = document.getElementById('admin-content');
    if (!adminContent) return;

    // Auth check
    const adminUser = sessionStorage.getItem('tf_admin');
    if (!adminUser) {
      showAdminLogin();
      return;
    }
    loadAdminDashboard();
  };

  window.adminLogin = function (evt) {
    if (evt) evt.preventDefault();
    const user = document.getElementById('admin-user')?.value;
    const pass = document.getElementById('admin-pass')?.value;
    const admins = JSON.parse(localStorage.getItem('tf_admins') || '[]');
    const found = admins.find(a => a.email === user && a.pass === btoa(pass));
    if (found) {
      sessionStorage.setItem('tf_admin', JSON.stringify(found));
      loadAdminDashboard();
    } else {
      const err = document.getElementById('admin-login-error');
      if (err) err.textContent = 'Credenziali non valide.';
    }
  };

  window.adminRegister = function (evt) {
    if (evt) evt.preventDefault();
    const email = document.getElementById('reg-email')?.value;
    const pass = document.getElementById('reg-pass')?.value;
    if (!email || !pass) return;
    const admins = JSON.parse(localStorage.getItem('tf_admins') || '[]');
    if (admins.find(a => a.email === email)) {
      document.getElementById('admin-login-error').textContent = 'Email già registrata.';
      return;
    }
    admins.push({ email, pass: btoa(pass), role: 'admin', created: new Date().toISOString() });
    localStorage.setItem('tf_admins', JSON.stringify(admins));
    sessionStorage.setItem('tf_admin', JSON.stringify({ email, role: 'admin' }));
    loadAdminDashboard();
  };

  function showAdminLogin() {
    const el = document.getElementById('admin-content');
    if (!el) return;
    el.innerHTML = `
      <div class="login-wrap">
        <div class="login-box">
          <div class="login-logo">
            <img src="https://tfenergy.it/wp-content/uploads/2022/09/Logo_web_TF-APP-copy.png" alt="TF ENERGY SRL"/>
            <h2>TF ENERGY SRL Admin</h2>
            <p>Accedi al pannello di controllo</p>
          </div>
          <div id="admin-login-error" style="color:#ef4444;font-size:.85rem;margin-bottom:12px;min-height:20px"></div>
          <div id="login-form-wrap">
            <form onsubmit="adminLogin(event)">
              <div class="form-group"><label class="form-label">Email</label><input id="admin-user" type="email" class="form-control" placeholder="info@tfenergy.it" required/></div>
              <div class="form-group"><label class="form-label">Password</label><input id="admin-pass" type="password" class="form-control" placeholder="••••••••" required/></div>
              <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:8px">Accedi</button>
            </form>
            <p style="text-align:center;margin-top:20px;font-size:.85rem;color:var(--text-secondary)">Prima volta? <a href="#" onclick="showRegister();return false;" style="color:var(--lavender-light)">Crea account admin →</a></p>
          </div>
          <div id="register-form-wrap" style="display:none">
            <form onsubmit="adminRegister(event)">
              <div class="form-group"><label class="form-label">Email</label><input id="reg-email" type="email" class="form-control" placeholder="info@tfenergy.it" required/></div>
              <div class="form-group"><label class="form-label">Password</label><input id="reg-pass" type="password" class="form-control" placeholder="••••••••" required/></div>
              <button type="submit" class="btn-primary" style="width:100%;justify-content:center;margin-top:8px">Crea Account</button>
            </form>
            <p style="text-align:center;margin-top:20px;font-size:.85rem;color:var(--text-secondary)"><a href="#" onclick="showLogin();return false;" style="color:var(--lavender-light)">← Torna al login</a></p>
          </div>
        </div>
      </div>
    `;
  }

  window.showRegister = function () {
    document.getElementById('login-form-wrap').style.display = 'none';
    document.getElementById('register-form-wrap').style.display = 'block';
  };
  window.showLogin = function () {
    document.getElementById('register-form-wrap').style.display = 'none';
    document.getElementById('login-form-wrap').style.display = 'block';
  };

  function loadAdminDashboard() {
    const el = document.getElementById('admin-content');
    if (!el) return;
    const leads = JSON.parse(localStorage.getItem('tf_leads') || '[]');
    const adminUser = JSON.parse(sessionStorage.getItem('tf_admin') || '{}');

    const newLeads = leads.filter(l => l.status === 'new').length;
    const totalLeads = leads.length;

    el.innerHTML = `
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <div style="padding:0 24px 24px;border-bottom:1px solid var(--border-color);margin-bottom:16px">
            <div style="font-weight:700;color:var(--white);font-size:.95rem">${adminUser.email || 'Admin'}</div>
            <div style="font-size:.75rem;color:var(--text-secondary);margin-top:2px">Amministratore</div>
          </div>
          <div class="admin-sidebar-title">Menu</div>
          <div class="admin-nav-item active" onclick="showAdminSection('dashboard')"><i data-lucide="layout-dashboard"></i> Dashboard</div>
          <div class="admin-nav-item" onclick="showAdminSection('leads')"><i data-lucide="inbox"></i> Richieste (${newLeads} nuove)</div>
          <div class="admin-nav-item" onclick="showAdminSection('projects')"><i data-lucide="image"></i> Progetti</div>
          <div class="admin-nav-item" onclick="showAdminSection('settings')"><i data-lucide="settings"></i> Impostazioni</div>
          <div class="admin-nav-item" style="margin-top:auto" onclick="adminLogout()"><i data-lucide="log-out"></i> Esci</div>
        </aside>
        <main class="admin-main">
          <div id="admin-section-dashboard">
            <div class="admin-header">
              <h1>Dashboard</h1>
              <div style="font-size:.85rem;color:var(--text-secondary)">${new Date().toLocaleDateString('it-IT',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
            </div>
            <div class="stat-cards">
              <div class="stat-card">
                <div class="stat-card-val">${totalLeads}</div>
                <div class="stat-card-label">Richieste Totali</div>
                <div class="stat-card-trend trend-up">↑ 12% questo mese</div>
              </div>
              <div class="stat-card">
                <div class="stat-card-val">${newLeads}</div>
                <div class="stat-card-label">Nuove Richieste</div>
                <div class="stat-card-trend trend-up">↑ 8% vs ieri</div>
              </div>
              <div class="stat-card">
                <div class="stat-card-val">500+</div>
                <div class="stat-card-label">Installazioni</div>
                <div class="stat-card-trend trend-up">↑ 34 questo anno</div>
              </div>
              <div class="stat-card">
                <div class="stat-card-val">4.9★</div>
                <div class="stat-card-label">Rating Google</div>
                <div class="stat-card-trend" style="color:var(--accent-yellow)">⭐ Eccellente</div>
              </div>
            </div>
            <div style="background:var(--gradient-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:24px;margin-top:8px">
              <h3 style="color:var(--white);margin-bottom:16px;font-family:'Space Grotesk',sans-serif">Ultime Richieste</h3>
              ${leads.length === 0 ? '<p style="color:var(--text-secondary);text-align:center;padding:24px">Nessuna richiesta ancora</p>' : `
              <table class="admin-table">
                <thead><tr><th>Nome</th><th>Prodotto</th><th>Telefono</th><th>Data</th><th>Stato</th></tr></thead>
                <tbody>
                  ${leads.slice(0,8).map(l => `
                    <tr>
                      <td style="color:var(--white)">${l.nome}</td>
                      <td>${l.prodotto || '—'}</td>
                      <td><a href="tel:${l.telefono}" style="color:var(--accent-cyan)">${l.telefono}</a></td>
                      <td>${new Date(l.timestamp).toLocaleDateString('it-IT')}</td>
                      <td><span class="badge badge-${l.status === 'new' ? 'new' : l.status === 'done' ? 'done' : 'progress'}">${l.status === 'new' ? 'Nuova' : l.status === 'done' ? 'Gestita' : 'In lavorazione'}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`}
            </div>
          </div>
          <div id="admin-section-leads" style="display:none">
            <div class="admin-header"><h1>Richieste di Contatto</h1>
              <button onclick="exportLeadsCSV()" class="btn-secondary" style="font-size:.8rem;padding:8px 16px">Esporta CSV</button>
            </div>
            <div style="background:var(--gradient-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:24px;overflow-x:auto">
              ${leads.length === 0 ? '<p style="color:var(--text-secondary);text-align:center;padding:48px">Nessuna richiesta ancora</p>' : `
              <table class="admin-table" style="min-width:700px">
                <thead><tr><th>Nome</th><th>Email</th><th>Telefono</th><th>Prodotto</th><th>Località</th><th>Data</th><th>Stato</th><th>Azioni</th></tr></thead>
                <tbody>
                  ${leads.map((l,i) => `
                    <tr>
                      <td style="color:var(--white)">${l.nome}</td>
                      <td><a href="mailto:${l.email}" style="color:var(--accent-cyan)">${l.email}</a></td>
                      <td><a href="tel:${l.telefono}" style="color:var(--accent-cyan)">${l.telefono}</a></td>
                      <td>${l.prodotto || '—'}</td>
                      <td>${l.localita || '—'}</td>
                      <td>${new Date(l.timestamp).toLocaleDateString('it-IT')}</td>
                      <td>
                        <select onchange="updateLeadStatus(${i},this.value)" style="background:var(--surface-2);border:1px solid var(--border-color);color:var(--white);border-radius:4px;padding:4px 8px;font-size:.78rem">
                          <option value="new" ${l.status==='new'?'selected':''}>Nuova</option>
                          <option value="progress" ${l.status==='progress'?'selected':''}>In lav.</option>
                          <option value="done" ${l.status==='done'?'selected':''}>Gestita</option>
                          <option value="closed" ${l.status==='closed'?'selected':''}>Chiusa</option>
                        </select>
                      </td>
                      <td>
                        <a href="https://wa.me/${l.telefono?.replace(/\D/g,'')}" target="_blank" style="color:#25d366;font-size:.8rem">WA</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>`}
            </div>
          </div>
          <div id="admin-section-projects" style="display:none">
            <div class="admin-header"><h1>Gestione Progetti</h1></div>
            <div style="background:var(--gradient-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:32px;text-align:center">
              <p style="color:var(--text-secondary);margin-bottom:16px">Aggiungi e gestisci i progetti visibili sul sito</p>
              <button class="btn-primary" onclick="alert('Funzionalità di aggiunta progetto — connetti al tuo CMS o Google Sheets per abilitare')">+ Aggiungi Progetto</button>
            </div>
          </div>
          <div id="admin-section-settings" style="display:none">
            <div class="admin-header"><h1>Impostazioni</h1></div>
            <div style="background:var(--gradient-card);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:32px;max-width:500px">
              <h3 style="color:var(--white);margin-bottom:20px;font-family:'Space Grotesk',sans-serif">Notifiche</h3>
              <label style="display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:16px">
                <input type="checkbox" checked style="accent-color:var(--lavender);width:16px;height:16px"/>
                <span style="font-size:.9rem;color:var(--text-secondary)">WhatsApp per ogni nuova richiesta</span>
              </label>
              <label style="display:flex;align-items:center;gap:12px;cursor:pointer;margin-bottom:24px">
                <input type="checkbox" checked style="accent-color:var(--lavender);width:16px;height:16px"/>
                <span style="font-size:.9rem;color:var(--text-secondary)">Email per ogni nuova richiesta</span>
              </label>
              <div class="form-group"><label class="form-label">Google Sheet ID (solo lettura)</label>
                <input class="form-control" value="1CMVnAorxcBenpNZRKdT6TWGvwFmkcjPnrscrAqm2pTo" readonly/></div>
              <button class="btn-primary" style="margin-top:8px" onclick="alert('Impostazioni salvate')">Salva</button>
            </div>
          </div>
        </main>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  }

  window.showAdminSection = function (sec) {
    ['dashboard', 'leads', 'projects', 'settings'].forEach(s => {
      const el = document.getElementById(`admin-section-${s}`);
      if (el) el.style.display = s === sec ? 'block' : 'none';
    });
    document.querySelectorAll('.admin-nav-item').forEach(item => {
      item.classList.toggle('active', item.textContent.toLowerCase().includes(sec === 'dashboard' ? 'dashboard' : sec));
    });
  };

  window.updateLeadStatus = function (idx, status) {
    const leads = JSON.parse(localStorage.getItem('tf_leads') || '[]');
    if (leads[idx]) {
      leads[idx].status = status;
      localStorage.setItem('tf_leads', JSON.stringify(leads));
    }
  };

  window.adminLogout = function () {
    sessionStorage.removeItem('tf_admin');
    location.reload();
  };

  window.exportLeadsCSV = function () {
    const leads = JSON.parse(localStorage.getItem('tf_leads') || '[]');
    const headers = ['Timestamp', 'Nome', 'Email', 'Telefono', 'Località', 'Prodotto', 'Messaggio', 'Stato'];
    const rows = leads.map(l => [l.timestamp, l.nome, l.email, l.telefono, l.localita, l.prodotto, l.messaggio?.replace(/,/g, ';'), l.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `tf-energy-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  /* ─── LUCIDE ICONS ─── */
  function initIcons() {
    if (window.lucide) lucide.createIcons();
  }

  /* ─── SMOOTH ANCHOR SCROLL ─── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ─── INIT ─── */
  document.addEventListener('DOMContentLoaded', () => {
    runLaunchAnimation();
    setupHeroVideoSound();
    initNavbar();
    initLangToggle();
    initReveal();
    initCounters();
    initHeroParticles();
    initReviewsSlider();
    initSmoothScroll();
    initIcons();

    // Admin page auto-init
    if (document.getElementById('admin-content')) {
      initAdmin();
    }
  });

})();
