import { createTestingPinia } from '@pinia/testing'
import { fireEvent, render, screen } from '@testing-library/vue'
import { Store } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import App from '../app.vue'
import { BOX_TYPES } from '../composables/use-game'

// Mock the notification composable
const mockShowNotification = vi.fn()
vi.mock('../composables/use-notification', () => ({
  useNotification: () => ({
    showNotification: mockShowNotification,
    notificationVisible: { value: false },
    notificationMessage: { value: '' },
  }),
}))

// Mock the TWallpaper component
vi.mock('@twallpaper/vue', () => ({
  default: {
    name: 'TWallpaper',
    props: ['options'],
    template: '<div data-testid="wallpaper-component"></div>',
  },
}))

// Mock the Box component with a custom event emitter for prediction-change
vi.mock('../components/box.vue', () => ({
  default: {
    name: 'Box',
    props: ['label', 'isOpen', 'content', 'took', 'prediction', 'showPrediction', 'canChangePrediction'],
    setup(props, { emit }) {
      return () => h('div', {
        'data-testid': 'box-component',
        'onClick': () => {
          // When clicked, emit both click and prediction-change events
          emit('click')
          emit('prediction-change', BOX_TYPES.APPLE)
        },
      })
    },
    emits: ['click', 'prediction-change'],
  },
}))

// Mock the Notification component
vi.mock('../components/notification.vue', () => ({
  default: {
    name: 'Notification',
    template: '<div data-testid="notification-component"></div>',
  },
}))

describe('app.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Tests for rendering
  describe('rendering', () => {
    it('should render the game screen when gameState is playing', () => {
      // Setup the test pinia store with initial state
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            boxes: [
              { label: BOX_TYPES.APPLE, isOpen: false, content: BOX_TYPES.ORANGE, prediction: null, took: null },
              { label: BOX_TYPES.ORANGE, isOpen: false, content: BOX_TYPES.MIXED, prediction: null, took: null },
              { label: BOX_TYPES.MIXED, isOpen: false, content: BOX_TYPES.APPLE, prediction: null, took: null },
            ],
            firstOpenedIndex: null,
            isButtonVisible: false,
          },
        },
      })

      // Render the component
      render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Check that the game screen is rendered
      expect(screen.getByText('Игра с коробками')).toBeTruthy()
      expect(screen.getAllByTestId('box-component')).toHaveLength(3)
    })

    it('should render the win screen when gameState is won', () => {
      // Setup the test pinia store with won state
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'won',
            attempts: 3,
          },
        },
      })

      // Render the component
      render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Check that the win screen is rendered
      expect(screen.getByText('Ты победил')).toBeTruthy()
      expect(screen.getByText('Попыток потрачено: 3')).toBeTruthy()
    })

    it('should render the loss screen when gameState is lost', () => {
      // Setup the test pinia store with lost state
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'lost',
          },
        },
      })

      // Render the component
      render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Check that the loss screen is rendered
      expect(screen.getByText('Ты проиграл')).toBeTruthy()
      expect(screen.getByText('Начать заново')).toBeTruthy()
    })

    it('should render the button as visible when isButtonVisible is true', () => {
      // Setup the test pinia store with button visible
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            boxes: [
              { label: BOX_TYPES.APPLE, isOpen: false, content: BOX_TYPES.ORANGE, prediction: null, took: null },
              { label: BOX_TYPES.ORANGE, isOpen: false, content: BOX_TYPES.MIXED, prediction: null, took: null },
              { label: BOX_TYPES.MIXED, isOpen: true, content: BOX_TYPES.APPLE, prediction: null, took: null },
            ],
            firstOpenedIndex: 2,
            isButtonVisible: true,
          },
        },
      })

      // Render the component
      render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find the button container
      const buttonContainer = screen.getByText('Проверить').parentElement

      // Check that the button container has the visible class
      expect(buttonContainer?.className).toContain('visible')
    })

    it('should render TWallpaper with correct options', () => {
      // Setup the test pinia store
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            boxes: [],
            firstOpenedIndex: null,
            isButtonVisible: false,
          },
        },
      })

      // Render the component
      render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find the TWallpaper component
      const wallpaperComponent = screen.getByTestId('wallpaper-component')
      expect(wallpaperComponent).toBeTruthy()
    })
  })

  // Tests for event handlers
  describe('event handlers', () => {
    it('should call openBox when a box is clicked', async () => {
      // Create a testing pinia instance with spy on openBox
      const openBoxSpy = vi.fn()
      const pinia = createTestingPinia({
        stubActions: false,
      })

      // Add a plugin to replace the openBox method with our spy
      // @ts-expect-error - _p is an internal property
      pinia._p.push(({ store }: { store: Store }) => {
        if (store.$id === 'fruitGame') {
          store.openBox = openBoxSpy
        }
      })

      // Render the component
      const { getAllByTestId } = render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find and click the first box
      const boxes = getAllByTestId('box-component')
      await fireEvent.click(boxes[0])

      // Verify that openBox was called with the correct index
      expect(openBoxSpy).toHaveBeenCalledWith(0)
    })

    it('should call setPrediction when prediction changes', async () => {
      // Create a testing pinia instance with spy on setPrediction
      const setPredictionSpy = vi.fn()
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            boxes: [
              { label: BOX_TYPES.APPLE, isOpen: false, content: BOX_TYPES.ORANGE, prediction: null, took: null },
              { label: BOX_TYPES.ORANGE, isOpen: false, content: BOX_TYPES.MIXED, prediction: null, took: null },
              { label: BOX_TYPES.MIXED, isOpen: false, content: BOX_TYPES.APPLE, prediction: null, took: null },
            ],
            firstOpenedIndex: null,
            isButtonVisible: false,
          },
        },
        stubActions: false,
      })

      // Add a plugin to replace the setPrediction method with our spy
      // @ts-expect-error - _p is an internal property
      pinia._p.push(({ store }: { store: Store }) => {
        if (store.$id === 'fruitGame') {
          store.setPrediction = setPredictionSpy
        }
      })

      // Render the component
      const { getAllByTestId } = render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find and click the first box (which will emit prediction-change)
      const boxes = getAllByTestId('box-component')
      await fireEvent.click(boxes[0])

      // Verify that setPrediction was called with the correct parameters
      expect(setPredictionSpy).toHaveBeenCalledWith(0, BOX_TYPES.APPLE)
    })

    it('should show notification when setPrediction throws an error', async () => {
      // Reset the mock
      mockShowNotification.mockReset()

      // Create a testing pinia instance
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            boxes: [
              { label: BOX_TYPES.APPLE, isOpen: true, content: BOX_TYPES.ORANGE, prediction: null, took: null },
              { label: BOX_TYPES.ORANGE, isOpen: false, content: BOX_TYPES.MIXED, prediction: null, took: null },
              { label: BOX_TYPES.MIXED, isOpen: false, content: BOX_TYPES.APPLE, prediction: null, took: null },
            ],
            firstOpenedIndex: 0,
            isButtonVisible: false,
          },
        },
        stubActions: false,
      })

      // Add a plugin to make setPrediction throw an error
      const errorMessage = 'Нельзя делать предсказание для открытой коробки'
      // @ts-expect-error - _p is an internal property
      pinia._p.push(({ store }: { store: Store }) => {
        if (store.$id === 'fruitGame') {
          store.setPrediction = vi.fn(() => {
            throw new Error(errorMessage)
          })
        }
      })

      // Render the component
      const { getAllByTestId } = render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find and click the first box (which will emit prediction-change)
      const boxes = getAllByTestId('box-component')
      await fireEvent.click(boxes[0])

      // Verify that showNotification was called with the error message
      expect(mockShowNotification).toHaveBeenCalledWith(errorMessage)
    })

    it('should call checkGame when check button is clicked', async () => {
      // Create a testing pinia instance with spy on checkGame
      const checkGameSpy = vi.fn()
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            isButtonVisible: true,
          },
        },
        stubActions: false,
      })

      // Add a plugin to replace the checkGame method with our spy
      // @ts-expect-error - _p is an internal property
      pinia._p.push(({ store }: { store: Store }) => {
        if (store.$id === 'fruitGame') {
          store.checkGame = checkGameSpy
        }
      })

      // Render the component
      const { getByText } = render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find and click the check button
      const checkButton = getByText('Проверить')
      await fireEvent.click(checkButton)

      // Verify that checkGame was called
      expect(checkGameSpy).toHaveBeenCalled()
    })

    it('should show notification when checkGame throws an error', async () => {
      // Reset the mock
      mockShowNotification.mockReset()

      // Create a testing pinia instance
      const pinia = createTestingPinia({
        initialState: {
          fruitGame: {
            gameState: 'playing',
            isButtonVisible: true,
          },
        },
        stubActions: false,
      })

      // Add a plugin to make checkGame throw an error
      const errorMessage = 'Укажите предсказания для всех закрытых коробок'
      // @ts-expect-error - _p is an internal property
      pinia._p.push(({ store }: { store: Store }) => {
        if (store.$id === 'fruitGame') {
          store.checkGame = vi.fn(() => {
            throw new Error(errorMessage)
          })
        }
      })

      // Render the component
      const { getByText } = render(App, {
        global: {
          plugins: [pinia],
        },
      })

      // Find and click the check button
      const checkButton = getByText('Проверить')
      await fireEvent.click(checkButton)

      // Verify that showNotification was called with the error message
      expect(mockShowNotification).toHaveBeenCalledWith(errorMessage)
    })
  })
})
