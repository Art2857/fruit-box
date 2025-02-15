export enum ChestEnum {
  // eslint-disable-next-line no-unused-vars
  GOLD = 'Сундук с золотом',
  // eslint-disable-next-line no-unused-vars
  MIXED = 'Сундук с золотом и серебром',
  // eslint-disable-next-line no-unused-vars
  SILVER = 'Сундук с серебром',
}

export enum CoinEnum {
  // eslint-disable-next-line no-unused-vars
  GOLDCOIN = 'Золотая монета',
  // eslint-disable-next-line no-unused-vars
  SILVERCOIN = 'Серебряная монета',
}

export interface BoxState {
  label: ChestEnum
  isOpen: boolean
  content: ChestEnum | null
  prediction: ChestEnum | null
  took: CoinEnum | null
}

function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function getRandomPermutation(): { Apple: ChestEnum, AppleAndOrange: ChestEnum, Orange: ChestEnum } {
  const perms = [
    {
      Apple: ChestEnum.SILVER,
      AppleAndOrange: ChestEnum.GOLD,
      Orange: ChestEnum.MIXED,
    },
    {
      Apple: ChestEnum.MIXED,
      AppleAndOrange: ChestEnum.SILVER,
      Orange: ChestEnum.GOLD,
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
        label: ChestEnum.GOLD,
        isOpen: false,
        content: permutation.Apple,
        prediction: null,
        took: null,
      },
      {
        label: ChestEnum.MIXED,
        isOpen: false,
        content: permutation.AppleAndOrange,
        prediction: null,
        took: null,
      },
      {
        label: ChestEnum.SILVER,
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
        if (this.boxes[index].content === ChestEnum.GOLD) {
          this.boxes[index].took = CoinEnum.GOLDCOIN
        } else if (this.boxes[index].content === ChestEnum.SILVER) {
          this.boxes[index].took = CoinEnum.SILVERCOIN
        } else {
          this.boxes[index].took = Math.random() < 0.5 ? CoinEnum.GOLDCOIN : CoinEnum.SILVERCOIN
        }
      }
    }
  }

  openRemainingBoxes(): void {
    const unopened = this.boxes.filter(b => !b.isOpen)
    if (unopened.some(b => b.prediction === null)) {
      throw new Error('Укажите предсказания для всех закрытых сундуков.')
    }
    this.boxes.forEach(b => {
      if (!b.isOpen) {
        b.isOpen = true
      }
    })
  }

  setPrediction(index: number, prediction: ChestEnum): void {
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
