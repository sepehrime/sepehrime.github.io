// Portfolio interactions: theme toggle, mobile menu, typing effect,
// project filters, scroll reveal, active nav link, copy email.
(function () {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Theme toggle ----------
  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* storage blocked: theme still switches */ }
    });
  }

  // ---------- Mobile menu ----------
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (navToggle && navLinks) {
    const setOpen = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      navLinks.classList.toggle("open", open);
    };
    navToggle.addEventListener("click", () => setOpen(navToggle.getAttribute("aria-expanded") !== "true"));
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  // ---------- Header border on scroll ----------
  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Typing effect ----------
  const typed = document.querySelector(".typed");
  if (typed && !prefersReducedMotion) {
    let roles = [];
    try { roles = JSON.parse(typed.dataset.roles || "[]"); } catch (e) { roles = []; }
    if (roles.length > 1) {
      let roleIndex = 0;
      let charIndex = roles[0].length;
      let deleting = true;
      const tick = () => {
        const word = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typed.textContent = word.slice(0, charIndex);
        let delay = deleting ? 35 : 70;
        if (!deleting && charIndex === word.length) { deleting = true; delay = 1800; }
        else if (deleting && charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          delay = 300;
        }
        setTimeout(tick, delay);
      };
      setTimeout(tick, 1800);
    }
  }

  // ---------- Project filters ----------
  const chips = document.querySelectorAll(".chip[data-filter]");
  const cards = document.querySelectorAll(".project-card");
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const filter = chip.dataset.filter;
      chips.forEach((c) => {
        const active = c === chip;
        c.classList.toggle("is-active", active);
        c.setAttribute("aria-pressed", String(active));
      });
      cards.forEach((card) => {
        const tags = (card.dataset.tags || "").split(" ");
        card.classList.toggle("is-hidden", filter !== "all" && !tags.includes(filter));
      });
    });
  });

  // ---------- Scroll reveal ----------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Highlight the nav link for the section in view ----------
  const sectionLinks = new Map();
  document.querySelectorAll('.nav-links a[href^="#"]').forEach((a) => {
    const section = document.querySelector(a.getAttribute("href"));
    if (section) sectionLinks.set(section, a);
  });
  if ("IntersectionObserver" in window && sectionLinks.size) {
    const navIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          sectionLinks.forEach((link) => link.classList.remove("active"));
          sectionLinks.get(entry.target).classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sectionLinks.forEach((_, section) => navIo.observe(section));
  }

  // ---------- Copy email ----------
  const copyBtn = document.querySelector(".copy-email");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.dataset.email;
      const original = copyBtn.textContent;
      try {
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = "Copied!";
      } catch (e) {
        copyBtn.textContent = email; // fallback: show it so it can be selected
      }
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    });
  }

  // ---------- Footer year ----------
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
