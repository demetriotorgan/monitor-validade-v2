
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { CameraCapture } from '../services/CameraCapture';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  cameraAtiva: boolean;
  abrindo: boolean;
  capturando: boolean;
  erro: string | null;

  abrirCamera: () => Promise<void>;
  capturarFoto: () => Promise<Blob>;
  encerrarCamera: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cameraRef = useRef<CameraCapture | null>(null);

  const versaoRef = useRef(0);
  const montadoRef = useRef(true);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [abrindo, setAbrindo] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const obterCamera = useCallback((): CameraCapture => {
    if (cameraRef.current) {
      return cameraRef.current;
    }

    if (!videoRef.current || !canvasRef.current) {
      throw new Error(
        'Os elementos de vídeo e canvas não estão disponíveis.',
      );
    }

    const camera = new CameraCapture({
      video: videoRef.current,
      canvas: canvasRef.current,
    });

    cameraRef.current = camera;

    return camera;
  }, []);

  const operacaoValida = useCallback(
    (versao: number): boolean => {
      return (
        montadoRef.current &&
        versao === versaoRef.current
      );
    },
    [],
  );

  const abrirCamera = useCallback(async (): Promise<void> => {
    const versao = versaoRef.current;

    setAbrindo(true);
    setErro(null);

    try {
      const camera = obterCamera();

      await camera.abrirCamera();

      if (!operacaoValida(versao)) {
        throw new Error('Abertura da câmera cancelada.');
      }

      setCameraAtiva(true);
    } catch (error: unknown) {
      if (operacaoValida(versao)) {
        setCameraAtiva(false);

        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível abrir a câmera.',
        );
      }

      throw error;
    } finally {
      if (operacaoValida(versao)) {
        setAbrindo(false);
      }
    }
  }, [obterCamera, operacaoValida]);

  const capturarFoto = useCallback(async (): Promise<Blob> => {
    const versao = versaoRef.current;

    setCapturando(true);
    setErro(null);

    try {
      const camera = obterCamera();

      const blob = await camera.capturarFoto();

      if (!operacaoValida(versao)) {
        throw new Error('Captura da câmera cancelada.');
      }

      return blob;
    } catch (error: unknown) {
      if (operacaoValida(versao)) {
        setErro(
          error instanceof Error
            ? error.message
            : 'Não foi possível capturar a fotografia.',
        );
      }

      throw error;
    } finally {
      if (operacaoValida(versao)) {
        setCapturando(false);
      }
    }
  }, [obterCamera, operacaoValida]);

  const encerrarCamera = useCallback((): void => {
    // Invalida resultados assíncronos anteriores.
    versaoRef.current++;

    cameraRef.current?.encerrarCamera();

    if (montadoRef.current) {
      setCameraAtiva(false);
      setAbrindo(false);
      setCapturando(false);
      setErro(null);
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
      versaoRef.current++;

      cameraRef.current?.encerrarCamera();
      cameraRef.current = null;
    };
  }, []);

  return {
    videoRef,
    canvasRef,

    cameraAtiva,
    abrindo,
    capturando,
    erro,

    abrirCamera,
    capturarFoto,
    encerrarCamera,
  };
}
