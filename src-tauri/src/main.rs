#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::{process::Command, os::windows::process::CommandExt};

use tauri::{Manager, LogicalSize, Size};

use youtube_dl::{YoutubeDl, YoutubeDlOutput};

use rand::thread_rng;
use rand::seq::SliceRandom;

#[derive(serde::Serialize)]
struct Video {
  title: String,
  author: String,
  url: String,
}

const CREATE_NO_WINDOW: u32 = 0x08000000;

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let main_window = app.get_window("main").unwrap();

      main_window
        .set_size(Size::Logical(LogicalSize {
          width: 800.0,
          height: 600.0,
        }))
        .unwrap();
      main_window.set_min_size(Size::Logical(LogicalSize {
        width: 800.0,
        height: 600.0,
      }).into())
      .unwrap();
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![test_command, my_custom_command, get_playlist, get_stream, shuffle])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn my_custom_command() -> String {
  println!("Hello!");
  "https://rr8---sn-c5ioiv45c-5gol.googlevideo.com/videoplayback?expire=1660164392&ei=yMTzYtWZCo-D0u8P0oSx0Ac&ip=176.10.137.76&id=o-ADVNbTKtaKFo4Rpvrczv8NKW3zi0Aj2N7lUoEyBx6sf8&itag=251&source=youtube&requiressl=yes&mh=3M&mm=31%2C26&mn=sn-c5ioiv45c-5gol%2Csn-i5heen7d&ms=au%2Conr&mv=m&mvi=8&pcm2cms=yes&pl=24&initcwndbps=2073750&spc=lT-Khu9dymdb2nVDXlT_dMBaHPwiRAA&vprv=1&mime=audio%2Fwebm&ns=G4a3KZNISn54CgZIlCA7JMgH&gir=yes&clen=3250339&dur=197.561&lmt=1636661523301520&mt=1660142458&fvip=4&keepalive=yes&fexp=24001373%2C24007246&c=WEB&rbqsm=fr&txp=5311224&n=38_oYSy19qhaGR5z&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cspc%2Cvprv%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAJ9CPDBfOy67F4BavwA1xGz9EU5XprnH59Kwiqk6RSkEAiEAkNIwHLO6EqmqD_pgwWfF-yNFj8pVvqCmNWWawAE6pY8%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpcm2cms%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRgIhAOL-L4DC7DKL-yg5o1QcX9jQVAjR-lNsS8QXf6OGfy1yAiEA2TqQLOau6UWG8lI0hUXPsDG-1gfXP3d1AgiYAEcQlJI%3D".into()
}

#[tauri::command]
fn test_command() -> Vec<i32> {
  println!("testing!");
  vec![1, 2, 3]
}

#[tauri::command]
async fn get_playlist(playlist_url: String, name: String, dir: String) -> Vec<Video> {
  if playlist_url.starts_with("https://www.youtube.com/playlist?list=") {
    let mut playlist_list: Vec<Video> = Vec::new();
    println!("Hello1");
    let output = YoutubeDl::new(playlist_url)
      .flat_playlist(true)
      .run()
      .unwrap();

    let playlist_info = match output {
      YoutubeDlOutput::Playlist(playlist_info) => playlist_info,
      _ => panic!("Expected playlist info"),
    };
    println!("Hello2");
    for video in playlist_info.entries.clone().unwrap().iter() {
      println!("Hello3");
      println!("{:?}", video.uploader.clone());
      let video_info = Video {
        url: video.id.clone(),
        title: video.title.clone(),
        author: video.uploader.clone().unwrap(),
      };
      playlist_list.push(video_info);
    }
    playlist_list
  } else {
    panic!("not a playlist");
  }
}

#[tauri::command]
async fn get_stream(id: String) -> String {
  let child = Command::new("yt-dlp")
    .arg("-g")
    .arg("-f")
    .arg("bestaudio")
    .arg(id)
    .creation_flags(CREATE_NO_WINDOW)
    .output()
    .unwrap();
  let stream = String::from_utf8_lossy(&child.stdout).to_string();
  stream
}

#[tauri::command]
fn shuffle(count: i32) -> Vec<i32> {
  let mut vec: Vec<i32> = (0..count).collect();
  vec.shuffle(&mut thread_rng());
  println!("{:?}", vec);
  vec
}