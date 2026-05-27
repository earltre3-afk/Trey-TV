package com.treytv.tv.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.Composable
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.MaterialTheme
import androidx.tv.material3.darkColorScheme

val Midnight = androidx.compose.ui.graphics.Color(0xFF05040A)
val Glass = androidx.compose.ui.graphics.Color(0xFF12111E)
val NeonBlue = androidx.compose.ui.graphics.Color(0xFF22D3EE)
val NeonPurple = androidx.compose.ui.graphics.Color(0xFFA855F7)
val NeonMagenta = androidx.compose.ui.graphics.Color(0xFFEC4899)
val Gold = androidx.compose.ui.graphics.Color(0xFFFFC857)
val TextPrimary = androidx.compose.ui.graphics.Color(0xFFF8FAFC)
val TextMuted = androidx.compose.ui.graphics.Color(0xFFA1A1AA)

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun TreyTvTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors = darkColorScheme(
        primary = Gold,
        secondary = NeonBlue,
        tertiary = NeonMagenta,
        background = Midnight,
        surface = Glass,
        onPrimary = Midnight,
        onSecondary = Midnight,
        onBackground = TextPrimary,
        onSurface = TextPrimary,
    )

    MaterialTheme(
        colorScheme = colors,
        content = content,
    )
}
