import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import axios from "axios";
import Cookies from "universal-cookie";
import ReactPlayer from 'react-player'
const cookies = new Cookies();

// get token generated on login
const token = cookies.get("TOKEN");

export default function AuthComponent() {
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

  let games = videolist.map(a => a.game);
  let uniquegames = [... new Set(games)]

  return (
    <div className="text-center">
      <h1>Clip Collections</h1>
      {/* displaying our message from our API call */}

      <div className="App">
      <p>
      {uniquegames.map((game) => (
      <button value={game} onClick={e => {
        setResult(videolist.filter((video) => {
          return video.game === game;
      }));
        console.log(result)
    }}>
      {game}
      </button>
      ))}
      </p>
      {result.map((video) => (
        <div className="card">
          <p>{video.videoname}</p>
          <p>{video.game}</p>
          <ReactPlayer controls url={video.link} />
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