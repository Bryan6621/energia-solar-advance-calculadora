/* localizacion.js — base de datos orientativa de referencia: HSP por ciudad y
   tarifas residenciales típicas por país. TODOS los valores llevan la etiqueta
   «orientativo — verificar en PVGIS» (fiel al Anexo B del libro). Son puntos de
   partida editables, no sustituto del diagnóstico real. */

window.CIUDADES = [
  { ciudad: "Bogotá", pais: "Colombia", hsp: 4.0 },
  { ciudad: "Medellín", pais: "Colombia", hsp: 4.2 },
  { ciudad: "Cali", pais: "Colombia", hsp: 4.5 },
  { ciudad: "Barranquilla", pais: "Colombia", hsp: 5.0 },
  { ciudad: "Ciudad de México", pais: "México", hsp: 5.2 },
  { ciudad: "Guadalajara", pais: "México", hsp: 5.5 },
  { ciudad: "Monterrey", pais: "México", hsp: 4.8 },
  { ciudad: "Lima", pais: "Perú", hsp: 4.8 },
  { ciudad: "Arequipa", pais: "Perú", hsp: 5.5 },
  { ciudad: "Santiago", pais: "Chile", hsp: 5.0 },
  { ciudad: "Buenos Aires", pais: "Argentina", hsp: 4.5 },
  { ciudad: "São Paulo", pais: "Brasil", hsp: 4.3 },
  { ciudad: "Madrid", pais: "España", hsp: 4.5 },
  { ciudad: "Sevilla", pais: "España", hsp: 5.0 },
  { ciudad: "Quito", pais: "Ecuador", hsp: 4.0 },
  { ciudad: "La Paz", pais: "Bolivia", hsp: 5.2 },
  { ciudad: "Asunción", pais: "Paraguay", hsp: 5.0 },
  { ciudad: "Montevideo", pais: "Uruguay", hsp: 4.7 },
  { ciudad: "San José", pais: "Costa Rica", hsp: 4.5 },
  { ciudad: "Ciudad de Panamá", pais: "Panamá", hsp: 4.6 }
];

window.TARIFAS = {
  "Colombia": 0.15, "México": 0.10, "España": 0.22, "Chile": 0.16,
  "Argentina": 0.08, "Perú": 0.17, "Bolivia": 0.12, "Brasil": 0.14,
  "Ecuador": 0.10, "Uruguay": 0.18, "Paraguay": 0.09, "Venezuela": 0.02,
  "Panamá": 0.16, "Costa Rica": 0.14, "Nicaragua": 0.15, "Honduras": 0.13,
  "El Salvador": 0.15, "Guatemala": 0.12, "Cuba": 0.05, "República Dominicana": 0.17,
  "Puerto Rico": 0.20
};
