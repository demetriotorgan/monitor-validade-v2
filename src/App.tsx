import { Route, Routes } from 'react-router-dom';
import './App.css'
import Layout from './components/layout/Layout';
import Dashboard from './components/layout/Dashboard/Dashboard';
import Validade from './components/layout/Validade/Validade';
import Produtos from './components/layout/Produtos/Produtos';
import Monitoramento from './components/layout/Monitoramento/Monitoramento';
import { CapturaPageRoute } from './pages/CapturaPageRoute';

function App() {  

  return (
    <>
      <div className='app-container'>
        <Routes>
            <Route element={<Layout/>}>
              <Route path='/' element={<Dashboard/>} />
              <Route path='/validade' element={<Validade />} />
               <Route path="/validade/captura" element={<CapturaPageRoute />} />
              <Route path='/produtos' element={<Produtos />} />
              <Route path='/monitoramento' element={<Monitoramento />}/>
            </Route>
        </Routes>

      </div>
    </>
  )
}

export default App
