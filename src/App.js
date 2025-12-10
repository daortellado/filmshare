import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"
import { Container, Col, Row } from "react-bootstrap";
import Intro from "./Intro";
import TeamHome from "./TeamHome";
import AdminComponent from "./AdminComponent";
import FilmRoomComponent from "./FilmRoomComponent";
import TacticsComponent from "./TacticsComponent";
import Cookies from "universal-cookie";
import { jwtDecode } from 'jwt-decode'
const cookies = new Cookies();

function App() {
  const token = cookies.get("TOKEN");
  const url = String(useLocation().pathname);
  let [hidenav, setHideNav] = useState(false);

  function checkHideNav(){
    if (url === '/')
    { setHideNav(true) }
    else
    { setHideNav(false) }
  }

  useEffect(() => {
    checkHideNav()
  }, []);

  function checkAdmin(){
    //read token for admin check
    if (token) {
      return (jwtDecode(token)["admin"])
    }
  }

  return (
    <Container>
      <Row style={{display: hidenav ? 'none' : 'block' }}>
        <Col className="text-center">
          <h1 style={{ fontFamily: 'Unica One' }}><b>SQUAD</b><i>REEL</i></h1>
          <img src="/squadreel.png" alt="squadreel logo" className="responsive"></img>
          <h5>WCHS Women's Soccer</h5>
          <section id="navigation">
            <a href="/wchsws">Home</a>
            <a href="/wchsws/admin">Admin</a>
            <a href="/wchsws/filmroom">FilmRoom</a>
            {/* <a href="/wchsws/tactics">Tactics</a> */}  {/* <--- TEMP DISABLED */}
          </section>
        </Col>
      </Row>

      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/wchsws" element={<TeamHome />} />
        <Route path="/wchsws/admin"
          element={checkAdmin()===true ? <AdminComponent /> : <Navigate replace to={"/wchsws"} />}
        />
        <Route path="/wchsws/filmroom"
          element={token ? <FilmRoomComponent /> : <Navigate replace to={"/wchsws"} />}
        />
        <Route path="/wchsws/tactics"
          element={token ? <TacticsComponent /> : <Navigate replace to={"/wchsws"} />}
        />
      </Routes>
    </Container>
  );
}

export default App;