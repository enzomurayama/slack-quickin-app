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
    }
  ]
});
