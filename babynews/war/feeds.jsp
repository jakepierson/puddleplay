

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.datastore.Key" %>
<%@ page import="com.puddleplay.babynews.*" %>
<%@ page import="javax.jdo.PersistenceManager" %>
<%@ page import="java.util.*" %>
<%@ page import="javax.jdo.Query" %>

<html>
<head>
  	<link rel="stylesheet" href="grid.css">	
</head>
<body>

<div id="container">

<%    
   
	List<BabynewsFeed> feeds = new ArrayList<BabynewsFeed>(); 
			
	//get a pm for what we're about to do
	PersistenceManager pm = PMF.get().getPersistenceManager();

	//get the feeds from the datastore and refresh their posts
	Query feeds_query = pm.newQuery(BabynewsFeed.class);
	try {
		feeds = (List<BabynewsFeed>) feeds_query.execute();
	} catch (Exception e) {
	} finally {
		feeds_query.closeAll();
	}

%>

<% if( feeds == null ) { %>
	<h1> no feeds found :( </h1>
<% } else { %>

	<h1> Feeds </h1>
	<h2> count: <%= feeds.size() %> </h2>

	<% for( BabynewsFeed feed : feeds ) { %>
	
		<div class="feed span-11 <%= ( feed.hasProblem().length() > 0 ) ? "problemFeed" : "" %>  ">
			<span class="problemText">  <%= feed.hasProblem() %> </span>
		
			<div class="span-8">
				<h3> <a href="<%= feed.getBlogURL() %>" target="_blank"> <%= feed.getBlogTitle() %></a> </h3>  
				  <b> <%= feed.getDescription() %> </b>  <br>
				  <a href="<%= feed.getURL() %>" target="_blank"> <%= feed.getURL() %> </a>
				<hr>
			</div>
			
			<% if(feed.getImageURL().length() > 0) { %>
			<div class="span-3 last">
				<img src="<%= feed.getImageURL() %>" width="100px">
			</div>
			<% } %>
			
			<div class="span-3">
				<b>Lists:</b>
				<br>
				<% for( String tag : feed.getTags() ) { %>
					<a href="/list.jsp?list=<%= tag %>"> <%= tag %> </a> <br>
				<% } %>
			</div>
			
			<div class="span-2">
				<b>Score:</b>
				<br>
				<%= Integer.toString( feed.getScore() ) %>
			</div>
			
			<div class="span-5">
				<b>Blog updated:</b>
				<br>
				<%= BabynewsUtils.getDateHumanReadable( feed.getUpdated() ) %>
			</div>
			
			<div class="clear" style="height: 10px;"></div>
			
			<div class="span-11 last">
				<b> Number of posts added:</b>
				<div class="clear"></div>
				<div class="span-10">
					today: <%= Integer.toString( feed.getStats().get("today") ) %>
					&nbsp;
					this week: <%= Integer.toString( feed.getStats().get("week") ) %>
					&nbsp;
					this month: <%= Integer.toString( feed.getStats().get("month") ) %>
				</div>
			
			</div>

								
		</div>
	
	<% } %>
	
<% } %>

<br>
<br>
<br>

</div>



  </body>
</html>