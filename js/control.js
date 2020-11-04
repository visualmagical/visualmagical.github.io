"use strict";

//        AUDIO       //

let audioElement = new Audio();
audioElement.src = `./media/holy.mp3`;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioSrc = audioCtx.createMediaElementSource(audioElement);
let wi = window.innerWidth;
let hi = document.body.scrollHeight - 4; // crutch
const growHeight = hi / 4 * 3;
const growCoef = 160;
const maxK = growHeight / growCoef;
const trackLength = 281 * 60 // in frames
const addK = maxK / trackLength;
let xincr = 0, yincr = 0;
const analyser = audioCtx.createAnalyser();
const amount = 100;
const pointAmount = 50;
const starsAmount = 300;
const  fData = new Uint8Array(pointAmount);
audioSrc.connect(analyser);
audioSrc.connect(audioCtx.destination);

let initialHue, finalHue, diffHue, hueStep, currentHue;
let runAll, runChart, runCircles;

let k = 1;
let m = 0;
let p = 0;
const ranVals = [0, 0.5, -0.5];



//      UI      //

const wrapper = document.getElementById('visuals');
audioElement.addEventListener("ended", toStart.bind(this));


function startTheShow() {
  audioCtx.resume().then(() => {
    if (audioElement.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  });
}


function playTrack() {
  audioElement.play();
  // runCircles = requestAnimationFrame(animateCircles);
  animateCircles()
  // runChart = requestAnimationFrame(renderChart);
  renderChart();
}


function pauseTrack() {
  audioElement.pause();
  cancelAnimationFrame(runCircles);
  cancelAnimationFrame(runChart);
}


function toStart() {
  audioElement.currentTime = 0;
  cancelAnimationFrame(runChart);
}



//          D3        //

let svgContainer = d3
    .select(".visual")
    .append("svg")
    .attr("class", "line-wrap")
    .attr("height", hi)
    .attr("width", wi);

svgContainer.html('<defs><pattern id="circles" x="0" y="0" patternUnits="userSpaceOnUse"></pattern></defs>');

const ctrls = svgContainer
    .append("g")
    .attr("class", 'ctrls')
    .attr("transform", `translate(${wi / 2 - 65},${hi / 4 - 81})`)


ctrls
    .append("circle")
    .attr("cx", 65.254)
    .attr("cy", 80.784)
    .attr("r", 70)
    .attr("class", 'trigger')
    .attr("stroke", '#fff')
    .attr("stroke-width", '50')


ctrls
    .append("path")
    .attr("d", "M52.735 45.898c-6.602-3.786-11.953-.685-11.953 6.922v56.138c0 7.615 5.352 10.711 11.953 6.929l49.065-28.14c6.604-3.787 6.604-9.923 0-13.711l-49.065-28.138z")
    .attr("class", 'play')

svgContainer.append("path")
    .attr("fill", "url(#circles)")
    .attr("class", "octy")

const svgns = "http://www.w3.org/2000/svg";
const pattern = document.querySelector("#circles")
pattern.setAttributeNS(null, 'width', 400);
pattern.setAttributeNS(null, 'height', 400);
const bg = document.createElementNS(svgns, 'rect');
bg.setAttributeNS(null, 'height', 400);
bg.setAttributeNS(null, 'width', 400);
bg.setAttributeNS(null, 'fill', "#000");
pattern.appendChild(bg);
const trigger = document.querySelector(".ctrls");
trigger.addEventListener("click", startTheShow.bind(this));
const octy = document.querySelector(".octy");
octy.addEventListener("click", startTheShow.bind(this));

const lineGenerator = d3.line().curve(d3.curveBasisClosed);
const initialAry = [...Array(pointAmount)].map(() => [355, 318.5])


initCircles();


function initCircles() {
  for (let i = 0; i < starsAmount; i++) {
    const star = document.createElementNS(svgns, 'circle');
    const hue = Math.round(Math.random() * 360)
    star.setAttributeNS(null, 'cx', Math.random() * 400);
    star.setAttributeNS(null, 'cy', Math.random() * 400);
    star.setAttributeNS(null, 'r', 1);
    star.setAttributeNS(null, 'class', 'star');
    star.setAttributeNS(null, 'fill', `hsl(${hue}, 100%, 50%)`);
    pattern.appendChild(star);
  }
}


function animateCircles() {
  runCircles = requestAnimationFrame(animateCircles);
  const currStars = document.querySelectorAll(".star");
  const ary = [...currStars]

  for (let i = 0; i < ary.length; i++){
      const randomX = ranVals[Math.floor(ranVals.length * Math.random())];
      const randomY = ranVals[Math.floor(ranVals.length * Math.random())];

      ary[i].setAttributeNS(null, 'cx', +ary[i].getAttribute('cx') + randomX);
      ary[i].setAttributeNS(null, 'cy', +ary[i].getAttribute('cy') + randomY);
  }
}


function renderChart() {
  runChart = requestAnimationFrame(renderChart);
  analyser.getByteFrequencyData(fData);
  let fDataArr = Array.from(fData);

  let xyArr = fDataArr.map((item, i) => {
    let x1, y1, xx, yy;
    const angle1 = Math.PI * 2 / pointAmount * i;

    // TODO fix if statement
    x1 = Math.cos(angle1) > 0 ? Math.cos(angle1 + m) * fDataArr[i] * 2 : Math.cos(angle1 + m) * fDataArr[i] * 2;
    y1 = Math.sin(angle1) > 0 ? Math.sin(angle1 + m) * fDataArr[i] * 2 : Math.sin(angle1 + m) * fDataArr[i] * 2;

    xx = x1 > 0 ? (x1 * k) * 2/3 + wi / 2 : (x1 * k) * 2/3 + wi / 2;
    yy = y1 > 0 ? (y1 * k) * 2/3 + hi / 4 : (y1 * k) * 2/3 + hi / 4;

    // k+= 0.00001;
    // m += 0.00005;
    return ([ xx, yy ])
  });

  k += addK;
  m += 0.0025;

  let genData = lineGenerator(xyArr);

  svgContainer
      .select(".octy")
      .attr("d", genData)
      .attr("stroke-width", 3)
      .attr("stroke", "#000")
      .transition()
      .duration(100)
      .attr("d", genData)

  p++;
  if (audioElement.currentTime >= 277) {
    cancelAnimationFrame(runChart);
    trigger.removeEventListener("click", startTheShow.bind(this));
    octy.removeEventListener("click", startTheShow.bind(this));
    trigger.classList.add("ended");
    setTimeout(() => cancelAnimationFrame(runCircles), 5000);
  }
}

