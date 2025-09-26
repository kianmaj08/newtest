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
    for (let i = 0; i < count; i++) {
      const petal = document.createElement("span");
      petal.className = "petal";
      const size = Math.random() * 18 + 10; // 10-28px
      const dur = Math.random() * 6 + 8;    // 8-14s
      const startX = Math.random() * vw;
      const delay = Math.random() * -dur;   // start in different phases
      petal.style.setProperty("--size", `${size}px`);
      petal.style.setProperty("--dur", `${dur}s`);
      petal.style.left = `${startX}px`;
      petal.style.top = `${Math.random() * -60 - 20}px`;
      petal.style.animationDelay = `${delay}s, ${delay * .7}s`;
      petal.style.transform = `translateY(-20vh) rotate(${Math.random()*360}deg)`;
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

  // Loader → reveal sequence
  document.addEventListener("DOMContentLoaded", () => {
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

  // Accessibility: close glow on keyboard use
  window.addEventListener("keydown", () => { cursorGlow.style.opacity = 0; }, { once: true });

})();