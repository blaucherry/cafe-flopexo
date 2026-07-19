// js/profiles.js
//
// Directorio de miembros y edición de perfil propio. El correo y el rol
// jamás se editan desde aquí: solo displayName, bio, favoriteGenres[] y
// avatarId (predefinido, sin subida de imágenes).

import {
  collection, doc, getDocs, getDoc, updateDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db, AVATAR_IDS } from "./app.js";

export const BIO_MAX_LENGTH = 280;

export async function loadMembers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMember(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateOwnProfile(uid, { displayName, bio, favoriteGenres, avatarId }) {
  const payload = {};
  if (displayName !== undefined) {
    const clean = displayName.trim();
    if (!clean) throw new Error("El nombre visible no puede estar vacío.");
    payload.displayName = clean.slice(0, 60);
  }
  if (bio !== undefined) payload.bio = bio.trim().slice(0, BIO_MAX_LENGTH);
  if (favoriteGenres !== undefined) {
    payload.favoriteGenres = Array.isArray(favoriteGenres)
      ? favoriteGenres.slice(0, 8).map((g) => g.trim()).filter(Boolean)
      : [];
  }
  if (avatarId !== undefined) {
    payload.avatarId = AVATAR_IDS.includes(avatarId) ? avatarId : AVATAR_IDS[0];
  }
  await updateDoc(doc(db, "users", uid), payload);
}
