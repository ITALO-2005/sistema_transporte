// Registros operacionais por viagem (quilometragem e, depois, abastecimento).
// Armazenamento temporário em memória. Quando o banco for decidido, só este arquivo muda.

let registros = [];

function buscarPorViagem(viagemId) {
  return registros.find((r) => r.viagemId === Number(viagemId));
}

// Maior quilometragem já registrada para o veículo (o hodômetro nunca diminui)
function maiorLeituraDoVeiculo(veiculoId) {
  const leituras = registros
    .filter((r) => r.veiculoId === Number(veiculoId))
    .flatMap((r) => [r.kmInicial, r.kmFinal])
    .filter((km) => typeof km === 'number');

  return leituras.length ? Math.max(...leituras) : null;
}

function registrarKmInicial({ viagemId, veiculoId, kmInicial }) {
  const registro = {
    viagemId: Number(viagemId),
    veiculoId: Number(veiculoId),
    kmInicial,
    kmInicialRegistradoEm: new Date().toISOString(),
  };
  registros.push(registro);
  return registro;
}

module.exports = { buscarPorViagem, maiorLeituraDoVeiculo, registrarKmInicial };