
import { describe, expect, it } from 'vitest';

import type {
  EntradaAvaliacaoValidade,
} from '../../types/validacao.types';

import type {
  DataCandidata,
} from '../../types/validade.types';

import { avaliarValidade } from './avaliarValidade';

const REFERENCIA = '2027-10-20';

function fabricacao(data: string): DataCandidata {
  return {
    data,
    ancora: 'F',
    interpretacao: 'FABRICACAO',
  };
}

function validadeIA(data: string): DataCandidata {
  return {
    data,
    ancora: 'V',
    interpretacao: 'VALIDADE',
  };
}

function criarEntrada(
  alteracoes: Partial<EntradaAvaliacaoValidade> = {}
): EntradaAvaliacaoValidade {
  return {
    dataConfirmada: '21/10/2027',
    candidatas: [],
    dataReferenciaISO: REFERENCIA,
    ...alteracoes,
  };
}

describe('RF30-04 — Avaliação consolidada', () => {

  it('aprova uma validade futura sem fabricação', () => {
    const resultado = avaliarValidade(criarEntrada());

    expect(resultado).toEqual({
      situacao: 'APROVADO',
      motivo: 'DATA_APROVADA',
      acao_recomendada: 'PROSSEGUIR',
      data_normalizada: {
        data_original: '21/10/2027',
        dia: 21,
        mes: 10,
        ano: 2027,
        data_iso: '2027-10-21',
      },
    });
  });

  it('permite validade igual à data de referência', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '20/10/2027',
      })
    );

    expect(resultado.situacao).toBe('APROVADO');
  });

  it('rejeita produto vencido', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '19/10/2027',
      })
    );

    expect(resultado).toEqual({
      situacao: 'REJEITADO',
      motivo: 'PRODUTO_VENCIDO',
      acao_recomendada: 'CORRIGIR_DATA',
    });
  });

  it('solicita correção para data incompleta', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '21/10/',
      })
    );

    expect(resultado).toEqual({
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'DATA_INCOMPLETA',
      acao_recomendada: 'CORRIGIR_DATA',
    });
  });

  it('solicita correção para ambiguidade explícita', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        interpretacaoAmbigua: true,
      })
    );

    expect(resultado).toEqual({
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'DATA_AMBIGUA',
      acao_recomendada: 'CORRIGIR_DATA',
    });
  });

  it('rejeita formato não suportado', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '21/10.2027',
      })
    );

    expect(resultado).toEqual({
      situacao: 'REJEITADO',
      motivo: 'FORMATO_NAO_SUPORTADO',
      acao_recomendada: 'CORRIGIR_DATA',
    });
  });

  it('rejeita data calendariamente impossível', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '31/02/2027',
      })
    );

    expect(resultado).toEqual({
      situacao: 'REJEITADO',
      motivo: 'DATA_CALENDARIO_INVALIDA',
      acao_recomendada: 'CORRIGIR_DATA',
    });
  });

  it('aprova fabricação anterior à validade', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        candidatas: [fabricacao('20/10/2027')],
      })
    );

    expect(resultado.situacao).toBe('APROVADO');
  });

  it('solicita revisão para fabricação posterior', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        candidatas: [fabricacao('22/10/2027')],
      })
    );

    expect(resultado).toEqual({
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_INCOERENTE',
      acao_recomendada: 'REVISAR_FABRICACAO',
    });
  });

  it('solicita revisão para múltiplas fabricações', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        candidatas: [
          fabricacao('18/10/2027'),
          fabricacao('19/10/2027'),
        ],
      })
    );

    expect(resultado).toEqual({
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_REVISAO_NECESSARIA',
      acao_recomendada: 'REVISAR_FABRICACAO',
    });
  });

  it('preserva a data confirmada pelo operador', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '25/10/2027',
        candidatas: [
          validadeIA('21/10/2027'),
        ],
      })
    );

    expect(resultado.situacao).toBe('APROVADO');

    if (resultado.situacao === 'APROVADO') {
      expect(resultado.data_normalizada.data_iso)
        .toBe('2027-10-25');
    }
  });

  it('prioriza produto vencido sobre fabricação incoerente', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '19/10/2027',
        candidatas: [
          fabricacao('22/10/2027'),
        ],
      })
    );

    expect(resultado.motivo).toBe('PRODUTO_VENCIDO');
  });

  it('prioriza calendário inválido sobre vencimento', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '31/02/2027',
        candidatas: [
          fabricacao('22/10/2027'),
        ],
      })
    );

    expect(resultado.motivo).toBe(
      'DATA_CALENDARIO_INVALIDA'
    );
  });

  it('não retorna data normalizada quando rejeitado', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        dataConfirmada: '19/10/2027',
      })
    );

    expect(resultado).not.toHaveProperty(
      'data_normalizada'
    );
  });

  it('não retorna data normalizada quando exige revisão', () => {
    const resultado = avaliarValidade(
      criarEntrada({
        candidatas: [
          fabricacao('22/10/2027'),
        ],
      })
    );

    expect(resultado).not.toHaveProperty(
      'data_normalizada'
    );
  });

  it('não modifica os dados de entrada', () => {
    const entrada = criarEntrada({
      candidatas: [
        fabricacao('20/10/2027'),
        validadeIA('21/10/2027'),
      ],
    });

    const copia = structuredClone(entrada);

    avaliarValidade(entrada);

    expect(entrada).toEqual(copia);
  });

});
