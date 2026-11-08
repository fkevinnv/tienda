"""Añade galeria.css y galeria.js a todas las páginas de producto de /html."""
from pathlib import Path

LINK = '<link rel="stylesheet" href="/css/galeria.css">'
SCRIPT = '<script src="/js/galeria.js"></script>'

for ruta in sorted(Path("html").glob("*.html")):
    # newline="" conserva los saltos de línea originales (LF o CRLF)
    with open(ruta, encoding="utf-8", newline="") as f:
        texto = f.read()

    # Solo páginas con tarjetas de producto que aún no la tengan
    if 'class="producto"' not in texto or "galeria.js" in texto:
        continue

    nl = "\r\n" if "\r\n" in texto else "\n"
    texto = texto.replace("</head>", "  " + LINK + nl + "</head>", 1)
    texto = texto.replace("</body>", "  " + SCRIPT + nl + "</body>", 1)

    with open(ruta, "w", encoding="utf-8", newline="") as f:
        f.write(texto)
    print("actualizado:", ruta)
