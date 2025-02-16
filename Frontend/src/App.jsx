import Navigate from "./components/navbar/Navigate";
import Routing from "./routes/Routing";
import UsersProvider from "./context/user/UserContext";
import { LoginProvider } from "./context/login/LoginContext";
import { useLocation } from "react-router-dom";  // Importa useLocation
import StudentsProvider from "./context/student/StudentContext";
import SharesProvider from "./context/share/ShareContext";
import { AttendanceProvider } from "./context/attendance/AttendanceContext";
import { MotionProvider } from "./context/motion/MotionContext";

function App() {
  const location = useLocation();  // Obtén la ubicación actual

  return (
    <>
      <LoginProvider>
        <UsersProvider>
          <StudentsProvider>
            <AttendanceProvider>
              <SharesProvider>
                <MotionProvider>  
                  {location.pathname !== '/login' && <Navigate />}
                  <Routing />
                </MotionProvider>
              </SharesProvider>
            </AttendanceProvider>
          </StudentsProvider>
        </UsersProvider>
      </LoginProvider>
    </>
  );
}

export default App;