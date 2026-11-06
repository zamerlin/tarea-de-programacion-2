import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { RUTAS } from "./constantes/rutas";
import { useAutenticacion } from "./hooks/useAutenticacion";
import CatalogoPagina from "./paginas/CatalogoPagina";
import EventosPagina from "./paginas/EventosPagina";
import LibroDetallePagina from "./paginas/LibroDetallePagina";
import LibroFormularioPagina from "./paginas/LibroFormularioPagina";
import LibrosPagina from "./paginas/LibrosPagina";
import LoginPagina from "./paginas/LoginPagina";
import PanelPrivado from "./componentes/PanelPrivado";

function RutaPrivada({ children }) {
  const { token } = useAutenticacion();
  return token ? children : <Navigate to={RUTAS.LOGIN} replace />;
}

function Aplicacion() {
  const { token } = useAutenticacion();
  return (
    <Routes>
      <Route
        path={RUTAS.LOGIN}
        element={token ? <Navigate to={RUTAS.LIBROS} replace /> : <LoginPagina />}
      />
      <Route
        path="/"
        element={<RutaPrivada><PanelPrivado /></RutaPrivada>}
      >
        <Route index element={<Navigate to={RUTAS.LIBROS} replace />} />
        <Route path={RUTAS.LIBROS} element={<LibrosPagina />} />
        <Route path={RUTAS.NUEVO_LIBRO} element={<LibroFormularioPagina />} />
        <Route path={RUTAS.EDITAR_LIBRO()} element={<LibroFormularioPagina />} />
        <Route path={RUTAS.DETALLE_LIBRO()} element={<LibroDetallePagina />} />
        <Route path={`${RUTAS.CATALOGO()}`} element={<CatalogoPagina />} />
        <Route path={RUTAS.EVENTOS} element={<EventosPagina />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? RUTAS.LIBROS : RUTAS.LOGIN} replace />} />
    </Routes>
  );
}

export default Aplicacion;
