# react-gopay-miniapp

Unofficial GoPay Miniapp react SDK

## Installation

```bash
npm install react-gopay-miniapp
```

## Usage

### `useMiniapp`

The main hook to interact with the GoPay Miniapp infrastructure. It automatically loads the SDK and provides typed responses.

```tsx
import { useMiniapp } from 'react-gopay-miniapp';

function App() {
  const { 
    isReady, 
    isLoading, 
    error,
    getAuthCode,
    getUserConsent 
  } = useMiniapp({
    onReady: () => console.log('SDK Ready'),
    onError: (err) => console.error('SDK Error', err)
  });

  const handleAuth = async () => {
    try {
      const response = await getAuthCode();
      // Response structure: { success: true, ret: "GP_SUCCESS", data?: T }
      console.log('Auth Code:', response);
    } catch (error) {
      // Error structure: { success: false, error_code: string, error_type: string, error_message: string, ret: "GP_EXCEPTION" }
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Loading SDK...</div>;
  if (error) return <div>Error loading SDK: {error}</div>;

  return (
    <div>
      <button onClick={handleAuth} disabled={!isReady}>
        Get Auth Code
      </button>
    </div>
  );
}
```

### Response Types

All methods return properly typed responses:

**Success Response:**
```typescript
{
  success: true,
  ret: "GP_SUCCESS",
  data?: T  // Optional data field
}
```

**Error Response:**
```typescript
{
  success: false,
  error_code: string,
  error_type: string,
  error_message: string,
  ret: "GP_EXCEPTION"
}
```

### Helper Methods

The following methods are available directly from the hook:

- `getAuthCode(params?: Record<string, unknown>)` - Get authentication code
- `launchDeeplink(deeplink: string)` - Launch a deeplink
- `launchUri(uri: string)` - Launch a URI
- `launchPayment(deeplink: string)` - Launch payment flow
- `getLocation(params?: Record<string, unknown>)` - Get device location
- `getSystemInfo(params?: Record<string, unknown>)` - Get system information
- `getWifiInfo(params?: Record<string, unknown>)` - Get WiFi information
- `getRootedDeviceInfo(params?: Record<string, unknown>)` - Check if device is rooted
- `getBankAccountToken(params?: Record<string, unknown>)` - Get bank account token
- `getUserConsent(consentName: string)` - Get user consent
- `startAccelerometer(params?: Record<string, unknown>)` - Start accelerometer
- `stopAccelerometer(params?: Record<string, unknown>)` - Stop accelerometer
- `startCompass(params?: Record<string, unknown>)` - Start compass
- `stopCompass(params?: Record<string, unknown>)` - Stop compass
- `vibrate(params?: Record<string, unknown>)` - Vibrate device
- `getLocale(params?: Record<string, unknown>)` - Get device locale

### Low-Level Call Method

You can also use the generic `call` method with type parameter:

```tsx
import type { GopaySuccessResponse } from 'react-gopay-miniapp';

interface LocationData {
  latitude: number;
  longitude: number;
}

const { call } = useMiniapp();

// Promise based with typed response
const result = await call<LocationData>('GPLocation', 'getLocation', { accuracy: 'high' });
// result is typed as GopaySuccessResponse<LocationData>
```

### `useJSAPILoader`

Low-level hook if you need to load the JS SDK script manually without the bridge logic.

```tsx
import { useJSAPILoader } from 'react-gopay-miniapp';

function Loader() {
  const { isLoaded, isLoading, error } = useJSAPILoader({
    onLoad: () => console.log('Loaded'),
  });
  
  // ...
}
```

## TypeScript Support

All types are exported from the package:

```typescript
import type {
  GopaySuccessResponse,
  GopayErrorResponse,
  GopayResponse,
  Platform,
  JSAPILoaderOptions,
  JSAPILoaderResult,
  GopayMiniappOptions,
  GoPayMiniappResult
} from 'react-gopay-miniapp';
```

## Error Handling

The SDK properly forwards errors from the GoPay SDK and provides consistent error structures:

```tsx
try {
  const result = await getAuthCode();
  // Handle success
} catch (error) {
  const gopayError = error as GopayErrorResponse;
  console.error('Error Code:', gopayError.error_code);
  console.error('Error Type:', gopayError.error_type);
  console.error('Error Message:', gopayError.error_message);
  console.error('Return Code:', gopayError.ret);
}
```
