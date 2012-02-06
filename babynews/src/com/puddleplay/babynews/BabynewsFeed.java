package com.puddleplay.babynews;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.logging.Logger;

import javax.jdo.Extent;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import sun.tools.tree.ThisExpression;
import twitter4j.Twitter;
import twitter4j.TwitterFactory;
import twitter4j.User;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Link;
import com.google.appengine.api.labs.taskqueue.Queue;
import com.google.appengine.api.labs.taskqueue.QueueFactory;
import com.google.appengine.api.labs.taskqueue.TaskOptions;
import com.sun.syndication.feed.WireFeed;
import com.sun.syndication.feed.synd.SyndContent;
import com.sun.syndication.feed.synd.SyndEntry;
import com.sun.syndication.feed.synd.SyndFeed;
import com.sun.syndication.feed.synd.SyndImage;
import com.sun.syndication.io.SyndFeedInput;
import com.sun.syndication.io.XmlReader;



@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class BabynewsFeed implements Serializable {
   
	@PrimaryKey
	@Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
	private Key key;

	//the URL of the feed
    @Persistent
    private Link feed_URL;

    //a list of the feed's tags
    @Persistent
    private List<String> TAGS;

    //the blog's score from the spreadsheet
    @Persistent
    private int SCORE = 0;

    //the URL to the blog
    @Persistent
    private String blog_url = "";
    
    //the title of the blog the feed is from
    @Persistent
    private String blog_title = "";
    
    //the date the feed was last updated
    @Persistent
    private Date last_updated;
    
    //the date the feed was last updated
    @Persistent
	private List<String> blog_authors = null;
    
    //the date the feed was last updated
    @Persistent
	private String blog_description = "";
	
    //the date the feed was last updated
    @Persistent	
    private String blog_image_url = "";
    
	//set vars for statistics on this 
    @Persistent
    private int num_posts_today = 0;
    @Persistent
    private int num_posts_this_week = 0;
    @Persistent
    private int num_posts_this_month = 0;
   
    @Persistent	
    private List<String> flags = new LinkedList<String>(); 
    
    @Persistent	
    private List<String> filter = new LinkedList<String>(); 
    
    @Persistent	
    private Boolean last_update_success = true; 
    
    @Persistent	
    private int lifespan = 30; 
    
    @Persistent	
    private Boolean use_raw_feed = null; 
    
    
    
 
    //Init the logger
    private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());
    
    public BabynewsFeed(String url, String tags, String score, String image, String filter, String lifespan) {
        
    	this.setURL(url);
        
		this.setTags(tags);

        this.setScore(score);
       
        this.setImageURL(image);
        
        this.setFilter(filter);
        
        this.setLifespan(lifespan);
    }

    public void setLifespan( String lifespan ) {
    	
    	//Store the score!
        if( lifespan != null & lifespan.length() > 0 ) this.lifespan = new Integer( Integer.parseInt(lifespan) );

    }
    
    public void setLastUpdated( Date d ) {
    	this.last_updated = d;
    }
    
    public void setFilter( String filter ) {

        //set the filters
        String[] filter_array = filter.split(",");
        this.filter = new ArrayList<String>(Arrays.asList(filter_array));
        
        
        String blacklist = BabynewsUtils.getSetting("word_blacklist");
        if(blacklist != null) this.filter.addAll( new ArrayList<String>( Arrays.asList( blacklist.split(",") ) ) );
        
        for( String item : this.filter ) {
        	 item.trim();
        }
    }
    
    
    public void setImageURL(String loc) {
    	 //set the image
        if( loc != null || loc.length() > 0 ) this.blog_image_url = loc;
    }
    
    public String getImageURL() {
    	return this.blog_image_url;
    }
    
    
    public String getBlogURL() {
    	return this.blog_url;
    }
   
    
    public void setURL( String u) {
    	try {
 			this.feed_URL = new Link( u.trim() );
 			
			Key key = KeyFactory.createKey(BabynewsFeed.class.getSimpleName(), this.feed_URL.getValue() );
			this.key = key;
 		        
 		} catch (Exception e) {
 			this.feed_URL = null;
 		}
 	}

    
    public void setScore( String score ) {
    	//Store the score!
        if( score != null & score.length() > 0 ) this.SCORE = new Integer( Integer.parseInt(score) );
        else { this.SCORE = 0; }
    }
    
    public int getScore() {
    	return this.SCORE;
    }
    
    public String getDescription() {
    	return this.blog_description;
    }
    
    public Map<String,Integer> getStats() {
    	Map m = new HashMap<String,Integer>();
    	m.put("month", this.num_posts_this_month);
    	m.put("week", this.num_posts_this_week);
    	m.put("today", this.num_posts_today);
    	return m;
    }
    
    public Date getUpdated() {
    	return this.last_updated;
    }    
    
    public String hasProblem() {
    	String probs = "";
    	
    	Long age = this.last_updated != null ? ( new Date().getTime() - this.last_updated.getTime() ) : 0 ;
    	
    	if( age > (BabynewsServlet.DAY_MILLIS*7) ) probs += "<br> blog not updated in a week";
    	if( this.blog_title == null || this.blog_title.length() < 1 ) probs +=  "<br> no blog title";
    	if( this.num_posts_this_month < 1 ) probs +=  "<br> no posts this month";
    	if( this.TAGS.size() < 1 ) probs +=  "<br> no tags";
    	if( this.blog_url == null || this.blog_url.length() < 1 ) probs +=  "<br>no Blog URL";
    	
    	return probs;
    }
    
    
    public void setTags( String tags ) {
	    
	    //Setup the Tags
		if( tags == null || tags.length() < 1 ) { tags = ""; } 
		//split the tags on the comma into a List
		
		TAGS = new ArrayList<String>();
		//get rid of whitespace if it exists between the tags
		for( String s : Arrays.asList( tags.trim().split(",") ) )  {
			TAGS.add( s.trim() );
		}
	}   
    
    
    public String getBlogTitle() {
    	return this.blog_title;
    }
    
    
    public List<String> getTags() {
    	if( this.TAGS == null ) this.TAGS = new ArrayList<String>(); 
    	return this.TAGS;
    }

    public Key getKey() {
        return key;
    }
    
    public String getKeyString() {
		return this.getURL().getValue();
    }
    
    
    public Link getURL() {
        return feed_URL;
    } 
    
    
    public List<Key> getPosts( PersistenceManager pm, int sortType, int num_to_get ) {
    	//if ( posts != null )  return this.posts;
    	//else return new ArrayList<Key>();
    	
		//clean the list of posts and get a list of the objects
    	List<Key> keys = new ArrayList<Key>();

        Query query = pm.newQuery("SELECT key from " + BabynewsPost.class.getName());
        query.setFilter("blog_title == title");
        //query.setFilter("parent_feed == key");
        
        if( sortType == BabynewsList.SORT_BY_SCORE ) {
		    query.setOrdering("post_score DESC, published_date DESC");
		}
		if( sortType == BabynewsList.SORT_BY_DATE ) {
		    query.setOrdering("published_date DESC, post_score DESC");
		}
                
        query.declareParameters("String title");
        //query.declareParameters("Key key");
        
		//query.setRange(0, num_to_get);

        List<Key> results = (List<Key>) query.execute( this.blog_title );
        //List<Key> results = (List<Key>) query.execute( this.getKey() );
		
    	log.info( "Got " + results.size() + " posts from feed " + this.getBlogTitle() );
    	
    	List<Key> res = new ArrayList<Key>();
    	
    	res.addAll(results);
    	
    	return res;
    }
    
    
    public void destroy() {
    	
    	//make a new persistence manager
		PersistenceManager pm = PMF.get().getPersistenceManager();
		
        Query query = pm.newQuery(BabynewsPost.class);
        query.setFilter("blog_title == title");
        query.declareParameters("String title");
    	List<BabynewsPost> results = (List<BabynewsPost>) query.execute( this.blog_title ); 
		
    	pm.deletePersistentAll( results );
		
    	log.info("Destroying posts for feed: " + this.getBlogTitle() );
    	
    	try {
    		pm.close();
		} catch (com.google.apphosting.api.DeadlineExceededException e) {
			//we ran out of time!
			log.warning("AHHHHHHHHH! We ran out of execution time: " + e.getMessage() ); 
		
		} catch (Exception e) {
			log.warning("Destroying objects failed because " + e.getMessage() + " and " + e.getCause() );
			log.warning( BabynewsUtils.getStackTrace(e) );
			
		}
	    	
    }
    
    
    public void refreshPosts() {
    	
    	//get the existing posts in the datastore
		PersistenceManager pm = PMF.get().getPersistenceManager();
	
		//clean the list of posts and get a list of the objects
    	List<BabynewsPost> feed_posts_in_datastore = new ArrayList<BabynewsPost>();
    	
        Query query = pm.newQuery(BabynewsPost.class);
        query.setFilter("blog_title == title");
        query.declareParameters("String title");
    	List<BabynewsPost> results = (List<BabynewsPost>) query.execute( this.blog_title ); 
		
    	feed_posts_in_datastore.addAll( results );
    	

    	/*
    	 *  Do the updating 
    	 */
    	
    	//Use the syndicated entries to make BabynewsPost objects
    	if( synchPosts( feed_posts_in_datastore, pm ) ) {
	    	
	    	//check the feed's stats
	    	calculateFeedStats( feed_posts_in_datastore );
	    	
	    	//update the datastore posts that exist
	    	updateExistingPosts( feed_posts_in_datastore );
	    	
	    	
	    	//store everything
	    	try {
	    		pm.makePersistentAll( feed_posts_in_datastore );
	    		pm.close();
	    		
	    	} catch (com.google.apphosting.api.DeadlineExceededException e) {
				//we ran out of time!
				log.warning("AHHHHHHHHH! We ran out of execution time: " + e.getMessage() ); 
				this.last_update_success = false;
				return;
			} catch (Exception e) {
				log.warning("Persisting post objects failed because " + e.getMessage() + " and " + e.getCause() );
				log.warning( BabynewsUtils.getStackTrace(e) );
				this.last_update_success = false;
				return;
	    	}
	    	
	    	
    	}
    	

		
		this.last_update_success = true;
    	log.info("Done refreshing feed " + this.getBlogTitle() + " - all changes persisted" );
    	
    }
    
    

    private void calculateFeedStats( List<BabynewsPost> feed_posts_in_datastore ) {

    	//reset the counters
		this.num_posts_this_month = 0;
		this.num_posts_this_week = 0;
		this.num_posts_today = 0;
    			
		//calculate and set the posting stats
		Calendar now = Calendar.getInstance(TimeZone.getTimeZone("PST"));
		now.setTime( new Date() );

		//int twentyfour_hours_in_millis = 24 * 60 * 60 * 1000;
		Calendar entry_date = Calendar.getInstance();

		//go through all the posts and calculate stats
    	for( BabynewsPost post : feed_posts_in_datastore ) {
    		
    		if( post == null ) continue;
    		
    		log.info("processing feed stats for " + post.getTitle() );
    		
    		Date d = post.getPublishedDate();
    		if( d == null ) continue;
    		entry_date.setTime( d );

    		if( now.YEAR == entry_date.YEAR ) {
    			//number of posts in the last 24 hours
    			if( Math.abs( now.getTimeInMillis() - entry_date.getTimeInMillis() ) < BabynewsServlet.DAY_MILLIS ) this.num_posts_today++;

    			//number of posts this month
    			if( now.get( Calendar.MONTH ) == entry_date.get( Calendar.MONTH ) ) {
    				this.num_posts_this_month++;
    				//number of posts this week
    				if( now.get( Calendar.WEEK_OF_MONTH) == entry_date.get( Calendar.WEEK_OF_MONTH ) ) this.num_posts_this_week++;
    			}
    		}
    	}
    }
    
  

    public boolean synchPosts( List<BabynewsPost> feed_posts_in_datastore, PersistenceManager pm ) {

    	// get the new posts from the Feed source
    	// then, calculate the feed stats
    	// finally, send the feed entries to be converted into posts and stored
    	SyndFeedInput input = new SyndFeedInput();
    	//input.setPreserveWireFeed(true);
    	SyndFeed feed = null;
    	WireFeed wireFeed = null;
    	List<SyndEntry> entries = null;

    	InputStream inputstream = null;
		URL url;
		try {
			url = new URL( this.feed_URL.getValue() );
		} catch (MalformedURLException e1) {
			return false;
		}
		
    	if( this.use_raw_feed == null || this.use_raw_feed ) {
	        
    		this.use_raw_feed = false;
	    	
    		try {
		        
	        	String raw_feed = "";
	    		
		        URLConnection connect = url.openConnection();
		        BufferedReader in = new BufferedReader( new InputStreamReader( connect.getInputStream() ) );
		        String inputLine;
		        while ( (inputLine = in.readLine() ) != null) {
		        	raw_feed += inputLine;
		        }
		        
		        in.close();
		        
		        
		        /*
		         * 
		         * 
		         * Special Cases
		         * 
		         */
	
		        //  NYT FEEEEEED!!!!!!!!!
		        
		        // if this is the dastardly NYT feed, change a few tags to make it parseable
		        if(raw_feed.contains("<full_text>") || raw_feed.contains("<excerpt>") ) {
		        	
		        	this.use_raw_feed = true;
			        
			        //fix the raw_feed
			        raw_feed = raw_feed.replaceAll( "\\<excerpt\\>" , "<description>" );
			        raw_feed = raw_feed.replaceAll( "\\</excerpt\\>" , "</description>" );
			        raw_feed = raw_feed.replaceAll( "\\<full_text\\>" , "<content:encoded>" );
			        raw_feed = raw_feed.replaceAll( "\\</full_text\\>" , "</content:encoded>" );
				        
			        inputstream = new ByteArrayInputStream( raw_feed.getBytes("UTF-8") );
		        }
		        
		        
		        //  FACEBOOK!
	
		        //if this is facebook, change the <logo> tag to something we can use
		        // BAD   <logo>http://profile.ak.fbcdn.net/object3/654/8/n34200309343_2132.jpg</logo>
			    // GOOD <image><url>http://celebritybabies.typepad.com/Collateral/cbb_pal_tree_icon.jpg</url></image> 
		        if(raw_feed.contains("xmlns:fb=\"http://www.facebook.com\"") ) {
			        String searchtag = "logo";
		        	int open = raw_feed.indexOf("<" + searchtag + ">");
		        	int close = raw_feed.indexOf("</" + searchtag + ">");
			        String image_url = "";
			        
		        	if( open > 0 && close > 0 ) image_url = raw_feed.substring( open + searchtag.length() + 2 , close );
		        	
		        	if( image_url.length() > 0 ) this.blog_image_url = image_url;
		        	
		        	this.use_raw_feed = true;
		        }
		        
		        
		        /// Travels with Baby Tips
		        if( raw_feed.contains("http://www.w3.org/2005/Atom") ) {
		        	raw_feed = raw_feed.replaceAll( "\\<atom:summary\\>" , "<content type=\"html\"" );
				    raw_feed = raw_feed.replaceAll( "\\</atom:summary\\>" , "<content type=\"html\"" );
				      
			        this.use_raw_feed = true;
				}
		        
		        
	    	} catch (Exception ex) {
				log.warning( "Feed Error while building an InputStream: " + ex.getCause() + " and " + ex.getMessage() );
			}
    	}
    	
    	//try to get the feed in its original form - from the URL
    	try {    		   		 
    		if( this.use_raw_feed && inputstream != null )  feed = input.build( new XmlReader( inputstream ) );
    		else  feed = input.build( new XmlReader( url ) ); 
    		
    	} catch (Exception ex) {
    		log.warning( "Something prevented blog " + this.feed_URL + " from being fetched or processed - skipping this feed" );
    		log.warning( "Feed Error: " + ex.getMessage());
    		log.warning( "Cause: " + ex.getCause() );
    		log.warning( BabynewsUtils.getStackTrace(ex) );
    		
    		//return if the feed can't be fetched, there is nothing left to do 
    		return false;
    	}
    	
    	
    	/*
    	 * check to see if this feed has been updated since the last refresh
    	 */
    	Date updated = feed.getPublishedDate();
    	if( updated != null && this.last_updated != null ) {
    		//if this feed was NOT updated before the new feed time, don't bother continuing
    		if( !this.last_updated.before( updated ) ) {
    			log.info("The feed " + this.feed_URL + " wasn't updated since the last check - new: " + updated.toString() + " last updated: " + this.last_updated.toString() );
    			return false;
    		}
    	}
    	
    	entries = feed.getEntries();
    		
    	//get the feeds particulars
    	if( feed != null ) {
			if( feed.getTitle() != null ) this.blog_title = feed.getTitle();
			
			//do the Date
			if( feed.getPublishedDate() != null ) this.last_updated = feed.getPublishedDate();
			
			//one of the below props will have the URL of the actual blog - try both
			String link = feed.getLink();
			String uri = feed.getUri();
			if( link == null || link.length() < 1 ) {
				this.blog_url = uri;
			} else this.blog_url = link;
			
			//this.blog_authors = feed.getAuthors();
			if( feed.getDescription() != null ) {
				this.blog_description = feed.getDescription().length() > 400 ? feed.getDescription().substring(0, 400) + "..." : feed.getDescription();
			}
			
			//check for feed image
			SyndImage image = feed.getImage();
			if( image != null ) {
				if ( this.blog_image_url.length() < 1 ) this.blog_image_url = image.getUrl();
				
				//if we don't have the title yet
				if( this.blog_title == null || this.blog_title.length() < 1 ) this.blog_title = image.getTitle();
				if( this.blog_url == null || this.blog_url.length() < 1 ) this.blog_url = image.getLink();
			}
			
			//check for Twitter
			if( this.blog_title != null || this.blog_url != null ) {
				if( this.blog_title.contains("Twitter") && this.blog_url.contains("twitter")  ) {
					//it's twitter
					if ( !flags.contains("twitter") ) flags.add("twitter");
					
					try {
						// extract the twitter user ID
						//     <link>http://twitter.com/JakeP/with_friends</link>
						//     <link>http://twitter.com/JakeP</link>
						String id = "";
						String parts[] = this.blog_url.replaceAll("http://twitter.com/", "").split("/");
						
						if( parts.length > 0 )  id = parts[0];
						Twitter twitter = new TwitterFactory().getInstance();
						User u = twitter.showUser(id);
						this.blog_image_url = u.getProfileImageURL().toString();
					} catch (Exception e) {
						log.warning("Couldn't get twitter user because " + e.getMessage() + " and " + e.getCause() );
					}	
				}
			}
			
			if( this.blog_url != null && this.blog_url.contains("http://www.facebook.com") ) {
				if ( !flags.contains("facebook") ) this.flags.add("facebook");
			}
				
	    }


    	//go through all the entries and make BabynewsPosts out of them         
    	for( SyndEntry entry : entries ) {

    		//see if the title of the post is set, if not, use the blog title
    		String title = entry.getTitle();
    		if( title == null || title.length() < 1 ) title = this.getBlogTitle();
    		
    		//create a new entry	
    		BabynewsPost post = new BabynewsPost( entry.getUri(), title, entry.getLink(), entry.getPublishedDate(), this.SCORE, this.flags, this.key );
    		
    		//start the complex task of getting content out of the entry
    		String description = "";
    		if( entry.getDescription() != null )  description = entry.getDescription().getValue();
    		
    		//for ATOM feeds, the content is stored in an array of contents so we need to go through that
    		String content = "";
			List<SyndContent> contentList = entry.getContents();
    		if(contentList!= null && contentList.size() > 0 ) {
    			for( SyndContent cont : contentList ) {
    				content += cont.getValue();
    			}
    		}
    		

      		//see if this post contains a term in the filters, if so, skip it
    		boolean skip = false;
    		
    		//see if we already have this post
            for( BabynewsPost p : feed_posts_in_datastore ) {
            	if( p == null || post == null ) continue;
            	if( p.matches( post ) ) {
            		log.info("Skipping post " + post.getTitle() + " because it's already in the datastore");
            		skip = true;
            	}
            }
      
           
            if( skip ) {
            	//yank it out and keep going         	
        		log.info("Skipped post " + post.getTitle() );
            	continue;
            }
            
    			
    		//add the content to the Entry
    		post.setRawContent( content );
    		post.setRawDescription( description );
        	
    		//set the blog's title and URL
    		//post.setBlog( this.blog_title, this.blog_url, this.blog_image_url );
    		    	
    		//sends the stats of the feed to the post.  This is used for scoring
    		//post.setFeedStats( this.num_posts_today, this.num_posts_this_week, this.num_posts_this_month );
    		
			//if not existing, then add it to the list
    		if( !feed_posts_in_datastore.contains(post) ) {
    			
    			//add it to the datastore
    			pm.makePersistent(post);
    			feed_posts_in_datastore.add(post);
    		}

    		log.info("Blog " + this.blog_title + " got a new post " + entry.getTitle() );
        
    	}
    	
    	return true;
    }
    
    
    private void updateExistingPosts( List<BabynewsPost> feed_posts_in_datastore ) {
      	/*
    	 *  Old code to find the maximum age of the post from the settings 
    	 *
    	//calc the max age of posts
    	long max_age = Long.parseLong( BabynewsUtils.getSetting("days_to_keep_posts") );
    	*/
		long max_age = this.lifespan * BabynewsServlet.DAY_MILLIS;

		Queue queue = QueueFactory.getQueue("datastore-cleanup-queue");
    	
		
    	//things to do for all the posts in the feed
    	for( BabynewsPost post : feed_posts_in_datastore ) {
     		
    		//the post might have been removed previously
    		if( post == null ) continue;
    		
    		//weed out the old posts
    		if( Math.abs( post.getPublishedDate().getTime() - new Date().getTime() ) > max_age ) {
    			
				String ID =  post.getKey().getName();
				queue.add( TaskOptions.Builder.url(BabynewsServlet.BASE_URL).param("deletePost",ID).method(TaskOptions.Method.GET) );
				
				/*
    			//it's older thean the maximum age - delete it
    			BabynewsUtils.deleteDatastoreItemByKey(BabynewsPost.class, post.getKey());
        		*/
				
    			feed_posts_in_datastore.set( feed_posts_in_datastore.indexOf( post ) , null);
        		log.info("expired post " + post.getTitle() + " because it's older than " + max_age + " ms old");

    			continue;
    		}
    		
    		//check the filter
    		String content = post.getTextContent(-1);
    		String title = post.getTitle();
    		Boolean bad = false;
            for( String item : this.filter ) {
            	if( item != null && item.length() > 0 && (title.contains(item) || content.contains(item))  ) { 
	        			bad = true;
	        			break;
            	}
            }
            if( bad ) {
            	log.info("Skipping post " + post.getTitle() + " because it violated filter");
            	String ID =  post.getKey().getName();
				queue.add( TaskOptions.Builder.url(BabynewsServlet.BASE_URL).param("deletePost",ID).method(TaskOptions.Method.GET) );
    			feed_posts_in_datastore.set( feed_posts_in_datastore.indexOf( post ) , null);
    			continue;
    		}
    		
    		
    		//make the score refresh
    		post.getScore(true);
    		
    		//get the image if there is a new feed image
    		//must do this before any of the feed params are changed
        	if( post.checkAndRefreshImage( this ) ) log.info("Refreshing image for post " + post.getTitle());
        	
        	//String ID =  post.getKey().getName();
			//getPostqueue.add( TaskOptions.Builder.url(BabynewsServlet.BASE_URL).param("checkImage",ID).method(TaskOptions.Method.GET) );   
			
	    	//if( post.checkAndRefreshImage( this ) ) log.info("Refreshing image for post " + post.getTitle());

        	//set the blog's title and URL
    		post.setBlog( this.blog_title, this.blog_url, this.blog_image_url );
    		    	
    		//sends the stats of the feed to the post.  This is used for scoring
    		post.setFeedStats( this.num_posts_today, this.num_posts_this_week, this.num_posts_this_month );
    		
    		post.shorten();
    		
    		log.info("Processed post " + post.getTitle() );

    	}
    }
    
    public double getAveragePostFrequency() {	
    	return Math.ceil( (this.num_posts_this_month/30) + (this.num_posts_this_week/7) + this.num_posts_today );
    }
    
}





