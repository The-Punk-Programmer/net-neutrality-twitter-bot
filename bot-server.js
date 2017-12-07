// This is the code for the Twitter Bot
// The twit package is what is used to interact with the Twitter API
// The documentation for twit can be found at https://www.npmjs.com/package/twit
// Now I'll break down each section of code

// Here you first need to require the express package, which sets up our server
// Next is the twit package, which allows Twitter to authorize you and actually tweet
// app creates an instance of our server
// The express-ws package allows you to use websockets, which will allow the total number of your users to be updated in real time
const express = require('express');
const Twit = require("twit");
const app = express();
const expressWs = require('express-ws')(app);


// This creates a new instance of twit. You need to pass in these config options for Twitter to recognize your app
// These options are obtained after setting up an app on Twitter's site https://apps.twitter.com/
// These keys should be kept secret, so they are stored as enviornment variables here. Get your own!
// If you still need help setting this up, watch this: https://www.youtube.com/watch?v=GQC2lJIAyzM&list=PLRqwX-V7Uu6atTSxoRiVnSuOn6JHnq2yV&index=3
const T = new Twit({
  consumer_key:         process.env.TWIT_CONSUMER_KEY,
  consumer_secret:      process.env.TWIT_SECRET_KEY,
  access_token:         process.env.TWIT_ACCESS_TOKEN,
  access_token_secret:  process.env.TWIT_ACCESS_TOKEN_SECRET
});


// This is the total number of requests that will be iterated each time the server recieves a new message over websockets
// Start it at 1, otherwise you'll end up tweeting that 0 people support you for your first tweet. That would suck :()
let reqsCount = 1;
 
// This is just a test to make sure your middleware is working correctly. You can ignore this.
app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 
// This is the websocket middleware. 
// Specify a route where you'll accept websocket connections. Here I just used the index route, "/"
// The "on" function is what listens for connections
// So when a message is received from your client, the function is executed
// Look at my client code to see how to allow your site to send messages to your server
app.ws('/', function(ws, req) {

  ws.on('message', function(msg) {
    console.log(msg);
    
    // This is the actual message that you want to tweet out. It is set on the status key
    // The ${reqsCount} is the reqsCount variable, so it is how many people have connected to your server
    const tweet = {
      status: `${reqsCount} people and I say "Fuck Ajit Pai". Retweet if you do too #netneutrality #FightForFreeInternet https://t.co/KE2wRbq2LC`
    }
    
    // This sends a post request to TWitter that sends out a tweet with whatever message you supplied in your tweet parameter
    // The Twitter API won't allow duplicate tweets and doesn't like multiple @x-person tweets
    // So be careful or you'll get your account restricted and you will not do any good for the cause
    T.post("/statuses/update", tweet, (err, data, res) => {
      if(err) {
        console.log(err);
      }
      
      // The final step! This sends out the total count back to the client,
      // When the client receives the message, it will update in real time
      // Make sure to increase your count afterwards so that it will update correctly!
      ws.send(reqsCount);
      reqsCount++;
    })
    
  });
  console.log('socket', req.testing);
});
 
// Allow for the server to listen for requests. 
// console.log whatever here, this is just for your own amusement
app.listen(process.env.PORT, () => console.log("Fuck Ajit Pai"));

