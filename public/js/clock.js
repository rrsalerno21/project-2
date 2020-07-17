//clock js
const clock = document.getElementById("clock");

function updateTime() {
  const time = moment().format("hh:mmA");

  clock.textContent = time;
}

updateTime();
setInterval(updateTime, 1000);
