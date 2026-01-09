import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  JSAPILoaderOptions,
  JSAPILoaderResult,
  GopayMiniappOptions,
  GoPayMiniappResult,
  GopaySuccessResponse,
  GopayErrorResponse,
  GopayResponse
} from './types'

/**
 * GoPay SDK Configuration
 */
const GOPAY_SDK_URL = 'https://gwk.gopayapi.com/sdk/stable/gp-container.min.js'

/**
 * Hook for loading external JavaScript SDK
 * 
 * @param {JSAPILoaderOptions} options - Configuration options
 * @returns {JSAPILoaderResult} Loading state and error information
 * 
 * @example
 * const { isLoaded, isLoading, error } = useJSAPILoader({ 
 *   onLoad: () => console.log('Loaded!') 
 * })
 */
export const useJSAPILoader = (options: JSAPILoaderOptions = {}): JSAPILoaderResult => {
  const {
    onLoad = null,
    onError = null,
    skipIfExists = null,
    async = true,
    defer = false
  } = options

  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const loadedRef = useRef<boolean>(false)

  useEffect(() => {
    if (loadedRef.current) return

    if (skipIfExists && skipIfExists()) {
      loadedRef.current = true
      setIsLoaded(true)
      onLoad?.()
      return
    }

    const existingScript = document.querySelector(`script[src="${GOPAY_SDK_URL}"]`)
    if (existingScript) {
      if (existingScript.hasAttribute('data-loaded')) {
        loadedRef.current = true
        setIsLoaded(true)
        onLoad?.()
      } else {
        existingScript.addEventListener('load', () => {
          loadedRef.current = true
          setIsLoaded(true)
          onLoad?.()
        })
      }
      return
    }

    setIsLoading(true)

    const script = document.createElement('script')
    script.src = GOPAY_SDK_URL
    script.async = async
    script.defer = defer

    script.onload = () => {
      script.setAttribute('data-loaded', 'true')
      loadedRef.current = true
      setIsLoaded(true)
      setIsLoading(false)
      onLoad?.()
    }

    script.onerror = (err) => {
      const errorMsg = `Failed to load script: ${GOPAY_SDK_URL}`
      setError(errorMsg)
      setIsLoading(false)
      onError?.(err)
      console.error(errorMsg, err)
    }

    scriptRef.current = script
    document.head.appendChild(script)

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current)
      }
    }
  }, [async, defer, onLoad, onError, skipIfExists])

  return {
    isLoaded,
    isLoading,
    error
  }
}



/**
 * Custom React Hook for GoPay Bridge SDK
 * Automatically loads the GoPay SDK and provides a clean interface
 * 
 * @param {GopayMiniappOptions} options - Configuration options
 * @returns {GoPayMiniappResult} GoPay SDK interface
 * 
 * @example
 * const { call, isReady, getAuthCode } = useMiniapp()
 * 
 * const handleAuth = async () => {
 *   const result = await getAuthCode()
 *   console.log(result)
 * }
 */
export const useMiniapp = (options: GopayMiniappOptions = {}): GoPayMiniappResult => {
  const {
    onReady = null,
    onError = null,
    defaultTimeout = 300000
  } = options

  const [isReady, setIsReady] = useState<boolean>(false)
  const readyRef = useRef<boolean>(false)

  const { isLoading, error } = useJSAPILoader({
      skipIfExists: () => typeof window.gpContainer !== 'undefined',
      onLoad: () => {
        if (!readyRef.current) {
          readyRef.current = true
          setIsReady(true)
          onReady?.()
        }
      },
      onError: (err: Event | string) => {
        onError?.(err)
      }
  })

  /**
   * Call a GoPay bridge method (Promise-based)
   */
  const call = useCallback(<T = unknown>(
    className: string,
    methodName: string,
    params: Record<string, unknown> = {},
    timeout: number = defaultTimeout
  ): Promise<GopaySuccessResponse<T>> => {
    return new Promise((resolve, reject) => {
      if (!window.gpContainer) {
        const error: GopayErrorResponse = {
          success: false,
          error_code: 'SDK_NOT_LOADED',
          error_type: 'JS_BRIDGE_ERROR',
          error_message: 'GoPay SDK is not loaded yet',
          ret: 'GP_EXCEPTION'
        }
        reject(error)
        return
      }

      try {
        window.gpContainer.call(
          className,
          methodName,
          params,
          (response: unknown) => {
            const gopayResponse = response as GopayResponse<T>
            if (gopayResponse.success) {
              resolve(gopayResponse as GopaySuccessResponse<T>)
            } else {
              reject(gopayResponse as GopayErrorResponse)
            }
          },
          (error: unknown) => {
            const gopayError = error as GopayErrorResponse
            reject(gopayError)
          },
          timeout
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        reject({
          success: false,
          error_code: 'CALL_EXCEPTION',
          error_type: 'JS_BRIDGE_ERROR',
          error_message: errorMessage,
          ret: 'GP_EXCEPTION'
        } as GopayErrorResponse)
      }
    })
  }, [defaultTimeout])

  /**
   * Call a GoPay bridge method (Callback-based)
   */
  const callWithCallbacks = useCallback((
    className: string,
    methodName: string,
    params: Record<string, unknown> = {},
    successCallback: (response: GopaySuccessResponse) => void,
    failureCallback: (error: GopayErrorResponse) => void,
    timeout: number = defaultTimeout
  ) => {
    if (!window.gpContainer) {
      const error: GopayErrorResponse = {
        success: false,
        error_code: 'SDK_NOT_LOADED',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: 'GoPay SDK is not loaded yet',
        ret: 'GP_EXCEPTION'
      }
      failureCallback?.(error)
      return
    }

    try {
      window.gpContainer.call(
        className,
        methodName,
        params,
        (response: unknown) => {
          const gopayResponse = response as GopayResponse
          if (gopayResponse.success) {
            successCallback(gopayResponse as GopaySuccessResponse)
          } else {
            failureCallback(gopayResponse as GopayErrorResponse)
          }
        },
        (error: unknown) => {
          failureCallback(error as GopayErrorResponse)
        },
        timeout
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      failureCallback({
        success: false,
        error_code: 'CALL_EXCEPTION',
        error_type: 'JS_BRIDGE_ERROR',
        error_message: errorMessage,
        ret: 'GP_EXCEPTION'
      })
    }
  }, [defaultTimeout])

  /**
   * Helper methods for common operations
   */
  const helpers = {
    /**
     * Get authentication code
     */
    getAuthCode: useCallback((params = {}) => {
      return call('GPMiniAppAuth', 'getAuthCode', params)
    }, [call]),

    /**
     * Launch deeplink
     */
    launchDeeplink: useCallback((deeplink: string) => {
      return call('GPNavigator', 'launchDeeplink', { deeplink })
    }, [call]),

    /**
     * Launch URI
     */
    launchUri: useCallback((uri: string) => {
      return call('GPNavigator', 'launchUri', { uri })
    }, [call]),

    /**
     * Launch payment
     */
    launchPayment: useCallback((deeplink: string) => {
      return call('GP', 'launchPayment', { deeplink })
    }, [call]),

    /**
     * Get location
     */
    getLocation: useCallback((params = {}) => {
      return call('GPLocation', 'getLocation', params)
    }, [call]),

    /**
     * Get system info
     */
    getSystemInfo: useCallback((params = {}) => {
      return call('GPSystem', 'getSystemInfo', params)
    }, [call]),

    /**
     * Get WiFi info
     */
    getWifiInfo: useCallback((params = {}) => {
      return call('GPSystem', 'getWifiInfo', params)
    }, [call]),

    /**
     * Check if device is rooted
     */
    getRootedDeviceInfo: useCallback((params = {}) => {
      return call('GPSystem', 'getRootedDeviceInfo', params)
    }, [call]),

    /**
     * Get bank account token
     */
    getBankAccountToken: useCallback((params = {}) => {
      return call('GPBank', 'getBankAccountToken', params)
    }, [call]),

    /**
     * Get user consent
     */
    getUserConsent: useCallback((consentName: string) => {
      return call('GPConsent', 'getUserConsent', { consent_name: consentName })
    }, [call]),

    /**
     * Start accelerometer
     */
    startAccelerometer: useCallback((params = {}) => {
      return call('GPSensor', 'startAccelerometer', params)
    }, [call]),

    /**
     * Stop accelerometer
     */
    stopAccelerometer: useCallback((params = {}) => {
      return call('GPSensor', 'stopAccelerometer', params)
    }, [call]),

    /**
     * Start compass
     */
    startCompass: useCallback((params = {}) => {
      return call('GPSensor', 'startCompass', params)
    }, [call]),

    /**
     * Stop compass
     */
    stopCompass: useCallback((params = {}) => {
      return call('GPSensor', 'stopCompass', params)
    }, [call]),

    /**
     * Vibrate device
     */
    vibrate: useCallback((params = {}) => {
      return call('GPDevice', 'vibrate', params)
    }, [call]),

    /**
     * Get locale/language
     */
    getLocale: useCallback((params = {}) => {
      return call('GPSystem', 'getLocale', params)
    }, [call])
  }

  return {
    isReady,
    isLoading,
    error,
    call,
    callWithCallbacks,
    ...helpers
  }
}

export default useMiniapp
export * from './types'
