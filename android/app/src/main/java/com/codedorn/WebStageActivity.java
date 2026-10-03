package com.codedorn;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.content.Intent;
import android.view.View;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.codedorn.compose.NativeScreensPlugin;
import com.getcapacitor.BridgeActivity;

/** Hosts the CodeDo web UI for a lesson's Write & Run or Debug stage. */
public class WebStageActivity extends BridgeActivity {
    private static final int DEBUG_REQUEST = 4722;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        boolean dark = getIntent().getBooleanExtra("dark", true);
        int pageColor = Color.parseColor(dark ? "#0F131D" : "#F1F4F9");
        getWindow().setBackgroundDrawable(new ColorDrawable(pageColor));
        getWindow().setStatusBarColor(pageColor);
        getWindow().setNavigationBarColor(pageColor);
        WindowInsetsControllerCompat bars = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        bars.setAppearanceLightStatusBars(!dark);
        bars.setAppearanceLightNavigationBars(!dark);

        registerPlugin(NativeScreensPlugin.class);
        super.onCreate(savedInstanceState);

        getWindow().setBackgroundDrawable(new ColorDrawable(pageColor));
        getWindow().setStatusBarColor(pageColor);
        getWindow().setNavigationBarColor(pageColor);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(pageColor);
            webView.setAlpha(1f);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
        }
    }

    /** Called by the Capacitor plugin when the web stage asks to close/continue. */
    public void handleStageAction(String action) {
        if ("continue".equals(action) && "writeRun".equals(getIntent().getStringExtra("stage"))) {
            Intent next = new Intent(this, WebStageActivity.class)
                    .putExtra("stageLessonKey", getIntent().getStringExtra("stageLessonKey"))
                    .putExtra("stage", "debug")
                    .putExtra("dark", getIntent().getBooleanExtra("dark", true))
                    .putExtra("practice", getIntent().getBooleanExtra("practice", false));
            startActivityForResult(next, DEBUG_REQUEST);
            return;
        }

        setResult(RESULT_OK, new Intent().putExtra("action", action));
        finish();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != DEBUG_REQUEST) return;

        String action = resultCode == RESULT_OK && data != null
                ? data.getStringExtra("action") : "back";

        // Back from stage 5 leaves stage 4 visible and active.
        if ("back".equals(action)) return;

        // The RN caller needs to continue after stage 5, not open stage 5 again.
        setResult(RESULT_OK, new Intent().putExtra("action", "continue_debug"));
        finish();
    }
}
