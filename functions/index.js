const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
var serviceAccount = require("./pwagram-key.json")

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pwagram-1e19f.firebaseio.com/',
});

exports.storePostData = functions.https.onRequest(function(request, response) {
    cors(request, response, function() {
        admin.database().ref('posts').push({
            id: request.body.id,
            title: request.body.title,
            location: request.body.location,
            image: request.body.image
        })
        .then(function(){
            response.status(201).json({message: 'Data stored', id: request.body.id});
        })
        .catch(function(err){
            response.status(500).json({error: err});
        })
    });
});
