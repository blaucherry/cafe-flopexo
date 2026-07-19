// js/firebase-config.js
//
// Este es el archivo que la aplicación importa realmente. Sustituye los
// valores de abajo con los que te da la consola de Firebase al registrar
// tu app web (ver README.md, sección "Registrar la aplicación web").
// Se incluye js/firebase-config.example.js como plantilla de referencia.
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
  apiKey: "AIzaSyAwyg_Ga9bFuEkhNKYphCPpu1PdlfK2bbM",
  authDomain: "cafe-flopexo.firebaseapp.com",
  projectId: "cafe-flopexo",
  storageBucket: "cafe-flopexo.firebasestorage.app",
  messagingSenderId: "817850794531",
  appId: "1:817850794531:web:7fa9fc33a6ab50cb6ca796",
};

// ID de la playlist de YouTube para la música ambiental (ver js/music.js).
// Reemplázalo por el ID real de una playlist pública de YouTube.
// Ejemplo de cómo se ve un ID (esto NO es un ID real, es un marcador):
// https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export const AMBIENT_MUSIC_PLAYLIST_ID = "REEMPLAZA_CON_TU_PLAYLIST_ID";
