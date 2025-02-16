import React from 'react';
import './notification.css';
import VerticalMenu from '../verticalMenu/VerticalMenu';

const Notification = () => {
  const categorias = ["Cumpleaños", "Cuotas", "Eventos", "Recordatorios"];
  return (
    <div className="notificaciones-container">
      <VerticalMenu />
      <div className="notificaciones-content">
        <h1 className="notificaciones-titulo">Notificaciones</h1>
        <div className="notificaciones-filtros">
          <button className="boton-filtro activo">Ver todo</button>
          {categorias.map((categoria, index) => (
            <button key={index} className="boton-filtro">
              {categoria}
            </button>
          ))}
        </div>
        <div className="notificaciones-buscador">
          <input
            type="text"
            placeholder="Buscar"
            className="buscador-input"
          />
          <button className="buscador-icono">
            🔍
          </button>
        </div>
        <div className="notificaciones-lista">
          <h2 className="notificaciones-seccion-titulo">Cumpleaños</h2>
          <ul className="notificaciones-items">
            <li>🎉 Feliz Cumpleaños, Juan Perez</li>
            <li>🎉 Feliz Cumpleaños, Ana Gomez</li>
          </ul>
          <h2 className="notificaciones-seccion-titulo">Cuotas</h2>
          <ul className="notificaciones-items">
            <li>⚠️ Venció la cuota de Juan Perez</li>
            <li>⚠️ Venció la cuota de Ana Gomez</li>
          </ul>
          <h2 className="notificaciones-seccion-titulo">Eventos</h2>
          <ul className="notificaciones-items">
            <li>📅 Evento especial el 20 de enero</li>
          </ul>
          <h2 className="notificaciones-seccion-titulo">Recordatorios</h2>
          <ul className="notificaciones-items">
            <li>🛎️ Revisión médica pendiente</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Notification;