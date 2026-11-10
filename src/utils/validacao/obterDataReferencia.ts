
const FUSO_REFERENCIA = 'America/Sao_Paulo';

/**
 * Obtém a data civil no fuso de referência.
 *
 * Retorna: AAAA-MM-DD
 *
 * A data é obtida no momento da chamada,
 * não na inicialização da aplicação.
 */
export function obterDataReferencia(
  instante: Date = new Date()
): string {
  const formatador = new Intl.DateTimeFormat(
    'en-US',
    {
      timeZone: FUSO_REFERENCIA,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  );

  const partes = formatador.formatToParts(instante);

  const obterParte = (tipo: string): string => {
    const parte = partes.find(
      (item) => item.type === tipo
    );

    if (!parte) {
      throw new Error(
        `Componente de data ausente: ${tipo}`
      );
    }

    return parte.value;
  };

  const ano = obterParte('year');
  const mes = obterParte('month');
  const dia = obterParte('day');

  return `${ano}-${mes}-${dia}`;
}
