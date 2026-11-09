
import { useEffect, useRef, useState } from 'react';

import { CameraController } from '../components/camera/CameraController';

import ConfirmacaoValidadeView from '../components/confirmacao/ConfirmacaoValidadeView';

import RecuperacaoValidadeView from '../components/confirmacao/RecuperacaoValidadeView';

import { processarValidade } from '../services/validadeApi';

import type { ResultadoRecorte } from '../services/recorte';

import type {
  EstadoInferencia,
  RespostaInferenciaSucesso,
} from '../types/validade.types';

import type {
  DataConfirmadaUsuario,
  EstadoConfirmacao,
  OrigemConfirmacao,
} from '../types/confirmacao.types';

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

  const [reedicaoEmAndamento, setReedicaoEmAndamento] =
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
    setReedicaoEmAndamento(false);
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
    setReedicaoEmAndamento(false);

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
      setReedicaoEmAndamento(false);

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

    setReedicaoEmAndamento(
      confirmacaoAtualRef.current !== null,
    );

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

  function cancelarEdicao(): void {
    if (
      (estado !== 'SUCESSO' && estado !== 'ERRO') ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    const confirmacao = confirmacaoAtualRef.current;

    if (confirmacao !== null) {
      setValorEdicao(confirmacao.data_confirmada);
      setEstadoConfirmacao('CONFIRMADA');
      setReedicaoEmAndamento(false);
      return;
    }

    // Recuperação técnica:
    // não existe sugestão original da IA.
    if (estado === 'ERRO') {
      setValorEdicao('');
      setEstadoConfirmacao('EDITANDO');
      setReedicaoEmAndamento(false);
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

    setReedicaoEmAndamento(false);
  }

  function alternarEvidencias(
    abertas: boolean,
  ): void {
    setEvidenciasAbertas(abertas);
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
          />
        )}

      {estado === 'ERRO' && imagemUrl && (
        <RecuperacaoValidadeView
          imagemUrl={imagemUrl}
          mensagemErro={
            erro ??
            'Falha técnica não especificada.'
          }
          estadoConfirmacao={estadoConfirmacao}
          valorEdicao={valorEdicao}
          confirmacaoVigente={confirmacaoVigente}
          reedicaoEmAndamento={reedicaoEmAndamento}
          onAlterarEdicao={alterarEdicao}
          onConfirmarEdicao={confirmarEdicao}
          onIniciarEdicao={iniciarEdicao}
          onCancelarEdicao={cancelarEdicao}
        />
      )}
    </>
  );
}

export default CapturaPage;
