package com.treytv.tv.data

interface TreyTvApiService {
    suspend fun signInWithEmail(email: String, password: String): Result<TreyProfile>
    suspend fun startDeviceLogin(): Result<DeviceLoginStart>
    suspend fun pollDeviceLogin(deviceCode: String): Result<DeviceLoginStatus>
    suspend fun loadProfile(accessToken: String?): Result<TreyProfile>
    suspend fun loadWatchNow(accessToken: String?): Result<WatchNowContent>
    suspend fun loadGames(accessToken: String?): Result<List<TreyGame>>
    suspend fun saveWatchProgress(videoId: String, positionMs: Long, durationMs: Long, completed: Boolean = false)
    suspend fun signOut()

    // Pluto live TV channels — returns empty list when the web origin doesn't
    // have PLUTO_ENABLED=1 (prod). Callers should hide the rail in that case.
    suspend fun fetchPlutoChannels(limit: Int = 120): Result<List<PlutoChannel>>
    suspend fun fetchPlutoStream(id: String): Result<PlutoStream>
}

data class WatchNowContent(
    val featured: TreyVideo,
    val continueWatching: List<TreyVideo>,
    val newEpisodes: List<TreyVideo>,
    val creatorChannels: List<TreyCreatorChannel>,
    val musicVideos: List<TreyVideo>,
)
