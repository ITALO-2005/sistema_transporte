import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle, FiMap } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './CadastroPaciente.css';
import './AgendamentoViagem.css';

const formularioInicial = {
  pacienteId: '',
  veiculoId: '',
  data: '',
  hora: '',
  destino: '',
  motivo: '',
  passageiros: '1',
};

export default function AgendamentoViagem() {
  const [form, setForm] = useState(formularioInicial);
  const [pacientes, setPacientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [pacientesResposta, veiculosResposta, viagensResposta] = await Promise.all([
        axios.get('http://localhost:3333/api/pacientes'),
        axios.get('http://localhost:3333/api/veiculos'),
        axios.get('http://localhost:3333/api/viagens'),
      ]);
      setPacientes(pacientesResposta.data);
      setVeiculos(veiculosResposta.data);
      setViagens(viagensResposta.data);
    } catch {
      setMensagem({ texto: 'Não foi possível carregar os dados dos agendamentos.', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const veiculoSelecionado = veiculos.find((veiculo) => String(veiculo.id) === form.veiculoId);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem(null);
    setEnviando(true);
    try {
      const resposta = await axios.post('http://localhost:3333/api/viagens', {
        ...form,
        passageiros: Number(form.passageiros),
      });
      setViagens((atuais) => [resposta.data, ...atuais]);
      setForm(formularioInicial);
      setMensagem({ texto: 'Viagem agendada com sucesso!', tipo: 'sucesso' });
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao agendar viagem.', tipo: 'erro' });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <PageHeader titulo="Agendar Viagem" subtitulo="Organize o transporte do paciente e acompanhe as viagens agendadas." />

      {(!pacientes.length || !veiculos.some((veiculo) => veiculo.situacao === 'Ativo')) && !carregando && (
        <div className="viagem-aviso">
          Para agendar, cadastre pelo menos um paciente e um veículo ativo nas respectivas telas.
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <span className="section-label">Dados do agendamento</span>
          <div className="form-grid">
            <div>
              <label htmlFor="pacienteId">Paciente *</label>
              <select id="pacienteId" name="pacienteId" value={form.pacienteId} onChange={handleChange} required>
                <option value="">Selecione o paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>{paciente.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="veiculoId">Veículo *</label>
              <select id="veiculoId" name="veiculoId" value={form.veiculoId} onChange={handleChange} required>
                <option value="">Selecione o veículo</option>
                {veiculos.filter((veiculo) => veiculo.situacao === 'Ativo').map((veiculo) => (
                  <option key={veiculo.id} value={veiculo.id}>
                    {veiculo.marca} {veiculo.modelo} — {veiculo.placa} ({veiculo.capacidade} lugares)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="data">Data da viagem *</label>
              <input id="data" name="data" type="date" value={form.data} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="hora">Horário de saída *</label>
              <input id="hora" name="hora" type="time" value={form.hora} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="destino">Destino *</label>
              <input id="destino" name="destino" value={form.destino} onChange={handleChange} required placeholder="Ex.: Hospital Regional" />
            </div>
            <div>
              <label htmlFor="motivo">Motivo / atendimento *</label>
              <input id="motivo" name="motivo" value={form.motivo} onChange={handleChange} required placeholder="Ex.: Consulta, exame ou tratamento" />
            </div>
            <div>
              <label htmlFor="passageiros">Passageiros (incluindo o paciente) *</label>
              <input
                id="passageiros"
                name="passageiros"
                type="number"
                min="1"
                max={veiculoSelecionado?.capacidade}
                value={form.passageiros}
                onChange={handleChange}
                required
              />
              {veiculoSelecionado && (
                <small className="viagem-capacidade">Lotação do veículo: {veiculoSelecionado.capacidade} passageiros.</small>
              )}
            </div>
          </div>
        </div>

        <div className="form-footer">
          {mensagem && (
            <div className={`alert ${mensagem.tipo}`} role="status">
              {mensagem.tipo === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
              {mensagem.texto}
            </div>
          )}
          <button type="submit" disabled={enviando || carregando || !pacientes.length || !veiculos.some((veiculo) => veiculo.situacao === 'Ativo')}>
            {enviando ? 'Agendando...' : 'Agendar Viagem'}
          </button>
        </div>
      </form>

      <section className="viagens-section" aria-labelledby="viagens-titulo">
        <div className="viagens-heading">
          <h3 id="viagens-titulo">Viagens agendadas</h3>
          <span>{viagens.length} {viagens.length === 1 ? 'viagem' : 'viagens'}</span>
        </div>
        {carregando ? (
          <p className="viagens-empty">Carregando agendamentos...</p>
        ) : viagens.length ? (
          <div className="viagens-table-wrap">
            <table className="viagens-table">
              <thead>
                <tr>
                  <th>Data e horário</th>
                  <th>Paciente</th>
                  <th>Destino / motivo</th>
                  <th>Veículo</th>
                  <th>Passageiros</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((viagem) => (
                  <tr key={viagem.id}>
                    <td>{new Date(`${viagem.data}T${viagem.hora}`).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td><strong>{viagem.pacienteNome}</strong></td>
                    <td>{viagem.destino}<small>{viagem.motivo}</small></td>
                    <td>{viagem.veiculoDescricao}</td>
                    <td>{viagem.passageiros} / {viagem.capacidade} lugares</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="viagens-empty">
            <FiMap aria-hidden="true" />
            <p>Nenhuma viagem agendada.</p>
          </div>
        )}
      </section>
    </div>
  );
}
