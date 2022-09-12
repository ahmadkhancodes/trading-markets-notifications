var request = require("request");
// Express Setup
const express = require("express");
var cors = require("cors");
const App = express();
var PORT = process.env.PORT || 3200;
App.listen(PORT);

// Firebase Setup
var admin = require("firebase-admin");
var serviceAccount = require("./trading-markets-notifications-firebase-adminsdk-a2e1o-adfea677b0.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://trading-markets-notifications-default-rtdb.europe-west1.firebasedatabase.app",
});
var db = admin.database();

// Routes & Middlewares
// App.use(cors());
App.use(express.json());
App.post("/sendnotification", (req, res) => {
  const data = req.body;
  // Getting Tokens from Firebase
  var POST_DATA = [];
  var TOKENS_ORG = []; // Can contain duplicate
  var TOKENS_FN = []; // Will not contain duplicate
  var dataSize = 0;
  db.ref("UserTokens")
    .once("value")
    .then(function (snapshot) {
      dataSize = snapshot.numChildren();
      if (dataSize != 0) {
        TOKENS_ORG = Object.values(snapshot.val());
        for (var i = 0; i < TOKENS_ORG.length; i++) {
          TOKENS_FN.push(TOKENS_ORG[i].token);
        }
        TOKENS_FN = [...new Set(TOKENS_FN)];
        for (var i = 0; i < TOKENS_FN.length; i++) {
          POST_DATA.push({
            to: TOKENS_FN[i],
            title: data.title,
            body: data.message,
          });
        }
      }
      //   Sending Notification
      request.post("https://exp.host/--/api/v2/push/send", {
        json: POST_DATA,
      });
      res.json({
        status: "Notifications Successfully Sent",
      });
    });
});

// git push heroku HEAD:master (to Push on Heroku)
// Endpoint: https://mutes.herokuapp.com/sendnotification
