const { google } = require("googleapis");
const fs = require("fs");

const SHEET_ID = process.env.SHEET_ID;
const CREDENTIALS_PATH = process.env.GOOGLE_CREDENTIALS_JSON_PATH;

// Autenticação com service account
const auth = new google.auth.GoogleAuth({
  keyFile: CREDENTIALS_PATH,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR");
}

async function escreverCandidatos(candidatos) {
  // Transformando candidatos em array de arrays
  const values = candidatos.map(c => [
    c.nome || "",
    c.email || "",
    (c.raw?.phones || []).join(", "),
    formatDate(c.raw?.birth_date),
    c.headline || "",
    c.raw?.city || "",
    c.raw?.region || "",
    c.raw?.summary || "",
    c.score || 0
  ]);

  // Cabeçalho
  values.unshift([
    "Nome", "Email", "Telefones", "Data de Nascimento", "Headline", "Cidade", "Região", "Resumo", "Score"
  ]);

  // Determinando range
  const numLinhas = values.length;
  const numColunas = values[0].length;
  const ultimaColuna = String.fromCharCode(64 + numColunas); 
  const range = `'Candidatos'!A1:${ultimaColuna}${numLinhas}`;

  // Atualizando valores
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: "RAW",
    resource: { values }
  });

  console.log("✅ Dados enviados para o Google Sheets!");

  // Auto-ajustar a largura de todas as colunas
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: 0,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: numColunas
            }
          }
        }
      ]
    }
  });
}

module.exports = { escreverCandidatos };
