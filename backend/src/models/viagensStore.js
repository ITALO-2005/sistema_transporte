let viagens = [];
let proximoId = 1;

function listar() {
  return [...viagens];
}

function passageirosAgendados(veiculoId, data, hora) {
  return viagens
    .filter(
      (viagem) =>
        viagem.veiculoId === Number(veiculoId) &&
        viagem.data === data &&
        viagem.hora === hora,
    )
    .reduce((total, viagem) => total + viagem.passageiros, 0);
}

function criar(dados) {
  const viagem = {
    id: proximoId++,
    ...dados,
    createdAt: new Date().toISOString(),
  };

  viagens.unshift(viagem);
  return viagem;
}

module.exports = { listar, passageirosAgendados, criar };