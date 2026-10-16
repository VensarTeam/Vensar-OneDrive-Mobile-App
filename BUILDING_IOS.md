# V Drive iOS release

The production EAS profile builds the checked-in `ios/` project in Release mode for App Store distribution. Its bundle identifier is `com.vensar.vdrive`; the app version is `1.0.0`, and the minimum iOS version is 16.4. EAS remote versioning increments the build number for each production build.

This repository keeps its native `ios/` project. Changes to native fields in `app.json` are not automatically applied to it by EAS Build. Review matching Xcode settings, `Info.plist`, and assets whenever those fields change. Expo Doctor reports this as the one remaining native-config warning.

Before creating the upload build:

1. Sign in to an Expo account with access to the linked EAS project: `npx --yes eas-cli@25.0.0 login`.
2. Ensure that account has App Store distribution credentials for the Apple team that owns `com.vensar.vdrive`. Check with `npx --yes eas-cli@25.0.0 credentials -p ios`.
3. Confirm the App Store Connect app record uses the same bundle identifier. Complete its privacy policy URL, privacy declarations, support information, and reviewer access. Reviewers need a working account and a way to complete OTP sign-in. Because iPad support is enabled, prepare iPad screenshots as well as iPhone screenshots.
4. Confirm the in-app Privacy Policy and Terms have been approved by Vensar. Check export-compliance answers against the app's actual encryption use.
5. Confirm `.env` contains the production HTTPS API base URL and correct endpoint paths. These `EXPO_PUBLIC_` values are embedded in the app bundle at build time.

Validate the project with `npx tsc --noEmit`, `npx expo install --check`, and `npx expo export --platform ios`. After dependency changes, run `cd ios && pod install`. Then create the store build:

```sh
npx --yes eas-cli@25.0.0 build --platform ios --profile production
```

Verify the returned build ID, `com.vensar.vdrive`, version, build number, and Release configuration. After the build succeeds, upload that exact build to App Store Connect:

```sh
npx --yes eas-cli@25.0.0 submit --platform ios --profile production --id BUILD_ID
```

Replace `BUILD_ID` with the successful build's ID. An upload to App Store Connect is separate from TestFlight availability and public App Review submission.
