import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import CadastroPaciente from './CadastroPaciente';
import ConsultaPaciente from './ConsultaPaciente';
import HistoricoPaciente from './HistoricoPaciente';
import CadastroVeiculo from './CadastroVeiculo';
import AgendamentoViagem from './AgendamentoViagem';
import FilaEspera from './FilaEspera';
import ListaEmbarque from './ListaEmbarque';
import QuilometragemViagem from './QuilometragemViagem';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pacientes/cadastrar" element={<CadastroPaciente />} />
        <Route path="/pacientes/consultar" element={<ConsultaPaciente />} />
        <Route path="/pacientes/:id" element={<HistoricoPaciente />} />
        <Route path="/veiculos" element={<CadastroVeiculo />} />
        <Route path="/viagens" element={<AgendamentoViagem />} />
        <Route path="/fila" element={<FilaEspera />} />
        <Route path="/embarque" element={<ListaEmbarque />} />
        <Route path="/quilometragem" element={<QuilometragemViagem />} />
      </Route>
    </Routes>
  );
}

export default App;