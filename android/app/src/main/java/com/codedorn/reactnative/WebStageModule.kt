package com.codedorn.reactnative

import android.app.Activity
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.webkit.WebView
import com.codedorn.WebStageDarkActivity
import com.codedorn.WebStageLightActivity
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

/** Opens the Capacitor-backed Stage 4/5 activity and returns its final action to JavaScript. */
class WebStageModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var pending: Promise? = null

    private val listener: ActivityEventListener = object : BaseActivityEventListener() {
        override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
            if (requestCode != REQUEST) return
            val action = if (resultCode == Activity.RESULT_OK) data?.getStringExtra("action") ?: "back" else "back"
            pending?.resolve(action)
            pending = null
        }
    }

    init {
        reactContext.addActivityEventListener(listener)
    }

    override fun getName() = "WebStage"

    // A throwaway WebView, created ahead of the stage. Every WebView in the app shares one browser (renderer) process, so having one
    // alive means the real stage's WebView does not pay for starting the browser engine when it opens.
    private val main = Handler(Looper.getMainLooper())
    private var warm: WebView? = null
    private val releaseWarm = Runnable { discardWarm() }

    private fun discardWarm() {
        main.removeCallbacks(releaseWarm)
        warm?.destroy()
        warm = null
    }

    /** Starts the browser engine early. Called when a lesson screen opens; safe to call repeatedly. */
    @ReactMethod
    fun warmUp() {
        main.post {
            main.removeCallbacks(releaseWarm)
            if (warm == null) {
                try {
                    warm = WebView(reactContext.applicationContext).also { it.loadUrl("about:blank") }
                } catch (_: Throwable) {
                    // No WebView available (or it failed to start): opening the stage just starts the engine itself.
                }
            }
            // Do not hold the engine forever if the learner never opens an editor stage.
            main.postDelayed(releaseWarm, WARM_KEEP_MS)
        }
    }

    @ReactMethod
    fun open(lessonKey: String, stage: String, dark: Boolean, practice: Boolean, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("no_activity", "No activity is available to open the stage.")
            return
        }

        pending?.resolve("back")
        pending = promise
        activity.startActivityForResult(
            // One activity per theme: its manifest theme colors the status bar and window before the web view has started.
            Intent(activity, if (dark) WebStageDarkActivity::class.java else WebStageLightActivity::class.java)
                .putExtra("stageLessonKey", lessonKey)
                .putExtra("stage", stage)
                .putExtra("dark", dark)
                .putExtra("practice", practice),
            REQUEST,
        )
        // The stage's own WebView now keeps the engine alive; release the warm-up one shortly after it has started.
        main.postDelayed(releaseWarm, 3000)
    }

    private companion object {
        const val REQUEST = 4721
        const val WARM_KEEP_MS = 120_000L
    }
}

class WebStagePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = listOf(WebStageModule(reactContext))
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
