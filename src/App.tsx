// src/App.tsx
import './App.css';
import React, { useState, useEffect } from 'react';
import BoxComponent from './BoxComponent';
import { FruitGame, FruitsEnum, YouLostError } from './game';

const STORAGE_KEY = 'fruitGameState';

const App: React.FC = () => {
    const [game, setGame] = useState<FruitGame | null>(null);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

    // Загрузка игры из localStorage при первом рендере
    useEffect(() => {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            try {
                const json = JSON.parse(savedState);
                const loadedGame = FruitGame.fromJSON(json.game);
                setGame(loadedGame);
                setGameState(json.gameState);
                return;
            } catch (error) {
                console.error('Ошибка при загрузке сохранённого состояния:', error);
            }
        }
        // Если сохранённого состояния нет или произошла ошибка, начинаем новую игру
        const newGame = new FruitGame();
        setGame(newGame);
        setGameState('playing');
    }, []);

    // Сохранение игры в localStorage при каждом изменении
    useEffect(() => {
        if (game) {
            const stateToSave = {
                game: game.toJSON(),
                gameState: gameState,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        }
    }, [game, gameState]);

    const handleBoxClick = (index: number) => {
        if (!game || gameState !== 'playing') return;
        try {
            game.open(index);
            const newGame = game.clone();
            setGame(newGame);

            if (newGame._boxes.every((box) => box.isOpen)) {
                // Проверяем, выиграл ли пользователь
                const isWin = newGame.checkWin();
                setGameState(isWin ? 'won' : 'lost');
            }
        } catch (error: any) {
            if (error instanceof YouLostError) {
                setGameState('lost');
            } else {
                alert(error.message);
            }
        }
    };

    const handlePredictionChange = (index: number, value: FruitsEnum) => {
        if (!game || gameState !== 'playing') return;
        const numBoxesOpened = game._boxes.filter((box) => box.isOpen).length;
        if (numBoxesOpened < 2) {
            try {
                game.setPrediction(index, value);
                const newGame = game.clone();
                setGame(newGame);
            } catch (error: any) {
                alert(error.message);
            }
        } else {
            alert('Вы больше не можете менять свой выбор');
        }
    };

    const handleRestart = () => {
        localStorage.removeItem(STORAGE_KEY);
        const newGame = new FruitGame();
        setGame(newGame);
        setGameState('playing');
    };

    if (!game) {
        return <div>Загрузка...</div>;
    }

    const numBoxesOpened = game._boxes.filter((box) => box.isOpen).length;
    const canChangePrediction = numBoxesOpened < 2 && gameState === 'playing';

    return (
        <div style={{ textAlign: 'center', userSelect: 'none' }}>
            <h1>Игра с коробками</h1>
            <p style={{ maxWidth: '800px', margin: '0 auto', marginTop: '20px', fontSize: '18px' }}>
                Есть три коробки: в одной лежат только яблоки, в другой — только апельсины, а в третьей — и
                яблоки, и апельсины. Однако все коробки подписаны неправильно: на коробке с яблоками не может
                быть написано "яблоки", на коробке с апельсинами — "апельсины", и на коробке с обоими фруктами
                — "яблоки и апельсины". Вам можно достать только один фрукт из любой коробки и по нему
                определить, что находится в остальных коробках.
                <p>Опишите алгоритм, как гарантированно определить, что находится в каждой коробке.</p>
                <br></br>
                <b style={{ color: '#992211' }}>
                    У вас есть всего одна попытка! <br></br>Прежде чем открывать первую коробку, попробуйте
                    определить, что находится в остальных коробках, так как начать заново нельзя!
                </b>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '90px' }}>
                {game._boxes.map((box, index) => (
                    <BoxComponent
                        key={index}
                        label={box.label}
                        isOpen={box.isOpen}
                        content={box.content}
                        prediction={box.prediction}
                        took={box.took}
                        onClick={() => handleBoxClick(index)}
                        onPredictionChange={(value) => handlePredictionChange(index, value)}
                        showPrediction={game.indexOpenedBox !== null && index !== game.indexOpenedBox}
                        canChangePrediction={canChangePrediction}
                    />
                ))}
            </div>
            <div style={{ marginTop: '140px', fontSize: '36px' }}>
                {gameState === 'won' && <h2 style={{ color: '#119922' }}>Поздравляем! Вы победили!</h2>}
                {gameState === 'lost' && <h2 style={{ color: '#992211' }}>К сожалению, вы проиграли.</h2>}
            </div>
            {/* {(gameState === 'won' || gameState === 'lost') && (
                <button onClick={handleRestart}>Начать заново</button>
            )} */}
        </div>
    );
};

export default App;
