# Calculadora Solar Advance 2.0 — Informe de ajustes y novedades

Fecha: 16-oct-2026 · Versión anterior: 1.x (commit `ac76b97`, 10-oct-2026) · Versión nueva: 2.0.0 · Referencia: manuscrito 1.1.0 del libro

**Resultado**: `node pruebas/verificar.js` → **0 discrepancias en 61 comprobaciones** (40 cifras de los tres casos del libro y la integridad de las 21 fórmulas). El recorrido en Chromium de las 13 vistas, en teléfono y escritorio, con modo claro y oscuro, terminó con **0 errores de consola**. Además, la app abre sin conexión.

---

## 1. Verificación de fórmulas: hallazgos y correcciones

La calculadora anterior estaba alineada con el libro antes de la auditoría (1.0.0). Contra el manuscrito 1.1.0, contradecía al PDF en casi todas las cifras del caso Torres. Una de sus propias verificaciones fallaba en silencio.

| N.º | Hallazgo | Antes | Ahora |
|---|---|---|---|
| C1 | Caso Torres desactualizado | 1.800 Wp, 4 paneles, 181 kWh, CAPEX 2.160, payback 7,1, LCOE 0,055 | 2.250 Wp, 5 paneles, 226,8 kWh, CAPEX 2.700, payback 7,3, LCOE 0,058 simple y 0,113 descontado |
| C2 | La verificación de Los Alisos daba «revisar» | La fórmula daba 0,34 frente al 0,38 esperado y quedaba fuera de tolerancia | Costo por kWh **servido**: 5.400 ÷ (788 kWh × 15) = 0,46, como el capítulo 27 corregido |
| C3 | El ahorro contaba el excedente a precio de tarifa | Ahorro = útil × tarifa: 226,8 × 0,15 = 34 USD | Ahorro = mín(útil, consumo) × tarifa + excedente × su valor = 33 USD (Torres) y 422 USD (La Espiga) |
| C4 | La factura con el sistema se calculaba con un dato fijo y viejo | Pedía «38,6 kWh que se siguen comprando» | La calcula: máx(0, consumo − útil) × tarifa + cargos fijos. Torres: 40 → 7 USD |
| C5 | El LCOE no tenía degradación, tope de consumo ni versión descontada | Reemplazos de 840 sin OPEX, producción constante | Motor completo, idéntico a `verificar_cifras.py`: OPEX, inversor del año 12, degradación del 0,5 %, energía aprovechada y tasa de descuento |
| C6 | El costo de no hacer nada usaba el 3 % | 5.503 USD en 10 años | 5 % como el capítulo 24 («más de 6.000»): 6.037 USD. Se agregó el horizonte como dato editable |
| C7 | Supuestos del generador distintos a los del libro | 0,5 L/h × 1,4 USD/L | 0,7 L/h × 1 USD/L (15 USD) y, al lado, el generador puro: 216 h × 0,4 L/h ≈ 86 USD |
| C8 | Producción con degradación (Pro): exponente corrido un año | E1 × (1 − d)^n | E1 × (1 − d)^(n − 1): el año 1 es el año 1 |
| C9 | Potencia a temperatura real (Pro): usaba el coeficiente del Voc | γ = −0,29 %/°C, que es el coeficiente del Voc | Coeficiente de potencia de la ficha, típico −0,35 %/°C, con la aclaración en pantalla |
| C10 | Ventana MPPT: un mismo coeficiente para Voc y Vmp | Un solo coeficiente | Coeficientes separados del Voc y del Vmp. Valores del caso Torres: ventana de 5 a 13 módulos |
| C11 | PR y factor de planta con datos de partida incoherentes | PR = 1.814 ÷ (1.530 × 1,8) = 0,66, un sistema «enfermo» como ejemplo | Datos del caso Torres: PR 0,80 |
| C12 | VPN y TIR del modo Pro con flujo constante simplificado | Ahorro neto fijo de 304 USD sin reemplazo | Pasan al módulo Finanzas con el flujo real: VPN +1.030 USD, TIR 12,4 % (Torres); +14.998 USD, 22,3 % (La Espiga antes de impuestos) |
| C13 | Simulador sin OPEX ni reemplazo, payback en años enteros | Payback entero | OPEX, inversor del año 12 y payback interpolado: 7,3 años (coincide con el libro) |
| C14 | Examen con dos preguntas del caso viejo | «LCOE 0,055» y «1.800 Wp → 181 kWh» como respuestas correctas | 0,058 y 226,8 kWh. Pregunta nueva sobre la regla de la cuota más la factura residual |

## 2. Fórmulas nuevas (el libro ya las enseñaba)

| Fórmula | Capítulo | Caso Torres | Caso La Espiga |
|---|---|---|---|
| Costo efectivo del kWh | 2 | 0,18 USD/kWh frente a 0,15 de la energía | 0,21 frente a 0,20 |
| Cuota y factura residual | 4 y 23 | 33,4 + 7 = 40,4 USD frente a 40; con crédito del 100 %: 54,7 | 254 USD; con crédito del 100 %: 362 |
| VPN y TIR con flujos reales | 4 | +1.030 USD · 12,4 % | +14.998 USD · 22,3 % |
| Cobertura de deuda (DSCR) | 23 | — | 1,56 (flujo libre de 143 USD al mes) |

El módulo **Finanzas** reúne estas tres fórmulas y repite en su encabezado la regla del libro: la cuota se compara con la factura residual, nunca con la factura completa.

## 3. Verificación contra el libro (pantalla «Verificar»)

| Caso | Cifras comparadas | Coinciden |
|---|---|---|
| Familia Torres | 16 | 16 |
| Panadería La Espiga (caso nuevo) | 13 | 13 |
| Finca Los Alisos | 11 | 11 |

Cada fila enlaza a su fórmula. El botón «Cargar el caso en todas las fórmulas» deja la calculadora lista para la clase o para la mesa del cliente.

`pruebas/verificar.js` es la contraparte de `herramientas/verificar_cifras.py` del libro: si el libro cambia una cifra, la prueba falla hasta que la calculadora la acompañe.

## 4. Diseño premium

- **La misma identidad del libro**: azul marino de la tinta, dorado de los números de capítulo, Source Serif 4 para lo que se lee e Inter para lo que se opera. Las fuentes van incluidas y funcionan sin conexión.
- **La operación viva**: cada fórmula se escribe con los números del usuario en una servilleta cuadriculada, por ejemplo «2.700 ÷ (396 − 27) = 7,3 años». Es la promesa del capítulo 31 hecha interfaz: cada resultado muestra la operación de la que nace.
- **Gráficas en vivo en las 21 fórmulas**, con un motor SVG propio (sin librerías, sin conexión). Responden a cada tecla y a cada deslizador:
  - curvas: Wp frente a HSP, Voc de la cadena frente a temperatura con el límite del equipo, sección de cable frente a distancia;
  - cascada de energía ideal a útil;
  - paneles calculados frente a comprados;
  - medidores de cobertura y de DSCR con el umbral de 1,25;
  - caja acumulada nominal y descontada, que termina en el VPN;
  - cuota frente a factura;
  - LCOE frente a red y generador.
  
  Al pasar el dedo se ve cada valor. La paleta se validó para daltonismo en los dos modos.
- **Deslizador más casilla** en cada dato, con su unidad visible. Las fórmulas con más de seis supuestos pliegan los secundarios en «Más supuestos», y todos siguen entrando en la cuenta.
- **Resultados secundarios** bajo el número principal: el error del ×1,2, el payback ilusorio sin OPEX, el breaker y la sección comercial siguientes, las baterías a comprar y el máximo de paneles en serie.
- **Inicio rediseñado**: el lema del libro y «La servilleta de los Torres» con las cuatro cuentas clave y un enlace a sus 16 cifras verificadas.
- **Navegación**: pestañas inferiores en el teléfono y barra superior en el escritorio. Las tarjetas se ven en dos columnas en pantallas anchas (datos a la izquierda, resultado y gráfica a la derecha).
- **Modo oscuro** con su propia paleta (no invertida). Sigue la preferencia del sistema y se puede elegir a mano.
- **Moneda**: la tasa orientativa de cada país se puede editar y se recuerda. Toda la app escribe los números con coma decimal y punto de miles.

## 5. Correcciones de seguridad, privacidad y calidad

| Hallazgo | Riesgo | Corrección |
|---|---|---|
| La pantalla de verificación del diploma insertaba los datos de la URL sin escapar | Cualquiera podía armar un enlace con código que se ejecutaba en la app (XSS) | Todo dato externo se escapa. Probado con un enlace malicioso: no se inserta nada |
| El QR del diploma se generaba en api.qrserver.com | El nombre y el número de documento del alumno viajaban a un tercero, y sin conexión el diploma salía sin QR | Generador QR incluido (`js/qr.js`, Apache-2.0), sin conexión. QR verificado por decodificación |
| La verificación decía «Diploma auténtico» para cualquier enlace | Afirmaba algo que la app no puede comprobar (no tiene servidor) | Ahora se titula «Datos del diploma» y explica qué prueba el QR y qué no |
| Texto legal: «se enmarca en ISO/IEC 17024» | ISO/IEC 17024 exige un organismo certificador acreditado | Ahora dice que el contenido toma como referencia la IEC 62446-1 y que no es una certificación acreditada bajo ISO/IEC 17024. **Validar con el área legal** |
| `alert()`, `prompt()` e impresión automática del diploma al aprobar | Ventanas nativas bruscas y una impresión que el alumno no pidió | Avisos propios dentro de la app. El diploma se descarga cuando el alumno lo pide y muestra antes el repaso de los errores |
| Ventana de instalación obligatoria en cada visita | Bloqueaba la app al que solo quería consultar | Hoja discreta que aparece una vez y no vuelve en 7 días si se responde «Ahora no» |
| Proyectos guardados con identificadores numéricos | Al renumerar las fórmulas, los proyectos viejos se habrían abierto en la fórmula equivocada | Claves estables por nombre y migración automática de los proyectos de la versión 1 |
| Aviso de «actualizada» también en la primera visita | Confuso | Solo aparece cuando de verdad hubo una versión anterior |

## 6. Novedades de la PWA

- Instalación con accesos directos (Dimensionar, Finanzas, Verificar), icono adaptable y orientación libre (tableta horizontal).
- Service worker v10: la app completa (fuentes, iconos y gráficas) funciona sin conexión desde la primera visita. Probado en Chromium con la red cortada.
- Enlaces profundos a cada fórmula, por ejemplo `#/educativo/4/cuota`.
- Repaso de las respuestas incorrectas al terminar el examen, haya aprobado o no.
- Detective de facturas con alertas útiles para la venta: cargos fijos que ningún sistema elimina, un mes atípico frente al promedio, subsidios que se pierden y costo efectivo frente al precio de la energía.

## 7. Decisiones que conviene conocer

1. **Publicación**: los archivos no se subieron a GitHub porque esta sesión no tiene acceso a la cuenta. Hay que subir la carpeta a la rama de GitHub Pages (instrucciones en `README.md`). Como `VERSION` ya cambió, los teléfonos que tienen la app instalada se actualizan solos en la siguiente apertura con conexión.
2. **Logo e iconos**: se conservan los de la marca de la calculadora (violeta). El resto de la app usa la paleta del libro. Si quieren unificar, solo falta un icono nuevo.
3. **Tasas de cambio**: siguen siendo orientativas y ahora se pueden editar. No se consultan en línea, para no depender de la conexión.
4. **Paneles de La Espiga**: la fórmula da 47 paneles. El libro instala 48 por simetría de cuatro cadenas de doce, así que la verificación de ese caso compara la producción de 21,6 kWp, no el conteo.
5. **Impuestos de La Espiga**: el VPN con impuestos e incentivos (+11.523 USD, 23,3 %) depende de la ley de cada país. La calculadora muestra el flujo antes de impuestos y remite al capítulo 4 y al contador.

## 8. Archivos

| Archivo | Cambio |
|---|---|
| `js/motor.js`, `js/graficos.js`, `js/qr.js`, `pruebas/verificar.js`, `pruebas/navegador.py`, `fuentes/`, `README.md`, `LICENCIAS-TERCEROS.txt`, `iconos/icon-maskable-512.png` | Nuevos |
| `js/formulas.js`, `js/app.js`, `js/venta.js`, `js/herramientas-pro.js`, `js/examen.js`, `css/app.css`, `index.html` | Reescritos |
| `manifest.json`, `service-worker.js` | Actualizados |
| `js/localizacion.js`, `js/banderas.js`, `js/almacen.js` | Sin cambios |
