// js/app.js
//
// Módulo central de la aplicación. Inicializa Firebase UNA sola vez y expone
// utilidades compartidas (toasts, formato de fechas, escape de HTML, etc.)
// que el resto de módulos importan. Centralizar la inicialización evita el
// error común de "Firebase App named '[DEFAULT]' already exists".

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// --- Inicialización única de Firebase -------------------------------------

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
});

// --- Rutas relativas --------------------------------------------------------
// Todas las páginas deben enlazarse entre sí con rutas relativas (sin "/" al
// inicio) para funcionar dentro de un subdirectorio de GitHub Pages, por
// ejemplo https://usuario.github.io/cafe-flopexo/

// --- Roles -------------------------------------------------------------------
export const ROLES = { ADMIN: "admin", MEMBER: "member" };

// --- Avatares predefinidos (assets/avatars) --------------------------------
export const AVATAR_IDS = [
  "avatar-1.png",
  "avatar-2.png",
  "avatar-3.png",
  "avatar-4.png",
  "avatar-5.png",
  "avatar-6.png",
  "avatar-7.png",
  "avatar-8.png",
];

export const AVATAR_NAMES = {
  "avatar-1.png": "Félix, zorro bibliotecario",
  "avatar-2.png": "Michi, lector nocturno",
  "avatar-3.png": "Flora, bruja del bosque",
  "avatar-4.png": "Lumi, fantasma lector",
  "avatar-5.png": "Mocchi, sabio del bosque",
  "avatar-6.png": "Polilla, guardiana de historias",
  "avatar-7.png": "Moka, dragón cafetero",
  "avatar-8.png": "Cosmo, búho astrónomo",
};

export function avatarPath(avatarId) {
  const safe = AVATAR_IDS.includes(avatarId) ? avatarId : AVATAR_IDS[0];
  return `assets/avatars/${safe}`;
}

// --- Escape de HTML (previene XSS al insertar texto de usuarios) ----------
export function escapeHTML(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

// --- Formato de fecha amigable en español de México ------------------------
const DATE_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "Fecha por confirmar";
  return capitalize(DATE_FORMATTER.format(d));
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "Fecha por confirmar";
  return capitalize(DATETIME_FORMATTER.format(d));
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate(); // Firestore Timestamp
  if (typeof value === "string") {
    const parsed = new Date(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Toasts accesibles -------------------------------------------------------
let toastContainer = null;

function getToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement("div");
  toastContainer.className = "toast-container";
  toastContainer.setAttribute("aria-live", "polite");
  toastContainer.setAttribute("aria-atomic", "true");
  document.body.appendChild(toastContainer);
  return toastContainer;
}

export function showToast(message, type = "info") {
  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// --- Debounce (usado en buscadores para no consultar en cada pulsación) ---
export function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// --- Header / navegación reutilizable ---------------------------------
// Evita copiar el mismo bloque de <header> en las 8 páginas privadas.
// Cada página llama a renderHeader("archivo-actual.html") dentro de un
// <div id="app-header"></div> ubicado justo antes de <main>.
const NAV_LINKS = [
  { href: "index.html", label: "Inicio" },
  { href: "biblioteca.html", label: "Biblioteca" },
  { href: "calendario.html", label: "Calendario" },
  { href: "recomendaciones.html", label: "Recomendaciones" },
  { href: "miembros.html", label: "Miembros" },
  { href: "perfil.html", label: "Mi perfil" },
];

export function renderHeader(currentPage, profile) {
  const mount = document.getElementById("app-header");
  if (!mount) return;

  const links = NAV_LINKS.map((link) => {
    const isCurrent = link.href === currentPage;
    return `<li><a href="${link.href}" ${isCurrent ? 'aria-current="page"' : ""}>${link.label}</a></li>`;
  }).join("");

  const adminLink = profile?.role === ROLES.ADMIN
    ? `<li><a href="admin.html" ${currentPage === "admin.html" ? 'aria-current="page"' : ""}>Administración</a></li>`
    : "";

  mount.innerHTML = `
    <div class="container site-header__inner">
      <a class="brand" href="index.html">
        <span class="deco-steam" aria-hidden="true"></span>
        Café Flopexo
      </a>
      <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="main-nav-list" aria-label="Abrir menú">
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
        <span class="nav-toggle__bar"></span>
      </button>
      <nav class="main-nav" aria-label="Navegación principal">
        <ul class="main-nav__links" id="main-nav-list" data-nav-menu>
          ${links}
          ${adminLink}
        </ul>
        <button class="btn btn--ghost btn--sm" data-logout type="button">Cerrar sesión</button>
      </nav>
    </div>`;

  initMobileNav();
  // auth.js adjunta el manejador real de logout vía initLogoutButton().
}

// --- Menú móvil reutilizable --------------------------------------------
export function initMobileNav() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav-menu]");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// --- Placeholder de imagen si falla la portada -----------------------------
export function handleImageFallback(imgEl, fallbackText = "📖") {
  imgEl.addEventListener("error", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "img-fallback";
    wrapper.textContent = fallbackText;
    imgEl.replaceWith(wrapper);
  }, { once: true });
}

// --- Estado offline comprensible -------------------------------------------
export function initOfflineBanner() {
  const banner = document.createElement("div");
  banner.className = "offline-banner";
  banner.setAttribute("role", "status");
  banner.textContent = "Sin conexión. Algunos contenidos podrían no actualizarse.";
  document.body.prepend(banner);

  function update() {
    banner.classList.toggle("offline-banner--visible", !navigator.onLine);
  }
  window.addEventListener("online", update);
  window.addEventListener("offline", update);
  update();
}

// --- Manejo centralizado de errores de Firestore ---------------------------
export function friendlyFirestoreError(error) {
  const code = error?.code || "";
  const map = {
    "permission-denied": "No tienes permiso para realizar esta acción.",
    "unavailable": "No hay conexión con el servidor. Intenta de nuevo.",
    "not-found": "El contenido que buscas ya no está disponible.",
    "already-exists": "Este contenido ya existe.",
    "resource-exhausted": "Se alcanzó un límite temporal. Intenta más tarde.",
  };
  return map[code] || "Ocurrió un error inesperado. Intenta de nuevo.";
}
