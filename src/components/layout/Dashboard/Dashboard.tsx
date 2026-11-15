import { BarChart3, Camera, Package } from 'lucide-react'
import NavCard from '../Elementos/NavCard/NavCard'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className='dashboard-painel'>
      <h3 className='destaque-dashboard'>Escolha uma opção para começar</h3>
      <NavCard
        nome='Cadastrar validade'
        icone={Camera}
        to="/validade"
      />
      <NavCard
        nome='Cadastrar produto'
        icone={Package}
        to='/produtos'
      />

      <NavCard
        nome='Monitorar validades'
        icone={BarChart3}
        to='/monitoramento'
      />
    </div>
  )
}

export default Dashboard