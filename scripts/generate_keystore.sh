#!/bin/bash
# Script to generate a fixed debug keystore for Capacitor Android project

KEYSTORE_PATH="android/app/debug.keystore"

if [ -f "$KEYSTORE_PATH" ]; then
    echo "Keystore already exists at $KEYSTORE_PATH"
else
    echo "Generating debug keystore..."
    keytool -genkey -v \
      -keystore "$KEYSTORE_PATH" \
      -alias androiddebugkey \
      -keyalg RSA \
      -keysize 2048 \
      -validity 10000 \
      -storepass android \
      -keypass android \
      -dname "CN=Android Debug,O=Android,C=US"
    echo "Keystore generated successfully."
fi
