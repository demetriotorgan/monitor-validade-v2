import './CameraView.css';
import type { CameraViewProps } from '../../types/camera.types';

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
  onCancelar,
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

          <div
            className={`camera-preview ${
              imagemRecortada
                ? 'camera-preview--com-recorte'
                : ''
            }`}
          >
            <video
              ref={videoRef}
              className="camera-video"
              autoPlay
              muted
              playsInline
              style={{
                display: imagemRecortada
                  ? 'none'
                  : 'block',
              }}
            />

            <canvas ref={canvasRef} hidden />

            {mostrarPlaceholder && (
              <div className="camera-placeholder">
                <span className="camera-placeholder-icon">
                  ◎
                </span>

                <p>A câmera está desligada</p>

                <span>A imagem aparecerá aqui</span>
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
              <div className="camera-cropped-overlay">
                <img
                  src={recorteUrl}
                  alt="Imagem recortada da validade do produto"
                  className="camera-cropped-image"
                />
              </div>
            )}

            {processamentoEmAndamento && (
              <div
                role="status"
                aria-live="polite"
                className="camera-processando"
              >
                {cameraAbrindo && 'Abrindo câmera...'}
                {capturando && 'Capturando fotografia...'}
                {recortando && 'Processando recorte...'}
              </div>
            )}
          </div>

          <div className="camera-actions">
            {(cameraDesligada || ocorreuErro) && (
              <>
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

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={onCancelar}
                >
                  Cancelar
                </button>
              </>
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
