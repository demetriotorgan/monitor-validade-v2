
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  recortarImagem,
  type ResultadoRecorte,
} from '../services/recorte';

export interface UseImageCropReturn {
  processando: boolean;
  erro: string | null;

  executarRecorte: (
    video: HTMLVideoElement,
    moldura: HTMLElement,
    imagem: HTMLImageElement,
  ) => Promise<ResultadoRecorte>;
}

export function useImageCrop(): UseImageCropReturn {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const operacaoEmAndamento = useRef(false);
  const montadoRef = useRef(true);

  const executarRecorte = useCallback(
    async (
      video: HTMLVideoElement,
      moldura: HTMLElement,
      imagem: HTMLImageElement,
    ): Promise<ResultadoRecorte> => {
      if (operacaoEmAndamento.current) {
        throw new Error('Já existe um recorte em andamento.');
      }

      operacaoEmAndamento.current = true;

      setProcessando(true);
      setErro(null);

      try {
        const resultado = await recortarImagem({
          video,
          moldura,
          imagem,
        });

        return resultado;
      } catch (error: unknown) {
        const mensagem =
          error instanceof Error
            ? error.message
            : 'Não foi possível recortar a imagem.';

        if (montadoRef.current) {
          setErro(mensagem);
        }

        throw error;
      } finally {
        operacaoEmAndamento.current = false;

        if (montadoRef.current) {
          setProcessando(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  return {
    processando,
    erro,
    executarRecorte,
  };
}
