// src/game.ts

// Названия коробок
export enum FruitsEnum {
    Apple = 'Яблоки',
    AppleAndOrange = 'Яблоки и Апельсины',
    Orange = 'Апельсины',
}

// Взял
export enum FruitEnum {
    Apple = 'Яблоко',
    Orange = 'Апельсин',
}

// Класс коробки
export class Box {
    constructor(
        public readonly label: FruitsEnum,
        public isOpen: boolean,
        public prediction: FruitsEnum | null = null,
        public content: FruitsEnum | null = null,
        public took: FruitEnum | null = null
    ) {}

    copy() {
        return new Box(this.label, this.isOpen, this.prediction, this.content);
    }

    // Метод для сериализации Box
    public toJSON() {
        return {
            label: this.label,
            isOpen: this.isOpen,
            prediction: this.prediction,
            content: this.content,
            took: this.took,
        };
    }

    // Статический метод для десериализации Box
    public static fromJSON(json: any): Box {
        return new Box(json.label, json.isOpen, json.prediction, json.content, json.took);
    }
}

// Класс ошибки проигрыша
export class YouLostError extends Error {
    constructor() {
        super('You lost');
    }
}

export class FruitGame {
    // Открыта ли первая коробка
    public indexOpenedBox: number | null = null;

    // Коробки
    public readonly _boxes: Box[] = [
        new Box(FruitsEnum.Apple, false),
        new Box(FruitsEnum.AppleAndOrange, false),
        new Box(FruitsEnum.Orange, false),
    ];

    // Метод для сериализации FruitGame
    public toJSON() {
        return {
            indexOpenedBox: this.indexOpenedBox,
            boxes: this._boxes.map((box) => box.toJSON()),
        };
    }

    // Статический метод для десериализации FruitGame
    public static fromJSON(json: any): FruitGame {
        const game = new FruitGame();
        game.indexOpenedBox = json.indexOpenedBox;
        game._boxes.length = 0; // Очищаем массив коробок
        game._boxes.push(...json.boxes.map((boxJson: any) => Box.fromJSON(boxJson)));
        return game;
    }

    public clone(): FruitGame {
        return FruitGame.fromJSON(this.toJSON());
    }

    // Метод для рестарта
    public restart() {
        this.indexOpenedBox = null;

        this._boxes.forEach((box: Box) => {
            box.isOpen = false;
            box.prediction = null;
            box.content = null;
        });
    }

    public get boxes(): Box[] {
        return this._boxes.map((box) => box.copy());
    }

    // Только для открытия первой коробки
    private openOne(indexBox: number): void {
        if (this.indexOpenedBox !== null) throw new Error('Function only for first opening');

        this.indexOpenedBox = indexBox;
        const box = this._boxes[indexBox];

        if (box.label === FruitsEnum.AppleAndOrange) {
            box.took = [FruitEnum.Apple, FruitEnum.Orange][Math.floor(Math.random() * 2)];
            box.content = box.took === FruitEnum.Apple ? FruitsEnum.Apple : FruitsEnum.Orange;

            const [apple, appleAndOrange, orange] = this._boxes;
            apple.content = FruitsEnum.AppleAndOrange;
            appleAndOrange.content = FruitsEnum.Orange;
            orange.content = FruitsEnum.Apple;

            if (box.took === FruitEnum.Apple) {
                apple.content = FruitsEnum.Orange;
                appleAndOrange.content = FruitsEnum.Apple;
                orange.content = FruitsEnum.AppleAndOrange;
            }
        }

        if (box.label === FruitsEnum.Apple) {
            box.took = FruitEnum.Orange;
        }

        if (box.label === FruitsEnum.Orange) {
            box.took = FruitEnum.Apple;
        }

        box.isOpen = true;
    }

    // Указываем предположения только после открытия первой коробки
    public setPrediction(indexBox: number, prediction: FruitsEnum): void {
        if (this.indexOpenedBox === null) throw new Error('Function only for subsequent openings');

        if (indexBox === this.indexOpenedBox) throw new Error('Cannot predict opened box');

        const openedOnlyOne = this._boxes.filter((box) => box.isOpen === true).length === 1;

        if (!openedOnlyOne) {
            throw new Error('Only one box can be opened at a time');
        }

        const box = this._boxes[indexBox];

        box.prediction = prediction;
    }

    // Только для открытия остальных коробок, после того как все предположения были указаны
    private openOther(indexBox: number): boolean {
        if (this.indexOpenedBox === null) throw new Error('Function only for subsequent openings');

        const isPredicted = this._boxes
            .filter((box) => box.isOpen === false)
            .every((box) => box.prediction !== null);

        if (!isPredicted) {
            throw new Error('Не все ящики предсказаны, выберите остальные предсказания');
        }

        const box = this._boxes[indexBox];

        if (box.isOpen) {
            throw new Error('Box is already opened');
        }

        box.isOpen = true;

        const openedBox = this._boxes[this.indexOpenedBox];

        const [apple, appleAndOrange, orange] = this._boxes;

        if (openedBox.label === FruitsEnum.AppleAndOrange) {
            // Правильный вариант
            // if (openedBox.content === FruitsEnum.Orange) {
            //     if (box.label === FruitsEnum.Apple) {
            //         box.content = FruitsEnum.AppleAndOrange;
            //     }
            //     if (box.label === FruitsEnum.Orange) {
            //         box.content = FruitsEnum.Apple;
            //     }
            // }
            // if (openedBox.content === FruitsEnum.Apple) {
            //     if (box.label === FruitsEnum.Orange) {
            //         box.content = FruitsEnum.AppleAndOrange;
            //     }
            //     if (box.label === FruitsEnum.Apple) {
            //         box.content = FruitsEnum.Orange;
            //     }
            // }
        } else {
            if (openedBox.label === FruitsEnum.Apple) {
                openedBox.content = FruitsEnum.Orange;
                appleAndOrange.content = FruitsEnum.Apple;
                orange.content = FruitsEnum.AppleAndOrange;

                if (
                    appleAndOrange.prediction === FruitsEnum.Apple &&
                    orange.prediction === FruitsEnum.AppleAndOrange
                ) {
                    apple.content = FruitsEnum.AppleAndOrange;
                    appleAndOrange.content = FruitsEnum.Orange;
                    orange.content = FruitsEnum.Apple;
                }
            }

            if (openedBox.label === FruitsEnum.Orange) {
                apple.content = FruitsEnum.AppleAndOrange;
                appleAndOrange.content = FruitsEnum.Orange;
                openedBox.content = FruitsEnum.Apple;

                if (
                    apple.prediction === FruitsEnum.AppleAndOrange &&
                    appleAndOrange.prediction === FruitsEnum.Orange
                ) {
                    apple.content = FruitsEnum.Orange;
                    appleAndOrange.content = FruitsEnum.Apple;
                    orange.content = FruitsEnum.AppleAndOrange;
                }
            }

            // Неправильный вариант
            /*if (openedBox.label === FruitsEnum.Apple) {
                if (box.label === FruitsEnum.AppleAndOrange) {
                    if (box.prediction === FruitsEnum.Apple) {
                        box.content = FruitsEnum.Orange;
                    }

                    if (box.prediction === FruitsEnum.Orange) {
                        box.content = FruitsEnum.Apple;
                    }

                    if (box.prediction === FruitsEnum.AppleAndOrange) {
                        throw new YouLostError();
                    }
                }

                if (box.label === FruitsEnum.Orange) {
                    if (box.prediction === FruitsEnum.AppleAndOrange) {
                        box.content = FruitsEnum.Apple;
                    }

                    if (box.prediction === FruitsEnum.Apple) {
                        box.content = FruitsEnum.AppleAndOrange;
                    }

                    if (box.prediction === FruitsEnum.Orange) {
                        throw new YouLostError();
                    }
                }
            }

            if (openedBox.label === FruitsEnum.Orange) {
                if (box.label === FruitsEnum.AppleAndOrange) {
                    if (box.prediction === FruitsEnum.Orange) {
                        box.content = FruitsEnum.Apple;
                    }

                    if (box.prediction === FruitsEnum.Apple) {
                        box.content = FruitsEnum.Orange;
                    }

                    if (box.prediction === FruitsEnum.AppleAndOrange) {
                        throw new YouLostError();
                    }
                }

                if (box.label === FruitsEnum.Apple) {
                    box.content = FruitsEnum.Orange;

                    if (box.prediction !== FruitsEnum.Orange) {
                        throw new YouLostError();
                    }
                }
            }*/
        }

        const isEveryOpened = this._boxes.every((box) => box.isOpen);

        if (isEveryOpened) {
            this._boxes[this.indexOpenedBox].took = null;
        }

        return isEveryOpened;
    }

    // worstContent() {
    //     if () {}
    // }

    // Метод для открытия коробок
    public open(indexBox: number) {
        if (this.indexOpenedBox === null) {
            this.openOne(indexBox);
            return false;
        } else {
            return this.openOther(indexBox);
        }
    }

    // Метод для проверки победы
    public checkWin(): boolean {
        return this._boxes.every((box) => {
            if (box.isOpen && box.prediction) {
                return box.prediction === box.content;
            }
            return true;
        });
    }
}
