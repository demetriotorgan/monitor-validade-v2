import './NavCard.css'
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface NavCardProps{
    nome: string;
    icone: LucideIcon;
    to: string
}

const NavCard = ({nome, icone:Icone, to}: NavCardProps) => {
  return (
    <Link to={to} className="nav-card">
            <span className="nav-card-icon">
                <Icone size={22} aria-hidden="true" />
            </span>
            <span className="nav-card-label">
                {nome}
            </span>
            <span className="nav-card-arrow">
                <ChevronRight size={20} aria-hidden="true" />
            </span>
        </Link>
  )
}

export default NavCard