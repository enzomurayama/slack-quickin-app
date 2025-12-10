const axios = require("axios");

async function buscarCurriculos(vaga) {
  // MOCK enquanto não integra de verdade
  return [
    {
      id: "CAND_001",
      nome: "Candidato 1",
      experiencia: "3 anos com Node.js e APIs REST",
      formacao: "Bacharel em Ciência da Computação"
    },
    {
      id: "CAND_002",
      nome: "Candidato 2",
      experiencia: "5 anos com Java e Spring",
      formacao: "Engenharia de Software"
    }
  ];

  /**
   * REAL (exemplo)
   *
   * const response = await axios.get(
   *   `${process.env.QUICKIN_API_URL}/curriculos?vaga=${vaga}`,
   *   { headers: { Authorization: `Bearer ${process.env.QUICKIN_API_TOKEN}` } }
   * );
   *
   * return response.data;
   */
}

module.exports = { buscarCurriculos };
