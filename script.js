const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Duplicate marquee text so the loop is seamless
document.querySelectorAll(".track").forEach(t => (t.innerHTML += t.innerHTML + t.innerHTML + t.innerHTML));

// Mobile menu
const nav = document.querySelector(".nav nav");
const menu = document.querySelector(".menu");
menu.addEventListener("click", () => menu.setAttribute("aria-expanded", nav.classList.toggle("open")));
nav.addEventListener("click", e => { if (e.target.closest("a")) nav.classList.remove("open"); });

// Count-up numbers
const counters = document.querySelectorAll("[data-count]");
if (!reduce) counters.forEach(c => (c.textContent = "0"));
function countUp(el) {
  if (reduce) return;
  const end = +el.dataset.count;
  let t0;
  const step = t => {
    t0 ??= t;
    const p = Math.min((t - t0) / 1400, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString("en-IN");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    e.target.querySelectorAll("[data-count]").forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Highlight current section in the nav
const links = [...document.querySelectorAll(".nav nav a")];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.hash === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("section[id]").forEach(s => spy.observe(s));

// ID card tilts toward the pointer
const art = document.querySelector(".art");
const card = document.querySelector(".idcard");
if (!reduce) {
  art.addEventListener("pointermove", e => {
    const r = art.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `rotate(3deg) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
  });
  art.addEventListener("pointerleave", () => (card.style.transform = ""));
}

// Draggable interest chips
const pg = document.querySelector(".playground");
function layoutChips() {
  const chips = [...pg.children];
  const pos = chips.map(c => [c.offsetLeft, c.offsetTop]);
  chips.forEach((c, i) => {
    c.style.left = pos[i][0] + "px";
    c.style.top = pos[i][1] + "px";
    c.style.transform = `rotate(${(i % 5 - 2) * 3}deg)`;
  });
  pg.classList.add("ready");
}
document.fonts.ready.then(layoutChips);
let drag = null;
pg.addEventListener("pointerdown", e => {
  const c = e.target.closest(".dchip");
  if (!c || !pg.classList.contains("ready")) return;
  drag = { c, dx: e.clientX - c.offsetLeft, dy: e.clientY - c.offsetTop };
  c.setPointerCapture(e.pointerId);
  c.classList.add("grab");
});
pg.addEventListener("pointermove", e => {
  if (!drag) return;
  const { c } = drag;
  c.style.left = Math.max(0, Math.min(pg.clientWidth - c.offsetWidth, e.clientX - drag.dx)) + "px";
  c.style.top = Math.max(0, Math.min(pg.clientHeight - c.offsetHeight, e.clientY - drag.dy)) + "px";
});
["pointerup", "pointercancel"].forEach(t => pg.addEventListener(t, () => {
  if (drag) drag.c.classList.remove("grab");
  drag = null;
}));

// Copy email button
const toast = document.getElementById("toast");
document.querySelector(".copy").addEventListener("click", async e => {
  try {
    await navigator.clipboard.writeText(e.currentTarget.dataset.copy);
    toast.textContent = "Email copied";
  } catch {
    toast.textContent = "Press and hold the email to copy it";
  }
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1800);
});
