/* almacen.js — persistencia local de proyectos (IndexedDB, 100% offline).
   Guarda una instantánea de todas las entradas (fórmulas educativas y
   herramientas Pro) y permite abrirla, listarla o borrarla. Sin backend:
   los proyectos viven solo en el dispositivo del usuario. */

window.Almacen = (function () {
  var NOMBRE_BD = "advance-proyectos";
  var NOMBRE_ALMACEN = "proyectos";
  var VERSION = 1;

  function abrir() {
    return new Promise(function (resolver, rechazar) {
      if (!("indexedDB" in window)) { rechazar(new Error("IndexedDB no disponible")); return; }
      var peticion = indexedDB.open(NOMBRE_BD, VERSION);
      peticion.onupgradeneeded = function () {
        var bd = peticion.result;
        if (!bd.objectStoreNames.contains(NOMBRE_ALMACEN)) {
          bd.createObjectStore(NOMBRE_ALMACEN, { keyPath: "id", autoIncrement: true });
        }
      };
      peticion.onsuccess = function () { resolver(peticion.result); };
      peticion.onerror = function () { rechazar(peticion.error); };
    });
  }

  function guardar(nombre, datos) {
    return abrir().then(function (bd) {
      return new Promise(function (resolver, rechazar) {
        var tx = bd.transaction(NOMBRE_ALMACEN, "readwrite");
        var almacen = tx.objectStore(NOMBRE_ALMACEN);
        var registro = { nombre: nombre, datos: datos, fecha: new Date().toISOString() };
        var peticion = almacen.add(registro);
        peticion.onsuccess = function () { resolver(peticion.result); };
        peticion.onerror = function () { rechazar(peticion.error); };
      });
    });
  }

  function listar() {
    return abrir().then(function (bd) {
      return new Promise(function (resolver, rechazar) {
        var tx = bd.transaction(NOMBRE_ALMACEN, "readonly");
        var peticion = tx.objectStore(NOMBRE_ALMACEN).getAll();
        peticion.onsuccess = function () { resolver(peticion.result || []); };
        peticion.onerror = function () { rechazar(peticion.error); };
      });
    });
  }

  function borrar(id) {
    return abrir().then(function (bd) {
      return new Promise(function (resolver, rechazar) {
        var tx = bd.transaction(NOMBRE_ALMACEN, "readwrite");
        var peticion = tx.objectStore(NOMBRE_ALMACEN).delete(id);
        peticion.onsuccess = function () { resolver(); };
        peticion.onerror = function () { rechazar(peticion.error); };
      });
    });
  }

  function snapshot() {
    var datos = {};
    document.querySelectorAll(".tarjeta").forEach(function (t) {
      var id = t.dataset.fid || t.dataset.pid;
      if (!id) { return; }
      var vals = {};
      t.querySelectorAll("input[data-campo]").forEach(function (entrada) {
        vals[entrada.dataset.campo] = entrada.value;
      });
      datos[id] = vals;
    });
    return datos;
  }

  function restaurar(datos) {
    Object.keys(datos).forEach(function (id) {
      var t = document.querySelector('.tarjeta[data-fid="' + id + '"], .tarjeta[data-pid="' + id + '"]');
      if (!t) { return; }
      var vals = datos[id];
      t.querySelectorAll("input[data-campo]").forEach(function (entrada) {
        if (vals[entrada.dataset.campo] !== undefined) { entrada.value = vals[entrada.dataset.campo]; }
      });
    });
  }

  return { guardar: guardar, listar: listar, borrar: borrar, snapshot: snapshot, restaurar: restaurar };
})();
