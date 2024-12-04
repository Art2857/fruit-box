// Перечисление фруктов
export enum FruitEnum {
    Apple = 'Яблоки',
    AppleAndOrange = 'Яблоки и Апельсины',
    Orange = 'Апельсины',
}

// Класс коробки
export class Box {
    constructor(
        public readonly label: FruitEnum,
        public isOpen: boolean,
        public prediction: FruitEnum | null = null,
        public content: FruitEnum | null = null
    ) {}

    copy() {
        return new Box(this.label, this.isOpen, this.prediction, this.content);
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
    private _indexOpenedBox: number | null = null;

    get indexOpenedBox(): number | null {
        return this._indexOpenedBox;
    }

    // Коробки
    private readonly _boxes: Box[] = [
        new Box(FruitEnum.Apple, false),
        new Box(FruitEnum.AppleAndOrange, false),
        new Box(FruitEnum.Orange, false),
    ];

    // Метод для рестарта
    public restart() {
        this._indexOpenedBox = null;

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
        if (this._indexOpenedBox !== null) throw new Error('Function only for first opening');

        this._indexOpenedBox = indexBox;
        const box = this._boxes[indexBox];

        if (box.label === FruitEnum.AppleAndOrange) {
            box.content = [FruitEnum.Apple, FruitEnum.Orange][Math.floor(Math.random() * 2)];
        }

        if (box.label === FruitEnum.Apple) {
            box.content = FruitEnum.AppleAndOrange;
        }

        if (box.label === FruitEnum.Orange) {
            box.content = FruitEnum.AppleAndOrange;
        }

        box.isOpen = true;
    }

    // Указываем предположения только после открытия первой коробки
    public setPrediction(indexBox: number, prediction: FruitEnum): void {
        if (this._indexOpenedBox === null) throw new Error('Function only for subsequent openings');

        if (indexBox === this._indexOpenedBox) throw new Error('Box is opened');

        const box = this._boxes[indexBox];

        box.prediction = prediction;
    }

    // Только для открытия второй коробки, после того как все предположения были указаны
    private openOther(indexBox: number): boolean {
        if (this._indexOpenedBox === null) throw new Error('Function only for subsequent openings');

        const isPredicted = this._boxes
            .filter((box) => box.isOpen === false)
            .every((box) => box.prediction !== null);

        if (!isPredicted) {
            throw new Error('Not all boxes are predicted');
        }

        const box = this._boxes[indexBox];

        if (box.isOpen) {
            throw new Error('Box is already opened');
        }

        const openedBox = this._boxes[this._indexOpenedBox];

        if (openedBox.label === FruitEnum.AppleAndOrange) {
            if (openedBox.content === FruitEnum.Orange) {
                if (box.label === FruitEnum.Apple) {
                    box.content = FruitEnum.Orange;
                }

                if (box.label === FruitEnum.Orange) {
                    box.content = FruitEnum.Apple;
                }
            }

            if (openedBox.content === FruitEnum.Apple) {
                if (box.label === FruitEnum.Orange) {
                    box.content = FruitEnum.Apple;
                }

                if (box.label === FruitEnum.Apple) {
                    box.content = FruitEnum.Orange;
                }
            }
        } else {
            if (openedBox.label === FruitEnum.Apple) {
                if (box.label === FruitEnum.AppleAndOrange) {
                    if (box.prediction === FruitEnum.Orange) {
                        box.content = FruitEnum.Apple;
                    }

                    if (box.prediction === FruitEnum.Apple) {
                        box.content = FruitEnum.Orange;
                    }

                    if (box.prediction === FruitEnum.AppleAndOrange) {
                        throw new YouLostError();
                    }
                }

                if (box.label === FruitEnum.Orange) {
                    box.content = FruitEnum.Apple;

                    if (box.prediction !== FruitEnum.Apple) {
                        throw new YouLostError();
                    }
                }
            }

            if (openedBox.label === FruitEnum.Orange) {
                if (box.label === FruitEnum.AppleAndOrange) {
                    if (box.prediction === FruitEnum.Orange) {
                        box.content = FruitEnum.Apple;
                    }

                    if (box.prediction === FruitEnum.Apple) {
                        box.content = FruitEnum.Orange;
                    }

                    if (box.prediction === FruitEnum.AppleAndOrange) {
                        throw new YouLostError();
                    }
                }

                if (box.label === FruitEnum.Apple) {
                    box.content = FruitEnum.Orange;

                    if (box.prediction !== FruitEnum.Orange) {
                        throw new YouLostError();
                    }
                }
            }
        }

        box.isOpen = true;

        const isEveryOpened = this._boxes.every((box) => box.isOpen);
        return isEveryOpened;
    }

    // Метод для открытия коробок
    public open(indexBox: number) {
        if (this._indexOpenedBox !== null) {
            return this.openOther(indexBox);
        }

        this.openOne(indexBox);

        return false;
    }
}
