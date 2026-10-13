package com.codedorn

import android.app.Application
import android.preference.PreferenceManager
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.codedorn.reactnative.WebStagePackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(WebStagePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // The Android emulator currently cannot reach the host through 10.0.2.2 in
    // this setup. Keep the RN dev server on the adb reverse tunnel instead.
    if (BuildConfig.DEBUG) {
      PreferenceManager.getDefaultSharedPreferences(this)
        .edit()
        .putString("debug_http_host", "localhost:8081")
        .apply()
    }
    loadReactNative(this)
  }
}
