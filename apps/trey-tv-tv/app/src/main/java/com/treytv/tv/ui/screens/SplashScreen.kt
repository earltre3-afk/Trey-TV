package com.treytv.tv.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import com.treytv.tv.R
import com.treytv.tv.ui.components.NeonBackground
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(onFinished: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(1400)
        onFinished()
    }

    // Intro: the official Trey TV logo on the cinematic neon backdrop
    // (replaces the old "TREY TV" gold-text placeholder screen).
    NeonBackground {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
        ) {
            Image(
                painter = painterResource(R.drawable.trey_tv_logo),
                contentDescription = "Trey TV",
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxWidth(0.55f),
            )
        }
    }
}
