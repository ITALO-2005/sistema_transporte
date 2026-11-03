// Abastecimentos registrados por saída (veículo + data + horário).
// Armazenamento temporário em memória. Quando o banco for decidido, só este arquivo muda.

let abastecimentos = [];
let proximoId = 1;

function listar() {
  return [...abastecimentos];
}

function criar(dados) {
  const abastecimento = {
    id: proximoId++,
    ...dados,
    registradoEm: new Date().toISOString(),
  };
  abastecimentos.unshift(abastecimento);
  return abastecimento;
}

module.exports = { listar, criar };
