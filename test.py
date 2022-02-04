from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle

app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']


class FlaskTests(TestCase):

   
    def setUp(self):
        """Set up before every test"""
        self.client = app.test_client()
        app.config['TESTING'] = True

    def test_start_game(self):
        """Check for correct HTTP response"""
        with self.client as client:

            res = client.get('/')

            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('times_played'))

    def test_check_guess(self):
        """Tests for valid word user guesses"""
        with self.client as client:
            with client.session_transaction() as test_session:

                test_session['board'] = [["T", "E", "S", "T", "T"],
                                         ["T", "E", "S", "T", "T"],
                                         ["T", "E", "S", "T", "T"],
                                         ["T", "E", "S", "T", "T"],
                                         ["T", "E", "S", "T", "T"]]

        res = client.get('/check-guess?word=test')
        self.assertEqual(res.json['result'], 'ok')


    def test_invalid_word(self):
        """Makes sure word is in the dictionary"""
        self.client.get('/')
        response = self.client.get('/check-guess?word=invalid')
        self.assertEqual(response.json['result'], 'not-on-board')
    
    def not_a_word(self):
        """Checks for any non-English words"""
        with self.client as client:

            res = client.get('/check-guess?word=notaword')
            self.assertEqual(res.json['result'], 'not-word')
