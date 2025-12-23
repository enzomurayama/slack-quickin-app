const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function criarPrompt(candidato, descricaoVaga) {
  const textoCurriculo = JSON.stringify(candidato);

  return `
    Você é um Recrutador Especialista. Analise o seguinte currículo para a vaga descrita.
    
    DESCRIÇÃO DA VAGA:
    "${descricaoVaga}"
    
    DADOS DO CANDIDATO:
    "${textoCurriculo}"
    
    Analise o "fit" (aderência) de 0 a 100.
    Retorne APENAS um JSON neste formato: {"score": number, "reason": "string"}
  `;
}

async function rankear(curriculos, descricaoVaga) {
  const resultados = [];
  
  console.log(`Iniciando análise de ${curriculos.length} currículos...`);

  for (const c of curriculos) {
      try {
        const prompt = criarPrompt(c, descricaoVaga);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json|```/g, "").trim();
        const data = JSON.parse(jsonStr);

        resultados.push({
          id: c.id || c._id,
          nome: c.nome,
          score: data.score || 0,
          justificativa: data.reason || "Analisado pelo Gemini"
        });

      } catch (error) {
        console.error(`Erro ao classificar ${c.nome}:`, error.message);
        resultados.push({
          id: c.id || c._id,
          nome: c.nome,
          score: 0, 
          justificativa: "Erro na análise IA"
        });
      }
  }

  return resultados;
}

module.exports = { rankear };