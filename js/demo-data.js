// js/demo-data.js
//
// Datos de DEMOSTRACIÓN, completamente separados de la lógica de la
// aplicación. Este módulo NO se importa desde ninguna página de producción
// (index.html, biblioteca.html, etc.). Solo se usa manualmente desde
// demo-data.html, una página fuera de la navegación normal, pensada para
// que la administradora la abra una sola vez si quiere poblar un proyecto
// de pruebas con contenido de ejemplo.
//
// IMPORTANTE: los usuarios de demostración aquí solo crean documentos en
// Firestore (users/{uid}); NO crean cuentas reales de Firebase
// Authentication. Para probar el login necesitas crear cuentas reales
// desde la consola de Firebase y usar esos UID reales si quieres asociarlos
// a estos perfiles.

import {
  collection, doc, setDoc, addDoc, serverTimestamp, Timestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

export const DEMO_BOOKS = [
  {
    id: "demo-book-1",
    title: "Cien años de soledad",
    author: "Gabriel García Márquez",
    synopsis: "La historia de la familia Buendía a lo largo de generaciones en el pueblo de Macondo.",
    genre: "Realismo mágico",
    pages: 471,
    coverUrl: "",
    pdfPath: "",
    status: "leyendo",
    chaptersAssigned: "Capítulos 1 al 5",
    archived: false,
  },
  {
    id: "demo-book-2",
    title: "Orgullo y prejuicio",
    author: "Jane Austen",
    synopsis: "Las peripecias sentimentales de las hermanas Bennet en la Inglaterra rural del siglo XIX.",
    genre: "Clásico",
    pages: 432,
    coverUrl: "",
    pdfPath: "",
    status: "proximo",
    chaptersAssigned: "",
    archived: false,
  },
  {
    id: "demo-book-3",
    title: "El principito",
    author: "Antoine de Saint-Exupéry",
    synopsis: "Un aviador perdido en el desierto conoce a un pequeño príncipe de otro planeta.",
    genre: "Fábula",
    pages: 96,
    coverUrl: "",
    pdfPath: "",
    status: "terminado",
    chaptersAssigned: "",
    archived: false,
  },
];

export const DEMO_MEMBERS = [
  { id: "demo-user-1", displayName: "Marisol", role: "member", bio: "Fan del realismo mágico y el café de olla.", favoriteGenres: ["Realismo mágico", "Poesía"], avatarId: "avatar-1.svg" },
  { id: "demo-user-2", displayName: "Iván", role: "member", bio: "Lee de noche con música lofi de fondo.", favoriteGenres: ["Ciencia ficción"], avatarId: "avatar-2.svg" },
  { id: "demo-user-3", displayName: "Renata", role: "member", bio: "Siempre trae reseñas más largas que el libro.", favoriteGenres: ["Clásicos", "Ensayo"], avatarId: "avatar-3.svg" },
  { id: "demo-user-4", displayName: "Dana (admin)", role: "admin", bio: "Organiza las reuniones y elige el café.", favoriteGenres: ["Fábula", "Realismo mágico"], avatarId: "avatar-4.svg" },
];

export const DEMO_RECOMMENDATIONS = [
  { title: "Rayuela", author: "Julio Cortázar", genre: "Vanguardia", reason: "Para retar nuestra forma de leer.", link: "", uid: "demo-user-2", authorName: "Iván", status: "sugerido" },
  { title: "Mujeres que corren con los lobos", author: "Clarissa Pinkola Estés", genre: "Ensayo", reason: "Buenas discusiones garantizadas.", link: "", uid: "demo-user-3", authorName: "Renata", status: "considerado" },
];

export const DEMO_EVENTS = [
  { title: "Sesión de otoño", chapters: "Capítulos 1 al 5 de Cien años de soledad", note: "Traer algo para compartir en la mesa.", daysFromNow: 7 },
  { title: "Cierre de El principito", chapters: "Libro completo", note: "", daysFromNow: -14 },
];

/**
 * Siembra los datos de demostración en Firestore. Debe ejecutarse
 * manualmente (botón en demo-data.html) y solo en un proyecto de pruebas.
 */
export async function seedDemoData() {
  for (const book of DEMO_BOOKS) {
    const { id, ...data } = book;
    await setDoc(doc(db, "books", id), { ...data, avgRating: 0, reviewCount: 0, createdAt: serverTimestamp() });
  }
  for (const member of DEMO_MEMBERS) {
    const { id, ...data } = member;
    await setDoc(doc(db, "users", id), { ...data, email: `${id}@example.com`, joinedAt: serverTimestamp(), reviewCount: 0 });
  }
  for (const rec of DEMO_RECOMMENDATIONS) {
    await addDoc(collection(db, "recommendations"), { ...rec, createdAt: serverTimestamp() });
  }
  for (const ev of DEMO_EVENTS) {
    const date = new Date();
    date.setDate(date.getDate() + ev.daysFromNow);
    await addDoc(collection(db, "events"), {
      title: ev.title,
      date: Timestamp.fromDate(date),
      bookId: null,
      bookTitle: "",
      chapters: ev.chapters,
      note: ev.note,
      createdAt: serverTimestamp(),
    });
  }
}
