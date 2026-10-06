import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheckCircle, FiTruck } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './CadastroPaciente.css';
import './CadastroVeiculo.css';

const formularioInicial = {
  placa: '',
  tipo: '',
  marca: '',
  modelo: '',
  ano: '',
  capacidade: '',
  situacao: 'Ativo',
};

export default function CadastroVeiculo() {
  const [form, setForm] = useState(formularioInicial);
  const [veiculos, setVeiculos] = useState([]);
  const [mensagem, setMensagem] = useState(null);

  async function carregarVeiculos() {
    try {
      const resposta = await axios.get('http://localhost:3333/api/veiculos');
      setVeiculos(resposta.data);
    } catch {
      setMensagem({ texto: 'Não foi possível carregar os veículos cadastrados.', tipo: 'erro' });
    }
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'placa' ? value.toUpperCase() : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMensagem(null);
    try {
      const resposta = await axios.post('http://localhost:3333/api/veiculos', form);
      setVeiculos((atuais) => [resposta.data, ...atuais]);
      setForm(formularioInicial);
      setMensagem({ texto: 'Veículo cadastrado com sucesso!', tipo: 'sucesso' });
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao cadastrar veículo.', tipo: 'erro' });
    }
  }

  return (
    <div>
      <PageHeader titulo="Cadastrar Veículo" subtitulo="Registre os veículos utilizados no transporte sanitário." />

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <span className="section-label">Identificação do veículo</span>
          <div className="form-grid">
            <div>
              <label htmlFor="placa">Placa *</label>
              <input id="placa" name="placa" value={form.placa} onChange={handleChange} required maxLength="7" placeholder="ABC1D23" />
            </div>
            <div>
              <label htmlFor="tipo">Tipo de veículo *</label>
              <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
                <option value="">Selecione</option>
                <option value="Carro">Carro</option>
                <option value="Van">Van</option>
                <option value="Micro-ônibus">Micro-ônibus</option>
                <option value="Ônibus">Ônibus</option>
                <option value="Ambulância">Ambulância</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="marca">Marca *</label>
              <input id="marca" name="marca" value={form.marca} onChange={handleChange} required placeholder="Ex.: Fiat" />
            </div>
            <div>
              <label htmlFor="modelo">Modelo *</label>
              <input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} required placeholder="Ex.: Ducato" />
            </div>
            <div>
              <label htmlFor="ano">Ano *</label>
              <input id="ano" name="ano" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.ano} onChange={handleChange} required placeholder="2024" />
            </div>
            <div>
              <label htmlFor="capacidade">Capacidade de passageiros *</label>
              <input id="capacidade" name="capacidade" type="number" min="1" value={form.capacidade} onChange={handleChange} required placeholder="Ex.: 15" />
            </div>
            <div>
              <label htmlFor="situacao">Situação</label>
              <select id="situacao" name="situacao" value={form.situacao} onChange={handleChange}>
                <option value="Ativo">Ativo</option>
                <option value="Em manutenção">Em manutenção</option>
                <option value="Inativo">Inativo</option>
              </select>
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
          <button type="submit">Cadastrar Veículo</button>
        </div>
      </form>

      <section className="veiculos-section" aria-labelledby="veiculos-titulo">
        <div className="veiculos-heading">
          <h3 id="veiculos-titulo">Veículos cadastrados</h3>
          <span>{veiculos.length} {veiculos.length === 1 ? 'veículo' : 'veículos'}</span>
        </div>
        {veiculos.length ? (
          <div className="veiculos-table-wrap">
            <table className="veiculos-table">
              <thead>
                <tr>
                  <th>Veículo</th>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Ano</th>
                  <th>Capacidade</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {veiculos.map((veiculo) => (
                  <tr key={veiculo.id}>
                    <td><strong>{veiculo.marca} {veiculo.modelo}</strong></td>
                    <td className="veiculo-placa">{veiculo.placa}</td>
                    <td>{veiculo.tipo}</td>
                    <td>{veiculo.ano}</td>
                    <td>{veiculo.capacidade} passageiros</td>
                    <td><span className={`situacao-badge ${veiculo.situacao.toLowerCase().replaceAll(' ', '-')}`}>{veiculo.situacao}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="veiculos-empty">
            <FiTruck aria-hidden="true" />
            <p>Nenhum veículo cadastrado.</p>
          </div>
        )}
      </section>
    </div>
  );
}