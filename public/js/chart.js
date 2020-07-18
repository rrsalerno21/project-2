const state = $("#state");
const submitbtn = $("#search");
const deletebtn = $("#delete");
const stateRes = [];
const positiveRes = [];

submitbtn.on("click", () => {
  const settings = {
    url: "https://covidtracking.com/api/states?state=" + state.val(),
    method: "GET",
    "content-type": "applicatiion/json",
    accept: "application/json",
    timeout: 0
  };

  $.ajax(settings).done(response => {
    stateRes.push(response.state);
    positiveRes.push(response.positive);
    createChart();
  });
});

deletebtn.on("click", () => {
  const settings = {
    url: "https://covidtracking.com/api/states?state=" + state.val(),
    method: "GET",
    "content-type": "applicatiion/json",
    accept: "application/json",
    timeout: 0
  };

  $.ajax(settings).done(response => {
    let sPos = stateRes.indexOf(response.state);
    let pPos = positiveRes.indexOf(response.positive);
    stateRes.splice (sPos, 1);
    positiveRes.splice (pPos, 1);
    createChart();
  });
});

function initChart() {
  $.get("/api/user_data")
    .then(data => {
      // declare the state from the data response
      const usersState = data.state.toLowerCase();

      // set the current state value of the search bar to usersState
      state.val(usersState);

      // click the add button to create the chart
      submitbtn.click();
    })
    .catch(err => {
      throw err;
    });
}

initChart();

function createChart() {
  const myChart = document.getElementById("myChart").getContext("2d");

  const massPopChart = new Chart(myChart, {
    type: "bar", // bar, horizontalBar, pie, line, doughnut, radar, polarArea
    data: {
      labels: stateRes,
      datasets: [
        {
          label: "Covid Cases",
          data: positiveRes,

          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 99, 132, 0.6)"
          ],
          borderWidth: 2,
          borderColor: "#777",
          hoverBorderWidth: 3,
          hoverBorderColor: "#000"
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [
          {
            stacked: true,
            gridLines: {
              display: true,
              color: "rgba(255,99,132,0.2)"
            }
          }
        ],
        xAxes: [
          {
            gridLines: {
              display: false
            }
          }
        ]
      }
    }
  });

  return massPopChart;
}
