// js/calendar.js
//
// Eventos del club (reuniones). Solo admin crea/edita/elimina; los miembros
// solo consultan. Las fechas se guardan como Firestore Timestamp y se
// muestran con formato amigable en español de México (America/Mexico_City),
// usando formatDateTime() de app.js.

import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy,
  Timestamp, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "./app.js";

const col = collection(db, "events");

export async function loadEvents() {
  const q = query(col, orderBy("date", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function splitEvents(events) {
  const now = new Date();
  const upcoming = [];
  const past = [];
  for (const ev of events) {
    const date = ev.date?.toDate ? ev.date.toDate() : new Date(ev.date);
    (date >= now ? upcoming : past).push(ev);
  }
  past.reverse(); // más recientes primero entre las pasadas
  return { upcoming, past };
}

export function nextEvent(events) {
  const { upcoming } = splitEvents(events);
  return upcoming[0] || null;
}

export async function createEvent({ title, dateISO, bookId, bookTitle, chapters, note }) {
  if (!dateISO) throw new Error("La fecha es obligatoria.");
  await addDoc(col, {
    title: (title || "Reunión de club").trim(),
    date: Timestamp.fromDate(new Date(dateISO)),
    bookId: bookId || null,
    bookTitle: bookTitle || "",
    chapters: (chapters || "").trim(),
    note: (note || "").trim(),
    createdAt: serverTimestamp(),
  });
}

export async function updateEvent(id, { title, dateISO, bookId, bookTitle, chapters, note }) {
  const payload = {};
  if (title !== undefined) payload.title = title.trim();
  if (dateISO !== undefined) payload.date = Timestamp.fromDate(new Date(dateISO));
  if (bookId !== undefined) payload.bookId = bookId || null;
  if (bookTitle !== undefined) payload.bookTitle = bookTitle;
  if (chapters !== undefined) payload.chapters = chapters.trim();
  if (note !== undefined) payload.note = note.trim();
  await updateDoc(doc(db, "events", id), payload);
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}
