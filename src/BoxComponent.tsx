// src/BoxComponent.tsx

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
}

const BoxComponent: React.FC<BoxProps> = ({
    label,
    isOpen,
    content,
    prediction,
    onClick,
    onPredictionChange,
    showPrediction,
}) => {
    return (
        <div
            className="box"
            onClick={onClick}
            style={{
                border: '1px solid black',
                padding: '20px',
                margin: '10px',
                cursor: isOpen ? 'default' : 'pointer',
                width: '200px',
                textAlign: 'center',
            }}
        >
            <h3>{label}</h3>
            {isOpen && <p>Внутри: {content}</p>}
            {showPrediction && !isOpen && (
                <select
                    value={prediction || ''}
                    onChange={(e) => onPredictionChange && onPredictionChange(e.target.value as FruitEnum)}
                >
                    <option value="">Выберите содержимое</option>
                    <option value={FruitEnum.Apple}>{FruitEnum.Apple}</option>
                    <option value={FruitEnum.Orange}>{FruitEnum.Orange}</option>
                    <option value={FruitEnum.AppleAndOrange}>{FruitEnum.AppleAndOrange}</option>
                </select>
            )}
        </div>
    );
};

export default BoxComponent;
