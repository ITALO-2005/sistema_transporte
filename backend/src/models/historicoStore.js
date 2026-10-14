// Armazenamento temporário em memória (igual ao pacientesStore).
// Quando o banco for decidido, só este arquivo muda.

let eventos = [];
let proximoId = 1;

function listarPorPaciente(pacienteId) {
  return eventos
    .filter((e) => e.pacienteId === Number(pacienteId))
    .sort((a, b) => new Date(b.data) - new Date(a.data));
}

// tipo: 'cadastro' | 'agendamento' | 'viagem' | 'outro'
function registrar({ pacienteId, tipo, descricao, data }) {
  const evento = {
    id: proximoId++,
    pacienteId: Number(pacienteId),
    tipo: tipo || 'outro',
    descricao,
    data: data || new Date().toISOString(),
  };
  eventos.push(evento);
  return evento;
}

module.exports = { listarPorPaciente, registrar };