import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { app, fs, invoke} from "@tauri-apps/api"

document.addEventListener('contextmenu', event => event.preventDefault());

var playlist = [];
var shuffler = [];
var playing = true;
var currPlaying = 0;
var shuffling = false;

function App() {
  
  //const [stream, set] = useState("https://rr3---sn-c5ioiv45c-5gol.googlevideo.com/videoplayback?expire=1660108725&ei=VevyYtfkMOmQv_IPj8WY0AM&ip=176.10.137.76&id=o-ANZkb6t3CMnvFE5ZxktG770uHpYOt7aI7npRkwpbxlKA&itag=140&source=youtube&requiressl=yes&mh=uZ&mm=31%2C26&mn=sn-c5ioiv45c-5gol%2Csn-i5heen7z&ms=au%2Conr&mv=m&mvi=3&pcm2cms=yes&pl=24&initcwndbps=2176250&spc=lT-KhiaJG26y9w_zcOB-dhA9iQbI7Is&vprv=1&mime=audio%2Fmp4&ns=yA-YY9NX3BcCJAVjAIxkN8IH&gir=yes&clen=249509&dur=15.371&lmt=1658696556250023&mt=1660086786&fvip=5&keepalive=yes&fexp=24001373%2C24007246&c=WEB&rbqsm=fr&txp=5432434&n=0QwxG-N9j8nKR3gy&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAOI4R4rYEkUGFmUVKEiPQQGXJyrKCjGoQLNW7IoT9sFTAiEA_VSv0tFeMq3P9ejfN3XZ5gUOigxZF4i8LPYw6LYbhpk%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAIHxp8QAYk3kEz80pOO6US-mEhYGkoCNOuqbyAfrzc4SAiEAmZJKaajHs5FsOxRcSV-h_-_9-B2Hi_22GBZogvpF7bU%3D");
  const [stream, set] = useState("");
  const [currTime, setTime] = useState("dawdaw");
  var player = document.getElementById("player");
  var volumeControl = document.getElementById("volume-control");
  var seekControl = document.getElementById("seek-control")

  function playTime() {
    seekControl.style.setProperty('--value', (player.currentTime / player.duration) * 100);
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
    invoke('get_stream', { id: playlist[place].url }).then((message) => {if(message != "") {
      set(message);
    } else {
      skip();
    }});
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
    invoke('get_stream', { id: playlist[place].url }).then((message) => {if(message != "") {
      set(message);
    } else {
      skip();
    }});
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
    invoke('get_stream', { id: 'I27MFgmgQY0' }).then((message) => console.log(message));
  }

  function shuffle() {
    if (playlist != []) {
      invoke('shuffle', { count: playlist.length }).then((message) => shuffler = message);
      shuffling = !shuffling;
    }
  }

  async function getPlaylist() {
    const url = document.getElementById("playlistInput").value;
    console.log(url);
    await invoke('get_playlist', { playlistUrl: url }).then((message) => playlist = message).then(console.log("done"));
    document.getElementById("playlistInput").value = "";
    console.log(playlist);
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
      player.currentTime = player.duration * (value/100);
    } catch {
      seekControl.value = 0;
    }
  }

  for (let e of document.querySelectorAll('input[type="range"].slider-progress')) {
    e.style.setProperty('--value', e.value);
    e.style.setProperty('--min', e.min == '' ? '0' : e.min);
    e.style.setProperty('--max', e.max == '' ? '100' : e.max);
    e.addEventListener('input', () => e.style.setProperty('--value', e.value));
  }
  

  return (
    <div className="App">
      <h1>Hello!</h1>
      <div className="Hidden">
        <audio onTimeUpdate={playTime} controls autoPlay onError={playNew} onEnded={playNew} src={stream} id="player"></audio>
      </div>
      <button onClick={play}>Play/Pause</button>
      <button onClick={queue}>Queue</button>
      <input class="seeker" min="0" max="100" step="1" type="range" onChange={volumeController} id="volume-control"></input>   
      <input class="seeker slider-progress" min="0" max="100" defaultValue="0" step="1" type="range" onChange={seek} id="seek-control"></input>   
      <input class="seeker slider-progress" type="range"></input>
      <button onClick={getPlaylist}>Load Playlist</button>
      <input id="playlistInput"></input>
      <div>{currTime}</div>
      <button onClick={skip}>Skip</button>
      <button onClick={back}>Back</button>
      <button onClick={shuffle}>Shuffle</button>
      <script></script>
    </div>
  );
}

export default App;
