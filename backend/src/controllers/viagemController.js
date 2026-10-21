const viagensStore = require('../models/viagensStore');
const filaEsperaStore = require('../models/filaEsperaStore');
const pacientesStore = require('../models/pacientesStore');
const veiculosStore = require('../models/veiculosStore');
const historicoStore = require('../models/historicoStore');

function formatarData(data) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(data));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(data);
}

function formatarViagem(viagem) {
  const paciente = pacientesStore.buscarPorId(viagem.pacienteId);
  const veiculo = veiculosStore
    .listar()
    .find((item) => item.id === viagem.veiculoId);

  return {
    ...viagem,
    pacienteNome: paciente?.nome || 'Paciente não encontrado',
    veiculoDescricao: veiculo
      ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}`
      : 'Veículo não encontrado',
    capacidade: veiculo?.capacidade || 0,
  };
}

exports.listar = (_req, res) => {
  return res.json(viagensStore.listar().map(formatarViagem));
};

exports.agendar = (req, res) => {
  const pacienteId = Number(req.body.pacienteId);
  const veiculoId = Number(req.body.veiculoId);
  const passageiros = Number(req.body.passageiros);
  const { data, hora, destino, motivo } = req.body;
  const motorista =
  typeof req.body.motorista === 'string'
    ? req.body.motorista.trim()
    : '';

  if (
    !Number.isInteger(pacienteId) ||
    pacienteId <= 0 ||
    !Number.isInteger(veiculoId) ||
    veiculoId <= 0 ||
    !Number.isInteger(passageiros) ||
    passageiros < 1 ||
    !data ||
    !hora ||
    typeof destino !== 'string' ||
    !destino.trim() ||
    typeof motivo !== 'string' ||
    !motivo.trim()
  ) {
    return res.status(400).json({ erro: 'Preencha os dados da viagem corretamente.' });
  }

  const paciente = pacientesStore.buscarPorId(pacienteId);
  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado.' });
  }

  const veiculo = veiculosStore
    .listar()
    .find((item) => item.id === veiculoId);

  if (!veiculo) {
    return res.status(404).json({ erro: 'Veículo não encontrado.' });
  }

  if (veiculo.situacao !== 'Ativo') {
    return res.status(400).json({ erro: 'O veículo selecionado não está ativo.' });
  }

  if (passageiros > veiculo.capacidade) {
    return res.status(400).json({
      erro: 'O número de passageiros supera a capacidade total do veículo.',
    });
  }

  const ocupados = viagensStore.passageirosAgendados(veiculoId, data, hora);
  const vagasDisponiveis = veiculo.capacidade - ocupados;

  if (passageiros > vagasDisponiveis) {
    const solicitacao = filaEsperaStore.adicionar({
      pacienteId,
      veiculoId,
      data,
      hora,
      destino: destino.trim(),
      motivo: motivo.trim(),
      passageiros,
    });

    historicoStore.registrar({
      pacienteId,
      tipo: 'agendamento',
      descricao: `Solicitação de viagem para ${destino.trim()} em ${formatarData(data)} às ${hora} enviada à fila de espera`,
    });

    return res.status(202).json({
      status: 'fila_espera',
      mensagem: 'Não há vagas disponíveis. A solicitação foi enviada à fila de espera.',
      solicitacao,
    });
  }

  const viagem = viagensStore.criar({
    pacienteId,
    veiculoId,
    data,
    hora,
    destino: destino.trim(),
    motivo: motivo.trim(),
    passageiros,
    motorista,
  });

  historicoStore.registrar({
    pacienteId,
    tipo: 'viagem',
    descricao: `Viagem agendada para ${destino.trim()} em ${formatarData(data)} às ${hora}. Motivo: ${motivo.trim()}`,
  });

  return res.status(201).json(formatarViagem(viagem));
};