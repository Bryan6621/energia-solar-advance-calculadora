/* pruebas/verificar.js — comprueba que la calculadora y el libro dicen lo mismo.
   Uso: node pruebas/verificar.js   (sale con código 1 si hay discrepancias)
   Recorre los casos Torres, La Espiga y Los Alisos de js/formulas.js y, además,
   que cada fórmula produzca número, operación y gráfica con sus valores por defecto. */
"use strict";
require("../js/motor.js");
require("../js/formulas.js");
var ctx = { m: function (x, d) { return "USD " + Motor.es(x, d === undefined ? 0 : d); }, n: Motor.es };
var fallos = 0, total = 0;
Object.keys(PRESETS).forEach(function (k) {
  var p = PRESETS[k];
  console.log("\n" + p.nombre);
  p.esperados.forEach(function (e) {
    total++;
    var r = evaluarEsperado(p, e, ctx);
    if (!r.ok) { fallos++; }
    console.log((r.ok ? "  ok     " : "  FALLA  ") + e.concepto + ": " + Motor.es(r.obtenido, e.decimales) + " (libro: " + Motor.es(e.valor, e.decimales) + ")");
  });
});
console.log("\nIntegridad de las fórmulas");
FORMULAS.forEach(function (f) {
  var v = {}; f.inputs.forEach(function (c) { v[c.clave] = c.defecto; });
  var r = f.calculo(v), problemas = [];
  if (!isFinite(r)) { problemas.push("resultado no finito"); }
  try { f.operacion(v, r, ctx); } catch (e) { problemas.push("operación: " + e.message); }
  try { var g = f.grafico(v, r, ctx); if (!g || !g.tipo) { problemas.push("gráfica vacía"); } } catch (e) { problemas.push("gráfica: " + e.message); }
  if (f.extras) { try { f.extras(v, r, ctx); } catch (e) { problemas.push("extras: " + e.message); } }
  f.inputs.forEach(function (c) { if (c.defecto < c.min || c.defecto > c.max) { problemas.push(c.clave + " fuera de rango"); } });
  total++;
  if (problemas.length) { fallos++; console.log("  FALLA  " + f.nombre + ": " + problemas.join("; ")); }
  else { console.log("  ok     " + f.nombre); }
});
console.log("\n" + (fallos ? fallos + " discrepancias de " + total : "0 discrepancias de " + total + " comprobaciones. La calculadora y el libro dicen lo mismo."));
process.exit(fallos ? 1 : 0);
