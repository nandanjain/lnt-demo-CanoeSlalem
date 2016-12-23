package lnt.cisco.ibc.com.webview;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import com.google.android.exoplayer2.ui.SimpleExoPlayerView;

public class MainActivity extends Activity {
    WebView myWebView;
    boolean goBack = false;
    Float xPos, yPos;
    PlayerActivity player;
    SimpleExoPlayerView playerView;
    Handler handler;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        this.requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.activity_main);

        player = new PlayerActivity(this);
        playerView = (SimpleExoPlayerView) this.findViewById(R.id.player_activity);
        //Hide Playback controls
        player.onCreate(playerView);

        String url = "file:///android_asset/www/app/index.html";
        myWebView = (WebView) this.findViewById(R.id.webView);
        myWebView.clearCache(true);
        WebChromeClient webChromeClient = new WebChromeClient();
        myWebView.setWebChromeClient(webChromeClient);
        myWebView.getSettings().setUseWideViewPort(true);
        myWebView.getSettings().setAppCacheEnabled(false);
        myWebView.getSettings().setDatabaseEnabled(false);
        myWebView.getSettings().setJavaScriptEnabled(true);
        myWebView.getSettings().setAllowUniversalAccessFromFileURLs(true);
//        myWebView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        myWebView.addJavascriptInterface(new WebAppInterface(this), "ANDROID_API");
        myWebView.setOnTouchListener(new MyOnTouchListener());
        myWebView.setBackgroundColor(Color.TRANSPARENT);
        myWebView.setInitialScale(50);
        getIntent().setAction("Already created");
        myWebView.loadUrl(url);

        handler = new Handler(Looper.getMainLooper(), new UICallback());
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onResume() {
        Log.d("Example", "onResume");

        String action = getIntent().getAction();
        // Prevent endless loop by adding a unique action, don't restart if action is present
        if (action == null || !action.equals("Already created")) {
            Log.d("Example", "Force restart");
            myWebView.reload();
        }
        // Remove the unique action so the next time onResume is called it will restart
        else
            getIntent().setAction(null);
        super.onResume();
        player.onResume();
    }

    @Override
    protected void onStop() {
        super.onStop();
        player.onStop();
    }

    @Override
    public void onBackPressed() {
        Log.d("OnBackPressed", " !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        myWebView.loadUrl("javascript:keyCodeDown('back')");
        if (goBack) super.onBackPressed();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
    }

    // Class to enable swipe actions on tabs and phone
    private class MyOnTouchListener implements View.OnTouchListener {
        @Override
        public boolean onTouch(View v, MotionEvent event) {
            boolean consume = false;
            switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    xPos = event.getX();
                    yPos = event.getY();
                    Log.d("Movement : ", xPos + " : " + yPos);
                    break;
                case MotionEvent.ACTION_MOVE:
                    break;
                case MotionEvent.ACTION_UP:
                    Float xDiff, yDiff;
                    xDiff = xPos - event.getX();
                    yDiff = yPos - event.getY();
                    Log.d("Movement : X -> ", xPos + " : " + event.getX() + " : Y -> " + yPos + " : " + event.getY());
                    if (Math.abs(xDiff - yDiff) > 100) {
                        Log.d("Movement : ", "Move Left/Right");
                        if (xDiff > 80) {
                            myWebView.loadUrl("javascript:keyCodeDown('right')");
                        } else if (xDiff < -80) {
                            myWebView.loadUrl("javascript:keyCodeDown('left')");
                        }
                    } else if (Math.abs(xDiff) < 20 && Math.abs(yDiff) < 20) {
                        Log.d("Movement : ", "Select");
                        myWebView.loadUrl("javascript:keyCodeDown('select')");
                    } else {
                        Log.e("Movement : ", "Move Top/Down - Ignore");
                    }
            }
            return true;
        }
    }

    private final class UICallback implements Handler.Callback {
        @Override
        public boolean handleMessage(Message msg) {
            Log.e("HandlerMessage", "New Message Received from the JS ---- " + msg.getData() + " : " + msg.what);
            switch (msg.what) {
                case View.GONE:
                    Log.e("HandleMessage", "Hide WebView and Focus Video");
                    myWebView.setVisibility(View.GONE);
                    playerView.requestFocus();
                    break;
                case View.VISIBLE:
                    Log.e("HandleMessage", "Show WebView and Focus it");
                    myWebView.setVisibility(View.VISIBLE);
                    myWebView.requestFocus();
                    break;
                case PlayerActivity.ENDED:
                    Log.e("HandleMessage", "Current Video ended");
                    myWebView.setVisibility(View.VISIBLE);
//                    myWebView.loadUrl("javascript:keyCodeDown('back')");
                    myWebView.requestFocus();
                    break;
            }
            return true;
        }
    }

    //Class to be injected in Web page
    private class WebAppInterface {
        Context mContext;
        WebAppInterface(Context c) {
            mContext = c;
        }

        @JavascriptInterface
        public void moveToNextScreen() {
            goBack = true;
            MainActivity.this.finish();
        }

        @JavascriptInterface
        public void goToVideo(){
            handler.sendEmptyMessage(View.GONE);
        }

        @JavascriptInterface
        public void launchMenu(){
            handler.sendEmptyMessage(View.VISIBLE);
        }

        @JavascriptInterface
        public void playURLs(String url, boolean isLive) {
            Intent intent = new Intent(mContext, PlayerActivity.class);
            intent.setAction(PlayerActivity.ACTION_PLAY_VIDEO);
            intent.putExtra(PlayerActivity.VIDEO_URL, url);
            intent.setData(Uri.parse(url));
            Log.e("PlayURL", url);
            player.onStart(intent);
            handler.sendEmptyMessage(isLive ? View.VISIBLE : View.GONE);
        }
    }
}
