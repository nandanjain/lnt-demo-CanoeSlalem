/**
 * Created by nanjain on 7/21/16.
 */
var SPORTS = SPORTS || {};
SPORTS.Utils = {
    parseData: function (data) {
        try {
            var jsonObj = JSON.parse(data);
        } catch (e) {
            alert("Error in Parsing JSON file. Please validate the JSON using www.jsonlint.com");
            alert("Error Code: " + e);
        }
        return jsonObj;
    },
    hasClass: function (el, className) {
        if (el) {
            var r = new RegExp('\\b' + className + '\\b');
            return r.test(el.className);
        }
    },
    addClass: function (el, className) {
        if (el && !SPORTS.Utils.hasClass(el, className)) {
            el.className += ' ' + className;
        }
    },
    removeClass: function (el, className) {
        if (el && el.className) {
            el.className = el.className.replace(' ' + className, '').replace(className, '');
        }
    },
    parseDuration: function (duration) {
        var seconds = parseInt((duration / 1000) % 60)
            , minutes = parseInt((duration / (1000 * 60)) % 60)
            , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
//        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + "h " + minutes + "m";
    },
    getDisplayTime: function () {
        var daysArr = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
        var hrs = new Date().getHours();
        var mins = new Date().getMinutes();
        var day = daysArr[new Date().getDay()];
        var ampm = 'am';

        if (mins < 10) {
            mins = '0' + mins;
        }
        if (hrs > 12) {
            hrs = hrs - 12;
            ampm = 'pm';
        }
        if (hrs < 10) {
            hrs = '0' + hrs;
        }
        var timeStr = hrs + ":" + mins;
        return {
            time: timeStr,
            ampm: ampm,
            day: day
        };
    }
};
var RemoteKeyCode = {};
RemoteKeyCode.LEFT = 37;
RemoteKeyCode.RIGHT = 39;
RemoteKeyCode.UP = 38;
RemoteKeyCode.DOWN = 40;
RemoteKeyCode.SELECT = 32;
RemoteKeyCode.ENTER = 13;
RemoteKeyCode.MENU = 27;

//Video controls
RemoteKeyCode.VIDEO_PLAY = 179; // Right Arrow
RemoteKeyCode.VIDEO_PAUSE = 179; // Space
RemoteKeyCode.VIDEO_STOP = 40; // Down Arrow
RemoteKeyCode.VIDEO_FAST_FORWARD = 190; // DOT
RemoteKeyCode.VIDEO_FAST_BACKWARD = 188; // Comma
RemoteKeyCode.BACK_KEY = 27; // ESC
