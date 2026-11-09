
import axios from 'axios';
import api from './api';

import type {
  DadosInferencia,
  RespostaInferencia,
  RespostaInferenciaSucesso,
} from '../types/validade.types';

/**
 * Verifica se o valor é um objeto JSON.
 */
function ehObjeto(
  valor: unknown,
): valor is Record<string, unknown> {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    !Array.isArray(valor)
  );
}

/**
 * Validação estrutural da resposta de sucesso.
 */
function respostaValida(
  valor: unknown,
): valor is RespostaInferenciaSucesso {
  if (!ehObjeto(valor) || valor.sucesso !== true) {
    return false;
  }

  const dados = valor.dados;
  const metricas = valor.metricas;

  if (!ehObjeto(dados) || !ehObjeto(metricas)) {
    return false;
  }

  const dataValida =
    dados.data_validade === null ||
    typeof dados.data_validade === 'string';

  const candidatasValidas =
    Array.isArray(dados.datas_candidatas) &&
    dados.datas_candidatas.every((candidata: unknown) => {
      if (!ehObjeto(candidata)) return false;

      return (
        typeof candidata.data === 'string' &&
        (candidata.ancora === null ||
          typeof candidata.ancora === 'string') &&
        [
          'VALIDADE',
          'FABRICACAO',
          'INDETERMINADA',
        ].includes(String(candidata.interpretacao))
      );
    });

  const dadosValidos =
    dataValida &&
    typeof dados.texto_identificado === 'string' &&
    candidatasValidas &&
    typeof dados.tipo_evidencia === 'string' &&
    typeof dados.observacao === 'string';

  const metricasValidas =
    typeof metricas.modelo === 'string' &&
    typeof metricas.tokensEntrada === 'number' &&
    typeof metricas.tokensSaida === 'number' &&
    typeof metricas.tokensTotal === 'number' &&
    typeof metricas.tempoGroqMs === 'number' &&
    typeof metricas.latenciaMs === 'number';

  return dadosValidos && metricasValidas;
}

/**
 * Envia uma imagem recortada ao backend V2.
 *
 * Não realiza confirmação humana,
 * normalização ou validação de vencimento.
 */
export async function processarValidade(
  blob: Blob,
): Promise<RespostaInferenciaSucesso> {
  if (blob.size === 0) {
    throw new Error('A imagem recortada está vazia.');
  }

  const formData = new FormData();

  formData.append(
    'imagem',
    blob,
    'validade.jpg',
  );

  try {
    const response = await api.post<RespostaInferencia>(
      '/processar',
      formData,
    );

    const resposta: unknown = response.data;

    if (!respostaValida(resposta)) {
      throw new Error(
        'O backend retornou uma resposta incompatível com o contrato JSON V2.',
      );
    }

    return resposta;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const dadosErro: unknown = error.response?.data;

      if (
        ehObjeto(dadosErro) &&
        dadosErro.sucesso === false &&
        typeof dadosErro.erro === 'string'
      ) {
        throw new Error(dadosErro.erro);
      }

      if (!error.response) {
        throw new Error(
          'Não foi possível estabelecer comunicação com o backend.',
        );
      }

      throw new Error(
        `Falha na requisição. HTTP ${error.response.status}.`,
      );
    }

    throw error;
  }
}
