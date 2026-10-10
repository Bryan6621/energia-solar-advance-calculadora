/* venta.js — herramientas de venta del modo Advance-Pro:
   1) Asesor de decisión (árbol guiado on-grid / híbrido / off-grid).
   2) Simulador antes/después (curva SVG año a año con punto de payback).
   3) Detective de facturas (reconstruye las 5 zonas y detecta anomalías).
   Todo SVG, sin librerías, sin emojis, fiel al libro. */

window.Venta = (function () {
  function volverBoton(etiqueta) {
    return '<button class="boton-volver" id="volver-venta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg> ' + etiqueta + '</button>';
  }

  function enlazarVolver(contenedor, fn) {
    var b = contenedor.querySelector("#volver-venta");
    if (b) { b.addEventListener("click", fn); }
  }

  /* ------------------------------------------------------------- 1. Asesor de decisión */
  function asesor(contenedor, volverFn) {
    contenedor.innerHTML =
      '<h2 class="vista__titulo">Asesor de decisión</h2>' +
      '<p class="vista__intro">Responde tres preguntas y recibe la recomendación del libro sobre qué sistema te conviene.</p>' +
      volverBoton("Advance · Pro") +
      '<div class="tarjeta"><div class="tarjeta__cabecera"><span class="tarjeta__indice">1</span><span class="tarjeta__nombre">¿La red eléctrica llega a tu predio?</span></div>' +
      '<div class="opciones" id="preg-1"><label class="opcion"><input type="radio" name="p1" value="si"> <span>Sí, llega</span></label>' +
      '<label class="opcion"><input type="radio" name="p1" value="no"> <span>No llega</span></label></div></div>' +
      '<div class="tarjeta" id="tarjeta-2" style="display:none"><div class="tarjeta__cabecera"><span class="tarjeta__indice">2</span><span class="tarjeta__nombre">¿La red es confiable (cortes poco frecuentes)?</span></div>' +
      '<div class="opciones" id="preg-2"><label class="opcion"><input type="radio" name="p2" value="si"> <span>Sí, confiable</span></label>' +
      '<label class="opcion"><input type="radio" name="p2" value="no"> <span>No, falla seguido</span></label></div></div>' +
      '<div class="tarjeta" id="tarjeta-3" style="display:none"><div class="tarjeta__cabecera"><span class="tarjeta__indice">3</span><span class="tarjeta__nombre">¿Tu objetivo principal es bajar la factura?</span></div>' +
      '<div class="opciones" id="preg-3"><label class="opcion"><input type="radio" name="p3" value="si"> <span>Sí, ahorrar</span></label>' +
      '<label class="opcion"><input type="radio" name="p3" value="no"> <span>Quiero respaldo ante cortes</span></label></div></div>' +
      '<div class="tarjeta" id="resultado-asesor" style="display:none"></div>';

    function recomendacion(texto, detalle) {
      document.getElementById("resultado-asesor").style.display = "block";
      document.getElementById("resultado-asesor").innerHTML =
        '<div class="tarjeta__cabecera"><span class="tarjeta__indice">R</span><span class="tarjeta__nombre">Recomendación</span></div>' +
        '<p class="tarjeta__formula">' + texto + '</p>' + detalle;
    }

    function evaluar() {
      var p1 = (contenedor.querySelector('input[name="p1"]:checked') || {}).value;
      if (p1 === "no") {
        recomendacion("Sistema off-grid (isla)", '<p class="nota">No hay red: dimensiona la isla completa con la Parte VIII (banco de baterías, autonomía y generador de respaldo).</p>');
        return;
      }
      document.getElementById("tarjeta-2").style.display = "block";
      var p2 = (contenedor.querySelector('input[name="p2"]:checked') || {}).value;
      if (p2 === "no") {
        recomendacion("Sistema híbrido con baterías", '<p class="nota">La red falla: añade respaldo al on-grid. El inversor híbrido alimenta cargas críticas cuando hay cortes.</p>');
        return;
      }
      document.getElementById("tarjeta-3").style.display = "block";
      var p3 = (contenedor.querySelector('input[name="p3"]:checked') || {}).value;
      if (p3 === "no") {
        recomendacion("Sistema híbrido (respaldo)", '<p class="nota">Priorizas el respaldo: híbrido con banco dimensionado a tus cargas críticas.</p>');
      } else {
        recomendacion("Sistema on-grid", '<p class="nota">Red confiable y ahorro como meta: on-grid puro. Usa el dimensionador del modo educativo (módulo Dimensión).</p>');
      }
    }

    contenedor.querySelectorAll('input[name="p1"], input[name="p2"], input[name="p3"]').forEach(function (r) {
      r.addEventListener("change", evaluar);
    });
    enlazarVolver(contenedor, volverFn);
  }

  /* ------------------------------------------------------------- 2. Simulador antes/después */
  function simulador(contenedor, volverFn) {
    contenedor.innerHTML =
      '<h2 class="vista__titulo">Simulador antes / después</h2>' +
      '<p class="vista__intro">Compara pagar la factura para siempre contra invertir en tu sistema, año a año, con el punto exacto de payback.</p>' +
      volverBoton("Advance · Pro") +
      '<div class="tarjeta">' +
      '<div class="campo"><label class="campo__etiqueta">Factura mensual actual <span class="campo__unidad">USD/mes</span></label><input class="campo__entrada" id="sim-factura" type="number" step="any" value="40"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Ahorro mensual con solar <span class="campo__unidad">USD/mes</span></label><input class="campo__entrada" id="sim-ahorro" type="number" step="any" value="27.2"></div>' +
      '<div class="campo"><label class="campo__etiqueta">CAPEX del sistema <span class="campo__unidad">USD</span></label><input class="campo__entrada" id="sim-capex" type="number" step="any" value="2160"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Aumento anual de tarifa <span class="campo__unidad">%/año</span></label><input class="campo__entrada" id="sim-infla" type="number" step="any" value="3"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Horizonte <span class="campo__unidad">años</span></label><input class="campo__entrada" id="sim-anos" type="number" step="any" value="10"></div>' +
      '</div>' +
      '<div class="tarjeta"><div class="tarjeta__cabecera"><span class="tarjeta__indice">G</span><span class="tarjeta__nombre">Acumulado a lo largo del tiempo</span></div>' +
      '<svg id="sim-grafico" viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto"></svg>' +
      '<div class="sim-leyenda"><span class="sim-leyenda__item"><span class="sim-leyenda__punto" style="background:#B3472E"></span> Sin solar</span>' +
      '<span class="sim-leyenda__item"><span class="sim-leyenda__punto" style="background:#2F6B4F"></span> Con solar</span>' +
      '<span class="sim-leyenda__item"><span class="sim-leyenda__punto" style="background:#C2A042"></span> Payback</span></div>' +
      '<div class="resultado"><div><div class="resultado__etiqueta">Payback</div><div class="resultado__valor" id="sim-payback">—</div></div><div class="resultado__unidad">años</div></div>' +
      '</div>';

    function redibujar() {
      var factura = parseFloat(document.getElementById("sim-factura").value) || 0;
      var ahorro = parseFloat(document.getElementById("sim-ahorro").value) || 0;
      var capex = parseFloat(document.getElementById("sim-capex").value) || 0;
      var infla = (parseFloat(document.getElementById("sim-infla").value) || 0) / 100;
      var anos = Math.max(1, parseInt(document.getElementById("sim-anos").value, 10) || 10);

      var sin = 0, con = capex, residuo = factura - ahorro, facturaBase = factura;
      var ptsSin = [], ptsCon = [], payback = null;
      var maxY = capex;

      for (var k = 0; k <= anos; k++) {
        var f = facturaBase * 12 * Math.pow(1 + infla, k);
        sin += f;
        con += residuo * 12 * Math.pow(1 + infla, k);
        ptsSin.push([k, sin]); ptsCon.push([k, con]);
        if (payback === null && con <= sin) { payback = k; }
        maxY = Math.max(maxY, sin, con);
      }

      var W = 320, H = 190, mL = 6, mR = 6, mT = 6, mB = 14;
      function X(k) { return mL + (W - mL - mR) * (k / anos); }
      function Y(v) { return mT + (H - mT - mB) * (1 - v / maxY); }
      function linea(pts, color) {
        return '<polyline fill="none" stroke="' + color + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" points="' +
          pts.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); }).join(" ") + '"/>';
      }
      var svg = '<line x1="' + mL + '" y1="' + (H - mB) + '" x2="' + (W - mR) + '" y2="' + (H - mB) + '" stroke="#C9D4DE" stroke-width="1"/>' +
        linea(ptsSin, "#B3472E") + linea(ptsCon, "#2F6B4F");
      if (payback !== null) {
        svg += '<line x1="' + X(payback) + '" y1="' + mT + '" x2="' + X(payback) + '" y2="' + (H - mB) + '" stroke="#C2A042" stroke-width="1.4" stroke-dasharray="4 3"/>';
        svg += '<circle cx="' + X(payback) + '" cy="' + Y(ptsCon[payback][1]) + '" r="3.5" fill="#C2A042"/>';
      }
      document.getElementById("sim-grafico").innerHTML = svg;
      document.getElementById("sim-payback").textContent = payback === null ? "> " + anos : String(payback);
    }

    ["sim-factura", "sim-ahorro", "sim-capex", "sim-infla", "sim-anos"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", redibujar);
    });
    redibujar();
    enlazarVolver(contenedor, volverFn);
  }

  /* ------------------------------------------------------------- 3. Detective de facturas */
  function detective(contenedor, volverFn) {
    contenedor.innerHTML =
      '<h2 class="vista__titulo">Detective de facturas</h2>' +
      '<p class="vista__intro">Ingresa los datos de la factura y reconstruye las 5 zonas del capítulo 2, detectando anomalías.</p>' +
      volverBoton("Advance · Pro") +
      '<div class="tarjeta">' +
      '<div class="campo"><label class="campo__etiqueta">Consumo <span class="campo__unidad">kWh/mes</span></label><input class="campo__entrada" id="det-kwh" type="number" step="any" value="220"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Tarifa <span class="campo__unidad">USD/kWh</span></label><input class="campo__entrada" id="det-tarifa" type="number" step="any" value="0.15"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Cargos fijos <span class="campo__unidad">USD/mes</span></label><input class="campo__entrada" id="det-fijos" type="number" step="any" value="7"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Impuestos (+) o subsidios (−) <span class="campo__unidad">%</span></label><input class="campo__entrada" id="det-imp" type="number" step="any" value="8"></div>' +
      '</div>' +
      '<div class="tarjeta" id="det-resultado"></div>';

    function analizar() {
      var kwh = parseFloat(document.getElementById("det-kwh").value) || 0;
      var tarifa = parseFloat(document.getElementById("det-tarifa").value) || 0;
      var fijos = parseFloat(document.getElementById("det-fijos").value) || 0;
      var imp = (parseFloat(document.getElementById("det-imp").value) || 0) / 100;
      var energia = kwh * tarifa;
      var impuestos = (energia + fijos) * imp;
      var total = energia + fijos + impuestos;
      var alertas = [];
      if (fijos > total * 0.4) { alertas.push("Cargos fijos elevados (más del 40% del total)."); }
      if (tarifa > 0.20) { alertas.push("Tarifa alta frente al promedio regional."); }
      if (imp > 0.20) { alertas.push("Carga impositiva alta (más del 20%)."); }

      var filas = [
        ["1 · Consumo (kWh)", kwh.toFixed(0) + " kWh"],
        ["2 · Energía", monedaStr(energia)],
        ["3 · Cargos fijos", monedaStr(fijos)],
        ["4 · Impuestos / subsidios", monedaStr(impuestos)],
        ["5 · Total a pagar", monedaStr(total)]
      ].map(function (r) {
        return '<div class="fila-verificacion"><span class="fila-verificacion__concepto">' + r[0] + '</span><span class="fila-verificacion__valores">' + r[1] + '</span></div>';
      }).join("");

      document.getElementById("det-resultado").innerHTML =
        '<div class="tarjeta__cabecera"><span class="tarjeta__indice">D</span><span class="tarjeta__nombre">Las 5 zonas de tu factura</span></div>' + filas +
        (alertas.length ? '<p class="nota" style="color:var(--alerta)">Anomalías detectadas:</p>' + alertas.map(function (a) { return '<p class="nota">· ' + a + '</p>'; }).join("") : '<p class="nota">Sin anomalías: la factura responde a la estructura esperada.</p>');
    }

    function monedaStr(v) {
      return (window.formatearMonedaDetalle ? window.formatearMonedaDetalle(v) : "$ " + v.toFixed(2));
    }

    ["det-kwh", "det-tarifa", "det-fijos", "det-imp"].forEach(function (id) {
      document.getElementById(id).addEventListener("input", analizar);
    });
    analizar();
    enlazarVolver(contenedor, volverFn);
  }

  return { asesor: asesor, simulador: simulador, detective: detective };
})();
