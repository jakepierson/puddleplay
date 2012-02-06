	var Babynews = {};
	Babynews.settings = {};
	Babynews.ListManagers = {};
	Babynews.selectors = {};
	Babynews.tags = [];
	Babynews.separators = [];
	
											
	Babynews.init = function() {
	
	
		//ANALYTICS
		if( _IG_GA ) {
	   		Babynews.ga = new _IG_GA("UA-8912978-1"); 
	  	}
	   	else {
			Babynews.ga = false;
			Babynews.ga.reportPageview = function(){};
			Babynews.ga.reportEvent = function(){};
		}
		
	   
	    //Google+
		if(gapi){
			gapi.plusone.go();
			
			var expanded = $("#plus-expanded");
			$("#plus-container").click( function(){ expanded.toggleClass("open"); } )
		}
		
		

	  	//page layout settings
		Babynews.settings.TARGET_PAGE_NUM = 4;
		Babynews.settings.layoutIndex = 3;
		Babynews.settings.layoutSet = [ {rows:2,columns:2}, {rows:3,columns:2}, {rows:3,columns:3}, {rows:3,columns:4}, {rows:4,columns:4} ];
	
		//try to detect an iPhone or iPad
		var deviceAgent = navigator.userAgent.toLowerCase();
		var iPhone = deviceAgent.match(/(iphone|ipod)/);
		var iPad = deviceAgent.match(/ipad/);
		if (iPhone) { 
					Babynews.settings.layoutIndex = 0; 
				}
		if (iPad) { 
					Babynews.settings.layoutIndex = 1;
				 }
					
		
		//retry settings
		Babynews.settings.RETRY_ATTEMPTS = 5; 
		Babynews.settings.RETRY_WAIT_SECS = 10;
		
		//turning things on and off
		Babynews.settings.REFRESH_ON = true;
		Babynews.settings.FIRST_RUN = true;
		Babynews.settings.SHOW_SCORE = false;
		
		Babynews.settings.BASE_URL = "http://puddleplaynews.appspot.com";
		Babynews.settings.SECURE_BASE_URL = "https://puddleplaynews.appspot.com";
		
		Babynews.settings.SERVER_URL = 				Babynews.settings.BASE_URL + "/babynews?";
		
		Babynews.settings.POSTS_URL = 				Babynews.settings.SERVER_URL + "getPosts=1&listName=";
		Babynews.settings.TAGS_LIST_URL =			Babynews.settings.SERVER_URL + "getTags=1";
		Babynews.settings.POST_IMAGE_URL = 			Babynews.settings.SERVER_URL + "imagekey=";
		Babynews.settings.EMAIL_URL = 				Babynews.settings.SECURE_BASE_URL + "/babynews?" + "sendPost";
		
		Babynews.settings.GADGET_IMAGE_URL = 		Babynews.settings.BASE_URL + "/gadget/images/";
		Babynews.settings.GADGET_SOURCE_URL = 		Babynews.settings.BASE_URL + "/gadget/source/";
		
		Babynews.settings.postBackgroundImage = 	Babynews.settings.GADGET_IMAGE_URL + "grad_bg.png";
		Babynews.settings.alertIconSmall =			Babynews.settings.GADGET_IMAGE_URL + "alert_small.png";
		Babynews.settings.alertIconLarge = 			Babynews.settings.GADGET_IMAGE_URL + "alert_large.png";
		Babynews.settings.logoSmall = 				Babynews.settings.GADGET_IMAGE_URL + "ppLogo.png";
		Babynews.settings.animatedLogo = 			Babynews.settings.GADGET_IMAGE_URL + "pp_anim.gif";
		
		
		Babynews.settings.defaultImageHeight = 100;
		Babynews.settings.defaultImageWidth = 100;
		
		Babynews.settings.collapseNav = false;
		
		Babynews.settings.newPostImage = '<img style="position: absolute;opacity: .75;top: 0px ; margin-left: -9px;" src="' + Babynews.settings.GADGET_IMAGE_URL + 'new_post_fat.png" width="65px" height="12px" >';
		
		Babynews.settings.updateIntervalSecs = 60;
		Babynews.settings.newPostSecs = 60 * 60 * 12; //12 hours
		Babynews.settings.hashtags = [];
		
		Babynews.settings.newPostNum = 0;
		
		Babynews.settings.facyboxPrefs = {
						   		'imageScale'			: true,
								'padding'				: 15,
								'zoomOpacity'			: true,
								'zoomSpeedIn'			: 500,
								'zoomSpeedOut'			: 500,
								'zoomSpeedChange'		: 300,
								'overlayShow'			: true,
								'overlayColor'			: "#FFF",
								'overlayOpacity'		: 0.7,
								'enableEscapeButton'	: true,
								'showCloseButton'		: true,
								'hideOnOverlayClick'	: true,
								'hideOnContentClick'	: true,
								'frameWidth'			: 560,
								'frameHeight'			: 340,
								'callbackOnStart'		: null,
								'callbackOnShow'		: null,
								'callbackOnClose'		: null,
								'centerOnScroll'		: true  };
						
		
		Babynews.settings.verticalTransitionSpeed = 500;
		Babynews.settings.horizontalTransitionSpeed = 700;
		Babynews.settings.postBoxWidth = 35;
		Babynews.settings.verticalPageSpacer = 100;
		Babynews.settings.horizontalPageSpacer = 150;
		Babynews.settings.listSlideSpeed = 300;
		
		Babynews.settings.startPageNum = Babynews.settings.TARGET_PAGE_NUM;
		
		Babynews.settings.requestCodes = { start: 0, update: 1, addPage: 2, refreshCheck: 3 };
		
		
		//setup the buttons
		Babynews.updateButtons();
		
		
		//selectors
		Babynews.selectors.tagsLinks = "#tagsLinks";
		Babynews.selectors.alertBox = { box: "#alert", link: "#tryAgainLink" };
		Babynews.selectors.skimmer = "#skimmer";
		Babynews.selectors.pageContainer = "#articleListContainer";
		Babynews.selectors.contentPane = "#contentPane";
		Babynews.selectors.buttons = { left: ".leftButton", leftDisabled: ".leftButtonDisabled", right: ".rightButton", rightDisabled: ".rightButtonDisabled" };	
		
		Babynews.selectors.buttonActions = {
			".rightButton": 	function(event){ Babynews.pageForward(event); },
			".leftButton": 		function(event){ Babynews.pageBack(event); }
		}
				
		//init the layout manager
		Babynews.layoutManager = new Babynews.LayoutManager();	
	
		//init the alert manager
		Babynews.alertManager = new Babynews.AlertManager();
		
		Babynews.LoadingSpinner = '<img src="http://www.google.com/ig/images/spinner.gif"/>';
		
		Babynews.makeLoadingPage = function( text ){ return '<div id="loadingPage">' + Babynews.LoadingSpinner + " " + text + '</div>' };
		Babynews.makeLogoLoadingPage = function( text ){ return '<div id="logoLoadingPage"><table><tr><td><img width="75px" height="75px" src=' + Babynews.settings.animatedLogo + '></td><td height="100%">' + text + " " + '</td></tr></div>' };
		
		jQuery(Babynews.selectors.pageContainer).html( Babynews.makeLogoLoadingPage("Welcome to puddleplay!") ).fadeIn("fast");
		
		//init listeners
        jQuery(Babynews.selectors.buttons.left).live("click", Babynews.selectors.buttonActions[Babynews.selectors.buttons.left]);
        jQuery(Babynews.selectors.buttons.right).live("click", Babynews.selectors.buttonActions[Babynews.selectors.buttons.right]);
		
		//action handlers
		jQuery(window).resize( function(){
			
			if( Babynews.isRefreshing ) return;
			
			if (Babynews.layoutManager.postSizeTooBig()) {
				Babynews.increaseItemDisplayNum();
			} else if (Babynews.layoutManager.postSizeTooSmall()) {
				Babynews.decreaseItemDisplayNum();
			} else Babynews.refreshLayout(); 
			
			Babynews.setScroll(false);

		} );
		
		
		jQuery(window).keydown( function(e){ 
											if(e.which == 39) Babynews.pageForward(); 
											if(e.which == 37) Babynews.pageBack(); 
											if (e.which == 38) {
												Babynews.sectionUp();
											}
											if (e.which == 40) {
												Babynews.sectionDown();
											}
										});
										
										
		//load the various plugins 
		Babynews.loadPlugins();
		
		//get the layout started
		Babynews.refreshLayout();
		
		//add the alert page
		//Babynews.alertManager.init();
		
		//Babynews.clearLoadingIndicator();
		
		//send loaded event
		if( Babynews.ga ) Babynews.ga.reportPageview("/Gadget Loaded");

		//clipboard button
		ZeroClipboard.setMoviePath( Babynews.settings.GADGET_SOURCE_URL + 'ZeroClipboard10.swf' );

				
		//fetch the tag data
		Babynews.fetchData( Babynews.settings.TAGS_LIST_URL, Babynews.receiveTags );
		Babynews.tagsFailTime = ( new Date().getTime() ) +  ( 1000 * Babynews.settings.RETRY_WAIT_SECS );
		

	
	};
	
	
	
	Babynews.storeLink = {
	
		installLink : function() {
		
			if (window.chrome && window.chrome.app && !window.chrome.app.isInstalled) {
	
				$("#listnav").append( '<div id="ChromeStoreInstall" class="btn blue">+ Add to Chrome</div>' );
				$("#ChromeStoreInstall").click( Babynews.storeLink.installApp );
			}
		},
	
		installApp : function() {
		
			if (window.chrome && window.chrome.app && !window.chrome.app.isInstalled) {
			
				//if( chrome.webstore ) chrome.webstore.install();
				//DISABLED due to iFrame
				
				window.open('https://chrome.google.com/webstore/detail/mpadlimohlflajmepdadefmipgopcgff/publish-accepted?hl=en-US&gl=US','_newtab');
				
			}
		}
	
	}
	
		
	
	
	Babynews.receiveTags = function(obj){
	
		if (obj == null || obj.data == null || obj.data.tags == null) {
				
			 if (new Date().getTime() > Babynews.tagsFailTime) {
			 		Babynews.alertManager.tagFail(function(){
					Babynews.tagsFailTime = ( new Date().getTime() ) +  ( 1000 * Babynews.settings.RETRY_WAIT_SECS );
					Babynews.fetchData(Babynews.settings.TAGS_LIST_URL, Babynews.receiveTags);
			 	});
								
			 }
		 
			jQuery(Babynews.selectors.pageContainer).oneTime(1000, function(fails){
				Babynews.fetchData(Babynews.settings.TAGS_LIST_URL, Babynews.receiveTags);
			});			 
						
			return;
		}
		
		jQuery(Babynews.selectors.pageContainer).stopTime();
		Babynews.alertManager.hide();
		
		
		
		/*
		*
		*	CHECK for browser version and proceed if it's allowed
		*/
		
		var ie_version = 100;
		var text = "";
		var ff = false;
		var data = obj.data;
		
		if ("ie_version" in data.prefs) {
			if( data.prefs.ie_version.toUpperCase() == "OFF" ) ie_version = 15;
			else ie_version = data.prefs.ie_version;
		} else {
			ie_version = 100;
		}
			
		if ("firefox_support" in data.prefs) 
			ff = data.prefs.firefox_support.toUpperCase();
		else 
			ff = "OFF";
			
		if ("unsupported_browser_text" in data.prefs) text = data.prefs.unsupported_browser_text;
				
		if( ( $.browser.msie && parseInt($.browser.version, 10) > ie_version )  //if it's IE and the version used is greater than that allowed
			|| ( $.browser.mozilla && ff != "ON") )  //if the browser is FF and the ff enable setting is not ON
		{
		    $("#suckasText").html( text );			
			$("#noSuckasAllowed").fadeIn(300);
		}
		else {
			Babynews.processTags( obj.data );
		}
		
	};
		
		
		
	Babynews.processTags = function( data ) {
		
		var tagsPane = jQuery( "#listnav" );
				
		var list = jQuery('<dl>');
		var dd = {};
		var ol = {};
			
		var tagMap = data.tags;
		
		if(tagMap.length == 0) {
			tagMap.push( {"Lists": ["What's Hot","Most Recent"] } );
		}
		
		var index = 0;
		
		Babynews.delaystart = [];
		
		
		//process the prefs
		if ("prefs" in data) {
			if ("updateIntervalSecs" in data.prefs) 	Babynews.settings.updateIntervalSecs = parseInt(data.prefs.updateIntervalSecs);
			if ("newPostSecs" in data.prefs)  			Babynews.settings.newPostSecs = parseInt(data.prefs.newPostSecs);
			if ("imadeWidth" in data.prefs)  			Babynews.settings.defaultImageWidth = parseInt(data.prefs.imageWidth);
			if ("imadeHeight" in data.prefs)  			Babynews.settings.defaultImageHeight = parseInt(data.prefs.imageHeight);
			if ("hashtags" in data.prefs)				Babynews.settings.hashtags = data.prefs.hashtags;
			
			Babynews.settings.defaultSection = 0;
			if ("defaultSection" in data.prefs)	{
			
				Babynews.settings.defaultSection = parseInt(data.prefs.defaultSection)-1;				

				if( Babynews.settings.defaultSection < 0 )
					Babynews.settings.defaultSection = 0;
					
				if( Babynews.settings.defaultSection >= tagMap.length ) 
					Babynews.settings.defaultSection = tagMap.length - 1;		
				
			} 
			
			//search
			Babynews.settings.enableSearch = !jQuery.browser.msie;
			if ("searchEnabled" in data.prefs)		Babynews.settings.enableSearch = data.searchEnabled;
			
		}
		
		
		
		//init tags
		for( var group in tagMap ) {
			var dt = jQuery('<dt class="content">');
			if( index == 0 ) dt.css("margin-top", 0);
			dt.html( group );
			
			/*
			dt.click( function(event){ 
		      		if( !Babynews.settings.collapseNav ) {
						$(this).next().find("li:first").trigger('click');
						return;
					}
					if ($(this).hasClass("active")) {
			           // $(this).parent("dl").find("dd").slideUp(Babynews.settings.listSlideSpeed).end().find("dt").removeClass("active");
			        }
			        else {
			            $(this).parent("dl").find("dd").slideUp(Babynews.settings.listSlideSpeed).end().find("dt").removeClass("active");
			            $(this).addClass("active").next().slideDown(Babynews.settings.listSlideSpeed);
			        }
				 } );
				 */
				 
			list.append(dt);			

			dd = jQuery('<dd class="content">');
			ol = jQuery("<ol>");		
			
			var tags = tagMap[group];
			for (var num in tags) {
				var item = {}
				item.name = tags[num];
				item.displayName = "" + item.name;
				item.menu = {};
				item.index = Babynews.tags.length;
				item.ListManager = new Babynews.ListManager( item.name, Babynews.tags.length, Babynews.updatedListData );
				item.selectorID = item.ListManager.selectorID();
				Babynews.tags.push(item);
			
								
				var li = jQuery("<li>");
				li.append(item.displayName);
				li.attr("name", item.name);
				li.addClass("disabled");
				li.data("index", item.index);
				//process a click on the list
				li.click( function(event){ 
            			var item = jQuery(this);
						if( item.hasClass("disabled") ) return;
						item.parents("dl").find("li.selected").removeClass("selected orange");
						item.addClass("selected orange");
						item.removeClass("hover");
						Babynews.selectTag( jQuery(event.target).data().index );
					});
				
				li.hover(  function(event){ 
						item = jQuery(this);
						if( item.hasClass("disabled") ) return;
						if( item.hasClass("selected") ) return;
						if( item.hasClass("hover") ) item.removeClass("hover");
						else item.addClass("hover");  
					} );
				
				//save the li reference
				item.menu.li = li;			
				item.menu.dd = dd;
				item.menu.dt = dt;
				item.menu.dl = list;
				
				ol.append(li);
				
				var container = jQuery( Babynews.selectors.pageContainer );
				var newPage = jQuery( item.ListManager.getBigPage() );
				container.append(newPage);
				
				
				//fast start the ListManager with data from the top two lists
				if (Babynews.tags.length < 3 || num == Babynews.settings.defaultSection ) { 
					item.ListManager.fastStart( Babynews.settings.startPageNum ); 
					//start the refresher
					item.ListManager.refreshLoop();
					
					//enable the menu items so they can be selected
					item.menu.li.removeClass("disabled");
				}
				else { Babynews.delaystart.push( item ); }
				
			}
			
			dd.append(ol);
			list.append(dd)
			index++;
		}
		
		//start the timer that will load the other sections
		window.setTimeout( Babynews.timedStart, 200 );
		
		
		//show the tags
		tagsPane.append(list);
		tagsPane.show();
		
		//tagsPane.find("dd").slideUp(0).end();
		//tagsPane.find("dd").slideDown(Babynews.settings.listSlideSpeed).end();
		
		//test to see if the list is longer than the box. If so, collapse. Then set the height to be the full length.
		if( list.height() > Babynews.layoutManager.getPageHeight() ) Babynews.settings.collapseNav = true;
		list.css("bottom", list.css("top"));
					
		//start the timer to update the stats string
		jQuery("listStats").everyTime( 60 * 1000, "statsRefresher", Babynews.updateStatsString(false) );	
		
		
		if (Babynews.settings.enableSearch) {
			jQuery.getScript("http://www.google.com/jsapi?key=ABQIAAAA4YutqqGpdQ3P_sKY_kQIVBSt-lvDJx8wPzTLvzz2Zct2Fomc0xQwuMcPeZiy9K0kiL_vHMgPPGhuQQ", function(){
				google.load('search', '1', { language: 'en', "callback": Babynews.addSearch }); 
			});
		}
		
		//install the chrome store install link
		Babynews.storeLink.installLink();
		
		//select the first link or the default selected index
		if (Babynews.tags.length > 0) {
			Babynews.settings.listSlideSpeed = 0;
			Babynews.tags[ Babynews.settings.defaultSection ].menu.li.trigger('click');
			Babynews.tags[ Babynews.settings.defaultSection ].menu.dt.trigger('click');
			Babynews.settings.listSlideSpeed = 400;
		}	
		
	}
	
	
	
	Babynews.timedStart = function() {
		//delay the loading of the rest of the lists
		window.setTimeout( 
			function() {
				var item = Babynews.delaystart.shift();
				
				if (item != null) { 
						item.ListManager.fastStart( Babynews.settings.startPageNum );
											
						//start the refresher
						item.ListManager.refreshLoop();
					}
					
				if( Babynews.delaystart.length > 0 ) Babynews.timedStart(); 
			} 
			, 100 )
	}
	
	
	
    Babynews.selectTag = function( index ) {
        
		if( index == null ) return;
		if( index > (Babynews.tags.length-1) ) return;
		
		var tag = Babynews.tags[index];
		
		//if the tag is already selected;
      	//if( Babynews.currentTag == tag ) return;
		
		Babynews.refreshLayout();
		var lm = Babynews.layoutManager;
		
		//make sure other UI is hidden
		Babynews.hideSearch();
		Babynews.hideNewPosts();
		Babynews.clearLoadingIndicator();
		

   		var topPosition = -1 * (lm.getPageHeight() + Babynews.settings.verticalPageSpacer);
		var middlePosition = 0;
		var bottomPosition = 1 * (lm.getPageHeight() + Babynews.settings.verticalPageSpacer)
		var slide = topPosition;
		
		var selectedDiv = jQuery( tag.selectorID );
		var speed = Babynews.settings.verticalTransitionSpeed;
		
		if (Babynews.currentTag != null) {
			
			jQuery("#logoLoadingPage").remove();
			
			slide = (Babynews.currentTag.index < tag.index) ? topPosition : bottomPosition;
			if( Babynews.currentTag.index == tag.index ) slide = middlePosition;

			var currentDiv = jQuery(Babynews.currentTag.selectorID);
			currentDiv.css("z-index", -1);

			//animate the current window out
			currentDiv.stop(true, true).animate( { top: slide }, speed, 'easeInOutQuad', function(){});
			
			if( Babynews.ga ) Babynews.ga.reportEvent("Navigation", "Tag Selected",  tag.name);
			
		} else {
			//this is the first run, so don't scroll the new page up
			speed = 0;		
		}
			
		Babynews.currentTag = tag;
		Babynews.currentListManager = tag.ListManager;
		
		//put the container in the right place
		selectedDiv.css("top", (-1 * slide) );
		selectedDiv.css("z-index", 100);
		selectedDiv.stop(true, true).animate({ top: 0 }, speed, 'easeInOutQuad', function(){});
		
		
		//do some calc to see if the posts fit well in the page
		if (Babynews.layoutManager.postSizeTooBig()) {
					Babynews.increaseItemDisplayNum();
		} else if (Babynews.layoutManager.postSizeTooSmall()) {
					Babynews.decreaseItemDisplayNum();
		} 
		
		
		//check that the pages have the correct num of items
		
			
			
		Babynews.setScroll(false);
		Babynews.updateButtons();
		Babynews.updateStatsString( true );
   }
    
		
	
	Babynews.updateStatsString = function( animate ) {
		
		var speed = animate ? 300 : 0;
		
		if( jQuery( ".statsString" ).hasClass("newPosts") ) return;
		//update the updated string
		//jQuery( ".statsString" ).fadeOut( speed, function() { jQuery( ".statsString" ).html( Babynews.currentTag == null ? "" : Babynews.currentTag.ListManager.getStatsString()).fadeIn(speed); } );
		jQuery( ".statsString" ).html( Babynews.currentTag == null ? "" : Babynews.currentTag.ListManager.getStatsString() );
		//jQuery("#tagTitle").fadeOut( speed, function() { jQuery("#tagTitle").html(Babynews.currentListManager.name).fadeIn(speed); } )
	}
	
	
	Babynews.increaseItemDisplayNum = function() {
	
		if (Babynews.settings.layoutIndex < Babynews.settings.layoutSet.length-1) {
			Babynews.settings.layoutIndex++;
			Babynews.changeItemDisplayNum( Babynews.currentListManager );
		} else {
			Babynews.settings.layoutIndex = Babynews.settings.layoutSet.length - 1;
		}
		
	};
	
	
	Babynews.decreaseItemDisplayNum = function() {

		if( Babynews.settings.layoutIndex > 0 ) {
			Babynews.settings.layoutIndex--;
			Babynews.changeItemDisplayNum( Babynews.currentListManager );
		} else {
			Babynews.settings.layoutIndex = 0;
		}

	};
	
	
    Babynews.changeItemDisplayNum = function( ListManager) {
   
		jQuery(Babynews.selectors.pageContainer).fadeOut( 200, function(){
																	Babynews.isRefreshing = true;
																
																	jQuery( Babynews.selectors.contentPane ).append( Babynews.makeLoadingPage("Adjusting...") ).fadeTo( 1000, 0.5 );
																	
																	ListManager.repaginate();
																	Babynews.setPageHTMLContents(ListManager);
																	Babynews.refreshLayout();
																	//Babynews.fixTextPage( Babynews.currentListManager );
																	jQuery(Babynews.selectors.pageContainer).fadeIn(200, function(){
																															Babynews.isRefreshing = false; 
																															jQuery("#loadingPage").remove(); 
																															jQuery( Babynews.selectors.contentPane ).fadeTo( 0, 1.0 )
																														} );
															} ); 
    }
	
	
	
	Babynews.pageForward = function(event) {
				
		if( Babynews.currentTag.ListManager.nextPage() ) {
		    Babynews.setScroll(true);
			Babynews.updateButtons();
			if( Babynews.ga ) Babynews.ga.reportEvent("Navigation", "Page Turn", Babynews.currentTag.name, Babynews.currentListManager.getCurrentPageNumber() );
			return true;
		} 
		return false;
	}
	
	
    Babynews.pageBack = function(event){
        if (Babynews.currentTag.ListManager.previousPage()) {
            Babynews.setScroll(true);
            Babynews.updateButtons();
			if( Babynews.ga ) Babynews.ga.reportEvent("Navigation", "Page Turn", Babynews.currentTag.name , Babynews.currentListManager.getCurrentPageNumber() );
       		return true;
		} 
		return false;
    }
	
	
	Babynews.sectionUp = function(event) {
		if( Babynews.currentTag.index > 0 ) Babynews.tags[Babynews.currentTag.index-1].menu.li.trigger('click');
		else Babynews.tags[Babynews.tags.length-1].menu.li.trigger('click');
	}


	Babynews.sectionDown = function(event) {
		if( Babynews.currentTag.index < Babynews.tags.length-1 ) Babynews.tags[Babynews.currentTag.index+1].menu.li.trigger('click');
		else Babynews.tags[0].menu.li.trigger('click');
	}
	
	
	Babynews.setScroll = function( animate ) {
		
        var bigpage = jQuery( Babynews.currentTag.selectorID  );
		var speed = Babynews.settings.horizontalTransitionSpeed;
		var newPos = Babynews.layoutManager.getPageScrollOffset(Babynews.currentListManager.getCurrentPageNumber());

		if( animate == null ) animate = true;
		
		//no animate
		if (!animate) {
			bigpage.css( "margin-left", newPos )
		}
		else {
			bigpage.stop().animate({ marginLeft: newPos }, speed, 'easeInOutQuad', Babynews.checkAddPage );
		}
	}
	
	
	
	
	//add another page if we're at the last one
	Babynews.checkAddPage = function() {
		if( Babynews.currentListManager.lastPage() ) {
			//add another page
			Babynews.currentTag.ListManager.addAnotherPage( 2 );
			Babynews.showLoadingIndicator();
		}
	}
	
	


	Babynews.showLoadingIndicator = function() {
			jQuery("#loadingIndicator").fadeTo(400, 1.0);	
	}
	
	Babynews.hideLoadingIndicator = function() {
			jQuery("#loadingIndicator").fadeTo(400,0);	
	}
	
	Babynews.clearLoadingIndicator = function() {
			jQuery("#loadingIndicator").fadeTo(1,0);	
	}
	
	
	
	Babynews.showNewPostsFake = function() {
		newPosts = new Array(5);
		page_diff = [true, false];
		Babynews.showNewPosts(Babynews.currentListManager, page_diff, newPosts );
	}
	
	
	
	Babynews.showNewPosts = function( ListManager, page_diff, newPosts ) {
		
		//reject the new posts call if the list is empty or this is not the current list manager
		if( newPosts.length == 0 || ListManager !== Babynews.currentListManager ) return false;
		
		//don't accept this if no page at or before this one has changed
		//var pageBeforeChanged=false;
		//for(var i=ListManager.getCurrentPageNumber(); i >= 0; i--) {
		//	if( page_diff[i] ) pageBeforeChanged=true;
		//} 
		
					
		/*	
		if( !stats.hasClass("newPosts") ) {
			
			stats.addClass("newPosts");
			stats.data( "newPosts", { lm: ListManager, diff: page_diff, newPosts: newPosts } );
			
			stats.click( function(event) {
				var data = jQuery(".statsString").data("newPosts");
				Babynews.updatedListData( data.lm, data.diff, data.newPosts );
				//Babynews.setPageHTMLContents( data.lm, data.diff, data.newPosts );
				Babynews.hideNewPosts();
				return false;
			} );
			
			stats.hover( function(){ jQuery(this).addClass( "hover" ) }, function(){ jQuery(this).removeClass("hover") } );
			
			var newposts = newPosts.length;		
			stats.html( "There are " + newposts + " new " + (newposts > 1 ? "posts" : "post") + "! Click to update." );
		}
		*/
		
		Babynews.settings.newPostNum += newPosts.length;
		
		var stats = $(".statsString");
		stats.addClass("newPosts btn orange");
		
		var s = (Babynews.settings.newPostNum > 1 ? "We just found " : "We just found " ) + Babynews.settings.newPostNum + " new " + (Babynews.settings.newPostNum > 1 ? "posts" : "post") + "! Click to update.";
		
		stats.html( s );
		
		//add events
		stats.click( function(event) {
			Babynews.hideNewPosts();
			Babynews.updatedListData( ListManager, page_diff, newPosts );
			Babynews.settings.newPostNum = 0; //reset the counter
			return false;
		} );
		
		stats.hover( function(){ jQuery(this).addClass( "hover" ) }, function(){ jQuery(this).removeClass("hover") } );

		$("#listStats").css("width","30px");
	
		//animate it
		$("#listStats").animate({
			    width: 300,
			  }, {  duration: 400, 
				    specialEasing: {
				      width: 'easeOutBack',
				      height: 'easeOutBack'
				    }, 
					complete: function(e){}
		});
		
		return true;
		
	}
	
	
	
	
	Babynews.hideNewPosts = function() {
		var stats = jQuery(".statsString");
		stats.removeClass("newPosts btn orange");
		stats.unbind('click');
		stats.removeClass("hover");
		Babynews.updateStatsString(false);
	}
		
	
	Babynews.newPages = function( ListManager, page_diff ) {
		if( ListManager == null ) return;
				
		//make the list undisabled
		jQuery( Babynews.tags[ListManager.index].menu.li ).removeClass("disabled");

		Babynews.setPageHTMLContents( ListManager, page_diff );
		Babynews.updateButtons();
		Babynews.hideLoadingIndicator();
	}
	
		
	Babynews.updatedListData = function( ListManager, page_diff, newPosts ){
		//we have an updated list
		
		if( ListManager == null ) return;
		// Check if the current page is in the list being viewed.  
		// If so, skip it because it might affect the sharing. 
		
		Babynews.setPageHTMLContents( ListManager, page_diff, newPosts );
		
		//update the updated string
		Babynews.updateStatsString(false);
		
	}
	
	
	Babynews.setPageHTMLContents = function( ListManager, page_diff, newPosts ){
		
		var bigpage = jQuery( ListManager.selectorID() );
		bigpage.empty();  //clear tha mother out.
		
		for (var i = 0; i < ListManager.getNumPages(); i++) {
			//if( page_diff != null && !page_diff[i]) continue;
			
			//get the new pages
			var pageHTML = ListManager.getPageElement(i);
			//var page = bigpage.find(".page" + String(i));
			
			//if (page.length == 0) {
				//the page isn't there.  Add it 
			//	bigpage.append(pageHTML);
			//} else {
			//	page.replaceWith(pageHTML);
			//}
			
			bigpage.append(pageHTML);
			
			page = bigpage.find(".page" + String(i));
			
			//set image sources
			//page.find(".imageLoading").each( function(){ 
			//			jQuery(this).attr("src", jQuery(this).attr("source") ) 
			//			}  );
			
			Babynews.fixTextAllPages(ListManager);
			
			page.find(".headlineAnalytics").click(function(e){
				var title = jQuery(e.target).attr("title");
				var blog = jQuery(e.target).attr("blog");
				if( Babynews.ga ) Babynews.ga.reportEvent("Post Click", "Headline", blog + " : " + title);
			});
			
			page.find(".imageAnalytics").click(function(e){
				var title = jQuery(e.target).attr("title");
				var blog = jQuery(e.target).attr("blog");
				if( Babynews.ga ) Babynews.ga.reportEvent("Post Click", "Image", blog + " : " + title);
			});
			
			page.find(".blogAnalytics").click(function(e){
				var title = jQuery(e.target).html();
				if( Babynews.ga ) Babynews.ga.reportEvent("Post Click", "Blog", title);
			});
		}
		
		bigpage = jQuery( ListManager.selectorID() );
		bigpage.attr("num", ListManager.getNumItemsPerPage() );
		
		//find and fade in new posts
		for (var n in newPosts) {
			var k = newPosts[n].key;
			var p = jQuery( bigpage.find("[key='" + String(k) + "']") );
			p.fadeTo( 0, 0.0, function(){ jQuery(this).fadeTo(1000, 1.0)} );
		}
		
	}
	
	
	
	Babynews.addSearch = function(){
	
		//setup searching	
		
			//google.setOnLoadCallback(function(){
				
						
				///
				//setup searching	UI in the nav bar
				var search_dt = jQuery('<dt class="content">');
				search_dt.html("Search");
				var list = jQuery("#listnav").find("dl");
				list.append(search_dt);
				var searchbox = jQuery('<dd class="content">');
				searchbox.html('<div id="navSearch">');
				list.append(searchbox);
				
				
					
				//make search results page
				var searchContainer = jQuery("<div>");
				searchContainer.css("z-index", -1).attr("id", "searchContainer").addClass("shrinkWrap").css("marginRight", 0).css("marginLeft", 0).css("left", 0);
				var searchPage = jQuery("<div>");
				searchPage.addClass("page");
				searchPage.css("background-color", "white");
				var closeBoxTop = jQuery("<div>").attr("id", "searchResultsBoxTop").addClass("closeLink").css("width", "100%").css("text-decoration", "none");
				closeBoxTop.append('<a  href="" onclick="Babynews.hideSearch()"><< Go back to puddleplay</a>');
				searchPage.append(closeBoxTop);
				
				var navSearch = jQuery("<div>").attr("id", "navSearch");
				searchPage.append(closeBoxTop);
				
				var resultsBox = jQuery("<div>");
				resultsBox.attr("id", "searchResults");
				searchPage.append(resultsBox);
				
				var closeBoxBottom = jQuery("<div>").addClass("closeLink").css("width", "100%").css("text-decoration", "none");
				closeBoxBottom.append('<a href="" onclick="Babynews.hideSearch()"><< Go back to puddleplay</a>');
				searchPage.append(closeBoxBottom);
				searchContainer.append(searchPage);
				jQuery(Babynews.selectors.pageContainer).append(searchContainer);
				
				
				var customSearchControl = new google.search.CustomSearchControl('013974144322735817659:wnhkdrzkmtw');
				var s_options = new google.search.SearcherOptions();
				s_options.setExpandMode(google.search.SearchControl.EXPAND_MODE_OPEN);
				customSearchControl.addSearcher(new google.search.WebSearch(), s_options);
				//customSearchControl.setResultSetSize(google.search.Search.FILTERED_CSE_RESULTSET);
				customSearchControl.setResultSetSize(google.search.Search.SMALL_RESULTSET);
				
				var d_options = new google.search.DrawOptions();
				d_options.setSearchFormRoot('cse');
				d_options.setSearchFormRoot('navSearch');
				d_options.setDrawMode(google.search.SearchControl.DRAW_MODE_LINEAR);
				customSearchControl.draw('searchResults', d_options);
				
				customSearchControl.setSearchStartingCallback(this, Babynews.onSearchComplete);
				
				//var searchStuff = $("#navSearch").html();
				//$("#searchResultsBoxTop").append(searchStuff);
				
				var cells = $("table.gsc-search-box").find("td");
				
				var new_table = $("<table>").addClass("gsc-search-box").append("<tbody>");
				var row1 = $("<tr>").append($(cells[0])).attr("align", "right");
				var row2 = $("<tr>").append($(cells[1])).attr("align", "right");
				new_table.append(row1).append(row2);
				
				$("table.gsc-search-box").replaceWith(new_table);
				
				$("#navSearch").parent("dd").slideDown(Babynews.settings.listSlideSpeed).end();
				
			
				
				//hide the searching 
				Babynews.hideSearch();
				
			//}, true);
		
		
	}
   		
		
	
	Babynews.hideSearch = function() {
		
		var selectedDiv = jQuery( "#searchContainer" );
		
		var speed = Babynews.settings.verticalTransitionSpeed * .75;
		var lm = Babynews.layoutManager;
	
		//slide the search box in
		selectedDiv.stop(true, true).animate({ left: lm.getPageWidth() * -1.2 }, speed, 'easeInOutQuad', function(event){ jQuery(this).css("z-index", -1); });

		//show the nav and hide search
		jQuery(".navBar").fadeTo("fast",1);
	}


	Babynews.onSearchComplete = function(sc, searcher){
	
		//analytics
		var term = "";
		if(sc != null && "Cc" in sc ) term = sc.Cc; 
		if( term.length > 0 ) {
			if( Babynews.ga ) Babynews.ga.reportEvent("Search", "initiated", term);
			}
	
		var selectedDiv = jQuery( "#searchContainer" );
		
		var speed = Babynews.settings.verticalTransitionSpeed * 1.5;
		
		var lm = Babynews.layoutManager;
		
		//put the container in the right place
		//selectedDiv.css("left", (-1 * slide) );
		
		//slide the search box out
		selectedDiv.css("z-index", 1000);
		selectedDiv.stop(true, true).animate({ left: 0 }, speed, 'easeInOutQuad', function(){});
		
		jQuery(".navBar").fadeTo("fast", 0);
		//jQuery("#listnav").find("li.selected").removeClass("selected");
				
	};

	
	Babynews.updateButtons = function() {
		
		if( Babynews.currentListManager == null ) return; 
		
		var firstPage = true;
		var lastPage = true;
		
		if (Babynews.currentListManager) {
			firstPage = Babynews.currentListManager.firstPage();
			lastPage = Babynews.currentListManager.lastPage();
		}
	
		( firstPage ) ? jQuery( Babynews.selectors.buttons.left ).fadeTo(300, 0.3) : jQuery( Babynews.selectors.buttons.left ).fadeTo(300, 1);
		( lastPage )  ? jQuery( Babynews.selectors.buttons.right ).fadeTo(300, 0.3) : jQuery( Babynews.selectors.buttons.right ).fadeTo(300, 1);
				
	}
	
			
	Babynews.fixTextPage = function( ListManager ) {
				
		var start = 0;
		var end = ListManager.getNumPages();
		
		for( var pagenum = start; pagenum < end ; pagenum++ ) {
			var page = jQuery( ListManager.selectorID() + ".page" + String(pagenum) );
			 
			//iterate over the items below 
			Babynews.fixTextItem(ListManager, page);
		}
		
	}
	
	
	Babynews.fixTextItem = function(ListManager, page ) {
		
		var posts = jQuery( ".post", page );
		
		for (var i = 0; i < posts.length; i++) {
		
			var post = jQuery(posts[i]);
			
			//var postnum = post.attr("item");
			//var pagenum = post.attr("page")
			
			var imgDiv = post.find(".image");
			imgDiv.css("width", "");
			imgDiv.css("height", "");
			//imgDiv.find("img").removeClass("imageLoading");
			
			content_height = Babynews.layoutManager.getContentHeight();
			
			var content = post.find(".fixHeadlineText");
			var w = content.parent().width(); 
			var h = Babynews.layoutManager.getHeadlineHeight();
			Babynews.trimtoRect2(content, w, (hasImage ? h : h*1.25) , "...", true, false, data);
			
			content = post.find(".fixContentText");
			var title = content.html();
			
			var data = ListManager.getPostDatabyKey( post.attr("key") );
			if( data == null ) return;
			
			//see if the post has an image
			var hasImage = true;
			if( data != null ) hasImage = ( jQuery.inArray( "image", data.flags ) > -1 );
			
			Babynews.trimtoRect2(content, content.width(), content_height , "...", true, false, data);

		}
	}
	
	
	
			
	Babynews.fixTextAllPages = function( ListManager ) {
		var start = 0;
		var end = ListManager.getNumPages();
		
		for( var pagenum = start; pagenum < end ; pagenum++ ) {
			var page = $( ListManager.selectorID() + " .page" + String(pagenum) );
			 
			//iterate over the items below 
			Babynews.fixTextPage(ListManager, page);
		}
	}
	
	
	
	Babynews.fixTextPage = function( ListManager, page ) {
		
		//var posts = $( ".post", page );
		
		//fix the date agos
		//posts.each( function(i, elem){ News.setPostDate( $(elem) ) } );		
		$( ".post", page ).each( function(i, elem){ Babynews.fixTextItem( $(elem) ) } );		
		
	};
	
	
	
	Babynews.fixTextItem = function( post ) {
		//fit the headline
		Babynews.fitTextFast( post );
	}
	
	

	Babynews.fitTextFast = function( postElem ) { 
		
		if( postElem == null ) return;
	
		var headline = postElem.find(".fixHeadlineText");
		var headContainer = postElem.find(".headline");
		//var pct = parseFloat( postElem.attr("headlineHeight") );
		//var ph = postElem.outerHeight();
		//var max = (pct/100) * ph;
		
		var max = postElem.height()/3;
		
		var hh = headContainer.height();
			
		if (hh > max) {
			var str = headline.text();	
			var sizeRatio = max/hh;		
			str = str.substr(0, sizeRatio * str.length);
			str += "&hellip;"; 
			headline.html(str);
		} 
		
		var content = postElem.find(".fixContentText");
		
		if( content && content.length > 0 ) {
			//fit the content
			
			var max_height = 60; //(ph - hh -50);
			
			var cont_height = content.height();
			
			if (cont_height > max_height) {
				var str = content.text();	
				var position = max_height/cont_height;		
				str = str.substr(0, position * str.length);
				str += "&hellip;"; 
				content.html(str);
			} 
			
		}		
	} 




	
	

	Babynews.ListManager = function( TAG, index, newElementNotifier ){
		
		this.name = TAG;
		this.index = index;
		this.list = new Array();
		this.keys = {};
		
		this.url = Babynews.settings.POSTS_URL + this.name.replace(/ /ig, "%20");
		
		this.doneCallback = {};
		this.refresher = newElementNotifier;
		
		this.stats = { numPosts: 0, updated_string: "", updated_posts: 0, numSources: 0, refreshed: 0 };
		this.book = { currentPage: 0, pagelength: 0, numpages: 0, numitemstotal: 0, pages: [], htmlPages: [] };
		
		this.updateIntervalSecs = Babynews.settings.updateIntervalSecs;
		this.newPostSecs = Babynews.settings.newPostSecs;
		

		this.targetPagenum = Babynews.settings.TARGET_PAGE_NUM;
		this.numChars = 600;
		
		this.book.pages = [];
		this.book.htmlPages = [];
		this.book.newPosts = [];
		
		this.requestIDs = [];
		
		this.selectorID = function() {
			return "#" + this.name.replace(/ /ig, "_" ).replace(/'/ig, "");
		}
		
		this.selectorName = function() {
			return this.name.replace(/ /ig, "_" ).replace(/'/ig, "");
		}
	
		this.getListSubset = function(start, end) {
			var subset = new Array();
			for( var i=start; i < this.list.length && i < end; i++ ) {
				subset.push(this.list[i]);
			}
			return subset;
		}
		
		this.checkup = function() {
			//bad if there is no first page
			if( !this.hasHTMLPage(0) ) return "bad";
			
			//bad if none of the responses have come back
			if( this.requestIDs.length >= this.targetPagenum ) return "bad";
			
			if( this.book.htmlPages.length < this.targetPagenum ) return "ok";
			
			if( this.book.htmlPages.length == this.targetPagenum ) return "good";
			
		};
		
		this.getStatsString = function() {
			
			if( this.stats.refreshed < 100 ) return "";
			
			var stats = "Last updated: " + Babynews.prettyDate(new Date().getTime() - this.stats.refreshed);
			//if( this.stats.numSources > 1 ) stats += " from " + this.stats.numSources + ' <a class="sitesLink" href="http://www.puddleplay.com/news/sites" target="_blank">sites</a>.';
						
			return stats;
		}
		
		
		this.getPostDatabyKey = function( key ) {
			var post = null;
			for( var i=0; i < this.list.length; i++ ) {
				if (this.list[i] && this.list[i].key && this.list[i].key == key) {
					post = this.list[i];
					break;
				}
			}
			
			 return post;
		}
		
			
		this.containsPostKey = function( key ) {			
			var result = this.getPostDatabyKey( String(key) );
			if( result == null ) return false;
			else return true;
		}
		
		
		this.getNumItemsPerPage = function() {
			var layout = Babynews.settings.layoutSet[ Babynews.settings.layoutIndex ];
			return (layout.rows * layout.columns) - 1;
		}
		
		
		this.repaginate = function( page_diff ) {
			this.book.numitemstotal = this.list.length;
			this.book.pagelength = this.getNumItemsPerPage();
			this.book.numpages = Math.ceil( this.list.length / this.book.pagelength );
			 			
			for( var i=0; i < this.book.numpages; i++ ) {
				var start = i * this.book.pagelength;
				var end = (i+1) * this.book.pagelength;
				this.book.pages[i] = this.getListSubset( start , end );
				
				if ( page_diff == null || page_diff[i] ) {
					this.book.htmlPages[i] = this.makePageElement(i); 
				} 
			}
			
			//adjust the num of pages based on this page
			if( this.book.currentPage > this.book.numpages ) {
				this.book.currentPage = this.book.numpages-1;
			}
			
		}
		
		
		this.getBigPage = function() {
			
			var div = jQuery("<div>")
			div.attr("id", this.selectorName() );
			
			for( var i=0; i < this.book.numpages; i++ ) {
				//get the page element
				var elem = this.book.htmlPages[i];
				//if the page element is null, try to make it
				if(elem == null) elem = this.makePageElement(i);
				
				div.append(elem);
			}
			
			//div.width( container.width * Babynews.currentListManager.getNumPages() );
			//div.height( container.height );
			div.addClass("shrinkWrap");
			div.css( "marginRight", -4500 );
			div.css( "marginLeft", 0 );
			div.css( "top",  (Babynews.layoutManager.getPageHeight() + Babynews.settings.verticalPageSpacer) );
			div.css( "z-index", -1);
			div.attr("index", this.index);
			
			return div;
		}
		
				
		this.hasHTMLPage = function( index ) {
			if( index == null ) index = 0;
			
			if ( this.book.htmlPages.length > 0 && this.book.htmlPages[index] != null ) return true;
			else return false;
		}
		
		
		this.getPageElement = function( index ) {
				var elem = this.book.htmlPages[index];
				//if the page element is null, try to make it
				if(elem == null) elem = this.makePageElement(index);
				return elem;
		}
		

		this.makePageElement = function( index ) {
			
			var div = jQuery("<div>")
				div.css("float", "left");
				div.css("display", "block");
				div.css("margin-right", Babynews.settings.horizontalPageSpacer + "px");
				div.attr("num", this.getNumItemsPerPage());
				div.addClass("page " + "page" + String(index) );
				
			if( index < this.book.numpages ) {
				//create each page as an HTML element
				div.append( Babynews.getPageHTML( this.book.pages[index], index, this ) );
			}
			
			return div;
		};
		
		this.getCurrentPageElement = function() {
			return this.getPageElement( this.book.currentPage );
		};
		
		
		this.getPage = function( index ){
			if( this.book.numpages == null || index > this.book.numpages ) return new Array();
			return this.book.pages[index];
		}
		
		this.nextPage = function(){
			if( this.book.currentPage < this.book.numpages-1 ) {
				this.book.currentPage++;
				return true;
			}
			else return false;
		}
		
		this.previousPage = function(){
			if( (this.book.currentPage > 0) ) {
				this.book.currentPage--;
				return true;
			}
			else return false;
		}
		
		this.firstPage = function() {
			if( this.book.currentPage == 0 ) return true;
			else return false;
		}
		
		this.lastPage = function() {
			if( this.book.currentPage == this.book.numpages-1 ) return true;
			else return false;
		}
		
		this.getCurrentPageData = function() {
			return this.getPage( this.book.currentPage );
		}
		
		this.getCurrentPageNumber = function() {
			return this.book.currentPage;
		}
		
		this.getNumPages = function(){
			if( this.book.numpages > 0 ) return this.book.numpages;
			else return 0;
		}
		
		
		this.fastStart = function( pagesToGet ) {
			
			var newID = {
				ID:  Math.random() * 10,
				reqTime: new Date().getTime(),
				pages: pagesToGet,
				doneCallback: Babynews.newPages,
				ListManager: this,
				code: Babynews.settings.requestCodes.start
			};
			
			this.fetchData( newID );
			
		};
		
		this.refreshAll = function() {
			
			var newID = {
				ID:  Math.random() * 10,
				reqTime: new Date().getTime(),
				pages: this.targetPagenum, 
				doneCallback: Babynews.updatedListData,
				ListManager: this,
				code: Babynews.settings.requestCodes.update
			} 
			
			
			this.fetchData( newID );
		}
		
		
		this.checkForUpdate = function() {
		
			var newID = {
				ID:  Math.random() * 10,
				reqTime: new Date().getTime(),
				pages: 0,
				doneCallback: null,
				ListManager: this,
				code: Babynews.settings.requestCodes.refreshCheck
			} 
		
			//send an empty request to get a check for updates;
			this.fetchData( newID );
		}	
		
				
		//adds one or more pages to the ListManager
		this.addAnotherPage = function( num ) {
			num = (num==null ? 1 : num );
			
			var newID = {
				ID:  Math.random() * 10,
				reqTime: new Date().getTime(),
				pages: this.targetPagenum+num,
				numAdded: num,
				doneCallback: Babynews.newPages,
				ListManager: this,
				code: Babynews.settings.requestCodes.addPage 
			} 
			
			this.fetchData( newID );
		}
			
				
		this.refreshLoop = function() {
			
			jQuery( this.selectorID() ).stopTime(this.name);
			
			//add a stagger to make sure all of the lists don't process at the same time. 
			var stagger = Math.random() * (1000 * 5); //random time within 5 secs
			var delay = (this.updateIntervalSecs * 1000) + stagger;
					
			
			jQuery( this.selectorID() ).everyTime( delay, this.name, 
				function(){
					//leave if the refresher is disabled
					if( !Babynews.settings.REFRESH_ON ) return;
					
					var index = parseFloat( jQuery(this).attr("index") );
					Babynews.tags[ index ].ListManager.checkForUpdate();
					
				}
			);			
			
		}
		
					
		this.stopRefresh = function() {
			jQuery( this.selectorID() ).stopTime(this.name);
		}
		
		
		this.fetchData = function( ID ) {
			
			if( ID.pages == null) ID.pages = this.targetPagenum;
			
			var start =  0;
			if( ID.code == Babynews.settings.requestCodes.addPage ) start = this.targetPagenum * this.getNumItemsPerPage();
			var end = (ID.pages) * this.getNumItemsPerPage();
			
			this.requestIDs.push( ID );
			
			var sep = "&";
			
			var u = [this.url, sep, "start=", start, sep, "end=", end, sep, "contentLength=", this.numChars, sep, "ID=", ID.ID].join("");
			Babynews.fetchData(u, Babynews.megaMegaCallback);
			
			console.log( start + " " + end );
			
		}
		
		
		
		this.popID = function( ID ) {
			
			for( var i=0; i < this.requestIDs.length; i++ ) {
				if (this.requestIDs[i].ID == ID) {
					return this.requestIDs.splice( i, 1);
				}
			}
			
			return null;
		}
		
		
		this.storePost = function( post ) {
			this.list[i] = post;
		}
		
	
		 
		this.processList = function( requestID, jsondata ) {
			
			var ID = this.popID( requestID );
			if( ID == null ) return false;			
			ID = ID[0];
			
			var new_ago = -1;
			var new_updated = -1;
			
			var reason = parseInt( ID.code );
			var s = {};
			if( "stats" in jsondata ) { 
				s = jsondata["stats"]; 
				if( "numSources" in s )  this.stats.numSources = parseInt( s["numSources"] );
				if( "tag" in s )  this.stats.tag = s["tag"] ;
				if( "refreshed" in s )  this.stats.refreshed = parseFloat( s["refreshed"] );
				if ( "updated_posts" in s ) {
					new_updated = parseInt( s["updated_posts"] );
					new_ago = Math.abs( new_updated - (new Date().getTime()) );
				}
			}	
			
			if( reason == Babynews.settings.requestCodes.refreshCheck ) {
				//if we already have data and the list hasn't been updated, don't bother processing
				// if it's new then do a full refresh
				


				if ( new_updated == this.stats.updated_posts ) {
					return;
				} else {
					this.refreshAll();
				}
			}
			
			if( reason == Babynews.settings.requestCodes.addPage ) {
				
				//go through the post load	
				var pagenum = parseInt(ID.pages);
				var numAdded = ID.numAdded;
				
				var page_diff = [];
				var current_page = 0;
				var start = this.targetPagenum * this.getNumItemsPerPage();
				var end = (pagenum) * this.getNumItemsPerPage();
				
				for (var i = start; i < end; i++) {						
					if (String(i) in jsondata) {
						current_page = Math.floor( i / this.getNumItemsPerPage() );
						//decode						
						var item = jsondata[String(i)];
						item.post_title = ("post_title" in item ? jQuery.base64Decode(item["post_title"]) : "");
						item.blog_title = ("blog_title" in item ? jQuery.base64Decode(item["blog_title"]) : "");
						item.post_content = ("post_content" in item ? jQuery.base64Decode(item["post_content"]) : "");
						if (this.list[i] == null || this.list[i].key != item.key) {
							page_diff[current_page] = true;
						}
						this.list[i] = item;
					}
				}
				
				this.targetPagenum+=numAdded;

				this.repaginate( page_diff );
				ID.doneCallback(this, page_diff);
			}
			
			
			if( reason == Babynews.settings.requestCodes.start ) {
				
				var pagenum = parseInt(ID.pages);
			
				var page_diff = [];
				var current_page = 0;
				for (var i = 0; i < (pagenum * this.getNumItemsPerPage()+1); i++) {						
					if (String(i) in jsondata) {
						current_page = Math.floor( i / this.getNumItemsPerPage() );
						//decode						
						var item = jsondata[String(i)];
						item.post_title = ("post_title" in item ? jQuery.base64Decode(item["post_title"]) : "");
						item.blog_title = ("blog_title" in item ? jQuery.base64Decode(item["blog_title"]) : "");
						item.post_content = ("post_content" in item ? jQuery.base64Decode(item["post_content"]) : "");
						page_diff[current_page] = true;
						this.list[i] = item;
					}
				}
				
				this.repaginate( page_diff );
				ID.doneCallback(this, page_diff);
			}
			
			
			if (reason == Babynews.settings.requestCodes.update) {
			
				//go through the post load	
				var pagenum = parseInt(ID.pages);
			
				var page_diff = [];
				var current_page = 0;
				var newPosts = [];
				var updated_list = [];
				
				for (var i = 0; i < (this.targetPagenum * this.getNumItemsPerPage()); i++) {
					if (String(i) in jsondata) {
						//decode						
						var item = jsondata[String(i)];
												 
						if ( this.list[i] != null && this.list[i].key == item.key) { updated_list[i] = this.list[i]; continue; }
						current_page = Math.floor(i / this.getNumItemsPerPage());
						item.post_title = ("post_title" in item ? jQuery.base64Decode(item["post_title"]) : "");
						item.blog_title = ("blog_title" in item ? jQuery.base64Decode(item["blog_title"]) : "");
						item.post_content = ("post_content" in item ? jQuery.base64Decode(item["post_content"]) : "");

						if (this.list[i] == null || this.list[i].key != item.key) {
							page_diff[current_page] = true;
						}
						
						if (!this.containsPostKey(item.key) ) {
							/*var n = {};
							n.item = item;
							n.key = item.key;
							n.html = Babynews.getItemHTML( item, itemNum, pageNum );*/

							newPosts.push( { page: current_page, key: item.key } );
						}
						updated_list[i] = item;
					}
				}
				
				//make sure something changed before we update
				if (page_diff.length > 0) {
					this.list = updated_list;
					this.repaginate(page_diff);
					
					if( Babynews.showNewPosts(this, page_diff, newPosts) ) {}
					else { ID.doneCallback(this, page_diff, newPosts); }
				}			
				
			}
			
			this.stats.updated_posts = new_updated;
			
			//don't update the page, just the stats
			Babynews.updateStatsString();

			return true;
		}
				
	}
	
	
	Babynews.fetchData = function( URL, callback, type ) {
		 
		 	var refreshinterval = 0;
			
			var params = [];
			params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
			
			var ts = new Date().getTime();
			if (refreshinterval && refreshinterval > 0) {
				ts = Math.floor(ts / (refreshInterval * 1000));
			}
			
			var sep = "?";
			if (URL.indexOf("?") > -1) {
				sep = "&";
			}
						
			URL = [ URL, sep, "nocache=", ts ].join("");
			
			gadgets.io.makeRequest( URL, callback, params);
	}
	
	
	
	Babynews.megaMegaCallback = function( obj ) {	
		//call the processor!
		
		if (obj == null || obj.data == null ) {
			//Babynews.alertManager.waitRetry();
			return;
		}  
		
		var jsondata = obj.data;
		
		//find the list
		if( jsondata != null ) {
			var ID = ( "ID" in jsondata ) ? jsondata.ID : "";
			//see if the current LM has the obj first
			
			for (var i = 0; i < Babynews.tags.length; i++) {
				Babynews.tags[i].ListManager.processList(ID, jsondata);
			}
		}
	}
	
	
	
	Babynews.AlertManager = function() {
		this.noDataAttempts = 0;
		this.noReplyAttempts = 0;
		this.duration = 300;
		this.timer = {};
		this.fails = 0;
		this.tryAgainCallback = {};
		this.tagsFail = 0;
		this.topAlert = jQuery("#topAlert");
		
		
		var tagsContainer = jQuery('<div id="alertContainer" class="shrinkWrap page">');
		var alertBox = jQuery('<div id="pageAlert" class="alert">');
		var topDiv = jQuery('<div style="float: right;width: 75%">');
		alertBox.append('<img src="' + Babynews.settings.alertIconLarge  + '">' );
		topDiv.append('<p>We tried and tried, but couldn\'t connect to our servers.</p>');	
		topDiv.append('<p>We\'ll be back soon!</p>');	
		topDiv.append('<p id="tryAgainLink" class="tryAgainLink"> Keep Trying </p>');
		alertBox.css("opacity", 1.0);
		alertBox.append(topDiv);
		tagsContainer.append(alertBox);
		tagsContainer.css("opacity", 1.0);
		tagsContainer.css("z-index", "1")
		

		this.init = function() {
			//container.css( "top",  (Babynews.layoutManager.getPageHeight() + Babynews.settings.verticalPageSpacer) );
			//jQuery( Babynews.selectors.pageContainer ).append(container);
			
			this.topAlert.addClass("alert");
			this.topAlert.append('<span id="topAlertMessage">');
			
			var tryingBox = jQuery('<span class="trying" style="float:right;">');
			tryingBox.append('<span id="topAlertTrying">');	
			tryingBox.append('<span id="topAlertCountdown">');	
			tryingBox.append('<span id="topAlertTryAgain" class="tryAgainLink">');	
			this.topAlert.append(tryingBox);
			this.topAlert.hide();
								         
		}
		
		
		this.tagFail = function( callback ) {
			//set the try again button
			
			//show
			Babynews.alertManager.show();
			
			this.tryAgainCallback = callback;
		}
		
		
		this.showTopAlert = function( callback ) {
			
			var message = 'Unable to retrieve this list from puddleplay.com ';

			jQuery("#topAlertMessage").html(message);
			jQuery("#topAlertTrying").html(" Trying in: ");
			//jQuery("#topAlertCountdown").html("6s");
			jQuery("#topAlertTryAgain").html(" |  Try Now ");
			
			this.topAlert.fadeIn(this.duration);
		}
		
		
		this.show = function() {
			jQuery("#alertContainer").stop(true, true).animate({ top: 0 }, 1, 'easeInOutQuad', function(){});
			jQuery( "#tryAgainLink" ).live("click", function(){  Babynews.alertManager.hide( this.duration ); Babynews.alertManager.tryAgainCallback();} );
		}
	
		this.hide = function( ) {
			var away = (Babynews.layoutManager.getPageHeight() + Babynews.settings.verticalPageSpacer);
			jQuery("#alertContainer").stop(true, true).animate({ top: away }, Babynews.settings.verticalTransitionSpeed, 'easeInOutQuad', function(){});

			//Babynews.alertManager.attempts = 0;
			//if( duration == null || duration < 1 ) duration = 200;
			//jQuery( Babynews.selectors.alertBox.box ).fadeOut( duration );
		}
		
	}

	
	Babynews.refreshLayout = function(){
	       		
		var lm = Babynews.layoutManager;
	    lm.recalculate(); 
		
		//install the new sizes
       	var rules = " .shrinkWrap { height:" + lm.getPageHeight()  + "px;}" 		
		  +	" .shrinkWrap .page { height:" + lm.getPageHeight() + "px; width:" + lm.getPageWidth()  + "px;}" 		 
	 	  + " .post {height:" + lm.getBoxHeight() + "px; width:" + lm.getBoxWidth() + "px;}"
		  + " .post.first {width:" + lm.getFirstBoxWidth() + "px;} " 
		  + " #contentPane { height:" + lm.getPageHeight()  + "px;}";
		
	  
        var stylesheet = document.getElementById("blockSizeStyle");
		
        if (stylesheet.styleSheet) {
            stylesheet.styleSheet.cssText = rules;
        }
        else {
            jQuery(stylesheet).html(rules);
        }
	  
 	}
	
	
	Babynews.LayoutManager = function(){
	   
		this.minBoxWidth = 300;
		this.minBoxHeight = 200;
		
		this.boxWidth = this.minBoxWidth;
		this.boxHeight = this.minBoxHeight;
		
		this.pageWidth = 0;
		this.pageHeight = 0;
		
		this.headlineHeight = 0;
		this.contentHeight = 0;
		this.contentWidth = 0;
		this.headlineWidth = 0;
		
		this.headlineWidthPercent = 90;
		this.headlineHeightPercent = 25;
		
		this.contentWidthPercent = 80;
		this.contentHeightPercent = 30;
		
		//the number of pix to peek the next page on the right
		this.peek_offset = 0;
		
		//bottom navbar allowance
		this.bottomNavOffset = 0; //jQuery("bottomNav").height();
		
		this.rows = 0;
		this.columns = 0;
				
		this.getPageScrollOffset = function( pagenumber ) {
			this.recalculate();
			return ( -1 * pagenumber * ( this.pageWidth + Babynews.settings.horizontalPageSpacer ) );
		};


		this.recalculate = function(){
		
			var skimmer = jQuery( Babynews.selectors.skimmer );
			var content = jQuery( Babynews.selectors.contentPane );
		
			//var w = jQuery(window).width();
			//var h =  jQuery(window).height();
			
			var w = content.width();
			var h = skimmer.height();
			
			if( w == 0 ) w = jQuery(window).width();
			if( h == 0 ) h = jQuery(window).height();
			
			var layout = Babynews.settings.layoutSet[ Babynews.settings.layoutIndex ]; 
			
			this.columns = layout.columns;
			this.rows = layout.rows;
			
			this.pageWidth = w - this.peek_offset;
			//this.pageHeight = Math.min( jQuery(window).height(), content.height() );
			this.pageHeight = h - this.bottomNavOffset;
			
			this.boxWidth = Math.floor( this.pageWidth/this.columns );
			this.boxHeight = Math.floor( this.pageHeight/this.rows );	
		
			this.headlineWidth = this.boxWidth * ( this.headlineWidthPercent * .01);
			this.headlineHeight = this.boxHeight * ( this.headlineHeightPercent * .01);

			this.contentWidth = this.boxWidth * ( this.contentWidthPercent * .01);
			this.contentHeight = this.boxHeight * ( this.contentHeightPercent * .01);
			
			//this.contentWidth -= ( Babynews.settings.defaultImageWidth + 20 );
			
			return;
		};
		
		this.postSizeTooSmall = function() {
			var ts = (this.boxWidth < this.minBoxWidth);
			return ( ts );
		}
		
		this.postSizeTooBig = function() {
			var tb = (this.boxWidth * this.boxHeight) > ( (this.minBoxHeight * this.minBoxWidth) * 1.5 );
			return ( tb );
		}

	    this.getFirstBoxWidth = function(){
			return this.boxWidth * 2;
	    };

	    this.getBoxHeight = function(){
		    return this.boxHeight;
	    };
		
	    this.getBoxWidth = function(){
			return this.boxWidth;
	    };
		
		this.getPageWidth = function() {
			return this.pageWidth;
		};
		
		this.getPageHeight = function() {
			return this.pageHeight;
		};
		
		this.getNumColumns = function() {
			return this.columns;
		};
		
		this.getNumRows = function() {
			return this.rows;
		};
		
		this.getHeadlineHeight = function() {
			return this.headlineHeight;
		};
		
		this.getContentHeight = function() {
			return this.contentHeight;
		};
		
		this.getContentWidth = function() {
			return this.contentWidth;
		};
		
		this.getHeadlineWidth = function() {
			return this.headlineWidth;
		};
		
	}
	


	
    Babynews.getPageHTML = function( items, pagenum, ListManager ){
    		
        //start placing the items
        var html = [];
		
		//if there is no data, send back the Loading Page
		if( items == null || items.length == 0 ) return Babynews.LoadingPage; 
		 
        for (var i = 0; i < items.length; i++) {
			html.push( Babynews.getItemHTML( items[i], i, pagenum ) );
        };
        
		//set the first item to a random spot
		//var row = Math.floor( Math.random() * Babynews.layoutManager.getNumRows()/2  ) ;
		//var column = Math.floor( Math.random() * Babynews.layoutManager.getNumColumns()/2  ) ;
		//var new_index = row + ( column * Babynews.layoutManager.getNumColumns() );

		//set the item to either the first or middle spot		
		if (pagenum % 2 == 0 && ListManager.getNumItemsPerPage() >= 8) {
			var new_index = Math.ceil( Babynews.layoutManager.getNumColumns() + Babynews.layoutManager.getNumColumns() / 2 );
			html.splice(new_index, 0, html[0]);
			html.shift();
		}
		
		var ul = jQuery( "<ul> ");
		ul.addClass( "blocks grid" )

		for (var i = 0; i < html.length; i++) ul.append( html[i] )
		
		return ul;
		
    };
		


	
	Babynews.getItemHTML = function( item, itemNum, pageNum ) {
		  
		    itemHTML = "";
			var post = {};                         
			
			if( item == null ) item = {};
			
			post.flags =  ( "flags" in item ? item["flags"] : "" );
			var twitter = ( jQuery.inArray( "twitter", post.flags ) > -1 );
			var newPost = ( jQuery.inArray( "newPost", post.flags ) > -1 );
			var hasImage = ( jQuery.inArray( "image", post.flags ) > -1 );
			var first = (itemNum == 0 ? true : false);

			post.key = 				( "key" in item ? item["key"] : "" );
			post.post_url = 		( "post_url" in item ? item["post_url"] : "" );
			post.post_title = 		( "post_title" in item ? item["post_title"] : "" );
			post.image = 		    ( "image" in item ? item["image"] : "" );
			post.image_url =	 	Babynews.settings.POST_IMAGE_URL + post.key;
			post.image_tag =	 	jQuery( '<img src="' + post.image_url + '" width=' + post.image.w + ' height=' + post.image.h + '>' );
			post.blog_title = 		( "blog_title" in item ? item["blog_title"]  : "" );
			post.post_content = 	( "post_content" in item ? item["post_content"]  : "" );
			post.blog_url = 		( "blog_url" in item ? item["blog_url"] : "" );
			post.score = 			( "score" in item ? item["score"] : "" );
		   	post.post_date_ago =  	( "post_date_ago" in item ? item["post_date_ago"] : "" );
		   
			
			/*
			 * THE ELEMENTS
			 * 
			 * 
			 * 
			 */
			
			var postStyle = "post";
			if (first) postStyle += " first";
			
			var li = jQuery( '<li>' );
			li.addClass( postStyle );
			li.attr("page", pageNum);
			li.attr("item", itemNum);
			li.attr("key", post.key);
			
			//li.data("data", post);
			
            var container = 		jQuery( '<div class="container fill"> ');
			var content =  			jQuery( '<div class="content flip">' );
			var newPostImage = 			jQuery( Babynews.settings.newPostImage );
			
			//var backgroundImage = 	jQuery( '<div class="background"><img class="stretch" src="' + Babynews.settings.postBackgroundImage + '" /></div>' );        
			
			
			
			/*
			 * 
			 * HEADLINE
			 */ 
			//var twitterStyle = (twitter) ? " twitter " : " headline ";
			var headlineFix = (twitter) ? "" : " fixHeadlineText ";
			
			var spacer = jQuery("<div>").attr("class","spacer");
			
			var headline = jQuery(  ' <div class=" headline "> ' );		
			
			var cont = (twitter) ? post.blog_title : post.post_title;
			
			var headlineLink = jQuery( '<a class="headlineAnalytics ' + headlineFix  + '" href="' +  post.post_url + '" target="_blank">' +  cont + '</a>' );
			headlineLink.attr("blog", post.blog_title);
			headlineLink.attr("title", post.post_title);
			headline.append(headlineLink);
			
			
			
			/*
			 * 
			 * Image creation
			 */
			//var image = jQuery( post.image_tag );
			
			if (hasImage) {
				var imageStyle = "image";
				if (first) imageStyle += " first";
				
				var imageDiv = jQuery("<div>").addClass(imageStyle);
				//var imageLink = jQuery( '<a onClick="Babynews.imageOpen(event,' + pageNum + ',' + itemNum + ')"></a>' );
				//var imageDummy = jQuery("<div>").addClass("imageLoading").attr("id", "image_" + String(post.key) ).width(post.image.w).height(post.image.h);
				
				var img = new Image();
				jQuery(img).addClass("").attr("src", post.image_url).attr("key", "image_" + String(post.key)).load(function(){
					 // set the image hidden by default    
				      var me = $(this);
					  //me.hide();
					  //$(this).removeClass("imageLoading");
						//  var key = me.attr("key");
					 	// $("#" + key).replaceWith(this);				    
				      	// fade our image in to create a nice effect
				      	me.fadeIn("fast");
				}).width(post.image.w).height(post.image.h);

				
				//.css("width", post.image.w).css("height", post.image.h)
				
				var imageLink = jQuery('<a>');
				imageLink.addClass("imageAnalytics");
				imageLink.attr("href", post.image_url + "&fullsize=1");
				imageLink.attr("blog", post.blog_title);
				imageLink.attr("title", post.post_title);
				
				if (twitter) imageLink = jQuery('<a title="' + post.blog_title + '" href="' + post.blog_url + '" target="_blank"></a>');
				
				
				imageLink.append(img);
				imageDiv.append(imageLink);
				if (!twitter) 
				imageDiv.attr("onMouseOver", "Babynews.addFancybox(event)");
				imageDiv.attr("page", pageNum);
				imageDiv.attr("item", itemNum);
				
			}
			
		       

			/*
			 * 
			 * Posted
			 */
			var maxlength = 35;
			if( !hasImage ) maxlength = 80;
			if( first ) maxlength = 200; 
			var posted = {};
			var short_title = Babynews.trimText( post.blog_title, maxlength, "..." );
			if( post.blog_url != null && post.blog_url.length > 0)  posted = jQuery( '<div class="posted"><a class="blogAnalytics"  href="' + post.blog_url + '" target="_blank"> ' + (twitter ? "Twitter" : short_title) + '</a> - ' + Babynews.prettyDate(parseFloat(post.post_date_ago)) + '</div>' ); 
			else posted = jQuery( '<div class="posted">' + (twitter ? "Twitter" : short_title) + ' - ' + Babynews.prettyDate(parseFloat(post.post_date_ago)) + '</div>' ); 
			
			
			
			
			/*
			 * 
			 * Content
			 */
			var contentText = {};
			post.post_title = Babynews.linkify( post.post_title, false );

			if (twitter) contentText = jQuery('<p class="postContent">' + post.post_title + '</p>');
			else {
				
				contentText = jQuery('<div class="postContent">');
				
				var text = jQuery('<span class="fixContentText">' + post.post_content + '</span>');
				//var more = jQuery('<span class="moreLink"><a href="' + post.post_url + '" blog="' + post.blog_title + '" title="' + post.post_title + '" target="_blank"> read more</a></span>');
				var more = jQuery('<span class="moreLink sharePrompt"><div blog="' + post.blog_title + '" title="' + post.post_title + '" target="_blank">fast view &nbsp|</div></span>');
				
				//onClick="Babynews.moreClicked(event)" 
			 
			  	var prefs = {
			   		'imageScale'			: true,
					'padding'				: 15,
					'zoomOpacity'			: true,
					'zoomSpeedIn'			: 500,
					'zoomSpeedOut'			: 500,
					'zoomSpeedChange'		: 300,
					'overlayShow'			: true,
					'overlayColor'			: "#FFF",
					'overlayOpacity'		: 0.7,
					'enableEscapeButton'	: true,
					'showCloseButton'		: true,
					'hideOnOverlayClick'	: true,
					'hideOnContentClick'	: true,
					'width'					: 1024,
					'height'				: $(window).height(),
					'scrolling'				: 'yes' };
	
				prefs.type = "iframe";
				prefs.titleShow = false;
				prefs.href = post.post_url;
				
				//add fancybox to the link
				more.fancybox(prefs);

				contentText.append(text);  
				//contentText.append(more);  
				  
			}
			



			/*
			 * 
			 * SCORE
			 */
			var score = jQuery("<div>");
			score.css("position","absolute").css("top",0).css("right",8).css("color","#99CC00");
			score.html( '<small>' + post.score + '</small>' );



			/*
			 * 
			 * Sharing 
			 */
			var prompt =  jQuery("<div>Share</div>") ;
			prompt.attr("page", pageNum);
			prompt.attr("item", itemNum);
			prompt.addClass("sharePrompt");
			prompt.attr("onClick", "Babynews.flipIt(event)" );
			//prompt.click( Babynews.flipIt );
			
			
			
			/*
			 * BUILDING
			 */
            if( twitter ) {
				//build
				if( newPost ) content.append(newPostImage);
				if( Babynews.settings.SHOW_SCORE ) content.append( score );
				content.append(spacer);
				if( hasImage ) content.append( imageDiv );
				content.append( headline );
				content.append( posted );
				content.append( contentText );
				content.append( prompt );
				content.append( more );
			} else {
				//build
				if( newPost ) content.append(newPostImage);
				content.append( jQuery( "<div>" ).css("height", "4px") );
				content.append( headline );
				if( Babynews.settings.SHOW_SCORE ) content.append( score );		
				if( hasImage ) content.append( imageDiv );
				content.append( posted );	
				content.append( contentText );
				content.append( prompt );
				content.append( more );
			}
			
			container.append( content );
			li.append( container );
			
			return li;
	};
	
	
		
	Babynews.trimText = function( text, maxlength, append) {
			
			if ( text.length > maxlength ) {
				text = text.substring(0, maxlength);
				//trim to the last word
				var position = text.length;
				while (text.substr(--position, 1) != " ") { };
				while (!/[A-Za-z]/.test(text.substr(position - 1, 1))) { --position; }
				text = text.substring(0,position) + append;
			} 
			
			return text;
	}
	
	
	Babynews.addFancybox = function(event) {
			
		if (event && event.preventDefault) event.preventDefault();
		if (event && event.stopPropagation) event.stopPropagation();
		else event.cancelBubble=true;
		
		var elem = {};
		
		if (event.target) elem = jQuery(event.target).parent();
		else if (event.srcElement) elem = jQuery(event.srcElement).parent();
		
		
		var settings = Babynews.settings.facyboxPrefs;
		settings.type = "image";
		settings.titlePosition = "inside";
		settings.orig = elem;
		
		settings.titleFormat = function(){  
			var data = Babynews.currentTag.ListManager.getPostDatabyKey( elem.parents("li").attr("key") );
			return jQuery("<div>").attr("id","fancyboxShare").html( Babynews.sharing.getUI(data, true) );
		};
		
		//add fancybox to the link
		elem.fancybox(settings);
	};
	
	
	Babynews.flipIt = function(e) {
		
		var targ;
		if (!e) var e = window.event;
		if (e.target) targ = e.target;
		else if (e.srcElement) targ = e.srcElement;
 		
		var target = jQuery(targ);
		
		var data = Babynews.currentTag.ListManager.getPostDatabyKey( target.parents("li").attr("key")  );
												
		target.parents(".flip").flip({
			direction:'lr',
			speed: 220,
			content: function(){ return Babynews.sharing.getUI(data) },
			color: "#F0F0F0",
			onEnd: function( ) { 
						jQuery(".facebookAnalytics").click( function(e){
								if( Babynews.ga ) Babynews.ga.reportEvent("Sharing", "on Facebook", e.target.href);
						} );
											
						jQuery(".twitterAnalytics").click( function(e){
								if( Babynews.ga ) Babynews.ga.reportEvent("Sharing", "on Twitter", e.target.href);
						} );
						
						//make the +1 button go
						if(gapi) gapi.plusone.go();

					}
		});		
		
		if( Babynews.ga ) Babynews.ga.reportEvent("Sharing", "Share Opened", data.blog_title + " : " + data.post_title );
	};
	
	
	
	Babynews.sharing = {
		
		getUI : function( post, standalone ){
			//get the UI for the 
			var overlay = jQuery( '<div>' );
			overlay.addClass( "overlay" );
			overlay.attr("id", "overlay");
			overlay.css('visibility',"visible");
			
			var shareBox = jQuery('<div>');
			shareBox.addClass("shareBox");
			
			if (standalone) {
				shareBox.addClass("shareBoxFloating");
				var w = 280;
				var h = 200;
				shareBox.css('width', w);
				shareBox.css('height', h);
				shareBox.css('right', (w * -1) - 30);
				shareBox.css('top', (h * -1) + 60 );
				//shareBox.css('margin-left', w/2 * -1);
				//shareBox.css('margin-top', h/2 * -1);
				//shareBox.css('position', "absolute");
			}
			
			
			
			
			var twitter = ( jQuery.inArray( "twitter", post.flags ) > -1 );

			// put in a fake title
			var title = jQuery("<div>");
			title.addClass("shareTitle");
			title.html(  Babynews.trimText( post.post_title, 65, "..." ) );
		
			
			var postBox = jQuery('<div>');
			postBox.attr("key", post.key);
			postBox.addClass("shareGroup");
			postBox.append('<span class="shareGroupLabel" style="color: #D40000">Post</span>');
			
			
			/* Old Stuff */
			
			/*
			
			var face =  jQuery( '<div class="shareItem"> <a class="facebookAnalytics" name="fb_share" type="icon_link" share_url="' + post.post_url + '" href="http://www.facebook.com/sharer.php">Facebook</a><script src="http://static.ak.fbcdn.net/connect.php/js/FB.Share" type="text/javascript"></script> </div>' );
			
			//new FB thing
			//var face =  jQuery(  '<div class="shareItem"><iframe src="http://www.facebook.com/plugins/like.php?href=' + post.post_url + '&amp;send=false&amp;layout=standard&amp;width=100&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font=lucida+grande&amp;height=35" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:100px; height:35px;" allowTransparency="true"></iframe></div>');
			
			var twit =  jQuery( '<div class="shareItem"> <a class="twitterAnalytics" href="' + post.post_url + '" target="_blank"><span class="twitterbutton"><span class="twitterShare">Twitter</span></span></a> </div>' );
			
			///var twitterCB = function(p, element, link){ 
										
										var title = post.post_title;
										var url = title + " " + post.short + " on http://puddleplay.com/news"; 
										var position = title.length;
										var element = twit.find("a");
										
										while (url.length > 140) {
											while (title.substr(--position, 1) != " ") { };
											//trim to the last word
											while (!/[A-Za-z]/.test(title.substr(position - 1, 1))) { position--; }
											url = title.substr(0, position) + "... " + link + " on http://puddleplay.com/news";
										}
										
										//try to add hashtags if we have enough room
										for( var i=0; i < Babynews.settings.hashtags.length; i++ ) {
											var tag = "+" + Babynews.settings.hashtags[i];
											
											if( url.length + tag.length <= 140 ) url += escape(tag);
										}
										
										url = "http://twitter.com/home?status=" + url;
										element.attr("href",url);
			//						};
									
			
			//Babynews.bitly.shortenURL( post, twit.find("a"), twitterCB );
			
			postBox.append( face );
			postBox.append( twit );
			
			*/
			

			
			/* NEW Stuff */
						
			
			var postBox = $('<div>').attr("key", post.key).addClass("shareGroup redBox").append('<span class="shareGroupLabel">Post</span>');
			
			var g_template = '<div class="shareItem">' +
								'<div class="g-plusone" data-size="tall" data-annotation="none" data-href="{{post_url}}"></div>' +
							  '</div>';
							  		
			var t_template = '<div class="shareItem">' +
								'<a title="tweet this post" class="twitter-share-button twitterAnalytics" data-url="{{post_url}}" data-text="{{post_title}} {{ hashtags}}" data-via="puddleplay" data-count="none"> Tweet </a>' +
							  '</div>';
							  
			var f_template = '<div class="shareItem"><iframe src="http://www.facebook.com/plugins/like.php?app_id=144280505652580&amp;href={{post_url}}&amp;send=false&amp;layout=button_count&amp;width=53&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp" scrolling="no" frameborder="0" style="border:none;overflow:hidden;width:53px;height:21px;" allowTransparency="true"></iframe></div>'
			
			post.hashtags = Babynews.settings.hashtags.join(" ");
							  
			postBox.append( Babynews.Mustache.to_html( g_template, post ) );
			postBox.append( Babynews.Mustache.to_html( t_template, post ) );
			postBox.append( Babynews.Mustache.to_html( f_template, post ) );
			
			
			var tw_script = document.createElement('script');
			tw_script.setAttribute( 'src', 'http://platform.twitter.com/widgets.js' );
			postBox.append(tw_script);
			
			var fb_script = document.createElement('script');
			fb_script.setAttribute( 'src', 'http://static.ak.fbcdn.net/connect.php/js/FB.Share' );
			postBox.append(fb_script);
			
			//var p1_script = document.createElement('script');
			//p1_script.setAttribute( 'src', 'https://apis.google.com/js/plusone.js' );
			//postBox.append(p1_script);
			
				
				
			
			
			
			var emailBox = jQuery('<div>');
			emailBox.attr("id", "emailGroup");
			emailBox.addClass("shareGroup");
			emailBox.append('<span class="shareGroupLabel" >Email</span>');
			
			emailBox.append( Babynews.email.getUI( post.key ) );
			
			var linkBox = jQuery('<div>');
			linkBox.attr("key", post.key);
			linkBox.attr("id", "linkBox_" + post.key );
			linkBox.addClass("shareGroup");
			linkBox.append('<span class="shareGroupLabel" >Link</span>');
			
			//var linkClick = jQuery(Babynews.LoadingSpinner).attr("width", 12).attr("height", 12);
			
			
			//var linkCB = function(p, element, link) { 
						
			linkBox.append( '<input id="link_' + post.key + '" readonly=true type=text class="shareInput bitlyInput" value="' + post.short + '">' );
			
			/*
			var clip = new ZeroClipboard.Client();
				clip.addEventListener( 'complete', function(client, text) {
                     //   alert("Copied text to clipboard: " + text );
						var copied = jQuery('<span style="font-weight:bold; color:#00BBDD; font-size:14px;"> copied </span>');
						jQuery(client.domElement).parent().append( copied.fadeIn(400, function(){ jQuery(this).fadeOut(400); } ) );
						jQuery(client.domElement).select();
                } );
			
            clip.glue( "link_" + post.key, "linkBox_" + post.key );
            clip.setText( link );
            
			
			if(Babynews.clipboardObjects == null) Babynews.clipboardObjects = new Array();
			var obj = { key: post.key, client: clip }; 
			Babynews.clipboardObjects.push( obj );
            */
			//		};
									
			//Babynews.bitly.shortenURL( post, linkClick , linkCB );
			

			shareBox.append(title);
			shareBox.append(postBox);
			shareBox.append(emailBox);
			shareBox.append(linkBox);
			
			var prompt =  jQuery("<div>close</div>") ;
			prompt.addClass("sharePrompt");
			prompt.click( function(event){ 
						//need to stop the event because this prompt gets confused with the "share" prompt to open.
						if(event && event.preventDefault) event.preventDefault();
						if(event && event.stopPropagation) event.stopPropagation();
						else event.cancelBubble=true;
						
						var element = jQuery(event.target);
						element.parents(".flip").revertFlip();
						element.parents("#fancyboxShare").remove(); 
						
						//get rid of the clipboard object
						var k = element.parents("li").attr("key");
						for( var index in Babynews.clipboardObjects ) {
							if( Babynews.clipboardObjects[index].key == k  ) {
								match = Babynews.clipboardObjects.splice(index, 1)[0];
								match.client.destroy();
							}
						}

					 } );
					 
			
			shareBox.append(prompt);
			
			//a container to hold it all
			var share = jQuery("<div>");
			share.attr("id", "sharing");
			share.css("vertical-align", "middle");
			//share.append(overlay);
			share.append(shareBox);
			return share;
		}
		
	}

	
	
	Babynews.email = {
		
		sendEmail : function(e) {
			e.preventDefault();
			
			var container = jQuery(e.target).parents("#emailUI");
			
			var k = jQuery(this).find("input:hidden[name=key]").val();
			
			//save this request
			if( Babynews.email.requests == null ) Babynews.email.requests = new Array();
			var req = { key: k , target: container };	
			Babynews.email.requests.push( req );
			  
			var URL = Babynews.settings.EMAIL_URL + "&" + jQuery(this).serialize();
			Babynews.fetchData( URL, Babynews.email.emailResponse );
			
			container.html( Babynews.makeLoadingPage("Sending") );
		},
		
		emailResponse : function(obj) {
			
			if(obj == null || obj.data == null) return;
			
			var key, status, error, title, blog = "";
			if( "key" in obj.data ) key = obj.data.key;
			if( "status" in obj.data ) status = obj.data.status;
			if( "title" in obj.data ) title = obj.data.title;
			if( "blog" in obj.data ) blog = obj.data.blog;
			if( "error" in obj.data ) error = obj.data.error;
						
			var match = null;
			for (var index in Babynews.email.requests) {
				if (Babynews.email.requests[index].key == key) {
					match = Babynews.email.requests.splice(index, 1)[0];
					break;
				}				
	        }
			
			if(match != null) {
				var container = match.target;
				
				if (status == "ERROR") {
					var err = jQuery("<div>");
					err.attr("id", "emailAlert").addClass("shareAlertBox").addClass("email");
					if( "error" in obj.data ) err.html( "<p>" + error + "</p>" );
					
					var tryAgain = jQuery("<div>").addClass("alertButton").html( Babynews.email.strings.errorButton );
					err.append(tryAgain);
					container.html( err );
				}
				else {
					var success = jQuery("<div>");
					success.attr("id", "emailSuccess").addClass("shareAlertBox").addClass("email");;
					success.html( jQuery("<p>").append( Babynews.email.strings.sendSuccessText ) );

					var tryAgain = jQuery("<div>").addClass("alertButton").html( Babynews.email.strings.sendSuccessButton );
					success.append(tryAgain);
					container.html( success );
					
					if( Babynews.ga ) Babynews.ga.reportEvent("Sharing", "email sent", blog + " : " + title );

				}
				
				tryAgain.click( function(event){ 
													var c = jQuery(event.target).parents("#emailUI"); 
													c.fadeOut(300, function(){ jQuery(this).replaceWith( Babynews.email.getUI( jQuery(this).attr("key") ) );} );
												} );
			}
		},
		
		strings : {
			errorButton: "Try sending again",
			sendSuccessText: "Your email has been sent.",
			sendSuccessButton: "OK",
			senderPrompt: "your name or email",
			recipientPrompt: "recipient's email"
		},
		
		getUI : function( key ) {
			var emailUI = jQuery("<div>");
			emailUI.attr("id", "emailUI");
			emailUI.attr("key", key);
			
			var FORM = jQuery('<form>').attr("id", "emailForm");
			var from = jQuery("<input>").addClass("shareInput").attr("type", "text").val( Babynews.email.strings.senderPrompt ).attr("name", "from");
			var to = jQuery("<input>").addClass("shareInput").attr("type", "text").val(  Babynews.email.strings.recipientPrompt ).attr("name", "to");
			var key = jQuery("<input>").attr("type", "hidden").val( key ).attr("name", "key");			
			var send = jQuery("<input>").attr("type", "submit").val("send").attr("id", "submit");
			
			from.focus( function(e){  if( this.value == Babynews.email.strings.senderPrompt ) this.value = "";  } );
			to.focus( function(e){  if( this.value == Babynews.email.strings.recipientPrompt ) this.value = "";  } );
			
			FORM.append(from);
			FORM.append(to);
			FORM.append(key);
			//FORM.append("<br>");
			FORM.append(send);
			FORM.submit( Babynews.email.sendEmail );

			emailUI.append(FORM);
			
			return emailUI;
		}
		
	};
	
	
	
	Babynews.bitly = {
	   
	    shortenURL : function(post, element, cb) {
			//save this request
			if( Babynews.bitly.requests == null ) Babynews.bitly.requests = new Array();
						
			var req = { post: post , callback: cb, element: element };	
			Babynews.bitly.requests.push(req);
			
			Babynews.bitly.send(req);
	    },
		
		send : function(req) {
	        BitlyClient.shorten(req.post.post_url, 'Babynews.bitly.response');
		},
	   
	    response : function(data) {
	        var match = null;
			if(data == null || data.results == null) return;
						
	        for (var index in Babynews.bitly.requests) {
				if (Babynews.bitly.requests[index].post.post_url in data.results) {
					//bitly_link = data.results[req.url]['shortUrl']; 
					match = Babynews.bitly.requests.splice(index, 1)[0];
					break;
				}				
	        }
			var short_link = data.results[match.post.post_url]['shortUrl']; 
			
			if(match.callback != null) match.callback(match.post, match.element, short_link);
		}
		
	};
	
	
	
	
	Babynews.linkify = function(inputText, twitter) {
	  
	    var replacedText = "";
	  
	    //URLs starting with http://, https://, or ftp://
	    var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
		
		if( !twitter ) replacedText = inputText.replace(replacePattern1, '<span class="inlineLink"><a class="inlineLink" href="$1" target="_blank">$1</a></span>');
		else replacedText = inputText.replace(replacePattern1, '<a class="moreLink" href="$1" target="_blank">more</a>');
	
	    //URLs starting with www. (without // before it, or it'd re-link the ones done above)
	    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		if( !twitter ) replacedText = replacedText.replace(replacePattern2, '<span class="inlineLink">$1<a href="http://$2" target="_blank">$2</a></span>');
		else replacedText = replacedText.replace(replacePattern2, '<a class="moreLink" href="http://$2" target="_blank">more</a>');
	
	    return replacedText
	};
	
	
	Babynews.makeRefer = function( link )  {
		return Babynews.settings.BASE_URL + "refer=" + link;
	}
	
		
	Babynews.moreClicked = function(e){ 
			var targ;
			if (!e) var e = window.event;
			if (e.target) targ = e.target;
			else if (e.srcElement) targ = e.srcElement;
				
			//var url = jQuery(targ).attr("url");
			var title = jQuery(targ).attr("title");
			var blog = jQuery(targ).attr("blog");
			if( Babynews.ga ) Babynews.ga.reportEvent("Post Click", "More", blog + " : " + title );	
	 };
	
	
	
	/*** trimtoRect: trim text to a rectangle 15:24 01.05.2005 ******************** 
	** width, height: dimensions of target rect (must be pixel value for height); 
	** str: string to trim 
	** strApp: string to append (e.g., "..." or "... (show more)") 
	** strClass: css class to use (leave empty for body style) 
	** btrimtoWords: prevents in-word trimming 
	** bAlwaysAppend: strApp is always appended, even when text fits in rect. 
	******************************************************************************/ 
	Babynews.trimtoRect2 = function( element, w, h, strApp, btrimtoWords, bAlwaysAppend, data) { 
	
		if( element == null || element.length < 1 ) return;
		var str = element.text();	
		var append = "";
		
		//see what type of element we're dealing with
		var isHeadline = element.hasClass("fixHeadlineText");
		var isContent = element.hasClass("fixContentText");
		//var already_trimmed = (element.attr("trimmed") == "true");
				
		//if(isHeadline) str = element.text();
		//if(isContent) str = data.post_content;
		
		var strResult = str;
		if(bAlwaysAppend) strResult = str + strApp; 
	
		element.html(strResult);
		
		var hh = element.outerHeight();
		
		if (element.outerHeight() > h) {
						
			var position =  Math.pow(2, Math.floor(Math.log(str.length) / Math.LN2));
			var nextoffset = position;
			
			do {
				nextoffset = nextoffset / 2;
				element.html( str.substr(0, position) + strApp );
				position = position + (element.outerHeight() > h ? -nextoffset : nextoffset);
			} while (nextoffset >= 1);
			
			//element.innerHTML = str.substr(0, position) + strApp;
			//if(element.clientHeight > h) position--; 
			
			if (btrimtoWords) {
				while (str.substr(--position, 1) != " " && position >= 0) { };
				//trim to the last word
				while (!/[A-Za-z]/.test(str.substr(position - 1, 1)) && position >= 0 ) { position--; }
			}
			
			append += strApp;
			
			str = str.substr(0, position);
		}
		
		//str = Babynews.linkify( str, false );
				
		str += append; 
		element.html(str);
				
		return;
		
	} 
	

	
	/*
	 * JavaScript Pretty Date
	 * Copyright (c) 2008 John Resig (jquery.com)
	 * Licensed under the MIT license.
	 */
	Babynews.prettyDate = function(diff){
			diff = diff / 1000;
			var day_diff = Math.floor(diff / 86400);
				
		if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 365 )
			return;
				
		return day_diff == 0 && (
				diff < 60 && "less than 1 minute ago" ||
				diff < 120 && "about 1 minute ago" ||
				diff < 3600 && "about " + Math.floor( diff / 60 ) + " minutes ago" ||
				diff < 7200 && "about 1 hour ago" ||
				diff < 86400 && "about " + Math.floor( diff / 3600 ) + " hours ago") ||
			day_diff == 1 && "Yesterday" ||
			day_diff < 7 && day_diff + " days ago" ||
			day_diff < 365 && Math.ceil( day_diff / 7 ) + " weeks ago"; 
	}

	
	
	
	
	
	Babynews.loadPlugins = function() {
	
			
		/*
		 * $ UI Effects 1.8.2
		 *
		 * Copyright (c) 2010 AUTHORS.txt (http://$ui.com/about)
		 * Dual licensed under the MIT (MIT-LICENSE.txt)
		 * and GPL (GPL-LICENSE.txt) licenses.
		 *
		 * http://docs.$.com/UI/Effects/
		 */
		$.effects||function(f){function k(c){var a;if(c&&c.constructor==Array&&c.length==3)return c;if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(c))return[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10)];if(a=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(c))return[parseFloat(a[1])*2.55,parseFloat(a[2])*2.55,parseFloat(a[3])*2.55];if(a=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(c))return[parseInt(a[1],
		16),parseInt(a[2],16),parseInt(a[3],16)];if(a=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(c))return[parseInt(a[1]+a[1],16),parseInt(a[2]+a[2],16),parseInt(a[3]+a[3],16)];if(/rgba\(0, 0, 0, 0\)/.exec(c))return l.transparent;return l[f.trim(c).toLowerCase()]}function q(c,a){var b;do{b=f.curCSS(c,a);if(b!=""&&b!="transparent"||f.nodeName(c,"body"))break;a="backgroundColor"}while(c=c.parentNode);return k(b)}function m(){var c=document.defaultView?document.defaultView.getComputedStyle(this,null):this.currentStyle,
		a={},b,d;if(c&&c.length&&c[0]&&c[c[0]])for(var e=c.length;e--;){b=c[e];if(typeof c[b]=="string"){d=b.replace(/\-(\w)/g,function(g,h){return h.toUpperCase()});a[d]=c[b]}}else for(b in c)if(typeof c[b]==="string")a[b]=c[b];return a}function n(c){var a,b;for(a in c){b=c[a];if(b==null||f.isFunction(b)||a in r||/scrollbar/.test(a)||!/color/i.test(a)&&isNaN(parseFloat(b)))delete c[a]}return c}function s(c,a){var b={_:0},d;for(d in a)if(c[d]!=a[d])b[d]=a[d];return b}function j(c,a,b,d){if(typeof c=="object"){d=
		a;b=null;a=c;c=a.effect}if(f.isFunction(a)){d=a;b=null;a={}}if(f.isFunction(b)){d=b;b=null}if(typeof a=="number"||f.fx.speeds[a]){d=b;b=a;a={}}a=a||{};b=b||a.duration;b=f.fx.off?0:typeof b=="number"?b:f.fx.speeds[b]||f.fx.speeds._default;d=d||a.complete;return[c,a,b,d]}f.effects={}; f.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(c,a){f.fx.step[a]=function(b){if(!b.colorInit){b.start=q(b.elem,a);b.end=k(b.end);b.colorInit=true}b.elem.style[a]="rgb("+Math.max(Math.min(parseInt(b.pos*(b.end[0]-b.start[0])+b.start[0],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[1]-b.start[1])+b.start[1],10),255),0)+","+Math.max(Math.min(parseInt(b.pos*(b.end[2]-b.start[2])+b.start[2],10),255),0)+")"}}); var l={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,
		183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,
		165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]},o=["add","remove","toggle"],r={border:1,borderBottom:1,borderColor:1,borderLeft:1,borderRight:1,borderTop:1,borderWidth:1,margin:1,padding:1};f.effects.animateClass=function(c,a,b,d){if(f.isFunction(b)){d=b;b=null}return this.each(function(){var e=f(this),g=e.attr("style")||" ",h=n(m.call(this)),p,t=e.attr("className");f.each(o,function(u,
		i){c[i]&&e[i+"Class"](c[i])});p=n(m.call(this));e.attr("className",t);e.animate(s(h,p),a,b,function(){f.each(o,function(u,i){c[i]&&e[i+"Class"](c[i])});if(typeof e.attr("style")=="object"){e.attr("style").cssText="";e.attr("style").cssText=g}else e.attr("style",g);d&&d.apply(this,arguments)})})};f.fn.extend({_addClass:f.fn.addClass,addClass:function(c,a,b,d){return a?f.effects.animateClass.apply(this,[{add:c},a,b,d]):this._addClass(c)},_removeClass:f.fn.removeClass,removeClass:function(c,a,b,d){return a?
		f.effects.animateClass.apply(this,[{remove:c},a,b,d]):this._removeClass(c)},_toggleClass:f.fn.toggleClass,toggleClass:function(c,a,b,d,e){return typeof a=="boolean"||a===undefined?b?f.effects.animateClass.apply(this,[a?{add:c}:{remove:c},b,d,e]):this._toggleClass(c,a):f.effects.animateClass.apply(this,[{toggle:c},a,b,d])},switchClass:function(c,a,b,d,e){return f.effects.animateClass.apply(this,[{add:a,remove:c},b,d,e])}});f.extend(f.effects,{version:"1.8.2",save:function(c,a){for(var b=0;b<a.length;b++)a[b]!==
		null&&c.data("ec.storage."+a[b],c[0].style[a[b]])},restore:function(c,a){for(var b=0;b<a.length;b++)a[b]!==null&&c.css(a[b],c.data("ec.storage."+a[b]))},setMode:function(c,a){if(a=="toggle")a=c.is(":hidden")?"show":"hide";return a},getBaseline:function(c,a){var b;switch(c[0]){case "top":b=0;break;case "middle":b=0.5;break;case "bottom":b=1;break;default:b=c[0]/a.height}switch(c[1]){case "left":c=0;break;case "center":c=0.5;break;case "right":c=1;break;default:c=c[1]/a.width}return{x:c,y:b}},createWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent();
		var a={width:c.outerWidth(true),height:c.outerHeight(true),"float":c.css("float")},b=f("<div></div>").addClass("ui-effects-wrapper").css({fontSize:"100%",background:"transparent",border:"none",margin:0,padding:0});c.wrap(b);b=c.parent();if(c.css("position")=="static"){b.css({position:"relative"});c.css({position:"relative"})}else{f.extend(a,{position:c.css("position"),zIndex:c.css("z-index")});f.each(["top","left","bottom","right"],function(d,e){a[e]=c.css(e);if(isNaN(parseInt(a[e],10)))a[e]="auto"});
		c.css({position:"relative",top:0,left:0})}return b.css(a).show()},removeWrapper:function(c){if(c.parent().is(".ui-effects-wrapper"))return c.parent().replaceWith(c);return c},setTransition:function(c,a,b,d){d=d||{};f.each(a,function(e,g){unit=c.cssUnit(g);if(unit[0]>0)d[g]=unit[0]*b+unit[1]});return d}});f.fn.extend({effect:function(c){var a=j.apply(this,arguments);a={options:a[1],duration:a[2],callback:a[3]};var b=f.effects[c];return b&&!f.fx.off?b.call(this,a):this},_show:f.fn.show,show:function(c){if(!c||
		typeof c=="number"||f.fx.speeds[c])return this._show.apply(this,arguments);else{var a=j.apply(this,arguments);a[1].mode="show";return this.effect.apply(this,a)}},_hide:f.fn.hide,hide:function(c){if(!c||typeof c=="number"||f.fx.speeds[c])return this._hide.apply(this,arguments);else{var a=j.apply(this,arguments);a[1].mode="hide";return this.effect.apply(this,a)}},__toggle:f.fn.toggle,toggle:function(c){if(!c||typeof c=="number"||f.fx.speeds[c]||typeof c=="boolean"||f.isFunction(c))return this.__toggle.apply(this,
		arguments);else{var a=j.apply(this,arguments);a[1].mode="toggle";return this.effect.apply(this,a)}},cssUnit:function(c){var a=this.css(c),b=[];f.each(["em","px","%","pt"],function(d,e){if(a.indexOf(e)>0)b=[parseFloat(a),e]});return b}});f.easing.jswing=f.easing.swing;f.extend(f.easing,{def:"easeOutQuad",swing:function(c,a,b,d,e){return f.easing[f.easing.def](c,a,b,d,e)},easeInQuad:function(c,a,b,d,e){return d*(a/=e)*a+b},easeOutQuad:function(c,a,b,d,e){return-d*(a/=e)*(a-2)+b},easeInOutQuad:function(c,
		a,b,d,e){if((a/=e/2)<1)return d/2*a*a+b;return-d/2*(--a*(a-2)-1)+b},easeInCubic:function(c,a,b,d,e){return d*(a/=e)*a*a+b},easeOutCubic:function(c,a,b,d,e){return d*((a=a/e-1)*a*a+1)+b},easeInOutCubic:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a+b;return d/2*((a-=2)*a*a+2)+b},easeInQuart:function(c,a,b,d,e){return d*(a/=e)*a*a*a+b},easeOutQuart:function(c,a,b,d,e){return-d*((a=a/e-1)*a*a*a-1)+b},easeInOutQuart:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a+b;return-d/2*((a-=2)*a*a*a-2)+
		b},easeInQuint:function(c,a,b,d,e){return d*(a/=e)*a*a*a*a+b},easeOutQuint:function(c,a,b,d,e){return d*((a=a/e-1)*a*a*a*a+1)+b},easeInOutQuint:function(c,a,b,d,e){if((a/=e/2)<1)return d/2*a*a*a*a*a+b;return d/2*((a-=2)*a*a*a*a+2)+b},easeInSine:function(c,a,b,d,e){return-d*Math.cos(a/e*(Math.PI/2))+d+b},easeOutSine:function(c,a,b,d,e){return d*Math.sin(a/e*(Math.PI/2))+b},easeInOutSine:function(c,a,b,d,e){return-d/2*(Math.cos(Math.PI*a/e)-1)+b},easeInExpo:function(c,a,b,d,e){return a==0?b:d*Math.pow(2,
		10*(a/e-1))+b},easeOutExpo:function(c,a,b,d,e){return a==e?b+d:d*(-Math.pow(2,-10*a/e)+1)+b},easeInOutExpo:function(c,a,b,d,e){if(a==0)return b;if(a==e)return b+d;if((a/=e/2)<1)return d/2*Math.pow(2,10*(a-1))+b;return d/2*(-Math.pow(2,-10*--a)+2)+b},easeInCirc:function(c,a,b,d,e){return-d*(Math.sqrt(1-(a/=e)*a)-1)+b},easeOutCirc:function(c,a,b,d,e){return d*Math.sqrt(1-(a=a/e-1)*a)+b},easeInOutCirc:function(c,a,b,d,e){if((a/=e/2)<1)return-d/2*(Math.sqrt(1-a*a)-1)+b;return d/2*(Math.sqrt(1-(a-=2)*
		a)+1)+b},easeInElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g))+b},easeOutElastic:function(c,a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e)==1)return b+d;g||(g=e*0.3);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*a)*Math.sin((a*e-c)*2*Math.PI/g)+d+b},easeInOutElastic:function(c,
		a,b,d,e){c=1.70158;var g=0,h=d;if(a==0)return b;if((a/=e/2)==2)return b+d;g||(g=e*0.3*1.5);if(h<Math.abs(d)){h=d;c=g/4}else c=g/(2*Math.PI)*Math.asin(d/h);if(a<1)return-0.5*h*Math.pow(2,10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)+b;return h*Math.pow(2,-10*(a-=1))*Math.sin((a*e-c)*2*Math.PI/g)*0.5+d+b},easeInBack:function(c,a,b,d,e,g){if(g==undefined)g=1.70158;return d*(a/=e)*a*((g+1)*a-g)+b},easeOutBack:function(c,a,b,d,e,g){if(g==undefined)g=1.70158;return d*((a=a/e-1)*a*((g+1)*a+g)+1)+b},easeInOutBack:function(c,
		a,b,d,e,g){if(g==undefined)g=1.70158;if((a/=e/2)<1)return d/2*a*a*(((g*=1.525)+1)*a-g)+b;return d/2*((a-=2)*a*(((g*=1.525)+1)*a+g)+2)+b},easeInBounce:function(c,a,b,d,e){return d-f.easing.easeOutBounce(c,e-a,0,d,e)+b},easeOutBounce:function(c,a,b,d,e){return(a/=e)<1/2.75?d*7.5625*a*a+b:a<2/2.75?d*(7.5625*(a-=1.5/2.75)*a+0.75)+b:a<2.5/2.75?d*(7.5625*(a-=2.25/2.75)*a+0.9375)+b:d*(7.5625*(a-=2.625/2.75)*a+0.984375)+b},easeInOutBounce:function(c,a,b,d,e){if(a<e/2)return f.easing.easeInBounce(c,a*2,0,
		d,e)*0.5+b;return f.easing.easeOutBounce(c,a*2-e,0,d,e)*0.5+d*0.5+b}})}($);
				
	
	
	
			/* FLIP! */
			eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(5($){5 H(a){a.1D.1f[a.1E]=1F(a.1G,10)+a.1H}6 j=5(a){1I({1J:"1g.Z.1K 1L 1M",1N:a})};6 k=5(){7(/*@1O!@*/11&&(1P 1Q.1h.1f.1R==="1S"))};6 l={1T:[0,4,4],1U:[1i,4,4],1V:[1j,1j,1W],1X:[0,0,0],1Y:[0,0,4],1Z:[1k,1l,1l],20:[0,4,4],21:[0,0,A],22:[0,A,A],23:[12,12,12],24:[0,13,0],26:[27,28,1m],29:[A,0,A],2a:[2b,1m,2c],2d:[4,1n,0],2e:[2f,2g,2h],2i:[A,0,0],2j:[2k,2l,2m],2n:[2o,0,R],2p:[4,0,4],2q:[4,2r,0],2s:[0,t,0],2t:[2u,0,2v],2w:[1i,1o,1n],2x:[2y,2z,1o],2A:[1p,4,4],2B:[1q,2C,1q],2D:[R,R,R],2E:[4,2F,2G],2H:[4,4,1p],2I:[0,4,0],2J:[4,0,4],2K:[t,0,0],2L:[0,0,t],2M:[t,t,0],2N:[4,1k,0],2O:[4,S,2P],2Q:[t,0,t],2R:[t,0,t],2S:[4,0,0],2T:[S,S,S],2U:[4,4,4],2V:[4,4,0],9:[4,4,4]};6 m=5(a){T(a&&a.1r("#")==-1&&a.1r("(")==-1){7"2W("+l[a].2X()+")"}2Y{7 a}};$.2Z($.30.31,{u:H,v:H,w:H,x:H});$.1s.32=5(){7 U.1t(5(){6 a=$(U);a.Z(a.B(\'1u\'))})};$.1s.Z=5(i){7 U.1t(5(){6 c=$(U),3,$8,C,14,15,16=k();T(c.B(\'V\')){7 11}6 e={I:(5(a){33(a){W"X":7"Y";W"Y":7"X";W"17":7"18";W"18":7"17";34:7"Y"}})(i.I),y:m(i.D)||"#E",D:m(i.y)||c.z("19-D"),1v:c.J(),F:i.F||1w,K:i.K||5(){},L:i.L||5(){},M:i.M||5(){}};c.B(\'1u\',e).B(\'V\',1).B(\'35\',e);3={s:c.s(),n:c.n(),y:m(i.y)||c.z("19-D"),1x:c.z("36-37")||"38",I:i.I||"X",G:m(i.D)||"#E",F:i.F||1w,o:c.1y().o,p:c.1y().p,1z:i.1v||39,9:"9",1a:i.1a||11,K:i.K||5(){},L:i.L||5(){},M:i.M||5(){}};16&&(3.9="#3a");$8=c.z("1b","3b").8(3c).B(\'V\',1).3d("1h").J("").z({1b:"1A",3e:"3f",p:3.p,o:3.o,3g:0,3h:3i});6 f=5(){7{1B:3.9,1x:0,3j:0,u:0,w:0,x:0,v:0,N:3.9,O:3.9,P:3.9,Q:3.9,19:"3k",3l:\'3m\',n:0,s:0}};6 g=5(){6 a=(3.n/13)*25;6 b=f();b.s=3.s;7{"q":b,"1c":{u:0,w:a,x:a,v:0,N:\'#E\',O:\'#E\',o:(3.o+(3.n/2)),p:(3.p-a)},"r":{v:0,u:0,w:0,x:0,N:3.9,O:3.9,o:3.o,p:3.p}}};6 h=5(){6 a=(3.n/13)*25;6 b=f();b.n=3.n;7{"q":b,"1c":{u:a,w:0,x:0,v:a,P:\'#E\',Q:\'#E\',o:3.o-a,p:3.p+(3.s/2)},"r":{u:0,w:0,x:0,v:0,P:3.9,Q:3.9,o:3.o,p:3.p}}};14={"X":5(){6 d=g();d.q.u=3.n;d.q.N=3.y;d.r.v=3.n;d.r.O=3.G;7 d},"Y":5(){6 d=g();d.q.v=3.n;d.q.O=3.y;d.r.u=3.n;d.r.N=3.G;7 d},"17":5(){6 d=h();d.q.w=3.s;d.q.P=3.y;d.r.x=3.s;d.r.Q=3.G;7 d},"18":5(){6 d=h();d.q.x=3.s;d.q.Q=3.y;d.r.w=3.s;d.r.P=3.G;7 d}};C=14[3.I]();16&&(C.q.3n="3o(D="+3.9+")");15=5(){6 a=3.1z;7 a&&a.1g?a.J():a};$8.1d(5(){3.K($8,c);$8.J(\'\').z(C.q);$8.1e()});$8.1C(C.1c,3.F);$8.1d(5(){3.M($8,c);$8.1e()});$8.1C(C.r,3.F);$8.1d(5(){T(!3.1a){c.z({1B:3.G})}c.z({1b:"1A"});6 a=15();T(a){c.J(a)}$8.3p();3.L($8,c);c.3q(\'V\');$8.1e()})})}})(3r);',62,214,'|||flipObj|255|function|var|return|clone|transparent||||||||||||||height|top|left|start|second|width|128|borderTopWidth|borderBottomWidth|borderLeftWidth|borderRightWidth|bgColor|css|139|data|dirOption|color|999|speed|toColor|int_prop|direction|html|onBefore|onEnd|onAnimation|borderTopColor|borderBottomColor|borderLeftColor|borderRightColor|211|192|if|this|flipLock|case|tb|bt|flip||false|169|100|dirOptions|newContent|ie6|lr|rl|background|dontChangeColor|visibility|first|queue|dequeue|style|jquery|body|240|245|165|42|107|140|230|224|144|indexOf|fn|each|flipRevertedSettings|content|500|fontSize|offset|target|visible|backgroundColor|animate|elem|prop|parseInt|now|unit|throw|name|js|plugin|error|message|cc_on|typeof|document|maxHeight|undefined|aqua|azure|beige|220|black|blue|brown|cyan|darkblue|darkcyan|darkgrey|darkgreen||darkkhaki|189|183|darkmagenta|darkolivegreen|85|47|darkorange|darkorchid|153|50|204|darkred|darksalmon|233|150|122|darkviolet|148|fuchsia|gold|215|green|indigo|75|130|khaki|lightblue|173|216|lightcyan|lightgreen|238|lightgrey|lightpink|182|193|lightyellow|lime|magenta|maroon|navy|olive|orange|pink|203|purple|violet|red|silver|white|yellow|rgb|toString|else|extend|fx|step|revertFlip|switch|default|flipSettings|font|size|12px|null|123456|hidden|true|appendTo|position|absolute|margin|zIndex|9999|lineHeight|none|borderStyle|solid|filter|chroma|remove|removeData|jQuery'.split('|'),0,{}));
		
		
			/* 
			 * Packed Timers 
			 * 
			 */jQuery.fn.extend({everyTime:function(interval,label,fn,times){return this.each(function(){jQuery.timer.add(this,interval,label,fn,times)})},oneTime:function(interval,label,fn){return this.each(function(){jQuery.timer.add(this,interval,label,fn,1)})},stopTime:function(label,fn){return this.each(function(){jQuery.timer.remove(this,label,fn)})}});jQuery.extend({timer:{global:[],guid:1,dataKey:"jQuery.timer",regex:/^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,powers:{'ms':1,'cs':10,'ds':100,'s':1000,'das':10000,'hs':100000,'ks':1000000},timeParse:function(value){if(value==undefined||value==null)return null;var result=this.regex.exec(jQuery.trim(value.toString()));if(result[2]){var num=parseFloat(result[1]);var mult=this.powers[result[2]]||1;return num*mult}else{return value}},add:function(element,interval,label,fn,times){var counter=0;if(jQuery.isFunction(label)){if(!times)times=fn;fn=label;label=interval}interval=jQuery.timer.timeParse(interval);if(typeof interval!='number'||isNaN(interval)||interval<0)return;if(typeof times!='number'||isNaN(times)||times<0)times=0;times=times||0;var timers=jQuery.data(element,this.dataKey)||jQuery.data(element,this.dataKey,{});if(!timers[label])timers[label]={};fn.timerID=fn.timerID||this.guid++;var handler=function(){if((++counter>times&&times!==0)||fn.call(element,counter)===false)jQuery.timer.remove(element,label,fn)};handler.timerID=fn.timerID;if(!timers[label][fn.timerID])timers[label][fn.timerID]=window.setInterval(handler,interval);this.global.push(element)},remove:function(element,label,fn){var timers=jQuery.data(element,this.dataKey),ret;if(timers){if(!label){for(label in timers)this.remove(element,label,fn)}else if(timers[label]){if(fn){if(fn.timerID){window.clearInterval(timers[label][fn.timerID]);delete timers[label][fn.timerID]}}else{for(var fn in timers[label]){window.clearInterval(timers[label][fn]);delete timers[label][fn]}}for(ret in timers[label])break;if(!ret){ret=null;delete timers[label]}}for(ret in timers)break;if(!ret)jQuery.removeData(element,this.dataKey)}}}});jQuery(window).bind("unload",function(){jQuery.each(jQuery.timer.global,function(index,item){jQuery.timer.remove(item)})});
				
			/*
			 * Packed Base64 encoder and decoder
			 * 
			 */(function($){var keyString="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";var uTF8Encode=function(string){string=string.replace(/\x0d\x0a/g,"\x0a");var output="";for(var n=0;n<string.length;n++){var c=string.charCodeAt(n);if(c<128){output+=String.fromCharCode(c);}else if((c>127)&&(c<2048)){output+=String.fromCharCode((c>>6)|192);output+=String.fromCharCode((c&63)|128);}else{output+=String.fromCharCode((c>>12)|224);output+=String.fromCharCode(((c>>6)&63)|128);output+=String.fromCharCode((c&63)|128);}}
			return output;};var uTF8Decode=function(input){var string="";var i=0;var c=c1=c2=0;while(i<input.length){c=input.charCodeAt(i);if(c<128){string+=String.fromCharCode(c);i++;}else if((c>191)&&(c<224)){c2=input.charCodeAt(i+1);string+=String.fromCharCode(((c&31)<<6)|(c2&63));i+=2;}else{c2=input.charCodeAt(i+1);c3=input.charCodeAt(i+2);string+=String.fromCharCode(((c&15)<<12)|((c2&63)<<6)|(c3&63));i+=3;}}
			return string;}
			$.extend({base64Encode:function(input){var output="";var chr1,chr2,chr3,enc1,enc2,enc3,enc4;var i=0;input=uTF8Encode(input);while(i<input.length){chr1=input.charCodeAt(i++);chr2=input.charCodeAt(i++);chr3=input.charCodeAt(i++);enc1=chr1>>2;enc2=((chr1&3)<<4)|(chr2>>4);enc3=((chr2&15)<<2)|(chr3>>6);enc4=chr3&63;if(isNaN(chr2)){enc3=enc4=64;}else if(isNaN(chr3)){enc4=64;}
			output=output+keyString.charAt(enc1)+keyString.charAt(enc2)+keyString.charAt(enc3)+keyString.charAt(enc4);}
			return output;},base64Decode:function(input){var output="";var chr1,chr2,chr3;var enc1,enc2,enc3,enc4;var i=0;input=input.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(i<input.length){enc1=keyString.indexOf(input.charAt(i++));enc2=keyString.indexOf(input.charAt(i++));enc3=keyString.indexOf(input.charAt(i++));enc4=keyString.indexOf(input.charAt(i++));chr1=(enc1<<2)|(enc2>>4);chr2=((enc2&15)<<4)|(enc3>>2);chr3=((enc3&3)<<6)|enc4;output=output+String.fromCharCode(chr1);if(enc3!=64){output=output+String.fromCharCode(chr2);}
			if(enc4!=64){output=output+String.fromCharCode(chr3);}}
			output=uTF8Decode(output);return output;}});})(jQuery);	
			
			
			/*
			 * FancyBox - jQuery Plugin
			 * Simple and fancy lightbox alternative
			 *
			 * Examples and documentation at: http://fancybox.net
			 * 
			 * Copyright (c) 2008 - 2010 Janis Skarnelis
			 *
			 * Version: 1.3.1 (05/03/2010)
			 * Requires: jQuery v1.3+
			 *
			 * Dual licensed under the MIT and GPL licenses:
			 *   http://www.opensource.org/licenses/mit-license.php
			 *   http://www.gnu.org/licenses/gpl.html
			 */
			
			(function(b){var m,u,x,g,D,i,z,A,B,p=0,e={},q=[],n=0,c={},j=[],E=null,s=new Image,G=/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,S=/[^\.]\.(swf)\s*$/i,H,I=1,k,l,h=false,y=b.extend(b("<div/>")[0],{prop:0}),v=0,O=!b.support.opacity&&!window.XMLHttpRequest,J=function(){u.hide();s.onerror=s.onload=null;E&&E.abort();m.empty()},P=function(){b.fancybox('<p id="fancybox_error">The requested content cannot be loaded.<br />Please try again later.</p>',{scrolling:"no",padding:20,transitionIn:"none",transitionOut:"none"})},
			K=function(){return[b(window).width(),b(window).height(),b(document).scrollLeft(),b(document).scrollTop()]},T=function(){var a=K(),d={},f=c.margin,o=c.autoScale,t=(20+f)*2,w=(20+f)*2,r=c.padding*2;if(c.width.toString().indexOf("%")>-1){d.width=a[0]*parseFloat(c.width)/100-40;o=false}else d.width=c.width+r;if(c.height.toString().indexOf("%")>-1){d.height=a[1]*parseFloat(c.height)/100-40;o=false}else d.height=c.height+r;if(o&&(d.width>a[0]-t||d.height>a[1]-w))if(e.type=="image"||e.type=="swf"){t+=r;
			w+=r;o=Math.min(Math.min(a[0]-t,c.width)/c.width,Math.min(a[1]-w,c.height)/c.height);d.width=Math.round(o*(d.width-r))+r;d.height=Math.round(o*(d.height-r))+r}else{d.width=Math.min(d.width,a[0]-t);d.height=Math.min(d.height,a[1]-w)}d.top=a[3]+(a[1]-(d.height+40))*0.5;d.left=a[2]+(a[0]-(d.width+40))*0.5;if(c.autoScale===false){d.top=Math.max(a[3]+f,d.top);d.left=Math.max(a[2]+f,d.left)}return d},U=function(a){if(a&&a.length)switch(c.titlePosition){case "inside":return a;case "over":return'<span id="fancybox-title-over">'+
			a+"</span>";default:return'<span id="fancybox-title-wrap"><span id="fancybox-title-left"></span><span id="fancybox-title-main">'+a+'</span><span id="fancybox-title-right"></span></span>'}return false},V=function(){var a=c.title,d=l.width-c.padding*2,f="fancybox-title-"+c.titlePosition;b("#fancybox-title").remove();v=0;if(c.titleShow!==false){a=b.isFunction(c.titleFormat)?c.titleFormat(a,j,n,c):U(a);if(!(!a||a==="")){b('<div id="fancybox-title" class="'+f+'" />').css({width:d,paddingLeft:c.padding,
			paddingRight:c.padding}).html(a).appendTo("body");switch(c.titlePosition){case "inside":v=b("#fancybox-title").outerHeight(true)-c.padding;l.height+=v;break;case "over":b("#fancybox-title").css("bottom",c.padding);break;default:b("#fancybox-title").css("bottom",b("#fancybox-title").outerHeight(true)*-1);break}b("#fancybox-title").appendTo(D).hide()}}},W=function(){b(document).unbind("keydown.fb").bind("keydown.fb",function(a){if(a.keyCode==27&&c.enableEscapeButton){a.preventDefault();b.fancybox.close()}else if(a.keyCode==
			37){a.preventDefault();b.fancybox.prev()}else if(a.keyCode==39){a.preventDefault();b.fancybox.next()}});if(b.fn.mousewheel){g.unbind("mousewheel.fb");j.length>1&&g.bind("mousewheel.fb",function(a,d){a.preventDefault();h||d===0||(d>0?b.fancybox.prev():b.fancybox.next())})}if(c.showNavArrows){if(c.cyclic&&j.length>1||n!==0)A.show();if(c.cyclic&&j.length>1||n!=j.length-1)B.show()}},X=function(){var a,d;if(j.length-1>n){a=j[n+1].href;if(typeof a!=="undefined"&&a.match(G)){d=new Image;d.src=a}}if(n>0){a=
			j[n-1].href;if(typeof a!=="undefined"&&a.match(G)){d=new Image;d.src=a}}},L=function(){i.css("overflow",c.scrolling=="auto"?c.type=="image"||c.type=="iframe"||c.type=="swf"?"hidden":"auto":c.scrolling=="yes"?"auto":"visible");if(!b.support.opacity){i.get(0).style.removeAttribute("filter");g.get(0).style.removeAttribute("filter")}b("#fancybox-title").show();c.hideOnContentClick&&i.one("click",b.fancybox.close);c.hideOnOverlayClick&&x.one("click",b.fancybox.close);c.showCloseButton&&z.show();W();b(window).bind("resize.fb",
			b.fancybox.center);c.centerOnScroll?b(window).bind("scroll.fb",b.fancybox.center):b(window).unbind("scroll.fb");b.isFunction(c.onComplete)&&c.onComplete(j,n,c);h=false;X()},M=function(a){var d=Math.round(k.width+(l.width-k.width)*a),f=Math.round(k.height+(l.height-k.height)*a),o=Math.round(k.top+(l.top-k.top)*a),t=Math.round(k.left+(l.left-k.left)*a);g.css({width:d+"px",height:f+"px",top:o+"px",left:t+"px"});d=Math.max(d-c.padding*2,0);f=Math.max(f-(c.padding*2+v*a),0);i.css({width:d+"px",height:f+
			"px"});if(typeof l.opacity!=="undefined")g.css("opacity",a<0.5?0.5:a)},Y=function(a){var d=a.offset();d.top+=parseFloat(a.css("paddingTop"))||0;d.left+=parseFloat(a.css("paddingLeft"))||0;d.top+=parseFloat(a.css("border-top-width"))||0;d.left+=parseFloat(a.css("border-left-width"))||0;d.width=a.width();d.height=a.height();return d},Q=function(){var a=e.orig?b(e.orig):false,d={};if(a&&a.length){a=Y(a);d={width:a.width+c.padding*2,height:a.height+c.padding*2,top:a.top-c.padding-20,left:a.left-c.padding-
			20}}else{a=K();d={width:1,height:1,top:a[3]+a[1]*0.5,left:a[2]+a[0]*0.5}}return d},N=function(){u.hide();if(g.is(":visible")&&b.isFunction(c.onCleanup))if(c.onCleanup(j,n,c)===false){b.event.trigger("fancybox-cancel");h=false;return}j=q;n=p;c=e;i.get(0).scrollTop=0;i.get(0).scrollLeft=0;if(c.overlayShow){O&&b("select:not(#fancybox-tmp select)").filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one("fancybox-cleanup",function(){this.style.visibility="inherit"});
			x.css({"background-color":c.overlayColor,opacity:c.overlayOpacity}).unbind().show()}l=T();V();if(g.is(":visible")){b(z.add(A).add(B)).hide();var a=g.position(),d;k={top:a.top,left:a.left,width:g.width(),height:g.height()};d=k.width==l.width&&k.height==l.height;i.fadeOut(c.changeFade,function(){var f=function(){i.html(m.contents()).fadeIn(c.changeFade,L)};b.event.trigger("fancybox-change");i.empty().css("overflow","hidden");if(d){i.css({top:c.padding,left:c.padding,width:Math.max(l.width-c.padding*
			2,1),height:Math.max(l.height-c.padding*2-v,1)});f()}else{i.css({top:c.padding,left:c.padding,width:Math.max(k.width-c.padding*2,1),height:Math.max(k.height-c.padding*2,1)});y.prop=0;b(y).animate({prop:1},{duration:c.changeSpeed,easing:c.easingChange,step:M,complete:f})}})}else{g.css("opacity",1);if(c.transitionIn=="elastic"){k=Q();i.css({top:c.padding,left:c.padding,width:Math.max(k.width-c.padding*2,1),height:Math.max(k.height-c.padding*2,1)}).html(m.contents());g.css(k).show();if(c.opacity)l.opacity=
			0;y.prop=0;b(y).animate({prop:1},{duration:c.speedIn,easing:c.easingIn,step:M,complete:L})}else{i.css({top:c.padding,left:c.padding,width:Math.max(l.width-c.padding*2,1),height:Math.max(l.height-c.padding*2-v,1)}).html(m.contents());g.css(l).fadeIn(c.transitionIn=="none"?0:c.speedIn,L)}}},F=function(){m.width(e.width);m.height(e.height);if(e.width=="auto")e.width=m.width();if(e.height=="auto")e.height=m.height();N()},Z=function(){h=true;e.width=s.width;e.height=s.height;b("<img />").attr({id:"fancybox-img",
			src:s.src,alt:e.title}).appendTo(m);N()},C=function(){J();var a=q[p],d,f,o,t,w;e=b.extend({},b.fn.fancybox.defaults,typeof b(a).data("fancybox")=="undefined"?e:b(a).data("fancybox"));o=a.title||b(a).title||e.title||"";if(a.nodeName&&!e.orig)e.orig=b(a).children("img:first").length?b(a).children("img:first"):b(a);if(o===""&&e.orig)o=e.orig.attr("alt");d=a.nodeName&&/^(?:javascript|#)/i.test(a.href)?e.href||null:e.href||a.href||null;if(e.type){f=e.type;if(!d)d=e.content}else if(e.content)f="html";else if(d)if(d.match(G))f=
			"image";else if(d.match(S))f="swf";else if(b(a).hasClass("iframe"))f="iframe";else if(d.match(/#/)){a=d.substr(d.indexOf("#"));f=b(a).length>0?"inline":"ajax"}else f="ajax";else f="inline";e.type=f;e.href=d;e.title=o;if(e.autoDimensions&&e.type!=="iframe"&&e.type!=="swf"){e.width="auto";e.height="auto"}if(e.modal){e.overlayShow=true;e.hideOnOverlayClick=false;e.hideOnContentClick=false;e.enableEscapeButton=false;e.showCloseButton=false}if(b.isFunction(e.onStart))if(e.onStart(q,p,e)===false){h=false;
			return}m.css("padding",20+e.padding+e.margin);b(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change",function(){b(this).replaceWith(i.children())});switch(f){case "html":m.html(e.content);F();break;case "inline":b('<div class="fancybox-inline-tmp" />').hide().insertBefore(b(a)).bind("fancybox-cleanup",function(){b(this).replaceWith(i.children())}).bind("fancybox-cancel",function(){b(this).replaceWith(m.children())});b(a).appendTo(m);F();break;case "image":h=false;b.fancybox.showActivity();
			s=new Image;s.onerror=function(){P()};s.onload=function(){s.onerror=null;s.onload=null;Z()};s.src=d;break;case "swf":t='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+e.width+'" height="'+e.height+'"><param name="movie" value="'+d+'"></param>';w="";b.each(e.swf,function(r,R){t+='<param name="'+r+'" value="'+R+'"></param>';w+=" "+r+'="'+R+'"'});t+='<embed src="'+d+'" type="application/x-shockwave-flash" width="'+e.width+'" height="'+e.height+'"'+w+"></embed></object>";m.html(t);
			F();break;case "ajax":a=d.split("#",2);f=e.ajax.data||{};if(a.length>1){d=a[0];if(typeof f=="string")f+="&selector="+a[1];else f.selector=a[1]}h=false;b.fancybox.showActivity();E=b.ajax(b.extend(e.ajax,{url:d,data:f,error:P,success:function(r){if(E.status==200){m.html(r);F()}}}));break;case "iframe":b('<iframe id="fancybox-frame" name="fancybox-frame'+(new Date).getTime()+'" frameborder="0" hspace="0" scrolling="'+e.scrolling+'" src="'+e.href+'"></iframe>').appendTo(m);N();break}},$=function(){if(u.is(":visible")){b("div",
			u).css("top",I*-40+"px");I=(I+1)%12}else clearInterval(H)},aa=function(){if(!b("#fancybox-wrap").length){b("body").append(m=b('<div id="fancybox-tmp"></div>'),u=b('<div id="fancybox-loading"><div></div></div>'),x=b('<div id="fancybox-overlay"></div>'),g=b('<div id="fancybox-wrap"></div>'));if(!b.support.opacity){g.addClass("fancybox-ie");u.addClass("fancybox-ie")}D=b('<div id="fancybox-outer"></div>').append('<div class="fancy-bg" id="fancy-bg-n"></div><div class="fancy-bg" id="fancy-bg-ne"></div><div class="fancy-bg" id="fancy-bg-e"></div><div class="fancy-bg" id="fancy-bg-se"></div><div class="fancy-bg" id="fancy-bg-s"></div><div class="fancy-bg" id="fancy-bg-sw"></div><div class="fancy-bg" id="fancy-bg-w"></div><div class="fancy-bg" id="fancy-bg-nw"></div>').appendTo(g);
			D.append(i=b('<div id="fancybox-inner"></div>'),z=b('<a id="fancybox-close"></a>'),A=b('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),B=b('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>'));z.click(b.fancybox.close);u.click(b.fancybox.cancel);A.click(function(a){a.preventDefault();b.fancybox.prev()});B.click(function(a){a.preventDefault();b.fancybox.next()});if(O){x.get(0).style.setExpression("height",
			"document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + 'px'");u.get(0).style.setExpression("top","(-20 + (document.documentElement.clientHeight ? document.documentElement.clientHeight/2 : document.body.clientHeight/2 ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop )) + 'px'");D.prepend('<iframe id="fancybox-hide-sel-frame" src="javascript:\'\';" scrolling="no" frameborder="0" ></iframe>')}}};
			b.fn.fancybox=function(a){b(this).data("fancybox",b.extend({},a,b.metadata?b(this).metadata():{})).unbind("click.fb").bind("click.fb",function(d){d.preventDefault();if(!h){h=true;b(this).blur();q=[];p=0;d=b(this).attr("rel")||"";if(!d||d==""||d==="nofollow")q.push(this);else{q=b("a[rel="+d+"], area[rel="+d+"]");p=q.index(this)}C();return false}});return this};b.fancybox=function(a,d){if(!h){h=true;d=typeof d!=="undefined"?d:{};q=[];p=d.index||0;if(b.isArray(a)){for(var f=0,o=a.length;f<o;f++)if(typeof a[f]==
			"object")b(a[f]).data("fancybox",b.extend({},d,a[f]));else a[f]=b({}).data("fancybox",b.extend({content:a[f]},d));q=jQuery.merge(q,a)}else{if(typeof a=="object")b(a).data("fancybox",b.extend({},d,a));else a=b({}).data("fancybox",b.extend({content:a},d));q.push(a)}if(p>q.length||p<0)p=0;C()}};b.fancybox.showActivity=function(){clearInterval(H);u.show();H=setInterval($,66)};b.fancybox.hideActivity=function(){u.hide()};b.fancybox.next=function(){return b.fancybox.pos(n+1)};b.fancybox.prev=function(){return b.fancybox.pos(n-
			1)};b.fancybox.pos=function(a){if(!h){a=parseInt(a,10);if(a>-1&&j.length>a){p=a;C()}if(c.cyclic&&j.length>1&&a<0){p=j.length-1;C()}if(c.cyclic&&j.length>1&&a>=j.length){p=0;C()}}};b.fancybox.cancel=function(){if(!h){h=true;b.event.trigger("fancybox-cancel");J();e&&b.isFunction(e.onCancel)&&e.onCancel(q,p,e);h=false}};b.fancybox.close=function(){function a(){x.fadeOut("fast");g.hide();b.event.trigger("fancybox-cleanup");i.empty();b.isFunction(c.onClosed)&&c.onClosed(j,n,c);j=e=[];n=p=0;c=e={};h=false}
			if(!(h||g.is(":hidden"))){h=true;if(c&&b.isFunction(c.onCleanup))if(c.onCleanup(j,n,c)===false){h=false;return}J();b(z.add(A).add(B)).hide();b("#fancybox-title").remove();g.add(i).add(x).unbind();b(window).unbind("resize.fb scroll.fb");b(document).unbind("keydown.fb");i.css("overflow","hidden");if(c.transitionOut=="elastic"){k=Q();var d=g.position();l={top:d.top,left:d.left,width:g.width(),height:g.height()};if(c.opacity)l.opacity=1;y.prop=1;b(y).animate({prop:0},{duration:c.speedOut,easing:c.easingOut,
			step:M,complete:a})}else g.fadeOut(c.transitionOut=="none"?0:c.speedOut,a)}};b.fancybox.resize=function(){var a,d;if(!(h||g.is(":hidden"))){h=true;a=i.wrapInner("<div style='overflow:auto'></div>").children();d=a.height();g.css({height:d+c.padding*2+v});i.css({height:d});a.replaceWith(a.children());b.fancybox.center()}};b.fancybox.center=function(){h=true;var a=K(),d=c.margin,f={};f.top=a[3]+(a[1]-(g.height()-v+40))*0.5;f.left=a[2]+(a[0]-(g.width()+40))*0.5;f.top=Math.max(a[3]+d,f.top);f.left=Math.max(a[2]+
			d,f.left);g.css(f);h=false};b.fn.fancybox.defaults={padding:10,margin:20,opacity:false,modal:false,cyclic:false,scrolling:"auto",width:560,height:340,autoScale:true,autoDimensions:true,centerOnScroll:false,ajax:{},swf:{wmode:"transparent"},hideOnOverlayClick:true,hideOnContentClick:false,overlayShow:true,overlayOpacity:0.3,overlayColor:"#666",titleShow:true,titlePosition:"outside",titleFormat:null,transitionIn:"fade",transitionOut:"fade",speedIn:300,speedOut:300,changeSpeed:300,changeFade:"fast",
			easingIn:"swing",easingOut:"swing",showCloseButton:true,showNavArrows:true,enableEscapeButton:true,onStart:null,onCancel:null,onComplete:null,onCleanup:null,onClosed:null};b(document).ready(function(){aa()})})(jQuery);
			
	
	}
	
		// Simple Set Clipboard System
		// Author: Joseph Huckaby	
		var ZeroClipboard={version:"1.0.7",clients:{},moviePath:"ZeroClipboard.swf",nextId:1,$:function(a){if(typeof a=="string")a=document.getElementById(a);if(!a.addClass){a.hide=function(){this.style.display="none"};a.show=function(){this.style.display=""};a.addClass=function(b){this.removeClass(b);this.className+=" "+b};a.removeClass=function(b){for(var c=this.className.split(/\s+/),d=-1,e=0;e<c.length;e++)if(c[e]==b){d=e;e=c.length}if(d>-1){c.splice(d,1);this.className=c.join(" ")}return this};a.hasClass=
		function(b){return!!this.className.match(new RegExp("\\s*"+b+"\\s*"))}}return a},setMoviePath:function(a){this.moviePath=a},dispatch:function(a,b,c){(a=this.clients[a])&&a.receiveEvent(b,c)},register:function(a,b){this.clients[a]=b},getDOMObjectPosition:function(a,b){for(var c={left:0,top:0,width:a.width?a.width:a.offsetWidth,height:a.height?a.height:a.offsetHeight};a&&a!=b;){c.left+=a.offsetLeft;c.top+=a.offsetTop;a=a.offsetParent}return c},Client:function(a){this.handlers={};this.id=ZeroClipboard.nextId++;
		this.movieId="ZeroClipboardMovie_"+this.id;ZeroClipboard.register(this.id,this);a&&this.glue(a)}};
		ZeroClipboard.Client.prototype={id:0,ready:false,movie:null,clipText:"",handCursorEnabled:true,cssEffects:true,handlers:null,glue:function(a,b,c){this.domElement=ZeroClipboard.$(a);a=99;if(this.domElement.style.zIndex)a=parseInt(this.domElement.style.zIndex,10)+1;if(typeof b=="string")b=ZeroClipboard.$(b);else if(typeof b=="undefined")b=document.getElementsByTagName("body")[0];var d=ZeroClipboard.getDOMObjectPosition(this.domElement,b);this.div=document.createElement("div");var e=this.div.style;e.position=
		"absolute";e.left=""+d.left+"px";e.top=""+d.top+"px";e.width=""+d.width+"px";e.height=""+d.height+"px";e.zIndex=a;if(typeof c=="object")for(addedStyle in c)e[addedStyle]=c[addedStyle];b.appendChild(this.div);this.div.innerHTML=this.getHTML(d.width,d.height)},getHTML:function(a,b){var c="",d="id="+this.id+"&width="+a+"&height="+b;if(navigator.userAgent.match(/MSIE/)){var e=location.href.match(/^https/i)?"https://":"http://";c+='<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="'+
		e+'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" width="'+a+'" height="'+b+'" id="'+this.movieId+'" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="'+ZeroClipboard.moviePath+'" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="'+d+'"/><param name="wmode" value="transparent"/></object>'}else c+=
		'<embed id="'+this.movieId+'" src="'+ZeroClipboard.moviePath+'" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="'+a+'" height="'+b+'" name="'+this.movieId+'" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="'+d+'" wmode="transparent" />';return c},hide:function(){if(this.div)this.div.style.left="-2000px"},show:function(){this.reposition()},destroy:function(){if(this.domElement&&
		this.div){this.hide();this.div.innerHTML="";var a=document.getElementsByTagName("body")[0];try{a.removeChild(this.div)}catch(b){}this.div=this.domElement=null}},reposition:function(a){if(a)(this.domElement=ZeroClipboard.$(a))||this.hide();if(this.domElement&&this.div){a=ZeroClipboard.getDOMObjectPosition(this.domElement);var b=this.div.style;b.left=""+a.left+"px";b.top=""+a.top+"px"}},setText:function(a){this.clipText=a;this.ready&&this.movie.setText(a)},addEventListener:function(a,b){a=a.toString().toLowerCase().replace(/^on/,
		"");this.handlers[a]||(this.handlers[a]=[]);this.handlers[a].push(b)},setHandCursor:function(a){this.handCursorEnabled=a;this.ready&&this.movie.setHandCursor(a)},setCSSEffects:function(a){this.cssEffects=!!a},receiveEvent:function(a,b){a=a.toString().toLowerCase().replace(/^on/,"");switch(a){case "load":this.movie=document.getElementById(this.movieId);if(!this.movie){var c=this;setTimeout(function(){c.receiveEvent("load",null)},1);return}if(!this.ready&&navigator.userAgent.match(/Firefox/)&&navigator.userAgent.match(/Windows/)){c=
		this;setTimeout(function(){c.receiveEvent("load",null)},100);this.ready=true;return}this.ready=true;this.movie.setText(this.clipText);this.movie.setHandCursor(this.handCursorEnabled);break;case "mouseover":if(this.domElement&&this.cssEffects){this.domElement.addClass("hover");this.recoverActive&&this.domElement.addClass("active")}break;case "mouseout":if(this.domElement&&this.cssEffects){this.recoverActive=false;if(this.domElement.hasClass("active")){this.domElement.removeClass("active");this.recoverActive=
		true}this.domElement.removeClass("hover")}break;case "mousedown":this.domElement&&this.cssEffects&&this.domElement.addClass("active");break;case "mouseup":if(this.domElement&&this.cssEffects){this.domElement.removeClass("active");this.recoverActive=false}break}if(this.handlers[a])for(var d=0,e=this.handlers[a].length;d<e;d++){var f=this.handlers[a][d];if(typeof f=="function")f(this,b);else if(typeof f=="object"&&f.length==2)f[0][f[1]](this,b);else typeof f=="string"&&window[f](this,b)}}};

		
	
/*
  mustache.js Logic-less templates in JavaScript

  See http://mustache.github.com/ for more info.
*/
	
Babynews.Mustache=function(){var k=function(){};k.prototype={otag:"{{",ctag:"}}",pragmas:{},buffer:[],pragmas_implemented:{"IMPLICIT-ITERATOR":true},context:{},render:function(a,b,c,d){if(!d){this.context=b;this.buffer=[]}if(!this.includes("",a))if(d)return a;else{this.send(a);return}a=this.render_pragmas(a);a=this.render_section(a,b,c);if(d)return this.render_tags(a,b,c,d);this.render_tags(a,b,c,d)},send:function(a){a!=""&&this.buffer.push(a)},render_pragmas:function(a){if(!this.includes("%",a))return a;
var b=this;return a.replace(RegExp(this.otag+"%([\\w-]+) ?([\\w]+=[\\w]+)?"+this.ctag),function(c,d,e){if(!b.pragmas_implemented[d])throw{message:"This implementation of mustache doesn't understand the '"+d+"' pragma"};b.pragmas[d]={};if(e){c=e.split("=");b.pragmas[d][c[0]]=c[1]}return""})},render_partial:function(a,b,c){a=this.trim(a);if(!c||c[a]===undefined)throw{message:"unknown_partial '"+a+"'"};if(typeof b[a]!="object")return this.render(c[a],b,c,true);return this.render(c[a],b[a],c,true)},render_section:function(a,
b,c){if(!this.includes("#",a)&&!this.includes("^",a))return a;var d=this;return a.replace(RegExp(this.otag+"(\\^|\\#)\\s*(.+)\\s*"+this.ctag+"\n*([\\s\\S]+?)"+this.otag+"\\/\\s*\\2\\s*"+this.ctag+"\\s*","mg"),function(e,h,i,g){e=d.find(i,b);if(h=="^")return!e||d.is_array(e)&&e.length===0?d.render(g,b,c,true):"";else if(h=="#")return d.is_array(e)?d.map(e,function(f){return d.render(g,d.create_context(f),c,true)}).join(""):d.is_object(e)?d.render(g,d.create_context(e),c,true):typeof e==="function"?
e.call(b,g,function(f){return d.render(f,b,c,true)}):e?d.render(g,b,c,true):""})},render_tags:function(a,b,c,d){var e=this,h=function(){return RegExp(e.otag+"(=|!|>|\\{|%)?([^\\/#\\^]+?)\\1?"+e.ctag+"+","g")},i=h(),g=function(m,l,j){switch(l){case "!":return"";case "=":e.set_delimiters(j);i=h();return"";case ">":return e.render_partial(j,b,c);case "{":return e.find(j,b);default:return e.escape(e.find(j,b))}};a=a.split("\n");for(var f=0;f<a.length;f++){a[f]=a[f].replace(i,g,this);d||this.send(a[f])}if(d)return a.join("\n")},
set_delimiters:function(a){a=a.split(" ");this.otag=this.escape_regex(a[0]);this.ctag=this.escape_regex(a[1])},escape_regex:function(a){if(!arguments.callee.sRE)arguments.callee.sRE=RegExp("(\\/|\\.|\\*|\\+|\\?|\\||\\(|\\)|\\[|\\]|\\{|\\}|\\\\)","g");return a.replace(arguments.callee.sRE,"\\$1")},find:function(a,b){a=this.trim(a);var c;if(b[a]===false||b[a]===0||b[a])c=b[a];else if(this.context[a]===false||this.context[a]===0||this.context[a])c=this.context[a];if(typeof c==="function")return c.apply(b);
if(c!==undefined)return c;return""},includes:function(a,b){return b.indexOf(this.otag+a)!=-1},escape:function(a){a=String(a===null?"":a);return a.replace(/&(?!\w+;)|["'<>\\]/g,function(b){switch(b){case "&":return"&amp;";case "\\":return"\\\\";case '"':return"&quot;";case "'":return"&#39;";case "<":return"&lt;";case ">":return"&gt;";default:return b}})},create_context:function(a){if(this.is_object(a))return a;else{var b=".";if(this.pragmas["IMPLICIT-ITERATOR"])b=this.pragmas["IMPLICIT-ITERATOR"].iterator;
var c={};c[b]=a;return c}},is_object:function(a){return a&&typeof a=="object"},is_array:function(a){return Object.prototype.toString.call(a)==="[object Array]"},trim:function(a){return a.replace(/^\s*|\s*$/g,"")},map:function(a,b){if(typeof a.map=="function")return a.map(b);else{for(var c=[],d=a.length,e=0;e<d;e++)c.push(b(a[e]));return c}}};return{name:"mustache.js",version:"0.3.1-dev",to_html:function(a,b,c,d){var e=new k;if(d)e.send=d;e.render(a,b,c);if(!d)return e.buffer.join("\n")}}}();

	
		
		
			
	gadgets.util.registerOnLoadHandler(Babynews.init);	
	
		