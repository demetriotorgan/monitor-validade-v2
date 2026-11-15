import { CheckCircle2, CircleAlert } from 'lucide-react';
import './Resultado.css'

type TipoResultado = 'sucesso' | 'erro'

interface ResultadoProps {
  mensagem:string;
  tipo: TipoResultado;
  onClose: () => void;  
}

const Resultado = ({mensagem, tipo, onClose}: ResultadoProps) => {
    if(!mensagem.trim()){
        return null;
    }
    const sucesso = tipo === 'sucesso';

  return (
    <div className="resultado-overlay">
      <section
        className="resultado-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="resultado-titulo"
        aria-describedby="resultado-mensagem"
      >
        <div
          className={`resultado-icone ${sucesso ? 'resultado-icone-sucesso' : 'resultado-icone-erro'}`}
        >
          {sucesso ? (
            <CheckCircle2 size={42} strokeWidth={1.8} />
          ) : (
            <CircleAlert size={42} strokeWidth={1.8} />
          )}
        </div>

        <h2 id="resultado-titulo">
          {sucesso ? 'Sucesso!' : 'Atenção'}
        </h2>

        <p id="resultado-mensagem">
          {mensagem}
        </p>

        <button          
          type="button"
          className="resultado-botao"
          onClick={onClose}
          autoFocus
        >
          OK
        </button>
      </section>
    </div>
  )
}

export default Resultado