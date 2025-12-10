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
  const resp = await api.get(
    `/accounts/${ACCOUNT_ID}/candidates`,
    { params: { job_id: jobId } }
  );

  const docs = resp.data?.docs || [];

  return docs.map((c) => ({
    id: c._id,
    nome: c.name,
    email: c.email,
    headline: c.headline,
    cidade: c.city,
    experienciaAtual:
      c.experiences?.find(e => e.current_job)?.position || null,
    raw: c
  }));
}


module.exports = {
  buscarVagas,
  buscarCandidatosDaVaga
};
