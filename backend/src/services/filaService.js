const viagensStore = require('../models/viagensStore');
const veiculosStore = require('../models/veiculosStore');
const filaEsperaStore = require('../models/filaEsperaStore');

// Vagas livres de uma saída (a capacidade do veículo menos os passageiros não cancelados)
function vagasDisponiveis(veiculoId, data, hora) {
  const veiculo = veiculosStore.listar().find((item) => item.id === Number(veiculoId));
  if (!veiculo) return 0;

  const ocupadas = viagensStore.passageirosAgendados(veiculoId, data, hora);
  return Math.max(veiculo.capacidade - ocupadas, 0);
}

// Uma saída que já começou (ou terminou) não aceita mais ninguém da fila
function saidaJaIniciada(veiculoId, data, hora) {
  return viagensStore
    .listar()
    .some(
      (viagem) =>
        viagem.veiculoId === Number(veiculoId) &&
        viagem.data === data &&
        viagem.hora === hora &&
        (viagem.status === 'Em andamento' || viagem.status === 'Concluída'),
    );
}

// Primeira solicitação da fila (por ordem de chegada) que cabe nas vagas livres da saída
function proximaElegivel(veiculoId, data, hora) {
  if (saidaJaIniciada(veiculoId, data, hora)) return null;

  const vagas = vagasDisponiveis(veiculoId, data, hora);

  return (
    filaEsperaStore
      .listar()
      .find(
        (item) =>
          item.veiculoId === Number(veiculoId) &&
          item.data === data &&
          item.hora === hora &&
          item.passageiros <= vagas,
      ) || null
  );
}

module.exports = { vagasDisponiveis, saidaJaIniciada, proximaElegivel };
