import React, { useState } from 'react';
import BoxComponent from './BoxComponent';
import { FruitGame, Box, FruitEnum, YouLostError } from './game';

const App: React.FC = () => {
    const [game, setGame] = useState(new FruitGame());
    const [boxes, setBoxes] = useState<Box[]>(game.boxes);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

    const handleBoxClick = (index: number) => {
        try {
            const isFinished = game.open(index);
            setBoxes(game.boxes);

            if (isFinished) {
                // Проверяем, выиграл ли пользователь
                const isWin = game.checkWin();
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
        const numBoxesOpened = boxes.filter((box) => box.isOpen).length;
        if (numBoxesOpened < 2 && gameState === 'playing') {
            try {
                game.setPrediction(index, value);
                setBoxes(game.boxes);
            } catch (error: any) {
                alert(error.message);
            }
        } else {
            alert('Вы больше не можете менять свой выбор');
        }
    };

    const handleRestart = () => {
        const newGame = new FruitGame();
        setGame(newGame);
        setBoxes(newGame.boxes);
        setGameState('playing');
    };

    const numBoxesOpened = boxes.filter((box) => box.isOpen).length;
    const canChangePrediction = numBoxesOpened < 2 && gameState === 'playing';

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Игра с коробками</h1>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>
                Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и
                яблоки, и апельсины. Однако все коробки подписаны неправильно: на коробке с яблоками не может
                быть написано "яблоки", на коробке с апельсинами — "апельсины", и на коробке с обоими фруктами
                — "яблоки и апельсины". Вам можно достать только один фрукт из любой коробки и по нему
                определить, что находится в остальных коробках. Опишите алгоритм, как гарантированно
                определить, что находится в каждой коробке.
            </p>
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
                        canChangePrediction={canChangePrediction}
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
