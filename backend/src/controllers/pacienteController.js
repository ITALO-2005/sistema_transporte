const pacientesStore = require('../models/pacientesStore');

exports.cadastrar = (req, res) => {
  const { nome, cpf, cns, dataNascimento, sexo, telefone, endereco, bairro } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  if (cns && pacientesStore.buscarPorCns(cns)) {
    return res.status(409).json({ erro: 'Já existe um paciente cadastrado com esse CNS.' });
  }

  const paciente = pacientesStore.criar({ nome, cpf, cns, dataNascimento, sexo, telefone, endereco, bairro });
  return res.status(201).json(paciente);
};

exports.listar = (req, res) => {
  res.json(pacientesStore.listar());
};