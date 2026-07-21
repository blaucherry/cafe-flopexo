// js/rsvp.js
//
// Confirmación de asistencia a las reuniones del club. Cada miembro tiene
// como máximo una respuesta por evento: el ID del documento es su propio
// UID (events/{id}/rsvps/{uid}), igual que el patrón que ya usa reviews.js
// para "una reseña por persona por libro". La colección es chica (un club
// de 5-8 personas), así que se lee completa con getDocs sin necesitar
// agregados ni transacciones.

import {
  collection, doc, getDoc, getDocs, setDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

export const RSVP_STATUS = {
  YES: "voy",
  MAYBE: "tal_vez",
  NO: "no_puedo",
};

export const RSVP_LABELS = {
  [RSVP_STATUS.YES]: "Voy",
  [RSVP_STATUS.MAYBE]: "Tal vez",
  [RSVP_STATUS.NO]: "No puedo",
};

function rsvpsCol(eventId) {
  return collection(db, "events", eventId, "rsvps");
}

/** Carga todas las confirmaciones de un evento (para mostrar el resumen). */
export async function loadRsvps(eventId) {
  const snap = await getDocs(rsvpsCol(eventId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Confirmación del usuario actual para un evento, o null si no ha respondido. */
export async function getMyRsvp(eventId, uid) {
  const snap = await getDoc(doc(db, "events", eventId, "rsvps", uid));
  return snap.exists() ? snap.data() : null;
}

/** Crea o actualiza la confirmación del usuario actual. */
export async function setRsvp(eventId, uid, status) {
  if (!Object.values(RSVP_STATUS).includes(status)) {
    throw new Error("Estado de confirmación inválido.");
  }
  await setDoc(doc(db, "events", eventId, "rsvps", uid), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Cuenta cuántas personas respondieron cada opción. */
export function summarizeRsvps(rsvps) {
  const summary = { [RSVP_STATUS.YES]: 0, [RSVP_STATUS.MAYBE]: 0, [RSVP_STATUS.NO]: 0 };
  for (const r of rsvps) {
    if (summary[r.status] !== undefined) summary[r.status]++;
  }
  return summary;
}
