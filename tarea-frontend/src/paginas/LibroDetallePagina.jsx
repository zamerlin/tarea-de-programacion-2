import { Link, useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { MENSAJES } from "../constantes/api";
import { RUTAS } from "../constantes/rutas";
import * as libroServicio from "../servicios/libroServicio";

function LibroDetallePagina() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [libro, establecerLibro] = useState(null);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState("");

  useEffect(() => {
    libroServicio.obtenerLibro(id)
      .then(establecerLibro)
      .catch((fallo) => establecerError(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL))
      .finally(() => establecerCargando(false));
  }, [id]);

  if (cargando) return <p className="estado">Cargando libro...</p>;
  if (error) return <div className="alerta alerta-error" role="alert">{error}</div>;
  if (!libro) return null;

  async function eliminar() {
    if (!window.confirm(MENSAJES.ELIMINACION)) return;
    try {
      await libroServicio.eliminarLibro(libro.id);
      navegar(RUTAS.LIBROS);
    } catch (fallo) {
      establecerError(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
    }
  }

  return (
    <article className="detalle-libro">
      <Link className="volver" to={RUTAS.LIBROS}>← Volver a libros</Link>
      {error && <div className="alerta alerta-error" role="alert">{error}</div>}
      <div className="detalle-encabezado">
        <div><span className="etiqueta">{libro.genero?.nombre}</span><p className="sobrelinea">{libro.anioPublicacion}</p><h1>{libro.titulo}</h1><p className="texto-secundario">por {libro.autor?.nombre} {libro.autor?.apellido}</p></div>
        <div className="acciones">
          <Link className="boton boton-secundario" to={RUTAS.EDITAR_LIBRO(libro.id)}>Editar</Link>
          <button className="boton boton-peligro-fondo" onClick={eliminar}>Eliminar</button>
        </div>
      </div>
      <section className="panel ficha">
        <div><span>Ubicación</span><strong>{libro.estante?.codigo} · {libro.estante?.ubicacion}</strong></div>
        <div><span>Saga</span><strong>{libro.saga?.nombre || "No pertenece a una saga"}</strong></div>
        <div><span>ISBN</span><strong>{libro.isbn || "No especificado"}</strong></div>
        <div className="ancho-completo"><span>Descripción</span><p>{libro.descripcion || "Sin descripción."}</p></div>
      </section>
    </article>
  );
}

export default LibroDetallePagina;
