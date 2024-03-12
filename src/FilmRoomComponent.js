import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from 'react-player'
import './App.css';
const cookies = new Cookies();

// get token generated on login
const token = cookies.get("TOKEN");

export default function FilmRoomComponent() {
  // set an initial state for the message we will receive after the API call
  const [videolist, setVideoList] = useState([]);
  const [result, setResult] = useState([]);

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

  // logout
  const logout = () => {
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    window.location.href = "/";
  }

  //unique game extraction

  let games = videolist.map(a => a.game);
  let uniquegames = [...new Set(games)]
  
  // Generate unique tags directly, handling normalization and uniqueness
  // Define the list of player names
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

  // Generate unique tags, categorize player tags, and create buttons:
  let uniqueTags = [];
  let playerTags = new Set();
  let otherTags = new Set();

  videolist.forEach(video => {
    video.tags.forEach(tag => {
      const normalizedTag = tag.trim().toLowerCase();
      if (playerNames.includes(normalizedTag)) {
        playerTags.add(normalizedTag); // Use Set for uniqueness
      } else {
        otherTags.add(normalizedTag); // Use Set for uniqueness
      }
      if (!uniqueTags.includes(normalizedTag)) {
        uniqueTags.push(normalizedTag);
      }
    });
  });

  // Convert Sets to arrays and sort alphabetically
  const uniquePlayerTags = [...playerTags].sort();
  const uniqueOtherTags = [...otherTags].sort();

  return (
    <div className="text-center">
      <h4>Select a <b>game</b> by clicking one of the buttons below:</h4>
      <div className="App">
      <p>
      {uniquegames.map((game) => (
      <button class="btn btn-outline-light" value={game} onClick={e => {
        setResult(videolist.filter((video) => {
          return video.game === game;
      }));
        console.log(result)
    }}>
      {game}
      </button>
      ))}
      </p>
      <h4>Or select a <b>tag</b> by clicking one of the buttons below:</h4>
      <p>
      <p><h5><i>Players</i></h5></p>
      {uniquePlayerTags.map((tag) => (
        <button key={tag} class="btn btn-outline-light" value={tag} onClick={e => {
          setResult(videolist.filter(video => video.tags.some(videoTag => videoTag.trim().toLowerCase() === tag)));
          console.log(result);
        }}>
          {tag}
        </button>
      ))}

      <p><h5><i>Other Tags</i></h5></p>
      {uniqueOtherTags.map((tag) => (
        <button key={tag} class="btn btn-outline-light" value={tag} onClick={e => {
          setResult(videolist.filter(video => video.tags.some(videoTag => videoTag.trim().toLowerCase() === tag)));
          console.log(result);
        }}>
          {tag}
        </button>
      ))}
      </p>
      {result.map((video) => (
        <div className="paddeddiv">
        <div className="card">
          <b>{video.videoname}</b>
          <i>{video.game}</i>
          </div>
          <div className='player-wrapper'>
          <ReactPlayer controls url={video.link} className='react-player' width='100%' height='100%'/>
          </div>
        </div>
      ))}
    </div>

      {/* logout */}
      <Button type="submit" variant="danger" onClick={() => logout()}>
        Logout
      </Button>
    </div>
  )
}