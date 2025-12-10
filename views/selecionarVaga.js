module.exports = () => ({
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
        type: "plain_text_input",
        action_id: "vaga_input",
        placeholder: {
          type: "plain_text",
          text: "Ex: Backend Developer"
        }
      }
    }
  ]
});
