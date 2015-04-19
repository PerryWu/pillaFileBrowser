var path = require('path');
var fs = require('fs-extra');
var util = require('util');
var async = require('async');
var _ = require('lodash');


var defaultDir;

function fileList() {
};

fileList.dir = function (dir) {
	defaultDir = dir;
};

/*
*	Get folder number in given folderDir.
*/
function getFolderCount(folderDir, cb) {
	var currentDir = folderDir;

	fs.readdir(currentDir, function(err, files) {
		if (err) {
			throw err;
		}
		var dataList = [];

		files.filter(function(file) {
			return true;
		}).forEach(function(file) {
			dataList.push({
				file: file,
				filePath: path.join(currentDir, file),
			});
		});

		//console.log(dataList);
		async.map(dataList, 
			function(fileObj, cb) {
				fs.stat(fileObj.filePath, cb);
			},
			function(err, results) {
				if (err) {
					console.log(err);
					cb(err, 0);
					return;
				}
				var folderCount = 0;
				for (i = 0; i < results.length; i++) {
					//console.log("processing " + dataList[i].filePath + " " +
						/*util.inspect(results[i]) +*/
					//" isDic :" + results[i].isDirectory());
					if (results[i].isDirectory()) {
						folderCount++;
					}
				}
				cb(null, folderCount);
			});
	});
}

fileList.getFileList = function (req, res) {
	//res.status(404).send("pppp!!");
	//res.statusCode = 404;
	var currentDir = defaultDir;
	var query = req.query.path || '';
	if (query) 
		currentDir = path.join(defaultDir, query);
	console.log("browsing ", currentDir);

	fs.readdir(currentDir, function(err, files) {
		if (err) {
			throw err;
		}
		var data = [];
		var dataList = [];

		files.filter(function(file) {
			return true;
		}).forEach(function(file) {
			dataList.push({
				file: file,
				filePath: path.join(currentDir, file),
				urlPath: path.join(query, file)
			});
		});

		//console.log(dataList);
		async.map(dataList, 
			function(fileObj, cb) {
				fs.stat(fileObj.filePath, cb);
			},
			function(err, results) {
				if (err) {
					console.log(err);
					res.end("Error occurs");
					return;
				}
				for (i = 0; i < results.length; i++) {
					//console.log("processing " + dataList[i].filePath + " " +
						/*util.inspect(results[i]) +*/
					//" isDic :" + results[i].isDirectory());
					if (results[i].isDirectory()) {
						data.push({
							Name: dataList[i].file,
							IsDirectory: true,
							Path: dataList[i].urlPath,
							fileSize: results[i].size
						});
					} else {
						var ext = path.extname(dataList[i].filePath);
						data.push({
							Name: dataList[i].file,
							Ext: ext,
							IsDirectory: false,
							Path: dataList[i].urlPath,
							fileSize: results[i].size,
							MTime: results[i].mtime
						});
					}
				}
				//data = _.sortBy(data, function(f) { return f.Name });
				res.json(data);
			});
	});
};


fileList.getFolderList = function (req, res) {
	var currentDir = defaultDir;
	var query = req.query.path || '';
	if (query) currentDir = path.join(defaultDir, query);
	console.log("browsing ", currentDir);

	fs.readdir(currentDir, function(err, files) {
		if (err) {
			throw err;
		}
		var dataList = [];

		files.filter(function(file) {
			return true;
		}).forEach(function(file) {
			dataList.push({
				file: file,
				filePath: path.join(currentDir, file),
				urlPath: path.join(query, file)
			});
		});

		//console.log(dataList);
		async.map(dataList, function(fileObj, cb) {
			fs.stat(fileObj.filePath, cb);
		},
		function(err, results) {
			if (err) {
				console.log(err);
				res.end("Error occurs");
				return;
			}
			var folderList = [];
			for (i = 0; i < results.length; i++) {
				//console.log("processing " + dataList[i].filePath + " " +
					/*util.inspect(results[i]) +*/
				//" isDic :" + results[i].isDirectory());
				if (results[i].isDirectory()) {
					folderList.push({
						folder: dataList[i].file,
						folderPath: path.join(currentDir, dataList[i].file)
					});
				}
			}

			async.map(folderList, function(folderObj, cb) {
				getFolderCount(folderObj.folderPath, cb);
			},
			function(err, results) {
				if (err) {
					console.log(err);
					res.end("Error occurs");
					return;
				}
				var data = [];
				for (i = 0; i < results.length; i++) {
					data.push({
						Name: folderList[i].folder,
						Path: path.join(query, folderList[i].folder),
						FolderCount: results[i]
					});
				}
				console.log(data);
				res.json(data);
			});
		});
	});
};


fileList.actFiles = function (req, res) {
	console.log(req.body);
	console.log(req.body.srcFiles);
	res.send("{'status':'success','message':'done'}");
// 	setTimeout(function(){
//			console.log("end with good");
//			res.send("{'status':'success','message':'done'}");
//		}, 3000);
}

module.exports = fileList;
