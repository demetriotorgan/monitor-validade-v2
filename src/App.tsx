import './App.css'
import { CameraController } from './components/camera/CameraController';
import type { ResultadoRecorte } from './services/recorte'


function App() {
  const handleImagemAceita = (resultado: ResultadoRecorte): void => {
    console.log('Imagem aceita: ', resultado);
  };

  return (
    <>
      <CameraController
        onImagemAceita={handleImagemAceita}
      />
    </>
  )
}

export default App
