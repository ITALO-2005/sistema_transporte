const { request, novoApp, criarPaciente, criarVeiculo, agendar, mudarStatus } = require('./ajuda');

// Carro de 4 lugares: P1 (2) e P2 (2) lotam; P3 (1) e P4 (2) vão para a fila
async function cenarioLotado(app) {
  const p = [];
  for (let i = 1; i <= 4; i += 1) p.push(await criarPaciente(app, `Paciente ${i}`, `70000000000000${i}`));
  const v = await criarVeiculo(app, 'AAA1A11', 4);
  const viagem1 = (await agendar(app, p[0].id, v.id, 2)).body;
  const viagem2 = (await agendar(app, p[1].id, v.id, 2)).body;
  await agendar(app, p[2].id, v.id, 1, { motorista: 'Motorista da Fila' });
  await agendar(app, p[3].id, v.id, 2);
  return { viagem1, viagem2 };
}

describe('Fila de espera', () => {
  let app;
  beforeEach(() => { app = novoApp(); });

  test('ninguém pode ser agendado enquanto a saída está lotada', async () => {
    await cenarioLotado(app);
    const fila = (await request(app).get('/api/fila')).body;
    expect(fila).toHaveLength(2);
    expect(fila.some((item) => item.podeAgendar)).toBe(false);
  });

  test('CT06: cancelar libera vagas e indica o próximo da fila que cabe', async () => {
    const { viagem1 } = await cenarioLotado(app);
    const resposta = await mudarStatus(app, viagem1.id, 'Cancelada');
    expect(resposta.status).toBe(200);
    expect(resposta.body.filaOferta.pacienteNome).toBe('Paciente 3');
    const fila = (await request(app).get('/api/fila')).body;
    expect(fila.find((item) => item.pacienteNome === 'Paciente 3').podeAgendar).toBe(true);
    expect(fila.find((item) => item.pacienteNome === 'Paciente 4').podeAgendar).toBe(false);
  });

  test('CT07: recusa agendar quem não é o primeiro da fila', async () => {
    const { viagem1 } = await cenarioLotado(app);
    await mudarStatus(app, viagem1.id, 'Cancelada');
    const fila = (await request(app).get('/api/fila')).body;
    const segundo = fila.find((item) => item.pacienteNome === 'Paciente 4');
    const resposta = await request(app).post(`/api/fila/${segundo.id}/agendar`);
    expect(resposta.status).toBe(409);
  });

  test('agenda o primeiro da fila, mantém o motorista digitado e o tira da fila', async () => {
    const { viagem1 } = await cenarioLotado(app);
    await mudarStatus(app, viagem1.id, 'Cancelada');
    const fila = (await request(app).get('/api/fila')).body;
    const primeiro = fila.find((item) => item.pacienteNome === 'Paciente 3');
    const resposta = await request(app).post(`/api/fila/${primeiro.id}/agendar`);
    expect(resposta.status).toBe(201);
    expect(resposta.body.viagem.motorista).toBe('Motorista da Fila');
    const depois = (await request(app).get('/api/fila')).body;
    expect(depois).toHaveLength(1);
  });

  test('uma saída já iniciada não recebe ninguém da fila', async () => {
    const { viagem1, viagem2 } = await cenarioLotado(app);
    await mudarStatus(app, viagem1.id, 'Cancelada');
    await mudarStatus(app, viagem2.id, 'Em andamento');
    const fila = (await request(app).get('/api/fila')).body;
    const primeiro = fila.find((item) => item.pacienteNome === 'Paciente 3');
    const resposta = await request(app).post(`/api/fila/${primeiro.id}/agendar`);
    expect(resposta.status).toBe(409);
  });
});
