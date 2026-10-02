import { Link } from 'react-router-dom';
import { FiUserPlus, FiSearch, FiTruck, FiMap, FiArrowRight } from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import './Home.css';

const acoes = [
  { to: '/pacientes/cadastrar', titulo: 'Cadastrar Paciente', desc: 'Adicionar um novo paciente à base.', Icon: FiUserPlus },
  { to: '/pacientes/consultar', titulo: 'Consultar Paciente', desc: 'Buscar pacientes já cadastrados.', Icon: FiSearch },
  { to: '/veiculos', titulo: 'Veículos', desc: 'Gerenciar a frota municipal.', Icon: FiTruck },
  { to: '/viagens', titulo: 'Viagens', desc: 'Criar e acompanhar viagens.', Icon: FiMap },
];

export default function Home() {
  return (
    <div>
      <PageHeader titulo="Bem-vindo(a)" subtitulo="Escolha uma ação abaixo para começar." />
      <div className="cards-grid">
        {acoes.map(({ to, titulo, desc, Icon }) => (
          <Link key={to} to={to} className="action-card">
            <div className="action-icon"><Icon /></div>
            <div className="action-text">
              <h3>{titulo}</h3>
              <p>{desc}</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>
        ))}
      </div>
    </div>
  );
}