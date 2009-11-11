/**
 * A multipart XmlHttpRequest stream API.
 *
 * @module io-stream
 */

/**
 * Provides a subscribable event named &quot;konami&quot;.
 *
 * @event konami
 * @for YUI
 * @param type {String} 'konami' * @param fn {Function} the callback function
 * @param id {String|Node|etc} the element to bind (typically document) * @param o {Object} optional context object
 * @param args 0..n additional arguments that should be provided 
 * to the listener.
 * @return {Event.Handle} the detach handle 
*/

var STREAM = 'stream',
    STREAMING = 'streaming',
    BOUNDARY = 'boundary',

    isString = Y.Lang.isString,
    isNumber = Y.Lang.isNumber,
    isObject = Y.Lang.isObject,

   /**
    * @description Object that stores timeout values for any transaction with
    * a defined "timeout" configuration property.
    *
    * @property _timeout
    * @private
    * @static
    * @type object
    */
    _timeout = {},

    // Window reference
    w = Y.config.win;

Y.IOStream = function(config) {
    Y.IOStream.superclass.constructor.apply( this, arguments );
};

Y.mix( Y.IOStream, {
    NAME: STREAM,
    ATTRS : {
        'streaming': {
            value: false,
            readOnly: true
        },
        'uri' : {
            validator: isString,
            writeOnce: true
        },
        'boundary' : {
            validator: isString,
            writeOnce: true
        }
    }
});

Y.extend( Y.IOStream, Y.Base, {
    _streaming: false,
    _xhr: null,
    method: 'GET',
    timeout: null,

    openChunk: '',
    currentLength: 0,

    _create_xhr: function() {
        this._streaming = true;

        try { return new XMLHttpRequest(); } catch(e) {}
        try { return new ActiveXObject("MSXML2.XMLHTTP.6.0"); } catch(er) {}
        try { return new ActiveXObject("MSXML3.XMLHTTP"); } catch(err) {}

        this._streaming = false;

        alert("No suitable XmlHttpRequest found");
        //throw new Error("No supported version of XMLHttpRequest, multipart streaming is not available.");
        return null;
    },

    start: function() {
        if ( !this._xhr ) {
            this._xhr = this._create_xhr();
            var _this = this;
            this._xhr.onreadystatechange = function() { _this._readyState(); };
        }
        try {
            Y.log("Opening: " + this.method + "\n" + this.get('uri'));
            this._xhr.open(this.method, this.get('uri'), true);
        } catch( xhr_err ) {
            alert("xhr_err: " + xhr_err);
        }
        this._xhr.send(null);
    },

    stop: function() {
        Y.log("Stopping feed");
        this._xhr.abort();
    },

    _readyState: function() {
        var _this = this;
        /* New data waiting */
        if ( this._xhr.readyState == 3  ) {
            if ( this.get(BOUNDARY) === undefined ) {
                var contentType = this._xhr.getResponseHeader("Content-Type");
                if ( contentType.indexOf("multipart/mixed") < 0 ) {
                    throw new Error("Server is not sending multipart, use a different io module");
                }
                this.set(BOUNDARY, '--' + contentType.split('"')[1]);
            }
            this._handleResponse();
        }
        else if ( this._xhr.readyState == 4 ) {
            Y.log("Stopping the stream.");
            if (this.timeout) {
                w.clearInterval(this.timeout);
                this.timeout = null;
            }
            this._handleResponse();
        }
    },

    _handleCompletePacket: function(str) {
        if ( str.indexOf("\n") == 0 )
            str = str.substring(1);
        // RFC, first line is the header or a blank line.  Either case...
        var header  = str.substring(0, str.indexOf("\n"));
        var body    = str.substring(header.length);

        // RFC 2046 says default is text/plain
        var type    = 'text/plain';

        var headers = {};

        if ( header.indexOf('Content-Type') > -1 ) {
            var bits = header.split(";");
            for ( var i = 0; i < bits.length; i++ ) {
                var bit_bits = bits[i].split(/:\s+/);
                headers[bit_bits[0]] = bit_bits[1];
            }
        }

        Y.fire('stream:packet', body, headers);

        Y.log("Header: " + header);
        //Y.log(body);
    },

    _handleResponse: function() {
        var req  = this._xhr;

        /* Take the last bit */
        var boundary = this.get(BOUNDARY);

        var len  = req.responseText.length;
        var data = req.responseText.substring(this.currentLength, len);
        this.currentLength = len;

        var openChunk = this.openChunk + data;

        var start_flag = 0;
        var end_flag   = 0;
        while ( end_flag > -1 ) {
            end_flag = openChunk.indexOf( boundary );
            /* Got a segment? */
            if ( end_flag >= 0 ) {
                var segment = openChunk.substring(start_flag, end_flag);
                this._handleCompletePacket(segment);
                openChunk  = openChunk.substring(end_flag + boundary.length);
                start_flag = end_flag + 1;
            }
        }
        this.openChunk = openChunk;
    }
});

Y.mix(Y.io, {
    stream: function (uri, config) {
        return new Y.IOStream({
            uri			: uri,
            ioConfig	: config
        });
    }
}, true);

