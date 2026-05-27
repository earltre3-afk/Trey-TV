package com.treytv.tv.data

data class TreyVideo(
    val id: String,
    val title: String,
    val description: String,
    val creatorName: String,
    val channelName: String,
    val streamUrl: String,
    val durationLabel: String,
    val progressMs: Long = 0L,
    val artworkUrl: String? = null,
    val tags: List<String> = emptyList(),
)

data class TreyCreatorChannel(
    val id: String,
    val name: String,
    val handle: String,
    val tagline: String,
    val avatarUrl: String? = null,
)

data class TreyProfile(
    val displayName: String,
    val publicProfileUid: String,
    val avatarUrl: String? = null,
    val rewardsUid: String? = null,
    val handle: String? = null,
    val isCreator: Boolean = false,
    val isAdmin: Boolean = false,
    val accentColor: String? = null,
)

data class TreyGame(
    val id: String,
    val title: String,
    val description: String,
    val launchUrl: String,
    val status: String = "TV wrapper",
    val nativeRoute: String? = null,
    val supportsRemote: Boolean = false,
)

data class DeviceLoginStart(
    val deviceCode: String,
    val userCode: String,
    val verificationUrl: String,
    val expiresAt: String,
    val pollingIntervalSeconds: Int,
)

sealed interface DeviceLoginStatus {
    data object Pending : DeviceLoginStatus
    data object Expired : DeviceLoginStatus
    data object Denied : DeviceLoginStatus
    data class Approved(val accessToken: String, val expiresAt: String?) : DeviceLoginStatus
}

// Live linear TV channel exposed by /api/pluto/channels.
// Stream URL is fetched on demand via fetchPlutoStream(id) so signed session
// params stay fresh.
data class PlutoChannel(
    val id: String,
    val name: String,
    val slug: String?,
    val number: Int?,
    val logoUrl: String?,
    val summary: String?,
)

// Resolved stream — short-lived URL playable by ExoPlayer (Media3).
data class PlutoStream(
    val id: String,
    val name: String,
    val logoUrl: String?,
    val url: String,
)
