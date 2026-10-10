/* formulas.js — las 17 fórmulas del capítulo 31 (fuente: «Energía Solar Advance»).
   Cada fórmula es un objeto con sus entradas editables (valores por defecto
   sacados del libro) y una función de cálculo PURA. La integridad de la
   fórmula es fija; solo se editan las variables de contexto del país del
   usuario. Sin emojis: la interfaz usa SVG. */

window.FORMULAS = [
  /* ===================== MÓDULO 1 — Diagnóstico de factura ===================== */
  {
    id: 1, modulo: 1, nombre: "Consumo diario",
    expresion: "Consumo diario = kWh/mes ÷ 30",
    unidad: "kWh/día",
    inputs: [
      { clave: "kwh_mes", etiqueta: "Consumo mensual de la factura", unidad: "kWh/mes", defecto: 220 }
    ],
    calculo: function (v) { return v.kwh_mes / 30; },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 2, modulo: 1, nombre: "Gasto proyectado a 10 años",
    expresion: "Total = factura × 12 × [( (1+i)^10 − 1 ) ÷ i]",
    unidad: "USD",
    nota: "El «costo de no hacer nada» del capítulo 24. La tasa i es el aumento anual de la tarifa; ajústela al historial de su país.",
    inputs: [
      { clave: "factura", etiqueta: "Factura mensual actual", unidad: "USD/mes", defecto: 40 },
      { clave: "i", etiqueta: "Aumento anual de la tarifa", unidad: "%/año", defecto: 3 }
    ],
    calculo: function (v) {
      var i = v.i / 100;
      if (i === 0) { return v.factura * 12 * 10; }
      return v.factura * 12 * ((Math.pow(1 + i, 10) - 1) / i);
    },
    formato: function (n) { return n.toFixed(0); }
  },
  {
    id: 3, modulo: 1, nombre: "Ahorro real con cargos fijos",
    expresion: "Pago restante = (consumo − útil) × tarifa + cargos fijos",
    unidad: "USD/mes",
    nota: "Jamás cero: los cargos fijos y el consumo no cubierto se siguen pagando (la regla del «no 100%»).",
    inputs: [
      { clave: "neto", etiqueta: "kWh que se siguen comprando a la red", unidad: "kWh", defecto: 38.6 },
      { clave: "tarifa", etiqueta: "Tarifa", unidad: "USD/kWh", defecto: 0.15 },
      { clave: "cargos", etiqueta: "Cargos fijos", unidad: "USD/mes", defecto: 7 }
    ],
    calculo: function (v) { return v.neto * v.tarifa + v.cargos; },
    formato: function (n) { return n.toFixed(1); }
  },

  /* ===================== MÓDULO 2 — Dimensionador on-grid ===================== */
  {
    id: 4, modulo: 2, nombre: "Producción útil mensual",
    expresion: "Útil mensual = Wp × HSP × 30 × PR",
    unidad: "kWh/mes",
    orientativo: true,
    nota: "El PR (performance ratio) por defecto es 0,80, el valor del libro; puede editarlo para su instalación.",
    inputs: [
      { clave: "wp", etiqueta: "Potencia instalada", unidad: "Wp", defecto: 1800 },
      { clave: "hsp", etiqueta: "HSP del peor mes", unidad: "h/día", defecto: 4.2, orientativo: true },
      { clave: "pr", etiqueta: "Performance ratio", unidad: "ratio", defecto: 0.8 }
    ],
    calculo: function (v) { return v.wp * v.hsp * 30 * v.pr / 1000; },
    formato: function (n) { return n.toFixed(0); }
  },
  {
    id: 5, modulo: 2, nombre: "Potencia pico necesaria",
    expresion: "Wp = (consumo diario × 1000) ÷ (HSP × PR)",
    unidad: "Wp",
    orientativo: true,
    nota: "El ÷0,8 (PR) va integrado: jamás se usa ×1,2 para «añadir» un 20%.",
    inputs: [
      { clave: "consumo_diario", etiqueta: "Consumo diario", unidad: "kWh/día", defecto: 7.3 },
      { clave: "hsp", etiqueta: "HSP del peor mes", unidad: "h/día", defecto: 4.2, orientativo: true },
      { clave: "pr", etiqueta: "Performance ratio", unidad: "ratio", defecto: 0.8 }
    ],
    calculo: function (v) { return (v.consumo_diario * 1000) / (v.hsp * v.pr); },
    formato: function (n) { return n.toFixed(0); }
  },
  {
    id: 6, modulo: 2, nombre: "Número de paneles",
    expresion: "Paneles = redondear SIEMPRE hacia arriba (Wp objetivo ÷ Wp panel)",
    unidad: "paneles",
    inputs: [
      { clave: "wp_objetivo", etiqueta: "Wp objetivo", unidad: "Wp", defecto: 1800 },
      { clave: "wp_panel", etiqueta: "Wp del panel elegido", unidad: "Wp", defecto: 450 }
    ],
    calculo: function (v) { return Math.ceil(v.wp_objetivo / v.wp_panel); },
    formato: function (n) { return String(n); }
  },
  {
    id: 7, modulo: 2, nombre: "Cobertura",
    expresion: "Cobertura = útil ÷ consumo",
    unidad: "%",
    inputs: [
      { clave: "util", etiqueta: "Producción útil", unidad: "kWh/mes", defecto: 181 },
      { clave: "consumo", etiqueta: "Consumo", unidad: "kWh/mes", defecto: 220 }
    ],
    calculo: function (v) { return (v.util / v.consumo) * 100; },
    formato: function (n) { return n.toFixed(1); }
  },

  /* ===================== MÓDULO 3 — Economía ===================== */
  {
    id: 8, modulo: 3, nombre: "Ahorro mensual",
    expresion: "Ahorro = útil × tarifa",
    unidad: "USD/mes",
    inputs: [
      { clave: "util", etiqueta: "Producción útil", unidad: "kWh/mes", defecto: 181.4 },
      { clave: "tarifa", etiqueta: "Tarifa", unidad: "USD/kWh", defecto: 0.15 }
    ],
    calculo: function (v) { return v.util * v.tarifa; },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 9, modulo: 3, nombre: "Payback",
    expresion: "Payback = CAPEX ÷ (ahorro anual − OPEX anual)",
    unidad: "años",
    inputs: [
      { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2160 },
      { clave: "ahorro_anual", etiqueta: "Ahorro anual", unidad: "USD/año", defecto: 326.4 },
      { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 21.6 }
    ],
    calculo: function (v) { return v.capex / (v.ahorro_anual - v.opex_anual); },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 10, modulo: 3, nombre: "LCOE",
    expresion: "LCOE = (CAPEX + reemplazos + OPEX × n) ÷ (producción anual × n)",
    unidad: "USD/kWh",
    nota: "Incluye un reemplazo de inversor en el numerador.",
    inputs: [
      { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2160 },
      { clave: "reemplazos", etiqueta: "Reemplazos", unidad: "USD", defecto: 840 },
      { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 0 },
      { clave: "produccion_anual", etiqueta: "Producción anual", unidad: "kWh/año", defecto: 2176.8 },
      { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 25 }
    ],
    calculo: function (v) { return (v.capex + v.reemplazos + v.opex_anual * v.n) / (v.produccion_anual * v.n); },
    formato: function (n) { return n.toFixed(3); }
  },

  /* ===================== MÓDULO 4 — Autónomo ===================== */
  {
    id: 11, modulo: 4, nombre: "Banco útil",
    expresion: "Banco útil = consumo diario × días de autonomía",
    unidad: "kWh",
    inputs: [
      { clave: "consumo_diario", etiqueta: "Consumo diario", unidad: "kWh/día", defecto: 2.16 },
      { clave: "dias", etiqueta: "Días de autonomía", unidad: "días", defecto: 3 }
    ],
    calculo: function (v) { return v.consumo_diario * v.dias; },
    formato: function (n) { return n.toFixed(2); }
  },
  {
    id: 12, modulo: 4, nombre: "Banco nominal",
    expresion: "Banco nominal = útil ÷ DOD",
    unidad: "kWh",
    nota: "Redondee al modelo comercial (el ejemplo del libro: 8,1 → 9,6).",
    inputs: [
      { clave: "util", etiqueta: "Banco útil", unidad: "kWh", defecto: 6.48 },
      { clave: "dod", etiqueta: "Profundidad de descarga (DOD)", unidad: "ratio", defecto: 0.8 }
    ],
    calculo: function (v) { return v.util / v.dod; },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 13, modulo: 4, nombre: "LCOE de la isla",
    expresion: "LCOE isla = (CAPEX + reemplazos + OPEX×n + generador×n) ÷ (energía anual × n)",
    unidad: "USD/kWh",
    nota: "El libro redondea el resultado del caso Los Alisos a 0,38 USD/kWh.",
    inputs: [
      { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 3700 },
      { clave: "reemplazos", etiqueta: "Reemplazos", unidad: "USD", defecto: 1700 },
      { clave: "opex_anual", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 0 },
      { clave: "generador_anual", etiqueta: "Generador anual", unidad: "USD/año", defecto: 0 },
      { clave: "energia_anual", etiqueta: "Energía anual", unidad: "kWh/año", defecto: 1051 },
      { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 15 }
    ],
    calculo: function (v) {
      return (v.capex + v.reemplazos + v.opex_anual * v.n + v.generador_anual * v.n) / (v.energia_anual * v.n);
    },
    formato: function (n) { return n.toFixed(2); }
  },

  /* ===================== MÓDULO 5 — Kit técnico del vendedor ===================== */
  {
    id: 14, modulo: 5, nombre: "Voc en frío",
    expresion: "Voc frío = Voc × [1 + coef × (25 − T mínima)]",
    unidad: "V",
    nota: "Con el límite del inversor, este valor da el máximo de paneles en serie.",
    inputs: [
      { clave: "voc", etiqueta: "Voc del panel", unidad: "V", defecto: 41.2 },
      { clave: "coef", etiqueta: "Coeficiente térmico", unidad: "/°C", defecto: 0.0029 },
      { clave: "tmin", etiqueta: "Temperatura mínima del sitio", unidad: "°C", defecto: -5 }
    ],
    calculo: function (v) { return v.voc * (1 + v.coef * (25 - v.tmin)); },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 15, modulo: 5, nombre: "Protecciones",
    expresion: "Corriente de diseño = I diseño × 1,25",
    unidad: "A",
    nota: "Elija el breaker comercial inmediatamente superior al resultado.",
    inputs: [
      { clave: "i_diseno", etiqueta: "Corriente de diseño", unidad: "A", defecto: 15 }
    ],
    calculo: function (v) { return v.i_diseno * 1.25; },
    formato: function (n) { return n.toFixed(2); }
  },
  {
    id: 16, modulo: 5, nombre: "Calibre por caída de tensión",
    expresion: "S = (2 × 0,0172 × L × I) ÷ (0,03 × V sistema)",
    unidad: "mm²",
    nota: "Caída máxima admisible del 3%. Use la tabla del Anexo B como respaldo.",
    inputs: [
      { clave: "l", etiqueta: "Longitud del tramo", unidad: "m", defecto: 20 },
      { clave: "i", etiqueta: "Corriente", unidad: "A", defecto: 18.75 },
      { clave: "v", etiqueta: "Voltaje del sistema", unidad: "V", defecto: 48 }
    ],
    calculo: function (v) { return (2 * 0.0172 * v.l * v.i) / (0.03 * v.v); },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: 17, modulo: 5, nombre: "Generador de respaldo",
    expresion: "Costo = horas × consumo horario × precio del combustible",
    unidad: "USD",
    nota: "Semana gris de ejemplo: 21 horas ≈ 15 USD.",
    inputs: [
      { clave: "horas", etiqueta: "Horas de motor", unidad: "h", defecto: 21 },
      { clave: "consumo_horario", etiqueta: "Consumo horario", unidad: "L/h", defecto: 0.5 },
      { clave: "precio", etiqueta: "Precio del combustible", unidad: "USD/L", defecto: 1.4 }
    ],
    calculo: function (v) { return v.horas * v.consumo_horario * v.precio; },
    formato: function (n) { return n.toFixed(1); }
  }
];

/* Presets de verificación (casos Torres y Los Alisos, valores del libro). */
window.PRESETS = {
  torres: {
    nombre: "Caso Torres",
    valores: {
      1: { kwh_mes: 220 },
      2: { factura: 40, i: 3 },
      3: { neto: 38.6, tarifa: 0.15, cargos: 7 },
      4: { wp: 1800, hsp: 4.2, pr: 0.8 },
      5: { consumo_diario: 7.3, hsp: 4.2, pr: 0.8 },
      6: { wp_objetivo: 1800, wp_panel: 450 },
      7: { util: 181, consumo: 220 },
      8: { util: 181.4, tarifa: 0.15 },
      9: { capex: 2160, ahorro_anual: 326.4, opex_anual: 21.6 },
      10: { capex: 2160, reemplazos: 840, opex_anual: 0, produccion_anual: 2176.8, n: 25 }
    },
    esperados: [
      { id: 6, concepto: "Número de paneles", valor: "4" },
      { id: 4, concepto: "Producción útil mensual", valor: "181" },
      { id: 8, concepto: "Ahorro mensual", valor: "27.2" },
      { id: 9, concepto: "Payback", valor: "7.1" },
      { id: 10, concepto: "LCOE", valor: "0.055" }
    ]
  },
  alisos: {
    nombre: "Caso Los Alisos",
    valores: {
      6: { wp_objetivo: 675, wp_panel: 450 },
      11: { consumo_diario: 2.16, dias: 3 },
      12: { util: 6.48, dod: 0.8 },
      13: { capex: 3700, reemplazos: 1700, opex_anual: 0, generador_anual: 0, energia_anual: 1051, n: 15 },
      14: { voc: 41.2, coef: 0.0029, tmin: -5 },
      15: { i_diseno: 18.75 },
      16: { l: 20, i: 18.75, v: 48 },
      17: { horas: 21, consumo_horario: 0.5, precio: 1.4 }
    },
    esperados: [
      { id: 6, concepto: "Número de paneles", valor: "2" },
      { id: 12, concepto: "Banco nominal", valor: "8.1" },
      { id: 14, concepto: "Voc en frío", valor: "44.8" },
      { id: 13, concepto: "LCOE de la isla", valor: "0.38" }
    ]
  }
};
