
TimesSkimmer.AdRequest = function(options){
    var json;
    this.makeRequest = function(){
        var adurl = location.protocol + "//" + location.hostname + ADX_URL_OVERIDE + "?label=" + options.label + "&url=" + options.url + "&positions=" + options.position;
        console.log(adurl);
        jQuery.getJSON(adurl, dataCallback);
    };
    function dataCallback(result){
        var creative = result.response[options.label].ads[options.position];
        var impression = result.response[options.label].ads["ADX_CLIENTSIDE"];
        options.callback(options.label, creative, impression);
    };
    };
	
	
	
TimesSkimmer.AdManager = (function(){
    var that = {};
    var results = {};
    var adDrawInterval;
    that.getSponsor = function(){
        var req = new TimesSkimmer.AdRequest({
            label: "spon",
            url: "nytimes.com/pages/broadsheet",
            position: "BroadsheetSpon",
            callback: sponsorCallback
        });
        req.makeRequest();
    };
    function sponsorCallback(label, adcreative, adimpression){
        results[label] = {
            creative: adcreative,
            impression: adimpression
        };
        jQuery("#BroadsheetSpon").html(adcreative);
    }
    that.getSectionTile = function(sectionName){
        var req = new TimesSkimmer.AdRequest({
            label: "tile-" + adName(sectionName),
            url: "nytimes.com/pages/broadsheet/" + adName(sectionName) + ".html",
            position: "BroadsheetTile",
            callback: tileCallback
        });
        req.makeRequest();
    };
    function adName(sectionName){
        return sectionName.replace(/[^a-zA-Z]*/g, "").toLowerCase();
    }
    function sectionName(adName){
    }
    function tileCallback(label, adcreative, adimpression){
        results[label] = {
            creative: adcreative,
            impression: adimpression
        };
        window.setTimeout("TimesSkimmer.AdManager.drawTileCreatives('" + label + "');", 1000);
    }
    that.drawTileCreatives = function(label){
        console.log("Checking for pages.");
        var page = TimesSkimmer.application.visiblePage();
        if (page.length > 0) {
            var wrapperNode = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource()).getNode();
            var adCreative = results[label].creative;
            var adSlots = wrapperNode.find(".TimesSkimmerTile").html(adCreative);
            jQuery("#impressionHolder").html(results[label].impression);
        }
        else {
            if (TimesSkimmer.application.sectionLoaded() && !TimesSkimmer.application.containsGrids()) 
                return;
            console.log("Not ready for ad yet.");
            setTimeout("TimesSkimmer.AdManager.drawTileCreatives('" + label + "');", 1000);
        }
    };
    that.getTileCreative = function(sectionName){
        return results["tile-" + adName(sectionName)].creative;
    };
    that.recordTileImpression = function(sectionName){
        jQuery("#impressionHolder").html(results["tile-" + adName(sectionName)].impression);
    };
    return that;
})();



if (typeof console == "undefined") {
    console = {
        log: function(){
        }
    };
}



TimesSkimmer = window.TimesSkimmer || {};
TimesSkimmer.Config = TimesSkimmer.Config || {};
TimesSkimmer.Config.sources = {
    "Top Stories": "http://www.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "Most Recent": "http://internal.du.nytimes.com/svc/news/v2/all/recent.rss",
    "Last 24 Hours": "http://internal.du.nytimes.com/svc/news/v2/all/last24hours.rss",
    "World": "http://www.nytimes.com/services/xml/rss/nyt/World.xml",
    "U.S.": "http://www.nytimes.com/services/xml/rss/nyt/US.xml",
    "Politics": "http://www.nytimes.com/services/xml/rss/nyt/Politics.xml",
    "N.Y. / Region": "http://www.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
    "The City": "http://www.nytimes.com/services/xml/rss/nyt/TheCity.xml",
    "Business": "http://www.nytimes.com/services/xml/rss/nyt/Business.xml",
    "Technology": "http://www.nytimes.com/services/xml/rss/nyt/Technology.xml",
    "Sports": "http://www.nytimes.com/services/xml/rss/nyt/Sports.xml",
    "Science": "http://www.nytimes.com/services/xml/rss/nyt/Science.xml",
    "Health": "http://www.nytimes.com/services/xml/rss/nyt/Health.xml",
    "Opinion": "http://www.nytimes.com/services/xml/rss/nyt/Opinion.xml",
    "Arts": "http://www.nytimes.com/services/xml/rss/nyt/Arts.xml",
    "Fashion & Style": "http://www.nytimes.com/services/xml/rss/nyt/FashionandStyle.xml",
    "Dining & Wine": "http://www.nytimes.com/services/xml/rss/nyt/DiningandWine.xml",
    "Travel": "http://www.nytimes.com/services/xml/rss/nyt/Travel.xml",
    "Magazine": "http://www.nytimes.com/services/xml/rss/nyt/Magazine.xml",
    "Week In Review": "http://www.nytimes.com/services/xml/rss/nyt/WeekinReview.xml",
    "Most E-mailed": "http://www.nytimes.com/services/xml/rss/nyt/MostEMailed.xml",
    "Arts Beat": "http://artsbeat.blogs.nytimes.com/feed/",
    "At War": "http://atwar.blogs.nytimes.com/feed/",
    "Bay Area": "http://bayarea.blogs.nytimes.com/feed",
    "Bits": "http://bits.blogs.nytimes.com/feed",
    "Bucks": "http://bucks.blogs.nytimes.com/feed/",
    "Carpetbagger": "http://carpetbagger.blogs.nytimes.com/feed/",
    "Caucus": "http://thecaucus.blogs.nytimes.com/feed/",
    "The Choice": "http://thechoice.blogs.nytimes.com/feed/",
    "City Room": "http://cityroom.blogs.nytimes.com/feed",
    "DealBook": "http://dealbook.blogs.nytimes.com/feed",
    "Diner's Journal": "http://dinersjournal.blogs.nytimes.com/feed/",
    "Dot Earth": "http://dotearth.blogs.nytimes.com/feed/",
    "Economix": "http://economix.blogs.nytimes.com/feed/",
    "Fifth Down": "http://fifthdown.blogs.nytimes.com/feed/",
    "GadgetWise": "http://gadgetwise.blogs.nytimes.com/feed/",
    "Goal": "http://goal.blogs.nytimes.com/feed/",
    "Green Inc.": "http://greeninc.blogs.nytimes.com/feed/",
    "The Lede": "http://thelede.blogs.nytimes.com/feed/",
    "Lens": "http://lens.blogs.nytimes.com/feed/",
    "Media Decoder": "http://mediadecoder.blogs.nytimes.com/feed/",
    "Motherlode": "http://parenting.blogs.nytimes.com/feed/",
    "Off the Dribble": "http://offthedribble.blogs.nytimes.com/feed/",
    "Opinionator": "http://opinionator.blogs.nytimes.com/feed/",
    "Pogue's Posts": "http://pogue.blogs.nytimes.com/feed/",
    "Prescriptions": "http://prescriptions.blogs.nytimes.com/feed/",
    "The Quad": "http://thequad.blogs.nytimes.com/feed/",
    "Rings": "http://vancouver2010.blogs.nytimes.com/feed/",
    "Room for Debate": "http://roomfordebate.blogs.nytimes.com/feed/",
    "Well": "http://well.blogs.nytimes.com/feed",
    "Wheels": "http://wheels.blogs.nytimes.com/feed/",
    "You're the Boss": "http://boss.blogs.nytimes.com/feed/",
    "Global Warming": "http://topics.nytimes.com/topics/news/science/topics/globalwarming/index.html?rss=1",
    "Health Care Reform": "http://topics.nytimes.com/top/news/health/diseasesconditionsandhealthtopics/health_insurance_and_managed_care/health_care_reform/index.html?rss=1",
    "China": "http://topics.nytimes.com/topics/news/international/countriesandterritories/china/index.html?rss=1",
    "Tiger Woods": "http://topics.nytimes.com/top/reference/timestopics/people/w/tiger_woods/index.html?rss=1",
    "Barack Obama": "http://topics.nytimes.com/topics/reference/timestopics/people/o/barack_obama/index.html?rss=1",
    "Afghanistan": "http://topics.nytimes.com/top/news/international/countriesandterritories/afghanistan/index.html?rss=1",
    "Same-Sex Marriage": "http://topics.nytimes.com/top/reference/timestopics/subjects/s/same_sex_marriage/index.html?rss=1",
    "Michaele Salahi": "http://topics.nytimes.com/top/reference/timestopics/people/s/michaele_salahi/index.html?rss=1",
    "Iran": "http://topics.nytimes.com/top/news/international/countriesandterritories/iran/index.html?rss=1",
    "Swine Flu": "http://topics.nytimes.com/topics/reference/timestopics/subjects/i/influenza/swine_influenza/index.html?rss=1"
};


TimesSkimmer.Config.categoryOrder = ["Sections", "Blogs", "Topics"];



TimesSkimmer.Config.sectionOrder = {
    "Sections": ["Top Stories", "World", "U.S.", "Politics", "N.Y. / Region", "Business", "Technology", "Sports", "Science", "Health", "Opinion", "Arts", "Fashion & Style", "Dining & Wine", "Travel", "Magazine", "Week In Review", "Most Recent", "Most E-mailed"],
    "Blogs": ["Arts Beat", "At War", "Bay Area", "Bits", "Bucks", "Carpetbagger", "Caucus", "The Choice", "City Room", "DealBook", "Diner's Journal", "Dot Earth", "Economix", "Fifth Down", "GadgetWise", "Goal", "Green Inc.", "The Lede", "Lens", "Media Decoder", "Motherlode", "Off the Dribble", "Opinionator", "Pogue's Posts", "Prescriptions", "The Quad", "Rings", "Room for Debate", "Well", "Wheels", "You're the Boss"],
    "Topics": ["Global Warming", "Health Care Reform", "China", "Tiger Woods", "Barack Obama", "Afghanistan", "Same-Sex Marriage", "Michaele Salahi", "Iran", "Swine Flu"]
};


if (typeof console == "undefined") {
    console = {
        log: function(){
        }
    };
}



TimesSkimmer = window.TimesSkimmer || {};

TimesSkimmer.Config = TimesSkimmer.Config || {};

TimesSkimmer.Config.currentSchemeName = "serendipity";

TimesSkimmer.Config.trackingActive = true;


TimesSkimmer.Config.numberOfAdPositions = 1;


TimesSkimmer.Config.clickActions = {
    "#fauxLogo": function(event){
        location.href = "http://nytimes.com";
    },
    "#fauxPrivacy": function(event){
        location.href = "http://www.nytimes.com/ref/membercenter/help/privacysummary.html";
    },
    ".dismissPanelButton": function(event){
        TimesSkimmer.application.closeRightPanel();
    },
    "#helpToggle": function(event){
        jQuery("#controls .active").removeClass("active");
        jQuery(this).addClass("active");
        TimesSkimmer.application.showHelp();
    },
    "#settingsToggle": function(event){
        jQuery("#controls .active").removeClass("active");
        jQuery(this).addClass("active");
        TimesSkimmer.application.showSettings();
    },
    "#articleCloser": function(event){
        jQuery("#controls img.active").removeClass("active");
        TimesSkimmer.application.closeArticle();
    },
    "#articlePopOut": function(event){
        window.open($("#articleFrame").attr("src"), "articlewindow");
    },
    "#articlePageView": function(event){
        location.href = $("#articleFrame").attr("src");
    },
    "#articleUrlCopy": function(event){
        TimesSkimmer.application.showCopyPalette($("#articleFrame").attr("src"), $("a[href=" + $("#articleFrame").attr("src") + "]").html());
    },
    "#closeCopy": function(event){
        TimesSkimmer.application.hideCopyPalette();
    },
    "#schemeList li input.button": function(event){
        $("#schemeList .selectedOption").removeClass("selectedOption");
        $(this).addClass("selectedOption");
        TimesSkimmer.application.setScheme(event.target.getAttribute("realvalue"));
        TimesSkimmer.application.resetSources();
        TimesSkimmer.application.setPagePositions(TimesSkimmer.application.currentSource());
        TimesSkimmer.application.updateScheme();
        var currentSourceName = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource()).getDisplayName();
        TimesSkimmer.AdManager.getSectionTile(currentSourceName);
        TimesSkimmer.application.tracking.recordSchemeChange();
    },
    "#nextPage": function(event){
        TimesSkimmer.application.nextPage();
    },
    "#previousPage": function(event){
        TimesSkimmer.application.previousPage();
    },
    ".delete-source": function(event){
        $(this).parents("li").fadeOut("slow", function(){
            $(this).remove();
            TimesSkimmer.application.flagChange();
        });
    },
    "#sources dt": function(event){
        if ($(this).hasClass("active")) {
            if ($(this).hasClass("widepanel")) {
                TimesSkimmer.application.setMetaContentMode();
                TimesSkimmer.application.contractSidebar();
            }
            else {
                TimesSkimmer.application.disableMetaContentMode();
            }
            $(this).parent("dl").find("dd").slideUp("slow").end().find("dt").removeClass("active");
        }
        else {
            if ($(this).hasClass("widepanel")) {
                TimesSkimmer.application.setMetaContentMode();
                TimesSkimmer.application.expandSidebar();
            }
            else {
                TimesSkimmer.application.disableMetaContentMode();
                TimesSkimmer.application.contractSidebar();
            }
            $(this).parent("dl").find("dd").slideUp("slow").end().find("dt").removeClass("active");
            $(this).addClass("active").next().slideDown("slow");
        }
    },
    "#sources .editToggle": function(event){
        TimesSkimmer.application.toggleEditMode();
        $("#sources").toggleClass("edit");
        $("#sourceStore").toggle();
        if ($("#sources").hasClass("edit")) {
            console.log("Hello, bobby.");
            TimesSkimmer.application.showAvailableFeeds()
        }
    },
    "#sources ol li": function(event){
        if (!TimesSkimmer.application.editModeActive()) {
            TimesSkimmer.application.setCurrentSource(this.getAttribute("ordinal"));
            TimesSkimmer.application.view();
        }
    },
    ".shrinkWrap .container a": function(event){
        if (!(event.metaKey || event.shiftKey || event.ctrlKey || event.button == 2) && !event.target.className.match(/video/i)) {
            event.preventDefault();
            TimesSkimmer.application.openArticle(event.target.href);
        }
    },
    ".shrinkWrap .container": function(event){
        if (!(event.metaKey || event.shiftKey || event.ctrlKey || event.button == 2)) {
            console.log(event.target);
            var target = jQuery(event.target);
            if (!target.hasClass("container")) {
                var target = target.parents(".container").eq(0);
            }
            var link = target.find("a").get(0).href;
            if (link) {
                TimesSkimmer.application.openArticle(link);
            }
        }
    },
    "#zoom a": function(event){
        if (!(event.metaKey || event.ctrlKey || event.button == 2)) {
            event.preventDefault();
            TimesSkimmer.application.openArticle(event.target.href);
        }
    },
    "#gettingstarted": function(){
        jQuery("#gettingstarted").hide();
        jQuery("#gettingStartedLabel").hide();
        TimesSkimmer.application.contractSidebar();
    },
    "#errorRefresh": function(event){
        TimesSkimmer.application.refresh();
    }
};
TimesSkimmer.Config.hoverActions = {};
TimesSkimmer.Config.mousemoveActions = {
    "#zoom": function(target){
        TimesSkimmer.application.hideZoomer();
    },
    ".shrinkWrap": function(target){
        TimesSkimmer.application.hideZoomer();
    }
};
TimesSkimmer.Config.mousemoveShiftActions = {
    ".shrinkWrap .story": function(target){
        TimesSkimmer.application.showZoomer(target);
    }
};
TimesSkimmer.Config.keyActions = {
    "13": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.selectStory();
        }
    }, {
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.selectSection();
        }
    }],
    "27": [{
        eventType: "up",
        handler: function(){
            TimesSkimmer.application.closeArticle();
        }
    }],
    "32": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.nextSource();
        }
    }, {
        eventType: "pressWithShift",
        handler: function(){
            TimesSkimmer.application.previousSource();
        }
    }],
    "37": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.moveArticleSelector("left");
        }
    }, {
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.previousPage();
        }
    }],
    "38": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.previousSource();
        }
    }, {
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.moveArticleSelector("up");
        }
    }, {
        eventType: "pressWithShift",
        handler: function(){
            TimesSkimmer.application.previousCategory();
        }
    }],
    "39": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.moveArticleSelector("right");
        }
    }, {
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.nextPage();
        }
    }],
    "40": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.nextSource();
        }
    }, {
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.moveArticleSelector("down");
        }
    }, {
        eventType: "pressWithShift",
        handler: function(){
            TimesSkimmer.application.nextCategory();
        }
    }],
    "65": [{
        eventType: "down",
        handler: function(){
            TimesSkimmer.application.listenForStory();
        }
    }, {
        eventType: "up",
        handler: function(){
            TimesSkimmer.application.cancelListenForStory();
        }
    }],
    "72": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.previousPage();
        }
    }],
    "74": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.nextSource();
        }
    }],
    "75": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.previousSource();
        }
    }],
    "76": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.nextPage();
        }
    }],
    "82": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.refresh();
        }
    }],
    "83": [{
        eventType: "down",
        handler: function(){
            TimesSkimmer.application.listenForSection();
        }
    }, {
        eventType: "up",
        handler: function(){
            TimesSkimmer.application.cancelListenForSection();
        }
    }],
    "84": [{
        eventType: "press",
        handler: function(){
            TimesSkimmer.application.setCurrentSource(0);
            TimesSkimmer.application.view();
        }
    }],
    "85": [{
        eventType: "down",
        handler: function(){
            TimesSkimmer.application.highlightRecentUpdates();
        }
    }, {
        eventType: "up",
        handler: function(){
            TimesSkimmer.application.hideRecentUpdates();
        }
    }],
    "allLetters": [],
    "allNumbers": [{
        eventType: "press",
        handler: function(keyCode){
            TimesSkimmer.application.grabKey(keyCode);
        }
    }]
};
TimesSkimmer.Config.converterUrl = "/svc/widgets/dataservice.html?uri=";
TimesSkimmer.Config.articleUrl = "/gst/articleSkimmer/filterarticle.html?uri=";
(function(){
    jQuery.fn.moveNode = function(rules, duration){
        return this.each(function(){
            if (jQuery.browser.safari) {
                return $(this).css(rules);
            }
            else {
                return $(this).animate(rules, duration);
            }
        });
    }
})();


(function(){})();

(function(){
    var cache = {};
    this.tmpl = function tmpl(str, data){
        var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" +
        str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") +
        "');}return p.join('');");
        return data ? fn(data) : fn;
    };
})();
(function(jQuery){
    jQuery.each(['backgroundColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'color', 'outlineColor'], function(i, attr){
        jQuery.fx.step[attr] = function(fx){
            if (fx.state == 0) {
                fx.start = getColor(fx.elem, attr);
                fx.end = getRGB(fx.end);
            }
            fx.elem.style[attr] = "rgb(" + [Math.max(Math.min(parseInt((fx.pos * (fx.end[0] - fx.start[0])) + fx.start[0]), 255), 0), Math.max(Math.min(parseInt((fx.pos * (fx.end[1] - fx.start[1])) + fx.start[1]), 255), 0), Math.max(Math.min(parseInt((fx.pos * (fx.end[2] - fx.start[2])) + fx.start[2]), 255), 0)].join(",") + ")";
        }
    });
    function getRGB(color){
        var result;
        if (color && color.constructor == Array && color.length == 3) 
            return color;
        if (result = /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(color)) 
            return [parseFloat(result[1]) * 2.55, parseFloat(result[2]) * 2.55, parseFloat(result[3]) * 2.55];
        if (result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(color)) 
            return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
        if (result = /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(color)) 
            return [parseInt(result[1] + result[1], 16), parseInt(result[2] + result[2], 16), parseInt(result[3] + result[3], 16)];
        return colors[jQuery.trim(color).toLowerCase()];
    }
    function getColor(elem, attr){
        var color;
        do {
            color = jQuery.curCSS(elem, attr);
            if (color != '' && color != 'transparent' || jQuery.nodeName(elem, "body")) 
                break;
            attr = "backgroundColor";
        }
        while (elem = elem.parentNode);
        return getRGB(color);
    };
    var colors = {
        aqua: [0, 255, 255],
        azure: [240, 255, 255],
        beige: [245, 245, 220],
        black: [0, 0, 0],
        blue: [0, 0, 255],
        brown: [165, 42, 42],
        cyan: [0, 255, 255],
        darkblue: [0, 0, 139],
        darkcyan: [0, 139, 139],
        darkgrey: [169, 169, 169],
        darkgreen: [0, 100, 0],
        darkkhaki: [189, 183, 107],
        darkmagenta: [139, 0, 139],
        darkolivegreen: [85, 107, 47],
        darkorange: [255, 140, 0],
        darkorchid: [153, 50, 204],
        darkred: [139, 0, 0],
        darksalmon: [233, 150, 122],
        darkviolet: [148, 0, 211],
        fuchsia: [255, 0, 255],
        gold: [255, 215, 0],
        green: [0, 128, 0],
        indigo: [75, 0, 130],
        khaki: [240, 230, 140],
        lightblue: [173, 216, 230],
        lightcyan: [224, 255, 255],
        lightgreen: [144, 238, 144],
        lightgrey: [211, 211, 211],
        lightpink: [255, 182, 193],
        lightyellow: [255, 255, 224],
        lime: [0, 255, 0],
        magenta: [255, 0, 255],
        maroon: [128, 0, 0],
        navy: [0, 0, 128],
        olive: [128, 128, 0],
        orange: [255, 165, 0],
        pink: [255, 192, 203],
        purple: [128, 0, 128],
        violet: [128, 0, 128],
        red: [255, 0, 0],
        silver: [192, 192, 192],
        white: [255, 255, 255],
        yellow: [255, 255, 0]
    };
})(jQuery);




TimesSkimmer.Tracking = function(){
    function trackingActive(){
        return TimesSkimmer.Config.trackingActive;
    }
    this.recordPageview = function(){
        if (trackingActive()) {
            dcsMultiTrack('DCS.dcssip', 'www.nytimes.com', 'DCS.dcsuri', '/skimmer/screen.html', 'WT.ti', 'Skimmer Screen', 'WT.cg_s', 'Skimmer', 'WT.z_dcsm', '0');
        }
    };
    this.recordSchemeChange = function(){
        if (trackingActive()) {
            dcsMultiTrack('DCS.dcssip', 'www.nytimes.com', 'DCS.dcsuri', '/skimmer/changeScheme.html', 'WT.ti', 'Skimmer Screen', 'WT.cg_s', 'Skimmer', 'WT.z_dcsm', '1');
        }
    };
    this.recordClickActionChange = function(){
        if (trackingActive()) {
            dcsMultiTrack('DCS.dcssip', 'www.nytimes.com', 'DCS.dcsuri', '/skimmer/changeClickAction.html', 'WT.ti', 'Skimmer Screen', 'WT.cg_s', 'Skimmer', 'WT.z_dcsm', '1');
        }
    };
};





TimesSkimmer.Key = {
    press: function(keyCode, fn){
        jQuery(document).keyup(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (evt.which == keyCode && !evt.shiftKey) {
                fn();
                evt.preventDefault();
            }
        });
    },
    down: function(keyCode, fn){
        jQuery(document).keydown(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (evt.which == keyCode) {
                fn();
                evt.preventDefault();
            }
        });
    },
    up: function(keyCode, fn){
        jQuery(document).keyup(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (evt.which == keyCode) {
                fn();
                evt.preventDefault();
            }
        });
    },
    range: function(startKey, endKey, fn){
        jQuery(document).keyup(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (evt.which >= startKey && evt.which <= endKey) {
                fn(evt.which);
                evt.preventDefault();
            }
        });
    },
    pressWithShift: function(keyCode, fn){
        jQuery(document).keyup(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (evt.shiftKey && evt.which == keyCode) {
                fn();
                evt.preventDefault();
            }
        });
    },
    disableDefaults: function(){
        jQuery(document).keypress(function(evt){
            if (evt.ctrlKey || evt.metaKey) 
                return;
            if (!evt.metaKey) {
                evt.preventDefault();
            }
        });
    },
    enableDefaults: function(){
        jQuery(document).unbind("keypress");
    },
    loadCommands: function(){
        for (var key in TimesSkimmer.Config.keyActions) {
            var actionBundle = TimesSkimmer.Config.keyActions[key];
            jQuery(actionBundle).each(function(){
                if (key == "allLetters") {
                }
                else 
                    if (key == "allNumbers") {
                        TimesSkimmer.Key.range(48, 57, this.handler);
                        TimesSkimmer.Key.range(96, 105, this.handler);
                    }
                    else {
                        TimesSkimmer.Key.activateKeyCommand(key, this.eventType, this.handler);
                    }
            });
        }
    },
    activateKeyCommand: function(keyNum, type, handler){
        switch (type) {
            case "pressWithShift":
                TimesSkimmer.Key.pressWithShift(keyNum, handler);
                break;
            case "down":
                TimesSkimmer.Key.down(keyNum, handler);
                break;
            case "up":
                TimesSkimmer.Key.up(keyNum, handler);
                break;
            case "press":
                TimesSkimmer.Key.press(keyNum, handler);
                break;
        }
    }
};


TimesSkimmer.Mouse = {
    move: function(node, fn){
        jQuery(node).live("mousemove", function(evt){
            if (!evt.shiftKey) {
                fn(evt.target);
            }
        });
    },
    moveWithShift: function(node, fn){
        jQuery(node).live("mousemove", function(evt){
            if (evt.shiftKey) {
                fn(evt.target);
            }
        });
    }
};



TimesSkimmer.ScreenLayout = function(){
    var navigationItems = [];
    var mouseIsDown = false;
    var currentSource;
    var nextSource;
    var previousSource;
    var currentTop;
    var previousTop;
    var nextTop;
    var yOrigin;
    var yCurrent;
    var numRows;
    var numColumns;
    var conf = TimesSkimmer.Config;
	
	
    this.setupNavigation = function(sourceOrder){
        navigationItems = [];
        jQuery("#sources .content").remove();
        for (var i = 0, len = TimesSkimmer.Config.categoryOrder.length; i < len; i++) {
            var categoryName = TimesSkimmer.Config.categoryOrder[i];
            var idBase = categoryName.replace(" ", "");
            jQuery("<dt id='" + idBase + "Header' class='content'>" + categoryName + "</dt><dd id='" + idBase + "Content' class='content'><ol></ol></dd>").insertBefore("#sources dl dt.widepanel:eq(0)");
        }
        var nav = jQuery("#sources");
        for (var i in sourceOrder) {
            var source = TimesSkimmer.application.getSource(i);
            var sourceName = jQuery("<li ordinal='" + i + "'></li>").html("<span class='editControl'><img class='delete-source' sourceid='" + i + "' src='/images/prototype/articleSkimmer/delete.png' /></span><span class='ordinal'>" + (parseInt(i, 10) + 1) + ". </span> <span url='" + source.url() + "' class='label'>" + sourceOrder[i] + "</span>");
            jQuery("#" + source.sourceType() + "Content ol").append(sourceName);
            navigationItems.push(sourceName);
        }
        nav.find("dd").hide().eq(0).show();
    };
	
	
    this.markNavigation = function(){
        var pagination = TimesSkimmer.application.pagination;
        var currentSource = TimesSkimmer.application.currentSource();
        for (var i = 0, len = navigationItems.length; i < len; i++) {
            var item = jQuery(navigationItems[i]);
            if (i == currentSource) {
                item.addClass("selected");
                if (currentSourceNavContainerIsHidden(item) && !TimesSkimmer.application.inMetaContentMode()) {
                    item.parents("dd").prev().trigger("click");
                }
            }
            else {
                item.removeClass("selected");
            }
        }
        var currentPage = pagination.getPage(currentSource);
        var numPages = pagination.numberOfPages(currentSource);
        if (currentPage == 0) {
            jQuery("#previousPage img").css("opacity", "0.5");
        }
        else {
            jQuery("#previousPage img").css("opacity", "1.0");
        }
        if (currentPage == numPages - 1) {
            jQuery("#nextPage img").css("opacity", "0.5");
        }
        else {
            jQuery("#nextPage img").css("opacity", "1.0");
        }
    }
	
	
    this.activate = function(){
        for (var selector in conf.clickActions) {
            jQuery(selector).live("click", conf.clickActions[selector]);
        }
        for (var selector in conf.hoverActions) {
            jQuery(selector).hover(conf.hoverActions[selector][0], conf.hoverActions[selector][1]);
        }
        for (var selector in conf.mousemoveActions) {
            TimesSkimmer.Mouse.move(selector, conf.mousemoveActions[selector]);
        }
        for (var selector in conf.mousemoveShiftActions) {
            TimesSkimmer.Mouse.moveWithShift(selector, conf.mousemoveShiftActions[selector]);
        }
        $(window).resize(function(e){
            TimesSkimmer.application.resizeGrid();
        });
        try {
            document.addEventListener("touchstart", startDrag, false);
            document.addEventListener("touchmove", doDrag, false);
            document.addEventListener("touchend", endDrag, false);
        } 
        catch (e) {
        }
    };
	
	
    this.initializeStorySelector = function(){
        TimesSkimmer.application.visibleSlides().filter(":visible").eq(0).addClass("selectionCursor");
    };
	
	
    this.clearStorySelector = function(){
        $(".selectionCursor").removeClass("selectionCursor");
    };
	
	
    this.moveSelectorLeft = function(){
        var current = $(".selectionCursor");
        if (current.prev(":visible").length > 0) {
            current.removeClass("selectionCursor").prev().addClass("selectionCursor");
        }
    };
	
	
    this.moveSelectorRight = function(){
        var current = $('.selectionCursor');
        if (current.next(":visible").length > 0) {
            current.removeClass("selectionCursor").next().addClass("selectionCursor");
        }
    };
	
	
    this.moveSelectorUp = function(){
        var targets = determinePosition();
        if (targets.up.length > 0) {
            jQuery(".selectionCursor").removeClass("selectionCursor");
            targets.up.addClass("selectionCursor");
        }
    };
	
	
    this.moveSelectorDown = function(){
        var targets = determinePosition();
        if (targets.down.length > 0) {
            jQuery(".selectionCursor").removeClass("selectionCursor");
            targets.down.addClass("selectionCursor");
        }
    };
	
	
    this.removeStoryCues = function(){
        TimesSkimmer.application.visibleSlides().find(".selectorCue").remove();
        TimesSkimmer.application.visibleSlides().attr({
            id: ""
        });
    };
	
	
    this.displaySectionCues = function(){
        jQuery("#sources li .ordinal").show();
    };
	
	
    this.removeSectionCues = function(){
        jQuery("#sources li .ordinal").hide();
    };
	
	
    this.resizeGrid = function(){
       
	    var pagination = TimesSkimmer.application.pagination;
       
	    pagination.update();
		
        var currentSectionName = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource()).getDisplayName();
	   
	    var sizeCSS = ".shrinkWrap {height:" + pagination.scrollerHeight() + "px}" +
        ".shrinkWrap .page {left:" + pagination.pageWidth() + "px; height:" + pagination.pageHeight() + "px; width:" + pagination.pageWidth() +
        "px}" + ".shrinkWrap .page.first {left:10px}" + ".grid .story {height:" + pagination.cellHeight() + "px; width:" + pagination.cellWidth() +
        "px;}" + ".grid .story.first {width:" + pagination.firstStoryWidth() + "px;}";
		
        TimesSkimmer.application.writeSizeStyles(sizeCSS);
		
        jQuery(".shrinkWrap").filter(function(index){
            return index > TimesSkimmer.application.currentSource()
        }).css({
            top: pagination.viewPortHeight() + "px"
        }).end().filter(function(index){
            return index < TimesSkimmer.application.currentSource()
        }).css({
            top: "-" + pagination.viewPortHeight() + "px"
        }).end();
        TimesSkimmer.application.updatePaginationInfo(TimesSkimmer.application.currentSource());
        adjustIframe();
        TimesSkimmer.AdManager.getSectionTile(currentSectionName);
        return;
        TimesSkimmer.application.setPagePositions(TimesSkimmer.application.currentSource());
    };
	
	
    function determinePosition(){
        var set = TimesSkimmer.application.visibleSlides();
        var pagination = TimesSkimmer.application.pagination;
        var current = $('.selectionCursor');
        var num = set.index(current);
        var total = set.length;
        var numColumns = pagination.numColumns();
        var remainder = (total + 1) % numColumns;
        if (num <= 0) {
            if (pagination.getPage(TimesSkimmer.application.currentSource()) == 0) {
                return {
                    up: null,
                    down: set.eq(numColumns - 1)
                };
            }
            else {
                return {
                    up: null,
                    down: set.eq(numColumns)
                };
            }
        }
        else 
            if (num == numColumns - 1 || num == numColumns) {
                return {
                    up: set.eq(0),
                    down: set.eq(num + numColumns)
                }
            }
            else {
                return {
                    up: set.eq(num - numColumns),
                    down: set.eq(num + numColumns)
                };
            }
    }
	
	
    this.adjustIframe = function(){
        adjustIframe();
    };
	
	
    function adjustIframe(){
        var container = document.getElementById("frameContainer");
        var frm = document.getElementById("articleFrame");
        if (Math.abs(container.offsetHeight - frm.offsetHeight) > 0) {
            frm.style.height = container.offsetHeight + "px";
        }
    }
	
    function currentSourceNavContainerIsHidden(item){
        return item.parents("dd").get(0).style.display == "none";
    }
	
    function startDrag(event){
        if (event.touches && event.touches[0].target.parentNode.tagName === "A") {
            TimesSkimmer.application.setClickAction("new");
            return
        };
        if (jQuery(event.target).parents("div.shrinkWrap").length < 1) {
            return
        }
        mouseIsDown = true;
        yOrigin = event.touches ? event.touches[0].pageY : event.pageY;
        currentSource = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource()).getNode();
        nextSource = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource() + 1).getNode();
        previousSource = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource() - 1).getNode();
        currentTop = parseInt(currentSource.css("top"), 10);
        previousTop = parseInt(previousSource.css("top"), 10);
        nextTop = parseInt(nextSource.css("top"), 10);
        if (event.touches) {
            event.preventDefault();
        }
    }
	
    function doDrag(event){
        if (mouseIsDown) {
            yCurrent = event.touches ? event.touches[0].pageY : event.pageY;
            var diff = yCurrent - yOrigin;
            currentSource.css("top", currentTop + diff);
            nextSource.css("top", nextTop + diff);
            previousSource.css("top", previousTop + diff);
            if (event.touches) {
                event.preventDefault();
            }
        }
    }
	
    function endDrag(event){
        if (mouseIsDown) {
            mouseIsDown = false;
            yCurrent = event.touches ? yCurrent : event.pageY;
            var diff = yCurrent - yOrigin;
            var margin = event.touches ? 15 : 5;
            if (diff > margin) {
                TimesSkimmer.application.previousSource();
            }
            else 
                if (diff < -margin) {
                    TimesSkimmer.application.nextSource();
                }
                else 
                    if (diff != 0) {
                        TimesSkimmer.application.view();
                    }
            yOrigin = null;
            if (event.touches && diff > margin && !event.target.tagName == "A") {
                event.preventDefault();
            }
        }
    }
};




TimesSkimmer.LayoutScheme = function(displayName, items){
    return tmpl(TimesSkimmer.Config.currentSchemeName + "Template", {
        items: items,
        sectionName: displayName.replace(/\W+/g, "")
    });
};



TimesSkimmer.PaginationData = function(){
    var numRows, numColumns, scrollerHeight, scrollerWidth, cellHeightFloor = 175, cellWidthFloor = 200, cellWidth, cellHeight, viewPortHeight, viewPortWidth, pageNumbers = {};
    this.pages = function(sourceNumber){
        return TimesSkimmer.application.getSource(sourceNumber).pages();
    };
    this.setPage = function(sourceNumber, pageNumber){
        pageNumbers[sourceNumber] = pageNumber;
    };
    this.getPage = function(sourceNumber){
        return parseInt(pageNumbers[sourceNumber], 10);
    };
    this.getTotalItems = function(sourceNumber){
        var source = TimesSkimmer.application.getSource(sourceNumber);
        return source.count();
    };
    this.numberOfPages = function(sourceNumber){
        var source = TimesSkimmer.application.getSource(sourceNumber);
        var total = TimesSkimmer.application.getSource(sourceNumber).count() + TimesSkimmer.Config.numberOfAdPositions;
        var perPage = numRows * numColumns;
        return Math.ceil(total / perPage);
    };
    this.itemsPerPage = function(){
        return numRows * numColumns;
    };
    this.scrollerHeight = function(){
        return scrollerHeight + 74;
    };
    this.scrollerWidth = function(){
        return scrollerWidth;
    };
    this.pageHeight = function(){
        return scrollerHeight;
    };
    this.pageWidth = function(){
        return scrollerWidth;
    };
    this.firstStoryWidth = function(){
        return cellWidth * 2;
    };
    this.viewPortHeight = function(){
        return viewPortHeight;
    };
    this.viewPortWidth = function(){
        return viewPortWidth;
    };
    this.cellHeight = function(){
        return cellHeight;
    };
    this.cellWidth = function(){
        return cellWidth;
    };
    this.numRows = function(){
        return numRows;
    };
    this.numColumns = function(){
        return numColumns;
    };
    this.update = function(){
        scrollerHeight = parseInt(document.getElementById("contentPane").offsetHeight, 10) - 84;
        scrollerWidth = parseInt(document.getElementById("contentPane").offsetWidth, 10) - 40;
        numRows = Math.floor(scrollerHeight / cellHeightFloor);
        numColumns = Math.floor(scrollerWidth / cellWidthFloor);
        cellHeight = Math.floor(scrollerHeight / numRows);
        cellWidth = Math.floor(scrollerWidth / numColumns);
        viewPortHeight = parseInt(document.getElementById("contentPane").offsetHeight, 10);
        viewPortWidth = parseInt(document.getElementById("contentPane").offsetWidth, 10);
    };
}


TimesSkimmer.MessageBar = function(){
    var mast = jQuery("#skimmerMast");
    var message = jQuery("#skimmerMessage");
    var messagePrompt = jQuery("#skimmerPrompt");
    this.setPrompt = function(text){
        messagePrompt.html(text);
    };
    this.setMessage = function(text){
        console.log("Set the message to:", text);
        message.html(text);
    };
    this.appendCharacter = function(char){
        message.append(char);
    };
    this.setNormal = function(){
        this.setPrompt(TimesSkimmer.application.currentSourceName());
        this.setMessage('');
        mast.removeClass("loading");
        mast.removeClass("listeningForStories");
        mast.removeClass("listeningForSections");
    };
    this.setLoading = function(){
        mast.addClass("loading");
    };
    this.setListeningForStory = function(){
        mast.addClass("listeningForStories");
        this.setPrompt("Select Story with Arrow Keys and Press Return to View");
    };
    this.setListeningForSection = function(){
        mast.addClass("listeningForSections");
        this.setPrompt("View Section # ");
    };
};


TimesSkimmer.StoryZoom = function(){
    this.show = function(node){
        var data = node.itemData;
        node = jQuery(node);
        var detailViewer = jQuery("#zoom");
        while (node.get(0).nodeName !== "LI") {
            node = node.parent();
        }
        var width = node.width() + 40;
        var height = node.height() + 40;
        var offset = node.offset();
        var top = offset.top - 20 - document.documentElement.scrollTop;
        var left = offset.left - 20;
        detailViewer.css({
            "width": width + "px",
            "top": top + "px",
            "left": left + "px",
            "min-height": height + "px"
        }).html(node.html());
        detailViewer.show();
        offset = detailViewer.offset();
        height = detailViewer.height();
        width = detailViewer.width();
        var viewportOverflow = (offset.top - document.documentElement.scrollTop + height + 5) - window.innerHeight;
        var horizontalOverflow = (offset.left - document.documentElement.scrollLeft + width + 5) - window.innerWidth;
        if (viewportOverflow > 0) {
            detailViewer.css("top", top - viewportOverflow - 10);
        }
        if (horizontalOverflow > 0) {
            detailViewer.css("left", left - horizontalOverflow);
        }
        TimesSkimmer.Mouse.move(detailViewer, function(){
            hideDetailView();
        });
    };
    this.hide = function(){
        jQuery("#zoom").hide();
    };
};



TimesSkimmer.DataSource = function(sourceNumber, displayName, uri, sourceType) {
   
    var boxes = {}, collection = [], collectionRoots = [], dataArray = [], tmpItems = [], sourceLookup = {},
	 currentUrl = "", currentItem = 0, built = false, postRenderCallback = false, currentSourcePage = 0,
	  wrapper, pages, stories, dateUpdated, adMultiplier = Math.random(), paginationActionsToComplete = 0, self = this;
    
	this.url = function(){ return uri;  };
	
    this.prepare = function(){  wrapper = jQuery("<div class='shrinkWrap'></div>").appendTo("#scrollPlain"); };
	
    this.list = function(){ return list(); };
	
    this.wrapper = function(){ return wrapper(); };
	
    this.currentPage = function(){ return currentSourcePage; };
	
    this.setCurrentPage = function(num){
        currentSourcePage = num;
    };
	
    this.isBuilt = function(){
        return built;
    };
	
   this.requestData = function(){
        if (!built) {
            clearlist();
            TimesSkimmer.application.cache.read(uri, function(data, status){
                dataArray = data;
                drawSectionHTML(data);
            });
        }
        else {
            TimesSkimmer.application.renderSourceChange();
        }
    };
	
	
    this.getMetaData = function(){
        return {
            "label": displayName,
            "uri": uri,
            "type": sourceType
        };
    };
	
	
    this.getNode = function(){
        return wrapper;
    };
	
	
    this.built = function(){
        return built;
    };
	
	
    this.expire = function(){
        built = false;
    };
	
	
    this.empty = function(){
        if (list()) {
            window.setTimeout(clearlist(), 1500);
        }
    };
	
	
    this.emptyFast = function(){
        clearlist();
    };
	
	
    this.setLayerLevel = function(num){
        wrapper.css("zIndex", 200 + num);
    };
	
	
    this.refresh = function(){
        built = false;
        this.requestData();
    };
	
	
    this.show = function(){
        wrapper.show();
    };
	
	
    this.hide = function(){
        wrapper.hide();
    };
	
	
    this.count = function(){
        return dataArray.length;
    };
	
	
    this.visible = function(){
        return wrapper.css("display") == "block";
    };
	
	
    this.slides = function(){
        return list().find("li");
    };
	
	
    this.pages = function(){
        return wrapper.find(".page");
    };
	
	
    this.sourceType = function(){
        return sourceType;
    };
	
	
    this.dateUpdated = function(){
        return dateUpdated;
    };
	
	
    this.selfDestruct = function(){
        wrapper.empty().remove();
    };
	
	
    this.needTileAd = function(){
        return true;
    };
	
	
    this.needRowAd = function(){
        return false;
    };
	
	
    this.needInterstitial = function(){
        return false;
    };
	
	
    this.lockAnimation = function(numberOfAnimatedSections){
        paginationActionsToComplete = numberOfAnimatedSections;
    };
	
	
    this.animationIsLocked = function(){
        return paginationActionsToComplete > 0;
    };
	
	
	
    this.completeAnimationSequence = function(){
        paginationActionsToComplete -= 1;
    };
	
	
	
    function adContainerNode(){
        var adNode = document.createElement("LI");
        adNode.className = "ad story";
        adNode.innerHTML = "<div style='background:black; height:100%' class='tilead'><table style='background:black' width='100%' height='100%'><tr><td class='TimesSkimmerTile' align='center' valign='center'></td></tr></table></div>";
        return adNode;
    }
	
	
	
    this.applyPagination = function(){
        var pagination = TimesSkimmer.application.pagination;
        var itemsPerPage = pagination.itemsPerPage(sourceNumber);
        var numberOfPages = pagination.numberOfPages(sourceNumber);
        var totalItems = pagination.getTotalItems(sourceNumber) + (TimesSkimmer.Config.numberOfAdPositions * numberOfPages);
        var numRows = pagination.numRows();
        var numColumns = pagination.numColumns();
        var adLimit = (itemsPerPage > totalItems) ? totalItems : itemsPerPage;
        var adPosition = Math.floor(adMultiplier * (adLimit - 2)) + 1;
        var positions = {};
        var appliedPositions = 0;
        for (var i = 0; i < numberOfPages; i++) {
            var pos = adPosition + (i * itemsPerPage);
            if (i > 0) {
                pos -= i;
            }
            positions[pos] = true;
        }
        if (pages) {
            pages.empty();
        }
        var start = 0;
        if (stories.length % itemsPerPage == 0) 
            numberOfPages += 1;
        var end = 0 + itemsPerPage - 1;
        var blockPool = [];
        stories.each(function(j){
            if (positions[j]) {
                blockPool.push(adContainerNode());
                appliedPositions++;
            }
            blockPool.push(this);
        });
        if (appliedPositions < numberOfPages) {
            blockPool.push(adContainerNode());
        }
        blockPool = jQuery(blockPool);
        for (var i = 0, len = numberOfPages; i < len; i++) {
            var page = jQuery("<ul class='" + list().get(0).className + " page' id='page-" + sourceNumber + "-" + i + "'></ul>").appendTo(pages);
            page.css({
                "zIndex": "200" + (numberOfPages - i)
            });
            var scrollerWidth = parseInt(document.getElementById("contentPane").offsetWidth, 10);
            var notInLastRow = ((numRows - 1) * numColumns);
            if (i == 0) {
                page.addClass("first");
                page.css("left", 0);
                notInLastRow -= 1;
            }
            else {
                page.css("left", scrollerWidth);
            }
            blockPool.each(function(j){
                if (j == 0) {
                    jQuery(this).addClass("first");
                }
                if ((j + 2) % numColumns == 0) {
                    jQuery(this).addClass("lastInRow");
                }
                else {
                    jQuery(this).removeClass("lastInRow");
                }
            });
            blockPool.slice(start, end).appendTo(page).removeClass("inLastRow");
            blockPool.slice((start + notInLastRow), end).addClass("inLastRow");
            start = end;
            end += itemsPerPage;
        }
    };
	
	
    function fetch(){
        TimesSkimmer.application.showLoadingIndicator();
        TimesSkimmer.application.checkAllSources();
        dataArray = [];
        var converterUrl = window.CONVERTER_URL_OVERIDE || TimesSkimmer.Config.converterUrl;
        converterUrl = location.protocol + "//" + location.hostname + converterUrl;
        jQuery.ajax({
            type: "GET",
            url: converterUrl + uri,
            dataType: "json",
            success: function(data){
                if (data.channel) {
                    var items = data.channel.items;
                    for (var i = 0, len = items.length; i < len; i++) {
                        dataArray.push(extractItem(i, items[i]));
                    }
                    drawSectionHTML(dataArray);
                }
                else {
                    showError("Error reading feed data.");
                }
            },
            error: function(transport, textStatus, errorThrown){
                if (window.localStorage) {
                    TimesSkimmer.application.cache.read(uri, function(data, status){
                        if (data) {
                            drawSectionHTML(data);
                        }
                        else {
                            showError("No data available or internet connection down.");
                        }
                    });
                }
                else {
                    showError(textStatus);
                }
            }
        });
    }
	
	
    this.getDisplayName = function(){
        return displayName;
    };
	
	
    this.getAdName = function(){
        return displayName.replace(/[^a-zA-Z]*/g, "").toLowerCase();
    };
	
	
    function drawSectionHTML(data){
        wrapper.html(TimesSkimmer.LayoutScheme(displayName, data));
        pages = jQuery("<div class='pages'></div>").appendTo(wrapper);
        stories = wrapper.find("li").addClass("story");
        built = true;
        TimesSkimmer.application.updatePaginationInfo(sourceNumber);
        TimesSkimmer.application.setPagePositions(sourceNumber);
        activatelist();
        TimesSkimmer.application.renderSourceChange();
    }
	
	
    function showError(status){
        var reason = (status == "parsererror") ? "Something was wrong with the content of the feed." : status;
        wrapper.html("<div class='errorMessage'><div class='errorContent'><h1>Oops</h1><p>We're sorry, but there was a problem updating \"" + displayName + "\" :</p> <p><em>" + reason + "</em></p> <p>Please try again later.</p><div class='errorButtons'><input type='button' value='Try Again' id='errorRefresh' /></div></div></div>");
    }
	
	
    function list(){
        return wrapper.find("ul");
    }
	
	
    function clearlist(){
        list().empty();
    }
	
	
    function activatelist(){
        list().each(function(i){
            var li = jQuery(this);
            var index = list().find(".story").index(li);
            var itemData = dataArray[list().find(".story").index(li)];
            li.itemData = itemData;
        });
    }
	
	
    function markArticleAge(li, data){
        var secs = Date.parse(data.datePublished);
        var today = new Date();
        var todaySecs = today.getTime();
        var diff = todaySecs - secs;
        var daysAgo = diff / 1000 / 60 / 60 / 24;
        var subtractor = 0.02 * daysAgo;
        if (subtractor > 0.5) {
            subtractor = 0.5;
        }
        if ((diff / 1000 / 60) < 60) {
            li.addClass("recent");
        }
        else {
            li.css("opacity", 1 - subtractor);
        }
    }
	
	
};








TimesSkimmer.Controller = function(){
    var sources = {}, sourceOrder = [], listeningForStoryCue = false, listeningForSectionCue = false, articleVisible = false, editMode = false, setupChanged = false, metaContentMode = false, singleScreenMode = true, currentDisplayedSource = 0, numSourcePages = 4, settings, messageBar, zoomer, priorSource, targetSource, currentSelectedSource, numRows, numColumns, storedSettings, firstRun = false;
    this.cache = new RequestCache("nytbroadsheet", "/timesskimmer/dataWorker.js", {
        prefix: location.protocol + "//" + location.hostname + (CONVERTER_URL_OVERIDE || TimesSkimmer.Config.converterUrl),
        expirationMinutes: 10
    });
    this.checkAllSources = function(){
        checkAllSources();
    };
    function checkAllSources(){
        if (window.localStorage && window.Worker) {
            for (sourceName in TimesSkimmer.Config.sources) {
                var uri = TimesSkimmer.Config.sources[sourceName];
                var prefix = CONVERTER_URL_OVERIDE || TimesSkimmer.Config.converterUrl;
                TimesSkimmer.application.cache.read(uri, function(data, status){
                });
            }
        }
    }
    this.start = function(){
        setInterval(function(){
            TimesSkimmer.application.checkAllSources();
        }, (10 * 60 * 1000));
        jQuery(location.search.replace("?", "").split("&")).each(function(){
            var nameValuePair = this.split("=");
            var name = nameValuePair[0];
            var value = nameValuePair[1];
            if (name == "scheme") {
                TimesSkimmer.application.setScheme(value);
            }
        });
        TimesSkimmer.application.loadSettings();
        messageBar = new TimesSkimmer.MessageBar();
        this.layout = new TimesSkimmer.ScreenLayout();
        zoomer = new TimesSkimmer.StoryZoom();
        this.tracking = new TimesSkimmer.Tracking();
        this.pagination = new TimesSkimmer.PaginationData();
        var prefix = CONVERTER_URL_OVERIDE || TimesSkimmer.Config.converterUrl;
        this.cache.setPrefix(prefix);
        this.cache.setFallback(TimesSkimmer.application.dataRequestFallback);
        this.applyScheme();
        loadSources();
        this.layout.setupNavigation(sourceOrder);
        this.layout.activate();
        window.setTimeout(resizeGrid, 800);
        window.setTimeout(TimesSkimmer.application.view, 1000);
        TimesSkimmer.Key.disableDefaults();
        this.activateSettings();
        TimesSkimmer.Key.loadCommands();
        checkAllSources();
        loadSponsorAd();
    };
    function loadSponsorAd(){
        TimesSkimmer.AdManager.getSponsor();
    }
    this.dataRequestFallback = function(uri){
        var converterUrl = window.CONVERTER_URL_OVERIDE || TimesSkimmer.Config.converterUrl;
        converturUrl = location.protocol + "//" + location.hostname + converterUrl;
        jQuery.ajax({
            type: "GET",
            url: converterUrl + uri,
            dataType: "json",
            success: function(data){
                var dataArray = [];
                if (data.channel) {
                    var items = data.channel.items;
                    for (var i = 0, len = items.length; i < len; i++) {
                        dataArray.push(extractItem(i, items[i]));
                    }
                    TimesSkimmer.application.cache.returnFromFallback(uri, dataArray);
                }
                else {
                    alert("Error reading feed");
                }
            },
            error: function(transport, textStatus, errorThrown){
            }
        });
    };
    function extractItem(itemNumber, jsonNode){
        var queryString = jsonNode.link.split("?")[1];
        var params = queryStringToHash(queryString) || {};
        params["src"] = "sch";
        dataItem = {
            link: jsonNode.link.split("?")[0] + "?src=sch&pagewanted=all",
            title: jsonNode.title,
            datePublished: jsonNode.pubDate,
            byline: jsonNode["dc:creator"],
            summary: jsonNode.description.replace(/\<span class=\"advertisement\"\>.*\<\/span\>/, "")
        };
        try {
            dataItem.thumbnailUrl = jsonNode["media:content"]["url"];
        } 
        catch (e) {
            dataItem.thumbnailUrl = null;
        }
        var baseUrlParts = dataItem.link.split("?");
        var baseUrl = baseUrlParts[0];
        return dataItem;
    }
    function queryStringToHash(queryString){
        if (!queryString) 
            return;
        var hash = {};
        var sets = queryString.split("&");
        for (var i = 0, len = sets.length; i < len; i++) {
            var pair = sets[i].split("=");
            hash[pair[0]] = pair[1];
        }
        return hash;
    }
    function hashToQueryString(hash){
        var paramString = "";
        var sets = [];
        for (var name in hash) {
            sets.push(name + "=" + hash[name]);
        }
        return sets.join("&");
    }
    this.restart = function(){
        jQuery("#scrollPlain").empty();
        jQuery("#sources dl").empty();
        sourceOrder = [];
        currentDisplayedSource = 0;
        loadSources();
        setCurrentSource(0);
        this.layout.setupNavigation(sourceOrder);
        this.layout.activate();
        window.setTimeout(resizeGrid, 800);
        window.setTimeout(TimesSkimmer.application.view, 1000);
    };
    this.currentSource = function(){
        return currentSource();
    };
    this.setCurrentSource = function(num){
        setCurrentSource(num);
    };
    this.setDimensions = function(y, x){
        numRows = y;
        numColumns = x;
    };
    this.currentSourceName = function(){
        return sourceOrder[currentSource()];
    };
    this.numVisibleRows = function(){
        return numRows;
    };
    this.numVisibleColumns = function(){
        return numColumns;
    };
    this.applyScheme = function() {
        jQuery(".shrinkWrap").empty();
        var name = TimesSkimmer.Config.currentSchemeName;
        var newStyles = tmpl(name + "Style", {});
        var stylesheet = document.getElementById("schemeStyles");
        if (stylesheet.styleSheet) {
            stylesheet.styleSheet.cssText = newStyles;
        }
        else {
            jQuery(stylesheet).html(newStyles);
        }
    };
	
	
	
    (function(){
        var cache = {};
        this.tmpl = function tmpl(str, data){
		   
		    var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
           
		    return data ? fn(data) : fn;
        };
    })();
	
	
	
	
	
    this.setScheme = function(name){
        TimesSkimmer.Config.currentSchemeName = name;
        storedSettings.scheme = name;
        this.applyScheme();
        this.writeSettings();
    };
    this.loadSettings = function(){
        var cookieData = jQuery.cookie("skimmer");
        if (cookieData) {
            storedSettings = JSON.parse(cookieData);
        }
        else {
            storedSettings = null;
        }
        if (!storedSettings) {
            storedSettings = {};
            firstRun = true;
        }
        if (!storedSettings.source) {
            storedSettings.source = 0;
            this.writeSettings();
        }
        if (!storedSettings.scheme) {
            storedSettings.scheme = "serendipity";
            this.writeSettings();
        }
        TimesSkimmer.application.setScheme(storedSettings.scheme);
        currentSelectedSource = storedSettings.source;
        TimesSkimmer.application.setCurrentSource(parseInt(storedSettings.source, 10));
    };
    this.writeSettings = function(){
        var cookieString = JSON.stringify(storedSettings);
        jQuery.cookie("skimmer", cookieString);
    };
    this.debugSettings = function(){
        settings.debug();
    };
    this.view = function(){
        if (listeningForStoryCue) {
            return;
        }
        TimesSkimmer.application.closeArticle();
        var sourceToShow = TimesSkimmer.application.getSource(TimesSkimmer.application.currentSource());
        sourceToShow.requestData();
        TimesSkimmer.AdManager.getSectionTile(sourceToShow.getDisplayName());
        if (arguments[0] !== "notrack") {
            TimesSkimmer.application.tracking.recordPageview();
        }
        setTimeout(sourceToShow.expire, 5 * 60 * 1000);
        setTimeout(requestSurrounders, 2000);
        updateNavigation();
        updateStatus();
        TimesSkimmer.application.pagination.setPage(TimesSkimmer.application.currentSource(), 0);
        updatePaginationInfo(TimesSkimmer.application.currentSource());
    };
    this.updateScheme = function(){
        var source = TimesSkimmer.application.currentSource();
        var sourceToShow = TimesSkimmer.application.getSource(source);
        sourceToShow.requestData();
    };
    this.showLoadingIndicator = function(){
        jQuery("#loadingIndicator").fadeIn("fast");
    };
    this.hideLoadingIndicator = function(){
        jQuery("#loadingIndicator").fadeOut("fast");
    };
    this.renderSourceChange = function(){
        this.hideLoadingIndicator();
        flipToCurrent();
    };
    this.refresh = function(){
        source(currentSource()).refresh();
        TimesSkimmer.AdManager.getSectionTile(source(currentSource()).getDisplayName());
        requestSurrounders();
    };
    this.sectionLoaded = function(){
        var section = source(currentSource());
        return section.isBuilt();
    };
    this.getSource = function(num){
        if (num < 0) {
            num = 0;
        }
        if (num >= sourceOrder.length) {
            num = sourceOrder.length - 1;
        }
        return source(num);
    }
    this.nextSource = function(){
        if (!articleVisible) {
            setCurrentSource(currentSource() + 1);
            this.view();
        }
    };
    this.previousSource = function(){
        if (!articleVisible) {
            setCurrentSource(currentSource() - 1);
            this.view();
        }
    };
    this.nextCategory = function(){
        var currentVisible = null;
        jQuery("#sources dd").each(function(){
            if (this.offsetHeight > 0) {
                currentVisible = this;
            }
        });
        jQuery(currentVisible).next().next().find("li").eq(0).trigger('click');
    };
    this.previousCategory = function(){
        jQuery("#sources dd").each(function(){
            if (this.offsetHeight > 0) {
                jQuery(this).prev().prev().find("li").eq(0).trigger("click");
                return false;
            }
        });
    };
    this.containsGrids = function(){
        return jQuery(".grid").length > 0;
    };
    this.updatePaginationInfo = function(sourceNumber){
        updatePaginationInfo(sourceNumber);
    };
    this.animatePagePositions = function(sourceNumber){
        if (TimesSkimmer.application.containsGrids()) {
            var pagination = TimesSkimmer.application.pagination;
            var currentPage = pagination.getPage(sourceNumber);
            var leftPosition = {
                left: "-" + pagination.viewPortWidth() + "px"
            };
            var rightPosition = {
                left: pagination.viewPortWidth() + "px"
            };
            var currentPosition = {
                left: "0"
            };
            pagination.pages(sourceNumber).filter(function(index){
                return index > currentPage + 1
            }).css(rightPosition).end().filter(function(index){
                return index < currentPage - 1
            }).css(leftPosition).end().filter(function(index){
                return index == currentPage - 1
            }).animate(leftPosition, 1000).end().filter(function(index){
                return index == currentPage
            }).animate(currentPosition, 1000).end().filter(function(index){
                return index == currentPage + 1
            }).animate(rightPosition, 1000).end();
            TimesSkimmer.AdManager.recordTileImpression(TimesSkimmer.application.getSource(sourceNumber).getDisplayName());
        }
    };
    this.setPagePositions = function(sourceNumber){
        if (TimesSkimmer.application.containsGrids()) {
            var pagination = TimesSkimmer.application.pagination;
            var currentPage = pagination.getPage(sourceNumber);
            var leftPosition = {
                left: "-" + pagination.viewPortWidth() + "px"
            };
            var rightPosition = {
                left: pagination.viewPortWidth() + "px"
            };
            var currentPosition = {
                left: "0"
            };
            pagination.pages(sourceNumber).filter(function(index){
                return index > currentPage
            }).css(rightPosition).end().filter(function(index){
                return index < currentPage
            }).css(leftPosition).end().filter(function(index){
                return index == currentPage
            }).css(currentPosition).end();
        }
    };
    this.nextPage = function(){
        if (listeningForStoryCue) {
            return;
        }
        var pagination = TimesSkimmer.application.pagination;
        var next = pagination.getPage(currentSource()) + 1;
        if (next < pagination.numberOfPages(currentSource())) {
            pagination.setPage(currentSource(), next);
            updateNavigation();
            this.animatePagePositions(currentSource());
        }
    };
    this.previousPage = function(){
        if (listeningForStoryCue) {
            return;
        }
        var pagination = TimesSkimmer.application.pagination;
        var prev = pagination.getPage(currentSource()) - 1;
        if (prev >= 0) {
            pagination.setPage(currentSource(), prev);
            updateNavigation();
            this.animatePagePositions(currentSource());
        }
    };
    this.numPages = function(){
        return numSourcePages;
    };
    this.showAvailableFeeds = function(){
        $.ajax({
            method: "get",
            url: "availableFeeds.php",
            async: true,
            dataType: "json",
            success: function(data){
                for (var label in data) {
                    var feedUrl = data[label];
                    jQuery("<li></li>").appendTo("#sectionResultList ul").html("<div class='feedName'>" + label + "</div><div class='feedUrl'>" + feedUrl + "</div><div class='addButton'><img src='../images/prototype/articleSkimmer/addFeed.png' /></div>");
                }
            }
        });
    };
    this.toggleEditMode = function(){
        editMode = !editMode;
        if (!editMode && setupChanged) {
            var newConfig = this.deriveFeedStructure();
            TimesSkimmer.Config.categoryOrder = newConfig.categoryOrder;
            TimesSkimmer.Config.sectionOrder = newConfig.sectionOrder;
            TimesSkimmer.Config.sources = newConfig.sources;
            this.restart();
        }
        else {
        }
    };
    this.editModeActive = function(){
        return editMode;
    };
    this.resetNavigation = function(){
        loadSources();
        this.layout.setupNavigation(sourceOrder);
        this.layout.activateNavigation();
    };
    this.listenForStory = function(){
        listeningForStoryCue = true;
        messageBar.setListeningForStory();
        this.layout.initializeStorySelector();
    };
    this.listenForSection = function(){
        listeningForSectionCue = true;
        messageBar.setListeningForSection();
        messageBar.setMessage("");
        this.layout.displaySectionCues();
    };
    this.grabKey = function(keyEntered){
        if (listeningForSectionCue) {
            messageBar.appendCharacter(String.fromCharCode(keyEntered));
        }
    };
    this.moveArticleSelector = function(direction){
        if (listeningForStoryCue) {
            if (direction == "left") 
                this.layout.moveSelectorLeft();
            else 
                if (direction == "right") 
                    this.layout.moveSelectorRight();
                else 
                    if (direction == "up") 
                        this.layout.moveSelectorUp();
                    else 
                        if (direction == "down") 
                            this.layout.moveSelectorDown();
        }
    };
    this.selectStory = function(){
        if (listeningForStoryCue) {
            var slide = $(".selectionCursor");
            var loc = slide.addClass("current").find("a").get(0).href;
            this.cancelListenForStory();
            TimesSkimmer.application.openArticle(loc);
        }
    };
    this.selectSection = function(){
        if (listeningForSectionCue) {
            var enteredNumber = parseInt(jQuery("#skimmerMessage").get(0).innerHTML, 10);
            if (enteredNumber > 0) {
                setCurrentSource(enteredNumber - 1);
                this.view();
            }
            this.cancelListenForSection();
        }
    };
    this.cancelListenForStory = function(){
        if (listeningForStoryCue) {
            listeningForStoryCue = false;
            messageBar.setNormal();
            this.layout.removeStoryCues();
            this.layout.clearStorySelector();
        }
    };
    this.cancelListenForSection = function(){
        if (listeningForSectionCue) {
            listeningForSectionCue = false;
            messageBar.setNormal();
            this.layout.removeSectionCues();
        }
    };
    this.showZoomer = function(targetNode, data){
        zoomer.show(targetNode, data);
    };
    this.hideZoomer = function(){
        zoomer.hide();
    };
    this.recentSlides = function(){
        return this.visibleSlides().filter(".recent").find(".container");
    };
    this.flashRecentUpdates = function(){
        TimesSkimmer.application.recentSlides().animate({
            'backgroundColor': '#F0F4F5',
            'color': "black"
        }, 500, "linear", function(){
            setTimeout(function(){
                TimesSkimmer.application.hideRecentUpdates();
            }, 800);
        });
    };
    this.highlightRecentUpdates = function(){
        TimesSkimmer.application.recentSlides().animate({
            'backgroundColor': '#F0F4F5',
            'color': "black"
        }, 500);
    };
    this.hideRecentUpdates = function(){
        TimesSkimmer.application.recentSlides().animate({
            'backgroundColor': '#fff',
            'color': 'black'
        }, 500);
        TimesSkimmer.application.recentSlides().filter(".recent .container").css({
            'backgroundColor': '',
            'color': ''
        });
    };
    this.visibleSlides = function(){
        var displayedSource = source(currentSource());
        return jQuery("#page-" + currentSource() + "-" + TimesSkimmer.application.pagination.getPage(currentSource()) + " li");
    };
    this.enableSingleScreenMode = function(){
        singleScreenMode = true;
    };
    this.openArticle = function(url){
        jQuery("#articleContent").html("");
        articleVisible = true;
        var prefix = ARTICLE_URL_OVERIDE || TimesSkimmer.Config.articleUrl;
        var urlRoot = url.split("?")[0];
        $("#articleFrame").attr("src", prefix + escape(url));
        $("#skimmerArticleViewer").fadeIn("fast");
        $("#articleBar").show();
        var link = "<a href='" + url + "' target='_blank'>" + urlRoot + "</a>";
        $("#articleIdentifier").html(link);
        jQuery("#paginationControls").hide();
        jQuery("#skimmer").css("background", "#a4a4a4");
        TimesSkimmer.application.layout.adjustIframe();
    };
    this.closeArticle = function(){
        $("#skimmerArticleViewer").fadeOut("fast");
        $("#skimmerMessage").html("");
        $("#articleFrame").attr("src", "");
        $("#articleBar").fadeOut("fast");
        jQuery("#paginationControls").show();
        jQuery("#skimmer").css("background", "#ececec");
        articleVisible = false;
    };
    this.showCopyPalette = function(url, title){
        jQuery("#copyPalette").find("input[type=text]").val(url).focus().end().find(".drawnLink").html("<a href='" + url + "'>" + (title ? title : url) + "</a>").end().show("slow");
    };
    this.hideCopyPalette = function(){
        jQuery("#copyPalette").hide("slow");
    };
    this.setPrompt = function(text){
        messageBar.setPrompt(text);
    };
    this.setStatusMessage = function(message){
        messageBar.setMessage(message);
    };
    this.showRightPanel = function(){
        jQuery("#contentPane").css({
            "right": "301px"
        });
        TimesSkimmer.application.resizeGrid();
    };
    this.showHelp = function(){
        if (jQuery("#help").get(0).offsetHeight > 0) {
            this.closeRightPanel();
            jQuery("#controls div").removeClass("active");
        }
        else {
            this.showRightPanel();
            this.hideSidePanes();
            jQuery("#rightPanel").show();
            jQuery("#help").show();
        }
    };
    this.showSettings = function(){
        if (jQuery("#settings").get(0).offsetHeight > 0) {
            this.closeRightPanel();
            jQuery("#controls div").removeClass("active");
        }
        else {
            this.showRightPanel();
            this.hideSidePanes();
            jQuery("#rightPanel").show();
            jQuery("#settings").show();
        }
    };
    this.activateSettings = function(){
        jQuery("#schemeList").empty();
        jQuery(".schemeTemplate").each(function(){
            var schemeName = this.id.replace("Template", "");
            var label = schemeName.split("")[0].toUpperCase() + schemeName.split("").slice(1).join("");
            jQuery("#schemeList").append("<li><table width='100%' cellspacing='0' cellpadding='2px'><tr><td class='schemeHeader'>" + label + "</td><td class='schemeHeader' align='right'><input class='button' type='image' src='http://graphics8.nytimes.com/images/timesskimmer/apply.png' id='scheme-" + schemeName + "' realvalue='" + schemeName + "' value='Apply'></td></tr><tr><td colspan='2' align='center'><img src='http://graphics8.nytimes.com/images/timesskimmer/schemes/" + schemeName + ".png'></td></tr></table></li>");
        });
        $("#scheme-" + TimesSkimmer.Config.currentSchemeName).addClass("selectedOption");
        $("#clickBehavior input[realvalue=" + TimesSkimmer.Config.clickAction + "]").addClass("selectedOption");
    };
    this.resizeGrid = function(){
        resizeGrid();
    };
    this.resetSources = function(){
        $(sourceOrder).each(function(index){
            source(index).expire();
        });
    };
    this.flagChange = function(){
        setupChanged = true;
    };
    this.setMetaContentMode = function(){
        metaContentMode = true;
    };
    this.disableMetaContentMode = function(){
        metaContentMode = false;
    };
    this.inMetaContentMode = function(){
        return metaContentMode;
    };
    this.expandSidebar = function(){
        jQuery("#sources").animate({
            "width": "300px"
        });
    };
    this.contractSidebar = function(){
        jQuery("#sources").animate({
            "width": "119px"
        });
    };
	
	
    this.writeSizeStyles = function(rules){
        var stylesheet = document.getElementById("sizeStyles");
        if (stylesheet.styleSheet) {
            stylesheet.styleSheet.cssText = rules;
        }
        else {
            jQuery(stylesheet).html(rules);
        }
    }
	
	
    this.visiblePage = function(){
        return jQuery("#page-" + TimesSkimmer.application.currentSource() + "-" + TimesSkimmer.application.pagination.getPage(TimesSkimmer.application.currentSource()));
    };
    this.deriveFeedStructure = function(){
        var nav = $("#sources dl");
        var feeds = {};
        var categoryOrder = [];
        var sectionOrder = {};
        nav.children().each(function(){
            if (this.tagName == "DT") {
                var categoryName = $(this).text();
                sectionOrder[categoryName] = [];
                categoryOrder.push(categoryName);
                $(this).next().find("li .label").each(function(){
                    var name = $(this).text();
                    var url = $(this).attr("url");
                    sectionOrder[categoryName].push($(this).text());
                    feeds[name] = url;
                });
            }
        });
        results = {
            "categoryOrder": categoryOrder,
            "sectionOrder": sectionOrder,
            "sources": feeds
        };
        return results;
    };
	
    function listeningForUserInput(){
        return (listeningForStoryCue || listeningForSectionCue);
    }
	
    function setCurrentSource(num){
        if (listeningForStoryCue) {
            return;
        }
        if (num < 0 || num > (sourceOrder.length - 1)) {
            if (typeof currentSelectedSource == "undefined") {
                currentSelectedSource = 0;
            }
            return;
        }
        storedSettings.source = num;
        TimesSkimmer.application.writeSettings();
        currentSelectedSource = num;
    }
	
    function currentSource(){
        if (typeof currentSelectedSource == "undefined") {
            setCurrentSource(0);
        }
        return parseInt(currentSelectedSource, 10);
    }
	
    function source(num){
        return sources[sourceOrder[num]];
    }
	
    function sourceName(num){
        return sourceOrder[num];
    }
	
    function requestSurrounders(){
        if (currentSource() < sourceOrder.length) {
            source(currentSource() + 1).requestData();
        }
        if (currentSource() > 0) {
            source(currentSource() - 1).requestData();
        }
    }
	
    function showTimestamp(){
        var feedUpdated = source(currentSource()).dateUpdated();
        while (isNaN(feedUpdated)) {
            var feedUpdated = source(currentSource()).dateUpdated();
        }
        var now = new Date().getTime();
        var minutesAgo = (now - feedUpdated) / 1000 / 60;
        var message = '';
        if (minutesAgo < 5) {
            message += "Just updated";
        }
        else 
            if (minutesAgo < 15) {
                message += parseInt(minutesAgo, 10) + " minutes ago";
            }
            else 
                if (minutesAgo < 60) {
                    message += "In the last hour";
                }
    };
	
    function expireSection(num){
        source(num).expire();
    }
	
    function itemsInCurrentSource(){
        return source(currentSource()).count();
    }
	
    function updateStatus(){
        messageBar.setPrompt(sourceOrder[currentSource()]);
    }
	
    function updateNavigation(){
        TimesSkimmer.application.layout.markNavigation();
    }
	
    function updatePaginationInfo(sourceNumber){
        if (TimesSkimmer.application.containsGrids()) {
            TimesSkimmer.application.layout.markNavigation();
            TimesSkimmer.application.getSource(sourceNumber).applyPagination();
        }
    }
	
    function firstRun(){
    }
	
    function hideBody(){
        document.body.style.overflow = "hidden";
    }
	
    function showBody(){
        document.body.style.overflow = null;
    }
	
    function categoryId(name){
        return name.replace(" ", "");
    }
	
    function loadSources(){
        sourceOrder = [];
        sources = {};
        var conf = TimesSkimmer.Config;
        for (var i = 0, len = conf.categoryOrder.length; i < len; i++) {
            var categoryName = conf.categoryOrder[i];
            var idBase = categoryId(categoryName);
            var sourceList = conf.sectionOrder[categoryName];
            for (var j = 0, len2 = sourceList.length; j < len2; j++) {
                var name = sourceList[j];
                var sourceObject = new TimesSkimmer.DataSource(sourceOrder.length, name, conf.sources[name], idBase);
                sources[name] = sourceObject;
                sourceOrder.push(name);
                sourceObject.prepare();
            }
        }
        for (var i = 0, len = sourceOrder.length; i < len; i++) {
            source(i).setLayerLevel(sourceOrder.length - i);
        }
    }
	
    function addMetaSource(name, selector){
        var source = new TimesSkimmer.MetaSource(name, sources, selector);
        sources[name] = source;
        sourceOrder.push(name);
        source.prepare();
    }
    function calculateOffset(){
        var scrollerHeight = parseInt(document.getElementById("contentPane").offsetHeight, 10);
        var offset = currentSource() * (scrollerHeight + 20);
        return offset;
    }
    function showActiveSources(){
        var start, finish;
        if (priorSource > currentSource()) {
            start = currentSource();
            finish = priorSource;
        }
        else {
            start = priorSource;
            finish = currentSource();
        }
        jQuery(".shrinkWrap ul").filter(function(index){
            return index > start || index < finish;
        }).show();
    }
    function flipToCurrent(){
        var start, finish, viewPortHeight;
        viewPortHeight = parseInt(document.getElementById("contentPane").offsetHeight, 10);
        jQuery(".shrinkWrap").filter(function(index){
            var outOfScope = index < currentSource() - 1 || index > currentSource() + 1;
            if (outOfScope) 
                source(index).expire();
            return outOfScope;
        }).empty().end().filter(function(index){
            return index > currentSource() + 1;
        }).css({
            top: viewPortHeight + "px"
        }).end().filter(function(index){
            return index < currentSource() - 1;
        }).css({
            top: "-" + viewPortHeight + "px"
        }).end().filter(function(index){
            return index == currentSource() - 1;
        }).moveNode({
            top: "-" + viewPortHeight + "px"
        }, 1000).end().filter(function(index){
            return index == currentSource();
        }).moveNode({
            top: "0"
        }, 1000).end().filter(function(index){
            return index == currentSource() + 1;
        }).moveNode({
            top: viewPortHeight + "px"
        }, 1000).end();
    }
    function hideInactiveSources(){
        jQuery(".shrinkWrap ul").filter(function(index){
            return index !== currentSource();
        }).hide();
    }
    function resizeGrid(){
        TimesSkimmer.application.layout.resizeGrid();
    }
};
$(function(){
    TimesSkimmer.application = new TimesSkimmer.Controller();
    TimesSkimmer.application.start();
});
