var state = document.getElementById('state');
var submitbtn = document.querySelector('#search');
var deletebtn = document.querySelector('#delete')
let stateRes = [];
let positiveRes= [];


submitbtn.on('click', function(){
  var settings = {
  "url": "https://covidtracking.com/api/states?state=" + state.value,
  "method": "GET",
  "content-type": "applicatiion/json",
  "accept": "application/json",
  "timeout": 0,
}

    $.ajax(settings).done(function (response) {
      stateRes.push(response.state)
      positiveRes.push(response.positive)
      createChart();
    });
});

deletebtn.addEventListener('click', function (){
    var settings = {
        "url": "https://covidtracking.com/api/states?state=" + state.value,
        "method": "GET",
        "content-type": "applicatiion/json",
        "accept": "application/json",
        "timeout": 0,
      }
      
          $.ajax(settings).done(function (response) {
            stateRes.pop(response.state)
            positiveRes.pop(response.positive)
            createChart();
          });
});

createChart();

function createChart() {

    let myChart = document.getElementById('myChart').getContext('2d');

    // Global Options
    Chart.defaults.global.defaultFontFamily = 'Lato';
    Chart.defaults.global.defaultFontSize = 18;
    Chart.defaults.global.defaultFontColor = '#777';
    let massPopChart = new Chart(myChart, {
      type:'bar', // bar, horizontalBar, pie, line, doughnut, radar, polarArea
      data:{
        labels: stateRes,
        datasets:[{
          label:'Covid Cases',
          data: positiveRes,
          
          backgroundColor:[
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(255, 99, 132, 0.6)'
          ],
          borderWidth:2,
          borderColor:'#777',
          hoverBorderWidth:3,
          hoverBorderColor:'#000'
        }]
      },
    });
};