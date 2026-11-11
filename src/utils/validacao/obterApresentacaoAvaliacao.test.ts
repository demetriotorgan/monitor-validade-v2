
import { describe, expect, it } from 'vitest';

import { obterApresentacaoAvaliacao } from './obterApresentacaoAvaliacao';

import type {
  ResultadoAvaliacaoValidade,
} from '../../types/validacao.types';

describe('RF-31 — Apresentação da avaliação', () => {

  it('apresenta corretamente uma data aprovada', () => {
    const resultado: ResultadoAvaliacaoValidade = {
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
    };

    const apresentacao =
      obterApresentacaoAvaliacao(resultado);

    expect(apresentacao).toEqual({
      mensagem: 'Data de validade validada com sucesso.',
      acao: 'PROSSEGUIR',
      rotuloBotao: 'Prosseguir',
    });
  });

  const casosCorrecao: {
    motivo: Extract<
      ResultadoAvaliacaoValidade,
      { acao_recomendada: 'CORRIGIR_DATA' }
    >['motivo'];
    situacao: 'REJEITADO' | 'REVISAO_NECESSARIA';
    mensagem: string;
  }[] = [
    {
      motivo: 'FORMATO_NAO_SUPORTADO',
      situacao: 'REJEITADO',
      mensagem:
        'O formato da data não foi reconhecido. Corrija a data informada.',
    },
    {
      motivo: 'DATA_INCOMPLETA',
      situacao: 'REVISAO_NECESSARIA',
      mensagem:
        'A data está incompleta. Informe dia, mês e ano.',
    },
    {
      motivo: 'DATA_AMBIGUA',
      situacao: 'REVISAO_NECESSARIA',
      mensagem:
        'Não foi possível determinar a data com segurança. Verifique e corrija a informação.',
    },
    {
      motivo: 'DATA_CALENDARIO_INVALIDA',
      situacao: 'REJEITADO',
      mensagem:
        'A data informada não existe no calendário.',
    },
    {
      motivo: 'PRODUTO_VENCIDO',
      situacao: 'REJEITADO',
      mensagem:
        'O produto está vencido e não pode ser cadastrado com esta validade.',
    },
  ];

  it.each(casosCorrecao)(
    'apresenta corretamente $motivo',
    ({ motivo, situacao, mensagem }) => {
      const resultado = {
        situacao,
        motivo,
        acao_recomendada: 'CORRIGIR_DATA',
      } as ResultadoAvaliacaoValidade;

      const apresentacao =
        obterApresentacaoAvaliacao(resultado);

      expect(apresentacao).toEqual({
        mensagem,
        acao: 'CORRIGIR_DATA',
        rotuloBotao: 'Corrigir data',
      });
    },
  );

  it('orienta a revisão de fabricação incoerente', () => {
    const resultado: ResultadoAvaliacaoValidade = {
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_INCOERENTE',
      acao_recomendada: 'REVISAR_FABRICACAO',
    };

    const apresentacao =
      obterApresentacaoAvaliacao(resultado);

    expect(apresentacao).toEqual({
      mensagem:
        'A data de fabricação identificada é posterior à validade. Verifique a validade informada. Se estiver correta, não será possível prosseguir com este cadastro.',
      acao: 'REVISAR_FABRICACAO',
      rotuloBotao: 'Verificar validade',
    });
  });

  it('orienta a revisão quando a fabricação exige análise', () => {
    const resultado: ResultadoAvaliacaoValidade = {
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_REVISAO_NECESSARIA',
      acao_recomendada: 'REVISAR_FABRICACAO',
    };

    const apresentacao =
      obterApresentacaoAvaliacao(resultado);

    expect(apresentacao).toEqual({
      mensagem:
        'Há informações de fabricação que precisam de revisão. Verifique a validade informada. Se a inconsistência persistir, encerre esta tentativa.',
      acao: 'REVISAR_FABRICACAO',
      rotuloBotao: 'Verificar validade',
    });
  });

  it('preserva a ação recomendada pelo RF-30', () => {
    const resultado: ResultadoAvaliacaoValidade = {
      situacao: 'REJEITADO',
      motivo: 'PRODUTO_VENCIDO',
      acao_recomendada: 'CORRIGIR_DATA',
    };

    const apresentacao =
      obterApresentacaoAvaliacao(resultado);

    expect(apresentacao.acao).toBe(
      resultado.acao_recomendada,
    );
  });

  it('não modifica o resultado recebido', () => {
    const resultado: ResultadoAvaliacaoValidade = {
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'DATA_INCOMPLETA',
      acao_recomendada: 'CORRIGIR_DATA',
    };

    const copia = structuredClone(resultado);

    obterApresentacaoAvaliacao(resultado);

    expect(resultado).toEqual(copia);
  });

});
