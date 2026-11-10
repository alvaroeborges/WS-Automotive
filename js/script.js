/* =========================================================
   WS AUTOMOTIVE — Interações
   ========================================================= */

const WHATSAPP_NUMBER = "5534992833232";

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileMenu();
  initReveal();
  initCounters();
  initActiveLinks();
  initTiltCard();
  initServiceCards();
  initBookingForm();
  initOpenStatus();
  initToTop();

  document.getElementById("year").textContent = new Date().getFullYear();
});

/* ---------- Header muda ao rolar ---------- */
function initHeader() {
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Menu mobile ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  const backdrop = document.getElementById("navBackdrop");

  const setOpen = (open) => {
    nav.classList.toggle("is-open", open);
    backdrop.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => setOpen(!nav.classList.contains("is-open")));
  backdrop.addEventListener("click", () => setOpen(false));
  window.matchMedia("(min-width: 921px)").addEventListener("change", (e) => e.matches && setOpen(false));
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

/* ---------- Animação de entrada ---------- */
function initReveal() {
  const items = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  // Escalona elementos irmãos para um efeito em cascata
  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    el.style.transitionDelay = `${Math.min(index, 6) * 80}ms`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------- Contadores animados ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- Link ativo no menu conforme a seção ---------- */
function initActiveLinks() {
  const links = document.querySelectorAll(".nav__link");
  const sections = [...links]
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ---------- Efeito 3D no card do hero ---------- */
function initTiltCard() {
  const card = document.getElementById("tiltCard");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!card || !canHover || reduceMotion) return;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    card.style.transform = `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg)`;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

/* ---------- Cards de serviço: brilho que segue o mouse + atalho p/ agendar ---------- */
function initServiceCards() {
  const cards = document.querySelectorAll(".service-card[data-service]");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });

    const button = card.querySelector(".service-card__link");
    button.addEventListener("click", () => {
      const service = card.dataset.service;
      const chip = document.querySelector(`#chips input[value="${service}"]`);
      if (chip) chip.checked = true;
      document.getElementById("agendar").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => document.getElementById("fNome").focus({ preventScroll: true }), 700);
    });
  });
}

/* ---------- Horário de funcionamento ---------- */
// Dia da semana (0 = domingo) -> [abre, fecha] em horas (18.5 = 18h30)
const OPENING_HOURS = { 1: [8, 18], 2: [8, 18.5], 3: [8, 18], 4: [8, 18], 5: [8, 18], 6: [8, 12.5] };

// 18.5 -> "18h30", 18 -> "18h"
const formatHour = (h) => `${Math.floor(h)}h${h % 1 ? String(Math.round((h % 1) * 60)).padStart(2, "0") : ""}`;

// Hora atual em Prata/MG, independente do fuso de quem acessa
function nowInBrazil() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, hours: Number(get("hour")) + Number(get("minute")) / 60 };
}

function initOpenStatus() {
  const el = document.getElementById("openStatus");
  if (!el) return;

  const update = () => {
    const { day, hours } = nowInBrazil();
    const today = OPENING_HOURS[day];
    const open = Boolean(today) && hours >= today[0] && hours < today[1];
    el.classList.toggle("is-open", open);
    el.textContent = open ? `Aberto agora · fecha às ${formatHour(today[1])}` : "Fechado agora";
    el.hidden = false;
  };

  update();
  setInterval(update, 60000);
}

/* ---------- Formulário de agendamento -> WhatsApp ---------- */
function initBookingForm() {
  const form = document.getElementById("bookingForm");
  const nome = document.getElementById("fNome");
  const veiculo = document.getElementById("fVeiculo");
  const obs = document.getElementById("fObs");
  const data = document.getElementById("fData");
  const periodo = document.getElementById("fPeriodo");
  const error = document.getElementById("formError");

  // Não permite escolher datas passadas
  const today = new Date();
  data.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const showError = (message) => {
    error.textContent = message;
    error.hidden = false;
  };

  [nome, veiculo, data, periodo].forEach((input) =>
    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      error.hidden = true;
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const servicos = [...form.querySelectorAll("#chips input:checked")].map((i) => i.value);
    const missing = [];

    if (!nome.value.trim()) { nome.classList.add("is-invalid"); missing.push("seu nome"); }
    if (!veiculo.value.trim()) { veiculo.classList.add("is-invalid"); missing.push("o veículo"); }
    if (!servicos.length) missing.push("pelo menos um serviço");

    if (missing.length) {
      showError(`Por favor, informe ${missing.join(", ")}.`);
      return;
    }

    let dataTexto = "";
    if (data.value) {
      const [y, m, d] = data.value.split("-").map(Number);
      const chosen = new Date(y, m - 1, d);
      const weekday = chosen.getDay();

      if (data.value < data.min) {
        data.classList.add("is-invalid");
        showError("Escolha uma data a partir de hoje.");
        return;
      }
      if (!OPENING_HOURS[weekday]) {
        data.classList.add("is-invalid");
        showError("Aos domingos a oficina fica fechada. Escolha outro dia.");
        return;
      }
      if (weekday === 6 && periodo.value === "Tarde") {
        periodo.classList.add("is-invalid");
        showError("Aos sábados atendemos só pela manhã (8h às 12h30).");
        return;
      }
      const nomeDia = chosen.toLocaleDateString("pt-BR", { weekday: "long" });
      dataTexto = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y} (${nomeDia})`;
    }

    let message =
      `Olá, WS Automotive! Gostaria de agendar um serviço.\n\n` +
      `*Nome:* ${nome.value.trim()}\n` +
      `*Veículo:* ${veiculo.value.trim()}\n` +
      `*Serviços:* ${servicos.join(", ")}`;

    if (dataTexto) message += `\n*Dia preferido:* ${dataTexto}`;
    if (periodo.value) message += `\n*Período:* ${periodo.value}`;
    if (obs.value.trim()) message += `\n*Observações:* ${obs.value.trim()}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener");
  });
}

/* ---------- Botão voltar ao topo ---------- */
function initToTop() {
  const button = document.getElementById("toTop");
  const onScroll = () => button.classList.toggle("is-visible", window.scrollY > 700);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}
