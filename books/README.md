# Carpeta `books/`

Aquí viven los archivos PDF de los libros del club. Café Flopexo no usa
Firebase Storage (requeriría activar el plan de pago Blaze), así que los
PDFs se publican directamente como archivos estáticos dentro de este
repositorio, junto con el resto del sitio en GitHub Pages.

## Cómo agregar un PDF nuevo

1. Copia el archivo PDF dentro de esta carpeta (`books/`).
2. Usa un nombre de archivo simple, sin espacios ni acentos, por ejemplo:
   `cien-anios-de-soledad.pdf`
3. En `admin.html`, al crear o editar el libro, en el campo **"Ruta del
   PDF"** escribe exactamente:
   ```
   books/cien-anios-de-soledad.pdf
   ```
4. Guarda los cambios del libro. El lector de `libro.html` intentará abrir
   esa ruta relativa con PDF.js.
5. Haz commit y push del archivo PDF junto con el resto del código para que
   quede publicado en GitHub Pages.

## Formato de ruta permitido

Firestore únicamente aceptará rutas con este patrón (validado tanto en el
cliente como recomendado revisar antes de guardar):

```
books/nombre-de-archivo.pdf
```

- Debe empezar con `books/`.
- Solo letras, números, puntos, guiones y guiones bajos en el nombre.
- Debe terminar en `.pdf`.
- No se permiten rutas con `..` ni URLs externas.

## ⚠️ Aviso importante de privacidad

GitHub Pages publica los archivos de este repositorio como contenido
**estático y públicamente accesible por URL**, aunque la interfaz de Café
Flopexo tenga inicio de sesión. Esto significa que, si alguien conoce o
adivina la URL exacta de un PDF (por ejemplo
`https://usuario.github.io/cafe-flopexo/books/archivo.pdf`), podría
descargarlo sin iniciar sesión. El login protege la *interfaz*, no el
archivo estático en sí.

Por lo tanto:

- **Usa solamente** obras de dominio público, PDFs de tu propia autoría, o
  archivos que tengas autorización explícita para compartir con tu grupo.
- No subas aquí libros con derechos de autor vigentes sin permiso.
- Si en el futuro necesitas privacidad real a nivel de archivo, considera
  el adaptador de almacenamiento privado descrito en el README principal
  (sección "Mejoras para una segunda versión"), que reemplazaría esta
  carpeta por Firebase Storage con reglas de acceso (plan Blaze) u otro
  proveedor con URLs firmadas.

## Repositorio vacío por defecto

Este README es el único archivo versionado en `books/` por defecto. Los
PDFs reales no se incluyen en la plantilla: cada club debe agregar los
suyos siguiendo el aviso de arriba.
