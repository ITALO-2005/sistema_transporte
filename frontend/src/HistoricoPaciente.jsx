import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiUserPlus, FiCalendar, FiMap, FiActivity } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './HistoricoPaciente.css';

const TIPOS = {
  cadastro: { rotulo: 'Cadastro', Icon: FiUserPlus },
  agendamento: { rotulo: 'Agendamento', Icon: FiCalendar },
  viagem: { rotulo: 'Viagem', Icon: FiMap },
  outro: { rotulo: 'Outro', Icon: FiActivity },
};

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function HistoricoPaciente() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        setErro('');
        const [respPaciente, respHistorico] = await Promise.all([
          axios.get(`http://localhost:3333/api/pacientes/${id}`),
          axios.get(`http://localhost:3333/api/pacientes/${id}/historico`),
        ]);
        setPaciente(respPaciente.data);
        setEventos(respHistorico.data);
      } catch (err) {
        setErro(
          err.response?.status === 404
            ? 'Paciente não encontrado. Se o backend foi reiniciado, os dados em memória foram apagados.'
            : 'Não foi possível carregar os dados. Verifique se o backend está rodando.'
        );
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id]);

  return (
    <div>
      <Link to="/pacientes/consultar" className="voltar-link">
        <FiArrowLeft /> Voltar para a consulta
      </Link>

      <PageHeader
        titulo={paciente ? paciente.nome : 'Histórico do Paciente'}
        subtitulo="Dados do paciente e histórico de ocorrências."
      />

      {carregando && <p className="hist-msg">Carregando...</p>}
      {erro && <div className="hist-erro">{erro}</div>}

      {paciente && !erro && (
        <>
          <div className="hist-card">
            <span className="hist-secao">Dados do paciente</span>
            <div className="dados-grid">
              <div><span>CNS</span><strong>{paciente.cns || '—'}</strong></div>
              <div><span>CPF</span><strong>{paciente.cpf || '—'}</strong></div>
              <div><span>Nascimento</span><strong>{formatarData(paciente.dataNascimento)}</strong></div>
              <div><span>Sexo</span><strong>{paciente.sexo || '—'}</strong></div>
              <div><span>Telefone</span><strong>{paciente.telefone || '—'}</strong></div>
              <div><span>Bairro</span><strong>{paciente.bairro || '—'}</strong></div>
              <div className="dados-full"><span>Endereço</span><strong>{paciente.endereco || '—'}</strong></div>
            </div>
          </div>

          <div className="hist-card">
            <span className="hist-secao">Histórico</span>
            {eventos.length === 0 ? (
              <p className="hist-msg">Nenhum registro no histórico ainda.</p>
            ) : (
              <ul className="timeline">
                {eventos.map((e) => {
                  const { rotulo, Icon } = TIPOS[e.tipo] || TIPOS.outro;
                  return (
                    <li key={e.id} className="timeline-item">
                      <div className="timeline-icone"><Icon /></div>
                      <div className="timeline-corpo">
                        <div className="timeline-topo">
                          <strong>{rotulo}</strong>
                          <span>{formatarDataHora(e.data)}</span>
                        </div>
                        <p>{e.descricao}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}