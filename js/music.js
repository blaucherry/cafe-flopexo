// js/music.js
//
// Reproductor compacto de música ambiental usando un iframe oficial de
// YouTube con una playlist pública (café/lluvia/lectura). No requiere API
// key porque se usa el modo de incrustación estándar sin autoplay con
// sonido. La preferencia de mostrar/ocultar el reproductor se guarda en
// localStorage (uso explícitamente permitido por el brief para
// preferencias personales, a diferencia de datos del club).

import { AMBIENT_MUSIC_PLAYLIST_ID } from "./firebase-config.js";

const STORAGE_KEY = "flopexo:musicVisible";
const PLACEHOLDER_ID = "REEMPLAZA_CON_TU_PLAYLIST_ID";

export function initMusicWidget() {
  const card = document.querySelector("[data-music-card]");
  if (!card) return;

  const toggleBtn = card.querySelector("[data-music-toggle]");
  const frameWrap = card.querySelector("[data-music-frame]");
  const fallbackMsg = card.querySelector("[data-music-fallback]");

  const isPlaceholder = !AMBIENT_MUSIC_PLAYLIST_ID || AMBIENT_MUSIC_PLAYLIST_ID === PLACEHOLDER_ID;

  if (isPlaceholder) {
    fallbackMsg.hidden = false;
    fallbackMsg.textContent =
      "Configura AMBIENT_MUSIC_PLAYLIST_ID en js/firebase-config.js para activar la música ambiental.";
    toggleBtn.disabled = true;
    return;
  }

  const savedVisible = localStorage.getItem(STORAGE_KEY);
  const visible = savedVisible === null ? false : savedVisible === "true";
  applyVisibility(visible);

  toggleBtn.addEventListener("click", () => {
    const nowVisible = frameWrap.hasAttribute("hidden");
    applyVisibility(nowVisible);
    localStorage.setItem(STORAGE_KEY, String(nowVisible));
  });

  function applyVisibility(show) {
    if (show) {
      if (!frameWrap.querySelector("iframe")) {
        const iframe = document.createElement("iframe");
        iframe.width = "100%";
        iframe.height = "80";
        iframe.title = "Música ambiental de Café Flopexo";
        iframe.src =
          `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(AMBIENT_MUSIC_PLAYLIST_ID)}&autoplay=0&loop=1`;
        iframe.setAttribute("allow", "autoplay; encrypted-media");
        iframe.addEventListener("error", () => {
          fallbackMsg.hidden = false;
          fallbackMsg.textContent = "No se pudo cargar la música. Puede que YouTube haya bloqueado este contenido.";
        }, { once: true });
        frameWrap.appendChild(iframe);
      }
      frameWrap.hidden = false;
      toggleBtn.textContent = "Ocultar música ☕";
      toggleBtn.setAttribute("aria-expanded", "true");
    } else {
      frameWrap.hidden = true;
      toggleBtn.textContent = "Mostrar música ☕";
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  }
}
