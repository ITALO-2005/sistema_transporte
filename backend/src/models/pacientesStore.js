// Armazenamento temporário em memória.
// Quando o banco de dados for decidido, só este arquivo muda — o resto do código continua igual.

let pacientes = [];
let proximoId = 1;

function listar() {
  return pacientes;
}

function buscarPorId(id) {
  return pacientes.find((p) => p.id === Number(id));
}

function buscarPorCns(cns) {
  return pacientes.find((p) => p.cns === cns);
}

function criar(dados) {
  const paciente = {
    id: proximoId++,
    ...dados,
    createdAt: new Date().toISOString(),
  };
  pacientes.push(paciente);
  return paciente;
}

module.exports = { listar, buscarPorId, buscarPorCns, criar };