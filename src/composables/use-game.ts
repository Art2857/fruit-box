export enum BoxEnum {
  // eslint-disable-next-line no-unused-vars
  APPLE = 'Яблоки',
  // eslint-disable-next-line no-unused-vars
  MIXED = 'Яблоки и апельсины',
  // eslint-disable-next-line no-unused-vars
  ORANGE = 'Апельсины',
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
  content: BoxEnum
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
    { Apple: BoxEnum.ORANGE, AppleAndOrange: BoxEnum.APPLE, Orange: BoxEnum.MIXED },
    { Apple: BoxEnum.MIXED, AppleAndOrange: BoxEnum.ORANGE, Orange: BoxEnum.APPLE },
  ]
  return perms[Math.floor(Math.random() * perms.length)]
}

export class FruitGame {
  boxes: BoxState[]
  firstOpenedIndex: number | null = null

  constructor() {
    const permutation = getRandomPermutation()
    this.boxes = shuffleArray([
      { label: BoxEnum.APPLE, isOpen: false, content: permutation.Apple, prediction: null, took: null },
      { label: BoxEnum.MIXED, isOpen: false, content: permutation.AppleAndOrange, prediction: null, took: null },
      { label: BoxEnum.ORANGE, isOpen: false, content: permutation.Orange, prediction: null, took: null },
    ])
  }

  static fromJSON(json: any): FruitGame {
    const game = new FruitGame()
    game.firstOpenedIndex = json.firstOpenedIndex ?? null
    game.boxes = json.boxes
    return game
  }

  openBox(index: number): void {
    if (this.firstOpenedIndex !== null || this.boxes[index].isOpen) return
    this.firstOpenedIndex = index
    this.boxes[index].isOpen = true
    const content = this.boxes[index].content
    this.boxes[index].took = content === BoxEnum.MIXED
      ? (Math.random() < 0.5 ? FruitEnum.APPLEFRUIT : FruitEnum.ORANGEFRUIT)
      : content === BoxEnum.APPLE ? FruitEnum.APPLEFRUIT : FruitEnum.ORANGEFRUIT
  }

  openRemainingBoxes(): void {
    if (this.boxes.filter(b => !b.isOpen).some(b => !b.prediction)) {
      throw new Error('Укажите предсказания для всех закрытых коробок.')
    }
    this.boxes.forEach(b => b.isOpen = true)
  }

  setPrediction(index: number, prediction: BoxEnum): void {
    if (!this.boxes[index].isOpen) this.boxes[index].prediction = prediction
  }

  checkGameStatus(): 'won' | 'lost' {
    if (this.firstOpenedIndex === null || this.boxes[this.firstOpenedIndex].label !== BoxEnum.MIXED) return 'lost'
    return this.boxes.every((b, i) => i === this.firstOpenedIndex || b.prediction === b.content) ? 'won' : 'lost'
  }
}
