
import type { RefObject } from 'react';
import type { ResultadoRecorte } from '../services/recorte';

/**
 * Estados operacionais do fluxo de aquisição.
 *
 * DEC-CAM-06
 */
export type EtapaCaptura =
  | 'CAMERA_DESLIGADA'
  | 'CAMERA_ABRINDO'
  | 'CAMERA_PRONTA'
  | 'CAPTURANDO'
  | 'RECORTANDO'
  | 'IMAGEM_RECORTADA'
  | 'ERRO';

/**
 * Contrato de entrada do CameraController.
 *
 * DEC-CAM-04:
 * A imagem somente é entregue após
 * confirmação explícita do operador.
 */
export interface CameraControllerProps {
  onImagemAceita: (resultado: ResultadoRecorte) => void;
}

/**
 * Contrato de apresentação da câmera.
 *
 * DEC-CAM-01:
 * CameraView não controla a captura,
 * o recorte ou o processamento por IA.
 */
export interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  molduraRef: RefObject<HTMLDivElement | null>;

  etapa: EtapaCaptura;
  recorteUrl: string | null;
  erro: string | null;

  onAbrirCamera: () => void;
  onCapturarFoto: () => void;
  onEncerrarCamera: () => void;
  onRepetirCaptura: () => void;
  onProsseguir: () => void;
}
