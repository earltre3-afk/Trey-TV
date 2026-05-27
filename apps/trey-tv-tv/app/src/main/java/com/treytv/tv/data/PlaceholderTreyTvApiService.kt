package com.treytv.tv.data

import kotlinx.coroutines.delay

class PlaceholderTreyTvApiService(
    private val config: TreyTvConfig = TreyTvConfig(),
) : TreyTvApiService {
    override suspend fun signInWithEmail(email: String, password: String): Result<TreyProfile> {
        delay(350)
        if (email.isBlank() || password.isBlank()) return Result.failure(IllegalArgumentException("Email and password are required."))
        return Result.success(sampleProfile.copy(displayName = email.substringBefore("@").ifBlank { "Trey TV User" }))
    }

    override suspend fun startDeviceLogin(): Result<DeviceLoginStart> {
        delay(250)
        return Result.success(
            DeviceLoginStart(
                deviceCode = "placeholder-device",
                userCode = "TREY-4821",
                verificationUrl = "${config.webBaseUrl}/tv/activate",
                expiresAt = "dev",
                pollingIntervalSeconds = 5,
            ),
        )
    }

    override suspend fun pollDeviceLogin(deviceCode: String): Result<DeviceLoginStatus> {
        delay(300)
        return Result.success(DeviceLoginStatus.Pending)
    }

    override suspend fun loadProfile(accessToken: String?): Result<TreyProfile> {
        delay(200)
        return Result.success(sampleProfile)
    }

    override suspend fun loadWatchNow(accessToken: String?): Result<WatchNowContent> {
        delay(250)
        return Result.success(sampleWatchNow)
    }

    override suspend fun loadGames(accessToken: String?): Result<List<TreyGame>> {
        delay(150)
        return Result.success(sampleGames)
    }

    override suspend fun saveWatchProgress(videoId: String, positionMs: Long, durationMs: Long, completed: Boolean) {
        // Hook for live Supabase/API persistence. Intentionally no-op in the foundation app.
    }

    override suspend fun signOut() = Unit

    override suspend fun fetchPlutoChannels(limit: Int): Result<List<PlutoChannel>> {
        // Dev fallback — empty list so the Live TV rail stays hidden.
        return Result.success(emptyList())
    }

    override suspend fun fetchPlutoStream(id: String): Result<PlutoStream> {
        return Result.failure(IllegalStateException("Pluto stream unavailable in placeholder service"))
    }

    companion object {
        private const val SampleHls = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
        private const val SampleMp4 = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

        val sampleProfile = TreyProfile(
            displayName = "Trey TV Guest",
            publicProfileUid = "TREY-TV-GUEST",
            rewardsUid = "REWARDS-PENDING",
        )

        private val hero = TreyVideo(
            id = "sample-hero-hls",
            title = "Trey TV Live Preview",
            description = "A placeholder HLS stream wired through Media3. Replace this with Cloudflare Stream or Trey TV HLS metadata.",
            creatorName = "Trey TV",
            channelName = "Watch Now",
            streamUrl = SampleHls,
            durationLabel = "Live",
            tags = listOf("Featured", "HLS", "Creator TV"),
        )

        val sampleWatchNow = WatchNowContent(
            featured = hero,
            continueWatching = listOf(
                hero.copy(id = "continue-01", title = "Studio Session: Continue Watching", progressMs = 230_000),
                hero.copy(id = "continue-02", title = "Creator Room Replay", streamUrl = SampleMp4, progressMs = 84_000),
            ),
            newEpisodes = listOf(
                hero.copy(id = "episode-01", title = "New Episode: Neon City Drop"),
                hero.copy(id = "episode-02", title = "Creator Spotlight: Night Session", streamUrl = SampleMp4),
                hero.copy(id = "episode-03", title = "Behind The Beat"),
            ),
            creatorChannels = listOf(
                TreyCreatorChannel("creator-trey", "Trey Songz", "@treysongz", "Music, drops, and creator rooms"),
                TreyCreatorChannel("creator-studio", "Trey TV Studio", "@treytv", "Original shows and platform updates"),
                TreyCreatorChannel("creator-fwd", "FWD GIF Lab", "@fwd", "Remix culture and GIF drops"),
            ),
            musicVideos = listOf(
                hero.copy(id = "music-01", title = "Music Video: Liquid Neon", streamUrl = SampleMp4),
                hero.copy(id = "music-02", title = "Performance Cut: After Hours"),
                hero.copy(id = "music-03", title = "Fan Room Premiere"),
            ),
        )

        val sampleGames = listOf(
            TreyGame("truno", "Truno", "UNO-style party game adapted for D-pad play.", "/games/truno"),
            TreyGame("spades", "Spades", "Team card play with TV remote selection.", "/games/spades"),
            TreyGame("blackjack", "Blackjack", "Table game with focused actions and confirm.", "/games/blackjack"),
            TreyGame("bullshit", "Bullshit / Cheat", "Call, pass, and play using remote-safe actions.", "/games/bullshit"),
            TreyGame("interactive-stories", "Interactive Stories", "Switch Kicks, God Ram, and .ttstory journeys.", "/games/interactive-stories"),
            TreyGame("rpg", "RPG", "Placeholder for Trey TV role-playing worlds.", "/games/rpg", "Coming soon"),
        )
    }
}
