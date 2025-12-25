const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

function criarPrompt(candidato, descricaoVaga) {
  const textoCurriculo = JSON.stringify(candidato);

  return `
    Você é um Recrutador Sênior especializado em avaliação de talentos.

    Sua tarefa é avaliar o grau de aderência ("fit") entre um candidato e uma vaga, considerando:
    - competências técnicas
    - experiências profissionais
    - formação
    - tempo de experiência
    - aderência ao perfil da vaga
    - requisitos obrigatórios vs. desejáveis

    ### DESCRIÇÃO DA VAGA
    ${descricaoVaga}

    ### DADOS DO CANDIDATO 
    ${textoCurriculo}

    ### INSTRUÇÕES
    1. Compare cuidadosamente o perfil do candidato com os requisitos da vaga.
    2. Atribua um score de 0 a 100, onde:
      - 0 = nenhuma aderência
      - 50 = aderência parcial
      - 100 = aderência excelente
    3. Justifique o score de forma objetiva, clara e curta (máx. 3 frases).

    ### FORMATO DE RESPOSTA (obrigatório)
    Responda **somente** com um JSON válido, sem qualquer texto adicional:

    {
      "score": number,
      "reason": "string"
    }
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
          justificativa: data.reason
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