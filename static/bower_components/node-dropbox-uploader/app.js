var Dropbox = require("dropbox");
var fs = require('fs');
var FlowNoRedirect = require('./auth_driver/flow_no_redirect')

var help = "--dropbox-key <key> --dropbox-secret <secret> --filename <upload>";
var argv = require('minimist')(process.argv.slice(2));
var filename = argv['filename'];

//TODO: Clean up error handling.

if(filename === undefined) {
  console.log(help);
  console.log("Error: Set name of file to upload");
  process.exit(1);
}

if(argv['dropbox-key'] === undefined || argv['dropbox-secret'] === undefined) {
  console.log(help);
  console.log("Error: Set dropbox application details");
  process.exit(1);
}

var client = new Dropbox.Client({
  key: argv['dropbox-key'],
  secret: argv['dropbox-secret']
});

client.authDriver(new FlowNoRedirect());

client.authenticate(function(error, client) {
  if(error !== null) {
    console.log("[" + new Date() + "] " + error);
    process.exit(1);
  }

  fs.readFile(filename, function(err, data) {
    if(err !== null) {
      console.log("[" + new Date() + "] " + err);
      process.exit(1);
    } 

    client.writeFile(filename, data, function(error, stat) {
      if(error !== null) {
        console.log("[" + new Date() + "] " + error);
        process.exit(1);
      } 
      console.log("Done");
      process.exit(0);
    });    
  })

});
