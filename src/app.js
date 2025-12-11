require("dotenv").config();
const { App } = require("@slack/bolt");
const quickinService = require("./services/quickin");
const rankingService = require("./services/ranking");
const sheetsService = require("./services/sheets");
const vagaModal = require("./views/selecionarVaga");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Comando: /rankear-cv 
app.command("/rankear-cv", async ({ ack, body, client }) => {
  await ack();

  const vagas = await quickinService.buscarVagas();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: vagaModal(vagas)
  });
});

// Selecionar vaga
app.view("selecionar_vaga", async ({ ack, body, view, client }) => {
  await ack(); 

  const selected = view.state.values?.vaga_block?.vaga_select?.selected_option;
  if (!selected) return;

  const jobId = selected.value;

  client.chat.postMessage({
    channel: body.user.id,
    text: "⏳ Iniciando análise dos currículos..."
  }).catch(console.error);

  // Processamento pesado sem bloquear o ack
  process.nextTick(async () => {
    try {
      const curriculos = await quickinService.buscarCandidatosDaVaga(jobId);
      if (!curriculos || curriculos.length === 0) {
        await client.chat.postMessage({
          channel: body.user.id,
          text: "❌ Nenhum currículo encontrado para esta vaga."
        });
        return;
      }

      const ranking = rankingService.rankear(curriculos);
      const rankingCompleto = ranking.map(r => {
        const candidato = curriculos.find(c => c._id === r.id || c.id === r.id);
        return { ...candidato, score: r.score };
      });

      await sheetsService.escreverCandidatos(rankingCompleto, selected.text.text);

      await client.chat.postMessage({
        channel: body.user.id,
        text: `✅ Análise concluída! Abra a planilha neste link: <https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}|Clique aqui>`,
      });
    } catch (err) {
      console.error(err);
      await client.chat.postMessage({
        channel: body.user.id,
        text: "❌ Ocorreu um erro durante a análise dos currículos."
      });
    }
  });
});

// Start app
(async () => {
  await app.start(3000);
  console.log("⚡ Slack App rodando na porta 3000");
})();
