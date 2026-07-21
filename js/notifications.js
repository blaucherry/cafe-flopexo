// js/notifications.js
//
// Bandeja de notificaciones ligera para la campanita del header. No crea
// colecciones nuevas en Firestore ni requiere infraestructura de push:
// simplemente junta actividad reciente de lo que ya es legible para
// cualquier miembro (reseñas del libro actual, próxima reunión) y la
// muestra en un dropdown. El "visto / no visto" se guarda en localStorage
// por dispositivo, para no complicar las reglas de seguridad con un
// documento de "notificaciones leídas" por usuario.

import { escapeHTML, formatDateTime } from "./app.js";
import { loadAllBooks, getCurrentBook } from "./books.js";
import { loadReviews } from "./reviews.js";
import { loadEvents, nextEvent } from "./calendar.js";

const SEEN_KEY = "flopexo:lastSeenNotifications";

/** Junta actividad reciente de varias fuentes en una sola lista ordenada. */
export async function loadNotifications({ max = 6 } = {}) {
  const items = [];

  try {
    const books = await loadAllBooks();
    const current = await getCurrentBook(books);
    if (current) {
      const reviews = await loadReviews(current.id, { max: 4 });
      for (const r of reviews) {
        items.push({
          id: `review-${current.id}-${r.id}`,
          icon: "💬",
          text: `${r.authorName} dejó una reseña de "${current.title}"`,
          date: r.createdAt,
        });
      }
    }
  } catch (err) {
    // Sin reseñas recientes disponibles: se omite esta sección.
  }

  try {
    const events = await loadEvents();
    const next = nextEvent(events);
    if (next) {
      const date = next.date?.toDate ? next.date.toDate() : new Date(next.date);
      const hoursUntil = (date - new Date()) / 36e5;
      if (hoursUntil <= 72) {
        items.push({
          id: `event-${next.id}`,
          icon: "🗓️",
          text: `Reunión "${next.title}" — ${formatDateTime(next.date)}`,
          date: next.date,
        });
      }
    }
  } catch (err) {
    // Sin próxima reunión disponible: se omite esta sección.
  }

  items.sort((a, b) => toMillis(b.date) - toMillis(a.date));
  return items.slice(0, max);
}

function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const d = new Date(value);
  return isNaN(d) ? 0 : d.getTime();
}

function getLastSeen() {
  return Number(localStorage.getItem(SEEN_KEY) || 0);
}

function markSeenNow() {
  localStorage.setItem(SEEN_KEY, String(Date.now()));
}

/**
 * Monta el comportamiento de la campana de notificaciones del header.
 * Debe llamarse después de renderHeader(), igual que initLogoutButton().
 */
export async function initNotificationBell() {
  const btn = document.getElementById("notif-bell-btn");
  const dropdown = document.getElementById("notif-dropdown");
  const dot = document.getElementById("notif-dot");
  if (!btn || !dropdown || !dot) return;

  let items = [];
  try {
    items = await loadNotifications();
  } catch (err) {
    items = [];
  }

  const lastSeen = getLastSeen();
  dot.hidden = !items.some((it) => toMillis(it.date) > lastSeen);

  dropdown.innerHTML = items.length
    ? items.map((it) => `
        <div class="notif-item">
          <span class="notif-item__icon" aria-hidden="true">${it.icon}</span>
          <p>${escapeHTML(it.text)}</p>
        </div>`).join("")
    : `<p class="notif-empty">Sin novedades por ahora.</p>`;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = dropdown.hidden;
    dropdown.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      markSeenNow();
      dot.hidden = true;
    }
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.hidden && !e.target.closest("[data-notif-bell]")) {
      dropdown.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}
