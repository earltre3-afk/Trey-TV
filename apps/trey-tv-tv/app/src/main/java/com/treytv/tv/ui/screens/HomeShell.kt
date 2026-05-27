package com.treytv.tv.ui.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Button
import androidx.tv.material3.Text
import com.treytv.tv.data.PlutoChannel
import com.treytv.tv.data.TreyGame
import com.treytv.tv.data.TreyProfile
import com.treytv.tv.data.TreyVideo
import com.treytv.tv.data.WatchNowContent
import com.treytv.tv.ui.components.FocusCard
import com.treytv.tv.ui.components.LabelPill
import com.treytv.tv.ui.components.NeonBackground
import com.treytv.tv.ui.components.RemoteHint
import com.treytv.tv.ui.components.SectionTitle
import com.treytv.tv.ui.components.VideoRow
import com.treytv.tv.ui.theme.Gold
import com.treytv.tv.ui.theme.NeonBlue
import com.treytv.tv.ui.theme.TextMuted

private enum class HomeTab(val label: String) {
    WatchNow("Watch Now"),
    Guide("Guide"),
    Games("Games"),
    Profile("My Profile"),
    Settings("Settings"),
}

@Composable
fun HomeShell(
    profile: TreyProfile?,
    content: WatchNowContent?,
    games: List<TreyGame>,
    plutoChannels: List<PlutoChannel>,
    errorMessage: String?,
    onRetry: () -> Unit,
    onVideoSelected: (TreyVideo) -> Unit,
    onGameSelected: (TreyGame) -> Unit,
    onPlutoChannelSelected: (PlutoChannel) -> Unit,
    onSignOut: () -> Unit,
) {
    var tab by remember { mutableStateOf(HomeTab.WatchNow) }

    NeonBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 34.dp),
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 48.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("TREY TV", color = Gold, fontSize = 32.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.weight(1f))
                HomeTab.entries.forEach { item ->
                    Button(onClick = { tab = item }) {
                        Text(item.label, color = if (tab == item) Gold else Color.White)
                    }
                }
            }
            Spacer(Modifier.height(24.dp))
            when (tab) {
                HomeTab.WatchNow -> WatchNowScreen(content, plutoChannels, errorMessage, onRetry, onVideoSelected, onPlutoChannelSelected)
                HomeTab.Guide -> GuideScreen(content, onVideoSelected)
                HomeTab.Games -> GamesScreen(games, onGameSelected)
                HomeTab.Profile -> ProfileScreen(profile)
                HomeTab.Settings -> SettingsScreen(profile, onSignOut)
            }
        }
    }
}

@Composable
private fun WatchNowScreen(
    content: WatchNowContent?,
    plutoChannels: List<PlutoChannel>,
    errorMessage: String?,
    onRetry: () -> Unit,
    onVideoSelected: (TreyVideo) -> Unit,
    onPlutoChannelSelected: (PlutoChannel) -> Unit,
) {
    if (errorMessage != null) {
        Column(Modifier.padding(48.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Text("Trey TV rows are unavailable.", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
            Text(errorMessage, color = TextMuted)
            Button(onClick = onRetry) { Text("Retry") }
        }
        return
    }
    if (content == null) {
        Text("Loading Trey TV...", modifier = Modifier.padding(48.dp), color = TextMuted)
        return
    }
    LazyColumn(verticalArrangement = Arrangement.spacedBy(32.dp)) {
        item {
            FocusCard(
                modifier = Modifier
                    .padding(horizontal = 48.dp)
                    .height(300.dp),
                onClick = { onVideoSelected(content.featured) },
            ) {
                Column(Modifier.padding(34.dp)) {
                    LabelPill("FEATURED")
                    Spacer(Modifier.height(44.dp))
                    Text(content.featured.title, color = Color.White, fontSize = 42.sp, fontWeight = FontWeight.Black)
                    Text(content.featured.description, color = TextMuted, fontSize = 18.sp, maxLines = 2)
                    Spacer(Modifier.height(22.dp))
                    RemoteHint("Press Select to open details")
                }
            }
        }
        if (plutoChannels.isNotEmpty()) {
            item { PlutoLiveTvRow(plutoChannels, onPlutoChannelSelected) }
        }
        item { VideoRow("Continue Watching", content.continueWatching, onVideoSelected) }
        item { VideoRow("New Episodes", content.newEpisodes, onVideoSelected) }
        item { CreatorChannelRow(content) }
        item { VideoRow("Music Videos", content.musicVideos, onVideoSelected) }
    }
}

@Composable
private fun PlutoLiveTvRow(
    channels: List<PlutoChannel>,
    onChannelSelected: (PlutoChannel) -> Unit,
) {
    Column {
        SectionTitle("Live TV · ${channels.size} channels")
        Row(
            modifier = Modifier
                .padding(horizontal = 48.dp)
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            channels.forEach { channel ->
                FocusCard(
                    modifier = Modifier
                        .width(140.dp)
                        .height(168.dp),
                    onClick = { onChannelSelected(channel) },
                ) {
                    Column(
                        Modifier.padding(12.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        // Logo placeholder block — Compose Image with Coil would replace this in a
                        // future pass; for the foundation rebuild we render the channel number/name
                        // so the row is functional even without an image loader dependency.
                        Column(
                            Modifier
                                .height(82.dp),
                            verticalArrangement = Arrangement.Center,
                        ) {
                            Text(
                                channel.number?.let { "Ch. $it" } ?: "LIVE",
                                color = Gold,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Black,
                            )
                        }
                        Text(
                            channel.name,
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            maxLines = 2,
                        )
                        channel.summary?.let {
                            Text(it, color = TextMuted, fontSize = 11.sp, maxLines = 2)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CreatorChannelRow(content: WatchNowContent) {
    Column {
        SectionTitle("Creator Channels")
        Row(Modifier.padding(horizontal = 48.dp), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
            content.creatorChannels.forEach { creator ->
                FocusCard(
                    modifier = Modifier
                        .weight(1f)
                        .height(132.dp),
                    onClick = {},
                ) {
                    Column(Modifier.padding(18.dp)) {
                        Text(creator.name, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black)
                        Text(creator.handle, color = NeonBlue, fontSize = 14.sp)
                        Text(creator.tagline, color = TextMuted, fontSize = 13.sp, maxLines = 2)
                    }
                }
            }
        }
    }
}

@Composable
private fun GuideScreen(content: WatchNowContent?, onVideoSelected: (TreyVideo) -> Unit) {
    Column(Modifier.padding(48.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Guide", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Black)
        Text("Linear guide foundation. Hook this to Trey TV schedule/channel APIs.", color = TextMuted)
        content?.newEpisodes?.forEach { video ->
            FocusCard(modifier = Modifier.height(92.dp), onClick = { onVideoSelected(video) }) {
                Row(Modifier.padding(20.dp)) {
                    Text("Tonight", color = Gold, fontWeight = FontWeight.Black)
                    Spacer(Modifier.padding(18.dp))
                    Text(video.title, color = Color.White, fontSize = 20.sp)
                }
            }
        }
    }
}

@Composable
private fun GamesScreen(games: List<TreyGame>, onGameSelected: (TreyGame) -> Unit) {
    LazyColumn(verticalArrangement = Arrangement.spacedBy(18.dp), modifier = Modifier.padding(horizontal = 48.dp)) {
        item {
            Text("Games", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Black)
            Text("Remote-safe game launcher foundation.", color = TextMuted)
        }
        items(games.size) { index ->
            val game = games[index]
            FocusCard(modifier = Modifier.height(126.dp), onClick = { onGameSelected(game) }) {
                Column(Modifier.padding(20.dp)) {
                    Text(game.title, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                    Text(game.description, color = TextMuted, fontSize = 15.sp)
                    Text(game.status, color = Gold, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
private fun ProfileScreen(profile: TreyProfile?) {
    Column(Modifier.padding(48.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("My Profile", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Black)
        Text("Display name: ${profile?.displayName ?: "Guest"}", color = Color.White, fontSize = 22.sp)
        Text("Public UID: ${profile?.publicProfileUid ?: "Not signed in"}", color = NeonBlue, fontSize = 18.sp)
        Text("Rewards UID: ${profile?.rewardsUid ?: "Unavailable"}", color = Gold, fontSize = 18.sp)
        Text("Handle: ${profile?.handle ?: "Unavailable"}", color = TextMuted)
        Text("Status: ${if (profile?.isAdmin == true) "Admin" else if (profile?.isCreator == true) "Creator" else "Viewer"}", color = TextMuted)
        Text("Accent: ${profile?.accentColor ?: "Default"}", color = TextMuted)
    }
}

@Composable
private fun SettingsScreen(profile: TreyProfile?, onSignOut: () -> Unit) {
    Column(Modifier.padding(48.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
        Text("Settings", color = Color.White, fontSize = 38.sp, fontWeight = FontWeight.Black)
        Text("App version: 0.1.0", color = TextMuted)
        Text("Device diagnostics: Android TV compatible, remote input required, WebView game host enabled.", color = TextMuted)
        Text("Signed in as: ${profile?.displayName ?: "Guest"}", color = Color.White)
        Button(onClick = onSignOut) { Text("Sign out") }
    }
}
