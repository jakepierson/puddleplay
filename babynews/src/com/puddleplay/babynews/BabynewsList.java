package com.puddleplay.babynews;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;

import java.io.Serializable;


@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class BabynewsList implements Serializable, Comparable {

    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;
	
    @Persistent
	private List<Key> posts;
        
    @Persistent
    final static int MOST_RECENT_TYPE = 1;
    
    @Persistent
    final static int WHATS_HOT_TYPE = 2;
    
    @Persistent
    final static int TAG_TYPE = 3;
    
    @Persistent
    final static int SORT_BY_DATE = 4;
    
    @Persistent
    final static int SORT_BY_SCORE = 5;
    
    @Persistent
    private int type = 0;
    
    @Persistent
    private Date updated = new Date();
    
    @Persistent
    private Date updated_posts = new Date();
    
    @Persistent
    private int num_blogs = 0;
    
    @Persistent
    private String tag = "";
    
    @Persistent
    private Boolean needs_sort = false;
    
    @Persistent
    private int sort_by = BabynewsList.SORT_BY_SCORE;
    
    //Init the logger
    private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());
    
    @Persistent
    private int postLimit = 100;
    
    //the secondary list
    private List<Key> secondaryPosts = null;

    
	/*
	 * The constructor for a List that is for a particular Tag
	 */
	public BabynewsList( int type, String tag ) {
		this.posts = new ArrayList<Key>();
		this.type = type;
		this.tag = tag;
		
        Key key = KeyFactory.createKey(BabynewsList.class.getSimpleName(), tag);
        this.key = key;
		
		if( this.type == BabynewsList.MOST_RECENT_TYPE ) this.sort_by = BabynewsList.SORT_BY_DATE;
		if( this.type == BabynewsList.WHATS_HOT_TYPE ) this.sort_by = BabynewsList.SORT_BY_SCORE;
		if( this.type == BabynewsList.TAG_TYPE ) this.sort_by = BabynewsList.SORT_BY_SCORE;
		this.needs_sort = true;

	}
	
	
	public void setSorting( int sortby ) {
		this.sort_by = sortby;
		this.needs_sort = true;
	}
	 
	public void setLimit( String postLimit ) {
		
		try {
			this.postLimit = Integer.parseInt( postLimit );
		}
		catch( NumberFormatException e ) {
			this.postLimit = 100; 
		}
	}
	
	public int getLimit() {
		return this.postLimit;
	}
	
	public void setSorting( String sortby ) {
		sortby = sortby.toLowerCase().trim();
	
		if( sortby.contains("date")  ) this.setSorting(BabynewsList.SORT_BY_DATE);
		else if( sortby.contains("score")  ) this.setSorting(BabynewsList.SORT_BY_SCORE);
	}
	
	
	public int getType() {
		return this.type;
	}
	
	public String getTag() {
		if( this.tag == null ) this.tag = "";
		return this.tag;
	}
	
	
	public int getSortType() {
		return this.sort_by;
	}
	
	

	public Date getPostUpdateDate() {
		if( this.updated_posts == null ) return Calendar.getInstance(TimeZone.getTimeZone("PST")).getTime();
		return this.updated_posts;
	}
	
	public String getDateUpdatedString() {
		return BabynewsUtils.getDateHumanReadable( this.updated );
	}
	
	public Date getUpdatedDate() {
		return this.updated;
	}
	
	public Long updatedAgoMillis() {
		return Math.abs( this.getPostUpdateDate().getTime() - new Date().getTime() );
	}
	
	public Key get( int index ) {
		if( index < posts.size() ) {
			return posts.get(index);
		}
		return null;
	}
	
	public void clear() {
		this.posts.clear();
		this.secondaryPosts.clear();
	}
	
	public void setUpdated() {
		this.updated = Calendar.getInstance(TimeZone.getTimeZone("PST")).getTime();
	}

	public int getNumBlogs() {
		return this.num_blogs;
	}

	public void setNumBlogs(int numBlogs) {
		this.num_blogs = numBlogs;
	}
	
	
	
	//builds a list of all the posts that apply
	public void buildList() {
		
		//get a pm for what we're about to do
		PersistenceManager pm = PMF.get().getPersistenceManager();
		
		//get all of the feeds that match this source
		List<BabynewsFeed> feeds = null;
        Query query = pm.newQuery(BabynewsFeed.class);
        
        Boolean allFeeds = false;
		if( this.getType() == this.MOST_RECENT_TYPE || this.getType() == this.WHATS_HOT_TYPE ) allFeeds = true;
		
        
		if( allFeeds ) {
	    	//if it's the most recent or Whats Hot, get all the feeds
			feeds = (List<BabynewsFeed>) query.execute(); 
		} else {
	    	query.setFilter("TAGS.contains(tag)");
			query.declareParameters("String tag");
			Map<String,Object> params = new HashMap<String, Object>(); 
			params.put("tag", this.tag); 
	    	feeds = (List<BabynewsFeed>) query.executeWithMap( params ); 
		}

		
		//don't bother continuing if the feeds list is empty
		if( feeds == null || feeds.size() < 1) {
			log.warning( "AAAAAHHHHH! there were no feeds in the datastore matching " + this.tag + " - aborting" );
			return;
		} 	
		
		
		log.info("Found " + feeds.size() + " feeds for list " + this.tag );
		
		this.num_blogs = 0;
		
		//clear the list for the new posts
		this.clear();
		
		this.needs_sort = true;
		
					
		/*
		 * Process all of the Tag-based lists
		 */
		
		//add the feeds that match the tag
		for( BabynewsFeed feed : feeds ) {
				//get the posts from the Feed
				
				log.info("Asking for " + this.getLimit() + " posts from feed " + feed.getBlogTitle() );
				
				//get all the posts
				List<Key> allposts = feed.getPosts( pm, this.getSortType(), 1000 );
				
				if( allposts.size() < 1 ) continue;
				
				//get the limit for the posts
				this.posts.addAll( allposts.subList(0, this.getLimit() > allposts.size() ? allposts.size() : this.getLimit() ) );
				
				//get the rest for the secondary
				if( this.getLimit() < allposts.size() ) {
					this.secondaryPosts.addAll( allposts.subList( this.getLimit(), allposts.size() ) );
				}
				
				this.num_blogs++;
			
		}

		
		this.setUpdated();
		this.updated_posts = Calendar.getInstance(TimeZone.getTimeZone("PST")).getTime();
		
		pm.close();
	}
	
	
	
	public void sort() {
		
		//get a pm for what we're about to do
		PersistenceManager pm = PMF.get().getPersistenceManager();
		
		
		log.info("It's last new post was added at: " + this.updated_posts.toString() );
		log.info("It's been " + Math.abs( this.updated.getTime() - this.updated_posts.getTime() )/(1000 * 60) + "mins since the post has been added" );
		//log.info("This list has" + (this.needs_sort ? " " : " not ") + "been flagged for a sort." );
		
		//don't bother if we don't need a sort
		//if( !this.needs_sort && Math.abs( this.updated.getTime() - this.updated_posts.getTime() ) < (BabynewsServlet.HOUR_MILLIS) ) {
			//log.info("Exiting because - " + this.getTag() + " - didn't need to be sorted");
			//return;
		//}

		log.info("The list - " + this.getTag() + " - is being sorted");
		log.info("The list - " + this.getTag() + " - has " + this.posts.size() + " posts");
		
		log.info("Query started at " + new Date().toString());		 
		Query query = pm.newQuery("select key from " + BabynewsPost.class.getName());
		
		if( this.sort_by == BabynewsList.SORT_BY_SCORE ) {
		    query.setOrdering("post_score DESC, published_date DESC");
		}
		if( this.sort_by == BabynewsList.SORT_BY_DATE ) {
		    query.setOrdering("published_date DESC, post_score DESC");
		}
		
 		List<Key> results = (List<Key>) query.execute();
 
    	List<Key> keys = new ArrayList<Key>();
    	List<Key> keys_secondary = new ArrayList<Key>();
    	
    	log.info("Got " + results.size() + " posts from the datastore");
 		
 		keys.addAll(results);
 		keys_secondary.addAll(results);
 		
 		keys.retainAll( this.posts );
 		
 		//keep all the posts that aren't in the primary list
 		keys_secondary.retainAll( this.secondaryPosts );
 		keys_secondary.removeAll(keys);
 		
 		keys.addAll( keys_secondary.subList(0, keys_secondary.size() > 500 ? 500 : keys_secondary.size() ) );
 		
    	if( results.size() > 0 ) this.posts = keys;
	 		
		this.needs_sort = false;
		
		query.closeAll();
		
		pm.close();
		
    	log.info("List  " + this.tag + " has " + this.posts.size() + " posts ");

		
	}
	
	
	
	public int size() {
		if( posts == null ) return 0;
		else return posts.size();
	}

	public List<Key> getList() {
		return posts;		
	}
	
	public Key getKey() {
		return key;
	}
	
	public Boolean contains( Key k ) {
		return this.posts.contains(k);
	}

	public int compareTo(Object o1) {
		
		Date us = this.getUpdatedDate();
		Date them = ((BabynewsList)o1).getUpdatedDate();
				
        if (  ( us == null && them == null ) || us.equals( them ) )
            return 0;
        else if ( them == null || us.after( them ) )
            return 1;
        else
            return -1;
    }
	

	
}



