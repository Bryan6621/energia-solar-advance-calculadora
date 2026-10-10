/* examen.js — modo Certificate: formulario de identidad, examen de 20 preguntas
   de selección múltiple, generación del diploma y pantalla de verificación.
   Puntaje: cada acierto vale 4 puntos (máx. 80); se aprueba con 80% (16 aciertos).
   Sin emojis; iconos SVG. La verificación es una pantalla ESTÁTICA (la PWA no
   tiene backend): el QR codifica nombre, documento y fecha. */

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
  { p: "¿Cuál es la regla correcta para descontar las pérdidas del sistema?", o: ["Multiplicar por 1,2", "Dividir entre 0,8", "Sumar un 20% fijo", "Restar 0,8 kWh"], c: 1 },
  { p: "Con un consumo de 220 kWh al mes, el consumo diario es:", o: ["7,3 kWh/día", "73 kWh/día", "0,73 kWh/día", "2,2 kWh/día"], c: 0 },
  { p: "Las horas solares pico (HSP) representan:", o: ["El voltaje del panel", "Las horas equivalentes a 1.000 W/m²", "Los amperios del sistema", "La vida útil del módulo"], c: 1 },
  { p: "Al bajar la temperatura, el Voc de un panel:", o: ["Sube", "Baja", "No cambia", "Se anula"], c: 0 },
  { p: "El payback se calcula como:", o: ["CAPEX por los años", "CAPEX ÷ (ahorro anual − OPEX anual)", "Ahorro ÷ CAPEX", "CAPEX + OPEX"], c: 1 },
  { p: "El LCOE del caso Torres del libro ronda:", o: ["0,15 USD/kWh", "0,055 USD/kWh", "5,5 USD/kWh", "0,5 USD/kWh"], c: 1 },
  { p: "DOD significa:", o: ["Días de operación diaria", "Profundidad de descarga", "Demanda de operación", "Directo de operación"], c: 1 },
  { p: "Al conectar módulos en serie:", o: ["El voltaje suma", "La corriente suma", "Ambos suman", "Ninguno cambia"], c: 0 },
  { p: "Al conectar baterías en paralelo:", o: ["El voltaje suma", "La corriente (Ah) suma", "Ambos suman", "Ninguno cambia"], c: 1 },
  { p: "Cuatro baterías de 12 V / 200 Ah en serie forman:", o: ["48 V / 200 Ah", "12 V / 800 Ah", "48 V / 800 Ah", "12 V / 200 Ah"], c: 0 },
  { p: "El performance ratio (PR) por defecto del libro es:", o: ["1,20", "0,50", "0,80", "1,00"], c: 2 },
  { p: "El banco nominal se obtiene dividiendo el útil entre:", o: ["Los días de autonomía", "El DOD", "La HSP", "El voltaje"], c: 1 },
  { p: "En protecciones, la corriente de diseño se multiplica por:", o: ["2", "0,8", "10", "1,25"], c: 3 },
  { p: "La caída de tensión máxima admisible recomendada es:", o: ["30%", "10%", "3%", "1%"], c: 2 },
  { p: "Un sistema off-grid se elige por:", o: ["Ahorro frente a la red", "Necesidad (donde no llega la red)", "Moda tecnológica", "Costo menor que el generador"], c: 1 },
  { p: "El banco útil del caso Los Alisos (2,16 kWh/día × 3 días) es:", o: ["6,48 kWh", "2,16 kWh", "0,72 kWh", "8,1 kWh"], c: 0 },
  { p: "En un híbrido off-grid, el generador debe:", o: ["Alimentar cargas directo", "Cargar el banco de baterías", "Arrancar siempre", "No usarse nunca"], c: 1 },
  { p: "«Lo que no se puede documentar…»", o: ["…se estima", "…no se promete", "…se ignora", "…se improvisa"], c: 1 },
  { p: "El Voc del módulo de referencia del libro es:", o: ["34,5 V", "41,2 V", "13,9 V", "45 V"], c: 1 },
  { p: "La producción útil mensual del caso Torres (1.800 Wp, HSP 4,2, PR 0,8) ronda:", o: ["1.800 kWh", "220 kWh", "181 kWh", "27 kWh"], c: 2 }
];

window.PUNTOS_POR_ACIENTO = 4;
window.PORCENTAJE_APROBACION = 80;   // 16 de 20 aciertos

window.montarCertificado = function (contenedor) {
  var datos = { pais: "", tipoDoc: "", numero: "", nombres: "", apellidos: "", aciertos: 0 };

  function renderFormulario() {
    var paises = window.PAISES.map(function (p) { return '<option>' + p + '</option>'; }).join("");
    contenedor.innerHTML =
      '<section class="vista activa">' +
      '<h2 class="vista__titulo">Certificación</h2>' +
      '<p class="vista__intro">Responde el examen de 20 preguntas. Apruebas con el 80% y obtienes el diploma de Analista de Sistemas Fotovoltaicos — Multienfoque.</p>' +
      '<div class="tarjeta">' +
      '<div class="tarjeta__cabecera"><span class="tarjeta__indice">1</span><span class="tarjeta__nombre">Datos del participante</span></div>' +
      '<div class="campo"><label class="campo__etiqueta">País</label>' +
      '<select id="cert-pais" class="campo__entrada">' + paises + '</select></div>' +
      '<div class="campo"><label class="campo__etiqueta">Tipo de documento</label>' +
      '<select id="cert-doc" class="campo__entrada"></select></div>' +
      '<div class="campo"><label class="campo__etiqueta">Número de documento</label>' +
      '<input id="cert-numero" class="campo__entrada" type="text" inputmode="text" placeholder="Número"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Nombres</label>' +
      '<input id="cert-nombres" class="campo__entrada" type="text" placeholder="Nombres"></div>' +
      '<div class="campo"><label class="campo__etiqueta">Apellidos</label>' +
      '<input id="cert-apellidos" class="campo__entrada" type="text" placeholder="Apellidos"></div>' +
      '<button class="boton" id="cert-iniciar" style="width:100%">Iniciar examen</button>' +
      '</div></section>';

    var selPais = document.getElementById("cert-pais");
    var selDoc = document.getElementById("cert-doc");
    function poblarDoc() {
      var lista = window.TIPOS_DOC[selPais.value] || window.TIPOS_DOC_GENERICO;
      selDoc.innerHTML = lista.map(function (t) { return '<option>' + t + '</option>'; }).join("");
    }
    selPais.addEventListener("change", poblarDoc);
    poblarDoc();
    document.getElementById("cert-iniciar").addEventListener("click", function () {
      datos.pais = selPais.value;
      datos.tipoDoc = selDoc.value;
      datos.numero = document.getElementById("cert-numero").value.trim();
      datos.nombres = document.getElementById("cert-nombres").value.trim();
      datos.apellidos = document.getElementById("cert-apellidos").value.trim();
      if (!datos.nombres || !datos.apellidos || !datos.numero) {
        window.alert("Completa país, tipo y número de documento, nombres y apellidos.");
        return;
      }
      renderExamen();
    });
  }

  var indice = 0, respuestas = [];

  function renderExamen() {
    var q = window.EXAMEN[indice];
    var opciones = q.o.map(function (op, i) {
      return '<label class="opcion"><input type="radio" name="op" value="' + i + '"' +
        (respuestas[indice] === i ? " checked" : "") + '> <span>' + op + '</span></label>';
    }).join("");
    contenedor.innerHTML =
      '<section class="vista activa">' +
      '<h2 class="vista__titulo">Examen de certificación</h2>' +
      '<div class="progreso"><div class="progreso__barra" style="width:' + ((indice) / 20 * 100) + '%"></div></div>' +
      '<p class="vista__intro">Pregunta ' + (indice + 1) + ' de 20</p>' +
      '<div class="tarjeta"><div class="tarjeta__cabecera"><span class="tarjeta__indice">' + (indice + 1) + '</span>' +
      '<span class="tarjeta__nombre">' + q.p + '</span></div>' +
      '<div class="opciones">' + opciones + '</div>' +
      '<div style="display:flex;gap:10px;margin-top:14px">' +
      (indice > 0 ? '<button class="boton boton--secundario" id="cert-anterior">Anterior</button>' : '') +
      '<button class="boton" id="cert-siguiente" style="flex:1">' + (indice === 19 ? "Finalizar" : "Siguiente") + '</button>' +
      '</div></div></section>';

    document.getElementById("cert-siguiente").addEventListener("click", function () {
      var sel = contenedor.querySelector('input[name="op"]:checked');
      if (!sel) { window.alert("Selecciona una respuesta."); return; }
      respuestas[indice] = parseInt(sel.value, 10);
      if (indice < 19) { indice++; renderExamen(); }
      else { calificar(); }
    });
    var ant = document.getElementById("cert-anterior");
    if (ant) { ant.addEventListener("click", function () { indice--; renderExamen(); }); }
  }

  function calificar() {
    var aciertos = window.EXAMEN.reduce(function (acc, q, i) {
      return acc + (respuestas[i] === q.c ? 1 : 0);
    }, 0);
    datos.aciertos = aciertos;
    var puntos = aciertos * window.PUNTOS_POR_ACIENTO;
    var maximo = window.EXAMEN.length * window.PUNTOS_POR_ACIENTO;
    var pct = Math.round(puntos / maximo * 100);
    var aprobo = pct >= window.PORCENTAJE_APROBACION;
    if (aprobo) { renderDiploma(aciertos, puntos, maximo, pct); }
    else {
      contenedor.innerHTML =
        '<section class="vista activa"><h2 class="vista__titulo">Resultado</h2>' +
        '<div class="tarjeta" style="text-align:center"><div class="panel__icono" style="margin:0 auto 12px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg></div>' +
        '<p class="tarjeta__nombre" style="font-size:16px">No aprobaste esta vez</p>' +
        '<p class="vista__intro">Obtuviste ' + puntos + ' de ' + maximo + ' puntos (' + pct + '%). Necesitas al menos el 80%.</p>' +
        '<button class="boton" id="cert-reintentar" style="width:100%">Intentar de nuevo</button></div></section>';
      document.getElementById("cert-reintentar").addEventListener("click", function () {
        indice = 0; respuestas = []; renderExamen();
      });
    }
  }

  function renderDiploma(aciertos, puntos, maximo, pct) {
    var nombreCompleto = (datos.nombres + " " + datos.apellidos).trim();
    var fecha = new Date();
    var fechaTexto = fecha.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    var verifURL = location.origin + location.pathname + "#/verificar?nombre=" +
      encodeURIComponent(nombreCompleto) + "&doc=" + encodeURIComponent(datos.numero) +
      "&tipo=" + encodeURIComponent(datos.tipoDoc) + "&fecha=" + encodeURIComponent(fechaTexto);
    var qrURL = "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" +
      encodeURIComponent(verifURL) + "&color=2c3e50";

    contenedor.innerHTML =
      '<section class="vista activa diploma">' +
      '<div class="diploma__marco">' +
      '<div class="diploma__sello">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="9"/><path d="M12 7l1.2 2.4L15.6 10l-1.8 1.8.4 2.4-2.2-1.1-2.2 1.1.4-2.4L8.4 10l2.4-.6z"/></svg>' +
      '</div>' +
      '<div class="diploma__cabecera"><img src="./logo_advance.png" alt="Logo">' +
      '<p class="diploma__empresa">ENERGÍA SOLAR SURYA S.A.S.</p>' +
      '<p class="diploma__nit">NIT 901358300-0 · Medellín, Antioquia</p></div>' +
      '<p class="diploma__otorga">Otorga el presente</p>' +
      '<h1 class="diploma__titulo">DIPLOMA</h1>' +
      '<p class="diploma__a">A:</p>' +
      '<p class="diploma__nombre">' + nombreCompleto + '</p>' +
      '<p class="diploma__doc">' + datos.tipoDoc + ' ' + datos.numero + ' · ' + datos.pais + '</p>' +
      '<div class="diploma__cuerpo">' +
      '<p>Por haber cursado y aprobado el programa:</p>' +
      '<p class="diploma__programa">ANALISTA DE SISTEMAS FOTOVOLTAICOS — MULTIENFOQUE</p>' +
      '<p>Habiendo demostrado las competencias teóricas y prácticas necesarias para el análisis, dimensionamiento y gestión de proyectos de energía solar fotovoltaica.</p>' +
      '<p class="diploma__puntaje">Puntaje: ' + puntos + ' / ' + maximo + ' (' + pct + '%)</p>' +
      '</div>' +
      '<div class="diploma__firma"><div class="diploma__linea"></div>' +
      '<p class="diploma__firmante">Brayanndra Mosquera Quintero</p>' +
      '<p class="diploma__cargo">Director General</p></div>' +
      '<p class="diploma__fecha">Medellín, ' + fechaTexto + '</p>' +
      '<p class="diploma__legal">Capacitado y certificado por <strong>Energía Solar Surya S.A.S CO</strong> y <strong>Proyecto Lazarus 420</strong>. La presente constancia se expide en la modalidad de Educación Informal conforme al Decreto 1075 de 2015 y la Ley 115 de 1994 (Ministerio de Educación Nacional de Colombia), y se enmarca en los estándares internacionales ISO/IEC 17024 (certificación de personas) e IEC 62446-1 (documentación y puesta en marcha de sistemas fotovoltaicos). No conduce a título de educación superior.</p>' +
      '<div class="diploma__qr"><img src="' + qrURL + '" alt="QR de verificación"><p>Verificar autenticidad</p></div>' +
      '</div>' +
      '<div class="diploma__acciones">' +
      '<button class="boton" id="diploma-descargar" style="width:100%">Descargar / Imprimir</button>' +
      '<button class="boton boton--secundario" id="diploma-volver" style="width:100%">Volver al inicio</button>' +
      '</div></section>';

    document.getElementById("diploma-descargar").addEventListener("click", function () { window.print(); });
    document.getElementById("diploma-volver").addEventListener("click", function () {
      if (window.location.hash) { history.pushState("", document.title, location.pathname); }
      if (window.mostrarHub) { window.mostrarHub(); }
    });
    // descarga automática al aprobar
    setTimeout(function () { window.print(); }, 600);
  }

  renderFormulario();
};

window.mostrarVerificacion = function (contenedor) {
  var p = new URLSearchParams(location.hash.split("?")[1] || "");
  var nombre = p.get("nombre") || "";
  var doc = p.get("doc") || "";
  var tipo = p.get("tipo") || "";
  var fecha = p.get("fecha") || "";
  contenedor.innerHTML =
    '<section class="vista activa"><h2 class="vista__titulo">Verificación de diploma</h2>' +
    '<div class="tarjeta" style="text-align:center">' +
    '<div class="panel__icono" style="margin:0 auto 12px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg></div>' +
    '<p class="tarjeta__nombre" style="font-size:16px">Diploma auténtico</p>' +
    (nombre ? '<div class="fila-verificacion"><span class="fila-verificacion__concepto">Titular</span><span class="fila-verificacion__valores">' + nombre + '</span></div>' : '') +
    (doc ? '<div class="fila-verificacion"><span class="fila-verificacion__concepto">Documento</span><span class="fila-verificacion__valores">' + tipo + ' ' + doc + '</span></div>' : '') +
    (fecha ? '<div class="fila-verificacion"><span class="fila-verificacion__concepto">Fecha</span><span class="fila-verificacion__valores">' + fecha + '</span></div>' : '') +
    '<div class="fila-verificacion"><span class="fila-verificacion__concepto">Programa</span><span class="fila-verificacion__valores">Analista de Sistemas Fotovoltaicos — Multienfoque</span></div>' +
    '<div class="fila-verificacion"><span class="fila-verificacion__concepto">Emitido por</span><span class="fila-verificacion__valores">Energía Solar Surya S.A.S CO · Proyecto Lazarus 420</span></div>' +
    '<p class="nota">Esta constancia se enmarca en el Decreto 1075 de 2015, la Ley 115 de 1994 y los estándares ISO/IEC 17024 e IEC 62446-1. La verificación es de formato estático; los datos del titular provienen del código QR del diploma.</p>' +
    '</div></section>';
};
