const filaEsperaStore = require('../models/filaEsperaStore');
const pacientesStore = require('../models/pacientesStore');
const veiculosStore = require('../models/veiculosStore');
const viagensStore = require('../models/viagensStore');
const historicoStore = require('../models/historicoStore');
const filaService = require('../services/filaService');

function formatarData(data) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(data));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(data);
}

exports.listar = (_req, res) => {
  const fila = filaEsperaStore.listar().map((solicitacao) => {
    const paciente = pacientesStore.buscarPorId(solicitacao.pacienteId);
    const veiculo = veiculosStore
      .listar()
      .find((item) => item.id === solicitacao.veiculoId);
    const proxima = filaService.proximaElegivel(
      solicitacao.veiculoId,
      solicitacao.data,
      solicitacao.hora,
    );

    return {
      ...solicitacao,
      pacienteNome: paciente?.nome || 'Paciente não encontrado',
      veiculoDescricao: veiculo
        ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}`
        : 'Veículo não encontrado',
      capacidade: veiculo?.capacidade || 0,
      vagasLivres: filaService.vagasDisponiveis(solicitacao.veiculoId, solicitacao.data, solicitacao.hora),
      podeAgendar: Boolean(proxima && proxima.id === solicitacao.id),
    };
  });

  return res.json(fila);
};

// POST /api/fila/:id/agendar -> passa a solicitação da fila para uma viagem agendada
exports.agendar = (req, res) => {
  const id = Number(req.params.id);
  const solicitacao = filaEsperaStore.listar().find((item) => item.id === id);

  if (!solicitacao) {
    return res.status(404).json({ erro: 'Solicitação não encontrada na fila.' });
  }

  const { veiculoId, data, hora } = solicitacao;

  if (filaService.saidaJaIniciada(veiculoId, data, hora)) {
    return res.status(409).json({ erro: 'Esta saída já foi iniciada e não aceita mais passageiros.' });
  }

  const vagas = filaService.vagasDisponiveis(veiculoId, data, hora);
  const proxima = filaService.proximaElegivel(veiculoId, data, hora);

  if (!proxima || proxima.id !== solicitacao.id) {
    const erro =
      solicitacao.passageiros > vagas
        ? `Ainda não há vagas suficientes nesta saída (${vagas} livre(s) para ${solicitacao.passageiros} passageiro(s)).`
        : 'Há uma solicitação mais antiga na fila para esta saída, que deve ser atendida primeiro.';
    return res.status(409).json({ erro });
  }

  // O motorista segue o das outras viagens da mesma saída
  const motorista =
    solicitacao.motorista ||
    viagensStore.daSaida(solicitacao).find((item) => item.motorista)?.motorista ||
    '';

  const viagem = viagensStore.criar({
    pacienteId: solicitacao.pacienteId,
    veiculoId,
    data,
    hora,
    destino: solicitacao.destino,
    motivo: solicitacao.motivo,
    passageiros: solicitacao.passageiros,
    motorista,
  });

  filaEsperaStore.remover(solicitacao.id);

  historicoStore.registrar({
    pacienteId: solicitacao.pacienteId,
    tipo: 'viagem',
    descricao: `Viagem agendada para ${solicitacao.destino} em ${formatarData(data)} às ${hora}, com vaga liberada pela fila de espera. Motivo: ${solicitacao.motivo}`,
  });

  const paciente = pacientesStore.buscarPorId(solicitacao.pacienteId);
  return res.status(201).json({
    mensagem: `${paciente?.nome || 'Paciente'} foi agendado(a) na viagem.`,
    viagem,
  });
};

exports.remover = (req, res) => {
  const removida = filaEsperaStore.remover(req.params.id);

  if (!removida) {
    return res.status(404).json({ erro: 'Solicitação não encontrada na fila.' });
  }

  return res.status(204).send();
};
