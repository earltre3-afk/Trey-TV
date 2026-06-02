import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

fun androidStringConfigValue(name: String, defaultValue: String): String {
    val value = providers.gradleProperty(name)
        .orElse(providers.environmentVariable(name))
        .orElse(defaultValue)
        .get()
    return "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""
}

// Release signing config is loaded from keystore.properties at the project
// root (gitignored). See apps/trey-tv-tv/keystore-setup.md for one-time setup.
// If the file is absent we still build, but release tasks will warn and
// produce an unsigned APK that won't install on Play Store / Amazon.
val keystoreProps = Properties().apply {
    val file = rootProject.file("keystore.properties")
    if (file.exists()) {
        file.inputStream().use { load(it) }
    }
}

fun keystoreProperty(key: String): String? =
    keystoreProps.getProperty(key)
        ?: System.getenv("TREYTV_$key")?.takeIf { it.isNotBlank() }

val releaseKeystorePath = keystoreProperty("RELEASE_STORE_FILE")
val releaseStorePassword = keystoreProperty("RELEASE_STORE_PASSWORD")
val releaseKeyAlias = keystoreProperty("RELEASE_KEY_ALIAS")
val releaseKeyPassword = keystoreProperty("RELEASE_KEY_PASSWORD")
val hasReleaseSigning =
    !releaseKeystorePath.isNullOrBlank() &&
    !releaseStorePassword.isNullOrBlank() &&
    !releaseKeyAlias.isNullOrBlank() &&
    !releaseKeyPassword.isNullOrBlank()

android {
    namespace = "com.treytv.tv"
    compileSdk = 35
    buildToolsVersion = "35.0.0"

    defaultConfig {
        applicationId = "com.treytv.streamingbox"
        minSdk = 23
        targetSdk = 35
        versionCode = 2
        versionName = "0.2.0"

        buildConfigField("String", "TREY_TV_API_BASE_URL", androidStringConfigValue("TREY_TV_API_BASE_URL", "https://tv.treytrizzy.com"))
        buildConfigField("String", "TREY_TV_WEB_BASE_URL", androidStringConfigValue("TREY_TV_WEB_BASE_URL", "https://tv.treytrizzy.com"))
        buildConfigField("String", "TREY_TV_SUPABASE_URL", androidStringConfigValue("TREY_TV_SUPABASE_URL", ""))
        buildConfigField("String", "TREY_TV_SUPABASE_ANON_KEY", androidStringConfigValue("TREY_TV_SUPABASE_ANON_KEY", ""))
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(releaseKeystorePath!!)
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
                enableV1Signing = true
                enableV2Signing = true
                enableV3Signing = true
                enableV4Signing = true
            }
        }
    }

    buildTypes {
        debug {
            // Debug builds keep the auto-generated debug keystore. Useful for
            // sideloading during development.
            isMinifyEnabled = false
            versionNameSuffix = "-debug"
        }
        release {
            // R8 + resource shrinking. Cuts APK size and obfuscates Kotlin.
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            } else {
                logger.warn(
                    "[trey-tv-tv] No release signing config found. " +
                    "Release builds will be unsigned. See apps/trey-tv-tv/keystore-setup.md."
                )
            }
        }
    }

    // App Bundle splits (required for Play Store, recommended for Amazon).
    bundle {
        language { enableSplit = true }
        density { enableSplit = true }
        abi { enableSplit = true }
    }

    // Strip unused native libs / debug symbols from release.
    packaging {
        resources.excludes += setOf(
            "META-INF/AL2.0",
            "META-INF/LGPL2.1",
            "META-INF/*.kotlin_module",
            "DebugProbesKt.bin",
        )
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    lint {
        abortOnError = true
        warningsAsErrors = false
        checkDependencies = true
        // Don't fail the build on missing translations during early iteration.
        disable += setOf("MissingTranslation")
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.runtime:runtime")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.tv:tv-foundation:1.0.0")
    implementation("androidx.tv:tv-material:1.0.0")

    implementation("androidx.media3:media3-exoplayer:1.5.0")
    implementation("androidx.media3:media3-exoplayer-hls:1.5.0")
    implementation("androidx.media3:media3-ui:1.5.0")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
