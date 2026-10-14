const pacientesStore = require('../models/pacientesStore');
const historicoStore = require('../models/historicoStore');

exports.cadastrar = (req, res) => {
  const { nome, cpf, cns, dataNascimento, sexo, telefone, endereco, bairro } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório.' });
  }

  if (cns && pacientesStore.buscarPorCns(cns)) {
    return res.status(409).json({ erro: 'Já existe um paciente cadastrado com esse CNS.' });
  }

  const paciente = pacientesStore.criar({ nome, cpf, cns, dataNascimento, sexo, telefone, endereco, bairro });

  historicoStore.registrar({
    pacienteId: paciente.id,
    tipo: 'cadastro',
    descricao: 'Paciente cadastrado no sistema',
  });

  return res.status(201).json(paciente);
};

// GET /api/pacientes             -> lista todos
// GET /api/pacientes?busca=maria -> filtra por nome, CNS ou CPF
exports.listar = (req, res) => {
  const { busca } = req.query;

  if (busca && busca.trim()) {
    return res.json(pacientesStore.buscar(busca.trim()));
  }

  return res.json(pacientesStore.listar());
};

// GET /api/pacientes/:id
exports.detalhar = (req, res) => {
  const paciente = pacientesStore.buscarPorId(req.params.id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado.' });
  }

  return res.json(paciente);
};

// GET /api/pacientes/:id/historico
exports.historico = (req, res) => {
  const paciente = pacientesStore.buscarPorId(req.params.id);

  if (!paciente) {
    return res.status(404).json({ erro: 'Paciente não encontrado.' });
  }

  return res.json(historicoStore.listarPorPaciente(paciente.id));
};