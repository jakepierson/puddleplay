package com.puddleplay.babynews;

import java.io.Serializable;
import java.util.logging.Logger;

import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.IdentityType;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import com.google.appengine.api.datastore.Key;

@PersistenceCapable(identityType = IdentityType.APPLICATION)
public class BabynewsScore implements Serializable {


    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Key key;
	
    @Persistent
	public static final Boolean OVER = true;
    @Persistent
	public static final Boolean UNDER = false;

    @Persistent
	public static final int RECENCY_TYPE = 1;
    @Persistent
	public static final int WORDCOUNT_TYPE = 2;
    @Persistent
	public static final int IMAGECOUNT_TYPE = 3;
    @Persistent
	public static final int POSTCOUNT_TYPE = 4;
    @Persistent
	public static final int STRINGMATCH_TYPE = 5;
    
	public static final int TIME_HOURS = 1;	
	public static final int TIME_DAYS = 2;
	public static final int TIME_WEEKS = 3;
	public static final int TIME_MONTHS = 4;

    @Persistent
	public int type;
    
    @Persistent
	public String name;
    
    @Persistent
	public Boolean qualifier;
    
    @Persistent
	public int value;
    
    @Persistent
	public int score_change;
    
    @Persistent
	public String unit;
    
    //Init the logger
    private static final Logger log = Logger.getLogger(BabynewsServlet.class.getName());
	
	public Key getKey() {
		return key;
	}
	

	public BabynewsScore( String name, Boolean qualifier, int value, int score_change) {
		this.name = name;
		this.qualifier = qualifier;
		this.value = value;
		this.score_change = score_change;


		if( name.compareToIgnoreCase("word_num") == 0 ){
			this.type = BabynewsScore.WORDCOUNT_TYPE;
		}
		if( name.compareToIgnoreCase("recency_hours") == 0 ){
			this.type = BabynewsScore.RECENCY_TYPE;
		}
		if( name.compareToIgnoreCase("image_num") == 0 ) {
			this.type = BabynewsScore.IMAGECOUNT_TYPE;
		}
		if( name.compareToIgnoreCase("word_match") == 0 ) {
			this.type = BabynewsScore.STRINGMATCH_TYPE;
		}		
		if( name.contains("posts_in_last_24_hours") ) {
			this.type = BabynewsScore.POSTCOUNT_TYPE;
		}	

	}


}
