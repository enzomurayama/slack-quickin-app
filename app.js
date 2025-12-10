require("dotenv").config();
const { App } = require("@slack/bolt");
const quickinService = require("./services/quickin");
const rankingService = require("./services/ranking");
const vagaModal = require("./views/selecionarVaga");
const homeRankingView = require("./views/homeRanking");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.command("/rankear-cv", async ({ ack, body, client }) => {
  await ack();

  const vagas = await quickinService.buscarVagas();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: vagaModal(vagas)
  });
});


app.view("selecionar_vaga", async ({ ack, body, view, client }) => {
  await ack();

  const selected = view.state.values?.vaga_block?.vaga_select?.selected_option;

  if (!selected) {
    await client.chat.postMessage({
      channel: body.user.id,
      text: "Erro ao identificar a vaga selecionada."
    });
    return;
  }

  const jobId = selected.value;
  const vagaNome = selected.text.text;

  await client.chat.postMessage({
    channel: body.user.id,
    text: "⏳ Iniciando análise dos currículos..."
  });

  const curriculos = await quickinService.buscarCandidatosDaVaga(jobId);

  const ranking = rankingService.rankear(curriculos);

  await client.views.publish({
    user_id: body.user.id,
    view: homeRankingView({
      vaga: vagaNome,
      ranking
    })
  });

  await client.chat.postMessage({
    channel: body.user.id,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "✅ *Análise concluída com sucesso!*"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Os resultados já estão disponíveis na aba *Home* do app."
        }
      },
    ]
  });
});


(async () => {
  await app.start(3000);
  console.log("⚡ Slack App rodando na porta 3000");
})();
