import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from "react-player";
import "./App.css";

const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function FilmRoomComponent() {
  const [videolist, setVideoList] = useState([]);
  const [result, setResult] = useState([]);
  const [selectedClips, setSelectedClips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({ game: "", tags: [] });
  const [tempFilters, setTempFilters] = useState({ game: "", tags: [] }); // Temporary filter state

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
        console.error("Error fetching videos:", error);
      });
  }, []);

  const logout = () => {
    cookies.remove("TOKEN", { path: "/" });
    window.location.href = "/";
  };

  let games = videolist.map((a) => a.game);
  let uniquegames = [...new Set(games)];

  const playerNames = [
    "allie",
    "abbie",
    "jaden",
    "gabi",
    "ella",
    "brandi",
    "amelia",
    "sophia",
    "maya",
    "emily",
    "z",
    "sierra",
    "annya",
    "audrey",
    "jane",
    "liliana",
    "mila",
    "madison",
    "aylin",
    "jhansi",
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
    setSelectedFilters({ ...tempFilters }); // Apply the temporary filters
  };

  async function handleDownload() {
    setIsLoading(true);

    // Extract the links of the selected clips
    const playlistContent = selectedClips.map((clip) => clip.link);

    try {
      // Data to send to the backend
      const requestData = {
        playlistContent, // Selected clips
        userEmail, // User's email
      };

      // Send the data to the backend
      const response = await axios.post('https://filmshare-fd851c149ec7.herokuapp.com/create-mysquadreel', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle the response if needed

    } catch (error) {
      console.error("Error creating job:", error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleFilterChange = (filterType, value) => {
    setTempFilters((prevFilters) => {
      if (filterType === "game") {
        return prevFilters.game === value
          ? { ...prevFilters, game: "" } // Toggle off the game filter if already selected
          : { ...prevFilters, game: value };
      } else {
        const newTags = prevFilters.tags.includes(value)
          ? prevFilters.tags.filter((tag) => tag !== value)
          : [...prevFilters.tags, value];
        return { ...prevFilters, tags: newTags };
      }
    });
  };

  return (
    <div className="text-center">
      <div className="text-center mb-4">
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
      <h4>Select a <b>game</b> by clicking one of the buttons below:</h4>
      <div className="App">
        <p>
          {uniquegames.map((game) => (
            <button
              className={`btn btn-outline-light ${tempFilters.game === game ? 'active' : ''}`}
              value={game}
              onClick={() => handleFilterChange("game", game)}
            >
              {game}
            </button>
          ))}
        </p>
        <h4>Or select <b>tags</b> by clicking one of the buttons below:</h4>
        <p>
          <p><h5><i>Players</i></h5></p>
          {uniquePlayerTags.map((tag) => (
            <button
              key={tag}
              className={`btn btn-outline-light ${tempFilters.tags.includes(tag) ? 'active' : ''}`}
              value={tag}
              onClick={() => handleFilterChange("tag", tag)}
            >
              {tag}
            </button>
          ))}

          <p><h5><i>Other Tags</i></h5></p>
          {uniqueOtherTags.map((tag) => (
            <button
              key={tag}
              className={`btn btn-outline-light ${tempFilters.tags.includes(tag) ? 'active' : ''}`}
              value={tag}
              onClick={() => handleFilterChange("tag", tag)}
            >
              {tag}
            </button>
          ))}
        </p>
        {result.length === 0 && (
          <p>Click "Apply Filters" to see the video list.</p>
        )}
        {result.length > 0 && (
          <>
            <Button variant="outline-primary" size="sm" onClick={() => setSelectedClips(result)}>
              Select All
            </Button>
            <Button variant="outline-danger" size="sm" onClick={() => setSelectedClips([])}>
              Clear All Selections
            </Button>
            <h4>Selected Videos:</h4>
            <ul className="no-bullets">
              {selectedClips.map((video) => (
                <li key={video.link}>{video.videoname} ({video.game})</li>
              ))}
            </ul>
            <div>
              <input
                type="email"
                placeholder="Enter your email address"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <Button
                variant="primary"
                onClick={handleDownload}
                className="create-squadreel-btn"
                disabled={!selectedClips.length || isLoading} // Disable button when isLoading is true
              >
                {isLoading ? (
                  "MySquadReel is processing - check your email in a few minutes for your download link!"
                ) : (
                  "Create MySquadReel"
                )}
              </Button>
            </div>
          </>
        )}
        <p>
          {result.map((video) => (
            <div className="paddeddiv">
              <div className="card">
                <b>{video.videoname}</b>
                <i>{video.game}</i>
                <input
                  type="checkbox"
                  checked={selectedClips.includes(video)}
                  onChange={() => {
                    setSelectedClips((prev) =>
                      prev.includes(video)
                        ? prev.filter((clip) => clip !== video)
                        : [...prev, video]
                    );
                  }}
                  className="custom-checkbox"
                  style={{ margin: '0 auto' }}
                />
              </div>
              <div className="player-wrapper">
                <ReactPlayer controls url={video.link} className="react-player" width="100%" height="100%" />
              </div>
            </div>
          ))}
        </p>
      </div>
      {/* Logout button */}
      <Button type="submit" variant="danger" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
