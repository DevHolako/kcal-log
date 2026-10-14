# Secrets & Security Management: kcal-log

> **CRITICAL**: The `DevHolako/kcal-log` repository is **PUBLIC**.
> Never commit `.env` files, keystores, private keys, tokens, or credentials to git. All staged files are guarded by `scripts/check-secrets.sh`.

---

## 1. Secrets Inventory & Storage Locations

| Secret Name | Purpose | Where It Lives | Notes |
| :--- | :--- | :--- | :--- |
| `APP_KEY` | Laravel encryption key (cookies, sessions, encrypted casts) | Coolify Environment, Offline Password Manager | **Generated once**. Never re-generate on deploy. |
| `APP_PREVIOUS_KEYS` | Comma-separated list of previous keys during rotation | Coolify Environment | Used to decrypt data encrypted under earlier keys. |
| `DB_PASSWORD` | PostgreSQL user password | Coolify Environment, Local `.env` | Unique per environment. |
| `REDIS_PASSWORD` | Redis authentication token | Coolify Environment, Local `.env` | Protects queue and cache state. |
| `REVERB_APP_SECRET` | WebSockets server secret | Coolify Environment | Authenticates Reverb socket handshakes. |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release signing keystore | GitHub Secrets | Used by CI to sign release APKs. |
| `ANDROID_KEYSTORE_PASSWORD` | Password for Android keystore | GitHub Secrets, Offline Password Manager | Kept with offline backups. |
| `ANDROID_KEY_ALIAS` | Key alias in Android keystore (e.g. `kcalkey`) | GitHub Secrets | Identifier of the key. |
| `ANDROID_KEY_PASSWORD` | Password for key alias | GitHub Secrets, Offline Password Manager | Kept with offline backups. |

---

## 2. Laravel Encryption Key (`APP_KEY`)

Laravel uses `APP_KEY` to encrypt sessions, cookies, and sensitive database columns (e.g., Open Food Facts tokens in `user_off_connections`).

### Initial Generation
Generate the key once locally or in your secure staging terminal:
```bash
php artisan key:generate --show
```
Save this value directly into your Coolify deployment environment and your secure offline password manager (1Password, Bitwarden, KeePass).

### Safe Key Rotation Procedure
If `APP_KEY` must be rotated:
1. Copy the current `APP_KEY` value (e.g. `base64:OldKey...`).
2. Generate a new key: `php artisan key:generate --show` -> `base64:NewKey...`.
3. Set `APP_KEY=base64:NewKey...`.
4. Add the old key to `APP_PREVIOUS_KEYS`:
   ```env
   APP_KEY=base64:NewKey...
   APP_PREVIOUS_KEYS=base64:OldKey...
   ```
5. Deploy. Laravel will decrypt existing columns with `APP_PREVIOUS_KEYS` and re-encrypt new entries with `APP_KEY`.
6. Once all rows are re-encrypted, `APP_PREVIOUS_KEYS` can be pruned.

---

## 3. Android Signing Keystore

The Android APK requires a consistent cryptographic key across all releases so that the OS permits in-place upgrades.

> [!CAUTION]
> **Loss of the keystore or passwords means existing users CANNOT update the app** without uninstalling and losing local data. Always keep two independent offline backups.

### Keystore Generation (Run Once Locally)
Generate the keystore locally on an offline/secure workstation:
```bash
keytool -genkeypair -v -keystore kcal-release.keystore \
  -alias kcalkey \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=DevHolako, OU=kcal-log, O=DevHolako, L=Unknown, ST=Unknown, C=US"
```

### Keystore Public Fingerprint
The SHA-256 fingerprint is **public** and is checked in CI before building release assets:
- **Alias**: `kcalkey`
- **Expected SHA-256 Certificate Fingerprint**:
  *(Calculated and committed after local keystore generation)*
```bash
keytool -list -v -keystore kcal-release.keystore -alias kcalkey
```

### Storing in GitHub Secrets
Base64-encode the keystore file to paste into GitHub Secrets:
```bash
base64 -w 0 kcal-release.keystore | pbcopy # or xclip / wl-copy
```
Add to GitHub repository secrets:
- `ANDROID_KEYSTORE_BASE64`: The base64 string.
- `ANDROID_KEYSTORE_PASSWORD`: Keystore password.
- `ANDROID_KEY_ALIAS`: `kcalkey`.
- `ANDROID_KEY_PASSWORD`: Key password.

### Offline Backup Plan
1. **Primary Backup**: Encrypted password manager vault (with file attachment).
2. **Secondary Backup**: Offline encrypted USB drive or cold storage.

---

## 4. Emergency Response: Secret Exposure

If an active secret or private key is ever committed or exposed:
1. **STOP IMMEDIATELY**.
2. Rotate the secret on all live services (Coolify, GitHub, Redis).
3. If `APP_KEY` was leaked: initiate `APP_PREVIOUS_KEYS` rotation.
4. If a keystore was leaked: you must rotate the signing key; note that existing Android installs will require a clean reinstall.
