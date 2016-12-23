/**
 * Created by nanjain on 7/21/16.
 */
var SPORTS = SPORTS || {};
SPORTS.SwimlaneView = function (app) {
    var that = this;
    var app = app;
    var _container = document.getElementById('swimlane_view');
    var _data = null;
    var _currentRow = 0;
    var _length = 0;
    var lanesArray = [];
    var _moveFactor = 550;
    var _visible = false;
    var _dateContainer = document.getElementById("swim_date");
    var _timeDiv = _dateContainer.getElementsByClassName('time')[0];
    var _dayDiv = _dateContainer.getElementsByClassName('day')[0];
    var _ampmDiv = _dateContainer.getElementsByClassName('ampm')[0];

    function updateDate() {
        var dateObj = SPORTS.Utils.getDisplayTime();
        _timeDiv.innerText = dateObj.time;
        _dayDiv.innerText = dateObj.day;
        _ampmDiv.innerText = dateObj.ampm;
    }

    updateDate();
    SPORTS.dateInterval = setInterval(updateDate, 60000);

    this.setData = function (data) {
        _data = data;
        onDataAvailable();
    };
    this.getData = function () {
        return _data;
    };
    /**
     * View handling
     */
    this.refreshView = function () {
        var i = 0;
        var lane = lanesArray[i++];
        if (lane) {
            lane.update("", _data["content"]);
        } else {
            console.error("Swimlane-view: More than 4 categories... work on it !!");
        }
        _length = i;
        for (; i < lanesArray.length; i++) {
            lanesArray[i].hide();
        }
    };
    this.createView = function () {
        var swimlane = document.getElementById('swimlane');
        var lanes = swimlane.getElementsByTagName('li');
        for (var i = 0; i < 4; i++) {
            var currentLane = lanes[i];
            var swimLaneObj = new SPORTS.Swimlane(lanes[i], i);
            lanesArray.push(swimLaneObj);
        }
        _length = lanesArray.length;
    };
    this.selectItem = function () {
        // Select current item
        var tileObj = lanesArray[_currentRow].getActiveItem();
        // get the play information from current item and start playback
        return tileObj;
    };
    this.show = function () {
        _visible = true;
        SPORTS.Utils.removeClass(_container, 'displayNone');
        SPORTS.Utils.addClass(_container, 'fullview');
    };
    this.hide = function () {
        _visible = false;
        SPORTS.Utils.addClass(_container, 'displayNone');
        SPORTS.Utils.removeClass(_container, 'fullview');
    };

    this.isShown = function () {
        return _visible;
    };
    /**
     * Navigation
     */
    this.moveUp = function () {
        if (_currentRow > 0) {
            lanesArray[_currentRow].unHighlightItem();
            _currentRow--;
            document.getElementById("swimlane").style.webkitTransform = 'translateY(' + -_currentRow * _moveFactor + 'px)';
            lanesArray[_currentRow].highlightItem();
        }
    };
    this.moveDown = function () {
        if (_currentRow < _length - 1) {
            lanesArray[_currentRow].unHighlightItem();
            _currentRow++;
            document.getElementById("swimlane").style.webkitTransform = 'translateY(' + -_currentRow * _moveFactor + 'px)';
            lanesArray[_currentRow].highlightItem();
        }
    };
    this.moveLeft = function () {
        lanesArray[_currentRow].moveLeft();
    };
    this.moveRight = function () {
        lanesArray[_currentRow].moveRight();
    };

    /**
     * Event Handling
     */
    this.supportsEvent = function (event) {
        return true;
    };
    this.handleEvent = function (event) {
        console.log("handleEvent = swimlame : " + event.keyCode + " : " + event.type);
        if (event) {
            if (event.type == 'keydown') {
                console.log("here");
                switch (event.keyCode) {
                    case RemoteKeyCode.LEFT:
                        this.moveLeft();
                        break;
                    case RemoteKeyCode.RIGHT:
                        this.moveRight();
                        break;
                    case RemoteKeyCode.UP:
                        this.moveUp();
                        break;
                    case RemoteKeyCode.DOWN:
                        this.moveDown();
                        break;
                    case RemoteKeyCode.SELECT:
                    case RemoteKeyCode.ENTER :
                        var selectedItem = this.selectItem();
                        if (selectedItem.notify) {
                            app.showNotification();
                        }
                        console.log("Now Playing : " + selectedItem.getData().links.playSession.href);
                        app.switchView(SPORTS.VIEWS.VIDEO, selectedItem);
                        initiatePlayback(selectedItem.getData().links.playSession.href);
                        break;
                }
                return true;
            }
        }
    };
    function onDataAvailable() {
        that.refreshView();
    }

    /**
     * Data Handling
     */
    this.fetchData = function () {
        if(typeof JSON_DATA !== 'undefined') {
            alert("Dummy data is available...");
            var data = JSON_DATA;
            var version = parseFloat(data.version);
            console.log("New data version is : " + version + " : oldVersion : " + SPORTS.version);
            PlayURLs.live = data.liveUrl || PlayURLs.live;
            PlayURLs.livePlay = data.notification.url || PlayURLs.livePlay;
            console.log("LiveURL : " + PlayURLs.live + " : " + PlayURLs.livePlay);
            document.getElementById("notify_title").innerHTML = data.notification.message;

            if (SPORTS.version != version) {
                SPORTS.version = version;
                that.setData(data);
                setTimeout(function () {
                    console.log("Now tuning to video");
                    initiatePlayback(PlayURLs.live)
                }, 500);
            }
        } else {
            var ajaxObj = new XMLHttpRequest();
            ajaxObj.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var data = SPORTS.Utils.parseData(this.responseText);
                    console.log("New Data: " + this.responseText);
                    var version = parseFloat(data.version);
                    console.log("New data version is : " + version + " : oldVersion : " + SPORTS.version);
                    if (SPORTS.version != version) {
                        PlayURLs.live = data.liveUrl || PlayURLs.live;
                        PlayURLs.livePlay = data.notification.url || PlayURLs.livePlay;
                        document.getElementById("notify_title").innerHTML = data.notification.message;

                        console.log("Live : " + PlayURLs.live);
                        console.log("NotificationURL : " + PlayURLs.livePlay);

                        SPORTS.version = version;
                        that.setData(data);
                        setTimeout(function () {
                            console.log("Now tuning to live video");
                            initiatePlayback(PlayURLs.live)
                        }, 500);
                    }

                    clearTimeout(that.abortTimer);
                    clearTimeout(that.successTimer);
                    that.successTimer = setTimeout(function () {
                        console.log("Success Timer: Re-fetching data now");
                        ajaxObj = undefined;
                        that.fetchData();
                    }, 60000);
                }
            };
            ajaxObj.open("GET", SPORTS.serverURL + "?" + (new Date).getTime(), true);
            ajaxObj.send();

            that.abortTimer = setTimeout(function () {
                console.log("abort Timer: Refetching data now");
                ajaxObj.abort();
                ajaxObj = undefined;
                that.fetchData();
            }, 30000);
        }
    };

    this.finalize = function () {
        clearTimeout(this.abortTimer);
        this.abortTimer = undefined;
        clearTimeout(this.successTimer);
        this.successTimer = undefined;
        clearInterval(SPORTS.dateInterval);
        SPORTS.dateInterval = undefined;
    };

    this.createView();
    lanesArray[0].highlightItem();
};

SPORTS.Swimlane = function (parent, index, data) {
    var _tileArray = [];
    var _length = 0;
    var startPosition = 0;
    var endPosition = 5;
    var currentPosition = 0;
    var viewSize = 6;
    var moveFactor = 388;
    var currentMovePos = currentPosition * moveFactor;

    var _leftArrow = document.createElement('span');
    _leftArrow.className = "leftArrow";
    var _rightArrow = document.createElement('span');
    _rightArrow.className = "rightArrow";

    var _title = parent.getElementsByClassName("category_title")[0];
    var _laneContainer = document.createElement("div");
    var id = _laneContainer.id = 'lane_' + index;
    for (var j = 0; j < 12; j++) {
        _tileArray.push(new PosterCard('tile_' + index + '_' + j, _laneContainer, data));
    }
    _length = _tileArray.length;

    parent.appendChild(_leftArrow);
    parent.appendChild(_laneContainer);
    parent.appendChild(_rightArrow);

    this.getContainer = function () {
        return _laneContainer;
    };
    this.getActiveItem = function () {
        var obj = _tileArray[currentPosition];
        obj.notify = (currentPosition == 2);
        return obj;
    };
    this.getLength = function () {
        return _length;
    };
    /**
     * View Handling
     */
    this.hide = function () {
        SPORTS.Utils.addClass(parent, 'displayNone');
    };
    this.show = function () {
        SPORTS.Utils.removeClass(parent, 'displayNone');
    };
    this.highlightItem = function () {
        _tileArray[currentPosition].focus();
    };
    this.unHighlightItem = function () {
        _tileArray[currentPosition].blur();
    };

    this.update = function (category, dataArray) {
        console.log("SwimLane: dataArray : " + dataArray);
        var tempLength = 0;
        for (var i = 0; i < _tileArray.length; i++) {
            var data = dataArray[i];
            if (data) {
                _tileArray[i].update(data);
                tempLength++;
            } else {
                _tileArray[i].hide();
            }
        }
        _length = tempLength;
        startPosition = 0;
        endPosition = _length - 1;
        this.unHighlightItem();
        currentPosition = startPosition;
        currentMovePos = 0;
        _laneContainer.style.webkitTransform = 'translateX(' + currentMovePos + 'px)';
        this.highlightItem();
        this.updateArrows();
    };
    this.slideRow = function (size) {
        if (_length < viewSize) {
            return false;
        }
        var start = startPosition + size;
        var end = endPosition + size;
        if (start < 0) {
            start = 0;
            end = viewSize - 1;
        } else if (start > _length - viewSize) {
            end = _length - 1;
            start = end - viewSize + 1;
        } else {

        }
        var move = (start !== startPosition);
        startPosition = start;
        endPosition = end;
        return move;
    };
    this.updateArrows = function () {
        if (_length > viewSize) {
            if (startPosition > 0) {
                SPORTS.Utils.addClass(_leftArrow, 'show');
            } else {
                SPORTS.Utils.removeClass(_leftArrow, 'show');
            }
            if (endPosition < _length - 1) {
                SPORTS.Utils.addClass(_rightArrow, 'show');
            } else {
                SPORTS.Utils.removeClass(_rightArrow, 'show');
            }
        }
    };
    /**
     * Event Handling
     */

    /**
     * Key Handling
     */
    this.moveLeft = function () {
        if (currentPosition === startPosition) {
            console.warn("Reached Max Left " + currentPosition);
            return false;
        }
        console.log("Left");
        this.unHighlightItem();
        --currentPosition;
        currentMovePos += moveFactor;
        _laneContainer.style.webkitTransform = 'translateX(' + currentMovePos + 'px)';
        this.highlightItem();
        this.updateArrows();
    };
    this.moveRight = function () {
        if (currentPosition === endPosition) {
            console.warn("Reached Max Right " + currentPosition);
            return false;
        }
        console.log("Right");
        this.unHighlightItem();
        ++currentPosition;
        currentMovePos -= moveFactor;
        _laneContainer.style.webkitTransform = 'translateX(' + currentMovePos + 'px)';
        this.highlightItem();
        this.updateArrows();
    };
    this.selectItem = function () {
        _tileArray[currentPosition];
    };
};