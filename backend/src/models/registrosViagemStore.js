// Registros operacionais por saída (veículo + data + horário): quilometragem e, depois, abastecimento.
// Todos os pacientes da mesma saída compartilham o mesmo registro.
// Armazenamento temporário em memória. Quando o banco for decidido, só este arquivo muda.

let registros = [];

function chaveDaSaida(viagem) {
  return `${Number(viagem.veiculoId)}|${viagem.data}|${viagem.hora}`;
}

function buscarPorSaida(viagem) {
  const chave = chaveDaSaida(viagem);
  return registros.find((r) => r.chave === chave);
}

// Maior leitura já registrada para o veículo em OUTRAS saídas (o hodômetro nunca diminui)
function maiorLeituraDoVeiculo(veiculoId, viagemAtual) {
  const chaveAtual = chaveDaSaida(viagemAtual);
  const leituras = registros
    .filter((r) => r.veiculoId === Number(veiculoId) && r.chave !== chaveAtual)
    .flatMap((r) => [r.kmInicial, r.kmFinal])
    .filter((km) => typeof km === 'number');

  return leituras.length ? Math.max(...leituras) : null;
}

function registrarKmInicial(viagem, kmInicial) {
  const registro = {
    chave: chaveDaSaida(viagem),
    veiculoId: Number(viagem.veiculoId),
    kmInicial,
    kmInicialRegistradoEm: new Date().toISOString(),
    kmFinal: null,
    kmFinalRegistradoEm: null,
  };
  registros.push(registro);
  return registro;
}

function registrarKmFinal(viagem, kmFinal) {
  const registro = buscarPorSaida(viagem);
  registro.kmFinal = kmFinal;
  registro.kmFinalRegistradoEm = new Date().toISOString();
  return registro;
}

module.exports = { buscarPorSaida, maiorLeituraDoVeiculo, registrarKmInicial, registrarKmFinal };
