import { Route, Routes } from 'react-router-dom';
import './App.css'
import Layout from './components/layout/Layout';
import Dashboard from './components/layout/Dashboard/Dashboard';

function App() {  

  return (
    <>
      <div className='app-container'>
        <Routes>
            <Route element={<Layout/>}>
              <Route path='/' element={<Dashboard/>} />
            </Route>
        </Routes>

      </div>
    </>
  )
}

export default App
