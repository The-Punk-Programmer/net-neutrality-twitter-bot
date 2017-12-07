vex.defaultOptions.className = 'vex-theme-default';

let info = document.getElementById("info");
let totalCount = document.getElementById("totalCount")
let userCount = document.getElementById("userCount");
let fight = document.getElementById("fight");


let numTimes = localStorage.getItem("user-tweet");
if (numTimes === null) {
    numTimes = 0;
} else {
    numTimes = parseInt(numTimes, 10);
}

userCount.textContent = "Your Count: " + numTimes.toString(10);

let socket = new WebSocket("wss://ribbon-niece.glitch.me/");

socket.onerror = function(error) {
    console.log("WebSocket Error: " + JSON.stringify(error));
    vex.dialog.alert({
        message: "Damn, something went wrong :( Look in the console to see what the error is."
    })
};

socket.addEventListener("open", function (event) {
    socket.send("Fuck Yeah Let's Go!");
});

socket.addEventListener("message", function (event) {
    totalCount.innerHTML = "Total Count: " + event.data;
});

fight.addEventListener("click", () => {
  socket.send("I Stand For Net Neutrality");

    numTimes++;
    localStorage.setItem("user-tweet", (numTimes).toString(10))

    userCount.textContent = "Your Count: " + numTimes.toString(10);

    vex.dialog.alert({
        message: "Tweet Sent! Thanks For Taking Part In The Fight To Protect Net Neutrality. Click Again and Fight Some More! Then Check Out My Twitter To See Our Progress: https://twitter.com/punk_professor?lang=en"
    });
});

info.addEventListener("click", () => {
    vex.dialog.alert({
        message: 'I built a Twitter Bot that tweets "X people and I say \'Fuck Ajit Pai\'. Retweet if you do too #netneutrality #FightForFreeInternet https://t.co/KE2wRbq2LC" with a link to sign a petition to save Net Neutrality on change.org. The X here is you and all people who think like you and I do. You will find the total people that have helped fight the cause, as well as your specific contribution below. Net Neutrality is no joke, I strongly urge you to help protect it in any way you can. I have also included a link to my Github where you can find the server code to make your own bot and spread the word. Let\'s get a swarm going!'
    });
});






