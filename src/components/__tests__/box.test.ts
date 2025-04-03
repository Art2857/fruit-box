import { fireEvent, render } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BOX_TYPES } from '../../composables/use-game'
import Box from '../box.vue'

describe('box.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render closed box when isOpen is false', () => {
    const { getByAltText } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: true,
      },
    })

    // Check that the closed box image is rendered
    expect(getByAltText('box-closed')).toBeTruthy()
  })

  it('should render opened box when isOpen is true', () => {
    const { getByAltText } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: true,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: false,
      },
    })

    // Check that the opened box image is rendered
    expect(getByAltText('box-opened')).toBeTruthy()
  })

  it('should emit click event when closed box is clicked', async () => {
    const { getByAltText, emitted } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: true,
      },
    })

    // Click on the box
    const boxImage = getByAltText('box-closed')
    await fireEvent.click(boxImage.parentElement as HTMLElement)

    // Check that the click event was emitted
    expect(emitted()).toHaveProperty('click')
  })

  it('should show prediction dropdown when showPrediction is true', () => {
    const { container } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: true,
        canChangePrediction: true,
      },
    })

    // Find the select element
    const select = container.querySelector('select')

    // Check that the select has the visible class
    expect(select?.className).toContain('visible')
  })

  it('should not show prediction dropdown when showPrediction is false', () => {
    const { container } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: true,
      },
    })

    // Find the select element
    const select = container.querySelector('select')

    // Check that the select does not have the visible class
    expect(select?.className).not.toContain('visible')
  })

  it('should disable prediction dropdown when canChangePrediction is false', () => {
    const { container } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: true,
        canChangePrediction: false,
      },
    })

    // Find the select element
    const select = container.querySelector('select')

    // Check that the select is disabled
    expect(select?.disabled).toBe(true)
  })

  it('should emit prediction-change event when prediction is changed', async () => {
    const { container, emitted } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: true,
        canChangePrediction: true,
      },
    })

    // Find the select element
    const select = container.querySelector('select')

    // Change the prediction
    if (select) {
      select.value = BOX_TYPES.ORANGE
      await fireEvent.change(select)
    }

    // Check that the prediction-change event was emitted with the correct value
    expect(emitted()).toHaveProperty('prediction-change')
    expect(emitted()['prediction-change'][0]).toEqual([BOX_TYPES.ORANGE])
  })

  it('should show the correct box frame image based on label', () => {
    const { getByAltText } = render(Box, {
      props: {
        label: BOX_TYPES.ORANGE,
        isOpen: false,
        content: BOX_TYPES.APPLE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: true,
      },
    })

    // Check that the frame image has the correct src
    const frameImage = getByAltText('box-frame')
    expect(frameImage.getAttribute('src')).toBe('./frame-orange.webp')
  })

  it('should show the took message when box is open and took is provided', () => {
    const { getByText } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: true,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: BOX_TYPES.ORANGE,
        showPrediction: false,
        canChangePrediction: false,
      },
    })

    // Check that the took message is displayed
    expect(getByText('Вы достали:')).toBeTruthy()
    expect(getByText(BOX_TYPES.ORANGE)).toBeTruthy()
  })

  it('should update localPrediction when prediction prop changes', async () => {
    const { container, rerender } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: true,
        canChangePrediction: true,
      },
    })

    // Find the select element
    const select = container.querySelector('select') as HTMLSelectElement

    // Check initial value
    expect(select.value).toBe('')

    // Update the prediction prop
    await rerender({
      prediction: BOX_TYPES.MIXED,
    })

    // Check that localPrediction was updated
    expect(select.value).toBe(BOX_TYPES.MIXED)
  })

  it('should handle null label gracefully', () => {
    const { container } = render(Box, {
      props: {
        label: null as any, // Force null label to test fallback
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: null,
        took: null,
        showPrediction: false,
        canChangePrediction: true,
      },
    })

    // Check that the box still renders without errors
    const boxImage = container.querySelector('img[alt="box-frame"]')
    expect(boxImage).toBeTruthy()
    // The src should be empty string as per the fallback in the computed property
    expect(boxImage?.getAttribute('src')).toBe('')
  })

  it('should handle prediction change from value to null', async () => {
    const { container, rerender } = render(Box, {
      props: {
        label: BOX_TYPES.APPLE,
        isOpen: false,
        content: BOX_TYPES.ORANGE,
        prediction: BOX_TYPES.MIXED, // Start with a value
        took: null,
        showPrediction: true,
        canChangePrediction: true,
      },
    })

    // Find the select element
    const select = container.querySelector('select') as HTMLSelectElement

    // Check initial value
    expect(select.value).toBe(BOX_TYPES.MIXED)

    // Update the prediction prop to null
    await rerender({
      prediction: null,
    })

    // Check that localPrediction was updated to empty string
    expect(select.value).toBe('')
  })
})
