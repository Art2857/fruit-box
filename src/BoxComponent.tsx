import React from 'react';
import { FruitEnum, FruitsEnum } from './game';

import treasureSvg from './assets/treasure-svgrepo-com.svg';
import pointerAppleSvg from './assets/pointers/pointer-apple.svg';
import pointerOrangeSvg from './assets/pointers/pointer-orange.svg';
import pointerAppleAndOrangeSvg from './assets/pointers/pointer-apple-and-orange.svg';
import groundSvg from './assets/ground-svgrepo-com.svg';

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
        <>
            
            <div
                className="box"
                style={{
                    padding: '10px',
                    margin: '10px',
                    width: '250px',
                    height: '250px',
                    textAlign: 'right',
                    position: 'relative',
                    backgroundImage: `url(${
                        label === FruitsEnum.Apple
                            ? pointerAppleSvg
                            : label === FruitsEnum.Orange
                            ? pointerOrangeSvg
                            : pointerAppleAndOrangeSvg
                    })`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            >
                <div
                style={{
                    zIndex: -1,
                    position: 'absolute',
                    width: '450px',
                    height: '250px',
                    backgroundImage: `url(${groundSvg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    transform: 'scale(2.1, 1)',
                    translate: '20% 20%',
                }}
            ></div>
            </div>

            <div
                className="box"
                style={{
                    padding: '20px',
                    margin: '10px',
                    width: '200px',
                    height: '200px',
                    textAlign: 'center',
                    backgroundImage: `url(${treasureSvg})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                }}
            >
                {!showPrediction && !isOpen && (
                    <button
                        onClick={onClick}
                        style={{ width: '110%', height: '30%', position: 'relative', top: '30vh' }}
                    >
                        Открыть <br></br>
                        {label}
                    </button>
                )}

                {isOpen &&
                    (took ? (
                        <p style={{ position: 'relative', top: '30vh', fontSize: '19px' }}>
                            {`Вы достали из коробки:`} <b>{took}</b>
                        </p>
                    ) : (
                        <p style={{ position: 'relative', top: '29vh', fontSize: '19px' }}>
                            {'Внутри: '}
                            <b>{content}</b>
                        </p>
                    ))}

                {showPrediction &&
                    (isOpen ? (
                        prediction && (
                            <p style={{ position: 'relative', top: '30.3vh', fontSize: '19px' }}>
                                Ваш выбор: <b>{prediction}</b>
                            </p>
                        )
                    ) : (
                        <>
                            <div style={{ position: 'relative', top: '30vh' }}>
                                <select
                                    style={{ padding: '8px', marginBottom: '10px' }}
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
                                    <option value={FruitsEnum.AppleAndOrange}>
                                        {FruitsEnum.AppleAndOrange}
                                    </option>
                                </select>

                                <br />

                                {prediction && (
                                    <button
                                        onClick={onClick}
                                        style={{ marginTop: '10px', width: '90%', height: '30%' }}
                                    >
                                        Открыть
                                    </button>
                                )}
                            </div>
                        </>
                    ))}
            </div>
        </>
    );
};

export default BoxComponent;
