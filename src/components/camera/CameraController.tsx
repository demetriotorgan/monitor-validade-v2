
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useCamera } from '../../hooks/useCamera';
import { useImageCrop } from '../../hooks/useImageCrop';

import type { ResultadoRecorte } from '../../services/recorte';
import  CameraView  from './CameraView';

export type EtapaCaptura =
  | 'CAMERA_DESLIGADA'
  | 'CAMERA_ABRINDO'
  | 'CAMERA_PRONTA'
  | 'CAPTURANDO'
  | 'RECORTANDO'
  | 'IMAGEM_RECORTADA'
  | 'ERRO';

interface CameraControllerProps {
  onImagemAceita: (resultado: ResultadoRecorte) => void;
}

export function CameraController({
  onImagemAceita,
}: CameraControllerProps) {
  const {
    videoRef,
    canvasRef,
    abrirCamera,
    capturarFoto,
    encerrarCamera,
  } = useCamera();

  const { executarRecorte } = useImageCrop();

  const molduraRef = useRef<HTMLDivElement>(null);

  const [etapa, setEtapa] =
    useState<EtapaCaptura>('CAMERA_DESLIGADA');
  

  const [recorteUrl, setRecorteUrl] =
    useState<string | null>(null);

  const [erro, setErro] = useState<string | null>(null);

  // Referências para controle síncrono.
  const etapaRef = useRef<EtapaCaptura>('CAMERA_DESLIGADA');
  const versaoRef = useRef(0);
  const montadoRef = useRef(true);

  const resultadoRef = useRef<ResultadoRecorte | null>(null);
  const urlRef = useRef<string | null>(null);

  const alterarEtapa = useCallback(
    (novaEtapa: EtapaCaptura) => {
      etapaRef.current = novaEtapa;

      if (montadoRef.current) {
        setEtapa(novaEtapa);
      }
    },
    [],
  );

  const liberarRecorte = useCallback(() => {
    resultadoRef.current = null;    

    const urlAnterior = urlRef.current;

    urlRef.current = null;
    setRecorteUrl(null);

    if (urlAnterior) {
      URL.revokeObjectURL(urlAnterior);
    }
  }, []);

  const operacaoValida = useCallback(
    (versao: number) =>
      montadoRef.current &&
      versaoRef.current === versao,
    [],
  );

  const registrarErro = useCallback(
    (error: unknown) => {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro durante a captura.';

      setErro(mensagem);
      alterarEtapa('ERRO');
    },
    [alterarEtapa],
  );

  const iniciarCamera = useCallback(async () => {
    if (
      etapaRef.current !== 'CAMERA_DESLIGADA' &&
      etapaRef.current !== 'ERRO'
    ) {
      return;
    }

    const versao = ++versaoRef.current;

    liberarRecorte();
    setErro(null);
    alterarEtapa('CAMERA_ABRINDO');

    try {
      await abrirCamera();

      if (!operacaoValida(versao)) return;

      alterarEtapa('CAMERA_PRONTA');
    } catch (error: unknown) {
      if (!operacaoValida(versao)) return;

      encerrarCamera();
      registrarErro(error);
    }
  }, [
    abrirCamera,
    encerrarCamera,
    liberarRecorte,
    operacaoValida,
    alterarEtapa,
    registrarErro,
  ]);

  const capturar = useCallback(async () => {
    if (etapaRef.current !== 'CAMERA_PRONTA') {
      return;
    }

    const video = videoRef.current;
    const moldura = molduraRef.current;

    if (!video || !moldura) {
      registrarErro(
        new Error('Vídeo ou moldura indisponível.'),
      );
      return;
    }

    const versao = ++versaoRef.current;

    setErro(null);
    alterarEtapa('CAPTURANDO');

    let urlOriginal: string | null = null;

    try {
      // 1. Produzir a fotografia original.
      const blob = await capturarFoto();

      if (!operacaoValida(versao)) return;

      // 2. Encerrar o dispositivo.
      // O vídeo e a moldura permanecem montados.
      encerrarCamera();

      alterarEtapa('RECORTANDO');

      // 3. Preparar a imagem original.
      urlOriginal = URL.createObjectURL(blob);

      const imagem = new Image();
      imagem.src = urlOriginal;

      await imagem.decode();

      if (!operacaoValida(versao)) return;

      // 4. Executar o serviço geométrico existente.
      const resultado = await executarRecorte(
        video,
        moldura,
        imagem,
      );

      if (!operacaoValida(versao)) return;

      // 5. Criar a prévia da imagem recortada.
      const novaUrl = URL.createObjectURL(resultado.blob);

      liberarRecorte();

      resultadoRef.current = resultado;
      urlRef.current = novaUrl;
      
      setRecorteUrl(novaUrl);

      alterarEtapa('IMAGEM_RECORTADA');
    } catch (error: unknown) {
      if (!operacaoValida(versao)) return;

      encerrarCamera();
      registrarErro(error);
    } finally {
      if (urlOriginal) {
        URL.revokeObjectURL(urlOriginal);
      }
    }
  }, [
    videoRef,
    capturarFoto,
    encerrarCamera,
    executarRecorte,
    liberarRecorte,
    operacaoValida,
    alterarEtapa,
    registrarErro,
  ]);

  const encerrar = useCallback(() => {
    ++versaoRef.current;

    encerrarCamera();
    liberarRecorte();

    setErro(null);
    alterarEtapa('CAMERA_DESLIGADA');
  }, [
    encerrarCamera,
    liberarRecorte,
    alterarEtapa,
  ]);

  const repetirCaptura = useCallback(async () => {
    if (etapaRef.current !== 'IMAGEM_RECORTADA') {
      return;
    }

    encerrar();

    // A nova abertura é uma operação explícita.
    await iniciarCamera();
  }, [encerrar, iniciarCamera]);

  const prosseguir = useCallback(() => {
    if (etapaRef.current !== 'IMAGEM_RECORTADA') {
      return;
    }

    const resultado = resultadoRef.current;

    if (!resultado || resultado.blob.size === 0) {
      registrarErro(
        new Error('Não existe uma imagem válida para prosseguir.'),
      );
      return;
    }

    onImagemAceita(resultado);
  }, [onImagemAceita, registrarErro]);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
      ++versaoRef.current;

      encerrarCamera();

      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }

      resultadoRef.current = null;
    };
  }, [encerrarCamera]);

  return (
    <CameraView
      videoRef={videoRef}
      canvasRef={canvasRef}
      molduraRef={molduraRef}
      etapa={etapa}
      recorteUrl={recorteUrl}
      erro={erro}
      onAbrirCamera={() => {
        void iniciarCamera();
      }}
      onCapturarFoto={() => {
        void capturar();
      }}
      onEncerrarCamera={encerrar}
      onRepetirCaptura={() => {
        void repetirCaptura();
      }}
      onProsseguir={prosseguir}
    />
  );
}
