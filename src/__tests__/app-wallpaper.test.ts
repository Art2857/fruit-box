import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/vue'
import { createTestingPinia } from '@pinia/testing'
import App from '../app.vue'

// Mock the TWallpaper component to capture the options passed to it
const mockTWallpaperOptions = vi.fn()
vi.mock('@twallpaper/vue', () => ({
  default: {
    name: 'TWallpaper',
    props: ['options'],
    setup(props: any) {
      // Capture the options passed to TWallpaper
      mockTWallpaperOptions(props.options)
      return () => {
        return {
          render() {
            return '<div data-testid="wallpaper-component"></div>'
          }
        }
      }
    }
  }
}))

// Mock other components
vi.mock('../components/box.vue', () => ({
  default: {
    name: 'Box',
    props: ['label', 'isOpen', 'content', 'took', 'prediction', 'showPrediction', 'canChangePrediction'],
    template: '<div data-testid="box-component"></div>',
    emits: ['click', 'prediction-change']
  }
}))

vi.mock('../components/notification.vue', () => ({
  default: {
    name: 'Notification',
    template: '<div data-testid="notification-component"></div>'
  }
}))

// Mock the notification composable
vi.mock('../composables/use-notification', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
    notificationVisible: { value: false },
    notificationMessage: { value: '' }
  })
}))

describe('App.vue TWallpaper options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create TWallpaper with correct options', () => {
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

    // Check that TWallpaper was called with options
    expect(mockTWallpaperOptions).toHaveBeenCalled()

    // Get the options passed to TWallpaper
    const options = mockTWallpaperOptions.mock.calls[0][0]

    // Check that the options object has the expected properties
    expect(options).toHaveProperty('colors')
    expect(options).toHaveProperty('animate')
  })

  it('should create TWallpaper with correct colors', () => {
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

    // Get the options passed to TWallpaper
    const options = mockTWallpaperOptions.mock.calls[0][0]

    // Check that the colors array has the expected values
    expect(options.colors).toEqual(['#90E0EF', '#48CAE4', '#00B4D8', '#0096C7', '#0077B6', '#023E8A'])
  })
})
