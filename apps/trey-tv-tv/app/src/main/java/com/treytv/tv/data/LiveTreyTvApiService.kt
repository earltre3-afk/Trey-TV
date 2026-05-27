package com.treytv.tv.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

class LiveTreyTvApiService(
    private val config: TreyTvConfig = TreyTvConfig(),
    private val sessionStore: TreySessionStore,
    private val fallback: PlaceholderTreyTvApiService = PlaceholderTreyTvApiService(config),
) : TreyTvApiService {
    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .build()

    override suspend fun signInWithEmail(email: String, password: String): Result<TreyProfile> =
        Result.failure(UnsupportedOperationException("Use TV device login to sign in."))

    override suspend fun startDeviceLogin(): Result<DeviceLoginStart> = requestJson(
        path = "/api/tv/device/start",
        method = "POST",
    ).map { json ->
        DeviceLoginStart(
            deviceCode = json.optString("device_code"),
            userCode = json.optString("user_code"),
            verificationUrl = json.optString("verification_url"),
            expiresAt = json.optString("expires_at"),
            pollingIntervalSeconds = json.optInt("polling_interval_seconds", 5),
        )
    }.recoverCatching {
        fallback.startDeviceLogin().getOrThrow()
    }

    override suspend fun pollDeviceLogin(deviceCode: String): Result<DeviceLoginStatus> = requestJson(
        path = "/api/tv/device/status?device_code=${deviceCode.urlEncoded()}",
    ).map { json ->
        when (json.optString("status")) {
            "approved" -> {
                val token = json.optString("access_token")
                if (token.isBlank()) DeviceLoginStatus.Pending
                else {
                    sessionStore.saveAccessToken(token)
                    DeviceLoginStatus.Approved(token, json.optString("expires_at").takeIf { it.isNotBlank() })
                }
            }
            "expired" -> DeviceLoginStatus.Expired
            "denied" -> DeviceLoginStatus.Denied
            else -> DeviceLoginStatus.Pending
        }
    }

    override suspend fun loadProfile(accessToken: String?): Result<TreyProfile> {
        val token = accessToken ?: sessionStore.accessToken()
        if (token.isNullOrBlank()) return fallback.loadProfile(null)
        return requestJson(path = "/api/tv/profile", accessToken = token).map { json ->
            TreyProfile(
                displayName = json.optString("display_name", "Trey TV viewer"),
                publicProfileUid = json.optString("public_profile_uid", "UID unavailable"),
                avatarUrl = json.optString("avatar_url").takeIf { it.isNotBlank() },
                rewardsUid = json.optString("rewards_uid").takeIf { it.isNotBlank() },
                handle = json.optString("handle").takeIf { it.isNotBlank() },
                isCreator = json.optBoolean("is_creator", false),
                isAdmin = json.optBoolean("is_admin", false),
                accentColor = json.optString("accent_color").takeIf { it.isNotBlank() },
            )
        }.recoverCatching {
            fallback.loadProfile(token).getOrThrow()
        }
    }

    override suspend fun loadWatchNow(accessToken: String?): Result<WatchNowContent> {
        val token = accessToken ?: sessionStore.accessToken()
        val fallbackContent = fallback.loadWatchNow(token).getOrThrow()
        return requestJson(path = "/api/tv/content/home", accessToken = token).map { json ->
            parseWatchNow(json.optJSONArray("rows") ?: JSONArray(), fallbackContent)
        }.recoverCatching {
            fallbackContent
        }
    }

    override suspend fun loadGames(accessToken: String?): Result<List<TreyGame>> {
        val token = accessToken ?: sessionStore.accessToken()
        return requestJson(path = "/api/tv/games", accessToken = token).map { json ->
            val games = json.optJSONArray("games") ?: JSONArray()
            List(games.length()) { index -> parseGame(games.getJSONObject(index)) }
        }.recoverCatching {
            fallback.loadGames(token).getOrThrow()
        }
    }

    override suspend fun saveWatchProgress(videoId: String, positionMs: Long, durationMs: Long, completed: Boolean) {
        val token = sessionStore.accessToken() ?: return
        val payload = JSONObject()
            .put("video_id", videoId)
            .put("position_seconds", (positionMs / 1000).coerceAtLeast(0))
            .put("duration_seconds", (durationMs / 1000).coerceAtLeast(0))
            .put("completed", completed)
        runCatching {
            requestJson(path = "/api/tv/watch-progress", method = "POST", body = payload, accessToken = token).getOrThrow()
        }
    }

    override suspend fun signOut() {
        sessionStore.clear()
    }

    override suspend fun fetchPlutoChannels(limit: Int): Result<List<PlutoChannel>> =
        requestJson(path = "/api/pluto/channels?limit=$limit").map { json ->
            val arr = json.optJSONArray("channels") ?: JSONArray()
            List(arr.length()) { index ->
                val obj = arr.getJSONObject(index)
                PlutoChannel(
                    id = obj.optString("id"),
                    name = obj.optString("name", "Channel"),
                    slug = obj.optString("slug").takeIf { it.isNotBlank() },
                    number = obj.optInt("number").takeIf { it > 0 },
                    logoUrl = obj.optString("logo").takeIf { it.isNotBlank() },
                    summary = obj.optString("summary").takeIf { it.isNotBlank() },
                )
            }
        }.recoverCatching {
            // PLUTO_ENABLED not set on this origin → empty list, callers hide the rail.
            emptyList()
        }

    override suspend fun fetchPlutoStream(id: String): Result<PlutoStream> =
        requestJson(path = "/api/pluto/stream?id=${id.urlEncoded()}").map { json ->
            val streamUrl = json.optString("url")
            if (streamUrl.isBlank()) throw IOException("No stream URL returned")
            PlutoStream(
                id = json.optString("id", id),
                name = json.optString("name", "Live channel"),
                logoUrl = json.optString("logo").takeIf { it.isNotBlank() },
                url = streamUrl,
            )
        }

    private suspend fun requestJson(
        path: String,
        method: String = "GET",
        body: JSONObject? = null,
        accessToken: String? = null,
    ): Result<JSONObject> = withContext(Dispatchers.IO) {
        runCatching {
            val url = "${config.apiBaseUrl.trimEnd('/')}${path}"
            val requestBody = body?.toString()?.toRequestBody(JSON)
                ?: if (method == "POST") "{}".toRequestBody(JSON) else null
            val builder = Request.Builder().url(url).header("accept", "application/json")
            if (!accessToken.isNullOrBlank()) builder.header("authorization", "Bearer $accessToken")
            val request = when (method) {
                "POST" -> builder.post(requestBody ?: "{}".toRequestBody(JSON)).build()
                else -> builder.get().build()
            }
            client.newCall(request).execute().use { response ->
                val responseBody = response.body?.string().orEmpty()
                if (!response.isSuccessful) throw IOException("Trey TV API request failed.")
                JSONObject(responseBody.ifBlank { "{}" })
            }
        }
    }

    private fun parseWatchNow(rows: JSONArray, fallbackContent: WatchNowContent): WatchNowContent {
        fun row(id: String): JSONArray {
            for (index in 0 until rows.length()) {
                val item = rows.getJSONObject(index)
                if (item.optString("id") == id) return item.optJSONArray("items") ?: JSONArray()
            }
            return JSONArray()
        }

        val featured = row("featured").firstObject()?.let(::parseVideo)
        val continueWatching = row("continue-watching").objects().map(::parseVideo)
        val newEpisodes = row("new-episodes").objects().map(::parseVideo)
        val creatorChannels = row("creator-channels").objects().map(::parseCreator)
        val musicVideos = row("music-videos").objects().map(::parseVideo)

        return WatchNowContent(
            featured = featured ?: fallbackContent.featured,
            continueWatching = continueWatching.ifEmpty { fallbackContent.continueWatching },
            newEpisodes = newEpisodes.ifEmpty { fallbackContent.newEpisodes },
            creatorChannels = creatorChannels.ifEmpty { fallbackContent.creatorChannels },
            musicVideos = musicVideos.ifEmpty { fallbackContent.musicVideos },
        )
    }

    private fun parseVideo(json: JSONObject): TreyVideo {
        val durationSeconds = json.optLong("duration_seconds", 0L)
        return TreyVideo(
            id = json.optString("id"),
            title = json.optString("title", "Trey TV Video"),
            description = json.optString("description", ""),
            creatorName = json.optString("creator_name", "Trey TV"),
            channelName = json.optString("channel_name", json.optString("creator_name", "Trey TV")),
            streamUrl = json.optString("playback_url", json.optString("stream_url")),
            durationLabel = json.optString("duration_label", if (durationSeconds > 0) "${durationSeconds / 60}m" else "Video"),
            progressMs = json.optLong("resume_position_seconds", 0L) * 1000L,
            artworkUrl = json.optString("thumbnail_url").takeIf { it.isNotBlank() },
            tags = listOfNotNull(json.optString("visibility").takeIf { it.isNotBlank() }),
        )
    }

    private fun parseCreator(json: JSONObject): TreyCreatorChannel = TreyCreatorChannel(
        id = json.optString("id"),
        name = json.optString("name", "Trey TV Creator"),
        handle = json.optString("handle", "@treytv"),
        tagline = json.optString("tagline", "Creator channel"),
        avatarUrl = json.optString("avatar_url").takeIf { it.isNotBlank() },
    )

    private fun parseGame(json: JSONObject): TreyGame = TreyGame(
        id = json.optString("id"),
        title = json.optString("title", "Trey TV Game"),
        description = json.optString("description", ""),
        launchUrl = json.optString("launch_url", "/games"),
        status = json.optString("status", "beta"),
        nativeRoute = json.optString("native_route").takeIf { it.isNotBlank() },
        supportsRemote = json.optBoolean("supports_remote", false),
    )

    companion object {
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}

private fun String.urlEncoded(): String = java.net.URLEncoder.encode(this, Charsets.UTF_8.name())

private fun JSONArray.objects(): List<JSONObject> = List(length()) { index -> getJSONObject(index) }

private fun JSONArray.firstObject(): JSONObject? = if (length() > 0) optJSONObject(0) else null
