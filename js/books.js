// js/books.js
//
// Gestión de libros. La colección "books" es pequeña (una biblioteca de
// club de 5-8 personas), así que se carga UNA sola vez por sesión de página
// y los filtros de biblioteca.html se aplican en memoria, evitando lecturas
// repetidas de Firestore en cada búsqueda o cambio de filtro.

import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, limit,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

export const BOOK_STATUS = {
  CURRENT: "leyendo",
  UPCOMING: "proximo",
  FINISHED: "terminado",
};

const BOOK_FIELDS_ALLOWED = [
  "title", "author", "synopsis", "genre", "pages", "coverUrl", "pdfPath",
  "status", "startDate", "endDate", "chaptersAssigned", "archived",
];

let cachedBooks = null;

/** Carga todos los libros no archivados una sola vez y los cachea en memoria. */
export async function loadAllBooks({ force = false } = {}) {
  if (cachedBooks && !force) return cachedBooks;
  const q = query(collection(db, "books"), where("archived", "==", false));
  const snap = await getDocs(q);
  cachedBooks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return cachedBooks;
}

export function invalidateBooksCache() {
  cachedBooks = null;
}

export async function getBook(bookId) {
  const snap = await getDoc(doc(db, "books", bookId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/** Filtrado 100% local: no toca Firestore. */
export function filterBooks(books, { search = "", status = "", genre = "" } = {}) {
  const term = search.trim().toLowerCase();
  return books.filter((b) => {
    const matchesSearch = !term
      || b.title?.toLowerCase().includes(term)
      || b.author?.toLowerCase().includes(term);
    const matchesStatus = !status || b.status === status;
    const matchesGenre = !genre || b.genre === genre;
    return matchesSearch && matchesStatus && matchesGenre;
  });
}

export function groupByStatus(books) {
  return {
    current: books.filter((b) => b.status === BOOK_STATUS.CURRENT),
    upcoming: books.filter((b) => b.status === BOOK_STATUS.UPCOMING),
    finished: books.filter((b) => b.status === BOOK_STATUS.FINISHED),
  };
}

export async function getCurrentBook(books = null) {
  const list = books || (await loadAllBooks());
  return list.find((b) => b.status === BOOK_STATUS.CURRENT) || null;
}

// --- Validación de ruta de PDF ----------------------------------------------
// Solo se permiten rutas relativas dentro de books/, con extensión .pdf,
// sin protocolos ni "..", para evitar referencias fuera del repositorio.
const PDF_PATH_PATTERN = /^books\/[a-zA-Z0-9._-]+\.pdf$/;

export function isValidPdfPath(path) {
  return typeof path === "string" && PDF_PATH_PATTERN.test(path) && !path.includes("..");
}

// --- CRUD administrativo (requiere rol admin; reforzado por firestore.rules) --

export async function createBook(data) {
  const payload = sanitizeBookPayload(data);
  return addDoc(collection(db, "books"), {
    ...payload,
    avgRating: 0,
    reviewCount: 0,
    archived: false,
    createdAt: serverTimestamp(),
  });
}

export async function updateBook(bookId, data) {
  const payload = sanitizeBookPayload(data, { partial: true });
  await updateDoc(doc(db, "books", bookId), payload);
}

export async function setBookStatus(bookId, status) {
  await updateDoc(doc(db, "books", bookId), { status });
}

export async function archiveBook(bookId, archived = true) {
  await updateDoc(doc(db, "books", bookId), { archived });
}

function sanitizeBookPayload(data, { partial = false } = {}) {
  const payload = {};
  for (const key of BOOK_FIELDS_ALLOWED) {
    if (data[key] !== undefined) payload[key] = data[key];
  }
  if (payload.pdfPath && !isValidPdfPath(payload.pdfPath)) {
    throw new Error("La ruta del PDF debe tener el formato books/nombre-archivo.pdf");
  }
  if (payload.pages !== undefined) payload.pages = Number(payload.pages) || 0;
  if (!partial) {
    payload.title = payload.title?.trim() || "";
    payload.author = payload.author?.trim() || "";
    payload.status = payload.status || BOOK_STATUS.UPCOMING;
    payload.archived = false;
  }
  return payload;
}

// --- Últimos libros para dashboard / recomendaciones ------------------------
export async function loadRecentBooksLimited(n = 3) {
  const q = query(
    collection(db, "books"),
    where("archived", "==", false),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
