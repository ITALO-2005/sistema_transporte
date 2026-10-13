const filaEsperaStore = require('../models/filaEsperaStore');
const pacientesStore = require('../models/pacientesStore');
const veiculosStore = require('../models/veiculosStore');

exports.listar = (_req, res) => {
  const fila = filaEsperaStore.listar().map((solicitacao) => {
    const paciente = pacientesStore.buscarPorId(solicitacao.pacienteId);
    const veiculo = veiculosStore
      .listar()
      .find((item) => item.id === solicitacao.veiculoId);

    return {
      ...solicitacao,
      pacienteNome: paciente?.nome || 'Paciente não encontrado',
      veiculoDescricao: veiculo
        ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}`
        : 'Veículo não encontrado',
      capacidade: veiculo?.capacidade || 0,
    };
  });

  return res.json(fila);
};

exports.remover = (req, res) => {
  const removida = filaEsperaStore.remover(req.params.id);

  if (!removida) {
    return res.status(404).json({ erro: 'Solicitação não encontrada na fila.' });
  }

  return res.status(204).send();
};