
export class CameraCapture {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;

  private stream: MediaStream | null = null;
  private aberturaEmAndamento: Promise<void> | null = null;
  private capturaEmAndamento = false;

  private versaoOperacao = 0;
  private cancelamentoAbertura: AbortController | null = null;

  constructor({
    video,
    canvas,
  }: {
    video: HTMLVideoElement;
    canvas: HTMLCanvasElement;
  }) {
    this.video = video;
    this.canvas = canvas;
  }

  private operacaoValida(versao: number): boolean {
    return versao === this.versaoOperacao;
  }

  private erroCancelamento(): Error {
    return new Error('Operação da câmera cancelada.');
  }

  private verificarOperacao(versao: number): void {
    if (!this.operacaoValida(versao)) {
      throw this.erroCancelamento();
    }
  }

  private async obterStream(
    versao: number,
  ): Promise<MediaStream> {
    let stream: MediaStream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    } catch (error: unknown) {
      this.verificarOperacao(versao);

      const nome =
        error instanceof DOMException ? error.name : '';

      // Uma permissão negada não deve gerar
      // uma segunda solicitação.
      const permiteFallback = [
        'OverconstrainedError',
        'NotFoundError',
        'NotReadableError',
      ].includes(nome);

      if (!permiteFallback) {
        throw error;
      }

      console.warn(
        'Falha na configuração preferencial. Tentando alternativa.',
        error,
      );

      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    }

    if (!this.operacaoValida(versao)) {
      stream.getTracks().forEach((track) => track.stop());
      throw this.erroCancelamento();
    }

    return stream;
  }

  private aguardarVideo(
    signal: AbortSignal,
  ): Promise<void> {
    if (signal.aborted) {
      return Promise.reject(this.erroCancelamento());
    }

    if (this.video.readyState >= 2) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      const limpar = () => {
        this.video.removeEventListener('loadeddata', carregar);
        this.video.removeEventListener('error', falhar);
        signal.removeEventListener('abort', cancelar);
      };

      const finalizar = (erro?: Error) => {
        limpar();

        if (erro) {
          reject(erro);
        } else {
          resolve();
        }
      };

      const carregar = () => finalizar();

      const falhar = () =>
        finalizar(new Error('Falha ao carregar o vídeo.'));

      const cancelar = () =>
        finalizar(this.erroCancelamento());

      this.video.addEventListener('loadeddata', carregar);
      this.video.addEventListener('error', falhar);
      signal.addEventListener('abort', cancelar, {
        once: true,
      });

      if (signal.aborted) {
        cancelar();
      } else if (this.video.readyState >= 2) {
        carregar();
      }
    });
  }

  async abrirCamera(): Promise<void> {
    if (this.aberturaEmAndamento) {
      return this.aberturaEmAndamento;
    }

    if (this.stream) {
      return;
    }

    const versao = this.versaoOperacao;
    const controlador = new AbortController();

    this.cancelamentoAbertura = controlador;

    const operacao = this.iniciarCamera(
      versao,
      controlador.signal,
    );

    this.aberturaEmAndamento = operacao;

    try {
      await operacao;
    } finally {
      if (this.aberturaEmAndamento === operacao) {
        this.aberturaEmAndamento = null;
      }

      if (this.cancelamentoAbertura === controlador) {
        this.cancelamentoAbertura = null;
      }
    }
  }

  private async iniciarCamera(
    versao: number,
    signal: AbortSignal,
  ): Promise<void> {
    let novoStream: MediaStream | null = null;

    try {
      novoStream = await this.obterStream(versao);

      this.verificarOperacao(versao);

      this.stream = novoStream;
      this.video.srcObject = novoStream;

      await this.aguardarVideo(signal);

      this.verificarOperacao(versao);

      await this.video.play();

      this.verificarOperacao(versao);

      console.log('Câmera iniciada com sucesso');
    } catch (error: unknown) {
      novoStream?.getTracks().forEach((track) => track.stop());

      // Uma operação antiga nunca deve
      // encerrar um stream mais recente.
      if (this.operacaoValida(versao)) {
        this.encerrarCamera();
      }

      throw error;
    }
  }

  async capturarFoto(): Promise<Blob> {
    if (this.capturaEmAndamento) {
      throw new Error('Já existe uma captura em andamento.');
    }

    if (
      !this.stream ||
      !this.video.videoWidth ||
      !this.video.videoHeight
    ) {
      throw new Error(
        'A câmera precisa estar aberta para capturar a foto.',
      );
    }

    this.capturaEmAndamento = true;
    const versao = this.versaoOperacao;

    try {
      const largura = this.video.videoWidth;
      const altura = this.video.videoHeight;

      this.canvas.width = largura;
      this.canvas.height = altura;

      const contexto = this.canvas.getContext('2d');

      if (!contexto) {
        throw new Error(
          'Não foi possível obter o contexto do canvas.',
        );
      }

      contexto.drawImage(
        this.video,
        0,
        0,
        largura,
        altura,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        this.canvas.toBlob(
          (resultado) => {
            if (resultado) {
              resolve(resultado);
            } else {
              reject(
                new Error('Não foi possível gerar a imagem.'),
              );
            }
          },
          'image/jpeg',
          0.95,
        );
      });

      this.verificarOperacao(versao);

      console.log('Foto capturada:', {
        largura,
        altura,
        tamanho: blob.size,
        tipo: blob.type,
      });

      return blob;
    } finally {
      this.capturaEmAndamento = false;
    }
  }

  encerrarCamera(): void {
    this.versaoOperacao++;

    this.cancelamentoAbertura?.abort();
    this.cancelamentoAbertura = null;

    // Permite uma nova abertura mesmo quando
    // getUserMedia anterior continua pendente.
    this.aberturaEmAndamento = null;

    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;

    this.video.pause();
    this.video.srcObject = null;

    console.log('Câmera encerrada com sucesso');
  }
}
