"""Añade galeria.css y galeria.js a las páginas con productos de /html.

Las páginas que solo son menús (todas sus tarjetas llevan enlace) no se tocan,
y si ya la tenían de una ejecución anterior se les quita.
"""
import re
from pathlib import Path

LINK = '<link rel="stylesheet" href="/css/galeria.css">'
SCRIPT = '<script src="/js/galeria.js"></script>'


def leer(ruta):
    # newline="" conserva los saltos de línea originales (LF o CRLF)
    with open(ruta, encoding="utf-8", newline="") as f:
        return f.read()


def escribir(ruta, texto):
    with open(ruta, "w", encoding="utf-8", newline="") as f:
        f.write(texto)


def tiene_productos(texto):
    """True si hay alguna tarjeta .producto sin enlace dentro."""
    tarjetas = re.findall(r'<article class="producto"[^>]*>(.*?)</article>', texto, re.S)
    return any("<a " not in t for t in tarjetas)


for ruta in sorted(Path("html").glob("*.html")):
    texto = leer(ruta)
    if 'class="producto"' not in texto:
        continue

    ya_incluida = "galeria.js" in texto

    if tiene_productos(texto):
        if ya_incluida:
            continue
        nl = "\r\n" if "\r\n" in texto else "\n"
        texto = texto.replace("</head>", "  " + LINK + nl + "</head>", 1)
        texto = texto.replace("</body>", "  " + SCRIPT + nl + "</body>", 1)
        escribir(ruta, texto)
        print("añadida:", ruta)
    elif ya_incluida:
        texto = re.sub(r"[ \t]*" + re.escape(LINK) + r"\r?\n", "", texto)
        texto = re.sub(r"[ \t]*" + re.escape(SCRIPT) + r"\r?\n", "", texto)
        escribir(ruta, texto)
        print("quitada (es un menú):", ruta)
