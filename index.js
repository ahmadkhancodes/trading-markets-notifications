var sa = require("superagent");
// Express Setup
const express = require("express");
var cors = require("cors");
const App = express();
var PORT = process.env.PORT || 9002;
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
App.use(cors());
App.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
App.use(express.json());
App.post("/sendnotification", (req, res) => {
  const data = req.body;
  // Getting Tokens from Firebase
  var POST_DATA = [];
  var TOKENS_ORG = []; // Can contain duplicate
  var TOKENS_FN = []; // Will not contain duplicate
  var dataSize = 0;
  db.ref()
    .once("value")
    .then(function (snapshot) {
      dataSize = snapshot.numChildren();
      if (dataSize != 0) {
        var TOKEN_KEYS = Object.keys(snapshot.val()).map((key) => key);
        for (var i = 0; i < TOKEN_KEYS.length; i++) {
          TOKENS_FN.push("ExponentPushToken[" + TOKEN_KEYS[i] + "]");
        }
        for (var i = 0; i < TOKENS_FN.length; i++) {
          POST_DATA.push({
            to: TOKENS_FN[i],
            title: data.title,
            body: data.message,
          });
        }
      }

      (async () => {
        try {
          const res = await sa
            .post("https://exp.host/--/api/v2/push/send")
            .send(POST_DATA);
          // console.log(res);
        } catch (err) {
          // console.log(err);
        }
      })();

      // sa.post("https://exp.host/--/api/v2/push/send")
      //   .send(POST_DATA)
      //   .then(console.log)
      //   .catch(console.error);
      //   Sending Notification
      // sa.post("https://exp.host/--/api/v2/push/send")
      //   .send(POST_DATA)
      //   .end(function (err, res) {});
      // // request.post("https://exp.host/--/api/v2/push/send", {
      // //   json: POST_DATA,
      // // });
      // // console.log(POST_DATA, TOKENS_FN, TOKENS_ORG);
      res.json({
        status: POST_DATA,
      });
      POST_DATA = [];
      TOKENS_FN = [];
      console.log(POST_DATA, TOKENS_FN);
    });
});

// git push heroku HEAD:master (to Push on Heroku)
// Endpoint: https://mutes.herokuapp.com/sendnotification
