import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiUsers } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './ConsultaPaciente.css';

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function ConsultaPaciente() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    // espera 300ms depois que a pessoa para de digitar, pra não chamar a API a cada letra
    const timer = setTimeout(async () => {
      try {
        setCarregando(true);
        setErro('');
        const resposta = await axios.get('http://localhost:3333/api/pacientes', {
          params: busca.trim() ? { busca: busca.trim() } : {},
        });
        setPacientes(resposta.data);
      } catch (err) {
        setErro('Não foi possível carregar os pacientes. Verifique se o backend está rodando.');
      } finally {
        setCarregando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  return (
    <div>
      <PageHeader
        titulo="Consultar Paciente"
        subtitulo="Pesquise por nome, CNS ou CPF. Clique em um paciente para ver o histórico."
      />

      <div className="consulta-card">
        <div className="busca-wrapper">
          <FiSearch className="busca-icone" />
          <input
            className="busca-input"
            type="text"
            placeholder="Digite o nome, CNS ou CPF do paciente"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {erro && <div className="consulta-erro">{erro}</div>}

        {!erro && !carregando && (
          <div className="consulta-contador">
            <FiUsers />
            {pacientes.length} paciente(s) encontrado(s)
          </div>
        )}

        {!erro && !carregando && pacientes.length === 0 && (
          <div className="consulta-vazio">
            {busca.trim()
              ? 'Nenhum paciente encontrado para essa busca.'
              : 'Nenhum paciente cadastrado ainda.'}
          </div>
        )}

        {!erro && pacientes.length > 0 && (
          <div className="tabela-wrapper">
            <table className="tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNS</th>
                  <th>CPF</th>
                  <th>Nascimento</th>
                  <th>Telefone</th>
                  <th>Bairro</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr
                    key={p.id}
                    className="clicavel"
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                  >
                    <td className="col-nome">{p.nome}</td>
                    <td>{p.cns || '—'}</td>
                    <td>{p.cpf || '—'}</td>
                    <td>{formatarData(p.dataNascimento)}</td>
                    <td>{p.telefone || '—'}</td>
                    <td>{p.bairro || '—'}</td>
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