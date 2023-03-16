let loading = false;

function newGame() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";
  loading = true;
  
  $.post("/new_game", function(game_data) {
    // Reload the page with the updated game data
    window.location.href = "/";
  })
}

document.addEventListener("DOMContentLoaded", myListener);
function myListener() {
    const keys = document.querySelectorAll(".key");
    const input = document.querySelector("input");
  
    keys.forEach((key) => {
      key.addEventListener("click", () => {
        if (key.textContent === 'ENTER') {
          if (document.getElementById("end-msg")) {
            document.getElementById('new-game-btn').click();
          }
          else {
            if (input.value !== "")
            document.getElementById('submit-btn').click();
          }
        } else if (key.textContent === "⌫") {
          input.value = input.value.slice(0, -1);
        } else if (input.value.length < 1 && key.textContent !== "⌫") {
          input.value += key.textContent;
        }
      });
    });
    
    document.addEventListener("keydown", (event) => {
      const keyPressed = event.key.toUpperCase();
      const key = document.querySelector(`.key[data-letter="${keyPressed}"]`);
      const popup = document.getElementById("popup");
      if (key && input.value.length < 1 && key.textContent !== "⌫") {
        input.value += keyPressed;
      } else if (key && key.textContent === "⌫") {
        input.value = input.value.slice(0, -1);
      } else if (event.code === 'Enter') {
          if (document.getElementById("end-msg") && loading == false) {
            document.getElementById('new-game-btn').click();
          }
          else {
            if (input.value !== "")
            document.getElementById('submit-btn').click();
          }
      }
    });    

};
