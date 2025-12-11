module.exports = (vagas) => ({
  type: "modal",
  callback_id: "selecionar_vaga",
  title: {
    type: "plain_text",
    text: "Rankear Currículos"
  },
  submit: {
    type: "plain_text",
    text: "Iniciar"
  },
  close: {
    type: "plain_text",
    text: "Cancelar"
  },
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Análise de Currículos",
        emoji: true
      }
    },

    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Selecione abaixo a vaga e defina quantos candidatos deseja exportar para o relatório."
      }
    },

    {
      type: "divider"
    },

    // Seleção da vaga
    {
      type: "input",
      block_id: "vaga_block",
      label: {
        type: "plain_text",
        text: "Vaga"
      },
      element: {
        type: "static_select",
        action_id: "vaga_select",
        placeholder: {
          type: "plain_text",
          text: "Selecione uma vaga"
        },
        options: vagas.map(vaga => ({
          text: {
            type: "plain_text",
            text: vaga.title
          },
          value: vaga.id
        }))
      }
    },

    // Entrada do número de candidatos
    {
      type: "input",
      block_id: "num_candidatos_block",
      label: {
        type: "plain_text",
        text: "Quantidade de candidatos a exportar"
      },
      element: {
        type: "plain_text_input",
        action_id: "num_candidatos",
        placeholder: {
          type: "plain_text",
          text: "Ex: 10"
        }
      },
      hint: {
        type: "plain_text",
        text: "Digite um número (ex.: 5, 10, 20). Deixe vazio para exportar todos."
      }
    },

    {
      type: "divider"
    },

    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "⚡ A análise pode levar alguns instantes dependendo da quantidade de candidatos."
        }
      ]
    }
  ]
});
