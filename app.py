from flask import Flask, request, render_template, session, jsonify
from boggle import Boggle
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'

app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
debug = DebugToolbarExtension(app)

boggle_game = Boggle()
# defines instance of Boggle class


@app.route('/')
def start_game():
    """Generates game board"""

    board = boggle_game.make_board()
    session['board'] = board
    highscore = session.get("highscore", 0)
    times_played = session.get("times_played", 0)

    return render_template('index.html', board=board, highscore=highscore, times_played=times_played)


@app.route('/check-guess')
def check_guess():
    """Checks if word is valid and returns a JSON format HTTP response"""
    word = request.args['word']
    board = session['board']

    response = boggle_game.check_valid_word(board, word)

    return jsonify({'result': response})
    # can see format of responses in check_valid_word function


@app.route("/post-score", methods=["POST"])
def post_score():
    """Updates the user's score and checks high score"""

    score = request.json["score"]
    highscore = session.get("highscore", 0)
    times_played = session.get("times_played", 0)

    session['times_played'] = times_played + 1
    session['highscore'] = max(score, highscore)

    return jsonify(bestscore=score > highscore)
