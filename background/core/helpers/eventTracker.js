/*!
 * Copyright (C) 2007-2015 eBay Inc. All Rights Reserved.
 */
function EventTracker(aName) {
    if (aName) {
        this._name = aName;
    }
    else {
        this._name = "UnnamedEventTracker";
    }
    this._lastEventIndex = -1;
    this._events = {};
    this._eventErrors = 0;
    this._whenAllFinished = null;
}
EventTracker.prototype = {
    doWhenAllFinished: function (aCallback) {
        this._whenAllFinished = aCallback;
    },
    failRemainingEvents: function () {
        var that = this;
        if (this.numPendingEvents() <= 0) {
            if (this._whenAllFinished) {
                try {
                    this._whenAllFinished(this._eventErrors);
                }
                catch (e) {
                    Logger.error("EventTracker.failRemainingEvents Error: " + e.message +
                        "/" + this._name);
                }
            }
        }
        else {
            $.each(this._events, function (aIndex) {
                that._remove(aIndex, true);
            });
        }
    },
    addRequest: function (aRequest) {
        if (aRequest === null) {
            return;
        }
        var eventIndex = ++this._lastEventIndex;
        this._events[eventIndex] = true;
        aRequest.done(function () {
            new Timer(function () { this._remove(eventIndex, false); }.bind(this), 50);
        }.bind(this));
        aRequest.fail(function () {
            this.failRemainingEvents();
        }.bind(this));
        return eventIndex;
    },
    addCallbackEvent: function () {
        var that = this;
        var eventIndex = ++this._lastEventIndex;
        this._events[eventIndex] = function (aError) {
            that._remove(eventIndex, aError);
        };
        return this._events[eventIndex];
    },
    _remove: function (aEventIndex, aError) {
        if (!this._events[aEventIndex]) {
            Logger.warn("Attempt to remove event " + aEventIndex +
                " from tracker \"" + this._name + "\"" +
                ", but that event does not exist.");
            return;
        }
        if (aError) {
            this._eventErrors++;
        }
        delete this._events[aEventIndex];
        if (this.numPendingEvents() <= 0) {
            if (this._whenAllFinished) {
                try {
                    this._whenAllFinished(this._eventErrors);
                }
                catch (e) {
                    Logger.error("EventTracker._remove Error: " + e.message +
                        "/" + this._name);
                }
            }
        }
    },
    numPendingEvents: function () {
        var num = 0;
        $.each(this._events, function () { num++; });
        return num;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnRUcmFja2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYmFja2dyb3VuZC9jb3JlL2hlbHBlcnMvZXZlbnRUcmFja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBT0gsc0JBQXNCLEtBQUs7SUFDekIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNWLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNOLElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUM7SUFDckMsQ0FBQztJQUNELElBQUksQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbEIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7SUFDdEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUMvQixDQUFDO0FBRUQsWUFBWSxDQUFDLFNBQVMsR0FBRztJQUt2QixpQkFBaUIsRUFBRyxVQUFTLFNBQVM7UUFFcEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQztJQUNwQyxDQUFDO0lBS0QsbUJBQW1CLEVBQUc7UUFFcEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFDMUIsSUFBSSxDQUFDO29CQUNILElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzNDLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDWCxNQUFNLENBQUMsS0FB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QUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFLRCxnQkFBZ0IsRUFBRztRQUVqQixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsY0FBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDYixDQUFDO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQ29weXJpZ2h0IChDKSAyMDA3LTIwMTUgZUJheSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKi9cblxuLypcbiAgdmFyIExvZ2dlciA9IHJlcXVpcmUoXCJoZWxwZXJzL2xvZ2dlclwiKS5Mb2dnZXI7XG4gIHZhciBUaW1lciA9IHJlcXVpcmUoXCJoZWxwZXJzL3RpbWVyXCIpLlRpbWVyO1xuKi9cblxuZnVuY3Rpb24gRXZlbnRUcmFja2VyKGFOYW1lKSB7XG4gIGlmIChhTmFtZSkge1xuICAgIHRoaXMuX25hbWUgPSBhTmFtZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9uYW1lID0gXCJVbm5hbWVkRXZlbnRUcmFja2VyXCI7XG4gIH1cbiAgdGhpcy5fbGFzdEV2ZW50SW5kZXggPSAtMTtcbiAgdGhpcy5fZXZlbnRzID0ge307XG4gIHRoaXMuX2V2ZW50RXJyb3JzID0gMDtcbiAgdGhpcy5fd2hlbkFsbEZpbmlzaGVkID0gbnVsbDtcbn1cblxuRXZlbnRUcmFja2VyLnByb3RvdHlwZSA9IHtcbiAgLyoqXG4gICAqIFNldHMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBjYWxsIHdoZW4gYWxsIGV2ZW50cyBoYXZlIGZpbmlzaGVkLlxuICAgKiBAcGFyYW0gYUNhbGxiYWNrIHRoZSBjYWxsYmFjayBtZXRob2QuXG4gICAqL1xuICBkb1doZW5BbGxGaW5pc2hlZCA6IGZ1bmN0aW9uKGFDYWxsYmFjaykge1xuXG4gICAgdGhpcy5fd2hlbkFsbEZpbmlzaGVkID0gYUNhbGxiYWNrO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHJlbWFpbmluZyBldmVudHMgYXMgZXJyb3JzIGFuZCBjYWxsIHRoZSBjYWxsYmFja1xuICAgKi9cbiAgZmFpbFJlbWFpbmluZ0V2ZW50cyA6IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgaWYgKHRoaXMubnVtUGVuZGluZ0V2ZW50cygpIDw9IDApIHtcbiAgICAgIGlmICh0aGlzLl93aGVuQWxsRmluaXNoZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLl93aGVuQWxsRmluaXNoZWQodGhpcy5fZXZlbnRFcnJvcnMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTG9nZ2VyLmVycm9yKFwiRXZlbnRUcmFja2VyLmZhaWxSZW1haW5pbmdFdmVudHMgRXJyb3I6IFwiICsgZS5tZXNzYWdlICtcbiAgICAgICAgICAgICAgICAgICAgICAgXCIvXCIgKyB0aGlzLl9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkLmVhY2godGhpcy5fZXZlbnRzLCBmdW5jdGlvbihhSW5kZXgpIHtcbiAgICAgICAgdGhhdC5fcmVtb3ZlKGFJbmRleCwgdHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gcmVxdWVzdCB0byB0aGUgZXZlbnQgdHJhY2tlci5cbiAgICogQHBhcmFtIGFSZXF1ZXN0IHRoZSByZXF1ZXN0LlxuICAgKi9cbiAgYWRkUmVxdWVzdCA6IGZ1bmN0aW9uKGFSZXF1ZXN0KSB7XG5cbiAgICAvLyBEbyBub3QgcHJvY2VlZCBpZiB0aGUgcmVxdWVzdCBpcyBudWxsLiBQcm9iYWJseSBhbiBlcnJvciB3aGVuIGl0IHdhcyBjcmVhdGVkLlxuICAgIGlmIChhUmVxdWVzdCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBldmVudEluZGV4ID0gKyt0aGlzLl9sYXN0RXZlbnRJbmRleDtcbiAgICB0aGlzLl9ldmVudHNbZXZlbnRJbmRleF0gPSB0cnVlO1xuXG4gICAgLy8gZ2l2ZSBpdCBhIGRlbGF5IHRvIGVuc3VyZSB0aGUgbmV4dCByZXF1ZXN0IGNhbiBiZSBhZGRlZCB0byB0aGUgbGlzdFxuICAgIC8vIGJlZm9yZSBkb1doZW5BbGxGaW5pc2hlZCBpcyBjYWxsZWQuXG4gICAgYVJlcXVlc3QuZG9uZShmdW5jdGlvbigpIHtcbiAgICAgIG5ldyBUaW1lcihmdW5jdGlvbigpIHsgdGhpcy5fcmVtb3ZlKGV2ZW50SW5kZXgsIGZhbHNlKTsgfS5iaW5kKHRoaXMpLCA1MCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbiAgICBhUmVxdWVzdC5mYWlsKGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5mYWlsUmVtYWluaW5nRXZlbnRzKCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiBldmVudEluZGV4O1xuICB9LFxuXG4gIC8qKlxuICAgKiBBZGRzIGFuIGV2ZW50IHRoYXQgaXMgbWFya2VkIGFzIGZpbmlzaGVkIHZpYSB0aGUgY2FsbGJhY2sgdGhhdCBpcyByZXR1cm5lZC5cbiAgICogQHJldHVybiBBIGNhbGxiYWNrIHRoYXQgd2lsbCBtYXJrIHRoZSBldmVudCBhcyBmaW5pc2hlZC4gIElmIHRoZSBjYWxsYmFja1xuICAgKiBoYXMgYSB0cnVlIHBhcmFtZXRlciwgdGhlIGV2ZW50IGlzIGNvbnNpZGVyZWQgdG8gaGF2ZSBlbmRlZCBpbiBhbiBlcnJvclxuICAgKiBjb25kaXRpb24uXG4gICAqL1xuICBhZGRDYWxsYmFja0V2ZW50IDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgdmFyIGV2ZW50SW5kZXggPSArK3RoaXMuX2xhc3RFdmVudEluZGV4O1xuXG4gICAgdGhpcy5fZXZlbnRzW2V2ZW50SW5kZXhdID0gZnVuY3Rpb24oYUVycm9yKSB7XG4gICAgICB0aGF0Ll9yZW1vdmUoZXZlbnRJbmRleCwgYUVycm9yKTtcbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9ldmVudHNbZXZlbnRJbmRleF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYW4gZXZlbnQgZnJvbSB0aGUgdHJhY2tlci5cbiAgICogQHBhcmFtIGFFdmVudEluZGV4IHRoZSBldmVudCBpbmRleC5cbiAgICogQHBhcmFtIGFFcnJvciB0aGUgZXJyb3IuXG4gICAqL1xuICBfcmVtb3ZlIDogZnVuY3Rpb24oYUV2ZW50SW5kZXgsIGFFcnJvcikge1xuICAgIFxuICAgIGlmICghdGhpcy5fZXZlbnRzW2FFdmVudEluZGV4XSkge1xuICAgICAgTG9nZ2VyLndhcm4oXCJBdHRlbXB0IHRvIHJlbW92ZSBldmVudCBcIiArIGFFdmVudEluZGV4ICtcbiAgICAgICAgICAgICAgICAgIFwiIGZyb20gdHJhY2tlciBcXFwiXCIgKyB0aGlzLl9uYW1lICsgXCJcXFwiXCIgK1xuICAgICAgICAgICAgICAgICAgXCIsIGJ1dCB0aGF0IGV2ZW50IGRvZXMgbm90IGV4aXN0LlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGFFcnJvcikge1xuICAgICAgdGhpcy5fZXZlbnRFcnJvcnMrKztcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW2FFdmVudEluZGV4XTtcblxuICAgIGlmICh0aGlzLm51bVBlbmRpbmdFdmVudHMoKSA8PSAwKSB7XG4gICAgICBpZiAodGhpcy5fd2hlbkFsbEZpbmlzaGVkKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5fd2hlbkFsbEZpbmlzaGVkKHRoaXMuX2V2ZW50RXJyb3JzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICBMb2dnZXIuZXJyb3IoXCJFdmVudFRyYWNrZXIuX3JlbW92ZSBFcnJvcjogXCIgKyBlLm1lc3NhZ2UgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIvXCIgKyB0aGlzLl9uYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHBlbmRpbmcgZXZlbnRzXG4gICAqL1xuICBudW1QZW5kaW5nRXZlbnRzIDogZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgbnVtID0gMDtcbiAgICAkLmVhY2godGhpcy5fZXZlbnRzLCBmdW5jdGlvbigpIHsgbnVtKys7IH0pO1xuXG4gICAgcmV0dXJuIG51bTtcbiAgfVxufTtcbiJdfQ==