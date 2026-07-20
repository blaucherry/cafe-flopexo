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
  const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(AMBIENT_MUSIC_PLAYLIST_ID)}`;

  if (isPlaceholder) {
    fallbackMsg.hidden = false;
    fallbackMsg.textContent =
      "Configura AMBIENT_MUSIC_PLAYLIST_ID en js/firebase-config.js para activar la música ambiental.";
    toggleBtn.disabled = true;
    return;
  }

  const savedVisible = localStorage.getItem(STORAGE_KEY);
  const visible = savedVisible === null ? false : savedVisible === "true";

  const externalLink = document.createElement("a");
  externalLink.href = playlistUrl;
  externalLink.target = "_blank";
  externalLink.rel = "noopener noreferrer";
  externalLink.className = "btn btn--ghost btn--sm music-card__external";
  externalLink.textContent = "Abrir playlist en YouTube ↗";
  card.appendChild(externalLink);

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
        // YouTube requiere un área suficientemente alta para que sus controles
        // sean utilizables. Con 80 px mostraba la portada, pero el botón de
        // reproducción podía quedar bloqueado en algunos navegadores.
        iframe.height = "220";
        iframe.title = "Música ambiental de Café Flopexo";
        iframe.src =
          `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(AMBIENT_MUSIC_PLAYLIST_ID)}&autoplay=0&loop=1&playsinline=1`;
        iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
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
