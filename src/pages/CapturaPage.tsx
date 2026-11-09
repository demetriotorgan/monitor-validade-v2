
import { useEffect, useRef, useState } from 'react';

import { CameraController } from '../components/camera/CameraController';
import { processarValidade } from '../services/validadeApi';

import type { ResultadoRecorte } from '../services/recorte';

import type { EstadoInferencia, RespostaInferenciaSucesso } from '../types/validade.types';
import type { DataConfirmadaUsuario, EstadoEdicao } from '../types/confirmacao.types';
import ConfirmacaoValidadeView from '../components/confirmacao/ConfirmacaoValidadeView';

export function CapturaPage() {
  //----ESTADOS--------
  const [estado, setEstado] =
    useState<EstadoInferencia>('AGUARDANDO_IMAGEM');

  const [resposta, setResposta] =
    useState<RespostaInferenciaSucesso | null>(null);

  const [erro, setErro] = useState<string | null>(null);

  const [estadoEdicao, setEstadoEdicao] =
    useState<EstadoEdicao>('VISUALIZACAO');

  const [valorEdicao, setValorEdicao] =
    useState('');

  const [evidenciasAbertas, setEvidenciasAbertas] =
    useState(false);

  const [imagemUrl, setImagemUrl] =
    useState<string | null>(null);

  //----REFs--------
  const confirmacaoRef =
  useRef<DataConfirmadaUsuario | null>(null);

  const urlRef = useRef<string | null>(null);

  // Impede requisições duplicadas da mesma operação.
  const processandoRef = useRef(false);

  // Impede atualização de estado após desmontagem.
  const montadoRef = useRef(true);

  const resultadoRecorteRef =
    useRef<ResultadoRecorte | null>(null);

  const imagemAceitaRef = useRef(false);

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

    // Preserva a imagem recortada para a futura
    // interface de confirmação humana.
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

      // Abstenção controlada: edição manual imediata.
      if (
        resultadoInferencia.dados.data_validade === null
      ) {
        setEstadoEdicao('EDITANDO');
        setValorEdicao('');
      } else {
        setEstadoEdicao('VISUALIZACAO');
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

  function confirmarSugestao(): void {
    if (
      confirmacaoRef.current ||
      estadoEdicao === 'EDITANDO'
    ) {
      return;
    }

    const data = resposta?.dados.data_validade;

    if (!data) return;

    const confirmacao: DataConfirmadaUsuario = {
      data_confirmada: data,
      origem_confirmacao: 'CONFIRMACAO_DIRETA',
      confirmada: true,
    };

    confirmacaoRef.current = confirmacao;

    console.log(
      'Data confirmada pelo operador:',
      confirmacao,
    );
  }

   function iniciarEdicao(): void {
    if (confirmacaoRef.current) return;

    setValorEdicao(
      resposta?.dados.data_validade ?? '',
    );

    setEstadoEdicao('EDITANDO');
  }


  function alterarEdicao(valor: string): void {
    // Qualquer alteração invalida confirmação anterior.
    confirmacaoRef.current = null;
    setValorEdicao(valor);
  }

   function confirmarEdicao(): void {
    if (confirmacaoRef.current) return;

    const data = valorEdicao.trim();

    if (!data) return;

    const confirmacao: DataConfirmadaUsuario = {
      data_confirmada: data,
      origem_confirmacao: 'CORRECAO_MANUAL',
      confirmada: true,
    };

    confirmacaoRef.current = confirmacao;

    console.log(
      'Data corrigida e confirmada:',
      confirmacao,
    );
  }

   function cancelarEdicao(): void {
    if (confirmacaoRef.current) return;

    setValorEdicao(
      resposta?.dados.data_validade ?? '',
    );

    if (resposta?.dados.data_validade === null) {
      setEstadoEdicao('EDITANDO');
    } else {
      setEstadoEdicao('VISUALIZACAO');
    }
  }

  function alternarEvidencias(
    abertas: boolean,
  ): void {
    setEvidenciasAbertas(abertas);
  }

  
  return (
    <>
      {
        estado === 'AGUARDANDO_IMAGEM' && (
          <CameraController
            onImagemAceita={(resultado) => {
              void receberImagem(resultado);
            }}
          />
        )
      }

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
          estadoEdicao={estadoEdicao}
          valorEdicao={valorEdicao}
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
