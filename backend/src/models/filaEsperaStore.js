let fila = [];
let proximoId = 1;

function listar() {
  return [...fila].sort(
    (a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada),
  );
}

function adicionar(dados) {
  const solicitacao = {
    id: proximoId++,
    ...dados,
    dataEntrada: new Date().toISOString(),
    status: 'Aguardando',
  };

  fila.push(solicitacao);
  return solicitacao;
}

function remover(id) {
  const indice = fila.findIndex((item) => item.id === Number(id));

  if (indice === -1) {
    return null;
  }

  return fila.splice(indice, 1)[0];
}

module.exports = { listar, adicionar, remover };