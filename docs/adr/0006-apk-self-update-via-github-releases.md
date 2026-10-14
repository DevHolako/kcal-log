# ADR 0006: Android APK Self-Update via Public GitHub Releases

## Context
The Android APK is distributed outside of Google Play Store (direct APK distribution). Users need an automatic, secure method to detect, download, verify, and install updates.

## Decision
1. The mobile application queries the GitHub Releases API for `DevHolako/kcal-log` on launch (unauthenticated).
2. It compares the remote semver tag with the local installed app version.
3. If a new version exists, it prompts the user, downloads the APK asset and its corresponding `.sha256` checksum (or reads the SHA-256 hash included directly in the release metadata).
4. The client cryptographically computes the SHA-256 of the downloaded APK. If valid, it triggers the Android `FileProvider` package installer intent. If invalid, the download is discarded and the user is warned.

## Consequences
- Protects users from corrupted downloads or tampered binary distributions.
- Zero infrastructure maintenance cost since updates rely entirely on GitHub Releases and standard Android package intents.
