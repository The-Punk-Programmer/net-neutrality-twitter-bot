// This is the code for getting your messages to the websockets server so the bot can tweet
// Also includes control over modals using the vex library
// And sets the localstorage so that every user can see how many times they've individually tweeted

// This sets the vex theme. See the vex documentation to see what other options are available. They're on github
vex.defaultOptions.className = 'vex-theme-default';

// Select elements 
let info = document.getElementById("info");
let totalCount = document.getElementById("totalCount")
let userCount = document.getElementById("userCount");
let fight = document.getElementById("fight");

// Here the localstorage is being accessed to get the "user-tweet" item
// If it doesn't exist yet, set the numTimes variable to 0 and parse it as a string
// The numTimes variable is what will be inserted into the actual HTML
let numTimes = localStorage.getItem("user-tweet");
if (numTimes === null) {
    numTimes = 0;
} else {
    numTimes = parseInt(numTimes, 10);
}

// Here is the count being inserted
userCount.textContent = "Your Count: " + numTimes.toString(10);


// This sets up a new websocket connection. The link in the constructor is my server
// Feel free to connect to it, but make sure to set up your own so that we can get 
// as many people tweeting as possible!
// See the bot-server.js file for how to handle the server side
let socket = new WebSocket("wss://ribbon-niece.glitch.me/");

// Console log any errors and let the user know with a nice modal that the connection hasn't occurred.
// There are lots that can go wrong here, so make sure you handle errors much better than I am here
socket.onerror = function(error) {
    console.log("WebSocket Error: " + JSON.stringify(error));
    vex.dialog.alert({
        message: "Damn, something went wrong :( Look in the console to see what the error is."
    })
};

// This establishes the connection to the server, letting the server know you wish to be subscribed 
// to any new data. This connection ends when the user leaves the site amd  
// reopened when they revisit or refresh
socket.addEventListener("open", function (event) {
    socket.send("Fuck Yeah Let's Go!");
});

// This is what will update the HTML whenever any user sends data to the server
// This is where the real-time functionality of the app comes in
// The message here just lets the server know you're sending data so it can respond 
// and update the count for everyone
socket.addEventListener("message", function (event) {
    totalCount.innerHTML = "Total Count: " + event.data;
});

// Here the message is dispatched. This occurs when the user clicks on the Tweet button
// The socket sends a nice message to my server letting me know that you are steadfast in your 
// dedication to the cause
// and allows for the server to now emit it's data back so everyone can see your commitment
// It also updates the localstorage to show your own personal contribution
// See the bot-server.js file for more info on how this gets handled server-side
fight.addEventListener("click", () => {
  socket.send("I Stand For Net Neutrality");

    numTimes++;
    localStorage.setItem("user-tweet", (numTimes).toString(10))

    userCount.textContent = "Your Count: " + numTimes.toString(10);
    
    // This shows a modal alert that gives feedback to the user
    // Replace my twitter account's url with your own if you decide
    // to set up your own twitter bot
    vex.dialog.alert({
        message: "Tweet Sent! Thanks For Taking Part In The Fight To Protect Net Neutrality. Click Again and Fight Some More! Then Check Out My Twitter To See Our Progress: https://twitter.com/punk_professor?lang=en"
    });
});

// This also shows a modal alert that gives info on the app
// This is very important so your user actually understands what the app is doing
info.addEventListener("click", () => {
    vex.dialog.alert({
        message: 'I built a Twitter Bot that tweets "X people and I say \'Fuck Ajit Pai\'. Retweet if you do too #netneutrality #FightForFreeInternet https://t.co/KE2wRbq2LC" with a link to sign a petition to save Net Neutrality on change.org. The X here is you and all people who think like you and I do. You will find the total people that have helped fight the cause, as well as your specific contribution below. Net Neutrality is no joke, I strongly urge you to help protect it in any way you can. I have also included a link to my Github where you can find the server code to make your own bot and spread the word. Let\'s get a swarm going!'
    });
});






