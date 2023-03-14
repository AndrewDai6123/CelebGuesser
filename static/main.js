function newGame() {
    $.post("/new_game", function(game_data) {
        // Reload the page with the updated game data
        window.location.href = "/";
    });
}

document.addEventListener("DOMContentLoaded", function() {
    const keys = document.querySelectorAll(".key");
    const input = document.querySelector("input");
  
    keys.forEach((key) => {
      key.addEventListener("click", () => {
        if (input.value.length < 1) {
          input.value += key.textContent;
        }
      });
    });
  
    document.addEventListener("keydown", (event) => {
      const keyPressed = event.key.toUpperCase();
      const key = document.querySelector(`.key[data-letter="${keyPressed}"]`);
      if (key && input.value.length < 1) {
        input.value += keyPressed;
      }
    });

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Enter') {
          event.preventDefault();
          document.getElementById('submit-btn').click();
        }
    });
});

  