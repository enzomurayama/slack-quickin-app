require("dotenv").config();
const axios = require("axios");

const QUICKIN_BASE = process.env.QUICKIN_API_URL;
const ACCOUNT_ID = process.env.QUICKIN_ACCOUNT_ID; 
const TOKEN = process.env.QUICKIN_API_TOKEN;

const api = axios.create({
  baseURL: QUICKIN_BASE,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json"
  }
});

async function buscarVagas() {
  const resp = await api.get(`/accounts/${ACCOUNT_ID}/jobs?status=open`);
  return resp.data?.docs ?? [];
}

async function buscarCandidatosDaVaga(jobId) {
  let page = 1;
  let allCandidates = [];
  let totalPages = 1;

  do {
    try {
      const resp = await api.get(`/accounts/${ACCOUNT_ID}/candidates`, {
        params: { job_id: jobId, page }
      });

      const { docs, pages } = resp.data;
      allCandidates.push(...docs);
      totalPages = pages;
      page++;

      // Pausa de 500ms entre as páginas para não estourar o rate limit
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      if (err.response?.status === 429) {
        console.log("Rate limit atingido, aguardando 2s...");
        await new Promise(r => setTimeout(r, 2000));
      } else {
        throw err;
      }
    }
  } while (page <= totalPages);

  return allCandidates.map((c) => ({
    id: c._id,
    nome: c.name,
    email: c.email,
    headline: c.headline,
    cidade: c.city,
    experienciaAtual: c.experiences?.find(e => e.current_job)?.position || null,
    raw: c
  }));
}

module.exports = {
  buscarVagas,
  buscarCandidatosDaVaga
};
