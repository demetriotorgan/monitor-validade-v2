
import { describe, expect, it } from 'vitest';

import type { DataCandidata } from '../../types/validade.types';

import { normalizarData } from './normalizarData';
import { verificarCoerenciaFabricacao } from './verificarCoerenciaFabricacao';

function obterValidade(data: string) {
  const resultado = normalizarData(data);

  if (!resultado.sucesso) {
    throw new Error('Data de teste inválida');
  }

  return resultado.valor;
}

function fabricacao(data: string): DataCandidata {
  return {
    data,
    ancora: 'F',
    interpretacao: 'FABRICACAO',
  };
}

describe('RF28-03 — Coerência com fabricação', () => {

  const validade = obterValidade('21/10/2027');

  it('não exige fabricação para continuar', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [],
    });

    expect(resultado).toEqual({
      situacao: 'SEM_FABRICACAO',
      requer_revisao: false,
      fabricacoes_consideradas: [],
    });
  });

  it('considera fabricação anterior coerente', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [fabricacao('20/10/2027')],
    });

    expect(resultado.situacao).toBe('COERENTE');
    expect(resultado.requer_revisao).toBe(false);
  });

  it('considera fabricação igual à validade coerente', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [fabricacao('21/10/2027')],
    });

    expect(resultado.situacao).toBe('COERENTE');
  });

  it('identifica fabricação posterior à validade', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [fabricacao('22/10/2027')],
    });

    expect(resultado.situacao).toBe('INCOERENTE');
    expect(resultado.requer_revisao).toBe(true);
  });

  it('exige revisão para múltiplas fabricações distintas', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [
        fabricacao('19/10/2027'),
        fabricacao('20/10/2027'),
      ],
    });

    expect(resultado.situacao).toBe(
      'REVISAO_NECESSARIA'
    );

    expect(resultado.requer_revisao).toBe(true);
  });

  it('não escolhe fabricação entre datas conflitantes', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [
        fabricacao('20/10/2027'),
        fabricacao('22/10/2027'),
      ],
    });

    expect(resultado.situacao).toBe(
      'REVISAO_NECESSARIA'
    );
  });

  it('não trata representações equivalentes como múltiplas fabricações', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [
        fabricacao('20/10/2027'),
        fabricacao('20.10.27'),
      ],
    });

    expect(resultado.situacao).toBe('COERENTE');

    expect(resultado.fabricacoes_consideradas).toEqual([
      '20/10/2027',
      '20.10.27',
    ]);
  });

  it('exige revisão quando a fabricação é impossível', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [fabricacao('31/02/2027')],
    });

    expect(resultado.situacao).toBe(
      'REVISAO_NECESSARIA'
    );
  });

  it('exige revisão quando a fabricação está incompleta', () => {
    const resultado = verificarCoerenciaFabricacao({
      validade,
      candidatas: [fabricacao('21/10/')],
    });

    expect(resultado.situacao).toBe(
      'REVISAO_NECESSARIA'
    );
  });

  it('preserva as candidatas originais', () => {
    const candidatas = [
      fabricacao('20/10/2027'),
      fabricacao('22/10/2027'),
    ];

    const copia = structuredClone(candidatas);

    verificarCoerenciaFabricacao({
      validade,
      candidatas,
    });

    expect(candidatas).toEqual(copia);
  });
});
