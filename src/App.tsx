// src/App.tsx

import React, { useState } from 'react';
import BoxComponent from './BoxComponent';
import { FruitGame, Box, FruitEnum, YouLostError } from './game';

const App: React.FC = () => {
    const [game, setGame] = useState(new FruitGame());
    const [boxes, setBoxes] = useState<Box[]>(game.boxes);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

    const handleBoxClick = (index: number) => {
        if (gameState !== 'playing') return;

        try {
            const isFinished = game.open(index);
            setBoxes(game.boxes);

            if (isFinished) {
                // Проверяем, выиграл ли пользователь
                const isWin = game.boxes.every((box) => box.prediction === box.content || box.isOpen);

                setGameState(isWin ? 'won' : 'lost');
            }
        } catch (error: any) {
            if (error instanceof YouLostError) {
                setGameState('lost');
                setBoxes(game.boxes);
            } else {
                alert(error.message);
            }
        }
    };

    const handlePredictionChange = (index: number, value: FruitEnum) => {
        try {
            game.setPrediction(index, value);
            setBoxes(game.boxes);
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleRestart = () => {
        const newGame = new FruitGame();
        setGame(newGame);
        setBoxes(newGame.boxes);
        setGameState('playing');
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Игра с коробками</h1>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                {boxes.map((box, index) => (
                    <BoxComponent
                        key={index}
                        label={box.label}
                        isOpen={box.isOpen}
                        content={box.content}
                        prediction={box.prediction}
                        onClick={() => handleBoxClick(index)}
                        onPredictionChange={(value) => handlePredictionChange(index, value)}
                        showPrediction={game.indexOpenedBox !== null && index !== game.indexOpenedBox}
                    />
                ))}
            </div>
            {gameState === 'won' && <h2>Поздравляем! Вы победили!</h2>}
            {gameState === 'lost' && <h2>К сожалению, вы проиграли.</h2>}
            {(gameState === 'won' || gameState === 'lost') && (
                <button onClick={handleRestart}>Начать заново</button>
            )}
        </div>
    );
};

export default App;
