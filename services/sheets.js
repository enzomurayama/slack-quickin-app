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
    c.score || 0,
    c.nome || "",
    c.email || "",
    (c.raw?.phones || []).join(", "),
    formatDate(c.raw?.birth_date),
    c.headline || "",
    c.raw?.city || "",
    c.raw?.region || "",
    c.raw?.summary || "",
  ]);

  // Cabeçalho
  values.unshift([
    "Score", "Nome", "Email", "Telefones", "Data de Nascimento", "Headline", "Cidade", "Região", "Resumo"
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

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
        requests: [
        // Auto-ajustar largura das colunas
        {
            autoResizeDimensions: {
            dimensions: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 0,
                endIndex: numColunas
            }
            }
        },
        // Altura fixa das linhas
        {
            updateDimensionProperties: {
            range: {
                sheetId: 0,
                dimension: "ROWS",
                startIndex: 0,
                endIndex: numLinhas
            },
            properties: {
                pixelSize: 30
            },
            fields: "pixelSize"
            }
        },
        // Centralizar verticalmente todas as células
        {
            repeatCell: {
            range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: numLinhas,
                startColumnIndex: 0,
                endColumnIndex: numColunas
            },
            cell: {
                userEnteredFormat: {
                verticalAlignment: "MIDDLE"
                }
            },
            fields: "userEnteredFormat.verticalAlignment"
            }
        },
        // Limitar largura da coluna de data
        {
            updateDimensionProperties: {
                range: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 4,
                endIndex: 5
                },
                properties: {
                pixelSize: 200 
                },
                fields: "pixelSize"
            }
        },
        // Limitar largura da coluna de resumo
        {
            updateDimensionProperties: {
            range: {
                sheetId: 0,
                dimension: "COLUMNS",
                startIndex: 8,
                endIndex: 9
            },
            properties: {
                pixelSize: 600 
            },
            fields: "pixelSize"
            }
        },
        // Wrap e alinhamento vertical na coluna
        {
            repeatCell: {
                range: {
                    sheetId: 0,
                    startRowIndex: 1,
                    endRowIndex: numLinhas,
                    startColumnIndex: 8,
                    endColumnIndex: 9
                },
                cell: {
                    userEnteredFormat: {
                        wrapStrategy: "WRAP",
                        verticalAlignment: "TOP"
                    }
                },
                fields: "userEnteredFormat(wrapStrategy, verticalAlignment)"
            }
        },
        // Alterar cor de fundo do cabeçalho (linha 1)
        {
            repeatCell: {
            range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: numColunas
            },
            cell: {
                userEnteredFormat: {
                backgroundColor: {
                    red: 0.9,
                    green: 0.9,
                    blue: 0.9
                },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
                textFormat: {
                    bold: true
                }
                }
            },
            fields: "userEnteredFormat(backgroundColor, horizontalAlignment, verticalAlignment, textFormat)"
            }
        }
        ]
    }
    });
}

module.exports = { escreverCandidatos };
