(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  const pubList = document.getElementById("pub-list");
  const pubToggle = document.getElementById("pub-toggle");
  if (pubList && pubToggle) {
    pubToggle.addEventListener("click", () => {
      const expanded = pubList.classList.toggle("is-expanded");
      pubToggle.setAttribute("aria-expanded", String(expanded));
      pubToggle.textContent = expanded
        ? "Show fewer publications"
        : "Show all publications";
    });
  }

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero content should appear immediately in the first viewport
  document.querySelectorAll(".hero .reveal").forEach((el) => {
    el.classList.add("is-visible");
  });

  if (!prefersReduced) {
    const reveals = document.querySelectorAll(".reveal:not(.is-visible)");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }

  initMapCanvas(prefersReduced);
})();

function initMapCanvas(reducedMotion) {
  const canvas = document.getElementById("map-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let points = [];
  let raf = 0;
  let t = 0;

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedPoints();
  };

  const seedPoints = () => {
    const count = Math.max(28, Math.floor((width * height) / 38000));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: 1.2 + Math.random() * 1.6,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    // Soft horizon wash
    const wash = ctx.createLinearGradient(0, 0, 0, height * 0.7);
    wash.addColorStop(0, "rgba(150, 205, 235, 0.42)");
    wash.addColorStop(0.55, "rgba(183, 214, 236, 0.18)");
    wash.addColorStop(1, "rgba(183, 214, 236, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height * 0.7);

    const maxDist = Math.min(160, width * 0.18);

    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      if (!reducedMotion) {
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > width) a.vx *= -1;
        if (a.y < 0 || a.y > height) a.vy *= -1;
      }

      for (let j = i + 1; j < points.length; j += 1) {
        const b = points[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.38;
          ctx.strokeStyle = `rgba(26, 115, 184, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "rgba(18, 90, 150, 0.55)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Slow drifting scan arc (motion #2)
    if (!reducedMotion) {
      t += 0.004;
      const cx = width * (0.55 + Math.sin(t * 0.7) * 0.08);
      const cy = height * (0.28 + Math.cos(t * 0.5) * 0.05);
      const radius = Math.min(width, height) * 0.22;
      ctx.strokeStyle = "rgba(110, 182, 224, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, t, t + Math.PI * 1.2);
      ctx.stroke();
    }

    if (!reducedMotion) {
      raf = requestAnimationFrame(draw);
    }
  };

  resize();
  draw();

  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  });
}
