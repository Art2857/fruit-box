export const BOX_TYPES = {
  APPLE: 'Яблоки',
  MIXED: 'Яблоки и апельсины',
  ORANGE: 'Апельсины',
} as const

export const FRUIT_TYPES = {
  APPLEFRUIT: 'Яблоко',
  ORANGEFRUIT: 'Апельсин',
} as const

export type BoxType = typeof BOX_TYPES[keyof typeof BOX_TYPES]
export type FruitType = typeof FRUIT_TYPES[keyof typeof FRUIT_TYPES]

export interface BoxState {
  label: BoxType
  isOpen: boolean
  content: BoxType
  prediction: BoxType | null
  took: FruitType | null
}

function getRandomPermutation(): { Apple: BoxType, AppleAndOrange: BoxType, Orange: BoxType } {
  const perms = [
    { Apple: BOX_TYPES.ORANGE, AppleAndOrange: BOX_TYPES.APPLE, Orange: BOX_TYPES.MIXED },
    { Apple: BOX_TYPES.MIXED, AppleAndOrange: BOX_TYPES.ORANGE, Orange: BOX_TYPES.APPLE },
  ]
  return perms[Math.floor(Math.random() * perms.length)]
}

export class FruitGame {
  boxes: BoxState[]
  firstOpenedIndex: number | null = null

  constructor() {
    const permutation = getRandomPermutation()
    this.boxes = [
      { label: BOX_TYPES.APPLE, isOpen: false, content: permutation.Apple, prediction: null, took: null },
      { label: BOX_TYPES.MIXED, isOpen: false, content: permutation.AppleAndOrange, prediction: null, took: null },
      { label: BOX_TYPES.ORANGE, isOpen: false, content: permutation.Orange, prediction: null, took: null },
    ]
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
    this.boxes[index].took = content === BOX_TYPES.MIXED
      ? (Math.random() < 0.5 ? FRUIT_TYPES.APPLEFRUIT : FRUIT_TYPES.ORANGEFRUIT)
      : content === BOX_TYPES.APPLE ? FRUIT_TYPES.APPLEFRUIT : FRUIT_TYPES.ORANGEFRUIT
  }

  openRemainingBoxes(): void {
    if (this.boxes.filter(b => !b.isOpen).some(b => !b.prediction)) {
      throw new Error('Укажите предсказания для всех закрытых коробок.')
    }
    this.boxes.forEach(b => b.isOpen = true)
  }

  setPrediction(index: number, prediction: BoxType): void {
    if (!this.boxes[index].isOpen) this.boxes[index].prediction = prediction
  }

  checkGameStatus(): 'won' | 'lost' {
    if (this.firstOpenedIndex === null || this.boxes[this.firstOpenedIndex].label !== BOX_TYPES.MIXED) return 'lost'
    return this.boxes.every((b, i) => i === this.firstOpenedIndex || b.prediction === b.content) ? 'won' : 'lost'
  }
}
