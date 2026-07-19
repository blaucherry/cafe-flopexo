// js/firebase-config.example.js
//
// COPIA este archivo como "firebase-config.js" (mismo directorio) y sustituye
// los valores con los que te da la consola de Firebase al registrar tu app web.
//
// IMPORTANTE:
// - Este objeto NO es un secreto. Firebase está diseñado para que firebaseConfig
//   viaje en el frontend. La seguridad real de Café Flopexo depende de:
//     1) Firebase Authentication (quién puede iniciar sesión)
//     2) Firestore Security Rules (qué puede leer/escribir cada usuario)
//   NUNCA coloques aquí claves privadas de servicio, tokens de administrador
//   ni credenciales de cuentas de servicio: esas jamás deben estar en un
//   repositorio ni en código que corra en el navegador.
// - firebase-config.js SÍ puede subirse a GitHub sin problema. Si prefieres
//   no exponerlo por preferencia personal, agrégalo a .gitignore y publícalo
//   manualmente en cada despliegue.

export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID",
};

// ID de la playlist de YouTube para la música ambiental (ver js/music.js).
// Reemplázalo por el ID real de una playlist pública de YouTube.
// Ejemplo de cómo se ve un ID (esto NO es un ID real, es un marcador):
// https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export const AMBIENT_MUSIC_PLAYLIST_ID = "REEMPLAZA_CON_TU_PLAYLIST_ID";
