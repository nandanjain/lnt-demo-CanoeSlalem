//SPORTS.Video = function (app) {
//
//    var that = this;
//    var _app = app;
//    var _container = document.getElementById('video_view');
//    var _playBackRate = 1;
//    var _intervalRewind;
//    var _controlsPane = document.getElementById("playControls");
//    var _mediaPlayer = document.getElementById('live_video');
//    var _progressBar = document.getElementById('progressBar');
//    var _deactivateKeys = false;
//
//    _mediaPlayer.addEventListener('loadstart', mplayerEvent, false);
//    _mediaPlayer.addEventListener('error', mplayerEvent, false);
//    _mediaPlayer.addEventListener('loadeddata', mplayerEvent, false);
//    _mediaPlayer.addEventListener('playing', mplayerEvent, false);
//    _mediaPlayer.addEventListener('waiting', mplayerEvent, false);
//    _mediaPlayer.addEventListener('ended', mplayerEvent, false);
//    _mediaPlayer.addEventListener('emptied', mplayerEvent, false);
//    _mediaPlayer.addEventListener('stalled', mplayerEvent, false);
//    _mediaPlayer.addEventListener('timeupdate', updateProgressBar, false);
//
//    this.supportsEvent = function (event) {
//        return true;
//    };
//
//    this.show = function (selectedItem) {
//        if(!selectedItem) {
//            this.tuneToLive();
//            return;
//        }
//        this.live = selectedItem.live;
//        SPORTS.Utils.removeClass(_container, 'displayNone');
//        SPORTS.Utils.addClass(_container, 'fullview');
//        if(selectedItem.live) {
//            _mediaPlayer.loop = true;
//            this.setPlayUrl(PlayURLs.livePlay);
//            this.updateView();
//        } else {
//            _mediaPlayer.loop = false;
//            var data = selectedItem.getData();
//            this.setPlayUrl(data.links.playSession.href);
////            this.setPlayUrl(PlayURLs.assets[0]);
//            this.updateView();
//            if(selectedItem.notify){
//                _app.showNotification();
//            }
////            this.showAnimation();
//        }
//    };
//   this.hide = function () {
//        _controlsPane.style.opacity = null;
//        SPORTS.Utils.addClass(_container, 'displayNone');
//        SPORTS.Utils.removeClass(_container, 'fullview');
//    };
//
//    this.showAnimation = function(){
//        _deactivateKeys = true;
////        document.getElementById("video_loading").style.visibility = "visible";
//    };
//    this.hideAnimation = function(){
////        document.getElementById("video_loading").style.visibility = null;
//        _deactivateKeys = false;
//    };
//    this.tuneToLive = function(){
//        alert("Tuneing to live now : "+ PlayURLs.live);
//        this.live = true;
//        console.log("Nandan : Currently playing..." + _mediaPlayer.readyState + " : " + _mediaPlayer.currentSrc + " : " + PlayURLs.live);
//        ANDROID_API.playURLs("https://devimages.apple.com.edgekey.net/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8");
//        return;
//
//        if(_mediaPlayer.currentSrc && _mediaPlayer.currentSrc == PlayURLs.live && _mediaPlayer.readyState == 4) {
//            console.log("Nandan : ------------- Returning from Video");
//            return;
//        }
//        console.log("Nandan : ------------- Tuning to LIVE");
//
//        _mediaPlayer.getElementsByTagName("source")[0].setAttribute('src', PlayURLs.live);
//        _mediaPlayer.load();
//        _mediaPlayer.playbackRate = 1;
//        _mediaPlayer.loop = true;
////        _mediaPlayer.play();
//    };
//    this.updateView = function () {
//        _mediaPlayer.getElementsByTagName("source")[0].setAttribute('src', this.source);
//        this.play();
////        this.showControls();
////        _mediaPlayer.addEventListener('progress', updateProgressBar, false);
//    };
//
//    function mplayerEvent (event) {
//        console.log("----- mPlayerEvent: " + event.type + " : " + _mediaPlayer.currentSrc);
//        switch (event.type){
//            case "emptied":
////                _mediaPlayer.style.visibility = 'hidden';
//                break;
//            case "loadstart":
////                that.showAnimation();
//                break;
//            case "loadeddata":
//                that.play(true);
//                break;
//            case "playing":
//                _mediaPlayer.playbackRate = 1;
//                _mediaPlayer.currentTime = 0;
//                that.showControls();
//                that.hideAnimation();
////                _mediaPlayer.style.visibility = "visible";
//                break;
//            case "stalled":
//                break;
//            case "waiting":
////                that.showAnimation();
//                break;
//            case "ended":
//            case "error":
////                _mediaPlayer.style.visibility = null;
//                _app.switchView(SPORTS.VIEWS.SWIM);
//                that.stop();
////            that.hide();
//                break;
//        }
//    }
//    this.showControls = function () {
//        if(this.live) {
//            _controlsPane.style.opacity = null;
//            return false;
//        }
//        if (this.controlsTimer) {
//            clearTimeout(this.controlsTimer);
//        }
//        _controlsPane.style.opacity = 1;
//        this.controlsTimer = setTimeout(function () {
//            _controlsPane.style.opacity = null;
//        }, 10000);
//    };
//
//    this.setPlayUrl = function (videoURL) {
//        this.source = videoURL;
//    };
//
//    this.handleEvent = function (event) {
//        console.log("handleEvent = video : " + event.keyCode + " : " + event.type);
//        if (event) {
//            if (event.type == 'keydown') {
//                if(event.keyCode == RemoteKeyCode.MENU || event.keyCode == RemoteKeyCode.BACK_KEY) {
////                    _mediaPlayer.style.visibility = "hidden";
//                    console.log("THis is live and Menu is pressed");
//                    _app.switchView(SPORTS.VIEWS.SWIM);
//                    this.stop();
////                    this.hide();
//                    return false;
//                }
//                if(_deactivateKeys) {
//                    return;
//                }
//                this.showControls();
//                console.log("here");
//                switch (event.keyCode) {
//                    case RemoteKeyCode.VIDEO_PLAY:
//                    case RemoteKeyCode.SELECT:
//                    case RemoteKeyCode.ENTER:
//                    case RemoteKeyCode.VIDEO_PAUSE:
//                        if(_mediaPlayer.paused) {
//                            this.play(true)
//                        } else {
//                            this.pause();
//                        }
//                        break;
//                    case RemoteKeyCode.VIDEO_FAST_FORWARD:
//                    case RemoteKeyCode.RIGHT:
//                        this.fastforward();
//                        break;
//                    case RemoteKeyCode.VIDEO_FAST_BACKWARD:
//                    case RemoteKeyCode.LEFT:
//                        this.fastbackward();
//                        break;
//                    case RemoteKeyCode.VIDEO_STOP:
//                    case RemoteKeyCode.BACK_KEY:
//                    case RemoteKeyCode.MENU:
////                        _mediaPlayer.style.visibility = "hidden";
//                        _progressBar.value = 0;
//                        _app.switchView(SPORTS.VIEWS.SWIM);
//                        this.stop();
////                        this.hide();
//                        break;
//                }
//                return true;
//            }
//        }
//    };
//
//    this.play = function (doNotReload) {
//        clearRewind();
//        if(!doNotReload) {
//            _mediaPlayer.load();
//        } else {
//            _mediaPlayer.playbackRate = 1;
//            _mediaPlayer.play();
//            document.getElementById('pause').style.visibility = 'visible';
//            document.getElementById('play').style.visibility = 'hidden';
//        }
//    };
//
//    this.pause = function () {
//        clearRewind();
//        _mediaPlayer.playbackRate = 1;
//        _mediaPlayer.pause();
//        document.getElementById('pause').style.visibility = 'hidden';
//        document.getElementById('play').style.visibility = 'visible';
//    };
//
//    this.stop = function () {
//        clearRewind();
//        resetPlayer();
//        this.tuneToLive();
//    };
//
//    this.fastforward = function () {
//        clearRewind();
//        _mediaPlayer.playbackRate = ++_playBackRate;
//    };
//    function clearRewind() {
//        clearInterval(_intervalRewind);
//    }
//
//    this.fastbackward = function () {
//        clearRewind();
//        _mediaPlayer.pause();
//        _intervalRewind = setInterval(function () {
//            _mediaPlayer.playbackRate = 0;
//            console.log("______" + _mediaPlayer.currentTime);
//            if (Math.floor(_mediaPlayer.currentTime) == 1) {
//                clearInterval(_intervalRewind);
//                _mediaPlayer.currentTime = 0;
//                _mediaPlayer.playbackRate = 1;
//                that.play();
//            } else {
//                _mediaPlayer.currentTime -= 1;
//            }
//        }, 500);
//    };
//
//    function updateProgressBar() {
//        if (_mediaPlayer == undefined) {
//            _mediaPlayer = document.getElementById('live_video');
//            _progressBar = document.getElementById('progressBar')
//        }
//        if(this.live){
//            _progressBar.value = 0;
//            return;
//        }
//        if(isFinite(_mediaPlayer.duration) && _mediaPlayer.duration > 0 && !isNaN(_mediaPlayer.duration)){
//            var percentage = Math.floor((100 / _mediaPlayer.duration) * _mediaPlayer.currentTime);
////            console.log("updateprogressbar - duration: "+ _mediaPlayer.duration + " : currentTime : " + _mediaPlayer.currentTime + " : value : " + percentage );
//            _progressBar.value = percentage;
////            _progressBar.innerHTML = percentage + '% played';
//        }
//    }
//
//    function resetPlayer() {
////        _mediaPlayer.removeEventListener('timeupdate', updateProgressBar, false);
//        _mediaPlayer.getElementsByTagName("source")[0].removeAttribute("src");
//        _mediaPlayer.currentTime = 0;
//        _mediaPlayer.playbackRate = 1;
//        _mediaPlayer.load();
//        _progressBar.value = 0;
//    }
////    this.updateView();
//    this.finalize = function(){
//        resetPlayer();
//        _mediaPlayer.removeEventListener('loadstart', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('error', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('loadeddata', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('playing', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('waiting', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('ended', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('emptied', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('stalled', mplayerEvent, false);
//        _mediaPlayer.removeEventListener('timeupdate', updateProgressBar, false);
//    }
//};