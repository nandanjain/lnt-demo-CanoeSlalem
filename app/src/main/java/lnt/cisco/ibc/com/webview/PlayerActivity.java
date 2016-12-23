package lnt.cisco.ibc.com.webview;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import com.google.android.exoplayer2.C;
import com.google.android.exoplayer2.DefaultLoadControl;
import com.google.android.exoplayer2.ExoPlaybackException;
import com.google.android.exoplayer2.ExoPlayer;
import com.google.android.exoplayer2.ExoPlayerFactory;
import com.google.android.exoplayer2.SimpleExoPlayer;
import com.google.android.exoplayer2.Timeline;
import com.google.android.exoplayer2.drm.DrmSessionManager;
import com.google.android.exoplayer2.drm.FrameworkMediaCrypto;
import com.google.android.exoplayer2.drm.FrameworkMediaDrm;
import com.google.android.exoplayer2.drm.HttpMediaDrmCallback;
import com.google.android.exoplayer2.drm.StreamingDrmSessionManager;
import com.google.android.exoplayer2.drm.UnsupportedDrmException;
import com.google.android.exoplayer2.extractor.DefaultExtractorsFactory;
import com.google.android.exoplayer2.mediacodec.MediaCodecRenderer;
import com.google.android.exoplayer2.mediacodec.MediaCodecUtil;
import com.google.android.exoplayer2.source.ConcatenatingMediaSource;
import com.google.android.exoplayer2.source.ExtractorMediaSource;
import com.google.android.exoplayer2.source.LoopingMediaSource;
import com.google.android.exoplayer2.source.MediaSource;
import com.google.android.exoplayer2.source.dash.DashMediaSource;
import com.google.android.exoplayer2.source.dash.DefaultDashChunkSource;
import com.google.android.exoplayer2.source.hls.HlsMediaSource;
import com.google.android.exoplayer2.source.smoothstreaming.DefaultSsChunkSource;
import com.google.android.exoplayer2.source.smoothstreaming.SsMediaSource;
import com.google.android.exoplayer2.trackselection.AdaptiveVideoTrackSelection;
import com.google.android.exoplayer2.trackselection.DefaultTrackSelector;
import com.google.android.exoplayer2.trackselection.MappingTrackSelector;
import com.google.android.exoplayer2.trackselection.TrackSelection;
import com.google.android.exoplayer2.trackselection.TrackSelections;
import com.google.android.exoplayer2.trackselection.TrackSelector;
import com.google.android.exoplayer2.ui.PlaybackControlView;
import com.google.android.exoplayer2.ui.SimpleExoPlayerView;
import com.google.android.exoplayer2.upstream.DataSource;
import com.google.android.exoplayer2.upstream.DefaultBandwidthMeter;
import com.google.android.exoplayer2.upstream.HttpDataSource;
import com.google.android.exoplayer2.util.Util;

import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.util.Map;
import java.util.UUID;

public class PlayerActivity implements View.OnClickListener, ExoPlayer.EventListener,
        TrackSelector.EventListener<MappingTrackSelector.MappedTrackInfo>, PlaybackControlView.VisibilityListener{

    public static final String ACTION_PLAY_VIDEO = "com.google.android.exoplayer.action.PLAY_VIDEO";
    public static final String VIDEO_URL = "VIDEO_URL";
    public static final int ENDED = 2;

    private static final DefaultBandwidthMeter BANDWIDTH_METER = new DefaultBandwidthMeter();
    private static final CookieManager DEFAULT_COOKIE_MANAGER;
    static {
        DEFAULT_COOKIE_MANAGER = new CookieManager();
        DEFAULT_COOKIE_MANAGER.setCookiePolicy(CookiePolicy.ACCEPT_ORIGINAL_SERVER);
    }
    private Handler mainHandler;
    private Timeline.Window window;
    private EventLogger eventLogger;
    private SimpleExoPlayerView simpleExoPlayerView;

    private DataSource.Factory mediaDataSourceFactory;
    private SimpleExoPlayer player;
    private MappingTrackSelector trackSelector;
//    private TrackSelectionHelper trackSelectionHelper;
//    private DebugTextViewHelper debugViewHelper;
    private boolean playerNeedsSource;

    private boolean shouldAutoPlay;
    private boolean isTimelineStatic;
    private int playerWindow;
    private long playerPosition;
    private Activity mainActivity;

    public PlayerActivity(Activity main){
        this.mainActivity = main;
    }

    public void onCreate(SimpleExoPlayerView playerView) {
        shouldAutoPlay = true;
        mediaDataSourceFactory = buildDataSourceFactory(true);
        mainHandler = new Handler();
        window = new Timeline.Window();
        if (CookieHandler.getDefault() != DEFAULT_COOKIE_MANAGER) {
            CookieHandler.setDefault(DEFAULT_COOKIE_MANAGER);
        }
        simpleExoPlayerView = playerView;
        simpleExoPlayerView.setUseController(false);
        simpleExoPlayerView.setControllerVisibilityListener(this);
        initializePlayer(null);
    }
    public void onNewIntent(Intent intent) {
        releasePlayer();
        isTimelineStatic = false;
//        setIntent(intent);
    }
    public void onStart(Intent intent) {
//        simpleExoPlayerView.requestFocus();

//        super.onStart();
        if (Util.SDK_INT >= 23) {
            initializePlayer(intent);
        }
//        simpleExoPlayerView.setVisibility(View.VISIBLE);
    }
    public void onResume() {
//        super.onResume();
        if ((Util.SDK_INT <= 23 || player == null)) {
//            initializePlayer();
        }
    }
    public void onPause() {
//        super.onPause();
        if (Util.SDK_INT <= 23) {
            releasePlayer();
        }
    }
    public void onStop() {
//        super.onStop();
        if (Util.SDK_INT >= 23) {
            releasePlayer();
        }
    }

    @Override
    public void onClick(View view) {
//        if (view == retryButton) {
//            initializePlayer();
//        } else if (view.getParent() == debugRootView) {
//            trackSelectionHelper.showSelectionDialog(this, ((Button) view).getText(),
//                    trackSelector.getCurrentSelections().info, (int) view.getTag());
//        }
    }
    // PlaybackControlView.VisibilityListener implementation
    @Override
    public void onVisibilityChange(int visibility) {
        /*debugRootView.setVisibility(visibility);*/
    }
    @Override
    public void onLoadingChanged(boolean isLoading) {

    }
    @Override
    public void onPlayerStateChanged(boolean playWhenReady, int playbackState) {
        switch (playbackState) {
            case ExoPlayer.STATE_IDLE:
                showToast("Playback state changed : STATE_IDLE : PlayWhenReady : " + playWhenReady);
                break;
            case ExoPlayer.STATE_BUFFERING:
                showToast("Playback state changed : STATE_BUFFERING : PlayWhenReady : " + playWhenReady);
                break;
            case ExoPlayer.STATE_READY:
                showToast("Playback state changed : STATE_READY : PlayWhenReady : " + playWhenReady);
                break;
            case ExoPlayer.STATE_ENDED:
                showControls();
                showToast("Playback Ended !!!");
                ((MainActivity)this.mainActivity).handler.sendEmptyMessage(PlayerActivity.ENDED);
                break;
        }
        updateButtonVisibilities();
    }
    @Override
    public void onTimelineChanged(Timeline timeline, Object manifest) {
        isTimelineStatic = timeline != null && timeline.getWindowCount() > 0
                && !timeline.getWindow(timeline.getWindowCount() - 1, window).isDynamic;
    }
    @Override
    public void onPlayerError(ExoPlaybackException e) {
        String errorString = null;
        if (e.type == ExoPlaybackException.TYPE_RENDERER) {
            Exception cause = e.getRendererException();
            if (cause instanceof MediaCodecRenderer.DecoderInitializationException) {
                // Special case for decoder initialization failures.
                MediaCodecRenderer.DecoderInitializationException decoderInitializationException =
                        (MediaCodecRenderer.DecoderInitializationException) cause;
                if (decoderInitializationException.decoderName == null) {
                    if (decoderInitializationException.getCause() instanceof MediaCodecUtil.DecoderQueryException) {
                        errorString = this.mainActivity.getString(R.string.error_querying_decoders);
                    } else if (decoderInitializationException.secureDecoderRequired) {
                        errorString = this.mainActivity.getString(R.string.error_no_secure_decoder,
                                decoderInitializationException.mimeType);
                    } else {
                        errorString = this.mainActivity.getString(R.string.error_no_decoder,
                                decoderInitializationException.mimeType);
                    }
                } else {
                    errorString = this.mainActivity.getString(R.string.error_instantiating_decoder,
                            decoderInitializationException.decoderName);
                }
            }
        }
        if (errorString != null) {
            showToast(errorString);
        }
        playerNeedsSource = true;
//        updateButtonVisibilities();
        showControls();
    }
    @Override
    public void onPositionDiscontinuity() {

    }
    @Override
    public void onTrackSelectionsChanged(TrackSelections<? extends MappingTrackSelector.MappedTrackInfo> trackSelections) {

    }

    // Internal methods
    private void initializePlayer(Intent intent) {
//        Intent intent = this.mainActivity.getIntent();
        Log.d("InitializePlayer", "Start : " + intent);
        if (player == null) {
//            boolean preferExtensionDecoders = intent.getBooleanExtra(PREFER_EXTENSION_DECODERS, false);
//            UUID drmSchemeUuid = intent.hasExtra(DRM_SCHEME_UUID_EXTRA)
//                    ? UUID.fromString(intent.getStringExtra(DRM_SCHEME_UUID_EXTRA)) : null;
//            DrmSessionManager<FrameworkMediaCrypto> drmSessionManager = null;
//            if (drmSchemeUuid != null) {
//                String drmLicenseUrl = intent.getStringExtra(DRM_LICENSE_URL);
//                String[] keyRequestPropertiesArray = intent.getStringArrayExtra(DRM_KEY_REQUEST_PROPERTIES);
//                Map<String, String> keyRequestProperties;
//                if (keyRequestPropertiesArray == null || keyRequestPropertiesArray.length < 2) {
//                    keyRequestProperties = null;
//                } else {
//                    keyRequestProperties = new HashMap<>();
//                    for (int i = 0; i < keyRequestPropertiesArray.length - 1; i += 2) {
//                        keyRequestProperties.put(keyRequestPropertiesArray[i],
//                                keyRequestPropertiesArray[i + 1]);
//                    }
//                }
//                try {
//                    drmSessionManager = buildDrmSessionManager(drmSchemeUuid, drmLicenseUrl,
//                            keyRequestProperties);
//                } catch (UnsupportedDrmException e) {
//                   return;
//                }
//            }
            Log.d("InitializePlayer", "Player is NULL initializing NOw");
            eventLogger = new EventLogger();
            TrackSelection.Factory videoTrackSelectionFactory = new AdaptiveVideoTrackSelection.Factory(BANDWIDTH_METER);
            trackSelector = new DefaultTrackSelector(mainHandler, videoTrackSelectionFactory);
            trackSelector.addListener(this);
//            trackSelector.addListener(eventLogger);
//            trackSelectionHelper = new TrackSelectionHelper(trackSelector, videoTrackSelectionFactory);
            player = ExoPlayerFactory.newSimpleInstance(this.mainActivity, trackSelector, new DefaultLoadControl(), null, true);
            player.addListener(this);
//            player.addListener(eventLogger);
//            player.setAudioDebugListener(eventLogger);
//            player.setVideoDebugListener(eventLogger);
//            player.setId3Output(eventLogger);
            simpleExoPlayerView.setPlayer(player);
            if (isTimelineStatic) {
                if (playerPosition == C.TIME_UNSET) {
                    player.seekToDefaultPosition(playerWindow);
                } else {
                    player.seekTo(playerWindow, playerPosition);
                }
            }
            player.setPlayWhenReady(shouldAutoPlay);
//            debugViewHelper = new DebugTextViewHelper(player, debugTextView);
//            debugViewHelper.start();
            playerNeedsSource = true;
        }
        if (player != null && intent != null) {
            Log.d("InitializePlayer", "Player is NOT NULL,  Playing now");
            String action = intent.getAction();
            Uri[] uris;
            String[] extensions;
            if (ACTION_PLAY_VIDEO.equals(action)) {
                uris = new Uri[] {intent.getData()};
//                extensions = new String[] {intent.getStringExtra(VIDEO_URL)};
            } else {
                return;
            }
//            if (Util.maybeRequestReadExternalStoragePermission(this, uris)) {
            // The player will be reinitialized if the permission is granted.
//                return;
//            }
            MediaSource[] mediaSources = new MediaSource[uris.length];
            for (int i = 0; i < uris.length; i++) {
                mediaSources[i] = buildMediaSource(uris[i]);
            }
            MediaSource mediaSource = mediaSources.length == 1 ? mediaSources[0] : new ConcatenatingMediaSource(mediaSources);
            LoopingMediaSource loopingSource = new LoopingMediaSource(mediaSource);
            player.prepare(loopingSource, true, true);
            playerNeedsSource = false;
//            updateButtonVisibilities();
        }
    }
    private void showControls() {
//        debugRootView.setVisibility(View.VISIBLE);
    }
    private void updateButtonVisibilities() {
//        debugRootView.removeAllViews();
//
//        retryButton.setVisibility(playerNeedsSource ? View.VISIBLE : View.GONE);
//        debugRootView.addView(retryButton);
//
//        if (player == null) {
//            return;
//        }
//
//        TrackSelections<MappingTrackSelector.MappedTrackInfo> trackSelections = trackSelector.getCurrentSelections();
//        if (trackSelections == null) {
//            return;
//        }
//
//        int rendererCount = trackSelections.length;
//        for (int i = 0; i < rendererCount; i++) {
//            TrackGroupArray trackGroups = trackSelections.info.getTrackGroups(i);
//            if (trackGroups.length != 0) {
//                Button button = new Button(this);
//                int label;
//                switch (player.getRendererType(i)) {
//                    case C.TRACK_TYPE_AUDIO:
//                        label = R.string.audio;
//                        break;
//                    case C.TRACK_TYPE_VIDEO:
//                        label = R.string.video;
//                        break;
//                    case C.TRACK_TYPE_TEXT:
//                        label = R.string.text;
//                        break;
//                    default:
//                        continue;
//                }
//                button.setText(label);
//                button.setTag(i);
//                button.setOnClickListener(this);
//                debugRootView.addView(button, debugRootView.getChildCount() - 1);
//            }
//        }
    }

    private void showToast(String message) {
//        Toast.makeText(this.mainActivity.getApplicationContext(), message, Toast.LENGTH_LONG).show();
    }
    private MediaSource buildMediaSource(Uri uri) {
        int type = Util.inferContentType(/*!TextUtils.isEmpty(overrideExtension) ? "." + overrideExtension: */uri.getLastPathSegment());
        switch (type) {
            case C.TYPE_SS:
                return new SsMediaSource(uri, buildDataSourceFactory(false),
                        new DefaultSsChunkSource.Factory(mediaDataSourceFactory), mainHandler, eventLogger);
            case C.TYPE_DASH:
                return new DashMediaSource(uri, buildDataSourceFactory(false),
                        new DefaultDashChunkSource.Factory(mediaDataSourceFactory), mainHandler, eventLogger);
            case C.TYPE_HLS:
                return new HlsMediaSource(uri, mediaDataSourceFactory, mainHandler, eventLogger);
            case C.TYPE_OTHER:
                return new ExtractorMediaSource(uri, mediaDataSourceFactory, new DefaultExtractorsFactory(),
                        mainHandler, eventLogger);
            default: {
                throw new IllegalStateException("Unsupported type: " + type);
            }
        }
    }
    private DrmSessionManager<FrameworkMediaCrypto> buildDrmSessionManager(UUID uuid,
                                                                           String licenseUrl, Map<String, String> keyRequestProperties) throws UnsupportedDrmException {
        if (Util.SDK_INT < 18) {
            return null;
        }
        HttpMediaDrmCallback drmCallback = new HttpMediaDrmCallback(licenseUrl,
                buildHttpDataSourceFactory(false), keyRequestProperties);
        return new StreamingDrmSessionManager<>(uuid,
                FrameworkMediaDrm.newInstance(uuid), drmCallback, null, mainHandler, eventLogger);
    }
    private void releasePlayer() {
        if (player != null) {
//            debugViewHelper.stop();
//            debugViewHelper = null;
            shouldAutoPlay = player.getPlayWhenReady();
            playerWindow = player.getCurrentWindowIndex();
            playerPosition = C.TIME_UNSET;
            Timeline timeline = player.getCurrentTimeline();
            if (timeline != null && timeline.getWindow(playerWindow, window).isSeekable) {
                playerPosition = player.getCurrentPosition();
            }
            player.release();
            player = null;
            trackSelector = null;
//            trackSelectionHelper = null;
            eventLogger = null;
        }
    }
    /**
     * Returns a new DataSource factory.
     *
     * @param useBandwidthMeter Whether to set {@link #BANDWIDTH_METER} as a listener to the new
     *     DataSource factory.
     * @return A new DataSource factory.
     */
    private DataSource.Factory buildDataSourceFactory(boolean useBandwidthMeter) {
        return ((CanoeApplication) this.mainActivity.getApplication())
                .buildDataSourceFactory(useBandwidthMeter ? BANDWIDTH_METER : null);
    }
    /**
     * Returns a new HttpDataSource factory.
     *
     * @param useBandwidthMeter Whether to set {@link #BANDWIDTH_METER} as a listener to the new
     *     DataSource factory.
     * @return A new HttpDataSource factory.
     */
    private HttpDataSource.Factory buildHttpDataSourceFactory(boolean useBandwidthMeter) {
        return ((CanoeApplication) this.mainActivity.getApplication())
                .buildHttpDataSourceFactory(useBandwidthMeter ? BANDWIDTH_METER : null);
    }
}