import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useMiniapp } from '../src'
import type { GopaySuccessResponse, GopayErrorResponse } from '../src'

describe('useMiniapp', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    vi.clearAllMocks()
    delete (window as any).gpContainer
  })

  afterEach(() => {
    document.head.innerHTML = ''
    delete (window as any).gpContainer
  })

  const mockGpContainer = (overrides = {}) => {
    (window as any).gpContainer = {
      call: vi.fn(),
      ...overrides
    }
  }

  const loadSDK = () => {
    const script = document.querySelector('script')
    if (script) {
      mockGpContainer()
      script.dispatchEvent(new Event('load'))
    }
  }

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useMiniapp())

    expect(result.current.isReady).toBe(false)
    expect(result.current.isLoading).toBe(true)
  })

  it('should become ready when SDK loads', async () => {
    const onReady = vi.fn()
    const { result } = renderHook(() => useMiniapp({ onReady }))

    loadSDK()

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(onReady).toHaveBeenCalled()
    })
  })

  it('should handle SDK load error', async () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useMiniapp({ onError }))

    const script = document.querySelector('script')
    script?.dispatchEvent(new Event('error'))

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
      expect(onError).toHaveBeenCalled()
    })
  })

  describe('call method', () => {
    it('should reject when SDK is not loaded', async () => {
      const { result } = renderHook(() => useMiniapp())

      await expect(
        result.current.call('TestClass', 'testMethod')
      ).rejects.toMatchObject({
        success: false,
        error_code: 'SDK_NOT_LOADED',
        error_type: 'JS_BRIDGE_ERROR',
        ret: 'GP_EXCEPTION'
      })
    })

    it('should call gpContainer with correct parameters', async () => {
      const mockCall = vi.fn((_, __, ___, success) => {
        success({ success: true, ret: 'GP_SUCCESS' })
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      await result.current.call('TestClass', 'testMethod', { param: 'value' }, 5000)

      expect(mockCall).toHaveBeenCalledWith(
        'TestClass',
        'testMethod',
        { param: 'value' },
        expect.any(Function),
        expect.any(Function),
        5000
      )
    })

    it('should resolve with success response', async () => {
      const successResponse: GopaySuccessResponse = {
        success: true,
        ret: 'GP_SUCCESS',
        data: { id: 123 }
      }

      const mockCall = vi.fn((_, __, ___, success) => {
        success(successResponse)
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      const response = await result.current.call('TestClass', 'testMethod')
      expect(response).toEqual(successResponse)
    })

    it('should reject with error response', async () => {
      const errorResponse: GopayErrorResponse = {
        success: false,
        error_code: 'TEST_ERROR',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: 'Test error message',
        ret: 'GP_EXCEPTION'
      }

      const mockCall = vi.fn((_, __, ___, success) => {
        success(errorResponse)
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      await expect(
        result.current.call('TestClass', 'testMethod')
      ).rejects.toEqual(errorResponse)
    })

    it('should handle failure callback', async () => {
      const errorResponse: GopayErrorResponse = {
        success: false,
        error_code: 'FAILURE',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: 'Failure',
        ret: 'GP_EXCEPTION'
      }

      const mockCall = vi.fn((_, __, ___, _success, failure) => {
        failure(errorResponse)
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      await expect(
        result.current.call('TestClass', 'testMethod')
      ).rejects.toEqual(errorResponse)
    })

    it('should handle exception during call', async () => {
      const mockCall = vi.fn(() => {
        throw new Error('Test exception')
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      await expect(
        result.current.call('TestClass', 'testMethod')
      ).rejects.toMatchObject({
        success: false,
        error_code: 'CALL_EXCEPTION',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: 'Test exception',
        ret: 'GP_EXCEPTION'
      })
    })

    it('should use default timeout', async () => {
      const mockCall = vi.fn((_, __, ___, success) => {
        success({ success: true, ret: 'GP_SUCCESS' })
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp({ defaultTimeout: 10000 }))
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      await result.current.call('TestClass', 'testMethod')

      expect(mockCall).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(Object),
        expect.any(Function),
        expect.any(Function),
        10000
      )
    })
  })

  describe('callWithCallbacks method', () => {
    it('should call success callback on success response', async () => {
      const successResponse: GopaySuccessResponse = {
        success: true,
        ret: 'GP_SUCCESS'
      }

      const mockCall = vi.fn((_, __, ___, success) => {
        success(successResponse)
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      const successCallback = vi.fn()
      const failureCallback = vi.fn()

      result.current.callWithCallbacks(
        'TestClass',
        'testMethod',
        {},
        successCallback,
        failureCallback
      )

      await waitFor(() => {
        expect(successCallback).toHaveBeenCalledWith(successResponse)
        expect(failureCallback).not.toHaveBeenCalled()
      })
    })

    it('should call failure callback on error response', async () => {
      const errorResponse: GopayErrorResponse = {
        success: false,
        error_code: 'ERROR',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: 'Error',
        ret: 'GP_EXCEPTION'
      }

      const mockCall = vi.fn((_, __, ___, success) => {
        success(errorResponse)
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      const successCallback = vi.fn()
      const failureCallback = vi.fn()

      result.current.callWithCallbacks(
        'TestClass',
        'testMethod',
        {},
        successCallback,
        failureCallback
      )

      await waitFor(() => {
        expect(failureCallback).toHaveBeenCalledWith(errorResponse)
        expect(successCallback).not.toHaveBeenCalled()
      })
    })

    it('should handle SDK not loaded error', () => {
      const { result } = renderHook(() => useMiniapp())

      const successCallback = vi.fn()
      const failureCallback = vi.fn()

      result.current.callWithCallbacks(
        'TestClass',
        'testMethod',
        {},
        successCallback,
        failureCallback
      )

      expect(failureCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error_code: 'SDK_NOT_LOADED'
        })
      )
    })
  })

  describe('helper methods', () => {
    const setupReadyHook = async () => {
      const mockCall = vi.fn((_, __, ___, success) => {
        success({ success: true, ret: 'GP_SUCCESS' })
      })
      mockGpContainer({ call: mockCall })

      const { result } = renderHook(() => useMiniapp())
      loadSDK()

      await waitFor(() => expect(result.current.isReady).toBe(true))

      return { result, mockCall }
    }

    const helperTestCases = [
      { method: 'getAuthCode', className: 'GPMiniAppAuth', methodName: 'getAuthCode', params: { scope: 'user' } },
      { method: 'launchDeeplink', className: 'GPNavigator', methodName: 'launchDeeplink', params: 'gojek://home' },
      { method: 'launchUri', className: 'GPNavigator', methodName: 'launchUri', params: 'https://example.com' },
      { method: 'launchPayment', className: 'GP', methodName: 'launchPayment', params: 'payment://deeplink' },
      { method: 'getLocation', className: 'GPLocation', methodName: 'getLocation', params: { accuracy: 'high' } },
      { method: 'getSystemInfo', className: 'GPSystem', methodName: 'getSystemInfo', params: {} },
      { method: 'getWifiInfo', className: 'GPSystem', methodName: 'getWifiInfo', params: {} },
      { method: 'getRootedDeviceInfo', className: 'GPSystem', methodName: 'getRootedDeviceInfo', params: {} },
      { method: 'getBankAccountToken', className: 'GPBank', methodName: 'getBankAccountToken', params: {} },
      { method: 'getUserConsent', className: 'GPConsent', methodName: 'getUserConsent', params: 'consent_name' },
      { method: 'startAccelerometer', className: 'GPSensor', methodName: 'startAccelerometer', params: {} },
      { method: 'stopAccelerometer', className: 'GPSensor', methodName: 'stopAccelerometer', params: {} },
      { method: 'startCompass', className: 'GPSensor', methodName: 'startCompass', params: {} },
      { method: 'stopCompass', className: 'GPSensor', methodName: 'stopCompass', params: {} },
      { method: 'vibrate', className: 'GPDevice', methodName: 'vibrate', params: {} },
      { method: 'getLocale', className: 'GPSystem', methodName: 'getLocale', params: {} },
    ]

    helperTestCases.forEach(({ method, className, methodName, params }) => {
      it(`should call ${method} with correct parameters`, async () => {
        const { result, mockCall } = await setupReadyHook()

        if (typeof params === 'string') {
          await (result.current as any)[method](params)

          if (method === 'getUserConsent') {
            expect(mockCall).toHaveBeenCalledWith(
              className,
              methodName,
              { consent_name: params },
              expect.any(Function),
              expect.any(Function),
              expect.any(Number)
            )
          } else {
            expect(mockCall).toHaveBeenCalledWith(
              className,
              methodName,
              { [method === 'launchDeeplink' || method === 'launchPayment' ? 'deeplink' : 'uri']: params },
              expect.any(Function),
              expect.any(Function),
              expect.any(Number)
            )
          }
        } else {
          await (result.current as any)[method](params)
          expect(mockCall).toHaveBeenCalledWith(
            className,
            methodName,
            params,
            expect.any(Function),
            expect.any(Function),
            expect.any(Number)
          )
        }
      })
    })
  })
})
