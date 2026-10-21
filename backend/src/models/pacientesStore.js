// Armazenamento temporário em memória.
// Quando o banco de dados for decidido, só este arquivo muda — o resto do código continua igual.

let pacientes = [];
let proximoId = 1;

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function somenteDigitos(texto) {
  return String(texto || '').replace(/\D/g, '');
}

function listar() {
  return pacientes;
}

function buscar(termo) {
  const t = normalizar(termo);
  const digitos = somenteDigitos(termo);

  return pacientes.filter((p) => {
    const porNome = normalizar(p.nome).includes(t);
    const porCns = digitos && somenteDigitos(p.cns).includes(digitos);
    const porCpf = digitos && somenteDigitos(p.cpf).includes(digitos);
    return porNome || porCns || porCpf;
  });
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

module.exports = { listar, buscar, buscarPorId, buscarPorCns, criar };