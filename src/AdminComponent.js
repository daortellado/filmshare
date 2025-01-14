import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import EditVideo from "./EditVideo";
import { Col, Row, Button, Form, Container } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function AdminComponent() {
  const [videolist, setVideoList] = useState([]);
  const [gameselection, setGameSelection] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [videoNames, setVideoNames] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [seasonName, setSeasonName] = useState('');
  const [showArchiveInput, setShowArchiveInput] = useState(false);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

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
    const selectedGame = e.target.value;
    setGameSelection(selectedGame);
    setDropdown(true);

    if (mode === 'edit') {
      if (selectedGame) {
        const filteredVideos = videolist.filter((video) => video.game === selectedGame);
        const filteredVideoNames = filteredVideos.map((video) => video.videoname);
        setVideoNames(filteredVideoNames);
        setSelectedVideo(null);
      } else {
        setVideoNames([]);
        setSelectedVideo(null);
      }
    }
  };

  const handleVideoNameChange = (e) => {
    const selectedVideo = videolist.find((video) => video.videoname === e.target.value);
    setSelectedVideo(selectedVideo);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setGameSelection("");
    setDropdown(false);
    setVideoNames([]);
    setSelectedVideo(null);
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Register />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <div className="admin-controls">
            {/* Mode Selection */}
            <div className="mb-4">
              <h3 className="mb-3">Video Management</h3>
              <div className="d-flex justify-content-center gap-2">
                <Button
                  variant={mode === 'add' ? 'primary' : 'outline-primary'}
                  onClick={() => handleModeChange('add')}
                >
                  Add Video
                </Button>
                <Button
                  variant={mode === 'edit' ? 'primary' : 'outline-primary'}
                  onClick={() => handleModeChange('edit')}
                >
                  Edit Video
                </Button>
              </div>
            </div>

            {/* Common Game Selection for both modes */}
            <div className="mb-4">
              <Form.Group className="mb-3 text-center">
                <Form.Label>Select Game</Form.Label>
                <Form.Select 
                  onChange={handleGameChange} 
                  value={gameselection}
                >
                  <option value="">-- Choose a game --</option>
                  {uniquegames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Video Selection (only in edit mode) */}
              {mode === 'edit' && dropdown && (
                <Form.Group className="mb-3 text-center">
                  <Form.Label>Select Video</Form.Label>
                  <Form.Select
                    value={selectedVideo?.videoname || ''}
                    onChange={handleVideoNameChange}
                  >
                    <option value="">-- Select a video --</option>
                    {videoNames.map((videoName) => (
                      <option key={videoName} value={videoName}>
                        {videoName}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </div>

            {/* Video Components */}
            {mode === 'add' ? (
              <Video gameselection={gameselection} dropdown={dropdown} />
            ) : (
              selectedVideo && <EditVideo video={selectedVideo} />
            )}
          </div>
        </Col>
      </Row>

      {/* Archive Season Section */}
      <Row className="mt-4 justify-content-center">
        <Col className="text-center">
          {!showArchiveInput ? (
            <Button 
              variant="warning"
              onClick={() => setShowArchiveInput(true)}
            >
              Archive Current Season
            </Button>
          ) : (
            <div className="d-flex justify-content-center gap-2">
              <Form.Control
                type="text"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="Enter season name (e.g. 23-24)"
                className="w-auto"
              />
              <Button 
                variant="success"
                onClick={handleArchive}
              >
                Confirm
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}