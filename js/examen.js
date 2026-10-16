/* examen.js — modo Certificación: datos del participante, examen de 20 preguntas
   de selección múltiple, repaso de errores, diploma imprimible y pantalla de
   datos del diploma. Puntaje: 4 puntos por acierto (máx. 80); se aprueba con el
   80 % (16 aciertos). El código QR se genera EN EL DISPOSITIVO (js/qr.js): los
   datos personales no salen del teléfono. La pantalla de verificación muestra
   lo que lleva el QR y dice con claridad que no consulta un registro central. */

window.PAISES = [
  "México", "Guatemala", "El Salvador", "Honduras", "Nicaragua", "Costa Rica",
  "Panamá", "Cuba", "República Dominicana", "Puerto Rico", "Colombia",
  "Venezuela", "Ecuador", "Perú", "Bolivia", "Chile", "Paraguay", "Uruguay",
  "Argentina", "Brasil", "España"
];

window.TIPOS_DOC = {
  "Colombia": ["Cédula de Ciudadanía", "Cédula de Extranjería", "Tarjeta de Identidad", "Pasaporte"],
  "México": ["INE (Credencial para votar)", "Pasaporte"],
  "Argentina": ["DNI", "Pasaporte"],
  "Chile": ["Cédula de Identidad (RUN)", "Pasaporte"],
  "Perú": ["DNI", "Carné de Extranjería", "Pasaporte"],
  "España": ["DNI", "NIE", "Pasaporte"],
  "Brasil": ["CPF", "RG", "Pasaporte"],
  "Uruguay": ["Cédula de Identidad", "Pasaporte"],
  "Paraguay": ["Cédula de Identidad", "Pasaporte"],
  "Bolivia": ["Cédula de Identidad", "Pasaporte"],
  "Ecuador": ["Cédula de Identidad", "Pasaporte"],
  "Venezuela": ["Cédula de Identidad", "Pasaporte"],
  "Panamá": ["Cédula de Identidad", "Pasaporte"],
  "Costa Rica": ["Cédula de Identidad", "Pasaporte"],
  "Nicaragua": ["Cédula de Identidad", "Pasaporte"],
  "Honduras": ["Tarjeta de Identidad", "Pasaporte"],
  "El Salvador": ["DUI", "Pasaporte"],
  "Guatemala": ["DPI", "Pasaporte"],
  "Cuba": ["Carnet de Identidad", "Pasaporte"],
  "República Dominicana": ["Cédula de Identidad y Electoral", "Pasaporte"],
  "Puerto Rico": ["Licencia de Conducir", "Pasaporte"]
};
window.TIPOS_DOC_GENERICO = ["Documento de identidad nacional", "Pasaporte", "Carnet de extranjería"];

window.EXAMEN = [
  { p: "¿Cuál es la regla correcta para descontar las pérdidas del sistema?", o: ["Multiplicar por 1,2", "Dividir entre 0,8", "Sumar un 20 % fijo", "Restar 0,8 kWh"], c: 1 },
  { p: "Con un consumo de 220 kWh al mes, el consumo diario es:", o: ["7,3 kWh/día", "73 kWh/día", "0,73 kWh/día", "2,2 kWh/día"], c: 0 },
  { p: "Las horas solares pico (HSP) representan:", o: ["El voltaje del panel", "Las horas equivalentes a 1.000 W/m²", "Los amperios del sistema", "La vida útil del módulo"], c: 1 },
  { p: "Al bajar la temperatura, el Voc de un panel:", o: ["Sube", "Baja", "No cambia", "Se anula"], c: 0 },
  { p: "El payback se calcula como:", o: ["CAPEX por los años", "CAPEX ÷ (ahorro anual − OPEX anual)", "Ahorro ÷ CAPEX", "CAPEX + OPEX"], c: 1 },
  { p: "El LCOE simple del caso Torres (sin descontar) ronda:", o: ["0,15 USD/kWh", "0,058 USD/kWh", "5,8 USD/kWh", "0,58 USD/kWh"], c: 1 },
  { p: "DOD significa:", o: ["Días de operación diaria", "Profundidad de descarga", "Demanda de operación", "Directo de operación"], c: 1 },
  { p: "Al conectar módulos en serie:", o: ["El voltaje suma", "La corriente suma", "Ambos suman", "Ninguno cambia"], c: 0 },
  { p: "Al conectar baterías en paralelo:", o: ["El voltaje suma", "La corriente (Ah) suma", "Ambos suman", "Ninguno cambia"], c: 1 },
  { p: "Cuatro baterías de 12 V / 200 Ah en serie forman:", o: ["48 V / 200 Ah", "12 V / 800 Ah", "48 V / 800 Ah", "12 V / 200 Ah"], c: 0 },
  { p: "El performance ratio (PR) por defecto del libro es:", o: ["1,20", "0,50", "0,80", "1,00"], c: 2 },
  { p: "El banco nominal se obtiene dividiendo el útil entre:", o: ["Los días de autonomía", "El DOD", "La HSP", "El voltaje"], c: 1 },
  { p: "En protecciones, la corriente de diseño se multiplica por:", o: ["2", "0,8", "10", "1,25"], c: 3 },
  { p: "La caída de tensión máxima admisible recomendada es:", o: ["30 %", "10 %", "3 %", "1 %"], c: 2 },
  { p: "Un sistema off-grid se elige por:", o: ["Ahorro frente a la red", "Necesidad (donde no llega la red)", "Moda tecnológica", "Costo menor que el generador"], c: 1 },
  { p: "El banco útil del caso Los Alisos (2,16 kWh/día × 3 días) es:", o: ["6,48 kWh", "2,16 kWh", "0,72 kWh", "8,1 kWh"], c: 0 },
  { p: "En un híbrido off-grid, el generador debe:", o: ["Alimentar cargas directo", "Cargar el banco de baterías", "Arrancar siempre", "No usarse nunca"], c: 1 },
  { p: "«Lo que no se puede documentar…»", o: ["…se estima", "…no se promete", "…se ignora", "…se improvisa"], c: 1 },
  { p: "La producción útil mensual del caso Torres (2.250 Wp, HSP 4,2, PR 0,8) es:", o: ["2.250 kWh", "226,8 kWh", "181 kWh", "28,4 kWh"], c: 1 },
  { p: "Para mostrarle al cliente si el crédito le conviene, la cuota se compara con:", o: ["La factura completa de hoy", "La factura actual, sumando a la cuota la factura residual", "El CAPEX dividido entre 12", "La tarifa por kWh"], c: 1 }
];

window.PUNTOS_POR_ACIENTO = 4;
window.PORCENTAJE_APROBACION = 80;   // 16 de 20 aciertos

function escCert(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

window.montarCertificado = function (contenedor, volver) {
  var datos = { pais: "Colombia", tipoDoc: "", numero: "", nombres: "", apellidos: "" };
  var total = window.EXAMEN.length, indice = 0, respuestas = [];
  var toast = window.toastAdvance || function () {};

  function renderFormulario() {
    var paises = window.PAISES.map(function (p) { return "<option" + (p === datos.pais ? " selected" : "") + ">" + p + "</option>"; }).join("");
    contenedor.innerHTML = (volver || "") +
      '<header class="vista__cabecera"><h2 class="vista__titulo">Certificación</h2>' +
      '<p class="vista__intro">' + total + " preguntas de selección múltiple sobre el libro. Se aprueba con el " + window.PORCENTAJE_APROBACION + " % y se obtiene el diploma de Analista de Sistemas Fotovoltaicos — Multienfoque.</p></header>" +
      '<form class="formula formulario" id="cert-form" novalidate>' +
      '<p class="formulario__titulo">Datos para el diploma</p>' +
      '<div class="campo"><label class="campo__etiqueta" for="cert-pais">País</label><select id="cert-pais" class="selector">' + paises + "</select></div>" +
      '<div class="campo"><label class="campo__etiqueta" for="cert-doc">Tipo de documento</label><select id="cert-doc" class="selector"></select></div>' +
      '<div class="campo"><label class="campo__etiqueta" for="cert-numero">Número de documento</label><input id="cert-numero" class="texto" type="text" autocomplete="off" required></div>' +
      '<div class="campo"><label class="campo__etiqueta" for="cert-nombres">Nombres</label><input id="cert-nombres" class="texto" type="text" autocomplete="given-name" required></div>' +
      '<div class="campo"><label class="campo__etiqueta" for="cert-apellidos">Apellidos</label><input id="cert-apellidos" class="texto" type="text" autocomplete="family-name" required></div>' +
      '<p class="formulario__error" id="cert-error" role="alert" hidden></p>' +
      '<p class="formulario__privacidad">Sus datos solo se usan para escribir el diploma en este dispositivo: no se envían a ningún servidor.</p>' +
      '<button class="boton" type="submit">Empezar el examen</button></form>';
    var selPais = document.getElementById("cert-pais"), selDoc = document.getElementById("cert-doc");
    function poblarDoc() {
      var lista = window.TIPOS_DOC[selPais.value] || window.TIPOS_DOC_GENERICO;
      selDoc.innerHTML = lista.map(function (x) { return "<option>" + x + "</option>"; }).join("");
    }
    selPais.addEventListener("change", poblarDoc);
    poblarDoc();
    document.getElementById("cert-form").addEventListener("submit", function (e) {
      e.preventDefault();
      datos.pais = selPais.value; datos.tipoDoc = selDoc.value;
      datos.numero = document.getElementById("cert-numero").value.trim();
      datos.nombres = document.getElementById("cert-nombres").value.trim();
      datos.apellidos = document.getElementById("cert-apellidos").value.trim();
      var falta = [];
      if (!datos.numero) { falta.push("número de documento"); }
      if (!datos.nombres) { falta.push("nombres"); }
      if (!datos.apellidos) { falta.push("apellidos"); }
      var err = document.getElementById("cert-error");
      if (falta.length) { err.hidden = false; err.textContent = "Falta completar: " + falta.join(", ") + "."; return; }
      indice = 0; respuestas = [];
      renderExamen();
    });
  }

  function renderExamen() {
    var q = window.EXAMEN[indice];
    contenedor.innerHTML =
      '<header class="vista__cabecera"><p class="examen__contador">Pregunta ' + (indice + 1) + " de " + total + "</p>" +
      '<div class="progreso" role="progressbar" aria-label="Avance del examen" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + indice + '"><div class="progreso__barra" style="width:' + (indice / total * 100) + '%"></div></div></header>' +
      '<fieldset class="pregunta pregunta--examen"><legend>' + escCert(q.p) + '</legend><div class="opciones">' +
      q.o.map(function (op, i) {
        return '<label class="opcion"><input type="radio" name="op" value="' + i + '"' + (respuestas[indice] === i ? " checked" : "") + "><span>" + escCert(op) + "</span></label>";
      }).join("") + "</div></fieldset>" +
      '<div class="examen__acciones">' + (indice > 0 ? '<button class="boton boton--secundario" id="cert-anterior">Anterior</button>' : "") +
      '<button class="boton" id="cert-siguiente"' + (respuestas[indice] === undefined ? " disabled" : "") + ">" + (indice === total - 1 ? "Terminar el examen" : "Siguiente") + "</button></div>";
    var sig = document.getElementById("cert-siguiente");
    contenedor.querySelectorAll('input[name="op"]').forEach(function (r) {
      r.addEventListener("change", function () { respuestas[indice] = parseInt(r.value, 10); sig.disabled = false; });
    });
    sig.addEventListener("click", function () {
      if (respuestas[indice] === undefined) { return; }
      if (indice < total - 1) { indice++; renderExamen(); } else { calificar(); }
    });
    var ant = document.getElementById("cert-anterior");
    if (ant) { ant.addEventListener("click", function () { indice--; renderExamen(); }); }
    window.scrollTo(0, 0);
  }

  function repaso() {
    var fallos = window.EXAMEN.map(function (q, i) { return { q: q, r: respuestas[i] }; }).filter(function (x) { return x.r !== x.q.c; });
    if (!fallos.length) { return ""; }
    return '<details class="repaso"><summary>Repasar ' + (fallos.length === 1 ? "la respuesta incorrecta" : "las " + fallos.length + " respuestas incorrectas") + "</summary><ol>" + fallos.map(function (x) {
      return "<li><p>" + escCert(x.q.p) + '</p><p class="repaso__suya">Su respuesta: ' + escCert(x.q.o[x.r]) + '</p><p class="repaso__correcta">Correcta: ' + escCert(x.q.o[x.q.c]) + "</p></li>";
    }).join("") + "</ol></details>";
  }

  function calificar() {
    var aciertos = window.EXAMEN.reduce(function (a, q, i) { return a + (respuestas[i] === q.c ? 1 : 0); }, 0);
    var puntos = aciertos * window.PUNTOS_POR_ACIENTO, maximo = total * window.PUNTOS_POR_ACIENTO;
    var pct = Math.round(puntos / maximo * 100);
    if (pct >= window.PORCENTAJE_APROBACION) { renderDiploma(puntos, maximo, pct); return; }
    contenedor.innerHTML = (volver || "") +
      '<section class="resultado-examen"><p class="resultado-examen__cifra">' + aciertos + " de " + total + "</p>" +
      '<p class="resultado-examen__texto">Aún no alcanza el ' + window.PORCENTAJE_APROBACION + " %: obtuvo " + puntos + " de " + maximo + " puntos (" + pct + " %). Repase las respuestas y vuelva a intentarlo.</p>" +
      repaso() + '<button class="boton" id="cert-reintentar">Intentar de nuevo</button></section>';
    document.getElementById("cert-reintentar").addEventListener("click", function () { indice = 0; respuestas = []; renderExamen(); });
    window.scrollTo(0, 0);
  }

  function renderDiploma(puntos, maximo, pct) {
    var nombreCompleto = (datos.nombres + " " + datos.apellidos).trim();
    var fechaTexto = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    var verifURL = location.origin + location.pathname + "#/verificar?nombre=" + encodeURIComponent(nombreCompleto) +
      "&doc=" + encodeURIComponent(datos.numero) + "&tipo=" + encodeURIComponent(datos.tipoDoc) +
      "&pais=" + encodeURIComponent(datos.pais) + "&fecha=" + encodeURIComponent(fechaTexto) + "&puntaje=" + pct;
    var qr = window.QRAdvance ? window.QRAdvance.svg(verifURL, 128) : "";
    contenedor.innerHTML =
      '<section class="diploma">' +
      '<div class="diploma__acciones"><button class="boton" id="diploma-descargar">Descargar en PDF o imprimir</button>' +
      '<a class="boton boton--secundario" href="#/">Volver al inicio</a></div>' +
      repaso() +
      '<div class="diploma__marco">' +
      '<div class="diploma__cabecera"><img src="./logo_advance.png" alt="Logo Energía Solar Advance">' +
      '<p class="diploma__empresa">Energía Solar Surya S.A.S.</p><p class="diploma__nit">NIT 901358300-0 · Medellín, Antioquia</p></div>' +
      '<p class="diploma__otorga">Otorga el presente</p><h1 class="diploma__titulo">Diploma</h1>' +
      '<p class="diploma__a">a</p><p class="diploma__nombre">' + escCert(nombreCompleto) + "</p>" +
      '<p class="diploma__doc">' + escCert(datos.tipoDoc + " " + datos.numero + " · " + datos.pais) + "</p>" +
      '<div class="diploma__cuerpo"><p>por haber cursado y aprobado el programa</p>' +
      '<p class="diploma__programa">Analista de Sistemas Fotovoltaicos — Multienfoque</p>' +
      "<p>con las competencias teóricas y prácticas para el análisis, el dimensionamiento y la gestión de proyectos de energía solar fotovoltaica.</p>" +
      '<p class="diploma__puntaje">Puntaje: ' + puntos + " de " + maximo + " (" + pct + " %)</p></div>" +
      '<div class="diploma__pie"><div class="diploma__firma"><div class="diploma__linea"></div><p class="diploma__firmante">Brayanndra Mosquera Quintero</p>' +
      '<p class="diploma__cargo">Director General</p><p class="diploma__fecha">Medellín, ' + escCert(fechaTexto) + "</p></div>" +
      '<div class="diploma__qr">' + qr + "<p>Datos del diploma</p></div></div>" +
      '<p class="diploma__legal">Capacitado y certificado por Energía Solar Surya S.A.S. y Proyecto Lazarus 420. Constancia expedida en la modalidad de educación informal (Decreto 1075 de 2015 y Ley 115 de 1994, Ministerio de Educación Nacional de Colombia). Su contenido toma como referencia la norma IEC 62446-1 (documentación y puesta en marcha de sistemas fotovoltaicos). No es una certificación de personas acreditada bajo ISO/IEC 17024 ni conduce a título de educación superior.</p>' +
      "</div></section>";
    document.getElementById("diploma-descargar").addEventListener("click", function () { window.print(); });
    toast("Aprobado con " + pct + " %. Descargue el diploma con el botón superior.");
    window.scrollTo(0, 0);
  }

  renderFormulario();
};

window.mostrarVerificacion = function (contenedor) {
  var p = new URLSearchParams(location.hash.split("?")[1] || "");
  var filas = [["Titular", p.get("nombre")], ["Documento", ((p.get("tipo") || "") + " " + (p.get("doc") || "")).trim()], ["País", p.get("pais")],
    ["Fecha", p.get("fecha")], ["Puntaje", p.get("puntaje") ? p.get("puntaje") + " %" : ""],
    ["Programa", "Analista de Sistemas Fotovoltaicos — Multienfoque"], ["Emitido por", "Energía Solar Surya S.A.S. · Proyecto Lazarus 420"]];
  contenedor.insertAdjacentHTML("beforeend",
    '<header class="vista__cabecera"><h2 class="vista__titulo">Datos del diploma</h2>' +
    '<p class="vista__intro">Estos son los datos que lleva el código QR del diploma. Compárelos con el diploma impreso y con el documento de identidad del titular.</p></header>' +
    '<div class="formula"><dl class="extras extras--ficha">' + filas.filter(function (f) { return f[1]; }).map(function (f) {
      return "<div><dt>" + f[0] + "</dt><dd>" + escCert(f[1]) + "</dd></div>";
    }).join("") + "</dl>" +
    '<p class="formula__nota">La calculadora funciona sin servidor: no consulta un registro central de diplomas. El código QR muestra qué datos se imprimieron, no prueba por sí solo que el examen se haya presentado. Para una verificación formal, escriba a Energía Solar Surya S.A.S.</p></div>');
};
