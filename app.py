from flask import Flask, render_template, request, jsonify, session, redirect, make_response
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

app = Flask(__name__)
app.secret_key = ''

@app.route('/')
def index():
    # Check if the game data is already stored in the session
    game_data = session.get('game_data')

    #print('game_data:', game_data)
    
    if game_data:
        # The game is already in progress, render the index template with the existing game data
        return render_template('index.html', game_data=game_data)
    else:
        # Start a new game
        # Get a random celebrity
        url = 'https://www.randomcelebritygenerator.com/'
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        celebrity_name = soup.find('h1').text.strip().upper()
        celebrity_image = soup.find('img', class_='featured-celebrity-image')

        # Get the full URL of the celebrity image
        celebrity_image_src = celebrity_image['src']
        celebrity_image_url = urljoin(url, celebrity_image_src)

        # Get celebrity info from the Celebrity API
        celebrity_api_url = f'https://api.api-ninjas.com/v1/celebrity?name={celebrity_name}'
        celebrity_response = requests.get(celebrity_api_url, headers={'X-Api-Key': 's8GKdhAloT0/1N8hJdgMgw==78NMK7N3VrO5Rf1V'})
        celebrity_json = celebrity_response.json()
        
        # Get the celebrity's info from the response
        try:
            celebrity_gender = celebrity_json[0].get('gender')
            celebrity_occupation = celebrity_json[0].get('occupation')
        except (IndexError, TypeError):
            # Handle the case where the gender is not available or the API response is empty
            celebrity_gender = None
            celebrity_occupation = None
        
        # Define the set of special characters
        special_chars =[]
        # Create a list of boxes to represent the celebrity name
        boxes = []
        for c in celebrity_name:
            if c.isalpha():
                boxes.append('☐')
            elif c.isspace():
                boxes.append('-')
            else:
                boxes.append(c)
                special_chars.append(c)


        # Store the positions of the spaces and special characters in a list
        spaces_and_special_chars = [i for i, c in enumerate(celebrity_name) if c.isspace() or c in special_chars]
        
        # Create a dictionary to store the game data
        game_data = {
            'celebrity_name': celebrity_name,
            'celebrity_image_url': celebrity_image_url,
            'celebrity_occupation': celebrity_occupation,
            'boxes': boxes,
            'lives': 8,
            'correct_letters': []+special_chars,
            'incorrect_letters': [],
            'celebrity_gender': celebrity_gender,
            'game_over': False
        }

        # Store the game data in the session
        session['game_data'] = game_data

        print('game_data:', game_data)
        
        return render_template('index.html', game_data=game_data)


@app.route('/guess', methods=['POST'])
def guess():
    # Check if the game data is already stored in the session
    game_data = session.get('game_data')
    if not game_data:
        # If the session data doesn't exist, redirect to the home page
        return redirect('/')
    
    # Get the player's guess from the form data
    guess = request.form.get('guess').upper()
    
    # Check if the player has already guessed the letter
    if guess in game_data['correct_letters'] + game_data['incorrect_letters']:
        return redirect('/')
    
    # Check if the guess contains any special characters
    if re.search('[^a-zA-Z\s]', guess):
        # If the guess contains special characters, redirect back to the home page
        return redirect('/')

    # Check if the player has already guessed the letter
    if guess in game_data['correct_letters'] + game_data['incorrect_letters']:
        return redirect('/')
    
    # Get the game data from the session
    game_data = session.get('game_data')
    
    # Check if the guess is correct
    if guess in game_data['celebrity_name']:
        # Add the correct letter to the list of correct letters
        game_data['correct_letters'].append(guess)
        
        # Update the boxes with the correct letter
        for i in range(len(game_data['celebrity_name'])):
            if game_data['celebrity_name'][i] == guess:
                game_data['boxes'][i] = guess
        
        # Check if the player has guessed all the letters
        if set(game_data['celebrity_name'].replace(' ', '')).issubset(set(game_data['correct_letters'])) :
            # The player has won the game
            game_data['game_over'] = True
    else:
        # The guess is incorrect, remove a life
        game_data['lives'] -= 1
        
        # Add the incorrect letter to the list of incorrect letters
        game_data['incorrect_letters'].append(guess)
        
        # Check if the player has lost all their lives
        if game_data['lives'] == 0:
            # The player has lost the game
            game_data['game_over'] = True
    
    # Store the updated game data in the session
    print('game_data:', game_data)
    session['game_data'] = game_data
    
    # Return the updated game data as JSON
    return render_template('index.html', game_data=game_data)


@app.route('/new_game', methods=['POST'])
def new_game():
    # Clear the session data
    session.clear()
    
    # Redirect to the home page
    return redirect('/')


if __name__ == '__main__':

    app.run(debug=True)
