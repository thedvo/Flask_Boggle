class BoggleGame {
  constructor(seconds = 60) {
    this.seconds = seconds; // game length which is defaulted 60 seconds
    this.displayTimer(); // shows timer when the new game starts

    this.score = 0; //sets score to start at 0 
    this.words = new Set();//valid guesses will be added to this set so we can avoid duplicates 

    // counts down timer every 1000 milliseconds (1 second)
    // In this case we bind the function to this instance of the game
    this.timer = setInterval(this.countdown.bind(this), 1000);

    $("#make-guess").on("submit", this.handleUserGuess.bind(this));
    // jQuery event listener for when user submits a guess
    // we bind the handleUserGuess function to this instance
  }
  
  /* handle submission of word: if unique and valid, score & show */
  async handleUserGuess(e) {
    e.preventDefault();
    const $word = $("#word");
    // jQuery variable to select the form input

    let word = $word.val().toUpperCase();
    // extracts the input value for the form 

    if (!word) return;
    // if there is no value inputted, then nothing happens

    if (this.words.has(word)) {
      this.displayMessage(`Already found ${word}`, "error");
      return;
    }
    // checks to see if the word is already in the Set. If so, send the message. This prevents users from inputting duplicate values. 

    const res = await axios.get("/check-guess", { params: { word: word.toLowerCase()}});
    // GET request is made to /check-guess endpoint which will check if the word is valid

    //response values can be seen in check_valid_word() function in boggle.py
    if (res.data.result === "not-word") {
      this.displayMessage(`${word} is not a valid English word`, "error");
    } else if (res.data.result === "not-on-board") {
      this.displayMessage(`${word} is not a valid word on this board`, "error");
    // 
    } else {
      this.addWord(word);
    // appends the valid word to the page 
      this.score += word.length;
    // adds the length of the word to the score count
      this.displayScore();
    // shows score on page
      this.words.add(word);
    // adds word to the Set
      this.displayMessage(`Added: ${word}`, "ok");
    // if word is valid, the word will be appended and 'ok' message will show
    }

    $word.val("").focus();
    // this will reset the input bar to empty string 
  }

/* show word in list of words */
  addWord(word) {
    $(".words").text($(".words").text() + word + ", ")
  }

/* show a status message for if the word is valid/invalid*/
  displayMessage(msg, cls) {
    $(".msg")
      .text(msg)
      .removeClass()
      .addClass(`msg ${cls}`);
  }

/* shows the user's score on the page */
  displayScore() {
    $("#score").text(this.score);
  }

// Displays timer on the page
  displayTimer() {
    $("#timer").text(this.seconds);
  }

//Counts down timer every 1 second
  async countdown() {
    this.seconds -= 1;
    this.displayTimer();

    if (this.seconds === 10){
        $('#timer').css('color', 'red')
        $('#timer').css('background', '#f7d2d9')
    }

    if (this.seconds === 0) {
      clearInterval(this.timer);
      await this.endGame();
    }
  }

// End of game displays high score and message.
  async endGame() {
    $("#make-guess").hide();
    const res = await axios.post("/post-score", { score: this.score });
    if (res.data.bestscore) {
      this.displayMessage(`New Record: ${this.score}!`, "ok");
    } else {
      this.displayMessage(`Game Over! Final Score: ${this.score}`, "ok");
    }
  }
}