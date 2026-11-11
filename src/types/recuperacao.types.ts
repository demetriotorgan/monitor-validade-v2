
import type {
  DataConfirmadaUsuario,
  EstadoConfirmacao,
} from './confirmacao.types';

import type {
  ApresentacaoAvaliacao,
} from './validacao.types';

/**
 * CT-INT-11 — Recuperação técnica da inferência.
 *
 * Contrato de propriedades da interface responsável
 * pela recuperação manual após falha técnica da IA.
 *
 * DEC-INT-11-01:
 * Recuperação exclusivamente manual, sem nova inferência.
 *
 * DEC-INT-11-02:
 * Recuperação técnica não produz métricas RF-24.
 *
 * DEC-INT-11-03:
 * Interface apresentacional independente.
 *
 * DEC-INT-11-04:
 * Mensagem amigável com detalhes técnicos expansíveis.
 */
export interface RecuperacaoValidadeViewProps {

  /**
   * URL da imagem recortada preservada após
   * a falha da inferência.
   */
  imagemUrl: string;

  /**
   * Mensagem técnica da falha.
   *
   * Será apresentada em uma seção expansível,
   * inicialmente fechada.
   */
  mensagemErro: string;

  /**
   * Estado funcional da confirmação humana.
   *
   * Na recuperação técnica são utilizados:
   * - EDITANDO
   * - CONFIRMADA
   *
   * AGUARDANDO_CONFIRMACAO não deve ser
   * produzido nesse fluxo.
   */
  estadoConfirmacao: EstadoConfirmacao;

  /**
   * Texto informado manualmente pelo operador.
   *
   * Não sofre normalização nesta etapa.
   */
  valorEdicao: string;

  /**
   * Confirmação humana vigente.
   *
   * Pode permanecer preenchida durante EDITANDO
   * até ocorrer uma alteração textual efetiva.
   */
  confirmacaoVigente: DataConfirmadaUsuario | null;


  


  /**
   * Comunica alterações textuais à CapturaPage.
   */
  onAlterarEdicao: (valor: string) => void;

  /**
   * Solicita confirmação explícita da data manual.
   */
  onConfirmarEdicao: () => void;

  /**
   * Permite iniciar uma nova edição após
   * uma confirmação humana.
   */
  onIniciarEdicao: () => void; 

  /**
 * DEC-G4-26 — Encerra a tentativa atual
 * e retorna à captura de imagem.
 */
  onCancelarTentativa: () => void;

  /**
 * RF31-05 — Resultado visual da avaliação.
 */
  apresentacaoAvaliacao: ApresentacaoAvaliacao | null;

  /**
   * Executa a ação recomendada pelo RF-31.
   */
  onExecutarAcaoAvaliacao: () => void;

}
