/* service-worker.js — Calculadora Solar Advance
   Estrategia: caché-first para el armazón (app funciona offline) + red-first
   para la navegación y stale-while-revalidate para recursos, de modo que cada
   apertura EN LÍNEA detecta y aplica nuevas versiones automáticamente. */

var VERSION = "calc-advance-v7";
var ARMADOR = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/app.css",
  "./js/formulas.js",
  "./js/herramientas-pro.js",
  "./js/localizacion.js",
  "./js/almacen.js",
  "./js/venta.js",
  "./js/examen.js",
  "./js/app.js",
  "./iconos/icon-192.png",
  "./iconos/icon-512.png",
  "./iconos/apple-touch-icon.png",
  "./iconos/favicon-32.png"
];

self.addEventListener("install", function (evento) {
  evento.waitUntil(
    caches.open(VERSION).then(function (cache) {
      return cache.addAll(ARMADOR);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (evento) {
  evento.waitUntil(
    caches.keys().then(function (nombres) {
      return Promise.all(nombres.filter(function (n) {
        return n !== VERSION;
      }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (evento) {
  var url = new URL(evento.request.url);
  if (evento.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }
  // Navegación: red primero (actualiza si hay versión nueva) y caché de respaldo.
  if (evento.request.mode === "navigate") {
    evento.respondWith(
      fetch(evento.request)
        .then(function (respuesta) {
          var copia = respuesta.clone();
          caches.open(VERSION).then(function (c) { c.put(evento.request, copia); });
          return respuesta;
        })
        .catch(function () {
          return caches.match(evento.request).then(function (r) {
            return r || caches.match("./index.html");
          });
        })
    );
    return;
  }
  // Recursos: stale-while-revalidate.
  evento.respondWith(
    caches.match(evento.request).then(function (enCache) {
      var enRed = fetch(evento.request).then(function (respuesta) {
        var copia = respuesta.clone();
        caches.open(VERSION).then(function (c) { c.put(evento.request, copia); });
        return respuesta;
      }).catch(function () { return enCache; });
      return enCache || enRed;
    })
  );
});
