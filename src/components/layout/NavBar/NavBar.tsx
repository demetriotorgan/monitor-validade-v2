// src/components/layout/NavBar/NavBar.tsx

import { NavLink } from 'react-router-dom';
import { Home, Camera, Package, BarChart3 } from 'lucide-react';
import './NavBar.css';

const NavBar = () => {
  const navItems = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/validade', label: 'Validade', icon: Camera },
    { to: '/produtos', label: 'Produtos', icon: Package },
    { to: '/monitoramento', label: 'Monitoramento', icon: BarChart3 },
  ];

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <ul className="navbar-list">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to} className="navbar-item">
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? 'navbar-link navbar-link--active' : 'navbar-link'
              }
              end={to === '/'}
            >
              <Icon className="navbar-icon" strokeWidth={2} />
              <span className="navbar-label">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
