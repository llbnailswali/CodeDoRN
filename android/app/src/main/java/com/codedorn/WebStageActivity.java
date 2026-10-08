package com.codedorn;

import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
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
    /** The overlay never stays up longer than this, even if the page never reports that it is ready. */
    private static final long OVERLAY_MAX_MS = 6000;

    private FrameLayout loadingOverlay;
    /** The theme the stage is currently showing; every (re)application of the bar colors uses it. */
    private boolean stageDark = true;
    private final Handler uiHandler = new Handler(Looper.getMainLooper());
    private final Runnable overlayTimeout = this::hideLoadingOverlay;

    /** The editor's top bar color for a theme: the status bar, navigation bar, window and loading overlay all use it. */
    private static int barColor(boolean dark) {
        return Color.parseColor(dark ? "#0D121D" : "#E8EAF0");
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        boolean dark = getIntent().getBooleanExtra("dark", true);
        // Set before the web view exists, from the theme the app passed in, so the system bars are right from the first frame. (Capacitor's
        // StatusBar plugin is not loaded in this activity: it applied a fixed dark color at startup and the page then switched it.)
        applyStageTheme(dark);

        registerPlugin(NativeScreensPlugin.class);
        super.onCreate(savedInstanceState);

        applyStageTheme(dark);
        // Capacitor's SystemBars plugin (always loaded) POSTS its own styling to the main thread during super.onCreate, so it runs after this
        // method returns: it paints the decor view (which is what shows behind the status bar on Android 15+, where setStatusBarColor is
        // ignored) with its own dark AppCompat theme's window background and picks the bar icons from the SYSTEM night mode. That was the
        // black status bar in light mode. Posting here queues behind it, so the stage theme wins.
        getWindow().getDecorView().post(() -> applyStageTheme(stageDark));
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        if (getBridge() != null && getBridge().getWebView() != null) {
            WebView webView = getBridge().getWebView();
            webView.setAlpha(1f);
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
        }

        showLoadingOverlay(barColor(dark));
    }

    /** Colors the system bars, the window, the web view and the loading overlay for a theme. Called at start and when the stage's theme is toggled. */
    public void applyStageTheme(final boolean dark) {
        stageDark = dark;
        runOnUiThread(() -> {
            int color = barColor(dark);
            getWindow().getDecorView().setBackgroundColor(color);
            getWindow().setBackgroundDrawable(new ColorDrawable(color));
            getWindow().setStatusBarColor(color);
            getWindow().setNavigationBarColor(color);
            WindowInsetsControllerCompat bars = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            bars.setAppearanceLightStatusBars(!dark);
            bars.setAppearanceLightNavigationBars(!dark);
            if (getBridge() != null && getBridge().getWebView() != null) getBridge().getWebView().setBackgroundColor(color);
            if (loadingOverlay != null) loadingOverlay.setBackgroundColor(color);
        });
    }

    /**
     * Covers the web view with the page color and a spinner while the editor loads, so the learner never sees it assemble itself.
     * The page calls NativeScreens.stageReady() once it has rendered and settled; that hides this (see hideLoadingOverlay).
     */
    private void showLoadingOverlay(int pageColor) {
        FrameLayout overlay = new FrameLayout(this);
        overlay.setBackgroundColor(pageColor);
        overlay.setClickable(true); // swallow touches until the page is ready
        ProgressBar spinner = new ProgressBar(this);
        spinner.setIndeterminate(true);
        spinner.getIndeterminateDrawable().setColorFilter(0xFF6366F1, PorterDuff.Mode.SRC_IN);
        int size = (int) (40 * getResources().getDisplayMetrics().density);
        FrameLayout.LayoutParams spinnerParams = new FrameLayout.LayoutParams(size, size, Gravity.CENTER);
        overlay.addView(spinner, spinnerParams);
        addContentView(overlay, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        loadingOverlay = overlay;
        uiHandler.postDelayed(overlayTimeout, OVERLAY_MAX_MS);
    }

    /** Fades the loading overlay out and removes it. Safe to call more than once and from any thread. */
    public void hideLoadingOverlay() {
        runOnUiThread(() -> {
            uiHandler.removeCallbacks(overlayTimeout);
            final FrameLayout overlay = loadingOverlay;
            if (overlay == null) return;
            loadingOverlay = null;
            overlay.animate().alpha(0f).setDuration(180).withEndAction(() -> {
                ViewGroup parent = (ViewGroup) overlay.getParent();
                if (parent != null) parent.removeView(overlay);
            }).start();
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        applyStageTheme(stageDark);
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Capacitor's SystemBars re-applies its own style on a configuration change (this activity handles uiMode itself).
        applyStageTheme(stageDark);
    }

    @Override
    public void onDestroy() {
        uiHandler.removeCallbacks(overlayTimeout);
        super.onDestroy();
    }

    /** Called by the Capacitor plugin when the web stage asks to close/continue. */
    public void handleStageAction(String action) {
        if ("continue".equals(action) && "writeRun".equals(getIntent().getStringExtra("stage")) && !getIntent().getBooleanExtra("tryIt", false)) {
            boolean dark = getIntent().getBooleanExtra("dark", true);
            Intent next = new Intent(this, dark ? WebStageDarkActivity.class : WebStageLightActivity.class)
                    .putExtra("stageLessonKey", getIntent().getStringExtra("stageLessonKey"))
                    .putExtra("stage", "debug")
                    .putExtra("dark", getIntent().getBooleanExtra("dark", true))
                    .putExtra("practice", getIntent().getBooleanExtra("practice", false))
                    .putExtra("tryIt", getIntent().getBooleanExtra("tryIt", false))
                    .putExtra("prefillCode", getIntent().getStringExtra("prefillCode"));
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
