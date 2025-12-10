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

/**
 * Slash command: /rankear-cv
 */
app.command("/rankear-cv", async ({ ack, body, client }) => {
  await ack();

  await client.views.open({
    trigger_id: body.trigger_id,
    view: vagaModal()
  });
});

/**
 * Submissão do modal
 */
app.view("selecionar_vaga", async ({ ack, body, view, client }) => {
  await ack();

  const vaga = view.state.values.vaga_block.vaga_input.value;

  const curriculos = await quickinService.buscarCurriculos(vaga);
  const ranking = rankingService.rankear(curriculos);

  // Publicação dos resultados no início do app
  await client.views.publish({
    user_id: body.user.id,
    view: homeRankingView({
      vaga,
      ranking
    })
  });

  // Mensagem de sucesso
await client.chat.postMessage({
  channel: body.user.id,
  blocks: [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "✅ *Rankeamento concluído com sucesso!*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Os resultados estão disponíveis na aba *Home* do app."
      },
    }
  ]
});
});

(async () => {
  await app.start(3000);
  console.log("⚡ Slack App rodando na porta 3000");
})();
