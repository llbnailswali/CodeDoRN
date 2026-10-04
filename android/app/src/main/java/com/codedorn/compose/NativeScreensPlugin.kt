package com.codedorn.compose

import com.codedorn.WebStageActivity
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/** Supplies the stage launch arguments to the web bundle and closes the activity on completion. */
@CapacitorPlugin(name = "NativeScreens")
class NativeScreensPlugin : Plugin() {
    @PluginMethod
    fun getStageLaunch(call: PluginCall) {
        val result = JSObject()
        val intent = activity.intent
        if (activity is WebStageActivity && intent?.hasExtra("stageLessonKey") == true) {
            result.put("lessonKey", intent.getStringExtra("stageLessonKey"))
            result.put("stage", intent.getStringExtra("stage"))
            result.put("dark", intent.getBooleanExtra("dark", true))
            result.put("practice", intent.getBooleanExtra("practice", false))
        }
        call.resolve(result)
    }

    /** The web page has rendered and settled: remove the loading overlay. */
    @PluginMethod
    fun stageReady(call: PluginCall) {
        (activity as? WebStageActivity)?.hideLoadingOverlay()
        call.resolve()
    }

    /** The stage's theme changed: recolor the system bars and window to match. */
    @PluginMethod
    fun setStageTheme(call: PluginCall) {
        (activity as? WebStageActivity)?.applyStageTheme(call.getBoolean("dark", true) ?: true)
        call.resolve()
    }

    @PluginMethod
    fun closeStage(call: PluginCall) {
        val host = activity
        if (host is WebStageActivity) {
            host.handleStageAction(call.getString("action") ?: "back")
        }
        call.resolve()
    }
}
