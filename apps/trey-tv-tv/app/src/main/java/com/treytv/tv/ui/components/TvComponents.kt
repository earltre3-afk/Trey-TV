package com.treytv.tv.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.key.Key
import androidx.compose.ui.input.key.KeyEventType
import androidx.compose.ui.input.key.key
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.key.type
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.Text
import com.treytv.tv.data.TreyVideo
import com.treytv.tv.ui.theme.Glass
import com.treytv.tv.ui.theme.Gold
import com.treytv.tv.ui.theme.NeonBlue
import com.treytv.tv.ui.theme.NeonMagenta
import com.treytv.tv.ui.theme.NeonPurple
import com.treytv.tv.ui.theme.TextMuted

@Composable
fun NeonBackground(content: @Composable () -> Unit) {
    Box(
        modifier = Modifier
            .background(
                Brush.radialGradient(
                    colors = listOf(NeonPurple.copy(alpha = 0.22f), Color.Transparent),
                    radius = 900f,
                ),
            )
            .background(
                Brush.linearGradient(
                    colors = listOf(Color(0xFF05040A), Color(0xFF080714), Color(0xFF05040A)),
                ),
            ),
    ) {
        content()
    }
}

@Composable
fun SectionTitle(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title,
        modifier = modifier.padding(start = 48.dp, bottom = 12.dp),
        color = MaterialTheme.colorScheme.onBackground,
        fontSize = 24.sp,
        fontWeight = FontWeight.Black,
    )
}

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun VideoRow(
    title: String,
    videos: List<TreyVideo>,
    onVideoSelected: (TreyVideo) -> Unit,
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        SectionTitle(title)
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(18.dp),
            contentPadding = PaddingValues(horizontal = 48.dp),
        ) {
            items(videos, key = { it.id }) { video ->
                FocusCard(
                    modifier = Modifier
                        .width(280.dp)
                        .height(168.dp),
                    onClick = { onVideoSelected(video) },
                ) {
                    Column(Modifier.padding(18.dp)) {
                        LabelPill(video.durationLabel)
                        Spacer(Modifier.height(34.dp))
                        Text(
                            text = video.title,
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = video.creatorName,
                            color = TextMuted,
                            fontSize = 13.sp,
                            maxLines = 1,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun FocusCard(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    content: @Composable () -> Unit,
) {
    var focused by remember { mutableStateOf(false) }
    val borderColor by animateColorAsState(if (focused) Gold else Color.White.copy(alpha = 0.12f), label = "cardBorder")
    val glow = if (focused) 18.dp else 0.dp

    Box(
        modifier = modifier
            .onFocusChanged { focused = it.isFocused }
            .shadow(glow, RoundedCornerShape(24.dp), clip = false)
            .clip(RoundedCornerShape(24.dp))
            .background(Glass.copy(alpha = 0.88f))
            .background(
                Brush.linearGradient(
                    listOf(
                        NeonBlue.copy(alpha = 0.16f),
                        NeonPurple.copy(alpha = 0.12f),
                        NeonMagenta.copy(alpha = 0.10f),
                    ),
                ),
            )
            .border(if (focused) 2.dp else 1.dp, borderColor, RoundedCornerShape(24.dp))
            .focusable()
            .onKeyEvent { event ->
                if (event.type == KeyEventType.KeyUp && (event.key == Key.DirectionCenter || event.key == Key.Enter)) {
                    onClick()
                    true
                } else {
                    false
                }
            }
            .clickable(onClick = onClick),
    ) {
        content()
    }
}

@Composable
fun LabelPill(text: String) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(Color.Black.copy(alpha = 0.46f))
            .border(1.dp, Gold.copy(alpha = 0.55f), RoundedCornerShape(999.dp))
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(text = text, color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun RemoteHint(text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(RoundedCornerShape(99.dp))
                .background(NeonBlue),
        )
        Spacer(Modifier.width(8.dp))
        Text(text = text, color = TextMuted, fontSize = 13.sp)
    }
}

@Composable
fun FocusableGlassButton(
    text: String,
    modifier: Modifier = Modifier,
    primary: Boolean = false,
    onClick: () -> Unit,
) {
    var focused by remember { mutableStateOf(false) }
    val border = if (focused) Gold else Color.White.copy(alpha = 0.15f)
    val fill = if (primary) Gold else Glass.copy(alpha = 0.75f)
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(18.dp))
            .background(fill)
            .border(2.dp, border, RoundedCornerShape(18.dp))
            .onFocusChanged { focused = it.isFocused }
            .focusable()
            .clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 14.dp),
    ) {
        Text(
            text = text,
            color = if (primary) Color.Black else Color.White,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black,
        )
    }
}
