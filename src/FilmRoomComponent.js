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
  const [tempFilters, setTempFilters] = useState({ game: "", tags: [] });
  const [seasons, setSeasons] = useState(['current']);
  const [selectedSeason, setSelectedSeason] = useState('current');

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
        console.log("All videos:", result.data);
        const uniqueSeasons = [...new Set(result.data.map(video => video.season))].sort();
        console.log("Unique seasons found:", uniqueSeasons);
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
        setResult([]); // Clear results when changing seasons
        setSelectedClips([]); // Clear selected clips when changing seasons
        setTempFilters({ game: "", tags: [] }); // Reset filters when changing seasons
        setSelectedFilters({ game: "", tags: [] }); // Reset applied filters when changing seasons
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
    "madeleine",
    "madison g",
    "jaden",
    "gabi",
    "ella",
    "brandi",
    "taige",
    "melia",
    "kate",
    "emily",
    "z",
    "sierra",
    "annya",
    "audrey",
    "pearl",
    "liliana",
    "mila",
    "madison"
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
  };

  async function handleDownload() {
    setIsLoading(true);
    const playlistContent = selectedClips.map((clip) => clip.link);

    try {
      const requestData = {
        playlistContent,
        userEmail,
      };

      const response = await axios.post('https://filmshare-fd851c149ec7.herokuapp.com/create-mysquadreel', requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
          ? { ...prevFilters, game: "" }
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
      <div className="season-selector mb-4">
        <select 
          value={selectedSeason} 
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="form-select w-auto mx-auto"
        >
          {seasons.map(season => (
            <option key={season} value={season}>
              {season === 'current' ? 'Current Season' : `Season ${season}`}
            </option>
          ))}
        </select>
      </div>

      <div className="text-center mb-4">
        <Button variant="primary" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
      <p><em>Click "Apply Filters" to see the video list</em> ⬆️</p>
      <h4>Select a <b>game</b> by clicking one of the buttons below:</h4>
      <div className="App">
        <p>
          {uniquegames.map((game) => (
            <button
              key={game}
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
                disabled={!selectedClips.length || isLoading}
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
            <div key={video._id} className="paddeddiv">
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
      <Button type="submit" variant="danger" onClick={logout}>
        Logout
      </Button>
    </div>
  );  
}