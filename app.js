require("dotenv").config();
const { App } = require("@slack/bolt");
const quickinService = require("./services/quickin");
const rankingService = require("./services/ranking");
const sheetsService = require("./services/sheets");
const vagaModal = require("./views/selecionarVaga");
const homeRankingView = require("./views/homeRanking");

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
  if (!selected) {
    await client.chat.postMessage({
      channel: body.user.id,
      text: "❌ Erro ao identificar a vaga selecionada."
    });
    return;
  }

  const jobId = selected.value;
  const vagaNome = selected.text.text;

  await client.chat.postMessage({
    channel: body.user.id,
    text: "⏳ Iniciando análise dos currículos..."
  });

  // Buscar candidatos
  const curriculos = await quickinService.buscarCandidatosDaVaga(jobId);

  if (!curriculos || curriculos.length === 0) {
    await client.chat.postMessage({
      channel: body.user.id,
      text: "❌ Nenhum currículo encontrado para esta vaga."
    });
    return;
  }

  // Rankear candidatos
  const ranking = rankingService.rankear(curriculos);

  const rankingCompleto = ranking.map(r => {
    const candidato = curriculos.find(c => c._id === r.id || c.id === r.id);
    return {
      ...candidato,
      score: r.score
    };
  });

  console.log(JSON.stringify(rankingCompleto, null, 2));
  
  // Enviar para Google Sheets
  await sheetsService.escreverCandidatos(rankingCompleto);

  // Publicar ranking na Home
  await client.views.publish({
    user_id: body.user.id,
    view: homeRankingView({
      vaga: vagaNome,
      ranking,
      page: 1,
      private_metadata: JSON.stringify({ ranking, vaga: vagaNome }) 
    })
  });

  await client.chat.postMessage({
    channel: body.user.id,
    text: "✅ Análise concluída! Os resultados estão na aba *Home* do app."
  });
});

// Paginação - página anterior
app.action("prev_page", async ({ ack, body, client }) => {
  await ack();

  const metadata = JSON.parse(body.view.private_metadata || "{}");
  const ranking = metadata.ranking || [];
  const vaga = metadata.vaga || "";

  const page = Math.max(parseInt(body.actions[0].value), 1);

  await client.views.publish({
    user_id: body.user.id,
    view: homeRankingView({ vaga, ranking, page, private_metadata: body.view.private_metadata })
  });
});

// Paginação - próxima página
app.action("next_page", async ({ ack, body, client }) => {
  await ack();

  const metadata = JSON.parse(body.view.private_metadata || "{}");
  const ranking = metadata.ranking || [];
  const vaga = metadata.vaga || "";

  const page = parseInt(body.actions[0].value);

  await client.views.publish({
    user_id: body.user.id,
    view: homeRankingView({ vaga, ranking, page, private_metadata: body.view.private_metadata })
  });
});

// Start app
(async () => {
  await app.start(3000);
  console.log("⚡ Slack App rodando na porta 3000");
})();
