import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import EditVideo from "./editVideo";
import { Col, Row } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function AdminComponent() {
  const [videolist, setVideoList] = useState([]);
  const [gameselection, setGameSelection] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [videoNames, setVideoNames] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [seasonName, setSeasonName] = useState('');
  const [showArchiveInput, setShowArchiveInput] = useState(false);

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

  const handleArchive = async () => {
    if (!seasonName) return;
    
    try {
      const response = await axios({
        method: 'post',
        url: 'https://filmshare-fd851c149ec7.herokuapp.com/api/archive-season',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { seasonName }
      });

      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error archiving season:', error);
    }
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];

  const handleGameChange = (e) => {
    setGameSelection(e.target.value);
    setDropdown(true);
  
    if (e.target.value) {
      const filteredVideos = videolist.filter((video) => video.game === e.target.value);
      const filteredVideoNames = filteredVideos.map((video) => video.videoname);
      setVideoNames(filteredVideoNames);
      setSelectedVideo(null);
    } else {
      setVideoNames([]);
    }
  };

  const handleVideoNameChange = (e) => {
    const selectedVideo = videolist.find((video) => video.videoname === e.target.value);
    setSelectedVideo(selectedVideo);
    setIsEdit(true);
  };

  return (
    <div>
      <Row>
        <Col xs={12} sm={12} md={6} lg={6}>
          <Register />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <select onChange={handleGameChange}>
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
            <EditVideo video={selectedVideo} />
          ) : (
            <Video gameselection={gameselection} dropdown={dropdown} />
          )}
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          {!showArchiveInput ? (
            <button 
              onClick={() => setShowArchiveInput(true)}
              className="btn btn-warning"
            >
              Archive Current Season
            </button>
          ) : (
            <div className="d-flex gap-2">
              <input
                type="text"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="Enter season name (e.g. 23-24)"
                className="form-control w-auto"
              />
              <button 
                onClick={handleArchive}
                className="btn btn-success"
              >
                Confirm
              </button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}