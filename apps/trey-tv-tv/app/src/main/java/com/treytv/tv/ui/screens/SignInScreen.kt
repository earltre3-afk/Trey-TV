package com.treytv.tv.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.material3.OutlinedTextField
import androidx.tv.material3.Button
import androidx.tv.material3.ExperimentalTvMaterial3Api
import androidx.tv.material3.Text
import com.treytv.tv.data.DeviceLoginStart
import com.treytv.tv.data.DeviceLoginStatus
import com.treytv.tv.data.TreyProfile
import com.treytv.tv.data.TreyTvApiService
import com.treytv.tv.ui.components.NeonBackground
import com.treytv.tv.ui.theme.Glass
import com.treytv.tv.ui.theme.Gold
import com.treytv.tv.ui.theme.NeonBlue
import com.treytv.tv.ui.theme.TextMuted
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalTvMaterial3Api::class)
@Composable
fun SignInScreen(
    api: TreyTvApiService,
    onSignedIn: (TreyProfile) -> Unit,
    onSkip: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var deviceLogin by remember { mutableStateOf<DeviceLoginStart?>(null) }
    var message by remember { mutableStateOf("Use your remote to choose a sign-in path.") }

    LaunchedEffect(Unit) {
        message = "Requesting a TV sign-in code..."
        api.startDeviceLogin()
            .onSuccess {
                deviceLogin = it
                message = "Waiting for approval from your phone or browser."
            }
            .onFailure { message = it.message ?: "Could not start TV sign-in." }
    }

    LaunchedEffect(deviceLogin?.deviceCode) {
        val login = deviceLogin ?: return@LaunchedEffect
        while (true) {
            delay((login.pollingIntervalSeconds.coerceAtLeast(3) * 1000).toLong())
            when (val status = api.pollDeviceLogin(login.deviceCode).getOrNull()) {
                is DeviceLoginStatus.Approved -> {
                    message = "TV linked. Loading your profile..."
                    api.loadProfile(status.accessToken)
                        .onSuccess(onSignedIn)
                        .onFailure { message = it.message ?: "Linked, but profile could not be loaded." }
                    break
                }
                DeviceLoginStatus.Expired -> {
                    message = "That TV code expired. Start a new code to try again."
                    break
                }
                DeviceLoginStatus.Denied -> {
                    message = "That TV sign-in request was denied."
                    break
                }
                DeviceLoginStatus.Pending, null -> message = "Still waiting for approval..."
            }
        }
    }

    NeonBackground {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 72.dp, vertical = 56.dp),
            horizontalArrangement = Arrangement.spacedBy(36.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text("Sign in to Trey TV", color = Color.White, fontSize = 44.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(12.dp))
                Text(
                    "Sync your UID, profile, watch history, rewards, and TV-ready game progress.",
                    color = TextMuted,
                    fontSize = 18.sp,
                    lineHeight = 26.sp,
                )
                Spacer(Modifier.height(32.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(22.dp)) {
                    PlaceholderQr(url = deviceLogin?.verificationUrl ?: "Loading TV login...")
                    Column {
                        Text("Short code", color = TextMuted, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(deviceLogin?.userCode ?: "----", color = Gold, fontSize = 34.sp, fontWeight = FontWeight.Black)
                        Spacer(Modifier.height(12.dp))
                        Text("Go to ${deviceLogin?.verificationUrl ?: "treytv.com/tv/activate"} and enter this code.", color = TextMuted, fontSize = 14.sp)
                        Spacer(Modifier.height(12.dp))
                        Button(
                            onClick = {
                                scope.launch {
                                    message = "Requesting a new TV sign-in code..."
                                    api.startDeviceLogin()
                                        .onSuccess {
                                            deviceLogin = it
                                            message = "Waiting for approval from your phone or browser."
                                        }
                                        .onFailure { message = it.message ?: "Could not start TV sign-in." }
                                }
                            },
                        ) { Text("New Code") }
                    }
                }
            }

            Column(
                modifier = Modifier
                    .width(420.dp)
                    .background(Glass.copy(alpha = 0.82f), RoundedCornerShape(28.dp))
                    .border(BorderStroke(1.dp, Color.White.copy(alpha = 0.12f)), RoundedCornerShape(28.dp))
                    .padding(28.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Text("Email fallback", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
                Text("Device login is preferred on TV. Email can be wired later if the live API supports it.", color = TextMuted, fontSize = 13.sp)
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Email") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = { Text("Password") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                )
                Button(
                    onClick = {
                        scope.launch {
                            message = "Signing in..."
                            api.signInWithEmail(email, password)
                                .onSuccess(onSignedIn)
                                .onFailure { message = it.message ?: "Sign-in failed." }
                        }
                    },
                ) { Text("Sign In") }
                Button(onClick = onSkip) { Text("Continue with sample content") }
                Text(message, color = TextMuted, fontSize = 13.sp)
            }
        }
    }
}

@Composable
private fun PlaceholderQr(url: String) {
    Box(
        modifier = Modifier
            .size(180.dp)
            .background(Color.White, RoundedCornerShape(18.dp))
            .padding(16.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(96.dp)
                    .background(Color.Black)
                    .border(8.dp, Color.White),
            )
            Spacer(Modifier.height(10.dp))
            Text("QR placeholder", color = Color.Black, fontSize = 12.sp, fontWeight = FontWeight.Black)
            Text(url, color = NeonBlue, fontSize = 8.sp, maxLines = 2)
        }
    }
}
