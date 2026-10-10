/* app.js — Calculadora Solar Advance · interfaz, pestañas, verificación e
   instalación. JavaScript puro, sin dependencias, sin emojis (solo SVG). */
(function () {
  "use strict";

  var FORMULAS = window.FORMULAS;
  var PRESETS = window.PRESETS;

  /* ------------------------------------------------------------- iconos SVG */
  function icono(nombre) {
    var d = {
      factura: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h3"/>',
      dimension: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.9 4.9l1.4 1.4"/><path d="M17.7 17.7l1.4 1.4"/><path d="M19.1 4.9l-1.4 1.4"/><path d="M6.3 17.7l-1.4 1.4"/>',
      economia: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15.5 9.5c0-1.2-1.6-2-3.5-2s-3.5.8-3.5 2 1.6 2 3.5 2 3.5.8 3.5 2-1.6 2-3.5 2-3.5-.8-3.5-2"/>',
      autonomo: '<rect x="3" y="7" width="15" height="10" rx="2"/><path d="M21 11v2"/><rect x="5" y="9" width="6" height="6" rx="1"/>',
      tecnico: '<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/>',
      verificar: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (d[nombre] || "") + '</svg>';
  }

  var MODULOS = [
    { id: 1, nombre: "Factura", icono: "factura", titulo: "Diagnóstico de factura", intro: "El gancho de entrada: cuánto consume, cuánto cuesta no hacer nada y qué se sigue pagando." },
    { id: 2, nombre: "Dimensión", icono: "dimension", titulo: "Dimensionador on-grid", intro: "Los 7 pasos del capítulo 14 para dimensionar el sistema conectado a red." },
    { id: 3, nombre: "Economía", icono: "economia", titulo: "Economía", intro: "Ahorro, payback y LCOE del capítulo 4." },
    { id: 4, nombre: "Autónomo", icono: "autonomo", titulo: "Sistema autónomo", intro: "El banco de baterías y el costo de la isla (Parte VIII)." },
    { id: 5, nombre: "Técnico", icono: "tecnico", titulo: "Kit técnico del vendedor", intro: "Voc en frío, protecciones, calibre de cable y generador (caps. 12 y 15)." }
  ];

  var TOLERANCIAS = { 6: 0, 4: 1, 8: 0.1, 9: 0.1, 10: 0.002, 12: 0.1, 14: 0.1, 13: 0.03 };

  /* ------------------------------------------------------------- utilidades */
  function leerEntrada(el) {
    var v = parseFloat(el.value);
    return isNaN(v) ? 0 : v;
  }

  function formulasDelModulo(id) {
    return FORMULAS.filter(function (f) { return f.modulo === id; });
  }

  function etiquetaOrientativo(campo) {
    return campo.orientativo ? '<span class="nota--orientativo">orientativo — verificar en PVGIS</span>' : "";
  }

  /* ------------------------------------------------------------- construcción de vistas */
  function construirTarjeta(f) {
    var campos = f.inputs.map(function (campo) {
      return '<div class="campo">' +
        '<label class="campo__etiqueta">' + campo.etiqueta + ' <span class="campo__unidad">' + campo.unidad + '</span></label>' +
        '<input class="campo__entrada" type="number" step="any" data-campo="' + campo.clave + '" value="' + campo.defecto + '">' +
        '</div>';
    }).join("");

    return '<article class="tarjeta" data-fid="' + f.id + '">' +
      '<div class="tarjeta__cabecera"><span class="tarjeta__indice">' + f.id + '</span>' +
      '<span class="tarjeta__nombre">' + f.nombre + '</span></div>' +
      '<div class="tarjeta__formula">' + f.expresion + '</div>' +
      campos +
      '<div class="resultado"><div><div class="resultado__etiqueta">Resultado</div>' +
      '<div class="resultado__valor" data-resultado>' + "—" + '</div></div>' +
      '<div class="resultado__unidad">' + f.unidad + '</div></div>' +
      (f.nota ? '<div class="nota">' + f.nota + '</div>' : "") +
      (f.orientativo ? '<span class="nota--orientativo">orientativo — verificar en PVGIS</span>' : "") +
      '</article>';
  }

  function construirVista(modulo) {
    return '<section class="vista" data-modulo="' + modulo.id + '">' +
      '<h2 class="vista__titulo">' + modulo.titulo + '</h2>' +
      '<p class="vista__intro">' + modulo.intro + '</p>' +
      formulasDelModulo(modulo.id).map(construirTarjeta).join("") +
      '</section>';
  }

  function construirVistaVerificacion() {
    return '<section class="vista" data-modulo="verificacion">' +
      '<h2 class="vista__titulo">Modo verificación</h2>' +
      '<p class="vista__intro">Carga el caso del libro y la app devuelve los mismos números: la calculadora como examen y como vendedor silencioso.</p>' +
      '<div class="presets">' +
      '<button class="preset" data-preset="torres">Caso Torres (on-grid)</button>' +
      '<button class="preset" data-preset="alisos">Caso Los Alisos (isla)</button>' +
      '</div>' +
      '<div id="panel-verificacion"></div>' +
      '</section>';
  }

  function montarInterfaz() {
    var contenido = document.getElementById("contenido");
    var tabbar = document.getElementById("tabbar");

    MODULOS.forEach(function (m) {
      contenido.insertAdjacentHTML("beforeend", construirVista(m));
      tabbar.insertAdjacentHTML("beforeend",
        '<button class="tab" data-tab="' + m.id + '">' + icono(m.icono) + '<span>' + m.nombre + '</span></button>');
    });
    contenido.insertAdjacentHTML("beforeend", construirVistaVerificacion());
    tabbar.insertAdjacentHTML("beforeend",
      '<button class="tab" data-tab="verificacion">' + icono("verificar") + '<span>Verificar</span></button>');
  }

  /* ------------------------------------------------------------- pestañas */
  function mostrarVista(id) {
    document.querySelectorAll(".vista").forEach(function (v) { v.classList.remove("activa"); });
    document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("activo"); });
    var vista = document.querySelector('.vista[data-modulo="' + id + '"]');
    if (vista) { vista.classList.add("activa"); }
    var tab = document.querySelector('.tab[data-tab="' + id + '"]');
    if (tab) { tab.classList.add("activo"); }
  }

  /* ------------------------------------------------------------- recálculo */
  function recalcular(tarjeta) {
    var f = FORMULAS.find(function (x) { return String(x.id) === tarjeta.dataset.fid; });
    if (!f) { return; }
    var valores = {};
    tarjeta.querySelectorAll("input[data-campo]").forEach(function (entrada) {
      valores[entrada.dataset.campo] = leerEntrada(entrada);
    });
    var resultado = f.calculo(valores);
    var el = tarjeta.querySelector("[data-resultado]");
    el.textContent = isFinite(resultado) ? f.formato(resultado) : "—";
  }

  /* ------------------------------------------------------------- verificación */
  function aplicarPreset(clave) {
    var p = PRESETS[clave];
    if (!p) { return; }
    // 1) rellena las entradas reales con los valores del caso
    Object.keys(p.valores).forEach(function (fid) {
      var valores = p.valores[fid];
      var tarjeta = document.querySelector('.tarjeta[data-fid="' + fid + '"]');
      if (!tarjeta) { return; }
      tarjeta.querySelectorAll("input[data-campo]").forEach(function (entrada) {
        if (valores[entrada.dataset.campo] !== undefined) {
          entrada.value = valores[entrada.dataset.campo];
        }
      });
      recalcular(tarjeta);
    });
    // 2) pinta el panel comparativo
    var f = FORMULAS;
    var filas = p.esperados.map(function (e) {
      var formula = f.find(function (x) { return x.id === e.id; });
      var calculado = formula.calculo(p.valores[e.id]);
      var esperado = parseFloat(e.valor);
      var tol = TOLERANCIAS[e.id] !== undefined ? TOLERANCIAS[e.id] : 0.05;
      var ok = Math.abs(calculado - esperado) <= tol;
      var valorCalculado = formula.formato(calculado);
      return '<div class="fila-verificacion">' +
        '<span class="fila-verificacion__concepto">' + e.concepto + '</span>' +
        '<span class="fila-verificacion__valores">' +
        '<span class="fila-verificacion__ok">' + valorCalculado + '</span> ' +
        '<span class="fila-verificacion__esperado">(libro: ' + e.valor + ')</span></span>' +
        '<span class="sello ' + (ok ? 'sello--ok' : 'sello--revisar') + '">' +
        (ok ? icono("verificar") + "coincide" : "revisar") + '</span>' +
        '</div>';
    }).join("");
    document.getElementById("panel-verificacion").innerHTML =
      '<div class="tarjeta"><div class="tarjeta__cabecera"><span class="tarjeta__indice">' + icono("verificar") + '</span>' +
      '<span class="tarjeta__nombre">Resultado del ' + p.nombre + '</span></div>' + filas + '</div>';
    // marca el preset activo
    document.querySelectorAll(".preset").forEach(function (b) { b.classList.remove("activo"); });
    document.querySelector('.preset[data-preset="' + clave + '"]').classList.add("activo");
  }

  /* ------------------------------------------------------------- instalación */
  var promptInstalacion = null;

  function esIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }
  function enStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  }

  function gestionarInstalacion() {
    if (enStandalone()) { return; }
    if (esIOS()) {
      document.getElementById("superposicion-ios").classList.add("visible");
      return;
    }
    // Android / escritorio: puerta de instalación
    document.getElementById("superposicion-instalar").classList.add("visible");
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    promptInstalacion = e;
  });

  /* ------------------------------------------------------------- arranque */
  function iniciar() {
    montarInterfaz();
    mostrarVista(1);

    document.querySelectorAll(".tab").forEach(function (t) {
      t.addEventListener("click", function () { mostrarVista(t.dataset.tab); });
    });
    document.querySelectorAll(".tarjeta").forEach(function (tarjeta) {
      tarjeta.querySelectorAll("input[data-campo]").forEach(function (entrada) {
        entrada.addEventListener("input", function () { recalcular(tarjeta); });
      });
      recalcular(tarjeta);
    });
    document.querySelectorAll(".preset").forEach(function (b) {
      b.addEventListener("click", function () { aplicarPreset(b.dataset.preset); });
    });

    document.getElementById("boton-instalar").addEventListener("click", function () {
      if (promptInstalacion) {
        promptInstalacion.prompt();
        promptInstalacion.userChoice.then(function () {
          document.getElementById("superposicion-instalar").classList.remove("visible");
        });
      } else {
        window.alert("Usa Chrome o Edge para instalar la app.");
      }
    });
    document.getElementById("boton-continuar-web").addEventListener("click", function () {
      document.getElementById("superposicion-instalar").classList.remove("visible");
    });
    document.getElementById("boton-cerrar-ios").addEventListener("click", function () {
      document.getElementById("superposicion-ios").classList.remove("visible");
    });

    gestionarInstalacion();
  }

  document.addEventListener("DOMContentLoaded", iniciar);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
})();
