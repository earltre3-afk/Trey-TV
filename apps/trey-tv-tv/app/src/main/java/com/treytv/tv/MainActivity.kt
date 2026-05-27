package com.treytv.tv

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import com.treytv.tv.data.LiveTreyTvApiService
import com.treytv.tv.data.TreySessionStore
import com.treytv.tv.ui.TreyTvApp
import com.treytv.tv.ui.theme.TreyTvTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val sessionStore = TreySessionStore(this)
        val api = LiveTreyTvApiService(sessionStore = sessionStore)

        setContent {
            TreyTvTheme {
                TreyTvApp(api = api, sessionStore = sessionStore)
            }
        }
    }
}
