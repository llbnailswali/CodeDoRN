package com.codedorn.reactnative

import android.app.Activity
import android.content.Intent
import com.codedorn.WebStageActivity
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
            Intent(activity, WebStageActivity::class.java)
                .putExtra("stageLessonKey", lessonKey)
                .putExtra("stage", stage)
                .putExtra("dark", dark)
                .putExtra("practice", practice),
            REQUEST,
        )
    }

    private companion object {
        const val REQUEST = 4721
    }
}

class WebStagePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> = listOf(WebStageModule(reactContext))
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
