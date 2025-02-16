import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./homeUser.css"
const HomeUser = () => {

    const navigate = useNavigate();

    const rectangles = [
        { name: 'Asistencia', route: '/attendance' },
        { name: 'Notificaciones', route: '/notification' },
        { name: 'Cuotas', route: '/ruta3' },
      ];
  return (
  <>
  <div className="home-container">
      {rectangles.map((rect, index) => (
        <div
          key={index}
          className="rectangle"
          onClick={() => navigate(rect.route)}
        >
          {rect.name}
        </div>
      ))}
    </div>
  </>
  )
}

export default HomeUser