// js/recommendations.js
//
// Recomendaciones de libros propuestas por cualquier miembro. Cada miembro
// puede editar/eliminar solo las suyas; la administradora puede moderar
// (eliminar cualquiera) y cambiar el estado (sugerido/considerado/aceptado/
// descartado). Sin votaciones en esta versión.

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

export const RECOMMENDATION_STATUS = {
  SUGGESTED: "sugerido",
  CONSIDERED: "considerado",
  ACCEPTED: "aceptado",
  DISCARDED: "descartado",
};

export const REASON_MAX_LENGTH = 500;

const col = collection(db, "recommendations");

export async function loadRecommendations() {
  const q = query(col, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Comprueba localmente (sobre la lista ya cargada) si título+autor coinciden. */
export function findDuplicate(list, title, author) {
  const t = title.trim().toLowerCase();
  const a = (author || "").trim().toLowerCase();
  return list.find(
    (r) => r.title.trim().toLowerCase() === t && (r.author || "").trim().toLowerCase() === a
  );
}

export async function createRecommendation({ title, author, genre, reason, link, uid, authorName }) {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("El título es obligatorio.");

  await addDoc(col, {
    title: cleanTitle,
    author: (author || "").trim(),
    genre: (genre || "").trim(),
    reason: (reason || "").trim().slice(0, REASON_MAX_LENGTH),
    link: (link || "").trim(),
    uid,
    authorName,
    status: RECOMMENDATION_STATUS.SUGGESTED,
    createdAt: serverTimestamp(),
  });
}

export async function updateRecommendation(id, data) {
  const payload = {};
  for (const key of ["title", "author", "genre", "reason", "link"]) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  await updateDoc(doc(db, "recommendations", id), payload);
}

export async function setRecommendationStatus(id, status) {
  await updateDoc(doc(db, "recommendations", id), { status });
}

export async function deleteRecommendation(id) {
  await deleteDoc(doc(db, "recommendations", id));
}

export function filterRecommendations(list, { search = "" } = {}) {
  const term = search.trim().toLowerCase();
  if (!term) return list;
  return list.filter(
    (r) => r.title.toLowerCase().includes(term) || (r.author || "").toLowerCase().includes(term)
  );
}
