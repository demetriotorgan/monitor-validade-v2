export type OrigemConfirmacao =
    | 'CONFIRMACAO_DIRETA'
    | 'CORRECAO_MANUAL';

export interface DataConfirmadaUsuario {
    data_confirmada: string;
    origem_confirmacao: OrigemConfirmacao;
    confirmada: true;
}