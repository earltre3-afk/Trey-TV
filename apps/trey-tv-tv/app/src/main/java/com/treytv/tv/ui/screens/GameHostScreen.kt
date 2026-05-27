package com.treytv.tv.ui.screens

import android.annotation.SuppressLint
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onPreviewKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.tv.material3.Text
import com.treytv.tv.BuildConfig
import com.treytv.tv.data.TreyGame
import com.treytv.tv.ui.theme.Gold

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun GameHostScreen(
    game: TreyGame,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val gameUrl = remember(game.id) {
        val base = if (game.launchUrl.startsWith("http")) game.launchUrl else "${BuildConfig.TREY_TV_WEB_BASE_URL.trimEnd('/')}${game.launchUrl}"
        val separator = if (base.contains("?")) "&" else "?"
        if (base.contains("surface=tv")) base else "${base}${separator}surface=tv&input=remote"
    }

    var webView by remember { mutableStateOf<WebView?>(null) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .focusable()
            .onPreviewKeyEvent { event ->
                if (event.type != KeyEventType.KeyDown) return@onPreviewKeyEvent false
                val action = remoteActionFor(event.key) ?: return@onPreviewKeyEvent false
                if (action == "BACK") {
                    if (webView?.canGoBack() == true) webView?.goBack() else onBack()
                    true
                } else {
                    webView?.evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('treytv-remote-input',{detail:{action:'$action',source:'android-tv-remote'}}));",
                        null,
                    )
                    true
                }
            },
    ) {
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = {
                WebView(context).apply {
                    webView = this
                    webViewClient = WebViewClient()
                    webChromeClient = WebChromeClient()
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    isFocusable = true
                    isFocusableInTouchMode = false
                    loadUrl(gameUrl)
                }
            },
            update = { view ->
                webView = view
                if (view.url != gameUrl) view.loadUrl(gameUrl)
            },
        )
        Column(
            modifier = Modifier
                .align(Alignment.TopStart)
                .background(Color.Black.copy(alpha = 0.58f))
                .padding(horizontal = 20.dp, vertical = 14.dp),
        ) {
            Text(game.title, color = Gold, fontSize = 18.sp, fontWeight = FontWeight.Black)
            Text("D-pad mapped to game actions. Select confirms. Back exits.", color = Color.White.copy(alpha = 0.72f), fontSize = 12.sp)
        }
    }
}

private fun remoteActionFor(key: Key): String? = when {
    key == Key.DirectionUp -> "UP"
    key == Key.DirectionDown -> "DOWN"
    key == Key.DirectionLeft -> "LEFT"
    key == Key.DirectionRight -> "RIGHT"
    key == Key.DirectionCenter || key == Key.Enter -> "SELECT"
    key == Key.Back -> "BACK"
    key == Key.Menu -> "MENU"
    else -> null
}
