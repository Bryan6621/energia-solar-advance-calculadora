/* banderas.js — banderas de los países de la conversión de moneda.
   SVG vectorial dibujado a mano (sin emojis), simplificado pero fiel a los
   colores de cada país. viewBox 24x16 (3:2). */

window.BANDERAS = {
  "Estados Unidos (referencia)":
    '<rect width="24" height="16" fill="#B22234"/>' +
    '<g fill="#fff"><rect y="1.23" width="24" height="1.23"/><rect y="3.69" width="24" height="1.23"/>' +
    '<rect y="6.15" width="24" height="1.23"/><rect y="8.61" width="24" height="1.23"/>' +
    '<rect y="11.07" width="24" height="1.23"/><rect y="13.53" width="24" height="1.23"/></g>' +
    '<rect width="9.6" height="6.15" fill="#3C3B6E"/>',
  "México":
    '<rect width="8" height="16" fill="#006847"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#CE1126"/>',
  "Guatemala":
    '<rect width="8" height="16" fill="#4997D0"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#4997D0"/>',
  "El Salvador":
    '<rect width="24" height="5.33" fill="#0F47AF"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#0F47AF"/>',
  "Honduras":
    '<rect width="24" height="5.33" fill="#0073CF"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#0073CF"/>',
  "Nicaragua":
    '<rect width="24" height="5.33" fill="#0067C6"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#0067C6"/>',
  "Costa Rica":
    '<rect width="24" height="2.67" fill="#002B7F"/><rect y="2.67" width="24" height="2.67" fill="#fff"/>' +
    '<rect y="5.34" width="24" height="5.33" fill="#CE1126"/><rect y="10.67" width="24" height="2.66" fill="#fff"/>' +
    '<rect y="13.33" width="24" height="2.67" fill="#002B7F"/>',
  "Panamá":
    '<rect width="24" height="16" fill="#fff"/><rect x="12" width="12" height="8" fill="#DA121A"/><rect y="8" width="12" height="8" fill="#005293"/>',
  "Cuba":
    '<rect width="24" height="16" fill="#fff"/><rect width="24" height="3.2" fill="#002A8F"/>' +
    '<rect y="6.4" width="24" height="3.2" fill="#002A8F"/><rect y="12.8" width="24" height="3.2" fill="#002A8F"/>' +
    '<path d="M0 0 L10 8 L0 16 Z" fill="#CF142B"/>',
  "República Dominicana":
    '<rect width="24" height="16" fill="#fff"/><rect width="6" height="8" fill="#002D62"/><rect x="18" width="6" height="8" fill="#002D62"/>' +
    '<rect y="8" width="6" height="8" fill="#CE1126"/><rect x="18" y="8" width="6" height="8" fill="#CE1126"/>',
  "Puerto Rico":
    '<rect width="24" height="16" fill="#fff"/><rect width="24" height="3.2" fill="#CE1126"/>' +
    '<rect y="6.4" width="24" height="3.2" fill="#CE1126"/><rect y="12.8" width="24" height="3.2" fill="#CE1126"/>' +
    '<path d="M0 0 L10 8 L0 16 Z" fill="#0047AB"/>',
  "Colombia":
    '<rect width="24" height="8" fill="#FCD116"/><rect y="8" width="24" height="4" fill="#003893"/><rect y="12" width="24" height="4" fill="#CE1126"/>',
  "Venezuela":
    '<rect width="24" height="5.33" fill="#FFCC00"/><rect y="5.33" width="24" height="5.34" fill="#00247D"/><rect y="10.67" width="24" height="5.33" fill="#CF142B"/>',
  "Ecuador":
    '<rect width="24" height="8" fill="#FFDD00"/><rect y="8" width="24" height="4" fill="#034EA2"/><rect y="12" width="24" height="4" fill="#ED1C24"/>',
  "Perú":
    '<rect width="8" height="16" fill="#D91023"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#D91023"/>',
  "Bolivia":
    '<rect width="24" height="5.33" fill="#D52B1E"/><rect y="5.33" width="24" height="5.34" fill="#F9E300"/><rect y="10.67" width="24" height="5.33" fill="#007934"/>',
  "Chile":
    '<rect width="24" height="16" fill="#fff"/><rect y="8" width="24" height="8" fill="#D52B1E"/><rect width="8" height="8" fill="#0039A6"/>',
  "Paraguay":
    '<rect width="24" height="5.33" fill="#D52B1E"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#0038A8"/>',
  "Uruguay":
    '<rect width="24" height="16" fill="#fff"/><g fill="#0038A8"><rect y="1.78" width="24" height="1.78"/>' +
    '<rect y="5.33" width="24" height="1.78"/><rect y="8.89" width="24" height="1.78"/><rect y="12.44" width="24" height="1.78"/></g>' +
    '<rect width="8" height="8" fill="#fff"/>',
  "Argentina":
    '<rect width="24" height="5.33" fill="#74ACDF"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.67" width="24" height="5.33" fill="#74ACDF"/>',
  "Brasil":
    '<rect width="24" height="16" fill="#009C3B"/><path d="M12 2 L22 8 L12 14 L2 8 Z" fill="#FFDF00"/><circle cx="12" cy="8" r="3.2" fill="#002776"/>',
  "España":
    '<rect width="24" height="4" fill="#AA151B"/><rect y="4" width="24" height="8" fill="#F1BF00"/><rect y="12" width="24" height="4" fill="#AA151B"/>'
};

/* Devuelve el SVG completo de una bandera, con un borde y esquinas redondeadas. */
window.banderaSVG = function (pais) {
  var contenido = window.BANDERAS[pais] || window.BANDERAS["Estados Unidos (referencia)"];
  return '<svg class="bandera" viewBox="0 0 24 16" aria-hidden="true">' + contenido + '</svg>';
};
