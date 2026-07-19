// js/admin.js
//
// Lógica exclusiva de admin.html. No define reglas de negocio nuevas: llama
// a las funciones de books.js, calendar.js, recommendations.js y a la
// colección de reseñas para moderación, centralizando así la interfaz de
// administración en un solo módulo.

import { doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";
import {
  loadAllBooks, invalidateBooksCache, createBook, updateBook, setBookStatus,
  archiveBook,
} from "./books.js";
import {
  loadRecommendations, setRecommendationStatus, deleteRecommendation,
} from "./recommendations.js";
import { loadEvents, createEvent, updateEvent, deleteEvent } from "./calendar.js";

export {
  loadAllBooks, invalidateBooksCache, createBook, updateBook, setBookStatus, archiveBook,
  loadRecommendations, setRecommendationStatus, deleteRecommendation,
  loadEvents, createEvent, updateEvent, deleteEvent,
};

/** Moderación: la administradora puede eliminar la reseña de cualquier libro. */
export async function moderateDeleteReview(bookId, reviewAuthorUid) {
  await deleteDoc(doc(db, "books", bookId, "reviews", reviewAuthorUid));
  // Nota: esto no recalcula avgRating/reviewCount automáticamente porque la
  // moderación es una acción excepcional. Tras moderar, vuelve a abrir el
  // libro para recalcular sumando/restando reseñas si lo requieres, o
  // ejecuta una revalidación manual desde el panel (botón "Recalcular").
}

export async function recalculateBookRating(bookId, allReviews) {
  const count = allReviews.length;
  const avg = count > 0
    ? Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / count) * 100) / 100
    : 0;
  await updateDoc(doc(db, "books", bookId), { avgRating: avg, reviewCount: count });
}

export async function setCurrentBook(bookId) {
  // Marca el libro elegido como "leyendo"; no cambia automáticamente el
  // estado de otros libros para dejar control manual a la administradora
  // (podría haber más de un libro "en curso" en clubes flexibles).
  await setBookStatus(bookId, "leyendo");
}
