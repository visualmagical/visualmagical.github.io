(function() {
  const trackNumber = 3,
    musicBox = document.querySelector(".musicbox");

  for (let i = 1; i <= trackNumber; i++) {
    let track = document.createElement("audio");
    track.setAttribute("src", `../site/media/${i}.mp3`);
    track.setAttribute("class", `track`);
    track.setAttribute("id", `track-${i}`);
    track.setAttribute("controls", "true");
    // track.setAttribute("preload", "true");
    musicBox.appendChild(track);
  }
})();
