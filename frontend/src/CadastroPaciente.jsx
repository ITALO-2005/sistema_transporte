import { useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './CadastroPaciente.css';

export default function CadastroPaciente() {
  const [form, setForm] = useState({
    nome: '', cpf: '', cns: '', dataNascimento: '', sexo: '', telefone: '', endereco: '', bairro: ''
  });
  const [mensagem, setMensagem] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3333/api/pacientes', form);
      setMensagem({ texto: 'Paciente cadastrado com sucesso!', tipo: 'sucesso' });
      setForm({ nome: '', cpf: '', cns: '', dataNascimento: '', sexo: '', telefone: '', endereco: '', bairro: '' });
    } catch (err) {
      setMensagem({ texto: err.response?.data?.erro || 'Erro ao cadastrar paciente.', tipo: 'erro' });
    }
  }

  return (
    <div>
      <PageHeader titulo="Cadastrar Paciente" subtitulo="Preencha os dados abaixo para adicionar um novo paciente." />

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-section">
          <span className="section-label">Identificação</span>
          <div className="form-grid">
            <div className="full">
              <label>Nome completo *</label>
              <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Digite o nome completo" />
            </div>
            <div>
              <label>CPF</label>
              <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" />
            </div>
            <div>
              <label>CNS</label>
              <input name="cns" value={form.cns} onChange={handleChange} placeholder="Cartão Nacional de Saúde" />
            </div>
            <div>
              <label>Data de Nascimento</label>
              <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
            </div>
            <div>
              <label>Sexo</label>
              <select name="sexo" value={form.sexo} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <span className="section-label">Contato e endereço</span>
          <div className="form-grid">
            <div className="full">
              <label>Telefone</label>
              <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" />
            </div>
            <div className="full">
              <label>Endereço</label>
              <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Rua, número" />
            </div>
            <div>
              <label>Bairro</label>
              <input name="bairro" value={form.bairro} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-footer">
          {mensagem && (
            <div className={`alert ${mensagem.tipo}`}>
              {mensagem.tipo === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
              {mensagem.texto}
            </div>
          )}
          <button type="submit">Cadastrar Paciente</button>
        </div>
      </form>
    </div>
  );
}