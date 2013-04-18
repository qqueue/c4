// ==UserScript==
// @name        c4
// @namespace   https://github.com/qqueue/c4
// @description The Higgs Boson of 4chan userscripts
// @author      queue <queue@lavabit.com>
//
// @license     none (public domain)
// @copyright   none
//
// @match       *://boards.4chan.org/*
// @exclude     *://boards.4chan.org/f/*
// @exclude     *://boards.4chan.org/robots.txt
//
// @run-at      document-start
//
// @grant       none
// ==/UserScript==

(function(){
"use strict";
var c4_COMPILATION_VERSION = 0.7116271876730025;
(function (global) {
    function require(file, parentModule) {
        if ({}.hasOwnProperty.call(require.cache, file))
            return require.cache[file];
        var resolved = require.resolve(file);
        if (!resolved)
            throw new Error('Failed to resolve module ' + file);
        var module$ = {
                id: file,
                require: require,
                filename: file,
                exports: {},
                loaded: false,
                parent: parentModule,
                children: []
            };
        if (parentModule)
            parentModule.children.push(module$);
        var dirname = file.slice(0, file.lastIndexOf('/') + 1);
        require.cache[file] = module$.exports;
        resolved.call(module$.exports, module$, module$.exports, dirname, file);
        module$.loaded = true;
        return require.cache[file] = module$.exports;
    }
    require.modules = {};
    require.cache = {};
    require.resolve = function (file) {
        return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0;
    };
    require.define = function (file, fn) {
        require.modules[file] = fn;
    };
    require.define('/src/c4.co', function (module, exports, __dirname, __filename) {
        var x0$, ref$, page, onready, split$ = ''.split;
        console.group('c4');
        console.timeStamp('c4-init');
        console.time('init');
        console.time('interactive');
        x0$ = global.board = {};
        ref$ = split$.call(window.location.pathname, '/'), x0$.name = ref$[1], page = ref$[2], x0$.threadNo = ref$[3];
        x0$.isCatalog = page === 'catalog';
        if (x0$.isCatalog) {
            x0$.searchTerm = x0$.threadNo;
        }
        x0$.isThread = !x0$.isCatalog && !!x0$.threadNo;
        x0$.isBoard = !x0$.isCatalog && !x0$.isThread;
        x0$.page = parseInt(page, 10) || 0;
        x0$.url = '//boards.4chan.org/' + x0$.name + '/';
        x0$.ready = false;
        x0$.favicons = require('/src/favicon-data.co', module);
        x0$.spoilerUrl = 'https://static.4chan.org/image/spoiler-' + x0$.name + '1.png';
        require('/src/archives.co', module);
        require('/src/backlinks.co', module);
        require('/src/poster.co', module);
        require('/src/updater.co', module);
        require('/src/onready.co', module);
        require('/src/features/forcequotes.co', module);
        require('/src/features/hide-message.co', module);
        require('/src/features/hide.co', module);
        require('/src/features/highlight.co', module);
        require('/src/features/image-expansion.co', module);
        require('/src/features/image-previews.co', module);
        require('/src/features/inlinereplies.co', module);
        require('/src/features/postpreviews.co', module);
        require('/src/features/quote.co', module);
        require('/src/utils/relative-dates.co', module);
        require('/src/features/relative-dates.co', module);
        require('/src/features/youtube.co', module);
        require('/src/features/read-status.co', module);
        onready = require('/src/utils/features.co', module).onready;
        onready(function () {
            console.timeEnd('onready handlers');
            console.timeEnd('interactive');
            console.timeStamp('c4-loaded');
            console.groupEnd();
        });
        console.timeEnd('init');
    });
    require.define('/src/utils/features.co', function (module, exports, __dirname, __filename) {
        var $$, i$, x0$, ref$, len$, onready, onpostinsert, onPosts, out$ = typeof exports != 'undefined' && exports || this;
        $$ = require('/src/utils/dom.co', module).$$;
        function catchEvent(evt) {
            return function (handler) {
                return document.addEventListener(evt, function (it) {
                    var e;
                    try {
                        handler.call(it.detail, it.detail);
                    } catch (e$) {
                        e = e$;
                        console.error(e);
                        throw e;
                    }
                });
            };
        }
        for (i$ = 0, len$ = (ref$ = [
                'prerender',
                'ready',
                'update',
                'postinsert',
                'backlink'
            ]).length; i$ < len$; ++i$) {
            x0$ = ref$[i$];
            exports['on' + x0$] = catchEvent('c4-' + x0$);
        }
        onready = exports.onready, onpostinsert = exports.onpostinsert;
        out$.onPosts = onPosts = function (listenerSpec) {
            var selector, listeners, event, listener;
            for (selector in listenerSpec) {
                listeners = listenerSpec[selector];
                for (event in listeners) {
                    listener = listeners[event];
                    fn$.call(this, selector, listeners, event, listener);
                }
            }
            function fn$(selector, listeners, event, listener) {
                onready(function () {
                    var i$, x1$, ref$, len$;
                    for (i$ = 0, len$ = (ref$ = this.el.querySelectorAll(selector)).length; i$ < len$; ++i$) {
                        x1$ = ref$[i$];
                        x1$.addEventListener(event, listener);
                    }
                    onpostinsert(function () {
                        var i$, x2$, ref$, len$;
                        for (i$ = 0, len$ = (ref$ = this.post.querySelectorAll(selector)).length; i$ < len$; ++i$) {
                            x2$ = ref$[i$];
                            x2$.addEventListener(event, listener);
                        }
                    });
                });
            }
        };
    });
    require.define('/src/utils/dom.co', function (module, exports, __dirname, __filename) {
        var $, $$, L, DOM, ref$, mutationMacro, x0$, classify, closest, out$ = typeof exports != 'undefined' && exports || this;
        out$.$ = $ = function (it) {
            return document.getElementById(it);
        };
        out$.$$ = $$ = function (it) {
            return document.querySelectorAll(it);
        };
        out$.L = L = function (it) {
            return document.createElement(it);
        };
        out$.DOM = DOM = function (it) {
            var x0$;
            x0$ = L('div');
            x0$.innerHTML = it;
            return x0$.firstElementChild;
        };
        (ref$ = Element.prototype).matchesSelector == null && (ref$.matchesSelector = Element.prototype.mozMatchesSelector);
        mutationMacro = function (nodes) {
            var node, i$, len$, n;
            if (nodes.length === 1) {
                return typeof nodes[0] === 'string' ? document.createTextNode(nodes[0]) : nodes[0];
            }
            node = document.createDocumentFragment();
            for (i$ = 0, len$ = nodes.length; i$ < len$; ++i$) {
                n = nodes[i$];
                if (typeof n === 'string') {
                    n = document.createTextNode(n);
                }
                node.appendChild(n);
            }
            return node;
        };
        x0$ = Node.prototype;
        x0$.prepend == null && (x0$.prepend = function () {
            this.insertBefore(mutationMacro(arguments), this.firstChild);
        });
        x0$.append == null && (x0$.append = function () {
            this.appendChild(mutationMacro(arguments));
        });
        x0$.before == null && (x0$.before = function () {
            if (!this.parentNode) {
                return;
            }
            this.parentNode.insertBefore(mutationMacro(arguments), this);
        });
        x0$.after == null && (x0$.after = function () {
            if (!this.parentNode) {
                return;
            }
            this.parentNode.insertBefore(mutationMacro(arguments), this.nextSibling);
        });
        x0$.replace == null && (x0$.replace = function () {
            if (!this.parentNode) {
                return;
            }
            this.parentNode.replaceChild(mutationMacro(arguments), this);
        });
        x0$.remove == null && (x0$.remove = function () {
            if (!this.parentNode) {
                return;
            }
            this.parentNode.removeChild(this);
        });
        out$.classify = classify = function () {
            classify.displayName = 'classify';
            var prototype = classify.prototype, constructor = classify;
            function classify(els) {
                var this$ = this instanceof ctor$ ? this : new ctor$();
                this$.els = els;
                return this$;
            }
            function ctor$() {
            }
            ctor$.prototype = prototype;
            prototype.add = function (it) {
                var i$, ref$, len$, el;
                for (i$ = 0, len$ = (ref$ = this.els).length; i$ < len$; ++i$) {
                    el = ref$[i$];
                    el.classList.add(it);
                }
            };
            prototype.remove = function (it) {
                var i$, ref$, len$, el;
                for (i$ = 0, len$ = (ref$ = this.els).length; i$ < len$; ++i$) {
                    el = ref$[i$];
                    el.classList.remove(it);
                }
            };
            prototype.toggle = function (it) {
                var i$, ref$, len$, el;
                for (i$ = 0, len$ = (ref$ = this.els).length; i$ < len$; ++i$) {
                    el = ref$[i$];
                    el.classList.toggle(it);
                }
            };
            return classify;
        }();
        out$.closest = closest = function (selector, el) {
            for (; el; el = el.parentElement) {
                if (el.matchesSelector(selector)) {
                    return el;
                }
            }
        };
    });
    require.define('/src/features/read-status.co', function (module, exports, __dirname, __filename) {
        var ref$, get, set, sset, sget, ref1$, onready, onpostinsert, ref2$, $, $$, ref3$, debounce, defer, threshold, read, unread;
        ref$ = require('/src/utils/storage.co', module), get = ref$.get, set = ref$.set, sset = ref$.sset, sget = ref$.sget;
        ref1$ = require('/src/utils/features.co', module), onready = ref1$.onready, onpostinsert = ref1$.onpostinsert;
        ref2$ = require('/src/utils/dom.co', module), $ = ref2$.$, $$ = ref2$.$$;
        ref3$ = require('/src/utils/timing.co', module), debounce = ref3$.debounce, defer = ref3$.defer;
        threshold = 604800000;
        read = get('read') || {};
        (function (now) {
            var no, ref$, expiry;
            for (no in ref$ = read) {
                expiry = ref$[no];
                if (now - expiry > threshold) {
                    delete hash[key];
                }
            }
        }.call(this, Date.now()));
        unread = [];
        onready(function () {
            var visible, pageBottom, i$, x0$, ref$, len$;
            visible = [];
            pageBottom = window.scrollY + window.innerHeight;
            for (i$ = 0, len$ = (ref$ = $$('.post')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                if (!read[x0$.dataset.no]) {
                    x0$.classList.add('unread');
                    if (x0$.getBoundingClientRect().bottom > pageBottom) {
                        unread.push(x0$);
                    } else {
                        visible.push(x0$);
                    }
                }
            }
            defer(2000, function () {
                var now, pageBottom, i$, x1$, ref$, len$;
                now = Date.now();
                pageBottom = window.scrollY + window.innerHeight;
                for (i$ = 0, len$ = (ref$ = visible).length; i$ < len$; ++i$) {
                    x1$ = ref$[i$];
                    if (x1$.getBoundingClientRect().bottom > pageBottom) {
                        x1$.classList.remove('unread');
                        read[x1$.dataset.no] = now;
                    } else {
                        unread.push(x1$);
                    }
                }
            });
            window.addEventListener('scroll', debounce(1000, function () {
                var pageBottom, stillUnread, i$, x1$, ref$, len$, bot;
                pageBottom = window.scrollY + window.innerHeight;
                stillUnread = [];
                for (i$ = 0, len$ = (ref$ = unread).length; i$ < len$; ++i$) {
                    x1$ = ref$[i$];
                    bot = x1$.getBoundingClientRect().bottom;
                    if (bot < pageBottom) {
                        x1$.classList.remove('unread');
                        read[x1$.dataset.no] = Date.now();
                    } else {
                        stillUnread.push(x1$);
                    }
                }
                unread = stillUnread;
            }));
            window.addEventListener('unload', function () {
                var ref$;
                set('read', (ref$ = {}, import$(ref$, read), import$(ref$, get('read'))));
            });
        });
        onpostinsert(function () {
            var x0$, idx;
            if (this.post.classList.contains('new')) {
                unread.push(this.post);
                this.post.classList.add('unread');
            } else {
                x0$ = $('p' + this.post.dataset.no);
                if (x0$ != null) {
                    x0$.classList.remove('unread');
                    if ((idx = unread.indexOf(x0$)) >= 0) {
                        unread.splice(idx, 1);
                    }
                    if (!read[x0$.dataset.no]) {
                        read[x0$.dataset.no] = Date.now();
                    }
                }
            }
        });
        function import$(obj, src) {
            var own = {}.hasOwnProperty;
            for (var key in src)
                if (own.call(src, key))
                    obj[key] = src[key];
            return obj;
        }
    });
    require.define('/src/utils/timing.co', function (module, exports, __dirname, __filename) {
        var debounce, debounceLeading, defer, repeat, out$ = typeof exports != 'undefined' && exports || this, slice$ = [].slice;
        out$.debounce = debounce = function (delay, fn) {
            var timeout;
            return function () {
                var ctx, args;
                ctx = this;
                args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    fn.apply(ctx, args);
                }, delay);
            };
        };
        out$.debounceLeading = debounceLeading = function (delay, fn) {
            var timeout, reset;
            reset = function () {
                timeout = null;
            };
            return function () {
                if (!timeout) {
                    fn.apply(this, arguments);
                    return timeout = defer(delay, reset);
                }
            };
        };
        out$.defer = defer = function (delay, fn) {
            var args;
            if (typeof delay === 'function') {
                fn = delay;
                delay = 4;
                args = Array.prototype.slice.call(arguments, 2);
            } else {
                args = Array.prototype.slice.call(arguments, 1);
            }
            return setTimeout.apply(null, [
                fn,
                delay
            ].concat(args));
        };
        out$.repeat = repeat = function () {
            repeat.displayName = 'repeat';
            var prototype = repeat.prototype, constructor = repeat;
            function repeat(delay, options, fn) {
                var this$ = this instanceof ctor$ ? this : new ctor$();
                this$.delay = delay;
                if (typeof options === 'function') {
                    fn = options;
                    options = {};
                }
                this$.fn = fn;
                this$.timeoutee = function () {
                    this$.fn.apply(this$, arguments);
                    if (this$.auto && !this$.stopped) {
                        this$.repeat();
                    }
                };
                this$.auto = options.auto != null ? options.auto : true;
                if (options.start !== false) {
                    this$.start();
                }
                return this$;
            }
            function ctor$() {
            }
            ctor$.prototype = prototype;
            prototype.stop = function () {
                this.stopped = true;
                clearTimeout(this.timeout);
            };
            prototype.start = function () {
                var args;
                args = slice$.call(arguments);
                this.stop();
                this.timeout = setTimeout.apply(null, [
                    this.timeoutee,
                    this.delay
                ].concat(args));
                this.stopped = false;
            };
            prototype.restart = prototype.start;
            prototype.repeat = prototype.start;
            return repeat;
        }();
    });
    require.define('/src/utils/storage.co', function (module, exports, __dirname, __filename) {
        var setter, getter, ref$, out$ = typeof exports != 'undefined' && exports || this;
        setter = function (storage) {
            return function (key, val) {
                var obj, ref$, ref1$;
                if (val != null) {
                    obj = (ref$ = {}, ref$[key] = val, ref$);
                }
                for (key in ref1$ = obj || key) {
                    val = ref1$[key];
                    storage.setItem('c4-' + key, JSON.stringify(val));
                }
            };
        };
        getter = function (storage) {
            return function (key, reviver) {
                try {
                    return JSON.parse(storage.getItem('c4-' + key), reviver);
                } catch (e$) {
                }
            };
        };
        ref$ = out$;
        ref$.set = setter(localStorage);
        ref$.get = getter(localStorage);
        ref$.sset = setter(sessionStorage);
        ref$.sget = getter(sessionStorage);
    });
    require.define('/src/features/youtube.co', function (module, exports, __dirname, __filename) {
        var ref$, onready, onpostinsert, ref1$, L, $, $$, truncate, ref2$, defer, debounce, ref3$, sget, sset, apiKey, batchSize, rate, requestQueue, ready, queue, cache, setTitle, pendingVideos, queuedVideos, toFetch, loadInfo, batchRequests, onclick;
        ref$ = require('/src/utils/features.co', module), onready = ref$.onready, onpostinsert = ref$.onpostinsert;
        ref1$ = require('/src/utils/dom.co', module), L = ref1$.L, $ = ref1$.$, $$ = ref1$.$$;
        truncate = require('/src/utils/string.co', module).truncate;
        ref2$ = require('/src/utils/timing.co', module), defer = ref2$.defer, debounce = ref2$.debounce;
        ref3$ = require('/src/utils/storage.co', module), sget = ref3$.sget, sset = ref3$.sset;
        apiKey = 'AIzaSyCe5gXUv-EFyNMoESO8ONZnottbsd-2ayA';
        batchSize = 30;
        rate = 5000;
        requestQueue = [];
        ready = true;
        queue = function (req) {
            requestQueue.push(req);
            req.addEventListener('loadend', function () {
                requestQueue.shift();
                defer(rate, function () {
                    var that;
                    if (that = requestQueue[0]) {
                        that.send();
                    } else {
                        ready = true;
                    }
                });
            });
            if (ready) {
                ready = false;
                req.send();
            }
        };
        cache = sget('youtube') || {};
        window.addEventListener('unload', function () {
            sset('youtube', cache);
        });
        setTitle = function (vid, data) {
            vid.title = data.statistics.viewCount + ' views.\n\n' + truncate(data.snippet.description, 200);
            vid.dataset.title = data.snippet.title;
        };
        pendingVideos = [];
        queuedVideos = {};
        toFetch = {};
        loadInfo = function () {
            var i$, ref$, len$, vid, that;
            for (i$ = 0, len$ = (ref$ = pendingVideos).length; i$ < len$; ++i$) {
                vid = ref$[i$];
                vid.addEventListener('click', onclick);
                if (that = cache[vid.dataset.id]) {
                    setTitle(vid, that);
                } else if (!queuedVideos[vid.dataset.id]) {
                    toFetch[vid.dataset.id] = true;
                }
            }
            pendingVideos = [];
            batchRequests();
        };
        batchRequests = debounce(1000, function () {
            var batches, batch, id, i$, len$;
            batches = [];
            batch = [];
            for (id in toFetch) {
                queuedVideos[id] = true;
                batch.push(id);
                if (batch.length === batchSize) {
                    batches.push(batch);
                    batch = [];
                }
            }
            batches.push(batch);
            toFetch = {};
            for (i$ = 0, len$ = batches.length; i$ < len$; ++i$) {
                batch = batches[i$];
                if (batch.length > 0) {
                    fn$.call(this, new XMLHttpRequest(), batch);
                }
            }
            function fn$(req, batch) {
                req.open('GET', 'https://www.googleapis.com/youtube/v3/videos?id=' + encodeURIComponent(batch) + '&part=snippet%2C+statistics&fields=items(id%2Csnippet%2Cstatistics)&key=' + apiKey);
                req.addEventListener('load', function () {
                    var ref$, data, i$, ref1$, len$, v, j$, ref2$, len1$, vid, k$, ref3$, len2$, l$, x0$, ref4$, len3$;
                    if (200 <= (ref$ = this.status) && ref$ < 400) {
                        data = JSON.parse(this.response);
                        for (i$ = 0, len$ = (ref1$ = data.items).length; i$ < len$; ++i$) {
                            v = ref1$[i$];
                            cache[v.id] = v;
                            for (j$ = 0, len1$ = (ref2$ = $$('.youtube[data-id="' + v.id + '"]')).length; j$ < len1$; ++j$) {
                                vid = ref2$[j$];
                                setTitle(vid, v);
                            }
                        }
                        for (k$ = 0, len2$ = (ref3$ = batch).length; k$ < len2$; ++k$) {
                            v = ref3$[k$];
                            if (!cache[v.id]) {
                                for (l$ = 0, len3$ = (ref4$ = $$('.youtube[data-id="' + v.id + '"]')).length; l$ < len3$; ++l$) {
                                    x0$ = ref4$[l$];
                                    x0$.dataset.title = '[Error Fetching Title]';
                                    x0$.title = 'Sorry, this video might have been removed or blocked.';
                                }
                            }
                        }
                    } else {
                        console.error('error fetching youtube info!', this);
                    }
                });
                req.addEventListener('error', function () {
                    console.error('what happen', this);
                });
                req.addEventListener('loadend', function () {
                    var i$, ref$, len$, v;
                    for (i$ = 0, len$ = (ref$ = batch).length; i$ < len$; ++i$) {
                        v = ref$[i$];
                        delete queuedVideos[v];
                    }
                });
                queue(req);
            }
        });
        onclick = function (e) {
            var x0$;
            if (!(e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) {
                e.preventDefault();
                this.replace((x0$ = L('iframe'), x0$.width = 560, x0$.height = 315, x0$.src = '//www.youtube.com/embed/' + this.dataset.id + '?' + (this.dataset.params || '') + '&amp;autoplay=1&amp;wmode=transparent', x0$.frameborder = 0, x0$.allowfullscreen = '', x0$));
            }
        };
        onready(function () {
            pendingVideos.push.apply(pendingVideos, $$('.youtube'));
            loadInfo();
            onpostinsert(function () {
                pendingVideos.push.apply(pendingVideos, this.post.querySelectorAll('.youtube'));
                loadInfo();
            });
        });
    });
    require.define('/src/utils/string.co', function (module, exports, __dirname, __filename) {
        var truncate, out$ = typeof exports != 'undefined' && exports || this;
        out$.truncate = truncate = function (it, length) {
            length == null && (length = 20);
            if (it.length > length) {
                return it.substring(0, length) + '...';
            } else {
                return it;
            }
        };
    });
    require.define('/src/features/relative-dates.co', function (module, exports, __dirname, __filename) {
        var $$, ref$, onpostinsert, onready, ref1$, keepUpToDate, periodic, flush;
        $$ = require('/src/utils/dom.co', module).$$;
        ref$ = require('/src/utils/features.co', module), onpostinsert = ref$.onpostinsert, onready = ref$.onready;
        ref1$ = require('/src/utils/relative-dates.co', module), keepUpToDate = ref1$.keepUpToDate, periodic = ref1$.periodic, flush = ref1$.flush;
        window.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                flush();
            }
        });
        onready(function () {
            var i$, x0$, ref$, len$;
            console.log('keeping relative dates...');
            periodic.start();
            for (i$ = 0, len$ = (ref$ = $$('time')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                keepUpToDate(x0$);
            }
            onpostinsert(function () {
                keepUpToDate(this.post.querySelector('time'));
                flush();
            });
        });
    });
    require.define('/src/utils/relative-dates.co', function (module, exports, __dirname, __filename) {
        var ref$, repeat, defer, debounceLeading, YEAR, HALFYEAR, MONTH, HALFMONTH, DAY, HALFDAY, HOUR, HALFHOUR, MINUTE, HALFMINUTE, SECOND, HALFSECOND, pluralize, stale, flush, periodic, keepUpToDate, relativeDate, out$ = typeof exports != 'undefined' && exports || this;
        ref$ = require('/src/utils/timing.co', module), repeat = ref$.repeat, defer = ref$.defer, debounceLeading = ref$.debounceLeading;
        YEAR = 31560000000;
        HALFYEAR = YEAR / 2;
        MONTH = 2629740000;
        HALFMONTH = MONTH / 2;
        DAY = 86400000;
        HALFDAY = DAY / 2;
        HOUR = 3600000;
        HALFHOUR = HOUR / 2;
        MINUTE = 60000;
        HALFMINUTE = MINUTE / 2;
        SECOND = 1000;
        HALFSECOND = SECOND / 2;
        pluralize = function (number, unit) {
            return Math.round(number) + ' ' + unit + (number >= 1.5 ? 's' : '') + ' ago';
        };
        stale = [];
        out$.flush = flush = debounceLeading(SECOND, function () {
            var now, i$, x0$, ref$, len$;
            now = Date.now();
            for (i$ = 0, len$ = (ref$ = stale).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                x0$(now);
            }
            stale.length = 0;
            periodic.restart();
        });
        out$.periodic = periodic = repeat(MINUTE, { auto: false }, flush);
        out$.keepUpToDate = keepUpToDate = function (el) {
            var time, update, addToStale, makeTimeout;
            time = new Date(el.getAttribute('datetime'));
            update = function (now) {
                if (document.contains(el)) {
                    el.textContent = relativeDate(time, now);
                    makeTimeout(now - time.getTime());
                }
            };
            addToStale = function () {
                stale.push(update);
            };
            makeTimeout = function (diff) {
                var delay;
                delay = diff < MINUTE ? SECOND - (diff + HALFSECOND) % SECOND : diff < HOUR ? MINUTE - (diff + HALFMINUTE) % MINUTE : diff < DAY ? HOUR - (diff - HALFHOUR) % HOUR : diff < MONTH ? DAY - (diff - HALFDAY) % DAY : diff < YEAR ? MONTH - (diff - HALFMONTH) % MONTH : YEAR - (diff - HALFYEAR) % YEAR;
                defer(delay, addToStale);
            };
            makeTimeout(Date.now() - time.getTime());
        };
        out$.relativeDate = relativeDate = function (date, relativeTo) {
            var diff, absdiff, number, unit;
            relativeTo == null && (relativeTo = Date.now());
            diff = relativeTo - date.getTime();
            absdiff = Math.abs(diff);
            if (absdiff < MINUTE) {
                number = absdiff / SECOND;
                unit = 'second';
            } else if (absdiff < HOUR) {
                number = absdiff / MINUTE;
                unit = 'minute';
            } else if (absdiff < DAY) {
                number = absdiff / HOUR;
                unit = 'hour';
            } else if (absdiff < MONTH) {
                number = absdiff / DAY;
                unit = 'day';
            } else if (absdiff < YEAR) {
                number = absdiff / MONTH;
                unit = 'month';
            } else {
                number = absdiff / YEAR;
                unit = 'year';
            }
            number = Math.round(number);
            if (number !== 1) {
                unit += 's';
            }
            if (diff > 0) {
                return number + ' ' + unit + ' ago';
            } else {
                return 'in ' + number + ' ' + unit;
            }
        };
    });
    require.define('/src/features/quote.co', function (module, exports, __dirname, __filename) {
        var onPosts, $;
        onPosts = require('/src/utils/features.co', module).onPosts;
        $ = require('/src/utils/dom.co', module).$;
        onPosts({
            '.no': {
                click: function (e) {
                    var selection, x0$;
                    e.preventDefault();
                    selection = window.getSelection().toString().trim();
                    if (selection) {
                        selection = '>' + selection + '\n';
                    }
                    x0$ = $('comment');
                    x0$.value += '>>' + this.textContent + '\n' + selection;
                    x0$.focus();
                }
            }
        });
    });
    require.define('/src/features/postpreviews.co', function (module, exports, __dirname, __filename) {
        var ref$, onPosts, onbacklink, defer, ref1$, DOM, $$, $, closest, classify, parser, postTemplate, listen, fetchNewPost, handlePreview, createPreview, split$ = ''.split;
        ref$ = require('/src/utils/features.co', module), onPosts = ref$.onPosts, onbacklink = ref$.onbacklink;
        defer = require('/src/utils/timing.co', module).defer;
        ref1$ = require('/src/utils/dom.co', module), DOM = ref1$.DOM, $$ = ref1$.$$, $ = ref1$.$, closest = ref1$.closest, classify = ref1$.classify;
        parser = require('/src/parser/index.co', module);
        postTemplate = require('/templates/post.cojade', module);
        listen = require('/src/utils/listen.co', module);
        fetchNewPost = function (no) {
            var ref$, boardName, thread, link, x0$, xhr, stillHovered;
            ref$ = this.pathname.split('/'), boardName = ref$[1], thread = ref$[3];
            if (!thread) {
                return;
            }
            link = this;
            this.style.cursor = 'progress';
            x0$ = xhr = new XMLHttpRequest();
            x0$.open('GET', '//api.4chan.org/' + boardName + '/res/' + thread + '.json');
            x0$.onload = function () {
                var thread, i$, x1$, ref$, len$;
                if (this.status === 200) {
                    thread = parser.api(JSON.parse(this.response), boardName);
                    if (stillHovered) {
                        link.style.removeProperty('cursor');
                        for (i$ = 0, len$ = (ref$ = thread.posts).length; i$ < len$; ++i$) {
                            x1$ = ref$[i$];
                            board.posts[x1$.no] = x1$;
                        }
                        board.threadsById[thread.no] = thread;
                        createPreview.call(link, no, board.posts[no], thread);
                    }
                }
            };
            x0$.send();
            stillHovered = true;
            this.addEventListener('mouseout', function () {
                function out() {
                    stillHovered = false;
                    this.style.removeProperty('cursor');
                    return this.removeEventListener('mouseout', out);
                }
                return out;
            }());
        };
        handlePreview = function () {
            var no, post;
            if (this.classList.contains('inlinedlink') || this.classList.contains('recursivelink')) {
                return;
            }
            no = this.hash.substring(2);
            if (!(post = board.posts[no])) {
                fetchNewPost.call(this, no);
            } else {
                createPreview.call(this, no, post);
            }
        };
        createPreview = function (no, post) {
            var ref$, host, hostid, ref1$, width, height, left, top, preview, x0$, i$, x1$, ref2$, len$, x2$, x3$, ref3$, ref4$, ref5$, ref6$, ref7$, x4$, docWidth;
            if ((ref$ = $('postpreview')) != null) {
                ref$.remove();
            }
            host = closest('.post', this);
            hostid = split$.call(host.id, '-').pop();
            ref1$ = this.getBoundingClientRect(), width = ref1$.width, height = ref1$.height, left = ref1$.left, top = ref1$.top;
            preview = DOM(postTemplate(post, {
                thread: board.threadsById[post.threadNo],
                container: 'article',
                id: 'postpreview'
            }));
            x0$ = preview;
            document.dispatchEvent(new CustomEvent('c4-postinsert', { detail: { post: preview } }));
            for (i$ = 0, len$ = (ref2$ = x0$.querySelectorAll('.quotelink[href$="' + hostid + '"]')).length; i$ < len$; ++i$) {
                x1$ = ref2$[i$];
                x1$.className = 'recursivelink';
                x1$.removeAttribute('href');
            }
            x2$ = x0$.querySelector('.comment');
            if (x2$.querySelectorAll('.quotelink').length === 0) {
                x3$ = x2$.firstElementChild;
                if ((x3$ != null ? x3$.className : void 8) === 'recursivelink') {
                    while (((ref3$ = x3$.nextSibling) != null ? ref3$.tagName : void 8) === 'BR' || (ref4$ = x3$.nextSibling) != null && ((ref5$ = ref4$.classList) != null && ref5$.contains('forcedquote')) || (ref6$ = x3$.nextSibling) != null && ((ref7$ = ref6$.classList) != null && ref7$.contains('forcedimage'))) {
                        x3$.nextSibling.remove();
                    }
                    x3$.remove();
                }
            }
            x4$ = x0$.style;
            x4$.position = 'fixed';
            if (left > (docWidth = document.documentElement.clientWidth) / 2) {
                x4$.right = docWidth - left - width + 'px';
            } else {
                x4$.left = left + 'px';
            }
            if (this.classList.contains('backlink')) {
                x4$.top = top + height + 5 + 'px';
            } else {
                x4$.bottom = window.innerHeight - top + 5 + 'px';
            }
            document.body.appendChild(x0$);
            classify($$('.post[data-no="' + no + '"]')).add('hovered');
            listen(this).once('mouseout', function () {
                preview.remove();
                classify($$('.post[data-no="' + no + '"]')).remove('hovered');
            });
        };
        onPosts({ '.quotelink': { mouseover: handlePreview } });
        onbacklink(function () {
            this.backlink.addEventListener('mouseover', handlePreview);
        });
    });
    require.define('/src/utils/listen.co', function (module, exports, __dirname, __filename) {
        var listen, split$ = ''.split;
        module.exports = listen = function () {
            listen.displayName = 'listen';
            var prototype = listen.prototype, constructor = listen;
            function listen(element) {
                var this$ = this instanceof ctor$ ? this : new ctor$();
                this$.element = element;
                return this$;
            }
            function ctor$() {
            }
            ctor$.prototype = prototype;
            prototype.on = function (event, handler) {
                var ref$;
                if ((ref$ = this.element) != null) {
                    ref$.addEventListener(event, handler);
                }
                return this;
            };
            prototype.once = function (event, handler) {
                var ref$;
                if ((ref$ = this.element) != null) {
                    ref$.addEventListener(event, function () {
                        function once(e) {
                            var target;
                            target = e.target;
                            this.removeEventListener(event, once);
                            return handler.apply(this, arguments);
                        }
                        return once;
                    }());
                }
                return this;
            };
            prototype.off = function (event, handler) {
                var ref$;
                if ((ref$ = this.element) != null) {
                    ref$.removeEventListener(event, handler);
                }
                return this;
            };
            [
                'on',
                'once',
                'off'
            ].forEach(function (method) {
                var original;
                original = prototype[method];
                prototype[method] = function (event, handler) {
                    var i$, x0$, ref$, len$;
                    for (i$ = 0, len$ = (ref$ = split$.call(event, ' ')).length; i$ < len$; ++i$) {
                        x0$ = ref$[i$];
                        original.call(this, x0$, handler);
                    }
                    return this;
                };
            });
            [
                'click',
                'mouseover',
                'scroll'
            ].forEach(function (e) {
                prototype[e] = function (selector, handler) {
                    return this.on(e, selector, handler);
                };
            });
            return listen;
        }();
    });
    require.define('/templates/post.cojade', function (module, exports, __dirname, __filename) {
        var classes, join;
        classes = function (it) {
            var c;
            c = 'post ';
            if (it.image) {
                c += 'imagepost ';
            }
            if (it.sage) {
                c += 'sage ';
            }
            if (it.tripcode) {
                c += 'tripcoded ';
            }
            if (it.capcode) {
                c += it.capcode === '## Admin' ? 'admin ' : 'mod ';
            }
            if (it.uid) {
                c += 'uid ';
            }
            return c;
        };
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            var enhancer, relativeDate, that, b;
            return '    ' + (enhancer = require('/src/enhancer.co', module), '') + '\n' + (relativeDate = require('/src/utils/relative-dates.co', module).relativeDate, '') + '\n<' + extra.container + ' data-no="' + locals.no + '" data-idx="' + locals.idx + '" id="' + (extra.id || 'p' + locals.no) + '" class="' + (extra.classes || '') + ' ' + classes(locals) + '">\n  <h1 class="post-header">\n    <button type="button" value="' + locals.no + '" class="hide">&times;</button>\n    <button type="submit" form="reportform" name="no" value="' + locals.no + '" class="report">!</button><a href="' + locals.url + '" class="subject">' + (locals.subject || '') + '</a>' + ((locals.email ? '<a href="' + ('mailto:' + locals.email) + '" class="name">' + (locals.name || '') + '</a>' : '<a class="name">' + (locals.name || '') + '</a>') || '') + '<span class="tripcode">' + (locals.tripcode || '') + '</span><span class="capcode">' + (locals.capcode || '') + '</span><span class="posteruid">' + (((that = locals.uid) ? '(ID: ' + that + ')' : void 8) || '') + '</span>\n    <time pubdate="pubdate" datetime="' + locals.time.toISOString() + '" title="' + locals.time + '">' + (relativeDate(locals.time) || '') + '</time><a href="' + locals.url + '" class="permalink">No.<span class="no">' + (locals.no || '') + '</span></a>\n  </h1>' + ((locals.image ? '<div class="fileinfo"><span class="filename">' + (locals.image.filename || '') + '</span><span class="dimensions">' + (locals.image.width + 'x' + locals.image.height || '') + '</span><span class="size">' + (locals.image.size || '') + '</span><a href="http://iqdb.org/?url=http:' + locals.image.url + '" target="_blank" class="saucelink">iqdb</a><a href="http://google.com/searchbyimage?image_url=http:' + locals.image.url + '" target="_blank" class="saucelink">google</a><a href="http://regex.info/exif.cgi/exif.cgi?imgurl=http:' + locals.image.url + '" target="_blank" class="saucelink">exif</a><a href="http://archive.foolz.us/' + board.name + '/search/image/' + encodeURIComponent(locals.image.md5) + '" target="_blank" class="saucelink">foolz</a></div><a target="_blank" href="' + locals.image.url + '" data-width="' + locals.image.width + '" data-height="' + locals.image.height + '" class="file"><img src="' + (locals.image.spoiler ? board.spoilerUrl : locals.image.thumb.url) + '" width="' + (!locals.image.spoiler ? locals.image.thumb.width : '') + '" height="' + (!locals.image.spoiler ? locals.image.thumb.height : '') + '" class="thumb"/></a>' : locals.deletedImage ? '<img alt="File deleted." src="//static.4chan.org/image/filedeleted.gif" class="deleted-image"/>' : void 8) || '') + '\n  <div class="comment">' + (enhancer.enhance(locals.comment) || '') + '</div>\n  <div class="backlinks">' + (join(function () {
                var i$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = locals.backlinks).length; i$ < len$; ++i$) {
                    b = ref$[i$];
                    results$.push('<a href="' + '#' + 'p' + b + '" class="backlink quotelink">' + ('\xab' + extra.thread.post[b].idx || '') + '</a>');
                }
                return results$;
            }()) || '') + '</div>\n</' + extra.container + '>';
        };
    });
    require.define('/src/enhancer.co', function (module, exports, __dirname, __filename) {
        var enhancer;
        module.exports = enhancer = {
            replacements: [
                [
                    /<wbr>/g,
                    ''
                ],
                [
                    /(?:https?:\/\/)?(?:www\.)?(youtu\.be\/([\w\-_]+)(\?[&=\w\-_;\#]*)?|youtube\.com\/watch\?([&=\w\-_;\.\?\#\%]*)v=([\w\-_]+)([&=\w\-\._;\?\#\%]*))/g,
                    '<a href="https://$1" class="youtube" data-id="$2$5" data-params="$3$4$6" target="_blank"><img src="//img.youtube.com/vi/$2$5/2.jpg"></a>'
                ],
                [
                    /\((https?:\/\/)([^<\s\)]+)\)/g,
                    '(<a class="external" rel="noreferrer" href="$1$2" title="$1$2" target="_blank">$2</a>)'
                ],
                [
                    /([^"']|^)(https?:\/\/)([^<\s]+)/g,
                    '$1<a class="external" rel="noreferrer" href="$2$3" title="$2$3" target="_blank">$3</a>'
                ],
                [
                    /(^|>|;|\s)([\w\.\-]+\.(?:com|net|org|eu|jp|us|co\.uk)(\/[^<\s]*)?(?=[\s<]|$))/g,
                    '$1<a class="external" rel="noreferrer" href="http://$2" title="$2" target="_blank">$2</a>'
                ]
            ],
            addReplacement: function (pattern, replacement) {
                this.replacements.push([
                    pattern,
                    replacement
                ]);
            },
            enhance: function (it) {
                var i$, ref$, len$, ref1$, pattern, replacement;
                for (i$ = 0, len$ = (ref$ = enhancer.replacements).length; i$ < len$; ++i$) {
                    ref1$ = ref$[i$], pattern = ref1$[0], replacement = ref1$[1];
                    it = it.replace(pattern, replacement);
                }
                return it;
            }
        };
    });
    require.define('/src/parser/index.co', function (module, exports, __dirname, __filename) {
        var ref$, out$ = typeof exports != 'undefined' && exports || this;
        ref$ = out$;
        ref$.dom = require('/src/parser/DOM.co', module);
        ref$.api = require('/src/parser/API.co', module);
    });
    require.define('/src/parser/API.co', function (module, exports, __dirname, __filename) {
        var quotelinksOf, slice$ = [].slice;
        quotelinksOf = require('/src/parser/quotelinks-of.co', module);
        module.exports = function (data, board) {
            return new APIThread(data, board);
        };
        APIThread.prototype = require('/src/parser/Thread.co', module).prototype;
        function APIThread(data, board) {
            var ref$, op, replies, thumbsBase, imagesBase, threadUrl, idx, res$, i$, x0$, len$;
            ref$ = data.posts, op = ref$[0], replies = slice$.call(ref$, 1);
            thumbsBase = '//thumbs.4chan.org/' + board + '/thumb/';
            imagesBase = '//images.4chan.org/' + board + '/src/';
            threadUrl = '//boards.4chan.org/' + board + '/res/';
            this.no = op.no;
            this.url = threadUrl + op.no;
            this.preview = !!op.omitted_posts;
            this.sticky = !!op.sticky;
            this.closed = !!op.closed;
            this.op = new APIPost(this, true, op, 0, imagesBase, thumbsBase);
            idx = 1 + (op.omitted_posts || 0);
            res$ = [];
            for (i$ = 0, len$ = replies.length; i$ < len$; ++i$) {
                x0$ = replies[i$];
                res$.push(new APIPost(this, false, x0$, idx++, imagesBase, thumbsBase));
            }
            this.replies = res$;
            this.postprocess();
        }
        APIPost.prototype = require('/src/parser/Post.co', module).prototype;
        function APIPost(thread, op, data, idx, imagesBase, thumbsBase) {
            this.op = op;
            this.idx = idx;
            this.no = data.no;
            this.subject = data.sub;
            this.name = data.name;
            this.tripcode = data.trip;
            this.uid = data.id;
            this.capcode = data.capcode;
            this.email = data.email;
            this.threadNo = thread.no;
            this.url = thread.url + '#p' + data.no;
            this.time = new Date(data.time * 1000);
            this.sage = data.email === 'sage';
            this.comment = data.com || '';
            this.deletedImage = !!data.filedeleted;
            this.image = data.fsize ? new APIImage(data, imagesBase, thumbsBase) : void 8;
            this.quotelinks = quotelinksOf(this.comment);
            this.backlinks = [];
        }
        APIImage.prototype = require('/src/parser/FImage.co', module).prototype;
        function APIImage(data, imagesBase, thumbsBase) {
            this.thumb = new APIThumb(data, thumbsBase);
            this.url = imagesBase + data.tim + data.ext;
            this.width = data.w;
            this.height = data.h;
            this.size = humanized(data.fsize);
            this.filename = data.filename + data.ext;
            this.md5 = data.md5;
            this.spoiler = !!data.spoiler;
        }
        APIThumb.prototype = require('/src/parser/Thumb.co', module).prototype;
        function APIThumb(data, thumbsBase) {
            this.url = thumbsBase + data.tim + 's.jpg';
            this.width = data.tn_w;
            this.height = data.tn_h;
        }
        function humanized(bytes) {
            var kbytes;
            if (bytes < 1024) {
                return bytes + ' B';
            } else if ((kbytes = Math.round(bytes / 1024)) < 1024) {
                return kbytes + ' KB';
            } else {
                return (kbytes / 1024).toString().substring(0, 3) + ' MB';
            }
        }
    });
    require.define('/src/parser/Thumb.co', function (module, exports, __dirname, __filename) {
        var Thumb;
        module.exports = Thumb = function () {
            Thumb.displayName = 'Thumb';
            var prototype = Thumb.prototype, constructor = Thumb;
            function Thumb() {
            }
            return Thumb;
        }();
    });
    require.define('/src/parser/FImage.co', function (module, exports, __dirname, __filename) {
        var FImage;
        module.exports = FImage = function () {
            FImage.displayName = 'FImage';
            var prototype = FImage.prototype, constructor = FImage;
            function FImage() {
            }
            return FImage;
        }();
    });
    require.define('/src/parser/Post.co', function (module, exports, __dirname, __filename) {
        var Post;
        module.exports = Post = function () {
            Post.displayName = 'Post';
            var prototype = Post.prototype, constructor = Post;
            function Post() {
            }
            return Post;
        }();
    });
    require.define('/src/parser/Thread.co', function (module, exports, __dirname, __filename) {
        var Thread, slice$ = [].slice;
        module.exports = Thread = function () {
            Thread.displayName = 'Thread';
            var prototype = Thread.prototype, constructor = Thread;
            prototype.postprocess = function () {
                var ref$, i$, ref1$, len$, reply, j$, ref2$, len1$, post, k$, ref3$, len2$, quoted, ref4$;
                this.posts = [this.op].concat(slice$.call(this.replies));
                this.imageReplies = [];
                this.post = (ref$ = {}, ref$[this.no] = this.op, ref$);
                for (i$ = 0, len$ = (ref1$ = this.replies).length; i$ < len$; ++i$) {
                    reply = ref1$[i$];
                    if (reply.image) {
                        this.imageReplies.push(reply);
                    }
                    this.post[reply.no] = reply;
                }
                for (j$ = 0, len1$ = (ref2$ = this.posts).length; j$ < len1$; ++j$) {
                    post = ref2$[j$];
                    for (k$ = 0, len2$ = (ref3$ = post.quotelinks).length; k$ < len2$; ++k$) {
                        quoted = ref3$[k$];
                        if ((ref4$ = this.post[quoted]) != null) {
                            ref4$.backlinks.push(post.no);
                        }
                    }
                }
                return Thread[this.no] = this;
            };
            function Thread() {
            }
            return Thread;
        }();
    });
    require.define('/src/parser/quotelinks-of.co', function (module, exports, __dirname, __filename) {
        var regex;
        regex = /<a href="\d+#p(\d+)" class="quotelink">/g;
        module.exports = function (comment) {
            var set, that;
            set = {};
            regex.lastIndex = 0;
            while (that = regex.exec(comment)) {
                set[that[1]] = true;
            }
            return Object.keys(set);
        };
    });
    require.define('/src/parser/DOM.co', function (module, exports, __dirname, __filename) {
        var quotelinksOf, sageRegex, dimensionRegex, sizeRegex, spoilerRegex, FImage;
        quotelinksOf = require('/src/parser/quotelinks-of.co', module);
        module.exports = function (document, board) {
            var thumbsBase, imagesBase, threadUrl, times, comments, names, subjects, eIdx, bIdx, i$, x0$, ref$, len$, t, x1$, results$ = [];
            thumbsBase = '//thumbs.4chan.org/' + board + '/thumb/';
            imagesBase = '//images.4chan.org/' + board + '/src/';
            threadUrl = '//boards.4chan.org/' + board + '/res/';
            times = document.querySelectorAll('.dateTime');
            comments = document.querySelectorAll('.postMessage');
            names = document.querySelectorAll('.name');
            subjects = document.querySelectorAll('.subject');
            eIdx = 0;
            bIdx = 1;
            for (i$ = 0, len$ = (ref$ = document.querySelectorAll('.thread')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                t = new DOMThread(x0$, times, comments, names, subjects, eIdx, bIdx, thumbsBase, imagesBase, threadUrl);
                x1$ = t.posts.length;
                eIdx += x1$;
                bIdx += x1$ * 2;
                results$.push(t);
            }
            return results$;
        };
        DOMThread.prototype = require('/src/parser/Thread.co', module).prototype;
        function DOMThread(el, times, comments, names, subjects, eIdx, bIdx, thumbsBase, imagesBase, threadUrl) {
            var omitted, idx, ref$, res$, i$, x0$, ref1$, len$, p;
            this.no = el.id.substring(1);
            this.url = threadUrl + this.no;
            this.omitted = (omitted = el.querySelector('.summary')) ? {
                replies: parseInt(omitted.textContent.match(/\d+(?= posts?)/), 10) || 0,
                imageReplies: parseInt(omitted.textContent.match(/\d+(?= image (?:replies|reply))/), 10) || 0
            } : void 8;
            this.preview = !!omitted;
            this.sticky = el.querySelector('.stickyIcon') != null;
            this.closed = el.querySelector('.closedIcon') != null;
            this.op = new DOMPost(this, el.querySelector('.op'), 0, true, times[bIdx], comments[eIdx], names[bIdx], subjects[bIdx], thumbsBase, imagesBase);
            ++eIdx;
            bIdx += 2;
            idx = 1 + (((ref$ = this.omitted) != null ? ref$.replies : void 8) || 0);
            res$ = [];
            for (i$ = 0, len$ = (ref1$ = el.getElementsByClassName('reply')).length; i$ < len$; ++i$) {
                x0$ = ref1$[i$];
                p = new DOMPost(this, x0$, idx++, false, times[bIdx], comments[eIdx], names[bIdx], subjects[bIdx], thumbsBase, imagesBase);
                ++eIdx;
                bIdx += 2;
                res$.push(p);
            }
            this.replies = res$;
            this.postprocess();
        }
        sageRegex = /^sage$/i;
        DOMPost.prototype = require('/src/parser/Post.co', module).prototype;
        function DOMPost(thread, el, idx, op, timeEl, commentEl, nameEl, subjectEl, thumbsBase, imagesBase) {
            var ref$, ref1$, ref2$, that, ref3$, img;
            this.idx = idx;
            this.op = op;
            this.no = el.id.substring(1);
            this.threadNo = thread.no;
            this.url = thread.url + '#p' + this.no;
            this.time = new Date(parseInt(timeEl.dataset.utc, 10) * 1000);
            this.subject = subjectEl.innerHTML;
            this.name = nameEl.innerHTML;
            this.tripcode = (ref$ = el.querySelector('.postertrip')) != null ? ref$.innerHTML : void 8;
            this.capcode = (ref1$ = el.querySelector('.capcode')) != null ? ref1$.innerHTML : void 8;
            this.email = (ref2$ = el.querySelector('.useremail')) != null ? ref2$.href.substring(7) : void 8;
            if (that = this.email) {
                this.sage = sageRegex.test(that);
            }
            this.comment = commentEl.innerHTML;
            this.uid = (ref3$ = el.querySelector('.hand')) != null ? ref3$.textContent : void 8;
            img = el.querySelector('.fileThumb');
            this.deletedImage = (img != null ? img.firstElementChild.alt : void 8) === 'File deleted.';
            this.image = img && !this.deletedImage ? new FImage(img, el, thumbsBase, imagesBase) : void 8;
            this.quotelinks = quotelinksOf(this.comment);
            this.backlinks = [];
        }
        dimensionRegex = /(\d+)x(\d+)/;
        sizeRegex = /[\d\.]+ [KM]?B/;
        spoilerRegex = /^Spoiler Image/;
        FImage = function () {
            FImage.displayName = 'FImage';
            var prototype = FImage.prototype, constructor = FImage;
            function FImage(el, postel, thumbsBase, imagesBase) {
                var info, dimensions, thumb, timestamp;
                this.url = el.getAttribute('href');
                info = postel.querySelector('.fileText');
                dimensions = dimensionRegex.exec(info.textContent);
                thumb = el.firstElementChild;
                timestamp = this.url.match(/\/(\d+)/)[1];
                this.thumb = new DOMThumb(timestamp, thumb, thumbsBase);
                this.width = parseInt(dimensions[1], 10);
                this.height = parseInt(dimensions[2], 10);
                this.size = sizeRegex.exec(thumb.alt)[0];
                this.spoiler = spoilerRegex.test(thumb.alt);
                this.filename = this.spoiler ? info.title : info.querySelector('span[title]').title;
                this.md5 = thumb.dataset.md5;
            }
            return FImage;
        }();
        DOMThumb.prototype = require('/src/parser/Thumb.co', module).prototype;
        function DOMThumb(timestamp, el, thumbsBase) {
            this.url = thumbsBase + (timestamp + 's.jpg');
            this.width = parseInt(el.style.width, 10);
            this.height = parseInt(el.style.height, 10);
        }
    });
    require.define('/src/features/inlinereplies.co', function (module, exports, __dirname, __filename) {
        var ref$, onPosts, onbacklink, ref1$, DOM, $$, $, closest, classify, L, postTemplate, defer, ref2$, markScroll, scroll, toggleOff, onclick, follow, split$ = ''.split;
        ref$ = require('/src/utils/features.co', module), onPosts = ref$.onPosts, onbacklink = ref$.onbacklink;
        ref1$ = require('/src/utils/dom.co', module), DOM = ref1$.DOM, $$ = ref1$.$$, $ = ref1$.$, closest = ref1$.closest, classify = ref1$.classify, L = ref1$.L;
        postTemplate = require('/templates/post.cojade', module);
        defer = require('/src/utils/timing.co', module).defer;
        ref2$ = function () {
            var last, el;
            return {
                markScroll: function (it) {
                    el = it;
                    return last = el.getBoundingClientRect().top;
                },
                scroll: function () {
                    return window.scrollBy(0, el.getBoundingClientRect().top - last);
                }
            };
        }.call(this), markScroll = ref2$.markScroll, scroll = ref2$.scroll;
        toggleOff = function (link, inlined) {
            var no, ref$, i$, x0$, ref1$, len$, pid, ref2$, that;
            no = link.hash.substring(2);
            link.hidden = false;
            markScroll(link);
            link.classList.remove('inlinedlink');
            link.parentNode.classList.remove('inlinedquote');
            if ($$('.inline[data-no="' + no + '"]').length === 1) {
                if ((ref$ = $('p' + no)) != null) {
                    ref$.classList.remove('inlined');
                }
            }
            for (i$ = 0, len$ = (ref1$ = inlined.querySelectorAll('.post.inline')).length; i$ < len$; ++i$) {
                x0$ = ref1$[i$];
                pid = x0$.dataset.no;
                if ($$('.inline[data-no="' + pid + '"]').length === 1) {
                    if ((ref2$ = $('p' + pid)) != null) {
                        ref2$.classList.remove('inlined');
                    }
                }
            }
            inlined.remove();
            if (that = link.nextElementSibling) {
                if (that.classList.contains('forcedquote') || that.classList.contains('forcedimage')) {
                    link.nextElementSibling.hidden = false;
                }
                if (that = link.nextElementSibling.nextElementSibling) {
                    if (that.classList.contains('forcedquote')) {
                        link.nextElementSibling.nextElementSibling.hidden = false;
                    }
                }
            }
            scroll();
        };
        onclick = function (e) {
            var post, no, host, hostid, inlinedId, stubId, inlined, isBacklink, wrapper, x0$, i$, x1$, ref$, len$, x2$, x3$, ref1$, ref2$, ref3$, ref4$, ref5$, ref6$, ref7$, that, this$ = this;
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            if (!(post = board.posts[no = this.hash.substring(2)])) {
                return;
            }
            e.preventDefault();
            host = closest('.post', this).id;
            hostid = split$.call(host, '-').pop();
            inlinedId = host + '-p' + no;
            stubId = no + '-inlined-stub';
            if (inlined = $(inlinedId)) {
                toggleOff(this, inlined);
            } else {
                isBacklink = this.classList.contains('backlink');
                inlined = DOM(postTemplate(post, {
                    thread: board.threadsById[post.threadNo],
                    container: 'article',
                    classes: 'inline hovered',
                    id: inlinedId
                }));
                wrapper = this;
                while (wrapper.parentElement.matchesSelector('a,span')) {
                    wrapper = wrapper.parentElement;
                }
                markScroll(this);
                wrapper[isBacklink ? 'after' : 'before'](inlined);
                if (isBacklink) {
                    inlined.prepend((x0$ = L('a'), x0$.textContent = post.idx, x0$.className = 'inlined-idx', x0$.addEventListener('click', function () {
                        toggleOff(this$, inlined);
                    }), x0$));
                    this.hidden = true;
                }
                document.dispatchEvent(new CustomEvent('c4-postinsert', { detail: { post: inlined } }));
                for (i$ = 0, len$ = (ref$ = inlined.querySelectorAll('a.quotelink[href$="' + hostid + '"]')).length; i$ < len$; ++i$) {
                    x1$ = ref$[i$];
                    x1$.className = 'recursivelink';
                    x1$.removeAttribute('href');
                }
                x2$ = inlined.querySelector('.comment');
                if (x2$.querySelectorAll('.quotelink').length === 0) {
                    x3$ = x2$.firstElementChild;
                    if ((x3$ != null ? x3$.className : void 8) === 'recursivelink') {
                        while (((ref1$ = x3$.nextSibling) != null ? ref1$.tagName : void 8) === 'BR' || (ref2$ = x3$.nextSibling) != null && ((ref3$ = ref2$.classList) != null && ref3$.contains('forcedquote')) || (ref4$ = x3$.nextSibling) != null && ((ref5$ = ref4$.classList) != null && ref5$.contains('forcedimage'))) {
                            x3$.nextSibling.remove();
                        }
                        x3$.remove();
                    }
                }
                this.classList.add('inlinedlink');
                this.parentNode.classList.add('inlinedquote');
                if ((ref6$ = $('postpreview')) != null) {
                    ref6$.remove();
                }
                if ((ref7$ = $('p' + no)) != null) {
                    ref7$.classList.add('inlined');
                }
                if (!isBacklink) {
                    if (that = this.nextElementSibling) {
                        if (that.classList.contains('forcedquote') || that.classList.contains('forcedimage')) {
                            this.nextElementSibling.hidden = true;
                        }
                        if (that = this.nextElementSibling.nextElementSibling) {
                            if (that.classList.contains('forcedquote')) {
                                this.nextElementSibling.nextElementSibling.hidden = true;
                            }
                        }
                    }
                }
                if (!isBacklink) {
                    scroll();
                }
            }
        };
        follow = function () {
            var that;
            if (that = this.hash) {
                window.location.hash = that;
            }
        };
        onPosts({
            '.quotelink:not(.hiddenlink)': {
                click: onclick,
                dblclick: follow
            }
        });
        onbacklink(function () {
            var x0$;
            x0$ = this.backlink;
            x0$.addEventListener('click', onclick);
            x0$.addEventListener('dblclick', follow);
        });
    });
    require.define('/src/features/image-previews.co', function (module, exports, __dirname, __filename) {
        var onPosts, lightbox;
        onPosts = require('/src/utils/features.co', module).onPosts;
        lightbox = require('/src/utils/lightbox.co', module);
        onPosts({
            '.thumb': {
                mouseover: lightbox(function (arg$) {
                    var parentElement, dataset, href;
                    parentElement = arg$.parentElement, dataset = parentElement.dataset, href = parentElement.href;
                    return {
                        width: dataset.width,
                        height: dataset.height,
                        src: href
                    };
                })
            }
        });
    });
    require.define('/src/utils/lightbox.co', function (module, exports, __dirname, __filename) {
        var ref$, L, $, $$, defer, tooltip;
        ref$ = require('/src/utils/dom.co', module), L = ref$.L, $ = ref$.$, $$ = ref$.$$;
        defer = require('/src/utils/timing.co', module).defer;
        tooltip = require('/src/utils/tooltip.co', module).tooltip;
        function objectFit(container, width, height) {
            var ratio;
            ratio = Math.min(1, container.height / height, container.width / width);
            return {
                width: ratio * width,
                height: ratio * height
            };
        }
        module.exports = function (imageOf) {
            return tooltip({
                show: function () {
                    var ref$, src, width, height, viewport, ref1$, x0$, ref2$, ref3$;
                    ref$ = imageOf(this), src = ref$.src, width = ref$.width, height = ref$.height;
                    this.style.cursor = 'none';
                    viewport = {
                        width: (ref1$ = document.documentElement).clientWidth,
                        height: ref1$.clientHeight
                    };
                    document.body.append((x0$ = L('img'), x0$.id = 'imgpreview', x0$.alt = 'Loading...', x0$.src = src, ref2$ = objectFit(viewport, width, height), x0$.width = ref2$.width, x0$.height = ref2$.height, x0$.addEventListener('load', function () {
                        return this.removeAttribute('alt');
                    }), x0$.addEventListener('error', function () {
                        return this.alt = 'Unable to load image.';
                    }), ref3$ = x0$.style, ref3$.position = 'fixed', ref3$.left = 0, ref3$.top = 0, ref3$.pointerEvents = 'none', ref3$.backgroundColor = 'rgba(0,0,0,.5)', ref3$.padding = (viewport.height - x0$.height) / 2 + 'px ' + (viewport.width - x0$.width) / 2 + 'px', ref3$.transitionDuration = '.5s', ref3$.opacity = 0, x0$.addEventListener('transitionend', function (e) {
                        var propertyName;
                        propertyName = e.propertyName;
                        if (propertyName === 'opacity' && this.style.opacity === '0') {
                            return this.remove();
                        }
                    }), defer(100, function () {
                        x0$.style.opacity = 1;
                    }), x0$));
                },
                hide: function () {
                    var ref$;
                    if ((ref$ = $('imgpreview')) != null) {
                        ref$.style.opacity = 0;
                    }
                    defer(100, function () {
                        var ref$;
                        if ((ref$ = $('imgpreview')) != null) {
                            ref$.remove();
                        }
                    });
                    this.style.removeProperty('cursor');
                }
            });
        };
    });
    require.define('/src/utils/tooltip.co', function (module, exports, __dirname, __filename) {
        var delay, deadZone, listen, tooltip, out$ = typeof exports != 'undefined' && exports || this;
        delay = 200;
        deadZone = 10;
        listen = require('/src/utils/listen.co', module);
        out$.tooltip = tooltip = function (arg$) {
            var show, hide;
            show = arg$.show, hide = arg$.hide;
            return function (e) {
                var x, y, timeout, lastEvent, createTooltip, resetTimeout, removeTooltip, this$ = this;
                x = e.clientX, y = e.clientY;
                lastEvent = e;
                createTooltip = function () {
                    show.call(this$, lastEvent);
                    listen(this$).off('mousemove', resetTimeout).on('mousemove', removeTooltip);
                };
                resetTimeout = function (e) {
                    clearTimeout(timeout);
                    timeout = setTimeout(createTooltip, delay);
                    x = e.clientX, y = e.clientY;
                    lastEvent = e;
                };
                removeTooltip = function (arg$) {
                    var cx, cy;
                    cx = arg$.clientX, cy = arg$.clientY;
                    if (Math.abs(x - cx) > deadZone || Math.abs(y - cy) > deadZone) {
                        hide.apply(this, arguments);
                        timeout = setTimeout(createTooltip, delay);
                        listen(this).on('mousemove', resetTimeout).off('mousemove', removeTooltip);
                    }
                };
                timeout = setTimeout(createTooltip, delay);
                listen(this).on('mousemove', resetTimeout).once('mouseout', function () {
                    hide.apply(this, arguments);
                    clearTimeout(timeout);
                    listen(this).off('mousemove', resetTimeout).off('mousemove', removeTooltip);
                });
            };
        };
    });
    require.define('/src/features/image-expansion.co', function (module, exports, __dirname, __filename) {
        var onPosts, L;
        onPosts = require('/src/utils/features.co', module).onPosts;
        L = require('/src/utils/dom.co', module).L;
        onPosts({
            '.file': {
                click: function (e) {
                    var a, x0$, ref$;
                    if (!(e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)) {
                        e.preventDefault();
                        a = this;
                        this.hidden = true;
                        this.before((x0$ = L('img'), x0$.src = this.href, x0$.className = 'full', ref$ = x0$.style, ref$.display = 'block', ref$.maxWidth = '100%', x0$.onclick = function () {
                            var ref$, top;
                            if (this.width !== this.naturalWidth) {
                                this.style.removeProperty('max-width');
                            } else {
                                a.hidden = false;
                                if ((ref$ = a.previousSibling) != null) {
                                    ref$.remove();
                                }
                                if (scroll && (top = a.getBoundingClientRect().top) < 0) {
                                    window.scrollBy(0, top);
                                }
                            }
                        }, x0$));
                    }
                }
            }
        });
    });
    require.define('/src/features/highlight.co', function (module, exports, __dirname, __filename) {
        var ref$, onready, onupdate, onPosts, ref1$, sset, sget, highlighting, highlight, toggleHighlight;
        ref$ = require('/src/utils/features.co', module), onready = ref$.onready, onupdate = ref$.onupdate, onPosts = ref$.onPosts;
        ref1$ = require('/src/utils/storage.co', module), sset = ref1$.sset, sget = ref1$.sget;
        highlighting = sget('highlighting') || {
            admin: false,
            mod: false
        };
        highlight = function (it) {
            var i$, ref$, len$, post;
            for (i$ = 0, len$ = (ref$ = $$(it)).length; i$ < len$; ++i$) {
                post = ref$[i$];
                post.classList.add('highlighted');
            }
        };
        toggleHighlight = function (klass) {
            return function () {
                var i$, ref$, len$, post;
                for (i$ = 0, len$ = (ref$ = $$('.' + klass)).length; i$ < len$; ++i$) {
                    post = ref$[i$];
                    highlighting[klass] = !highlighting[klass];
                    sset('highlighting', highlighting);
                    post.classList.toggle('highlighted');
                }
            };
        };
        onPosts({
            '.admin .capcode': { click: toggleHighlight('admin') },
            '.mod   .capcode': { click: toggleHighlight('mod') }
        });
        onready(function () {
            var klass, ref$, hl;
            for (klass in ref$ = highlighting) {
                hl = ref$[klass];
                if (hl) {
                    highlight(klass);
                }
            }
        });
        onupdate(function () {
            var klass, ref$, hl;
            for (klass in ref$ = highlighting) {
                hl = ref$[klass];
                if (hl) {
                    highlight('new.' + klass);
                }
            }
        });
    });
    require.define('/src/features/hide.co', function (module, exports, __dirname, __filename) {
        var ref$, $, $$, ref1$, onready, onupdate, threshold, hidden, e, persist, toggle;
        ref$ = require('/src/utils/dom.co', module), $ = ref$.$, $$ = ref$.$$;
        ref1$ = require('/src/utils/features.co', module), onready = ref1$.onready, onupdate = ref1$.onupdate;
        threshold = 604800000;
        hidden = {
            threads: function () {
                try {
                    return JSON.parse(localStorage['4chan-hide-t-' + board.name]) || {};
                } catch (e$) {
                    e = e$;
                    return {};
                }
            }(),
            replies: function () {
                try {
                    return JSON.parse(localStorage['4chan-hide-r-' + board.name]) || {};
                } catch (e$) {
                    e = e$;
                    return {};
                }
            }()
        };
        (function (now) {
            var type, ref$, hash, key, expiry;
            for (type in ref$ = hidden) {
                hash = ref$[type];
                for (key in hash) {
                    expiry = hash[key];
                    if (expiry === true) {
                        hash[key] = Date.now();
                    } else {
                        if (now - expiry > threshold) {
                            delete hash[key];
                        }
                    }
                }
            }
        }.call(this, Date.now()));
        persist = function () {
            localStorage['4chan-hide-t-' + board.name] = JSON.stringify(hidden.threads);
            localStorage['4chan-hide-r-' + board.name] = JSON.stringify(hidden.replies);
        };
        toggle = function (prefix, no) {
            var i$, x0$, ref$, len$, ref1$;
            for (i$ = 0, len$ = (ref$ = $$('.quotelink[href$="#' + no + '"]')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                x0$.classList.toggle('hiddenlink');
            }
            return (ref1$ = $(prefix + '' + no)) != null ? ref1$.classList.toggle('hidden') : void 8;
        };
        onready(function () {
            var i$, x0$, ref$, len$, j$, ref1$, len1$, btn, k$, x1$, ref2$, len2$, no, l$, x2$, ref3$, len3$;
            for (i$ = 0, len$ = (ref$ = $$('.reply button.hide')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                x0$.addEventListener('click', fn$);
            }
            for (j$ = 0, len1$ = (ref1$ = $$('.op button.hide')).length; j$ < len1$; ++j$) {
                btn = ref1$[j$];
                btn.addEventListener('click', fn1$);
            }
            for (k$ = 0, len2$ = (ref2$ = document.getElementsByClassName('reply')).length; k$ < len2$; ++k$) {
                x1$ = ref2$[k$];
                no = x1$.dataset.no;
                if (hidden.replies[no]) {
                    toggle('p', no);
                }
            }
            if (board.isBoard) {
                for (l$ = 0, len3$ = (ref3$ = document.getElementsByClassName('thread')).length; l$ < len3$; ++l$) {
                    x2$ = ref3$[l$];
                    no = x2$.dataset.no;
                    if (hidden.threads[no]) {
                        toggle('t', no);
                    }
                }
            }
            function fn$() {
                toggle('p', this.value);
                if (this.value in hidden.replies) {
                    delete hidden.replies[this.value];
                } else {
                    hidden.replies[this.value] = Date.now();
                }
                persist();
            }
            function fn1$() {
                var ref$;
                toggle('t', this.value);
                if (this.value in hidden.threads) {
                    delete hidden.threads[this.value];
                } else {
                    hidden.threads[this.value] = (ref$ = board.threadsById[this.value]) != null && ref$.sticky ? Number.MAX_VALUE : Date.now();
                }
                persist();
            }
        });
        onupdate(function () {
            var i$, x0$, ref$, len$;
            for (i$ = 0, len$ = (ref$ = $$('.new .quotelink')).length; i$ < len$; ++i$) {
                x0$ = ref$[i$];
                if (x0$.hash.substring(1) in hidden.replies) {
                    x0$.classList.toggle('hiddenlink');
                }
            }
        });
    });
    require.define('/src/features/hide-message.co', function (module, exports, __dirname, __filename) {
        var onready, ref$, set, get, $, Bacon;
        onready = require('/src/utils/features.co', module).onready;
        ref$ = require('/src/utils/storage.co', module), set = ref$.set, get = ref$.get;
        $ = require('/src/utils/dom.co', module).$;
        Bacon = require('/node_modules/baconjs/dist/Bacon.js', module);
        function hash(str) {
            var msg, i, to$;
            msg = 0;
            for (i = 0, to$ = str.length; i < to$; ++i) {
                msg = (msg << 5) - msg + str.charCodeAt(i);
            }
            return msg;
        }
        onready(function () {
            var button, message, newHash, messageHidden;
            if ($('message-container')) {
                button = $('hide-message');
                message = $('message');
                newHash = hash(message.textContent).toString();
                if (newHash !== localStorage['4chan-msg']) {
                    localStorage.removeItem('4chan-msg');
                }
                message.hidden = localStorage['4chan-msg'] != null;
                messageHidden = Bacon.fromEventTarget(button, 'click').scan(message.hidden, function (it) {
                    return !it;
                });
                messageHidden.onValue(function (it) {
                    message.hidden = it;
                });
                messageHidden.onValue(function (it) {
                    if (it) {
                        localStorage['4chan-msg'] = newHash;
                    } else {
                        localStorage.removeItem('4chan-msg');
                    }
                });
                messageHidden.map(function (it) {
                    return (it ? 'Show' : 'Hide') + ' News';
                }).onValue(function (it) {
                    button.textContent = it;
                });
            }
        });
    });
    require.define('/node_modules/baconjs/dist/Bacon.js', function (module, exports, __dirname, __filename) {
        (function () {
            var Bacon, Bus, Dispatcher, End, Error, Event, EventStream, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, addPropertyInitValueToStream, assert, assertArray, assertEvent, assertFunction, assertNoArguments, assertString, cloneArray, end, former, indexOf, initial, isFieldKey, isFunction, latter, makeFunction, makeSpawner, methodCall, next, nop, partiallyApplied, remove, sendWrapped, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, _, _ref, __slice = [].slice, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
                    for (var key in parent) {
                        if (__hasProp.call(parent, key))
                            child[key] = parent[key];
                    }
                    function ctor() {
                        this.constructor = child;
                    }
                    ctor.prototype = parent.prototype;
                    child.prototype = new ctor();
                    child.__super__ = parent.prototype;
                    return child;
                }, __bind = function (fn, me) {
                    return function () {
                        return fn.apply(me, arguments);
                    };
                };
            if (typeof module !== 'undefined' && module !== null) {
                module.exports = Bacon = {};
                Bacon.Bacon = Bacon;
            } else {
                this.Bacon = Bacon = {};
            }
            Bacon.fromBinder = function (binder, eventTransformer) {
                if (eventTransformer == null) {
                    eventTransformer = _.id;
                }
                return new EventStream(function (sink) {
                    var unbinder;
                    return unbinder = binder(function () {
                        var args, event, reply, value, _i, _len, _results;
                        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                        value = eventTransformer.apply(null, args);
                        if (!(value instanceof Array && _.last(value) instanceof Event)) {
                            value = [value];
                        }
                        _results = [];
                        for (_i = 0, _len = value.length; _i < _len; _i++) {
                            event = value[_i];
                            reply = sink(event = toEvent(event));
                            if (reply === Bacon.noMore || event.isEnd()) {
                                if (unbinder != null) {
                                    _results.push(unbinder());
                                } else {
                                    _results.push(setTimeout(function () {
                                        return unbinder();
                                    }, 0));
                                }
                            } else {
                                _results.push(void 0);
                            }
                        }
                        return _results;
                    });
                });
            };
            Bacon.$ = {
                asEventStream: function (eventName, selector, eventTransformer) {
                    var _ref, _this = this;
                    if (isFunction(selector)) {
                        _ref = [
                            selector,
                            null
                        ], eventTransformer = _ref[0], selector = _ref[1];
                    }
                    return Bacon.fromBinder(function (handler) {
                        _this.on(eventName, selector, handler);
                        return function () {
                            return _this.off(eventName, selector, handler);
                        };
                    }, eventTransformer);
                }
            };
            if ((_ref = typeof jQuery !== 'undefined' && jQuery !== null ? jQuery : typeof Zepto !== 'undefined' && Zepto !== null ? Zepto : null) != null) {
                _ref.fn.asEventStream = Bacon.$.asEventStream;
            }
            Bacon.fromEventTarget = function (target, eventName, eventTransformer) {
                var sub, unsub, _ref1, _ref2, _ref3, _ref4;
                sub = (_ref1 = target.addEventListener) != null ? _ref1 : (_ref2 = target.addListener) != null ? _ref2 : target.bind;
                unsub = (_ref3 = target.removeEventListener) != null ? _ref3 : (_ref4 = target.removeListener) != null ? _ref4 : target.unbind;
                return Bacon.fromBinder(function (handler) {
                    sub.call(target, eventName, handler);
                    return function () {
                        return unsub.call(target, eventName, handler);
                    };
                }, eventTransformer);
            };
            Bacon.fromPromise = function (promise) {
                return Bacon.fromBinder(function (handler) {
                    promise.then(handler, function (e) {
                        return handler(new Error(e));
                    });
                    return function () {
                        return typeof promise.abort === 'function' ? promise.abort() : void 0;
                    };
                }, function (value) {
                    return [
                        value,
                        end()
                    ];
                });
            };
            Bacon.noMore = ['<no-more>'];
            Bacon.more = ['<more>'];
            Bacon.later = function (delay, value) {
                return Bacon.sequentially(delay, [value]);
            };
            Bacon.sequentially = function (delay, values) {
                var index;
                index = 0;
                return Bacon.fromPoll(delay, function () {
                    var value;
                    value = values[index++];
                    if (index < values.length) {
                        return value;
                    } else {
                        return [
                            value,
                            end()
                        ];
                    }
                });
            };
            Bacon.repeatedly = function (delay, values) {
                var index;
                index = 0;
                return Bacon.fromPoll(delay, function () {
                    return values[index++ % values.length];
                });
            };
            Bacon.fromCallback = function () {
                var args, f;
                f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return Bacon.fromBinder(function (handler) {
                    makeFunction(f, args)(handler);
                    return nop;
                }, function (value) {
                    return [
                        value,
                        end()
                    ];
                });
            };
            Bacon.fromNodeCallback = function () {
                var args, f;
                f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return Bacon.fromBinder(function (handler) {
                    makeFunction(f, args)(handler);
                    return nop;
                }, function (error, value) {
                    if (error) {
                        return [
                            new Error(error),
                            end()
                        ];
                    }
                    return [
                        value,
                        end()
                    ];
                });
            };
            Bacon.fromPoll = function (delay, poll) {
                return Bacon.fromBinder(function (handler) {
                    var id;
                    id = setInterval(handler, delay);
                    return function () {
                        return clearInterval(id);
                    };
                }, poll);
            };
            Bacon.interval = function (delay, value) {
                if (value == null) {
                    value = {};
                }
                return Bacon.fromPoll(delay, function () {
                    return next(value);
                });
            };
            Bacon.constant = function (value) {
                return new Property(sendWrapped([value], initial));
            };
            Bacon.never = function () {
                return Bacon.fromArray([]);
            };
            Bacon.once = function (value) {
                return Bacon.fromArray([value]);
            };
            Bacon.fromArray = function (values) {
                return new EventStream(sendWrapped(values, next));
            };
            sendWrapped = function (values, wrapper) {
                return function (sink) {
                    var value, _i, _len;
                    for (_i = 0, _len = values.length; _i < _len; _i++) {
                        value = values[_i];
                        sink(wrapper(value));
                    }
                    sink(end());
                    return nop;
                };
            };
            Bacon.mergeAll = function (streams) {
                var next, stream, _i, _len, _ref1;
                assertArray(streams);
                stream = _.head(streams);
                _ref1 = _.tail(streams);
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    next = _ref1[_i];
                    stream = stream.merge(next);
                }
                return stream;
            };
            Bacon.zipAsArray = function () {
                var more, streams;
                streams = arguments[0], more = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                if (!(streams instanceof Array)) {
                    streams = [streams].concat(more);
                }
                return Bacon.zipWith(streams, Array);
            };
            Bacon.zipWith = function (streams, f) {
                return new EventStream(function (sink) {
                    var bufs, handle, j, s, unsubAll, unsubs, unsubscribed, zipSink, _i, _len;
                    bufs = function () {
                        var _i, _len, _results;
                        _results = [];
                        for (_i = 0, _len = streams.length; _i < _len; _i++) {
                            s = streams[_i];
                            _results.push([]);
                        }
                        return _results;
                    }();
                    unsubscribed = false;
                    unsubs = function () {
                        var _i, _len, _results;
                        _results = [];
                        for (_i = 0, _len = streams.length; _i < _len; _i++) {
                            s = streams[_i];
                            _results.push(nop);
                        }
                        return _results;
                    }();
                    unsubAll = function () {
                        var _i, _len;
                        for (_i = 0, _len = unsubs.length; _i < _len; _i++) {
                            f = unsubs[_i];
                            f();
                        }
                        return unsubscribed = true;
                    };
                    zipSink = function (e) {
                        var reply;
                        reply = sink(e);
                        if (reply === Bacon.noMore || e.isEnd()) {
                            unsubAll();
                        }
                        return reply;
                    };
                    handle = function (i) {
                        return function (e) {
                            var b, reply, vs;
                            if (e.isError()) {
                                return zipSink(e);
                            } else if (e.isInitial()) {
                                return Bacon.more;
                            } else {
                                bufs[i].push(e);
                                if (!e.isEnd() && _.all(function () {
                                        var _i, _len, _results;
                                        _results = [];
                                        for (_i = 0, _len = bufs.length; _i < _len; _i++) {
                                            b = bufs[_i];
                                            _results.push(b.length);
                                        }
                                        return _results;
                                    }())) {
                                    vs = function () {
                                        var _i, _len, _results;
                                        _results = [];
                                        for (_i = 0, _len = bufs.length; _i < _len; _i++) {
                                            b = bufs[_i];
                                            _results.push(b.shift().value());
                                        }
                                        return _results;
                                    }();
                                    reply = zipSink(e.apply(_.always(f.apply(null, vs))));
                                }
                                if (_.any(function () {
                                        var _i, _len, _results;
                                        _results = [];
                                        for (_i = 0, _len = bufs.length; _i < _len; _i++) {
                                            b = bufs[_i];
                                            _results.push(b.length && b[0].isEnd());
                                        }
                                        return _results;
                                    }())) {
                                    reply = zipSink(end());
                                }
                                return reply || Bacon.more;
                            }
                        };
                    };
                    for (j = _i = 0, _len = streams.length; _i < _len; j = ++_i) {
                        s = streams[j];
                        unsubs[j] = function (i) {
                            if (!unsubscribed) {
                                return s.subscribe(handle(i));
                            }
                        }(j);
                    }
                    return unsubAll;
                });
            };
            Bacon.combineAsArray = function () {
                var more, s, streams, values, _this = this;
                streams = arguments[0], more = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                if (!(streams instanceof Array)) {
                    streams = [streams].concat(more);
                }
                if (streams.length) {
                    values = function () {
                        var _i, _len, _results;
                        _results = [];
                        for (_i = 0, _len = streams.length; _i < _len; _i++) {
                            s = streams[_i];
                            _results.push(None);
                        }
                        return _results;
                    }();
                    return new Property(function (sink) {
                        var checkEnd, combiningSink, ends, index, initialSent, sinkFor, stream, unsubAll, unsubs, unsubscribed, _i, _len;
                        unsubscribed = false;
                        unsubs = function () {
                            var _i, _len, _results;
                            _results = [];
                            for (_i = 0, _len = streams.length; _i < _len; _i++) {
                                s = streams[_i];
                                _results.push(nop);
                            }
                            return _results;
                        }();
                        unsubAll = function () {
                            var f, _i, _len;
                            for (_i = 0, _len = unsubs.length; _i < _len; _i++) {
                                f = unsubs[_i];
                                f();
                            }
                            return unsubscribed = true;
                        };
                        ends = function () {
                            var _i, _len, _results;
                            _results = [];
                            for (_i = 0, _len = streams.length; _i < _len; _i++) {
                                s = streams[_i];
                                _results.push(false);
                            }
                            return _results;
                        }();
                        checkEnd = function () {
                            var reply;
                            if (_.all(ends)) {
                                reply = sink(end());
                                if (reply === Bacon.noMore) {
                                    unsubAll();
                                }
                                return reply;
                            }
                        };
                        initialSent = false;
                        combiningSink = function (markEnd, setValue) {
                            return function (event) {
                                var reply, valueArrayF;
                                if (event.isEnd()) {
                                    markEnd();
                                    checkEnd();
                                    return Bacon.noMore;
                                } else if (event.isError()) {
                                    reply = sink(event);
                                    if (reply === Bacon.noMore) {
                                        unsubAll();
                                    }
                                    return reply;
                                } else {
                                    setValue(event.value);
                                    if (_.all(_.map(function (x) {
                                            return x.isDefined;
                                        }, values))) {
                                        if (initialSent && event.isInitial()) {
                                            return Bacon.more;
                                        } else {
                                            initialSent = true;
                                            valueArrayF = function () {
                                                var x, _i, _len, _results;
                                                _results = [];
                                                for (_i = 0, _len = values.length; _i < _len; _i++) {
                                                    x = values[_i];
                                                    _results.push(x.get()());
                                                }
                                                return _results;
                                            };
                                            reply = sink(event.apply(valueArrayF));
                                            if (reply === Bacon.noMore) {
                                                unsubAll();
                                            }
                                            return reply;
                                        }
                                    } else {
                                        return Bacon.more;
                                    }
                                }
                            };
                        };
                        sinkFor = function (index) {
                            return combiningSink(function () {
                                return ends[index] = true;
                            }, function (x) {
                                return values[index] = new Some(x);
                            });
                        };
                        for (index = _i = 0, _len = streams.length; _i < _len; index = ++_i) {
                            stream = streams[index];
                            if (!(stream instanceof Observable)) {
                                stream = Bacon.constant(stream);
                            }
                            if (!unsubscribed) {
                                unsubs[index] = stream.subscribe(sinkFor(index));
                            }
                        }
                        return unsubAll;
                    });
                } else {
                    return Bacon.constant([]);
                }
            };
            Bacon.combineWith = function () {
                var f, streams;
                f = arguments[0], streams = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                return Bacon.combineAsArray(streams).map(function (values) {
                    return f.apply(null, values);
                });
            };
            Bacon.combineTemplate = function (template) {
                var applyStreamValue, combinator, compile, compileTemplate, constantValue, current, funcs, mkContext, setValue, streams;
                funcs = [];
                streams = [];
                current = function (ctxStack) {
                    return ctxStack[ctxStack.length - 1];
                };
                setValue = function (ctxStack, key, value) {
                    return current(ctxStack)[key] = value;
                };
                applyStreamValue = function (key, index) {
                    return function (ctxStack, values) {
                        return setValue(ctxStack, key, values[index]);
                    };
                };
                constantValue = function (key, value) {
                    return function (ctxStack, values) {
                        return setValue(ctxStack, key, value);
                    };
                };
                mkContext = function (template) {
                    if (template instanceof Array) {
                        return [];
                    } else {
                        return {};
                    }
                };
                compile = function (key, value) {
                    var popContext, pushContext;
                    if (value instanceof Observable) {
                        streams.push(value);
                        return funcs.push(applyStreamValue(key, streams.length - 1));
                    } else if (typeof value === 'object') {
                        pushContext = function (key) {
                            return function (ctxStack, values) {
                                var newContext;
                                newContext = mkContext(value);
                                setValue(ctxStack, key, newContext);
                                return ctxStack.push(newContext);
                            };
                        };
                        popContext = function (ctxStack, values) {
                            return ctxStack.pop();
                        };
                        funcs.push(pushContext(key));
                        compileTemplate(value);
                        return funcs.push(popContext);
                    } else {
                        return funcs.push(constantValue(key, value));
                    }
                };
                compileTemplate = function (template) {
                    return _.each(template, compile);
                };
                compileTemplate(template);
                combinator = function (values) {
                    var ctxStack, f, rootContext, _i, _len;
                    rootContext = mkContext(template);
                    ctxStack = [rootContext];
                    for (_i = 0, _len = funcs.length; _i < _len; _i++) {
                        f = funcs[_i];
                        f(ctxStack, values);
                    }
                    return rootContext;
                };
                return Bacon.combineAsArray(streams).map(combinator);
            };
            Event = function () {
                function Event() {
                }
                Event.prototype.isEvent = function () {
                    return true;
                };
                Event.prototype.isEnd = function () {
                    return false;
                };
                Event.prototype.isInitial = function () {
                    return false;
                };
                Event.prototype.isNext = function () {
                    return false;
                };
                Event.prototype.isError = function () {
                    return false;
                };
                Event.prototype.hasValue = function () {
                    return false;
                };
                Event.prototype.filter = function (f) {
                    return true;
                };
                Event.prototype.onDone = function (listener) {
                    return listener();
                };
                return Event;
            }();
            Next = function (_super) {
                __extends(Next, _super);
                function Next(valueF, sourceEvent) {
                    var _this = this;
                    if (isFunction(valueF)) {
                        this.value = function () {
                            var v;
                            v = valueF();
                            _this.value = _.always(v);
                            return v;
                        };
                    } else {
                        this.value = _.always(valueF);
                    }
                }
                Next.prototype.isNext = function () {
                    return true;
                };
                Next.prototype.hasValue = function () {
                    return true;
                };
                Next.prototype.fmap = function (f) {
                    var _this = this;
                    return this.apply(function () {
                        return f(_this.value());
                    });
                };
                Next.prototype.apply = function (value) {
                    return new Next(value);
                };
                Next.prototype.filter = function (f) {
                    return f(this.value());
                };
                Next.prototype.describe = function () {
                    return this.value();
                };
                return Next;
            }(Event);
            Initial = function (_super) {
                __extends(Initial, _super);
                function Initial() {
                    return Initial.__super__.constructor.apply(this, arguments);
                }
                Initial.prototype.isInitial = function () {
                    return true;
                };
                Initial.prototype.isNext = function () {
                    return false;
                };
                Initial.prototype.apply = function (value) {
                    return new Initial(value);
                };
                Initial.prototype.toNext = function () {
                    return new Next(this.value);
                };
                return Initial;
            }(Next);
            End = function (_super) {
                __extends(End, _super);
                function End() {
                    return End.__super__.constructor.apply(this, arguments);
                }
                End.prototype.isEnd = function () {
                    return true;
                };
                End.prototype.fmap = function () {
                    return this;
                };
                End.prototype.apply = function () {
                    return this;
                };
                End.prototype.describe = function () {
                    return '<end>';
                };
                return End;
            }(Event);
            Error = function (_super) {
                __extends(Error, _super);
                function Error(error) {
                    this.error = error;
                }
                Error.prototype.isError = function () {
                    return true;
                };
                Error.prototype.fmap = function () {
                    return this;
                };
                Error.prototype.apply = function () {
                    return this;
                };
                Error.prototype.describe = function () {
                    return '<error> ' + this.error;
                };
                return Error;
            }(Event);
            Observable = function () {
                function Observable() {
                    this.flatMapLatest = __bind(this.flatMapLatest, this);
                    this.scan = __bind(this.scan, this);
                    this.takeUntil = __bind(this.takeUntil, this);
                    this.assign = this.onValue;
                }
                Observable.prototype.onValue = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.subscribe(function (event) {
                        if (event.hasValue()) {
                            return f(event.value());
                        }
                    });
                };
                Observable.prototype.onValues = function (f) {
                    return this.onValue(function (args) {
                        return f.apply(null, args);
                    });
                };
                Observable.prototype.onError = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.subscribe(function (event) {
                        if (event.isError()) {
                            return f(event.error);
                        }
                    });
                };
                Observable.prototype.onEnd = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.subscribe(function (event) {
                        if (event.isEnd()) {
                            return f();
                        }
                    });
                };
                Observable.prototype.errors = function () {
                    return this.filter(function () {
                        return false;
                    });
                };
                Observable.prototype.filter = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    if (f instanceof Property) {
                        return f.sampledBy(this, function (p, s) {
                            return [
                                p,
                                s
                            ];
                        }).filter(function (_arg) {
                            var p, s;
                            p = _arg[0], s = _arg[1];
                            return p;
                        }).map(function (_arg) {
                            var p, s;
                            p = _arg[0], s = _arg[1];
                            return s;
                        });
                    } else {
                        f = makeFunction(f, args);
                        return this.withHandler(function (event) {
                            if (event.filter(f)) {
                                return this.push(event);
                            } else {
                                return Bacon.more;
                            }
                        });
                    }
                };
                Observable.prototype.takeWhile = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.withHandler(function (event) {
                        if (event.filter(f)) {
                            return this.push(event);
                        } else {
                            this.push(end());
                            return Bacon.noMore;
                        }
                    });
                };
                Observable.prototype.endOnError = function () {
                    return this.withHandler(function (event) {
                        if (event.isError()) {
                            this.push(event);
                            return this.push(end());
                        } else {
                            return this.push(event);
                        }
                    });
                };
                Observable.prototype.take = function (count) {
                    assert('take: count must >= 1', count >= 1);
                    return this.withHandler(function (event) {
                        if (!event.hasValue()) {
                            return this.push(event);
                        } else {
                            count--;
                            if (count > 0) {
                                return this.push(event);
                            } else {
                                this.push(event);
                                this.push(end());
                                return Bacon.noMore;
                            }
                        }
                    });
                };
                Observable.prototype.map = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.withHandler(function (event) {
                        return this.push(event.fmap(f));
                    });
                };
                Observable.prototype.mapError = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.withHandler(function (event) {
                        if (event.isError()) {
                            return this.push(next(f(event.error)));
                        } else {
                            return this.push(event);
                        }
                    });
                };
                Observable.prototype.mapEnd = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.withHandler(function (event) {
                        if (event.isEnd()) {
                            this.push(next(f(event)));
                            this.push(end());
                            return Bacon.noMore;
                        } else {
                            return this.push(event);
                        }
                    });
                };
                Observable.prototype.doAction = function () {
                    var args, f;
                    f = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    f = makeFunction(f, args);
                    return this.withHandler(function (event) {
                        if (event.hasValue()) {
                            f(event.value());
                        }
                        return this.push(event);
                    });
                };
                Observable.prototype.takeUntil = function (stopper) {
                    var src;
                    src = this;
                    return this.withSubscribe(function (sink) {
                        var srcSink, stopperSink, unsubBoth, unsubSrc, unsubStopper, unsubscribed;
                        unsubscribed = false;
                        unsubSrc = nop;
                        unsubStopper = nop;
                        unsubBoth = function () {
                            unsubSrc();
                            unsubStopper();
                            return unsubscribed = true;
                        };
                        srcSink = function (event) {
                            if (event.isEnd()) {
                                unsubStopper();
                                sink(event);
                                return Bacon.noMore;
                            } else {
                                event.onDone(function () {
                                    var reply;
                                    if (!unsubscribed) {
                                        reply = sink(event);
                                        if (reply === Bacon.noMore) {
                                            return unsubBoth();
                                        }
                                    }
                                });
                                return Bacon.more;
                            }
                        };
                        stopperSink = function (event) {
                            if (event.isError()) {
                                return Bacon.more;
                            } else if (event.isEnd()) {
                                return Bacon.noMore;
                            } else {
                                unsubSrc();
                                sink(end());
                                return Bacon.noMore;
                            }
                        };
                        unsubSrc = src.subscribe(srcSink);
                        if (!unsubscribed) {
                            unsubStopper = stopper.subscribe(stopperSink);
                        }
                        return unsubBoth;
                    });
                };
                Observable.prototype.skip = function (count) {
                    assert('skip: count must >= 0', count >= 0);
                    return this.withHandler(function (event) {
                        if (!event.hasValue()) {
                            return this.push(event);
                        } else if (count > 0) {
                            count--;
                            return Bacon.more;
                        } else {
                            return this.push(event);
                        }
                    });
                };
                Observable.prototype.skipDuplicates = function (isEqual) {
                    if (isEqual == null) {
                        isEqual = function (a, b) {
                            return a === b;
                        };
                    }
                    return this.withStateMachine(None, function (prev, event) {
                        if (!event.hasValue()) {
                            return [
                                prev,
                                [event]
                            ];
                        } else if (prev === None || !isEqual(prev.get(), event.value())) {
                            return [
                                new Some(event.value()),
                                [event]
                            ];
                        } else {
                            return [
                                prev,
                                []
                            ];
                        }
                    });
                };
                Observable.prototype.withStateMachine = function (initState, f) {
                    var state;
                    state = initState;
                    return this.withHandler(function (event) {
                        var fromF, newState, output, outputs, reply, _i, _len;
                        fromF = f(state, event);
                        newState = fromF[0], outputs = fromF[1];
                        state = newState;
                        reply = Bacon.more;
                        for (_i = 0, _len = outputs.length; _i < _len; _i++) {
                            output = outputs[_i];
                            reply = this.push(output);
                            if (reply === Bacon.noMore) {
                                return reply;
                            }
                        }
                        return reply;
                    });
                };
                Observable.prototype.scan = function (seed, f) {
                    var acc, subscribe, _this = this;
                    f = toCombinator(f);
                    acc = toOption(seed);
                    subscribe = function (sink) {
                        var initSent, unsub;
                        initSent = false;
                        unsub = _this.subscribe(function (event) {
                            if (event.hasValue()) {
                                if (initSent && event.isInitial()) {
                                    return Bacon.more;
                                } else {
                                    initSent = true;
                                    acc = new Some(f(acc.getOrElse(void 0), event.value()));
                                    return sink(event.apply(_.always(acc.get())));
                                }
                            } else {
                                if (event.isEnd()) {
                                    initSent = true;
                                }
                                return sink(event);
                            }
                        });
                        if (!initSent) {
                            acc.forEach(function (value) {
                                var reply;
                                reply = sink(initial(value));
                                if (reply === Bacon.noMore) {
                                    unsub();
                                    return unsub = nop;
                                }
                            });
                        }
                        return unsub;
                    };
                    return new Property(new PropertyDispatcher(subscribe).subscribe);
                };
                Observable.prototype.zip = function (other, f) {
                    if (f == null) {
                        f = Array;
                    }
                    return Bacon.zipWith([
                        this,
                        other
                    ], f);
                };
                Observable.prototype.diff = function (start, f) {
                    f = toCombinator(f);
                    return this.scan([start], function (prevTuple, next) {
                        return [
                            next,
                            f(prevTuple[0], next)
                        ];
                    }).filter(function (tuple) {
                        return tuple.length === 2;
                    }).map(function (tuple) {
                        return tuple[1];
                    });
                };
                Observable.prototype.flatMap = function (f) {
                    var root;
                    f = makeSpawner(f);
                    root = this;
                    return new EventStream(function (sink) {
                        var checkEnd, children, rootEnd, spawner, unbind, unsubRoot;
                        children = [];
                        rootEnd = false;
                        unsubRoot = function () {
                        };
                        unbind = function () {
                            var unsubChild, _i, _len;
                            unsubRoot();
                            for (_i = 0, _len = children.length; _i < _len; _i++) {
                                unsubChild = children[_i];
                                unsubChild();
                            }
                            return children = [];
                        };
                        checkEnd = function () {
                            if (rootEnd && children.length === 0) {
                                return sink(end());
                            }
                        };
                        spawner = function (event) {
                            var child, childEnded, handler, removeChild, unsubChild;
                            if (event.isEnd()) {
                                rootEnd = true;
                                return checkEnd();
                            } else if (event.isError()) {
                                return sink(event);
                            } else {
                                child = f(event.value());
                                unsubChild = void 0;
                                childEnded = false;
                                removeChild = function () {
                                    if (unsubChild != null) {
                                        remove(unsubChild, children);
                                    }
                                    return checkEnd();
                                };
                                handler = function (event) {
                                    var reply;
                                    if (event.isEnd()) {
                                        removeChild();
                                        childEnded = true;
                                        return Bacon.noMore;
                                    } else {
                                        if (event instanceof Initial) {
                                            event = event.toNext();
                                        }
                                        reply = sink(event);
                                        if (reply === Bacon.noMore) {
                                            unbind();
                                        }
                                        return reply;
                                    }
                                };
                                unsubChild = child.subscribe(handler);
                                if (!childEnded) {
                                    return children.push(unsubChild);
                                }
                            }
                        };
                        unsubRoot = root.subscribe(spawner);
                        return unbind;
                    });
                };
                Observable.prototype.flatMapLatest = function (f) {
                    var stream, _this = this;
                    f = makeSpawner(f);
                    stream = this.toEventStream();
                    return stream.flatMap(function (value) {
                        return f(value).takeUntil(stream);
                    });
                };
                Observable.prototype.not = function () {
                    return this.map(function (x) {
                        return !x;
                    });
                };
                Observable.prototype.log = function () {
                    var args;
                    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                    this.subscribe(function (event) {
                        return typeof console !== 'undefined' && console !== null ? typeof console.log === 'function' ? console.log.apply(console, __slice.call(args).concat([event.describe()])) : void 0 : void 0;
                    });
                    return this;
                };
                Observable.prototype.slidingWindow = function (n) {
                    return this.scan([], function (window, value) {
                        return window.concat([value]).slice(-n);
                    });
                };
                return Observable;
            }();
            EventStream = function (_super) {
                __extends(EventStream, _super);
                function EventStream(subscribe) {
                    var dispatcher;
                    EventStream.__super__.constructor.call(this);
                    assertFunction(subscribe);
                    dispatcher = new Dispatcher(subscribe);
                    this.subscribe = dispatcher.subscribe;
                    this.hasSubscribers = dispatcher.hasSubscribers;
                }
                EventStream.prototype.map = function () {
                    var args, p;
                    p = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
                    if (p instanceof Property) {
                        return p.sampledBy(this, former);
                    } else {
                        return EventStream.__super__.map.apply(this, [p].concat(__slice.call(args)));
                    }
                };
                EventStream.prototype.delay = function (delay) {
                    return this.flatMap(function (value) {
                        return Bacon.later(delay, value);
                    });
                };
                EventStream.prototype.debounce = function (delay) {
                    return this.flatMapLatest(function (value) {
                        return Bacon.later(delay, value);
                    });
                };
                EventStream.prototype.throttle = function (delay) {
                    return this.bufferWithTime(delay).map(function (values) {
                        return values[values.length - 1];
                    });
                };
                EventStream.prototype.bufferWithTime = function (delay) {
                    var schedule, _this = this;
                    schedule = function (buffer) {
                        return buffer.schedule();
                    };
                    return this.buffer(delay, schedule, schedule);
                };
                EventStream.prototype.bufferWithCount = function (count) {
                    var flushOnCount;
                    flushOnCount = function (buffer) {
                        if (buffer.values.length === count) {
                            return buffer.flush();
                        }
                    };
                    return this.buffer(0, flushOnCount);
                };
                EventStream.prototype.buffer = function (delay, onInput, onFlush) {
                    var buffer, delayMs, reply;
                    if (onInput == null) {
                        onInput = function () {
                        };
                    }
                    if (onFlush == null) {
                        onFlush = function () {
                        };
                    }
                    buffer = {
                        scheduled: false,
                        end: null,
                        values: [],
                        flush: function () {
                            var reply;
                            this.scheduled = false;
                            if (this.values.length > 0) {
                                reply = this.push(next(this.values));
                                this.values = [];
                                if (this.end != null) {
                                    return this.push(this.end);
                                } else if (reply !== Bacon.noMore) {
                                    return onFlush(this);
                                }
                            } else {
                                if (this.end != null) {
                                    return this.push(this.end);
                                }
                            }
                        },
                        schedule: function () {
                            var _this = this;
                            if (!this.scheduled) {
                                this.scheduled = true;
                                return delay(function () {
                                    return _this.flush();
                                });
                            }
                        }
                    };
                    reply = Bacon.more;
                    if (!isFunction(delay)) {
                        delayMs = delay;
                        delay = function (f) {
                            return setTimeout(f, delayMs);
                        };
                    }
                    return this.withHandler(function (event) {
                        buffer.push = this.push;
                        if (event.isError()) {
                            reply = this.push(event);
                        } else if (event.isEnd()) {
                            buffer.end = event;
                            if (!buffer.scheduled) {
                                buffer.flush();
                            }
                        } else {
                            buffer.values.push(event.value());
                            onInput(buffer);
                        }
                        return reply;
                    });
                };
                EventStream.prototype.merge = function (right) {
                    var left;
                    left = this;
                    return new EventStream(function (sink) {
                        var ends, smartSink, unsubBoth, unsubLeft, unsubRight, unsubscribed;
                        unsubLeft = nop;
                        unsubRight = nop;
                        unsubscribed = false;
                        unsubBoth = function () {
                            unsubLeft();
                            unsubRight();
                            return unsubscribed = true;
                        };
                        ends = 0;
                        smartSink = function (event) {
                            var reply;
                            if (event.isEnd()) {
                                ends++;
                                if (ends === 2) {
                                    return sink(end());
                                } else {
                                    return Bacon.more;
                                }
                            } else {
                                reply = sink(event);
                                if (reply === Bacon.noMore) {
                                    unsubBoth();
                                }
                                return reply;
                            }
                        };
                        unsubLeft = left.subscribe(smartSink);
                        if (!unsubscribed) {
                            unsubRight = right.subscribe(smartSink);
                        }
                        return unsubBoth;
                    });
                };
                EventStream.prototype.toProperty = function (initValue) {
                    if (arguments.length === 0) {
                        initValue = None;
                    }
                    return this.scan(initValue, latter);
                };
                EventStream.prototype.toEventStream = function () {
                    return this;
                };
                EventStream.prototype.concat = function (right) {
                    var left;
                    left = this;
                    return new EventStream(function (sink) {
                        var unsub;
                        unsub = left.subscribe(function (e) {
                            if (e.isEnd()) {
                                return unsub = right.subscribe(sink);
                            } else {
                                return sink(e);
                            }
                        });
                        return function () {
                            return unsub();
                        };
                    });
                };
                EventStream.prototype.awaiting = function (other) {
                    return this.map(true).merge(other.map(false)).toProperty(false);
                };
                EventStream.prototype.startWith = function (seed) {
                    return Bacon.once(seed).concat(this);
                };
                EventStream.prototype.withHandler = function (handler) {
                    var dispatcher;
                    dispatcher = new Dispatcher(this.subscribe, handler);
                    return new EventStream(dispatcher.subscribe);
                };
                EventStream.prototype.withSubscribe = function (subscribe) {
                    return new EventStream(subscribe);
                };
                return EventStream;
            }(Observable);
            Property = function (_super) {
                __extends(Property, _super);
                function Property(subscribe) {
                    var combine, _this = this;
                    this.subscribe = subscribe;
                    this.toEventStream = __bind(this.toEventStream, this);
                    this.toProperty = __bind(this.toProperty, this);
                    this.changes = __bind(this.changes, this);
                    this.sample = __bind(this.sample, this);
                    Property.__super__.constructor.call(this);
                    combine = function (other, leftSink, rightSink) {
                        var myVal, otherVal;
                        myVal = None;
                        otherVal = None;
                        return new Property(function (sink) {
                            var checkEnd, combiningSink, initialSent, myEnd, mySink, otherEnd, otherSink, unsubBoth, unsubMe, unsubOther, unsubscribed;
                            unsubscribed = false;
                            unsubMe = nop;
                            unsubOther = nop;
                            unsubBoth = function () {
                                unsubMe();
                                unsubOther();
                                return unsubscribed = true;
                            };
                            myEnd = false;
                            otherEnd = false;
                            checkEnd = function () {
                                var reply;
                                if (myEnd && otherEnd) {
                                    reply = sink(end());
                                    if (reply === Bacon.noMore) {
                                        unsubBoth();
                                    }
                                    return reply;
                                }
                            };
                            initialSent = false;
                            combiningSink = function (markEnd, setValue, thisSink) {
                                return function (event) {
                                    var reply;
                                    if (event.isEnd()) {
                                        markEnd();
                                        checkEnd();
                                        return Bacon.noMore;
                                    } else if (event.isError()) {
                                        reply = sink(event);
                                        if (reply === Bacon.noMore) {
                                            unsubBoth();
                                        }
                                        return reply;
                                    } else {
                                        setValue(new Some(event.value));
                                        if (myVal.isDefined && otherVal.isDefined) {
                                            if (initialSent && event.isInitial()) {
                                                return Bacon.more;
                                            } else {
                                                initialSent = true;
                                                reply = thisSink(sink, event, myVal.value, otherVal.value);
                                                if (reply === Bacon.noMore) {
                                                    unsubBoth();
                                                }
                                                return reply;
                                            }
                                        } else {
                                            return Bacon.more;
                                        }
                                    }
                                };
                            };
                            mySink = combiningSink(function () {
                                return myEnd = true;
                            }, function (value) {
                                return myVal = value;
                            }, leftSink);
                            otherSink = combiningSink(function () {
                                return otherEnd = true;
                            }, function (value) {
                                return otherVal = value;
                            }, rightSink);
                            unsubMe = _this.subscribe(mySink);
                            if (!unsubscribed) {
                                unsubOther = other.subscribe(otherSink);
                            }
                            return unsubBoth;
                        });
                    };
                    this.combine = function (other, f) {
                        var combinator;
                        combinator = toCombinator(f);
                        return Bacon.combineAsArray(_this, other).map(function (values) {
                            return combinator(values[0], values[1]);
                        });
                    };
                    this.sampledBy = function (sampler, combinator) {
                        var pushPropertyValue, values;
                        if (combinator == null) {
                            combinator = former;
                        }
                        combinator = toCombinator(combinator);
                        pushPropertyValue = function (sink, event, propertyVal, streamVal) {
                            return sink(event.apply(function () {
                                return combinator(propertyVal(), streamVal());
                            }));
                        };
                        values = combine(sampler, nop, pushPropertyValue);
                        if (sampler instanceof EventStream) {
                            values = values.changes();
                        }
                        return values.takeUntil(sampler.filter(false).mapEnd());
                    };
                }
                Property.prototype.sample = function (interval) {
                    return this.sampledBy(Bacon.interval(interval, {}));
                };
                Property.prototype.changes = function () {
                    var _this = this;
                    return new EventStream(function (sink) {
                        return _this.subscribe(function (event) {
                            if (!event.isInitial()) {
                                return sink(event);
                            }
                        });
                    });
                };
                Property.prototype.withHandler = function (handler) {
                    return new Property(new PropertyDispatcher(this.subscribe, handler).subscribe);
                };
                Property.prototype.withSubscribe = function (subscribe) {
                    return new Property(new PropertyDispatcher(subscribe).subscribe);
                };
                Property.prototype.toProperty = function () {
                    assertNoArguments(arguments);
                    return this;
                };
                Property.prototype.toEventStream = function () {
                    var _this = this;
                    return new EventStream(function (sink) {
                        return _this.subscribe(function (event) {
                            if (event.isInitial()) {
                                event = event.toNext();
                            }
                            return sink(event);
                        });
                    });
                };
                Property.prototype.and = function (other) {
                    return this.combine(other, function (x, y) {
                        return x && y;
                    });
                };
                Property.prototype.or = function (other) {
                    return this.combine(other, function (x, y) {
                        return x || y;
                    });
                };
                Property.prototype.decode = function (cases) {
                    return this.combine(Bacon.combineTemplate(cases), function (key, values) {
                        return values[key];
                    });
                };
                Property.prototype.delay = function (delay) {
                    return this.delayChanges(function (changes) {
                        return changes.delay(delay);
                    });
                };
                Property.prototype.debounce = function (delay) {
                    return this.delayChanges(function (changes) {
                        return changes.debounce(delay);
                    });
                };
                Property.prototype.throttle = function (delay) {
                    return this.delayChanges(function (changes) {
                        return changes.throttle(delay);
                    });
                };
                Property.prototype.delayChanges = function (f) {
                    return addPropertyInitValueToStream(this, f(this.changes()));
                };
                return Property;
            }(Observable);
            addPropertyInitValueToStream = function (property, stream) {
                var getInitValue;
                getInitValue = function (property) {
                    var value;
                    value = None;
                    property.subscribe(function (event) {
                        if (event.isInitial()) {
                            value = new Some(event.value());
                        }
                        return Bacon.noMore;
                    });
                    return value;
                };
                return stream.toProperty(getInitValue(property));
            };
            Dispatcher = function () {
                function Dispatcher(subscribe, handleEvent) {
                    var addWaiter, done, ended, pushing, queue, removeSink, sinks, unsubscribeFromSource, waiters, _this = this;
                    if (subscribe == null) {
                        subscribe = function () {
                            return nop;
                        };
                    }
                    sinks = [];
                    queue = null;
                    pushing = false;
                    ended = false;
                    this.hasSubscribers = function () {
                        return sinks.length > 0;
                    };
                    unsubscribeFromSource = nop;
                    removeSink = function (sink) {
                        return sinks = _.without(sink, sinks);
                    };
                    waiters = null;
                    done = function (event) {
                        var w, ws, _i, _len;
                        if (waiters != null) {
                            ws = waiters;
                            waiters = null;
                            for (_i = 0, _len = ws.length; _i < _len; _i++) {
                                w = ws[_i];
                                w();
                            }
                        }
                        return event.onDone = Event.prototype.onDone;
                    };
                    addWaiter = function (listener) {
                        return waiters = (waiters || []).concat([listener]);
                    };
                    this.push = function (event) {
                        var reply, sink, tmpSinks, _i, _len;
                        if (!pushing) {
                            try {
                                pushing = true;
                                event.onDone = addWaiter;
                                tmpSinks = sinks;
                                for (_i = 0, _len = tmpSinks.length; _i < _len; _i++) {
                                    sink = tmpSinks[_i];
                                    reply = sink(event);
                                    if (reply === Bacon.noMore || event.isEnd()) {
                                        removeSink(sink);
                                    }
                                }
                            } catch (e) {
                                queue = null;
                                throw e;
                            } finally {
                                pushing = false;
                            }
                            while (queue != null ? queue.length : void 0) {
                                event = _.head(queue);
                                queue = _.tail(queue);
                                _this.push(event);
                            }
                            done(event);
                            if (_this.hasSubscribers()) {
                                return Bacon.more;
                            } else {
                                return Bacon.noMore;
                            }
                        } else {
                            queue = (queue || []).concat([event]);
                            return Bacon.more;
                        }
                    };
                    if (handleEvent == null) {
                        handleEvent = function (event) {
                            return this.push(event);
                        };
                    }
                    this.handleEvent = function (event) {
                        if (event.isEnd()) {
                            ended = true;
                        }
                        return handleEvent.apply(_this, [event]);
                    };
                    this.subscribe = function (sink) {
                        if (ended) {
                            sink(end());
                            return nop;
                        } else {
                            assertFunction(sink);
                            sinks = sinks.concat(sink);
                            if (sinks.length === 1) {
                                unsubscribeFromSource = subscribe(_this.handleEvent);
                            }
                            assertFunction(unsubscribeFromSource);
                            return function () {
                                removeSink(sink);
                                if (!_this.hasSubscribers()) {
                                    return unsubscribeFromSource();
                                }
                            };
                        }
                    };
                }
                return Dispatcher;
            }();
            PropertyDispatcher = function (_super) {
                __extends(PropertyDispatcher, _super);
                function PropertyDispatcher(subscribe, handleEvent) {
                    var current, ended, push, _this = this;
                    PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
                    current = None;
                    push = this.push;
                    subscribe = this.subscribe;
                    ended = false;
                    this.push = function (event) {
                        if (event.isEnd()) {
                            ended = true;
                        }
                        if (event.hasValue()) {
                            current = new Some(event.value());
                        }
                        return push.apply(_this, [event]);
                    };
                    this.subscribe = function (sink) {
                        var initSent, reply, shouldBounceInitialValue;
                        initSent = false;
                        shouldBounceInitialValue = function () {
                            return _this.hasSubscribers() || ended;
                        };
                        reply = current.filter(shouldBounceInitialValue).map(function (val) {
                            return sink(initial(val));
                        });
                        if (reply.getOrElse(Bacon.more) === Bacon.noMore) {
                            return nop;
                        } else if (ended) {
                            sink(end());
                            return nop;
                        } else {
                            return subscribe.apply(_this, [sink]);
                        }
                    };
                }
                return PropertyDispatcher;
            }(Dispatcher);
            Bus = function (_super) {
                __extends(Bus, _super);
                function Bus() {
                    var ended, guardedSink, sink, subscribeAll, subscribeInput, subscriptions, unsubAll, unsubscribeInput, _this = this;
                    sink = void 0;
                    subscriptions = [];
                    ended = false;
                    guardedSink = function (input) {
                        return function (event) {
                            if (event.isEnd()) {
                                unsubscribeInput(input);
                                return Bacon.noMore;
                            } else {
                                return sink(event);
                            }
                        };
                    };
                    unsubAll = function () {
                        var sub, _i, _len, _results;
                        _results = [];
                        for (_i = 0, _len = subscriptions.length; _i < _len; _i++) {
                            sub = subscriptions[_i];
                            _results.push(typeof sub.unsub === 'function' ? sub.unsub() : void 0);
                        }
                        return _results;
                    };
                    subscribeInput = function (subscription) {
                        return subscription.unsub = subscription.input.subscribe(guardedSink(subscription.input));
                    };
                    unsubscribeInput = function (input) {
                        var i, sub, _i, _len;
                        for (i = _i = 0, _len = subscriptions.length; _i < _len; i = ++_i) {
                            sub = subscriptions[i];
                            if (sub.input === input) {
                                if (typeof sub.unsub === 'function') {
                                    sub.unsub();
                                }
                                subscriptions.splice(i, 1);
                                return;
                            }
                        }
                    };
                    subscribeAll = function (newSink) {
                        var subscription, unsubFuncs, _i, _len, _ref1;
                        sink = newSink;
                        unsubFuncs = [];
                        _ref1 = cloneArray(subscriptions);
                        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                            subscription = _ref1[_i];
                            subscribeInput(subscription);
                        }
                        return unsubAll;
                    };
                    Bus.__super__.constructor.call(this, subscribeAll);
                    this.plug = function (input) {
                        var sub;
                        if (ended) {
                            return;
                        }
                        sub = { input: input };
                        subscriptions.push(sub);
                        if (sink != null) {
                            subscribeInput(sub);
                        }
                        return function () {
                            return unsubscribeInput(input);
                        };
                    };
                    this.push = function (value) {
                        return typeof sink === 'function' ? sink(next(value)) : void 0;
                    };
                    this.error = function (error) {
                        return typeof sink === 'function' ? sink(new Error(error)) : void 0;
                    };
                    this.end = function () {
                        ended = true;
                        unsubAll();
                        return typeof sink === 'function' ? sink(end()) : void 0;
                    };
                }
                return Bus;
            }(EventStream);
            Some = function () {
                function Some(value) {
                    this.value = value;
                }
                Some.prototype.getOrElse = function () {
                    return this.value;
                };
                Some.prototype.get = function () {
                    return this.value;
                };
                Some.prototype.filter = function (f) {
                    if (f(this.value)) {
                        return new Some(this.value);
                    } else {
                        return None;
                    }
                };
                Some.prototype.map = function (f) {
                    return new Some(f(this.value));
                };
                Some.prototype.forEach = function (f) {
                    return f(this.value);
                };
                Some.prototype.isDefined = true;
                Some.prototype.toArray = function () {
                    return [this.value];
                };
                return Some;
            }();
            None = {
                getOrElse: function (value) {
                    return value;
                },
                filter: function () {
                    return None;
                },
                map: function () {
                    return None;
                },
                forEach: function () {
                },
                isDefined: false,
                toArray: function () {
                    return [];
                }
            };
            Bacon.EventStream = EventStream;
            Bacon.Property = Property;
            Bacon.Observable = Observable;
            Bacon.Bus = Bus;
            Bacon.Initial = Initial;
            Bacon.Next = Next;
            Bacon.End = End;
            Bacon.Error = Error;
            nop = function () {
            };
            latter = function (_, x) {
                return x;
            };
            former = function (x, _) {
                return x;
            };
            initial = function (value) {
                return new Initial(_.always(value));
            };
            next = function (value) {
                return new Next(_.always(value));
            };
            end = function () {
                return new End();
            };
            toEvent = function (x) {
                if (x instanceof Event) {
                    return x;
                } else {
                    return next(x);
                }
            };
            cloneArray = function (xs) {
                return xs.slice(0);
            };
            indexOf = Array.prototype.indexOf ? function (xs, x) {
                return xs.indexOf(x);
            } : function (xs, x) {
                var i, y, _i, _len;
                for (i = _i = 0, _len = xs.length; _i < _len; i = ++_i) {
                    y = xs[i];
                    if (x === y) {
                        return i;
                    }
                }
                return -1;
            };
            remove = function (x, xs) {
                var i;
                i = indexOf(xs, x);
                if (i >= 0) {
                    return xs.splice(i, 1);
                }
            };
            assert = function (message, condition) {
                if (!condition) {
                    throw message;
                }
            };
            assertEvent = function (event) {
                return assert('not an event : ' + event, event instanceof Event && event.isEvent());
            };
            assertFunction = function (f) {
                return assert('not a function : ' + f, isFunction(f));
            };
            isFunction = function (f) {
                return typeof f === 'function';
            };
            assertArray = function (xs) {
                return assert('not an array : ' + xs, xs instanceof Array);
            };
            assertNoArguments = function (args) {
                return assert('no arguments supported', args.length === 0);
            };
            assertString = function (x) {
                return assert('not a string : ' + x, typeof x === 'string');
            };
            methodCall = function (obj, method, args) {
                assertString(method);
                if (args === void 0) {
                    args = [];
                }
                return function (value) {
                    return obj[method].apply(obj, args.concat([value]));
                };
            };
            partiallyApplied = function (f, applied) {
                return function () {
                    var args;
                    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                    return f.apply(null, applied.concat(args));
                };
            };
            makeSpawner = function (f) {
                if (f instanceof Observable) {
                    f = _.always(f);
                }
                assertFunction(f);
                return f;
            };
            makeFunction = function (f, args) {
                if (isFunction(f)) {
                    if (args.length) {
                        return partiallyApplied(f, args);
                    } else {
                        return f;
                    }
                } else if (isFieldKey(f)) {
                    return toFieldExtractor(f, args);
                } else if (typeof f === 'object' && args.length) {
                    return methodCall(f, _.head(args), _.tail(args));
                } else {
                    return _.always(f);
                }
            };
            isFieldKey = function (f) {
                return typeof f === 'string' && f.length > 1 && f.charAt(0) === '.';
            };
            Bacon.isFieldKey = isFieldKey;
            toFieldExtractor = function (f, args) {
                var partFuncs, parts;
                parts = f.slice(1).split('.');
                partFuncs = _.map(toSimpleExtractor(args), parts);
                return function (value) {
                    var _i, _len;
                    for (_i = 0, _len = partFuncs.length; _i < _len; _i++) {
                        f = partFuncs[_i];
                        value = f(value);
                    }
                    return value;
                };
            };
            toSimpleExtractor = function (args) {
                return function (key) {
                    return function (value) {
                        var fieldValue;
                        fieldValue = value[key];
                        if (isFunction(fieldValue)) {
                            return fieldValue.apply(value, args);
                        } else {
                            return fieldValue;
                        }
                    };
                };
            };
            toFieldKey = function (f) {
                return f.slice(1);
            };
            toCombinator = function (f) {
                var key;
                if (isFunction(f)) {
                    return f;
                } else if (isFieldKey(f)) {
                    key = toFieldKey(f);
                    return function (left, right) {
                        return left[key](right);
                    };
                } else {
                    return assert('not a function or a field key: ' + f, false);
                }
            };
            toOption = function (v) {
                if (v instanceof Some || v === None) {
                    return v;
                } else {
                    return new Some(v);
                }
            };
            if (typeof define !== 'undefined' && define !== null && define.amd != null) {
                if (typeof define === 'function') {
                    define(function () {
                        return Bacon;
                    });
                }
            }
            _ = {
                head: function (xs) {
                    return xs[0];
                },
                always: function (x) {
                    return function () {
                        return x;
                    };
                },
                empty: function (xs) {
                    return xs.length === 0;
                },
                tail: function (xs) {
                    return xs.slice(1, xs.length);
                },
                filter: function (f, xs) {
                    var filtered, x, _i, _len;
                    filtered = [];
                    for (_i = 0, _len = xs.length; _i < _len; _i++) {
                        x = xs[_i];
                        if (f(x)) {
                            filtered.push(x);
                        }
                    }
                    return filtered;
                },
                map: function (f, xs) {
                    var x, _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = xs.length; _i < _len; _i++) {
                        x = xs[_i];
                        _results.push(f(x));
                    }
                    return _results;
                },
                each: function (xs, f) {
                    var key, value, _results;
                    _results = [];
                    for (key in xs) {
                        value = xs[key];
                        _results.push(f(key, value));
                    }
                    return _results;
                },
                toArray: function (xs) {
                    if (xs instanceof Array) {
                        return xs;
                    } else {
                        return [xs];
                    }
                },
                contains: function (xs, x) {
                    return indexOf(xs, x) !== -1;
                },
                id: function (x) {
                    return x;
                },
                last: function (xs) {
                    return xs[xs.length - 1];
                },
                all: function (xs) {
                    var x, _i, _len;
                    for (_i = 0, _len = xs.length; _i < _len; _i++) {
                        x = xs[_i];
                        if (!x) {
                            return false;
                        }
                    }
                    return true;
                },
                any: function (xs) {
                    var x, _i, _len;
                    for (_i = 0, _len = xs.length; _i < _len; _i++) {
                        x = xs[_i];
                        if (x) {
                            return true;
                        }
                    }
                    return false;
                },
                without: function (x, xs) {
                    return _.filter(function (y) {
                        return y !== x;
                    }, xs);
                }
            };
            Bacon._ = _;
        }.call(this));
    });
    require.define('/src/features/forcequotes.co', function (module, exports, __dirname, __filename) {
        var ref$, onpostinsert, onready, onprerender, L, truncate, lightbox, munge;
        ref$ = require('/src/utils/features.co', module), onpostinsert = ref$.onpostinsert, onready = ref$.onready, onprerender = ref$.onprerender;
        L = require('/src/utils/dom.co', module).L;
        truncate = require('/src/utils/string.co', module).truncate;
        lightbox = require('/src/utils/lightbox.co', module)(function (it) {
            var ref$;
            return {
                src: (ref$ = it.dataset).src,
                width: ref$.width,
                height: ref$.height
            };
        });
        munge = function (ctx) {
            var i$, ref$, len$, quote, no, post, x0$, j$, x1$, ref1$, len1$, k$, x2$, ref2$, len2$, text, x3$, x4$, ref3$;
            for (i$ = 0, len$ = (ref$ = ctx.querySelectorAll('.quotelink:not(.backlink):not(.forcequoted)')).length; i$ < len$; ++i$) {
                quote = ref$[i$];
                if (quote.parentNode.className === 'smaller') {
                    continue;
                }
                no = quote.hash.substring(2);
                if (post = board.posts[no]) {
                    if (post.comment.length > 0) {
                        x0$ = L('div');
                        x0$.innerHTML = post.comment.replace(/<br>/g, ' ');
                        for (j$ = 0, len1$ = (ref1$ = x0$.querySelectorAll('.quotelink')).length; j$ < len1$; ++j$) {
                            x1$ = ref1$[j$];
                            x1$.remove();
                        }
                        for (k$ = 0, len2$ = (ref2$ = x0$.querySelectorAll('s')).length; k$ < len2$; ++k$) {
                            x2$ = ref2$[k$];
                            x2$.remove();
                        }
                        text = x0$.textContent;
                        quote.after((x3$ = L('span'), x3$.textContent = ' ' + truncate(text, 70).replace(/^\s+/, ''), x3$.className = 'quote forcedquote', x3$));
                    }
                    if (post.image) {
                        quote.after((x4$ = L('img'), x4$.className = 'forcedimage', x4$.setAttribute('data-width', post.image.width), x4$.setAttribute('data-height', post.image.height), x4$.setAttribute('data-src', post.image.url), ref3$ = x4$.style, ref3$.maxHeight = '15px', ref3$.display = 'inline-block', ref3$.verticalAlign = 'middle', x4$.src = post.image.spoiler ? board.spoilerUrl : post.image.thumb.url, x4$.addEventListener('mouseover', lightbox), x4$));
                    }
                    quote.textContent = '\xbb' + post.idx;
                    quote.classList.add('forcequoted');
                }
            }
        };
        if (board.isThread) {
            onprerender(function () {
                var i$, x0$, ref$, len$;
                for (i$ = 0, len$ = (ref$ = this.body.querySelectorAll('.post')).length; i$ < len$; ++i$) {
                    x0$ = ref$[i$];
                    munge(x0$);
                }
            });
            onready(function () {
                onpostinsert(function () {
                    munge(this.post);
                });
            });
        }
    });
    require.define('/src/onready.co', function (module, exports, __dirname, __filename) {
        var ref$, L, $$, $, parser, onready, truncate, ref1$, get, set, sset, sget, boardTemplate, x0$, html, x1$, head, x2$, x3$, body, d, catalogTemplate;
        ref$ = require('/src/utils/dom.co', module), L = ref$.L, $$ = ref$.$$, $ = ref$.$;
        parser = require('/src/parser/index.co', module);
        onready = require('/src/utils/features.co', module).onready;
        truncate = require('/src/utils/string.co', module).truncate;
        ref1$ = require('/src/utils/storage.co', module), get = ref1$.get, set = ref1$.set, sset = ref1$.sset, sget = ref1$.sget;
        boardTemplate = require('/templates/board.cojade', module);
        x0$ = html = L('html');
        x0$.appendChild((x1$ = head = L('head'), x1$.appendChild(L('title')), x1$.appendChild((x2$ = L('style'), x2$.id = 'c4-style', x2$.textContent = require('/style/c4.styl', module), x2$)), x1$.appendChild((x3$ = L('script'), x3$.src = '//www.google.com/recaptcha/api/challenge?k=6Ldp2bsSAAAAAAJ5uyx_lx34lJeEpTLVkP5k04qc', x3$.addEventListener('load', function () {
            var x4$;
            head.appendChild((x4$ = L('script'), x4$.src = '//www.google.com/recaptcha/api/js/recaptcha.js', x4$.addEventListener('load', function () {
                var x5$;
                x5$ = L('script');
                x5$.textContent = '(function() {var c;if (c = document.getElementById(\'captcha\')) {Recaptcha._init_options({theme: \'custom\',custom_theme_widget: c});Recaptcha.theme = \'custom\';Recaptcha.widget = c;Recaptcha._finish_widget();}}())';
                if (board.ready) {
                    head.appendChild(x5$);
                } else {
                    onready(function () {
                        head.appendChild(x5$);
                    });
                }
            }), x4$));
        }), x3$)), x1$));
        body = L('body');
        d = document.replaceChild(html, document.documentElement);
        function parseHeader() {
            var x4$, ref$, ref1$, ref2$, x5$;
            console.time('parse page');
            x4$ = board;
            x4$.title = ((ref$ = d.querySelector('.boardTitle')) != null ? ref$.textContent : void 8) || '';
            x4$.subtitle = ((ref1$ = d.querySelector('.boardSubtitle')) != null ? ref1$.innerHTML : void 8) || '';
            x4$.nav = d.querySelector('#boardNavDesktop').innerHTML;
            x4$.banner = d.querySelector('.title').src;
            x4$.message = (ref2$ = d.querySelector('.globalMessage')) != null ? ref2$.innerHTML : void 8;
            x4$.sfw = d.querySelector('link[rel="shortcut icon"]').href.slice(-6) === 'ws.ico';
            x4$.type = x4$.sfw ? 'sfw' : 'nsfw';
            x4$.favicon = board.favicons[x4$.type];
            x4$.password = get('password') || Math.random().toString().substr(-8);
            console.timeEnd('parse page');
            console.log(board);
            x5$ = body;
            x5$.id = board.name;
            x5$.className = board.type + ' ' + (board.isThread ? 'threadpage' : 'boardpage');
        }
        catalogTemplate = require('/templates/catalog.cojade', module);
        if (board.isCatalog) {
            document.addEventListener('DOMContentLoaded', function () {
                var catalogText, catalog;
                parseHeader();
                catalogText = Array.prototype.filter.call(d.querySelectorAll('script'), function (it) {
                    return /var catalog/.test(it.textContent);
                })[0];
                if (!catalogText) {
                    throw new Error('what is happening');
                }
                catalogText = catalogText.textContent.toString().trim();
                catalog = JSON.parse(catalogText.substring(14, catalogText.length - 72));
                board.catalog = catalog;
                console.log(catalog);
                body.innerHTML = catalogTemplate(catalog, { order: 'date' });
                html.appendChild(body);
                require('/src/catalog.co', module);
            });
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                var version, data, i$, x4$, ref$, len$, j$, x5$, ref1$, len1$, k$, x6$, ref2$, len2$, bodyHtml, x7$, ref3$, x8$;
                console.time('initial render');
                parseHeader();
                function dateReviver(k, v) {
                    if (k === 'time') {
                        return new Date(v);
                    } else {
                        return v;
                    }
                }
                version = c4_COMPILATION_VERSION;
                if (board.isThread) {
                    data = sget('cache-' + board.threadNo, dateReviver);
                }
                if (board.isThread && (data != null ? data.version : void 8) === version) {
                    console.log('using cached thread data');
                    board.thread = data.thread;
                    board.threads = [data.thread];
                } else {
                    console.time('parse board');
                    board.threads = parser.dom(d, board.name);
                    console.timeEnd('parse board');
                    if (board.isThread) {
                        board.thread = board.threads[0];
                    }
                }
                board.posts = {};
                for (i$ = 0, len$ = (ref$ = board.threads).length; i$ < len$; ++i$) {
                    x4$ = ref$[i$];
                    for (j$ = 0, len1$ = (ref1$ = x4$.posts).length; j$ < len1$; ++j$) {
                        x5$ = ref1$[j$];
                        board.posts[x5$.no] = x5$;
                    }
                }
                board.threadsById = {};
                for (k$ = 0, len2$ = (ref2$ = board.threads).length; k$ < len2$; ++k$) {
                    x6$ = ref2$[k$];
                    board.threadsById[x6$.no] = x6$;
                }
                console.log(board.threads);
                console.time('generate new HTML body');
                bodyHtml = boardTemplate(board);
                console.timeEnd('generate new HTML body');
                console.time('parse new body HTML');
                body.innerHTML = bodyHtml;
                console.timeEnd('parse new body HTML');
                console.time('prerender handlers');
                document.dispatchEvent(new CustomEvent('c4-prerender', { detail: { body: body } }));
                console.timeEnd('prerender handlers');
                console.time('render new body');
                html.appendChild(body);
                console.timeEnd('render new body');
                if (board.isBoard) {
                    console.time('highlight current page');
                    body.querySelector('#pages a[href="' + (board.page || board.url) + '"]').id = 'current';
                    console.timeEnd('highlight current page');
                }
                function text(it) {
                    var x7$;
                    x7$ = L('div');
                    x7$.innerHTML = it;
                    return x7$.textContent;
                }
                console.time('set new page title');
                document.title = board.isThread ? (x7$ = board.thread.op, truncate(x7$.subject || text(x7$.comment) || ((ref3$ = x7$.image) != null ? ref3$.filename : void 8) || x7$.time.relativeDate()) + ' - /' + board.name + '/') : board.title;
                console.timeEnd('set new page title');
                console.time('set correct favicon');
                document.head.append((x8$ = L('link'), x8$.id = 'favicon', x8$.rel = 'icon', x8$.type = 'image/x-icon', x8$.href = board.favicon.src, x8$));
                console.timeEnd('set correct favicon');
                console.timeEnd('initial render');
                if (window.location.hash && !sget(document.URL)) {
                    window.location.hash = window.location.hash;
                    window.addEventListener('scroll', function () {
                        function registerPage() {
                            var ref$;
                            sset((ref$ = {}, ref$[document.URL] = true, ref$));
                            return window.removeEventListener('scroll', registerPage);
                        }
                        return registerPage;
                    }());
                }
                board.ready = true;
                if (board.isThread) {
                    window.addEventListener('unload', function () {
                        sset('cache-' + board.threadNo, {
                            version: version,
                            thread: board.thread
                        });
                    });
                }
                console.time('onready handlers');
                document.dispatchEvent(new CustomEvent('c4-ready', {
                    detail: {
                        threads: board.threads,
                        el: $('threads')
                    }
                }));
                console.timeEnd('onready handlers');
            });
        }
    });
    require.define('/src/catalog.co', function (module, exports, __dirname, __filename) {
        var ref$, L, $$, $, catalogThread, catalog, i$, x0$, ref1$, len$;
        ref$ = require('/src/utils/dom.co', module), L = ref$.L, $$ = ref$.$$, $ = ref$.$;
        catalogThread = require('/templates/catalog-thread.cojade', module);
        catalog = board.catalog;
        for (i$ = 0, len$ = (ref1$ = $$('.order')).length; i$ < len$; ++i$) {
            x0$ = ref1$[i$];
            x0$.addEventListener('change', fn$);
        }
        function fn$() {
            if (this.checked) {
                $('catalog').innerHTML = function () {
                    var i$, x1$, ref$, len$, results$ = [];
                    for (i$ = 0, len$ = (ref$ = catalog.order[this.value]).length; i$ < len$; ++i$) {
                        x1$ = ref$[i$];
                        results$.push(catalogThread(catalog.threads[x1$], { no: x1$ }));
                    }
                    return results$;
                }.call(this).join('');
            }
        }
    });
    require.define('/templates/catalog-thread.cojade', function (module, exports, __dirname, __filename) {
        var join;
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            return '  <a href="//boards.4chan.org/' + board.name + '/res/' + extra.no + '" class="catalog-link">\n<figure class="catalog-thread">' + ((locals.imgurl ? '<img src="//thumbs.4chan.org/' + board.name + '/thumb/' + locals.imgurl + 's.jpg" class="catalog-thumb"/>' : '<img src="//static.4chan.org/image/filedeleted.gif" class="catalog-thumb deleted-image"/>') || '') + '\n  <figcaption class="catalog-caption">\n    <div class="reply-count">' + ('R: ' + locals.r + ', I: ' + locals.i || '') + '</div>\n    <p class="teaser">' + (locals.teaser || '') + '</p>\n  </figcaption>\n</figure></a>';
        };
    });
    require.define('/templates/catalog.cojade', function (module, exports, __dirname, __filename) {
        var catalogThread, header, join;
        catalogThread = require('/templates/catalog-thread.cojade', module);
        header = require('/templates/header.cojade', module);
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            return '    ' + (header() || '') + '\n<div id="catalog-controls">\n  <label>\n    <input type="radio" name="order" value="absdate" class="order"/>Last Reply\n  </label>\n  <label>\n    <input type="radio" name="order" value="alt" class="order"/>Bump Order\n  </label>\n  <label>\n    <input type="radio" name="order" value="r" class="order"/>Reply Count\n  </label>\n  <label>\n    <input type="radio" name="order" value="date" class="order"/>Creation Date\n  </label>\n</div>\n<div id="catalog">\n  ' + (join(function () {
                var i$, x0$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = locals.order[extra.order]).length; i$ < len$; ++i$) {
                    x0$ = ref$[i$];
                    results$.push('' + (catalogThread(locals.threads[x0$], { no: x0$ }) || ''));
                }
                return results$;
            }()) || '') + '\n</div>';
        };
    });
    require.define('/templates/header.cojade', function (module, exports, __dirname, __filename) {
        var join;
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            var that;
            return '    \n<nav id="toplinks" class="boardlinks">' + (board.nav || '') + '</nav>\n<header id="header"><a id="banner" href="//boards.4chan.org/' + board.name + '/"><img src="' + board.banner + '" alt="4chan::"/></a>\n  <hgroup>\n    <h1 id="board-name"><a href="//boards.4chan.org/' + board.name + '/">' + (board.title || '') + '</a></h1>\n    <h2 id="board-subtitle">' + (board.subtitle || '') + '</h2>\n  </hgroup>\n</header>' + (((that = board.message) ? '<div id="message-container">\n  <button id="hide-message" type="button">Hide News</button>\n  <div id="message">' + (that || '') + '</div>\n</div>' : void 8) || '');
        };
    });
    require.define('/style/c4.styl', function (module, exports, __dirname, __filename) {
        module.exports = 'html {\n  min-height: 100%;\n  font-family: Droid Serif, serif;\n  font-size: 10pt;\n}\n::selection {\n  background: #29df75;\n  color: #000;\n}\n::-moz-selection {\n  background: #29df75;\n  color: #000;\n}\n[hidden] {\n  display: none !important;\n}\nbutton:enabled {\n  cursor: pointer;\n}\n.bold {\n  font-weight: bold;\n}\n.smaller {\n  font-size: smaller;\n}\na {\n  text-decoration: none;\n}\nbody.sfw {\n  background: url("data:image/png;base64,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") #dce0f4;\n}\nbody.sfw > header a,\nbody.sfw > footer a,\nbody.sfw .boardlinks a {\n  color: #34345c;\n}\nbody.sfw .boardlinks {\n  color: #89a;\n}\nbody.sfw .post:target {\n  background: #d6bad0 url("data:image/png;base64,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") !important;\n}\nbody.sfw .thread {\n  background: linear-gradient(0deg, rgba(255,255,255,0.09), rgba(255,255,255,0) 2em);\n}\nbody.sfw .reply {\n  background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent 2em, rgba(255,255,255,0) calc(98%), rgba(255,255,255,0.05));\n}\nbody.sfw #postpreview {\n  background: url("data:image/png;base64,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") #dce0f4;\n}\nbody.sfw .reply:before,\nbody.sfw .inlined-idx {\n  color: #9db0cb;\n}\nbody.sfw #postpreview.op {\n  background-color: #eef2ff;\n}\nbody.sfw .quotelink {\n  color: #d00;\n}\nbody.nsfw {\n  background: #ffe url("//static.4chan.org/image/fade.png") repeat-x;\n  color: #800000;\n}\nbody.nsfw > header a,\nbody.nsfw > footer a,\nbody.nsfw .boardlinks a {\n  color: #800;\n}\nbody.nsfw .boardlinks {\n  color: #b86;\n}\nbody.nsfw .thread {\n  border-color: #808080;\n}\nbody.nsfw .post:target {\n  background-color: #f0c0b0 !important;\n}\nbody.nsfw .reply,\nbody.nsfw #postpreview {\n  background-color: #d9bfb7;\n}\nbody.nsfw .reply {\n  border-color: #d9bfb7;\n}\nbody.nsfw .reply:before {\n  color: #d9bfb7;\n}\nbody.nsfw .inlined-idx {\n  color: #bd9083;\n}\nbody.nsfw #postpreview.op {\n  background-color: #ffe;\n}\nbody.nsfw .quotelink {\n  color: #000080;\n}\nhtml,\nbody {\n  margin: 0;\n  padding: 0;\n}\n#toplinks {\n  float: right;\n  width: 300px;\n  margin: 0 1em;\n}\n#header {\n  margin: 1em;\n  color: #af0a0f;\n}\n#board-name {\n  font-size: 24pt;\n  margin: 0;\n}\n#board-name a {\n  color: #af0a0f !important;\n}\n#board-name a:hover {\n  text-decoration: underline;\n}\n#board-subtitle {\n  font-size: 10px;\n  font-weight: normal;\n}\n#banner {\n  margin-right: 1em;\n  float: left;\n}\n#message-container {\n  margin: 1em;\n}\n#hide-message {\n  text-align: right;\n  font-size: 10pt;\n}\n#message {\n  clear: both;\n}\n.boardlinks {\n  font-size: 9pt;\n  text-align: center;\n}\n#threads {\n  clear: both;\n}\n#pages {\n  text-align: center;\n  margin: 0pt;\n  padding: 0pt;\n}\n#pages li {\n  display: inline;\n}\n#pages a {\n  border-color: #aaa;\n  border-style: solid;\n  border-width: 1px 0;\n  color: #000;\n  display: inline-block;\n  margin: 0.25em;\n  padding: 0.5em 1em;\n}\n#pages a#current,\n#pages a:hover {\n  background-color: rgba(200,200,200,0.7);\n}\n#updater {\n  float: right;\n  margin: 0.5em;\n}\n#postform {\n  display: table;\n  margin: 1em auto;\n}\n#postform #comment,\n#postform #recaptcha_response_field {\n  width: 100%;\n}\n#name,\n#email,\n#subject {\n  width: 31.3%;\n}\n#recaptcha_image {\n  display: block;\n  background: #fff;\n  width: 100% !important;\n}\n#recaptcha_image img {\n  display: block;\n  margin: auto;\n}\nbody.sfw {\n  background: url("data:image/png;base64,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") #dce0f4;\n}\nbody.sfw > header a,\nbody.sfw > footer a,\nbody.sfw .boardlinks a {\n  color: #34345c;\n}\nbody.sfw .boardlinks {\n  color: #89a;\n}\nbody.sfw .post:target {\n  background: #d6bad0 url("data:image/png;base64,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") !important;\n}\nbody.sfw .thread {\n  background: linear-gradient(0deg, rgba(255,255,255,0.09), rgba(255,255,255,0) 2em);\n}\nbody.sfw .reply {\n  background: linear-gradient(180deg, rgba(0,0,0,0.02), transparent 2em, rgba(255,255,255,0) calc(98%), rgba(255,255,255,0.05));\n}\nbody.sfw #postpreview {\n  background: url("data:image/png;base64,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") #dce0f4;\n}\nbody.sfw .reply:before,\nbody.sfw .inlined-idx {\n  color: #9db0cb;\n}\nbody.sfw #postpreview.op {\n  background-color: #eef2ff;\n}\nbody.sfw .quotelink {\n  color: #d00;\n}\nbody.nsfw {\n  background: #ffe url("//static.4chan.org/image/fade.png") repeat-x;\n  color: #800000;\n}\nbody.nsfw > header a,\nbody.nsfw > footer a,\nbody.nsfw .boardlinks a {\n  color: #800;\n}\nbody.nsfw .boardlinks {\n  color: #b86;\n}\nbody.nsfw .thread {\n  border-color: #808080;\n}\nbody.nsfw .post:target {\n  background-color: #f0c0b0 !important;\n}\nbody.nsfw .reply,\nbody.nsfw #postpreview {\n  background-color: #d9bfb7;\n}\nbody.nsfw .reply {\n  border-color: #d9bfb7;\n}\nbody.nsfw .reply:before {\n  color: #d9bfb7;\n}\nbody.nsfw .inlined-idx {\n  color: #bd9083;\n}\nbody.nsfw #postpreview.op {\n  background-color: #ffe;\n}\nbody.nsfw .quotelink {\n  color: #000080;\n}\n.post {\n  margin: 0;\n  padding: 1em;\n  padding-right: 0;\n  border-radius: 0.3em;\n}\n.reply {\n  padding-left: 3em;\n  transition-property: background-color;\n  transition-duration: 3s;\n}\n.reply.new {\n  background: #feffbf url("data:image/png;base64,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") !important;\n}\n.sage > .post-header > .name:after {\n  content: " (sage)";\n}\n.reply:before,\n.inlined-idx {\n  content: attr(data-idx);\n  position: absolute;\n  text-align: right;\n  display: inline-block;\n  margin-left: -3em;\n  width: 2em;\n  font-size: 8pt;\n  font-family: sans-serif;\n}\n.reply:not(.imagepost):before,\n.inline:not(.imagepost) > .inlined-idx {\n  margin-top: 0.5em;\n}\n.inlined-idx {\n  cursor: pointer;\n}\n.inlined-idx:hover {\n  text-decoration: underline;\n}\n.post-header {\n  margin: 0 0.5em 0 0;\n  padding: 0;\n  font-size: 8pt;\n  font-family: sans-serif;\n  color: #9db0cb;\n  font-weight: normal;\n}\n.post:not(.op) > .post-header {\n  float: right;\n}\n.subject {\n  color: #0f0c5d;\n  font-weight: 700;\n  text-decoration: none;\n}\n.subject:hover {\n  text-decoration: underline;\n}\n.op > .post-header > .subject {\n  font-size: 140%;\n}\n.name {\n  color: #9db0cb;\n}\n.name:link {\n  text-decoration: underline;\n}\n.fileinfo {\n  display: table;\n  color: #839bbd;\n  font-size: 8pt;\n  font-family: sans-serif;\n}\n.fileinfo:not(:hover) > .saucelink,\n.fileinfo:not(:hover) > .dimensions,\n.fileinfo:not(:hover) > .size {\n  transition-delay: 0.5s;\n  opacity: 0;\n}\n.saucelink,\n.dimensions,\n.size {\n  transition-duration: 0.5s;\n}\n.file {\n  display: block;\n  float: left;\n  margin: 0.3em 1em 0.3em 0;\n  position: relative;\n}\n.full {\n  display: block;\n}\n.capcode {\n  font-weight: 800;\n}\n.mod .capcode:hover,\n.admin .capcode:hover {\n  cursor: pointer;\n}\n.admin .name,\n.admin .capcode,\n.admin .tripcode {\n  color: #f00;\n}\n.admin .capcode:after {\n  content: url("https://static.4chan.org/image/adminicon.gif");\n}\n.mod .name,\n.mod .capcode {\n  color: #800080;\n}\n.mod .capcode:after {\n  content: url("https://static.4chan.org/image/modicon.gif");\n}\n.name:after,\n.tripcode:after,\n.capcode:after,\n.posteruid:after,\ntime:after,\n.permalink:after,\n.filename:after,\n.dimensions:after,\n.size:after,\n.saucelink:after,\n.subject:after {\n  content: " ";\n}\n.hide,\n.report {\n  float: right;\n  padding: 0 1px;\n  background: transparent;\n  border: 0;\n  line-height: 100%;\n  font-size: 9pt;\n  color: #9db0cb;\n}\n.post.hidden {\n  opacity: 0.6;\n}\n.post.hidden .file,\n.post.hidden .comment,\n.post.hidden .backlinks,\n.post.hidden .fileinfo {\n  display: none;\n}\n.post.inlined {\n  display: none;\n}\n.post.inlined:target {\n  display: block;\n}\n.post.highlighted {\n  background-color: #d6bad0 !important;\n}\n.unread {\n  border-left: 5px solid #3f0;\n}\n.hiddenlink {\n  text-decoration: line-through;\n}\n.deadlink {\n  color: #808080;\n}\n.permalink {\n  color: inherit;\n}\n.permalink .no:hover {\n  text-decoration: underline;\n}\n.recursivelink {\n  font-weight: bold;\n  color: #000 !important;\n}\n.comment {\n  margin: 0;\n  word-wrap: break-word;\n  line-height: 1.8em;\n  width: 40em;\n}\n.op .comment {\n  width: 50em;\n}\n.quote {\n  font-weight: normal;\n  color: #789922;\n}\n.prettyprint {\n  background-color: #fff;\n  padding: 0.5em;\n  display: inline-block;\n  max-width: 40em;\n  overflow: auto;\n}\ns {\n  text-decoration: none;\n  transition-duration: 1s;\n}\ns:not(:hover) > *,\ns:not(:hover) {\n  color: transparent !important;\n  text-shadow: 0 0 7px #000;\n}\n.backlinks {\n  clear: both;\n  word-wrap: break-word;\n}\n.backlink {\n  display: inline-block;\n}\n.backlink,\n.backlinks > .recursivelink {\n  margin-right: 1em;\n}\na.quotelink.inlinedlink,\nstrong.quotelink.inlinedlink {\n  font-weight: bold;\n  color: #000;\n}\n#postpreview {\n  outline: none;\n  padding: 0.5em;\n  box-shadow: 5px 5px 10px rgba(0,0,0,0.5);\n  margin: 0;\n}\n.inline {\n  margin-right: 0;\n  padding-right: 0;\n}\n.comment .inline {\n  display: table;\n}\n.backlink + .inline {\n  margin-left: 2em;\n  margin-bottom: 0;\n  padding-bottom: 0;\n  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.05) 0.5em, rgba(0,0,0,0.02) 10px, transparent 2em, transparent);\n}\n.inline .backlinks > .recursivelink {\n  display: none;\n}\n.backlink.inlinedlink {\n  display: table;\n}\n.hovered {\n  outline: 3px dashed #00f;\n}\n.forcedimage {\n  margin-left: 0.5em;\n}\n.thread {\n  padding-bottom: 5px;\n  clear: both;\n}\n.thread-info {\n  clear: left;\n  text-align: right;\n  padding: 0 1em;\n}\n.thread.hidden {\n  opacity: 0.6;\n}\n.thread.hidden .replies,\n.thread.hidden .thread-info {\n  display: none;\n}\n.thread.hidden .op .file,\n.thread.hidden .op .comment,\n.thread.hidden .op .backlinks,\n.thread.hidden .op .fileinfo {\n  display: none;\n}\n.sticky > .op > .post-header:before {\n  content: url("//static.4chan.org/image/sticky.gif");\n}\n.closed > .op > .post-header:before {\n  content: url("//static.4chan.org/image/closed.gif");\n}\n.sticky.closed > .op > .post-header:before {\n  content: url("//static.4chan.org/image/closed.gif") url("//static.4chan.org/image/sticky.gif");\n}\n.youtube {\n  position: relative;\n  text-decoration: none;\n  border: 3px solid;\n  border-color: #c6312b;\n  border-radius: 10px;\n  transition: 0.5s;\n  overflow: hidden;\n  display: inline-block;\n  vertical-align: top;\n  margin: 0.25em;\n  width: 120px;\n  height: 90px;\n}\n.youtube:hover {\n  border-color: #ffa200;\n}\n.youtube:after {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 115px;\n  font-size: smaller;\n  font-family: sans-serif;\n  color: #fff;\n  background: rgba(0,0,0,0.5);\n  padding: 0 0.5em;\n  content: attr(data-title);\n}\n.youtube:not(:hover):after {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n#catalog-controls {\n  clear: both;\n}\n#catalog {\n  clear: both;\n  -moz-columns: auto 170px;\n  -moz-column-gap: 0;\n}\n.catalog-link {\n  display: block;\n  color: inherit;\n  padding: 1em;\n  margin: 0;\n  background: linear-gradient(0deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 1em, transparent 2em), linear-gradient(270deg, rgba(255,255,255,0.1), rgba(255,255,255,0) 1em, transparent 2em), linear-gradient(180deg, rgba(0,0,0,0.03), transparent 1em, transparent), linear-gradient(90deg, rgba(0,0,0,0.03), transparent 1em, transparent);\n}\n.catalog-link:hover {\n  box-shadow: 0 0 15px rgba(0,0,0,0.3) inset;\n}\n.catalog-thread {\n  display: inline-block;\n  padding: 0;\n  margin: 0;\n}\n.catalog-caption {\n  font-size: 8pt;\n  font-family: sans-serif;\n  max-width: 150px;\n}\n.reply-count {\n  text-align: center;\n}\n.teaser {\n  max-height: 150px;\n  overflow: hidden;\n}\n.catalog-thumb {\n  max-width: 150px;\n}\n';
    });
    require.define('/templates/board.cojade', function (module, exports, __dirname, __filename) {
        var threadTemplate, header, join;
        threadTemplate = require('/templates/thread.cojade', module);
        header = require('/templates/header.cojade', module);
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            var ref$, that;
            return '    ' + (header() || '') + '\n<div id="threads">\n  ' + (join(function () {
                var i$, x0$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = locals.threads).length; i$ < len$; ++i$) {
                    x0$ = ref$[i$];
                    results$.push('' + (threadTemplate(x0$) || ''));
                }
                return results$;
            }()) || '') + '\n</div>' + ((board.isBoard ? '<ul id="pages">' + ((board.page ? '<li><a href="' + (board.page - 1) + '">previous</a></li>' : void 8) || '') + '\n  <li><a href="' + board.url + '">0</a></li>\n  <li><a href="1">1</a></li>\n  <li><a href="2">2</a></li>\n  <li><a href="3">3</a></li>\n  <li><a href="4">4</a></li>\n  <li><a href="5">5</a></li>\n  <li><a href="6">6</a></li>\n  <li><a href="7">7</a></li>\n  <li><a href="8">8</a></li>\n  <li><a href="9">9</a></li>\n  <li><a href="10">10</a></li>' + ((board.page < 10 ? '<li><a href="' + (board.page + 1) + '">next</a></li>' : void 8) || '') + '\n  <li><a href="catalog">Catalog</a></li>\n</ul>' : void 8) || '') + '\n' + ((!((ref$ = board.thread) != null && ref$.closed) ? '<div id="postform-wrapper">\n  <form id="postform" enctype="multipart/form-data" method="POST" action="https://sys.4chan.org/' + board.name + '/post">\n    <input type="hidden" value="3145728" name="MAX_FILE_SIZE"/>' + (((that = board.threadId) ? '<input type="hidden" value="' + that + '" name="resto"/>' : void 8) || '') + '\n    <input type="hidden" value="regist" name="mode"/>\n    <input id="password" type="hidden" name="pwd" value="' + board.password + '"/>\n    <div id="fields">\n      <input type="text" name="name" id="name" tabindex="10" placeholder="name#tripcode"/>\n      <input type="text" id="email" name="email" tabindex="10" placeholder="email"/>\n      <input type="text" id="subject" name="sub" tabindex="10" placeholder="subject"/>\n      <div id="comment-field">\n        <textarea id="comment" name="com" rows="4" tabindex="10" placeholder="comment"></textarea>\n      </div>\n      <div id="captcha" style="display:none"><a id="recaptcha_image" href="javascript:Recaptcha.reload()" title="Click for new captcha"></a>\n        <input id="recaptcha_response_field" type="text" name="recaptcha_response_field" tabindex="10" placeholder="captcha"/>\n      </div>\n      <div id="file-field">\n        <input id="file" type="file" name="upfile" tabindex="10"/>\n        <label id="spoiler-field">\n          <input type="checkbox" value="on" name="spoiler" tabindex="10"/>\n        </label>\n      </div>\n      <div id="buttons">\n        <button id="post" type="submit" tabindex="10" value="Submit">Post ' + (board.isThread ? 'Reply' : 'New Thread') + '</button>' + ((board.isThread ? '<button id="sage" type="submit" name="email" value="sage" tabindex="10">Sage Reply</button>' : void 8) || '') + '<span id="post-status"></span>\n        <progress id="progress" max="100" value="0" hidden=""></progress>\n      </div>\n    </div>\n  </form>\n</div>' : void 8) || '') + '<span id="updater"><span id="update-status"></span>\n  <button id="update-now">Update now</button></span>';
        };
    });
    require.define('/templates/thread.cojade', function (module, exports, __dirname, __filename) {
        var postTemplate, join;
        postTemplate = require('/templates/post.cojade', module);
        join = function (it) {
            if (it) {
                return it.join('');
            } else {
                return '';
            }
        };
        module.exports = function (locals, extra) {
            var ref$, ref1$, reply;
            return '    \n<article id="' + (locals.id || 't' + locals.no) + '" data-no="' + locals.no + '" class="thread' + (locals.sticky ? ' sticky' : '') + (closed ? ' closed' : '') + '">' + (postTemplate(locals.op, {
                thread: locals,
                container: 'div',
                classes: 'op'
            }) || '') + '\n  <div class="thread-info">\n    ' + ((((ref$ = locals.omitted) != null ? ref$.replies : void 8) || 0) + locals.replies.length) + ' replies and ' + ((((ref1$ = locals.omitted) != null ? ref1$.imageReplies : void 8) || 0) + locals.imageReplies.length) + ' images.\n    ' + ((board.isBoard ? '<a href="' + locals.url + '" class="expand-link">Expand</a>' : void 8) || '') + '\n  </div>\n  <div class="replies">\n    ' + (join(function () {
                var i$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = locals.replies).length; i$ < len$; ++i$) {
                    reply = ref$[i$];
                    results$.push('' + (postTemplate(reply, {
                        thread: locals,
                        container: 'article',
                        classes: 'reply'
                    }) || ''));
                }
                return results$;
            }()) || '') + '\n  </div>\n</article>';
        };
    });
    require.define('/src/updater.co', function (module, exports, __dirname, __filename) {
        var listen, onready, ref$, defer, repeat, ref1$, $, $$, L, postTemplate, parser, drawFavicon, updater, delays, maxDelay, currentDelay, lastUpdate, unread, fade, fadeWhenVisible, out$ = typeof exports != 'undefined' && exports || this;
        listen = require('/src/utils/listen.co', module);
        onready = require('/src/utils/features.co', module).onready;
        ref$ = require('/src/utils/timing.co', module), defer = ref$.defer, repeat = ref$.repeat;
        ref1$ = require('/src/utils/dom.co', module), $ = ref1$.$, $$ = ref1$.$$, L = ref1$.L;
        postTemplate = require('/templates/post.cojade', module);
        parser = require('/src/parser/index.co', module);
        drawFavicon = require('/src/utils/favicon.co', module);
        out$.updater = updater = {};
        delays = [
            10,
            15,
            20,
            30,
            60,
            90,
            120,
            180,
            240,
            300
        ];
        maxDelay = delays.length - 1;
        currentDelay = 0;
        lastUpdate = new Date();
        unread = 0;
        function appendNewPosts(thread, newPosts, deleted) {
            var i$, x0$, len$;
            $('t' + thread.no).lastElementChild.insertAdjacentHTML('beforeend', function () {
                var i$, x0$, ref$, len$, results$ = [];
                for (i$ = 0, len$ = (ref$ = newPosts).length; i$ < len$; ++i$) {
                    x0$ = ref$[i$];
                    results$.push(postTemplate(x0$, {
                        container: 'article',
                        classes: 'new reply'
                    }));
                }
                return results$;
            }().join(''));
            for (i$ = 0, len$ = newPosts.length; i$ < len$; ++i$) {
                x0$ = newPosts[i$];
                board.posts[x0$.no] = x0$;
                document.dispatchEvent(new CustomEvent('c4-postinsert', { detail: { post: $('p' + x0$.no) } }));
            }
        }
        function updateFavicon(thread, newPosts, deleted) {
            unread += newPosts.length;
            drawFavicon(board.favicon, unread > 0 ? unread + '' : '');
        }
        function readPostsWhenScrolledTo(thread, newPosts, deleted) {
            var i$, x0$, len$;
            for (i$ = 0, len$ = newPosts.length; i$ < len$; ++i$) {
                x0$ = newPosts[i$];
                fadeWhenVisible(x0$);
            }
        }
        function updateThreadStats(thread, newPosts, deleted) {
            $('t' + thread.no).querySelector('.thread-info').textContent = thread.replies.length + ' replies and ' + thread.imageReplies.length + ' image replies.';
        }
        function dispatchUpdateEvent(thread, newPosts, deleted) {
            document.dispatchEvent(new CustomEvent('c4-update', {
                detail: {
                    thread: thread,
                    newPosts: newPosts
                }
            }));
        }
        function smoothScrollToBottom() {
            var last;
            last = window.scrollY;
            repeat(50, { auto: false }, function () {
                var remaining, ref$;
                if (!(window.scrollY < last)) {
                    if ((remaining = window.scrollMaxY - window.scrollY) > 1) {
                        window.scrollBy(0, 1 > (ref$ = remaining / 4) ? 1 : ref$);
                        last = window.scrollY;
                        this.repeat();
                    }
                }
            });
        }
        function handleNewPosts(thread, newPosts, deleted) {
            var scroll;
            updater.status.textContent = 'update detected, parsing';
            if (window.scrollMaxY - window.scrollY < 5 && !document.hidden) {
                scroll = true;
            }
            appendNewPosts(thread, newPosts, deleted);
            updateThreadStats(thread, newPosts, deleted);
            updateFavicon(thread, newPosts, deleted);
            dispatchUpdateEvent(thread, newPosts, deleted);
            readPostsWhenScrolledTo(thread, newPosts, deleted);
            if (scroll) {
                smoothScrollToBottom();
            }
        }
        function disableUpdater() {
            updater.countdown.stop();
        }
        function resetDelay() {
            currentDelay = 0;
        }
        function increaseDelay() {
            var ref$;
            currentDelay = (ref$ = currentDelay + 1) < maxDelay ? ref$ : maxDelay;
        }
        function restartCountdown() {
            updater.tminus = delays[currentDelay];
            updater.countdown.restart();
        }
        updater.update = function () {
            var x0$;
            updater.status.textContent = 'Updating thread...';
            updater.button.disabled = true;
            x0$ = new XMLHttpRequest();
            x0$.open('GET', '//api.4chan.org/' + board.name + '/res/' + board.thread.no + '.json');
            x0$.setRequestHeader('If-Modified-Since', lastUpdate.toUTCString());
            x0$.onload = function () {
                var lastModified, oldThread, thread, newPosts, deleted;
                if (this.status === 404) {
                    document.title += '(dead)';
                    updater.status.textContent = 'thread 404\'d';
                    disableUpdater();
                } else {
                    lastModified = new Date(this.getResponseHeader('Last-Modified'));
                    if (lastModified > lastUpdate) {
                        lastUpdate = lastModified;
                        oldThread = board.thread;
                        thread = parser.api(JSON.parse(this.response), board.name);
                        newPosts = thread.replies.filter(function (it) {
                            return !oldThread.post[it.no];
                        });
                        deleted = oldThread.replies.filter(function (it) {
                            return !thread.post[it.no];
                        });
                        handleNewPosts(thread, newPosts, deleted);
                        board.thread = thread;
                        resetDelay();
                    } else {
                        increaseDelay();
                    }
                    restartCountdown();
                }
            };
            x0$.ontimeout = function () {
                updater.status.textContent = 'request timed out...';
                restartCountdown();
            };
            x0$.onerror = function () {
                updater.status.textContent = 'Couldn\'t fetch thread page!';
                disableUpdater();
            };
            x0$.onloadend = function () {
                updater.button.disabled = false;
            };
            x0$.send();
        };
        updater.tminus = delays[currentDelay];
        updater.countdown = repeat(1000, { start: false }, function () {
            updater.status.textContent = 'Updating in ' + updater.tminus + ' seconds...';
            if (--updater.tminus < 0) {
                this.stop();
                updater.update();
            }
        });
        fade = function (post) {
            defer(100, function () {
                post.classList.remove('new');
                --unread;
                drawFavicon(board.favicon, unread > 0 ? unread + '' : '');
            });
        };
        fadeWhenVisible = function (it) {
            var post, y;
            post = $('p' + it.no);
            y = post.offsetTop;
            if (window.innerHeight + window.scrollY > y) {
                if (document.hidden) {
                    listen(document).once('visibilitychange', function () {
                        fade(post);
                    });
                } else {
                    fade(post);
                }
            } else {
                window.addEventListener('scroll', function () {
                    function reset() {
                        if (window.innerHeight + window.scrollY > post.offsetTop) {
                            fade(post);
                            return window.removeEventListener('scroll', reset);
                        }
                    }
                    return reset;
                }());
            }
        };
        onready(function () {
            updater.status = $('update-status');
            updater.button = $('update-now');
            if (board.isThread && !board.thread.closed) {
                updater.countdown.start();
                listen($('update-now')).click(function () {
                    var x0$;
                    x0$ = updater;
                    x0$.countdown.stop();
                    x0$.tminus = delays[currentDelay];
                    x0$.update();
                });
            } else {
                $('updater').hidden = true;
            }
        });
    });
    require.define('/src/utils/favicon.co', function (module, exports, __dirname, __filename) {
        var ref$, $, L, debounce, drawFavicon;
        ref$ = require('/src/utils/dom.co', module), $ = ref$.$, L = ref$.L;
        debounce = require('/src/utils/timing.co', module).debounce;
        module.exports = drawFavicon = debounce(1000, function (image, text) {
            var ref$, x0$, link, x1$, x2$;
            if ((ref$ = $('favicon')) != null) {
                ref$.remove();
            }
            x0$ = link = L('link');
            x0$.id = 'favicon';
            x0$.rel = 'icon';
            x0$.type = 'image/x-icon';
            x1$ = L('canvas');
            x1$.width = 16;
            x1$.height = 16;
            x2$ = x1$.getContext('2d');
            x2$.drawImage(image, 0, 0);
            if (text.length > 0) {
                x2$.font = '8px monospace';
                x2$.fillStyle = '#000';
                x2$.strokeStyle = '#fff';
                x2$.lineWidth = 4;
                x2$.textBaseline = 'bottom';
                x2$.textAlign = 'right';
                x2$.strokeText(text, 16, 16);
                x2$.fillText(text, 16, 16);
            }
            link.href = x1$.toDataURL('image/png');
            document.head.appendChild(link);
        });
    });
    require.define('/src/poster.co', function (module, exports, __dirname, __filename) {
        var listen, onready, ref$, L, $, $$, ref1$, get, set, postStatus;
        listen = require('/src/utils/listen.co', module);
        onready = require('/src/utils/features.co', module).onready;
        ref$ = require('/src/utils/dom.co', module), L = ref$.L, $ = ref$.$, $$ = ref$.$$;
        ref1$ = require('/src/utils/storage.co', module), get = ref1$.get, set = ref1$.set;
        postStatus = function (it) {
            return $('post-status').textContent = it;
        };
        onready(function () {
            var checkValidity, cooldown, ref$;
            checkValidity = function (e) {
                var form, captcha, file, comment, email, ref$, x0$, data, x1$;
                e.preventDefault();
                form = $('postform');
                captcha = $('recaptcha_response_field');
                file = $('file');
                comment = $('comment');
                email = $('email');
                if (/^noko$/i.test(email.value)) {
                    email.value = '';
                }
                captcha.setCustomValidity(!captcha.value ? 'You forgot the captcha!' : '');
                file.setCustomValidity(!file.value && board.isBoard ? 'You forgot your image!' : '');
                comment.setCustomValidity(!file.value && !comment.value ? 'You didn\'t enter a comment or select a file!' : '');
                if (form.checkValidity()) {
                    $('post').disabled = true;
                    if ((ref$ = $('sage')) != null) {
                        ref$.disabled = true;
                    }
                    postStatus('Posting...');
                    x0$ = $('progress');
                    x0$.hidden = false;
                    x0$.value = 0;
                    data = new FormData(form);
                    if (this === $('sage')) {
                        data.append('email', 'sage');
                    }
                    x1$ = new XMLHttpRequest();
                    x1$.open('POST', form.action);
                    listen(x1$).on('load', function () {
                        var x2$, html, captcha, file, comment, ref$, x3$;
                        x2$ = html = L('div');
                        x2$.innerHTML = this.response;
                        console.log(html);
                        captcha = $('recaptcha_response_field');
                        file = $('file');
                        comment = $('comment');
                        $('post').disabled = false;
                        if ((ref$ = $('sage')) != null) {
                            ref$.disabled = false;
                        }
                        if (/Post successful!|uploaded!/.test(html.textContent)) {
                            postStatus('Post successful!');
                            cooldown();
                            $('postform').reset();
                            $('name').value = get('name') || '';
                            $('recaptcha_image').click();
                            updater.countdown.restart(3);
                            return parser.lastParse = 0;
                        } else if (/mistyped the verification/.test(html.textContent)) {
                            postStatus('You mistyped the verification!');
                            $('recaptcha_image').click();
                            x3$ = captcha;
                            x3$.value = '';
                            x3$.focus();
                            return x3$;
                        } else if (/duplicate file entry detected/) {
                            $('postform').reset();
                            $('name').value = get('name') || '';
                            return $('recaptcha_image').click();
                        }
                    }).on('loadend', function () {
                        return $('progress').hidden = true;
                    });
                    listen(x1$.upload).on('progress', function (e) {
                        return $('progress').value = 100 * e.loaded / e.total;
                    });
                    x1$.send(data);
                }
                return false;
            };
            listen($('post')).click(checkValidity);
            listen($('sage')).click(checkValidity);
            cooldown = function () {
                var post, sage, message, tminus;
                post = $('post');
                sage = $('sage');
                post.disabled = true;
                if (sage != null) {
                    sage.disabled = true;
                }
                message = post.textContent;
                tminus = 30;
                post.textContent = tminus;
                return setTimeout(function () {
                    function tick() {
                        if (tminus-- === 0) {
                            post.textContent = message;
                            post.disabled = false;
                            return sage != null ? sage.disabled = false : void 8;
                        } else {
                            post.textContent = tminus;
                            return setTimeout(tick, 1000);
                        }
                    }
                    return tick;
                }(), 1000);
            };
            listen($('name')).on('input', function () {
                return set({ name: this.value });
            });
            if ((ref$ = $('name')) != null) {
                ref$.value = get('name') || '';
            }
        });
    });
    require.define('/src/backlinks.co', function (module, exports, __dirname, __filename) {
        var onupdate, ref$, L, $$;
        onupdate = require('/src/utils/features.co', module).onupdate;
        ref$ = require('/src/utils/dom.co', module), L = ref$.L, $$ = ref$.$$;
        onupdate(function () {
            var i$, ref$, len$, quoter, j$, ref1$, len1$, quoted, k$, x0$, ref2$, len2$, x1$, backlink;
            for (i$ = 0, len$ = (ref$ = this.newPosts).length; i$ < len$; ++i$) {
                quoter = ref$[i$];
                for (j$ = 0, len1$ = (ref1$ = quoter.quotelinks).length; j$ < len1$; ++j$) {
                    quoted = ref1$[j$];
                    for (k$ = 0, len2$ = (ref2$ = $$('.post[data-no="' + quoted + '"] > .backlinks')).length; k$ < len2$; ++k$) {
                        x0$ = ref2$[k$];
                        if (!x0$.querySelector('.backlink[href$="' + quoter + '"]')) {
                            x0$.appendChild((x1$ = backlink = L('a'), x1$.href = '#p' + quoter.no, x1$.className = 'backlink quotelink', x1$.textContent = '\xab' + quoter.idx, x1$));
                            document.dispatchEvent(new CustomEvent('c4-backlink', { detail: { backlink: backlink } }));
                        }
                    }
                }
            }
        });
    });
    require.define('/src/archives.co', function (module, exports, __dirname, __filename) {
        var archiveOf, that, enhancer;
        archiveOf = function (name) {
            var that;
            switch (that = name) {
            case 'a':
            case 'co':
            case 'jp':
            case 'm':
            case 'q':
            case 'sp':
            case 'tg':
            case 'tv':
            case 'v':
            case 'vg':
            case 'wsg':
                return 'http://archive.foolz.us/' + that + '/thread';
            case 'lit':
                return 'http://fuuka.warosu.org/' + that + '/thread';
            case 'diy':
            case 'g':
            case 'sci':
                return 'http://archive.installgentoo.net/' + that + '/thread';
            }
        };
        board.archive = archiveOf(board.name);
        if (/404/.test(document.title) && board.archive) {
            if (that = /\d+/.exec(window.location.pathname)) {
                window.location = board.archive + '/' + that[0];
            }
        }
        enhancer = require('/src/enhancer.co', module);
        if (board.archive) {
            enhancer.addReplacement(/<span class="deadlink">(&gt;&gt;(\d+))<\/span>/g, '<a href="' + board.archive + '/$2" class="deadlink">$1</a>');
        }
        enhancer.addReplacement(/<span class="deadlink">(&gt;&gt;&gt;\/([a-z]+)\/(\d+))<\/span>/g, function (original, text, name, no) {
            var that;
            if (that = archiveOf(name)) {
                return '<a href="' + that + '/' + no + '" class="deadlink">' + text + '</a>';
            } else {
                return original;
            }
        });
    });
    require.define('/src/favicon-data.co', function (module, exports, __dirname, __filename) {
        var x0$, x1$;
        module.exports = {
            sfw: (x0$ = document.createElement('img'), x0$.src = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABMLAAATCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8OXLv8AAAD/w5cu/wAAAP8AAAAAAAAAAAAAAP/Dly7/AAAA/8OXLv8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAP/Dly7/w5cu/8OXLv8AAAD/AAAAAAAAAAAAAAD/w5cu/8OXLv/Dly7/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAD/w5cu/8OXLv/Dly7/AAAA/wAAAAAAAAAAAAAA/8OXLv/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAP/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAP/Dly7/w5cu/8OXLv/Dly7/AAAA/wAAAAAAAAAAAAAA/8OXLv/Dly7/w5cu/8OXLv8AAAD/AAAAAAAAAAAAAAAAAAAA/8OXLv/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAP/Dly7/w5cu/8OXLv8AAAD/AAAAAAAAAAAAAAAAAAAA/8OXLv/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/8OXLv/Dly7/w5cu/wAAAP8AAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAOvXAADBgwAAwYMAAMGDAADhhwAA888AAP//AAD//wAAw8MAAIGBAADBgwAAg8EAAMfj/////////////w==', x0$),
            nsfw: (x1$ = document.createElement('img'), x1$.src = 'data:image/vnd.microsoft.icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAAAABILAAASCwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAD/AAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/zPMZv8AAAD/M8xm/wAAAP8AAAAAAAAAAAAAAP8zzGb/AAAA/zPMZv8AAAD/AAAAAAAAAAAAAAAAAAAAAAAAAP8zzGb/M8xm/zPMZv8AAAD/AAAAAAAAAAAAAAD/M8xm/zPMZv8zzGb/AAAA/wAAAAAAAAAAAAAAAAAAAAAAAAD/M8xm/zPMZv8zzGb/AAAA/wAAAAAAAAAAAAAA/zPMZv8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAP8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAP8AAAD/AAAA/wAAAAAAAAAAAAAAAAAAAP8zzGb/M8xm/zPMZv8zzGb/AAAA/wAAAAAAAAAAAAAA/zPMZv8zzGb/M8xm/zPMZv8AAAD/AAAAAAAAAAAAAAAAAAAA/zPMZv8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAP8zzGb/M8xm/zPMZv8AAAD/AAAAAAAAAAAAAAAAAAAA/zPMZv8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAA/zPMZv8zzGb/M8xm/wAAAP8AAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/AAAA/wAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAOvXAADBgwAAwYMAAMGDAADhhwAA888AAP//AAD//wAAw8MAAIGBAADBgwAAg8EAAMfjAAD//////////w==', x1$)
        };
    });
    global.c4 = require('/src/c4.co');
}.call(this, this));
}).call(this)