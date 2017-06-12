// // Chapter 1: Write head, requires
// var http = require('http');
// var fs = require('fs');

 
// var server = http.createServer();
// server.on('request', function(request, response) {
//    response.writeHead(200, {'Content-Type': 'text/html'});
//   fs.readFile('index.html', function(err, contents) {
//     response.write(contents);
//     console.log("New request coming in...");
//     response.end();
//   });
// });

 

// server.on("close", function(){
//           console.log("Closing down the server...");
//           });

// server.listen(8080);



// // Chapter 2: Events
// var events = require('events');
// var EventEmitter = events.EventEmitter;

// var chat = new EventEmitter();
// var users = [], chatlog = [];

// chat.on('message', function(message) {
//   chatlog.push(message);
// });

// chat.on('join', function(nickname) {
//   users.push(nickname);
// });

// // Emit events here
// chat.emit("join", "emit something");
// chat.emit("message", "emit something");




// Chapter 3: Streams

// var fs = require('fs');
// var http = require('http');
// var events = require('events');
// var underscore = require("underscore");

// http.createServer(function(request, response) {
//   response.writeHead(200, {'Content-Type': 'text/html'});
//   var file = fs.createReadStream('index.html');
//   file.pipe(response);

//   console.log("New request coming in...");
// }).listen(8080);


// // Chapter 4: Modules
// // See high_five module

// var highfive = require('./high_five.js');

// highfive();
// highfive.info('This is some information');
// highfive.warn('Everything is just fine, running smoothly');
// highfive.error('Everything is fine');
// highfive.underscoreFx();




// Chapter 5: Express




// var express = require("express");
// var app = express();


// app.get("/", function(request,response){
// 	response.sendFile(__dirname + "/index.html");

// });
// app.listen(8080);

// var express = require('express');
// var app = express();

// var quotes = {
//   'einstein': 'Life is like riding a bicycle. To keep your balance you must keep moving',
//   'berners-lee': 'The Web does not just connect machines, it connects people',
//   'crockford': 'The good thing about reinventing the wheel is that you can get a round one',
//   'hofstadter': 'Which statement seems more true: (1) I have a brain. (2) I am a brain.'
// };

// app.get('/quotes/:name', function(req, res) {
//   var quote = quotes[req.params.name];
//   res.render("./quote.ejs", {
//     name:req.params.name, 
//     quote: quote});
// });

// app.listen(8080);

// var url = require('url');

// var options = {
//   protocol: "http:",
//   host: "search.twitter.com",
//   pathname: '/search.json',
//   query: { q: "codeschool"}
// };

// var searchURL = url.format(options);

// var request = require('request');
// request(searchURL, function (error, response, body) {
//   console.log( body) ;
// });





// var url = require('url');
// var request = require('request');

// var options = {
//   protocol: "http:",
//   host: "search.twitter.com",
//   pathname: '/search.json',
//   query: {
//     q: "codeschool"
//   }
// };

// var searchURL = url.format(options);


// var express = require('express');
// var app = express();

//  app.get('/', function(req, res) {
//     request(searchURL).pipe(res);
//   });

// app.listen(8080);





// Chapter 6: Socket.io



// var express = require('express');
// var app = express();
// var server = require("http").createServer(app);
// var io = require("socket.io")(server);

// io.on("connection", function(client){
// 		console.log("User Connected...")
// 		client.on("messages", function(data){
// 		client.broadcast.emit("messages", data);
// 		console.log(data);
// 	});
// });


// app.get('/', function(req,res){
// 	res.sendFile(__dirname + '/index.html');
// });

// server.listen(8080);







//  Part Two - broadcasting




// io.on("connection", function(client){
	
// 	client.on("join", function(name){
// 		client.nickname = name; 
		
// 	});

// 	client.on("messages", function(data){
// 		client.broadcast.emit("messages", data);

// 		var nickname = client.nickname;
// 		client.broadcast.emit("message", nickname + ": " + message);
// 		client.emit("messages", nickname + ": " + message);

// 		console.log(data);
		
// 	});

	
// });






// Chapter 7: Persisting Data



// var express = require('express');
// var app = express();
// var server = require("http").createServer(app);
// var io = require("socket.io")(server);
// // var redis = require("redis");
// // var client = redis.createClient();



// // client.set("message1","Hello, dog");
// // client.set("message2","Hello, scrow!!");


// io.on("connection", function(client){
// 		console.log("User Connected...")
// 		client.on("messages", function(data){
// 		client.broadcast.emit("messages", data);
// 		console.log(data);
// 	});
// });

// app.get('/', function(req,res){
// 	res.sendFile(__dirname + '/index.html');
// });

// server.listen(8080);




var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var redisClient = require('./lib/redisClient.js');

var port = process.env.PORT || 8080;
server.listen(port);
console.log('Server listening on port %d', port);

/**
 *	Serve static files from `public`
 */

app.use(express.static(__dirname + '/public'));

/**
 *	Handle all routes to the webserver
 */

app.get('/*', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

/**
 *	Store a message in redis
 *
 *	@function storeMessage
 *	@param {String} name
 *	@param {Object} data
 */

function storeMessage (name, data) {
	var message = JSON.stringify({name:name, data:data});

	// store up to 10 messages
	redisClient.lpush('messages', message, function(error) {
		if (error) throw error;
		redisClient.ltrim('messages', 0, 10);
	});
};

/**
 *	Handle connnection Websockets
 */

io.sockets.on('connection', function (client) {


	/**
	 *	When users join, set their nickname and broadcast they are here
	 *	Add the user to redis set `chatters`
	 */

	client.on('join', function(name) {
		client.set('nickname', name);
		client.broadcast.emit('add chatter', name); 
		redisClient.sadd('chatters', name);

		/**
		 *	Add all current chatters to the current client’s chatters list
		 */

		redisClient.smembers('chatters', function(error, names) {
			names.forEach(function(name) {
				client.emit('add chatter', name);
			});
		});

		/**
		 *	Add latest chat messages to current client
		 */
		
		redisClient.lrange('messages', 0, -1, function( error, messages) {
			messages = messages.reverse();

			messages.forEach(function(message) {
				message = JSON.parse(message);
				client.emit('messages',message.name + ' : ' + message.data);
			});
		});
	});

	/**
	 *	When a message comes through, get the name and broadcast the messsage
	 *	Store the message after we get the nicname
	 */

	client.on('messages', function(message) {
		client.get('nickname',function(error, name) {
			storeMessage(name, message);
			client.broadcast.emit('messages', name + ' : ' + message);
		});
	});

	/**
	 *	When a user disconnects, get their name and broadcast they left
	 */

	client.on('disconnect', function(name) {
		client.get('nickname', function(error, name) {
			client.broadcast.emit('remove chatter', name);
			redisClient.srem('chatters', name);
		});
	});
});




