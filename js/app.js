/* ==========================================================
   Energía-Smart · Prototipo de alta fidelidad
   SPA sin dependencias: rutas por hash, estado en memoria.
   ========================================================== */

const TARIFA_KWH = 849; // COP por kWh, tarifa comercial de referencia EPM

const ROUTES = [
  { id: "bienvenida", label: "Bienvenida" },
  { id: "ingreso", label: "Inicio de sesión" },
  { id: "negocio", label: "Configura tu negocio" },
  { id: "conexion", label: "Conecta tu kit" },
  { id: "inicio", label: "Tablero en tiempo real", tab: true },
  { id: "alerta", label: "Alerta de consumo anómalo" },
  { id: "equipos", label: "Consumo por equipo", tab: true },
  { id: "ahorro", label: "Recomendaciones de ahorro", tab: true },
  { id: "reporte", label: "Reporte mensual", tab: true },
  { id: "planes", label: "Planes y pago" },
  { id: "confirmacion", label: "Confirmación" },
];

const TABS = [
  { id: "inicio", label: "Inicio", icon: "house" },
  { id: "equipos", label: "Equipos", icon: "plug-zap" },
  { id: "ahorro", label: "Ahorro", icon: "piggy-bank" },
  { id: "reporte", label: "Reportes", icon: "chart-column" },
];

const ONBOARDING = [
  {
    title: "Mira tu consumo en pesos, no en kWh",
    text: "Energía-Smart te muestra en tiempo real cuánto gasta tu negocio y qué equipos lo están gastando.",
  },
  {
    title: "Te avisamos cuando algo se queda encendido",
    text: "Detectamos equipos prendidos después del cierre o que consumen más de lo normal, y te decimos qué hacer.",
  },
  {
    title: "Ahorra hasta un 25% en tu factura",
    text: "Recibe recomendaciones prácticas y mide tu ahorro mes a mes, sin comprar equipos costosos.",
  },
];

// Consumo por hora de hoy (kW promedio). 22 h y 23 h: aire acondicionado encendido tras el cierre.
const HOURLY = [1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.6, 2.4, 2.8, 2.9, 3.2, 3.9, 4.6, 4.4, 3.4, 2.6, 2.3, 2.6, 3.3, 3.7, 3.5, 2.6, 3.6, 3.5];

const MONTHS = [
  { m: "May", kwh: 2190 }, { m: "Jun", kwh: 2170 }, { m: "Jul", kwh: 2210 },
  { m: "Ago", kwh: 2160 }, { m: "Sep", kwh: 2180 }, { m: "Oct", kwh: 1700, now: true },
];

const MONTH_KWH = 1700;
const BASE_BILL = 1850000;
const MONTH_BILL = MONTH_KWH * TARIFA_KWH; // ≈ $1.443.000
const SAVED = BASE_BILL - MONTH_BILL;
const GOAL = BASE_BILL * 0.25;

const EQUIPOS = [
  { id: "nevera", name: "Nevera industrial", icon: "refrigerator", pct: 32, hours: "24 horas", link: "Sensor de pinza",
    tip: "Consume 18% más que el mes pasado. Suele ser el empaque de la puerta, que ya no cierra bien.", reco: "nevera" },
  { id: "ac", name: "Aire acondicionado salón", icon: "air-vent", pct: 24, hours: "11:00 a. m. – 10:00 p. m.", link: "Enchufe inteligente 1",
    tip: "Esta semana quedó encendido después del cierre tres noches.", reco: "ac" },
  { id: "horno", name: "Horno de convección", icon: "flame", pct: 18, hours: "6:30 a. m. – 9:00 p. m.", link: "Enchufe inteligente 2",
    tip: "Se enciende 90 minutos antes de abrir. Con 30 minutos es suficiente.", reco: "horno" },
  { id: "luces", name: "Iluminación", icon: "lightbulb", pct: 11, hours: "6:00 a. m. – 10:30 p. m.", link: "Sensor de pinza",
    tip: "12 bombillos del salón aún no son LED.", reco: "luces" },
  { id: "freidora", name: "Freidora eléctrica", icon: "cooking-pot", pct: 8, hours: "11:00 a. m. – 9:00 p. m.", link: "Sensor de pinza",
    tip: "Funciona dentro de lo normal para un restaurante de tu tamaño." },
  { id: "pos", name: "Computadores y caja", icon: "monitor", pct: 4, hours: "7:00 a. m. – 10:00 p. m.", link: "Sensor de pinza",
    tip: "Funciona dentro de lo normal. Apágalos al cerrar para evitar consumo fantasma." },
  { id: "otros", name: "Otros equipos", icon: "plug", pct: 3, hours: "Variable", link: "Sensor de pinza",
    tip: "Licuadoras, cafetera y cargadores. Sin novedades este mes." },
];

const RECOS = [
  { id: "ac", title: "Programa el apagado del aire acondicionado a las 10:15 p. m.",
    text: "Esta semana quedó encendido después del cierre tres noches.", save: 110000,
    tag: ["chip--teal", "Fácil · 1 toque"], cta: "Programar", done: "Programado" },
  { id: "nevera", title: "Revisa el empaque de la nevera industrial",
    text: "Consume 18% más que el mes pasado; casi siempre es la puerta que no sella bien.", save: 68000,
    tag: ["chip--warn", "Requiere técnico"], cta: "Agendar revisión", done: "Revisión solicitada" },
  { id: "horno", title: "Enciende el horno 30 minutos antes de abrir, no 90",
    text: "Precalentar más tiempo no mejora la cocción y sí gasta energía.", save: 54000,
    tag: ["chip--teal", "Hábito"], cta: "Marcar como aplicada", done: "Aplicada" },
  { id: "luces", title: "Cambia 12 bombillos del salón a LED",
    text: "Recuperas la inversión en unos 4 meses con nuestros aliados en Medellín.", save: 38000,
    tag: ["chip--good", "Inversión baja"], cta: "Ver aliados", done: "Cotizaciones enviadas" },
];

const PLANS = {
  pyme: { name: "Plan PyME", price: 100000, desc: "Para un local o sede",
    items: ["Monitoreo en tiempo real 24/7", "Alertas por app y WhatsApp", "Recomendaciones de ahorro", "Reporte mensual en PDF"] },
  plus: { name: "Plan PyME Plus", price: 180000, desc: "Para varias sedes o más equipos",
    items: ["Todo lo del Plan PyME", "Hasta 3 sedes en una cuenta", "Hasta 6 enchufes inteligentes", "Reporte de huella de carbono"] },
};

const initialState = () => ({
  onb: 0,
  loginError: null,
  kit: "idle", // idle | searching | found
  alert: "pending", // pending | off | ignored
  scheduled: false,
  recos: {},
  thumbs: {},
  unit: "cop",
  plan: "pyme",
  pay: null,
  payError: false,
  paying: false,
  business: { name: "Restaurante El Portal", type: "Restaurante", city: "Medellín", open: "07:00", close: "22:00", bill: "1.850.000" },
});

let state = initialState();

/* ---------- Utilidades ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const icon = (name, cls = "") => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ""}></i>`;
const cop = (n) => "$" + Math.round(n).toLocaleString("es-CO");
const roundTo = (n, step) => Math.round(n / step) * step;
const kwh = (n) => n.toLocaleString("es-CO", { maximumFractionDigits: 1 });

function go(id) {
  if (location.hash === `#/${id}`) render();
  else location.hash = `#/${id}`;
}

function currentRoute() {
  const id = location.hash.replace("#/", "");
  return ROUTES.find((r) => r.id === id) || ROUTES[0];
}

let toastTimer;
function toast(title, text = "", iconName = "circle-check") {
  const el = $("#toast");
  el.innerHTML = `${icon(iconName)}<div><strong>${title}</strong>${text}</div>`;
  el.hidden = false;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
  lucide.createIcons();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 4200);
}

function openSheet(html) {
  $("#sheet").innerHTML = `<div class="sheet__grab"></div>${html}`;
  $("#sheet").hidden = false;
  $("#sheet-backdrop").hidden = false;
  lucide.createIcons();
}
function closeSheet() {
  $("#sheet").hidden = true;
  $("#sheet-backdrop").hidden = true;
}

function topbar(title, back) {
  return `<header class="topbar">
    ${back ? `<button class="icon-btn" data-go="${back}" aria-label="Volver">${icon("arrow-left")}</button>` : ""}
    <h1>${title}</h1>
  </header>`;
}

function field({ id, label, type = "text", value = "", placeholder = "", error = "", hint = "", prefix = "", attrs = "" }) {
  return `<div class="field" data-field="${id}">
    <label for="${id}">${label}</label>
    <div class="input-wrap">
      ${prefix ? `<span class="prefix">${prefix}</span>` : ""}
      <input id="${id}" name="${id}" type="${type}" value="${value}" placeholder="${placeholder}" ${attrs}>
    </div>
    <div class="field__error">${icon("circle-alert")}<span>${error}</span></div>
    ${hint ? `<div class="field__hint">${hint}</div>` : ""}
  </div>`;
}

function setError(form, id, message) {
  const f = form.querySelector(`[data-field="${id}"]`);
  f.classList.toggle("is-error", !!message);
  if (message) f.querySelector(".field__error span").textContent = message;
}

/* ---------- Gráficos ---------- */
function hourlyChart() {
  const W = 310, H = 140, B = 20, T = 8;
  const max = 5;
  const x = (i) => (i / 23) * W;
  const y = (v) => H - B - (v / max) * (H - B - T);
  const pts = HOURLY.map((v, i) => [x(i), y(v)]);
  const line = (arr) => arr.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const normal = pts.slice(0, 23);
  const anomaly = pts.slice(21);
  const area = `${line(normal)} L${x(22)},${H - B} L0,${H - B} Z`;
  const anomalyColor = state.alert === "pending" ? "var(--coral-500)" : "var(--ink-400)";
  const labels = [[0, "0 h"], [6, "6 h"], [12, "12 h"], [18, "18 h"], [23, "23 h"]];
  return `<svg class="chart" viewBox="-4 0 ${W + 8} ${H}" role="img" aria-label="Consumo por hora de hoy; pico al mediodía y consumo anómalo después de las 10 p. m.">
    <defs><linearGradient id="g-area" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#0F766E" stop-opacity=".22"/><stop offset="1" stop-color="#0F766E" stop-opacity="0"/>
    </linearGradient></defs>
    <rect x="0" y="${T}" width="${x(7)}" height="${H - B - T}" fill="#E8F5F1"/>
    <rect x="${x(22)}" y="${T}" width="${x(23) - x(22) + 4}" height="${H - B - T}" fill="#E8F5F1"/>
    <line x1="0" x2="${W}" y1="${H - B}" y2="${H - B}" stroke="#DCE7E4"/>
    <path d="${area}" fill="url(#g-area)"/>
    <path d="${line(normal)}" fill="none" stroke="var(--teal-700)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="${line(anomaly.slice(1))}" fill="none" stroke="${anomalyColor}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="${pts[23][0]}" cy="${pts[23][1]}" r="4.5" fill="${anomalyColor}" stroke="#fff" stroke-width="2"/>
    ${labels.map(([i, t]) => `<text x="${x(i)}" y="${H - 5}" text-anchor="${i === 0 ? "start" : i === 23 ? "end" : "middle"}">${t}</text>`).join("")}
  </svg>`;
}

function monthsChart() {
  const W = 310, H = 150, B = 22, T = 18;
  const max = 2400;
  const bw = 32, gap = (W - bw * MONTHS.length) / (MONTHS.length - 1);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Consumo mensual: alrededor de 2.180 kWh antes de Energía-Smart y 1.700 kWh en octubre.">
    <line x1="0" x2="${W}" y1="${H - B}" y2="${H - B}" stroke="#DCE7E4"/>
    ${MONTHS.map((d, i) => {
      const h = (d.kwh / max) * (H - B - T);
      const bx = i * (bw + gap);
      return `<rect x="${bx}" y="${H - B - h}" width="${bw}" height="${h}" rx="7" fill="${d.now ? "var(--teal-700)" : "#C9D6D3"}"/>
        <text x="${bx + bw / 2}" y="${H - B - h - 5}" text-anchor="middle" style="font-weight:600;fill:${d.now ? "var(--teal-900)" : "var(--ink-400)"}">${kwh(d.kwh)}</text>
        <text x="${bx + bw / 2}" y="${H - 6}" text-anchor="middle">${d.m}</text>`;
    }).join("")}
  </svg>`;
}

/* ---------- Pantallas ---------- */
const VIEWS = {};

VIEWS.bienvenida = () => {
  const s = ONBOARDING[state.onb];
  const last = state.onb === ONBOARDING.length - 1;
  const art = [
    `<div class="card">
      <div class="row between"><span class="small muted">Consumo de hoy</span><span class="chip chip--good">${icon("trending-down")}22%</span></div>
      <div class="num" style="font-size:30px;margin-top:6px">${cop(47900)}</div>
      ${hourlyChart()}
    </div>`,
    `<div class="alert-card">
      <div class="eyebrow">${icon("triangle-alert")}Consumo anómalo</div>
      <p style="margin:8px 0 12px;font-weight:600">Aire acondicionado del salón encendido después del cierre.</p>
      <div class="row"><span class="btn btn--sm btn--light">Apagar</span><span class="btn btn--sm btn--outline-light">Ver detalle</span></div>
    </div>`,
    `<div class="card">
      <span class="small muted">Ahorro de octubre</span>
      <div class="num" style="font-size:30px;margin:6px 0 2px;color:var(--green-600)">${cop(roundTo(SAVED, 1000))}</div>
      <span class="small muted">frente a tu factura anterior</span>
      <div class="bar" style="height:10px;margin-top:14px"><span style="width:88%"></span></div>
      <div class="row between tiny muted" style="margin-top:6px"><span>Meta: 25%</span><span>Vas en 22%</span></div>
    </div>`,
  ][state.onb];
  return `<section class="view onb">
    <button class="btn btn--ghost onb__skip" data-go="ingreso">Saltar</button>
    <div class="onb__art"><div class="onb__blob"></div>${art}</div>
    <div>
      <h1 class="title-xl">${s.title}</h1>
      <p class="muted" style="margin-top:10px;font-size:16px">${s.text}</p>
      <div class="dots">${ONBOARDING.map((_, i) => `<span class="${i === state.onb ? "on" : ""}"></span>`).join("")}</div>
      ${last
        ? `<button class="btn btn--primary btn--block" data-go="ingreso">Empezar ahora ${icon("arrow-right")}</button>`
        : `<button class="btn btn--primary btn--block" data-action="onb-next">Siguiente ${icon("arrow-right")}</button>`}
    </div>
  </section>`;
};

VIEWS.ingreso = () => `<section class="view">
  <img class="auth-logo" src="assets/logo.svg" alt="Energía-Smart">
  <h1 class="title-xl">Bienvenido de nuevo</h1>
  <p class="muted" style="margin:8px 0 22px">Ingresa para ver cómo va el consumo de tu negocio hoy.</p>
  <form class="stack" data-form="login" novalidate>
    ${state.loginError ? `<div class="form-alert">${icon("circle-alert")}<span>${state.loginError}</span></div>` : ""}
    ${field({ id: "email", label: "Correo electrónico", type: "email", value: "admin@elportal.com.co", placeholder: "nombre@tunegocio.com", attrs: 'autocomplete="email"' })}
    ${field({ id: "password", label: "Contraseña", type: "password", value: "ElPortal2026", placeholder: "Mínimo 8 caracteres", attrs: 'autocomplete="current-password"' })}
    <div class="row between">
      <span class="tiny muted">Cuenta de demostración precargada</span>
      <button type="button" class="link" data-action="forgot">¿Olvidaste tu contraseña?</button>
    </div>
    <button class="btn btn--primary btn--block" type="submit">Ingresar</button>
  </form>
  <div class="divider" style="margin:20px 0">o</div>
  <button class="btn btn--secondary btn--block" data-action="google">${icon("mail")} Continuar con Google</button>
  <div class="spacer"></div>
  <p class="small muted" style="text-align:center;margin-top:20px">¿Aún no tienes cuenta? <button class="link" data-go="negocio">Crea una gratis</button></p>
</section>`;

VIEWS.negocio = () => {
  const b = state.business;
  const types = [["Restaurante", "utensils"], ["Minimercado", "shopping-basket"], ["Panadería", "croissant"], ["Taller", "scissors"], ["Oficina", "briefcase"]];
  return `<section class="view">
    ${topbar("Configura tu negocio", "ingreso")}
    <div class="steps-bar"><span class="on"></span><span></span></div>
    <p class="small muted" style="margin-bottom:18px">Paso 1 de 2 · Con estos datos calculamos tu ahorro real.</p>
    <form class="stack" data-form="negocio" novalidate>
      ${field({ id: "name", label: "Nombre del negocio", value: b.name, placeholder: "Ej: Panadería La Espiga", error: "Cuéntanos cómo se llama tu negocio." })}
      <div class="field">
        <label>Tipo de negocio</label>
        <div class="choice-grid">${types.map(([t, ic]) => `<button type="button" class="choice" data-action="type" data-value="${t}" aria-pressed="${b.type === t}">${icon(ic)}${t}</button>`).join("")}</div>
      </div>
      <div class="field">
        <label for="city">Municipio</label>
        <select id="city" name="city">${["Medellín", "Envigado", "Itagüí", "Bello", "Sabaneta", "Rionegro"].map((c) => `<option${c === b.city ? " selected" : ""}>${c}</option>`).join("")}</select>
      </div>
      <div class="two-cols">
        ${field({ id: "open", label: "Abre a las", type: "time", value: b.open })}
        ${field({ id: "close", label: "Cierra a las", type: "time", value: b.close })}
      </div>
      ${field({ id: "bill", label: "Valor de tu última factura de energía", value: b.bill, prefix: "$", placeholder: "1.200.000", error: "Escribe el valor aproximado; lo usamos para medir cuánto ahorras.", hint: "Lo encuentras en tu factura de EPM como “Total a pagar”.", attrs: 'inputmode="numeric" data-money' })}
      <div class="sticky-cta"><button class="btn btn--primary btn--block" type="submit">Continuar ${icon("arrow-right")}</button></div>
    </form>
  </section>`;
};

VIEWS.conexion = () => {
  const k = state.kit;
  const options = EQUIPOS.slice(0, 4).map((e) => e.name);
  const select = (sel) => `<select aria-label="Equipo conectado">${options.map((o) => `<option${o === sel ? " selected" : ""}>${o}</option>`).join("")}</select>`;
  return `<section class="view">
    ${topbar("Conecta tu kit", "negocio")}
    <div class="steps-bar"><span class="on"></span><span class="on"></span></div>
    <div class="kit-art ${k === "searching" ? "is-searching" : ""}">
      <span class="pulse"></span><span class="pulse d2"></span>
      ${icon(k === "found" ? "circle-check" : "radio-tower", "big")}
    </div>
    ${k === "found" ? `
      <h2 class="title-lg" style="margin:20px 0 6px">¡Encontramos tu kit!</h2>
      <p class="muted small" style="margin-bottom:16px">Revisa que cada enchufe tenga el equipo correcto. Puedes cambiarlo cuando quieras.</p>
      <div class="card">
        <div class="device-item"><div class="dev-icon dev-icon--good">${icon("activity")}</div><div class="spacer"><strong>Sensor de pinza</strong><div class="tiny muted">Tablero principal · Señal excelente</div></div><span class="chip chip--good">${icon("check")}Listo</span></div>
        <div class="device-item"><div class="dev-icon">${icon("plug-zap")}</div><div class="spacer"><strong>Enchufe 1</strong><div class="tiny muted">Señal buena</div></div>${select("Aire acondicionado salón")}</div>
        <div class="device-item"><div class="dev-icon">${icon("plug-zap")}</div><div class="spacer"><strong>Enchufe 2</strong><div class="tiny muted">Señal buena</div></div>${select("Horno de convección")}</div>
      </div>
      <div class="spacer"></div>
      <div class="sticky-cta"><button class="btn btn--primary btn--block" data-action="kit-finish">Terminar y ver mi tablero</button></div>
    ` : `
      <h2 class="title-lg" style="margin:20px 0 6px">${k === "searching" ? "Buscando tu kit…" : "Vincula tu sensor y enchufes"}</h2>
      <p class="muted small" style="margin-bottom:18px">${k === "searching" ? "Esto tarda unos segundos. Mantén el celular cerca del tablero eléctrico." : "Nuestro técnico ya instaló el kit durante la auditoría. Solo falta vincularlo a tu cuenta."}</p>
      <ol class="howto">
        <li>Conecta tu celular al Wi-Fi del negocio.</li>
        <li>Verifica que la luz del sensor de pinza esté en verde.</li>
        <li>Toca “Buscar mi kit” y asigna cada enchufe a su equipo.</li>
      </ol>
      <div class="spacer"></div>
      <div class="sticky-cta">
        <button class="btn btn--primary btn--block" data-action="kit-search" ${k === "searching" ? "disabled" : ""}>
          ${k === "searching" ? `${icon("loader-circle", "spin")} Buscando…` : `${icon("search")} Buscar mi kit`}
        </button>
      </div>
    `}
  </section>`;
};

VIEWS.inicio = () => {
  const alertBlock = state.alert === "pending"
    ? `<div class="alert-card">
        <div class="eyebrow">${icon("triangle-alert")}Consumo anómalo · 11:40 p. m.</div>
        <p style="margin:8px 0 14px;font-weight:600;font-size:15px">El aire acondicionado del salón sigue encendido y el local cerró a las 10:00 p. m.</p>
        <div class="row">
          <button class="btn btn--sm btn--light" data-action="ac-off">${icon("power")}Apagar</button>
          <button class="btn btn--sm btn--outline-light" data-go="alerta">Ver detalle</button>
        </div>
      </div>`
    : `<div class="ok-card">${icon(state.alert === "off" ? "circle-check" : "info")}<span>${state.alert === "off"
        ? `<strong>Todo en orden.</strong> Apagamos el aire acondicionado a las 11:43 p. m.${state.scheduled ? " Desde mañana se apagará solo." : ""}`
        : "<strong>Alerta ignorada por esta noche.</strong> Te volveremos a avisar si se repite mañana."}</span></div>`;
  return `<section class="view">
    <header class="hello">
      <div class="hello__avatar">EP</div>
      <div class="spacer"><div class="tiny muted">Jueves, 29 de octubre</div><h1 class="title-lg">¡Hola, El Portal!</h1></div>
      <button class="icon-btn" data-go="alerta" aria-label="Notificaciones">${icon("bell")}${state.alert === "pending" ? '<span class="badge-dot"></span>' : ""}</button>
    </header>
    <div class="stack">
      <div class="card">
        <div class="row between"><span class="small muted">Consumo de hoy</span><span class="chip chip--good">${icon("trending-down")}22% vs. tu promedio</span></div>
        <div style="margin-top:8px"><span class="num kpi-big">56,4</span><span class="kpi-unit">kWh</span></div>
        <div class="small muted" style="margin-top:4px">${cop(47900)} gastados hasta ahora</div>
        ${hourlyChart()}
        <div class="legend"><span><i style="background:var(--teal-700)"></i>Hoy</span><span><i style="background:var(--mint-100);border:1px solid var(--line)"></i>Local cerrado</span>${state.alert === "pending" ? '<span><i style="background:var(--coral-500)"></i>Fuera de horario</span>' : ""}</div>
      </div>
      ${alertBlock}
      <div class="mini-kpis">
        <div class="card"><span class="tiny muted">Factura proyectada</span><span class="num">${cop(roundTo(MONTH_BILL, 1000))}</span><span class="tiny muted">Antes: <span class="strike">${cop(BASE_BILL)}</span></span></div>
        <div class="card"><span class="tiny muted">Ahorro del mes</span><span class="num" style="color:var(--green-600)">${cop(roundTo(SAVED, 1000))}</span><span class="chip chip--good" style="margin-top:4px">${icon("leaf")}Meta 88%</span></div>
      </div>
      <div class="quick">
        <button data-go="reporte">${icon("file-chart-column")}Ver reporte</button>
        <button data-go="ahorro">${icon("lightbulb")}Recomendaciones</button>
      </div>
    </div>
  </section>`;
};

VIEWS.alerta = () => {
  if (state.alert !== "pending") {
    const off = state.alert === "off";
    return `<section class="view">
      ${topbar("Alerta", "inicio")}
      <div class="alert-hero ${off ? "is-ok" : ""}">
        <div class="alert-hero__icon">${icon(off ? "circle-check" : "bell-off")}</div>
        <h2 class="title-lg">${off ? "Listo, el aire acondicionado está apagado" : "Alerta ignorada por esta noche"}</h2>
        <p class="muted" style="margin-top:8px">${off
          ? `Lo apagamos a las 11:43 p. m. Esta noche evitaste gastar ${cop(3700)}.${state.scheduled ? " Además, se apagará solo todos los días a las 10:15 p. m." : ""}`
          : "Entendido. Si mañana vuelve a quedar encendido después del cierre, te avisaremos."}</p>
      </div>
      ${off && !state.scheduled ? `<div class="card row"><div class="dev-icon">${icon("clock")}</div><div class="spacer"><strong class="small">¿Evitamos que se repita?</strong><div class="tiny muted">Programa el apagado diario y ahorra ${cop(110000)} al mes.</div></div><button class="btn btn--sm btn--secondary" data-action="schedule">Programar</button></div>` : ""}
      <div class="spacer"></div>
      <button class="btn btn--primary btn--block" data-go="inicio" style="margin-top:20px">Volver al inicio</button>
    </section>`;
  }
  return `<section class="view">
    ${topbar("Alerta", "inicio")}
    <div class="alert-hero">
      <div class="alert-hero__icon">${icon("air-vent")}</div>
      <span class="chip chip--alert">${icon("triangle-alert")}Consumo anómalo · hace 2 min</span>
      <h2 class="title-lg" style="margin-top:12px">El aire acondicionado del salón sigue encendido</h2>
      <p class="muted" style="margin-top:8px">El Portal cerró a las 10:00 p. m. y este equipo lleva 1 h 42 min encendido sin nadie en el local.</p>
    </div>
    <div class="stack">
      <div class="card facts">
        <div><span class="num">2,6 kW</span><span class="tiny">potencia</span></div>
        <div><span class="num">4,4 kWh</span><span class="tiny">de más</span></div>
        <div><span class="num" style="color:var(--coral-600)">${cop(3700)}</span><span class="tiny">costo extra</span></div>
      </div>
      <div class="card row"><div class="dev-icon dev-icon--warn">${icon("calendar-clock")}</div><div><strong class="small">Si pasa todas las noches</strong><div class="tiny muted">te costaría ${cop(110000)} más al mes. Ya ocurrió 3 veces esta semana.</div></div></div>
      <p class="tiny muted" style="text-align:center">Está conectado al Enchufe 1, por eso puedes apagarlo desde aquí.</p>
      <button class="btn btn--primary btn--block" data-action="ac-off">${icon("power")}Apagar ahora</button>
      <button class="btn btn--secondary btn--block" data-action="schedule">${icon("clock")}Programar apagado diario</button>
      <button class="btn btn--ghost btn--block" data-action="ignore">Ignorar esta vez</button>
    </div>
  </section>`;
};

VIEWS.equipos = () => {
  const total = state.unit === "cop" ? cop(roundTo(MONTH_BILL, 1000)) : `${kwh(MONTH_KWH)} kWh`;
  const status = (e) => {
    if (e.id === "ac") return state.alert === "pending" ? ["chip--alert", "Fuera de horario", "alert"] : state.scheduled ? ["chip--good", "Programado", ""] : ["chip--good", "Apagado", ""];
    if (e.id === "nevera") return ["chip--warn", "Consume 18% más", "warn"];
    return null;
  };
  return `<section class="view">
    ${topbar("Equipos")}
    <p class="small muted" style="margin:-8px 0 14px">Octubre · ${total} en total</p>
    <div class="seg" role="group" aria-label="Unidad">
      <button data-action="unit" data-value="cop" aria-pressed="${state.unit === "cop"}">En pesos</button>
      <button data-action="unit" data-value="kwh" aria-pressed="${state.unit === "kwh"}">En kWh</button>
    </div>
    <div class="card" style="margin-top:14px;padding:6px 16px">
      ${EQUIPOS.map((e) => {
        const st = status(e);
        const val = state.unit === "cop" ? cop(roundTo((MONTH_BILL * e.pct) / 100, 100)) : `${kwh((MONTH_KWH * e.pct) / 100)} kWh`;
        return `<button class="eq-row" data-action="equipo" data-value="${e.id}">
          <div class="dev-icon ${st && st[2] ? `dev-icon--${st[2]}` : ""}">${icon(e.icon)}</div>
          <div>
            <div class="row" style="gap:6px;flex-wrap:wrap"><strong class="small">${e.name}</strong>${st ? `<span class="chip ${st[0]}" style="font-size:11px;padding:2px 7px">${st[1]}</span>` : ""}</div>
            <div class="bar"><span class="${st ? st[2] : ""}" style="width:${(e.pct / 32) * 100}%"></span></div>
          </div>
          <div style="text-align:right"><strong class="small">${val}</strong><div class="tiny muted">${e.pct}%</div></div>
        </button>`;
      }).join("")}
    </div>
    <p class="tiny muted" style="text-align:center;margin-top:12px">Toca un equipo para ver su detalle.</p>
  </section>`;
};

VIEWS.ahorro = () => {
  const pct = Math.round((SAVED / GOAL) * 100);
  return `<section class="view">
    ${topbar("Ahorro")}
    <div class="goal">
      <div class="small" style="opacity:.85">Meta de octubre · ahorrar 25%</div>
      <div class="row between" style="margin-top:6px"><span class="num" style="font-size:28px">${cop(roundTo(SAVED, 1000))}</span><span class="small" style="opacity:.85">de ${cop(GOAL)}</span></div>
      <div class="bar"><span style="width:${pct}%"></span></div>
      <div class="small" style="margin-top:10px">Te faltan ${cop(GOAL - roundTo(SAVED, 1000))}. ¡Vas muy bien!</div>
    </div>
    <div class="row between" style="margin:22px 0 12px"><h2 class="title-md">Recomendaciones para El Portal</h2></div>
    <div class="stack">
      ${RECOS.map((r) => {
        const done = state.recos[r.id];
        const th = state.thumbs[r.id];
        return `<article class="card reco ${done ? "is-done" : ""}">
          <div class="reco__head">
            <div class="spacer"><span class="chip ${r.tag[0]}">${r.tag[1]}</span><h3 class="title-md" style="margin-top:8px;font-size:15px">${r.title}</h3></div>
            <div style="text-align:right"><div class="reco__save">+${cop(r.save)}</div><div class="tiny muted">al mes</div></div>
          </div>
          <p class="small muted">${r.text}</p>
          <div class="reco__foot">
            ${done
              ? `<span class="chip chip--good">${icon("check")}${r.done}</span>`
              : `<button class="btn btn--sm btn--primary" data-action="reco" data-value="${r.id}">${r.cta}</button>`}
            <div class="thumbs"><span>¿Te sirvió?</span>
              <button data-action="thumb" data-value="${r.id}:up" aria-pressed="${th === "up"}" aria-label="Sí">${icon("thumbs-up")}</button>
              <button data-action="thumb" data-value="${r.id}:down" aria-pressed="${th === "down"}" aria-label="No">${icon("thumbs-down")}</button>
            </div>
          </div>
        </article>`;
      }).join("")}
    </div>
  </section>`;
};

VIEWS.reporte = () => `<section class="view">
  <header class="topbar"><h1 class="spacer">Reporte de octubre</h1><button class="icon-btn" data-action="download" aria-label="Descargar PDF">${icon("download")}</button></header>
  <div class="stack">
    <div class="card">
      <div class="compare">
        <div><span class="tiny muted">Factura estimada</span><div class="num" style="font-size:22px">${cop(roundTo(MONTH_BILL, 1000))}</div></div>
        <div><span class="tiny muted">Antes de Energía-Smart</span><div class="num strike" style="font-size:22px">${cop(BASE_BILL)}</div></div>
      </div>
      <div class="chip chip--good" style="margin-top:12px">${icon("trending-down")}Ahorraste ${cop(roundTo(SAVED, 1000))} (22%)</div>
    </div>
    <div class="trial">${icon("hourglass")}<div class="spacer"><strong class="small">Tu mes de prueba termina el 31 de octubre</strong><div class="tiny muted">Elige un plan para no perder tu monitoreo.</div></div><button class="btn btn--sm btn--primary" data-go="planes">Ver planes</button></div>
    <div class="card">
      <div class="row between"><h2 class="title-md">Consumo mensual</h2><span class="tiny muted">kWh</span></div>
      ${monthsChart()}
      <div class="legend"><span><i style="background:#C9D6D3"></i>Antes (facturas EPM)</span><span><i style="background:var(--teal-700)"></i>Con Energía-Smart</span></div>
    </div>
    <div class="card co2">
      <div class="co2__icon">${icon("trees")}</div>
      <div><strong>60 kg de CO₂ evitados</strong><div class="small muted">Lo que absorben 3 árboles en un año. Tu aporte al ODS 7.</div></div>
    </div>
    <div class="two-cols">
      <button class="btn btn--secondary btn--sm" data-action="download">${icon("file-down")}Descargar PDF</button>
      <button class="btn btn--secondary btn--sm" data-action="share">${icon("share-2")}Compartir</button>
    </div>
  </div>
</section>`;

VIEWS.planes = () => {
  const p = PLANS[state.plan];
  const methods = [["pse", "PSE", "landmark"], ["tarjeta", "Tarjeta", "credit-card"], ["nequi", "Nequi", "smartphone"]];
  return `<section class="view">
    ${topbar("Elige tu plan", "reporte")}
    <p class="small muted" style="margin:-8px 0 18px">Sin cláusula de permanencia. Cancela cuando quieras desde la app.</p>
    <div class="stack">
      ${Object.entries(PLANS).map(([id, pl]) => `<button class="plan" data-action="plan" data-value="${id}" aria-pressed="${state.plan === id}">
        ${id === "pyme" ? '<span class="plan__tag">Recomendado para ti</span>' : ""}
        <div class="row"><span class="plan__radio"></span><div class="spacer"><strong>${pl.name}</strong><div class="tiny muted">${pl.desc}</div></div>
        <div style="text-align:right"><span class="plan__price">${cop(pl.price)}</span><div class="tiny muted">al mes</div></div></div>
        <ul>${pl.items.map((i) => `<li>${icon("check")}${i}</li>`).join("")}</ul>
      </button>`).join("")}
    </div>
    <h2 class="title-md" style="margin:22px 0 10px">Método de pago</h2>
    <div class="pay-methods">${methods.map(([id, l, ic]) => `<button data-action="pay" data-value="${id}" aria-pressed="${state.pay === id}">${icon(ic)}${l}</button>`).join("")}</div>
    ${state.payError ? `<div class="form-alert" style="margin-top:12px">${icon("circle-alert")}<span>Elige un método de pago para continuar.</span></div>` : ""}
    <div class="card" style="margin-top:16px">
      <div class="summary-line"><span>${p.name}</span><span>${cop(p.price)}</span></div>
      <div class="summary-line"><span>Periodo</span><span>Mensual</span></div>
      <div class="summary-line total"><span>Total hoy</span><span>${cop(p.price)}</span></div>
    </div>
    <div class="sticky-cta">
      <button class="btn btn--primary btn--block" data-action="checkout" ${state.paying ? "disabled" : ""}>
        ${state.paying ? `${icon("loader-circle", "spin")} Procesando pago…` : `${icon("lock")} Pagar ${cop(p.price)}`}
      </button>
    </div>
  </section>`;
};

VIEWS.confirmacion = () => {
  const p = PLANS[state.plan];
  const method = { pse: "PSE", tarjeta: "Tarjeta terminada en 4821", nequi: "Nequi" }[state.pay || "pse"];
  return `<section class="view">
    <div class="success-hero">
      <div class="success-ring"><div>${icon("check")}</div></div>
      <h1 class="title-xl">¡Listo! El Portal ya ahorra con Energía-Smart</h1>
      <p class="muted" style="margin-top:10px">Tu ${p.name} está activo. Seguiremos cuidando tu energía las 24 horas.</p>
    </div>
    <div class="card receipt">
      <div class="summary-line"><span>Plan</span><strong>${p.name}</strong></div>
      <div class="summary-line"><span>Valor</span><strong>${cop(p.price)} / mes</strong></div>
      <div class="summary-line"><span>Método</span><strong>${method}</strong></div>
      <div class="summary-line"><span>Próximo cobro</span><strong>29 nov. 2026</strong></div>
      <div class="summary-line"><span>Factura electrónica</span><strong>Enviada a tu correo</strong></div>
    </div>
    <div class="spacer"></div>
    <div class="stack" style="margin-top:20px">
      <button class="btn btn--primary btn--block" data-go="inicio">Ir a mi tablero</button>
      <button class="btn btn--ghost btn--block" data-action="invoice">${icon("receipt-text")}Descargar factura</button>
    </div>
  </section>`;
};

/* ---------- Hojas inferiores ---------- */
function scheduleSheet() {
  openSheet(`<h2 class="title-lg">Programar apagado diario</h2>
    <p class="muted small" style="margin:6px 0 18px">El aire acondicionado del salón se apagará solo a la hora que elijas, todos los días.</p>
    <div class="field"><label>Hora de apagado</label>
      <div class="time-options">${["10:00 p. m.", "10:15 p. m.", "10:30 p. m."].map((t, i) => `<button class="choice" data-action="time" aria-pressed="${i === 1}">${t}</button>`).join("")}</div>
    </div>
    <p class="tiny muted" style="margin:14px 0 18px">Te sugerimos 10:15 p. m.: tu local cierra a las 10:00 p. m. y así das tiempo al cierre de caja.</p>
    <button class="btn btn--primary btn--block" data-action="schedule-save">Guardar programación</button>
    <button class="btn btn--ghost btn--block" data-action="sheet-close">Cancelar</button>`);
}

function ignoreSheet() {
  openSheet(`<h2 class="title-lg">¿Por qué ignoras la alerta?</h2>
    <p class="muted small" style="margin:6px 0 16px">Tu respuesta nos ayuda a no molestarte con avisos innecesarios.</p>
    <div class="stack">${["Hay personal trabajando en el local", "Es un evento o turno especial", "Otro motivo"].map((r) => `<button class="choice" style="border-radius:14px;justify-content:flex-start;padding:14px" data-action="ignore-confirm">${r}</button>`).join("")}</div>
    <button class="btn btn--ghost btn--block" style="margin-top:10px" data-action="sheet-close">Cancelar</button>`);
}

function equipoSheet(id) {
  const e = EQUIPOS.find((x) => x.id === id);
  const k = (MONTH_KWH * e.pct) / 100;
  const action = e.id === "ac" && state.alert === "pending"
    ? `<button class="btn btn--primary btn--block" data-action="sheet-go" data-value="alerta">Ver alerta</button>`
    : e.reco
      ? `<button class="btn btn--primary btn--block" data-action="sheet-go" data-value="ahorro">Ver cómo ahorrar</button>`
      : "";
  openSheet(`<div class="row" style="margin-bottom:16px"><div class="dev-icon">${icon(e.icon)}</div><div><h2 class="title-md">${e.name}</h2><div class="tiny muted">${e.link}</div></div></div>
    <div class="card" style="box-shadow:none;border:1px solid var(--line)">
      <div class="summary-line"><span>Consumo de octubre</span><strong>${kwh(k)} kWh</strong></div>
      <div class="summary-line"><span>Costo</span><strong>${cop(roundTo(k * TARIFA_KWH, 100))}</strong></div>
      <div class="summary-line"><span>Horario de uso</span><strong>${e.hours}</strong></div>
      <div class="summary-line"><span>Participación</span><strong>${e.pct}% del total</strong></div>
    </div>
    <div class="row" style="margin:14px 0 18px;align-items:flex-start"><div class="dev-icon" style="width:32px;height:32px">${icon("lightbulb")}</div><p class="small muted">${e.tip}</p></div>
    ${action}
    <button class="btn btn--ghost btn--block" data-action="sheet-close">Cerrar</button>`);
}

/* ---------- Acciones ---------- */
const ACTIONS = {
  "onb-next": () => { state.onb++; render(); },
  forgot: () => toast("Revisa tu correo", "Te enviamos un enlace para crear una nueva contraseña a admin@elportal.com.co.", "mail-check"),
  google: () => go("negocio"),
  type: (el) => { state.business.type = el.dataset.value; document.querySelectorAll('[data-action="type"]').forEach((b) => b.setAttribute("aria-pressed", b === el)); },
  "kit-search": () => {
    state.kit = "searching"; render();
    setTimeout(() => { if (currentRoute().id === "conexion") { state.kit = "found"; render(); } }, 1800);
  },
  "kit-finish": () => { go("inicio"); toast("¡Todo conectado!", "Ya estamos midiendo el consumo de El Portal en tiempo real."); },
  "ac-off": () => {
    state.alert = "off"; render();
    toast("Aire acondicionado apagado", `Esta noche evitaste gastar ${cop(3700)}.`, "power");
  },
  schedule: scheduleSheet,
  time: (el) => document.querySelectorAll('[data-action="time"]').forEach((b) => b.setAttribute("aria-pressed", b === el)),
  "schedule-save": () => {
    const t = $('[data-action="time"][aria-pressed="true"]').textContent;
    state.alert = "off"; state.scheduled = true; state.recos.ac = true;
    closeSheet(); render();
    toast("Programación guardada", `Lo apagamos ahora y desde mañana se apagará solo a las ${t}`, "clock");
  },
  ignore: ignoreSheet,
  "ignore-confirm": () => {
    state.alert = "ignored"; closeSheet(); go("inicio");
    toast("Entendido", "No te avisaremos de nuevo esta noche.", "bell-off");
  },
  "sheet-close": closeSheet,
  "sheet-go": (el) => { closeSheet(); go(el.dataset.value); },
  unit: (el) => { state.unit = el.dataset.value; render(); },
  equipo: (el) => equipoSheet(el.dataset.value),
  reco: (el) => {
    const id = el.dataset.value;
    if (id === "ac") return scheduleSheet();
    state.recos[id] = true; render();
    const msg = {
      nevera: ["Solicitud enviada", "Te escribiremos por WhatsApp para agendar la visita técnica esta semana."],
      horno: ["¡Bien hecho!", `Si lo mantienes, ahorrarás ${cop(54000)} este mes. Lo veremos en tu reporte.`],
      luces: ["Cotizaciones en camino", "Te enviamos 3 cotizaciones de aliados LED a tu correo."],
    }[id];
    toast(msg[0], msg[1]);
  },
  thumb: (el) => {
    const [id, v] = el.dataset.value.split(":");
    state.thumbs[id] = v; render();
    toast("¡Gracias por contarnos!", v === "up" ? "Seguiremos sugiriéndote acciones como esta." : "Ajustaremos tus próximas recomendaciones.", "heart");
  },
  download: () => toast("Reporte descargado", "Reporte_Octubre_2026_ElPortal.pdf quedó en tus descargas.", "file-check"),
  share: () => toast("Listo para compartir", "Abrimos WhatsApp con tu reporte de octubre.", "share-2"),
  plan: (el) => { state.plan = el.dataset.value; render(); },
  pay: (el) => { state.pay = el.dataset.value; state.payError = false; render(); },
  checkout: () => {
    if (!state.pay) { state.payError = true; render(); return; }
    state.paying = true; render();
    setTimeout(() => { state.paying = false; go("confirmacion"); }, 1400);
  },
  invoice: () => toast("Factura descargada", "FE-2026-00148.pdf quedó en tus descargas.", "file-check"),
};

const FORMS = {
  login(form) {
    const email = form.elements.email.value.trim();
    const pass = form.elements.password.value;
    let ok = true;
    state.loginError = null;
    if (!email) { setError(form, "email", "Escribe tu correo para continuar."); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError(form, "email", "Ese correo no parece válido. Revisa que tenga @ y un dominio, por ejemplo: nombre@negocio.com"); ok = false; }
    else setError(form, "email", "");
    if (!pass) { setError(form, "password", "Escribe tu contraseña."); ok = false; }
    else if (pass.length < 8) { setError(form, "password", "La contraseña debe tener al menos 8 caracteres."); ok = false; }
    else setError(form, "password", "");
    if (ok) go("negocio");
  },
  negocio(form) {
    const { elements: f } = form;
    const name = f.name.value.trim();
    const bill = f.bill.value.replace(/\D/g, "");
    setError(form, "name", name ? "" : "Cuéntanos cómo se llama tu negocio.");
    setError(form, "bill", bill ? "" : "Escribe el valor aproximado; lo usamos para medir cuánto ahorras.");
    if (!name || !bill) return;
    Object.assign(state.business, { name, city: f.city.value, open: f.open.value, close: f.close.value, bill: f.bill.value });
    state.kit = "idle";
    go("conexion");
  },
};

/* ---------- Render ---------- */
function render() {
  const route = currentRoute();
  const screen = $("#screen");
  screen.innerHTML = VIEWS[route.id]();
  screen.scrollTop = 0;

  const tabbar = $("#tabbar");
  tabbar.hidden = !route.tab;
  if (route.tab) {
    tabbar.innerHTML = TABS.map((t) => `<button data-go="${t.id}" ${t.id === route.id ? 'aria-current="page"' : ""}>${icon(t.icon)}${t.label}${t.id === "inicio" && state.alert === "pending" ? '<span class="badge-dot"></span>' : ""}</button>`).join("");
  }

  document.querySelectorAll("#guide-steps button").forEach((b) => {
    if (b.dataset.go === route.id) b.setAttribute("aria-current", "step");
    else b.removeAttribute("aria-current");
  });
  document.title = `${route.label} · Energía-Smart`;
  lucide.createIcons();
}

function init() {
  $("#guide-steps").innerHTML = ROUTES.map((r, i) => `<li><button data-go="${r.id}"><span class="guide__num">${i + 1}</span>${r.label}</button></li>`).join("");

  document.addEventListener("click", (ev) => {
    const nav = ev.target.closest("[data-go]");
    if (nav) { ev.preventDefault(); closeSheet(); go(nav.dataset.go); return; }
    const act = ev.target.closest("[data-action]");
    if (act && ACTIONS[act.dataset.action]) { ev.preventDefault(); ACTIONS[act.dataset.action](act); }
  });
  document.addEventListener("submit", (ev) => {
    const form = ev.target.closest("[data-form]");
    if (form) { ev.preventDefault(); FORMS[form.dataset.form](form); }
  });
  document.addEventListener("input", (ev) => {
    const el = ev.target;
    if (el.matches("[data-money]")) {
      const digits = el.value.replace(/\D/g, "");
      el.value = digits ? Number(digits).toLocaleString("es-CO") : "";
    }
    el.closest(".field")?.classList.remove("is-error");
  });
  $("#sheet-backdrop").addEventListener("click", closeSheet);
  $("#reset-demo").addEventListener("click", () => { state = initialState(); closeSheet(); go("bienvenida"); });
  window.addEventListener("hashchange", render);

  render();
}

init();
