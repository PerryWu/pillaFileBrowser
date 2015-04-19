(function($) {

	function humanFileSize(bytes, si) {
		var thresh = si ? 1000: 1024;
		if (bytes < thresh) return bytes + ' B';
		var units = si ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
		var u = - 1;
		do {
			bytes /= thresh; ++u;
		} while (bytes >= thresh);
		return bytes.toFixed(1) + ' ' + units[u];
	};

	var extensionsMap = {
		".zip": "fa-file-archive-o",
		".gz": "fa-file-archive-o",
		".bz2": "fa-file-archive-o",
		".xz": "fa-file-archive-o",
		".rar": "fa-file-archive-o",
		".tar": "fa-file-archive-o",
		".tgz": "fa-file-archive-o",
		".tbz2": "fa-file-archive-o",
		".z": "fa-file-archive-o",
		".7z": "fa-file-archive-o",
		".mp3": "fa-file-audio-o",
		".cs": "fa-file-code-o",
		".c++": "fa-file-code-o",
		".cpp": "fa-file-code-o",
		".js": "fa-file-code-o",
		".xls": "fa-file-excel-o",
		".xlsx": "fa-file-excel-o",
		".png": "fa-file-image-o",
		".jpg": "fa-file-image-o",
		".jpeg": "fa-file-image-o",
		".gif": "fa-file-image-o",
		".mpeg": "fa-file-movie-o",
		".pdf": "fa-file-pdf-o",
		".ppt": "fa-file-powerpoint-o",
		".pptx": "fa-file-powerpoint-o",
		".txt": "fa-file-text-o",
		".log": "fa-file-text-o",
		".doc": "fa-file-word-o",
		".docx": "fa-file-word-o",
	};

	function getFileIcon(ext) {
		return (ext && extensionsMap[ext.toLowerCase()]) || 'fa-file-o';
	}

	var currentMainPath = "";
	var currentTreePath = "";
	var currentItem = null;
	var currentSelectedItems = {};
	var actReq = {srcFiles: [], toPath: "", action: ""};

	$(function() {
		$( "#popupYnPage" ).enhanceWithin().popup();
	});

	//
	// Take action
	//
	function ajaxReqAction() {
		actReq.srcFiles = [];
		if(currentItem) {
			actReq.srcFiles.push(currentItem.Path);
		} else {
			var itemList = Object.keys(currentSelectedItems);
			for(var i=0; i < itemList.length; i++)
				actReq.srcFiles.push(currentMainPath + "/" + itemList[i]);
		}
		//console.log(actReq);
		//console.log($.param(actReq));
		//console.log(sentData);
		$.ajax( {
			url: '/files',
			method: 'POST',
			data: JSON.stringify(actReq),
			//processData: false,
			contentType: "application/json",
			//dataType: 'json',
			timeout: 10000})
		.done(function(data) {
			$.mobile.loading("hide");
			$("body").removeClass('ui-disabled');
			$.get("/files",function(data,status){
				pillaUpdateMainList("", data);
			});
			$(':mobile-pagecontainer').pagecontainer('change', '#mainPage');
			console.log("done callback. data:" + data);})
		.fail(function(jqXHR, textStatus) {
			$.mobile.loading("hide");
			$("body").removeClass('ui-disabled');
			$.get("/files",function(data,status){
				pillaUpdateMainList("", data);
			});
			$(':mobile-pagecontainer').pagecontainer('change', '#mainPage');
			console.log("fail callback. xhr:" + textStatus);
			console.log(jqXHR);
		});
	};

	function ajaxReqFileList(urlPath) {


	}

	//
	// Main Page: to update list by given items
	// 
	function pillaUpdateMainList(path, items) {
		$("#pilla_main_list").empty();
		$("#mainPagePath").text("Path: " + path + "/");
		currentSelectedItems = {};
		currentItem = null;
		for(i = 0; i < items.length; i++) {
			var iconName;
			var dataIcon;
			var nextPage;
			if (items[i].IsDirectory) {
				iconName = "fa-folder";
				dataIcon = "carat-r";
				nextPage = "";
			} else {
				iconName = getFileIcon(items.Ext);
				dataIcon = "gear";
				nextPage = "itemPage";
			}
			var liEntry = $('<li data-icon="' + dataIcon + '">').html('<a href="#"><i class="fa fa-square-o"></i>&nbsp;&nbsp;<i class="fa ' + iconName + '"></i>&nbsp;&nbsp;' + items[i].Name + '</a><a href="#' + nextPage + '">link</a>');
			$(liEntry).on("click", function(e){
				var fontClass = $(this).find("i:first");
				if($(fontClass).hasClass("fa-square-o")) {
					$(fontClass).removeClass("fa-square-o").addClass("fa-check-square-o");
					currentSelectedItems[$(this).text().trim()] = 1;
				} else {
					$(fontClass).removeClass("fa-check-square-o").addClass("fa-square-o");
					delete currentSelectedItems[$(this).text().trim()];
				}
			});

			if(items[i].IsDirectory) {
				(function (selector, item) {
					var itemPath = item.Path;
					$(selector).children("a:nth-child(2)").on("click", function(e) {
						$.get('/files?path=' + itemPath).then(function(data) {
							pillaUpdateMainList(itemPath, data);
							currentMainPath = itemPath;
						});
					});
				})(liEntry, items[i]);
			} else {
				(function (selector, item) {
					var thisItem = item;
					$(selector).children("a:nth-child(2)").on("click", function(e) {
						pillaUpdateItemInfo(thisItem);
					});
				})(liEntry, items[i]);
			}

			$("#pilla_main_list").append(liEntry);
		}
		$("#pilla_main_list").listview('refresh');
	}

	//
	// Item Page: to update list by given item
	//
	function pillaUpdateItemInfo(item) {
		currentItem = item;
		$("#itemPageHeaderMsg").text(item.Name);
		$("#itemPageContentMsg").html("<h3> File path :" + item.Path + "</h3><h3> File size :" + humanFileSize(item.fileSize) + "</h3><h3> Last modified time :" + item.MTime + "</h3>");
	}

	//
	// Tree page: to update list by given items
	//
	function pillaUpdateTreeList(path, items) {
		$("#pilla_tree_list").empty();
		$("#treePagePathMsg").text("To: " + path + "/");
		for(i = 0; i < items.length; i++) {
			var liEntry;
			if(items[i].FolderCount > 0) {
				liEntry = $('<li data-icon="carat-r">').html('<a href="#"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + items[i].Name + '<span class="ui-li-count">' + items[i].FolderCount + '</span></a>');
			} else {
				liEntry = $('<li data-icon="false">').html('<a href="#"><i class="fa fa-folder"></i>&nbsp;&nbsp;' + items[i].Name + '</a>');

			}

			if(items[i].FolderCount > 0) { 
				(function (selector, item) {
					var itemPath = item.Path;
					$(selector).children("a").on("click", function(e) {
						$.get('/folders?path=' + itemPath).then(function(data) {
							pillaUpdateTreeList(itemPath ,data);
							currentTreePath = itemPath;
						});
					});
				})(liEntry, items[i]);
			} else {
				(function (selector, item) {
					var itemPath = item.Path;
					$(selector).children("a").on("click", function(e) {
						$("#treePagePathMsg").text("To: " + itemPath + "/");
					});
				})(liEntry, items[i]);
			}
			$("#pilla_tree_list").append(liEntry);
		}
		$("#pilla_tree_list").listview('refresh');
	}

	$(document).ready(function(){
		// First run, load the list
		$.get("/files",function(data,status){
			pillaUpdateMainList("", data);
		});

		$("#mainPage .pilla_btn_home").on("click", function(e){
			$.get("/files",function(data,status){
				pillaUpdateMainList("", data);
			});
		});

		$("#mainPage .pilla_btn_up").on("click", function(e){
			if (!currentMainPath) return;
			var idx = currentMainPath.lastIndexOf("/");
			var path = currentMainPath.substr(0, idx);
			$.get('/files?path=' + path).then(function(data) {
				pillaUpdateMainList(path, data);
				currentMainPath = path;
			});
		});

		$("#treePage .pilla_btn_home").on("click", function(e){
			$.get("/folders",function(data,status){
				pillaUpdateTreeList("", data);
			});
		});

		$("#treePage .pilla_btn_up").on("click", function(e){
			if (!currentTreePath) return;
			var idx = currentTreePath.lastIndexOf("/");
			var path = currentTreePath.substr(0, idx);
			$.get('/folders?path=' + path).then(function(data) {
				pillaUpdateTreeList(path, data);
				currentTreePath = path;
			});
		});

		$("#treePage .pilla_btn_here").on("click", function(e){
			actReq.toPath = $("#treePagePathMsg").text().slice(4);
			if (actReq.action === "copy") {
				$("#ynPageConfirmationMsg").text("Are you sure to copy ?");
			} else if (actReq.action === "move") {
				$("#ynPageConfirmationMsg").text("Are you sure to move ?");
			} else {
				alert("Unknown action:" + actReq.action);
				return;
			}
		});

		$(".pilla_btn_copy").on("click", function(e){
			if (currentItem && Object.keys(currentSelectedItems).length == 0) 
				return;
			actReq.action = "copy";
			//alert(Object.keys(currentSelectedItems));
			$.get("/folders",function(data,status){
				pillaUpdateTreeList("", data);
			});
		});

		$(".pilla_btn_move").on("click", function(e){
			if (currentItem && Object.keys(currentSelectedItems).length == 0) 
				return;
			actReq.action = "move";
			//alert(Object.keys(currentSelectedItems));
			$.get("/folders",function(data,status){
				pillaUpdateTreeList("", data);
			});
		});

		$(".pilla_btn_delete").on("click", function(e){
			if (currentItem && Object.keys(currentSelectedItems).length == 0) 
				return;
			actReq.action = "delete";
			$("#ynPageConfirmationMsg").text("Are you sure to delete ?");
		});

		$("#pilla_btn_y").on("click", function(e){
			$("body").addClass('ui-disabled');
			$.mobile.loading( 'show', {
				text: "Loading",
				textVisible: true,
				theme: "b",
				textonly: false,
				html: ""
			});
			ajaxReqAction();
			//setTimeout(function() {}, 5000);
		});

	});

})(jQuery);

