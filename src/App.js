import { Routes, Route, Navigate } from "react-router-dom";
import { Container, Col, Row } from "react-bootstrap";
import Account from "./Account";
import FreeComponent from "./FreeComponent";
import AuthComponent from "./AuthComponent";
import Cookies from "universal-cookie";
import { jwtDecode } from 'jwt-decode'
const cookies = new Cookies();

function App() {
  const token = cookies.get("TOKEN");
  function checkAdmin(){
  //read token for admin check
    if (token) {
      return (jwtDecode(token)["admin"])
    }
  }
  return (
    <Container>
      <Row>
        <Col className="text-center">
          <h1 style={{ fontFamily: 'Unica One' }}>SQUADREEL</h1>
          <img src="/squadreel.png" alt="squadreel logo" class="responsive"></img>
          <h5>WCHS Women's Soccer</h5>
          <section id="navigation">
            <a href="/">Home</a>
            <a href="/free">Admin</a>
            <a href="/auth">Clip Collections</a>
          </section>
        </Col>
      </Row>

      {/* create routes here */}
      <Routes>
        <Route path="/" element={<Account/>} />
        <Route path="/free"
          element={checkAdmin()===true ? <FreeComponent /> : <Navigate replace to={"/"} />}
        />
        <Route path="/auth"
          element={token ? <AuthComponent /> : <Navigate replace to={"/"} />}
        />
      </Routes>
    </Container>
  );
}

export default App;