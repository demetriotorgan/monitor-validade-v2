
import { describe, expect, it } from 'vitest';

import type { DataCandidata } from '../../types/validade.types';

import { prepararCandidatasFabricacao } from './prepararCandidatasFabricacao';

function candidata(
  data: string,
  interpretacao: DataCandidata['interpretacao'] = 'FABRICACAO'
): DataCandidata {
  return {
    data,
    ancora: 'F',
    interpretacao,
  };
}

describe('RF28-02 — Preparação de fabricação', () => {

  it('retorna listas vazias sem candidatas', () => {
    expect(prepararCandidatasFabricacao([])).toEqual({
      fabricacoes: [],
      candidatas_invalidas: [],
      candidatas_originais: [],
    });
  });

  it('ignora candidatas que não são fabricação', () => {
  const resultado = prepararCandidatasFabricacao([
    candidata('21/10/2027', 'VALIDADE'),
    candidata('20/10/2027', 'INDETERMINADA'),
  ]);

  expect(resultado.fabricacoes).toEqual([]);
  expect(resultado.candidatas_originais).toEqual([]);
});

  it('normaliza uma fabricação válida', () => {
    const resultado = prepararCandidatasFabricacao([
      candidata('20/10/2027'),
    ]);

    expect(resultado.fabricacoes).toEqual([
      {
        data_iso: '2027-10-20',
        representacoes_originais: ['20/10/2027'],
      },
    ]);
  });

  it('deduplica representações equivalentes', () => {
    const resultado = prepararCandidatasFabricacao([
      candidata('21/09/2027'),
      candidata('21.09.27'),
    ]);

    expect(resultado.fabricacoes).toHaveLength(1);

    expect(resultado.fabricacoes[0]).toEqual({
      data_iso: '2027-09-21',
      representacoes_originais: [
        '21/09/2027',
        '21.09.27',
      ],
    });
  });

  it('preserva fabricações distintas', () => {
    const resultado = prepararCandidatasFabricacao([
      candidata('20/10/2027'),
      candidata('19/10/2027'),
    ]);

    expect(resultado.fabricacoes).toHaveLength(2);
  });

  it('identifica fabricação com data impossível', () => {
    const resultado = prepararCandidatasFabricacao([
      candidata('31/02/2027'),
    ]);

    expect(resultado.fabricacoes).toEqual([]);

    expect(resultado.candidatas_invalidas).toEqual([
      '31/02/2027',
    ]);
  });

  it('identifica fabricação incompleta', () => {
    const resultado = prepararCandidatasFabricacao([
      candidata('21/10/'),
    ]);

    expect(resultado.candidatas_invalidas).toEqual([
      '21/10/',
    ]);
  });

  it('preserva as candidatas originais', () => {
    const candidatas = [
      candidata('21/09/2027'),
      candidata('21.09.27'),
    ];

    const copia = structuredClone(candidatas);

    prepararCandidatasFabricacao(candidatas);

    expect(candidatas).toEqual(copia);
  });
});
