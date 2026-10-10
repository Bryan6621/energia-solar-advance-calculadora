/* herramientas-pro.js — herramientas del modo Advance-Pro.
   Herramientas profesionales de análisis fotovoltaico: menos educativas y más
   operativas que las 17 fórmulas del modo educativo. Cada una lleva una
   «explicacion» que se muestra con el botón de interrogación «?». Los cálculos
   son funciones puras y las entradas son editables (sin comprometer la fórmula). */

window.HERRAMIENTAS_PRO = [
  {
    id: "p1", nombre: "Temperatura de celda",
    expresion: "Tcelda = Tamb + (NOCT − 20) ÷ 800 × G",
    unidad: "°C",
    explicacion: "Estima la temperatura real de la celda en operación. Es la base para calcular la pérdida de potencia por calor: a más irradiancia, la celda se calienta y rinde menos.",
    inputs: [
      { clave: "tamb", etiqueta: "Temperatura ambiente", unidad: "°C", defecto: 25 },
      { clave: "g", etiqueta: "Irradiancia", unidad: "W/m²", defecto: 800 },
      { clave: "noct", etiqueta: "NOCT del módulo", unidad: "°C", defecto: 45 }
    ],
    calculo: function (v) { return v.tamb + ((v.noct - 20) / 800) * v.g; },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: "p2", nombre: "Pérdida de potencia por temperatura",
    expresion: "Preal = Pmp × [1 + γ × (Tcelda − 25)]",
    unidad: "W",
    explicacion: "Corrige la potencia nominal por la temperatura de celda. γ es el coeficiente térmico de potencia (−0,29%/°C en el módulo de referencia); el resultado es la potencia realmente disponible.",
    inputs: [
      { clave: "pmp", etiqueta: "Potencia nominal (Pmp)", unidad: "W", defecto: 450 },
      { clave: "tcelda", etiqueta: "Temperatura de celda", unidad: "°C", defecto: 45 },
      { clave: "gamma", etiqueta: "Coeficiente térmico", unidad: "1/°C", defecto: -0.0029 }
    ],
    calculo: function (v) { return v.pmp * (1 + v.gamma * (v.tcelda - 25)); },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: "p3", nombre: "Producción anual con degradación",
    expresion: "Eaño(n) = E0 × (1 − d)^n",
    unidad: "kWh/año",
    explicacion: "Proyecta la producción de un año dado considerando la degradación anual del módulo (típicamente 0,4–0,6% anual). Sirve para presupuestar la energía a lo largo de la vida útil.",
    inputs: [
      { clave: "e0", etiqueta: "Producción del año 1", unidad: "kWh/año", defecto: 2176 },
      { clave: "d", etiqueta: "Degradación anual", unidad: "%/año", defecto: 0.5 },
      { clave: "n", etiqueta: "Año a proyectar", unidad: "años", defecto: 10 }
    ],
    calculo: function (v) { return v.e0 * Math.pow(1 - v.d / 100, v.n); },
    formato: function (n) { return n.toFixed(0); }
  },
  {
    id: "p4", nombre: "Performance ratio real",
    expresion: "PR = E ÷ (H × P_STC)",
    unidad: "ratio",
    explicacion: "El PR mide qué fracción de la energía teórica entrega realmente el sistema (0,80 es un valor sano). Compara la energía producida contra la irradiación recibida y la potencia instalada.",
    inputs: [
      { clave: "e", etiqueta: "Energía producida", unidad: "kWh/año", defecto: 1814 },
      { clave: "h", etiqueta: "Irradiación anual", unidad: "kWh/m²/año", defecto: 1530 },
      { clave: "pstc", etiqueta: "Potencia instalada", unidad: "kWp", defecto: 1.8 }
    ],
    calculo: function (v) { return v.e / (v.h * v.pstc); },
    formato: function (n) { return n.toFixed(2); }
  },
  {
    id: "p5", nombre: "Factor de planta",
    expresion: "FC = E ÷ (P_STC × 8760)",
    unidad: "%",
    explicacion: "El factor de planta compara la energía real contra la que produciría el sistema funcionando a plena potencia todo el año. Valores típicos en solar: 15–20%.",
    inputs: [
      { clave: "e", etiqueta: "Energía producida", unidad: "kWh/año", defecto: 1814 },
      { clave: "pstc", etiqueta: "Potencia instalada", unidad: "kWp", defecto: 1.8 }
    ],
    calculo: function (v) { return (v.e / (v.pstc * 8760)) * 100; },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: "p6", nombre: "VAN del proyecto (VPN)",
    expresion: "VPN = −CAPEX + Σ ahorro ÷ (1 + r)^t",
    unidad: "USD",
    explicacion: "Valor Actual Neto: trae los ahorros futuros a valor presente descontados a una tasa r. Si el VPN es positivo, el proyecto crea valor por encima del costo de capital.",
    inputs: [
      { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2160 },
      { clave: "ahorro", etiqueta: "Ahorro neto anual", unidad: "USD/año", defecto: 304 },
      { clave: "r", etiqueta: "Tasa de descuento", unidad: "%/año", defecto: 8 },
      { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 25 }
    ],
    calculo: function (v) {
      var r = v.r / 100, suma = 0;
      for (var t = 1; t <= v.n; t++) { suma += v.ahorro / Math.pow(1 + r, t); }
      return -v.capex + suma;
    },
    formato: function (n) { return n.toFixed(0); }
  },
  {
    id: "p7", nombre: "TIR del proyecto",
    expresion: "r tal que VPN(r) = 0",
    unidad: "%/año",
    explicacion: "Tasa Interna de Retorno: la tasa de descuento que iguala el VPN a cero. Si la TIR supera el costo de capital, el proyecto es rentable. Se calcula por iteración numérica.",
    inputs: [
      { clave: "capex", etiqueta: "CAPEX", unidad: "USD", defecto: 2160 },
      { clave: "ahorro", etiqueta: "Ahorro neto anual", unidad: "USD/año", defecto: 304 },
      { clave: "n", etiqueta: "Vida útil", unidad: "años", defecto: 25 }
    ],
    calculo: function (v) {
      function vpn(r) {
        var suma = 0;
        for (var t = 1; t <= v.n; t++) { suma += v.ahorro / Math.pow(1 + r, t); }
        return -v.capex + suma;
      }
      var lo = 0.0001, hi = 1.0;
      if (vpn(hi) < 0) { return 0; }
      for (var i = 0; i < 60; i++) {
        var mid = (lo + hi) / 2;
        if (vpn(mid) > 0) { lo = mid; } else { hi = mid; }
      }
      return (lo + hi) / 2 * 100;
    },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: "p8", nombre: "Ventana MPPT del inversor",
    expresion: "N_máx por Voc frío · N_mín por Vmp calor",
    unidad: "módulos/serie",
    explicacion: "Determina el rango de módulos en serie compatible con el inversor: el máximo lo limita el Voc corregido por frío (no superar Vmáx) y el mínimo el Vmp corregido por calor (no bajar de Vmín MPPT).",
    inputs: [
      { clave: "voc", etiqueta: "Voc del módulo", unidad: "V", defecto: 41.2 },
      { clave: "vmp", etiqueta: "Vmp del módulo", unidad: "V", defecto: 34.5 },
      { clave: "coef", etiqueta: "Coeficiente térmico", unidad: "1/°C", defecto: -0.0029 },
      { clave: "tmin", etiqueta: "Temperatura mínima", unidad: "°C", defecto: -5 },
      { clave: "tmax", etiqueta: "Temperatura de celda máx", unidad: "°C", defecto: 65 },
      { clave: "vmax", etiqueta: "Vmáx del inversor", unidad: "V", defecto: 600 },
      { clave: "vmpp_min", etiqueta: "Vmín MPPT", unidad: "V", defecto: 120 }
    ],
    calculo: function (v) {
      var vocFrio = v.voc * (1 + v.coef * (v.tmin - 25));
      var vmpCalor = v.vmp * (1 + v.coef * (v.tmax - 25));
      var nmax = Math.floor(v.vmax / vocFrio);
      var nmin = Math.ceil(v.vmpp_min / vmpCalor);
      return { nmax: nmax, nmin: nmin, vocFrio: vocFrio, vmpCalor: vmpCalor };
    },
    // esta herramienta devuelve un objeto: la UI muestra "nmin – nmax"
    esRango: true
  },
  {
    id: "p9", nombre: "Separación entre filas",
    expresion: "d = h ÷ tan(elevación mínima)",
    unidad: "m",
    explicacion: "Evita sombreado entre filas de paneles: la distancia d se calcula con la altura h de la fila y el ángulo de elevación solar mínimo del solsticio de invierno (según latitud).",
    inputs: [
      { clave: "h", etiqueta: "Altura de la fila", unidad: "m", defecto: 2 },
      { clave: "alfa", etiqueta: "Elevación solar mínima", unidad: "grados", defecto: 25 }
    ],
    calculo: function (v) {
      var rad = v.alfa * Math.PI / 180;
      return v.h / Math.tan(rad);
    },
    formato: function (n) { return n.toFixed(1); }
  },
  {
    id: "p10", nombre: "Emisiones de CO₂ evitadas",
    expresion: "CO₂ = E × factor de emisión",
    unidad: "kg/año",
    explicacion: "Estima las emisiones evitadas al generar con el sol en lugar de la red. El factor de emisión depende de la matriz eléctrica de cada país (referencia orientativa 0,45 kg/kWh).",
    inputs: [
      { clave: "e", etiqueta: "Energía anual", unidad: "kWh/año", defecto: 2176 },
      { clave: "factor", etiqueta: "Factor de emisión", unidad: "kg/kWh", defecto: 0.45 }
    ],
    calculo: function (v) { return v.e * v.factor; },
    formato: function (n) { return n.toFixed(0); }
  }
];
