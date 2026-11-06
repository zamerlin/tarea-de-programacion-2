import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import * as yup from "yup";
import EstadoCarga from "../componentes/EstadoCarga";
import { MENSAJES } from "../constantes/api";
import { CAMPOS_CATALOGO, TIPOS_CATALOGO } from "../constantes/rutas";
import { useCarga } from "../hooks/useCarga";
import * as catalogoServicio from "../servicios/catalogoServicio";

function CatalogoPagina() {
  const { tipo } = useParams();
  const definicion = TIPOS_CATALOGO[tipo];
  if (!definicion) return <div className="alerta alerta-error">Este catálogo no existe.</div>;
  return <ContenidoCatalogo key={tipo} tipo={tipo} definicion={definicion} />;
}

function ContenidoCatalogo({ tipo, definicion }) {
  const campos = CAMPOS_CATALOGO[tipo];
  const valoresVacios = useMemo(() => Object.fromEntries(campos.map((campo) => [campo.nombre, ""])), [campos]);
  const [formulario, establecerFormulario] = useState(valoresVacios);
  const [idEditando, establecerIdEditando] = useState(null);
  const [erroresFormulario, establecerErroresFormulario] = useState({});
  const [errorAccion, establecerErrorAccion] = useState("");
  const [guardando, establecerGuardando] = useState(false);
  const { datos, cargando, error, cargar } = useCarga(
    () => catalogoServicio.listarCatalogo(tipo),
    [tipo],
  );
  const esquema = useMemo(() => yup.object(Object.fromEntries(campos.map((campo) => [
    campo.nombre,
    campo.opcional
      ? yup.string().nullable()
      : yup.string().trim().required(`${campo.etiqueta} es obligatorio.`),
  ]))), [campos]);

  function iniciarEdicion(registro) {
    establecerIdEditando(registro.id);
    establecerFormulario(Object.fromEntries(campos.map((campo) => [campo.nombre, registro[campo.nombre] || ""])));
    establecerErroresFormulario({});
    establecerErrorAccion("");
  }

  function cancelarEdicion() {
    establecerIdEditando(null);
    establecerFormulario(valoresVacios);
    establecerErroresFormulario({});
  }

  async function guardar(evento) {
    evento.preventDefault();
    establecerErroresFormulario({});
    establecerErrorAccion("");
    try {
      const datosValidados = await esquema.validate(formulario, { abortEarly: false });
      establecerGuardando(true);
      await catalogoServicio.guardarCatalogo(tipo, datosValidados, idEditando);
      cancelarEdicion();
      await cargar();
    } catch (fallo) {
      if (fallo.name === "ValidationError") {
        establecerErroresFormulario(Object.fromEntries(fallo.inner.map((item) => [item.path, item.message])));
      } else {
        establecerErrorAccion(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
      }
    } finally {
      establecerGuardando(false);
    }
  }

  async function eliminar(id) {
    if (!window.confirm(MENSAJES.ELIMINACION)) return;
    establecerErrorAccion("");
    try {
      await catalogoServicio.eliminarCatalogo(tipo, id);
      await cargar();
    } catch (fallo) {
      establecerErrorAccion(fallo.response?.data?.error?.mensaje || MENSAJES.ERROR_GENERAL);
    }
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div><p className="sobrelinea">ADMINISTRACIÓN</p><h1>{definicion.nombre}</h1><p className="texto-secundario">Mantené los datos de {definicion.nombre.toLowerCase()}.</p></div>
      </div>
      <div className="disposicion-catalogo">
        <section className="panel panel-formulario">
          <h2>{idEditando ? `Editar ${definicion.singular.toLowerCase()}` : `Nuevo ${definicion.singular.toLowerCase()}`}</h2>
          {errorAccion && <div className="alerta alerta-error" role="alert">{errorAccion}</div>}
          <form onSubmit={guardar} noValidate>
            {campos.map((campo) => (
              <label className="campo" key={campo.nombre}>{campo.etiqueta}
                {campo.tipo === "area" ? (
                  <textarea rows="3" value={formulario[campo.nombre]} onChange={(evento) => establecerFormulario({ ...formulario, [campo.nombre]: evento.target.value })} />
                ) : (
                  <input value={formulario[campo.nombre]} onChange={(evento) => establecerFormulario({ ...formulario, [campo.nombre]: evento.target.value })} />
                )}
                {erroresFormulario[campo.nombre] && <span className="mensaje-campo">{erroresFormulario[campo.nombre]}</span>}
              </label>
            ))}
            <div className="acciones-formulario">
              {idEditando && <button type="button" className="boton boton-secundario" onClick={cancelarEdicion}>Cancelar</button>}
              <button className="boton boton-principal" disabled={guardando}>{guardando ? "Guardando..." : idEditando ? "Guardar cambios" : "Agregar"}</button>
            </div>
          </form>
        </section>
        <section>
          <EstadoCarga cargando={cargando} error={error}>
            {datos.length === 0 ? <div className="panel estado">{MENSAJES.SIN_DATOS}</div> : (
              <div className="panel tabla-contenedor">
                <table>
                  <thead><tr>{campos.map((campo) => <th key={campo.nombre}>{campo.etiqueta}</th>)}<th>Acciones</th></tr></thead>
                  <tbody>{datos.map((registro) => (
                    <tr key={registro.id}>
                      {campos.map((campo) => <td key={campo.nombre}>{registro[campo.nombre] || "—"}</td>)}
                      <td className="acciones"><button className="boton-texto" onClick={() => iniciarEdicion(registro)}>Editar</button><button className="boton-texto boton-peligro" onClick={() => eliminar(registro.id)}>Eliminar</button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </EstadoCarga>
        </section>
      </div>
    </>
  );
}

export default CatalogoPagina;
