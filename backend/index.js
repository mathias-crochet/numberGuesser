const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const PORT = 3001;

app.use(bodyParser.json());

let randomNumber = Math.floor(Math.random() * 100) + 1;

const scoresFilePath = path.join(__dirname, 'scores.json');

app.get('/new-game', (req, res) => {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    res.json({ message: 'New game started, guess the number!' });
});

app.post('/guess', (req, res) => {
    let { guess, username } = req.body;

    if (guess === undefined) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    let response = { hint: '' };
    if (guess < randomNumber) {
        response.hint = 'higher';
    } else if (guess > randomNumber) {
        response.hint = 'lower';
    } else {
        response.hint = 'correct';

        fs.readFile(scoresFilePath, 'utf8', (err, data) => {
            if (err && err.code !== 'ENOENT') {
                return res.status(500).json({ error: 'Error reading scores file' });
            }

            let scores = data ? JSON.parse(data) : [];

            if (!username.length) {
                username = 'No name';
            }

            scores.push({ username: username ?? 'NoName', attempts: req.body.attempts });

            fs.writeFile(scoresFilePath, JSON.stringify(scores, null, 2), 'utf8', err => {
                if (err) {
                    return res.status(500).json({ error: 'Error writing to scores file' });
                }
            });
        });
    }

    res.json(response);
});

app.get('/scores', (req, res) => {
    fs.readFile(scoresFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).json({ error: 'Error reading scores file' });
        }

        const scores = data ? JSON.parse(data) : [];
        res.json(scores);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
