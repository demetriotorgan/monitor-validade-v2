
import { describe, expect, it } from 'vitest';

import { obterDataReferencia } from './obterDataReferencia';

describe('RF-27 — Data civil de referência', () => {
  it('converte UTC para a data civil de São Paulo', () => {
    const instante = new Date(
      '2026-11-11T01:30:00Z'
    );

    expect(
      obterDataReferencia(instante)
    ).toBe('2026-11-10');
  });

  it('reconhece a virada do dia em São Paulo', () => {
    const instante = new Date(
      '2026-11-11T03:30:00Z'
    );

    expect(
      obterDataReferencia(instante)
    ).toBe('2026-11-11');
  });

  it('preserva a data civil após a virada do ano', () => {
    const instante = new Date(
      '2027-01-01T01:00:00Z'
    );

    expect(
      obterDataReferencia(instante)
    ).toBe('2026-12-31');
  });
});
