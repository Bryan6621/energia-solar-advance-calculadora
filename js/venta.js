/* venta.js — herramientas de mesa del modo Advance Pro:
   1) Asesor de decisión (on-grid, híbrido o isla), 2) Simulador antes y después
   (facturas acumuladas contra inversión, con OPEX, reemplazo del inversor y
   payback interpolado), 3) Detective de facturas (cinco zonas y costo efectivo).
   Gráficas con graficos.js; sin librerías, sin emojis. */
window.Venta = (function () {
  "use strict";
  var M = window.Motor;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ------------------------------------------------------------ 1. Asesor */
  function asesor(cont, volver) {
    var P = [
      { id: "red", texto: "¿La red eléctrica llega al predio?", si: "Sí, llega", no: "No llega" },
      { id: "confiable", texto: "¿La red es confiable, con cortes poco frecuentes?", si: "Sí, es confiable", no: "No, falla seguido" },
      { id: "meta", texto: "¿Qué pesa más para el cliente?", si: "Bajar la factura", no: "Tener respaldo en los cortes" }
    ];
    cont.innerHTML = volver + '<header class="vista__cabecera"><h2 class="vista__titulo">Asesor de decisión</h2>' +
      '<p class="vista__intro">Tres preguntas, en el orden del libro: primero la red, después su calidad, al final la meta del cliente.</p></header>' +
      P.map(function (p, i) {
        return '<fieldset class="pregunta" data-p="' + i + '"' + (i ? " hidden" : "") + '><legend><span class="pregunta__n">' + (i + 1) + "</span>" + p.texto + "</legend>" +
          '<div class="opciones"><label class="opcion"><input type="radio" name="' + p.id + '" value="si"><span>' + p.si + '</span></label>' +
          '<label class="opcion"><input type="radio" name="' + p.id + '" value="no"><span>' + p.no + "</span></label></div></fieldset>";
      }).join("") + '<div class="recomendacion" id="recomendacion" hidden aria-live="polite"></div>';

    function valor(n) { var x = cont.querySelector('input[name="' + n + '"]:checked'); return x ? x.value : null; }
    function mostrar(titulo, texto, ruta, enlace) {
      var r = cont.querySelector("#recomendacion");
      r.hidden = false;
      r.innerHTML = '<p class="recomendacion__etiqueta">Recomendación</p><p class="recomendacion__titulo">' + titulo + "</p><p>" + texto + "</p>" +
        (ruta ? '<a class="boton" href="' + ruta + '">' + enlace + "</a>" : "");
    }
    function evaluar() {
      var q = cont.querySelectorAll(".pregunta"), r = cont.querySelector("#recomendacion");
      r.hidden = true; q[1].hidden = true; q[2].hidden = true;
      var red = valor("red");
      if (!red) { return; }
      if (red === "no") { mostrar("Sistema autónomo (isla)", "Sin red, el sistema es la red: campo, banco de baterías con días de autonomía, inversor cargador y generador de respaldo para la semana gris (Parte VIII).", "#/educativo/5", "Dimensionar la isla"); return; }
      q[1].hidden = false;
      var conf = valor("confiable");
      if (!conf) { return; }
      if (conf === "no") { mostrar("Híbrido con baterías", "La red está, pero falla: on-grid con inversor híbrido y un banco dimensionado a las cargas críticas, no a toda la casa.", "#/educativo/5", "Dimensionar el banco"); return; }
      q[2].hidden = false;
      var meta = valor("meta");
      if (!meta) { return; }
      if (meta === "no") { mostrar("Híbrido de respaldo", "La red es buena y el cliente quiere tranquilidad: híbrido con banco pequeño para cargas críticas. Explique que el banco suma costo y no ahorro.", "#/educativo/5", "Dimensionar el banco"); }
      else { mostrar("On-grid", "Red confiable y ahorro como meta: on-grid puro, dimensionado con el peor mes y la regla del ÷0,8. Es la opción de menor costo por kWh.", "#/educativo/2", "Abrir el dimensionador"); }
    }
    cont.querySelectorAll("input[type=radio]").forEach(function (x) { x.addEventListener("change", evaluar); });
  }

  /* ------------------------------------------------------------ 2. Simulador */
  function simulador(cont, volver, u) {
    var entradas = [
      { clave: "factura", etiqueta: "Factura mensual actual", unidad: "USD/mes", defecto: 40, min: 5, max: 2000, paso: 1 },
      { clave: "residual", etiqueta: "Factura con el sistema", unidad: "USD/mes", defecto: 7, min: 0, max: 2000, paso: 0.5 },
      { clave: "capex", etiqueta: "CAPEX del sistema", unidad: "USD", defecto: 2700, min: 500, max: 60000, paso: 50 },
      { clave: "opex", etiqueta: "OPEX anual", unidad: "USD/año", defecto: 27, min: 0, max: 2000, paso: 1 },
      { clave: "reemplazo", etiqueta: "Reemplazo del inversor (año 12)", unidad: "USD", defecto: 330, min: 0, max: 10000, paso: 10 },
      { clave: "infla", etiqueta: "Aumento anual de la tarifa", unidad: "%/año", defecto: 0, min: 0, max: 15, paso: 0.5 },
      { clave: "anos", etiqueta: "Horizonte", unidad: "años", defecto: 25, min: 5, max: 30, paso: 1 }
    ];
    cont.innerHTML = volver + '<header class="vista__cabecera"><h2 class="vista__titulo">Simulador antes y después</h2>' +
      '<p class="vista__intro">Lo que el cliente pagaría sin hacer nada frente a lo que paga con el sistema: inversión, factura residual, mantenimiento y el reemplazo del inversor.</p></header>' +
      '<article class="formula"><div class="formula__cuerpo"><div class="formula__entradas">' + entradas.map(function (c) { return u.campoHTML(c); }).join("") + "</div>" +
      '<div class="formula__salidas"><div class="resultado"><span class="resultado__valor" id="sim-payback">—</span><span class="resultado__unidad">años de payback</span></div>' +
      '<p class="operacion" id="sim-operacion"></p><div class="grafico" id="sim-grafico"></div></div></div>' +
      '<p class="formula__nota">Con aumento de tarifa en 0 % el payback coincide con el del libro (7,3 años en el caso Torres). Cada punto de aumento anual lo acorta.</p></article>';
    var tarjeta = cont.querySelector(".formula"), g = cont.querySelector("#sim-grafico");
    function redibujar() {
      var v = u.leerValores(tarjeta), n = Math.max(1, Math.round(v.anos)), i = v.infla / 100;
      var xs = [0], sin = [0], con = [v.capex], s = 0, c = v.capex, payback = NaN;
      for (var t = 1; t <= n; t++) {
        var k = Math.pow(1 + i, t - 1);
        var anteriorS = s, anteriorC = c;
        s += v.factura * 12 * k;
        c += v.residual * 12 * k + v.opex + (t === 12 ? v.reemplazo : 0);
        if (isNaN(payback) && c <= s) {
          var d0 = anteriorC - anteriorS, d1 = c - s;
          payback = t - 1 + d0 / (d0 - d1);
        }
        xs.push(t); sin.push(s); con.push(c);
      }
      cont.querySelector("#sim-payback").textContent = isNaN(payback) ? "más de " + n : M.es(payback, 1);
      cont.querySelector("#sim-operacion").textContent = "En " + n + " años: sin sistema " + u.ctx.m(s) + " · con sistema " + u.ctx.m(c) + " · diferencia " + u.ctx.m(s - c);
      window.Graficos.dibujar(g, { tipo: "linea", titulo: "Pagos acumulados", x: xs, etiquetaX: "año",
        series: [{ nombre: "Sin sistema", valores: sin, tono: "rojo" }, { nombre: "Con sistema", valores: con, tono: "azul" }],
        marcador: isNaN(payback) ? null : { x: payback, y: v.capex + (v.residual * 12 + v.opex) * payback, etiqueta: "payback " + M.es(payback, 1) + " años" },
        moneda: true, decimales: 0 }, u.ctx);
    }
    u.cablearCampos(tarjeta, redibujar);
    window.Graficos.vigilar(g, redibujar);
    redibujar();
  }

  /* ------------------------------------------------------------ 3. Detective */
  function detective(cont, volver, u) {
    var entradas = [
      { clave: "kwh", etiqueta: "Consumo del mes", unidad: "kWh/mes", defecto: 220, min: 20, max: 5000, paso: 5 },
      { clave: "tarifa", etiqueta: "Precio de la energía", unidad: "USD/kWh", defecto: 0.15, min: 0.01, max: 0.8, paso: 0.005 },
      { clave: "fijos", etiqueta: "Cargos fijos", unidad: "USD/mes", defecto: 7, min: 0, max: 300, paso: 0.5 },
      { clave: "imp", etiqueta: "Impuestos (+) o subsidios (−)", unidad: "%", defecto: 0, min: -50, max: 40, paso: 1 },
      { clave: "promedio", etiqueta: "Consumo promedio de los últimos 6 meses", unidad: "kWh/mes", defecto: 220, min: 20, max: 5000, paso: 5 }
    ];
    cont.innerHTML = volver + '<header class="vista__cabecera"><h2 class="vista__titulo">Detective de facturas</h2>' +
      '<p class="vista__intro">Las cinco zonas de la factura del capítulo 2 y las señales que conviene preguntar al cliente.</p></header>' +
      '<article class="formula"><div class="formula__cuerpo"><div class="formula__entradas">' + entradas.map(function (c) { return u.campoHTML(c); }).join("") + "</div>" +
      '<div class="formula__salidas"><div class="resultado"><span class="resultado__valor" id="det-total">—</span><span class="resultado__unidad" id="det-unidad"></span></div>' +
      '<dl class="extras" id="det-zonas"></dl><div class="grafico" id="det-grafico"></div><ul class="alertas" id="det-alertas"></ul></div></div></article>';
    var t = cont.querySelector(".formula");
    function analizar() {
      var v = u.leerValores(t), energia = v.kwh * v.tarifa, base = energia + v.fijos, imp = base * v.imp / 100, total = base + imp;
      cont.querySelector("#det-total").textContent = u.ctx.m(total, 2);
      cont.querySelector("#det-unidad").textContent = "total a pagar";
      var zonas = [["1 · Consumo", M.es(v.kwh) + " kWh"], ["2 · Energía", u.ctx.m(energia, 2)], ["3 · Cargos fijos", u.ctx.m(v.fijos, 2)],
                   ["4 · " + (imp < 0 ? "Subsidios" : "Impuestos y contribuciones"), u.ctx.m(imp, 2)], ["5 · Costo efectivo", u.ctx.m(total / v.kwh, 3) + " por kWh"]];
      cont.querySelector("#det-zonas").innerHTML = zonas.map(function (z) { return "<div><dt>" + z[0] + "</dt><dd>" + z[1] + "</dd></div>"; }).join("");
      var alertas = [];
      if (v.fijos / total > 0.3) { alertas.push("Los cargos fijos pesan " + M.es(v.fijos / total * 100) + " % de la factura: ningún sistema los elimina. Ajuste la promesa."); }
      if (v.promedio > 0 && Math.abs(v.kwh - v.promedio) / v.promedio > 0.2) { alertas.push("Este mes se aparta " + M.es(Math.abs(v.kwh - v.promedio) / v.promedio * 100) + " % del promedio: dimensione con el promedio, no con un mes atípico."); }
      if (v.imp < 0) { alertas.push("Hay subsidio: el ahorro real del cliente es menor que la energía a tarifa plena. Pregunte si lo pierde al bajar su consumo."); }
      if (total / v.kwh > v.tarifa * 1.25) { alertas.push("El costo efectivo supera en más de 25 % al precio de la energía: el argumento de venta es la energía, no la factura completa."); }
      cont.querySelector("#det-alertas").innerHTML = alertas.length ? alertas.map(function (a) { return "<li>" + esc(a) + "</li>"; }).join("") : '<li class="alertas__ok">Sin señales de alerta: la factura responde a la estructura esperada.</li>';
      window.Graficos.dibujar(cont.querySelector("#det-grafico"), { tipo: "barras", orientacion: "h", titulo: "La factura por zonas", categorias: ["Factura"], apilado: true,
        series: [{ nombre: "Energía", valores: [energia], tono: "azul" }, { nombre: "Cargos fijos", valores: [v.fijos], tono: "gris" }, { nombre: "Impuestos", valores: [Math.max(0, imp)], tono: "oro" }],
        moneda: true, decimales: 2 }, u.ctx);
    }
    u.cablearCampos(t, analizar);
    window.Graficos.vigilar(cont.querySelector("#det-grafico"), analizar);
    analizar();
  }

  return { asesor: asesor, simulador: simulador, detective: detective };
})();
