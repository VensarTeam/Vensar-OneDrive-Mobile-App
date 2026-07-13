import * as WebBrowser from 'expo-web-browser';

// Required by Expo AuthSession so browser-based sign-in can return cleanly to the app.
export function completePendingAuthSession() {
  WebBrowser.maybeCompleteAuthSession();
}
