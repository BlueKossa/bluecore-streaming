import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";
import { app, invoke } from "@tauri-apps/api";
import { readDir, BaseDirectory, createDir } from '@tauri-apps/api/fs';
import { appDir } from "@tauri-apps/api/path";
window.$ = window.jQuery = require('jquery');

document.addEventListener("contextmenu", (event) => event.preventDefault());
window.$(document).keyup(function(event) {
  if(event.which === 32) {
  	event.preventDefault();
		console.log("Space pressed.");
  }
});

var playlist = [];
var shuffler = [];
var playing = true;
var currPlaying = 0;
var shuffling = false;

const PlayingList = () => {
  document.getElementById("playlist").innerHTML = "";
  console.log("hello");
  if (playlist.length != 0) { 
    const fragment = document.createDocumentFragment();
    console.log(playlist); 
    for (let i = 1; i < 51 && i < playlist.length + 1; i++) {
      var place;
      var placeIndex = i + currPlaying;
      if (placeIndex >= playlist.length) {
        placeIndex -= playlist.length;
      }
      if (shuffling) {
        place = shuffler[placeIndex];
      } else {
        place = placeIndex;
      }
      console.log(i);
      const li = fragment
        .appendChild(document.createElement('li'));
      li.textContent = playlist[place].title;
    }
    document.getElementById("playlist").appendChild(fragment);
  }
}

function App() {
  const [stream, set] = useState("");
  const [currTime, setTime] = useState("dawdaw");
  const [volumeState, setVolumeState] = useState("high");
  var player;
  var volumeControl;
  var seekControl;
  async function poop() {
    console.log(await appDir());
    //await createDir('music', { dir: BaseDirectory.App })
    const files = await readDir('music', { dir: BaseDirectory.App, recursive: true });
    console.log(files);
  }
  poop();

  useEffect(() => {
    player = document.getElementById("player");
    volumeControl = document.getElementById("volume-control");
    seekControl = document.getElementById("seek-control");

    for (let e of document.querySelectorAll(
      'input[type="range"].slider-progress'
    )) {
      e.style.setProperty("--value", e.value);
      e.style.setProperty("--min", e.min == "" ? "0" : e.min);
      e.style.setProperty("--max", e.max == "" ? "100" : e.max);
      e.addEventListener("input", () => e.style.setProperty("--value", e.value));
    }
    PlayingList();
  });

  function playTime() {
    seekControl.style.setProperty(
      "--value",
      (player.currentTime / player.duration) * 100
    );
    seekControl.value = (player.currentTime / player.duration) * 100;
  }

  function skip() {
    player.pause();
    playNew();
  }

  function back() {
    player.pause();
    currPlaying -= 2;
    playNew();
  }

  function playNew() {
    currPlaying += 1;
    if (currPlaying + 1 > playlist.length) {
      currPlaying = 0;
    } else if (currPlaying <= 0) {
      currPlaying = playlist.length - 1;
    }
    var place;
    if (shuffling) {
      place = shuffler[currPlaying];
    } else {
      place = currPlaying;
    }
    invoke("get_stream", { id: playlist[place].url }).then((message) => {
      if (message != "") {
        set(message);
      } else {
        skip();
      }
    });
  }

  function queue() {
    currPlaying = 0;
    var place;
    if (shuffling) {
      place = shuffler[currPlaying];
      console.log(place);
    } else {
      place = currPlaying;
    }
    invoke("get_stream", { id: playlist[place].url }).then((message) => {
      if (message != "") {
        set(message);
      } else {
        skip();
      }
    });
  }

  function play() {
    if (playing) {
      player.pause();
      playing = false;
    } else {
      player.play();
      playing = true;
    }
  }

  function test() {
    invoke("get_stream", { id: "I27MFgmgQY0" }).then((message) =>
      console.log(message)
    );
  }

  function shuffle() {
    if (playlist != []) {
      invoke("shuffle", { count: playlist.length }).then(
        (message) => (shuffler = message)
      );
      shuffling = !shuffling;
      PlayingList();
    }
  }

  async function getPlaylist() {
    const url = document.getElementById("playlistInput").value;
    const name = document.getElementById("playlistNameInput").value;
    if (url != "" && name != "") {
      console.log(url);
      await invoke("get_playlist", { playlistUrl: url, name: name, dir: await appDir() })
        .then((message) => (playlist = message));
      document.getElementById("playlistInput").value = "";
      document.getElementById("playlistNameInput").value = "";
      PlayingList();
      console.log(playlist);
    } else {

    }
  }

  function volumeController() {
    var value = volumeControl.value;
    console.log("Hello!!!!");
    player.volume = value / 100;
    console.log(player.volume);
  }

  function seek() {
    var value = seekControl.value;
    try {
      player.currentTime = player.duration * (value / 100);
    } catch {
      seekControl.value = 0;
      seekControl.style.setProperty("--value", 0);
    }
  }

  return (
    <div class="App">
      <div class="main">
        <div class="Hidden">
          <audio
            onTimeUpdate={() => playTime()}
            controls
            autoPlay
            onError={() => playNew()}
            onEnded={() => playNew()}
            src={stream}
            id="player"
          ></audio>
        </div>
        <button onClick={() => play()}>Play/Pause</button>
        <button onClick={() => queue()}>Queue</button>
        <button onClick={() => getPlaylist()}>Load Playlist</button>
        <input id="playlistInput" placeholder="Input url to playlist"></input>
        <input id="playlistNameInput" placeholder="Input name of playlist"></input>
        <div>{currTime}</div>
        <button onClick={() => skip()}>Skip</button>
        <button onClick={() => back()}>Back</button>
        <button onClick={() => shuffle()}>Shuffle</button>
        <div class="footer" id="footer">
          <input
            class="seeker slider-progress"
            min="0"
            max="100"
            defaultValue="0"
            step="1"
            type="range"
            onChange={() => seek()}
            id="seek-control"
          ></input>
          <div class="r">
            <input
            class="seeker"
            min="0"
            max="100"
            step="1"
            type="range"
            onChange={() => volumeController()}
            id="volume-control"
          ></input>
          </div>
        </div>
        <div class="left_side" id="sidebar1">
          <ul id="playlist" class="playlist">

          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
