'use strict';

var request = require("request");

// populate environment variables locally.
require('dotenv').config()

export function handler(event, context, callback) {
    const doingString = event.queryStringParameters.doing;
    const imgUrl = event.queryStringParameters.imgUrl;
    
    if(imgUrl) {
      let urlPieces = imgUrl.split('/');
      let photoId = urlPieces[urlPieces.length - 1];
      if (photoId.endsWith('.jpg')) {
        // Protects against imgur changing
        let idSplit = photoId.split('.');
        photoId = idSplit[0];
      } 
      var imgDownloadLink = `https://imgur.com/download/${photoId}`      
    } 

    var payload = {
      'form-name' : process.env.FORM_NAME,
      'received': new Date().toString(),
      'doing': doingString,
      'imgUrl': imgDownloadLink
    };

    var approvedURL = process.env.POST_FORM;

    request.post({'uri':approvedURL, 'formData': payload }, function(err, httpResponse, body) {
      var msg;

      if (err) {
        msg = 'Post to status list failed:' + err;
        console.log(msg);
      } else {
        msg = 'Post to status list successful.'
        console.log(msg);
      }
      var msg = "Status posted. Deploy triggered.";

      console.log(msg);
      callback(null, {
        statusCode: 200,
        body: msg
      });
      return console.log(msg);
    });
  };
