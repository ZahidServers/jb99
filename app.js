    // year
    document.getElementById("year").textContent = new Date().getFullYear();

    // Accordion (connectivity)
    document.querySelectorAll(".accItem").forEach(item => {
      const btn = item.querySelector(".accBtn");
      btn.addEventListener("click", () => {
        document.querySelectorAll(".accItem").forEach(i => i.classList.remove("active"));
        item.classList.add("active");
      });
    });

    // GSAP Animations (only for sections marked "Need Animation")
    window.addEventListener("load", () => {
      gsap.registerPlugin(ScrollTrigger);

      // Hero bg subtle zoom out
      gsap.fromTo("#heroBg",
        { scale: 1.08 },
        { scale: 1.02, duration: 1.6, ease: "power3.out" }
      );

      // Hero text stagger
      gsap.to("#heroKicker", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.15
      });

      gsap.utils.toArray("#heroTitle .reveal").forEach((el, i) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.25 + i * 0.12
        });
      });

      // Scroll reveal (fade-up)
      gsap.utils.toArray(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
          }
        });
      });

      // Scale reveal for images/cards
      gsap.utils.toArray(".revealScale:not(.legacyZone)").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          }
        });
      });

      gsap.utils.toArray(".configBox").forEach(box => {
        box.addEventListener("mouseenter", () => {
          gsap.to(box.querySelector("img"), { scale: 1.08, filter: "blur(0px)", duration: 0.5, ease: "power2.out" });
        });
        box.addEventListener("mouseleave", () => {
          gsap.to(box.querySelector("img"), { scale: 1.05, filter: "blur(3px)", duration: 0.5, ease: "power2.out" });
        });
      });

      // Hallmark chips stagger
      gsap.from(".chipRow .chip", {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: ".chipRow",
          start: "top 85%"
        }
      });

      // Legacy tiles stagger (premium)
      const legacyTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".legacyGrid",
          start: "top 85%",
          once: true
        }
      });

      legacyTl.from(".legacyZone", {
        y: 10,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.1
      }, "-=0.25");

    });

// ================================
// Configurations Classic/Premium switch
// ================================
(function(){
  const selects = document.querySelectorAll(".configSelect");
  if(!selects.length) return;

  const configImages = {
    cfg1: {
      classic: "rectangle62 (1).webp",
      premium: "rectangle63.webp"
    },
    cfg2: {
      classic: "rectangle64 (1).webp",
      premium: "rectangle64.webp"
    }
  };

  selects.forEach(sel=>{
    sel.addEventListener("change", ()=>{
      const targetId = sel.dataset.target;
      const mode = sel.value;
      const img = document.getElementById(targetId);
      if(!img) return;

      img.src = configImages[targetId][mode] || img.src;

      // smooth transition
      gsap.fromTo(img, { opacity: 0.4, scale: 1.03 }, { opacity: 0.85, scale: 1.05, duration: 0.35, ease: "power2.out" });
    });
  });
})();


// ================================
// Legacy slider (4 pages) with auto-slide
// ================================
(function(){
  const track = document.getElementById("legacyTrack");
  const prev = document.getElementById("legacyPrev");
  const next = document.getElementById("legacyNext");

  if(!track || !prev || !next) return;

  const pages = track.querySelectorAll(".legacyGrid");
  let idx = 0;
  let autoSlideInterval;

  function go(i){
    idx = (i + pages.length) % pages.length;
    track.style.transform = `translateX(${-idx * 100}%)`;
  }

  prev.addEventListener("click", ()=>{
    go(idx - 1);
    resetAutoSlide(); // reset timer on manual click
  });

  next.addEventListener("click", ()=>{
    go(idx + 1);
    resetAutoSlide(); // reset timer on manual click
  });

  go(0);

  // ================================
  // Auto-slide
  // ================================
  function startAutoSlide(){
    autoSlideInterval = setInterval(()=>{
      go(idx + 1);
    }, 5000); // change slide every 5 seconds
  }

  function resetAutoSlide(){
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();

})();


let hallmarksST = null;

document.addEventListener("DOMContentLoaded", () => {
  initHallmarksPinScroll();

  // after images/fonts/layout are stable
  window.addEventListener("load", () => {
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh(true);
      ScrollTrigger.update();
    }
  });
});

function initHallmarksPinScroll() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const wrap = document.getElementById("hallmarksPinWrap");
  const pinTarget = document.getElementById("hallmarksSection");
  const track = document.getElementById("hallmarksTrack");
  const knob = document.getElementById("hallmarksKnob");
  const bar = document.getElementById("hallmarksBar");

  if (!wrap || !pinTarget || !track || !knob || !bar) return;

  const items = Array.from(track.querySelectorAll(".hallmarksItem"));
  const total = items.length;

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function getStepWidth() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const w = items[0].getBoundingClientRect().width;
    return w + gap;
  }

  function setIndex(idx) {
    idx = clamp(idx, 0, total - 1);

    const step = getStepWidth();
    const moveX = -(idx * step);

    track.style.transform = `translate3d(${moveX}px,0,0)`;
    items.forEach((el, i) => el.classList.toggle("isActive", i === idx));

    const snapped = total === 1 ? 0 : idx / (total - 1);
    knob.style.left = `${6 + snapped * 88}%`;
  }

  // kill only previous instance
  if (hallmarksST) {
    hallmarksST.kill(true);
    hallmarksST = null;
  }

  // reset UI first
  setIndex(0);

  hallmarksST = ScrollTrigger.create({
    id: "hallmarks-pin",
    trigger: wrap,
    pin: pinTarget,
    start: "top -45%",
    end: () => "+=" + (total * 220),
    scrub: 1,
    pinSpacing: true,
    invalidateOnRefresh: true,
    anticipatePin: 1,

    onUpdate(self) {
      const idx = Math.round(self.progress * (total - 1));
      setIndex(idx);
    },

    // 🔥 THIS fixes reload-below + empty-space bug
    onRefresh(self) {
      self.update();
      const idx = Math.round(self.progress * (total - 1));
      setIndex(idx);
    }
  });

  // force correct progress after page restores scroll position
  requestAnimationFrame(() => {
    ScrollTrigger.refresh(true);
    ScrollTrigger.update();
  });
}



document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  const openBtn = document.querySelector(".navMenu");
  const drawer = document.querySelector("#mobileNav");
  const closeBtn = drawer?.querySelector(".navClose");
  const overlay = document.querySelector(".navOverlay");

  if (!openBtn || !drawer || !overlay || !closeBtn) {
    console.warn("Navbar elements missing");
    return;
  }

  let isOpen = false;

  function openNav() {
    if (isOpen) return;
    isOpen = true;

    body.classList.add("navOpen");
    openBtn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");

    closeBtn.focus({ preventScroll: true });
  }

  function closeNav() {
    if (!isOpen) return;
    isOpen = false;

    body.classList.remove("navOpen");
    openBtn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");

    openBtn.focus({ preventScroll: true });
  }

  // OPEN button (mouse + touch)
  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openNav();
  });

  // CLOSE button (mouse + touch)
  closeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNav();
  });

  // CLICK OUTSIDE (overlay)
  overlay.addEventListener("click", (e) => {
    e.preventDefault();
    closeNav();
  });

  // ESC close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && body.classList.contains("navOpen")) {
      closeNav();
    }
  });

  // Close when clicking any link inside drawer
  drawer.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    closeNav();
  });

   /* ================================
     Swipe to close (works everywhere)
     Swipe RIGHT to close
     ================================ */

     let startX = 0;
  let startY = 0;
  let swiping = false;

  document.addEventListener("touchstart", (e) => {
    if (!body.classList.contains("navOpen")) return;

    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    swiping = true;
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!swiping || !body.classList.contains("navOpen")) return;

    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // if horizontal swipe, block scroll
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("touchend", (e) => {
    if (!swiping || !body.classList.contains("navOpen")) return;
    swiping = false;

    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // swipe RIGHT threshold to close
    if (Math.abs(dx) > Math.abs(dy) && dx > 60) {
      closeNav();
    }
  }, { passive: true });
});

document.querySelectorAll(".navLinks a.navLink").forEach(link => {
  link.addEventListener("click", (e) => {
    const hash = link.getAttribute("href");
    if (!hash || !hash.startsWith("#")) return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();

    // smooth scroll
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    // remove hash from URL (without reload)
    history.replaceState(null, "", window.location.pathname + window.location.search);
  });
});

window.addEventListener("scroll", () => {
  const nav = document.querySelector(".nav");
  if (!nav) return;

  if (window.scrollY > 10) nav.classList.add("scrolled");
  else nav.classList.remove("scrolled");
});