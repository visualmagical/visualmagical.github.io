"use strict";

//        AUDIO       //

let audioElement = new Audio();
audioElement.src = `../media/01.mp3`;
audioElement.num = +audioElement.src.slice(-5, -3);
// audioElement.setAttribute("controls", "controls"); //debugging
// console.log(audioElement.num); //debugging
// document.body.appendChild(audioElement); //debugging

const trackCount = 38;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioSrc = audioCtx.createMediaElementSource(audioElement);
const pointAmount = 50,
    fData = new Uint8Array(pointAmount);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 256;
audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);
let audioVisual;

const w = window.innerWidth + 50,
    hi = 400;

//      UI      //
const trigger = document.querySelector(".logo"),
    rocknroll = document.querySelector(".rocknroll"),
    ears = document.querySelector(".ears"),
    stopit = document.querySelector(".stopit"),
    change = document.querySelector(".change"),
    musicBox = document.querySelector(".musicbox"),
    trackNumber = 10;

function startTheShow() {
    audioCtx.resume().then(() => {
        if (audioElement.paused) {
            playTrack()
        } else {
            pauseTrack();
        }
    });
}

function playTrack() {
    audioElement.play();
    audioVisual = requestAnimationFrame(renderChart);
    trigger.classList.add("logo--play");
    change.classList.add("change--play");
}

function pauseTrack() {
    audioElement.pause();
    cancelAnimationFrame(audioVisual);
    trigger.classList.remove("logo--play");
    change.classList.remove("change--play");
}

function changeTheVibe() {
    audioElement.currentTime = 0;
    let num = audioElement.num;

    if (num === trackCount) {
        audioElement.src = `../media/01.mp3`;
        audioElement.num = 1;
    } else {
        if (num < 9) {
            audioElement.src = `../media/0${num + 1}.mp3`;
        } else {
            audioElement.src = `../media/${num + 1}.mp3`;
        }
        audioElement.num += 1;
    }

    audioElement.play();
}

trigger.addEventListener("click", startTheShow.bind(this));
change.addEventListener("click", changeTheVibe.bind(this));
audioElement.addEventListener("ended", changeTheVibe.bind(this));

//        D3        //
let svgContainer = d3
    .select(".visual")
    .append("svg")
    .attr("class", "line-wrap")
    .attr("height", hi)
    .attr("width", w);

svgContainer.append("path").attr("fill", "none");

function renderChart() {
    audioVisual = requestAnimationFrame(renderChart);
    analyser.getByteFrequencyData(fData);
    let fDataArr = Array.from(fData);

    let xyArr = fDataArr.map((item, i) => [
        w / pointAmount * i,
        hi - (item * 1.2 + 2)
    ]);


    var lineGenerator = d3.line().curve(d3.curveCardinal);
    let genData = lineGenerator(xyArr);

    svgContainer
        .select("path")
        .attr("d", genData)
        .attr("class", "line")
        .attr("stroke-width", 3)
        .attr("stroke", "#7fe871")
        .transition()
        .duration(270)
        .attr("d", genData);
}