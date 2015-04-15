/**
* Module dependencies.
*/

var express = require('express');
var http = require('http');
var path = require('path');
var swig = require('swig');

var app = express();

var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
//var basicAuth = require('basic-auth');

swig.setDefaults({ cache: false });
// all environments
app.engine('html', swig.renderFile);
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.use(logger(':method :url'));
app.use(methodOverride('_method'));
app.use(cookieParser('my secret here'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
	resave: false, // don't save session if unmodified
	saveUninitialized: false, // don't create session until something stored
	secret: 'shhhh, very secret'
}));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
	//app.use(express.errorHandler());
	app.use(errorhandler());
}

app.get('/', function(req, res){
	res.render('index', null);
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

