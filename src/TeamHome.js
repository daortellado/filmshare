import React from "react";
import { Col, Row } from "react-bootstrap";
import Login from "./Login";

export default function TeamHome() {
  return (
    <Row>
      {/* Login */}
      <Col>
      </Col>
      <Col xs={8}>
        <Login />
      </Col>
      <Col>
      </Col>
    </Row>
  );
}