'use strict';
const
    bodyParser = require('body-parser'),
    config = require('config'),
    express = require('express'),
    request = require('request');

var app = express();
var port = process.env.PORT || process.env.port || 5000;
app.set('port',port);
app.use(bodyParser.json());
const MOVIE_API_KEY = config.get('MovieDB_API_Key');

app.listen(app.get('port'),function(){
    console.log('[app.listen]Node app is running on port',app.get('port'));
});

module.exports = app;

app.post('/webhook',function(req, res){
    let data = req.body;
    let queryMovieName = data.queryResult.parameters.MovieName;
    let propertiesObject = {
        query:queryMovieName,
        api_key:MOVIE_API_KEY,
        language:"zh-TW"
    };
    request({
        uri:"http://api.themoviedb.org/3/search/movie?",
        json:true,
        qs:propertiesObject
    },function(error, response, body){
        if(!error && response.statusCode == 200){
            if(body.results.length!=0){ // To confirm got data or not
                var thisFulfillmentMessages=[];
                var movieTitleObject={};
                if(body.results[0].title == queryMovieName){ // To confirm exectly the same or not
                    movieTitleObject.text={text:[body.results[0].title]};
                }else{
                    movieTitleObject.text={text:["系統內最相關的電影是"+body.results[0].title]};
                }
                thisFulfillmentMessages.push(movieTitleObject);
                if(body.results[0].overview){ // To confirm if there exists movie introduction
                    var movieOverViewObject={};
                    movieOverViewObject.text={text:[body.results[0].overview]};
                    thisFulfillmentMessages.push(movieOverViewObject);
                }
                if(body.results[0].poster_path){ // To confirm if there exists movie poster image
                    var movieImageObject={};
                    movieImageObject.image={imageUri:"https://image.tmdb.org/t/p/w185/"+body.results[0].poster_path};
                    thisFulfillmentMessages.push(movieImageObject);
                }
                res.json({fulfillmentMessages:thisFulfillmentMessages});
            }else{
                res.json({fulfillmentText:"很抱歉，系統裡面沒有這部電影"});
            }
        }else{
            console.log("[the MovieDB] failed");
        }
    });
});

