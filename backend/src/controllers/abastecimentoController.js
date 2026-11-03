const viagensStore = require('../models/viagensStore');
const veiculosStore = require('../models/veiculosStore');
const registrosViagemStore = require('../models/registrosViagemStore');
const abastecimentosStore = require('../models/abastecimentosStore');

const COMBUSTIVEIS = ['Gasolina comum', 'Etanol', 'Diesel comum', 'Diesel S10', 'GNV'];
const LITROS_MAXIMO = 500;
const VALOR_MAXIMO = 50000;

// Aceita "45,50" ou "45.50"; devolve null se não for um número válido
function lerDecimal(bruto) {
  if (bruto === undefined || bruto === null) return null;
  const texto = String(bruto).trim().replace(',', '.');
  if (texto === '') return null;
  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : null;
}

function descricaoDoVeiculo(veiculoId) {
  const veiculo = veiculosStore.listar().find((v) => v.id === veiculoId);
  return veiculo ? `${veiculo.marca} ${veiculo.modelo} — ${veiculo.placa}` : 'Veículo não encontrado';
}

function montarItem(a) {
  return {
    ...a,
    veiculoDescricao: descricaoDoVeiculo(a.veiculoId),
    precoLitro: Math.round((a.valorTotal / a.litros) * 100) / 100,
  };
}

// GET /api/abastecimentos/saidas -> saídas (veículo + data + horário) que podem receber abastecimento
exports.saidas = (_req, res) => {
  const grupos = new Map();

  viagensStore.listar().filter((viagem) => viagem.status !== 'Cancelada').forEach((viagem) => {
    const chave = `${viagem.veiculoId}|${viagem.data}|${viagem.hora}`;
    if (!grupos.has(chave)) {
      grupos.set(chave, {
        viagemId: viagem.id,
        veiculoId: viagem.veiculoId,
        veiculoDescricao: descricaoDoVeiculo(viagem.veiculoId),
        data: viagem.data,
        hora: viagem.hora,
        destino: viagem.destino,
        motorista: viagem.motorista || '',
      });
    }
  });

  const lista = [...grupos.values()].sort((a, b) =>
    `${a.data} ${a.hora}`.localeCompare(`${b.data} ${b.hora}`),
  );
  return res.json(lista);
};

// GET /api/abastecimentos
exports.listar = (_req, res) => {
  return res.json(abastecimentosStore.listar().map(montarItem));
};

// POST /api/abastecimentos  { viagemId, combustivel, litros, valorTotal, kmAbastecimento?, posto? }
exports.registrar = (req, res) => {
  const viagemId = Number(req.body.viagemId);
  const { combustivel } = req.body;
  const litros = lerDecimal(req.body.litros);
  const valorTotal = lerDecimal(req.body.valorTotal);
  const posto = typeof req.body.posto === 'string' ? req.body.posto.trim() : '';

  const viagem = viagensStore.listar().find((v) => Number(v.id) === viagemId);
  if (!viagem) {
    return res.status(404).json({ erro: 'Selecione uma saída válida.' });
  }

  if (viagem.status === 'Cancelada') {
    return res.status(409).json({ erro: 'Esta viagem foi cancelada.' });
  }

  if (!COMBUSTIVEIS.includes(combustivel)) {
    return res.status(400).json({ erro: 'Selecione o tipo de combustível.' });
  }

  if (litros === null || litros <= 0 || litros > LITROS_MAXIMO) {
    return res.status(400).json({ erro: `Informe os litros (maior que zero e até ${LITROS_MAXIMO}).` });
  }

  if (valorTotal === null || valorTotal <= 0 || valorTotal > VALOR_MAXIMO) {
    return res.status(400).json({ erro: 'Informe o valor total pago, em reais, maior que zero.' });
  }

  if (posto.length > 80) {
    return res.status(400).json({ erro: 'O nome do posto deve ter no máximo 80 caracteres.' });
  }

  // Quilometragem no momento do abastecimento (opcional)
  let kmAbastecimento = null;
  const kmBruto = req.body.kmAbastecimento;
  if (kmBruto !== undefined && kmBruto !== null && String(kmBruto).trim() !== '') {
    kmAbastecimento = Number(kmBruto);
    if (!Number.isInteger(kmAbastecimento) || kmAbastecimento < 0) {
      return res.status(400).json({ erro: 'A quilometragem deve ser um número inteiro, maior ou igual a zero.' });
    }

    const registro = registrosViagemStore.buscarPorSaida(viagem);
    if (registro && kmAbastecimento < registro.kmInicial) {
      return res.status(400).json({
        erro: `A quilometragem não pode ser menor que a inicial desta saída (${registro.kmInicial} km).`,
      });
    }
    if (registro && registro.kmFinal !== null && kmAbastecimento > registro.kmFinal) {
      return res.status(400).json({
        erro: `A quilometragem não pode ser maior que a final desta saída (${registro.kmFinal} km).`,
      });
    }
  }

  const abastecimento = abastecimentosStore.criar({
    viagemId: viagem.id,
    veiculoId: viagem.veiculoId,
    data: viagem.data,
    hora: viagem.hora,
    destino: viagem.destino,
    combustivel,
    litros: Math.round(litros * 100) / 100,
    valorTotal: Math.round(valorTotal * 100) / 100,
    kmAbastecimento,
    posto,
  });

  return res.status(201).json(montarItem(abastecimento));
};
