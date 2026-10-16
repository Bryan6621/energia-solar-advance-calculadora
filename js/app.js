/* app.js — Calculadora Solar Advance: rutas, tarjetas de fórmula con operación
   viva y gráfica en vivo, verificación contra el libro, modo Pro, proyectos,
   moneda, tema e instalación. JavaScript puro, sin dependencias, sin emojis. */
(function () {
  "use strict";

  var FORMULAS = window.FORMULAS, MODULOS = window.MODULOS, PRESETS = window.PRESETS;
  var HERRAMIENTAS = window.HERRAMIENTAS_PRO || [];
  var M = window.Motor;
  var VERSION = "2.0.0";

  /* ------------------------------------------------------------- iconos */
  var TRAZOS = {
    factura: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    dimension: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
    economia: '<path d="M4 19h16"/><path d="M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>',
    finanzas: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9v.01M18 15v.01"/>',
    autonomo: '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M21 11v2"/><path d="M7 10v4M10.5 10v4"/>',
    tecnico: '<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/>',
    verificar: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    educativo: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
    pro: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    certificado: '<circle cx="12" cy="9" r="5"/><path d="M8.5 13.5L7 22l5-3 5 3-1.5-8.5"/>',
    volver: '<path d="M15 18l-6-6 6-6"/>',
    voz: '<path d="M3 10v4h4l5 5V5L7 10z"/><path d="M15 9a4 4 0 0 1 0 6"/>',
    compartir: '<path d="M4 12v8h16v-8"/><path d="M12 4v12"/><path d="M8 8l4-4 4 4"/>',
    copiar: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    reiniciar: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>',
    casa: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    flecha: '<path d="M9 6l6 6-6 6"/>',
    carpeta: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
    asesor: '<path d="M12 3v6M12 15v6M5 12h14"/><circle cx="12" cy="12" r="3"/>',
    simulador: '<path d="M4 19h16"/><path d="M4 15c4 0 6-8 10-8 2 0 4 2 6 2"/>',
    lupa: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'
  };
  function icono(nombre) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (TRAZOS[nombre] || "") + "</svg>";
  }
  window.iconoAdvance = icono;

  /* ------------------------------------------------------------- moneda */
  var MONEDAS = [
    { pais: "Estados Unidos (referencia)", codigo: "USD", simbolo: "US$", tasa: 1 },
    { pais: "México", codigo: "MXN", simbolo: "$", tasa: 17.5 },
    { pais: "Guatemala", codigo: "GTQ", simbolo: "Q", tasa: 7.75 },
    { pais: "El Salvador", codigo: "USD", simbolo: "US$", tasa: 1 },
    { pais: "Honduras", codigo: "HNL", simbolo: "L", tasa: 24.7 },
    { pais: "Nicaragua", codigo: "NIO", simbolo: "C$", tasa: 36.7 },
    { pais: "Costa Rica", codigo: "CRC", simbolo: "₡", tasa: 520 },
    { pais: "Panamá", codigo: "USD", simbolo: "US$", tasa: 1 },
    { pais: "Cuba", codigo: "CUP", simbolo: "$", tasa: 24 },
    { pais: "República Dominicana", codigo: "DOP", simbolo: "RD$", tasa: 59 },
    { pais: "Puerto Rico", codigo: "USD", simbolo: "US$", tasa: 1 },
    { pais: "Colombia", codigo: "COP", simbolo: "$", tasa: 4100 },
    { pais: "Venezuela", codigo: "VES", simbolo: "Bs", tasa: 60 },
    { pais: "Ecuador", codigo: "USD", simbolo: "US$", tasa: 1 },
    { pais: "Perú", codigo: "PEN", simbolo: "S/", tasa: 3.75 },
    { pais: "Bolivia", codigo: "BOB", simbolo: "Bs", tasa: 6.9 },
    { pais: "Chile", codigo: "CLP", simbolo: "$", tasa: 950 },
    { pais: "Paraguay", codigo: "PYG", simbolo: "₲", tasa: 7500 },
    { pais: "Uruguay", codigo: "UYU", simbolo: "$U", tasa: 42 },
    { pais: "Argentina", codigo: "ARS", simbolo: "$", tasa: 1000 },
    { pais: "Brasil", codigo: "BRL", simbolo: "R$", tasa: 5.4 },
    { pais: "España", codigo: "EUR", simbolo: "€", tasa: 0.92 }
  ];
  var moneda = MONEDAS[0];
  function esMonetaria(u) { return u.indexOf("USD") === 0; }
  function unidadVisible(u) { return esMonetaria(u) ? u.replace("USD", moneda.codigo) : u; }

  /* Contexto de formato que reciben fórmulas y gráficas (entradas en USD). */
  var ctx = {
    n: M.es,
    m: function (usd, dec) {
      var v = usd * moneda.tasa;
      var d = dec === undefined ? 0 : dec;
      if (moneda.tasa >= 100) { d = Math.max(0, d - 2); }
      return moneda.simbolo + " " + M.es(v, d);
    }
  };
  window.formatearMonedaDetalle = function (usd) { return ctx.m(usd, 2); };
  window.ctxAdvance = ctx;

  /* ------------------------------------------------------------- utilidades */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/ (%|USD\b|kWh\b|Wp\b)/g, "\u00A0$1"); }
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }

  function toast(mensaje) {
    var t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = mensaje;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add("visible"); });
    setTimeout(function () { t.classList.remove("visible"); setTimeout(function () { t.remove(); }, 300); }, 2400);
  }
  window.toastAdvance = toast;

  function copiar(texto, aviso) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(function () { toast(aviso || "Copiado."); }, function () { toast("No se pudo copiar."); });
    } else { toast("Este navegador no permite copiar."); }
  }

  function compartir(titulo, texto) {
    if (navigator.share) { navigator.share({ title: titulo, text: texto }).catch(function () {}); }
    else { copiar(texto, "Resultado copiado: péguelo donde quiera compartirlo."); }
  }

  /* ------------------------------------------------------------- campos */
  function decimalesDe(paso) { var s = String(paso); return s.indexOf(".") < 0 ? 0 : s.split(".")[1].length; }

  function campoHTML(c, valorUSD) {
    var mon = esMonetaria(c.unidad), k = mon ? moneda.tasa : 1;
    var v = (valorUSD !== undefined ? valorUSD : c.defecto) * k;
    var paso = c.paso * (mon && k >= 100 ? Math.pow(10, Math.round(Math.log10(k))) : k);
    var dec = mon ? (k >= 100 ? 0 : Math.max(decimalesDe(c.paso), 2)) : decimalesDe(c.paso);
    var id = "c" + Math.random().toString(36).slice(2, 8);
    return '<div class="campo"><label class="campo__etiqueta" for="' + id + '">' + esc(c.etiqueta) +
      (c.orientativo ? ' <span class="campo__marca" title="Orientativo: verifique en PVGIS">orientativo</span>' : "") + "</label>" +
      '<div class="campo__fila"><input class="campo__rango" type="range" tabindex="-1" aria-hidden="true" min="' + c.min * k + '" max="' + c.max * k + '" step="any" value="' + v + '">' +
      '<span class="campo__caja"><input id="' + id + '" class="campo__entrada" type="number" inputmode="decimal" step="any" data-campo="' + c.clave + '"' +
      (mon ? ' data-monetario="1"' : "") + ' data-dec="' + dec + '" value="' + Number(v.toFixed(Math.min(4, dec + 2))) + '">' +
      '<span class="campo__unidad" data-unidad-base="' + esc(c.unidad) + '">' + esc(unidadVisible(c.unidad)) + "</span></span></div></div>";
  }

  function leerValores(tarjeta) {
    var v = {};
    $$("input[data-campo]", tarjeta).forEach(function (e) {
      var x = parseFloat(String(e.value).replace(",", "."));
      if (isNaN(x)) { x = 0; }
      if (e.hasAttribute("data-monetario")) { x = x / moneda.tasa; }
      v[e.dataset.campo] = x;
    });
    return v;
  }

  function cablearCampos(tarjeta, alCambiar) {
    $$(".campo", tarjeta).forEach(function (campo) {
      var rango = $(".campo__rango", campo), num = $(".campo__entrada", campo);
      rango.addEventListener("input", function () {
        var d = +num.dataset.dec, paso = Math.pow(10, -d);
        num.value = (Math.round(rango.value / paso) * paso).toFixed(d);
        alCambiar();
      });
      num.addEventListener("input", function () {
        var x = parseFloat(num.value);
        if (!isNaN(x)) { rango.value = x; }
        alCambiar();
      });
    });
  }

  function fijarValores(tarjeta, valoresUSD) {
    $$("input[data-campo]", tarjeta).forEach(function (e) {
      if (valoresUSD[e.dataset.campo] === undefined) { return; }
      var v = valoresUSD[e.dataset.campo] * (e.hasAttribute("data-monetario") ? moneda.tasa : 1);
      e.value = Number(v.toFixed(Math.min(4, +e.dataset.dec + 2)));
      var r = $(".campo__rango", e.closest(".campo"));
      if (r) { r.value = v; }
    });
  }

  /* ------------------------------------------------------------- tarjeta de fórmula */
  /* Fórmulas con muchos supuestos: los cuatro principales a la vista, el resto
     plegado (sigue entrando en la cuenta y en la gráfica). */
  function entradasHTML(inputs) {
    if (inputs.length <= 6) { return inputs.map(function (c) { return campoHTML(c); }).join(""); }
    var resto = inputs.slice(4);
    return inputs.slice(0, 4).map(function (c) { return campoHTML(c); }).join("") +
      '<details class="supuestos"><summary>Más supuestos <span>' + resto.map(function (c) { return c.etiqueta.split(" (")[0].toLowerCase(); }).join(", ") + "</span></summary>" +
      '<div class="supuestos__campos">' + resto.map(function (c) { return campoHTML(c); }).join("") + "</div></details>";
  }

  function porClave(clave) { return FORMULAS.filter(function (f) { return f.clave === clave; })[0]; }

  function tarjetaHTML(f, orden) {
    return '<article class="formula" id="f-' + f.clave + '" data-formula="' + f.clave + '">' +
      '<header class="formula__cabecera"><span class="formula__orden" aria-hidden="true">' + orden + "</span>" +
      '<div class="formula__titulos"><h3 class="formula__nombre">' + esc(f.nombre) + "</h3>" +
      '<p class="formula__pregunta">' + esc(f.pregunta) + "</p></div>" +
      '<span class="formula__capitulo">' + esc(f.capitulo) + "</span></header>" +
      '<p class="formula__expresion">' + esc(f.expresion) + "</p>" +
      '<div class="formula__cuerpo"><div class="formula__entradas">' + entradasHTML(f.inputs) +
      '<button class="enlace formula__restablecer" type="button">' + icono("reiniciar") + "Valores del libro</button></div>" +
      '<div class="formula__salidas"><div class="resultado"><span class="resultado__valor" data-resultado>—</span>' +
      '<span class="resultado__unidad" data-unidad>' + esc(unidadVisible(f.unidad)) + "</span></div>" +
      '<p class="operacion" data-operacion aria-live="polite"></p>' +
      '<dl class="extras" data-extras></dl>' +
      '<div class="grafico" data-grafico></div></div></div>' +
      (f.nota ? '<p class="formula__nota">' + esc(f.nota) + "</p>" : "") +
      '<footer class="formula__pie"><button class="boton-icono" data-accion="copiar" aria-label="Copiar la operación" title="Copiar la operación">' + icono("copiar") + "</button>" +
      '<button class="boton-icono" data-accion="voz" aria-label="Leer en voz alta" title="Leer en voz alta">' + icono("voz") + "</button>" +
      '<button class="boton-icono" data-accion="compartir" aria-label="Compartir el resultado" title="Compartir el resultado">' + icono("compartir") + "</button></footer>" +
      "</article>";
  }

  function formatoPrincipal(f, r) {
    if (!isFinite(r)) { return "—"; }
    if (esMonetaria(f.unidad)) { return ctx.m(r, f.decimales).replace(moneda.simbolo + " ", ""); }
    return M.es(r, f.decimales);
  }

  function recalcular(tarjeta) {
    var f = porClave(tarjeta.dataset.formula);
    var v = leerValores(tarjeta), r = f.calculo(v);
    $("[data-resultado]", tarjeta).textContent = formatoPrincipal(f, r);
    $("[data-unidad]", tarjeta).textContent = esMonetaria(f.unidad) ? unidadVisible(f.unidad) : f.unidad;
    $("[data-operacion]", tarjeta).textContent = isFinite(r) ? f.operacion(v, r, ctx) : "Revise los datos: la operación no tiene solución con estos valores.";
    var ex = f.extras && isFinite(r) ? f.extras(v, r, ctx) : [];
    $("[data-extras]", tarjeta).innerHTML = ex.map(function (x) {
      return "<div><dt>" + esc(x.etiqueta) + "</dt><dd>" + esc(x.valor) + (x.unidad ? " " + esc(x.unidad) : "") + (x.nota ? '<span class="extras__nota">' + esc(x.nota) + "</span>" : "") + "</dd></div>";
    }).join("");
    var g = $("[data-grafico]", tarjeta);
    var dib = function () { if (isFinite(r)) { window.Graficos.dibujar(g, f.grafico(v, r, ctx), ctx); } else { g.hidden = true; } };
    if (!g._vigilado) { window.Graficos.vigilar(g, function () { recalcular(tarjeta); }); g._vigilado = true; }
    if (tarjeta._raf) { cancelAnimationFrame(tarjeta._raf); }
    tarjeta._raf = requestAnimationFrame(dib);
    tarjeta._ultimo = { f: f, v: v, r: r };
  }

  function cablearTarjeta(tarjeta) {
    var f = porClave(tarjeta.dataset.formula);
    cablearCampos(tarjeta, function () { recalcular(tarjeta); });
    $(".formula__restablecer", tarjeta).addEventListener("click", function () {
      var base = {}; f.inputs.forEach(function (c) { base[c.clave] = c.defecto; });
      fijarValores(tarjeta, base); recalcular(tarjeta);
    });
    $$("[data-accion]", tarjeta).forEach(function (b) {
      b.addEventListener("click", function () {
        var u = tarjeta._ultimo, texto = f.nombre + ": " + $("[data-operacion]", tarjeta).textContent;
        if (b.dataset.accion === "copiar") { copiar(texto, "Operación copiada."); }
        else if (b.dataset.accion === "compartir") { compartir("Calculadora Solar Advance", texto + " — Calculadora Solar Advance"); }
        else if (b.dataset.accion === "voz") {
          if (!("speechSynthesis" in window)) { toast("Este dispositivo no tiene lectura en voz alta."); return; }
          window.speechSynthesis.cancel();
          var hablar = new SpeechSynthesisUtterance(f.nombre + ". " + $("[data-resultado]", tarjeta).textContent + " " + $("[data-unidad]", tarjeta).textContent + ". " + f.pregunta);
          hablar.lang = "es-ES"; window.speechSynthesis.speak(hablar);
        }
        return u;
      });
    });
    recalcular(tarjeta);
  }

  function recalcularTodo() { $$(".formula").forEach(recalcular); $$(".herramienta").forEach(recalcularPro); }

  /* ------------------------------------------------------------- vistas */
  var contenido, tabbar;

  function vistaModulo(m) {
    var lista = FORMULAS.filter(function (f) { return f.modulo === m.id; });
    return '<section class="vista" data-vista="' + m.id + '" aria-labelledby="t-' + m.id + '">' +
      '<header class="vista__cabecera"><h2 class="vista__titulo" id="t-' + m.id + '">' + esc(m.titulo) + "</h2>" +
      '<p class="vista__intro">' + esc(m.intro) + "</p></header>" +
      (m.id === 2 ? ubicacionHTML() : "") +
      lista.map(function (f, i) { return tarjetaHTML(f, i + 1); }).join("") + "</section>";
  }

  function ubicacionHTML() {
    if (!window.CIUDADES) { return ""; }
    return '<div class="ubicacion"><label class="campo__etiqueta" for="ubicacion">Tomar las HSP del peor mes de una ciudad de referencia</label>' +
      '<select id="ubicacion" class="selector"><option value="">Elegir ciudad</option>' + window.CIUDADES.map(function (c) {
        return '<option value="' + c.hsp + '">' + esc(c.ciudad + ", " + c.pais) + " · " + M.es(c.hsp, 1) + " HSP</option>";
      }).join("") + '</select><p class="ubicacion__nota">Valores orientativos. Confírmelos en PVGIS antes de firmar una propuesta.</p></div>';
  }

  function vistaVerificacion() {
    return '<section class="vista" data-vista="verificar" aria-labelledby="t-ver">' +
      '<header class="vista__cabecera"><h2 class="vista__titulo" id="t-ver">Verificar contra el libro</h2>' +
      '<p class="vista__intro">Elija un caso del libro: la calculadora rehace sus cuentas y las compara, cifra por cifra, con las fichas del Anexo G. La comparación se hace en dólares, la moneda del libro.</p></header>' +
      '<div class="casos" role="tablist">' + Object.keys(PRESETS).map(function (k) {
        var p = PRESETS[k];
        return '<button class="caso" role="tab" data-caso="' + k + '"><span class="caso__nombre">' + esc(p.nombre) + '</span><span class="caso__tipo">' + esc(p.tipo) + "</span></button>";
      }).join("") + "</div>" +
      '<div id="panel-verificacion" class="verificacion"></div></section>';
  }

  function verificar(clave) {
    var p = PRESETS[clave], ok = 0;
    var usd = { m: function (x, d) { return "US$ " + M.es(x, d || 0); }, n: M.es };
    var filas = p.esperados.map(function (e) {
      var r = window.evaluarEsperado(p, e, usd);
      if (r.ok) { ok++; }
      return '<tr class="' + (r.ok ? "coincide" : "difiere") + '"><th scope="row">' + esc(e.concepto) +
        '<a class="verificacion__ir" href="#/educativo/' + r.formula.modulo + "/" + r.formula.clave + '">Abrir «' + esc(r.formula.nombre) + "»</a></th>" +
        "<td>" + M.es(r.obtenido, e.decimales) + "</td><td>" + M.es(e.valor, e.decimales) + "</td>" +
        '<td class="verificacion__estado">' + (r.ok ? icono("verificar") + '<span class="sr">coincide</span>' : '<span class="difiere__marca">revisar</span>') + "</td></tr>";
    }).join("");
    $("#panel-verificacion").innerHTML =
      '<div class="verificacion__resumen"><p class="verificacion__marcador"><span>' + ok + "</span> de " + p.esperados.length + " cifras coinciden con el libro</p>" +
      '<p class="verificacion__caso">' + esc(p.resumen) + " · ficha única en el " + esc(p.ficha) + "</p></div>" +
      '<div class="tabla-envoltura"><table class="tabla-verificacion"><thead><tr><th scope="col">Cifra</th><th scope="col">Calculadora</th><th scope="col">Libro</th><th scope="col"><span class="sr">Estado</span></th></tr></thead><tbody>' + filas + "</tbody></table></div>" +
      (p.aviso ? '<p class="formula__nota">' + esc(p.aviso) + "</p>" : "") +
      '<button class="boton" id="cargar-caso">Cargar el caso en todas las fórmulas</button>';
    $$(".caso").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.caso === clave ? "true" : "false"); });
    $("#cargar-caso").addEventListener("click", function () {
      Object.keys(p.valores).forEach(function (k) {
        var t = $('.formula[data-formula="' + k + '"]');
        if (t) { fijarValores(t, p.valores[k]); recalcular(t); }
      });
      toast(p.nombre + " cargado en " + Object.keys(p.valores).length + " fórmulas.");
    });
  }

  function mostrarVista(id, foco) {
    $$(".vista").forEach(function (v) { v.classList.toggle("activa", v.dataset.vista === String(id)); });
    $$(".tab").forEach(function (t) { t.setAttribute("aria-current", t.dataset.tab === String(id) ? "page" : "false"); });
    var activa = $('.vista[data-vista="' + id + '"]');
    if (activa) { $$(".formula", activa).forEach(recalcular); }
    if (foco) {
      var t = document.getElementById("f-" + foco);
      if (t) { setTimeout(function () { t.scrollIntoView({ behavior: "smooth", block: "start" }); t.classList.add("destello"); setTimeout(function () { t.classList.remove("destello"); }, 1600); }, 60); }
    } else { window.scrollTo(0, 0); }
  }

  function montarEducativo(ruta) {
    document.body.dataset.modo = "educativo";
    tabbar.hidden = false;
    contenido.innerHTML = proyectosHTML() + MODULOS.map(vistaModulo).join("") + vistaVerificacion();
    $$(".formula", contenido).forEach(cablearTarjeta);
    $$(".caso", contenido).forEach(function (b) { b.addEventListener("click", function () { verificar(b.dataset.caso); }); });
    verificar("torres");
    var u = $("#ubicacion");
    if (u) {
      u.addEventListener("change", function () {
        var hsp = parseFloat(u.value);
        if (isNaN(hsp)) { return; }
        ["potencia_pico", "produccion_util"].forEach(function (k) {
          var t = $('.formula[data-formula="' + k + '"]'); fijarValores(t, { hsp: hsp }); recalcular(t);
        });
        toast("HSP de " + u.options[u.selectedIndex].text.split(" · ")[0] + " aplicadas.");
      });
    }
    cablearProyectos();
    var partes = ruta.split("/");
    mostrarVista(partes[2] || 1, partes[3]);
  }

  function hubHTML() {
    var T = PRESETS.torres;
    return '<section class="inicio">' +
      '<div class="portada"><p class="portada__lema">Lo que no se puede documentar, no se promete.</p>' +
      '<p class="portada__texto">Las fórmulas del capítulo 31 de <cite>Energía Solar Advance</cite>, con la operación a la vista y una gráfica que responde a cada dato.</p>' +
      '<div class="servilleta" aria-label="Caso Torres en una servilleta"><p class="servilleta__titulo">La servilleta de los Torres</p>' +
      '<ol class="servilleta__pasos">' +
      "<li><span>220 kWh al mes ÷ 30 ÷ 0,8 ÷ 4,2 HSP</span><b>2.183 Wp</b></li>" +
      "<li><span>÷ 450 W, hacia arriba</span><b>5 paneles</b></li>" +
      "<li><span>2.700 USD ÷ (396 − 27)</span><b>7,3 años</b></li>" +
      "<li><span>cuota 33,4 + factura residual 7</span><b>40,4 USD frente a 40</b></li></ol>" +
      '<a class="servilleta__enlace" href="#/educativo/verificar">Ver las ' + T.esperados.length + " cifras del caso verificadas" + icono("flecha") + "</a></div></div>" +
      '<nav class="modos" aria-label="Modos de la calculadora">' +
      modoHTML("#/educativo/1", "educativo", "Fórmulas del libro", FORMULAS.length + " fórmulas en seis módulos, de la factura al generador, con los casos Torres, La Espiga y Los Alisos.") +
      modoHTML("#/pro", "pro", "Advance Pro", "Asesor de decisión, simulador antes y después, detective de facturas y herramientas de análisis.") +
      modoHTML("#/certificado", "certificado", "Certificación", "Examen de 20 preguntas y diploma de Analista de Sistemas Fotovoltaicos.") +
      "</nav>" +
      '<p class="inicio__pie">Versión ' + VERSION + " · verificada contra el manuscrito 1.1.0 · funciona sin conexión</p></section>";
  }
  function modoHTML(href, ic, titulo, texto) {
    return '<a class="modo" href="' + href + '"><span class="modo__icono">' + icono(ic) + '</span><span class="modo__texto"><span class="modo__titulo">' + titulo + '</span><span class="modo__descripcion">' + texto + "</span></span>" + icono("flecha") + "</a>";
  }

  function montarHub() {
    document.body.dataset.modo = "inicio";
    tabbar.hidden = true;
    contenido.innerHTML = hubHTML();
    window.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------- Pro */
  function recalcularPro(t) {
    var h = HERRAMIENTAS.filter(function (x) { return x.id === t.dataset.pid; })[0];
    var v = leerValores(t), r = h.calculo(v);
    var val = $("[data-resultado]", t), uni = $("[data-unidad]", t);
    if (h.esRango) {
      val.textContent = r.nmin <= r.nmax ? r.nmin + " a " + r.nmax : "sin ventana";
      uni.textContent = "módulos en serie";
      $("[data-operacion]", t).textContent = "Voc frío " + M.es(r.vocFrio, 1) + " V · Vmp caliente " + M.es(r.vmpCalor, 1) + " V";
    } else {
      val.textContent = isFinite(r) ? (esMonetaria(h.unidad) ? ctx.m(r, h.decimales || 0).replace(moneda.simbolo + " ", "") : M.es(r, h.decimales || 0)) : "—";
      uni.textContent = unidadVisible(h.unidad);
      $("[data-operacion]", t).textContent = h.operacion ? h.operacion(v, r, ctx) : "";
    }
    var g = $("[data-grafico]", t);
    if (h.grafico) {
      if (!g._vigilado) { window.Graficos.vigilar(g, function () { recalcularPro(t); }); g._vigilado = true; }
      requestAnimationFrame(function () { window.Graficos.dibujar(g, h.grafico(v, r, ctx), ctx); });
    } else { g.hidden = true; }
  }

  function herramientaHTML(h) {
    return '<article class="formula herramienta" data-pid="' + h.id + '">' +
      '<header class="formula__cabecera"><div class="formula__titulos"><h3 class="formula__nombre">' + esc(h.nombre) + "</h3>" +
      '<p class="formula__pregunta">' + esc(h.explicacion) + "</p></div></header>" +
      '<p class="formula__expresion">' + esc(h.expresion) + "</p>" +
      '<div class="formula__cuerpo"><div class="formula__entradas">' + h.inputs.map(function (c) { return campoHTML(c); }).join("") + "</div>" +
      '<div class="formula__salidas"><div class="resultado"><span class="resultado__valor" data-resultado>—</span><span class="resultado__unidad" data-unidad></span></div>' +
      '<p class="operacion" data-operacion></p><div class="grafico" data-grafico></div></div></div>' +
      (h.nota ? '<p class="formula__nota">' + esc(h.nota) + "</p>" : "") + "</article>";
  }

  function montarPro() {
    document.body.dataset.modo = "pro";
    tabbar.hidden = true;
    contenido.innerHTML = volverHTML("#/", "Inicio") +
      '<header class="vista__cabecera"><h2 class="vista__titulo">Advance Pro</h2><p class="vista__intro">Herramientas para la mesa del cliente y para el análisis técnico.</p></header>' +
      '<nav class="modos modos--compactos">' +
      modoHTML("#/asesor", "asesor", "Asesor de decisión", "Tres preguntas y la recomendación del libro: on-grid, híbrido o isla.") +
      modoHTML("#/simulador", "simulador", "Simulador antes y después", "Facturas acumuladas contra inversión, año a año, con el payback marcado.") +
      modoHTML("#/detective", "lupa", "Detective de facturas", "Las cinco zonas de la factura y el costo efectivo del kWh.") +
      "</nav><h3 class=\"seccion\">Herramientas de análisis</h3>" + HERRAMIENTAS.map(herramientaHTML).join("");
    $$(".herramienta", contenido).forEach(function (t) {
      cablearCampos(t, function () { recalcularPro(t); });
      recalcularPro(t);
    });
    window.scrollTo(0, 0);
  }

  function volverHTML(href, texto) { return '<a class="volver" href="' + href + '">' + icono("volver") + texto + "</a>"; }

  function montarVenta(cual) {
    document.body.dataset.modo = "pro";
    tabbar.hidden = true;
    contenido.innerHTML = "";
    window.Venta[cual](contenido, volverHTML("#/pro", "Advance Pro"), { campoHTML: campoHTML, cablearCampos: cablearCampos, leerValores: leerValores, ctx: ctx, icono: icono });
    window.scrollTo(0, 0);
  }

  function montarCertificado() {
    document.body.dataset.modo = "certificado";
    tabbar.hidden = true;
    contenido.innerHTML = "";
    window.montarCertificado(contenido, volverHTML("#/", "Inicio"));
    window.scrollTo(0, 0);
  }

  function montarVerificacionDiploma() {
    document.body.dataset.modo = "certificado";
    tabbar.hidden = true;
    contenido.innerHTML = volverHTML("#/", "Inicio");
    window.mostrarVerificacion(contenido);
  }

  /* ------------------------------------------------------------- proyectos */
  function proyectosHTML() {
    return '<div class="proyectos"><button class="enlace" id="proy-guardar">' + icono("carpeta") + "Guardar proyecto</button>" +
      '<button class="enlace" id="proy-abrir" aria-expanded="false">Abrir guardados</button><div id="proy-lista" class="proyectos__lista" hidden></div></div>';
  }

  function instantanea() {
    var datos = { version: 2 };
    $$(".formula[data-formula]").forEach(function (t) { datos[t.dataset.formula] = leerValores(t); });
    return datos;
  }

  function restaurar(datos) {
    Object.keys(datos).forEach(function (id) {
      var clave = datos.version === 2 ? id : window.MIGRACION_IDS[id];
      if (!clave) { return; }
      var t = $('.formula[data-formula="' + clave + '"]');
      if (!t) { return; }
      var vals = {};
      Object.keys(datos[id]).forEach(function (k) {
        var x = parseFloat(datos[id][k]);
        if (!isNaN(x)) { vals[k] = datos.version === 2 ? x : x; }
      });
      fijarValores(t, vals); recalcular(t);
    });
  }

  function cablearProyectos() {
    if (!window.Almacen) { $(".proyectos").hidden = true; return; }
    $("#proy-guardar").addEventListener("click", abrirModalProyecto);
    $("#proy-abrir").addEventListener("click", function () {
      var lista = $("#proy-lista"), b = $("#proy-abrir");
      if (!lista.hidden) { lista.hidden = true; b.setAttribute("aria-expanded", "false"); return; }
      window.Almacen.listar().then(function (proyectos) {
        lista.hidden = false; b.setAttribute("aria-expanded", "true");
        if (!proyectos.length) { lista.innerHTML = '<p class="vacio">Aún no hay proyectos. Ajuste las fórmulas y pulse «Guardar proyecto».</p>'; return; }
        lista.innerHTML = proyectos.slice().reverse().map(function (p) {
          return '<div class="proyecto"><span class="proyecto__nombre">' + esc(p.nombre) + '<small>' + new Date(p.fecha).toLocaleDateString("es") + "</small></span>" +
            '<button class="enlace" data-cargar="' + p.id + '">Abrir</button><button class="enlace enlace--peligro" data-borrar="' + p.id + '">Borrar</button></div>';
        }).join("");
        $$("[data-cargar]", lista).forEach(function (x) {
          x.addEventListener("click", function () {
            var p = proyectos.filter(function (q) { return String(q.id) === x.dataset.cargar; })[0];
            if (p) { restaurar(p.datos); lista.hidden = true; toast("Proyecto «" + p.nombre + "» abierto."); }
          });
        });
        $$("[data-borrar]", lista).forEach(function (x) {
          x.addEventListener("click", function () {
            window.Almacen.borrar(parseInt(x.dataset.borrar, 10)).then(function () { x.closest(".proyecto").remove(); toast("Proyecto borrado."); });
          });
        });
      }).catch(function () { toast("Este navegador no permite guardar proyectos."); });
    });
  }

  function abrirModalProyecto() {
    var modal = $("#modal-proyecto"), entrada = $("#proyecto-nombre");
    if (!modal._listo) {
      $("#proyecto-cancelar").addEventListener("click", function () { modal.classList.remove("visible"); });
      entrada.addEventListener("keydown", function (e) { if (e.key === "Enter") { $("#proyecto-confirmar").click(); } if (e.key === "Escape") { modal.classList.remove("visible"); } });
      $("#proyecto-confirmar").addEventListener("click", function () {
        var nombre = entrada.value.trim();
        if (!nombre) { entrada.focus(); return; }
        window.Almacen.guardar(nombre, instantanea()).then(function () { modal.classList.remove("visible"); toast("Proyecto «" + nombre + "» guardado."); })
          .catch(function () { toast("No se pudo guardar: el navegador bloquea el almacenamiento."); });
      });
      modal._listo = true;
    }
    entrada.value = "";
    modal.classList.add("visible");
    setTimeout(function () { entrada.focus(); }, 60);
  }

  /* ------------------------------------------------------------- rutas */
  function enrutar() {
    var h = location.hash || "#/";
    if (h.indexOf("#/verificar") === 0) { montarVerificacionDiploma(); }
    else if (h.indexOf("#/educativo") === 0) {
      var partes = h.replace("#", "").split("/");
      if (document.body.dataset.modo === "educativo" && $(".vista")) { mostrarVista(partes[2] || 1, partes[3]); }
      else { montarEducativo(h.replace("#", "")); }
    }
    else if (h.indexOf("#/pro") === 0) { montarPro(); }
    else if (h.indexOf("#/certificado") === 0) { montarCertificado(); }
    else if (h.indexOf("#/asesor") === 0) { montarVenta("asesor"); }
    else if (h.indexOf("#/simulador") === 0) { montarVenta("simulador"); }
    else if (h.indexOf("#/detective") === 0) { montarVenta("detective"); }
    else { montarHub(); }
  }
  window.addEventListener("hashchange", enrutar);
  window.mostrarHub = function () { location.hash = "#/"; };

  function montarTabbar() {
    tabbar.innerHTML = MODULOS.map(function (m) {
      return '<a class="tab" href="#/educativo/' + m.id + '" data-tab="' + m.id + '">' + icono(m.icono) + "<span>" + m.nombre + "</span></a>";
    }).join("") + '<a class="tab" href="#/educativo/verificar" data-tab="verificar">' + icono("verificar") + "<span>Verificar</span></a>";
  }

  /* ------------------------------------------------------------- selector de moneda */
  function montarMoneda() {
    var boton = $("#moneda-select"), lista = $("#moneda-lista"), tasa = $("#moneda-tasa");
    var indice = 0;
    try { var g = parseInt(localStorage.getItem("advance:moneda"), 10); if (!isNaN(g) && MONEDAS[g]) { indice = g; } } catch (e) {}
    try { var tg = JSON.parse(localStorage.getItem("advance:tasas") || "{}"); MONEDAS.forEach(function (m) { if (tg[m.codigo]) { m.tasa = tg[m.codigo]; } }); } catch (e) {}
    function etiqueta(m) { return (m.pais === "Estados Unidos (referencia)" ? "Dólar de referencia" : m.pais) + " · " + m.codigo; }
    lista.innerHTML = MONEDAS.map(function (m, i) {
      return '<button class="moneda__opcion" role="option" data-indice="' + i + '"><span class="moneda__bandera">' + (window.banderaSVG ? window.banderaSVG(m.pais) : "") + "</span>" + esc(etiqueta(m)) + "</button>";
    }).join("");
    function pintar() {
      var m = MONEDAS[indice];
      $("#moneda-bandera").innerHTML = window.banderaSVG ? window.banderaSVG(m.pais) : "";
      $("#moneda-texto").textContent = m.codigo;
      $$(".moneda__opcion", lista).forEach(function (o) { o.setAttribute("aria-selected", o.dataset.indice === String(indice) ? "true" : "false"); });
      tasa.hidden = m.codigo === "USD";
      tasa.value = m.tasa;
      $("#moneda-tasa-etiqueta").hidden = m.codigo === "USD";
    }
    function cerrar() { lista.classList.remove("visible"); boton.setAttribute("aria-expanded", "false"); }
    boton.addEventListener("click", function (e) { e.stopPropagation(); var abierta = lista.classList.toggle("visible"); boton.setAttribute("aria-expanded", abierta ? "true" : "false"); });
    document.addEventListener("click", function (e) { if (!$("#moneda-selector").contains(e.target)) { cerrar(); } });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { cerrar(); } });
    function convertirEntradas(anterior, nueva) {
      $$("input[data-monetario]").forEach(function (e) {
        var v = parseFloat(e.value);
        if (!isNaN(v)) { e.value = Number((v / anterior * nueva).toPrecision(8)); }
        var r = $(".campo__rango", e.closest(".campo"));
        if (r) { r.min = r.min / anterior * nueva; r.max = r.max / anterior * nueva; r.value = e.value; }
        e.dataset.dec = nueva >= 100 ? 0 : 2;
      });
      $$("[data-unidad-base]").forEach(function (s) { s.textContent = unidadVisible(s.dataset.unidadBase); });
    }
    $$(".moneda__opcion", lista).forEach(function (o) {
      o.addEventListener("click", function () {
        var anterior = moneda.tasa;
        indice = parseInt(o.dataset.indice, 10); moneda = MONEDAS[indice];
        convertirEntradas(anterior, moneda.tasa);
        try { localStorage.setItem("advance:moneda", String(indice)); } catch (e) {}
        pintar(); cerrar(); recalcularTodo();
        toast(moneda.codigo === "USD" ? "Valores en dólares." : "Valores en " + moneda.codigo + " a una tasa orientativa de " + M.es(moneda.tasa, 2) + " por dólar. Puede editarla.");
      });
    });
    tasa.addEventListener("change", function () {
      var v = parseFloat(tasa.value);
      if (isNaN(v) || v <= 0) { tasa.value = moneda.tasa; return; }
      var anterior = moneda.tasa; moneda.tasa = v;
      convertirEntradas(anterior, v);
      try { var tg = JSON.parse(localStorage.getItem("advance:tasas") || "{}"); tg[moneda.codigo] = v; localStorage.setItem("advance:tasas", JSON.stringify(tg)); } catch (e) {}
      recalcularTodo();
    });
    moneda = MONEDAS[indice];
    pintar();
  }

  /* ------------------------------------------------------------- tema */
  function montarTema() {
    var raiz = document.documentElement, boton = $("#boton-tema");
    function aplicar(t) {
      if (t) { raiz.dataset.theme = t; } else { delete raiz.dataset.theme; }
      var oscuro = t === "dark" || (!t && window.matchMedia("(prefers-color-scheme: dark)").matches);
      boton.setAttribute("aria-pressed", oscuro ? "true" : "false");
      $('meta[name="theme-color"]').setAttribute("content", oscuro ? "#0B1D30" : "#0F2B48");
    }
    var guardado = null;
    try { guardado = localStorage.getItem("advance:tema"); } catch (e) {}
    aplicar(guardado === "oscuro" ? "dark" : guardado === "claro" ? "light" : null);
    boton.addEventListener("click", function () {
      var oscuro = boton.getAttribute("aria-pressed") !== "true";
      aplicar(oscuro ? "dark" : "light");
      try { localStorage.setItem("advance:tema", oscuro ? "oscuro" : "claro"); } catch (e) {}
      recalcularTodo();
    });
  }

  /* ------------------------------------------------------------- instalación */
  var promptInstalacion = null;
  function enStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  function esIOS() { return /iPad|iPhone|iPod/.test(navigator.userAgent); }
  function ofrecerInstalacion() {
    if (enStandalone()) { return; }
    var ultima = 0;
    try { ultima = parseInt(localStorage.getItem("advance:instalar") || "0", 10); } catch (e) {}
    if (Date.now() - ultima < 7 * 864e5) { return; }
    var hoja = $("#hoja-instalar");
    $("#instalar-texto").innerHTML = esIOS()
      ? "En Safari, toque <strong>Compartir</strong> y luego <strong>Agregar a pantalla de inicio</strong>. La calculadora queda en su teléfono y funciona sin conexión."
      : "Quedará en su pantalla de inicio y funcionará sin conexión, también en la visita al cliente.";
    $("#boton-instalar").hidden = esIOS();
    hoja.classList.add("visible");
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); promptInstalacion = e; });

  /* ------------------------------------------------------------- arranque */
  function iniciar() {
    contenido = $("#contenido"); tabbar = $("#tabbar");
    montarTabbar(); montarTema(); montarMoneda();
    enrutar();
    $("#boton-instalar").addEventListener("click", function () {
      if (promptInstalacion) {
        promptInstalacion.prompt();
        promptInstalacion.userChoice.then(function () { $("#hoja-instalar").classList.remove("visible"); });
      } else { toast("Abra la calculadora en Chrome, Edge o Safari para instalarla."); }
    });
    $("#boton-ahora-no").addEventListener("click", function () {
      $("#hoja-instalar").classList.remove("visible");
      try { localStorage.setItem("advance:instalar", String(Date.now())); } catch (e) {}
    });
    setTimeout(ofrecerInstalacion, 2500);
  }

  document.addEventListener("DOMContentLoaded", iniciar);
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    var habiaControlador = !!navigator.serviceWorker.controller;   // primera visita: sin aviso
    navigator.serviceWorker.register("./service-worker.js").then(function (reg) {
      reg.addEventListener("updatefound", function () {
        var nuevo = reg.installing;
        if (!nuevo) { return; }
        nuevo.addEventListener("statechange", function () {
          if (nuevo.state === "activated" && habiaControlador) { toast("Calculadora actualizada a la última versión."); }
        });
      });
    }).catch(function () {});
  }
})();
