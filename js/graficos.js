/* graficos.js — motor de gráficas en vivo de la Calculadora Solar Advance.
   SVG propio, sin librerías (funciona sin conexión). Cada fórmula entrega una
   especificación (formulas.js → grafico) y este módulo la dibuja al ancho real
   del contenedor, con texto a tamaño de lectura, colores por variables CSS
   (claro y oscuro), leyenda cuando hay dos series o más, etiquetas directas
   selectivas y una capa de consulta: al pasar el dedo o el cursor se ve el valor.
   Tipos: barras (vertical/horizontal, apiladas), linea, cascada, medidor, paneles. */
(function (raiz) {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var ALTO = 196;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* Etiqueta de categoría en una o dos líneas según el ancho disponible. */
  function etiquetaCat(texto, x, y, ancho) {
    if (texto.length * 6.2 <= ancho || texto.indexOf(" ") < 0) {
      return '<text class="g-cat" x="' + x + '" y="' + y + '" text-anchor="middle">' + esc(texto) + "</text>";
    }
    var palabras = texto.split(" "), mitad = texto.length / 2, l1 = "", i = 0;
    while (i < palabras.length - 1 && (l1 + palabras[i]).length <= mitad + 2) { l1 += (l1 ? " " : "") + palabras[i]; i++; }
    if (!l1) { l1 = palabras[0]; i = 1; }
    return '<text class="g-cat" x="' + x + '" y="' + (y - 7) + '" text-anchor="middle"><tspan x="' + x + '">' + esc(l1) + '</tspan><tspan x="' + x + '" dy="13">' + esc(palabras.slice(i).join(" ")) + "</tspan></text>";
  }

  function formateador(spec, ctx) {
    return function (x, d) {
      var dec = d === undefined ? (spec.decimales || 0) : d;
      if (spec.moneda) { return ctx.m(x, dec); }
      if (spec.sufijo) { return raiz.Motor.es(x, dec) + spec.sufijo; }
      return raiz.Motor.es(x, dec) + (spec.unidad ? " " + spec.unidad : "");
    };
  }

  /* Escala «bonita»: 3–5 marcas con pasos 1, 2, 2,5 o 5 × 10^k. */
  function marcas(min, max, cuantas) {
    if (min === max) { max = min + 1; }
    var bruto = (max - min) / (cuantas || 4);
    var pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    var paso = [1, 2, 2.5, 5, 10].map(function (m) { return m * pot; }).filter(function (p) { return p >= bruto; })[0];
    var ini = Math.floor(min / paso) * paso, fin = Math.ceil(max / paso) * paso, lista = [];
    for (var v = ini; v <= fin + paso / 2; v += paso) { lista.push(Math.round(v / paso) * paso); }
    return { lista: lista, min: ini, max: fin, paso: paso };
  }

  function decimalesDePaso(paso) { return paso >= 1 ? 0 : Math.min(3, Math.ceil(-Math.log10(paso))); }

  function corto(x, paso, f, spec) {
    var a = Math.abs(x);
    if (a >= 10000) { return raiz.Motor.es(x / 1000, a >= 100000 ? 0 : 1) + " mil"; }
    return raiz.Motor.es(x, decimalesDePaso(paso));
  }

  function tono(nombre) { return "g-tono-" + (nombre || "azul"); }

  function leyenda(series, spec) {
    if (spec.sinLeyenda || series.length < 2) { return ""; }
    return '<div class="g-leyenda">' + series.map(function (s) {
      return '<span class="g-leyenda__item"><span class="g-leyenda__marca ' + tono(s.tono) + '"></span>' + esc(s.nombre) + "</span>";
    }).join("") + "</div>";
  }

  /* ----------------------------------------------------------------- barras */
  function barras(spec, ancho, f) {
    var h = spec.orientacion === "h";
    var cats = spec.categorias, series = spec.series, n = cats.length;
    var totales = cats.map(function (_, i) {
      return spec.apilado ? series.reduce(function (a, s) { return a + Math.max(0, s.valores[i] || 0); }, 0)
                          : Math.max.apply(null, series.map(function (s) { return s.valores[i] || 0; }));
    });
    var maxV = Math.max.apply(null, totales.concat([spec.referencia ? spec.referencia.valor : 0]));
    var esc_ = marcas(0, maxV * (h ? 1.28 : 1.05) || 1, 4);   // en horizontal, sitio para la etiqueta del total
    var svg = "", tips = [];

    if (h) {
      var etiquetaAncho = Math.min(132, Math.max(72, ancho * 0.3));
      var izq = etiquetaAncho + 8, der = 16, arriba = 6;
      var fila = 34, alto = arriba + n * fila + 22;
      var X = function (v) { return izq + (ancho - izq - der) * (v / esc_.max); };
      esc_.lista.forEach(function (m) {
        svg += '<line class="g-rejilla" x1="' + X(m) + '" x2="' + X(m) + '" y1="' + arriba + '" y2="' + (alto - 20) + '"/>' +
          '<text class="g-eje" x="' + X(m) + '" y="' + (alto - 6) + '" text-anchor="middle">' + corto(m, esc_.paso) + "</text>";
      });
      cats.forEach(function (c, i) {
        var y = arriba + i * fila + 6, bh = fila - 14, acum = 0;
        svg += '<text class="g-cat" x="' + (izq - 8) + '" y="' + (y + bh / 2 + 4) + '" text-anchor="end">' + esc(c) + "</text>";
        series.forEach(function (s, k) {
          var v = s.valores[i] || 0;
          if (v <= 0) { return; }
          var x0 = spec.apilado ? acum : 0, w = X(x0 + v) - X(x0);
          var t = s.tonos ? s.tonos[i] : s.tono;
          var yy = spec.apilado ? y : y + k * (bh / series.length), hh = spec.apilado ? bh : bh / series.length - 2;
          var gap = spec.apilado && x0 > 0 ? 2 : 0;
          svg += '<rect class="g-marca ' + tono(t) + '" data-tip="' + tips.length + '" x="' + (X(x0) + gap) + '" y="' + yy + '" width="' + Math.max(1, w - gap) + '" height="' + hh + '" rx="3"/>';
          tips.push((spec.etiquetasSegmento ? spec.etiquetasSegmento[k] : (series.length > 1 ? s.nombre : c)) + ": " + f(v));
          if (spec.apilado) { acum += v; }
        });
        var total = totales[i];
        var etiqueta = f(total);
        var xt = X(total) + 6, ancla = "start";
        if (xt + etiqueta.length * 6.4 > ancho) { xt = X(total) - 6; ancla = "end"; }
        svg += '<text class="g-valor' + (ancla === "end" ? " g-valor--dentro" : "") + '" x="' + xt + '" y="' + (y + bh / 2 + 4) + '" text-anchor="' + ancla + '">' + esc(etiqueta) + "</text>";
      });
      return { svg: svg, alto: alto, tips: tips };
    }

    var izqV = 40, derV = 8, arribaV = 18, abajoV = 34, altoV = ALTO + 8;
    var Y = function (v) { return arribaV + (altoV - arribaV - abajoV) * (1 - v / esc_.max); };
    esc_.lista.forEach(function (m) {
      svg += '<line class="g-rejilla" x1="' + izqV + '" x2="' + (ancho - derV) + '" y1="' + Y(m) + '" y2="' + Y(m) + '"/>' +
        '<text class="g-eje" x="' + (izqV - 6) + '" y="' + (Y(m) + 4) + '" text-anchor="end">' + corto(m, esc_.paso) + "</text>";
    });
    var banda = (ancho - izqV - derV) / n, bw = Math.min(64, banda * (n > 12 ? 0.7 : 0.56));
    var cada = spec.etiquetasCada || 1;
    cats.forEach(function (c, i) {
      var cx = izqV + banda * (i + 0.5), acum = 0;
      series.forEach(function (s, k) {
        var v = s.valores[i] || 0;
        if (v <= 0) { return; }
        var t = s.tonos ? s.tonos[i] : s.tono;
        var w = spec.apilado ? bw : bw / series.length;
        var x = spec.apilado ? cx - bw / 2 : cx - bw / 2 + k * w;
        var y0 = spec.apilado ? acum : 0;
        var gap = spec.apilado && y0 > 0 ? 2 : 0;
        var hh = Math.max(1, Y(y0) - Y(y0 + v) - gap);
        svg += '<rect class="g-marca ' + tono(t) + '" data-tip="' + tips.length + '" x="' + x + '" y="' + Y(y0 + v) + '" width="' + Math.max(1, w - (spec.apilado ? 0 : 2)) + '" height="' + hh + '" rx="' + Math.min(4, w / 4) + '"/>';
        tips.push(c + (series.length > 1 ? " · " + s.nombre : "") + ": " + f(v));
        if (spec.apilado) { acum += v; }
      });
      if (i % cada === 0 || i === n - 1) {
        svg += etiquetaCat(c, cx, altoV - 7 + (c.length * 6.2 > banda && c.indexOf(" ") > 0 ? 6 : 0), banda - 6);
      }
      if (n <= 6) {
        svg += '<text class="g-valor" x="' + cx + '" y="' + (Y(totales[i]) - 6) + '" text-anchor="middle">' + esc(f(totales[i])) + "</text>";
      }
    });
    if (spec.referencia) {
      var yr = Y(spec.referencia.valor);
      svg += '<line class="g-referencia" x1="' + izqV + '" x2="' + (ancho - derV) + '" y1="' + yr + '" y2="' + yr + '"/>' +
        '<text class="g-referencia__texto" x="' + (ancho - derV) + '" y="' + (yr - 5) + '" text-anchor="end">' + esc(spec.referencia.etiqueta) + "</text>";
    }
    return { svg: svg, alto: altoV, tips: tips };
  }

  /* ------------------------------------------------------------------ línea */
  function linea(spec, ancho, f) {
    var xs = spec.x, series = spec.series;
    var todos = [];
    series.forEach(function (s) { todos = todos.concat(s.valores); });
    if (spec.marcador) { todos.push(spec.marcador.y); }
    if (spec.limite) { todos.push(spec.limite.valor); }
    if (spec.cero) { todos.push(0); }
    var minV = Math.min.apply(null, todos), maxV = Math.max.apply(null, todos);
    var rango = maxV - minV || 1;
    var e = marcas(spec.cero || minV >= 0 && minV < rango * 0.6 ? Math.min(0, minV) : minV - rango * 0.08, maxV + rango * 0.06, 4);
    var izq = 46, der = 12, arriba = 16, abajo = 34, alto = ALTO + 10;
    var xmin = xs[0], xmax = xs[xs.length - 1];
    var X = function (x) { return izq + (ancho - izq - der) * ((x - xmin) / (xmax - xmin || 1)); };
    var Y = function (v) { return arriba + (alto - arriba - abajo) * (1 - (v - e.min) / (e.max - e.min)); };
    var svg = "";
    e.lista.forEach(function (m) {
      svg += '<line class="g-rejilla' + (m === 0 && spec.cero ? " g-rejilla--cero" : "") + '" x1="' + izq + '" x2="' + (ancho - der) + '" y1="' + Y(m) + '" y2="' + Y(m) + '"/>' +
        '<text class="g-eje" x="' + (izq - 6) + '" y="' + (Y(m) + 4) + '" text-anchor="end">' + corto(m, e.paso) + "</text>";
    });
    var mx = marcas(xmin, xmax, Math.max(3, Math.min(6, Math.floor((ancho - izq) / 64))));
    mx.lista.forEach(function (x) {
      if (x < xmin - 1e-9 || x > xmax + 1e-9) { return; }
      svg += '<text class="g-eje" x="' + X(x) + '" y="' + (alto - abajo + 16) + '" text-anchor="middle">' + raiz.Motor.es(x, decimalesDePaso(mx.paso)) + "</text>";
    });
    if (spec.etiquetaX) { svg += '<text class="g-eje g-eje--titulo" x="' + (ancho - der) + '" y="' + (alto - 3) + '" text-anchor="end">' + esc(spec.etiquetaX) + "</text>"; }
    if (spec.limite) {
      var yl = Y(spec.limite.valor);
      svg += '<line class="g-limite" x1="' + izq + '" x2="' + (ancho - der) + '" y1="' + yl + '" y2="' + yl + '"/>' +
        '<text class="g-limite__texto" x="' + (izq + 6) + '" y="' + (yl - 5) + '">' + esc(spec.limite.etiqueta + " · " + f(spec.limite.valor)) + "</text>";
    }
    series.forEach(function (s) {
      var pts = s.valores.map(function (v, i) { return X(xs[i]).toFixed(1) + "," + Y(v).toFixed(1); });
      if (s.area) {
        var base = Y(Math.max(e.min, Math.min(0, e.max)));
        svg += '<polygon class="g-area ' + tono(s.tono) + '" points="' + X(xs[0]) + "," + base + " " + pts.join(" ") + " " + X(xs[xs.length - 1]) + "," + base + '"/>';
      }
      svg += '<polyline class="g-linea ' + tono(s.tono) + '" points="' + pts.join(" ") + '"/>';
    });
    if (spec.marcador && isFinite(spec.marcador.x) && spec.marcador.x >= xmin && spec.marcador.x <= xmax) {
      var mx = X(spec.marcador.x), my = Y(spec.marcador.y);
      var texto = spec.marcador.etiqueta, ancla = mx > ancho * 0.7 ? "end" : "start";
      svg += '<line class="g-guia" x1="' + mx + '" x2="' + mx + '" y1="' + my + '" y2="' + (alto - abajo) + '"/>' +
        '<circle class="g-punto" cx="' + mx + '" cy="' + my + '" r="5"/>' +
        '<text class="g-valor g-valor--marcador" x="' + (mx + (ancla === "end" ? -10 : 10)) + '" y="' + (my - 9) + '" text-anchor="' + ancla + '">' + esc(texto) + "</text>";
    }
    svg += '<rect class="g-captura" x="' + izq + '" y="' + arriba + '" width="' + (ancho - izq - der) + '" height="' + (alto - arriba - abajo) + '"/>' +
      '<line class="g-cruz" x1="0" x2="0" y1="' + arriba + '" y2="' + (alto - abajo) + '"/>';
    return { svg: svg, alto: alto, tips: [], cruz: { X: X, xs: xs, series: series, izq: izq, der: der, f: f, etiquetaX: spec.etiquetaX || "", decX: spec.decimalesX || 0 } };
  }

  /* ---------------------------------------------------------------- cascada */
  function cascada(spec, ancho, f) {
    var maxV = Math.max.apply(null, spec.pasos.map(function (p) { return Math.abs(p.valor); }));
    var e = marcas(0, maxV * 1.08, 4);
    var izq = 40, der = 8, arriba = 18, abajo = 34, alto = ALTO + 8;
    var Y = function (v) { return arriba + (alto - arriba - abajo) * (1 - v / e.max); };
    var n = spec.pasos.length, banda = (ancho - izq - der) / n, bw = Math.min(70, banda * 0.56);
    var svg = "", tips = [], nivel = 0;
    e.lista.forEach(function (m) {
      svg += '<line class="g-rejilla" x1="' + izq + '" x2="' + (ancho - der) + '" y1="' + Y(m) + '" y2="' + Y(m) + '"/>' +
        '<text class="g-eje" x="' + (izq - 6) + '" y="' + (Y(m) + 4) + '" text-anchor="end">' + corto(m, e.paso) + "</text>";
    });
    spec.pasos.forEach(function (p, i) {
      var cx = izq + banda * (i + 0.5), y1, y2, clase;
      if (p.tipo === "total") { y1 = 0; y2 = p.valor; nivel = p.valor; clase = p.destacado ? "azul" : "gris"; }
      else { y1 = nivel + p.valor; y2 = nivel; nivel = y1; clase = "rojo"; }
      svg += '<rect class="g-marca ' + tono(clase) + '" data-tip="' + tips.length + '" x="' + (cx - bw / 2) + '" y="' + Y(y2) + '" width="' + bw + '" height="' + Math.max(1, Y(y1) - Y(y2)) + '" rx="3"/>' +
        etiquetaCat(p.etiqueta, cx, alto - 7 + (p.etiqueta.length * 6.2 > banda - 6 && p.etiqueta.indexOf(" ") > 0 ? 6 : 0), banda - 6) +
        '<text class="g-valor" x="' + cx + '" y="' + (Y(Math.max(y1, y2)) - 6) + '" text-anchor="middle">' + esc((p.valor < 0 ? "−" : "") + f(Math.abs(p.valor))) + "</text>";
      tips.push(p.etiqueta + ": " + f(Math.abs(p.valor)));
      if (i < n - 1 && p.tipo !== "total" || i === 0) {
        svg += '<line class="g-guia" x1="' + (cx + bw / 2) + '" x2="' + (cx + banda - bw / 2) + '" y1="' + Y(nivel) + '" y2="' + Y(nivel) + '"/>';
      }
    });
    return { svg: svg, alto: alto, tips: tips };
  }

  /* ---------------------------------------------------------------- medidor */
  function medidor(spec, ancho, f) {
    var izq = 12, der = 12, y = 40, h = 22, alto = 92;
    var W = ancho - izq - der, max = spec.max;
    var X = function (v) { return izq + W * Math.max(0, Math.min(1, v / max)); };
    var valor = spec.valor, svg = "";
    var estado = spec.peligro !== undefined
      ? (valor < spec.peligro ? "rojo" : valor < spec.umbral.valor ? "oro" : "verde")
      : "azul";
    svg += '<rect class="g-pista" x="' + izq + '" y="' + y + '" width="' + W + '" height="' + h + '" rx="' + h / 2 + '"/>' +
      '<rect class="g-marca ' + tono(estado) + '" data-tip="0" x="' + izq + '" y="' + y + '" width="' + Math.max(h, X(valor) - izq) + '" height="' + h + '" rx="' + h / 2 + '"/>';
    var xu = X(spec.umbral.valor);
    svg += '<line class="g-umbral" x1="' + xu + '" x2="' + xu + '" y1="' + (y - 8) + '" y2="' + (y + h + 8) + '"/>' +
      '<text class="g-eje" x="' + xu + '" y="' + (y + h + 22) + '" text-anchor="' + (xu > ancho * 0.75 ? "end" : "middle") + '">' + esc(spec.umbral.etiqueta) + "</text>";
    var xv = X(valor), ancla = xv > ancho * 0.8 ? "end" : xv < ancho * 0.2 ? "start" : "middle";
    svg += '<text class="g-valor g-valor--grande" x="' + xv + '" y="' + (y - 12) + '" text-anchor="' + ancla + '">' + esc(f(valor)) + "</text>";
    return { svg: svg, alto: alto, tips: [spec.titulo + ": " + f(valor)] };
  }

  /* ---------------------------------------------------------------- paneles */
  function paneles(spec, ancho) {
    var n = Math.max(1, Math.min(60, spec.n)), exacto = spec.exacto;
    var cols = Math.min(n, Math.max(5, Math.floor((ancho - 8) / 46)));
    var w = Math.min(38, (ancho - 8) / cols - 8), hp = w * 1.5, filas = Math.ceil(n / cols);
    var alto = filas * (hp + 10) + 34, svg = "";
    for (var i = 0; i < n; i++) {
      var x = 4 + (i % cols) * (w + 8), y = 4 + Math.floor(i / cols) * (hp + 10);
      var lleno = Math.max(0, Math.min(1, exacto - i));
      svg += '<g data-tip="' + i + '"><rect class="g-panel" x="' + x + '" y="' + y + '" width="' + w + '" height="' + hp + '" rx="3"/>' +
        '<rect class="g-panel__lleno" x="' + x + '" y="' + (y + hp * (1 - lleno)) + '" width="' + w + '" height="' + (hp * lleno) + '" rx="3"/>' +
        '<line class="g-panel__celda" x1="' + (x + w / 2) + '" x2="' + (x + w / 2) + '" y1="' + y + '" y2="' + (y + hp) + '"/>' +
        '<line class="g-panel__celda" x1="' + x + '" x2="' + (x + w) + '" y1="' + (y + hp / 3) + '" y2="' + (y + hp / 3) + '"/>' +
        '<line class="g-panel__celda" x1="' + x + '" x2="' + (x + w) + '" y1="' + (y + 2 * hp / 3) + '" y2="' + (y + 2 * hp / 3) + '"/></g>';
    }
    var tips = [];
    for (var k = 0; k < n; k++) { tips.push("Panel " + (k + 1) + ": " + (exacto - k >= 1 ? "necesario completo" : "se compra entero; se necesita el " + raiz.Motor.es(Math.max(0, exacto - k) * 100, 0) + " %")); }
    svg += '<text class="g-cat" x="4" y="' + (alto - 8) + '">' + raiz.Motor.es(exacto, 2) + " paneles calculados → " + spec.n + " comprados</text>";
    return { svg: svg, alto: alto, tips: tips };
  }

  var TIPOS = { barras: barras, linea: linea, cascada: cascada, medidor: medidor, paneles: paneles };

  /* Dibuja la especificación dentro de contenedor (un .grafico). */
  function dibujar(contenedor, spec, ctx) {
    if (!spec || !TIPOS[spec.tipo]) { contenedor.hidden = true; return; }
    contenedor.hidden = false;
    var ancho = Math.max(240, Math.round(contenedor.clientWidth || 320));
    var f = formateador(spec, ctx);
    var r = TIPOS[spec.tipo](spec, ancho, f);
    var series = spec.series || [];
    contenedor.innerHTML =
      (spec.titulo ? '<p class="g-titulo">' + esc(spec.titulo) + "</p>" : "") +
      leyenda(series, spec) +
      '<div class="g-lienzo"><svg xmlns="' + NS + '" width="' + ancho + '" height="' + r.alto + '" viewBox="0 0 ' + ancho + " " + r.alto +
      '" role="img" aria-label="' + esc(spec.titulo || "Gráfica") + '">' + r.svg + '</svg><div class="g-tip" role="status" hidden></div></div>' +
      (spec.nota ? '<p class="g-nota">' + esc(spec.nota) + "</p>" : "");
    contenedor._ultimoAncho = ancho;
    activarConsulta(contenedor, r);
  }

  function activarConsulta(contenedor, r) {
    var lienzo = contenedor.querySelector(".g-lienzo"), tip = contenedor.querySelector(".g-tip");
    var svg = lienzo.querySelector("svg");
    function mostrar(texto, x, y) {
      tip.innerHTML = texto; tip.hidden = false;
      var w = tip.offsetWidth, max = lienzo.clientWidth - w - 4;
      tip.style.left = Math.max(4, Math.min(max, x - w / 2)) + "px";
      tip.style.top = Math.max(0, y - tip.offsetHeight - 12) + "px";
    }
    function ocultar() { tip.hidden = true; lienzo.querySelectorAll(".g-activo").forEach(function (n) { n.classList.remove("g-activo"); }); var c = svg.querySelector(".g-cruz"); if (c) { c.style.opacity = 0; } }
    lienzo.addEventListener("pointerleave", ocultar);
    if (r.cruz) {
      var cz = r.cruz, cruz = svg.querySelector(".g-cruz");
      svg.querySelector(".g-captura").addEventListener("pointermove", function (ev) {
        var caja = svg.getBoundingClientRect(), px = ev.clientX - caja.left;
        var mejor = 0, d = Infinity;
        cz.xs.forEach(function (x, i) { var dd = Math.abs(cz.X(x) - px); if (dd < d) { d = dd; mejor = i; } });
        var xx = cz.X(cz.xs[mejor]);
        cruz.setAttribute("x1", xx); cruz.setAttribute("x2", xx); cruz.style.opacity = 1;
        var html = "<strong>" + esc(cz.etiquetaX) + " " + raiz.Motor.es(cz.xs[mejor], cz.decX) + "</strong>" +
          cz.series.map(function (s) { return '<span><i class="' + tono(s.tono) + '"></i>' + (cz.series.length > 1 ? esc(s.nombre) + ": " : "") + esc(cz.f(s.valores[mejor])) + "</span>"; }).join("");
        mostrar(html, xx, ev.clientY - caja.top);
      });
      return;
    }
    svg.querySelectorAll("[data-tip]").forEach(function (nodo) {
      nodo.addEventListener("pointerenter", function (ev) {
        ocultar();
        nodo.classList.add("g-activo");
        var caja = svg.getBoundingClientRect(), b = nodo.getBoundingClientRect();
        mostrar(esc(r.tips[+nodo.getAttribute("data-tip")] || ""), b.left - caja.left + b.width / 2, b.top - caja.top);
      });
    });
  }

  /* Redibuja al cambiar el ancho (giro del teléfono, panel lateral). */
  var vigilados = typeof ResizeObserver !== "undefined" ? new ResizeObserver(function (entradas) {
    entradas.forEach(function (e) {
      var c = e.target;
      if (!c.isConnected) { vigilados.unobserve(c); return; }   // vista ya desmontada
      if (c._redibujar && Math.abs((c._ultimoAncho || 0) - Math.round(c.clientWidth)) > 8) { c._redibujar(); }
    });
  }) : null;

  function vigilar(contenedor, fn) { contenedor._redibujar = fn; if (vigilados) { vigilados.observe(contenedor); } }

  raiz.Graficos = { dibujar: dibujar, vigilar: vigilar };
})(window);
