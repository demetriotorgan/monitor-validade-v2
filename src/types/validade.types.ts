
/**
 * Classificação textual retornada pela IA.
 */
export type InterpretacaoData =
    | 'VALIDADE'
    | 'FABRICACAO'
    | 'INDETERMINADA';

/**
 * Uma candidata reconhecida na imagem.
 */
export interface DataCandidata {
    data: string;
    ancora: string | null;
    interpretacao: InterpretacaoData;
}

/**
 * Contrato JSON V2 da inferência.
 */
export interface DadosInferencia {
    data_validade: string | null;
    texto_identificado: string;
    datas_candidatas: DataCandidata[];
    tipo_evidencia: string;
    observacao: string;
}

/**
 * Métricas técnicas produzidas pelo backend/Groq.
 */
export interface MetricasInferencia {
    modelo: string;
    tokensEntrada: number;
    tokensSaida: number;
    tokensTotal: number;
    tempoGroqMs: number;
    latenciaMs: number;
}

/**
 * Resposta HTTP de sucesso.
 */
export interface RespostaInferenciaSucesso {
    sucesso: true;
    dados: DadosInferencia;
    metricas: MetricasInferencia;
}

/**
 * Resposta HTTP de erro.
 */
export interface RespostaInferenciaErro {
    sucesso: false;
    erro: string;
}

/**
 * Contrato de resposta da API.
 */
export type RespostaInferencia =
    | RespostaInferenciaSucesso
    | RespostaInferenciaErro;

/**
 * Estados da integração frontend-backend
 * durante o processamento da validade.
 */
export type EstadoInferencia =
  | 'AGUARDANDO_IMAGEM'
  | 'PROCESSANDO'
  | 'SUCESSO'
  | 'ERRO';