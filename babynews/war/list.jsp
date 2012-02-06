

<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.google.appengine.api.datastore.Key" %>
<%@ page import="com.puddleplay.babynews.*" %>
<%@ page import="com.puddleplay.babynews.BabynewsUtils" %>

<html>
<head>
  	<link rel="stylesheet" href="grid.css">	
</head>
<body>

<div id="container">


<%    
    String lname = request.getParameter("list").trim();
	BabynewsList list = BabynewsUtils.getListbyTag( lname );		
%>

<% if( list == null ) { %>
	<h1> List <%= lname %> is not found </h1>
<% } else { %>

	<h1> <%= list.getTag() %> </h1>
	<h2> Last updated: <%= list.getDateUpdatedString() %> </h2>
	<h3> Newest post added: <%= list.getPostUpdateDate().toString() %> </h3>

	<% for( Key key : list.getList() ) {
		BabynewsPost post = BabynewsUtils.getPostbyKey(key);
		if( post == null ) continue;
	%>
		
		<div class="post">
		
			<div class="span-24 last">
				<h3> <%= post.getTitle() %> </h3> <%= post.getBlogTitle() %>  
				<hr>
			</div>
					
			<div class="span-5 append-1">
				<img src="/babynews?imagekey=<%= post.getKeyString() %>">
			</div>
			
			<div class="span-6 append-1">
				<b>Content:</b><br> <%= post.getTextContent(150) %>
			</div>
			
			<div class="span-5 last">
				<b>Score: <%= Integer.toString(post.getScore(false)) %><br></b>
				<%= post.getScoreDescription() %>
			</div>
				
		</div>
	
	<% } %>
	
<% } %>

</div>

  </body>
</html>