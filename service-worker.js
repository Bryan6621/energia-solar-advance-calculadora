/* service-worker.js — Calculadora Solar Advance 2.0
   Armazón en caché (la app funciona sin conexión desde la primera visita),
   red primero para la navegación y «stale-while-revalidate» para los recursos:
   cada apertura en línea trae la versión nueva y la siguiente ya la usa.
   Cambie VERSION en cada publicación. */

var VERSION = "calc-advance-v10-2.0.0";
var ARMAZON = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/motor.js",
  "./js/formulas.js",
  "./js/graficos.js",
  "./js/herramientas-pro.js",
  "./js/localizacion.js",
  "./js/banderas.js",
  "./js/almacen.js",
  "./js/venta.js",
  "./js/qr.js",
  "./js/examen.js",
  "./js/app.js",
  "./fuentes/inter-var.woff2",
  "./fuentes/source-serif-4-var.woff2",
  "./logo_advance.png",
  "./iconos/icon-192.png",
  "./iconos/icon-512.png",
  "./iconos/icon-maskable-512.png",
  "./iconos/apple-touch-icon.png",
  "./iconos/favicon-32.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSION).then(function (cache) { return cache.addAll(ARMAZON); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(nombres.filter(function (n) { return n !== VERSION; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (evento) {
  var url = new URL(evento.request.url);
  if (evento.request.method !== "GET" || url.origin !== self.location.origin) { return; }
  if (evento.request.mode === "navigate") {
    evento.respondWith(
      fetch(evento.request).then(function (respuesta) {
        var copia = respuesta.clone();
        caches.open(VERSION).then(function (c) { c.put("./index.html", copia); });
        return respuesta;
      }).catch(function () {
        return caches.match("./index.html", { ignoreSearch: true });
      })
    );
    return;
  }
  evento.respondWith(
    caches.match(evento.request, { ignoreSearch: true }).then(function (enCache) {
      var enRed = fetch(evento.request).then(function (respuesta) {
        if (respuesta && respuesta.ok) {
          var copia = respuesta.clone();
          caches.open(VERSION).then(function (c) { c.put(evento.request, copia); });
        }
        return respuesta;
      }).catch(function () { return enCache; });
      return enCache || enRed;
    })
  );
});
