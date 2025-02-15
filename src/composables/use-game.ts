export enum BoxEnum {
  // eslint-disable-next-line no-unused-vars
  APPLE = 'Ящик с яблоками',
  // eslint-disable-next-line no-unused-vars
  MIXED = 'Ящик с яблоками и апельсинами',
  // eslint-disable-next-line no-unused-vars
  ORANGE = 'Ящик с апельсинами',
}

export enum FruitEnum {
  // eslint-disable-next-line no-unused-vars
  APPLEFRUIT = 'Яблоко',
  // eslint-disable-next-line no-unused-vars
  ORANGEFRUIT = 'Апельсин',
}

export interface BoxState {
  label: BoxEnum
  isOpen: boolean
  content: BoxEnum | null
  prediction: BoxEnum | null
  took: FruitEnum | null
}

function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getRandomPermutation(): { Apple: BoxEnum, AppleAndOrange: BoxEnum, Orange: BoxEnum } {
  const perms = [
    {
      Apple: BoxEnum.ORANGE,
      AppleAndOrange: BoxEnum.APPLE,
      Orange: BoxEnum.MIXED,
    },
    {
      Apple: BoxEnum.MIXED,
      AppleAndOrange: BoxEnum.ORANGE,
      Orange: BoxEnum.APPLE,
    },
  ]
  return perms[Math.floor(Math.random() * perms.length)]
}

export class FruitGame {
  boxes: BoxState[]
  firstOpenedIndex: number | null = null

  constructor() {
    const permutation = getRandomPermutation()
    const boxes: BoxState[] = [
      {
        label: BoxEnum.APPLE,
        isOpen: false,
        content: permutation.Apple,
        prediction: null,
        took: null,
      },
      {
        label: BoxEnum.MIXED,
        isOpen: false,
        content: permutation.AppleAndOrange,
        prediction: null,
        took: null,
      },
      {
        label: BoxEnum.ORANGE,
        isOpen: false,
        content: permutation.Orange,
        prediction: null,
        took: null,
      },
    ]
    this.boxes = shuffleArray(boxes)
  }

  static fromJSON(json: any): FruitGame {
    const game = new FruitGame()
    game.firstOpenedIndex = json.firstOpenedIndex
    game.boxes = json.boxes
    return game
  }

  openBox(index: number): void {
    if (!this.boxes[index].isOpen) {
      if (this.firstOpenedIndex === null) {
        this.firstOpenedIndex = index
        this.boxes[index].isOpen = true
        if (this.boxes[index].content === BoxEnum.APPLE) {
          this.boxes[index].took = FruitEnum.APPLEFRUIT
        } else if (this.boxes[index].content === BoxEnum.ORANGE) {
          this.boxes[index].took = FruitEnum.ORANGEFRUIT
        } else {
          this.boxes[index].took = Math.random() < 0.5 ? FruitEnum.APPLEFRUIT : FruitEnum.ORANGEFRUIT
        }
      }
    }
  }

  openRemainingBoxes(): void {
    const unopened = this.boxes.filter(b => !b.isOpen)
    if (unopened.some(b => b.prediction === null)) {
      throw new Error('Укажите предсказания для всех закрытых коробок.')
    }
    this.boxes.forEach(b => {
      if (!b.isOpen) {
        b.isOpen = true
      }
    })
  }

  setPrediction(index: number, prediction: BoxEnum): void {
    this.boxes[index].prediction = prediction
  }

  checkGameStatus(): 'won' | 'lost' {
    for (let i = 0; i < this.boxes.length; i++) {
      if (i === this.firstOpenedIndex) continue
      if (this.boxes[i].prediction !== this.boxes[i].content) {
        return 'lost'
      }
    }
    return 'won'
  }
}
