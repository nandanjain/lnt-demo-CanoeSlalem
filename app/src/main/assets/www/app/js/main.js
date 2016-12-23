/**
 * Created by nanjain on 7/21/16.
 */
var SPORTS = SPORTS || {};
SPORTS.ApplicationVersion = 5;

var ANDROID_API = ANDROID_API || {
    playURLs: function(url, isLive){
        alert("Now Playing the URL: " + url + " : isLive : "+ isLive);
    },
    moveToNextScreen: function(){
        alert("Exiting the application now...");
    },
    goToVideo: function () {
        alert("Going to video now");
    },
    launchMenu: function(){
        alert('launching menu now');
    }
};
var PlayURLs = {};
var currentlyPlaying;
SPORTS.VIEWS = {
    SWIM: 0,
    SEARCH: 1,
    VIDEO: 2,
    DEFAULT: 0
};
SPORTS.version = 0;

SPORTS.serverURL = "http://videoscape.cisco.com/player/data.json";
//SPORTS.serverURL = "http://localhost:8080/data.json";
SPORTS.Application = function () {
    var _views = {};
    var activeView = undefined;
    var _state = [];
    var _notification = document.getElementById("notification");
    var _notificationTimer;
    var _app = this;

    this.init = function () {
        document.getElementById("version").innerText = "v" + SPORTS.ApplicationVersion;
        _views[SPORTS.VIEWS.SWIM] = new SPORTS.SwimlaneView(this);
//        _views[SPORTS.VIEWS.VIDEO] = new SPORTS.Video(this);
        document.addEventListener('keydown', this, false);
        activeView = _views[SPORTS.VIEWS.SWIM];
        activeView.fetchData();
    };
    this.getViews = function () {
        return _views;
    };
    this.showNotification = function() {
        if (!_notificationTimer) {
            _notificationTimer = setTimeout(function () {
                ANDROID_API.launchMenu();
                _app.notificationDisplayed = true;
                _notification.style.display = "block";
                setTimeout(_app.hideNotification, 60000);
            }, 8000);
        }
    };
    this.hideNotification = function () {
        clearTimeout(_notificationTimer);
        _notificationTimer = undefined;
        _app.notificationDisplayed = false;
        _notification.style.display = null;
    };
    this.handleEvent = function (event) {
        console.log("handleEvent - main - " + event);
        if (event.type == "keydown") {
            switch (event.keyCode) {
                case RemoteKeyCode.UP:
                case RemoteKeyCode.DOWN:
                    event.stopPropagation();
                    event.preventDefault();
                    return false;
            }
            if (_app.notificationDisplayed) {
                switch (event.keyCode) {
                    case RemoteKeyCode.ENTER:
                        this.hideNotification();
                        initiatePlayback(PlayURLs.livePlay);
                        this.switchView(SPORTS.VIEWS.VIDEO, {live: true});
                        break;
                    case RemoteKeyCode.BACK_KEY:
                        this.hideNotification();
                        break;
                }
                return false;
            }
        }
        if (activeView && activeView.supportsEvent(event)) {
            if (event.keyCode == RemoteKeyCode.BACK_KEY) {
                if(activeView.isShown()) {
                    console.error("Currently on main page, exiting on BACK KEY");
                    this.finalize();
                    ANDROID_API.moveToNextScreen();
                    return;
                } else {
                    console.error("Currently on Video Playback, Tune to live and Go back to menu")
                    ANDROID_API.launchMenu();
                    this.switchView(SPORTS.VIEWS.SWIM);
                }
            }
            var consumed = activeView.handleEvent(event);
            if (consumed) {
                return false;
            }
        } else {
            console.log("Unsupported event.");
        }
    };

    this.switchView = function (viewType, param) {
        switch (viewType) {
            case SPORTS.VIEWS.SWIM :
                console.log("Switch View : SWIM");
                initiatePlayback(PlayURLs.live);
                activeView = _views[SPORTS.VIEWS.SWIM] || new SPORTS.SwimlaneView(this);
                activeView.show(param);
                break;
            case SPORTS.VIEWS.VIDEO :
                console.log("Switch View : VIDEO");
//                activeView = _views[SPORTS.VIEWS.VIDEO] || new SPORTS.Video(this);
                _views[SPORTS.VIEWS.SWIM].hide();
                break;
        }
//        _state.push(activeView);
    };

    this.switchPreviousView = function () {
        activeView = _state[_state.length - 2];
        if (activeView != undefined) {
            this.switchView(activeView);
            _state.splice(_state.length - 2, 2);
            _state.push(activeView);
        }
    };
    this.finalize = function () {
        _views[SPORTS.VIEWS.SWIM].finalize();
        _views[SPORTS.VIEWS.SWIM] = undefined;
//        _views[SPORTS.VIEWS.VIDEO].finalize();
//        _views[SPORTS.VIEWS.VIDEO] = undefined;
    }
};

var APP = new SPORTS.Application();
APP.init();

function keyCodeDown(event) {
    if (event == 'back') {
        APP.handleEvent({type: "keydown", keyCode: RemoteKeyCode.BACK_KEY, preventDefault: function () {
        }, stopPropagation: function () {
        }});
    } else if (event == 'left') {
        APP.handleEvent({type: "keydown", keyCode: RemoteKeyCode.LEFT, preventDefault: function () {
        }, stopPropagation: function () {
        }});
    } else if (event == 'right') {
        APP.handleEvent({type: "keydown", keyCode: RemoteKeyCode.RIGHT, preventDefault: function () {
        }, stopPropagation: function () {
        }});
    } else if (event == 'select') {
        APP.handleEvent({type: "keydown", keyCode: RemoteKeyCode.ENTER, preventDefault: function () {
        }, stopPropagation: function () {
        }});
    }
}
function initiatePlayback(url){
    console.warn("initiatePlayback : START : " + currentlyPlaying + " : " + url);
    if(currentlyPlaying && currentlyPlaying === url) {
        console.error("initiatePlayback - Playing the same url");
        ANDROID_API.goToVideo();
        return false;
    }
    console.warn("initiatePlayback : " + url + " : " + !!(url == PlayURLs.live));
    console.log("PlayURLS : Live " + PlayURLs.live);
    ANDROID_API.playURLs(url, !!(url == PlayURLs.live));
    currentlyPlaying = url;
    return true;
}