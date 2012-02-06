
// MyModule.java
package com.puddleplay.babynews.feeds.modules.mymodule;

import java.util.Date;

import com.sun.syndication.feed.module.Module;

public interface MyModule extends Module {
  
  public static final String URI = "http://www.puddleplay.com/spec";

  public String getExcerpt();
  public void setExcerpt(String excerpt);
  
  public String getFullText();
  public void setFullText(String fullText);
  
  public Date getPubDate();
  public void setPubDate(Date pubDate);
  
  
 // excerpt
 // full_text
 // pubDate
  
}
