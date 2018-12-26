/*! echo-js v1.7.3 | (c) 2016 @toddmotto | https://github.com/toddmotto/echo */

var days = ["日", "一", "二", "三", "四", "五", "六"];

function showDT() {
    var currentDT = new Date();
    var y, m, date, day, hs, ms, ss, theDateStr;
    y = currentDT.getFullYear(); //四位整数表示的年份
    m = currentDT.getMonth(); //月
    m = m < 10 ? ('0' + m) : m;
    date = currentDT.getDate(); //日
    date = date < 10 ? ('0' + date) : date;
    day = currentDT.getDay(); //星期
    hs = currentDT.getHours(); //时
    hs = hs < 10 ? ('0' + hs) : hs;
    ms = currentDT.getMinutes(); //分
    ms = ms < 10 ? ('0' + ms) : ms;
    ss = currentDT.getSeconds(); //秒
    ss = ss < 10 ? ('0' + ss) : ss;
    theDateStr = y + "年" + m + "月" + date + "日 星期" + days[day] + " " + hs + ":" + ms + ":" + ss;
    document.getElementById("theClock").innerHTML = theDateStr;
    // setTimeout 在执行时,是在载入后延迟指定时间后,去执行一次表达式,仅执行一次
    window.setTimeout(showDT, 1000);
}

var cookie = {
    set: function (key, val, time) {//设置cookie方法
        var date = new Date(); //获取当前时间
        date.setTime(date.getTime() + time * 1000); //格式化为cookie识别的时间
        document.cookie = key + "=" + val + ";path=/;expires=" + date.toGMTString();  //设置cookie
    },
    get: function (key) {//获取cookie方法
        /*获取cookie参数*/
        var getCookie = document.cookie.replace(/[ ]/g, "");  //获取cookie，并且将获得的cookie格式化，去掉空格字符
        var arrCookie = getCookie.split(";");  //将获得的cookie以"分号"为标识 将cookie保存到arrCookie的数组中
        var tips;  //声明变量tips
        for (var i = 0; i < arrCookie.length; i++) {   //使用for循环查找cookie中的tips变量
            var arr = arrCookie[i].split("=");   //将单条cookie用"等号"为标识，将单条cookie保存为arr数组
            if (key === arr[0]) {  //匹配变量名称，其中arr[0]是指的cookie名称，如果该条变量为tips则执行判断语句中的赋值操作
                tips = arr[1];   //将cookie的值赋给变量tips
                break;   //终止for循环遍历
            }
        }
        return tips;
    },
    delete: function (key) { //删除cookie方法
        var date = new Date(); //获取当前时间
        date.setTime(date.getTime() - 10000); //将date设置为过去的时间
        document.cookie = key + "=v; expires =" + date.toGMTString();//设置cookie
    }
};

// 关闭广告
var closeAd = function (id) {
    $("#" + id).slideUp(500);
    cookie.set("cookie:" + id, id, 60 * 30);
};

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(root);
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.echo = factory(root);
    }
})(this, function (root) {

    'use strict';

    var echo = {};

    var callback = function () {
    };

    var offset, poll, delay, useDebounce, unload;

    var isHidden = function (element) {
        return (element.offsetParent === null);
    };

    var inView = function (element, view) {
        if (isHidden(element)) {
            return false;
        }

        var box = element.getBoundingClientRect();
        return (box.right >= view.l && box.bottom >= view.t && box.left <= view.r && box.top <= view.b);
    };

    var debounceOrThrottle = function () {
        if (!useDebounce && !!poll) {
            return;
        }
        clearTimeout(poll);
        poll = setTimeout(function () {
            echo.render();
            poll = null;
        }, delay);
    };

    if ($('.local-search').size()) {
        $.getScript('/js/search.js', function () {
            searchFunc("/search.xml", 'local-search-input', 'local-search-result', root.location.origin);
        });
    }

    // 广告
    var cookieVal = cookie.get("cookie:ad-nav-top");
    if (cookieVal !== 'ad-nav-top') {
        $("#ad-nav-top").show();
    }

    showDT();

    echo.init = function (opts) {
        opts = opts || {};
        var offsetAll = opts.offset || 0;
        var offsetVertical = opts.offsetVertical || offsetAll;
        var offsetHorizontal = opts.offsetHorizontal || offsetAll;
        var optionToInt = function (opt, fallback) {
            return parseInt(opt || fallback, 10);
        };
        offset = {
            t: optionToInt(opts.offsetTop, offsetVertical),
            b: optionToInt(opts.offsetBottom, offsetVertical),
            l: optionToInt(opts.offsetLeft, offsetHorizontal),
            r: optionToInt(opts.offsetRight, offsetHorizontal)
        };
        delay = optionToInt(opts.throttle, 250);
        useDebounce = opts.debounce !== false;
        unload = !!opts.unload;
        callback = opts.callback || callback;
        echo.render();
        if (document.addEventListener) {
            root.addEventListener('scroll', debounceOrThrottle, false);
            root.addEventListener('load', debounceOrThrottle, false);
        } else {
            root.attachEvent('onscroll', debounceOrThrottle);
            root.attachEvent('onload', debounceOrThrottle);
        }
    };

    echo.render = function () {
        var nodes = document.querySelectorAll('img[data-echo], [data-echo-background]');
        var length = nodes.length;
        var src, elem;
        var view = {
            l: 0 - offset.l,
            t: 0 - offset.t,
            b: (root.innerHeight || document.documentElement.clientHeight) + offset.b,
            r: (root.innerWidth || document.documentElement.clientWidth) + offset.r
        };
        for (var i = 0; i < length; i++) {
            elem = nodes[i];
            if (inView(elem, view)) {

                if (unload) {
                    elem.setAttribute('data-echo-placeholder', elem.src);
                }

                if (elem.getAttribute('data-echo-background') !== null) {
                    elem.style.backgroundImage = "url(" + elem.getAttribute('data-echo-background') + ")";
                } else {
                    elem.src = elem.getAttribute('data-echo');
                }

                if (!unload) {
                    elem.removeAttribute('data-echo');
                    elem.removeAttribute('data-echo-background');
                }

                callback(elem, 'load');
            } else if (unload && !!(src = elem.getAttribute('data-echo-placeholder'))) {

                if (elem.getAttribute('data-echo-background') !== null) {
                    elem.style.backgroundImage = "url(" + src + ")";
                } else {
                    elem.src = src;
                }

                elem.removeAttribute('data-echo-placeholder');
                callback(elem, 'unload');
            }
        }
        if (!length) {
            echo.detach();
        }
    };

    echo.detach = function () {
        if (document.removeEventListener) {
            root.removeEventListener('scroll', debounceOrThrottle);
        } else {
            root.detachEvent('onscroll', debounceOrThrottle);
        }
        clearTimeout(poll);
    };

    return echo;

});

function deepCopy(c, p) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

/**
 * 网站js
 * @author Jelon
 * @type {{init, toggleMenu}}
 */
var JELON = window.JELON || {};
toc = $("#post-toc");
JELON = deepCopy(JELON, {
    name: 'JELON',
    version: '0.0.2',
    showToc: function (scrollTop) {
        if (scrollTop / clientHeight >= 0.4) {
            toc.removeClass("post-toc-top");
            toc.addClass("post-toc-not-top");
        } else {
            toc.removeClass("post-toc-not-top");
            toc.addClass("post-toc-top");
        }
    },
    init: function () {
        this.toggleMenu();
        this.backToTop();

        toc.removeClass("post-toc-top");
        toc.addClass("post-toc-not-top");

        echo.init({
            offset: 50,
            throttle: 250,
            unload: false,
            callback: function (element, op) {
                //console.log(element, 'has been', op + 'ed')
            }
        });
    },
    $: function (str) {
        return /^(\[object HTML)[a-zA-Z]*(Element\])$/.test(Object.prototype.toString.call(str)) ? str : document.getElementById(str);
    },
    toggleMenu: function () {
        var _this = this,
            $menu = _this.$(_this.name + '__menu');
        _this.$(_this.name + '__btnDropNav').onclick = function () {
            if ($menu.className.indexOf('hidden') === -1) {
                $menu.className += ' hidden';
            } else {
                $menu.className = $menu.className.replace(/\s*hidden\s*/, '');
            }

        };
    },
    backToTop: function () {
        var _this = this;
        if (typeof _this.$(_this.name + '__backToTop') === 'undefined') return;
        window.onscroll = window.onresize = function () {
            if (document.documentElement.scrollTop + document.body.scrollTop > 0) {
                _this.$(_this.name + '__backToTop').style.display = 'block';
            } else {
                _this.$(_this.name + '__backToTop').style.display = 'none';
            }
        };
        _this.$(_this.name + '__backToTop').onclick = function () {
            var Timer = setInterval(GoTop, 10);

            function GoTop() {
                if (document.documentElement.scrollTop + document.body.scrollTop < 1) {
                    clearInterval(Timer)
                } else {
                    document.documentElement.scrollTop /= 1.1;
                    document.body.scrollTop /= 1.1
                }
            }
        };
    }

});

/**
 * 程序入口
 */
JELON.init();
