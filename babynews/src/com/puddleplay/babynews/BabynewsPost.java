package com.puddleplay.babynews;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Serializable;
import java.io.StringReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.Map;

import javax.jdo.PersistenceManager;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import org.json.simple.parser.ContainerFactory;
import org.json.simple.parser.ParseException;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.w3c.tidy.Tidy;

import com.google.appengine.api.datastore.Blob;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Text;

import com.google.appengine.api.images.Image;
import com.google.appengine.api.images.ImagesService;
import com.google.appengine.api.images.ImagesServiceFactory;
import com.google.appengine.api.images.Transform;
import com.google.appengine.api.images.Image.Format;
import com.google.appengine.api.labs.taskqueue.Queue;
import com.google.appengine.api.labs.taskqueue.QueueFactory;
import com.google.appengine.api.labs.taskqueue.TaskOptions;
import com.google.appengine.api.urlfetch.HTTPHeader;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.appengine.api.urlfetch.FetchOptions.Builder;
import com.google.apphosting.api.ApiProxy.OverQuotaException;

import de.l3s.boilerpipe.extractors.ArticleExtractor;


/**
 * @author Jacob Pierson
 *
 */
@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class BabynewsPost implements Serializable  {
	
	private static final long serialVersionUID = 1L;
	
	
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;
	
	    @Persistent
	    private List<String> imageTags;  
	    	    
	    @Persistent
	    private ArrayList<String> imageURLs;  	    	    
	    
	    @Persistent
	    private String post_title;
	    
	    @Persistent
	    private String post_url;
	    
	    @Persistent
	    private Text raw_content;

	    @Persistent
	    private Text raw_description;
	    
	    @Persistent
	    private Date published_date;
	  
	    @Persistent
	    private String blog_title;

	    @Persistent
	    private String blog_url;
	    
	    @Persistent
	    private String short_url_google = "";
	    
	    @Persistent
	    private int blog_score;	  

	    @Persistent
	    private int num_posts_today = 0;

	    @Persistent    
	    private int num_posts_this_week = 0;

	    @Persistent  
	    private int num_posts_this_month = 0;
	    
	    @Persistent
	    private int post_score = 0;	 
	    
	    @Persistent
	    private String primaryImageURL;
	    
	    @Persistent
	    private Key parent_feed;
	    
	    @Persistent 
	    private Blob image;
	    
	    @Persistent 
	    private Blob image_orig;
	    
	    @Persistent
	    private String UID;
	    
	    @Persistent
	    private List<String> flags; 
	    
	    @Persistent
	    private String blog_image_url; 
	    
//	    @Persistent
//	    private int clicks = 0;	 
	    
	    //Init the logger
	    private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());
		
		//a string to record what points went into that score
	    @Persistent
	    private String score_parts;
		
		//private final String appengine_image_URL = "http://puddleplaynews.appspot.com/babynews?imagekey=";
		//private final String local_image_URL = "http://localhost:8888/babynews?imagekey=";
		
	    

	    public BabynewsPost(String UID, String title, String link, Date pubdate, int score, List<String> flags, Key parent_feed) {
			super();
			
			this.parent_feed = parent_feed;

	    	if( title == null || title.length() < 1 ) title = "";
	    	this.post_title =  title.length() > 490 ? title.substring(0,490) : title;
	    	
	    	//check the date posted
	    	Date now = new Date();
	    	if( pubdate == null ) pubdate = now;
	    	if( pubdate.after(now) ) pubdate = now;
	    	this.published_date = pubdate;
	    	
			this.blog_score = score;
			
			if( link == null ) link = "";
			else this.post_url = link;

			if( flags == null ) this.flags = new LinkedList<String>();
			else this.flags = flags;
			
			if( UID == null || UID.length() < 1 ) this.UID = this.post_url;
			else this.UID = UID;
			 
			///this.key = KeyFactory.createKey( BabynewsPost.class.getSimpleName(), this.UID.hashCode() );
			this.key = KeyFactory.createKey( BabynewsPost.class.getSimpleName(), BabynewsUtils.SHA1(this.UID) );
	
			if( this.flags.contains("facebook") ) {
				if( !this.post_url.startsWith("http://www.facebook.com") ) this.post_url = "http://www.facebook.com" + this.post_url;
			}
						
	    }
	      
	    
	    public void setRawContent( String cont ) {
	    	if( cont != null ) this.raw_content = new Text( cont );
	    	else this.raw_content = new Text( "" );
	    }
	    
	    public void setRawDescription( String descrip ) {
	    	if( descrip != null ) this.raw_description = new Text( descrip );
	    	else this.raw_description = new Text( "" );
	    }
	    
		public void setFeedStats( int today, int week, int month ) {
			this.num_posts_today = today;
			this.num_posts_this_week = week;
			this.num_posts_this_month = month;
		}
		
		public String getRawContent() {
	    	return this.raw_content.getValue();
	    }
	    
	    public String getRawDescription() {
	    	return this.raw_description.getValue();
	    }
	    
	    public Date getPublishedDate() {
	    	return this.published_date;
	    }
	    
		public String getPublishedDateString() {
			return BabynewsUtils.getDateHumanReadable( this.published_date );
		}
		
		public String getBlogImageURL() {
			return this.blog_image_url;
		}
		   
		
	    public Blob getImage( Boolean large ) {
	    	//see if the URL is still good
	    	//if not, try to get a new image
	    	if( !this.isGoodImageURL(this.primaryImageURL) || this.image == null || this.image_orig == null ) {
	    		this.downloadAndStorePrimaryImage();
	    	}
	    	
	    	return (large ? this.image_orig : this.image);
	    }
	    

	    
	    private Boolean isGoodImageURL( String url ) {
	    	
	    	if( url == null || url.length() < 5 ) return false;
	    		
	    	List<String> badDomains = Arrays.asList( BabynewsUtils.getSetting("bad_image_domains").split(",") );
	    		
    		boolean badDomain = false;
    		//if the urls contain any of the domains in the bad list, remove it and continue on.
    		for ( String bad : badDomains ) {
    			bad = bad.trim();
    			if( url.contains(bad) ) { 
    				return false;
    			}
    		}	 
    		
    		return true;
	    	
	    }
	    
	    
	    public HashMap<String, Integer> getImageDims() {
	    	 HashMap<String, Integer> img = new HashMap<String, Integer>();
			 
	    	 if( this.hasImage() ) {
			    	Image image = ImagesServiceFactory.makeImage(this.image.getBytes());
			    	img.put("w", image.getWidth() );
			    	img.put("h", image.getHeight() );
		    	}
	    	 
	    	 return img; 
	    }
	   
	    
	    
	    
	    
	    public Boolean hasImage() {
	    	if( this.image != null ) return true;
	    	else return false;
	    }
	    
	    public String getTitle() {
	    	return this.strip( this.post_title ).trim();
	    }
	    
		public String getPostURL() {
			return post_url;
		}

		public String getBlogTitle() {
			return blog_title;
		}

		public String getBlogURL() {
			return blog_url;
		}

		public Key getKey() {
			return this.key;
		}
		
		public String getUID() {
			return this.UID;
		}
		
	    public String getKeyString() {
			return this.getKey().getName();
	    }

		public void setKey( Key key ) {
			this.key = key;
		}
		
		public void clicked() {
			//this.clicks++;
		}
		
		
	    /**
	     * Constructs a JSON object for this post
	     * @return Hash Map object with Post data;
	     */
		public LinkedHashMap getPostHashMap( int contentLength, boolean encode ) {
			  
			  LinkedHashMap obj = new LinkedHashMap();
			  
			  if( this.flags.contains("twitter") ) {
				  this.blog_title = this.blog_title.replaceAll("Twitter / ", "").trim();
				  this.post_title = this.post_title.replaceAll(this.blog_title + ":", "").trim();
			  }
			  
			  
			  obj.put("blog_title", encode ? BabynewsUtils.base64Encode(this.blog_title) : this.blog_title );
			  obj.put("blog_url", this.blog_url);
			  obj.put("score", this.post_score);
			  obj.put("post_date_ago", Math.abs( this.getPublishedDate().getTime() - (new Date().getTime()) ) );
		
			  obj.put("post_title", encode ? BabynewsUtils.base64Encode(this.post_title) : this.post_title );
			  obj.put("post_url", this.post_url );
			  
			  if( this.short_url_google != null )
				  obj.put("short", this.short_url_google);
			  
			  //get the first 1500 chars of the content
			  obj.put("key", this.getKeyString() );
			  
			  String firstSentence = this.getFirstSentence();
				
			  if( this.flags.contains("twitter") ) {
					//clean undesirable info from the post
			  } else {
					obj.put("post_content", encode ? BabynewsUtils.base64Encode( firstSentence ) : firstSentence );
			  }
			 
	
			  //insert flag for newness - if post age is less than GADGET_FOR_RECENT_POST_SECS, set the flag
			  Map<String,String> settings = BabynewsServlet.getSettings( false );
			  if( Math.abs(this.getPublishedDate().getTime() - ( new Date().getTime()) ) < Integer.parseInt( settings.get("gadget_recent_post_time_hours") ) * BabynewsServlet.HOUR_MILLIS ) {
				  this.flags.add("newPost");
			  }
			  
			  //see if there is an image available
			  if( this.image != null ) {
				  this.flags.add("image");
				  obj.put("image", this.getImageDims() );
			  }
			  
			  obj.put("flags", this.flags);
			  
			  return obj;
		}

		
	    public String getTextContent( int length ) {
	    	
	    	String description = strip( this.raw_description.getValue() ).trim();
	    	String content = strip( this.raw_content.getValue() ).trim();
	    	String textContent = "";
	    	textContent = description.length() > 0  ? description : content;
	    	
	    	//if the length is less than 0 or the length is greater than the content, return the whole thing
	    	if( length < 0 || length >= textContent.length() ) return textContent;
	    	
	    	//cut and trim the string
	    	textContent = textContent.substring(0, length-1).trim();
	    	
	    	//clip it to the most recent word
	    	int index = textContent.lastIndexOf(" ");
	    	
	    	if( index > 0 ) textContent = textContent.substring(0, index);
	    	
	    	String ellipses = "...";
	    	return  textContent + ellipses;
	    
	    }
	    
		
	    /**
	     * Gets the content without any of the HTML tags
	     * @return a String representation of the content - with "..." ellipses if content is longer than length;
	     * @param the number of characters to return;
	     */
	    public String getFirstSentence() {
	    	
	    	String description = strip( this.raw_description.getValue() ).trim();
	    	String content = strip( this.raw_content.getValue() ).trim();
	    	String textContent = "";
	    	textContent = description.length() > 0  ? description : content;
	    	
	    	if( textContent.length() >= 30 ) {
		    	
	    		int i=0;
	    		for( ; i < textContent.length(); i++ ) {
		    		char c =  textContent.charAt(i);
	    			
		    		if( (c == '.' || c == '?' || c == '!' || c == '.') && i > 25  ) break;
	    			
		    	}
		    	
		    	textContent = (i >= (textContent.length()-1) ? textContent : textContent.substring(0, i+1));
	    	} 
	    	
	    	
	    	//String firstSentence = textContent.substring(0, period+1);
	    	
	    	/*
	    	//if the length is less than 0 or the length is greater than the content, return the whole thing
	    	if( length < 0 || length >= textContent.length() ) return textContent;
	    	
	    	//cut and trim the string
	    	textContent = textContent.substring(0, length-1).trim();
	    	
	    	//clip it to the most recent word
	    	int index = textContent.lastIndexOf(" ");
	    	
	    	if( index > 0 ) textContent = textContent.substring(0, index);
	    	
	    	String ellipses = "...";
	    	return  textContent + ellipses;
	    	*/
	    	
	    	return textContent.trim();
	    }

	    
	    //set the Blog data points. These are used when displaying the post in the UI
	    public void setBlog( String title, String url, String image_url ) {
	    	this.blog_title = title ;
	    	this.blog_url = url;
	    	this.blog_image_url = image_url;
	    	
	    	if( !this.blog_url.startsWith("http") ) this.blog_url += "http://";
	    
	    	if( this.post_title == null || this.post_title.length() < 1 ) this.post_title = this.blog_title;
	    	
	    	//create an informative error if this is not a good URL
	    	try {
				URL dummy = new URL(url);
			} catch (MalformedURLException e) {
				System.out.println( "The URL to feed " + this.blog_title + " was malformed and could not be turned into a real URL: " + url );
				this.blog_url = null;
			}
			
	    }
	    
	    
	    //calculate or just return this post's score
	    public int getScore( Boolean force_recalculate ) { 
	    	if( this.score_parts == null || this.score_parts.length() < 1 || force_recalculate )  {
	    		calculateScore();  
	    		return this.post_score;
	    	}
	    	else { 
	    		return this.post_score;
	    	}    	
	    }
	    
	
		public Boolean matches(BabynewsPost candidate) {
			
			if( candidate.getUID().equals( this.getUID() ) ) {
				return true;
			} else {
				return false;
			}
	
		}
		    
	    
	    /**
	     * Get the scoring parameters and calculate the blog score
	     */
	    public void calculateScore() {	    	

	    	//start with blog score
    		int score = this.blog_score;
	    	
    		List<BabynewsScore> score_data = BabynewsServlet.getScoring(false);
    		
            //get outta here if the score data isn't available;
            if( score_data == null )  {
        		this.post_score = 0; 
            	return;
            }
			
            //Add the score of the blog from the spreadsheet
    		score_parts = this.blog_score + " for blog base score<br>";
    		
    		//go through all the scoring terms and make score adjustments
    		for( BabynewsScore score_term : score_data ) {

	    		if( score_term.type == BabynewsScore.RECENCY_TYPE ) {
	    			
	    			//see how long ago it was posted add a score if within the window
	    			long time_window_in_milliseconds = (long)(score_term.value) * 60 * 60 * 1000;
	    			
	    			long diff = Math.abs( new Date().getTime() - this.published_date.getTime() );
	    			
	    			if( score_term.qualifier ) {  //over
	    				if( diff > time_window_in_milliseconds ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			} else if( !score_term.qualifier ) { //under
	    				if( diff < time_window_in_milliseconds ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			}
	    			
	    		}


	    		//see if the post has an image and add a score accordingly
	    		if( score_term.type == BabynewsScore.IMAGECOUNT_TYPE ) {

	    			int num_images = 0;
	    			
	    			//use the number of imageURLs we saved.  This should have been cleaned of bad URLs by now
	    			if( this.imageURLs != null ) num_images = this.imageURLs.size();

	    			if( score_term.qualifier ) {  //over
	    				if( num_images > score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			} else if( !score_term.qualifier ) {  //under
	    				if( num_images < score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			}
	    			
	    		}
	    			
	    		
	    		//see if the post matches a certain string and score accordingly
	    		if( score_term.type == BabynewsScore.STRINGMATCH_TYPE ) {

	    			//if( getRawContent().contains( score_term.value ) ) {
	    			
	    		}
	    		
	    		//see if the post matches a certain string and score accordingly
	    		if( score_term.type == BabynewsScore.POSTCOUNT_TYPE ) {

	    			if( score_term.qualifier ) {  //over
	    				if( this.num_posts_today > score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			} else if( !score_term.qualifier ) {  //under
	    				if( this.num_posts_today < score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			}
	    			
	    		}
	    		
	    		
	    		//check the length of the post and add score 
	    		if( score_term.type == BabynewsScore.WORDCOUNT_TYPE) {
	    			
	    			if( this.raw_content == null ) this.setRawContent("");
	    			
	    			//remove all HTML tags
	    	    	String description = this.strip( this.raw_description.getValue() ).trim();
	    	    	String content = this.strip( this.raw_content.getValue() ).trim();
	    	    	String text = content.length() > 0  ? content : description;
	    	    	
	    			//split the text by ' ' space char and count resulting array
	    			int num_words = text.trim().split(" ").length;
	    			
	    			if( score_term.qualifier ) {  //over
	    				if( num_words > score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			} else if( !score_term.qualifier ) {  //under
	    				if( num_words < score_term.value ) {
	    					score += score_term.score_change;
	    					score_parts += score_term.score_change + " for " + ( (score_term.qualifier) ? "more than " : "less than " ) + score_term.value + " " + score_term.name + "<br>";
	    				}
	    			}
	    		}      
	    	}        
    		
	    	    		
	    	score_parts += "</p>";
	    	
	    	this.post_score = score;
	    	
    		log.info("Calculated score for post " + this.post_title + " -  it's " + this.post_score);

	    }
	    
	    
	    //Gets the score description
	    public String getScoreDescription() {
	    	return score_parts;
	    }
	    
	    
	    public void processImageTags() {

	    	//regex to extract the img tag
	    	String img_regex = "<img([^<>]*)>";

	    	String combined = "";
	    	if( this.raw_description != null ) combined += this.raw_description.getValue();
	    	if( this.raw_content != null ) combined += this.raw_content.getValue();
	    	
	    	this.imageTags = findPattern( combined, img_regex );
	    	
	    	//find all the URLs in the list of images
	    	if( this.imageURLs == null ) this.imageURLs = new ArrayList<String>();
	    	
	    	for( String s : imageTags ) {
	    		
	    		int start = s.indexOf("src=");
	    		char quote = s.charAt( start + 4 );
	    		int end = s.indexOf(quote, start + 5);
	    		
	    		/*
	    		log.info("String is: " + s);
	    		log.info("Start is: " + start);
	    		log.info("End is: " + end);
	    		log.info("Quote is: " + quote);
	    		*/
	    		
	    		if( start < 0 ) continue;
	    		
	    		if( end < 0 ) end = s.length() - 1;
	    		
	    		String url = s.substring(start+5, end);
	    		
	    		//replace spaces in the URL
				url = url.replaceAll(" ","%20");
	    		
	    		log.info("URL is: " + url);
				
		    	//make sure the image url is not relative
		    	//BAD <img title="askdesignmombanner" src="../wp-content/uploads/2010/03/askdesignmombanner1.jpg" alt="" width="500" height="93" />
				if( this.blog_url != null && !url.startsWith("http") ) {
					url = this.blog_url + url;
				}
	    		
    			if( !this.imageURLs.contains(url) && this.isGoodImageURL(url) ) this.imageURLs.add(url);
		
	    	}	
	    	
	    }
	    

	    public void extractImagesFromPage() {
	 
    		Text page_text_source;
    		Set<String> page_image_urls = new HashSet();
    		
	    	try {
	    		
	    		//Article Extractor
		  		String page_source = BabynewsUtils.fetchURL( this.post_url );
				page_text_source = new Text( ArticleExtractor.INSTANCE.getText(page_source) );			
				log.info("got page text: " + ( page_text_source.getValue().length() > 0 ? page_text_source.getValue().substring(0, Math.min(page_text_source.getValue().length(), 200) ) : "none" ) );				
    		
	    	
	    		//Image Extractor
				//if( this.page_image_urls == null ) this.page_image_urls = new HashSet<String>();
				//URL url = new URL(this.post_url);
				StringReader reader = new StringReader( page_text_source.getValue() );
		        
		        Tidy tidy = new Tidy();
		        tidy.setQuiet(true); // you'd think this would do it, huh?
		        tidy.setShowWarnings(false); // turn off warnings
		        tidy.setShowErrors(0); // show zero errors (an int, not a boolean like above???)
				Document document = tidy.parseDOM(reader, null);
								
				NodeList imgs = document.getElementsByTagName("img");
				for (int i = 0; i < imgs.getLength(); i++) {
					String str = imgs.item(i).getAttributes().getNamedItem("src").getNodeValue();
					if( str.length() < 500 && this.isGoodImageURL(str) )
						page_image_urls.add(str);
				}
			
				log.info("found images: " + page_image_urls.toString());				
				
				
			} catch (Exception e) {
	  			  log.warning("failed page source scrape because " + e.getMessage() + " " + e.getCause());
	  			  log.warning(BabynewsUtils.getStackTrace(e));
			}
			
			this.imageURLs.addAll( page_image_urls );
	    	
	    }
	    
	   
	    

	    public void downloadAndStorePrimaryImage() {
	    	//gets the actual image data from the image URLs
	    	
	    	//make sure we have the imageURLs to work with
	    	this.processImageTags();
	    	
	    	//add images from the page after the ones from the post
	    	this.extractImagesFromPage();
			 
	    	Map<String,String> settings = BabynewsServlet.getSettings( false );
	    	
	    	int width =  Integer.parseInt( settings.get("image_width") );
	    	int height = Integer.parseInt( settings.get("image_height") );
    		
	    	Map<String, Image> imageMap = new HashMap<String, Image>();
    		
	    	//go through the URLs and fetch each image
	    	for( String imageURL : this.imageURLs ) {
	    		
	    		if( !this.isGoodImageURL(imageURL) ) continue;
	    		
	    		try {
		    		//get the image data
		    		Image image = getImageDataFromURL( imageURL );
		    		//if the image isn't gotten
		    		if( image == null ) continue;
		    		
		    		//if the image is really small, it's not worth keeping.
		    		if( image.getWidth() * image.getHeight() > 100 && image.getWidth() > 15 && image.getHeight() > 15) {
		    			//save the image
			    		imageMap.put( imageURL, image );
		    		}
	    		} catch ( IllegalArgumentException e ) {
	    			log.info("bad image data from " + key.toString()
							+ " because " + e.getMessage() + " "
							+ e.getCause());
	    			continue;
	    		}
	    		
	    	}
	    	
	    	Image image = null;
    		Image image_orig = null;
	    		    	
	    	//keep the first surviving image - hopefully it's the one.
	    	if( imageMap.size() > 0 ) {
	    		
	    		//find the first image with data
	    		for(int i=0; i < this.imageURLs.size(); i++ ) {
		    		
	    			if( !this.isGoodImageURL(this.imageURLs.get(i)) ) continue;
	    			
		    		image_orig = (Image) imageMap.get( this.imageURLs.get(i) );
		    		
		    		//if the image is real, break out and continue the process
		    		if( image_orig != null ) {
		    			this.primaryImageURL = this.imageURLs.get(i);
			    		image = ImagesServiceFactory.makeImage( image_orig.getImageData() );
			    		break;
		    		} 
		    				    			  
	    		}
	    		
	    	}
	    		
    	
    		//if there isn't an image add the blog image
	    	if( image_orig == null && this.blog_image_url != null && this.blog_image_url.length() > 2 ) {
		 		
	    		//if we didn't find any real images, try to get the blog image;
	    		image_orig = getImageDataFromURL( this.blog_image_url );
	    		image = ImagesServiceFactory.makeImage( image_orig.getImageData() );
	    		this.primaryImageURL = this.blog_image_url;
	    	} 
	    	
	    	if( image == null || image_orig == null ) return;
	    	
    		int MAX_WIDTH = 500;
    		int MAX_HEIGHT = 500;

            ImagesService imagesService = ImagesServiceFactory.getImagesService();
            Transform resize = ImagesServiceFactory.makeResize( width, height );
            Transform resize_orig = ImagesServiceFactory.makeResize( MAX_WIDTH, MAX_WIDTH );
            Transform lucky = ImagesServiceFactory.makeImFeelingLucky();
            
			try {
				
	    		//Only resize the image if the image is greater than the desired size
	    		if( image.getWidth() > width || image.getHeight() > height ) {
	    			
	    			//use PNG if there is a possibility of transparency
	    			
					Format format = image_orig.getFormat();
					ImagesService.OutputEncoding output = (format == Format.GIF || format == format.PNG) ? ImagesService.OutputEncoding.PNG : ImagesService.OutputEncoding.JPEG;
					
					//transform the larger image
					if( image_orig.getHeight() > MAX_HEIGHT || image_orig.getWidth() > MAX_WIDTH ) {
						image_orig = imagesService.applyTransform(resize_orig, image_orig, output );
						image_orig = imagesService.applyTransform(lucky, image_orig, output );	  
					}
		
					//transform the smaller image
					image = imagesService.applyTransform(resize, image, output );
					image = imagesService.applyTransform(lucky, image, output );	    				
	
	    		}
    		
	    		this.image_orig = new Blob(image_orig.getImageData());
	    		this.image = new Blob(image.getImageData());
    		
		    } catch ( OverQuotaException e ) { 
				log.warning("Got an image from blog " + this.blog_title + " that's over quota: " + this.primaryImageURL); 
			} catch (Exception e) { log.warning("Exception while provessing image " + this.key + " " + BabynewsUtils.getStackTrace(e)); }
    		
    	}
	    	
	    
	    
	    //check to see if there is any reason to re-download the image in this post
	    public Boolean checkAndRefreshImage( BabynewsFeed feed ) {
	    	
	    	if( this.blog_image_url == null ) this.blog_image_url = feed.getImageURL();
			Queue queue = QueueFactory.getQueue("image-processing-queue");
			
	    	//always refresh if there is no image yet
	    	if( !this.hasImage() ) {
	    		this.downloadAndStorePrimaryImage(); 
	    		//queue.add( TaskOptions.Builder.url( BabynewsServlet.BASE_URL ).param("checkImage", this.getKeyString() ).method(TaskOptions.Method.GET) );
	    		return true;
	    	}
	    	
	    	/*
	    	Map<String,String> settings = newsServlet.getSettings( false );
	    	
	    	//see if the image dims are the same as the settings
	    	int width =  Integer.parseInt( settings.get("image_width") );
	    	int height = Integer.parseInt( settings.get("image_height") );
    		
	    	
	    	//if the image dimentions changed
		    Image image = ImagesServiceFactory.makeImage(this.image.getBytes());
		    Image image_orig = ImagesServiceFactory.makeImage(this.image.getBytes());
	    	if( image.getWidth() != width && image.getHeight() != height && !this.flags.contains("twitter")) {
	    		
	    		//if the image and the original image are not the same size, we know that there was resizing, so we should refresh
	    		//if no resizing, then the image dimensions don't apply to this image
	    		if( image_orig.getWidth() != image.getWidth() && image_orig.getHeight() != image.getHeight() ) {
		    		this.downloadAndStorePrimaryImage(); 
		    		return true;
	    		}
	    	}
	    	*/
	    	
	    	//see if the feed image is the same as this feed image
	    	if( feed != null && this.blog_image_url != null && feed.getImageURL() != null && !this.blog_image_url.equals(feed.getImageURL()) )  {
	    		this.downloadAndStorePrimaryImage(); 
	    		//queue.add( TaskOptions.Builder.url( BabynewsServlet.BASE_URL ).param("checkImage", this.getKeyString() ).method(TaskOptions.Method.GET) );
	    		return true;
	    	}
	    	
	    	//see if the current image is from a bad image domain
	    	if( this.primaryImageURL != null && !this.isGoodImageURL( this.primaryImageURL ) ) {
	    		this.downloadAndStorePrimaryImage(); 
	    		//queue.add( TaskOptions.Builder.url( BabynewsServlet.BASE_URL ).param("checkImage", this.getKeyString() ).method(TaskOptions.Method.GET) );
	    		return true;
	    	}
	    	
	    	return false;
	    	
	    }

	    
	    
	    
	    
	    
	    /*
	     * UTILITY FUNCTIONS
	     */
		private List<String> findPattern( String stringToSearch, String regex ) {
	
			ArrayList<String> matches = new ArrayList<String>();
			
			// the pattern we want to search for
			Pattern p = Pattern.compile(regex, Pattern.MULTILINE);
			Matcher m = p.matcher(stringToSearch);
	
			// print all the matches that we find
			while (m.find()) {
				//System.out.println(m.group());
				//make sure the string is less than 500 chars or GAE will bitch about it
				String match = m.group();
				matches.add( matches.size() , (match.length() > 490 ? match.substring(0,490) : match) );
			}
	
			return matches;
		}

		
		
	    private Image getImageDataFromURL( String u ) {

	    	if( u.length() < 5 ) return null;
	    	
	    	
	    	/*
	    		ArrayList al=new ArrayList();

	    		HttpURLConnection httpConn = null;
	    		int seg=1024*1000;
	    		int startPosition=0;

	    		try {
	    		URL u = new URL(url);

	    		for(;;)
	    		{
	    		int endPosition=startPosition+seg;

	    		httpConn = (HttpURLConnection) u.openConnection();
	    		httpConn.setRequestMethod("GET");
	    		httpConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows; U; Windows NT 5.1; zh-CN; rv:1.8.1.14) Gecko/20080404 Firefox/2.0.0.14");
	    		httpConn.setRequestProperty("Range", "bytes=" + startPosition + "-"+endPosition);
	    		httpConn.connect();

	    		InputStream in = httpConn.getInputStream();
	    		byte[] b=Util.toByteArray(in);//IOUtils.toByteArray(in);
	    		al.add(b);
	    		startPosition+=b.length;
	    		if(b.length
	    		break;
	    		}
	    		ArrayList temp = new ArrayList();
	    		for(byte[] b : al)
	    		{
	    		for (int i = 0; i
	    		temp.add(b[i]);
	    		}
	    		}
	    		return Util.saveBytesArrayListTobytesArray(temp);
	    		} finally {
	    		httpConn.disconnect();
	    		}
	    		}
	    	
	    	*/
	    	
	    	
	        try {
	        	URL url = new URL(u);
	        	HttpURLConnection connection = (HttpURLConnection) url.openConnection();
	        	connection.setRequestMethod("GET");
	        	connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.14) Gecko/20080404 Firefox/2.0.0.14");
	        	connection.setReadTimeout(0);
	        	//connection.setRequestProperty("ContentType", "image/jpeg");
	        	connection.setDoInput(true);

	        	if(connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
	        		InputStream in = connection.getInputStream();
	        		byte[] imgData = new byte[in.available()];
	        		in.read(imgData);
	        		Image image = ImagesServiceFactory.makeImage(imgData);
	        		return image;
	        	} else {
	        		throw new Exception("cannot retrieve image @ " + u);
	        	} 
	        	
			} catch (com.google.apphosting.api.DeadlineExceededException e) {
				log.warning("Exceeded deadline while fetching an image with URL: " + u + "\n"
						+ e.getMessage() 
						+ " because "
						+ e.getCause() + "\n\n"
	        			+ BabynewsUtils.getStackTrace(e) );
	        
	        } catch( Exception e ) { 
	        	log.warning("Had an error while retrieving an image with URL: " + u + "\n"
						+ e.getMessage() 
						+ " because "
						+ e.getCause() + "\n\n"
	        			+ BabynewsUtils.getStackTrace(e) );
	        }
	        
	        
	        return null;
	    }
	    
	    
	    //strip all of the crap characters from a string
	    private String strip( String text ) {
	    	if( this.raw_content == null ) return "";
	    	
	    	//yank html tags
			text = text.replaceAll("<[^>]*>","");
			text = text.replaceAll("/<.*?>/g","");
			
			//yank tabs and newlines
			text = text.replaceAll("\t\r\n", "");
			
			//yank
			text = text.replaceAll("\\p{Cntrl}", "");  
			
			//get rid of all the double spaces and convert them to single spaces.
			text = text.replaceAll("  ", " ");
			
			//get rid of the tabs
			text = text.replaceAll("	", "");
			
			//get rid of lena sharing stuff
			text = text.replaceAll("Shared by Lena", "");			
			
			return text;
			
	    }
	    
	    
	    
	    
	    
	    
	    
	    public void shorten() {
		    
	    	String googURL  = "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDawq6F-LMCOy4gt2dWaS0eMgr4e_eROi8";
	    	this.post_url = this.post_url.trim();
	    	
		    if( this.short_url_google == null || this.short_url_google.length() < 5 ) {
				
	    		log.info( "shortening with google" );
	    		
	    		String message = "{ \"longUrl\" : \"" + this.post_url + "\" }";
	    		
	    		try {
	    			URL url = new URL( googURL );
	    			
	    			HTTPRequest request = new HTTPRequest( url, HTTPMethod.POST, Builder.allowTruncate());
	    			request.setHeader( new HTTPHeader("Content-Type", "application/json") );
	    			request.setPayload( message.getBytes() );
	    			URLFetchService service = URLFetchServiceFactory.getURLFetchService();
	    			HTTPResponse response = service.fetch(request);
	
	    			//log.info( "response from google shortener: " + new String(response.getContent()) );	    			
	    			
	            	JSONParser parser= new JSONParser();
					Object obj=parser.parse( new String(response.getContent()) );
					JSONObject obj2=(JSONObject)obj;
	    			
					String shortened = (String)obj2.get("id");
					
					if( shortened != null ) {
	    				shortened = shortened.trim();
	    		        if( shortened.startsWith("http") )  this.short_url_google = shortened;
	    		        
		    			log.info( "response from google shortener: " + shortened );
					}
	
	            } catch (Exception e) {
	            	log.info( BabynewsUtils.getStackTrace(e) );
	            } 
	    		
	    	} else {
				log.info( "skipping google shortener" );
	    	}
		    
	    }
	    
}
