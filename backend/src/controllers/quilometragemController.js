const viagensStore = require('../models/viagensStore');
const pacientesStore = require('../models/pacientesStore');
const veiculosStore = require('../models/veiculosStore');
const registrosViagemStore = require('../models/registrosViagemStore');

// Converte o valor recebido em inteiro >= 0; devolve null se for inválido
function lerKm(bruto) {
  if (bruto === undefined || bruto === null || String(bruto).trim() === '') return null;
  const km = Number(bruto);
  return Number.isInteger(km) && km >= 0 ? km : null;
}

function montarItem(viagem) {
  const paciente = pacientesStore.buscarPorId(viagem.pacienteId);
  const veiculo = veiculosStore.listar().find((v) => v.id === viagem.veiculoId);
  const registro = registrosViagemStore.buscarPorSaida(viagem);

  const kmInicial = registro ? registro.kmInicial : null;
  const kmFinal = registro ? registro.kmFinal : null;

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
    kmInicial,
    kmFinal,
    kmPercorrido: kmInicial !== null && kmFinal !== null ? kmFinal - kmInicial : null,
  };
}

// GET /api/quilometragem -> viagens com a situação da quilometragem
exports.listar = (_req, res) => {
  const itens = viagensStore
    .listar()
    .filter((viagem) => viagem.status !== 'Cancelada')
    .map(montarItem)
    .sort((a, b) => `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`));

  return res.json(itens);
};

// POST /api/quilometragem/:viagemId/inicial  { kmInicial }
// O valor vale para a saída inteira (mesmo veículo, data e horário).
exports.registrarInicial = (req, res) => {
  const viagemId = Number(req.params.viagemId);
  const kmInicial = lerKm(req.body.kmInicial);

  if (kmInicial === null) {
    return res.status(400).json({
      erro: 'Informe a quilometragem inicial como número inteiro, maior ou igual a zero.',
    });
  }

  const viagem = viagensStore.listar().find((v) => Number(v.id) === viagemId);
  if (!viagem) {
    return res.status(404).json({ erro: 'Viagem não encontrada.' });
  }

  if (viagem.status === 'Cancelada') {
    return res.status(409).json({ erro: 'Esta viagem foi cancelada.' });
  }

  if (registrosViagemStore.buscarPorSaida(viagem)) {
    return res.status(409).json({ erro: 'A quilometragem inicial desta saída já foi registrada.' });
  }

  const maiorLeitura = registrosViagemStore.maiorLeituraDoVeiculo(viagem.veiculoId, viagem);
  if (maiorLeitura !== null && kmInicial < maiorLeitura) {
    return res.status(400).json({
      erro: `A quilometragem não pode ser menor que a última registrada para este veículo (${maiorLeitura} km).`,
    });
  }

  registrosViagemStore.registrarKmInicial(viagem, kmInicial);

  return res.status(201).json(montarItem(viagem));
};

// POST /api/quilometragem/:viagemId/final  { kmFinal }
// Só depois do km inicial, e nunca menor que ele.
exports.registrarFinal = (req, res) => {
  const viagemId = Number(req.params.viagemId);
  const kmFinal = lerKm(req.body.kmFinal);

  if (kmFinal === null) {
    return res.status(400).json({
      erro: 'Informe a quilometragem final como número inteiro, maior ou igual a zero.',
    });
  }

  const viagem = viagensStore.listar().find((v) => Number(v.id) === viagemId);
  if (!viagem) {
    return res.status(404).json({ erro: 'Viagem não encontrada.' });
  }

  if (viagem.status === 'Cancelada') {
    return res.status(409).json({ erro: 'Esta viagem foi cancelada.' });
  }

  const registro = registrosViagemStore.buscarPorSaida(viagem);
  if (!registro) {
    return res.status(409).json({ erro: 'Registre antes a quilometragem inicial desta saída.' });
  }

  if (registro.kmFinal !== null) {
    return res.status(409).json({ erro: 'A quilometragem final desta saída já foi registrada.' });
  }

  if (kmFinal < registro.kmInicial) {
    return res.status(400).json({
      erro: `A quilometragem final não pode ser menor que a inicial (${registro.kmInicial} km).`,
    });
  }

  registrosViagemStore.registrarKmFinal(viagem, kmFinal);

  return res.status(201).json(montarItem(viagem));
};