import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col, Modal, Pagination } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from "react-player";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

const InfoModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>How to Use Tactics Room</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Viewing Tactical Videos:</h5>
        <ol>
          <li>Select a season from the dropdown menu</li>
          <li>Choose a training session</li>
          <li>Click "Apply Filters" to see your videos</li>
          <li>Videos will automatically loop for repeated viewing</li>
        </ol>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default function TacticsComponent() {
  const [tacticsList, setTacticsList] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({ session: "" });
  const [tempFilters, setTempFilters] = useState({ session: "" });
  const [seasons, setSeasons] = useState(['current']);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 9; // Show 9 videos per page (3x3 grid)

  // Fetch available seasons
  useEffect(() => {
    const configuration = {
      method: "get",
      url: "https://filmshare-fd851c149ec7.herokuapp.com/api/tactics/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        const uniqueSeasons = [...new Set(result.data.map(tactic => tactic.season))].sort();
        setSeasons(uniqueSeasons);
      })
      .catch((error) => {
        console.error("Error fetching seasons:", error);
      });
  }, []);

  // Fetch tactics for selected season
  useEffect(() => {
    const configuration = {
      method: "get",
      url: `https://filmshare-fd851c149ec7.herokuapp.com/api/tactics/?season=${selectedSeason}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        setTacticsList(result.data);
        setResult([]);
        setTempFilters({ session: "" });
        setSelectedFilters({ session: "" });
        setHasAppliedFilters(false);
      })
      .catch((error) => {
        console.error("Error fetching tactics:", error);
      });
  }, [selectedSeason]);

  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  };

  let sessions = tacticsList.map((a) => a.session);
  let uniqueSessions = [...new Set(sessions)];

  const applyFilters = () => {
    setResult(
      tacticsList.filter((tactic) => {
        return selectedFilters.session ? tactic.session === selectedFilters.session : true;
      })
    );
  };

  useEffect(() => {
    applyFilters();
  }, [selectedFilters]);

  const handleApplyFilters = () => {
    setSelectedFilters({ ...tempFilters });
    setHasAppliedFilters(true);
  };

  const handleFilterChange = (filterType, value) => {
    setTempFilters((prevFilters) => ({
      ...prevFilters,
      [filterType]: value
    }));
  };

  // Calculate pagination
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = result.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(result.length / videosPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: document.querySelector('.video-grid').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item 
          key={number} 
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <>
      {/* Header */}
      <div className="header-container">
        <Button 
          variant="outline-light" 
          className="info-button"
          onClick={() => setShowInfoModal(true)}
        >
          Info
        </Button>
        <Button 
          variant="outline-danger" 
          className="logout-button"
          onClick={logout}
        >
          Logout
        </Button>
      </div>
      <Container className="py-4">
        {/* Info Modal */}
        <InfoModal 
          show={showInfoModal} 
          handleClose={() => setShowInfoModal(false)} 
        />
        
        {/* Season Selector */}
        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={6}>
            <Form.Select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-100"
            >
              {seasons.map(season => (
                <option key={season} value={season}>
                  {season === 'current' ? 'Current Season' : `Season ${season}`}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Session Selector */}
        <Row className="mb-4">
          <Col xs={12} md={6} className="mb-3">
            <Form.Group>
              <Form.Label><h4>Select Training Session:</h4></Form.Label>
              <Form.Select
                value={tempFilters.session}
                onChange={(e) => handleFilterChange("session", e.target.value)}
              >
                <option value="">All Sessions</option>
                {uniqueSessions.map((session) => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Apply Filters Button */}
        <Row className="mb-4 justify-content-center">
          <Col xs={12} className="text-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleApplyFilters}
              className="px-4"
            >
              Apply Filters
            </Button>
          </Col>
        </Row>

        {/* Video Grid */}
        {hasAppliedFilters && (
          <>
            <Row className="video-grid">
              {currentVideos.map((tactic) => (
                <Col xs={12} md={6} lg={4} key={tactic._id} className="mb-4">
                  <div className="video-card">
                    <div className="video-content">
                      <div className="video-title-area">
                        <h5 className="video-title">{tactic.videoname}</h5>
                      </div>
                      <p className="game-title text-muted">{tactic.session}</p>
                      <div className="video-wrapper">
                        <ReactPlayer
                          url={tactic.link}
                          controls
                          width="100%"
                          height="100%"
                          loop={true}
                          playing={false}
                          className="position-absolute top-0 left-0"
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Row className="justify-content-center mt-4 mb-4">
                <Col xs="auto">
                  <Pagination>
                    <Pagination.First 
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                    {renderPaginationItems()}
                    <Pagination.Next 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                    <Pagination.Last 
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </>
  );
}