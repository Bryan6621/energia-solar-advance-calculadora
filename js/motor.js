/* motor.js — núcleo numérico de la Calculadora Solar Advance.
   Funciones puras, sin DOM: las usan las fórmulas, las gráficas, el simulador
   y las pruebas de pruebas/verificar.js (Node). Mismas cuentas que
   herramientas/verificar_cifras.py del libro, línea por línea:
   - energía aprovechada del año t = min(consumo anual, producción útil × (1 − d)^(t−1))
   - flujo del año t = energía aprovechada × tarifa − OPEX − reemplazo (si toca)
   - LCOE simple = (CAPEX + OPEX × n + reemplazo) ÷ Σ energía aprovechada
   - LCOE descontado = Σ costos ÷ (1 + r)^t  ÷  Σ energía ÷ (1 + r)^t
   - cuota = P × i ÷ (1 − (1 + i)^−n), con i y n mensuales */
(function (raiz) {
  "use strict";

  function cuota(capital, tasaAnualPct, anios) {
    var i = tasaAnualPct / 100 / 12, n = Math.round(anios * 12);
    if (n <= 0) { return NaN; }
    if (i === 0) { return capital / n; }
    return capital * i / (1 - Math.pow(1 + i, -n));
  }

  function vpn(tasaPct, flujos) {
    var r = tasaPct / 100, s = 0;
    for (var t = 0; t < flujos.length; t++) { s += flujos[t] / Math.pow(1 + r, t); }
    return s;
  }

  /* TIR por bisección (misma rutina que el libro): devuelve % o NaN si no
     hay cambio de signo en el intervalo [−90 %, 200 %]. */
  function tir(flujos) {
    var bajo = -0.9, alto = 2.0;
    var fB = vpn(bajo * 100, flujos), fA = vpn(alto * 100, flujos);
    if (fB * fA > 0) { return NaN; }
    for (var k = 0; k < 200; k++) {
      var medio = (bajo + alto) / 2;
      if (vpn(medio * 100, flujos) > 0) { bajo = medio; } else { alto = medio; }
    }
    return (bajo + alto) / 2 * 100;
  }

  /* Proyecto on-grid completo. p: capex, util_anual (kWh año 1), consumo_anual
     (tope de energía aprovechable; Infinity si todo se aprovecha), tarifa,
     opex, reemplazo, anio_reemplazo, degradacion (%), n (años), r (%). */
  function proyecto(p) {
    var n = Math.max(1, Math.round(p.n)), d = (p.degradacion || 0) / 100, r = (p.r || 0) / 100;
    var tope = p.consumo_anual > 0 ? p.consumo_anual : Infinity;
    var energia = [], flujos = [-p.capex], costosDesc = p.capex, energiaDesc = 0;
    var costosNom = p.capex;
    for (var t = 1; t <= n; t++) {
      var e = Math.min(tope, p.util_anual * Math.pow(1 - d, t - 1));
      var rep = (t === Math.round(p.anio_reemplazo) ? (p.reemplazo || 0) : 0);
      energia.push(e);
      flujos.push(e * p.tarifa - p.opex - rep);
      costosNom += p.opex + rep;
      costosDesc += (p.opex + rep) / Math.pow(1 + r, t);
      energiaDesc += e / Math.pow(1 + r, t);
    }
    var sumaE = energia.reduce(function (a, b) { return a + b; }, 0);
    var acumulado = [], descontado = [], a = 0, ad = 0;
    for (var k = 0; k < flujos.length; k++) {
      a += flujos[k]; ad += flujos[k] / Math.pow(1 + r, k);
      acumulado.push(a); descontado.push(ad);
    }
    return {
      energia: energia, flujos: flujos, acumulado: acumulado, descontado: descontado,
      lcoeSimple: costosNom / sumaE, lcoeDescontado: costosDesc / energiaDesc,
      vpn: vpn(p.r || 0, flujos), tir: tir(flujos), paybackReal: payback(flujos)
    };
  }

  /* Payback interpolado sobre flujos [−CAPEX, f1, f2, …]. */
  function payback(flujos) {
    var acumulado = flujos[0];
    for (var t = 1; t < flujos.length; t++) {
      if (acumulado + flujos[t] >= 0) { return t - 1 + (-acumulado) / flujos[t]; }
      acumulado += flujos[t];
    }
    return NaN;
  }

  /* Siguiente valor comercial (breakers, secciones de cable). */
  function siguienteComercial(valor, serie) {
    for (var i = 0; i < serie.length; i++) { if (serie[i] >= valor) { return serie[i]; } }
    return NaN;
  }

  /* Número en notación española: punto de miles y coma decimal. */
  function es(valor, decimales) {
    if (!isFinite(valor)) { return "—"; }
    var negativo = valor < 0;
    var s = Math.abs(valor).toFixed(decimales === undefined ? 0 : decimales);
    var partes = s.split(".");
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (negativo ? "−" : "") + partes.join(",");
  }

  raiz.Motor = {
    cuota: cuota, vpn: vpn, tir: tir, proyecto: proyecto, payback: payback,
    siguienteComercial: siguienteComercial, es: es,
    BREAKERS: [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125],
    SECCIONES: [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120]
  };
})(typeof window !== "undefined" ? window : globalThis);
