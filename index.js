var https   = require('https');
var http    = require('http');
var fs      = require("fs");
var express = require("express");
var bodyParser = require("body-parser");
var auth    = require("./auth.js");
var app     = express();
var router  = express.Router();

// Set port apropos for Heroku
var ourPort = process.env.PORT || 80;
var secPort = process.env.PORT ||443;

var sslOptions = {
	cert: fs.readFileSync("./certs/server.crt"),
	key:  fs.readFileSync("./certs/server.pem")
};

// Create Node HTTPS server
//
var httpsServer = https.createServer(sslOptions,app);
var server = httpsServer.listen(secPort, ()=>{
	console.log("HTTPS Server listening on port: " + secPort);
});


var appVersion = "1.0.0";
// 1.0.0  - basic 3 Legged OAuth functionality


// setup basic HTTP processing and location where
// html files live
app.use( express.static(__dirname + "/html"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( {extended: true} ));

app.use("/",router);


/*
   The general flow for this 3-Legged OAuth Demonstration starts
   with browsing to the app's home page,
   
   1) /(index.html) -- The server serves index.html to the client.  This
      HTML has a button that will browse to obtain BlueJeans authorization
	  for the user of this app to make API calls.  Clicking the button takes
	  the user to,
	  
   2) /makeRequest -- This simple API creates the initial BlueJeans URL
      redirection  to a BlueJeans app-login page.  Upon successful authorization,
	  BlueJeans returns and redirects the client to the specified URL, which in
	  this case is,
	  
   3) /callback -- Callback is an API endpoint that quickly turns around the BlueJeans
      code into an access_token.  It makes the /oauth2/token?Code API call to BlueJeans 
	  which will return a access token.
*/


/*
 * appInfo
 *
 * This is the application record that was configured in BJN Cloud
 * notes:
 *   glenninn.com  is a local (host file) redirect to localhost because this file
 *				  runs as a Node JS HTTPS server
*/

var appInfoFile = "appinfo.json";
var appInfo = {};



/*
 * GET /makerequest
 *
 * The client application will call this API Endpoint to initiate the BlueJeans
 * authorization process.  The Authorization will return a unique "code" (short guid)
 * which will allow the client application to make a user-token request
 *
 * This endpoint redirects the client browser session to the BlueJeans authorization
 * API
 * 
*/
router.route("/makerequest")
  .get( (req,res)=>{
	  var url = "https://bluejeans.com/oauth2/authorize";
	  var qp = "";
	  function addQp(n,v){
		  qp += (qp=="" ? "?" : "&" ) + n + "=" + v;
	  }
	  addQp("clientId",    appInfo.client_id);
	  addQp("redirectUri", appInfo.redirectUrls[0] ); // +"/callback" );
	  addQp("state",       "fishing");
	  addQp("scope",       "list_meetings,modify_meetings,user_info" );
	  addQp("responseType", "code");
	  addQp("appName",     appInfo.appName );
	  addQp("appLogoUrl",  appInfo.appLogoUrl);
	  
	  url += qp;
	  
	  // Redirect the client's browser to this BlueJeans authorization API
	  res.redirect(url);
  });
  
  
  
var apiHost = "api.bluejeans.com";
var oAuthApi= "/oauth2/token?Code";
 
/*
 * GET /callback
 *
 * Upon successful authorization, the client session is redirected to this 
 * "callback" endpoint.  We take the authorization "code" and make the appropriate 
 * OAuth request to generate an access token.
 *
 * This endpoint would normally redirect the client browser to an appropriate
 * landing page.
 * 
*/ 
router.route("/callback")
  .get( (req,res)=>{
	  console.log("OAuth Authorization Returned:");
	  console.log( JSON.stringify(req.query,null,2));
	  
	  // Handle when user declines authorization
	  if(req.query.error && (req.query.error = "401")) {
		  res.status(401).send(req.query);
		  return;
	  }
	  
	  var orec = {
            redirectUri   : appInfo.redirectUrls[1],  //  + "/authenticated",
            code          : req.query.code,
            grant_type    : "authorization_code",
            client_secret : appInfo.client_secret,
            client_id     : appInfo.client_id
	  };
	  
	  console.log("ORec = " + JSON.stringify(orec,null,2));
	  
	  auth.post(apiHost,oAuthApi,orec).then( (results)=> {
		  console.log("Success!  BlueJeans OAuth Token Info:");
		  console.log(JSON.stringify( results,null,2 ));
		  res.status(200).json(results)
	  },(error)=> {
		  console.log("ERROR:  " );
		  console.log(error);
		  res.status(401).send(error);
	  });

  });
  
  
function initialize(){
	console.log("***Test 3 Leg OAuth Server ****");
	fs.readFile(appInfoFile, (err,data)=> {
		if(err) {
			console.log("Error reading " + appInfoFile + ", unable to initialize");
			process.exit();
		}
		
		try {
			appInfo = JSON.parse(data);
		}
		catch(pe)
		{
			console.log("Unable to parse data in " + appInfoFile );
			process.exit();
		}
		
		if( appInfo.appName && appInfo.client_id 
		    && appInfo.client_secret && appInfo.redirectUrls ){
				console.log("Loaded App Configuration");
				console.log( JSON.stringify( appInfo,null,2) );
		} else {
			console.log("Insufficient data in " + appInfoFile);
			process.exit();
		}
	});
	
}

initialize();
