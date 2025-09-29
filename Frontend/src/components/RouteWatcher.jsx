// RouteWatcher.jsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function RouteWatcher() {
  const location = useLocation();
  const prevRef = useRef(location);

  useEffect(() => {
    const prev = prevRef.current;
    const curr = location;

    // Si venimos desde /student y nos vamos a otra ruta que no sea /detailstudent -> limpiar sessionStorage
    const leftStudent = prev.pathname === "/student" || prev.pathname.startsWith("/student?");
    const goingToDetail = curr.pathname.startsWith("/detailstudent");

    if (leftStudent && !goingToDetail) {
      sessionStorage.removeItem("studentFilters");
    }

    prevRef.current = location;
  }, [location]);

  return null;
}