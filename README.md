
# Test3Leg - a NodeJS App Demonstrating the 3-Legged OAuth Process

- 7/24/2018, g1, Initial Check-in

This reference design creates a simple web site that supports the 3-Legged OAuth process for obtaining application access to a user's BlueJeans meetings. 



## Setup

To use the Test3Leg, you will need to have the Node JS environment including the package manager too, **npm**.


1. Download the contents of this github to your computer.  Then run the initialization

  `npm install` to have npm download and install the npm modules

1. Ensure that you have created the `appinfo.js` configuration file.  It is most important that you have the `Secret_Id`property.  If you have forgotten the key, you must regenerate one and put that value into the appinfo.json file.

1. Also, create a local alias that maps:

` glenninn.com --> localhost`

4. Launch the node web server

```javascript
C:\Users\glenn\Documents\node\test3Leg>node index
***Test 3 Leg OAuth Server ****
HTTPS Server listening on port: 443
Loaded App Configuration
{
  "appLogoUrl": "",
  "redirectUrls": [
    "https://glenninn.com/callback",
    "https://glenninn.com/authenticated"
  ],
  "appName": "test.3leg",
  "client_id": "43160b22923645618ef2c3ef00989bec",
  "client_secret": "..."
}
```



## Running the Application

To run the 3-Legged OAuth process, browse to the home page:


1. Open your browser and then browse to:

  `http://glenninn.com

At this point you should see the following screen:

![](./images/mainpage.png)



Click on the **Request** button to begin.





... more to come ...

