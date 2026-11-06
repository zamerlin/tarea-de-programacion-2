import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { RUTAS, TIPOS_CATALOGO } from "../constantes/rutas";
import { useAutenticacion } from "../hooks/useAutenticacion";

function PanelPrivado() {
  const { administrador, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();

  function salir() {
    cerrarSesion();
    navegar(RUTAS.LOGIN, { replace: true });
  }

  return (
    <div className="aplicacion">
      <header className="barra-superior">
        <NavLink className="marca" to={RUTAS.LIBROS}>Biblioteca</NavLink>
        <nav className="navegacion" aria-label="Navegación principal">
          <NavLink to={RUTAS.LIBROS}>Libros</NavLink>
          {Object.entries(TIPOS_CATALOGO).map(([tipo, datos]) => (
            <NavLink key={tipo} to={RUTAS.CATALOGO(tipo)}>{datos.nombre}</NavLink>
          ))}
          <NavLink to={RUTAS.EVENTOS}>Eventos</NavLink>
        </nav>
        <div className="usuario">
          <span>{administrador?.correo}</span>
          <button className="boton boton-secundario boton-chico" onClick={salir}>Cerrar sesión</button>
        </div>
      </header>
      <main className="contenido"><Outlet /></main>
      <footer className="pie">Sistema de gestión de biblioteca</footer>
    </div>
  );
}

export default PanelPrivado;
