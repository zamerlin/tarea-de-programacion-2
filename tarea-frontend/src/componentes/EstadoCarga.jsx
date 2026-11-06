import React from "react";

function EstadoCarga({ cargando, error, children }) {
  if (cargando) return <p className="estado">Cargando...</p>;
  if (error) return <div className="alerta alerta-error" role="alert">{error}</div>;
  return children;
}

export default EstadoCarga;
