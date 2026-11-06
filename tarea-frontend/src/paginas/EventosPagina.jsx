import React from "react";
import { useCarga } from "../hooks/useCarga";
import EstadoCarga from "../componentes/EstadoCarga";
import { MENSAJES } from "../constantes/api";
import * as eventosServicio from "../servicios/eventosServicio";

function EventosPagina() {
  const { datos: eventos, cargando, error, cargar } = useCarga(() => eventosServicio.listarEventos(), []);

  return (
    <>
      <div className="encabezado-pagina">
        <div><p className="sobrelinea">SISTEMA</p><h1>Eventos</h1><p className="texto-secundario">Actividad reciente y errores registrados por la aplicación.</p></div>
        <button className="boton boton-secundario" onClick={cargar}>Actualizar</button>
      </div>
      <EstadoCarga cargando={cargando} error={error}>
        {eventos.length === 0 ? <div className="panel estado">{MENSAJES.SIN_DATOS}</div> : (
          <div className="panel tabla-contenedor">
            <table>
              <thead><tr><th>Fecha</th><th>Nivel</th><th>Evento</th><th>Detalle</th></tr></thead>
              <tbody>{eventos.map((evento, indice) => (
                <tr key={`${evento.timestamp}-${indice}`}>
                  <td>{evento.timestamp ? new Date(evento.timestamp).toLocaleString("es-AR") : "—"}</td>
                  <td><span className={`etiqueta nivel-${evento.level}`}>{evento.level || "info"}</span></td>
                  <td>{evento.message}</td>
                  <td className="texto-evento">{JSON.stringify(Object.fromEntries(Object.entries(evento).filter(([clave]) => !["timestamp", "level", "message", "servicio"].includes(clave))))}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </EstadoCarga>
    </>
  );
}

export default EventosPagina;
