
import type { DataCandidata } from '../../types/validade.types';

import type {
  FabricacaoNormalizada,
  ResultadoPreparacaoFabricacao,
} from '../../types/validacao.types';

import { normalizarData } from './normalizarData';
import { validarCalendario } from './validarCalendario';

/**
 * RF28-02
 *
 * Filtra, normaliza, valida e deduplica
 * candidatas de fabricação.
 *
 * Não compara com a validade.
 * Não escolhe entre datas distintas.
 * Não altera as candidatas originais.
 */
export function prepararCandidatasFabricacao(
  candidatas: DataCandidata[]
): ResultadoPreparacaoFabricacao {

  const fabricacoes = new Map<
    string,
    FabricacaoNormalizada
  >();

  const candidatasInvalidas: string[] = [];
  const candidatasOriginais: string[] = [];

  for (const candidata of candidatas) {

    // Somente fabricação.
    if (candidata.interpretacao !== 'FABRICACAO') {
      continue;
    }

    const dataOriginal = candidata.data;

    candidatasOriginais.push(dataOriginal);

    // RF-25 — Normalização
    const normalizacao = normalizarData(dataOriginal);

    if (!normalizacao.sucesso) {
      candidatasInvalidas.push(dataOriginal);
      continue;
    }

    // RF-26 — Validação calendárica
    const calendario = validarCalendario(
      normalizacao.valor
    );

    if (!calendario.valida) {
      candidatasInvalidas.push(dataOriginal);
      continue;
    }

    const dataISO = normalizacao.valor.data_iso;

    // Deduplicação pela data civil.
    const existente = fabricacoes.get(dataISO);

    if (existente) {
      existente.representacoes_originais.push(
        dataOriginal
      );
      continue;
    }

    fabricacoes.set(dataISO, {
      data_iso: dataISO,
      representacoes_originais: [dataOriginal],
    });
  }

  return {
    fabricacoes: Array.from(fabricacoes.values()),
    candidatas_invalidas: candidatasInvalidas,
    candidatas_originais: candidatasOriginais,
  };
}
