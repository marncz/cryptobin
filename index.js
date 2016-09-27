var app = require('express')();
var http = require('http').Server(app);
var aesjs = require('aes-js');
var bcrypt = require('bcrypt-nodejs');
var bodyParser  = require('body-parser');
var multer  = require('multer');
var mysql      = require('mysql');
var fs = require('fs');
var storage = multer.memoryStorage();
var https = require('https');
var crypto = require('crypto');

var upload = multer({ storage: storage});
var type = upload.single('image');


var createServer = require("auto-sni");



function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}


var connection = mysql.createConnection({
  hostname : '127.0.0.1',
  user     : 'root',
  password : 'pass',
  database : 'msg'
});

connection.connect(function(err){
if(!err) {
    console.log("[OK] Database is connected ... ");    
} else {
    console.log("[ERROR] Error connecting database ... ");    
}
});


app.use(bodyParser.urlencoded({ extended: true, limit: '500mb' }));

app.use(bodyParser.json({limit: '500mb'}));


app.post('/api/i/newmsg', function (req, res) {
		console.log(req.ip);
		//if(req.ip == "127.0.0.1"){
			connection.query('INSERT INTO messages SET ?', req.body, 
			function (err, result) { 
				var d = new Date();
				var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
				console.log(ip + " " + d + " Created message: "+ req.body.id );
			} );
		//} else {
		//	console.log("API access denied from IP: " + req.ip);	
		//}
		
});

app.get('/', function(req, res){
 var d = new Date();
 var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
 var ref = req.headers.referer;
 console.log(ip + " " + d + " Access: / From: " + ref);
 res.sendFile(__dirname + '/index.html');
});

app.get('/ups', function(req, res){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	var d = new Date();
	console.log(ip + " " + d + " Access: /ups");
	res.sendFile(__dirname + '/ups.html');
});



app.get('/json/m/:msgID', function(req, res){
 var msgID = req.params.msgID;
 var msg = "";
 var files = "";
 var checksum = "";
 var views;
 connection.query("SELECT * FROM messages WHERE id = ?", msgID, 
			function (err, rows, fields) { 
				 if(err == null && rows.length > 0){
					views = rows[0]["views"];
					msg = rows[0]["msg"];
					files = rows[0]["files"];
					checksum = rows[0]["checksum"];
					var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
					console.log(ip + " Viewed message: "+ msgID );
					removeView(msgID);
 					res.json({ result: "ok", msg: msg, files: files, checksum: checksum });
				 } else {
					 res.json({ result: "error" });
					 console.log("View msg: error");
				 }
});	


var removeView = function (id) {
	if(views > 0){	
		var nViews = views - 1;	
		
		if(nViews == 0){
			connection.query("DELETE FROM messages WHERE id = ?", msgID);	
		} else {
			connection.query("UPDATE messages SET views = ? WHERE id = ?", [nViews, msgID]);
		}
	}

}	
			


});

app.post('/file-upload', type, function(req, res, next){
	var obj = req.file.buffer;
	var base64 = new Buffer(obj).toString('base64');
	res.append('sucess','200');
	res.send(base64);
});

app.post('/load-image', type, function(req, res, next ){
	var obj = req.file.buffer;
	
	if(obj) {
		var secret = new Buffer(obj).toString('base64');

		var hash = crypto.createHash('sha256');

		hash.update(secret);

		//var url = hash.substring(0, 32);
		res.redirect("/m/" + hash.digest('hex'));
	}
});

app.get('/m/:msgID', function(req, res){
 var msgID = req.params.msgID;
 res.status(200);

 res.sendFile(__dirname + '/message.html');
});

app.get('/lib/qrcode', function(req, res){
 res.sendFile(__dirname + '/lib/qrcode.js');
});

app.get('/style/main', function(req, res){
 res.sendFile(__dirname + '/style/main.css');
});

app.get('/images/file', function(req, res){
 res.sendFile(__dirname + '/images/file.png');
});

app.get('/images/reddit', function(req, res){
	 res.sendFile(__dirname + '/images/reddit.png');
});

app.get('/images/bitcoin', function(req, res){
	 res.sendFile(__dirname + '/images/bitcoin.png');
});

app.get('/style/linedtextarea', function(req, res){
	 res.sendFile(__dirname + '/style/linedtextarea.css');
});

app.get('/lib/linedtextarea', function(req, res){
	 res.sendFile(__dirname + '/lib/linedtextarea.js');
});

app.get('/style/dropzone', function(req, res){
 res.sendFile(__dirname + '/style/dropzone.css');
});

app.get('/scripts', function(req, res){
 res.sendFile(__dirname + '/scripts.js');
});


createServer({
    email: 'marnczarnecki@gmail.com', // Emailed when certificates expire.
    agreeTos: true, // Required for letsencrypt.
    debug: false, // Add console messages and uses staging LetsEncrypt server. (Disable in production)
    domains: ["cryptob.in"], // List of accepted domain names. (You can use nested arrays to register bundles with LE).
    forceSSL: true, // Make this false to disable auto http->https redirects (default true).
    redirectCode: 302, // If forceSSL is true, decide if redirect should be 301 (permanent) or 302 (temporary). Defaults to 302
    ports: {
        http: 80, // Optionally override the default http port.
        https: 443 // // Optionally override the default https port.
    }
}, app);


//app.listen(80);




