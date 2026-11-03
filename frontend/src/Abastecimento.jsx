import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import PageHeader from './components/PageHeader';
import './Abastecimento.css';

const COMBUSTIVEIS = ['Gasolina comum', 'Etanol', 'Diesel comum', 'Diesel S10', 'GNV'];
const FORM_VAZIO = {
  viagemId: '',
  combustivel: '',
  litros: '',
  valorTotal: '',
  kmAbastecimento: '',
  posto: '',
};

function formatarData(data) {
  if (!data) return '—';
  const [ano, mes, dia] = String(data).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarNumero(valor) {
  return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Abastecimento() {
  const [saidas, setSaidas] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [mensagem, setMensagem] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const [respSaidas, respLista] = await Promise.all([
        axios.get('http://localhost:3333/api/abastecimentos/saidas'),
        axios.get('http://localhost:3333/api/abastecimentos'),
      ]);
      setSaidas(respSaidas.data);
      setAbastecimentos(respLista.data);
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: 'Não foi possível carregar os dados. Verifique se o backend está rodando.',
      });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function alterar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function registrar(e) {
    e.preventDefault();
    setMensagem(null);
    setSalvando(true);
    try {
      await axios.post('http://localhost:3333/api/abastecimentos', form);
      setForm(FORM_VAZIO);
      setMensagem({ tipo: 'sucesso', texto: 'Abastecimento registrado.' });
      await carregar();
    } catch (err) {
      setMensagem({
        tipo: 'erro',
        texto: err.response?.data?.erro || 'Erro ao registrar o abastecimento.',
      });
    } finally {
      setSalvando(false);
    }
  }

  const totalLitros = abastecimentos.reduce((total, a) => total + a.litros, 0);
  const totalValor = abastecimentos.reduce((total, a) => total + a.valorTotal, 0);
  const incompleto = !form.viagemId || !form.combustivel || !form.litros || !form.valorTotal;

  return (
    <div>
      <PageHeader
        titulo="Abastecimento"
        subtitulo="Registre o combustível colocado nos veículos durante as saídas."
      />

      <form className="abast-card" onSubmit={registrar}>
        <span className="abast-secao">Novo abastecimento</span>

        {!carregando && saidas.length === 0 && (
          <div className="abast-aviso">
            Para registrar um abastecimento, agende antes uma viagem em "Agendar viagem".
          </div>
        )}

        <div className="abast-grid">
          <div className="abast-cheio">
            <label htmlFor="viagemId">Saída *</label>
            <select id="viagemId" name="viagemId" value={form.viagemId} onChange={alterar}>
              <option value="">Selecione a saída</option>
              {saidas.map((s) => (
                <option key={s.viagemId} value={s.viagemId}>
                  {formatarData(s.data)} {s.hora} · {s.veiculoDescricao} · {s.destino}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="combustivel">Combustível *</label>
            <select id="combustivel" name="combustivel" value={form.combustivel} onChange={alterar}>
              <option value="">Selecione</option>
              {COMBUSTIVEIS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="litros">Litros *</label>
            <input id="litros" name="litros" type="number" min="0" step="0.01" placeholder="Ex.: 45,50"
              value={form.litros} onChange={alterar} />
          </div>

          <div>
            <label htmlFor="valorTotal">Valor total (R$) *</label>
            <input id="valorTotal" name="valorTotal" type="number" min="0" step="0.01" placeholder="Ex.: 280,00"
              value={form.valorTotal} onChange={alterar} />
          </div>

          <div>
            <label htmlFor="kmAbastecimento">Km no abastecimento (opcional)</label>
            <input id="kmAbastecimento" name="kmAbastecimento" type="number" min="0" step="1" placeholder="Ex.: 45060"
              value={form.kmAbastecimento} onChange={alterar} />
          </div>

          <div className="abast-cheio">
            <label htmlFor="posto">Posto (opcional)</label>
            <input id="posto" name="posto" type="text" maxLength="80" placeholder="Nome do posto"
              value={form.posto} onChange={alterar} />
          </div>
        </div>

        <div className="abast-rodape">
          {mensagem && (
            <div className={`abast-alerta ${mensagem.tipo}`}>
              {mensagem.tipo === 'sucesso' ? <FiCheckCircle /> : <FiAlertCircle />}
              {mensagem.texto}
            </div>
          )}
          <button type="submit" disabled={incompleto || salvando}>
            {salvando ? 'Salvando...' : 'Registrar abastecimento'}
          </button>
        </div>
      </form>

      <div className="abast-card">
        <div className="abast-titulo-lista">
          <span className="abast-secao">Abastecimentos registrados</span>
          <span className="abast-contador">{abastecimentos.length} registro(s)</span>
        </div>

        {!carregando && abastecimentos.length === 0 && (
          <div className="abast-vazio">Nenhum abastecimento registrado ainda.</div>
        )}

        {abastecimentos.length > 0 && (
          <>
            <div className="abast-tabela-wrapper">
              <table className="abast-tabela">
                <thead>
                  <tr>
                    <th>Saída</th>
                    <th>Veículo</th>
                    <th>Combustível</th>
                    <th>Litros</th>
                    <th>Valor total</th>
                    <th>R$ / litro</th>
                    <th>Km</th>
                    <th>Posto</th>
                  </tr>
                </thead>
                <tbody>
                  {abastecimentos.map((a) => (
                    <tr key={a.id}>
                      <td>
                        {formatarData(a.data)}
                        <small>{a.hora}</small>
                      </td>
                      <td>{a.veiculoDescricao}</td>
                      <td>{a.combustivel}</td>
                      <td>{formatarNumero(a.litros)} L</td>
                      <td>{formatarMoeda(a.valorTotal)}</td>
                      <td>{formatarMoeda(a.precoLitro)}</td>
                      <td>{a.kmAbastecimento !== null ? Number(a.kmAbastecimento).toLocaleString('pt-BR') : '—'}</td>
                      <td>{a.posto || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="abast-total">
              Total registrado: {formatarNumero(totalLitros)} L · {formatarMoeda(totalValor)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
