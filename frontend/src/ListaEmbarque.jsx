import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import PageHeader from './components/PageHeader';
import './ListaEmbarque.css';

/**
 * Formata a data e o horário da saída para exibição no padrão brasileiro.
 */
function formatarDataHora(data, hora) {
  return new Date(`${data}T${hora}`).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export default function ListaEmbarque() {
  // Guarda os agendamentos e o estado da tela enquanto os dados carregam.
  const [viagens, setViagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Busca as viagens confirmadas disponíveis na API.
  useEffect(() => {
    axios
      .get('http://localhost:3333/api/viagens')
      .then((resposta) => setViagens(resposta.data))
      .catch(() => setErro('Não foi possível carregar as viagens.'))
      .finally(() => setCarregando(false));
  }, []);

  /**
   * Agrupa os agendamentos que pertencem à mesma saída.
   * O veículo, a data e o horário identificam uma saída.
   */
  const grupos = useMemo(() => {
    const agrupadas = new Map();

    viagens.forEach((viagem) => {
      const chave = `${viagem.veiculoId}-${viagem.data}-${viagem.hora}`;

      // Cria o grupo quando esta saída ainda não foi encontrada.
      if (!agrupadas.has(chave)) {
        agrupadas.set(chave, {
          chave,
          data: viagem.data,
          hora: viagem.hora,
          veiculoDescricao: viagem.veiculoDescricao,
          capacidade: viagem.capacidade,
          pacientes: [],
          motoristas: new Set(),
        });
      }

      const grupo = agrupadas.get(chave);
      grupo.pacientes.push(viagem);

      // O Set evita repetir o mesmo nome de motorista no cabeçalho.
      if (viagem.motorista?.trim()) {
        grupo.motoristas.add(viagem.motorista.trim());
      }
    });

    // Converte os grupos para uma lista ordenada por data e horário.
    return Array.from(agrupadas.values())
      .map((grupo) => ({
        ...grupo,
        motoristas: Array.from(grupo.motoristas),
      }))
      .sort(
        (a, b) =>
          new Date(`${a.data}T${a.hora}`) -
          new Date(`${b.data}T${b.hora}`),
      );
  }, [viagens]);

  return (
    <div>
      <PageHeader
        titulo="Lista de Embarque"
        subtitulo="Pacientes organizados por veículo, data e horário."
      />

      {/* Abre as opções de impressão do navegador, incluindo salvar como PDF. */}
      <div className="lista-embarque-acoes">
        <button
          className="lista-embarque-imprimir"
          type="button"
          onClick={() => window.print()}
          disabled={!grupos.length}
        >
          Imprimir listas
        </button>
      </div>

      {/* Mensagens para os estados de carregamento, erro e lista vazia. */}
      {carregando && <p>Carregando viagens...</p>}
      {erro && <p className="lista-embarque-erro">{erro}</p>}

      {!carregando && !erro && grupos.length === 0 && (
        <p className="lista-embarque-vazia">
          Nenhuma viagem agendada para gerar a lista.
        </p>
      )}

      {/* Cada seção representa uma saída e contém seus pacientes. */}
      {!carregando &&
        !erro &&
        grupos.map((grupo) => (
          <section className="embarque-grupo" key={grupo.chave}>
            <h2>Saída — {formatarDataHora(grupo.data, grupo.hora)}</h2>

            <p><strong>Veículo:</strong> {grupo.veiculoDescricao}</p>
            <p>
              <strong>Motorista(s):</strong>{' '}
              {grupo.motoristas.join(', ') || 'Não informado'}
            </p>
            <p>
              <strong>Vagas ocupadas:</strong>{' '}
              {grupo.pacientes.reduce(
                (total, viagem) => total + Number(viagem.passageiros || 0),
                0,
              )}
              {' / '}
              {grupo.capacidade}
            </p>

            <div className="embarque-tabela-wrap">
              <table className="embarque-tabela">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Paciente</th>
                    <th>Destino</th>
                    <th>Motivo</th>
                    <th>Passageiros</th>
                  </tr>
                </thead>
                <tbody>
                  {grupo.pacientes.map((viagem, indice) => (
                    <tr key={viagem.id}>
                      <td>{indice + 1}</td>
                      <td><strong>{viagem.pacienteNome}</strong></td>
                      <td>{viagem.destino}</td>
                      <td>{viagem.motivo}</td>
                      <td>{viagem.passageiros}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
    </div>
  );
}