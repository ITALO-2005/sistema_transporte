# GOFM — Gestão do Transporte de Pacientes

Sistema web para organizar o transporte de pacientes da Secretaria de Transportes de Frei Martinho/PB: cadastro de pacientes e veículos, agendamento com validação de capacidade, fila de espera, viagens com lista de embarque e registros de quilometragem e abastecimento.

Projeto da disciplina de Gerência de Projetos de Software (IFPB Campus Picuí).
Equipe: Ítalo Dantas Santos, Josivaldo Emerson Alves e Paulo Vitor Silva Hermogens.

## Como rodar com Docker (recomendado)

Requisitos: Docker com Docker Compose.

```bash
git clone https://github.com/ITALO-2005/sistema_transporte.git
cd sistema_transporte
docker compose up --build
```

Depois, abra:

- Sistema: http://localhost:8080
- API: http://localhost:3333

Para parar, use `Ctrl+C` e depois `docker compose down`.

## Como rodar sem Docker (desenvolvimento)

Em dois terminais:

```bash
cd backend
npm install
npm run dev        # API na porta 3333
```

```bash
cd frontend
npm install
npm run dev        # sistema em http://localhost:5173
```

## Testes automatizados

Os testes da API usam Jest e Supertest e ficam em `backend/tests/`. Para rodar:

```bash
cd backend
npm install
npm test
```

Cada teste começa com o sistema vazio, cobre as regras de negócio (capacidade, fila de espera, status das viagens, quilometragem e abastecimento) e também roda automaticamente no GitHub a cada envio, pela aba Actions.

## Tecnologias

- Back-end: Node.js e Express
- Front-end: React e Vite
- Testes: Jest e Supertest
- Empacotamento: Docker, Docker Compose e nginx

## Estrutura

- `backend/`: API (rotas, controllers e armazenamento)
- `frontend/`: interface em React
- `docker-compose.yml`: sobe o back-end e o front-end juntos

## Observações

- Os dados ficam **em memória**: ao reiniciar o servidor ou os containers, os cadastros são apagados. A escolha do banco de dados definitivo ainda está em aberto.
- O repositório é público. Use apenas **dados fictícios**.
