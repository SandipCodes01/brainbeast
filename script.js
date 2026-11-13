/* =====================================================
   BRAINBEAST TECHNOLOGIES LLP - script.js
   Each block below adds ONE feature. They are independent,
   so you can delete any block without breaking the rest.
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 1. Footer year (auto-updates every January) ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- 2. Dark / light theme toggle ----------
     We store the choice in localStorage so it is remembered
     the next time the visitor opens the site. */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      themeBtn.textContent = "☀️";
    } else {
      root.removeAttribute("data-theme");
      themeBtn.textContent = "🌙";
    }
  }
  let saved = null;
  try { saved = localStorage.getItem("bb-theme"); } catch (e) {}
  applyTheme(saved || "dark");

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("bb-theme", next); } catch (e) {}
  });

  /* ---------- 3. Mobile menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const navLinks = document.getElementById("navLinks");

  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
    menuBtn.textContent = open ? "✕" : "☰";
  });
  // Close the menu after tapping a link
  navLinks.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.textContent = "☰";
    })
  );

  /* ---------- 4. Sticky header style + back-to-top button ---------- */
  const header = document.querySelector(".site-header");
  const toTop = document.getElementById("toTop");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 20);
    toTop.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- 5. Scroll reveal animation ----------
     IntersectionObserver tells us when an element enters the screen. */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target); // animate only once
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + "ms"; // small stagger
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add("visible")); // old browsers
  }

  /* ---------- 6. Animated number counters ---------- */
  function runCounter(el) {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(c => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ---------- 7. Typing effect in the hero code window ---------- */
  const typingEl = document.getElementById("typingLine");
  const phrases = ["launch(project)", "launch(webApp)", "launch(mobileApp)", "launch(yourIdea)"];
  let p = 0, c = 0, deleting = false;
  function type() {
    const word = phrases[p];
    typingEl.textContent = word.slice(0, c);
    if (!deleting && c < word.length) { c++; setTimeout(type, 110); }
    else if (!deleting) { deleting = true; setTimeout(type, 1400); }
    else if (c > 0) { c--; setTimeout(type, 55); }
    else { deleting = false; p = (p + 1) % phrases.length; setTimeout(type, 350); }
  }
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) type();

  /* ---------- 8. Portfolio filter ---------- */
  const chips = document.querySelectorAll(".chip");
  const works = document.querySelectorAll(".work");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.dataset.filter;
      works.forEach(w => w.classList.toggle("hide", f !== "all" && w.dataset.cat !== f));
    });
  });

  /* ---------- 9. FAQ accordion ----------
     We animate max-height from 0 to the real content height. */
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn = item.querySelector(".faq-q");
    const answer = item.querySelector(".faq-a");
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close all others (one open at a time)
      document.querySelectorAll(".faq-item.open").forEach(o => {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        answer.style.maxHeight = answer.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- 10. Contact form: validation + sending ----------
     We check the fields ourselves, then send them with fetch()
     to the form service in the form's "action" attribute (Formspree).
     No server needed on your side. */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  function setError(input, msg) {
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    field.querySelector(".err").textContent = msg || "";
    return !msg;
  }

  function validate() {
    const name = form.elements.name;
    const email = form.elements.email;
    const message = form.elements.message;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    let ok = true;
    ok = setError(name, name.value.trim().length < 2 ? "Please enter your name." : "") && ok;
    ok = setError(email, emailOk ? "" : "Please enter a valid email address.") && ok;
    ok = setError(message, message.value.trim().length < 10 ? "Please tell us a little more (10+ characters)." : "") && ok;
    return ok;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.className = "form-status";
    status.textContent = "";
    if (!validate()) return;

    // If you have not replaced YOUR_FORM_ID yet, show a friendly note
    if (form.action.includes("YOUR_FORM_ID")) {
      status.classList.add("fail");
      status.textContent = "Form is not connected yet. Add your Formspree ID in index.html.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        status.classList.add("ok");
        status.textContent = "Thank you! We received your message and will reply soon.";
        form.reset();
      } else {
        throw new Error("Request failed");
      }
    } catch (err) {
      status.classList.add("fail");
      status.textContent = "Something went wrong. Please email us directly.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }
  });
});
