import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CadastroPaciente from './CadastroPaciente';
import CadastroVeiculo from './CadastroVeiculo';
import AgendamentoViagem from './AgendamentoViagem';
import Placeholder from './components/Placeholder';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pacientes/cadastrar" element={<CadastroPaciente />} />
        <Route path="/pacientes/consultar" element={<Placeholder titulo="Consultar Paciente" />} />
        <Route path="/veiculos" element={<CadastroVeiculo />} />
        <Route path="/viagens" element={<AgendamentoViagem />} />
        <Route path="/fila" element={<Placeholder titulo="Fila de Espera" />} />
      </Route>
    </Routes>
  );
}

export default App;