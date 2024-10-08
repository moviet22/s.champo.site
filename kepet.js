(function() {
    // Konfigurasi iklan
    var adConfig = {
        "ads_host": "a.pemsrv.com",
        "syndication_host": "s.pemsrv.com",
        "idzone": 5417312,
        "popup_fallback": false,
        "popup_force": false,
        "chrome_enabled": true,
        "new_tab": false,
        "frequency_period": 720,
        "frequency_count": 1,
        "trigger_method": 3, // 1 = auto pop
        "trigger_delay": 5, // Delay dalam detik
        "cookieconsent": true,
        "sub": "",
        "tags": "",
        "el": ""
    };

    var popMagic = {
        version: 1,
        cookie_name: "zone-cap-" + adConfig.idzone,
        url: "",
        config: adConfig,
        open_count: 0,
        top: null,
        browser: null,
        venor_loaded: false,
        venor: false,
        init: function(config) {
            if (typeof config.idzone === "undefined" || !config.idzone) {
                return;
            }
            this.config = Object.assign({}, this.config, config);
            this.loadHosted();
            this.preparePop();
        },
        getCountFromCookie: function() {
            if (!this.config.cookieconsent) {
                return 0;
            }
            var shownCookie = this.getCookie(this.cookie_name);
            var ctr = typeof shownCookie === "undefined" ? 0 : parseInt(shownCookie);
            if (isNaN(ctr)) {
                ctr = 0;
            }
            return ctr;
        },
        setAsOpened: function() {
            var new_ctr = this.getCountFromCookie() + 1;
            const last_opened_time = Math.floor(Date.now() / 1000);
            if (this.config.cookieconsent) {
                this.setCookie(this.cookie_name, `${new_ctr};${last_opened_time}`, this.config.frequency_period);
            }
        },
        shouldShow: function() {
            if (this.open_count >= this.config.frequency_count) {
                return false;
            }
            var ctr = this.getCountFromCookie();
            this.open_count = ctr;
            return !(ctr >= this.config.frequency_count);
        },
        buildUrl: function() {
            var protocol = document.location.protocol;
            var p = document.location.href;

            // Hapus parameter 'safelink' jika ada
            var url = new URL(p);
            url.searchParams.delete('safelink');
            p = url.toString();

            var encodeScriptInfo = function() {
                // Mengembalikan nilai custom untuk scr_info
                return "cmVtb3RlfHBvcHVuZGVyanN8MjkzNzEzOTQ%3D";
            };

            this.url = protocol + "//" + this.config.syndication_host + "/splash.php" +
                "?cat=" + (this.config.cat || "") +
                "&idzone=" + this.config.idzone +
                "&type=8" +
                "&p=" + encodeURIComponent(p) +
                "&sub=" + (this.config.sub || "") +
                "&tags=" + (this.config.tags || "") +
                "&el=" + (this.config.el || "") +
                "&cookieconsent=" + (this.config.cookieconsent ? "true" : "false") +
                "&scr_info=" + encodeScriptInfo();
        },
        loadHosted: function() {
            var hostedScript = document.createElement("script");
            hostedScript.type = "application/javascript";
            hostedScript.async = true;
            hostedScript.src = "//" + this.config.ads_host + "/popunder1000.js";
            hostedScript.id = "popmagicldr";
            for (var key in this.config) {
                if (this.config.hasOwnProperty(key) && key !== "ads_host" && key !== "syndication_host") {
                    hostedScript.setAttribute("data-exo-" + key, this.config[key]);
                }
            }
            document.body.insertBefore(hostedScript, document.body.firstChild);
        },
        preparePop: function() {
            if (this.shouldShow() && isSafeLink()) {
                this.buildUrl();
                setTimeout(function() {
                    window.open(popMagic.url, "_self"); // Buka di tab/jendela yang sama
                    popMagic.setAsOpened();
                }, this.config.trigger_delay * 1000);
            }
        },
        setCookie: function(name, value, ttl_minutes) {
            if (!this.config.cookieconsent) {
                return false;
            }
            ttl_minutes = parseInt(ttl_minutes, 10);
            var now_date = new Date();
            now_date.setMinutes(now_date.getMinutes() + ttl_minutes);
            var c_value = encodeURIComponent(value) + "; expires=" + now_date.toUTCString() + "; path=/";
            document.cookie = name + "=" + c_value;
        },
        getCookie: function(name) {
            if (!this.config.cookieconsent) {
                return false;
            }
            var i, x, y, cookiesArray = document.cookie.split(";");
            for (i = 0; i < cookiesArray.length; i++) {
                x = cookiesArray[i].substr(0, cookiesArray[i].indexOf("="));
                y = cookiesArray[i].substr(cookiesArray[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x === name) {
                    return decodeURIComponent(y);
                }
            }
        }
    };

    // Fungsi untuk memeriksa apakah ini safelink
    function isSafeLink() {
        // Periksa apakah parameter URL 'safelink' ada dan bernilai 'true'
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('safelink') === 'true';
    }

    popMagic.init(adConfig);
})();
