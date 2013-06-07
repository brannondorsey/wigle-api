// Array.prototype.shift is slow, so we use Tim's Queue data structure instead
// that has a faster shift().
//
// Queue class adapted from Tim Caswell's pattern library
// http://github.com/creationix/pattern/blob/master/lib/pattern/queue.js
var Queue = function () {
    this.tail = [];
    this.head = toArray(arguments);
    this.offset = 0;
};

Queue.prototype.peek = function () {
    return this.head[this.offset] || this.tail[0];
    /*
    if (this.offset === this.head.length) {
        var tmp = this.head;
        tmp.length = 0;
        this.head = this.tail;
        this.tail = tmp;
        this.offset = 0;
        if (this.head.length === 0) return;
    }
    return this.head[this.offset];*/
};

Queue.prototype.shift = function () {
    if (this.offset === this.head.length) {
        var tmp = this.head;
        tmp.length = 0;
        this.head = this.tail;
        this.tail = tmp;
        this.offset = 0;
        if (this.head.length === 0) return;
    }
    return this.head[this.offset++];
};

Queue.prototype.push = function (item) {
    return this.tail.push(item);
};

Object.defineProperty(Queue.prototype, 'length', {
    get: function () {
        return this.head.length - this.offset + this.tail.length;
    }
});

var toArray = function (args) {
    var i = 0,
        len = args.length,
        arr = new Array(len);
    for ( ; i < len; i++) {
        arr[i] = args[i];
    }
    return arr;
};

module.exports = Queue;