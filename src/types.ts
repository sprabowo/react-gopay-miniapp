/**
 * GoPay SDK Type Definitions
 */

declare global {
  interface Window {
    gpContainer?: {
      call: (
        className: string,
        methodName: string,
        params: Record<string, unknown>,
        successCallback: (response: unknown) => void,
        failureCallback: (error: unknown) => void,
        timeout: number
      ) => void
    }
    flutter_inappwebview?: unknown
    webkit?: {
      messageHandlers?: {
        gpContainer?: unknown
      }
    }
    Android?: unknown
    gopayContainer?: unknown
    WindVane?: unknown
  }
}

/**
 * GoPay SDK success response
 */
export interface GopaySuccessResponse<T = unknown> {
  success: true
  ret: string
  data?: T
}

/**
 * GoPay SDK error response
 */
export interface GopayErrorResponse {
  success: false
  error_code: string
  error_type: string
  error_message: string
  ret: string
}

/**
 * GoPay SDK response type (union of success and error)
 */
export type GopayResponse<T = unknown> = GopaySuccessResponse<T> | GopayErrorResponse

/**
 * Platform types supported by GoPay Miniapp
 */
export type Platform = 'ios' | 'android' | 'webview' | 'windvane' | 'unknown'

/**
 * Options for JSAPILoader hook
 */
export interface JSAPILoaderOptions {
  onLoad?: () => void
  onError?: (error: Event | string) => void
  skipIfExists?: () => boolean
  async?: boolean
  defer?: boolean
}

/**
 * Result from JSAPILoader hook
 */
export interface JSAPILoaderResult {
  isLoaded: boolean
  isLoading: boolean
  error: string | null
}

/**
 * Options for GopayMiniapp hook
 */
export interface GopayMiniappOptions {
  onReady?: () => void
  onError?: (error: Event | string) => void
  defaultTimeout?: number
}

/**
 * Result from GopayMiniapp hook
 */
export interface GoPayMiniappResult {
  isReady: boolean
  isLoading: boolean
  error: string | null
  call: <T = unknown>(
    className: string,
    methodName: string,
    params?: Record<string, unknown>,
    timeout?: number
  ) => Promise<GopaySuccessResponse<T>>
  callWithCallbacks: (
    className: string,
    methodName: string,
    params: Record<string, unknown> | undefined,
    successCallback: (response: GopaySuccessResponse) => void,
    failureCallback: (error: GopayErrorResponse) => void,
    timeout?: number
  ) => void
  getAuthCode: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  launchDeeplink: (deeplink: string) => Promise<GopaySuccessResponse>
  launchUri: (uri: string) => Promise<GopaySuccessResponse>
  launchPayment: (deeplink: string) => Promise<GopaySuccessResponse>
  getLocation: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getSystemInfo: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getWifiInfo: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getRootedDeviceInfo: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getBankAccountToken: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getUserConsent: (consentName: string) => Promise<GopaySuccessResponse>
  startAccelerometer: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  stopAccelerometer: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  startCompass: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  stopCompass: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  vibrate: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
  getLocale: (params?: Record<string, unknown>) => Promise<GopaySuccessResponse>
}
