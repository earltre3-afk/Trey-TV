# Trey TV TV-app — R8/ProGuard rules.
# Activated when isMinifyEnabled = true (release builds).

# ── App-specific ───────────────────────────────────────────────────────────
# Data classes serialized through JSON (org.json) or used reflectively. Keep
# their constructors + properties so field access doesn't get stripped.
-keep class com.treytv.tv.data.** { *; }

# Application class is referenced from the manifest.
-keep class com.treytv.tv.TreyTvApplication { *; }

# ── WebView ────────────────────────────────────────────────────────────────
# The bundled React shell uses standard browser APIs; no JS bridge yet. If a
# bridge is added later, keep its @JavascriptInterface methods explicitly:
#   -keep class com.treytv.tv.web.JsBridge { @android.webkit.JavascriptInterface *; }

# ── Media3 / ExoPlayer (HLS) ───────────────────────────────────────────────
# Provided by the library AAR; consumer rules pull in what we need. Add
# extra-conservative keeps in case lint marks any reflective entry point.
-keep class com.google.android.exoplayer2.** { *; }
-keep class androidx.media3.** { *; }
-dontwarn androidx.media3.**

# ── OkHttp (used by LiveTreyTvApiService) ─────────────────────────────────
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.openjsse.**

# ── Kotlinx coroutines ─────────────────────────────────────────────────────
-keepclassmembers class kotlinx.coroutines.internal.MainDispatcherFactory { *; }
-dontwarn kotlinx.coroutines.debug.**

# ── Android Security Crypto (EncryptedSharedPreferences) ───────────────────
-keep class com.google.crypto.tink.** { *; }
-dontwarn com.google.crypto.tink.**

# ── BuildConfig — read at runtime ──────────────────────────────────────────
-keepclassmembers class com.treytv.tv.BuildConfig { *; }

# ── Stack traces ───────────────────────────────────────────────────────────
# Keep file + line numbers in stack traces for crash reports.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Disable unnecessary warnings ──────────────────────────────────────────
-dontwarn java.lang.invoke.**
-dontwarn javax.annotation.**
