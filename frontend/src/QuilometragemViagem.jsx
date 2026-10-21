import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './QuilometragemViagem.css';

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = String(data).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarKm(km) {
  return `${Number(km).toLocaleString('pt-BR')} km`;
}

export default function QuilometragemViagem() {
  const [viagens, setViagens] = useState([]);
  const [valores, setValores] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvandoId, setSalvandoId] = useState(null);

  async function carregar() {
    try {
      const resposta = await axios.get('http://localhost:3333/api/quilometragem');
      setViagens(resposta.data);
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: 'Não foi possível carregar as viagens. Verifique se o backend está rodando.',
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function registrar(viagemId) {
    setMensagem(null);
    setSalvandoId(viagemId);
    try {
      await axios.post(`http://localhost:3333/api/quilometragem/${viagemId}/inicial`, {
        kmInicial: valores[viagemId],
      });
      setValores((atual) => ({ ...atual, [viagemId]: '' }));
      setMensagem({ tipo: 'sucesso', texto: 'Quilometragem inicial registrada.' });
      await carregar();
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.erro || 'Erro ao registrar a quilometragem.',
      });
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <div>
      <PageHeader
        titulo="Quilometragem da Viagem"
        subtitulo="Registre a quilometragem inicial do veículo antes da saída."
      />

      <div className="km-card">
        {mensagem && (
          <div className={`km-alerta ${mensagem.tipo}`}>
            {mensagem.tipo === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
            {mensagem.texto}
          </div>
        )}

        {!carregando && viagens.length === 0 && !mensagem && (
          <div className="km-vazio">
            Nenhuma viagem agendada ainda. Agende uma viagem em "Agendar viagem".
          </div>
        )}

        {viagens.length > 0 && (
          <div className="km-tabela-wrapper">
            <table className="km-tabela">
              <thead>
                <tr>
                  <th>Data / hora</th>
                  <th>Paciente</th>
                  <th>Veículo</th>
                  <th>Destino</th>
                  <th>Motorista</th>
                  <th>Km inicial</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((v) => (
                  <tr key={v.viagemId}>
                    <td>
                      {formatarData(v.data)}
                      <small>{v.hora}</small>
                    </td>
                    <td>{v.pacienteNome}</td>
                    <td>{v.veiculoDescricao}</td>
                    <td>{v.destino}</td>
                    <td>{v.motorista || '—'}</td>
                    <td>
                      {v.kmInicial !== null ? (
                        <span className="km-registrado">
                          <FiCheckCircle /> {formatarKm(v.kmInicial)}
                        </span>
                      ) : (
                        <div className="km-form">
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Ex.: 45230"
                            value={valores[v.viagemId] ?? ''}
                            onChange={(e) =>
                              setValores((atual) => ({ ...atual, [v.viagemId]: e.target.value }))
                            }
                          />
                          <button
                            type="button"
                            disabled={!valores[v.viagemId] || salvandoId === v.viagemId}
                            onClick={() => registrar(v.viagemId)}
                          >
                            {salvandoId === v.viagemId ? 'Salvando...' : 'Registrar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}