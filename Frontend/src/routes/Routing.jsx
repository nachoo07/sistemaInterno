import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../components/login/Login';
import PageHome from '../pages/home/PageHome';
import PageStudent from '../pages/student/PageStudent';
import { PageUser } from '../pages/users/PageUser';
import PageNotification from '../pages/notification/PageNotification';
import PageDetail from '../pages/detailStudent/PageDetail';
import PageHomeUser from '../pages/homeUser/PageHomeUser';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginContext } from '../context/login/LoginContext';
import PageShare from '../pages/share/PageShare';
import ProtectedRoute from '../routes/ProtectedRoute'; // Importa el componente de ruta protegida
import PageAttendance from '../pages/attendance/PageAttendance';
import PageReport from '../pages/report/PageReport';
import PageMotion from '../pages/motion/PageMotion';

const Routing = () => {
  const { auth } = useContext(LoginContext); // Obtener el estado de autenticación

  return (
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={auth ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/attendance"
          element={<ProtectedRoute element={<PageAttendance />} />}
        />
        {/* Ruta para usuarios comunes */}
        <Route
          path="/homeuser"
          element={<ProtectedRoute element={<PageHomeUser />} role='user' />}
        />

        {/* Ruta para administradores */}

        <Route
          path="/"
          element={<ProtectedRoute element={<PageHome />} role="admin" />}
        />
        <Route
          path="/student"
          element={<ProtectedRoute element={<PageStudent />} role="admin" />}
        />
        <Route
          path="/motion"
          element={<ProtectedRoute element={<PageMotion />} role="admin" />}
        />
        <Route
          path="/notification"
          element={<ProtectedRoute element={<PageNotification />} role="admin" />}
        />
        <Route
          path="/report"
          element={<ProtectedRoute element={<PageReport />} role="admin" />}
        />
        <Route
          path="/user"
          element={<ProtectedRoute element={<PageUser />} role="admin" />}
        />
        <Route
          path="/share"
          element={<ProtectedRoute element={<PageShare />} role="admin" />}
        />
        <Route
          path="/detailstudent/:id"
          element={<ProtectedRoute element={<PageDetail />} role="admin" />}
        />
        <Route
          path="/share/:studentId"
          element={<ProtectedRoute element={<PageShare />} role="admin" />}
        />


        {/* Ruta para el login */}

      </Routes>
    </>
  );
};

export default Routing;