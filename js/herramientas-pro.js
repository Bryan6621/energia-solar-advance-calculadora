/* herramientas-pro.js — herramientas de análisis del modo Advance Pro.
   Menos pedagógicas y más operativas que las fórmulas del libro. Cada una lleva
   su explicación, la operación con los números del usuario y, cuando ayuda,
   una gráfica en vivo. Valores de partida: caso Torres (manuscrito 1.1.0). */
(function (raiz) {
  "use strict";
  var M = raiz.Motor;
  var N = function (x, d) { return M.es(x, d); };

  raiz.HERRAMIENTAS_PRO = [
    {
      id: "p1", nombre: "Temperatura de celda",
      expresion: "T celda = T ambiente + (NOCT − 20) ÷ 800 × irradiancia",
      unidad: "°C", decimales: 1,
      explicacion: "La temperatura real de la celda en operación: a más sol, más calor y menos potencia.",
      inputs: [
        { clave: "tamb", etiqueta: "Temperatura ambiente", unidad: "°C", defecto: 25, min: -10, max: 50, paso: 1 },
        { clave: "g", etiqueta: "Irradiancia", unidad: "W/m²", defecto: 800, min: 100, max: 1200, paso: 10 },
        { clave: "noct", etiqueta: "NOCT del módulo", unidad: "°C", defecto: 45, min: 38, max: 50, paso: 1 }
      ],
      calculo: function (v) { return v.tamb + (v.noct - 20) / 800 * v.g; },
      operacion: function (v, r) { return N(v.tamb) + " + (" + N(v.noct) + " − 20) ÷ 800 × " + N(v.g) + " = " + N(r, 1) + " °C"; }
    },
    {
      id: "p2", nombre: "Potencia a temperatura real",
      expresion: "P real = Pmp × [1 + γ × (T celda − 25)]",
      unidad: "W", decimales: 1,
      explicacion: "Corrige la potencia de laboratorio por la temperatura de la celda. γ es el coeficiente de POTENCIA de la ficha (típico −0,30 a −0,40 %/°C), distinto del coeficiente del Voc.",
      inputs: [
        { clave: "pmp", etiqueta: "Potencia nominal (Pmp)", unidad: "W", defecto: 450, min: 100, max: 700, paso: 5 },
        { clave: "tcelda", etiqueta: "Temperatura de celda", unidad: "°C", defecto: 45, min: -10, max: 80, paso: 1 },
        { clave: "gamma", etiqueta: "Coeficiente de potencia γ", unidad: "%/°C", defecto: -0.35, min: -0.5, max: -0.2, paso: 0.01 }
      ],
      calculo: function (v) { return v.pmp * (1 + v.gamma / 100 * (v.tcelda - 25)); },
      operacion: function (v, r) { return N(v.pmp) + " × [1 + (" + N(v.gamma, 2) + " %) × (" + N(v.tcelda) + " − 25)] = " + N(r, 1) + " W"; },
      grafico: function (v) {
        var xs = [], ys = [];
        for (var t = 0; t <= 75; t += 5) { xs.push(t); ys.push(v.pmp * (1 + v.gamma / 100 * (t - 25))); }
        return { tipo: "linea", titulo: "El calor resta vatios", x: xs, etiquetaX: "temperatura de celda (°C)",
          series: [{ nombre: "Potencia", valores: ys, tono: "azul" }],
          marcador: { x: v.tcelda, y: v.pmp * (1 + v.gamma / 100 * (v.tcelda - 25)), etiqueta: N(v.pmp * (1 + v.gamma / 100 * (v.tcelda - 25)), 0) + " W" }, unidad: "W", decimales: 0 };
      }
    },
    {
      id: "p3", nombre: "Producción con degradación",
      expresion: "E año n = E año 1 × (1 − d)^(n − 1)",
      unidad: "kWh/año", decimales: 0,
      explicacion: "La producción de un año cualquiera, con la degradación anual del módulo (0,4–0,6 % típico).",
      inputs: [
        { clave: "e1", etiqueta: "Producción útil del año 1", unidad: "kWh/año", defecto: 2721.6, min: 300, max: 60000, paso: 1 },
        { clave: "d", etiqueta: "Degradación anual", unidad: "%/año", defecto: 0.5, min: 0, max: 1.5, paso: 0.05 },
        { clave: "n", etiqueta: "Año a proyectar", unidad: "año", defecto: 25, min: 1, max: 30, paso: 1 }
      ],
      calculo: function (v) { return v.e1 * Math.pow(1 - v.d / 100, v.n - 1); },
      operacion: function (v, r) { return N(v.e1) + " × (1 − " + N(v.d, 2) + " %)^" + N(v.n - 1) + " = " + N(r) + " kWh (" + N(r / v.e1 * 100, 1) + " % del año 1)"; },
      grafico: function (v, r) {
        var xs = [], ys = [];
        for (var t = 1; t <= 30; t++) { xs.push(t); ys.push(v.e1 * Math.pow(1 - v.d / 100, t - 1)); }
        return { tipo: "linea", titulo: "Treinta años de producción", x: xs, etiquetaX: "año",
          series: [{ nombre: "Producción útil", valores: ys, tono: "azul", area: true }],
          marcador: { x: v.n, y: r, etiqueta: N(r) + " kWh" }, unidad: "kWh", decimales: 0 };
      }
    },
    {
      id: "p4", nombre: "Performance ratio real",
      expresion: "PR = energía producida ÷ (irradiación × potencia instalada)",
      unidad: "", decimales: 2,
      explicacion: "Qué fracción de la energía teórica entrega el sistema. Sano entre 0,75 y 0,85 (cap. 18).",
      inputs: [
        { clave: "e", etiqueta: "Energía producida", unidad: "kWh/año", defecto: 2759, min: 100, max: 60000, paso: 1 },
        { clave: "h", etiqueta: "Irradiación anual", unidad: "kWh/m²·año", defecto: 1533, min: 800, max: 2600, paso: 1 },
        { clave: "pstc", etiqueta: "Potencia instalada", unidad: "kWp", defecto: 2.25, min: 0.3, max: 50, paso: 0.05 }
      ],
      calculo: function (v) { return v.e / (v.h * v.pstc); },
      operacion: function (v, r) { return N(v.e) + " ÷ (" + N(v.h) + " × " + N(v.pstc, 2) + ") = " + N(r, 2); },
      grafico: function (v, r) { return { tipo: "medidor", titulo: "Salud del sistema", valor: r, max: 1, umbral: { valor: 0.75, etiqueta: "0,75 mínimo sano" }, sufijo: "", decimales: 2, peligro: 0.7 }; }
    },
    {
      id: "p5", nombre: "Factor de planta",
      expresion: "Factor de planta = energía anual ÷ (potencia × 8.760 h)",
      unidad: "%", decimales: 1,
      explicacion: "La energía real frente a la de un sistema a plena potencia todo el año. En solar: 13–20 %.",
      inputs: [
        { clave: "e", etiqueta: "Energía anual", unidad: "kWh/año", defecto: 2759, min: 100, max: 60000, paso: 1 },
        { clave: "pstc", etiqueta: "Potencia instalada", unidad: "kWp", defecto: 2.25, min: 0.3, max: 50, paso: 0.05 }
      ],
      calculo: function (v) { return v.e / (v.pstc * 8760) * 100; },
      operacion: function (v, r) { return N(v.e) + " ÷ (" + N(v.pstc, 2) + " × 8.760) = " + N(r, 1) + " %"; }
    },
    {
      id: "p8", nombre: "Ventana MPPT del inversor",
      expresion: "Máximo en serie por Voc frío · mínimo en serie por Vmp caliente",
      unidad: "módulos", esRango: true,
      explicacion: "El rango de módulos en serie que acepta el inversor: el máximo lo limita el Voc en la madrugada más fría; el mínimo, el Vmp en la tarde más caliente.",
      nota: "El Vmp cae con el calor más rápido que el Voc: use el coeficiente de Pmax de la ficha si no tiene el del Vmp.",
      inputs: [
        { clave: "voc", etiqueta: "Voc del módulo", unidad: "V", defecto: 41.2, min: 20, max: 60, paso: 0.1 },
        { clave: "vmp", etiqueta: "Vmp del módulo", unidad: "V", defecto: 34.5, min: 15, max: 55, paso: 0.1 },
        { clave: "cvoc", etiqueta: "Coeficiente del Voc", unidad: "%/°C", defecto: -0.29, min: -0.5, max: -0.1, paso: 0.01 },
        { clave: "cvmp", etiqueta: "Coeficiente del Vmp", unidad: "%/°C", defecto: -0.35, min: -0.6, max: -0.1, paso: 0.01 },
        { clave: "tmin", etiqueta: "Temperatura mínima histórica", unidad: "°C", defecto: 10, min: -30, max: 25, paso: 1 },
        { clave: "tmax", etiqueta: "Temperatura máxima de celda", unidad: "°C", defecto: 65, min: 40, max: 85, paso: 1 },
        { clave: "vmax", etiqueta: "Voltaje máximo del inversor", unidad: "V", defecto: 600, min: 100, max: 1500, paso: 10 },
        { clave: "vmin", etiqueta: "Voltaje mínimo del MPPT", unidad: "V", defecto: 120, min: 50, max: 600, paso: 5 }
      ],
      calculo: function (v) {
        var vocFrio = v.voc * (1 + v.cvoc / 100 * (v.tmin - 25));
        var vmpCalor = v.vmp * (1 + v.cvmp / 100 * (v.tmax - 25));
        return { nmax: Math.floor(v.vmax / vocFrio), nmin: Math.ceil(v.vmin / vmpCalor), vocFrio: vocFrio, vmpCalor: vmpCalor };
      },
      grafico: function (v, r) {
        var cats = [], val = [], tonos = [];
        var tope = Math.min(40, r.nmax + 3);
        for (var n = Math.max(1, r.nmin - 2); n <= tope; n++) {
          cats.push(String(n)); val.push(n * r.vocFrio);
          tonos.push(n >= r.nmin && n <= r.nmax ? "azul" : "gris");
        }
        return { tipo: "barras", titulo: "Voc frío de la cadena según módulos en serie", categorias: cats, etiquetaX: "módulos",
          series: [{ nombre: "Voc frío", valores: val, tonos: tonos }], unidad: "V", decimales: 0, etiquetasCada: cats.length > 14 ? 2 : 1,
          referencia: { valor: v.vmax, etiqueta: "límite " + N(v.vmax) + " V" } };
      }
    },
    {
      id: "p9", nombre: "Separación entre filas",
      expresion: "d = altura de la fila ÷ tan(elevación solar mínima)",
      unidad: "m", decimales: 2,
      explicacion: "La distancia que evita que una fila haga sombra a la siguiente al mediodía del solsticio de invierno.",
      inputs: [
        { clave: "h", etiqueta: "Altura de la fila", unidad: "m", defecto: 1, min: 0.2, max: 4, paso: 0.05 },
        { clave: "alfa", etiqueta: "Elevación solar mínima", unidad: "grados", defecto: 35, min: 10, max: 80, paso: 1 }
      ],
      calculo: function (v) { return v.h / Math.tan(v.alfa * Math.PI / 180); },
      operacion: function (v, r) { return N(v.h, 2) + " ÷ tan(" + N(v.alfa) + "°) = " + N(r, 2) + " m"; }
    },
    {
      id: "p10", nombre: "Emisiones evitadas",
      expresion: "CO₂ evitado = energía anual × factor de emisión de la red",
      unidad: "kg/año", decimales: 0,
      explicacion: "Toneladas que la red habría emitido para producir la misma energía. El factor depende de la matriz de cada país: use el oficial.",
      inputs: [
        { clave: "e", etiqueta: "Energía anual aprovechada", unidad: "kWh/año", defecto: 2640, min: 100, max: 60000, paso: 1 },
        { clave: "factor", etiqueta: "Factor de emisión de la red", unidad: "kg/kWh", defecto: 0.45, min: 0.05, max: 1, paso: 0.01 }
      ],
      calculo: function (v) { return v.e * v.factor; },
      operacion: function (v, r) { return N(v.e) + " × " + N(v.factor, 2) + " = " + N(r) + " kg al año (" + N(r * 25 / 1000, 1) + " t en 25 años)"; }
    }
  ];
})(window);
