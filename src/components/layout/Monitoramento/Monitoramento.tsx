import './Monitoramento.css';
import { useEffect, useState } from 'react';
import {
  Calendar,
  Package,
  Bell,
  AlertTriangle,
  Clock,
  Pencil,
  Trash2,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import type { ApiResponse, RegistroValidade } from '../../../types/validade.types';
import api from '../../../services/api';

// TODO: ajustar o caminho conforme a estrutura do projeto


function formatarDataIso(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarDataHora(dataHora: string): string {
  const data = new Date(dataHora);
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const Monitoramento = () => {
  const [registros, setRegistros] = useState<RegistroValidade[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarValidades = async () => {
      try {
        setCarregando(true);
        setErro(null);

        const resposta = await api.get<ApiResponse>('/com-status?status=ATIVA');
        setRegistros(resposta.data?.dados || []);
      } catch (erroApi) {
        console.error('Erro ao buscar validades:', erroApi);
        setErro('Não foi possível carregar os registros de validade.');
      } finally {
        setCarregando(false);
      }
    };

    buscarValidades();
  }, []);

  return (
    <div className="monitoramento">
      <header className="monitoramento__cabecalho">
        <h1 className="monitoramento__titulo">Últimas validades</h1>
        <p className="monitoramento__subtitulo">
          Validades mais recentes
        </p>
      </header>

      <div className="monitoramento__lista">
        {carregando ? (
          <div className="monitoramento__vazio">
            <Loader2 size={48} className="monitoramento__vazio-icone monitoramento__vazio-icone--girando" />
            <p>Carregando registros de validade...</p>
          </div>
        ) : erro ? (
          <div className="monitoramento__vazio monitoramento__vazio--erro">
            <AlertTriangle size={48} className="monitoramento__vazio-icone" />
            <p>{erro}</p>
          </div>
        ) : registros.length === 0 ? (
          <div className="monitoramento__vazio">
            <AlertTriangle size={48} className="monitoramento__vazio-icone" />
            <p>Nenhum registro de validade encontrado.</p>
          </div>
        ) : (
          registros.map((registro) => (
            <article
              key={registro._id}
              className={`monitoramento__card ${
                registro.status === 'VENCIDA'
                  ? 'monitoramento__card--vencida'
                  : registro.dentro_do_periodo_alerta
                  ? 'monitoramento__card--alerta'
                  : ''
              }`}
            >
              <div className="monitoramento__card-cabecalho">
                <div className="monitoramento__status">
                  <span
                    className={`monitoramento__badge monitoramento__badge--${registro.status.toLowerCase()}`}
                  >
                    {registro.status === 'ATIVA' ? 'Ativa' : 'Vencida'}
                  </span>
                  {registro.dentro_do_periodo_alerta && (
                    <span className="monitoramento__badge monitoramento__badge--alerta">
                      Em alerta
                    </span>
                  )}
                </div>
                <div className="monitoramento__acoes">
                  <button
                    type="button"
                    className="monitoramento__botao monitoramento__botao--editar"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    className="monitoramento__botao monitoramento__botao--encerrar"
                    title="Encerrar"
                  >
                    <CheckCircle size={18} />
                  </button>
                  <button
                    type="button"
                    className="monitoramento__botao monitoramento__botao--excluir"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="monitoramento__grupos">

                <section className="monitoramento__grupo">
                  <div className="monitoramento__grupo-titulo">
                    <Package size={18} />
                    <h3>Produto</h3>
                  </div>
                  <div className="monitoramento__grupo-conteudo">
                    <p>
                      <span className="monitoramento__rotulo">Nome:</span>
                      <span className="monitoramento__valor">
                        {registro.produto.nome}
                      </span>
                    </p>
                    <p>
                      <span className="monitoramento__rotulo">
                        Código de barras:
                      </span>
                      <span className="monitoramento__valor monitoramento__valor--monospace">
                        {registro.produto.codigoBarras}
                      </span>
                    </p>
                  </div>
                </section>

                <section className="monitoramento__grupo">
                  <div className="monitoramento__grupo-titulo">
                    <Calendar size={18} />
                    <h3>Validade</h3>
                  </div>
                  <div className="monitoramento__grupo-conteudo">
                    <p>
                      <span className="monitoramento__rotulo">
                        Data de validade:
                      </span>
                      <span className="monitoramento__valor monitoramento__valor--destaque">
                        {formatarDataIso(registro.data.data_iso)}
                      </span>
                    </p>
                    <p>
                      <span className="monitoramento__rotulo">
                        Data original:
                      </span>
                      <span className="monitoramento__valor">
                        {registro.data.data_original}
                      </span>
                    </p>
                  </div>
                </section>                

                <section className="monitoramento__grupo">
                  <div className="monitoramento__grupo-titulo">
                    <Bell size={18} />
                    <h3>Alerta</h3>
                  </div>
                  <div className="monitoramento__grupo-conteudo">
                    <p>
                      <span className="monitoramento__rotulo">
                        Dias de antecedência:
                      </span>
                      <span className="monitoramento__valor">
                        {registro.alerta.dias_antecedencia}{' '}
                        {registro.alerta.dias_antecedencia === 1 ? 'dia' : 'dias'}
                      </span>
                    </p>
                  </div>
                </section>

                <section className="monitoramento__grupo">
                  <div className="monitoramento__grupo-titulo">
                    <AlertTriangle size={18} />
                    <h3>Monitorando</h3>
                  </div>
                  <div className="monitoramento__grupo-conteudo">
                    <p>
                      <span className="monitoramento__rotulo">
                        Status da validade:
                      </span>
                      <span
                        className={`monitoramento__valor monitoramento__valor--${registro.status.toLowerCase()}`}
                      >
                        {registro.status === 'ATIVA' ? 'Ativa' : 'Vencida'}
                      </span>
                    </p>
                    <p>
                      <span className="monitoramento__rotulo">
                        Dentro do período de alerta?
                      </span>
                      <span
                        className={`monitoramento__valor ${
                          registro.dentro_do_periodo_alerta
                            ? 'monitoramento__valor--alerta'
                            : 'monitoramento__valor--ok'
                        }`}
                      >
                        {registro.dentro_do_periodo_alerta ? 'Sim' : 'Não'}
                      </span>
                    </p>
                    <p>
                      <span className="monitoramento__rotulo">
                        Dias restantes:
                      </span>
                      <span
                        className={`monitoramento__valor ${
                          registro.dias_restantes === null
                            ? ''
                            : registro.dias_restantes <= 1
                            ? 'monitoramento__valor--critico'
                            : registro.dias_restantes <= 3
                            ? 'monitoramento__valor--alerta'
                            : 'monitoramento__valor--ok'
                        }`}
                      >
                        {registro.dias_restantes === null
                          ? '—'
                          : `${registro.dias_restantes} ${
                              registro.dias_restantes === 1 ? 'dia' : 'dias'
                            }`}
                      </span>
                    </p>
                  </div>
                </section>
              </div>

              <footer className="monitoramento__metadados">
                <div className="monitoramento__metadados-icone">
                  <Clock size={16} />
                </div>
                <p>
                  <span className="monitoramento__rotulo">Criado em:</span>
                  <span className="monitoramento__valor">
                    {formatarDataHora(registro.criadoEm)}
                  </span>
                </p>
                <span className="monitoramento__separador">|</span>
                <p>
                  <span className="monitoramento__rotulo">Atualizado em:</span>
                  <span className="monitoramento__valor">
                    {formatarDataHora(registro.atualizadoEm)}
                  </span>
                </p>
              </footer>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Monitoramento;
