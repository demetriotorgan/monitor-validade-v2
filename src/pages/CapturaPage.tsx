
import { useEffect, useRef, useState } from 'react';

import { CameraController } from '../components/camera/CameraController';
import { processarValidade } from '../services/validadeApi';

import type { ResultadoRecorte } from '../services/recorte';

import type { EstadoInferencia, RespostaInferenciaSucesso} from '../types/validade.types';

export function CapturaPage() {
  const [estado, setEstado] =
    useState<EstadoInferencia>('AGUARDANDO_IMAGEM');

  const [resposta, setResposta] =
    useState<RespostaInferenciaSucesso | null>(null);

  const [erro, setErro] = useState<string | null>(null);

  const [imagemUrl, setImagemUrl] =
    useState<string | null>(null);

  const urlRef = useRef<string | null>(null);

  // Impede requisições duplicadas da mesma operação.
  const processandoRef = useRef(false);

  // Impede atualização de estado após desmontagem.
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  async function receberImagem(
    resultado: ResultadoRecorte,
  ): Promise<void> {
    if (processandoRef.current) {
      return;
    }

    processandoRef.current = true;

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

  return (
    <>
      <CameraController
        onImagemAceita={(resultado) => {
          void receberImagem(resultado);
        }}
      />

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
          <p>
            Aguarde enquanto a IA identifica
            as informações da validade.
          </p>
        </section>
      )}

      {estado === 'SUCESSO' && resposta && (
        <section
          style={{
            maxWidth: 700,
            margin: '24px auto',
            padding: 16,
          }}
        >
          <h2>Resultado da inferência</h2>

          {imagemUrl && (
            <img
              src={imagemUrl}
              alt="Imagem recortada enviada à IA"
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
            <strong>Data sugerida pela IA:</strong>{' '}
            {resposta.dados.data_validade ??
              'Nenhuma sugestão principal'}
          </p>

          <p>
            <strong>Texto identificado:</strong>{' '}
            {resposta.dados.texto_identificado}
          </p>

          <details>
            <summary>
              Consultar resposta técnica
            </summary>

            <pre
              style={{
                whiteSpace: 'pre-wrap',
                overflowWrap: 'anywhere',
              }}
            >
              {JSON.stringify(resposta, null, 2)}
            </pre>
          </details>
        </section>
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
