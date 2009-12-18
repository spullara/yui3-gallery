/*
 * Copyright 2009 Sam Pullara
 * This source code is licensed to you under the BSD license
 * http://developer.yahoo.com/yui/3/license.html
 * Tested under FF 3.5, Safari 4, Chrome 4
 * Fails in IE currently
 */

/**
 * Check to see if the user's browser history contains links.
 *
 * @param urls The array of links you want to check.
 * @param check If false or empty return the subset of links in the history,
 *              if true then return true immediately on match else false.
 *
 */
YUI().add('gallery-history-check', function(Y) {
  function visited(urls, check) {
    // Grab the body element, don't execute this function before it has been created
    var body = Y.one("body");
    if (!body) { return null; }
    // Make sure the visited and normal link color differ
    var visitedColor = "rgb(255, 255, 255)";
    var linkColor = "rgb(0, 0, 0)";
    // Create a div to hold the test links
    var node = Y.Node.create('<div id="vla" style="display:none;"></div>');
    // Set the style of the links so that we can distinguish visited links
    // Try to ensure that we don't change anything else on the page
    node.append("<style>#vla>.vl:visited{color:" + visitedColor + ";}#vla>.vl:link{color:" + linkColor + ";}</style>");
    body.append(node);
    // Create a link prototype to test
    var link = Y.Node.create('<a class="vl">&nbsp;</a>');
    // The resulting subset of urls that have been visited
    var list = [];
    // Examine each of the urls provided
    for (var i = 0, l = urls.length; i < l; i ++) if (urls.hasOwnProperty(i)) {
	  var url = urls[i];
      // Set the href to the current url
      var clone = link.cloneNode();
      clone.set('href', url);
      // Append the link to the test area to check link
      node.append(clone);
      // Compare the color of the link to the visited color we set above in the style
      if (clone.getComputedStyle('color') == visitedColor) {
        if (check) {
          // Cleanup the link test area
          body.removeChild(node);
          return true;
        } else {
          list.push(url);
        }
      }
      // This should be more efficient than updating a big list of elements
      node.removeChild(clone);
    }
    // Cleanup the link test area
    body.removeChild(node);
    return check ? false : list;
  }
  Y.historyCheck = visited;
}, '0.0.1', {requires:["node"]});
