import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { RUTAS } from "../constantes/rutas";
import { useAutenticacion } from "../hooks/useAutenticacion";

const esquemaLogin = yup.object({
  correo: yup.string().email("Ingresá un correo válido.").required("El correo es obligatorio."),
  clave: yup.string().required("La contraseña es obligatoria."),
});

function LoginPagina() {
  const { token, iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const [formulario, establecerFormulario] = useState({ correo: "", clave: "" });
  const [errores, establecerErrores] = useState({});
  const [errorServidor, establecerErrorServidor] = useState("");
  const [cargando, establecerCargando] = useState(false);

  if (token) return <Navigate to={RUTAS.LIBROS} replace />;

  async function enviarFormulario(evento) {
    evento.preventDefault();
    establecerErrores({});
    establecerErrorServidor("");
    try {
      await esquemaLogin.validate(formulario, { abortEarly: false });
      establecerCargando(true);
      await iniciarSesion(formulario);
      navegar(RUTAS.LIBROS, { replace: true });
    } catch (error) {
      if (error.name === "ValidationError") {
        establecerErrores(Object.fromEntries(error.inner.map((item) => [item.path, item.message])));
      } else {
        establecerErrorServidor(error.response?.data?.error?.mensaje || "No se pudo iniciar sesión.");
      }
    } finally {
      establecerCargando(false);
    }
  }

  return (
    <main className="pagina-login">
      <section className="tarjeta-login">
        <div className="logo-circulo" aria-hidden="true">B</div>
        <p className="sobrelinea">SISTEMA DE BIBLIOTECA</p>
        <h1>Bienvenido</h1>
        <p className="texto-secundario">Iniciá sesión para administrar el catálogo.</p>
        {errorServidor && <div className="alerta alerta-error" role="alert">{errorServidor}</div>}
        <form onSubmit={enviarFormulario} noValidate>
          <label htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            type="email"
            autoComplete="username"
            value={formulario.correo}
            onChange={(evento) => establecerFormulario({ ...formulario, correo: evento.target.value })}
            aria-invalid={Boolean(errores.correo)}
          />
          {errores.correo && <span className="mensaje-campo">{errores.correo}</span>}
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            type="password"
            autoComplete="current-password"
            value={formulario.clave}
            onChange={(evento) => establecerFormulario({ ...formulario, clave: evento.target.value })}
            aria-invalid={Boolean(errores.clave)}
          />
          {errores.clave && <span className="mensaje-campo">{errores.clave}</span>}
          <button className="boton boton-principal boton-ancho" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPagina;
