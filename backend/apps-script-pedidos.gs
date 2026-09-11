/* ============================================================
   CREATV MASK — PEDIDOS + MURO DE DONANTES + FIRMA DE BOLD
   (Google Apps Script)
   ------------------------------------------------------------
   Hoja de Google Sheets con estos encabezados en la fila 1:
     A Fecha | B Nombre | C Teléfono | D Correo | E Dirección | F Ciudad
     G Cantidad | H Total | I Pagado | J Enviado | K Muro | L ID Pedido
   "Pagado" y "Enviado" los marcan ustedes a mano (cualquier X sirve).
   El muro solo muestra filas con Pagado marcado y Muro = "Sí".

   Llaves de Bold: NUNCA van en este código ni en el sitio. En el editor
   de Apps Script → ⚙️ Configuración del proyecto → Propiedades del
   script → añadir:
     BOLD_PUBLIC_KEY = la llave de identidad
     BOLD_SECRET_KEY = la llave secreta
   Instalación / actualización: igual que backend/apps-script-wakeup.gs
   (Implementar → Aplicación web → Yo / Cualquiera; para cambios,
   Gestionar implementaciones → Nueva versión, misma URL). La URL /exec
   va en assets/mask3d.js (SHEET_URL). Este archivo NO sale al sitio.
   ============================================================ */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var p = e.parameter;
  var UNIT_PRICE = 50000;
  // La cantidad de máscaras la elige quien dona; eso fija el mínimo a
  // donar ($50.000 por máscara). El monto puede ser igual o mayor a ese
  // mínimo — lo que pase de ahí queda como donación extra para la causa.
  var qty = Math.max(1, Math.round(Number(p['Cantidad']) || 1));
  var minTotal = qty * UNIT_PRICE;
  var total = Math.max(minTotal, Math.round(Number(p['Monto']) || minTotal));
  var orderId = "CRTVMASK-" + new Date().getTime() + "-" + Math.floor(Math.random() * 10000);

  sheet.appendRow([
    new Date(),
    p['Nombre'] || "",
    p['Teléfono'] || "",
    p['Correo'] || "",
    p['Dirección'] || "",
    p['Ciudad'] || "",
    qty,
    total,
    "",              // Pagado — lo marcan ustedes a mano (cualquier X sirve)
    "",              // Enviado — lo marcan ustedes a mano
    p['Muro'] || "", // Muro — "Sí" si quiso aparecer en el muro de donantes
    orderId          // ID Pedido — para cruzar con el panel de Bold
  ]);

  var props = PropertiesService.getScriptProperties();
  var secretKey = props.getProperty('BOLD_SECRET_KEY');
  var publicKey = props.getProperty('BOLD_PUBLIC_KEY');

  // Firma de integridad que pide Bold: SHA256(orderId + monto + moneda + llave secreta).
  // Se calcula acá (servidor), nunca en el navegador, para que el monto
  // quede bloqueado y nadie lo pueda editar desde afuera.
  var cadena = orderId + total + "COP" + secretKey;
  var digestBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, cadena);
  var signature = digestBytes.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");

  var response = {
    orderId: orderId,
    amount: String(total),
    currency: "COP",
    apiKey: publicKey,
    signature: signature
  };

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// El sitio pide esto (GET) para pintar el muro de donantes: solo los
// nombres de filas que YA marcaron Pagado (columna I) y que además
// pidieron aparecer en el muro (columna K).
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var names = [];
  for (var i = 1; i < rows.length; i++) {   // i=0 son los encabezados
    var nombre = rows[i][1];   // columna B
    var pagado = rows[i][8];   // columna I
    var muro   = rows[i][10];  // columna K
    if (nombre && pagado && muro) names.push(nombre);
  }
  return ContentService.createTextOutput(JSON.stringify(names))
    .setMimeType(ContentService.MimeType.JSON);
}
