let viagens = [];
let proximoId = 1;

function listar() {
  return [...viagens];
}

function buscarPorId(id) {
  return viagens.find((viagem) => viagem.id === Number(id));
}

// Conta só os passageiros de viagens que NÃO foram canceladas
function passageirosAgendados(veiculoId, data, hora) {
  return viagens
    .filter(
      (viagem) =>
        viagem.veiculoId === Number(veiculoId) &&
        viagem.data === data &&
        viagem.hora === hora &&
        viagem.status !== 'Cancelada',
    )
    .reduce((total, viagem) => total + viagem.passageiros, 0);
}

// Viagens da mesma saída (mesmo veículo, data e horário), sem as canceladas
function daSaida(viagem) {
  return viagens.filter(
    (item) =>
      item.veiculoId === viagem.veiculoId &&
      item.data === viagem.data &&
      item.hora === viagem.hora &&
      item.status !== 'Cancelada',
  );
}

function criar(dados) {
  const viagem = {
    id: proximoId++,
    ...dados,
    status: 'Agendada',
    createdAt: new Date().toISOString(),
  };

  viagens.unshift(viagem);
  return viagem;
}

function atualizarStatus(viagem, status) {
  viagem.status = status;
  viagem.statusAtualizadoEm = new Date().toISOString();
  return viagem;
}

module.exports = { listar, buscarPorId, passageirosAgendados, daSaida, criar, atualizarStatus };
