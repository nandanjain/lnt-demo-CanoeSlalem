/**
 * Created by nanjain on 7/21/16.
 */
function PosterCard(id, container, data) {
    var _parent = container;
    var _data = data;
    var that = this;
    this.focus = function () {
        SPORTS.Utils.addClass(card, 'focus');
        this.updateDetails();
    };
    this.blur = function () {
        SPORTS.Utils.removeClass(card, 'focus');
    };
    this.show = function () {
        SPORTS.Utils.removeClass(card, 'displayNone');
    };
    this.hide = function () {
        SPORTS.Utils.addClass(card, 'displayNone');
    };
    this.updateDetails = function (clear) {
            if(this.timer) {
                clearTimeout(this.timer);
                this.timer = undefined;
            }
            if (clear) {
                update(clear);
            } else {
                this.timer = setTimeout(update, 1000);
            }

            function update(clear) {
//                var poster = _tileArray[currentPosition];
                var poster = that;
                if (!poster || clear) {
                    document.getElementById("asset_title").innerText = "";
                    document.getElementById("asset_meta").innerText = "";
                    document.getElementById("asset_summary").innerText = "";
                } else {
                    document.getElementById("asset_title").innerText = poster.getTitle();
                    document.getElementById("asset_meta").innerText = poster.getMeta();
                    document.getElementById("asset_summary").innerText = poster.getSummary();
                }
            }
        };
    this.update = function (data) {
        if (data && data.content) {
            _data = data;
            var content = data.content;
            SPORTS.Utils.removeClass(card, 'empty');
            card.innerHTML = '<img class="event_item"/>';
            for (var i = 0; i < content.media.length; i++) {
                var media = content.media[i];
                if (media.height < media.width) {
                    card.getElementsByClassName("event_item")[0].src = "css/posters/" + content.media[i].uri;
                }
            }
            if(content.isGeneric) {
                card.innerHTML += '<span class="event_item_text">'+ content.title +'</span>';
            }
        } else {
//            console.error("PosterCard: data invalid : " + data);
        }
    };
    this.getData = function () {
        return _data;
    };

    this.getTitle = function () {
        if (!this.getData()) return;
        return this.getData().content.title;
    };
    this.getMeta = function () {
        return "";
        if (!this.getData()) return;

        var content = this.getData().content;
        var duration = SPORTS.Utils.parseDuration(this.getData().duration);
        var year = content.productionYear;
        var genre = content.genres[0].name;
        var rating = content.parentalRating.name;
        return year + "|" + genre + "|" + duration;
    };
    this.getSummary = function () {
        if (!this.getData()) return;
        return this.getData().content.synopsis.shortSynopsis;
    };
    var card = document.createElement('div');
    card.className = 'posterCard empty';
    card.id = id;
    this.update(data);
    _parent.appendChild(card);
}