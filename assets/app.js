// =====================
// Oberstufe.site Vanilla JS
// =====================

(function() {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  const root = document.documentElement;
  const loader = $("#loader");
  const nav = $(".nav");
  const heroContent = $(".hero-content");
  const sakuraLayer = $("#sakura");
  const sakuraBtn = $("#sakuraToggle");
  const themeBtn = $("#themeToggle");
  const cursorGlow = $("#cursor-glow");

  // Year in footer
  $("#year").textContent = new Date().getFullYear();

  // Sticky nav blur intensifies on scroll
  const onScroll = () => {
    if (window.scrollY > 8) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Cursor glow follows mouse (reduced motion aware)
  let reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
    reduceMotion = e.matches;
  });
  window.addEventListener("mousemove", (e) => {
    if (reduceMotion) return;
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  // THEME TOGGLE (persist)
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || savedTheme === "light") {
    document.documentElement.setAttribute("data-theme", savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  function toggleTheme() {
    const now = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", now);
    localStorage.setItem("theme", now);
    themeBtn.setAttribute("aria-pressed", now === "dark");
  }
  themeBtn.addEventListener("click", toggleTheme);

  // SAKURA GENERATION
  function spawnSakura(count = 24) {
    sakuraLayer.innerHTML = "";
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("span");
      petal.className = "petal";
      const size = Math.random() * 20 + 12; // 12-32px
      const dur = Math.random() * 6 + 9;    // 9-15s
      const delay = Math.random() * -dur;   // start spread
      petal.style.setProperty("--size", `${size}px`);
      petal.style.setProperty("--dur", `${dur}s`);
      // Start am rechten oberen Rand leicht zufällig
      petal.style.left = `${vw * (0.85 + Math.random()*0.2)}px`;
      petal.style.top = `${-vh * (0.05 + Math.random()*0.2)}px`;
      petal.style.animationDelay = `${delay}s, ${delay * .7}s`;
      sakuraLayer.appendChild(petal);
    }
  }

  // Toggle for Sakura
  function setSakura(on) {
    if (on) {
      sakuraLayer.classList.remove("off");
      sakuraBtn.textContent = "Sakura: an";
      sakuraBtn.setAttribute("aria-pressed", "true");
      localStorage.setItem("sakura", "on");
      spawnSakura(window.innerWidth < 720 ? 16 : 28);
    } else {
      sakuraLayer.classList.add("off");
      sakuraLayer.innerHTML = "";
      sakuraBtn.textContent = "Sakura: aus";
      sakuraBtn.setAttribute("aria-pressed", "false");
      localStorage.setItem("sakura", "off");
    }
  }
  sakuraBtn.addEventListener("click", () => setSakura(sakuraLayer.classList.contains("off")));

  // Restore sakura pref
  setSakura(localStorage.getItem("sakura") !== "off");

  // Swoosh Intro: kurzer Schwall Blüten zu Beginn
  function swooshBurst() {
    if (reduceMotion || sakuraLayer.classList.contains('off')) return;
    const total = Math.min(80, Math.max(36, Math.floor(window.innerWidth / 12)));
    for (let i = 0; i < total; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      const size = 10 + Math.random()*18;
      const dur = 2 + Math.random()*2.2; // 2–4.2s schnell
      const delay = Math.random() * .6;  // kurzer, gestaffelter Start
      petal.style.setProperty('--size', size + 'px');
      petal.style.setProperty('--dur', dur + 's');
      // Start weiter rechts oben
      petal.style.left = (window.innerWidth * (0.95 + Math.random()*0.15)) + 'px';
      petal.style.top = (-window.innerHeight * (0.2 + Math.random()*0.25)) + 'px';
      // Ersetze Flow-Animation temporär durch "swooshAcross"
      petal.style.animationName = 'swooshAcross, windSway';
      petal.style.animationDelay = delay + 's, ' + (delay * .7) + 's';
      sakuraLayer.appendChild(petal);
      setTimeout(() => petal.remove(), (dur + delay + 0.5) * 1000);
    }
  }

  // Loader → reveal sequence
  document.addEventListener("DOMContentLoaded", () => { swooshBurst();
    // small delay for effect
    setTimeout(() => {
      loader.classList.add("hidden");
      // reveal hero content (CSS anim already set)
      heroContent.style.animationPlayState = "running";
      // focus access
      $(".brand").focus({ preventScroll: true });
    }, 400);
    // Fallback: falls irgendwas hängt, Loader nach 3s sicher ausblenden
    setTimeout(() => loader.classList.add("hidden"), 3000);
  });

  // Liquid Glass Panel interactivity: tilt on hover
  const cards = $$(".card.panel");
  cards.forEach(card => {
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rx = (y - 0.5) * -8;  // tilt range
      const ry = (x - 0.5) * 12;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
    // Active scale-down with spring-back
    card.addEventListener("pointerdown", () => card.style.transform += " scale(0.98)");
    card.addEventListener("pointerup", () => {
      card.style.transition = "transform .35s cubic-bezier(.2,.7,.2,1)";
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
      setTimeout(() => { card.style.transition = ""; }, 400);
    });
  });

  
  // Globale Suche mit Highlighting
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const status = document.getElementById('search-status');

  function clearMarks() {
    document.querySelectorAll('mark.search-hit').forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function highlight(container, term) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: n => n.parentElement && !['SCRIPT','STYLE'].includes(n.parentElement.tagName) && n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    let hits = 0;
    const regex = new RegExp(term, 'gi');
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const parts = node.nodeValue.split(regex);
      if (parts.length > 1) {
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        node.nodeValue.replace(regex, (match, index) => {
          frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex, index)));
          const mark = document.createElement('mark');
          mark.className = 'search-hit';
          mark.textContent = match;
          frag.appendChild(mark);
          lastIndex = index + match.length;
          hits++;
        });
        frag.appendChild(document.createTextNode(node.nodeValue.slice(lastIndex)));
        node.parentNode.replaceChild(frag, node);
      }
    });
    return hits;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim();
    clearMarks();
    if (!q) { status.textContent = 'Suche geleert.'; return; }
    const hits = highlight(document.body, q);
    status.textContent = hits ? `Treffer: ${hits}` : 'Keine Treffer.';
    const first = document.querySelector('mark.search-hit');
    if (first) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  // Accessibility: close glow on keyboard use
  window.addEventListener("keydown", () => { cursorGlow.style.opacity = 0; }, { once: true });

  // Periodische Blätter alle 10–30s (2–3 Stück)
  function randomBetween(min, max) { return Math.random() * (max - min) + min; }
  function spawnFlyby() {
    if (reduceMotion || sakuraLayer.classList.contains("off")) return;
    const n = Math.floor(randomBetween(2, 4));
    for (let i = 0; i < n; i++) {
      const petal = document.createElement("span");
      petal.className = "petal";
      const size = randomBetween(14, 28);
      const dur = randomBetween(6, 10);
      const delay = randomBetween(-1, 0);
      petal.style.setProperty("--size", `${size}px`);
      petal.style.setProperty("--dur", `${dur}s`);
      petal.style.left = `${window.innerWidth * (0.9 + Math.random()*0.1)}px`;
      petal.style.top = `${-window.innerHeight * (0.1 + Math.random()*0.15)}px`;
      petal.style.animationDelay = `${delay}s, ${delay * .7}s`;
      sakuraLayer.appendChild(petal);
      // Entfernen nach Ende
      setTimeout(() => petal.remove(), (dur + 0.5) * 1000);
    }
    scheduleFlyby();
  }
  function scheduleFlyby() {
    const t = randomBetween(10000, 30000);
    setTimeout(spawnFlyby, t);
  }
  scheduleFlyby();

})();