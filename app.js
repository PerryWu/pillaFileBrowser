/**
* Module dependencies.
*/

var express = require('express');
var http = require('http');
var path = require('path');
//var swig = require('swig');
var app = express();

var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
//var basicAuth = require('basic-auth');

var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var async = require('async');

var dir = process.cwd();

//swig.setDefaults({ cache: false });
//app.engine('html', swig.renderFile);

// all environments
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
	res.redirect('index.html');
});

app.get('/test.html', function(req, res){
	res.redirect('test.html');
});

app.get('/files', function(req, res) {
	var currentDir = dir;
	var query = req.query.path || '';
	if (query) currentDir = path.join(dir, query);
	console.log("browsing ", currentDir);

	fs.readdir(currentDir, function(err, files) {
		if (err) {
			throw err;
		}
		var data = [];
		var fileList = [];

		files.filter(function(file) {
			return true;
		}).forEach(function(file) {
			fileList.push({
				file: file,
				filePath: path.join(currentDir, file),
				urlPath: path.join(query, file)
			});
		});

		//console.log(fileList);
		async.map(fileList, function(fileObj, cb) {
			fs.stat(fileObj.filePath, cb);
		},
		function(err, results) {
			if (err) {
				console.log(err);
				res.end("Error occurs");
				return;
			}
			for (i = 0; i < results.length; i++) {
				console.log("processing " + fileList[i].filePath + " " +
				/*util.inspect(results[i]) +*/
				" isDic :" + results[i].isDirectory());
				if (results[i].isDirectory()) {
					data.push({
						Name: fileList[i].file,
						IsDirectory: true,
						Path: fileList[i].urlPath,
						fileSize: results[i].size
					});
				} else {
					var ext = path.extname(fileList[i].filePath);
					data.push({
						Name: fileList[i].file,
						Ext: ext,
						IsDirectory: false,
						Path: fileList[i].urlPath,
						fileSize: results[i].size
					});
				}
			}
			//data = _.sortBy(data, function(f) { return f.Name });
			res.json(data);
		});
	});
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

