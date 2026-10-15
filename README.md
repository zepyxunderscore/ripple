# Ripple

Android wrapper for https://zepyxunderscore.github.io/pages/ripple/

A thin WebView shell: loads the page, keeps navigation on the same host in-app,
opens everything else in the browser, and shows a retry screen when offline.

## Getting the APK

Push to `main` and grab `Ripple-apk` from the Actions run, or push a tag
(`git tag v1.0.0 && git push --tags`) to get `Ripple.apk` attached to a release.

## Building locally

Needs JDK 17, the Android SDK (platform 34) and Gradle 8.9+:

    gradle assembleDebug

The APK lands in `app/build/outputs/apk/debug/`.

## Changing the URL

`APP_URL` and `APP_HOST` at the top of
`app/src/main/java/io/github/zepyxunderscore/ripple/MainActivity.java`.

## Icon

`assets/icon-512.png` is the full-size icon. The adaptive icon lives in
`res/drawable/ic_launcher_foreground.xml` (vector) with the background colour in
`res/values/colors.xml`; the PNGs in `res/mipmap-*` are for Android 7.x and below.
