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
 * GoPay SDK success response with message
 */
export interface GopaySuccessResponseWithMessage extends GopaySuccessResponse {
  msg: string
}

/**
 * GoPay SDK success response with locale
 */
export interface GopaySuccessResponseWithLocale extends GopaySuccessResponse {
  app_locale: 'en_ID' | 'id_ID' | string
}

/**
 * Success response data types (JSAPIs Specification v1.0.0)
 */
export interface GetAuthCodeData {
  authCode: string
}

export interface GetLocationData {
  coords: {
    longitude: number
    latitude: number
    time: number
  }
}

export interface GetSystemInfoData {
  platform: string
  is_emulator: boolean
  brand: string
  model: string
  product: string
  uuid: string
  idfa: string
  idfv: string
}

export interface GetRootedDeviceInfoData {
  is_rooted: string
}

export interface GetWifiInfoData {
  wifi_bssid: string
  wifi_ssid: string
}

export interface GetUserConsentData {
  consent_name: string
  has_consent: boolean
}

export interface GetBankAccountTokenData {
  token: string
}

export interface LaunchPaymentData {
  status: 'success' | 'failed' | 'pending' | 'cancelled'
}

/**
 * Success response types (JSAPIs Specification v1.0.0)
 */
export type GetAuthCodeSuccessResponse = GopaySuccessResponse<GetAuthCodeData>
export type GetLocationSuccessResponse = GopaySuccessResponse<GetLocationData>
export type GetSystemInfoSuccessResponse = GopaySuccessResponse<GetSystemInfoData>
export type GetRootedDeviceInfoSuccessResponse = GopaySuccessResponse<GetRootedDeviceInfoData>
export type GetWifiInfoSuccessResponse = GopaySuccessResponse<GetWifiInfoData>
export type GetUserConsentSuccessResponse = GopaySuccessResponse<GetUserConsentData>
export type GetBankAccountTokenSuccessResponse = GopaySuccessResponse<GetBankAccountTokenData>
export type LaunchPaymentSuccessResponse = GopaySuccessResponse<LaunchPaymentData>
export type LaunchDeeplinkSuccessResponse = GopaySuccessResponse
export type LaunchUriSuccessResponse = GopaySuccessResponse
export type VibrateSuccessResponse = GopaySuccessResponse
export type StartAccelerometerSuccessResponse = GopaySuccessResponseWithMessage
export type StopAccelerometerSuccessResponse = GopaySuccessResponseWithMessage
export type StartCompassSuccessResponse = GopaySuccessResponseWithMessage
export type StopCompassSuccessResponse = GopaySuccessResponseWithMessage
export type GetLocaleSuccessResponse = GopaySuccessResponseWithLocale

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
  getAuthCode: (params?: Record<string, unknown>) => Promise<GetAuthCodeSuccessResponse>
  launchDeeplink: (deeplink: string) => Promise<LaunchDeeplinkSuccessResponse>
  launchUri: (uri: string) => Promise<LaunchUriSuccessResponse>
  launchPayment: (deeplink: string) => Promise<LaunchPaymentSuccessResponse>
  getLocation: (params?: Record<string, unknown>) => Promise<GetLocationSuccessResponse>
  getSystemInfo: (params?: Record<string, unknown>) => Promise<GetSystemInfoSuccessResponse>
  getWifiInfo: (params?: Record<string, unknown>) => Promise<GetWifiInfoSuccessResponse>
  getRootedDeviceInfo: (params?: Record<string, unknown>) => Promise<GetRootedDeviceInfoSuccessResponse>
  getBankAccountToken: (params?: Record<string, unknown>) => Promise<GetBankAccountTokenSuccessResponse>
  getUserConsent: (consentName: string) => Promise<GetUserConsentSuccessResponse>
  startAccelerometer: (params?: Record<string, unknown>) => Promise<StartAccelerometerSuccessResponse>
  stopAccelerometer: (params?: Record<string, unknown>) => Promise<StopAccelerometerSuccessResponse>
  startCompass: (params?: Record<string, unknown>) => Promise<StartCompassSuccessResponse>
  stopCompass: (params?: Record<string, unknown>) => Promise<StopCompassSuccessResponse>
  vibrate: (params?: Record<string, unknown>) => Promise<VibrateSuccessResponse>
  getLocale: (params?: Record<string, unknown>) => Promise<GetLocaleSuccessResponse>
}
