#!/bin/sh
set -eu

# ExpoImage is supplied as a prebuilt XCFramework. Xcode embeds its binary
# but does not include the matching vendor dSYM in the app archive.
if [ "${CONFIGURATION:-}" != "Release" ] || [ "${PLATFORM_NAME:-}" != "iphoneos" ]; then
  exit 0
fi

source_dsym="${PODS_ROOT}/ExpoImage/ExpoImage.xcframework/ios-arm64/dSYMs/ExpoImage.framework.dSYM"
framework_binary="${TARGET_BUILD_DIR}/${FRAMEWORKS_FOLDER_PATH}/ExpoImage.framework/ExpoImage"
destination="${DWARF_DSYM_FOLDER_PATH}/ExpoImage.framework.dSYM"

if [ ! -d "$source_dsym" ] || [ ! -f "$framework_binary" ]; then
  # Source-built ExpoImage (or an app without its dynamic framework) has
  # nothing to copy from the prebuilt XCFramework.
  exit 0
fi

binary_uuid="$(xcrun dwarfdump --uuid "$framework_binary" | awk 'NR == 1 { print $2 }')"
dsym_uuid="$(xcrun dwarfdump --uuid "$source_dsym" | awk 'NR == 1 { print $2 }')"
if [ -z "$binary_uuid" ] || [ "$binary_uuid" != "$dsym_uuid" ]; then
  echo "error: ExpoImage dSYM does not match the embedded framework" >&2
  exit 1
fi

mkdir -p "$DWARF_DSYM_FOLDER_PATH"
/usr/bin/ditto "$source_dsym" "$destination"
