import './Spinner.css'

interface SpinnerProps {
  loading: boolean;
}

const Spinner = ({loading}: SpinnerProps) => {
    if(!loading) {
        return null;
    }
  return (
    <div 
        className="spinner-overlay"
        role="status"
        aria-live="polite"
        aria-label="Salvando dados, por favor aguarde..."
    >
        <div className="spinner-circle"/>

    </div>
  )
}

export default Spinner