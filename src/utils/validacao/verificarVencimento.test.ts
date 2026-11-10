
import { describe, expect, it } from 'vitest';

import type {
  DataNormalizada,
} from '../../types/validacao.types';

import { verificarVencimento } from './verificarVencimento';

function criarData(
  iso: string
): DataNormalizada {
  const [ano, mes, dia] = iso
    .split('-')
    .map(Number);

  return {
    data_original: `${dia}/${mes}/${ano}`,
    dia,
    mes,
    ano,
    data_iso: iso,
  };
}

describe('RF-27 — verificarVencimento', () => {
  const referencia = '2026-11-10';

  it('bloqueia validade anterior à referência', () => {
    const data = criarData('2026-11-09');

    expect(
      verificarVencimento(data, referencia)
    ).toEqual({
      data_validade: '2026-11-09',
      data_referencia: referencia,
      situacao: 'VENCIDO',
      permite_avancar: false,
    });
  });

  it('permite validade igual à referência', () => {
    const data = criarData('2026-11-10');

    expect(
      verificarVencimento(data, referencia)
    ).toEqual({
      data_validade: '2026-11-10',
      data_referencia: referencia,
      situacao: 'VENCE_HOJE',
      permite_avancar: true,
    });
  });

  it('permite validade posterior à referência', () => {
    const data = criarData('2026-11-11');

    expect(
      verificarVencimento(data, referencia)
    ).toEqual({
      data_validade: '2026-11-11',
      data_referencia: referencia,
      situacao: 'DENTRO_DA_VALIDADE',
      permite_avancar: true,
    });
  });

  it('compara corretamente a virada do ano', () => {
    const data = criarData('2027-01-01');

    expect(
      verificarVencimento(data, '2026-12-31')
        .situacao
    ).toBe('DENTRO_DA_VALIDADE');
  });

  it('não altera a data recebida', () => {
    const data = criarData('2026-11-10');
    const copia = { ...data };

    verificarVencimento(data, referencia);

    expect(data).toEqual(copia);
  });
});
