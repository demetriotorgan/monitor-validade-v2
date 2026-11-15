import './Layout.css'
import { Outlet } from 'react-router-dom'
import Banner from './Banner/Banner'
import NavBar from './NavBar/NavBar'

const Layout = () => {
  return (
    <div className="layout">
      <Banner />
      <main className='app-main'>
        <Outlet />
      </main>
      <NavBar />
    </div>
  )
}

export default Layout
