package com.treytv.tv.data

import com.treytv.tv.BuildConfig

data class TreyTvConfig(
    val apiBaseUrl: String = BuildConfig.TREY_TV_API_BASE_URL,
    val webBaseUrl: String = BuildConfig.TREY_TV_WEB_BASE_URL,
    val supabaseUrl: String = BuildConfig.TREY_TV_SUPABASE_URL,
    val supabaseAnonKey: String = BuildConfig.TREY_TV_SUPABASE_ANON_KEY,
) {
    val hasSupabaseConfig: Boolean
        get() = supabaseUrl.isNotBlank() && supabaseAnonKey.isNotBlank()
}
