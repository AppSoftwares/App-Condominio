package com.caminos.lagunita;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Force background color to avoid black screen on some devices/sharing tools
        try {
            WebView webView = this.getBridge().getWebView();
            webView.setBackgroundColor(Color.WHITE);
        } catch (Exception e) {
            // bridge might not be ready yet
        }
    }
}
