// js/reviews.js
//
// Reseñas por libro. Cada miembro tiene como máximo una reseña por libro:
// el ID del documento es el propio UID del autor (books/{id}/reviews/{uid}).
// Esto simplifica "una calificación por libro" sin necesitar una consulta
// extra: basta con leer ese documento puntual.
//
// El nombre y avatar del autor se guardan también en la reseña (denormalizado)
// para no tener que hacer un getDoc adicional por cada reseña al listar.
// Trade-off: si un miembro cambia su nombre/avatar en su perfil, sus reseñas
// pasadas conservarán el nombre/avatar anteriores hasta que las edite de
// nuevo. Esto es aceptable para un club pequeño; una mejora de v2 sería una
// Cloud Function que sincronice el nombre en cascada al actualizar el perfil.

import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp,
  query, orderBy, limit as fbLimit, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

export const REVIEW_TEXT_MAX_LENGTH = 800;

function reviewsCol(bookId) {
  return collection(db, "books", bookId, "reviews");
}

/** Carga reseñas más recientes primero, con límite (paginación simple). */
export async function loadReviews(bookId, { max = 20 } = {}) {
  const q = query(reviewsCol(bookId), orderBy("createdAt", "desc"), fbLimit(max));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMyReview(bookId, uid) {
  const snap = await getDoc(doc(db, "books", bookId, "reviews", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Crea o actualiza la reseña del usuario actual y recalcula el promedio del
 * libro dentro de una transacción, para mantener avgRating/reviewCount
 * consistentes incluso si dos personas escriben casi al mismo tiempo.
 */
export async function upsertReview(bookId, uid, { rating, text, authorName, authorAvatar }) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("La calificación debe ser un número entero entre 1 y 5.");
  }
  const cleanText = (text || "").trim().slice(0, REVIEW_TEXT_MAX_LENGTH);
  const reviewRef = doc(db, "books", bookId, "reviews", uid);
  const bookRef = doc(db, "books", bookId);

  await runTransaction(db, async (tx) => {
    const [reviewSnap, bookSnap] = await Promise.all([tx.get(reviewRef), tx.get(bookRef)]);
    if (!bookSnap.exists()) throw new Error("El libro ya no existe.");

    const bookData = bookSnap.data();
    const prevRating = reviewSnap.exists() ? reviewSnap.data().rating : null;
    const prevCount = bookData.reviewCount || 0;
    const prevAvg = bookData.avgRating || 0;

    let newCount = prevCount;
    let newTotal = prevAvg * prevCount;

    if (prevRating === null) {
      newCount = prevCount + 1;
      newTotal += rating;
    } else {
      newTotal = newTotal - prevRating + rating;
    }
    const newAvg = newCount > 0 ? newTotal / newCount : 0;

    tx.set(reviewRef, {
      rating,
      text: cleanText,
      authorName,
      authorAvatar,
      createdAt: reviewSnap.exists() ? reviewSnap.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.update(bookRef, { avgRating: Math.round(newAvg * 100) / 100, reviewCount: newCount });
  });
}

export async function deleteReview(bookId, uid) {
  const reviewRef = doc(db, "books", bookId, "reviews", uid);
  const bookRef = doc(db, "books", bookId);

  await runTransaction(db, async (tx) => {
    const [reviewSnap, bookSnap] = await Promise.all([tx.get(reviewRef), tx.get(bookRef)]);
    if (!reviewSnap.exists() || !bookSnap.exists()) return;

    const bookData = bookSnap.data();
    const prevCount = bookData.reviewCount || 0;
    const prevAvg = bookData.avgRating || 0;
    const rating = reviewSnap.data().rating;

    const newCount = Math.max(0, prevCount - 1);
    const newTotal = prevAvg * prevCount - rating;
    const newAvg = newCount > 0 ? newTotal / newCount : 0;

    tx.delete(reviewRef);
    tx.update(bookRef, { avgRating: Math.round(newAvg * 100) / 100, reviewCount: newCount });
  });
}

/** Distribución de estrellas (1..5) para el gráfico de barras del libro. */
export function starDistribution(reviews) {
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of reviews) {
    if (dist[r.rating] !== undefined) dist[r.rating]++;
  }
  return dist;
}
