package com.puddleplay.babynews.feeds.modules.mymodule;

// MyModuleParser.java

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

import org.jdom.Element;
import org.jdom.Namespace;

import com.sun.syndication.feed.module.Module;
import com.sun.syndication.io.ModuleParser;

public class MyModuleParser implements ModuleParser {

	// boilerplate
	public String getNamespaceUri() {
		return MyModule.URI;
	}
	
	// implements the parsing for MyModule
	private final SimpleDateFormat dateFormat = new SimpleDateFormat( "yyyy-MM-dd HH:mm:ss" );	
	
	
	public Module parse(Element element) {
		Namespace myNamespace = Namespace.getNamespace(MyModule.URI);
		MyModule myModule = new MyModuleImpl();
        boolean foundSomething = false;
        
	//	if (element.getNamespace().equals(myNamespace)) {
			
			
			if (element.getName().equals("excerpt")) {
				
				List content = element.getContent();
				
				myModule.setExcerpt( element.getTextTrim() ); //setTag(element.getTextTrim());
				
				foundSomething = true;
			}
			
			
			
			if (element.getName().equals("full_text")) {
				
				List content = element.getContent();
				
				myModule.setFullText( element.getTextTrim() ); //setTag(element.getTextTrim());				
				
				foundSomething = true;
			}
			
			
	        //<lastModified>2010-02-17 12:44:52</lastModified> 
			
			if (element.getName().equals("lastModified")) {
				
				
				
				try {
					myModule.setPubDate(dateFormat.parse(element.getTextTrim()));
				} catch (ParseException e) {
					// don't set it if bad date format
				}
						
				foundSomething = true;
			}
			
			
			
		//}
		
	        return myModule ;

	}

}