import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MENSAJES } from "../constantes/api";
import { RUTAS } from "../constantes/rutas";
import * as catalogoServicio from "../servicios/catalogoServicio";
import * as libroServicio from "../servicios/libroServicio";
import EstadoCarga from "../componentes/EstadoCarga";
import { useCarga } from "../hooks/useCarga";

function LibrosPagina() {
  const [filtros, establecerFiltros] = useState({ genero: "", autor: "", anio: "" });
  const { datos: libros, cargando, error, cargar } = useCarga(
    () => libroServicio.listarLibros(Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor))),
    [filtros],
  );
  const { datos: generos } = useCarga(() => catalogoServicio.listarCatalogo("generos"), []);
  const { datos: autores } = useCarga(() => catalogoServicio.listarCatalogo("autores"), []);

  async function eliminar(id) {
    if (!window.confirm(MENSAJES.ELIMINACION)) return;
    try {
      await libroServicio.eliminarLibro(id);
      await cargar();
    } catch (fallo) {
      window.alert(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
    }
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div><p className="sobrelinea">CATÁLOGO</p><h1>Libros</h1><p className="texto-secundario">Explorá y administrá los libros de la biblioteca.</p></div>
        <Link className="boton boton-principal" to={RUTAS.NUEVO_LIBRO}>＋ Agregar libro</Link>
      </div>
      <section className="panel filtros">
        <label>Género
          <select value={filtros.genero} onChange={(evento) => establecerFiltros({ ...filtros, genero: evento.target.value })}>
            <option value="">Todos</option>
            {generos.map((genero) => <option key={genero.id} value={genero.id}>{genero.nombre}</option>)}
          </select>
        </label>
        <label>Autor
          <select value={filtros.autor} onChange={(evento) => establecerFiltros({ ...filtros, autor: evento.target.value })}>
            <option value="">Todos</option>
            {autores.map((autor) => <option key={autor.id} value={autor.id}>{autor.nombre} {autor.apellido}</option>)}
          </select>
        </label>
        <label>Año de publicación
          <input type="number" min="0" placeholder="Todos" value={filtros.anio} onChange={(evento) => establecerFiltros({ ...filtros, anio: evento.target.value })} />
        </label>
        <button className="boton boton-secundario" onClick={() => establecerFiltros({ genero: "", autor: "", anio: "" })}>Limpiar</button>
      </section>
      <EstadoCarga cargando={cargando} error={error}>
        {libros.length === 0 ? <div className="panel estado">{MENSAJES.SIN_DATOS}</div> : (
          <div className="panel tabla-contenedor">
            <table>
              <thead><tr><th>Título</th><th>Autor</th><th>Género</th><th>Año</th><th>Estante</th><th>Acciones</th></tr></thead>
              <tbody>
                {libros.map((libro) => (
                  <tr key={libro.id}>
                    <td><Link className="enlace-titulo" to={RUTAS.DETALLE_LIBRO(libro.id)}>{libro.titulo}</Link></td>
                    <td>{libro.autor?.nombre} {libro.autor?.apellido}</td>
                    <td><span className="etiqueta">{libro.genero?.nombre}</span></td>
                    <td>{libro.anioPublicacion}</td>
                    <td>{libro.estante?.codigo}</td>
                    <td className="acciones">
                      <Link className="boton-texto" to={RUTAS.EDITAR_LIBRO(libro.id)}>Editar</Link>
                      <button className="boton-texto boton-peligro" onClick={() => eliminar(libro.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </EstadoCarga>
    </>
  );
}

export default LibrosPagina;
