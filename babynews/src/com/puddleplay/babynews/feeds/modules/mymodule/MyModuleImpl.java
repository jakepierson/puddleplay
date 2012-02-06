package com.puddleplay.babynews.feeds.modules.mymodule;


// MyModuleImpl.java

import java.util.Date;

import com.sun.syndication.feed.module.ModuleImpl;

public class MyModuleImpl extends ModuleImpl implements MyModule {

  private static final long serialVersionUID = -8275118704842545845L;


  private String fullText;
  private Date pubDate;
  private String excerpt;
  
  // boilerplate code. Eclipse will generate all but the constructor but
  // will keep reporting an error until you do it.
  public MyModuleImpl() {
    super(MyModule.class, MyModule.URI);
  }

  public void copyFrom(Object obj) {
    MyModule module = (MyModule) obj;
    setExcerpt(module.getExcerpt());
    setFullText(module.getFullText());
    setPubDate(module.getPubDate());
  }

  public Class getInterface() {
    return MyModule.class;
  }

  // getter and setter impls for MyModule interface
 	public String getFullText() {
		return this.fullText;
	}
	
	public void setFullText(String fullText) {
		this.fullText = fullText;
	}
	
	public Date getPubDate() {
		return this.pubDate;
	}
	
	public void setPubDate(Date pubDate) {
		this.pubDate = pubDate;
	}
	
	public String getExcerpt() {
		return this.excerpt;
	}
	
	public void setExcerpt(String excerpt) {
		this.excerpt = excerpt;
	}
  
  
  
  
}

