package com.puddleplay.babynews;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.StringTokenizer;
import java.util.TimeZone;

import java.util.logging.Logger;

import javax.jdo.Extent;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;

import org.datanucleus.exceptions.NucleusObjectNotFoundException;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.labs.taskqueue.Queue;
import com.google.appengine.api.labs.taskqueue.QueueFactory;
import com.google.appengine.api.labs.taskqueue.TaskOptions;
import com.google.appengine.api.memcache.*;
import com.google.appengine.api.memcache.MemcacheService.SetPolicy;
import com.google.appengine.api.memcache.stdimpl.GCacheFactory;
import com.google.appengine.api.urlfetch.FetchOptions;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.net.URL;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
 



public class BabynewsUtils {

	// Init the logger
	private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());

	
	public static String fetchURL( String urlString ) {
        
		String response = "";
		double timeout = 10;

		try {
            URL url = new URL( urlString );
            log.info( "fetching: " + url.toString() );
            
            /*
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            String line = "";
            while ((line = reader.readLine()) != null) {
            	response += line;
            }
            reader.close();
            */
            
            FetchOptions opt = FetchOptions.Builder.doNotValidateCertificate().setDeadline( timeout ).disallowTruncate();
            
            HTTPRequest request = new HTTPRequest (url, HTTPMethod.GET, opt);
            URLFetchService service = URLFetchServiceFactory.getURLFetchService();
            HTTPResponse httpresponse = service.fetch(request);
            byte[] content = httpresponse.getContent();
            response = new String(content);
            

        } catch (MalformedURLException e) {
			log.warning("failed to get url " + urlString + " because " + e.getMessage() + " " + e.getCause());
        } catch (IOException e) {
			log.warning("failed to get url " + urlString + " because " + e.getMessage() + " " + e.getCause());
        }
	        
		return response;
	}
	
	
	
	
	public static List getAllOf( Class c ) {
		
		PersistenceManager pm = PMF.get().getPersistenceManager();

		List<Object> list = new ArrayList<Object>();
		
		try {
			Extent listExtent = pm.getExtent( c , false);
			for( Object o : listExtent ) {
				list.add( o );
			}
		} catch (Exception e) {
			log.info("failed to get list from the datastore with type " + c.getSimpleName() + " because " + e.getMessage() + " " + e.getCause());
		}
		
		return list;

	}
	
	
	public static BabynewsPost getPostbyKey(Key key) {
	
		BabynewsPost p = (BabynewsPost) BabynewsUtils.cacheGet( key.getName() );

		if ( p != null ) {
			return p;
		} else {

			// get a pm for what we're about to do
			PersistenceManager pm = PMF.get().getPersistenceManager();

			try {
				p = pm.getObjectById(BabynewsPost.class, key);
				// log.info("Got post " + key.getId() + " from the datastore" );
			} catch (NucleusObjectNotFoundException ex) {
				return null;
			} catch (Exception e) {
				log.info("failed to get Post with key " + key.toString() + " because " + e.getMessage() + " " + e.getCause());
			}

			// if there was an exception
			if (p == null) {
				try {
					p = pm.getObjectById(BabynewsPost.class, key);
				} catch (NucleusObjectNotFoundException ex) {
					return null;
				} catch (Exception e) {
					log.info("failed to get Post " + key.toString()
									+ " because " + e.getMessage() + " "
									+ e.getCause());
				}
			}

			// Apparently this Post wasn't in the cache, so lets put it in there
			if (p != null) BabynewsUtils.cachePut( p.getKeyString(), p, (int)BabynewsServlet.DAY_SECS);

			pm.close();
		}

		return p;
	}

	
	public static void deleteDatastoreItemByKey( Class c, Key key) {

		//delete from the cache if its in there
		BabynewsUtils.cacheRemove(key.toString());

		// get a pm for Datastore delete
		PersistenceManager pm = PMF.get().getPersistenceManager();

		try {
			pm.deletePersistent(pm.getObjectById( c, key ) );
			log.info("Deleted item " + key.getName() + " from the datastore");
		} catch (org.datanucleus.exceptions.NucleusObjectNotFoundException ex) {
			pm.close();
			return;
		} catch (Exception e) {
			log.warning("failed to delete item with key " + key.toString()
					+ " from the datastore: "
					+ e.getMessage() 
					+ " because "
					+ e.getCause());
		}

		pm.close();

	}
	
	
	public static void deleteDatastoreLots( Collection list, PersistenceManager pm ) {

		// get a pm for Datastore delete
		if( pm == null ) pm = PMF.get().getPersistenceManager();

		try {
			pm.deletePersistentAll( list );
		} catch (Exception e) {
			log.warning("failed to delete an object from the collection " + e.getMessage() + " ----- " + e.getCause());
		}

		pm.close();

	}
	

	
	public static String getSetting( String key ) {
		Map<String, String> settings = BabynewsServlet.getSettings( false );
		
		return settings.get(key);
	}
	
	
	
	public static BabynewsList getListbyTag( String searchtag ) {

		BabynewsList list = null;
		
		String cache_string = "tag_" + searchtag;
		
		//Object cached_list = BabynewsUtils.cacheGet( cache_string );

		/*if(useCache && cached_list != null ) {
			// otherwise get the list of entries from the cache
			list = (BabynewsList) cached_list;
			
		} else {
*/
			PersistenceManager pm = PMF.get().getPersistenceManager();
			//List<BabynewsList> lists = new ArrayList<BabynewsList>();

			try {
		
				Key key = KeyFactory.createKey(BabynewsList.class.getSimpleName(), searchtag);
			     
				list = pm.getObjectById(BabynewsList.class, key);
				
				//if( useCache ) BabynewsUtils.cachePut( cache_string, list, Integer.parseInt(getSetting("feed_refresh_cycle_seconds")) );
				
			} catch (Exception e) {
				log.warning("Had an error while trying to get List with tag "
								+ searchtag
								+ " from the datastore: "
								+ e.getMessage() 
								+ " because "
								+ e.getCause());
			} finally {
				pm.close();
			}
		
		//}
		
		return list;

	}
	
	

	
	/*
	 * CACHE helpers
	 * 
	 * 
	 * 
	 * 
	 * 
	 */
	
	
	public static MemcacheService getCacheManager() {

		MemcacheService cache = null;
		
		while ( cache == null ) {
			
			/*
			// setup the terms and delay that we store this cache item
			Map props = new HashMap();
			props.put(GCacheFactory.EXPIRATION_DELTA, delaySeconds);
			props.put(MemcacheService.SetPolicy.SET_ALWAYS, true);
			
			
			try {
				CacheFactory cacheFactory = CacheManager.getInstance().getCacheFactory();
				cache = cacheFactory.createCache(props);
			} catch (CacheException e) {
				log.warning("Had a problem making the cache manager " + e.getMessage());
			}
			*/
			
			cache = MemcacheServiceFactory.getMemcacheService();
	
		}
		return cache;
	}
	

	
	
	
	public static Object cacheGet(String key) {
		MemcacheService cache = BabynewsUtils.getCacheManager();
		Object gotten = null;
		try {
			gotten = cache.get(key);
		} catch ( Exception e ) {
			log.warning("Had a problem getting key: " + key.toString() + "   " + e.getMessage() + "  " + e.getCause() );
		}
		return gotten;
	}

	
	public static void cachePut(String key, Object payload, int lifespan) {
		MemcacheService cache = BabynewsUtils.getCacheManager();
		try {
			cache.put(key, payload, Expiration.byDeltaSeconds(lifespan), SetPolicy.SET_ALWAYS);
		} catch ( Exception e ) {
			log.warning("Had a problem storing key: " + key.toString() + "   " + e.getMessage() + "  " + e.getCause() );
		}
	}
	
	public static void cachePut(String key, Object payload) {
		cachePut( key, payload, (int)BabynewsServlet.DAY_SECS );
	}
	
	
	public static Boolean isCached( String key ) {
		if(key == null ) return false;
		try {
			MemcacheService cache = BabynewsUtils.getCacheManager();
			return cache.contains(key);
		} catch ( Exception e ) {
			log.warning("Had a problem looking for key: " + key.toString() + "   " + e.getMessage() + "  " + e.getCause() );
		}
		return null;
	}
	
	public static void cacheRemove( String key ) {
		if(key == null ) return;
			try { MemcacheService cache = BabynewsUtils.getCacheManager();
			cache.delete(key);	
		} catch ( Exception e ) {
			log.warning("Had a problem removing key: " + key.toString() + "   " + e.getMessage() + "  " + e.getCause() );
		}
	}
	
	public static void clearCache() {
		/*
		 * Clear the Cache
		 */
		MemcacheService cache = BabynewsUtils.getCacheManager();
		cache.clearAll();
		/*
		 * Clear the Cache
		 */
	}
	
	
	public static String getCacheStats() {
		
		MemcacheService cache = BabynewsUtils.getCacheManager();
		Stats stats = cache.getStatistics();
		
		String stats_string = "<ul>";
		stats_string += ("<li>BytesReturnedForHits: " + stats.getBytesReturnedForHits() + "</li>" );
		stats_string += ("<li>HitCount: " + stats.getHitCount() + "</li>" );
		stats_string += ("<li>ItemCount: " + stats.getItemCount() + "</li>" );
		stats_string += ("<li>MaxTimeWithoutAccess: " + stats.getMaxTimeWithoutAccess() + "</li>");
		stats_string += ("<li>MissCount: " + stats.getMissCount() + "</li>" );
		stats_string += ("<li>TotalItemBytes: " + stats.getTotalItemBytes() + "</li>" );
		stats_string += "</ul>";
		
		return stats_string;
	}
	
	

	public static BabynewsPost getSpecialPost() {
		Map<String,String> settings = BabynewsServlet.getSettings( false );
		
		// get a pm for Datastore delete
		PersistenceManager pm = PMF.get().getPersistenceManager();

		BabynewsPost special = new BabynewsPost("welcome_special", 
												settings.get("welcomepost_title"), 
												settings.get("welcomepost_link"), 
												new Date(), 
												1000, 
												null, 
												null );
		
		String content = settings.get("welcomepost_content");
		content += "<img src=\"" + settings.get("welcomepost_image") + "\">";
		special.setRawContent( content );
		special.setRawDescription( content );
		special.setBlog("Puddleplay", "http://www.puddleplay.com", "");
		
		special.downloadAndStorePrimaryImage();
		
		pm.makePersistent(special);
		
		return special;
	}
	
	

	
	
	
	/*
	 * 
	 * 
	 */
	
	
	public static String base64Encode( String input ) {
		if( input == null ) return ""; 
		
		try {
			 input = Base64.encode(input);
		} catch (Exception e) {
			log.warning("Failed to encode Base64");
		}
		return input;
	}
	
	
	public static String base64Decode( String input ) {
		if( input == null ) return ""; 
		
		try {
			 input = Base64.encode(input);
		} catch (Exception e) {
			log.warning("Failed to decode Base64");
		}
		return input;
	
	}
	
	
	
	/**
	 * Returns true if and only if this string contains the specified
	 * sequence of char values.
	 *
	 * @param s the sequence to search for
	 * @return true if this string contains <code>s</code>, false otherwise
	 */
	public static void clearPostsFromDatastore( int num_to_delete ) {
		
		BabynewsUtils.clearPostsFromDatastore( num_to_delete, new Date() );
	}
		
		
		
	public static void clearPostsFromDatastore( int num_to_delete, Date olderThan ) {

		//get a pm for what we're about to do
		PersistenceManager pm = PMF.get().getPersistenceManager();

		Queue queue = QueueFactory.getQueue("datastore-cleanup-queue");

		int count_in_db = 0;
		
		try {

			Extent<BabynewsPost> extent = pm.getExtent(BabynewsPost.class, false);
			for( BabynewsPost post : extent ) {

				if ( post.getPublishedDate().before(olderThan) ) {
					String ID =  post.getKey().getName();
					queue.add( TaskOptions.Builder.url(BabynewsServlet.BASE_URL).param("deletePost",ID).method(TaskOptions.Method.GET) );
				}

				//count_in_db++;
			}
			
		} catch (Exception e) {
			log.warning("Had an error while deleting Posts from the datastore: " + e.getMessage() );
			log.warning( BabynewsUtils.getStackTrace(e) );
			//return the num to delete so we make sure to run the clean db op again. 
		} finally {
			pm.close();
		}
		
	}
	
	

	public static Boolean clearAllFeedsFromDatastore( PersistenceManager pm ) {
		
		if( pm == null ) pm = PMF.get().getPersistenceManager();
		
		try {	
			/* Deleting an object */
			Query query = pm.newQuery(BabynewsFeed.class);
			query.deletePersistentAll();
			
		} catch (Exception e) {
			log.warning("We had an exception while clearing the Feeds from the DB: " + e.getMessage() );
			return false;
		}
		
		return true;

	}


	public static Boolean clearAllListsFromDatastore( PersistenceManager pm ) {

		if( pm == null ) pm = PMF.get().getPersistenceManager();
		
		try {
			/* Deleting an object */
			Query query = pm.newQuery(BabynewsList.class);
			query.deletePersistentAll();
		} catch (Exception e) {
			log.warning("We had an exception while clearing the Feeds from the DB: " + e.getMessage() );
			return false;
		}

		return true;
	}

	

	// Send an email
	public static void sendEMail( String[] to, String subject, String message) {

		Properties props = new Properties();
		Session session = Session.getDefaultInstance(props, null);
		String from = to[0];

		String msgBody = message;

		try {
			Message msg = new MimeMessage(session);

			try {
				msg.setFrom(new InternetAddress(from, "Baby News AppEngine"));
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}

			try {
				 for(int i=0; i < to.length; i++) {
					msg.addRecipient(Message.RecipientType.TO, new InternetAddress(to[i], "Mr. Recipient"));
				 }
			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			}

			msg.setSubject(subject);
			msg.setText(msgBody);
			Transport.send(msg);

		} catch (AddressException e) {
			return;
		} catch (MessagingException e) {
			return;
		}
	}

	public static String getStackTrace(Throwable t) {
		StringWriter sw = new StringWriter();
		PrintWriter pw = new PrintWriter(sw, true);
		t.printStackTrace(pw);
		pw.flush();
		sw.flush();
		return sw.toString();
	}
	
	
	public static String getDateHumanReadable( Date date ) {
		
		if( date == null ) return "";
		
		// SimpleDateFormat formatter = new
		// SimpleDateFormat("EEE, MMM dd HH:mm zzz");

		SimpleDateFormat todayFormatter = new SimpleDateFormat("h:mma");
		todayFormatter.setTimeZone(TimeZone.getTimeZone("America/Los_Angeles"));
		String todayTime = todayFormatter.format(date);
		
		todayTime = todayTime.replaceAll( "AM", "am");
		todayTime = todayTime.replaceAll( "PM", "pm");
		
		Date now = new Date();
		Date post = date;

		int SECOND = 1;
		int MINUTE = 60 * SECOND;
		int HOUR = 60 * MINUTE;
		int DAY = 24 * HOUR;
		int MONTH = 30 * DAY;
		
		//String[] names = { "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten" };

		// how many milliseconds ago this was posted
		long ts = now.getTime() - post.getTime();

		// how many seconds ago this was posted
		long seconds = ts / 1000;
		
		Calendar cal_post = Calendar.getInstance(TimeZone.getTimeZone("America/Los_Angeles"));
		cal_post.add(Calendar.SECOND,  (int) (seconds * -1) );

		Calendar cal_now = Calendar.getInstance(TimeZone.getTimeZone("America/Los_Angeles"));
		cal_now.setTime(new Date());
		
		Boolean same_day = cal_post.get(Calendar.DAY_OF_MONTH) == cal_now.get(Calendar.DAY_OF_MONTH);
		Boolean yesterday = cal_post.get(Calendar.DAY_OF_MONTH) == cal_now.get(Calendar.DAY_OF_MONTH)-1;
		
		if (seconds < MINUTE) {
			return "less than one minute ago";
		} else if (seconds < 1 * HOUR) {
			return "about " + (seconds/MINUTE) + ( (seconds/MINUTE) == 1  ? " minute" : " minutes" ) + " ago";
		} else if (seconds < 5 * HOUR && same_day ) {
			return "about " + (seconds/HOUR) + ( (seconds/HOUR) == 1  ? " hour" : " hours" ) + " ago";
		} else if (seconds < 48 * HOUR) {
			if( same_day ) return "Today at " + todayTime;
			if( yesterday ) return "Yesterday at " + todayTime;
			else return "1 day ago";
		} else if (seconds < 30 * DAY) {
			int daysAgo = (int) (seconds / 86400);
			return daysAgo + ( daysAgo == 1 ? " day ago" : " days ago" );
		}

		int monthsAgo = (int) (seconds / MONTH);
		return monthsAgo <= 1 ? "one month ago" : monthsAgo + " months ago";
		
	}
	
	
	
	
	
	public static boolean isValidEmailAddress(String emailAddress) {
		// a null string is invalid
		if (emailAddress == null)
			return false;

		// a string without a "@" is an invalid email address
		if (emailAddress.indexOf("@") < 0)
			return false;

		// a string without a "." is an invalid email address
		if (emailAddress.indexOf(".") < 0)
			return false;

		if (lastEmailFieldTwoCharsOrMore(emailAddress) == false)
			return false;

		try {
			InternetAddress internetAddress = new InternetAddress(emailAddress);
			return true;
		} catch (AddressException ae) {
			// log exception
			return false;
		}
	}

	/**
	 * Returns true if the last email field (i.e., the country code, or
	 * something like .com, .biz, .cc, etc.) is two chars or more in length,
	 * which it really must be to be legal.
	 */
	private static boolean lastEmailFieldTwoCharsOrMore(String emailAddress) {
		if (emailAddress == null)
			return false;
		StringTokenizer st = new StringTokenizer(emailAddress, ".");
		String lastToken = null;
		while (st.hasMoreTokens()) {
			lastToken = st.nextToken();
		}

		if (lastToken.length() >= 2) {
			return true;
		} else {
			return false;
		}
	}

	
	
	/*
	 * SHA-1
	 */
	
	 
    private static String convertToHex(byte[] data) {
        StringBuffer buf = new StringBuffer();
        for (int i = 0; i < data.length; i++) {
            int halfbyte = (data[i] >>> 4) & 0x0F;
            int two_halfs = 0;
            do {
                if ((0 <= halfbyte) && (halfbyte <= 9))
                    buf.append((char) ('0' + halfbyte));
                else
                    buf.append((char) ('a' + (halfbyte - 10)));
                halfbyte = data[i] & 0x0F;
            } while(two_halfs++ < 1);
        }
        return buf.toString();
    }
 
    public static String SHA1(String text) {
	    MessageDigest md = null;
	    try {
			md = MessageDigest.getInstance("SHA-1");
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
	    byte[] sha1hash = new byte[40];
	    try {
			md.update(text.getBytes("iso-8859-1"), 0, text.length());
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
	    sha1hash = md.digest();
	    return convertToHex(sha1hash);
    }
    
	
	

}





 


