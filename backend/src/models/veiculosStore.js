// Armazenamento temporário em memória, seguindo o padrão de pacientesStore.

let veiculos = [];
let proximoId = 1;

function listar() {
  return veiculos;
}

function buscarPorPlaca(placa) {
  const placaNormalizada = placa.trim().toUpperCase();
  return veiculos.find((veiculo) => veiculo.placa === placaNormalizada);
}

function criar(dados) {
  const veiculo = {
    id: proximoId++,
    ...dados,
    placa: dados.placa.trim().toUpperCase(),
    createdAt: new Date().toISOString(),
  };
  veiculos.push(veiculo);
  return veiculo;
}

module.exports = { listar, buscarPorPlaca, criar };