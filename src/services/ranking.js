function rankear(curriculos) {
  return curriculos.map(c => ({
    id: c.id,
    nome: c.nome,
    score: Math.floor(Math.random() * 101) 
  }));
}

module.exports = { rankear };
