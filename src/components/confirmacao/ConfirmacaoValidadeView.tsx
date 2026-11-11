import type {
  ConfirmacaoValidadeViewProps,
} from '../../types/confirmacao.types';

import './ConfirmacaoValidadeView.css';

export function ConfirmacaoValidadeView({
  imagemUrl,
  dados,
  estadoConfirmacao,
  valorEdicao,
  confirmacaoVigente,
  evidenciasAbertas,
  onAlternarEvidencias,
  onConfirmarSugestao,
  onIniciarEdicao,
  onAlterarEdicao,
  onConfirmarEdicao,
  onCancelarEdicao,
  apresentacaoAvaliacao,
  onExecutarAcaoAvaliacao,
  onCancelarTentativa
}: ConfirmacaoValidadeViewProps) {

  // ---- ESTADO VISUAL ----

  const possuiSugestao =
    dados.data_validade !== null;

  const editando =
    estadoConfirmacao === 'EDITANDO';

  const confirmada =
    estadoConfirmacao === 'CONFIRMADA';

  const aguardandoConfirmacao =
    estadoConfirmacao === 'AGUARDANDO_CONFIRMACAO';

  const possuiConfirmacaoVigente =
    confirmacaoVigente !== null;

  // DEC-INT-10-05:
  // O operador só pode confirmar uma edição
  // quando não existir confirmação vigente.
  const podeConfirmarEdicao =
    valorEdicao.trim().length > 0 &&
    !possuiConfirmacaoVigente;

  return (
    <main className="confirmacao-page">
      <section className="confirmacao-container">

        <header className="confirmacao-header">
          <h1>Confirmar validade</h1>

          <p>
            Confira as informações identificadas
            antes de prosseguir.
          </p>
        </header>

        {/* ---- IMAGEM RECORTADA ---- */}

        <section className="confirmacao-imagem">
          <h2>Imagem capturada</h2>

          <img
            src={imagemUrl}
            alt="Imagem recortada da validade do produto"
          />
        </section>

        {/* ---- RESULTADO DA IA ---- */}

        <section className="confirmacao-resultado">
          <h2>Data de validade sugerida pela IA</h2>

          {possuiSugestao ? (
            <p className="confirmacao-data">
              {dados.data_validade}
            </p>
          ) : (
            <p className="confirmacao-sem-sugestao">
              A IA não identificou uma data de
              validade principal.
            </p>
          )}

          {/* ---- CONFIRMAÇÃO HUMANA VIGENTE ---- */}

          {confirmacaoVigente !== null && (
            <div className="confirmacao-humana">
              <h3>Data confirmada pelo operador</h3>

              <p className="confirmacao-data">
                {confirmacaoVigente.data_confirmada}
              </p>
            </div>
          )}

          {/* ---- STATUS DA CONFIRMAÇÃO ---- */}

          <p
            className="confirmacao-status"
            role="status"
            aria-live="polite"
          >
            {possuiConfirmacaoVigente
              ? apresentacaoAvaliacao !== null
                ? 'Data confirmada e avaliada'
                : 'Data confirmada pelo operador — aguardando validação'
              : 'Aguardando confirmação do operador'}
          </p>
        </section>

        {/* RF31-05 — Resultado da avaliação */}
        {estadoConfirmacao === 'CONFIRMADA' &&
          apresentacaoAvaliacao !== null && (
            <section
              className="resultado-avaliacao"
              aria-live="polite"
            >
              <p className="resultado-avaliacao__mensagem">
                {apresentacaoAvaliacao.mensagem}
              </p>

              <button
                type="button"
                className="resultado-avaliacao__botao"
                onClick={onExecutarAcaoAvaliacao}
              >
                {apresentacaoAvaliacao.rotuloBotao}
              </button>
            </section>
          )}

        {/* ---- EVIDÊNCIAS DA IA ---- */}

        <section className="confirmacao-evidencias">
          <details
            open={evidenciasAbertas}
            onToggle={(evento) => {
              const abertas =
                evento.currentTarget.open;

              if (abertas !== evidenciasAbertas) {
                onAlternarEvidencias(abertas);
              }
            }}
          >
            <summary>
              Consultar evidências da IA
            </summary>

            <div className="confirmacao-evidencias-conteudo">
              <h3>Datas identificadas</h3>

              {dados.datas_candidatas.length > 0 ? (
                <ul>
                  {dados.datas_candidatas.map(
                    (candidata, indice) => (
                      <li key={indice}>
                        <strong>
                          {candidata.data}
                        </strong>

                        <span>
                          {' '}— {candidata.interpretacao}
                        </span>

                        {candidata.ancora && (
                          <span>
                            {' '}— Âncora: {candidata.ancora}
                          </span>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              ) : (
                <p>
                  Nenhuma data candidata identificada.
                </p>
              )}

              <h3>Texto identificado</h3>
              <p>{dados.texto_identificado}</p>

              <h3>Tipo de evidência</h3>
              <p>{dados.tipo_evidencia}</p>

              <h3>Justificativa da IA</h3>
              <p>{dados.observacao}</p>
            </div>
          </details>
        </section>

        {/* ---- AÇÕES DO OPERADOR ---- */}

        <section className="confirmacao-acoes">

          {/* ESTADO: EDITANDO */}

          {editando && (
            <>
              <label htmlFor="data-confirmada">
                Informe a data de validade
              </label>

              <input
                id="data-confirmada"
                type="text"
                value={valorEdicao}
                onChange={(evento) =>
                  onAlterarEdicao(evento.target.value)
                }
                placeholder="DD/MM/AAAA"
                autoComplete="off"
              />

              <button
                type="button"
                className="confirmacao-botao-primario"
                onClick={onConfirmarEdicao}
                disabled={!podeConfirmarEdicao}
              >
                Confirmar data informada
              </button>

              <button
                type="button"
                className="confirmacao-botao-secundario"
                onClick={onCancelarEdicao}
              >
                Cancelar edição
              </button>
            </>
          )}

          {/* ESTADO: AGUARDANDO_CONFIRMACAO */}

          {aguardandoConfirmacao && (
            <>
              {possuiSugestao && (
                <button
                  type="button"
                  className="confirmacao-botao-primario"
                  onClick={onConfirmarSugestao}
                >
                  Confirmar data sugerida
                </button>
              )}

              <button
                type="button"
                className="confirmacao-botao-secundario"
                onClick={onIniciarEdicao}
              >
                {possuiSugestao
                  ? 'Corrigir data manualmente'
                  : 'Informar data manualmente'}
              </button>
            </>
          )}

          {/* ESTADO: CONFIRMADA */}

          {/* Correção manual após aprovação */}

          {confirmada &&
          (apresentacaoAvaliacao === null ||
            apresentacaoAvaliacao?.acao === 'PROSSEGUIR') && (
              <button
                type="button"
                className="confirmacao-botao-secundario"
                onClick={onIniciarEdicao}
              >
                Corrigir data manualmente
              </button>
            )}

          {/* DEC-G4-26 — Cancelamento da tentativa */}

          {confirmada &&
            apresentacaoAvaliacao !== null && (
              <button
                type="button"
                className="confirmacao-botao-secundario"
                onClick={onCancelarTentativa}
              >
                Cancelar cadastro
              </button>
            )}

        </section>
      </section>
    </main>
  );
}

export default ConfirmacaoValidadeView;
