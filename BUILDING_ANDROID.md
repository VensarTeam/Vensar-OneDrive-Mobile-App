# Android APK builds

The release build generates three APKs:

- `Vensar-OneDrive-v<version>-v7.apk` for 32-bit ARM (`armeabi-v7a`)
- `Vensar-OneDrive-v<version>-v8.apk` for 64-bit ARM (`arm64-v8a`)
- `Vensar-OneDrive-v<version>-universal.apk` for either ARM architecture

## Build

```sh
npm run build:android:apk
```

The APKs are written to `android/app/build/outputs/apk/release/`.

Use a clean build after changing native dependencies or build configuration:

```sh
npm run build:android:apk:clean
```

## Change the version

Keep these native and Expo values synchronized:

- `versionName` and `versionCode` in `android/app/build.gradle`
- `version` and `android.versionCode` in `app.json`
- `version` in `package.json`

The APK filename reads the native `versionName` automatically.

## Signing

The current release build uses the repository's debug keystore. Before distributing
or uploading a release, configure a private upload/release keystore and provide its
credentials outside version control.

## Size choices

Release builds enable R8 code minification, resource shrinking, JavaScript bundle
compression, and compressed native libraries. GIF and WebP native decoders are
disabled because the app currently contains no GIF or WebP assets. The v7 and v8
APKs are the smallest installable choices; use the universal APK only when one file
must support both ARM architectures.
