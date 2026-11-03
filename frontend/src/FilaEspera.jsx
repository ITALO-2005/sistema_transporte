import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle, FiClock, FiTrash2, FiUserCheck } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './FilaEspera.css';

const API = 'http://localhost:3333/api';

function formatarDataHora(data, hora) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} às ${hora}`;
}
/**
 * Formata a data e a hora em que o pedido entrou na fila.
 * O backend envia dataEntrada como uma data ISO.
 */

function formatarDataSolicitacao(dataEntrada) {
  if (!dataEntrada) return '—';

  const data = new Date(dataEntrada);
  if (Number.isNaN(data.getTime())) return '—';

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}


export default function FilaEspera() {
  const [fila, setFila] = useState([]);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [removendoId, setRemovendoId] = useState(null);
  const [agendandoId, setAgendandoId] = useState(null);

  async function carregarFila() {
    setCarregando(true);

    try {
      const resposta = await axios.get(`${API}/fila`);
      setFila(resposta.data);
    } catch {
      setMensagem({ texto: 'Não foi possível carregar a fila.', tipo: 'erro' });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFila();
  }, []);

  async function retirarDaFila(id) {
    setMensagem(null);
    setRemovendoId(id);

    try {
      await axios.delete(`${API}/fila/${id}`);
      setMensagem({ texto: 'Solicitação retirada da fila.', tipo: 'sucesso' });
      await carregarFila();
    } catch (err) {
      setMensagem({
        texto: err.response?.data?.erro || 'Erro ao retirar solicitação da fila.',
        tipo: 'erro',
      });
    } finally {
      setRemovendoId(null);
    }
  }

  // Passa a solicitação da fila para uma viagem agendada (quando há vaga)
  async function agendarDaFila(id) {
    setMensagem(null);
    setAgendandoId(id);

    try {
      const resposta = await axios.post(`${API}/fila/${id}/agendar`);
      setMensagem({ texto: resposta.data.mensagem, tipo: 'sucesso' });
      await carregarFila();
    } catch (err) {
      setMensagem({
        texto: err.response?.data?.erro || 'Erro ao agendar a solicitação.',
        tipo: 'erro',
      });
    } finally {
      setAgendandoId(null);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Fila de Espera"
        subtitulo="Solicitações aguardando vagas para o veículo, data e horário escolhidos."
      />

      {mensagem && (
        <div className={`fila-alerta ${mensagem.tipo}`} role="status">
          {mensagem.tipo === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
          {mensagem.texto}
        </div>
      )}

      <section className="fila-section" aria-labelledby="fila-titulo">
        <div className="fila-heading">
          <h3 id="fila-titulo">Solicitações aguardando vaga</h3>
          <span>{fila.length} {fila.length === 1 ? 'solicitação' : 'solicitações'}</span>
        </div>

        {carregando ? (
          <div className="fila-empty">Carregando fila...</div>
        ) : fila.length ? (
          <div className="fila-table-wrap">
            <table className="fila-table">
              <thead>
                <tr>
                  <th>Ordem</th>
                  <th>Paciente</th>
                  <th>Data e horário pedidos</th>
                  <th>Destino / motivo</th>
                  <th>Veículo</th>
                  <th>Passageiros</th>
                  <th>Situação</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {fila.map((item, indice) => (
                  <tr key={item.id}>
                    <td className="fila-position">{indice + 1}º</td>
                    <td><strong>{item.pacienteNome}</strong><small>Solicitada em {formatarDataSolicitacao(item.dataEntrada)}</small></td>
                    <td>{formatarDataHora(item.data, item.hora)}</td>
                    <td>{item.destino}<small>{item.motivo}</small></td>
                    <td>{item.veiculoDescricao}</td>
                    <td>{item.passageiros} / {item.capacidade}</td>
                    <td>
                      {item.podeAgendar ? (
                        <span className="fila-badge disponivel">Vaga disponível</span>
                      ) : (
                        <span className="fila-badge aguardando">Aguardando</span>
                      )}
                      <small>{item.vagasLivres} vaga(s) livre(s)</small>
                    </td>
                    <td>
                      <div className="fila-acoes">
                        {item.podeAgendar && (
                          <button
                            type="button"
                            className="fila-agendar-button"
                            onClick={() => agendarDaFila(item.id)}
                            disabled={agendandoId === item.id}
                          >
                            <FiUserCheck />
                            {agendandoId === item.id ? 'Agendando...' : 'Agendar'}
                          </button>
                        )}
                        <button
                          type="button"
                          className="fila-remove-button"
                          onClick={() => retirarDaFila(item.id)}
                          disabled={removendoId === item.id}
                        >
                          <FiTrash2 />
                          {removendoId === item.id ? 'Retirando...' : 'Retirar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fila-empty">
            <FiClock aria-hidden="true" />
            <p>Nenhuma solicitação aguardando vaga.</p>
          </div>
        )}
      </section>
    </div>
  );
}
