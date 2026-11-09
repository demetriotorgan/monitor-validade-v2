
import type {
  ConfirmacaoValidadeViewProps,
} from '../../types/confirmacao.types';

import './ConfirmacaoValidadeView.css';

export function ConfirmacaoValidadeView({
  imagemUrl,
  dados,
  estadoEdicao,
  valorEdicao,
  evidenciasAbertas,
  onAlternarEvidencias,
  onConfirmarSugestao,
  onIniciarEdicao,
  onAlterarEdicao,
  onConfirmarEdicao,
  onCancelarEdicao,
}: ConfirmacaoValidadeViewProps) {
  const possuiSugestao = dados.data_validade !== null;
  const editando = estadoEdicao === 'EDITANDO';

  const podeConfirmarEdicao =
    valorEdicao.trim().length > 0;

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

        <section className="confirmacao-imagem">
          <h2>Imagem capturada</h2>

          <img
            src={imagemUrl}
            alt="Imagem recortada da validade do produto"
          />
        </section>

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

          <p className="confirmacao-status">
            Aguardando confirmação do operador
          </p>
        </section>

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
                        <strong>{candidata.data}</strong>

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
                <p>Nenhuma data candidata identificada.</p>
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

        <section className="confirmacao-acoes">
          {editando ? (
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
          ) : (
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
        </section>
      </section>
    </main>
  );
}

export default ConfirmacaoValidadeView;
