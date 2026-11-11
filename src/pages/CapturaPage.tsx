
import { useEffect, useRef, useState } from 'react';

import { CameraController } from '../components/camera/CameraController';

import ConfirmacaoValidadeView from '../components/confirmacao/ConfirmacaoValidadeView';

import RecuperacaoValidadeView from '../components/confirmacao/RecuperacaoValidadeView';

import { processarValidade } from '../services/validadeApi';

import type { ResultadoRecorte } from '../services/recorte';

import { avaliarValidade } from '../utils/validacao/avaliarValidade';

import { obterDataReferencia } from '../utils/validacao/obterDataReferencia';

import { obterApresentacaoAvaliacao } from '../utils/validacao/obterApresentacaoAvaliacao';

import type {
  EstadoInferencia,
  RespostaInferenciaSucesso,
} from '../types/validade.types';

import type {
  DataConfirmadaUsuario,
  EstadoConfirmacao,
  OrigemConfirmacao,
} from '../types/confirmacao.types';

import type {
  ResultadoAvaliacaoValidade,
  ApresentacaoAvaliacao,
} from '../types/validacao.types';

export function CapturaPage() {
  const [estado, setEstado] =
    useState<EstadoInferencia>('AGUARDANDO_IMAGEM');

  const [resposta, setResposta] =
    useState<RespostaInferenciaSucesso | null>(null);

  const [erro, setErro] =
    useState<string | null>(null);

  const [imagemUrl, setImagemUrl] =
    useState<string | null>(null);

  const [estadoConfirmacao, setEstadoConfirmacao] =
    useState<EstadoConfirmacao>('AGUARDANDO_CONFIRMACAO');

  const [valorEdicao, setValorEdicao] =
    useState<string>('');

  const [confirmacaoVigente, setConfirmacaoVigente] =
    useState<DataConfirmadaUsuario | null>(null);

  const [evidenciasAbertas, setEvidenciasAbertas] =
    useState(false);  

  const [resultadoAvaliacao, setResultadoAvaliacao] =
    useState<ResultadoAvaliacaoValidade | null>(null);

  const [apresentacaoAvaliacao, setApresentacaoAvaliacao] =
    useState<ApresentacaoAvaliacao | null>(null);
  /**
* DEC-G4-24 — Identifica edição iniciada
* após bloqueio do RF-30.
*/
  const [edicaoAposBloqueio, setEdicaoAposBloqueio] =
    useState(false);

  const urlRef = useRef<string | null>(null);
  const processandoRef = useRef(false);
  const montadoRef = useRef(true);

  const resultadoRecorteRef =
    useRef<ResultadoRecorte | null>(null);

  const imagemAceitaRef = useRef(false);
  const travaConfirmacaoRef = useRef(false);

  const confirmacaoAtualRef =
    useRef<DataConfirmadaUsuario | null>(null);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      resultadoRecorteRef.current = null;
    };
  }, []);

  function atualizarConfirmacao(
    confirmacao: DataConfirmadaUsuario | null,
  ): void {
    confirmacaoAtualRef.current = confirmacao;
    setConfirmacaoVigente(confirmacao);
  }

  function reiniciarConfirmacao(): void {
    atualizarConfirmacao(null);

    travaConfirmacaoRef.current = false;

    setEstadoConfirmacao('AGUARDANDO_CONFIRMACAO');
    setValorEdicao('');
    setEvidenciasAbertas(false);    

    setResultadoAvaliacao(null);
    setApresentacaoAvaliacao(null);
    setEdicaoAposBloqueio(false);
  }

  function registrarConfirmacao(
    data: string,
    origem: OrigemConfirmacao,
  ): void {
    if (
      travaConfirmacaoRef.current ||
      confirmacaoAtualRef.current !== null
    ) {
      return;
    }

    if (data.trim().length === 0) {
      return;
    }

    travaConfirmacaoRef.current = true;

    const confirmacao: DataConfirmadaUsuario = {
      data_confirmada: data,
      origem_confirmacao: origem,
      confirmada: true,
    };

    atualizarConfirmacao(confirmacao);
    setEstadoConfirmacao('CONFIRMADA');    
    setEdicaoAposBloqueio(false);

    // RF-30 + RF-31:
    // Avaliação após confirmação humana.
    executarAvaliacao(confirmacao);

    console.log(
      'Data confirmada pelo operador:',
      confirmacao,
    );
  }

  async function receberImagem(
    resultado: ResultadoRecorte,
  ): Promise<void> {
    if (
      processandoRef.current ||
      imagemAceitaRef.current
    ) {
      return;
    }

    if (resultado.blob.size === 0) {
      return;
    }

    imagemAceitaRef.current = true;
    processandoRef.current = true;

    resultadoRecorteRef.current = resultado;

    setEstado('PROCESSANDO');
    setResposta(null);
    setErro(null);

    reiniciarConfirmacao();

    const novaUrl = URL.createObjectURL(resultado.blob);

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    urlRef.current = novaUrl;
    setImagemUrl(novaUrl);

    try {
      const resultadoInferencia =
        await processarValidade(resultado.blob);

      if (!montadoRef.current) {
        return;
      }

      setResposta(resultadoInferencia);

      if (
        resultadoInferencia.dados.data_validade === null
      ) {
        setEstadoConfirmacao('EDITANDO');
        setValorEdicao('');
      } else {
        setEstadoConfirmacao(
          'AGUARDANDO_CONFIRMACAO',
        );
        setValorEdicao('');
      }

      setEstado('SUCESSO');

      console.log(
        'Inferência concluída:',
        resultadoInferencia,
      );
    } catch (error: unknown) {
      if (!montadoRef.current) {
        return;
      }

      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a análise da imagem.';

      setResposta(null);
      setErro(mensagem);

      // DEC-INT-11-01:
      // Recuperação manual após falha técnica.
      setEstadoConfirmacao('EDITANDO');
      setValorEdicao('');      

      setEstado('ERRO');

      console.error(
        'Erro na inferência:',
        error,
      );
    } finally {
      processandoRef.current = false;
    }
  }

  function confirmarSugestao(): void {
    if (
      estado !== 'SUCESSO' ||
      estadoConfirmacao !==
      'AGUARDANDO_CONFIRMACAO'
    ) {
      return;
    }

    const data = resposta?.dados.data_validade;

    if (data === null || data === undefined) {
      return;
    }

    registrarConfirmacao(
      data,
      'CONFIRMACAO_DIRETA',
    );
  }

  function iniciarEdicao(): void {
    if (
      (estado !== 'SUCESSO' && estado !== 'ERRO') ||
      estadoConfirmacao === 'EDITANDO'
    ) {
      return;
    }

    const valorInicial =
      confirmacaoAtualRef.current?.data_confirmada ??
      resposta?.dados.data_validade ??
      '';

    setValorEdicao(valorInicial);    

    setEstadoConfirmacao('EDITANDO');
  }

  function alterarEdicao(valor: string): void {
    if (
      (estado !== 'SUCESSO' && estado !== 'ERRO') ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    if (valor === valorEdicao) {
      return;
    }

    setValorEdicao(valor);

    // CT-INT-10:
    // Primeira alteração textual efetiva invalida
    // a confirmação humana anterior.
    if (confirmacaoAtualRef.current !== null) {
      atualizarConfirmacao(null);
      travaConfirmacaoRef.current = false;

      // A avaliação anterior deixa de ser vigente.
      setResultadoAvaliacao(null);
      setApresentacaoAvaliacao(null);
    }
  }

  function confirmarEdicao(): void {
    if (
      (estado !== 'SUCESSO' && estado !== 'ERRO') ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    if (confirmacaoAtualRef.current !== null) {
      return;
    }

    if (valorEdicao.trim().length === 0) {
      return;
    }

    registrarConfirmacao(
      valorEdicao,
      'CORRECAO_MANUAL',
    );
  }

  /**
 * Recuperação humana sem sugestão principal.
 *
 * Quando a IA não identifica uma validade,
 * cancelar a edição encerra a tentativa.
 */

  function cancelarEdicao(): void {
    if (
      estado === 'SUCESSO' &&
      resposta?.dados.data_validade === null &&
      confirmacaoAtualRef.current === null
    ) {
      encerrarTentativa();
      return;
    }

    /**
 * DEC-G4-24:
 * Cancelar edição iniciada após bloqueio
 * encerra a tentativa de cadastro.
 */
    if (edicaoAposBloqueio) {
      encerrarTentativa();
      return;
    }

    const confirmacao = confirmacaoAtualRef.current;

    if (confirmacao !== null) {
      setValorEdicao(confirmacao.data_confirmada);
      setEstadoConfirmacao('CONFIRMADA');      
      return;
    }

    /**
  * Recuperação após falha técnica.
  *
  * Sem confirmação vigente, cancelar
  * encerra a tentativa.
  */
    if (estado === 'ERRO') {
      encerrarTentativa();
      return;
    }

    // Inferência válida:
    // restaura a sugestão original.
    const sugestaoOriginal =
      resposta?.dados.data_validade ?? null;

    setValorEdicao(sugestaoOriginal ?? '');

    if (sugestaoOriginal === null) {
      setEstadoConfirmacao('EDITANDO');
    } else {
      setEstadoConfirmacao(
        'AGUARDANDO_CONFIRMACAO',
      );
    }    
  }

  function alternarEvidencias(
    abertas: boolean,
  ): void {
    setEvidenciasAbertas(abertas);
  }

  function executarAvaliacao(
    confirmacao: DataConfirmadaUsuario,
  ): void {
    const candidatas =
      resposta?.dados.datas_candidatas ?? [];

    const dataReferenciaISO =
      obterDataReferencia();

    const resultado = avaliarValidade({
      dataConfirmada: confirmacao.data_confirmada,
      candidatas,
      dataReferenciaISO,
    });

    const apresentacao =
      obterApresentacaoAvaliacao(resultado);

    setResultadoAvaliacao(resultado);
    setApresentacaoAvaliacao(apresentacao);

    console.log('RF-30 — Resultado:', resultado);
    console.log('RF-31 — Apresentação:', apresentacao);
  }


  /**
   * RF31-05 — Executa a ação recomendada
   * pela avaliação consolidada.
   *
   * A aprovação não executa cadastro
   * automaticamente.
   */
  function executarAcaoAvaliacao(): void {
    if (
      estadoConfirmacao !== 'CONFIRMADA' ||
      confirmacaoAtualRef.current === null ||
      resultadoAvaliacao === null ||
      apresentacaoAvaliacao === null
    ) {
      return;
    }

    switch (resultadoAvaliacao.acao_recomendada) {
      case 'CORRIGIR_DATA':
      case 'REVISAR_FABRICACAO':
        setEdicaoAposBloqueio(true);
        iniciarEdicao();
        return;

      case 'PROSSEGUIR':
        if (resultadoAvaliacao.situacao !== 'APROVADO') {
          return;
        }

        // O destino do cadastro será integrado
        // quando essa etapa estiver definida.
        console.log(
          'Validade aprovada para prosseguimento:',
          resultadoAvaliacao.data_normalizada,
        );
        return;
    }
  }


  /**
   * DEC-G4-26 — Encerra a tentativa atual
   * e retorna à captura de imagem.
   */
  function encerrarTentativa(): void {
    // Não encerrar enquanto uma inferência
    // estiver em processamento.
    if (processandoRef.current) {
      return;
    }

    // Libera a URL temporária da imagem.
    if (urlRef.current !== null) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }

    // Descarta a imagem da tentativa.
    resultadoRecorteRef.current = null;
    imagemAceitaRef.current = false;

    setImagemUrl(null);
    setResposta(null);
    setErro(null);

    // Reinicia confirmação e avaliação.
    reiniciarConfirmacao();

    // Retorna ao estado inicial.
    setEstado('AGUARDANDO_IMAGEM');
  }



  return (
    <>
      {estado === 'AGUARDANDO_IMAGEM' && (
        <CameraController
          onImagemAceita={(resultado) => {
            void receberImagem(resultado);
          }}
        />
      )}

      {estado === 'PROCESSANDO' && (
        <section
          role="status"
          aria-live="polite"
          style={{
            maxWidth: 700,
            margin: '24px auto',
            padding: 16,
          }}
        >
          <h2>Analisando imagem...</h2>

          {imagemUrl && (
            <img
              src={imagemUrl}
              alt="Imagem recortada em análise"
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                marginBottom: 16,
              }}
            />
          )}

          <p>
            Aguarde enquanto a IA identifica
            as informações da validade.
          </p>
        </section>
      )}

      {estado === 'SUCESSO' &&
        resposta &&
        imagemUrl && (
          <ConfirmacaoValidadeView
            imagemUrl={imagemUrl}
            dados={resposta.dados}
            estadoConfirmacao={estadoConfirmacao}
            valorEdicao={valorEdicao}
            confirmacaoVigente={confirmacaoVigente}
            evidenciasAbertas={evidenciasAbertas}
            onAlternarEvidencias={alternarEvidencias}
            onConfirmarSugestao={confirmarSugestao}
            onIniciarEdicao={iniciarEdicao}
            onAlterarEdicao={alterarEdicao}
            onConfirmarEdicao={confirmarEdicao}
            onCancelarEdicao={cancelarEdicao}
            apresentacaoAvaliacao={apresentacaoAvaliacao}
            onExecutarAcaoAvaliacao={executarAcaoAvaliacao}
            onCancelarTentativa={encerrarTentativa}
          />
        )}

      {estado === 'ERRO' && imagemUrl && (
        <RecuperacaoValidadeView
          imagemUrl={imagemUrl}
          mensagemErro={
            erro ?? 'Falha técnica não especificada.'
          }
          estadoConfirmacao={estadoConfirmacao}
          valorEdicao={valorEdicao}
          confirmacaoVigente={confirmacaoVigente}
          onAlterarEdicao={alterarEdicao}
          onConfirmarEdicao={confirmarEdicao}
          onIniciarEdicao={iniciarEdicao}
          onCancelarTentativa={encerrarTentativa}
          apresentacaoAvaliacao={apresentacaoAvaliacao}
          onExecutarAcaoAvaliacao={executarAcaoAvaliacao}
        />
      )}
    </>
  );
}

export default CapturaPage;
