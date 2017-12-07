// This is the code for the Twitter Bot
// The twit package is what is used to interact with the Twitter API
// The documentation for twit can be found at https://www.npmjs.com/package/twit
// Now I'll break down each section of code

// Here you first need to require the express package, which sets up our server
// Mongoose is to interact with our database. I am using mlab to host mine.
// they offer great free plans. So I would advise to use their service. Here's the site: https://mlab.com
// I also pulled the Schema object off of mongoose just cuz that's how I like to do it
// Next is the twit package, which allows Twitter to authorize you and actually tweet
// app creates an instance of our server
// The express-ws package allows you to use websockets, which will allow the total number of your users to be updated in real time
const express = require('express');
const mongoose = require("mongoose");
const {Schema} = require("mongoose");
const Twit = require("twit");
const app = express();
const expressWs = require('express-ws')(app);

// This connects the app to your database. You can find your monog-uri in the "Users" section of your collections
// If you don't know how to access this still, I'm sure you can find a tutorial easily. It's not technical at all
// Once you have your mongo-uri, pass it in as a string
// I advise you save your mongo-uri in your environment variables, however. Since it has a password plainly visible
mongoose.connect(process.env.MONGO_URI);

// This sets up our one and only schema
// All this does is sets this one key to a default of 0
// Later we will increment this, but default is necessary
const totalSchema = new Schema({
	total: {type: Number, default: 0}
});

// This model is what will be referred to every time you want to query your database
const Total = mongoose.model("total", totalSchema);



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

 
// This is just a test to make sure your middleware is working correctly. You can ignore this.
app.use((req, res, next) => {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 

// This code is used to get access to the socket directly.
// This is going to be necessary when you need to broadcast to every connection
// Make sure to leave the funciton without arguments, this fucked me up for a while
const aWss = expressWs.getWss();

// When the client first connects to your server, this code is run
// If you haven't used async/await before, all it does is allow your asynchronous code 
// to be handled easily. The details are too complicated to go into right here,
// so if this doens't make sense to you, try and find a tutorial
// you'll be using it to handle your database requests, so get used to it
// or use promises instead (don't use shitty callbacks, unless you're a masochist)
// Now, first give yourself an encouraging console message. You're going to need it
// Then query your Total collection by searching for it's id 
// You can find it's id by going directly into your mlab database and copying the $oid property
// Then send the "total" property from this object
// Now your user has the current running total of protests when they load the page!
expressWs.getWss().on('connection', async (ws) => {
  console.log('Fighting the Powers That Be over WebSockets!');
  const tot = await Total.findOne({_id: process.env.MONGO_TOTAL_ID});
  ws.send(tot.total);
});

// This is the websocket middleware. 
// Specify a route where you'll accept websocket connections. Here I just used the index route, "/"
// The "on" function is what listens for connections
// So when a message is received from your client, the function is executed
// Look at my client code to see how to allow your site to send messages to your server
app.ws('/', (ws, req) => {

  // Since you'll be querying your database in this function, 
  // you'll need the help of async again
  ws.on('message', async (msg) => {
    console.log(msg);
    
    // Another query to the database, same as earlier
    const tot = await Total.findOne({_id: process.env.MONGO_TOTAL_ID});
    
    // This is the actual message that you want to tweet out. It is set on the status property
    // The ${tot.total} is the total you received from your database, so it is the total running count
    // The plus 1 here is the new total, which is the current total plus the new user's contribution
    // thus this is an accurate account of how many times your users have expressed their desire to contribute
    // Note, this doesn't update your actual total, that comes a little later
    const tweet = {
      status: `${tot.total + 1} people and I say "Fuck Ajit Pai". Retweet if you do too #netneutrality #FightForFreeInternet https://t.co/KE2wRbq2LC`
    }
    
    // This sends a post request to Twitter which sends out a tweet with whatever message you supplied in your "tweet" parameter
    // The Twitter API won't allow duplicate tweets and doesn't like multiple @x-person tweets
    // So be careful or you'll get your account restricted and you will not do any good for the cause
    // But by incrementing the number each time, that bypasses Twitter's restrictions. So unless you're going crazy
    // This should work. If not... well you'll have some reconfiguration to do
    T.post("/statuses/update", tweet, async (err, data, res) => {
      if(err) {
        console.log(err);
        
        // Hanle errors better than me, please
        ws.send("They Shut Down My Twitter :(");
      }
      
      else {
        
        // This is where we do our magic and actually update and send out the new number to all clients
        // This database query must take the arguments {new: true}, and have all arguments in this order
        // that way your "newTot" variable is upadated before it is broadcast
        // The argument that says {$inc: {total: 1}} is what will update the total, and it increments it by 1 each time
        // Consult the mongoose/mongoDB docs for further clarifications on how this works
        const newTot = await Total.findOneAndUpdate({_id: process.env.MONGO_TOTAL_ID}, {$inc: {total: 1}}, {new: true}).exec(); 
        
        // The final step! This sends out the total count back to the client,
        // Since the "aWss" variable returns an array of all clients, you must loop over it 
        // and send your message to every one of them
        // Now, if you did everything right (and if I did everything right), 
        // you'll be broadcasting in real time to your users!
        aWss.clients.forEach((client) => {
          client.send(newTot.total);
        });
      }    
      
    });
    
  });
});
 
// Allow for the server to listen for requests. 
// console.log whatever here, this is just for your own amusement
app.listen(process.env.PORT, () => console.log("Fuck Ajit Pai"));

