let AWS = require('aws-sdk');

/** random 128-bit number as a string */
function random128() {
  var result = "";
  for (var i = 0; i < 8; i++)
    result += String.fromCharCode(Math.random() * 0x10000);
  return result;
}

/** random 128-bit number in canonical uuid format. all bits are random. */
function random128Hex() {
  function random16Hex() { return (0x10000 | Math.random() * 0x10000).toString(16).substr(1); }
  return random16Hex() + random16Hex() +
   "-" + random16Hex() +
   "-" + random16Hex() +
   "-" + random16Hex() +
   "-" + random16Hex() + random16Hex() + random16Hex();
}


exports.handler = (event, context, callback) => {
    let query = event.queryStringParameters.q;
    if (event.body) {
        query = JSON.parse(event.body).text || query;
    }
    
    console.log("Starting text-to-speech for text", event.queryStringParameters.q);

    let polly = new AWS.Polly();
    polly.synthesizeSpeech({
      OutputFormat: "mp3",
      SampleRate: "8000",
      Text: query,
      TextType: "ssml",
      VoiceId: event.queryStringParameters.lang == 'nl' ? 'Lotte' : 'Joanna'
     }, function(err, data) {
         if (err) {
            console.log("Got error", err);
            return callback(err);
         }

         console.log("Got data from polly", data.AudioStream.length);
         let s3 = new AWS.S3();
         let bucket = process.env.POLLY_S3_BUCKET || 'elisebot-dev'
         let key = 'polly' + random128Hex() + ".mp3";

         s3.putObject({
             Body: data.AudioStream,
             Bucket: bucket,
             Key: key,
             ContentType: 'audio/mpeg',
             ACL: 'public-read'
         }, function(err, data) {
             if (err) {
                 console.log("Error writing to S3", err);
                 return callback(err);
             }
             return callback(null, {
                 statusCode: 200,
                 body: JSON.stringify({ url: `https://${bucket}.s3.amazonaws.com/${encodeURIComponent(key)}` })
             })
         })
     })
};

