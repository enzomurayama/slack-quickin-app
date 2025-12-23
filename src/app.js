require("dotenv").config();
const { App } = require("@slack/bolt");
const quickinService = require("./services/quickin");
const rankingService = require("./services/ranking");
const sheetsService = require("./services/sheets");
const vagaModal = require("./views/selecionarVaga");

// Função para alterar a cor do score na planilha
function getColor(score) {
  if (score < 50) return "red";
  if (score < 80) return "yellow";
  return "green";
}

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// Comando: /clean-home
app.command("/clean-home", async ({ ack, body, client }) => {
  await ack();

  try {
    await client.views.publish({
      user_id: body.user_id,
      view: { type: "home", blocks: [] }
    });
  } catch (err) {
    console.error(err);
  }
});

// Comando: /rankear-cv
app.command("/rankear-cv", async ({ ack, body, client }) => {
  await ack();

  const placeholder = await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: "modal",
      callback_id: "carregando_vagas",
      title: { type: "plain_text", text: "Carregando vagas..." },
      blocks: [
        {
          type: "section",
          text: { type: "mrkdwn", text: "⏳ *Buscando vagas no Quickin...*\nAguarde um momento." }
        }
      ]
    }
  });

  process.nextTick(async () => {
    const vagas = await quickinService.buscarVagas();

    await client.views.update({
      view_id: placeholder.view.id,
      view: vagaModal(vagas)
    });
  });
});

// Atualiza Home Tab
async function atualizarHomeTab(client, userId, status, linkPlanilha = null) {
  const blocks = [];

  blocks.push({
    type: "header",
    text: { type: "plain_text", text: "Dashboard de Análise", emoji: true }
  });

  blocks.push({ type: "divider" });

  if (status === "iniciando") {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*Iniciando análise dos currículos...*\n\n" +
          "Estamos processando os dados e aplicando o modelo de ranqueamento.\n\n" +
          "Isso deve levar apenas alguns instantes."
      }
    });
  } else if (status === "concluido") {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*Análise concluída com sucesso!*\n\n" +
          "Os currículos foram avaliados, ranqueados e exportados conforme solicitado.\n" +
          "Você pode acessar o resultado completo abaixo:"
      }
    });

    if (linkPlanilha) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "📁 Abrir Planilha de Resultados", emoji: true },
            url: linkPlanilha,
            style: "primary"
          }
        ]
      });
    }

    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text:
            "🕒 *Última atualização:* <!date^" +
            Math.floor(Date.now() / 1000) +
            "^{date_short_pretty} às {time}|Agora>"
        }
      ]
    });
  }

  await client.views.publish({
    user_id: userId,
    view: { type: "home", blocks }
  });
}


// Seleção da vaga
app.view("selecionar_vaga", async ({ ack, body, view, client }) => {
  const selected = view.state.values?.vaga_block?.vaga_select?.selected_option;
  const numCandidatosInput = view.state.values?.num_candidatos_block?.num_candidatos?.value;

  let errors = {};

  // Validação do campo numérico
  if (numCandidatosInput && numCandidatosInput.trim() !== "") {
    const num = Number(numCandidatosInput);

    if (isNaN(num)) {
      errors["num_candidatos_block"] = "Digite apenas números.";
    } else if (num <= 0) {
      errors["num_candidatos_block"] = "O número deve ser maior que zero.";
    } else if (num > 9999) {
      errors["num_candidatos_block"] = "Número muito alto. Insira um valor menor que 10000.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return await ack({
      response_action: "errors",
      errors
    });
  }

  await ack(); 

  const numCandidatos = numCandidatosInput ? Number(numCandidatosInput) : null;
  const jobId = selected.value;

  process.nextTick(async () => {
    try {
      await atualizarHomeTab(client, body.user.id, "iniciando");

      const curriculos = await quickinService.buscarCandidatosDaVaga(jobId);

      if (!curriculos || curriculos.length === 0) {
        console.log("Nenhum currículo encontrado.");
        await atualizarHomeTab(client, body.user.id, "concluido", null);
        return;
      }

      const curriculosLimitados = curriculos.slice(0, 1);

      // Rankear
      const ranking = await rankingService.rankear(curriculosLimitados, selected.value);

      if (!ranking || !Array.isArray(ranking)) {
        console.error("Erro: Ranking retornou inválido");
        await atualizarHomeTab(client, body.user.id, "concluido", null);
        return;
      }

      ranking.sort((a, b) => b.score - a.score);

      // Filtrar por número de candidatos
      const rankingLimitado = numCandidatos
        ? ranking.slice(0, numCandidatos)
        : ranking;

      // Montar dados completos
      const rankingCompleto = rankingLimitado.map(r => {
        const candidato = curriculos.find(c => c._id === r.id || c.id === r.id);
        return { 
          ...candidato, 
          score: r.score,
          cor: getColor(r.score)
        };
      });

      // Exportar para o Sheets
      await sheetsService.limparAba(selected.text.text);
      await sheetsService.escreverCandidatos(rankingCompleto, selected.text.text);

      const linkPlanilha = `https://docs.google.com/spreadsheets/d/${process.env.SHEET_ID}`;

      await atualizarHomeTab(client, body.user.id, "concluido", linkPlanilha);

    } catch (err) {
      console.error(err);
      await atualizarHomeTab(client, body.user.id, "concluido", null);
    }
  });
});

// Start
(async () => {
  await app.start(3000);
  console.log("⚡ HireLens Slack App rodando na porta 3000");
})();
