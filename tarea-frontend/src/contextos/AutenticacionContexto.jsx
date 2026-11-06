import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { CLAVES_STORAGE, EVENTOS_APLICACION } from "../constantes/api";
import * as autenticacionServicio from "../servicios/autenticacionServicio";

export const AutenticacionContexto = createContext(null);

export function ProveedorAutenticacion({ children }) {
  const [token, establecerToken] = useState(() => localStorage.getItem(CLAVES_STORAGE.TOKEN));
  const [administrador, establecerAdministrador] = useState(() => {
    const guardado = localStorage.getItem(CLAVES_STORAGE.ADMINISTRADOR);
    return guardado ? JSON.parse(guardado) : null;
  });

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem(CLAVES_STORAGE.TOKEN);
    localStorage.removeItem(CLAVES_STORAGE.ADMINISTRADOR);
    establecerToken(null);
    establecerAdministrador(null);
  }, []);

  useEffect(() => {
    window.addEventListener(EVENTOS_APLICACION.SESION_EXPIRADA, cerrarSesion);
    return () => window.removeEventListener(EVENTOS_APLICACION.SESION_EXPIRADA, cerrarSesion);
  }, [cerrarSesion]);

  const iniciarSesion = useCallback(async (datos) => {
    const resultado = await autenticacionServicio.iniciarSesion(datos);
    localStorage.setItem(CLAVES_STORAGE.TOKEN, resultado.token);
    localStorage.setItem(CLAVES_STORAGE.ADMINISTRADOR, JSON.stringify(resultado.administrador));
    establecerToken(resultado.token);
    establecerAdministrador(resultado.administrador);
  }, []);

  const valor = useMemo(
    () => ({ token, administrador, iniciarSesion, cerrarSesion }),
    [token, administrador, iniciarSesion, cerrarSesion],
  );
  return <AutenticacionContexto.Provider value={valor}>{children}</AutenticacionContexto.Provider>;
}
