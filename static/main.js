let loading = false;

function newGame() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";
  loading = true;
  
  $.post("/new_game", function(game_data) {
    // Reload the page with the updated game data
    window.location.href = "/";
  })

  // Save the current lives data to local storage
  const livesLeft = parseInt(document.getElementById("lives-left").textContent);
  const livesDict = JSON.parse(localStorage.getItem("livesDict")) || {};
  livesDict[livesLeft] = (livesDict[livesLeft] || 0) + 1;
  localStorage.setItem("livesDict", JSON.stringify(livesDict));

}

function checkInput() {
  var input = document.getElementById("guess").value;
  if (input) {
    document.getElementById("submit-btn").type = 'submit';
  } else {
    document.getElementById("submit-btn").type = 'button';
  }
}

document.addEventListener("DOMContentLoaded", myListener);
function myListener() {
  
  const keys = document.querySelectorAll(".key");
  const input = document.getElementById("guess");

  keys.forEach((key) => {
    key.addEventListener("click", () => {
      if (key.textContent === "ENTER") {
        if (document.getElementById("end-msg")) {
          document.getElementById("new-game-btn").click();
        } else if (input.value) {
          document.getElementById("submit-btn").click();
        }
      } else if (key.textContent === "⌫") {
        input.value = input.value.slice(0, -1);
      } else if (input.value.length < 1 && key.textContent !== "⌫" && key.textContent !== "ENTER") {
        input.value += key.textContent;
      }
    });
  });
  

  document.addEventListener("keydown", (event) => {
    const keyPressed = event.key.toUpperCase();
    const key = document.querySelector(`.key[data-letter="${keyPressed}"]`);
    if (key && input.value.length < 1 && key.textContent !== "⌫") {
      input.value += keyPressed;
    } else if (key && key.textContent === "⌫") {
      input.value = input.value.slice(0, -1);
    } else if (event.code === "Enter") {
      if (document.getElementById("end-msg") && loading == false) {
        document.getElementById("new-game-btn").click();
      } else {
        if (input.value !== "" && !document.getElementById("end-msg")) {
          document.getElementById("submit-btn").click();
        }
      }
    }
  });
}

function getStats(){
  // Get lives data from local storage
  const livesDict = JSON.parse(localStorage.getItem("livesDict")) || {};
  const livesData = [];
  for (let i = 8; i >= 0; i--) {
    livesData.push(livesDict[i] || 0);
  }

  // Create a chart using Chart.js
  const ctx = document.getElementById("lives-chart").getContext("2d");

  const innerBarText = {
    id: 'innerBarText',
    afterDatasetsDraw(chart, args, pluginOptions){
      const {ctx, data, chartArea: {left}, scales: {x,y}} = chart;
      ctx.save();

      data.datasets[0].data.forEach((dataPoint, index) =>{
        ctx.font = 'bolder 12px';
        ctx.fillStyle = 'white';
        ctx.fillText(`${dataPoint}`, left + 10, y.getPixelForValue(index))
      })

    }
  }
  
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Array.from(Array(9).keys()).reverse(),
      datasets: [
        {
          label: "LIVES DISTRIBUTION",
          data: livesData,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false
    },
    plugins: [innerBarText]
  });
}