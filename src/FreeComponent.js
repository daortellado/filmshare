import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import { Col, Row } from "react-bootstrap";

export default function FreeComponent() {
  // set an initial state for the message we will receive after the API call
  const [message, setMessage] = useState("");

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // set configurations for the API call here
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/free-endpoint",
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setMessage(result.data.message);
      })
      .catch((error) => {
        error = new Error();
      });
  }, []);

  return (
    <div>
      {/* displaying our message from our API call */}
      <h4 className="text-center text-danger"><i>*{message}*</i></h4>
            {/* Register */}
        <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
            <Register />
        </Col>
          {/* Add Video */}
        <Col xs={12} sm={12} md={6} lg={6}>
            <Video />
        </Col>
        </Row>
    </div>
  );
}