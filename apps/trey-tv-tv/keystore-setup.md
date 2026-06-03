# Trey TV TV-app — release signing setup

This is a one-time setup to generate the signing key that release APKs are
signed with. Once configured, `./gradlew assembleRelease` produces a signed,
shrunken APK suitable for Google Play (Android TV) and Amazon Appstore (Fire
TV).

## 1. Generate the release keystore

> **Choose strong, memorable passwords. Lose this file or these passwords and
> you cannot publish updates to the same app listing — Google will refuse a
> different signing key.**

From any folder (the file location doesn't matter — Gradle will reference it
by absolute path):

```bash
keytool -genkey -v \
  -keystore "$HOME/trey-tv-tv-release.jks" \
  -alias trey-tv-tv \
  -keyalg RSA \
  -keysize 4096 \
  -validity 10950 \
  -storetype JKS
```

(Validity 10950 days ≈ 30 years — Play Store requires at least 25 years past
October 22, 2033.)

`keytool` will prompt for the store password, key password, and your name /
org / locality. Enter answers honestly — they show in the cert info.

## 2. Back up the keystore

Copy `trey-tv-tv-release.jks` to a secure location you control:

- 1Password / Bitwarden vault attachment, OR
- An encrypted USB drive stored offsite, OR
- A private GitHub release on a repo with secret scanning enabled

**Do NOT commit it to the Trey TV repo. The `.gitignore` already excludes
`*.jks`, `*.keystore`, and `keystore.properties`.**

## 3. Wire it into Gradle

Create `keystore.properties` at the **repo root** (not inside `apps/`):

```
# C:\Users\info\TREY-TV-ANTIGRAVITY\keystore.properties
RELEASE_STORE_FILE=C:/Users/info/trey-tv-tv-release.jks
RELEASE_STORE_PASSWORD=<your store password>
RELEASE_KEY_ALIAS=trey-tv-tv
RELEASE_KEY_PASSWORD=<your key password>
```

Notes:

- Use forward slashes in `RELEASE_STORE_FILE` even on Windows — Gradle
  treats them as portable file paths.
- `keystore.properties` is gitignored.
- If `keystore.properties` is missing, Gradle logs a warning and builds an
  **unsigned** release APK. That APK will sideload via `adb install -t -r`
  but cannot be uploaded to a store.

## 4. (Optional) CI secret injection

For GitHub Actions or any CI:

```yaml
env:
  TREYTV_RELEASE_STORE_FILE: ${{ runner.temp }}/release.jks
  TREYTV_RELEASE_STORE_PASSWORD: ${{ secrets.TREYTV_RELEASE_STORE_PASSWORD }}
  TREYTV_RELEASE_KEY_ALIAS: ${{ secrets.TREYTV_RELEASE_KEY_ALIAS }}
  TREYTV_RELEASE_KEY_PASSWORD: ${{ secrets.TREYTV_RELEASE_KEY_PASSWORD }}

steps:
  - name: Restore keystore
    run: |
      echo "${{ secrets.TREYTV_RELEASE_KEYSTORE_B64 }}" | base64 -d > $TREYTV_RELEASE_STORE_FILE
  - name: Build release APK
    run: cd apps/trey-tv-tv && ./gradlew assembleRelease
```

The Gradle config reads env vars with the `TREYTV_` prefix when
`keystore.properties` is absent.

## 5. Build a signed release APK

```bash
cd apps/trey-tv-tv
./gradlew clean assembleRelease
```

Output: `app/build/outputs/apk/release/app-release.apk`

For Play Store, produce an App Bundle (`.aab`) instead:

```bash
./gradlew bundleRelease
# → app/build/outputs/bundle/release/app-release.aab
```

## 6. Verify the signature

```bash
"$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --verbose \
  apps/trey-tv-tv/app/build/outputs/apk/release/app-release.apk
```

Expected output: `Verifies` plus V1/V2/V3 scheme confirmations.

## 7. (Recommended) Pin the signing key fingerprint somewhere safe

```bash
"$ANDROID_HOME/build-tools/35.0.0/apksigner" verify --print-certs \
  apps/trey-tv-tv/app/build/outputs/apk/release/app-release.apk
```

Save the SHA-256 fingerprint. If Play Store / Amazon ever shows a different
fingerprint for your uploaded build, something has gone wrong (wrong key,
key compromised, etc.) — refuse the upload.

## Troubleshooting

| Symptom                                                                         | Likely cause                                                                                       |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `Failed to read key trey-tv-tv from store ...: keystore password was incorrect` | Wrong `RELEASE_STORE_PASSWORD`                                                                     |
| `Cannot recover key`                                                            | Wrong `RELEASE_KEY_PASSWORD`                                                                       |
| `keystore.properties` not found but env vars set                                | OK — Gradle falls back to env vars                                                                 |
| Release APK installs over debug fine on a dev box                               | Expected — the debug build uses applicationIdSuffix `.debug` so they coexist                       |
| Play Store rejects with "upload signed with a different key"                    | You're using a different keystore than the one the listing was created with — restore the original |
