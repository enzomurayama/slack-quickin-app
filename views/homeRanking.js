module.exports = ({ vaga, ranking, page = 1, pageSize = 20 }) => {
  const totalPages = Math.ceil(ranking.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageRanking = ranking.slice(startIndex, startIndex + pageSize);

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: `📊 Ranking de Currículos` }
    },
    {
      type: "section",
      text: { type: "mrkdwn", text: `*Vaga:* ${vaga}` }
    },
    { type: "divider" },
    ...pageRanking.map((candidato, index) => ({
      type: "section",
      text: { type: "mrkdwn", text: `*${startIndex + index + 1}. ${candidato.nome}*\nScore: *${candidato.score}*` }
    })),
  ];

  // Navegação
  if (totalPages > 1) {
    const elements = [];
    if (page > 1) {
      elements.push({
        type: "button",
        text: { type: "plain_text", text: "⬅️ Anterior" },
        value: String(page - 1),
        action_id: "prev_page",
        style: "primary"
      });
    }
    if (page < totalPages) {
      elements.push({
        type: "button",
        text: { type: "plain_text", text: "Próximo ➡️" },
        value: String(page + 1),
        action_id: "next_page",
        style: "primary"
      });
    }
    blocks.push({ type: "actions", elements });
  }

  return { type: "home", blocks };
};
