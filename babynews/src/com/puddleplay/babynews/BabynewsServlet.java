package com.puddleplay.babynews;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Random;
import java.util.TimeZone;
import java.util.logging.Logger;

import javax.jdo.Extent;
import javax.jdo.Query;

import javax.jdo.PersistenceManager;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import javax.cache.Cache;

import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.quota.QuotaService;
import com.google.appengine.api.quota.QuotaServiceFactory;
import com.google.gdata.client.ClientLoginAccountType;
import com.google.gdata.client.GoogleAuthTokenFactory.UserToken;
import com.google.gdata.client.spreadsheet.SpreadsheetService;
import com.google.gdata.data.spreadsheet.ListEntry;
import com.google.gdata.data.spreadsheet.ListFeed;
import com.google.gdata.data.spreadsheet.SpreadsheetEntry;
import com.google.gdata.data.spreadsheet.SpreadsheetFeed;
import com.google.gdata.data.spreadsheet.WorksheetEntry;
import com.google.gdata.data.spreadsheet.WorksheetFeed;
import com.google.gdata.util.AuthenticationException;

import com.google.appengine.api.labs.taskqueue.Queue;
import com.google.appengine.api.labs.taskqueue.QueueFactory;
import com.google.appengine.api.labs.taskqueue.TaskHandle;
import com.google.appengine.api.labs.taskqueue.TaskOptions;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.Stats;

import org.json.simple.*;

import sun.tools.tree.ThisExpression;

/**
 * @author Jake Pierson
 */
public class BabynewsServlet extends HttpServlet {

	public static final long serialVersionUID = 3;
	public static final String service_description = "PuddlePlay-News-Blog";

	/**
	 * These are variables we can't set from the spreadsheet because we need them to get it
	 */
	//Parameters needed to get the spreadsheet data
	public static final String username = "xxx";
	public static final String password ="xxx";
	public static final String spreadsheet_URL = "http://spreadsheets.google.com/feeds/worksheets/0AqztVw6ec1OUdDB6ejFoNXh0N3ppVnNSeHdQX3BGWkE/private/full";
	public static final String settings_worksheetname = "App Settings";
	public static final String testing_spreadsheet_URL = "http://spreadsheets.google.com/feeds/worksheets/0AqztVw6ec1OUdGxMWHlrRGlWZ3ZOYVNQRmd5N2d5SVE/private/full";

	
	/*
	 * Application Variables
	 * We'll use these later
	 */
	
	//the URL to this servlet
	public static final String BASE_URL = "/babynews";
	
	//a token for logging into the spreadsheet service
	public static String TOKEN = "abcde12345";
	
	//a var to say if we are running on the server or in test mode
	public static Boolean DEV_MODE = false;
	
	//Init the logger
	private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());

	//A class level response object so we can print with a method
	private HttpServletResponse response;

	//The response collector String
	private String page_response = "";

	//the queue service
	QuotaService qs = QuotaServiceFactory.getQuotaService();


	//one Hour in milliseconds
	public static final long DAY_MILLIS = 1000 * 60 * 60 * 24;
	public static final long DAY_SECS = DAY_MILLIS/1000;
	
	public static final long HOUR_MILLIS = 1000 * 60 * 60;
	public static final long HOUR_SECS = HOUR_MILLIS/1000;
		
	public static final long MINUTE_MILLIS = HOUR_MILLIS/60;
	public static final long MINUTE_SECS = MINUTE_MILLIS/1000;	
	
	public Map<String, String> settings = null;
	
	
	/**
	 * Constructor
	 */
	public BabynewsServlet() {
		//nuthin
	}


	/* (non-Javadoc)
	 * @see javax.servlet.http.HttpServlet#doGet(javax.servlet.http.HttpServletRequest, javax.servlet.http.HttpServletResponse)
	 */
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {

		//figure out if we are running in the AppEngine environment
		String serverInfo = this.getServletContext().getServerInfo();
		//System.out.println( serverInfo );
		/* ServletContext.getServerInfo() will return "Google App Engine Development/x.x.x"
		 * if will run locally, and "Google App Engine/x.x.x" if run on production envoirnment */
		if (serverInfo.contains("Development")) {
			this.DEV_MODE = false;
		} else {
			this.DEV_MODE = false;
		}

		//set the class level response object
		response = resp;

		//get the start time for this process
		long start_time = new Date().getTime();

		//check to see if there were any parameters in the request
		Map params = req.getParameterMap(); 
	 
		this.settings = BabynewsServlet.getSettings( false );
		
		//go through the params of the request
		if (params.containsKey("view_whats_hot")) {

			//Prints out HTML that shows the current whats hot list
			String num = req.getParameter("view_whats_hot").trim();
			if( num == null || num.length() < 1 ) num = "200";
			
			//set the output type to text
			resp.setContentType("text/html");
			write( "<head>" + "<style type=\"text/css\"> body {font-family: Arial, sans-serif; font-size: 10pt; color:#333} a {color:#0077FF} </style>" + "</head><html>" );           	

			//create the What's Hot list and print it to the response
			write( makeWhatsHotHTML( Integer.parseInt(num), false ) );               	

			//close the html
			write( "</html>" );
		}
		
		//
		//serve the image based on the parent and object keys given
		//
		else if (params.containsKey("imagekey")) {
				
			String key_string = req.getParameter("imagekey").trim();
			String size = req.getParameter("fullsize");
			
			Boolean full = false;
			if( size != null && size.length() > 0 ) full = true;
		
			Blob image = null;
				
			BabynewsPost post = (BabynewsPost)BabynewsUtils.cacheGet( key_string );
				
			if( post != null ) {
				image = ( full ? (Blob) post.getImage(true) : (Blob) post.getImage(false) );
				log.info("Got image " + key_string + " from the cache");
			}
			else {
				Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), key_string);
	
				post = BabynewsUtils.getPostbyKey(key);
	
				if( post == null ) {
					log.warning("Could not get post: " + key_string + " from the cache or datastore" );
					return;
				}
	
				if( !post.hasImage() ) {
					post.downloadAndStorePrimaryImage();
					log.info( "Had to get image: " + key_string + " from the original source" );
				}
				full = true;
				image = full ? (Blob) post.getImage(true) : (Blob) post.getImage(false);
								
			}

			if( image != null ) {
				resp.setContentType("image/jpeg");
				
				//set Expires Header
				long expire = new Date().getTime() + ( this.DAY_MILLIS * Integer.parseInt( settings.get("days_to_keep_posts") ) ) ;
				response.setDateHeader("Expires", expire);
				
				//set Etag Header
				response.setHeader("Etag", Integer.toString( image.hashCode() ) );
				
				response.getOutputStream().write( image.getBytes() );
			}
			
			//log.info( "image get process run time: " + Math.abs( start_time - new Date().getTime() ) + "ms" );

		} 
		
		
		

		
		//
		// This creates the Lists from the Feeds stored.
		// 
		else if (params.containsKey("make_sorted_lists")) {
			
			long start = 0;
			long end = 0;
			String update = "";
			
			try {
				//Make the what's hot list
				start = qs.getApiTimeInMegaCycles();
				/////
				makeSortedLists();
				/////
				end = qs.getApiTimeInMegaCycles();
				update = "make_sorted_lists took: " + Double.toString(qs.convertMegacyclesToCpuSeconds(end - start)) + " CPU time";
				write( update );
				log.info( update );
			} catch (com.google.apphosting.api.DeadlineExceededException e) {
				//we ran out of time!
				log.warning("AHHHHHHHHH!  We ran out of execution time: " + e.getMessage() );
			} finally {
				//print the response run time
				write( "Make WHATS HOT process run time: " + Math.abs( start_time - new Date().getTime() ) + "ms" );
			}
		}
		
		
		//
		//this is called to refresh all the feeds in the datastore.  It calls itself again after a time interval
		//
		else if (params.containsKey("refreshFeedsLoop")) {

			
			//figure out if now is between midnight and 7am. If so, only refresh once every 6 tries
			Calendar now = Calendar.getInstance(TimeZone.getTimeZone("PST"));		
			Random randGen = new Random();

			if( now.get(Calendar.HOUR_OF_DAY) < 7 ) { 
				if(randGen.nextInt(5) != 1) return;
			}
			
			
			List<BabynewsFeed> feeds = new ArrayList<BabynewsFeed>(); 
			
			//get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();

			//get the feeds from the datastore and refresh their posts
			Query feeds_query = pm.newQuery(BabynewsFeed.class);
			try {
				feeds = (List<BabynewsFeed>) feeds_query.execute();
				log.info("Found " + feeds.size() + " FEEDS in the datastore");
			} catch (Exception e) {
				log.warning("Had an error while trying to retrieve the blog feeds from the datastore: " + e.getMessage() );
			} finally {
				feeds_query.closeAll();
			}

			pm.close();

			Queue queue = QueueFactory.getQueue("feed-processing-queue");			
			
			//for each feed, add a task to refresh it
			for( BabynewsFeed feed : feeds ) {
				
				//calculate average number of posts
				double average = feed.getAveragePostFrequency();
				if( average < 1 ) average = 1;
				int rand = randGen.nextInt(20);
				
				log.info( "Feed " + feed.getBlogTitle() + " -> average: " + average );
				
				if( rand <= average ) {
					String ID = feed.getKeyString();
					queue.add( TaskOptions.Builder.url(this.BASE_URL).param("refreshFeed",ID).method(TaskOptions.Method.GET) );
					log.info( "refreshing feed " + feed.getBlogTitle() );
				}
				
			} 
			
			/*
			//only sort the lists if there are more than one feeds.
			if( feeds.size() > 0 ) {
				//after adding all the refresh feed items into the list, make whats hot list
				int delay = 1000 * (Integer.parseInt( settings.get("feed_refresh_cycle_seconds") ) ) / 2; 
				queue.add( TaskOptions.Builder.url(this.BASE_URL).param("make_sorted_lists","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
			}
			*/
			
			//then add a queue task to refresh the feeds again :)
			//int delay = 1000 * (Integer.parseInt( settings.get("feed_refresh_cycle_seconds") ) ) ; 
			//queue.add( TaskOptions.Builder.url(this.BASE_URL).param("refreshFeedsLoop","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
						
		}
		
		
		//
		// 
		//
		else if (params.containsKey("cleanupOldPosts")) {

			int deletenum = 0;
			if( params.containsKey("cleanupOldPosts") ) {
				try{ deletenum = Integer.parseInt( req.getParameter("cleanupOldPosts") ); }
				catch (Exception e) {}
			}
			
			Calendar cal = Calendar.getInstance();
			// Substract x days from the calendar
			cal.add(Calendar.SECOND,  (int) (Integer.parseInt( settings.get("days_to_keep_posts") ) * this.DAY_SECS * -1 ) );
			
			BabynewsUtils.clearPostsFromDatastore(deletenum, cal.getTime());
			
		}

		//
		// This is called by Populate when it gets the list of feeds from the spreadsheet
		// it takes a feed URL, a score and a set of tags as parameters.
		//
		else if (params.containsKey("processFeed")) {
			
			String url = req.getParameter("processFeed");
			String score = req.getParameter("score");
			String tags = req.getParameter("tags");
			String image = req.getParameter("image");
			String filter = req.getParameter("filter");
			String lifespan = req.getParameter("lifespan");
			
			BabynewsFeed f = new BabynewsFeed(url, tags, score, image, filter, lifespan);

			log.info( "Processing brand new feed " + url );

			//get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();

			/*  STORE THE FEED ENTRY */
			try {				    
				pm.makePersistent(f);
			} catch ( Exception e ) {
				log.warning("Datastore error storing the new feed entry because " + e.getCause() + " and " + e.getMessage() );
				
				//re-queue
				Queue queue = QueueFactory.getQueue("feed-processing-queue");
				queue.add( TaskOptions.Builder.url(this.BASE_URL).param("processFeed",url).param("tags",score).param("score",tags).param("image",image).param("filter", filter).method(TaskOptions.Method.GET) );
			}
			finally {}
			
			pm.close();

		} 
		

		//
		// This is a queue friendly way to get rid of a post.
		// The param is a key to an individual post
		//
		else if (params.containsKey("deletePost")) {

			String k = req.getParameter("deletePost");
			if( k == null || k.length() < 1 ) {
				log.warning("Got a null or empty key" );
				return;
			}

			Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), k);

			BabynewsUtils.deleteDatastoreItemByKey( BabynewsPost.class , key);
		}
		
		
		
		//
		// This is a queue friendly way to get rid of a post.
		// The param is a key to an individual post
		//
		else if (params.containsKey("checkImage")) {

			String k = req.getParameter("checkImage");
			if( k == null || k.length() < 1 ) {
				log.warning("Got a null or empty key" );
				return;
			}

			//make a new persistence manager
			PersistenceManager pm = PMF.get().getPersistenceManager();
			
			Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), k);
			BabynewsPost post = pm.getObjectById(BabynewsPost.class, key);
			post.downloadAndStorePrimaryImage();
			
			pm.close();
		}
		
		
		
		//
		// This is called by refreshFeedsLoop to refresh the posts in an individual feed
		// 
		else if (params.containsKey("refreshFeed")) {

			String k = req.getParameter("refreshFeed");
			if( k == null || k.length() < 1 ) {
				log.warning("Got a null or empty key" );
				return;
			}

			Key key = KeyFactory.createKey(BabynewsFeed.class.getSimpleName(), k);

			BabynewsFeed feed = null;

			//get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();

			try{ 
				feed = pm.getObjectById(BabynewsFeed.class, key); 
				log.info("Refreshing feed: " + feed.getBlogTitle() );
				feed.refreshPosts();
			} /*catch( com.google.apphosting.api.DeadlineExceededException e ) {
				//Queue the refresh
				Queue queue = QueueFactory.getQueue("feed-processing-queue");
				queue.add( TaskOptions.Builder.url(this.BASE_URL).param("refreshFeed",k).method(TaskOptions.Method.GET) );
			} */ catch( Exception e ) {
				log.warning("failed to get this Feed to refresh - with key " + key.toString() + " because " + e.getMessage() + "\n" + BabynewsUtils.getStackTrace(e) ); 		
			} 
		
			pm.close();
		}
		
		
		
		//
		// This is called by refreshFeedsLoop to refresh the posts in an individual feed
		// 
		else if (params.containsKey("sortList")) {
			
			String tag = req.getParameter("sortList");
			
			if( tag == null ) {
				log.warning("did not get a good tag from sortList");
				return;
			}
			
			tag.replace('+', ' ');
			
			log.info("Sorting list " + tag);
			
			//get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();
					
			try { 
				BabynewsList list = BabynewsUtils.getListbyTag( tag);
				
				//null check
				if( list == null ) {
					log.warning("List to sort was null - aborting");
					write("List to sort was null - aborting");
					return;
				}
				
				//build the list
				list.buildList();
				
				//sort the list
				list.sort();
				
				pm.makePersistent(list);
				
				pm.close();
				
			} catch (com.google.apphosting.api.DeadlineExceededException e) {
				//pm.close();
			} catch( Exception e ) {
				log.warning("failed to sort list with tag " + tag + " because " + e.getMessage() + "\n" + BabynewsUtils.getStackTrace(e) );
				
			}  

		}

		
		
		//
		// Serve up the Tags and prefs in JSON form
		//
		else if ( params.containsKey("getTags") ) {
		
			String encoding = req.getParameter("encoding");
			if( encoding == null || encoding.length() < 1 ) encoding = "";
			
			JSONObject tags_json_response = new JSONObject();
			
			JSONObject cache_tags = (JSONObject)BabynewsUtils.cacheGet("TAGS_JSON");
			
			if( cache_tags != null )  {
				tags_json_response = cache_tags;
			} else {
				//add the tags to the JSONObjcet
				tags_json_response.put("tags",  this.getTags(false) );
			}
			
			/* 
			 * install prefs into the json object
			 */
			Map prefs = new HashMap();
			if( settings.containsKey("gadget_recent_post_time_hours"))   prefs.put("newPostSecs", Integer.parseInt( settings.get("gadget_recent_post_time_hours")) * this.HOUR_SECS );
			if( settings.containsKey("feed_refresh_cycle_seconds"))  	 prefs.put("updateIntervalSecs", settings.get("feed_refresh_cycle_seconds") );
			if( settings.containsKey("image_width"))   					 prefs.put("imageWidth", settings.get("image_width") );
			if( settings.containsKey("image_height"))   				 prefs.put("imageHeight", settings.get("image_height") );
			if( settings.containsKey("search_enabled"))   				 prefs.put("searchEnabled", settings.get("search_enabled").equals("On") ? true : false );
			if( settings.containsKey("default_selected_section"))   	 prefs.put("defaultSection", settings.get("default_selected_section") );

			if( settings.containsKey("unsupported_browser_text"))   	  prefs.put("unsupported_browser_text", settings.get("unsupported_browser_text") );
			if( settings.containsKey("firefox_support"))   	 			  prefs.put("firefox_support", settings.get("firefox_support") );
			if( settings.containsKey("ie_version"))   	  			      prefs.put("ie_version", settings.get("ie_version") );
			
			if( settings.containsKey("hashtags")) 	{
				List<String> hashtags = Arrays.asList( settings.get("hashtags").trim().split(" ") ) ;
				prefs.put("hashtags", hashtags);
			}
			tags_json_response.put( "prefs", prefs );
						
			String jsonString = tags_json_response.toJSONString();
			
			if( tags_json_response != null ) {
				resp.setContentType("application/json");
				if( encoding.equals("text") ) resp.setContentType("text/plain");
				response.getOutputStream().write( tags_json_response.toJSONString().getBytes() );
			}
			
			BabynewsUtils.cachePut("TAGS_JSON", tags_json_response, (int)this.HOUR_SECS);	
			
		}
	
		
		/*
		 * 
		 *
		else if (  params.containsKey("getPageHTML")  ) {
			
			// display the lookup form
			String list =  req.getParameter("tag");
			int pageNum =  Integer.parseInt( req.getParameter("pageNum") );
			int numItems =  Integer.parseInt( req.getParameter("numItems") );
			
            // query for the entities by name
			BabynewsList the_list = BabynewsUtils.getListbyTag( list );
			
			List<BabynewsPost> posts = new ArrayList<BabynewsPost>();
		
			List<Key> keys = the_list.getList();
			
			for( int i=0; i < keys.size(); i++) {
				Key k =  keys.get(i);
				posts.add( BabynewsUtils.getPostbyKey( k ));
			}
			
            // pass the list to the jsp
            req.setAttribute("List", the_list);
            req.setAttribute("numPages", pageNum);
            req.setAttribute("Settings", settings);
            req.setAttribute("Posts", posts);
            req.setAttribute("numItems", numItems);
            // forward the request to the jsp
            RequestDispatcher dispatcher = getServletContext().getRequestDispatcher("/page.jsp");
            try {
				dispatcher.forward(req, response);
			} catch (ServletException e) {
				e.printStackTrace();
			}   
	 
		}*/
		

		//
		// Serve up some JSON objects 
		//
		else if ( params.containsKey("getPosts") ) {
			
			int start = Integer.parseInt( req.getParameter("start") == null ? "0" : req.getParameter("start")  );
			int end = Integer.parseInt( req.getParameter("end") == null ? "0" : req.getParameter("end") );
			String encoding =  req.getParameter("encoding");
			String listName = req.getParameter("listName");
			int contentLength = Integer.parseInt( req.getParameter("contentLength") == null ? "1000" : req.getParameter("contentLength") );
			String ID = req.getParameter("ID") != null ? req.getParameter("ID") : "";
			Boolean is_cache_loop = (ID.equals("cache_loop")? true: false);
			int count = Integer.parseInt( req.getParameter("count") == null ? "-1" : req.getParameter("count") );
			
			//check out the params
			if(listName == null) return;
			
			JSONObject json_data = new JSONObject();
			BabynewsList list = null;
			Boolean base64Encoding = true;
			
			// try to get the value from the cache again
			String cache_key = listName + "_" + start + "_" + end + "_" + contentLength;
			Object cached_posts = BabynewsUtils.cacheGet( cache_key );
			
			//get the list from the cache - if it's not the cache refresh cycle 
			if( cached_posts != null && !is_cache_loop ) { 
				json_data = (JSONObject) cached_posts;
			} 
			else {
				
				list = BabynewsUtils.getListbyTag( listName );
				
				if(list != null) {
					int refresh_secs = Integer.parseInt( settings.get("feed_refresh_cycle_seconds") );			

					//see if the list has changed in the last 2 refresh cycles, if not, serve the cache
					if( cached_posts != null && list.updatedAgoMillis() > (refresh_secs * 1000 * 2) ) { 
						json_data = (JSONObject) cached_posts;
					} else {
						//it isn't in the cache or it has changed
						//REBUILD
						json_data = this.getJSONEncodedMapFromList(start, end, list, contentLength, base64Encoding );
					}
					
					/* 
					 * install feed stats into the json object
					 */
					Map stats = new HashMap();
					stats.put("numPosts", list.getList().size() );
					//stats.put("updated_string", list.getDateUpdatedString() );
					stats.put("updated_posts", list.getPostUpdateDate().getTime() );  //when the last post was added
					stats.put("refreshed", list.getUpdatedDate().getTime() );  //when the list was refreshed 
					stats.put("numSources", list.getNumBlogs() );
					stats.put("tag", list.getTag() );
					json_data.put( "stats", stats );
					
					if( start + end > 0 ) {
						String turbosetting =  settings.get( "cache_turbocharge" ).toLowerCase();
						Boolean turbo = (turbosetting.equals("on") 
								|| turbosetting.equals("true") 
								|| turbosetting.equals("1") ) ? true : false;
											
						//store the string for later getting
						//if we're in turbo mode, then we don't need to expire it so soon
						BabynewsUtils.cachePut( cache_key , json_data, (turbo ? (int)this.HOUR_SECS : refresh_secs) );
						if(turbo) log.info("Cache turnocharge is on");
						log.info("Stats is: " + stats.toString() );
						
						//Queue refresh
						//but only do this if there is a requestID and turbo mode is on
						if( ID.length() > 0 && turbo ) {
							Queue queue = QueueFactory.getQueue("cache-processing-queue");
							int delay = refresh_secs * 1000;
							TaskHandle handle = null;
							 count--;
							
							 //start anew if this is a new loop
							if( !is_cache_loop ) count = 500;
								 
							//add the refresh loop 
							try {
									if( count > 0 ) handle = queue.add( TaskOptions.Builder.url( this.BASE_URL ).param("getPosts", "1").param("ID", "cache_loop").param("count", Integer.toString(count) ).param("listName", req.getParameter("listName")).param("start", Integer.toString(start)).param("end", Integer.toString(end)).param("contentLength",Integer.toString(contentLength)).countdownMillis(delay).method(TaskOptions.Method.GET) );
								} catch( Exception e ) {
									log.warning("cache loop queue failed for: " + req.getParameter("listName") );
								} finally {}
						
						}
					}
					
					
				}
			}
			
			
			if( json_data == null ) json_data = new JSONObject();
			
			json_data.put("ID", ID);
			json_data.put("GENERATED", new Date().getTime() );
					
			//set Expires Header
			//response.setDateHeader("Expires", new Date().getTime() + (Integer.parseInt( settings.get("feed_refresh_cycle_seconds") ) * 1000) );
			
			response.setContentType(  (encoding == null) ? "application/json" : encoding.toLowerCase()  );
			response.getOutputStream().write( json_data.toJSONString().getBytes() );
			response.getOutputStream().close();	
			
			//try{ log.info( "Got " + Math.abs(end - start) + " posts in: " + Math.abs( start_time - new Date().getTime() ) + "ms" ); }
			//catch (Exception exe) {};
			
		}
	
	
		
		/*
		 * Process Track clicks
		 */
		else if (params.containsKey("postClick")) {

			String k = req.getParameter("postClick");
			if( k == null || k.length() < 1 ) {
				log.warning("Got a null or empty key" );
				return;
			}

			Queue queue = QueueFactory.getDefaultQueue();

			//for each feed, add a task to refresh it
			queue.add( TaskOptions.Builder.url(this.BASE_URL).param("processPostClick",k).method(TaskOptions.Method.GET) );			
		}
		
		
		/*
		 * Process Track clicks
		 */
		else if (params.containsKey("processPostClick")) {

			String k = req.getParameter("processPostClick");
			if( k == null || k.length() < 1 ) {
				log.warning("Got a null or empty key" );
				return;
			}

			Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), k);

			BabynewsPost p = BabynewsUtils.getPostbyKey(key);
			
			// get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();

			if( p != null ) p.clicked();
			
			pm.close();
		}
	
		
		
		else if (params.containsKey("refer")) {

			String link = req.getParameter("refer");
			
			if ( link == null || link.length() < 1 ) link = "http://www.puddleplay.com/news"; 
			
			
			try {
				 String urlWithSessionID = resp.encodeRedirectURL(link);
				 resp.setHeader("Referer", "http://www.puddleplay.com/news");
				 resp.setHeader("Referrer", "http://www.puddleplay.com/news");
				 resp.sendRedirect( urlWithSessionID );
				
			} catch (Exception ex) {
				log.warning( "Something prevented forward " + link );
	    		log.warning( "Message: " + ex.getMessage());
	    		log.warning( "Cause: " + ex.getCause() );
	    		log.warning( BabynewsUtils.getStackTrace(ex) );
			}
			
		}
		
		
		else if (params.containsKey("printHeaders")) {
			
			Enumeration<String> h = req.getHeaderNames();
			while( h.hasMoreElements() ) {
				String name =  h.nextElement();
				write( "<h3>" + name + " : " + req.getHeader( name) + "</h3>");
				//log.info(msg);
			}			
		}
		
		
		/*
		 * Send a post email - for sharing
		 */
		else if (params.containsKey("sendPost")) {
			
			String key_string = req.getParameter("key");
			
			//LinkedHashMap<String, String> errors = new LinkedHashMap<String, String>();
			Boolean status = true;
			String error = "";
			BabynewsPost post = null;
			
			try {
				if( key_string==null ||  key_string.length() < 1 )  throw new MessagingException("No post ID supplied.");

				Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), key_string );
				
				post = BabynewsUtils.getPostbyKey(key);
				if( post == null ) throw new MessagingException("This post has been removed.");
				
				Boolean validRecipient = true;
				Boolean validSender = true;
				
				InternetAddress recipient = null;
				InternetAddress sender = null;
				
				//test the addresses
				try { recipient = new InternetAddress(req.getParameter("to"), true); }
				catch (AddressException ex){ throw new MessagingException("Check the recipient email address.");}
				
				try { sender = new InternetAddress(req.getParameter("from"), true); }
				catch (AddressException ex){ validSender = false; }
			
				if( !BabynewsUtils.isValidEmailAddress( req.getParameter("to") ) )  throw new MessagingException("Check the recipient email address.");
				if( !BabynewsUtils.isValidEmailAddress( req.getParameter("from") ) )  validSender = false;
				
				/*
				 * Send the content
				 * 
				 */
				Properties props = new Properties();
				Session session = Session.getDefaultInstance(props, null);
				
				MimeMessage msg = new MimeMessage(session);

				//set Sender
				try {
					//if( sender != null && validSender ) msg.setFrom(sender);
					msg.setFrom(new InternetAddress("info@puddleplay.com", "puddleplay"));
				} catch (Exception e) {
					throw new MessagingException();
				}

				//set Recipient
				try {
					if( recipient != null && validRecipient ) msg.addRecipient(Message.RecipientType.TO, recipient);
					else throw new MessagingException("Check the recipient email address.");
				} catch (Exception e) {
					throw new MessagingException("Check the recipient email address.");
				}
									
				msg.setSubject( post.getTitle() );
				
				String fromname = req.getParameter("from");
				
				//msg.setHeader("Content-Type", "text/html");
				//msg.setHeader("Charset", "iso-8859-1");
				//msg.setHeader("Content-Transfer-Encoding", "7bit");
				
				String message = "<html> <head> "
				+ "<style type=\"text/css\">"
				
				+ ".part { "
				+ "  color: #444; "
				+ "  font-style: normal;"
				+ "  font-size: 14px;"
				+ "  margin-top: 20px;"
				+ "  text-decoration: none;"
				+ "  }"
				
				+ "</style> "
				+ "</head> <body bgcolor=\"#FFFFFF\">";		
				
				String greeting = (fromname != null && fromname.length() > 0) ? "<b>" + fromname + "</b> wants to share this post with you from puddleplay.com <a href=\"http://www.puddleplay.com\" target=\"_blank\">http://www.puddleplay.com</a>" : "";
				
				message += "<div style='border: 1px solid #DDD; color: #444; margin: 15px; padding: 10px;'><p>" + greeting + "</p>";
				
				/*
				message += "<div>";
				message += 		"<p>Here's a link to the original post: " + "<a href=" + post.getPostURL() + ">" + post.getPostURL() + "</a></p>";
				message += "</div>";
				*/					
				
				message += "<div style='margin-top: 20px;'>";
				message += 		"<div><h2>";
				message += 			"<a href=" + post.getPostURL() + " target=\"_blank\">" + post.getTitle() + "</a>";
				message += 		"</h2></div>";
				message +=		"<h3> Posted on <a href=\"" + post.getBlogURL() + "\" target=\"blank\">" + post.getBlogTitle() + " <h3>";
				message += "</div>";
				
				message += "<div style='margin-top: 20px;'>";
				message += 		post.getRawContent();
				message += "</div>";
				
				message +=  "<p>Found this using puddleplay.com: <a href=\"http://www.puddleplay.com\" target=\"_blank\">http://www.puddleplay.com</a></p>";
				
				message += "</div>";
				message += "</body>";
				message += "</html>";
				
		        msg.setContent(message, "text/html");
				
				Transport.send(msg);

			} catch (MessagingException e) {
				status = false;
				error = e.getMessage();	
				
				log.warning( "Got a messageing exception   \n" + BabynewsUtils.getStackTrace(e) );
					
			} catch (Exception e) {
				status = false;
				error = e.getMessage();	
				
				log.warning( "Got a messageing exception  \n" + BabynewsUtils.getStackTrace(e) );

			}
			
			JSONObject json_data = new JSONObject();
			json_data.put("status", status ? "OK" : "ERROR");
			if( !status )  json_data.put("error", error);
			if(post!=null) {
				json_data.put("key", post.getKeyString() );
				json_data.put("title", post.getTitle());
				json_data.put("blog", post.getBlogTitle());
			} 
			
			response.setContentType( "application/json" );
			response.getOutputStream().write( json_data.toJSONString().getBytes() );
			response.getOutputStream().close();	
			
		}
		
		
		
		
		/*
		 * 
		 * ADMIN STUFF
		 * 
		 */
		
		
		/*
		 * stats the cache
		 */
		else if (params.containsKey("showlist")) {

			String lname = req.getParameter("showlist").trim();
			
			BabynewsList list = BabynewsUtils.getListbyTag( lname );
			
			if( list == null ) {
				write("List " + lname + " not found.");
				return;
			}
			
			log.info(lname);
			log.info(list.getTag());
			
			MemcacheService cache = BabynewsUtils.getCacheManager();
			
			resp.setContentType("text/html");
			
			String message = "<html> <head> "
				+ "<style type=\"text/css\">"
				
				+ ".row { "
				+ "  color: #444; "
				+ "  font-style: normal;"
				+ "  font-size: 14px;"
				+ "  margin-top: 20px;"
				+ "  text-decoration: none;"
				+ "  }"
				
				+ ".cell { "
				+ "  color: #444; "
				+ "  font-style: normal;"
				+ "  font-size: 14px;"
				+ "  margin-top: 20px;"
				+ "  text-decoration: none;"
				+ "  }"
				
				+ "</style> "
				+ "</head> <body bgcolor=\"#FFFFFF\">";		
			
			
			
			write( "<h1>" + list.getTag() + "</h1>" );
			write( "<h2> Last updated: " + list.getDateUpdatedString() + "</h2>" );
			write( "<h2> Newest post added: " + list.getPostUpdateDate().toString() + "</h2>" );
			
			for( Key key : list.getList() ) {
				
				try {
					
					BabynewsPost post = BabynewsUtils.getPostbyKey(key);
					
					write( "<table>" );
					write( "<tr>" );
						write( "<td>" );
							write( "<h3>" + post.getTitle() + "</h3>" );
							if( cache.contains( key.getName() ) )  write( "In Cache" );
						write( "</td>" );	
						
						write( "<td>" );
						write( "</td>" );
						
						write( "<td>" );
							
						write( "</td>" );
					
					write( "</tr>" );

					write( "<tr>" );

						write( "<td>" );
							write( post.getBlogTitle() );
						write( "</td>" );
						
						write( "<td>" );
							write( post.getTextContent(250) );
						write( "</td>" );
						
						write( "<td>" );
							write( Integer.toString(post.getScore(false)) );
							write( post.getScoreDescription() );
						write( "</td>" );
				
					write( "</tr>" );
					
					write( "</table>" );
				} catch( Exception e ) {
					break;
				}
				
			}

			write("</body></html>");
		}
		

		//
		//serve the image based on the parent and object keys given
		//
		else if ( params.containsKey("printpost") ) {
				
			String key_string = req.getParameter("printpost").trim();
		
			//make a new persistence manager
			PersistenceManager pm = PMF.get().getPersistenceManager();
			
			Key key = KeyFactory.createKey(BabynewsPost.class.getSimpleName(), key_string);
			BabynewsPost post = pm.getObjectById(BabynewsPost.class, key);
				
			write( "<h2> Post title: " + post.getTitle() + "</h2>" );
			write( "<h3> Blog title: " + post.getBlogTitle() + "</h3>" );
			write( "<h3> Published: " + post.getPublishedDate() + "</h3>" );
			
			write( "<h3> Raw content: " + post.getRawContent() + "</h3>" );
			write( "<h3> Raw description: " + post.getRawDescription() + "</h3>" );
			
			post.downloadAndStorePrimaryImage();
			
			pm.close();
					
		}

		
		//
		// This checks the spreadsheet for data and makes new lists.
		// 
		else if (params.containsKey("updatedSpreadsheet")) {

			try {
				long start = 0;
				long end = 0;
				String update = "";
				start =  qs.getApiTimeInMegaCycles();
				//read the spreadsheet and get all the feeds in there
				populateFeedsList();
				/////
				end = qs.getApiTimeInMegaCycles();
				update = "Poplate feeds list took: " + Double.toString(qs.convertMegacyclesToCpuSeconds(end - start));
				response.getWriter().println( update );
				log.info( update );        		
			} catch (com.google.apphosting.api.DeadlineExceededException e) {
				//we ran out of time!
				log.warning("AHHHHHHHHH! We ran out of execution time: " + e.getMessage() );      		
			} finally {
				//print the response run time
				write( "Recache process run time: " + Math.abs( start_time - new Date().getTime() ) + "ms" );
			}

		} 

		
		//
		// Really reset the entire thing
		//
		else if ( params.containsKey("reset") ) {
			
			log.info("DOING A FULL RESET!!!!!");
			this.ohShit();
			write( "<h1>Resetting the Babynews Server - check back in 5 minutes</h1>" );
		}
		
		
		//
		// This clears the cache and datastore of all entries
		// It's params are repopulate - when set to 1 will call populate when the DB is empty
		//
		else if (params.containsKey("cleardb")) {

			long start = 0;
			long end = 0;
			String update = "";
			start =  qs.getApiTimeInMegaCycles();

			int deletenum = 0;
			if( params.containsKey("cleardb") ) {
				try{ deletenum = Integer.parseInt( req.getParameter("cleardb") ); }
				catch (Exception e) {}
			}

			int remainder = 0;
			
			try {

				//clear the memcache too
				//if( cache != null ) cache.clear();
				
				//get a pm for what we're about to do
				PersistenceManager pm = PMF.get().getPersistenceManager();
				
				// Delete all the Feeds
				while( !BabynewsUtils.clearAllFeedsFromDatastore(pm) ) {}
			
				// Delete all the Lists
				while( !BabynewsUtils.clearAllListsFromDatastore(pm) ) {}
				
				/////
				BabynewsUtils.clearPostsFromDatastore( deletenum );  
				/////
				
				pm.close();
				
				/*
				 * Clear the Cache
				 */
				BabynewsUtils.clearCache();

				log.info( "Remainder of Posts to delete is: " + remainder );
				
			} catch (Exception e) {
				//we ran out of time!
				log.warning("AHHHHHHHHH!  We had an exception while clearing the DB: " + e.getMessage() );
				e.printStackTrace();

			} finally {

				//if we need to, send another request to cleardb
				// or do repopulate
				int repopulate = 0;
				if( params.containsKey("repopulate") ) {
					try{ repopulate = Integer.parseInt( req.getParameter("repopulate") ); }
					catch (Exception e) {}
				}
				
				Queue queue = QueueFactory.getQueue("datastore-cleanup-queue");
				//if there aren't any more posts to clean see if we can queue the repopulate task
				if( repopulate > 0 ) {
					int delay = 1000*60*0; //two minute
					queue.add( TaskOptions.Builder.url(this.BASE_URL).param("updatedSpreadsheet","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
				}

				//log how long it took
				end = qs.getApiTimeInMegaCycles();
				update = "ClearDB took: " + Double.toString(qs.convertMegacyclesToCpuSeconds(end - start));
				write( update );
				log.info( update );       

			}

		} 
		
		
		/*
		 * clear the cache
		 */
		else if (params.containsKey("clearcache")) {

			/*
			 * Clear the Cache
			 */
			write( "<h2>Cleared the memcache.</h2>" );
			log.info("Clearing the memcache");
			
			write( BabynewsUtils.getCacheStats() );
			
			BabynewsUtils.getCacheManager().clearAll();
		}
		
	
		/*
		 * stats the cache
		 */
		else if (params.containsKey("cachestats")) {

			String lname = req.getParameter("cachestats");
			
			write( "<h2>Memcache Stats for " + lname + "</h2>" );
			
			write( BabynewsUtils.getCacheStats() );
			write( "<hr>" );
			
			BabynewsList list = BabynewsUtils.getListbyTag( lname );
			
			MemcacheService cache = BabynewsUtils.getCacheManager();
			
			if( list == null ) {
				write("List " + lname + " not found!");
				return;
			}
				long nc = 0;
				int size = list.getList().size();
				
				if(size == 0) write("the list " + lname + "is empty" );
				
				for( Key key : list.getList() ) {
					if( key!=null && cache.contains( key.getName() ) ) nc++;
				}
				
				write( "<h2>" + list.getTag() + "\t" + nc + "/" + size + " (" + ((nc/size)*100) + "% in cache)" + "</h2>" );
		
		}
		
		/*
		//
		// Show the admin panel
		//
		else if ( params.containsKey("console") ) {
			
			//see if the list is already in the cache
			//get a cache manager
			Cache cache = BabynewsUtils.getCacheManager();  
			
			//Set<Object> set = cache.keySet();
						
			//set the output type to text
			resp.setContentType("text/html");
			write( "<head>" + "<style type=\"text/css\"> body {font-family: Arial, sans-serif; font-size: 10pt; color:#333} a {color:#0077FF} </style>" + "</head><html>" );           	

			CacheStatistics stats = cache.getCacheStatistics();
			write( "hits: " + stats.getCacheHits() );
			write( "misses: " + stats.getCacheMisses() );
			write( "count: " + stats.getObjectCount() );
		//	write( "accuracy: " + stats.getStatisticsAccuracy() );
			
			write( "<br>" );
			write( "<br>" );
			
			write("<table>");
			write("<tr>");
			write("<td>Name</td>");
			write("<td>Creation Time</td>");
			write("<td>Expiration Time</td>");
			write("<td>Hits</td>");

			write("</tr>");
			
			
			//for( Object o : set ) {
				CacheEntry entry = BabynewsUtils.cacheGetCacheEntry("SETTINGS");
				
				write("<tr>");
				write("<td>" +  "SETTINGS" + "</td>");
				write("<td>" +  new Date( entry.getCreationTime() ).toString() + "</td>");
				write("<td>" +  new Date( entry.getExpirationTime() ).toString() + "</td>");
				write("<td>" +  entry.getHits() + "</td>");
				write("</tr>");
			//}
			
			
			write("</table>");
			
			//close the html
			write( "</html>" );
			
		}
		*/
		
	}
	
	
	
	

	/******
	 * Make the list of Posts sorted by which ones are the highest ranked
	 */
	private void makeSortedLists( ) {


		Queue queue = QueueFactory.getQueue("feed-processing-queue");
		
		
			/*
			 * Process all of the Tag-based lists
			 */
			Map<String,List> tagMap = this.getTags( false );
			
			log.info( "Got a tagMap with: " + tagMap.toString() );
			
			write( "Got a tagMap with: " + tagMap.toString() );

		
			for( String group : tagMap.keySet() ) {
				
				log.info( "Looking at group: " + group );
				write("Looking at group: " + group );
				
				//get the tags from this group
				List<String> tags = tagMap.get(group);
				
				//go through the list of tags and process each one 
				for( String tag : tags ) {
					
					log.info( "Sorting tag: " + tag );
					write( "Sorting tag: " + tag );
					//skip the lists we already made
					//if( tag.equals(whats_hot_list.getTag()) || tag.equals(most_recent_list.getTag()) ) continue;
				
					/*
					 * Queue the sorting 
					 */
					//add 1/10 of the refresh time as wiggle room for the delay
					long delay = (long)Math.random() * (1000 * Integer.parseInt(settings.get("feed_refresh_cycle_seconds")))/10 ;
					queue.add( TaskOptions.Builder.url(this.BASE_URL).param("sortList", tag).countdownMillis(delay).method(TaskOptions.Method.GET) );
	
				}
			}
		
		
		//pm.close();
		
	}
	
	

	


	/******
	 * Make the list of Posts sorted by which ones are the highest ranked
	 */
	/*
	private void makeSortedLists() {

		//get a pm for what we're about to do
		PersistenceManager pm = PMF.get().getPersistenceManager();

		List<BabynewsFeed> feeds = BabynewsUtils.getAllOf( BabynewsFeed.class );
		
		Queue queue = QueueFactory.getQueue("feed-processing-queue");
		
		//don't bother continuing if the feeds list is null
		if( feeds.size() == 0 ) {
			log.warning( "AAAAAHHHHH! there were no BabynewsList feeds in the datastore - aborting" );
			return;
		} 	
		
		Map<String, BabynewsList> lists = new HashMap<String, BabynewsList>();
		
		Extent<BabynewsList> listExtent = pm.getExtent(BabynewsList.class, false);
		for( BabynewsList list : listExtent ) {
			lists.put( list.getTag() , list );
		}
		
		
		//make a fresh new whats hot list
		BabynewsList whats_hot_list = lists.get("What's Hot"); 
		if( whats_hot_list == null ) {
			whats_hot_list = new BabynewsList( BabynewsList.WHATS_HOT_TYPE, "What's Hot" ); 
			lists.put("What's Hot", whats_hot_list);
			pm.makePersistent(whats_hot_list);
		}
		
		//make a new fresh new most recent list
		BabynewsList most_recent_list = lists.get("Most Recent"); 
		if ( most_recent_list == null ) {
			most_recent_list = new BabynewsList( BabynewsList.MOST_RECENT_TYPE, "Most Recent" );
			lists.put("Most Recent", most_recent_list);
			pm.makePersistent(most_recent_list);
		}
			
		int numBlogs = 0;
		
		//clear the list for getting new posts
		most_recent_list.clear();
		whats_hot_list.clear();

		//get the number of top posts to include
		int num = Integer.parseInt( settings.get("top_post_num") );
		if( num < 1 ) num = 2;
		
		//go through all the feeds and get the Posts into the master list
		for( BabynewsFeed feed : feeds ) {
			log.info("Getting posts from feed " + feed.getBlogTitle() + "  " + feed.getURL());
			
			//get the first few from each blog
			whats_hot_list.addLots(feed.getPosts( whats_hot_list.getSortType(), num ));
			most_recent_list.addLots(feed.getPosts( most_recent_list.getSortType(), num ));
			
			numBlogs++;
		}

		//set the number of blogs we used
		whats_hot_list.setNumBlogs( numBlogs );
		most_recent_list.setNumBlogs( numBlogs );
		
		
		//add 1/10 of the refresh time as wiggle room for the delay
		long delay = (long)Math.random() * (1000 * Integer.parseInt(settings.get("feed_refresh_cycle_seconds")))/10 ;
		queue.add( TaskOptions.Builder.url(this.BASE_URL).param("sortList", "What's Hot").countdownMillis(delay).method(TaskOptions.Method.GET) );

		
		//add 1/10 of the refresh time as wiggle room for the delay
		delay = (long)Math.random() * (1000 * Integer.parseInt(settings.get("feed_refresh_cycle_seconds")))/10 ;
		queue.add( TaskOptions.Builder.url(this.BASE_URL).param("sortList", "Most Recent").countdownMillis(delay).method(TaskOptions.Method.GET) );

		
	
		//make a new List for every Tag
		Map<String,List> tagMap = this.getTags(false);
	
		for( String group : tagMap.keySet() ) {
			
			//get the tags from this group
			List<String> tags = tagMap.get(group);
			
			log.info("Working on group: " + group );

			//go through the list of tags and process each one 
			for( String tag : tags ) {
				
				//skip the lists we already made
				if( tag.equals(whats_hot_list.getTag()) || tag.equals(most_recent_list.getTag()) ) continue;
			
				numBlogs = 0;
				
				//get the list to work on that matches the tag
				BabynewsList list = lists.get(tag); 
				
				if(list == null) {
					log.warning("The Tags list contained a tag: " + tag + " that didn't exist in the datastore");
					continue;
				}
				
				//clear the list for getting new posts
				list.clear();
				
				//add the feeds that match the tag
				for( BabynewsFeed feed : feeds ) {
					//log.info("Getting posts from feed " + feed.getBlogTitle() + "  " + feed.getURL());
					if( feed.getTags().contains( tag ) ) {
						list.addLots( feed.getPosts( list.getSortType(), 25 ) );
						numBlogs++;
					}
				}
				
				list.setUpdated();
				list.setNumBlogs(numBlogs);		
			
				//add 1/10 of the refresh time as wiggle room for the delay
				delay = (long)Math.random() * (1000 * Integer.parseInt(settings.get("feed_refresh_cycle_seconds")))/10 ;
				queue.add( TaskOptions.Builder.url(this.BASE_URL).param("sortList", tag).countdownMillis(delay).method(TaskOptions.Method.GET) );

				
				log.info("Made list " + tag );

			}
			
		}
		
		pm.close();
	    
	}
	*/


	/**
	 * Makes a JSONObject out of the requested posts
	 * 
	 * @param start				the element to start with
	 * @param end				the last element to include
	 * @param the_list			the BabynewsList source of the data
	 * @param contentLength		how many characters of the content to include
	 * @param encode 			flags encoding the content and title fields of the json response
	 * @return A JSONObject representing the data
	 */
	private JSONObject getJSONEncodedMapFromList( int start, int end, BabynewsList the_list, int contentLength, Boolean encode ) {
		
		JSONObject the_list_json = new JSONObject();
							
		if( the_list == null ) {
			log.warning("Got a null list as an argument when creating the JSON string. - aborting");
			return the_list_json;
		}
		
		List<Key> key_list = the_list.getList();
		
		if( key_list == null ) {
			log.warning("AHHHHHH! There are no posts in the LIST - ABORTING");
			return the_list_json;
		}
		
		//make sure the start and end are within bounds
		if( start < 0 || start > key_list.size() ) {
			log.info( "Got a start of " + start + " which is either less than 0 or is greater than the list size");
			if (start < 0) start = 0;
			else start = key_list.size();
		}
			
		if( end < 0 || end > key_list.size() ) {
			log.info( "Normalized " + end + " to " + key_list.size() );
			end = key_list.size();
		}
								
		// build the JSON object
		the_list_json = new JSONObject();
		
		int offset = 0;
		if( the_list.getTag().equals("Daily") ) {
			offset = 1;
			
			Map obj =  BabynewsUtils.getSpecialPost().getPostHashMap( contentLength, encode );
			the_list_json.put( 0, obj );
			
		}
					
		for( int index=start ; index < (end-offset) && index < key_list.size() ; index++ ) {
			 
			BabynewsPost post = BabynewsUtils.getPostbyKey( key_list.get(index) );
			if( post == null ) {
				//we got a null post so there is a post in the list that is not in the DB or cache
				// remove the post from the list and go back one step in the loop.
				key_list.remove(index);
				index--;
				continue;
			} else {
				Map obj = post.getPostHashMap( contentLength, encode );
				if( obj == null ) {
					key_list.remove(index);
					index--;
					continue;
				}
				the_list_json.put( Integer.toString(index + offset), obj );
			}
			
		}
		
	
		return the_list_json;
		
	}
	


	private String makeWhatsHotHTML( int num, Boolean regenerate_the_list ) {

		//create the output string
		String out = "";

		BabynewsList whats_hot_list = null; 

		// get the value from the cache.
		if( BabynewsUtils.isCached("whats_hot_list_HTML") && !regenerate_the_list ) {
			//if the pre-made HTML is in the cache, throw that up there. 
			String html = (String) BabynewsUtils.cacheGet("whats_hot_list_HTML");
			return html;
		} else {
			//get the list from the cache or the datastore
			whats_hot_list = BabynewsUtils.getListbyTag( "What's Hot"  );
		}
		
		if( whats_hot_list == null ) {
			log.warning("AHHHHHH! Couldn't find the WHATS_HOT_LIST in the datastore or the memcache - ABORTING");
			//this.ohShit();
			return "Couldn't find the what's hot list in the cache or datastore";
		}

		//go through the list items and print them out in HTML
		out += ("<h1>What's Hot</h1> updated: " + whats_hot_list.getDateUpdatedString() + " from " + whats_hot_list.getNumBlogs() + " sources <hr><br>");

		//	log.info("found this many posts in the List " +  results.get(0).getList().size() );
		for( Key key :  whats_hot_list.getList() ) {

			if( num == 0 ) break;

			//try to get the post from the cache or datastore
			BabynewsPost p = BabynewsUtils.getPostbyKey(key);
			if( p == null ) continue;

			out += ("<table border=0>");
			out += ( "<tr width=\"100%\">" );
			//out += ( "<td width=\"200\" align=\"center\">" + p.getImageTag(false) + "</td>" );
			out += ( "<td width=\"700\">" + "<a href=\"" + p.getPostURL() + "\"><h3>" + p.getTitle() + "</h3></a>" + p.getTextContent( 250 ) + "<br>" );
			out += ( "<p>Posted: " + p.getPublishedDateString() + " on <a href=\"" + p.getBlogURL() + "\">" + p.getBlogTitle() + "</a></td>" );
			out += ( "<td width=\"25\"></td>");
			out += ( "<td align=\"left\"><b>Score: " + p.getScore( false ) + "</b><p>" + p.getScoreDescription() + "</td>" );
			out += ("</table>");
			out += ( "<p>" );
			out += ( "<hr>" );
			out += ( "<p>" );

			num--;
		}

		return out;
	}
	
	
	/*
	 * Run this when the WHAT'S HOT list is not found.  
	 * This method checks to see what shape we're in and takes corrective action
	 */
	private void ohShit() {
		
		//get the Queues
		Queue queue = QueueFactory.getDefaultQueue();
		int delay = 0;
		
		//manually make the what's hot list in case the feeds are in there.  
		// the lists will be cached and available for serving even if we clear the DB
		delay = 1000*0; //0 secs
		queue.add( TaskOptions.Builder.url(this.BASE_URL).param("make_sorted_lists","").countdownMillis(delay).method(TaskOptions.Method.GET) );		
		
		//clear out the DB and repopulate
		delay = 1000*15; //15 second
		TaskHandle handle = queue.add( TaskOptions.Builder.url(this.BASE_URL).param("cleardb","10000").param("repopulate","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
		
		//wait 30 secs
		
		//restart the refresh loop
		delay = 1000*60*3; //3 minutes
		//queue.add( TaskOptions.Builder.url(this.BASE_URL).param("refreshFeedsLoop","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
		
		//wait 15 secs
		
		//manually make the what's hot list AGAIN to be sure it happens
		//delay = 1000*75; //75 secs
		//queue.add( TaskOptions.Builder.url(this.BASE_URL).param("make_sorted_lists","").countdownMillis(delay).method(TaskOptions.Method.GET) );		
		
		/*
		 * Clear the Cache
		 */
		BabynewsUtils.clearCache();
		
	}


	/**
	 * Get spreadsheet data and translate this into a list of feeds
	 */
	private String populateFeedsList() {

		this.settings = BabynewsServlet.getSettings( true );
		
		String response = "";
		
		//refresh the tags from the spreadsheet
		BabynewsServlet.getTags(true);
		
		//refresh the scores from the spreadsheet
		BabynewsServlet.getScoring(true);
		
		// service to get spreadsheet data
		SpreadsheetService service = this.getSpreadsheetService();
		List<WorksheetEntry> worksheets = BabynewsServlet.getWorksheets( service );
		
		//get a pm for what we're about to do
		PersistenceManager pm = PMF.get().getPersistenceManager();

		// Get the spreadsheet to load
		URL feedURL = null;

		try {
			//go through each of the worksheets
			for (WorksheetEntry worksheet_entry : worksheets) {
				String title = worksheet_entry.getTitle().getPlainText();
				
				/*
				 * 
				 * if it's the feeds worksheet
				 */
				if( title.equalsIgnoreCase( settings.get("feeds_sheet") ) ) {

					//get the data in the feeds worksheet
					URL listFeedUrl = worksheet_entry.getListFeedUrl();
					ListFeed feed = service.getFeed(listFeedUrl, ListFeed.class);
					
					/*
					 * SYNCH FEEDS
					 */
					
					// step 1: get the URLs of the feeds in the datastore and map them to the datastore item
					Map<String, BabynewsFeed> existingURLs = new HashMap<String, BabynewsFeed>();

					Query feeds_query = pm.newQuery(BabynewsFeed.class);
					try {
						List<BabynewsFeed> feeds = (List<BabynewsFeed>) feeds_query.execute();
						
						for( BabynewsFeed f : feeds ) {
							existingURLs.put(f.getURL().getValue(), f);
						}
						
						log.info("Found " + feeds.size() + " FEEDS in the datastore");
					} catch (Exception e) {
						log.warning("Had an error while trying to retrieve the blog feeds from the datastore: " + e.getMessage() );
					} finally {
						feeds_query.closeAll();
					}
					

					log.info(" found " + feed.getEntries().size() + " feed entries in the spreadsheet." );
					
					if( feed.getEntries().size() < 1 ) {
						return " no feeds found in the spreadsheet ";
					}
					

					//step 2: go through the list of URLs from the spreadsheet and find any URLs 
					//        in there that aren't in the list of feeds
					for(ListEntry entry : feed.getEntries()) {
						//for each line, create a feed object with the data provided
						//create a Feed object to add parts to below

						String URL = entry.getCustomElements().getValue("URL");
						String TAGS = entry.getCustomElements().getValue("Tags");
						
						String SCORE = "0";
						if( entry.getCustomElements().getValue("Score") != null )
							SCORE = entry.getCustomElements().getValue("Score");
						
						String IMAGE = entry.getCustomElements().getValue("Image");
						String FILTER = entry.getCustomElements().getValue("Filter");
						String LIFESPAN = entry.getCustomElements().getValue("Lifespan");
						
						//fix the data
						if( URL == null || URL.length() < 1 ) {
							log.warning("found a bad URL in the spreadsheet: " + URL );
							continue;
						} else {
							try { URL u = new URL( URL ); }
							catch ( MalformedURLException e ) {
								log.warning("found a bad URL in the spreadsheet: " + URL );
								continue;
							}
						}
						
						if( TAGS == null ) TAGS = "";
						if( SCORE == null ) SCORE = "0";
						if( IMAGE == null ) IMAGE = "";
						if( FILTER == null ) FILTER = "";
						if( LIFESPAN == null ) LIFESPAN = "";

						//if the existing feeds list contains this one
						if( existingURLs.containsKey(URL) ) {
							
							//we might as well update the data if it's existing
							BabynewsFeed f = existingURLs.get(URL);
							f.setTags( TAGS );
							f.setScore( SCORE );
							f.setImageURL( IMAGE );
							f.setFilter( FILTER );
							f.setLifespan( LIFESPAN );
							
							//nullify the last updated date so it will force a refresh
							f.setLastUpdated( null );

							log.info("Updated feed " + f.getBlogTitle() );

						} else {
							// or add it to the datastore if it's a new one
							Queue queue = QueueFactory.getQueue("feed-processing-queue");
							queue.add( TaskOptions.Builder.url(this.BASE_URL).param("processFeed",URL).param("tags",TAGS).param("score",SCORE).param("image",IMAGE).param("filter", FILTER).param("lifespan", LIFESPAN).method(TaskOptions.Method.GET) );
							log.info("Creating a new feed " + URL );
						}
						
						//remove the URL from the set of existing feeds
						existingURLs.remove(URL);

					}
					
					//step 3: remove all the items left in the existing list that weren't found in the spreadsheet
					try {
						
						//tell the feeds to destroy their posts
						for( BabynewsFeed f : existingURLs.values() ) { 
							log.info("Destroying feed " + f.getBlogTitle() );
							f.destroy(); 
						}
						
						pm.deletePersistentAll( existingURLs.values() );
					} catch (Exception e) {
						log.warning("failed to delete an object from the collection " + e.getMessage() + " ----- " + e.getCause());
					}
					
					response = "Successfully synched with the spreadsheet data at: " + new Date().toString();
					
				}

			}
		} catch (Exception e) {
			log.warning( "ERROR: Had a problem getting the feeds spreadsheet data: " + e.toString() );
			
			response = "Had an error while synching with the spreadsheet data";
			response += "because " + e.getCause();
			response += "and " + e.getMessage();
			response += BabynewsUtils.getStackTrace(e);
			
			BabynewsUtils.sendEMail( settings.get("emailTo").split(","), "ppNews: wasn't able to update from the Spreadsheet",  "The GAE tried to get info from the spreadsheet but encountered a problem (see below).  This is probably benign if it happens every once in a while, but could be a real issue if it occcurs frequently. The cause of this problem was: " + e.getCause() + " and " + e.getMessage() + "\n\n\n\n" + BabynewsUtils.getStackTrace(e) );
		
			Queue queue = QueueFactory.getDefaultQueue();
			int delay = 0;
			
			//add a process to the queue to re-try populating the backend
			//delay = 60*1000; //1 minute
			//queue.add( TaskOptions.Builder.url(this.BASE_URL).param("updatedSpreadsheet","1").countdownMillis(delay).method(TaskOptions.Method.GET) );
		}

		//close the PM
		pm.close();
		
		return response;
	}

	

	/**
	 * A method to shorten writing out to the response page
	 * 
	 * @param s: the string to output to the response
	 */
	private void write( String s ) {
		try {
			response.getWriter().println( s );
			//response.getWriter().flush();
		} catch (IOException e) {
			log.info( "Failed to write to the http response" + e.getCause() );
		}
	}

	
	
	public static List<BabynewsScore> getScoring( Boolean forceRebuild ) {
		
		if( BabynewsUtils.isCached("SCORES") && !forceRebuild ) return (List<BabynewsScore>) BabynewsUtils.cacheGet("SCORES");
		else {
		
			ArrayList<BabynewsScore> scores_new = new ArrayList<BabynewsScore>();
			
			// Make sure we're logged in to get spreadsheet data
			try {
				// service to get spreadsheet data
				SpreadsheetService service = BabynewsServlet.getSpreadsheetService();
				List<WorksheetEntry> worksheets = BabynewsServlet.getWorksheets( service );
				
				// go through each of the worksheets
				for (WorksheetEntry worksheet_entry : worksheets) {
					String title = worksheet_entry.getTitle().getPlainText();
	
					/*
					 * Look in the Settings worksheet first
					 */
					//if it's the scoring preferences worksheet
					if( title.equalsIgnoreCase( BabynewsUtils.getSetting("scoring_sheet") ) ) {

						//get the settings for the scoring
						URL listFeedUrl = worksheet_entry.getListFeedUrl();
						ListFeed feed = service.getFeed(listFeedUrl, ListFeed.class);
						int num = 0;
						for (ListEntry entry : feed.getEntries()) {

							try { //get the scoring values
								String key = entry.getCustomElements().getValue("key");
								Boolean qualifier = entry.getCustomElements().getValue("qualifier").contains("over") ? BabynewsScore.OVER : BabynewsScore.UNDER;
								int value = Integer.parseInt(entry.getCustomElements().getValue("value"));
								int score_change = Integer.parseInt( entry.getCustomElements().getValue("score") );

								//make a new score object and add it to the list
								BabynewsScore score = new BabynewsScore( key, qualifier, value, score_change );

								scores_new.add( score );
							} catch ( Exception e ) {
								log.warning(" there was an error while trying to create a score with params " 
										+ entry.toString() + " and it will be ignored " + e.getCause() + " " + e.getMessage() );
							}

						}

						
					}
	
				}
				
				
			} catch (Exception e) {
				log.warning( "There was an exception getting the settings from the spreadhsheet " + e.toString());
			}
			
			
			if( scores_new.size() > 0 ) {
				// Put the value into the cache.
				BabynewsUtils.cachePut("SCORES", scores_new, (int)BabynewsServlet.DAY_SECS * 7);
			}

			return scores_new;
		}
	}
	
	
	
	public static Map<String,String> getSettings( Boolean forceRebuild ) {
		
		Object cache_settings = BabynewsUtils.cacheGet("SETTINGS");

		if( cache_settings != null && !forceRebuild ) return (Map<String,String>)cache_settings;
		else {

			Map<String,String> settings = new HashMap<String,String>();
			
			// Make sure we're logged in to get spreadsheet data
			try {
				// service to get spreadsheet data
				SpreadsheetService service = BabynewsServlet.getSpreadsheetService();
				List<WorksheetEntry> worksheets = BabynewsServlet.getWorksheets( service );
				
				
				// go through each of the worksheets
				for (WorksheetEntry worksheet_entry : worksheets) {
					String title = worksheet_entry.getTitle().getPlainText();
	
					/*
					 * Look in the Settings worksheet first
					 */
					if (title.equalsIgnoreCase(BabynewsServlet.settings_worksheetname)) {
	
						// get the settings for the scoring
						URL listFeedUrl = worksheet_entry.getListFeedUrl();
						ListFeed feed = service.getFeed(listFeedUrl, ListFeed.class);
	
						for (ListEntry entry : feed.getEntries()) {
							settings.put(entry.getCustomElements().getValue("key"), entry.getCustomElements().getValue("value"));
						}
	
					}
	
				}
				
				
			} catch (Exception e) {
				log.warning( "There was an exception getting the settings from the spreadhsheet " + e.toString());
				
				settings.put("emailTo", "info@puddleplay.com");
				settings.put("feed_refresh_cycle_seconds", "600");
				settings.put("bad_image_domains", "pheedo.com,rfihub.com,doubleclick.net,feedburner.com,api.tweetmeme.com,feeds.wordpress.com,stats.wordpress.com,static.addtoany.com,api.tweetmeme.com");
				settings.put("feeds_sheet", "Feeds");
				settings.put("tags_sheet", "Tags");
				settings.put("scoring_sheet", "Scoring Settings");
				settings.put("image_width", "100");
				settings.put("image_height", "100");
				settings.put("days_to_keep_posts", "7");
				settings.put("gadget_recent_post_time_hours", "12");
				settings.put("cache_turbocharge", "On");
				settings.put("search_enabled", "On");
				settings.put("default_selected_section", "1");
			
			}
	
			// get a cache manager
			BabynewsUtils.cachePut("SETTINGS", settings, (int)BabynewsServlet.DAY_SECS * 7);
			
			return settings;
	
		}
	}
	
	
	private static List<WorksheetEntry> getWorksheets( SpreadsheetService service )  {
		
		// service to get spreadsheet data
		List<WorksheetEntry> worksheets = null;
		try {
			
			URL feedURL = new URL(BabynewsServlet.spreadsheet_URL);
	    	if( BabynewsServlet.DEV_MODE ) feedURL = new URL(BabynewsServlet.testing_spreadsheet_URL);
	    	
			WorksheetFeed worksheet_feed = service.getFeed(feedURL,WorksheetFeed.class);
			worksheets = worksheet_feed.getEntries();

		} catch (Exception e) {
			log.warning( "There was an exception getting the list of Worksheets from the spreadsheet " + BabynewsUtils.getStackTrace(e));
		}
			
		return worksheets;
	}
	

	
	private static SpreadsheetService getSpreadsheetService()  {
		SpreadsheetService service = new SpreadsheetService(BabynewsServlet.service_description);
		
		try {
			service.setUserCredentials(BabynewsServlet.username, BabynewsServlet.password, ClientLoginAccountType.GOOGLE);
		} catch (AuthenticationException e) {
			log.warning( "There was an exception getting the Spreadsheet " + BabynewsUtils.getStackTrace(e));
		}
		
		UserToken auth_token = (UserToken) service.getAuthTokenFactory().getAuthToken();
		if (auth_token != null) BabynewsServlet.TOKEN = auth_token.getValue();

		// Set the token for accessing the spreadsheet.
		service.setUserToken(TOKEN);
		
		return service;
	}
	
	

	public static Map<String,List> getTags( Boolean refresh ) {
		
		Map<String,List> current_tags = null;
		if( BabynewsUtils.isCached("TAGS") ) current_tags = (Map<String,List>)BabynewsUtils.cacheGet("TAGS");
						
		if( current_tags != null && current_tags.size() > 0 && !refresh ) return current_tags;
		else {
			
			//get rid of the JSON tags string if we refresh;
			if(refresh) BabynewsUtils.cacheRemove("TAGS_JSON");
			
			Map<String,String> settings = BabynewsServlet.getSettings( false );
	
			Map<String,List> tags = new LinkedHashMap<String,List>();
			
			// Make sure we're logged in to get spreadsheet data
			try {
				// service to get spreadsheet data
				SpreadsheetService service = BabynewsServlet.getSpreadsheetService();
				List<WorksheetEntry> worksheets = BabynewsServlet.getWorksheets( service );
				
				
				/*
				 * get the current BabynewsLists
				 */
				//a map to hold the existing lists in the datastore
				PersistenceManager pm = PMF.get().getPersistenceManager();
				Map<String, BabynewsList> existing_lists = new HashMap<String, BabynewsList>();
				Extent<BabynewsList> listExtent = pm.getExtent(BabynewsList.class, false);
				for( BabynewsList list : listExtent ) {
					existing_lists.put( list.getTag() , list );
				}				
				
				// go through each of the worksheets
				for (WorksheetEntry worksheet_entry : worksheets) {
					String title = worksheet_entry.getTitle().getPlainText();
	
					/*
					 * Get the list of TAGS
					 */
					if( title.equalsIgnoreCase( settings.get("tags_sheet") ) ) {
					
						//get the settings for the scoring
						URL listFeedUrl = worksheet_entry.getListFeedUrl();
						ListFeed feed = service.getFeed(listFeedUrl, ListFeed.class);
						
						//the current section to put the new tags in
						List<String> currentSectionList = new ArrayList<String>();
						String currentSectionName = null;
						
						//synch the lists in the datastore and the tags
						for (ListEntry entry : feed.getEntries()) {
														
							String tag = entry.getCustomElements().getValue("Name");
							String sort = entry.getCustomElements().getValue("Sorting");
							String postLimit = entry.getCustomElements().getValue("Limit");
							
							//process the various types of tags elements
							if( tag == null || tag.length() < 1 ) {
								continue;
							} else if( tag.contains("<") && tag.contains(">") ) {
								
								//add it to the map as a new entry
								if(currentSectionName != null) tags.put(currentSectionName, currentSectionList);
								
								//set the new sectionName and sectionList
								currentSectionName = tag.substring( tag.indexOf('<')+1, tag.indexOf('>') );
								currentSectionList = new ArrayList<String>();
								
							} else {
								//get the existing list
								BabynewsList list = existing_lists.get(tag); 
								
								//if it is not existing, make it 
								if( list == null ) {
									//make a new one if it isn't there
									int type = BabynewsList.TAG_TYPE;
									if( tag.equals("Most Recent") ) type = BabynewsList.MOST_RECENT_TYPE;
									if( tag.equals("What's Hot") ) type = BabynewsList.WHATS_HOT_TYPE;
									list = new BabynewsList( type , tag );									
									pm.makePersistent(list);
								} 
								
								list.setSorting( sort );
								if( currentSectionList != null ) currentSectionList.add(tag);
								list.setLimit( postLimit );
								
								//take the list out of the map because we will delete the remaining ones later
								existing_lists.remove(tag);
							}
							
							//if it's the last entry, add what we didn't store
							if( entry == (feed.getEntries().get(feed.getEntries().size()-1) ) ) {
								if(currentSectionName != null) tags.put(currentSectionName, currentSectionList);
							}
						}						
							
						// delete all of the lists that weren't in the spreadsheet
						try {
							pm.deletePersistentAll( existing_lists.values() );
							pm.close();
						} catch (com.google.apphosting.api.DeadlineExceededException e) {
							//we ran out of time!
							log.warning("AHHHHHHHHH! We ran out of execution time: " + e.getMessage() ); 
							return tags;
						} catch (Exception e) {
							log.warning("Destroying objects failed because " + e.getMessage() + " and " + e.getCause() );
							log.warning( BabynewsUtils.getStackTrace(e) );
							return tags;
						}					
					}
				}

			} catch (Exception e) {
				log.warning( "There was an exception getting the Tags from the spreadsheet " + e.getMessage() + " because " + e.getCause() );
				log.warning( BabynewsUtils.getStackTrace(e));
			}
	
			// get a cache manager
			BabynewsUtils.cachePut("TAGS", tags, (int)BabynewsServlet.DAY_SECS);
						
			return tags;
	
		}
	}

}

