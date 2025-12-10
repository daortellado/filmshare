import React, { useEffect, useState } from "react";
import { Button, Form, Container, Row, Col, Modal, Pagination } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from "react-player";
import "./App.css";

const cookies = new Cookies();
const token = cookies.get("TOKEN");
const InfoModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>How to Use FilmShare</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Viewing Videos:</h5>
        <ol>
          <li>Select a game from the dropdown menu</li>
          <li>Choose any relevant player or category tags</li>
          <li>Click "Apply Filters" to see your videos</li>
        </ol>

        {/* TEMPORARILY DISABLED MYSQUADREEL INSTRUCTIONS
        <h5>Creating Your SquadReel:</h5>
        <ol>
          <li>After filtering videos, click "Create MySquadReel"</li>
          <li>Select the checkboxes next to the videos you want to include</li>
          <li>Enter your email address</li>
          <li>Click "Create MySquadReel" button</li>
          <li>Check your email in a few minutes for your compilation!</li>
        </ol>
        */}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default function FilmRoomComponent() {
  const [videolist, setVideoList] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ game: "", tags: [] });
  const [tempFilters, setTempFilters] = useState({ game: "", tags: [] });
  const [seasons, setSeasons] = useState(['current']);
  const [selectedSeason, setSelectedSeason] = useState('current');
  const [showCreateSquadReel, setShowCreateSquadReel] = useState(false);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 9; // Show 9 videos per page (3x3 grid)

  // Fetch available seasons
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
        const uniqueSeasons = [...new Set(result.data.map(video => video.season))].sort();
        setSeasons(uniqueSeasons);
      })
      .catch((error) => {
        console.error("Error fetching seasons:", error);
      });
  }, []);

  // Fetch videos for selected season
  useEffect(() => {
    const configuration = {
      method: "get",
      url: `https://filmshare-fd851c149ec7.herokuapp.com/api/video/?season=${selectedSeason}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    axios(configuration)
      .then((result) => {
        setVideoList(result.data);
        setResult([]);
        setSelectedClips([]);
        setTempFilters({ game: "", tags: [] });
        setSelectedFilters({ game: "", tags: [] });
        setHasAppliedFilters(false);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
      });
  }, [selectedSeason]);

  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];

  const playerNames = [
    "madeline",
    "madison",
    "jaden",
    "arianna",
    "ella",
    "mabel",
    "taige",
    "melia",
    "kate",
    "leila",
    "violet",
    "sierra",
    "annya",
    "audrey",
    "pearl",
    "go",
    "juliet",
    "natalie",
    "miriam",
    "lilian",
    "maelani",
    "abbie", //former players
    "allie",
    "brandi",
    "z",
    "madison g",
    "emily",
    "jane",
    "amelia",
    "liliana",
    "lili",
    "gabi",
    "maya",
    "sophia",
    "emily",
    "mila"
  ];

  let uniqueTags = [];
  let playerTags = new Set();
  let otherTags = new Set();

  videolist.forEach((video) => {
    video.tags.forEach((tag) => {
      const normalizedTag = tag.trim().toLowerCase();
      if (playerNames.includes(normalizedTag)) {
        playerTags.add(normalizedTag);
      } else {
        otherTags.add(normalizedTag);
      }
      if (!uniqueTags.includes(normalizedTag)) {
        uniqueTags.push(normalizedTag);
      }
    });
  });

  const uniquePlayerTags = [...playerTags].sort();
  const uniqueOtherTags = [...otherTags].sort();

  const applyFilters = () => {
    setResult(
      videolist.filter((video) => {
        const gameFilter = selectedFilters.game ? video.game === selectedFilters.game : true;
        const tagFilter = selectedFilters.tags.length === 0 ? true : selectedFilters.tags.every((tag) =>
          video.tags.some((videoTag) => videoTag.trim().toLowerCase() === tag)
        );
        return gameFilter && tagFilter;
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

  async function handleDownload() {
    setIsLoading(true);
    const playlistContent = selectedClips.map((clip) => clip.link);

    try {
      const requestData = {
        playlistContent,
        userEmail,
      };

      const response = await axios.post(
        'https://filmshare-fd851c149ec7.herokuapp.com/create-mysquadreel',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFilterChange = (filterType, value) => {
    setTempFilters((prevFilters) => {
      if (filterType === "game") {
        return {
          ...prevFilters,
          game: value
        };
      } else {
        const newTags = prevFilters.tags.includes(value)
          ? prevFilters.tags.filter((tag) => tag !== value)
          : [...prevFilters.tags, value];
        return { ...prevFilters, tags: newTags };
      }
    });
  };

  // Calculate pagination
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  const currentVideos = result.slice(indexOfFirstVideo, indexOfLastVideo);
  const totalPages = Math.ceil(result.length / videosPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of video grid
    window.scrollTo({
      top: document.querySelector('.video-grid').offsetTop - 100,
      behavior: 'smooth'
    });
  };

  // Create pagination items
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

      {/* Game Dropdown and Filter Section */}
      <Row className="mb-4">
        <Col xs={12} md={6} className="mb-3">
          <Form.Group>
            <Form.Label><h4>Select Game:</h4></Form.Label>
            <Form.Select
              value={tempFilters.game}
              onChange={(e) => handleFilterChange("game", e.target.value)}
            >
              <option value="">All Games</option>
              {uniquegames.map((game) => (
                <option key={game} value={game}>{game}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Tags Section */}
      <Row className="mb-4">
        <Col xs={12}>
          <h4>Select Tags:</h4>
          <div className="mb-3">
            <h5 className="text-muted">Players</h5>
            <div className="d-flex flex-wrap gap-2">
              {uniquePlayerTags.map((tag) => (
                <Button
                  key={tag}
                  variant={tempFilters.tags.includes(tag) ? "primary" : "outline-primary"}
                  onClick={() => handleFilterChange("tag", tag)}
                  className="rounded-pill"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h5 className="text-muted">Other Tags</h5>
            <div className="d-flex flex-wrap gap-2">
              {uniqueOtherTags.map((tag) => (
                <Button
                  key={tag}
                  variant={tempFilters.tags.includes(tag) ? "primary" : "outline-primary"}
                  onClick={() => handleFilterChange("tag", tag)}
                  className="rounded-pill"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
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

      {/* CreateMySquadReel Toggle - TEMPORARILY DISABLED */}
      {/* 
      {hasAppliedFilters && result.length > 0 && (
        <Row className="mb-4 justify-content-center">
          <Col xs={12} className="text-center">
            <Button
              variant="outline-primary"
              onClick={() => setShowCreateSquadReel(!showCreateSquadReel)}
              className="mb-3"
            >
              {showCreateSquadReel ? 'Hide SquadReel Creator' : 'Create MySquadReel'}
            </Button>

            {showCreateSquadReel && (
              <div className="create-squadreel-section p-4 border rounded mt-3">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => setSelectedClips(result)}
                  className="me-2"
                >
                  Select All
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  onClick={() => setSelectedClips([])}
                >
                  Clear All Selections
                </Button>

                {selectedClips.length > 0 && (
                  <div className="mt-4">
                    <h5>Selected Videos ({selectedClips.length}):</h5>
                    <ul className="list-unstyled">
                      {selectedClips.map((video) => (
                        <li key={video.link} className="mb-1">
                          {video.videoname} ({video.game})
                        </li>
                      ))}
                    </ul>

                    <Form.Group className="mt-4">
                      <Form.Control
                        type="email"
                        placeholder="Enter your email address"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="mb-3"
                      />
                      <Button
                        variant="primary"
                        onClick={handleDownload}
                        disabled={!selectedClips.length || isLoading}
                        className="w-100"
                      >
                        {isLoading ? 
                          "Processing - Check your email soon!" : 
                          "Create MySquadReel"}
                      </Button>
                    </Form.Group>
                  </div>
                )}
              </div>
            )}
          </Col>
        </Row>
      )} 
      */}

      {/* Video Grid - Update to use currentVideos instead of result */}
      {hasAppliedFilters && (
        <>
          <Row className="video-grid">
            {currentVideos.map((video) => (
              <Col xs={12} md={6} lg={4} key={video._id} className="mb-4">
                <div className="video-card">
                  <div className="video-content">
                    <div className="video-title-area">
                      <h5 className="video-title">
                        {video.videoname}
                        {/* SUBTLE DOWNLOAD LINK - ADDED TEMPORARILY */}
                        <a 
                          href={video.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          title="Open to Download"
                          style={{ 
                            marginLeft: '10px', 
                            textDecoration: 'none',
                            color: '#6c757d', // Muted gray
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          ⇩
                        </a>
                      </h5>
                      
                      {/* TEMPORARILY DISABLED CHECKBOXES
                      {showCreateSquadReel && (
                        <Form.Check
                          type="checkbox"
                          checked={selectedClips.includes(video)}
                          onChange={() => {
                            setSelectedClips((prev) =>
                              prev.includes(video)
                                ? prev.filter((clip) => clip !== video)
                                : [...prev, video]
                            );
                          }}
                        />
                      )} 
                      */}

                    </div>
                    <p className="game-title text-muted">{video.game}</p>
                    <div className="video-wrapper">
                      <ReactPlayer
                        url={video.link}
                        controls
                        width="100%"
                        height="100%"
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