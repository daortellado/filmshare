import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import EditVideo from "./editVideo";
import { Col, Row } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const token = cookies.get("TOKEN");
console.log("Retrieved token:", token);

export default function AdminComponent() {
  const [videolist, setVideoList] = useState([]);
  const [gameselection, setGameSelection] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [videoNames, setVideoNames] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null); // Store full video object
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        setVideoList(result.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);


  // Extract unique games
  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];

  // Handle game selection change
  const handleGameChange = (e) => {
    setGameSelection(e.target.value);
    setDropdown(true); // Show video selection dropdown
  
    // If a game is selected, filter video names
    if (e.target.value) {
      const filteredVideos = videolist.filter((video) => video.game === e.target.value);
      const filteredVideoNames = filteredVideos.map((video) => video.videoname);
      setVideoNames(filteredVideoNames);
      setSelectedVideo(null); // Reset selected video object (instead of selectedVideoName)
    } else {
      setVideoNames([]); // Clear video names if no game is selected
    }
  };

  // Handle video name selection
  const handleVideoNameChange = (e) => {
    const selectedVideo = videolist.find((video) => video.videoname === e.target.value);
    setSelectedVideo(selectedVideo); // Set the full video object
    setIsEdit(true); // Set edit mode
  };

  return (
    <div>
      {/* Register */}
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Register />
        </Col>
        {/* Add/Edit Video */}
        <Col xs={12} sm={12} md={6} lg={6}>
          <select onChange={handleGameChange}>
            {/* Default option */}
            <option>-- Choose an existing game --</option>
            {uniquegames.map((gameselection) => (
              <option key={gameselection} value={gameselection}>
                {gameselection}
              </option>
            ))}
          </select>
          {dropdown && (
            <select value={selectedVideo?.videoname} onChange={handleVideoNameChange}>
              <option value="">-- Select a video --</option>
              {videoNames.map((videoName) => (
                <option key={videoName} value={videoName}>
                  {videoName}
                </option>
              ))}
            </select>
          )}
          {isEdit ? (
          <EditVideo video={selectedVideo} /> // Pass the selectedVideo object as a prop
            ) : (
          <Video gameselection={gameselection} dropdown={dropdown} />
          )}
        </Col>
      </Row>
    </div>
  );  
}