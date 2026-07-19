# Café Flopexo ☕📚

Club de lectura privado para un grupo pequeño de amigos (5–8 personas).
Sitio estático (HTML5 + CSS3 + JavaScript modular vanilla) publicado en
GitHub Pages, con datos y autenticación en Firebase (plan gratuito Spark).

---

## 1. Requisitos

- Una cuenta de Google para crear el proyecto de Firebase.
- Node **no es necesario**: no hay proceso de compilación.
- Un servidor HTTP simple para probar localmente (ver sección 10).

---

## 2. Crear el proyecto Firebase

1. Ve a <https://console.firebase.google.com/>.
2. Haz clic en **"Agregar proyecto"**.
3. Ponle un nombre, por ejemplo `cafe-flopexo`.
4. Puedes desactivar Google Analytics (no es necesario para este proyecto).
5. Espera a que se cree el proyecto.

## 3. Activar Authentication con correo, contraseña y Google

1. En el menú lateral, ve a **Build → Authentication**.
2. Haz clic en **"Comenzar"**.
3. En la pestaña **"Sign-in method"**, habilita el proveedor
   **"Correo electrónico/contraseña"** (Email/Password). Dale a **Guardar**.
4. No actives "Vínculo de correo electrónico" (magic link).
5. Habilita también el proveedor **Google** y selecciona el correo de
   asistencia del proyecto. Las cuentas de Google sin perfil aprobado verán
   un aviso y no podrán acceder al contenido del club.

## 4. Crear Firestore

1. En el menú lateral, ve a **Build → Firestore Database**.
2. Haz clic en **"Crear base de datos"**.
3. Elige el modo **producción** (no "modo de prueba"): las reglas reales
   están en `firestore.rules` y se publican en el paso 8.
4. Elige la región más cercana a tu grupo (por ejemplo, una región de EE.UU.
   o la más cercana a México disponible en el plan Spark).

## 5. Registrar la aplicación web

1. En la página principal del proyecto (Resumen del proyecto), haz clic en
   el ícono **"</>"** (Web) para agregar una app web.
2. Ponle un apodo, por ejemplo `cafe-flopexo-web`.
3. **No** actives Firebase Hosting aquí (usaremos GitHub Pages).
4. Copia el objeto `firebaseConfig` que te muestra la consola.

## 6. Configurar `js/firebase-config.js`

1. Abre `js/firebase-config.js` en el repositorio.
2. Sustituye los valores de `firebaseConfig` con los que copiaste en el
   paso anterior.
3. Recuerda: **`firebaseConfig` no es una contraseña** y puede vivir en el
   frontend sin problema — la protección real depende de Authentication y
   de las reglas de Firestore (`firestore.rules`), no de ocultar esta
   configuración. Lo que **nunca** debe subirse al repositorio son claves
   de cuentas de servicio, tokens de administrador u otros secretos de
   backend; este proyecto no los usa en ningún momento.
4. Opcional: configura `AMBIENT_MUSIC_PLAYLIST_ID` con el ID de una
   playlist pública de YouTube de música ambiental (café, lluvia, lectura).
   Mientras no lo configures, la tarjeta de música mostrará un aviso en
   vez de fallar.

## 7. Crear manualmente las cuentas (5–8 personas)

Café Flopexo **no tiene registro público**. Cada cuenta se crea a mano:

1. En **Authentication → Users**, haz clic en **"Agregar usuario"**.
2. Escribe el correo y una contraseña temporal para cada miembro.
3. Repite para cada una de las 5–8 personas del club.
4. Comparte de forma privada (no por este repositorio) el correo y la
   contraseña temporal con cada persona, y pídeles que la cambien con
   "Olvidé mi contraseña" desde `login.html`.

Después, por cada persona creada, debes crear su documento de perfil en
Firestore (ver siguiente paso), porque `requireAuth()` exige que exista
`users/{uid}` para considerar la sesión válida.

## 8. Crear el primer usuario administrador y los perfiles

1. En **Firestore Database → Datos**, crea manualmente una colección
   llamada `users`.
2. Por cada persona que creaste en Authentication, copia su **UID** (lo
   ves en la lista de Authentication → Users) y crea un documento en
   `users` con **ese UID como ID del documento**.
3. Campos del documento (todos como texto/número/booleano según
   corresponda):
   ```
   displayName: "Nombre visible"
   email: "correo@ejemplo.com"
   role: "member"          // o "admin" para la primera cuenta administradora
   bio: ""
   favoriteGenres: []
   avatarId: "avatar-1.svg"
   joinedAt: <marca de tiempo actual>
   reviewCount: 0
   ```
4. Para la administradora del club, usa `role: "admin"`. Este es el
   **único** lugar donde se asigna el rol admin: nunca se hace desde el
   cliente (las reglas de Firestore lo impiden explícitamente).

## 9. Publicar las reglas de Firestore

Opción A — desde la consola (más simple, sin instalar nada):

1. Ve a **Firestore Database → Reglas**.
2. Borra el contenido y pega el contenido completo de `firestore.rules`.
3. Haz clic en **Publicar**.

Opción B — con Firebase CLI (si prefieres línea de comandos):

```bash
npm install -g firebase-tools
firebase login
firebase init firestore   # selecciona tu proyecto, usa firestore.rules y firestore.indexes.json existentes
firebase deploy --only firestore:rules,firestore:indexes
```

## 10. Agregar PDFs autorizados

Sigue las instrucciones de [`books/README.md`](./books/README.md),
incluyendo el aviso de privacidad sobre archivos estáticos en GitHub
Pages.

## 11. Probar localmente con un servidor HTTP

Los módulos ES no funcionan abriendo `index.html` directamente con
`file://`; necesitas un servidor local. Ejemplos:

```bash
# Con Python 3 (ya viene instalado en la mayoría de sistemas)
python3 -m http.server 8000

# O con la extensión "Live Server" de VS Code
```

Abre `http://localhost:8000/login.html` en el navegador.

## 12. Subir el código a GitHub

```bash
git init
git add .
git commit -m "Café Flopexo: versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cafe-flopexo.git
git push -u origin main
```

## 13. Activar GitHub Pages

1. En tu repositorio de GitHub, ve a **Settings → Pages**.
2. En "Source", elige la rama `main` y la carpeta `/ (root)`.
3. Guarda. GitHub te dará una URL como:
   `https://TU_USUARIO.github.io/cafe-flopexo/`

## 14. Añadir el dominio de GitHub Pages a los dominios autorizados de Firebase

1. En Firebase Console, ve a **Authentication → Settings → Authorized
   domains**.
2. Haz clic en **"Agregar dominio"** y añade:
   `TU_USUARIO.github.io`
3. Sin este paso, el login fallará en producción con un error de dominio
   no autorizado.

---

## 15. Lista de verificación antes de publicar

- [ ] `js/firebase-config.js` tiene los valores reales del proyecto (no los de ejemplo).
- [ ] Authentication con correo/contraseña y Google está activado.
- [ ] Las 5–8 cuentas fueron creadas manualmente en Authentication.
- [ ] Cada cuenta tiene su documento `users/{uid}` correspondiente en Firestore.
- [ ] Existe al menos una cuenta con `role: "admin"`.
- [ ] Las reglas de `firestore.rules` fueron publicadas (no quedó el modo de prueba).
- [ ] Los índices de `firestore.indexes.json` fueron creados (o Firestore los sugirió automáticamente la primera vez que corrió la consulta).
- [ ] Los PDFs autorizados están dentro de `/books/` y sus rutas en Firestore siguen el formato `books/nombre.pdf`.
- [ ] `TU_USUARIO.github.io` está en los dominios autorizados de Authentication.
- [ ] GitHub Pages está activo y la URL carga `login.html` correctamente.
- [ ] Se probó iniciar sesión, ver el dashboard, abrir un libro y dejar una reseña.
- [ ] Los datos de demostración (`demo-data.html`) **no** se usaron en el proyecto real, o se limpiaron si se usaron solo para pruebas.

---

## 16. ¿Por qué existe cada módulo? (decisiones arquitectónicas)

| Archivo | Por qué existe |
|---|---|
| `js/app.js` | Inicializa Firebase una sola vez (evita errores de doble inicialización) y centraliza utilidades compartidas: toasts, formato de fecha, escape de HTML, header reutilizable. |
| `js/auth.js` | Aísla toda la lógica de sesión: guardas `requireAuth`/`requireAdmin`, login, logout, recuperación de contraseña. Así ninguna página privada olvida proteger su contenido. |
| `js/books.js` | Carga y cachea los libros una sola vez por página para minimizar lecturas de Firestore; centraliza validación de rutas de PDF y CRUD administrativo. |
| `js/reviews.js` | Encapsula la lógica de "una reseña por miembro por libro" (doc id = uid) y el recálculo transaccional de `avgRating`/`reviewCount`, para que ninguna pantalla tenga que reimplementar ese cálculo. |
| `js/recommendations.js` | Aísla la detección de duplicados y el flujo de moderación (estado solo editable por admin). |
| `js/calendar.js` | Separa próximas/pasadas y centraliza el formato de fecha en español de México. |
| `js/profiles.js` | Limita explícitamente qué campos puede editar un miembro de su propio perfil (nunca correo/rol). |
| `js/admin.js` | Punto único de entrada para todas las acciones administrativas, reexportando funciones de los módulos anteriores en vez de duplicar lógica. |
| `js/music.js` | Aísla el reproductor de YouTube y la preferencia de mostrar/ocultar en `localStorage`, la única excepción permitida a "no simular persistencia con localStorage". |
| `js/demo-data.js` + `demo-data.html` | Mantiene los datos ficticios completamente separados del código de producción y fuera de la navegación normal, para que nunca se carguen sin acción explícita del administrador. |
| `firestore.rules` | Es la verdadera capa de seguridad: valida tipos, rangos, dueño del documento y roles en cada operación, sin confiar en lo que el cliente afirme. |

---

## 17. Riesgos y limitaciones

- **PDFs públicos por URL**: GitHub Pages sirve todo el repositorio como
  contenido estático. El login protege la interfaz, no impide que alguien
  con la URL exacta de un PDF lo descargue directamente. Ver aviso en
  `books/README.md`.
- **Sin backend real**: toda la lógica de negocio vive en el cliente +
  reglas de Firestore. Esto es apropiado para un grupo de confianza de
  5–8 personas, pero no escala a un producto público.
- **Cuotas del plan Spark**: son generosas para este volumen de uso, pero
  si el club creciera mucho o hubiera un patrón de tráfico inusual, habría
  que revisar límites diarios de lecturas/escrituras.
- **Nombre y avatar desnormalizados en reseñas/recomendaciones**: si
  alguien cambia su nombre visible o avatar, sus reseñas y recomendaciones
  pasadas conservarán los valores anteriores hasta que las edite de nuevo.
  Es un trade-off intencional para evitar lecturas extra; ver el
  comentario en `js/reviews.js`.

---

## 18. Tabla de pruebas manuales

| Área | Caso de prueba | Resultado esperado |
|---|---|---|
| Autenticación | Entrar con credenciales correctas | Redirige a `index.html` con sesión activa |
| Autenticación | Entrar con contraseña incorrecta | Mensaje de error claro, sin redirigir |
| Autenticación | Abrir `biblioteca.html` sin sesión | Redirige a `login.html` |
| Autenticación | Clic en "Olvidé mi contraseña" | Envía correo de restablecimiento |
| Autenticación | Cerrar sesión | Vuelve a `login.html`; páginas privadas quedan protegidas de nuevo |
| Permisos | Miembro intenta abrir `admin.html` | Redirige a `index.html` (por UX) y las reglas de Firestore igual bloquean cualquier escritura administrativa |
| Permisos | Miembro edita el perfil de otro miembro (vía consola/API) | Denegado por `firestore.rules` |
| Permisos | Miembro intenta ponerse `role: "admin"` | Denegado por `firestore.rules` |
| Reseñas | Miembro califica un libro por primera vez | Se crea su reseña; `avgRating`/`reviewCount` del libro se actualizan |
| Reseñas | Miembro edita su propia reseña | Se actualiza sin crear una segunda reseña |
| Reseñas | Miembro intenta eliminar la reseña de otra persona | Denegado por `firestore.rules` (salvo admin) |
| Reseñas | Calificación fuera de rango (0 o 6) enviada manualmente | Denegado por `firestore.rules` |
| Administración | Admin crea un libro nuevo | Aparece en `biblioteca.html` en la sección correspondiente a su estado |
| Administración | Admin marca un libro como "actual" | Aparece en el dashboard de `index.html` como "Leyendo ahora" |
| Administración | Admin archiva un libro | Deja de aparecer en `biblioteca.html` |
| Administración | Admin cambia el estado de una recomendación | El nuevo estado se refleja para todos los miembros |
| Calendario | Admin crea un evento futuro | Aparece como "Próxima reunión" en `index.html` y `calendario.html` |
| Música | Activar/desactivar el reproductor y recargar la página | La preferencia se recuerda vía `localStorage` |
| Accesibilidad | Navegar con teclado (Tab) por formularios | Foco visible en todos los controles interactivos |
| Responsive | Ver `biblioteca.html` en un celular angosto | El menú se colapsa en hamburguesa y las tarjetas se reacomodan en 2 columnas |

---

## 19. Mejoras posibles para una segunda versión

- Adaptador de almacenamiento privado para PDFs (Firebase Storage con
  reglas de acceso, plan Blaze, o un proveedor externo con URLs firmadas),
  reemplazando la carpeta `/books/` estática.
- Cloud Function que sincronice `authorName`/`authorAvatar` en reseñas y
  recomendaciones cuando un miembro actualiza su perfil.
- Subida de avatar personalizado (actualmente solo hay avatares
  predefinidos para evitar Storage de pago).
- Comentarios generales por libro más allá de la reseña principal
  (`books/{bookId}/comments/{commentId}` ya está contemplado en el modelo
  de datos, pero no se implementó su interfaz en esta versión).
- Votaciones sobre recomendaciones.
- Notificaciones (por correo o push) antes de cada reunión.
- Paginación real ("cargar más") en reseñas cuando la colección crezca
  más allá del límite actual.
- Modo oscuro respetando la paleta cálida existente.

---

## 20. Estructura del proyecto

```
/
├── index.html            Dashboard privado
├── login.html             Inicio de sesión / recuperación
├── biblioteca.html        Estantería con búsqueda y filtros
├── libro.html              Ficha + lector PDF.js + reseñas
├── calendario.html        Próxima reunión y actividades
├── recomendaciones.html   Recomendaciones de miembros
├── miembros.html           Directorio del club
├── perfil.html              Edición de perfil propio
├── admin.html               Panel exclusivo de administración
├── demo-data.html          Sembrado manual de datos de ejemplo (solo admin)
├── css/
│   ├── styles.css          Variables, tipografía, layout base
│   ├── components.css      Tarjetas, botones, formularios, toasts…
│   └── responsive.css      Ajustes de tablet y celular
├── js/
│   ├── firebase-config.example.js
│   ├── firebase-config.js   ← edita este con tus datos reales
│   ├── app.js                Init de Firebase + utilidades compartidas
│   ├── auth.js                 Sesión, login, logout, guardas de ruta
│   ├── books.js                 Libros: carga, filtros locales, CRUD
│   ├── reviews.js                Reseñas y cálculo de promedios
│   ├── recommendations.js        Recomendaciones de miembros
│   ├── calendar.js                Eventos del club
│   ├── profiles.js                 Perfiles y directorio
│   ├── admin.js                     Orquestación del panel admin
│   ├── music.js                      Reproductor de YouTube
│   └── demo-data.js                   Datos ficticios (uso manual)
├── assets/
│   ├── images/
│   ├── icons/
│   └── avatars/            8 avatares SVG predefinidos
├── books/
│   └── README.md            Instrucciones + aviso de privacidad
├── firestore.rules
├── firestore.indexes.json
└── README.md                 Este archivo
```
