import React, { useEffect, useState } from "react";
import axios from "axios";
import Register from "./Register";
import Video from "./addVideo";
import AddTactic from "./addTactic";
import EditVideo from "./editVideo";
import BatchVideo from "./batchVideo"; 
import { Col, Row, Button, Form, Container, InputGroup } from "react-bootstrap";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function AdminComponent() {
  const [videolist, setVideoList] = useState([]);
  const [tacticsList, setTacticsList] = useState([]);
  const [gameselection, setGameSelection] = useState("");
  const [isNewGame, setIsNewGame] = useState(false); 
  const [sessionSelection, setSessionSelection] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [videoNames, setVideoNames] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [seasonName, setSeasonName] = useState('');
  const [showArchiveInput, setShowArchiveInput] = useState(false);
  const [section, setSection] = useState('videos'); 
  const [mode, setMode] = useState('add'); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const videosResponse = await axios({
          method: "get",
          url: "https://filmshare-fd851c149ec7.herokuapp.com/api/video/",
          headers: { Authorization: `Bearer ${token}` },
        });
        setVideoList(videosResponse.data);

        const tacticsResponse = await axios({
          method: "get",
          url: "https://filmshare-fd851c149ec7.herokuapp.com/api/tactics/",
          headers: { Authorization: `Bearer ${token}` },
        });
        setTacticsList(tacticsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleArchive = async () => {
    if (!seasonName) return;
    try {
      const videoResponse = await axios({
        method: 'post',
        url: 'https://filmshare-fd851c149ec7.herokuapp.com/api/archive-season',
        headers: { Authorization: `Bearer ${token}` },
        data: { seasonName }
      });
      const tacticsResponse = await axios({
        method: 'post',
        url: 'https://filmshare-fd851c149ec7.herokuapp.com/api/archive-tactics-season',
        headers: { Authorization: `Bearer ${token}` },
        data: { seasonName }
      });
      if (videoResponse.status === 200 && tacticsResponse.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];
  let sessions = tacticsList.map((a) => a.session);
  let uniquesessions = [...new Set(sessions)];

  const handleGameChange = (e) => {
    const selectedGame = e.target.value;
    setGameSelection(selectedGame);
    setDropdown(selectedGame !== "");

    if (mode === 'edit' && !isNewGame) {
      if (selectedGame) {
        const filteredVideos = videolist.filter((video) => video.game === selectedGame);
        setVideoNames(filteredVideos.map((video) => video.videoname));
        setSelectedVideo(null);
      } else {
        setVideoNames([]);
        setSelectedVideo(null);
      }
    }
  };

  // --- THE CRITICAL FIX IS HERE ---
  const handleVideoNameChange = (e) => {
    const selectedVideoName = e.target.value;
    
    // Find the video that matches BOTH the name AND the game
    const selected = videolist.find((video) => 
      video.videoname === selectedVideoName && video.game === gameselection
    );
    
    setSelectedVideo(selected);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'edit') {
        setIsNewGame(false);
        setVideoNames([]);
        setSelectedVideo(null);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} sm={12} md={6} lg={6}>
          <Register />
        </Col>
        <Col xs={12} sm={12} md={6} lg={6}>
          <div className="admin-controls">
            <div className="mb-4">
              <h3 className="mb-3">Content Management</h3>
              <div className="d-flex justify-content-center gap-2">
                <Button variant={section === 'videos' ? 'primary' : 'outline-primary'} onClick={() => setSection('videos')}>Manage Videos</Button>
                <Button variant={section === 'tactics' ? 'primary' : 'outline-primary'} onClick={() => setSection('tactics')}>Manage Tactics</Button>
              </div>
            </div>

            {section === 'videos' ? (
              <>
                <div className="mb-4">
                  <div className="d-flex justify-content-center gap-2">
                    <Button variant={mode === 'add' ? 'primary' : 'outline-primary'} onClick={() => handleModeChange('add')}>Add Video</Button>
                    <Button variant={mode === 'batch' ? 'primary' : 'outline-primary'} onClick={() => handleModeChange('batch')}>Batch Upload</Button>
                    <Button variant={mode === 'edit' ? 'primary' : 'outline-primary'} onClick={() => handleModeChange('edit')}>Edit Video</Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Form.Group className="mb-3 text-center">
                    <Form.Label>{isNewGame ? "Enter New Game Name" : "Select Game"}</Form.Label>
                    <InputGroup>
                        {isNewGame ? (
                            <Form.Control type="text" placeholder="e.g. 011625 at burbank" value={gameselection} onChange={handleGameChange} />
                        ) : (
                            <Form.Select onChange={handleGameChange} value={gameselection}>
                              <option value="">-- Choose a game --</option>
                              {uniquegames.map((game) => <option key={game} value={game}>{game}</option>)}
                            </Form.Select>
                        )}
                        <Button variant="outline-secondary" onClick={() => { setIsNewGame(!isNewGame); setGameSelection(""); setDropdown(false); }}>
                            {isNewGame ? "List" : "New"}
                        </Button>
                    </InputGroup>
                  </Form.Group>

                  {mode === 'edit' && dropdown && (
                    <Form.Group className="mb-3 text-center">
                      <Form.Label>Select Video</Form.Label>
                      <Form.Select value={selectedVideo?.videoname || ''} onChange={handleVideoNameChange}>
                        <option value="">-- Select a video --</option>
                        {videoNames.map((name) => <option key={name} value={name}>{name}</option>)}
                      </Form.Select>
                    </Form.Group>
                  )}
                </div>

                {mode === 'add' ? (
                  <Video gameselection={gameselection} dropdown={dropdown} />
                ) : mode === 'batch' ? (
                  <BatchVideo gameselection={gameselection} dropdown={dropdown} />
                ) : (
                  selectedVideo && <EditVideo video={selectedVideo} />
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <Form.Group className="mb-3 text-center">
                    <Form.Label>Select Session</Form.Label>
                    <Form.Select onChange={(e) => { setSessionSelection(e.target.value); setDropdown(true); }} value={sessionSelection}>
                      <option value="">-- Choose a session --</option>
                      {uniquesessions.map((session) => <option key={session} value={session}>{session}</option>)}
                    </Form.Select>
                  </Form.Group>
                </div>
                <AddTactic sessionSelection={sessionSelection} dropdown={dropdown} />
              </>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-4 justify-content-center">
        <Col className="text-center">
          {!showArchiveInput ? (
            <Button variant="warning" onClick={() => setShowArchiveInput(true)}>Archive Current Season</Button>
          ) : (
            <div className="d-flex justify-content-center gap-2">
              <Form.Control type="text" value={seasonName} onChange={(e) => setSeasonName(e.target.value)} placeholder="Season (e.g. 23-24)" className="w-auto" />
              <Button variant="success" onClick={handleArchive}>Confirm</Button>
              <Button variant="light" onClick={() => setShowArchiveInput(false)}>Cancel</Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}