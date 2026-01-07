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
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const handleArchive = async () => {
    if (!seasonName) return;
    try {
      const vRes = await axios({
        method: 'post',
        url: 'https://filmshare-fd851c149ec7.herokuapp.com/api/archive-season',
        headers: { Authorization: `Bearer ${token}` },
        data: { seasonName }
      });
      const tRes = await axios({
        method: 'post',
        url: 'https://filmshare-fd851c149ec7.herokuapp.com/api/archive-tactics-season',
        headers: { Authorization: `Bearer ${token}` },
        data: { seasonName }
      });
      if (vRes.status === 200 && tRes.status === 200) window.location.reload();
    } catch (error) {
      console.error('Error archiving:', error);
    }
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];
  let sessions = tacticsList.map((a) => a.session);
  let uniquesessions = [...new Set(sessions)];

  const handleGameChange = (e) => {
    const val = e.target.value;
    setGameSelection(val);
    setDropdown(val !== "");

    if (mode === 'edit' && !isNewGame) {
      const filtered = videolist.filter((v) => v.game === val);
      setVideoNames(filtered.map((v) => v.videoname));
      setSelectedVideo(null);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col xs={12} md={6}>
          <Register />
        </Col>
        <Col xs={12} md={6}>
          <div className="admin-controls p-3 border rounded bg-light">
            <div className="mb-4 text-center">
              <h3 className="mb-3">SquadReel Admin</h3>
              <div className="d-flex justify-content-center gap-2">
                <Button variant={section === 'videos' ? 'primary' : 'outline-primary'} onClick={() => setSection('videos')}>Videos</Button>
                <Button variant={section === 'tactics' ? 'primary' : 'outline-primary'} onClick={() => setSection('tactics')}>Tactics</Button>
              </div>
            </div>

            {section === 'videos' ? (
              <>
                <div className="mb-4 d-flex justify-content-center gap-2">
                  <Button variant={mode === 'add' ? 'dark' : 'outline-dark'} onClick={() => setMode('add')}>Single</Button>
                  <Button variant={mode === 'batch' ? 'dark' : 'outline-dark'} onClick={() => setMode('batch')}>Batch</Button>
                  <Button variant={mode === 'edit' ? 'dark' : 'outline-dark'} onClick={() => setMode('edit')}>Edit</Button>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label><strong>{isNewGame ? "New Game Name" : "Select Game"}</strong></Form.Label>
                  <InputGroup>
                    {isNewGame ? (
                      <Form.Control placeholder="e.g. 011625 at burbank" value={gameselection} onChange={handleGameChange} />
                    ) : (
                      <Form.Select onChange={handleGameChange} value={gameselection}>
                        <option value="">-- Choose existing --</option>
                        {uniquegames.map((g) => <option key={g} value={g}>{g}</option>)}
                      </Form.Select>
                    )}
                    <Button variant="secondary" onClick={() => { setIsNewGame(!isNewGame); setGameSelection(""); setDropdown(false); }}>
                      {isNewGame ? "List" : "New"}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {mode === 'edit' && dropdown && (
                  <Form.Group className="mb-3">
                    <Form.Label>Select Video to Edit</Form.Label>
                    <Form.Select value={selectedVideo?.videoname || ''} onChange={(e) => setSelectedVideo(videolist.find(v => v.videoname === e.target.value))}>
                      <option value="">-- Select video --</option>
                      {videoNames.map((n) => <option key={n} value={n}>{n}</option>)}
                    </Form.Select>
                  </Form.Group>
                )}

                {mode === 'add' && <Video gameselection={gameselection} dropdown={dropdown} />}
                {mode === 'batch' && <BatchVideo gameselection={gameselection} dropdown={dropdown} />}
                {mode === 'edit' && selectedVideo && <EditVideo video={selectedVideo} />}
              </>
            ) : (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Select Session</Form.Label>
                  <Form.Select onChange={(e) => { setSessionSelection(e.target.value); setDropdown(true); }} value={sessionSelection}>
                    <option value="">-- Choose a session --</option>
                    {uniquesessions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Form.Select>
                </Form.Group>
                <AddTactic sessionSelection={sessionSelection} dropdown={dropdown} />
              </>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mt-5 justify-content-center">
        <Col md={6} className="text-center border-top pt-4">
          {!showArchiveInput ? (
            <Button variant="outline-warning" onClick={() => setShowArchiveInput(true)}>Archive Current Season</Button>
          ) : (
            <div className="d-flex justify-content-center gap-2">
              <Form.Control size="sm" type="text" value={seasonName} onChange={(e) => setSeasonName(e.target.value)} placeholder="Season (e.g. 25-26)" className="w-50" />
              <Button size="sm" variant="success" onClick={handleArchive}>Confirm</Button>
              <Button size="sm" variant="light" onClick={() => setShowArchiveInput(false)}>Cancel</Button>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}