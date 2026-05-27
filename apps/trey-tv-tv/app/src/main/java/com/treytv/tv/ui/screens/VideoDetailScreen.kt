package com.treytv.tv.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.Button
import androidx.tv.material3.Text
import com.treytv.tv.data.TreyVideo
import com.treytv.tv.ui.components.FocusCard
import com.treytv.tv.ui.components.LabelPill
import com.treytv.tv.ui.components.NeonBackground
import com.treytv.tv.ui.components.RemoteHint
import com.treytv.tv.ui.theme.Gold
import com.treytv.tv.ui.theme.TextMuted

@Composable
fun VideoDetailScreen(
    video: TreyVideo,
    onBack: () -> Unit,
    onPlay: () -> Unit,
) {
    NeonBackground {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(64.dp),
            horizontalArrangement = Arrangement.spacedBy(34.dp),
        ) {
            Column(Modifier.weight(1f)) {
                LabelPill(video.durationLabel)
                Spacer(Modifier.height(26.dp))
                Text(video.title, color = Color.White, fontSize = 48.sp, fontWeight = FontWeight.Black)
                Text("${video.creatorName} · ${video.channelName}", color = Gold, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(16.dp))
                Text(video.description, color = TextMuted, fontSize = 19.sp, lineHeight = 28.sp)
                Spacer(Modifier.height(24.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    Button(onClick = onPlay) { Text("Play") }
                    Button(onClick = { }) { Text("Save") }
                    Button(onClick = onBack) { Text("Back") }
                }
                Spacer(Modifier.height(22.dp))
                RemoteHint("Select plays. Back returns to Watch Now.")
            }
            FocusCard(
                modifier = Modifier
                    .weight(0.8f)
                    .height(360.dp),
                onClick = onPlay,
            ) {
                Column(Modifier.padding(32.dp)) {
                    Text("Preview", color = TextMuted, fontSize = 16.sp)
                    Spacer(Modifier.height(120.dp))
                    Text("Media3-ready", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Black)
                    Text("HLS / MP4 playback", color = TextMuted)
                }
            }
        }
    }
}
