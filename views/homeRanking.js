module.exports = ({ vaga, ranking }) => {
  return {
    type: "home",
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📊 Ranking de Currículos`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Vaga:* ${vaga}`
        }
      },
      { type: "divider" },

      ...ranking.map((candidato, index) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${index + 1}. ${candidato.nome}*\nScore: *${candidato.score}*`
        }
      }))
    ]
  };
};
