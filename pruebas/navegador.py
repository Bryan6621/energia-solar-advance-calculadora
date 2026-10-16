"""pruebas/navegador.py — recorre la calculadora en Chromium (Playwright) y
guarda capturas en pruebas/capturas/. Falla si hay errores de consola.
Uso: python3 -m http.server 8090 (en la raíz) y luego python3 pruebas/navegador.py"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8090/"
SALIDA = Path(__file__).parent / "capturas"
SALIDA.mkdir(exist_ok=True)
errores = []

RUTAS = [
    ("inicio", "#/"), ("factura", "#/educativo/1"), ("dimension", "#/educativo/2"),
    ("economia", "#/educativo/3"), ("finanzas", "#/educativo/4"), ("autonomo", "#/educativo/5"),
    ("tecnico", "#/educativo/6"), ("verificar", "#/educativo/verificar"), ("pro", "#/pro"),
    ("simulador", "#/simulador"), ("detective", "#/detective"), ("asesor", "#/asesor"),
    ("certificado", "#/certificado"),
]

with sync_playwright() as p:
    nav = p.chromium.launch()
    for nombre_disp, vista, esquema in [("movil", {"width": 390, "height": 844}, "light"),
                                         ("escritorio", {"width": 1280, "height": 900}, "light"),
                                         ("movil-oscuro", {"width": 390, "height": 844}, "dark")]:
        ctx = nav.new_context(viewport=vista, device_scale_factor=2 if "movil" in nombre_disp else 1, color_scheme=esquema)
        pag = ctx.new_page()
        pag.on("console", lambda m: errores.append(f"{nombre_disp}: {m.text}") if m.type == "error" else None)
        pag.on("pageerror", lambda e: errores.append(f"{nombre_disp}: pageerror {e}"))
        pag.add_init_script("localStorage.setItem('advance:instalar', String(Date.now()))")
        pag.goto(BASE + "#/")
        pag.wait_for_timeout(600)
        for nombre, ruta in RUTAS:
            if nombre_disp != "movil" and nombre not in ("inicio", "dimension", "finanzas", "verificar", "economia"):
                continue
            pag.evaluate(f"location.hash = '{ruta}'")
            pag.wait_for_timeout(500)
            pag.screenshot(path=str(SALIDA / f"{nombre_disp}_{nombre}.png"), full_page=True)
        ctx.close()
    nav.close()

print(f"{len(errores)} errores de consola")
for e in errores:
    print("  ", e)
sys.exit(1 if errores else 0)
