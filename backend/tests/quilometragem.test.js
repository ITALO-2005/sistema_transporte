const { request, novoApp, criarPaciente, criarVeiculo, agendar, mudarStatus } = require('./ajuda');

describe('Quilometragem por saída', () => {
  let app, viagem1, viagem2, outraSaida;
  beforeEach(async () => {
    app = novoApp();
    const p1 = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const p2 = await criarPaciente(app, 'Paciente 2', '700000000000002');
    const v = await criarVeiculo(app, 'AAA1A11', 10);
    viagem1 = (await agendar(app, p1.id, v.id, 1)).body;
    viagem2 = (await agendar(app, p2.id, v.id, 1)).body;
    outraSaida = (await agendar(app, p1.id, v.id, 1, { data: '2026-12-02' })).body;
  });

  const km = (viagem, tipo, valor) =>
    request(app).post(`/api/quilometragem/${viagem.id}/${tipo}`).send(tipo === 'inicial' ? { kmInicial: valor } : { kmFinal: valor });

  test('não registra km final antes do inicial', async () => {
    expect((await km(viagem1, 'final', 45120)).status).toBe(409);
  });

  test('o km vale para a saída inteira e calcula a distância percorrida', async () => {
    expect((await km(viagem1, 'inicial', 45000)).status).toBe(201);
    const resposta = await km(viagem2, 'final', 45120);
    expect(resposta.status).toBe(201);
    expect(resposta.body.kmPercorrido).toBe(120);
  });

  test('CT10: recusa km final menor que o inicial', async () => {
    await km(viagem1, 'inicial', 45000);
    expect((await km(viagem1, 'final', 44000)).status).toBe(400);
  });

  test('CT11: recusa km inicial menor que a última leitura do veículo', async () => {
    await km(viagem1, 'inicial', 45000);
    await km(viagem1, 'final', 45120);
    expect((await km(outraSaida, 'inicial', 45000)).status).toBe(400);
    expect((await km(outraSaida, 'inicial', 45120)).status).toBe(201);
  });

  test('viagem cancelada não aparece na quilometragem', async () => {
    await mudarStatus(app, viagem1.id, 'Cancelada');
    const lista = (await request(app).get('/api/quilometragem')).body;
    expect(lista.map((item) => item.viagemId)).not.toContain(viagem1.id);
    expect((await km(viagem1, 'inicial', 1000)).status).toBe(409);
  });
});
