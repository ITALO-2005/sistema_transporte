require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pacienteRoutes = require('./routes/pacienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const viagemRoutes = require('./routes/viagemRoutes');
const filaEsperaRoutes = require('./routes/filaEsperaRoutes');
const quilometragemRoutes = require('./routes/quilometragemRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'API do Sistema de Transporte rodando!' });
});

app.use('/api/pacientes', pacienteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/viagens', viagemRoutes);
app.use('/api/fila', filaEsperaRoutes);
app.use('/api/quilometragem', quilometragemRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));