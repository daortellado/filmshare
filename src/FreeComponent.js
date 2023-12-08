import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import { Col, Row } from "react-bootstrap";
import Cookies from "universal-cookie";
const cookies = new Cookies();

// get token generated on login
const token = cookies.get("TOKEN");

export default function FreeComponent() {
  // set an initial state for the message we will receive after the API call
  const [videolist, setVideoList] = useState([]);

  // useEffect automatically executes once the page is fully loaded
  useEffect(() => {
    // set configurations for the API call here
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setVideoList(result.data);
        console.log();
      })
      .catch((error) => {
        error = new Error();
      });
  }, []);

  let games = videolist.map(a => a.game);
  let uniquegames = [...new Set(games)]
  const [gameselection, setGameSelection] = useState("")
  const [dropdown, setDropdown] = useState(false)
  let handleGameChange = (e) => {
    setGameSelection(e.target.value)
    setDropdown(true)
  }

  return (
    <div>
            {/* Register */}
        <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
            <Register />
        </Col>
          {/* Add Video */}
        <Col xs={12} sm={12} md={6} lg={6}>
    <select onChange={handleGameChange}> 
        {/* Creating the default / starting option for our 
          dropdown.
         */}
        <option> -- Choose an existing game -- </option>
      {uniquegames.map((gameselection) => <option value={gameselection}>{gameselection}</option>)}
    </select>
            <Video gameselection={gameselection} dropdown={dropdown}/>
        </Col>
        </Row>
    </div>
  );
}