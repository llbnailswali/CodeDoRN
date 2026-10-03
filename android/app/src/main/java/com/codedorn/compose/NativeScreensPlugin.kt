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

    @PluginMethod
    fun closeStage(call: PluginCall) {
        val host = activity
        if (host is WebStageActivity) {
            host.handleStageAction(call.getString("action") ?: "back")
        }
        call.resolve()
    }
}
