//Parts of speach library
var Twitter = require('twitter-node-client').Twitter;
require('dotenv').config();
console.log('key',process.env.TW_KEY);
var config = {
    "consumerKey": process.env.TW_KEY,
    "consumerSecret": process.env.TW_SECRET,
    "accessToken": process.env.TW_TOKEN,
    "accessTokenSecret": process.env.TW_TOKENSECRET,
    "callBackUrl": process.env.TW_CALLBACKURL
};
//Setup twitter object
var twitter = new Twitter(config);
var partsOfSpeech = require('./nlp.js').partsOfSpeech;


var tweetProcessor = function (){
  let tweets = [];
  return {
      load: (handle,num)=>{
          return new Promise((resolve,reject)=>{
            let keeper = [];
            try{
              twitterRequest(handle,num).then(arr=>{
                for(let i = 0;i<arr.length; i++){
                  partsOfSpeech(arr[i].text).then(obj=>{
                    let length = Object.keys(obj).length;

                    if(length>=1){
                      arr[i].pos = obj;
                      keeper.push(arr[i]);
                    }
                    if(i===(arr.length-1)){
                      tweets = keeper;
                      return keeper.length;
                    }
                  });
                }
              }).then((length)=>{
                if(keeper.length>=1){
                  resolve(tweets.slice());
                }else{
                  fetchTweets().load(handle,num+1);
                }
              }).catch(e=>{throw e});
            }catch (e){
              reject(e);
            }
      })
    },
    print:()=>{
      return tweets.slice();
    }

  };
}

// function cleanText(str){
//   //remove hashtags
//   str = str.replace(/\#\w\w+\s?/g, '');
//   //remove links
//   str = str.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
//   return str;
// }


function twitterRequest(handle,num){
  return new Promise((resolve,reject)=>{

    twitter.getUserTimeline(
      { screen_name: handle, count: num},
      (err,res,body)=>{
        console.log('error',err);
        reject(err);
      },(body)=>{
        resolve(JSON.parse(body));
        });
      });


}

module.exports.twitterRequest = twitterRequest;
module.exports.tweetProcessor = tweetProcessor;
