import { NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiUserPlus, FiSearch, FiTruck, FiMap, FiClock } from 'react-icons/fi';
import logoPrefeitura from '../assets/logo-prefeitura.png';
import './Layout.css';

const menuItems = [
  { to: '/', label: 'Início', Icon: FiHome },
  { to: '/pacientes/cadastrar', label: 'Cadastrar Paciente', Icon: FiUserPlus },
  { to: '/pacientes/consultar', label: 'Consultar Paciente', Icon: FiSearch },
  { to: '/veiculos', label: 'Veículos', Icon: FiTruck },
  { to: '/viagens', label: 'Viagens', Icon: FiMap },
  { to: '/fila', label: 'Fila de Espera', Icon: FiClock },
];

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-box">
            <img src={logoPrefeitura} alt="Prefeitura Municipal de Frei Martinho" />
          </div>
          <div>
            <h1>Sistema de Transporte</h1>
            <span>Secretaria de Saúde</span>
          </div>
        </div>
        <nav>
          {menuItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              <Icon className="nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">Frei Martinho · PB</div>
      </aside>
      <main className="content">
        <div className="content-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}