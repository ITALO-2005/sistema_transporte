const { request, novoApp, criarPaciente, criarVeiculo, agendar, mudarStatus } = require('./ajuda');

describe('Agendamento e status das viagens', () => {
  let app;
  beforeEach(() => { app = novoApp(); });

  test('agenda uma viagem quando há vagas', async () => {
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const resposta = await agendar(app, p.id, v.id, 2);
    expect(resposta.status).toBe(201);
    expect(resposta.body.status).toBe('Agendada');
  });

  test('CT03: não agenda em veículo que não está ativo', async () => {
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4, 'Em manutenção');
    const resposta = await agendar(app, p.id, v.id, 1);
    expect(resposta.status).toBe(400);
  });

  test('CT04: bloqueia mais passageiros que a capacidade total do veículo', async () => {
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const resposta = await agendar(app, p.id, v.id, 5);
    expect(resposta.status).toBe(400);
  });

  test('CT05: envia para a fila quando a saída está lotada', async () => {
    const p1 = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const p2 = await criarPaciente(app, 'Paciente 2', '700000000000002');
    const v = await criarVeiculo(app, 'AAA1A11', 2);
    await agendar(app, p1.id, v.id, 2);
    const resposta = await agendar(app, p2.id, v.id, 1);
    expect(resposta.status).toBe(202);
    const fila = await request(app).get('/api/fila');
    expect(fila.body).toHaveLength(1);
  });

  test('CT08: iniciar a saída muda todas as viagens da mesma saída', async () => {
    const p1 = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const p2 = await criarPaciente(app, 'Paciente 2', '700000000000002');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const viagem1 = (await agendar(app, p1.id, v.id, 1)).body;
    await agendar(app, p2.id, v.id, 1);
    const resposta = await mudarStatus(app, viagem1.id, 'Em andamento');
    expect(resposta.status).toBe(200);
    expect(resposta.body.atualizadas).toHaveLength(2);
    const lista = await request(app).get('/api/viagens');
    expect(lista.body.every((viagem) => viagem.status === 'Em andamento')).toBe(true);
  });

  test('CT09: não cancela uma viagem que já está em andamento', async () => {
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const viagem = (await agendar(app, p.id, v.id, 1)).body;
    await mudarStatus(app, viagem.id, 'Em andamento');
    const resposta = await mudarStatus(app, viagem.id, 'Cancelada');
    expect(resposta.status).toBe(409);
  });

  test('o status só avança e não volta para Agendada', async () => {
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const viagem = (await agendar(app, p.id, v.id, 1)).body;
    await mudarStatus(app, viagem.id, 'Em andamento');
    await mudarStatus(app, viagem.id, 'Concluída');
    const resposta = await mudarStatus(app, viagem.id, 'Agendada');
    expect(resposta.status).toBe(409);
  });

  test('recusa status inválido e viagem inexistente', async () => {
    expect((await mudarStatus(app, 99, 'Cancelada')).status).toBe(404);
    const p = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const v = await criarVeiculo(app, 'AAA1A11', 4);
    const viagem = (await agendar(app, p.id, v.id, 1)).body;
    expect((await mudarStatus(app, viagem.id, 'Voando')).status).toBe(400);
  });
});
