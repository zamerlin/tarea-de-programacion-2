import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { MENSAJES } from "../constantes/api";
import { RUTAS } from "../constantes/rutas";
import * as catalogoServicio from "../servicios/catalogoServicio";
import * as libroServicio from "../servicios/libroServicio";

const esquemaLibro = yup.object({
  titulo: yup.string().trim().required("El título es obligatorio.").max(200, "El título no puede superar 200 caracteres."),
  anioPublicacion: yup.number().typeError("Ingresá un año válido.").integer("El año debe ser un número entero.").min(0, "El año no puede ser negativo.").max(new Date().getFullYear() + 1, "El año no puede estar en el futuro.").required("El año es obligatorio."),
  autor: yup.number().typeError("Seleccioná un autor.").required("El autor es obligatorio."),
  genero: yup.number().typeError("Seleccioná un género.").required("El género es obligatorio."),
  estante: yup.number().typeError("Seleccioná un estante.").required("El estante es obligatorio."),
  saga: yup.number().transform((valor, valorOriginal) => (valorOriginal === "" ? null : valor)).nullable(),
  isbn: yup.string().max(20, "El ISBN no puede superar 20 caracteres.").nullable(),
  descripcion: yup.string().nullable(),
});

const formularioVacio = {
  titulo: "", anioPublicacion: "", autor: "", genero: "", estante: "", saga: "", isbn: "", descripcion: "",
};

function LibroFormularioPagina() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [formulario, establecerFormulario] = useState(formularioVacio);
  const [opciones, establecerOpciones] = useState({ autores: [], generos: [], estantes: [], sagas: [] });
  const [errores, establecerErrores] = useState({});
  const [errorServidor, establecerErrorServidor] = useState("");
  const [cargando, establecerCargando] = useState(Boolean(id));
  const [guardando, establecerGuardando] = useState(false);

  useEffect(() => {
    async function cargarDatos() {
      establecerCargando(true);
      try {
        const [autores, generos, estantes, sagas] = await Promise.all([
          catalogoServicio.listarCatalogo("autores"),
          catalogoServicio.listarCatalogo("generos"),
          catalogoServicio.listarCatalogo("estantes"),
          catalogoServicio.listarCatalogo("sagas"),
        ]);
        establecerOpciones({ autores, generos, estantes, sagas });
        if (id) {
          const libro = await libroServicio.obtenerLibro(id);
          establecerFormulario({
            titulo: libro.titulo,
            anioPublicacion: String(libro.anioPublicacion),
            autor: String(libro.autor.id),
            genero: String(libro.genero.id),
            estante: String(libro.estante.id),
            saga: libro.saga ? String(libro.saga.id) : "",
            isbn: libro.isbn || "",
            descripcion: libro.descripcion || "",
          });
        }
      } catch (fallo) {
        establecerErrorServidor(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
      } finally {
        establecerCargando(false);
      }
    }
    cargarDatos();
  }, [id]);

  function cambiarCampo(evento) {
    establecerFormulario({ ...formulario, [evento.target.name]: evento.target.value });
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    establecerErrores({});
    establecerErrorServidor("");
    try {
      const datos = await esquemaLibro.validate(formulario, { abortEarly: false });
      establecerGuardando(true);
      await libroServicio.guardarLibro({
        ...datos,
        autor: Number(datos.autor),
        genero: Number(datos.genero),
        estante: Number(datos.estante),
        saga: datos.saga ? Number(datos.saga) : null,
        isbn: datos.isbn || null,
        descripcion: datos.descripcion || null,
      }, id);
      navegar(RUTAS.LIBROS);
    } catch (fallo) {
      if (fallo.name === "ValidationError") {
        establecerErrores(Object.fromEntries(fallo.inner.map((item) => [item.path, item.message])));
      } else {
        establecerErrorServidor(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
      }
    } finally {
      establecerGuardando(false);
    }
  }

  function campoTexto(nombre, etiqueta, opcionesCampo = {}) {
    return (
      <label className={opcionesCampo.ancho ? "campo ancho-completo" : "campo"} key={nombre}>
        {etiqueta}
        {opcionesCampo.area ? (
          <textarea name={nombre} value={formulario[nombre]} onChange={cambiarCampo} rows="4" />
        ) : (
          <input name={nombre} type={opcionesCampo.tipo || "text"} value={formulario[nombre]} onChange={cambiarCampo} />
        )}
        {errores[nombre] && <span className="mensaje-campo">{errores[nombre]}</span>}
      </label>
    );
  }

  function campoSeleccion(nombre, etiqueta, lista, texto) {
    return (
      <label className="campo" key={nombre}>{etiqueta}
        <select name={nombre} value={formulario[nombre]} onChange={cambiarCampo}>
          <option value="">{nombre === "saga" ? "Sin saga" : "Seleccionar"}</option>
          {lista.map((item) => <option key={item.id} value={item.id}>{texto(item)}</option>)}
        </select>
        {errores[nombre] && <span className="mensaje-campo">{errores[nombre]}</span>}
      </label>
    );
  }

  if (cargando) return <p className="estado">Cargando libro...</p>;
  return (
    <>
      <div className="encabezado-pagina">
        <div><Link className="volver" to={RUTAS.LIBROS}>← Volver a libros</Link><p className="sobrelinea">CATÁLOGO</p><h1>{id ? "Editar libro" : "Agregar libro"}</h1></div>
      </div>
      {errorServidor && <div className="alerta alerta-error" role="alert">{errorServidor}</div>}
      <form className="panel formulario" onSubmit={enviarFormulario} noValidate>
        {campoTexto("titulo", "Título")}
        {campoTexto("anioPublicacion", "Año de publicación", { tipo: "number" })}
        {campoSeleccion("autor", "Autor", opciones.autores, (autor) => `${autor.nombre} ${autor.apellido}`)}
        {campoSeleccion("genero", "Género", opciones.generos, (genero) => genero.nombre)}
        {campoSeleccion("estante", "Estante", opciones.estantes, (estante) => `${estante.codigo} · ${estante.ubicacion}`)}
        {campoSeleccion("saga", "Saga (opcional)", opciones.sagas, (saga) => saga.nombre)}
        {campoTexto("isbn", "ISBN")}
        {campoTexto("descripcion", "Descripción", { area: true, ancho: true })}
        <div className="acciones-formulario ancho-completo">
          <Link className="boton boton-secundario" to={RUTAS.LIBROS}>Cancelar</Link>
          <button className="boton boton-principal" disabled={guardando}>{guardando ? "Guardando..." : "Guardar libro"}</button>
        </div>
      </form>
    </>
  );
}

export default LibroFormularioPagina;
