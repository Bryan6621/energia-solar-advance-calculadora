/* formulas.js — las fórmulas del capítulo 31 de «Energía Solar Advance»
   (manuscrito 1.1.0), verificadas contra herramientas/verificar_cifras.py.

   Contrato de cada fórmula (todas las cuentas en USD; la app convierte):
     clave        identificador estable (proyectos guardados, presets)
     modulo       pestaña donde vive
     nombre       título corto · pregunta: qué responde, en una línea
     capitulo     capítulo del libro donde se enseña
     expresion    la fórmula en palabras
     inputs       [{clave, etiqueta, unidad, defecto, min, max, paso}]
     calculo(v)   número principal (función pura)
     decimales    del número principal
     extras(v,r,c)  resultados secundarios [{clave, etiqueta, valor, unidad}]
     operacion(v,r,c) la fórmula con los números del usuario (la «operación viva»)
     grafico(v,r,c)   especificación de la gráfica en vivo (graficos.js)
   c es el contexto de formato: c.m(usd, dec) escribe dinero en la moneda
   activa; c.n(x, dec) escribe un número en notación española.
   Sin emojis: la interfaz usa SVG. */
(function (raiz) {
  "use strict";
  var M = raiz.Motor;
  var N = function (x, d) { return M.es(x, d); };

  raiz.MODULOS = [
    { id: 1, nombre: "Factura", icono: "factura", titulo: "Diagnóstico de factura", intro: "Cuánto consume, cuánto cuesta de verdad cada kilovatio-hora y qué se sigue pagando con el sistema." },
    { id: 2, nombre: "Dimensión", icono: "dimension", titulo: "Dimensionador on-grid", intro: "Del consumo al número de paneles con la regla del ÷0,8 y el peor mes, como en el capítulo 14." },
    { id: 3, nombre: "Economía", icono: "economia", titulo: "Economía del sistema", intro: "Ahorro, payback y costo nivelado del capítulo 4, con OPEX y reemplazo del inversor incluidos." },
    { id: 4, nombre: "Finanzas", icono: "finanzas", titulo: "Financiación y rentabilidad", intro: "La cuota se compara con la factura residual, nunca con la factura completa. VPN, TIR y cobertura de deuda." },
    { id: 5, nombre: "Autónomo", icono: "autonomo", titulo: "Sistema autónomo", intro: "El banco de baterías y el costo de cada kilovatio-hora servido en la isla (Parte VIII)." },
    { id: 6, nombre: "Técnico", icono: "tecnico", titulo: "Kit técnico del vendedor", intro: "Voc en frío, protecciones, calibre de cable y generador de respaldo." }
  ];

  raiz.FORMULAS = [
    /* ============================ 1 · Factura ============================ */
    {
      clave: "consumo_diario", modulo: 1, nombre: "Consumo diario", capitulo: "cap. 14",
      pregunta: "¿Cuánta energía usa la casa en un día típico?",
      expresion: "Consumo diario = kWh del mes ÷ 30",
      unidad: "kWh/día", decimales: 2,
      inputs: [{ clave: "kwh_mes", etiqueta: "Consumo mensual de la factura", unidad: "kWh/mes", defecto: 220, min: 50, max: 1500, paso: 5 }],
      calculo: function (v) { return v.kwh_mes / 30; },
      operacion: function (v, r) { return N(v.kwh_mes) + " ÷ 30 = " + N(r, 2) + " kWh/día"; },
      grafico: function (v, r) {
        var dias = [], val = [];
        for (var d = 1; d <= 30; d++) { dias.push(String(d)); val.push(r); }
        return { tipo: "barras", titulo: "Los 30 días del mes", categorias: dias, etiquetasCada: 5,
          series: [{ nombre: "kWh por día", valores: val, tono: "azul" }],
          unidad: "kWh", decimales: 2, nota: "Total del mes: " + N(v.kwh_mes) + " kWh" };
      }
    },
    {
      clave: "costo_efectivo", modulo: 1, nombre: "Costo efectivo del kWh", capitulo: "cap. 2",
      pregunta: "¿Cuánto paga de verdad por cada kilovatio-hora, cargos incluidos?",
      expresion: "Costo efectivo = total pagado ÷ kWh del mes",
      unidad: "USD/kWh", decimales: 3,
      inputs: [
        { clave: "total", etiqueta: "Total pagado en la factura", unidad: "USD/mes", defecto: 40, min: 5, max: 500, paso: 1 },
        { clave: "kwh_mes", etiqueta: "Consumo del mes", unidad: "kWh/mes", defecto: 220, min: 50, max: 1500, paso: 5 },
        { clave: "cargos", etiqueta: "Cargos fijos incluidos", unidad: "USD/mes", defecto: 7, min: 0, max: 100, paso: 0.5 }
      ],
      calculo: function (v) { return v.total / v.kwh_mes; },
      extras: function (v, r, c) {
        return [
          { clave: "precio_energia", etiqueta: "Precio de la energía (sin cargos fijos)", valor: c.m((v.total - v.cargos) / v.kwh_mes, 3), unidad: "por kWh", n: (v.total - v.cargos) / v.kwh_mes },
          { clave: "peso_cargos", etiqueta: "Peso de los cargos fijos", valor: N(v.cargos / v.total * 100, 1) + " %", n: v.cargos / v.total * 100 }
        ];
      },
      nota: "El sistema solar evita el precio de la energía, no los cargos fijos: por eso el ahorro se calcula con el segundo número, no con el costo efectivo.",
      operacion: function (v, r, c) { return c.m(v.total) + " ÷ " + N(v.kwh_mes) + " kWh = " + c.m(r, 3) + " por kWh"; },
      grafico: function (v, r, c) {
        return { tipo: "barras", orientacion: "h", titulo: "Dónde se va cada factura", categorias: ["Factura del mes"], apilado: true,
          series: [
            { nombre: "Energía (la parte que el sol puede evitar)", valores: [v.total - v.cargos], tono: "azul" },
            { nombre: "Cargos fijos (permanecen)", valores: [v.cargos], tono: "gris" }
          ], moneda: true, decimales: 2 };
      }
    },
    {
      clave: "gasto_proyectado", modulo: 1, nombre: "Costo de no hacer nada", capitulo: "cap. 24",
      pregunta: "¿Cuánto pagará en facturas si no cambia nada?",
      expresion: "Total = factura × 12 × [((1 + i)^n − 1) ÷ i]",
      unidad: "USD", decimales: 0,
      inputs: [
        { clave: "factura", etiqueta: "Factura mensual actual", unidad: "USD/mes", defecto: 40, min: 5, max: 500, paso: 1 },
        { clave: "i", etiqueta: "Aumento anual de la tarifa", unidad: "%/año", defecto: 5, min: 0, max: 15, paso: 0.5 },
        { clave: "n", etiqueta: "Horizonte", unidad: "años", defecto: 10, min: 1, max: 25, paso: 1 }
      ],
      calculo: function (v) {
        var i = v.i / 100;
        return i === 0 ? v.factura * 12 * v.n : v.factura * 12 * ((Math.pow(1 + i, v.n) - 1) / i);
      },
      nota: "El capítulo 24 usa un 5 % anual: 40 USD al mes suman más de 6.000 USD en una década. Ajuste la tasa al historial de su país.",
      operacion: function (v, r, c) { return c.m(v.factura) + " × 12 × [(1 + " + N(v.i, 1) + " %)^" + N(v.n) + " − 1] ÷ " + N(v.i, 1) + " % = " + c.m(r); },
      grafico: function (v, r, c) {
        var cats = [], val = [], acum = [], s = 0;
        for (var t = 1; t <= Math.round(v.n); t++) {
          var a = v.factura * 12 * Math.pow(1 + v.i / 100, t - 1);
          s += a; cats.push(String(t)); val.push(a); acum.push(s);
        }
        return { tipo: "barras", titulo: "Factura de cada año", categorias: cats, etiquetaX: "año",
          series: [{ nombre: "Factura anual", valores: val, tono: "rojo" }], moneda: true, decimales: 0,
          nota: "Acumulado al año " + N(v.n) + ": " + c.m(r) };
      }
    },
    {
      clave: "pago_restante", modulo: 1, nombre: "Factura con el sistema", capitulo: "caps. 2 y 25",
      pregunta: "¿Qué sigue pagando el cliente cuando el sistema funciona?",
      expresion: "Factura nueva = máx(0, consumo − útil) × tarifa + cargos fijos",
      unidad: "USD/mes", decimales: 2,
      inputs: [
        { clave: "consumo", etiqueta: "Consumo mensual", unidad: "kWh/mes", defecto: 220, min: 50, max: 1500, paso: 5 },
        { clave: "util", etiqueta: "Producción útil del sistema", unidad: "kWh/mes", defecto: 226.8, min: 0, max: 1500, paso: 0.1 },
        { clave: "tarifa", etiqueta: "Precio de la energía", unidad: "USD/kWh", defecto: 0.15, min: 0.02, max: 0.6, paso: 0.005 },
        { clave: "cargos", etiqueta: "Cargos fijos", unidad: "USD/mes", defecto: 7, min: 0, max: 100, paso: 0.5 }
      ],
      calculo: function (v) { return Math.max(0, v.consumo - v.util) * v.tarifa + v.cargos; },
      extras: function (v, r, c) {
        var antes = v.consumo * v.tarifa + v.cargos;
        return [{ clave: "factura_antes", etiqueta: "Factura actual", valor: c.m(antes, 2), n: antes },
                { clave: "baja", etiqueta: "La factura baja", valor: c.m(antes - r, 2) + " al mes", n: antes - r }];
      },
      nota: "Nunca es cero: los cargos fijos permanecen (la regla del «no 100 %»). Con medición neta, la compra neta de energía puede llegar a cero, como en el caso Torres.",
      operacion: function (v, r, c) { return "máx(0, " + N(v.consumo) + " − " + N(v.util, 1) + ") × " + c.m(v.tarifa, 3) + " + " + c.m(v.cargos) + " = " + c.m(r, 2); },
      grafico: function (v, r) {
        var energiaDespues = Math.max(0, v.consumo - v.util) * v.tarifa;
        return { tipo: "barras", titulo: "Antes y después", categorias: ["Hoy", "Con el sistema"], apilado: true,
          series: [
            { nombre: "Energía comprada", valores: [v.consumo * v.tarifa, energiaDespues], tono: "azul" },
            { nombre: "Cargos fijos", valores: [v.cargos, v.cargos], tono: "gris" }
          ], moneda: true, decimales: 2, totales: true };
      }
    },

    /* ============================ 2 · Dimensión ============================ */
    {
      clave: "potencia_pico", modulo: 2, nombre: "Potencia pico necesaria", capitulo: "cap. 14",
      pregunta: "¿Cuántos vatios pico necesita el techo para cubrir el consumo del peor mes?",
      expresion: "Wp = consumo diario × 1.000 ÷ (HSP del peor mes × 0,8)",
      unidad: "Wp", decimales: 0, orientativo: true,
      inputs: [
        { clave: "consumo_diario", etiqueta: "Consumo diario", unidad: "kWh/día", defecto: 7.33, min: 0.5, max: 60, paso: 0.01 },
        { clave: "hsp", etiqueta: "HSP del peor mes", unidad: "h/día", defecto: 4.2, min: 2.5, max: 7, paso: 0.1, orientativo: true },
        { clave: "pr", etiqueta: "Factor de pérdidas (PR)", unidad: "ratio", defecto: 0.8, min: 0.6, max: 0.9, paso: 0.01 }
      ],
      calculo: function (v) { return v.consumo_diario * 1000 / (v.hsp * v.pr); },
      extras: function (v, r) {
        var mal = v.consumo_diario * 1000 * 1.2 / v.hsp;
        return [{ clave: "error_12", etiqueta: "Con el error ×1,2 saldría", valor: N(mal) + " Wp", n: mal,
          nota: N((1 - mal / r) * 100, 0) + " % menos de lo necesario" }];
      },
      nota: "Las pérdidas se compensan dividiendo entre 0,8, jamás multiplicando por 1,2.",
      operacion: function (v, r) { return N(v.consumo_diario, 2) + " × 1.000 ÷ (" + N(v.hsp, 1) + " × " + N(v.pr, 2) + ") = " + N(r) + " Wp"; },
      grafico: function (v, r) {
        var xs = [], ys = [];
        for (var h = 3; h <= 6.51; h += 0.25) { xs.push(h); ys.push(v.consumo_diario * 1000 / (h * v.pr)); }
        return { tipo: "linea", titulo: "Menos sol, más paneles", x: xs, etiquetaX: "HSP del peor mes", decimalesX: 1,
          series: [{ nombre: "Wp necesarios", valores: ys, tono: "azul" }],
          marcador: { x: v.hsp, y: r, etiqueta: N(r) + " Wp" }, unidad: "Wp", decimales: 0 };
      }
    },
    {
      clave: "paneles", modulo: 2, nombre: "Número de paneles", capitulo: "cap. 14",
      pregunta: "¿Cuántos paneles hay que comprar?",
      expresion: "Paneles = Wp objetivo ÷ Wp del panel, redondeado SIEMPRE hacia arriba",
      unidad: "paneles", decimales: 0,
      inputs: [
        { clave: "wp_objetivo", etiqueta: "Wp objetivo", unidad: "Wp", defecto: 2182.5, min: 300, max: 30000, paso: 10 },
        { clave: "wp_panel", etiqueta: "Wp del panel elegido", unidad: "Wp", defecto: 450, min: 300, max: 700, paso: 5 }
      ],
      calculo: function (v) { return Math.ceil(v.wp_objetivo / v.wp_panel - 1e-9); },
      extras: function (v, r) {
        return [{ clave: "potencia_instalada", etiqueta: "Potencia instalada", valor: N(r * v.wp_panel) + " Wp", n: r * v.wp_panel }];
      },
      operacion: function (v, r) { return N(v.wp_objetivo, 1) + " ÷ " + N(v.wp_panel) + " = " + N(v.wp_objetivo / v.wp_panel, 2) + " → " + N(r) + " paneles"; },
      grafico: function (v, r) { return { tipo: "paneles", titulo: "Lo que se calcula y lo que se compra", exacto: v.wp_objetivo / v.wp_panel, n: r }; }
    },
    {
      clave: "produccion_util", modulo: 2, nombre: "Producción útil mensual", capitulo: "caps. 8 y 14",
      pregunta: "¿Cuánta energía entrega el sistema en el peor mes, ya descontadas las pérdidas?",
      expresion: "Útil mensual = Wp × HSP × 30 × PR ÷ 1.000",
      unidad: "kWh/mes", decimales: 1, orientativo: true,
      inputs: [
        { clave: "wp", etiqueta: "Potencia instalada", unidad: "Wp", defecto: 2250, min: 300, max: 30000, paso: 50 },
        { clave: "hsp", etiqueta: "HSP del peor mes", unidad: "h/día", defecto: 4.2, min: 2.5, max: 7, paso: 0.1, orientativo: true },
        { clave: "pr", etiqueta: "Factor de pérdidas (PR)", unidad: "ratio", defecto: 0.8, min: 0.6, max: 0.9, paso: 0.01 }
      ],
      calculo: function (v) { return v.wp * v.hsp * 30 * v.pr / 1000; },
      extras: function (v, r) { return [{ clave: "diaria", etiqueta: "Producción útil diaria", valor: N(r / 30, 2) + " kWh", n: r / 30 }]; },
      nota: "Es el peor mes: los demás meses producen más. Base conservadora del libro.",
      operacion: function (v, r) { return N(v.wp) + " × " + N(v.hsp, 1) + " × 30 × " + N(v.pr, 2) + " ÷ 1.000 = " + N(r, 1) + " kWh"; },
      grafico: function (v, r) {
        var ideal = v.wp * v.hsp * 30 / 1000;
        return { tipo: "cascada", titulo: "De la energía ideal a la útil", unidad: "kWh", decimales: 1,
          pasos: [{ etiqueta: "Ideal (sol perfecto)", valor: ideal, tipo: "total" },
                  { etiqueta: "Pérdidas", valor: -(ideal - r), tipo: "resta" },
                  { etiqueta: "Útil", valor: r, tipo: "total", destacado: true }] };
      }
    },
    {
      clave: "cobertura", modulo: 2, nombre: "Cobertura", capitulo: "cap. 14",
      pregunta: "¿Qué parte del consumo cubre el sistema en el peor mes?",
      expresion: "Cobertura = producción útil ÷ consumo",
      unidad: "%", decimales: 1,
      inputs: [
        { clave: "util", etiqueta: "Producción útil", unidad: "kWh/mes", defecto: 226.8, min: 0, max: 2000, paso: 0.1 },
        { clave: "consumo", etiqueta: "Consumo", unidad: "kWh/mes", defecto: 220, min: 50, max: 2000, paso: 5 }
      ],
      calculo: function (v) { return v.util / v.consumo * 100; },
      nota: "Por encima del 100 %, el excedente sale a la red: su valor depende de la medición neta de cada país (Anexo E).",
      operacion: function (v, r) { return N(v.util, 1) + " ÷ " + N(v.consumo) + " = " + N(r, 1) + " %"; },
      grafico: function (v, r) { return { tipo: "medidor", titulo: "Cobertura del peor mes", valor: r, max: Math.max(120, Math.ceil(r / 10) * 10), umbral: { valor: 100, etiqueta: "100 %" }, sufijo: " %", decimales: 1 }; }
    },

    /* ============================ 3 · Economía ============================ */
    {
      clave: "ahorro", modulo: 3, nombre: "Ahorro mensual", capitulo: "cap. 4",
      pregunta: "¿Cuánto deja de pagar el cliente cada mes?",
      expresion: "Ahorro = mín(útil, consumo) × tarifa + excedente × valor del excedente",
      unidad: "USD/mes", decimales: 2,
      inputs: [
        { clave: "util", etiqueta: "Producción útil", unidad: "kWh/mes", defecto: 226.8, min: 0, max: 5000, paso: 0.1 },
        { clave: "consumo", etiqueta: "Consumo que la producción puede cubrir", unidad: "kWh/mes", defecto: 220, min: 0, max: 5000, paso: 5 },
        { clave: "tarifa", etiqueta: "Precio de la energía", unidad: "USD/kWh", defecto: 0.15, min: 0.02, max: 0.6, paso: 0.005 },
        { clave: "valor_excedente", etiqueta: "Valor del kWh excedente", unidad: "USD/kWh", defecto: 0, min: 0, max: 0.6, paso: 0.005 }
      ],
      calculo: function (v) {
        var aprovechado = Math.min(v.util, v.consumo);
        return aprovechado * v.tarifa + Math.max(0, v.util - v.consumo) * v.valor_excedente;
      },
      extras: function (v, r, c) { return [{ clave: "ahorro_anual", etiqueta: "Ahorro anual", valor: c.m(r * 12), n: r * 12 }]; },
      nota: "Lo que sobra sobre el consumo no ahorra a precio de tarifa: vale lo que la regulación pague por el excedente (en el caso Torres, cero).",
      operacion: function (v, r, c) {
        return "mín(" + N(v.util, 1) + ", " + N(v.consumo) + ") × " + c.m(v.tarifa, 3) +
          (v.valor_excedente > 0 ? " + " + N(Math.max(0, v.util - v.consumo), 1) + " × " + c.m(v.valor_excedente, 3) : "") + " = " + c.m(r, 2);
      },
      grafico: function (v) {
        var ap = Math.min(v.util, v.consumo), ex = Math.max(0, v.util - v.consumo), falta = Math.max(0, v.consumo - v.util);
        return { tipo: "barras", orientacion: "h", titulo: "Qué pasa con cada kWh producido", categorias: ["Producción", "Consumo"], apilado: true,
          series: [
            { nombre: "Aprovechado a tarifa", valores: [ap, ap], tono: "azul" },
            { nombre: "Excedente", valores: [ex, 0], tono: "oro" },
            { nombre: "Se sigue comprando", valores: [0, falta], tono: "gris" }
          ], unidad: "kWh", decimales: 1 };
      }
    },
    {
      clave: "payback", modulo: 3, nombre: "Payback", capitulo: "cap. 4",
      pregunta: "¿En cuántos años el ahorro devuelve la inversión?",
      expresion: "Payback = CAPEX ÷ (ahorro anual − OPEX anual)",
      unidad: "años", decimales: 1,
      inputs: [
        { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2700, min: 500, max: 60000, paso: 50 },
        { clave: "ahorro_anual", etiqueta: "Ahorro anual", unidad: "USD/año", defecto: 396, min: 50, max: 20000, paso: 1 },
        { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 27, min: 0, max: 2000, paso: 1 }
      ],
      calculo: function (v) { return v.capex / (v.ahorro_anual - v.opex_anual); },
      extras: function (v) {
        var ilusorio = v.capex / v.ahorro_anual;
        return [{ clave: "payback_ilusorio", etiqueta: "Si se olvida el OPEX saldría", valor: N(ilusorio, 1) + " años", n: ilusorio, nota: "el payback ilusorio del capítulo 4" }];
      },
      operacion: function (v, r, c) { return c.m(v.capex) + " ÷ (" + c.m(v.ahorro_anual) + " − " + c.m(v.opex_anual) + ") = " + N(r, 1) + " años"; },
      grafico: function (v, r, c) {
        var neto = v.ahorro_anual - v.opex_anual, xs = [], ys = [];
        var fin = Math.max(10, Math.min(30, Math.ceil(isFinite(r) ? r * 2 : 25)));
        for (var t = 0; t <= fin; t++) { xs.push(t); ys.push(-v.capex + neto * t); }
        return { tipo: "linea", titulo: "La alcancía: caja acumulada", x: xs, etiquetaX: "año", cero: true,
          series: [{ nombre: "Caja acumulada", valores: ys, tono: "azul", area: true }],
          marcador: isFinite(r) && r > 0 ? { x: r, y: 0, etiqueta: N(r, 1) + " años" } : null, moneda: true, decimales: 0 };
      }
    },
    {
      clave: "lcoe", modulo: 3, nombre: "LCOE: costo de cada kWh solar", capitulo: "caps. 4 y 31",
      pregunta: "¿Cuánto cuesta cada kilovatio-hora que produce el techo en toda su vida?",
      expresion: "LCOE simple = (CAPEX + OPEX × n + reemplazos) ÷ Σ energía aprovechada · descontado: lo mismo traído a valor de hoy",
      unidad: "USD/kWh", decimales: 3,
      inputs: [
        { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2700, min: 500, max: 60000, paso: 50 },
        { clave: "opex", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 27, min: 0, max: 2000, paso: 1 },
        { clave: "reemplazo", etiqueta: "Reemplazo del inversor", unidad: "USD", defecto: 330, min: 0, max: 10000, paso: 10 },
        { clave: "anio_reemplazo", etiqueta: "Año del reemplazo", unidad: "año", defecto: 12, min: 5, max: 20, paso: 1 },
        { clave: "util_anual", etiqueta: "Producción útil del año 1", unidad: "kWh/año", defecto: 2721.6, min: 300, max: 60000, paso: 1 },
        { clave: "consumo_anual", etiqueta: "Consumo anual (tope aprovechable; 0 = sin tope)", unidad: "kWh/año", defecto: 2640, min: 0, max: 60000, paso: 10 },
        { clave: "degradacion", etiqueta: "Degradación anual", unidad: "%/año", defecto: 0.5, min: 0, max: 1.5, paso: 0.05 },
        { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 25, min: 10, max: 30, paso: 1 },
        { clave: "r", etiqueta: "Tasa de descuento", unidad: "%/año", defecto: 8, min: 0, max: 20, paso: 0.5 },
        { clave: "tarifa", etiqueta: "Precio de la energía de la red", unidad: "USD/kWh", defecto: 0.15, min: 0.02, max: 0.6, paso: 0.005 }
      ],
      calculo: function (v) { return M.proyecto(v).lcoeSimple; },
      extras: function (v, r, c) {
        var p = M.proyecto(v);
        return [{ clave: "lcoe_desc", etiqueta: "LCOE descontado al " + N(v.r, 1) + " %", valor: c.m(p.lcoeDescontado, 3) + " por kWh", n: p.lcoeDescontado }];
      },
      nota: "El simple es la versión de servilleta; el descontado es el que se compara con la tarifa en una propuesta seria. La energía que supera el consumo no cuenta: no se aprovecha a tarifa.",
      operacion: function (v, r, c) {
        var p = M.proyecto(v), e = p.energia.reduce(function (a, b) { return a + b; }, 0);
        return "(" + c.m(v.capex) + " + " + c.m(v.opex) + " × " + N(v.n) + " + " + c.m(v.reemplazo) + ") ÷ " + N(e) + " kWh = " + c.m(r, 3);
      },
      grafico: function (v, r) {
        var p = M.proyecto(v);
        return { tipo: "barras", orientacion: "h", titulo: "El kWh solar frente al de la red",
          categorias: ["LCOE simple", "LCOE descontado", "Energía de la red"],
          series: [{ nombre: "USD por kWh", valores: [r, p.lcoeDescontado, v.tarifa], tonos: ["azul", "oro", "gris"] }],
          moneda: true, decimales: 3 };
      }
    },

    /* ============================ 4 · Finanzas ============================ */
    {
      clave: "cuota", modulo: 4, nombre: "Cuota y factura residual", capitulo: "caps. 4 y 23",
      pregunta: "¿Cuánto paga el cliente al mes mientras dura el crédito, comparado con hoy?",
      expresion: "Cuota = P × i ÷ (1 − (1 + i)^−n) · se compara cuota + factura residual frente a factura actual",
      unidad: "USD/mes", decimales: 1,
      inputs: [
        { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2700, min: 500, max: 60000, paso: 50 },
        { clave: "firma", etiqueta: "Pago al firmar", unidad: "%", defecto: 30, min: 0, max: 100, paso: 5 },
        { clave: "tasa", etiqueta: "Tasa del crédito", unidad: "%/año", defecto: 12, min: 0, max: 36, paso: 0.5 },
        { clave: "anios", etiqueta: "Plazo", unidad: "años", defecto: 7, min: 1, max: 15, paso: 1 },
        { clave: "residual", etiqueta: "Factura residual con el sistema", unidad: "USD/mes", defecto: 7, min: 0, max: 500, paso: 0.5 },
        { clave: "actual", etiqueta: "Factura actual", unidad: "USD/mes", defecto: 40, min: 0, max: 2000, paso: 1 }
      ],
      calculo: function (v) { return M.cuota(v.capex * (1 - v.firma / 100), v.tasa, v.anios); },
      extras: function (v, r, c) {
        var firma = v.capex * v.firma / 100, total = r + v.residual, c100 = M.cuota(v.capex, v.tasa, v.anios);
        return [
          { clave: "firma", etiqueta: "Al firmar", valor: c.m(firma), n: firma },
          { clave: "financiado", etiqueta: "Financiado", valor: c.m(v.capex - firma), n: v.capex - firma },
          { clave: "cuota_mas_residual", etiqueta: "Cuota + factura residual", valor: c.m(total, 1), n: total,
            nota: (total <= v.actual ? "menos que " : "más que ") + "la factura actual de " + c.m(v.actual) + " (" + (total - v.actual >= 0 ? "+" : "−") + c.m(Math.abs(total - v.actual), 2) + " al mes)" },
          { clave: "cuota_100", etiqueta: "Con crédito del 100 %", valor: c.m(c100, 1) + " + " + c.m(v.residual) + " = " + c.m(c100 + v.residual, 1), n: c100 }
        ];
      },
      nota: "Nunca se compara la cuota con la factura completa: el cliente sigue pagando la factura residual durante el crédito.",
      operacion: function (v, r, c) { return c.m(v.capex * (1 - v.firma / 100)) + " a " + N(v.anios) + " años y " + N(v.tasa, 1) + " % → cuota " + c.m(r, 1) + " + residual " + c.m(v.residual) + " = " + c.m(r + v.residual, 1); },
      grafico: function (v, r) {
        return { tipo: "barras", titulo: "Lo que sale del bolsillo cada mes", categorias: ["Hoy", "Durante el crédito", "Después del crédito"], apilado: true,
          series: [
            { nombre: "Factura", valores: [v.actual, v.residual, v.residual], tono: "gris" },
            { nombre: "Cuota", valores: [0, r, 0], tono: "azul" }
          ], moneda: true, decimales: 1, totales: true, referencia: { valor: v.actual, etiqueta: "factura actual" } };
      }
    },
    {
      clave: "vpn_tir", modulo: 4, nombre: "VPN y TIR", capitulo: "cap. 4",
      pregunta: "¿Cuánta riqueza crea el sistema, en dólares de hoy, y a qué ritmo rinde?",
      expresion: "VPN = Σ flujo del año t ÷ (1 + r)^t − CAPEX · TIR: la tasa que deja el VPN en cero",
      unidad: "USD", decimales: 0,
      inputs: [
        { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2700, min: 500, max: 60000, paso: 50 },
        { clave: "util_anual", etiqueta: "Producción útil del año 1", unidad: "kWh/año", defecto: 2721.6, min: 300, max: 60000, paso: 1 },
        { clave: "consumo_anual", etiqueta: "Consumo anual (tope; 0 = sin tope)", unidad: "kWh/año", defecto: 2640, min: 0, max: 60000, paso: 10 },
        { clave: "tarifa", etiqueta: "Valor del kWh aprovechado", unidad: "USD/kWh", defecto: 0.15, min: 0.02, max: 0.6, paso: 0.005 },
        { clave: "opex", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 27, min: 0, max: 2000, paso: 1 },
        { clave: "reemplazo", etiqueta: "Reemplazo del inversor", unidad: "USD", defecto: 330, min: 0, max: 10000, paso: 10 },
        { clave: "anio_reemplazo", etiqueta: "Año del reemplazo", unidad: "año", defecto: 12, min: 5, max: 20, paso: 1 },
        { clave: "degradacion", etiqueta: "Degradación anual", unidad: "%/año", defecto: 0.5, min: 0, max: 1.5, paso: 0.05 },
        { clave: "n", etiqueta: "Horizonte", unidad: "años", defecto: 25, min: 10, max: 30, paso: 1 },
        { clave: "r", etiqueta: "Tasa de descuento", unidad: "%/año", defecto: 8, min: 0, max: 20, paso: 0.5 }
      ],
      calculo: function (v) { return M.proyecto(v).vpn; },
      extras: function (v, r, c) {
        var p = M.proyecto(v);
        return [{ clave: "tir", etiqueta: "TIR", valor: N(p.tir, 1) + " %", n: p.tir, nota: p.tir > v.r ? "supera la tasa de descuento: el proyecto crea valor" : "no supera la tasa de descuento" },
                { clave: "payback_real", etiqueta: "Payback con los flujos reales", valor: N(p.paybackReal, 1) + " años", n: p.paybackReal }];
      },
      nota: "Flujos antes de impuestos. La tasa de descuento es el costo de oportunidad: el 8 % del hogar, el 12 % de la empresa en el libro.",
      operacion: function (v, r, c) { var p = M.proyecto(v); return "VPN al " + N(v.r, 1) + " % = " + c.m(r) + " · TIR = " + N(p.tir, 1) + " %"; },
      grafico: function (v, r) {
        var p = M.proyecto(v), xs = [];
        for (var t = 0; t <= Math.round(v.n); t++) { xs.push(t); }
        return { tipo: "linea", titulo: "Caja acumulada, nominal y en dólares de hoy", x: xs, etiquetaX: "año", cero: true,
          series: [{ nombre: "Nominal", valores: p.acumulado, tono: "gris" },
                   { nombre: "Descontada (termina en el VPN)", valores: p.descontado, tono: "azul" }],
          marcador: { x: Math.round(v.n), y: p.vpn, etiqueta: "VPN" }, moneda: true, decimales: 0 };
      }
    },
    {
      clave: "dscr", modulo: 4, nombre: "Cobertura de deuda (DSCR)", capitulo: "cap. 23",
      pregunta: "¿El ahorro alcanza para pagar la cuota con holgura?",
      expresion: "DSCR = (ahorro mensual − OPEX mensual) ÷ cuota",
      unidad: "veces", decimales: 2,
      inputs: [
        { clave: "ahorro_mes", etiqueta: "Ahorro mensual", unidad: "USD/mes", defecto: 422.4, min: 10, max: 20000, paso: 1 },
        { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 307.8, min: 0, max: 20000, paso: 1 },
        { clave: "deuda", etiqueta: "Monto financiado", unidad: "USD", defecto: 14364, min: 100, max: 500000, paso: 100 },
        { clave: "tasa", etiqueta: "Tasa del crédito", unidad: "%/año", defecto: 12, min: 0, max: 36, paso: 0.5 },
        { clave: "anios", etiqueta: "Plazo", unidad: "años", defecto: 7, min: 1, max: 15, paso: 1 }
      ],
      calculo: function (v) { return (v.ahorro_mes - v.opex_anual / 12) / M.cuota(v.deuda, v.tasa, v.anios); },
      extras: function (v, r, c) {
        var q = M.cuota(v.deuda, v.tasa, v.anios), libre = v.ahorro_mes - v.opex_anual / 12 - q;
        return [{ clave: "cuota", etiqueta: "Cuota", valor: c.m(q), n: q },
                { clave: "flujo_libre", etiqueta: "Flujo libre después de la cuota", valor: c.m(libre) + " al mes", n: libre }];
      },
      nota: "Los bancos suelen pedir 1,25 o más. Valores del caso La Espiga (capítulo 23).",
      operacion: function (v, r, c) { var q = M.cuota(v.deuda, v.tasa, v.anios); return "(" + c.m(v.ahorro_mes, 1) + " − " + c.m(v.opex_anual / 12, 1) + ") ÷ " + c.m(q, 1) + " = " + N(r, 2); },
      grafico: function (v, r) { return { tipo: "medidor", titulo: "Holgura frente a la cuota", valor: r, max: Math.max(2.5, Math.ceil(r * 2) / 2), umbral: { valor: 1.25, etiqueta: "1,25 que pide el banco" }, sufijo: "×", decimales: 2, peligro: 1 }; }
    },

    /* ============================ 5 · Autónomo ============================ */
    {
      clave: "banco_util", modulo: 5, nombre: "Banco útil", capitulo: "cap. 29",
      pregunta: "¿Cuánta energía debe guardar el banco para los días sin sol?",
      expresion: "Banco útil = consumo diario × días de autonomía",
      unidad: "kWh", decimales: 2,
      inputs: [
        { clave: "consumo_diario", etiqueta: "Consumo diario", unidad: "kWh/día", defecto: 2.16, min: 0.2, max: 40, paso: 0.01 },
        { clave: "dias", etiqueta: "Días de autonomía", unidad: "días", defecto: 3, min: 1, max: 5, paso: 1 }
      ],
      calculo: function (v) { return v.consumo_diario * v.dias; },
      operacion: function (v, r) { return N(v.consumo_diario, 2) + " × " + N(v.dias) + " = " + N(r, 2) + " kWh"; },
      grafico: function (v, r) {
        var cats = [], val = [];
        for (var d = 1; d <= Math.round(v.dias); d++) { cats.push("Día " + d); val.push(v.consumo_diario); }
        return { tipo: "barras", orientacion: "h", titulo: "Un día de consumo por cada día sin sol", categorias: ["Banco útil"], apilado: true,
          series: val.map(function (x, i) { return { nombre: cats[i], valores: [x], tono: i % 2 ? "azulClaro" : "azul" }; }),
          unidad: "kWh", decimales: 2, sinLeyenda: true, etiquetasSegmento: cats };
      }
    },
    {
      clave: "banco_nominal", modulo: 5, nombre: "Banco nominal", capitulo: "cap. 29",
      pregunta: "¿De qué tamaño se compra el banco, si no se puede vaciar del todo?",
      expresion: "Banco nominal = banco útil ÷ DOD, redondeado al modelo comercial",
      unidad: "kWh", decimales: 1,
      inputs: [
        { clave: "util", etiqueta: "Banco útil", unidad: "kWh", defecto: 6.48, min: 0.5, max: 200, paso: 0.01 },
        { clave: "dod", etiqueta: "Profundidad de descarga (DOD)", unidad: "ratio", defecto: 0.8, min: 0.3, max: 0.95, paso: 0.05 },
        { clave: "bateria", etiqueta: "Capacidad de cada batería comercial", unidad: "kWh", defecto: 4.8, min: 0.5, max: 20, paso: 0.1 }
      ],
      calculo: function (v) { return v.util / v.dod; },
      extras: function (v, r) {
        var n = Math.ceil(r / v.bateria - 1e-9);
        return [{ clave: "baterias", etiqueta: "Baterías a comprar", valor: N(n) + " × " + N(v.bateria, 1) + " kWh = " + N(n * v.bateria, 1) + " kWh", n: n * v.bateria }];
      },
      nota: "LFP trabaja al 80 % de DOD; el plomo, al 50 %: el mismo banco útil pide 1,6 veces más plomo.",
      operacion: function (v, r) { return N(v.util, 2) + " ÷ " + N(v.dod, 2) + " = " + N(r, 1) + " kWh"; },
      grafico: function (v, r) {
        var n = Math.ceil(r / v.bateria - 1e-9);
        return { tipo: "barras", orientacion: "h", titulo: "Lo que se usa y lo que se protege", categorias: ["Calculado", "Comprado"], apilado: true,
          series: [{ nombre: "Útil", valores: [v.util, v.util], tono: "azul" },
                   { nombre: "Reserva que no se descarga", valores: [r - v.util, r - v.util], tono: "gris" },
                   { nombre: "Holgura del modelo comercial", valores: [0, n * v.bateria - r], tono: "oro" }],
          unidad: "kWh", decimales: 1 };
      }
    },
    {
      clave: "lcoe_isla", modulo: 5, nombre: "Costo del kWh en la isla", capitulo: "cap. 27",
      pregunta: "¿Cuánto cuesta cada kilovatio-hora que la finca realmente consume?",
      expresion: "LCOE servido = (CAPEX + reemplazos + OPEX × n + generador × n) ÷ (energía consumida anual × n)",
      unidad: "USD/kWh", decimales: 2,
      inputs: [
        { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 3700, min: 500, max: 60000, paso: 50 },
        { clave: "reemplazos", etiqueta: "Reemplazos en la vida útil", unidad: "USD", defecto: 1700, min: 0, max: 30000, paso: 50 },
        { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 0, min: 0, max: 2000, paso: 5 },
        { clave: "generador_anual", etiqueta: "Combustible del generador", unidad: "USD/año", defecto: 0, min: 0, max: 5000, paso: 5 },
        { clave: "consumo_diario", etiqueta: "Consumo diario servido", unidad: "kWh/día", defecto: 2.16, min: 0.2, max: 60, paso: 0.01 },
        { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 15, min: 5, max: 30, paso: 1 }
      ],
      calculo: function (v) { return (v.capex + v.reemplazos + (v.opex_anual + v.generador_anual) * v.n) / (v.consumo_diario * 365 * v.n); },
      extras: function (v) { return [{ clave: "energia_servida", etiqueta: "Energía servida al año", valor: N(v.consumo_diario * 365) + " kWh", n: v.consumo_diario * 365 }]; },
      nota: "Se divide entre la energía consumida, no la producida: en la isla, lo que el banco no puede guardar se pierde.",
      operacion: function (v, r, c) { return "(" + c.m(v.capex) + " + " + c.m(v.reemplazos) + " + " + c.m(v.opex_anual + v.generador_anual) + " × " + N(v.n) + ") ÷ (" + N(v.consumo_diario * 365) + " × " + N(v.n) + ") = " + c.m(r, 2); },
      grafico: function (v, r) {
        return { tipo: "barras", orientacion: "h", titulo: "El kWh de la isla frente a sus alternativas",
          categorias: ["Isla solar", "Generador (desde)", "Generador (hasta)", "Red, si llegara"],
          series: [{ nombre: "USD por kWh", valores: [r, 0.5, 0.8, 0.15], tonos: ["azul", "rojo", "rojo", "gris"] }],
          moneda: true, decimales: 2, nota: "Generador: 0,50–0,80 USD/kWh y red: 0,15 USD/kWh, referencias del capítulo 27." };
      }
    },

    /* ============================ 6 · Técnico ============================ */
    {
      clave: "voc_frio", modulo: 6, nombre: "Voc en frío", capitulo: "cap. 14",
      pregunta: "¿Cuál es el voltaje máximo de la cadena en la madrugada más fría?",
      expresion: "Voc frío = Voc × [1 + coef × (25 − T mínima)] × paneles en serie",
      unidad: "V", decimales: 1,
      inputs: [
        { clave: "voc", etiqueta: "Voc del panel", unidad: "V", defecto: 41.2, min: 20, max: 60, paso: 0.1 },
        { clave: "coef", etiqueta: "Coeficiente térmico del Voc (valor absoluto)", unidad: "/°C", defecto: 0.0029, min: 0.001, max: 0.005, paso: 0.0001 },
        { clave: "tmin", etiqueta: "Temperatura mínima histórica", unidad: "°C", defecto: -5, min: -30, max: 25, paso: 1 },
        { clave: "serie", etiqueta: "Paneles en serie", unidad: "paneles", defecto: 2, min: 1, max: 30, paso: 1 },
        { clave: "vmax", etiqueta: "Voltaje máximo del equipo", unidad: "V", defecto: 150, min: 50, max: 1500, paso: 10 }
      ],
      calculo: function (v) { return v.voc * (1 + v.coef * (25 - v.tmin)); },
      extras: function (v, r) {
        var cadena = r * v.serie;
        return [{ clave: "voc_cadena", etiqueta: "Voc de la cadena en frío", valor: N(cadena, 1) + " V", n: cadena,
          nota: cadena <= v.vmax ? "dentro del límite de " + N(v.vmax) + " V" : "SUPERA el límite de " + N(v.vmax) + " V: quite paneles de la serie" },
          { clave: "max_serie", etiqueta: "Máximo de paneles en serie", valor: N(Math.floor(v.vmax / r)), n: Math.floor(v.vmax / r) }];
      },
      nota: "Con la mínima histórica, no con la media.",
      operacion: function (v, r) { return N(v.voc, 1) + " × [1 + " + N(v.coef, 4) + " × (25 − " + N(v.tmin) + ")] = " + N(r, 1) + " V × " + N(v.serie) + " = " + N(r * v.serie, 1) + " V"; },
      grafico: function (v, r) {
        var xs = [], ys = [];
        for (var t = -20; t <= 40; t += 5) { xs.push(t); ys.push(v.voc * (1 + v.coef * (25 - t)) * v.serie); }
        return { tipo: "linea", titulo: "El frío sube el voltaje de la cadena", x: xs, etiquetaX: "temperatura (°C)",
          series: [{ nombre: "Voc de la cadena", valores: ys, tono: "azul" }],
          limite: { valor: v.vmax, etiqueta: "límite del equipo" },
          marcador: { x: v.tmin, y: r * v.serie, etiqueta: N(r * v.serie, 1) + " V" }, unidad: "V", decimales: 0 };
      }
    },
    {
      clave: "protecciones", modulo: 6, nombre: "Protecciones", capitulo: "cap. 12",
      pregunta: "¿Qué corriente debe soportar la protección?",
      expresion: "Corriente de diseño = corriente del circuito × 1,25 → breaker comercial inmediato superior",
      unidad: "A", decimales: 2,
      inputs: [{ clave: "i", etiqueta: "Corriente del circuito", unidad: "A", defecto: 18.75, min: 1, max: 100, paso: 0.05 }],
      calculo: function (v) { return v.i * 1.25; },
      extras: function (v, r) { var b = M.siguienteComercial(r, M.BREAKERS); return [{ clave: "breaker", etiqueta: "Breaker comercial", valor: N(b) + " A", n: b }]; },
      operacion: function (v, r) { return N(v.i, 2) + " × 1,25 = " + N(r, 2) + " A → " + N(M.siguienteComercial(r, M.BREAKERS)) + " A"; },
      grafico: function (v, r) {
        var b = M.siguienteComercial(r, M.BREAKERS);
        return { tipo: "barras", titulo: "Del circuito al breaker", categorias: ["Circuito", "× 1,25", "Breaker"],
          series: [{ nombre: "Amperios", valores: [v.i, r, b], tonos: ["gris", "azul", "oro"] }], unidad: "A", decimales: 1 };
      }
    },
    {
      clave: "calibre", modulo: 6, nombre: "Calibre por caída de tensión", capitulo: "cap. 12",
      pregunta: "¿Qué sección de cable mantiene la caída por debajo del 3 %?",
      expresion: "S = 2 × 0,0172 × L × I ÷ (0,03 × V)",
      unidad: "mm²", decimales: 2,
      inputs: [
        { clave: "l", etiqueta: "Longitud del tramo (ida)", unidad: "m", defecto: 20, min: 1, max: 100, paso: 1 },
        { clave: "i", etiqueta: "Corriente", unidad: "A", defecto: 18.75, min: 1, max: 100, paso: 0.05 },
        { clave: "v", etiqueta: "Voltaje del circuito", unidad: "V", defecto: 48, min: 12, max: 800, paso: 1 }
      ],
      calculo: function (v) { return 2 * 0.0172 * v.l * v.i / (0.03 * v.v); },
      extras: function (v, r) { var s = M.siguienteComercial(r, M.SECCIONES); return [{ clave: "seccion", etiqueta: "Sección comercial", valor: N(s, s < 10 ? 1 : 0) + " mm²", n: s }]; },
      nota: "Cobre (0,0172 Ω·mm²/m), ida y vuelta. Compruebe también la capacidad de corriente en la tabla del Anexo B.",
      operacion: function (v, r) { return "2 × 0,0172 × " + N(v.l) + " × " + N(v.i, 2) + " ÷ (0,03 × " + N(v.v) + ") = " + N(r, 2) + " mm²"; },
      grafico: function (v, r) {
        var xs = [], ys = [];
        for (var l = 5; l <= 60; l += 5) { xs.push(l); ys.push(2 * 0.0172 * l * v.i / (0.03 * v.v)); }
        return { tipo: "linea", titulo: "Más distancia, más cobre", x: xs, etiquetaX: "longitud (m)",
          series: [{ nombre: "Sección mínima", valores: ys, tono: "azul" }],
          marcador: { x: v.l, y: r, etiqueta: N(r, 1) + " mm²" }, unidad: "mm²", decimales: 1 };
      }
    },
    {
      clave: "generador", modulo: 6, nombre: "Generador de respaldo", capitulo: "cap. 30",
      pregunta: "¿Cuánto cuesta la semana gris con el híbrido y sin él?",
      expresion: "Costo = horas de motor × litros por hora × precio del litro",
      unidad: "USD", decimales: 1,
      inputs: [
        { clave: "horas", etiqueta: "Horas de motor con banco (híbrido)", unidad: "h", defecto: 21, min: 0, max: 300, paso: 1 },
        { clave: "lh", etiqueta: "Consumo a plena carga", unidad: "L/h", defecto: 0.7, min: 0.1, max: 5, paso: 0.05 },
        { clave: "horas_puro", etiqueta: "Horas a generador puro", unidad: "h", defecto: 216, min: 0, max: 720, paso: 1 },
        { clave: "lh_puro", etiqueta: "Consumo a carga mínima", unidad: "L/h", defecto: 0.4, min: 0.1, max: 5, paso: 0.05 },
        { clave: "precio", etiqueta: "Precio del combustible", unidad: "USD/L", defecto: 1, min: 0.2, max: 3, paso: 0.05 }
      ],
      calculo: function (v) { return v.horas * v.lh * v.precio; },
      extras: function (v, r, c) { var p = v.horas_puro * v.lh_puro * v.precio; return [{ clave: "puro", etiqueta: "A generador puro", valor: c.m(p, 1), n: p }]; },
      nota: "Semana gris de Los Alisos (9 días): 21 h con banco ≈ 15 USD; 216 h a generador puro ≈ 86 USD, sin contar el desgaste. Supuestos editables.",
      operacion: function (v, r, c) { return N(v.horas) + " h × " + N(v.lh, 2) + " L/h × " + c.m(v.precio, 2) + " = " + c.m(r, 1); },
      grafico: function (v, r) {
        return { tipo: "barras", titulo: "La misma semana gris, dos estrategias", categorias: ["Híbrido con banco", "Generador puro"],
          series: [{ nombre: "Combustible", valores: [r, v.horas_puro * v.lh_puro * v.precio], tonos: ["azul", "rojo"] }], moneda: true, decimales: 1 };
      }
    }
  ];

  /* Identificadores numéricos de la versión anterior (proyectos guardados). */
  raiz.MIGRACION_IDS = { 1: "consumo_diario", 2: "gasto_proyectado", 3: null, 4: "produccion_util", 5: "potencia_pico",
    6: "paneles", 7: "cobertura", 8: null, 9: "payback", 10: null, 11: "banco_util", 12: "banco_nominal",
    13: null, 14: "voc_frio", 15: null, 16: "calibre", 17: null };

  /* Casos del libro. esperado: {formula, extra?, concepto, valor, decimales}. */
  raiz.PRESETS = {
    torres: {
      nombre: "Familia Torres", tipo: "Hogar on-grid", ficha: "Anexo G.1",
      resumen: "220 kWh/mes · 0,15 USD/kWh · 7 USD de cargos fijos · HSP 4,2",
      valores: {
        consumo_diario: { kwh_mes: 220 },
        costo_efectivo: { total: 40, kwh_mes: 220, cargos: 7 },
        gasto_proyectado: { factura: 40, i: 5, n: 10 },
        pago_restante: { consumo: 220, util: 226.8, tarifa: 0.15, cargos: 7 },
        potencia_pico: { consumo_diario: 7.3333, hsp: 4.2, pr: 0.8 },
        paneles: { wp_objetivo: 2182.5, wp_panel: 450 },
        produccion_util: { wp: 2250, hsp: 4.2, pr: 0.8 },
        cobertura: { util: 226.8, consumo: 220 },
        ahorro: { util: 226.8, consumo: 220, tarifa: 0.15, valor_excedente: 0 },
        payback: { capex: 2700, ahorro_anual: 396, opex_anual: 27 },
        lcoe: { capex: 2700, opex: 27, reemplazo: 330, anio_reemplazo: 12, util_anual: 2721.6, consumo_anual: 2640, degradacion: 0.5, n: 25, r: 8, tarifa: 0.15 },
        cuota: { capex: 2700, firma: 30, tasa: 12, anios: 7, residual: 7, actual: 40 },
        vpn_tir: { capex: 2700, util_anual: 2721.6, consumo_anual: 2640, tarifa: 0.15, opex: 27, reemplazo: 330, anio_reemplazo: 12, degradacion: 0.5, n: 25, r: 8 },
        voc_frio: { voc: 41.2, coef: 0.0029, tmin: 10, serie: 5, vmax: 600 }
      },
      esperados: [
        { formula: "costo_efectivo", concepto: "Costo efectivo del kWh", valor: 0.18, decimales: 2 },
        { formula: "gasto_proyectado", concepto: "Facturas en 10 años (más de 6.000)", valor: 6037, decimales: 0, tolerancia: 1 },
        { formula: "pago_restante", concepto: "Factura con el sistema (40 → 7)", valor: 7, decimales: 0 },
        { formula: "potencia_pico", concepto: "Potencia pico necesaria", valor: 2183, decimales: 0, tolerancia: 1 },
        { formula: "paneles", concepto: "Paneles de 450 W", valor: 5, decimales: 0 },
        { formula: "produccion_util", concepto: "Producción útil del peor mes", valor: 226.8, decimales: 1 },
        { formula: "ahorro", concepto: "Ahorro mensual", valor: 33, decimales: 0 },
        { formula: "payback", concepto: "Payback", valor: 7.3, decimales: 1 },
        { formula: "lcoe", concepto: "LCOE simple", valor: 0.058, decimales: 3 },
        { formula: "lcoe", extra: "lcoe_desc", concepto: "LCOE descontado al 8 %", valor: 0.113, decimales: 3 },
        { formula: "cuota", concepto: "Cuota a 7 años y 12 %", valor: 33.4, decimales: 1 },
        { formula: "cuota", extra: "cuota_mas_residual", concepto: "Cuota + factura residual", valor: 40.4, decimales: 1 },
        { formula: "cuota", extra: "cuota_100", concepto: "Cuota con crédito del 100 %", valor: 47.7, decimales: 1 },
        { formula: "vpn_tir", concepto: "VPN al 8 %", valor: 1030, decimales: 0 },
        { formula: "vpn_tir", extra: "tir", concepto: "TIR", valor: 12.4, decimales: 1 },
        { formula: "voc_frio", extra: "voc_cadena", concepto: "Voc de la cadena de 5 a 10 °C", valor: 215, decimales: 0 }
      ]
    },
    espiga: {
      nombre: "Panadería La Espiga", tipo: "Empresa on-grid", ficha: "Anexo G.2",
      resumen: "3.000 kWh/mes · 70 % diurno · 0,20 USD/kWh · 48 paneles · tasa 12 %",
      valores: {
        costo_efectivo: { total: 625, kwh_mes: 3000, cargos: 25 },
        produccion_util: { wp: 21600, hsp: 4.2, pr: 0.8 },
        cobertura: { util: 2177.28, consumo: 3000 },
        ahorro: { util: 2177.28, consumo: 1959.55, tarifa: 0.2, valor_excedente: 0.14 },
        payback: { capex: 20520, ahorro_anual: 5068.8, opex_anual: 307.8 },
        lcoe: { capex: 20520, opex: 307.8, reemplazo: 2000, anio_reemplazo: 12, util_anual: 26127.36, consumo_anual: 0, degradacion: 0.5, n: 25, r: 12, tarifa: 0.2 },
        cuota: { capex: 20520, firma: 30, tasa: 12, anios: 7, residual: 202.6, actual: 625 },
        vpn_tir: { capex: 20520, util_anual: 26127.36, consumo_anual: 0, tarifa: 0.194, opex: 307.8, reemplazo: 2000, anio_reemplazo: 12, degradacion: 0.5, n: 25, r: 12 },
        dscr: { ahorro_mes: 422.4, opex_anual: 307.8, deuda: 14364, tasa: 12, anios: 7 }
      },
      esperados: [
        { formula: "costo_efectivo", extra: "precio_energia", concepto: "Precio de la energía", valor: 0.2, decimales: 2 },
        { formula: "produccion_util", concepto: "Producción útil del peor mes", valor: 2177, decimales: 0 },
        { formula: "cobertura", concepto: "Cobertura", valor: 72.6, decimales: 1 },
        { formula: "ahorro", concepto: "Ahorro mensual", valor: 422, decimales: 0 },
        { formula: "payback", concepto: "Payback antes de impuestos", valor: 4.3, decimales: 1 },
        { formula: "lcoe", concepto: "LCOE simple", valor: 0.049, decimales: 3 },
        { formula: "lcoe", extra: "lcoe_desc", concepto: "LCOE descontado al 12 %", valor: 0.118, decimales: 3 },
        { formula: "cuota", concepto: "Cuota con 30 % propio", valor: 254, decimales: 0 },
        { formula: "cuota", extra: "cuota_100", concepto: "Cuota con crédito del 100 %", valor: 362, decimales: 0 },
        { formula: "vpn_tir", concepto: "VPN antes de impuestos", valor: 14998, decimales: 0 },
        { formula: "vpn_tir", extra: "tir", concepto: "TIR antes de impuestos", valor: 22.3, decimales: 1 },
        { formula: "dscr", concepto: "DSCR con 30 % propio", valor: 1.56, decimales: 2 },
        { formula: "dscr", extra: "flujo_libre", concepto: "Flujo libre mensual", valor: 143, decimales: 0 }
      ],
      aviso: "El VPN y la TIR con impuestos e incentivos (11.523 USD · 23,3 %) dependen de la ley de cada país y se calculan en el capítulo 4 con un contador."
    },
    alisos: {
      nombre: "Finca Los Alisos", tipo: "Isla off-grid", ficha: "Anexo G.3",
      resumen: "2,16 kWh/día · HSP 4,0 · mínima −5 °C · 3 días de autonomía",
      valores: {
        potencia_pico: { consumo_diario: 2.16, hsp: 4.0, pr: 0.8 },
        paneles: { wp_objetivo: 675, wp_panel: 450 },
        banco_util: { consumo_diario: 2.16, dias: 3 },
        banco_nominal: { util: 6.48, dod: 0.8, bateria: 4.8 },
        lcoe_isla: { capex: 3700, reemplazos: 1700, opex_anual: 0, generador_anual: 0, consumo_diario: 2.16, n: 15 },
        voc_frio: { voc: 41.2, coef: 0.0029, tmin: -5, serie: 2, vmax: 150 },
        protecciones: { i: 18.75 },
        generador: { horas: 21, lh: 0.7, horas_puro: 216, lh_puro: 0.4, precio: 1 }
      },
      esperados: [
        { formula: "potencia_pico", concepto: "Potencia pico necesaria", valor: 675, decimales: 0 },
        { formula: "paneles", concepto: "Paneles de 450 W", valor: 2, decimales: 0 },
        { formula: "banco_util", concepto: "Banco útil", valor: 6.48, decimales: 2 },
        { formula: "banco_nominal", concepto: "Banco nominal", valor: 8.1, decimales: 1 },
        { formula: "banco_nominal", extra: "baterias", concepto: "Banco comprado (2 × 48 V 100 Ah)", valor: 9.6, decimales: 1 },
        { formula: "lcoe_isla", concepto: "Costo por kWh servido", valor: 0.46, decimales: 2 },
        { formula: "voc_frio", concepto: "Voc del panel en frío", valor: 44.8, decimales: 1 },
        { formula: "voc_frio", extra: "voc_cadena", concepto: "Voc de la serie de 2", valor: 89.6, decimales: 1 },
        { formula: "protecciones", concepto: "Corriente de diseño del controlador", valor: 23.4, decimales: 1 },
        { formula: "generador", concepto: "Semana gris con banco", valor: 15, decimales: 0 },
        { formula: "generador", extra: "puro", concepto: "Semana gris a generador puro", valor: 86, decimales: 0 }
      ]
    }
  };

  /* Evalúa un esperado con los valores del preset (lo usan la app y las pruebas). */
  raiz.evaluarEsperado = function (preset, e, ctx) {
    var f = raiz.FORMULAS.filter(function (x) { return x.clave === e.formula; })[0];
    var base = {};
    f.inputs.forEach(function (c) { base[c.clave] = c.defecto; });
    var v = Object.assign(base, preset.valores[e.formula] || {});
    var r = f.calculo(v);
    var obtenido = r;
    if (e.extra) {
      var x = (f.extras ? f.extras(v, r, ctx) : []).filter(function (k) { return k.clave === e.extra; })[0];
      obtenido = x ? x.n : NaN;
    }
    var redondeado = Number(obtenido.toFixed(e.decimales));
    var tol = e.tolerancia !== undefined ? e.tolerancia : 0;
    return { obtenido: obtenido, redondeado: redondeado, ok: Math.abs(redondeado - e.valor) <= tol + 1e-9, formula: f };
  };
})(typeof window !== "undefined" ? window : globalThis);
