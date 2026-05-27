package com.treytv.tv.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.treytv.tv.data.PlaceholderTreyTvApiService
import com.treytv.tv.data.PlutoChannel
import com.treytv.tv.data.TreySessionStore
import com.treytv.tv.data.TreyGame
import com.treytv.tv.data.TreyProfile
import com.treytv.tv.data.TreyTvApiService
import com.treytv.tv.data.TreyVideo
import com.treytv.tv.data.WatchNowContent
import com.treytv.tv.ui.screens.GameHostScreen
import com.treytv.tv.ui.screens.HomeShell
import com.treytv.tv.ui.screens.SignInScreen
import com.treytv.tv.ui.screens.SplashScreen
import com.treytv.tv.ui.screens.VideoDetailScreen
import com.treytv.tv.ui.screens.VideoPlayerScreen
import com.treytv.tv.ui.screens.WebShellScreen
import com.treytv.tv.ui.theme.Midnight
import kotlinx.coroutines.launch

sealed interface AppScreen {
    data object Splash : AppScreen
    data object SignIn : AppScreen
    /** Default modern UI — bundled React/Vite cinematic skin rendered in a WebView. */
    data object WebShell : AppScreen
    /** Legacy native Compose home shell — kept reachable for diagnostics / fallback. */
    data object Home : AppScreen
    data class VideoDetail(val video: TreyVideo) : AppScreen
    data class Player(val video: TreyVideo) : AppScreen
    data class GameHost(val game: TreyGame) : AppScreen
}

@Composable
fun TreyTvApp(
    api: TreyTvApiService = remember { PlaceholderTreyTvApiService() },
    sessionStore: TreySessionStore? = null,
) {
    val backStack = remember { mutableStateListOf<AppScreen>(AppScreen.Splash) }
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf<TreyProfile?>(null) }
    var watchNow by remember { mutableStateOf<WatchNowContent?>(null) }
    var games by remember { mutableStateOf(PlaceholderTreyTvApiService.sampleGames) }
    var plutoChannels by remember { mutableStateOf<List<PlutoChannel>>(emptyList()) }
    var loadError by remember { mutableStateOf<String?>(null) }

    fun navigate(screen: AppScreen) {
        backStack.add(screen)
    }

    fun replace(screen: AppScreen) {
        backStack.clear()
        backStack.add(screen)
    }

    fun back() {
        if (backStack.size > 1) {
            backStack.removeAt(backStack.lastIndex)
        }
    }

    BackHandler(enabled = backStack.size > 1) { back() }

    fun refreshHome() {
        val token = sessionStore?.accessToken()
        loadError = null
        scope.launch {
            api.loadWatchNow(token)
                .onSuccess { watchNow = it }
                .onFailure { loadError = it.message ?: "Could not load Trey TV rows." }
            api.loadGames(token).onSuccess { games = it }
            api.fetchPlutoChannels().onSuccess { plutoChannels = it }
            if (!token.isNullOrBlank()) api.loadProfile(token).onSuccess { profile = it }
        }
    }

    LaunchedEffect(Unit) {
        val token = sessionStore?.accessToken()
        api.loadWatchNow(token)
            .onSuccess { watchNow = it }
            .onFailure { loadError = it.message ?: "Could not load Trey TV rows." }
        api.loadGames(token).onSuccess { games = it }
        api.fetchPlutoChannels().onSuccess { plutoChannels = it }
        if (!token.isNullOrBlank()) {
            api.loadProfile(token).onSuccess { profile = it }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Midnight),
    ) {
        when (val screen = backStack.last()) {
            AppScreen.Splash -> SplashScreen(
                onFinished = {
                    replace(if (sessionStore?.accessToken().isNullOrBlank()) AppScreen.SignIn else AppScreen.WebShell)
                },
            )
            AppScreen.SignIn -> SignInScreen(
                api = api,
                onSignedIn = {
                    profile = it
                    refreshHome()
                    replace(AppScreen.WebShell)
                },
                onSkip = { replace(AppScreen.WebShell) },
            )
            AppScreen.WebShell -> WebShellScreen(
                onExit = {
                    scope.launch { api.signOut() }
                    profile = null
                    replace(AppScreen.SignIn)
                },
            )
            AppScreen.Home -> HomeShell(
                profile = profile,
                content = watchNow,
                games = games,
                plutoChannels = plutoChannels,
                errorMessage = loadError,
                onRetry = ::refreshHome,
                onVideoSelected = { navigate(AppScreen.VideoDetail(it)) },
                onGameSelected = { navigate(AppScreen.GameHost(it)) },
                onPlutoChannelSelected = { channel ->
                    // Resolve the Pluto m3u8 URL on demand and hand it to the player
                    // as a synthetic TreyVideo so we reuse the existing playback chrome.
                    scope.launch {
                        api.fetchPlutoStream(channel.id)
                            .onSuccess { stream ->
                                val video = TreyVideo(
                                    id = "pluto:${stream.id}",
                                    title = stream.name,
                                    description = channel.summary ?: "Live channel",
                                    creatorName = "Live TV",
                                    channelName = "Pluto",
                                    streamUrl = stream.url,
                                    durationLabel = "LIVE",
                                    artworkUrl = stream.logoUrl,
                                    tags = listOfNotNull(channel.number?.let { "Ch. $it" }),
                                )
                                navigate(AppScreen.Player(video))
                            }
                            .onFailure {
                                loadError = "Couldn't open ${channel.name}: ${it.message ?: "unknown error"}"
                            }
                    }
                },
                onSignOut = {
                    scope.launch { api.signOut() }
                    profile = null
                    replace(AppScreen.SignIn)
                },
            )
            is AppScreen.VideoDetail -> VideoDetailScreen(
                video = screen.video,
                onBack = ::back,
                onPlay = { navigate(AppScreen.Player(screen.video)) },
            )
            is AppScreen.Player -> VideoPlayerScreen(
                video = screen.video,
                onBack = ::back,
                onProgress = { position, duration ->
                    api.saveWatchProgress(screen.video.id, position, duration, completed = duration > 0 && position >= duration - 2_000)
                },
            )
            is AppScreen.GameHost -> GameHostScreen(
                game = screen.game,
                onBack = ::back,
            )
        }
    }
}
