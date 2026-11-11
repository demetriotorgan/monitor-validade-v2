
import { useId } from 'react';

import type {
  RecuperacaoValidadeViewProps,
} from '../../types/recuperacao.types';

import './RecuperacaoValidadeView.css';

export function RecuperacaoValidadeView({
  imagemUrl,
  mensagemErro,
  estadoConfirmacao,
  valorEdicao,
  confirmacaoVigente,
  onAlterarEdicao,
  onConfirmarEdicao,
  onIniciarEdicao,
  onCancelarTentativa,
  apresentacaoAvaliacao,
  onExecutarAcaoAvaliacao,
}: RecuperacaoValidadeViewProps) {

  const idCampoData = useId();

  const editando = estadoConfirmacao === 'EDITANDO';
  const confirmada = estadoConfirmacao === 'CONFIRMADA';

  const possuiConfirmacaoVigente =
    confirmacaoVigente !== null;

  const podeConfirmarEdicao =
    valorEdicao.trim().length > 0 &&
    !possuiConfirmacaoVigente;

  return (
    <section className="recuperacao-page">
      <div className="recuperacao-container">

        <header className="recuperacao-cabecalho">
          <h2>Recuperação manual da validade</h2>

          <p>
            Não foi possível concluir a análise automática
            da imagem. Confira a imagem capturada e informe
            manualmente a data de validade para continuar.
          </p>
        </header>

        <div className="recuperacao-imagem">
          <h3>Imagem recortada</h3>

          <img
            src={imagemUrl}
            alt="Imagem recortada para leitura manual da validade"
          />
        </div>

        {possuiConfirmacaoVigente && (
          <div className="recuperacao-humana">
            <h3>Data confirmada pelo operador</h3>

            <strong>
              {confirmacaoVigente.data_confirmada}
            </strong>
          </div>
        )}

        <div
          className="recuperacao-status"
          role="status"
          aria-live="polite"
        >
          {possuiConfirmacaoVigente
            ? apresentacaoAvaliacao !== null
              ? 'Data confirmada e avaliada.'
              : 'Data confirmada pelo operador — aguardando validação.'
            : 'Aguardando confirmação manual do operador.'}
        </div>


        {/* RF-31 — Resultado da avaliação */}

        {confirmada &&
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


        {editando && (
          <div className="recuperacao-edicao">

            <label htmlFor={idCampoData}>
              Informe a data de validade
            </label>

            <input
              id={idCampoData}
              type="text"
              value={valorEdicao}
              onChange={(evento) =>
                onAlterarEdicao(evento.target.value)
              }
              placeholder="DD/MM/AAAA"
              autoComplete="off"
            />

            <div className="recuperacao-acoes">
              <button
                className="recuperacao-botao-primario"
                type="button"
                onClick={onConfirmarEdicao}
                disabled={!podeConfirmarEdicao}
              >
                Confirmar data informada
              </button>

              {/* DEC-G4-26 — Encerramento da tentativa */}

              <button
                className="recuperacao-botao-secundario"
                type="button"
                onClick={onCancelarTentativa}
              >
                Cancelar cadastro
              </button>
            </div>
          </div>
        )}


        {/* Ações após confirmação e avaliação */}

        {confirmada && (
          <div className="recuperacao-acoes">

            {/* Correção manual após aprovação */}

            {apresentacaoAvaliacao?.acao === 'PROSSEGUIR' && (
              <button
                className="recuperacao-botao-secundario"
                type="button"
                onClick={onIniciarEdicao}
              >
                Corrigir data manualmente
              </button>
            )}

            {/* DEC-G4-26 — Encerrar tentativa */}

            <button
              className="recuperacao-botao-secundario"
              type="button"
              onClick={onCancelarTentativa}
            >
              Cancelar cadastro
            </button>

          </div>
        )}

        <details className="recuperacao-evidencias">
          <summary>
            Detalhes técnicos da falha
          </summary>

          <p>{mensagemErro}</p>
        </details>

      </div>
    </section>
  );
}

export default RecuperacaoValidadeView;
