const request = require('supertest');

// Cada teste começa com o sistema "zerado": os dados ficam em memória,
// então recarregar os módulos apaga tudo o que foi cadastrado antes.
function novoApp() {
  jest.resetModules();
  return require('../src/app');
}

async function criarPaciente(app, nome, cns, extra = {}) {
  const resposta = await request(app).post('/api/pacientes').send({ nome, cns, ...extra });
  return resposta.body;
}

async function criarVeiculo(app, placa, capacidade, situacao = 'Ativo') {
  const resposta = await request(app).post('/api/veiculos').send({
    placa, tipo: 'Van', marca: 'Fiat', modelo: 'Ducato', ano: 2023, capacidade, situacao,
  });
  return resposta.body;
}

// Agenda uma viagem na saída padrão (mesmo veículo, data e horário)
function agendar(app, pacienteId, veiculoId, passageiros, extra = {}) {
  return request(app).post('/api/viagens').send({
    pacienteId, veiculoId, passageiros,
    data: '2026-12-01', hora: '05:30', destino: 'Hospital de Teste', motivo: 'Consulta', motorista: 'Motorista Teste',
    ...extra,
  });
}

function mudarStatus(app, viagemId, status) {
  return request(app).patch(`/api/viagens/${viagemId}/status`).send({ status });
}

module.exports = { request, novoApp, criarPaciente, criarVeiculo, agendar, mudarStatus };
