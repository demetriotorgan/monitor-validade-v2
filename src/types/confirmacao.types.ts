
import type { DadosInferencia } from './validade.types';

/**
 * RF-23 — Origem da confirmação humana.
 */
export type OrigemConfirmacao =
    | 'CONFIRMACAO_DIRETA'
    | 'CORRECAO_MANUAL';

/**
 * RF-23 — Resultado da confirmação humana.
 *
 * Preserva a data textual confirmada.
 * Não realiza normalização ou validação.
 */
export interface DataConfirmadaUsuario {
    data_confirmada: string;
    origem_confirmacao: OrigemConfirmacao;
    confirmada: true;
}

/**
 * RF-24 — Desfecho da interação.
 */
export type ResultadoInteracao =
    | 'CONFIRMADA'
    | 'ABANDONADA'
    | 'INTERROMPIDA';

/**
 * RF-24 — Métricas comuns da interação.
 */
export interface MetricasBase {
    operacao_id: string;
    amostra_id?: string;

    tempo_decisao_ms: number;
    quantidade_interacoes: number;
    consultou_evidencias: boolean;

    data_sugerida_ia: string | null;
}

/**
 * RF-24 — Interação concluída com confirmação.
 */
export interface MetricasConfirmada extends MetricasBase {
    resultado: 'CONFIRMADA';
    origem_confirmacao: OrigemConfirmacao;
    data_confirmada: string;
}

/**
 * RF-24 — Interação sem confirmação.
 */
export interface MetricasNaoConfirmada extends MetricasBase {
    resultado: 'ABANDONADA' | 'INTERROMPIDA';

    origem_confirmacao?: never;
    data_confirmada?: never;
}

export type MetricasInteracao =
    | MetricasConfirmada
    | MetricasNaoConfirmada;

/**
 * CT-INT-10 — Estado funcional da confirmação humana.
 *
 * AGUARDANDO_CONFIRMACAO:
 * Aguardando confirmação da sugestão ou início de edição.
 *
 * EDITANDO:
 * Operador está editando a data.
 * Pode existir uma confirmação anterior ainda vigente.
 *
 * CONFIRMADA:
 * Existe uma confirmação humana vigente.
 * A data ainda não foi validada pelo Grupo 4.
 */
export type EstadoConfirmacao =
    | 'AGUARDANDO_CONFIRMACAO'
    | 'EDITANDO'
    | 'CONFIRMADA';

/**
 * RF-17 a RF-22 / CT-INT-10
 * Contrato da interface visual.
 *
 * A View recebe os dados originais da IA,
 * o estado funcional da confirmação
 * e comunica as ações do operador.
 *
 * Não produz contratos de confirmação
 * nem executa normalização ou validação.
 */
export interface ConfirmacaoValidadeViewProps {
    imagemUrl: string;
    dados: DadosInferencia;

    estadoConfirmacao: EstadoConfirmacao;
    valorEdicao: string;

    /**
     * Última confirmação humana vigente.
     *
     * null: não existe confirmação vigente.
     * Pode permanecer preenchida durante EDITANDO,
     * até a primeira alteração textual efetiva.
     */
    confirmacaoVigente: DataConfirmadaUsuario | null;

    onConfirmarSugestao: () => void;
    onIniciarEdicao: () => void;
    onAlterarEdicao: (valor: string) => void;
    onConfirmarEdicao: () => void;
    onCancelarEdicao: () => void;

    evidenciasAbertas: boolean;
    onAlternarEvidencias: (abertas: boolean) => void;
}
