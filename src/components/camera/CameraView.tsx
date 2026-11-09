
import type { RefObject } from 'react';
import './CameraView.css';

import type { EtapaCaptura } from './CameraController';

interface CameraViewProps {
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

const CameraView = ({
  videoRef,
  canvasRef,
  molduraRef,
  etapa,
  recorteUrl,
  erro,
  onAbrirCamera,
  onCapturarFoto,
  onEncerrarCamera,
  onRepetirCaptura,
  onProsseguir,
}: CameraViewProps) => {
  const cameraPronta = etapa === 'CAMERA_PRONTA';
  const cameraAbrindo = etapa === 'CAMERA_ABRINDO';
  const capturando = etapa === 'CAPTURANDO';
  const recortando = etapa === 'RECORTANDO';

  const imagemRecortada =
    etapa === 'IMAGEM_RECORTADA' &&
    recorteUrl !== null;

  const cameraDesligada = etapa === 'CAMERA_DESLIGADA';
  const ocorreuErro = etapa === 'ERRO';

  const mostrarPlaceholder = cameraDesligada || ocorreuErro;

  const mostrarMoldura =
    cameraPronta || capturando || recortando;

  const processamentoEmAndamento =
    cameraAbrindo || capturando || recortando;

  return (
    <main className="camera-page">
      <header className="camera-header">
        <div className="camera-brand">
          <span className="camera-brand-icon">CV</span>

          <div>
            <h1>Leitor de Validade</h1>
            <p>Capture a validade do produto</p>
          </div>
        </div>
      </header>

      <section className="camera-content">
        <section className="camera-section">
          <div className="section-heading">
            <h2>Captura da imagem</h2>

            <p>
              {imagemRecortada
                ? 'Confira a imagem antes de prosseguir.'
                : 'Posicione a validade dentro da moldura azul.'}
            </p>
          </div>

          <div className="camera-preview">
            {/*
              Preservamos os elementos originais.

              Não desmontar o vídeo nem a moldura
              durante CAPTURANDO ou RECORTANDO.
            */}

            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              muted
              playsInline
              style={{
                visibility: imagemRecortada
                  ? 'hidden'
                  : 'visible',
              }}
            />

            <canvas ref={canvasRef} hidden />

            {mostrarPlaceholder && (
              <div className="camera-placeholder">
                <span className="camera-placeholder-icon">
                  ◎
                </span>

                <p>A câmera está desligada</p>

                <span>
                  A imagem aparecerá aqui
                </span>
              </div>
            )}

            <div
              ref={molduraRef}
              className="crop-frame"
              aria-hidden="true"
              style={{
                visibility: mostrarMoldura
                  ? 'visible'
                  : 'hidden',
              }}
            />

            {imagemRecortada && (
              <img
                src={recorteUrl}
                alt="Imagem recortada da validade do produto"
                className="camera-cropped-image"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  zIndex: 3,
                }}
              />
            )}

            {processamentoEmAndamento && (
              <div
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 4,
                  padding: '12px',
                  textAlign: 'center',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#fff',
                }}
              >
                {cameraAbrindo && 'Abrindo câmera...'}
                {capturando && 'Capturando fotografia...'}
                {recortando && 'Processando recorte...'}
              </div>
            )}
          </div>

          <div className="camera-actions">
            {(cameraDesligada || ocorreuErro) && (
              <button
                type="button"
                className="button button-primary"
                onClick={onAbrirCamera}
              >
                <span aria-hidden="true">▣</span>
                {ocorreuErro
                  ? 'Tentar novamente'
                  : 'Abrir câmera'}
              </button>
            )}

            {cameraPronta && (
              <div className="camera-secondary-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={onCapturarFoto}
                >
                  Capturar foto
                </button>

                <button
                  type="button"
                  className="button button-danger"
                  onClick={onEncerrarCamera}
                >
                  Encerrar câmera
                </button>
              </div>
            )}

            {imagemRecortada && (
              <div className="camera-secondary-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={onRepetirCaptura}
                >
                  Repetir captura
                </button>

                <button
                  type="button"
                  className="button button-primary"
                  onClick={onProsseguir}
                >
                  Prosseguir
                </button>
              </div>
            )}

            {erro && (
              <p className="camera-error" role="alert">
                {erro}
              </p>
            )}
          </div>
        </section>
      </section>

      <footer className="camera-footer">
        <p>
          Leitor de Validade · Captura e recorte de imagens
        </p>
      </footer>
    </main>
  );
};

export default CameraView;
