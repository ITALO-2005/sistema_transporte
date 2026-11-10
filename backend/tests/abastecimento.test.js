const { request, novoApp, criarPaciente, criarVeiculo, agendar, mudarStatus } = require('./ajuda');

describe('Abastecimento', () => {
  let app, viagem;
  beforeEach(async () => {
    app = novoApp();
    const p1 = await criarPaciente(app, 'Paciente 1', '700000000000001');
    const p2 = await criarPaciente(app, 'Paciente 2', '700000000000002');
    const v = await criarVeiculo(app, 'AAA1A11', 10);
    viagem = (await agendar(app, p1.id, v.id, 1)).body;
    await agendar(app, p2.id, v.id, 1);
  });

  const abastecer = (dados) =>
    request(app).post('/api/abastecimentos').send({ viagemId: viagem.id, combustivel: 'Diesel S10', litros: 40, valorTotal: 240, ...dados });

  test('lista a saída uma vez só, mesmo com dois pacientes', async () => {
    const saidas = (await request(app).get('/api/abastecimentos/saidas')).body;
    expect(saidas).toHaveLength(1);
  });

  test('aceita vírgula nos números e calcula o preço por litro', async () => {
    const resposta = await abastecer({ litros: '45,50', valorTotal: '280,00' });
    expect(resposta.status).toBe(201);
    expect(resposta.body.precoLitro).toBe(6.15);
  });

  test('CT12: recusa abastecimento com zero litros', async () => {
    expect((await abastecer({ litros: 0 })).status).toBe(400);
  });

  test('recusa combustível fora da lista', async () => {
    expect((await abastecer({ combustivel: 'Água' })).status).toBe(400);
  });

  test('CT13: recusa km fora da faixa da saída', async () => {
    await request(app).post(`/api/quilometragem/${viagem.id}/inicial`).send({ kmInicial: 45000 });
    await request(app).post(`/api/quilometragem/${viagem.id}/final`).send({ kmFinal: 45120 });
    expect((await abastecer({ kmAbastecimento: 44000 })).status).toBe(400);
    expect((await abastecer({ kmAbastecimento: 45200 })).status).toBe(400);
    expect((await abastecer({ kmAbastecimento: 45060 })).status).toBe(201);
  });

  test('não registra abastecimento em viagem cancelada', async () => {
    await mudarStatus(app, viagem.id, 'Cancelada');
    expect((await abastecer({})).status).toBe(409);
  });
});
