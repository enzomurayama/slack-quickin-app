function rankear(curriculos) {
  return curriculos.map((c, index) => ({
    id: c.id,
    nome: c.nome,
    score: 80 - index * 10
  }));
}

module.exports = { rankear };

