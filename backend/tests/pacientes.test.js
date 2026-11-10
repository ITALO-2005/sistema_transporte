const { request, novoApp, criarPaciente } = require('./ajuda');

describe('Pacientes', () => {
  let app;
  beforeEach(() => { app = novoApp(); });

  test('cadastra um paciente', async () => {
    const resposta = await request(app).post('/api/pacientes').send({ nome: 'Maria Teste', cns: '700000000000001' });
    expect(resposta.status).toBe(201);
    expect(resposta.body.nome).toBe('Maria Teste');
  });

  test('exige o nome do paciente', async () => {
    const resposta = await request(app).post('/api/pacientes').send({ cns: '700000000000001' });
    expect(resposta.status).toBe(400);
  });

  test('CT01: recusa um segundo paciente com o mesmo CNS', async () => {
    await criarPaciente(app, 'Maria Teste', '700000000000001');
    const resposta = await request(app).post('/api/pacientes').send({ nome: 'Outra Pessoa', cns: '700000000000001' });
    expect(resposta.status).toBe(409);
  });

  test('CT02: encontra o paciente por parte do nome, pelo CNS e pelo CPF', async () => {
    await criarPaciente(app, 'José da Silva', '700000000000002', { cpf: '123.456.789-00' });
    for (const busca of ['jose', '700000000000002', '12345678900']) {
      const resposta = await request(app).get('/api/pacientes').query({ busca });
      expect(resposta.status).toBe(200);
      expect(resposta.body.map((p) => p.nome)).toContain('José da Silva');
    }
  });

  test('registra o cadastro no histórico do paciente', async () => {
    const paciente = await criarPaciente(app, 'Ana Teste', '700000000000003');
    const resposta = await request(app).get(`/api/pacientes/${paciente.id}/historico`);
    expect(resposta.status).toBe(200);
    expect(resposta.body.length).toBeGreaterThan(0);
  });
});
