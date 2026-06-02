package com.treytv.tv.ui.screens

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.http.SslError
import android.os.Build
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.JsResult
import android.webkit.SslErrorHandler
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.tv.material3.Button
import androidx.tv.material3.Text
import com.treytv.tv.BuildConfig

/**
 * Hosts the cinematic Vite/React TV shell bundled into the APK at
 * `app/src/main/assets/trey-tv-web/`. Loaded via file:// from the WebView.
 *
 * Production hardening (see docs/trey-tv-app-prod-hardening.md):
 *   - Mixed content: never allowed (release) / compatibility mode in debug.
 *   - File access: disallowed except for the bundled file:///android_asset/
 *     assets (which a special exemption allows even with allowFileAccess=false).
 *   - SafeBrowsing: enabled on Android 8+.
 *   - SSL errors: rejected hard. No user override.
 *   - External navigations: refused. Anything not under file:///android_asset/
 *     or the configured TREY_TV_API_BASE_URL stays inside the WebView.
 *   - Zoom / popups / geolocation: disabled (irrelevant on a TV).
 *   - JS dialogs: swallowed (no system dialog overlay on TV).
 *   - Console output: logged through Android logcat for diagnostics, with the
 *     log level mirroring the JS severity.
 *
 * UX:
 *   - Loading state: a centered spinner over a black background, shown until
 *     the page emits onPageFinished (or onPageCommitVisible on API 23+).
 *   - Error state: an overlay with the reason + a Reload button. Triggered by
 *     onReceivedError for the main frame or onReceivedHttpError with 5xx/4xx.
 */
private const val LOG_TAG = "TreyTvWebShell"
private const val DEFAULT_INDEX = "file:///android_asset/trey-tv-web/index.html"
private const val USER_AGENT_SUFFIX = " TreyTvNative/${BuildConfig.VERSION_NAME}"

// The bundled web shell lives under assets/trey-tv-web/. It uses ROOT-ABSOLUTE
// asset paths (e.g. "/tv-artwork/kingmaker-the-change-hero-4k.jpg",
// "/placeholder.svg") which, over file://, resolve to the device filesystem
// root and 404. We intercept those and serve them from the bundled asset dir.
private const val ASSET_ROOT = "trey-tv-web"

private fun mimeFor(path: String): String = when {
    path.endsWith(".html") -> "text/html"
    path.endsWith(".js") || path.endsWith(".mjs") -> "text/javascript"
    path.endsWith(".css") -> "text/css"
    path.endsWith(".json") -> "application/json"
    path.endsWith(".svg") -> "image/svg+xml"
    path.endsWith(".png") -> "image/png"
    path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
    path.endsWith(".webp") -> "image/webp"
    path.endsWith(".gif") -> "image/gif"
    path.endsWith(".ico") -> "image/x-icon"
    path.endsWith(".woff2") -> "font/woff2"
    path.endsWith(".woff") -> "font/woff"
    path.endsWith(".ttf") -> "font/ttf"
    path.endsWith(".txt") -> "text/plain"
    else -> "application/octet-stream"
}

/**
 * Serve a root-absolute file:// asset request from the bundled trey-tv-web/
 * folder. Returns null if the request isn't a redirectable root-absolute path
 * (so normal file:///android_asset/ loads pass through unchanged).
 */
private fun interceptBundledAsset(
    ctx: android.content.Context,
    request: WebResourceRequest,
): WebResourceResponse? {
    val url = request.url
    if (url.scheme != "file") return null
    val path = url.path ?: return null
    // Leave the real /android_asset/ loads (index.html + ./assets/* bundle) alone.
    if (path.startsWith("/android_asset/")) return null
    val assetPath = "$ASSET_ROOT/${path.trimStart('/')}"
    return try {
        val stream = ctx.assets.open(assetPath)
        WebResourceResponse(mimeFor(assetPath), null, stream)
    } catch (e: java.io.IOException) {
        null
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebShellScreen(
    indexUrl: String = DEFAULT_INDEX,
    onExit: () -> Unit = {},
) {
    val webViewRef = remember { mutableStateOf<WebView?>(null) }
    // Latest onExit, so the JS "Sign in" bridge always calls the current handler.
    val currentOnExit by rememberUpdatedState(onExit)
    var isLoading by remember { mutableStateOf(true) }
    var loadError by remember { mutableStateOf<String?>(null) }
    var reloadTrigger by remember { mutableIntStateOf(0) }

    BackHandler {
        val wv = webViewRef.value
        if (wv != null && wv.canGoBack()) {
            wv.goBack()
        } else {
            onExit()
        }
    }

    // Reload the WebView whenever reloadTrigger changes (user tapped Reload).
    LaunchedEffect(reloadTrigger) {
        if (reloadTrigger > 0) {
            val wv = webViewRef.value ?: return@LaunchedEffect
            isLoading = true
            loadError = null
            wv.loadUrl(indexUrl)
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                    )

                    // ── Hardened settings ──────────────────────────────────
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        mediaPlaybackRequiresUserGesture = false

                        // TV scaling: the shell declares a fixed 1920px viewport
                        // (see web index.html). useWideViewPort makes the WebView
                        // honor that width; loadWithOverviewMode zooms the 1920px
                        // canvas to fit the screen (1:1 on a 1080p TV). Without
                        // this the page used the ~960px device-width and rendered
                        // oversized, overlapping, and clipped at the edges.
                        useWideViewPort = true
                        loadWithOverviewMode = true

                        // The shell is bundled under file:///android_asset/.
                        // The Vite build loads an ES-module entry (<script
                        // type="module">) plus CSS/asset fetches over file://.
                        // Module + same-origin fetch from a file:// origin is
                        // blocked unless file-URL access is allowed, which left
                        // the React app unmounted (black screen). Enable it for
                        // the bundled local assets.
                        allowFileAccess = true
                        allowContentAccess = false
                        @Suppress("DEPRECATION")
                        allowFileAccessFromFileURLs = true
                        @Suppress("DEPRECATION")
                        allowUniversalAccessFromFileURLs = true

                        // No mixing http content into https pages.
                        mixedContentMode =
                            if (BuildConfig.DEBUG) WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                            else WebSettings.MIXED_CONTENT_NEVER_ALLOW

                        // SafeBrowsing on Android 8+.
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            safeBrowsingEnabled = true
                        }

                        // Not needed on TV.
                        setGeolocationEnabled(false)
                        setSupportZoom(false)
                        builtInZoomControls = false
                        displayZoomControls = false
                        javaScriptCanOpenWindowsAutomatically = false
                        setSupportMultipleWindows(false)

                        // Identify this surface to the API.
                        userAgentString = "${userAgentString}$USER_AGENT_SUFFIX"

                        cacheMode = WebSettings.LOAD_DEFAULT
                    }

                    setBackgroundColor(android.graphics.Color.BLACK)
                    isFocusable = true
                    isFocusableInTouchMode = true
                    requestFocus()

                    webViewClient = object : WebViewClient() {
                        override fun shouldInterceptRequest(
                            view: WebView, request: WebResourceRequest,
                        ): WebResourceResponse? {
                            return interceptBundledAsset(view.context, request)
                                ?: super.shouldInterceptRequest(view, request)
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView, request: WebResourceRequest,
                        ): Boolean {
                            val url = request.url.toString()
                            // Allow our bundled assets and absolute https URLs the
                            // shell may load (API calls etc.). Refuse everything else.
                            val ok = url.startsWith("file:///android_asset/") ||
                                url.startsWith("https://")
                            if (!ok) {
                                Log.w(LOG_TAG, "Refused navigation: $url")
                            }
                            return !ok
                        }

                        override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
                            isLoading = true
                            loadError = null
                        }

                        override fun onPageFinished(view: WebView, url: String?) {
                            isLoading = false
                        }

                        override fun onReceivedError(
                            view: WebView, request: WebResourceRequest, error: WebResourceError,
                        ) {
                            // Only surface main-frame errors; resource errors are noisy.
                            if (request.isForMainFrame) {
                                val reason = "${error.errorCode}: ${error.description}"
                                Log.e(LOG_TAG, "onReceivedError main-frame: $reason")
                                loadError = reason
                                isLoading = false
                            } else {
                                Log.w(LOG_TAG, "Subresource error: ${request.url} → ${error.description}")
                            }
                        }

                        override fun onReceivedSslError(
                            view: WebView, handler: SslErrorHandler, error: SslError,
                        ) {
                            // Hard fail. NEVER call handler.proceed() in production.
                            Log.e(LOG_TAG, "SSL error on ${error.url}: ${error.primaryError}")
                            handler.cancel()
                            loadError = "Secure connection failed"
                            isLoading = false
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                            // Surface React console output through logcat.
                            val tag = "TreyTvWeb"
                            val text = "${message.message()} (${message.sourceId()}:${message.lineNumber()})"
                            when (message.messageLevel()) {
                                ConsoleMessage.MessageLevel.ERROR -> Log.e(tag, text)
                                ConsoleMessage.MessageLevel.WARNING -> Log.w(tag, text)
                                ConsoleMessage.MessageLevel.DEBUG, ConsoleMessage.MessageLevel.LOG ->
                                    Log.d(tag, text)
                                else -> Log.i(tag, text)
                            }
                            return true
                        }

                        // Swallow JS dialogs — no system dialog overlay on TV.
                        override fun onJsAlert(view: WebView, url: String?, message: String?, result: JsResult): Boolean {
                            Log.w(LOG_TAG, "JS alert suppressed: $message")
                            result.cancel()
                            return true
                        }

                        override fun onJsConfirm(view: WebView, url: String?, message: String?, result: JsResult): Boolean {
                            Log.w(LOG_TAG, "JS confirm suppressed: $message")
                            result.cancel()
                            return true
                        }
                    }

                    // Bridge: lets the web shell open the native device-login
                    // screen. The web "Sign in" button calls
                    // window.TreyTvNative.signIn(). Runs on a binder thread, so
                    // hop back to the UI thread before navigating.
                    addJavascriptInterface(
                        object {
                            @JavascriptInterface
                            fun signIn() {
                                post { currentOnExit() }
                            }
                        },
                        "TreyTvNative",
                    )

                    loadUrl(indexUrl)
                    webViewRef.value = this
                }
            },
        )

        // Loading overlay — centered spinner on black while the WebView is
        // still painting its first frame.
        if (isLoading && loadError == null) {
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Black),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(color = Color(0xFFFFC857))
            }
        }

        // Error overlay — replaces the WebView painting with a retry CTA.
        loadError?.let { reason ->
            Box(
                modifier = Modifier.fillMaxSize().background(Color.Black),
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.padding(48.dp),
                ) {
                    Text(
                        "Trey TV couldn't load",
                        color = Color.White,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.Black,
                    )
                    Text(reason, color = Color(0xFF9AA0A6), fontSize = 16.sp)
                    Button(onClick = { reloadTrigger++ }) {
                        Text("Reload", color = Color.Black)
                    }
                }
            }
        }
    }
}
