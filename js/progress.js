// js/progress.js
//
// Progreso de lectura auto-reportado por cada miembro, como porcentaje
// (0-100) en vez de contar capítulos o páginas exactas: no todos los
// libros tienen el mismo número de capítulos, ni todas las ediciones la
// misma paginación, así que pedirle a cada quien "¿en qué % vas?" con un
// control deslizante es más simple y funciona para cualquier libro sin
// necesitar que la administradora configure nada extra por título.
// Un documento por miembro y libro: books/{id}/progress/{uid}.

import {
  collection, doc, getDoc, getDocs, setDoc, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

function progressCol(bookId) {
  return collection(db, "books", bookId, "progress");
}

/** Progreso del usuario actual para un libro (o null si no ha reportado nada). */
export async function getMyProgress(bookId, uid) {
  const snap = await getDoc(doc(db, "books", bookId, "progress", uid));
  return snap.exists() ? snap.data() : null;
}

/** Guarda el % de avance del usuario actual (0-100, redondeado). */
export async function setMyProgress(bookId, uid, percent) {
  const clean = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  await setDoc(doc(db, "books", bookId, "progress", uid), {
    percent: clean,
    updatedAt: serverTimestamp(),
  });
  return clean;
}

/**
 * Promedio del club para ese libro. Lectura completa de la subcolección:
 * aceptable porque un club de lectura chico rara vez pasa de una docena
 * de miembros reportando progreso por libro.
 */
export async function loadClubAverage(bookId) {
  const snap = await getDocs(progressCol(bookId));
  if (snap.empty) return null;
  const values = snap.docs.map((d) => d.data().percent || 0);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return { average, count: values.length };
}
