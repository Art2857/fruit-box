import { beforeEach, describe, expect, it, vi } from 'vitest'

// Create mock functions
const mockPiniaUse = vi.fn()
const mockCreatePinia = vi.fn(() => ({ use: mockPiniaUse }))

const mockAppUse = vi.fn()
const mockAppMount = vi.fn()
const mockCreateApp = vi.fn(() => ({ use: mockAppUse, mount: mockAppMount }))

// Setup mocks before importing the module under test
vi.mock('vue', () => ({ createApp: mockCreateApp }))
vi.mock('pinia', () => ({ createPinia: mockCreatePinia }))
vi.mock('pinia-plugin-persistedstate', () => ({ default: 'mockedPersistPlugin' }))
vi.mock('../app.vue', () => ({ default: 'MockedAppComponent' }))

describe('main.ts', () => {
  beforeEach(() => {
    // Reset all mocks and module cache before each test
    vi.resetAllMocks()
    vi.resetModules()
  })

  it('should initialize the application correctly', async () => {
    // Import the main module to trigger the code execution
    await import('../main')

    // Verify pinia was created and configured with persistence plugin
    expect(mockCreatePinia).toHaveBeenCalled()
    expect(mockPiniaUse).toHaveBeenCalledWith('mockedPersistPlugin')

    // Verify Vue app was created with the App component
    expect(mockCreateApp).toHaveBeenCalledWith('MockedAppComponent')

    // Verify app uses pinia
    expect(mockAppUse).toHaveBeenCalled()

    // Verify app is mounted to #app
    expect(mockAppMount).toHaveBeenCalledWith('#app')
  })

  it('should create pinia before mounting the app', async () => {
    await import('../main')

    // Check the order of operations
    expect(mockCreatePinia.mock.invocationCallOrder[0]).toBeLessThan(
      mockAppMount.mock.invocationCallOrder[0],
    )
  })

  it('should pass pinia instance to app.use', async () => {
    await import('../main')

    // The first argument to app.use should be the return value from createPinia
    const piniaInstance = mockCreatePinia.mock.results[0].value
    expect(mockAppUse).toHaveBeenCalledWith(piniaInstance)
  })

  it('should configure pinia with persistedstate plugin before app creation', async () => {
    await import('../main')

    expect(mockPiniaUse.mock.invocationCallOrder[0]).toBeLessThan(
      mockCreateApp.mock.invocationCallOrder[0],
    )
  })
})
