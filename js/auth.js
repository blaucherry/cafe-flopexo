// js/auth.js
//
// Autenticación con correo/contraseña. No existe registro público: las
// cuentas se crean manualmente desde Firebase Console (ver README.md).
//
// Este módulo expone:
// - requireAuth(): protege páginas privadas. Redirige a login.html si no
//   hay sesión, y evita destellos de contenido privado mientras se valida.
// - requireAdmin(): además de requireAuth, exige rol "admin" o redirige.
// - loginWithEmail / logout / sendReset: acciones de autenticación.
// - getUserProfile: obtiene el documento users/{uid} del usuario actual.

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { auth, db, ROLES } from "./app.js";

let cachedProfile = null;
let cachedUid = null;

/**
 * Devuelve una promesa con el usuario actual (o null) una sola vez que
 * Firebase Auth terminó de restaurar la sesión.
 */
function waitForAuthState() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function getUserProfile(uid) {
  if (cachedProfile && cachedUid === uid) return cachedProfile;
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  cachedProfile = { id: snap.id, ...snap.data() };
  cachedUid = uid;
  return cachedProfile;
}

export function clearProfileCache() {
  cachedProfile = null;
  cachedUid = null;
}

async function createMemberProfile(user) {
  const displayName = (user.displayName || user.email?.split("@")[0] || "Miembro")
    .trim()
    .slice(0, 60);
  await setDoc(doc(db, "users", user.uid), {
    displayName,
    email: user.email || "",
    role: ROLES.MEMBER,
    bio: "",
    favoriteGenres: [],
    avatarId: "avatar-1.svg",
    joinedAt: serverTimestamp(),
    reviewCount: 0,
  });
  clearProfileCache();
  return getUserProfile(user.uid);
}

/**
 * Protege una página privada. Mantiene <body> con la clase "auth-checking"
 * (definida en CSS para ocultar el contenido) hasta resolver la sesión.
 * Devuelve { user, profile } si hay sesión válida.
 */
export async function requireAuth() {
  document.body.classList.add("auth-checking");
  const user = await waitForAuthState();
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  let profile;
  try {
    profile = await getUserProfile(user.uid);
    if (!profile) profile = await createMemberProfile(user);
  } catch (error) {
    console.error("No se pudo cargar o crear el perfil:", error);
    document.body.classList.remove("auth-checking");
    document.body.classList.add("auth-no-profile");
    return null;
  }
  document.body.classList.remove("auth-checking");
  return { user, profile };
}

/**
 * Protege páginas exclusivas de administración. Redirige a index.html
 * (con aviso) si el usuario autenticado no tiene rol admin.
 * IMPORTANTE: esto es solo UX. La protección real está en firestore.rules.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) return null;
  if (session.profile.role !== ROLES.ADMIN) {
    window.location.replace("index.html?denied=1");
    return null;
  }
  return session;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  return cred.user;
}

export async function sendReset(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  clearProfileCache();
  await signOut(auth);
  window.location.replace("login.html");
}

/**
 * Inicializa el botón de cerrar sesión presente en la navegación de todas
 * las páginas privadas (elemento con [data-logout]).
 */
export function initLogoutButton() {
  const btn = document.querySelector("[data-logout]");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.disabled = true;
    await logout();
  });
}
