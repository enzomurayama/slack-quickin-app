// services/quickin.js
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
  return resp.data; 
}

async function buscarCandidatosDaVaga(vagaId) {
  const resp = await api.get(`/accounts/${ACCOUNT_ID}/jobs/${vagaId}/candidates`);
  return resp.data;
}

module.exports = {
  buscarVagas,
  buscarCandidatosDaVaga
};
