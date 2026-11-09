
import { useEffect, useRef, useState } from 'react';

import { CameraController } from '../components/camera/CameraController';
import ConfirmacaoValidadeView from '../components/confirmacao/ConfirmacaoValidadeView';

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
  // ---- ESTADOS DA INFERÊNCIA ----

  const [estado, setEstado] =
    useState<EstadoInferencia>('AGUARDANDO_IMAGEM');

  const [resposta, setResposta] =
    useState<RespostaInferenciaSucesso | null>(null);

  const [erro, setErro] =
    useState<string | null>(null);

  const [imagemUrl, setImagemUrl] =
    useState<string | null>(null);

  // ---- ESTADOS DA CONFIRMAÇÃO HUMANA ----

  const [estadoConfirmacao, setEstadoConfirmacao] =
    useState<EstadoConfirmacao>('AGUARDANDO_CONFIRMACAO');

  const [valorEdicao, setValorEdicao] =
    useState<string>('');

  const [confirmacaoVigente, setConfirmacaoVigente] =
    useState<DataConfirmadaUsuario | null>(null);

  const [evidenciasAbertas, setEvidenciasAbertas] =
    useState(false);

  // ---- REFS ----

  const urlRef = useRef<string | null>(null);

  // Impede requisições duplicadas da mesma operação.
  const processandoRef = useRef(false);

  // Impede atualização de estado após desmontagem.
  const montadoRef = useRef(true);

  const resultadoRecorteRef =
    useRef<ResultadoRecorte | null>(null);

  const imagemAceitaRef = useRef(false);

  // DEC-INT-10-07:
  // Proteção síncrona contra confirmações duplicadas.
  const travaConfirmacaoRef = useRef(false);

  // Espelho síncrono da confirmação vigente.
  // Evita depender exclusivamente da atualização
  // assíncrona do useState em eventos consecutivos.
  const confirmacaoAtualRef =
    useRef<DataConfirmadaUsuario | null>(null);

  // ---- CICLO DE VIDA ----

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

  // ---- CONTROLE INTERNO DA CONFIRMAÇÃO ----

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

    // A trava é ativada antes da produção do contrato.
    travaConfirmacaoRef.current = true;

    const confirmacao: DataConfirmadaUsuario = {
      data_confirmada: data,
      origem_confirmacao: origem,
      confirmada: true,
    };

    atualizarConfirmacao(confirmacao);
    setEstadoConfirmacao('CONFIRMADA');

    // Integração com o Grupo 4 será adicionada depois.
    console.log(
      'Data confirmada pelo operador:',
      confirmacao,
    );
  }

  // ---- AQUISIÇÃO E INFERÊNCIA ----

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

    // Reinicia o ciclo de confirmação da operação.
    reiniciarConfirmacao();

    // Preserva a imagem recortada para a interface.
    const novaUrl = URL.createObjectURL(resultado.blob);

    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
    }

    urlRef.current = novaUrl;
    setImagemUrl(novaUrl);

    try {
      const resultadoInferencia = await processarValidade(
        resultado.blob,
      );

      if (!montadoRef.current) return;

      setResposta(resultadoInferencia);

      // Abstenção controlada:
      // edição manual imediata, sem nova inferência.
      if (
        resultadoInferencia.dados.data_validade === null
      ) {
        setEstadoConfirmacao('EDITANDO');
        setValorEdicao('');
      } else {
        setEstadoConfirmacao('AGUARDANDO_CONFIRMACAO');
        setValorEdicao('');
      }

      setEstado('SUCESSO');

      console.log(
        'Inferência concluída:',
        resultadoInferencia,
      );
    } catch (error: unknown) {
      if (!montadoRef.current) return;

      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir a análise da imagem.';

      setErro(mensagem);
      setEstado('ERRO');

      console.error('Erro na inferência:', error);
    } finally {
      processandoRef.current = false;
    }
  }

  // ---- CONFIRMAÇÃO DIRETA ----

  function confirmarSugestao(): void {
    if (
      estado !== 'SUCESSO' ||
      estadoConfirmacao !== 'AGUARDANDO_CONFIRMACAO'
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

  // ---- EDIÇÃO MANUAL ----

  function iniciarEdicao(): void {
    if (
      estado !== 'SUCESSO' ||
      estadoConfirmacao === 'EDITANDO'
    ) {
      return;
    }

    // DEC-INT-10-09:
    // Última confirmação vigente tem prioridade.
    const valorInicial =
      confirmacaoAtualRef.current?.data_confirmada ??
      resposta?.dados.data_validade ??
      '';

    setValorEdicao(valorInicial);
    setEstadoConfirmacao('EDITANDO');

    // Abrir a edição não invalida a confirmação
    // nem libera a trava.
  }

  function alterarEdicao(valor: string): void {
    if (
      estado !== 'SUCESSO' ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    // DEC-INT-10-04:
    // Comparação textual exata, sem normalização.
    if (valor === valorEdicao) {
      return;
    }

    setValorEdicao(valor);

    if (confirmacaoAtualRef.current !== null) {
      // DEC-RF22-01:
      // Primeira alteração efetiva invalida a
      // confirmação anterior.
      atualizarConfirmacao(null);

      // DEC-INT-10-07:
      // Libera uma nova confirmação explícita.
      travaConfirmacaoRef.current = false;
    }
  }

  function confirmarEdicao(): void {
    if (
      estado !== 'SUCESSO' ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    if (confirmacaoAtualRef.current !== null) {
      return;
    }

    // trim() verifica apenas se o campo está vazio.
    // O valor confirmado permanece textual e original.
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
      estado !== 'SUCESSO' ||
      estadoConfirmacao !== 'EDITANDO'
    ) {
      return;
    }

    const confirmacao = confirmacaoAtualRef.current;

    // DEC-INT-10-03:
    // Cancelamento sem invalidação.
    if (confirmacao !== null) {
      setValorEdicao(confirmacao.data_confirmada);
      setEstadoConfirmacao('CONFIRMADA');
      return;
    }

    // DEC-INT-10-10:
    // Cancelamento após invalidação restaura
    // a sugestão original da IA.
    const sugestaoOriginal =
      resposta?.dados.data_validade ?? null;

    setValorEdicao(sugestaoOriginal ?? '');

    if (sugestaoOriginal === null) {
      setEstadoConfirmacao('EDITANDO');
    } else {
      setEstadoConfirmacao('AGUARDANDO_CONFIRMACAO');
    }

    // Não restaura confirmação invalidada.
    // Não produz novo contrato.
    // Não encaminha dados ao Grupo 4.
  }

  // ---- EVIDÊNCIAS ----

  function alternarEvidencias(
    abertas: boolean,
  ): void {
    setEvidenciasAbertas(abertas);
  }

  // ---- RENDERIZAÇÃO ----

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

      {estado === 'SUCESSO' && resposta && imagemUrl && (
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

      {estado === 'ERRO' && (
        <section
          role="alert"
          style={{
            maxWidth: 700,
            margin: '24px auto',
            padding: 16,
          }}
        >
          <h2>Falha na análise</h2>

          <p>
            Não foi possível concluir a análise da imagem.
          </p>

          {erro && <p>Detalhes: {erro}</p>}
        </section>
      )}
    </>
  );
}

export default CapturaPage;
