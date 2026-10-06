const veiculosStore = require('../models/veiculosStore');

exports.cadastrar = (req, res) => {
  const { placa, tipo, marca, modelo, ano, capacidade, situacao } = req.body;

  if (!placa || !tipo || !marca || !modelo || !ano || !capacidade) {
    return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  }

  if (veiculosStore.buscarPorPlaca(placa)) {
    return res.status(409).json({ erro: 'Já existe um veículo cadastrado com essa placa.' });
  }

  const veiculo = veiculosStore.criar({
    placa,
    tipo,
    marca,
    modelo,
    ano: Number(ano),
    capacidade: Number(capacidade),
    situacao: situacao || 'Ativo',
  });
  return res.status(201).json(veiculo);
};

exports.listar = (req, res) => {
  res.json(veiculosStore.listar());
};