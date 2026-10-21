const viagensStore = require('../models/viagensStore');
const pacientesStore = require('../models/pacientesStore');
const veiculosStore = require('../models/veiculosStore');
const registrosViagemStore = require('../models/registrosViagemStore');

function montarItem(viagem) {
  const paciente = pacientesStore.buscarPorId(viagem.pacienteId);
  const veiculo = veiculosStore.listar().find((v) => v.id === viagem.veiculoId);
  const registro = registrosViagemStore.buscarPorViagem(viagem.id);

  return {
    viagemId: viagem.id,
    data: viagem.data,
    hora: viagem.hora,
    destino: viagem.destino,
    motorista: viagem.motorista || '',
    pacienteNome: paciente?.nome || 'Paciente não encontrado',
    veiculoDescricao: veiculo
      ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}`
      : 'Veículo não encontrado',
    kmInicial: registro ? registro.kmInicial : null,
    kmInicialRegistradoEm: registro ? registro.kmInicialRegistradoEm : null,
  };
}

// GET /api/quilometragem -> viagens com a situação da quilometragem
exports.listar = (_req, res) => {
  const itens = viagensStore
    .listar()
    .map(montarItem)
    .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));

  return res.json(itens);
};

// POST /api/quilometragem/:viagemId/inicial  { kmInicial }
exports.registrarInicial = (req, res) => {
  const viagemId = Number(req.params.viagemId);
  const bruto = req.body.kmInicial;
  const kmInicial = Number(bruto);

  if (
    bruto === undefined ||
    bruto === null ||
    String(bruto).trim() === '' ||
    !Number.isInteger(kmInicial) ||
    kmInicial < 0
  ) {
    return res.status(400).json({
      erro: 'Informe a quilometragem inicial como número inteiro, maior ou igual a zero.',
    });
  }

  const viagem = viagensStore.listar().find((v) => Number(v.id) === viagemId);
  if (!viagem) {
    return res.status(404).json({ erro: 'Viagem não encontrada.' });
  }

  if (registrosViagemStore.buscarPorViagem(viagem.id)) {
    return res.status(409).json({ erro: 'A quilometragem inicial desta viagem já foi registrada.' });
  }

  const maiorLeitura = registrosViagemStore.maiorLeituraDoVeiculo(viagem.veiculoId);
  if (maiorLeitura !== null && kmInicial < maiorLeitura) {
    return res.status(400).json({
      erro: `A quilometragem não pode ser menor que a última registrada para este veículo (${maiorLeitura} km).`,
    });
  }

  registrosViagemStore.registrarKmInicial({
    viagemId: viagem.id,
    veiculoId: viagem.veiculoId,
    kmInicial,
  });

  return res.status(201).json(montarItem(viagem));
};