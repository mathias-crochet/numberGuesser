import React, { useState, useEffect } from 'react';
import { Container, Form, Button, ListGroup, Alert, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faCheck } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './App.css';

const NumberGuesser = () => {
    const [guess, setGuess] = useState('');
    const [icon, setIcon] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [scores, setScores] = useState([]);
    const [username, setUsername] = useState('');
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        fetchScores();
    }, []);

    const fetchScores = async () => {
        try {
            const response = await axios.get('${process.env.REACT_APP_BACKEND_URL}/scores');
            const sortedScores = response.data.sort((a, b) => a.attempts - b.attempts);
            const topScores = sortedScores.slice(0, 5);
            setScores(topScores);
        } catch (error) {
            console.error('Error fetching scores:', error);
        }
    };

    const handleGuess = async () => {
        try {
            const response = await axios.post('${process.env.REACT_APP_BACKEND_URL}/guess', { guess: parseInt(guess), username, attempts: attempts + 1 });
            setAttempts(attempts + 1);

            if (response.data.hint === 'correct') {
                setIcon(faCheck);
                setGameOver(true);
                await fetchScores();
            } else if (response.data.hint === 'higher') {
                setIcon(faPlus);
            } else if (response.data.hint === 'lower') {
                setIcon(faMinus);
            }
        } catch (error) {
            console.error('Error making guess:', error);
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    }

    const handleNewGame = async () => {
        try {
            await axios.get('${process.env.REACT_APP_BACKEND_URL}/new-game');
            setIcon(null)
            setAttempts(0);
            setGuess('');
            setGameOver(false);
        } catch (error) {
            console.error('Error starting new game:', error);
        }
    };
    return (
        <Container fluid className="number-guesser text-center">
            <div className="position-absolute top-0 start-0 p-3 text-light small">
                <small>Created by Mathias CROCHET & Ranim TURKI</small>
            </div>
            <h1 className="text-light mb-4">Number Guesser</h1>
            <p className="text-light pb-3">Try to guess the randomly generated number between 1 and 100 in as few attempts as possible. Use the hints to guide your guesses.</p>
            <Form.Group className="my-3 w-50 mx-auto d-flex">
                <Form.Control
                    type="text"
                    placeholder="Username"
                    value={username}
                    className='py-2'
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={gameOver}
                />
            </Form.Group>
            <Row className="w-75 mx-auto pt-4">
                <Col md={6} className="text-center ">
                    <Form.Group className="my-3 w-75 mx-auto">
                        <Form.Label className="text-light">Enter your guess:</Form.Label>
                        <span> (Attempt:{attempts})</span>
                        <Form.Control
                            type="number"
                            placeholder="Guess"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            onKeyUp={handleKeyUp}
                            disabled={gameOver}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={handleGuess} disabled={gameOver}>Submit Guess</Button>
                    {gameOver && <Button variant="secondary" onClick={handleNewGame} className="ms-2">New Game</Button>}
                    <div className='hint'>
                        {icon && <Alert variant={icon === faCheck ? 'success' : 'dark'} className="mt-3"><FontAwesomeIcon icon={icon} size="3x" /></Alert>}
                    </div>
                </Col>
                <Col md={6} className="text-center">
                    <h2 className="text-light mb-4">Top 5 Scores</h2>
                    <ListGroup className="w-75 mx-auto">
                        {scores.map((score, index) => (
                            <ListGroup.Item key={index} variant="dark">{score.username}: {score.attempts} attempts</ListGroup.Item>
                        ))}
                    </ListGroup>
                </Col>
            </Row>
        </Container >
    );
};

export default NumberGuesser;
