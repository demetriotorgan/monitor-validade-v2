import { Navigate, useLocation } from "react-router-dom";
import CapturaPage from "./CapturaPage";
import type { Produto } from "../types/produto.types";

interface CapturaLocationState {
  produto?: Produto;
}

export function CapturaPageRoute() {
  const location = useLocation();
  const state = location.state as CapturaLocationState | null;
  const produto = state?.produto;

  if (!produto) {
    return <Navigate to="/validade" replace />;
  }

  return <CapturaPage produto={produto} />;
}