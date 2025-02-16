import React from 'react'
import { useNavigate } from 'react-router-dom';
import "./home.css"

const Home = () => {

  const navigate = useNavigate();

  const rectangles = [
    { name: 'Alumnos', route: '/student' },
    { name: 'Notificaciones', route: '/notification' },
    { name: 'Cuotas', route: '/share' },
    { name: 'Reportes', route: '/report' },
    { name: 'Movimientos', route: '/motion' },
    { name: 'Asistencia', route: '/attendance' },
    { name: 'Usuarios', route: '/user' }
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

export default Home