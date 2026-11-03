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
  const [salvando, setSalvando] = useState(null);

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

  function alterarValor(chave, valor) {
    setValores((atual) => ({ ...atual, [chave]: valor }));
  }

  // tipo: 'inicial' ou 'final'
  async function registrar(viagemId, tipo) {
    const chave = `${tipo}-${viagemId}`;
    setMensagem(null);
    setSalvando(chave);
    try {
      const corpo = tipo === 'inicial' ? { kmInicial: valores[chave] } : { kmFinal: valores[chave] };
      await axios.post(`http://localhost:3333/api/quilometragem/${viagemId}/${tipo}`, corpo);
      alterarValor(chave, '');
      setMensagem({
        tipo: 'sucesso',
        texto: tipo === 'inicial' ? 'Quilometragem inicial registrada.' : 'Quilometragem final registrada.',
      });
      await carregar();
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.erro || 'Erro ao registrar a quilometragem.',
      });
    } finally {
      setSalvando(null);
    }
  }

  function campoKm(v, tipo) {
    const chave = `${tipo}-${v.viagemId}`;
    return (
      <div className="km-form">
        <input
          type="number"
          min={tipo === 'final' ? v.kmInicial : 0}
          step="1"
          placeholder={tipo === 'inicial' ? 'Ex.: 45230' : `Mín.: ${v.kmInicial}`}
          value={valores[chave] ?? ''}
          onChange={(e) => alterarValor(chave, e.target.value)}
        />
        <button
          type="button"
          disabled={!valores[chave] || salvando === chave}
          onClick={() => registrar(v.viagemId, tipo)}
        >
          {salvando === chave ? 'Salvando...' : 'Registrar'}
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        titulo="Quilometragem da Viagem"
        subtitulo="Registre a quilometragem inicial antes da saída e a final na volta."
      />

      <div className="km-card">
        <p className="km-nota">
          A quilometragem vale para a saída inteira: ao registrar em um paciente, os demais da mesma
          saída (mesmo veículo, data e horário) recebem o mesmo valor.
        </p>

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
                  <th>Km final</th>
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
                        campoKm(v, 'inicial')
                      )}
                    </td>
                    <td>
                      {v.kmFinal !== null ? (
                        <div>
                          <span className="km-registrado">
                            <FiCheckCircle /> {formatarKm(v.kmFinal)}
                          </span>
                          <small>{formatarKm(v.kmPercorrido)} percorridos</small>
                        </div>
                      ) : v.kmInicial === null ? (
                        <span className="km-aguardando">Registre o km inicial</span>
                      ) : (
                        campoKm(v, 'final')
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