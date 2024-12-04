import React from 'react';
import { FruitEnum, FruitsEnum } from './game';

interface BoxProps {
    label: FruitsEnum;
    isOpen: boolean;
    content: FruitsEnum | null;
    prediction: FruitsEnum | null;
    took: FruitEnum | null;
    onClick: () => void;
    onPredictionChange?: (value: FruitsEnum) => void;
    showPrediction: boolean;
    canChangePrediction: boolean;
}

const BoxComponent: React.FC<BoxProps> = ({
    label,
    isOpen,
    content,
    prediction,
    took,
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

            {isOpen &&
                (took ? (
                    <p>
                        {`Вы достали из коробки:`} <b>{took}</b>
                    </p>
                ) : (
                    <p>
                        {'Внутри: '}
                        <b>{content}</b>
                    </p>
                ))}
            {showPrediction &&
                (isOpen ? (
                    prediction && <p>Ваш выбор: {prediction}</p>
                ) : (
                    <>
                        <select
                            value={prediction || ''}
                            onChange={(e) =>
                                onPredictionChange && onPredictionChange(e.target.value as FruitsEnum)
                            }
                            onClick={(e) => e.stopPropagation()}
                            disabled={!canChangePrediction}
                        >
                            <option value="">Выберите содержимое</option>
                            <option value={FruitsEnum.Apple}>{FruitsEnum.Apple}</option>
                            <option value={FruitsEnum.Orange}>{FruitsEnum.Orange}</option>
                            <option value={FruitsEnum.AppleAndOrange}>{FruitsEnum.AppleAndOrange}</option>
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
