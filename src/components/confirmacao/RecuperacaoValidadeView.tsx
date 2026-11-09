
import { useState } from 'react';

import type {
    RecuperacaoValidadeViewProps,
} from '../../types/recuperacao.types';

import './ConfirmacaoValidadeView.css';

export function RecuperacaoValidadeView({
    imagemUrl,
    mensagemErro,
    estadoConfirmacao,
    valorEdicao,
    confirmacaoVigente,
    reedicaoEmAndamento,
    onAlterarEdicao,
    onConfirmarEdicao,
    onIniciarEdicao,
    onCancelarEdicao,
}: RecuperacaoValidadeViewProps) {
    const [detalhesAbertos, setDetalhesAbertos] =
        useState(false);

    const editando = estadoConfirmacao === 'EDITANDO';
    const confirmada = estadoConfirmacao === 'CONFIRMADA';

    const possuiConfirmacaoVigente =
        confirmacaoVigente !== null;

    const podeConfirmarEdicao =
        valorEdicao.trim().length > 0 &&
        !possuiConfirmacaoVigente;

    // Na recuperação inicial, não existe confirmação
    // anterior que possa ser restaurada.
    //
    // Na reedição, o cancelamento fica disponível
    // enquanto houver uma confirmação vigente.
    const podeCancelarEdicao =
        editando && reedicaoEmAndamento;

    return (
        <section className="confirmacao-validade">

            <header className="confirmacao-cabecalho">
                <h2>Recuperação manual da validade</h2>

                <p>
                    Não foi possível concluir a análise automática
                    da imagem. Confira a imagem capturada e informe
                    manualmente a data de validade para continuar.
                </p>
            </header>

            <div className="confirmacao-imagem">
                <h3>Imagem recortada</h3>

                <img
                    src={imagemUrl}
                    alt="Imagem recortada para leitura manual da validade"
                />
            </div>

            {possuiConfirmacaoVigente && (
                <div className="confirmacao-humana">
                    <h3>Data confirmada pelo operador</h3>

                    <strong>
                        {confirmacaoVigente.data_confirmada}
                    </strong>
                </div>
            )}

            <div
                className="confirmacao-status"
                role="status"
                aria-live="polite"
            >
                {possuiConfirmacaoVigente
                    ? 'Data confirmada pelo operador — aguardando validação.'
                    : 'Aguardando confirmação manual do operador.'}
            </div>

            {editando && (
                <div className="confirmacao-edicao">
                    <label htmlFor="data-recuperacao">
                        Informe a data de validade
                    </label>

                    <input
                        id="data-recuperacao"
                        type="text"
                        value={valorEdicao}
                        onChange={(evento) =>
                            onAlterarEdicao(evento.target.value)
                        }
                        placeholder="DD/MM/AAAA"
                        autoComplete="off"
                    />

                    <div className="confirmacao-acoes">
                        <button
                            type="button"
                            onClick={onConfirmarEdicao}
                            disabled={!podeConfirmarEdicao}
                        >
                            Confirmar data informada
                        </button>

                        {podeCancelarEdicao && (
                            <button
                                type="button"
                                onClick={onCancelarEdicao}
                            >
                                Cancelar edição
                            </button>
                        )}
                    </div>
                </div>
            )}

            {confirmada && (
                <div className="confirmacao-acoes">
                    <button
                        type="button"
                        onClick={onIniciarEdicao}
                    >
                        Corrigir data manualmente
                    </button>
                </div>
            )}

            <details
                className="confirmacao-evidencias"
                open={detalhesAbertos}
                onToggle={(evento) => {
                    setDetalhesAbertos(evento.currentTarget.open);
                }}
            >
                <summary>Detalhes técnicos da falha</summary>

                <p>{mensagemErro}</p>
            </details>

        </section>
    );
}

export default RecuperacaoValidadeView;
