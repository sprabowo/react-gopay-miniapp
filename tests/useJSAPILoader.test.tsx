import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useJSAPILoader } from '../src'

describe('useJSAPILoader', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('should load script successfully', async () => {
    const { result } = renderHook(() => useJSAPILoader())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.error).toBe(null)

    const script = document.querySelector('script')
    expect(script).toBeTruthy()
    expect(script?.src).toContain('gp-container.min.js')

    script?.dispatchEvent(new Event('load'))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle script load error', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useJSAPILoader({ onError }))

    const script = document.querySelector('script')
    const errorEvent = new Event('error')
    script?.dispatchEvent(errorEvent)

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(result.current.isLoading).toBe(false)
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should call onLoad callback when script loads', async () => {
    const onLoad = vi.fn()
    renderHook(() => useJSAPILoader({ onLoad }))

    const script = document.querySelector('script')
    script?.dispatchEvent(new Event('load'))

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
    })
  })

  it('should skip loading if skipIfExists returns true', () => {
    const onLoad = vi.fn()
    const skipIfExists = vi.fn(() => true)

    const { result } = renderHook(() => useJSAPILoader({ skipIfExists, onLoad }))

    expect(skipIfExists).toHaveBeenCalled()
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(onLoad).toHaveBeenCalled()
    expect(document.querySelector('script')).toBe(null)
  })

  it('should reuse existing script in DOM', async () => {
    const existingScript = document.createElement('script')
    existingScript.src = 'https://gwk.gopayapi.com/sdk/stable/gp-container.min.js'
    existingScript.setAttribute('data-loaded', 'true')
    document.head.appendChild(existingScript)

    const onLoad = vi.fn()
    const { result } = renderHook(() => useJSAPILoader({ onLoad }))

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
      expect(onLoad).toHaveBeenCalled()
    })

    const scripts = document.querySelectorAll('script')
    expect(scripts.length).toBe(1)
  })

  describe('script attributes', () => {
    const testCases = [
      { async: true, defer: false, name: 'async' },
      { async: false, defer: true, name: 'defer' },
      { async: true, defer: true, name: 'async and defer' },
    ]

    testCases.forEach(({ async, defer, name }) => {
      it(`should set ${name} attributes`, () => {
        renderHook(() => useJSAPILoader({ async, defer }))

        const script = document.querySelector('script')
        expect(script?.async).toBe(async)
        expect(script?.defer).toBe(defer)
      })
    })
  })
})
