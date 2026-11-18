import './Monitoramento.css';
import { useEffect, useState } from 'react';
import { Calendar, Pencil, CheckCircle, Trash2 } from 'lucide-react';
import type { ApiResponse, RegistroValidade } from '../../../types/validade.types';
import api from '../../../services/api';

type StatusFiltro = RegistroValidade['validade'];

const MAPEAMENTO_STATUS: Record<StatusFiltro, string> = {
  espera: 'espera',
  alerta: 'alerta',
  vencido: 'vencido',
  encerrado: 'encerrado',
};

const LABEL_STATUS: Record<StatusFiltro, string> = {
  espera: 'ESPERA',
  alerta: 'ALERTA',
  vencido: 'VENCIDO',
  encerrado: 'ENCERRADO',
};

const COR_STATUS: Record<StatusFiltro, string> = {
  espera: '#3b82f6',
  alerta: '#f59e0b',
  vencido: '#ef4444',
  encerrado: '#10b981',
};

function formatarDataIso(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

const Monitoramento = () => {
  const [registros, setRegistros] = useState<RegistroValidade[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('alerta');
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarValidades = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const statusApi = MAPEAMENTO_STATUS[statusFiltro];
        const resposta = await api.get<ApiResponse>(`/com-status?status=${statusApi}`);

        const dados = resposta.data?.dados || [];
        setRegistros(dados);

        console.log(`Status filtrado: ${statusFiltro} (enviado: ${statusApi})`);
        console.log('Registros retornados:', dados);
      } catch (erroApi) {
        console.error('Erro ao buscar validades:', erroApi);
        setErro('Não foi possível carregar os registros de validade.');
      } finally {
        setCarregando(false);
      }
    };

    buscarValidades();
  }, [statusFiltro]);

  const handleEditar = (registro: RegistroValidade) => {
    console.log('Editar registro:', registro._id);
  };

  const handleEncerrar = (registro: RegistroValidade) => {
    console.log('Encerrar registro:', registro._id);
  };

  const handleDeletar = (registro: RegistroValidade) => {
    console.log('Deletar registro:', registro._id);
  };

  return (
    <div className="monitoramento">
      <header className="monitoramento-cabecalho">
        <Calendar />
        <h1 className="monitoramento-titulo">Monitorar Validades</h1>
      </header>

      <div className="monitoramento-filtros">
        <label htmlFor="filtro-status">Filtrar por status:</label>
        <select
          id="filtro-status"
          value={statusFiltro}
          onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
        >
          <option value="espera">ESPERA</option>
          <option value="alerta">ALERTA</option>
          <option value="vencido">VENCIDO</option>
          <option value="encerrado">ENCERRADO</option>
        </select>
      </div>

      {carregando && <p>Carregando...</p>}
      {erro && <p className="erro">{erro}</p>}

      <div className="monitoramento-lista">
        {!carregando &&
          registros.map((registro) => (
            <div key={registro._id} className="registro-card">
              <div className="registro-conteudo">
                <span
                  className="registro-status"
                  style={{ color: COR_STATUS[registro.validade] }}
                >
                  {LABEL_STATUS[registro.validade]}
                </span>

                <h3 className="registro-nome">{registro.produto.nome}</h3>

                <div className="registro-meta">
                  <span>{formatarDataIso(registro.data.data_iso)}</span>
                  <span>•</span>
                  <span>
                    {registro.dias_restantes === null
                      ? 'Sem prazo'
                      : `${registro.dias_restantes} dias restantes`}
                  </span>
                </div>
              </div>

              <div className="registro-acoes">
                <button
                  type="button"
                  title="Editar"
                  onClick={() => handleEditar(registro)}
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  title="Encerrar"
                  onClick={() => handleEncerrar(registro)}
                >
                  <CheckCircle size={14} />
                </button>

                <button
                  type="button"
                  title="Deletar"
                  onClick={() => handleDeletar(registro)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Monitoramento;
