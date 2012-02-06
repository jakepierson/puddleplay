package com.puddleplay.babynews;

import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import java.util.logging.Logger;


//LogLoadingRequest.java
public class LogLoadingRequest implements HttpSessionListener {
  private static final Logger logger = Logger.getLogger(LogLoadingRequest.class.getName());
  public void sessionCreated(HttpSessionEvent se) {
    logger.info("Loading request occuring!!!.");
  }

  public void sessionDestroyed(HttpSessionEvent se) {
  }
}