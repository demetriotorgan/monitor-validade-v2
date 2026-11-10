
import type {
  EntradaVerificacaoFabricacao,
  ResultadoCoerenciaFabricacao,
} from '../../types/validacao.types';

import { prepararCandidatasFabricacao } from './prepararCandidatasFabricacao';

/**
 * RF28-03 — Verificação de coerência cronológica.
 *
 * CT-RF28-01
 * DEC-G4-15 — Alternativa A
 *
 * Pré-condição:
 * A validade já foi normalizada pelo RF-25
 * e validada pelo RF-26.
 *
 * Não realiza nova inferência por IA.
 * Não corrige datas automaticamente.
 * Não escolhe entre fabricações distintas.
 */
export function verificarCoerenciaFabricacao(
  entrada: EntradaVerificacaoFabricacao
): ResultadoCoerenciaFabricacao {

  const { validade, candidatas } = entrada;

  const preparacao = prepararCandidatasFabricacao(
    candidatas
  );

  const {
    fabricacoes,
    candidatas_invalidas,
    candidatas_originais,
  } = preparacao;

  // 1. Nenhuma fabricação identificada.
  if (candidatas_originais.length === 0) {
    return {
      situacao: 'SEM_FABRICACAO',
      requer_revisao: false,
      fabricacoes_consideradas: [],
    };
  }

  // 2. Existe fabricação inválida ou incompleta.
  if (candidatas_invalidas.length > 0) {
    return {
      situacao: 'REVISAO_NECESSARIA',
      requer_revisao: true,
      fabricacoes_consideradas: candidatas_originais,
    };
  }

  // 3. Existem múltiplas datas civis distintas.
  if (fabricacoes.length !== 1) {
    return {
      situacao: 'REVISAO_NECESSARIA',
      requer_revisao: true,
      fabricacoes_consideradas: candidatas_originais,
    };
  }

  // 4. Uma única fabricação válida e inequívoca.
  const fabricacao = fabricacoes[0];

  // Comparação ISO: AAAA-MM-DD.
  // Pré-condição: ambas as datas são válidas.
  if (fabricacao.data_iso > validade.data_iso) {
    return {
      situacao: 'INCOERENTE',
      requer_revisao: true,
      fabricacoes_consideradas: candidatas_originais,
    };
  }

  // 5. Fabricação anterior ou igual à validade.
  return {
    situacao: 'COERENTE',
    requer_revisao: false,
    fabricacoes_consideradas: candidatas_originais,
  };
}
