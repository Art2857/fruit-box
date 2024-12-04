import React from 'react';
import { FruitEnum } from './game';

interface BoxProps {
    label: FruitEnum;
    isOpen: boolean;
    content: FruitEnum | null;
    prediction: FruitEnum | null;
    onClick: () => void;
    onPredictionChange?: (value: FruitEnum) => void;
    showPrediction: boolean;
    canChangePrediction: boolean; // Новый проп
}

const BoxComponent: React.FC<BoxProps> = ({
    label,
    isOpen,
    content,
    prediction,
    onClick,
    onPredictionChange,
    showPrediction,
    canChangePrediction,
}) => {
    return (
        <div
            className="box"
            style={{
                border: '1px solid black',
                padding: '20px',
                margin: '10px',
                width: '200px',
                textAlign: 'center',
            }}
        >
            <h3>{label}</h3>
            {isOpen && <p>Внутри: {content}</p>}
            {showPrediction &&
                (isOpen ? (
                    prediction && <p>Ваш выбор: {prediction}</p>
                ) : (
                    <>
                        <select
                            value={prediction || ''}
                            onChange={(e) =>
                                onPredictionChange && onPredictionChange(e.target.value as FruitEnum)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canChangePrediction} // Блокируем изменение предсказания
                        >
                            <option value="">Выберите содержимое</option>
                            <option value={FruitEnum.Apple}>{FruitEnum.Apple}</option>
                            <option value={FruitEnum.Orange}>{FruitEnum.Orange}</option>
                            <option value={FruitEnum.AppleAndOrange}>{FruitEnum.AppleAndOrange}</option>
                        </select>
                        <br />
                        <button onClick={onClick} style={{ marginTop: '10px' }}>
                            Открыть
                        </button>
                    </>
                ))}
            {!showPrediction && !isOpen && <button onClick={onClick}>Открыть</button>}
        </div>
    );
};

export default BoxComponent;
