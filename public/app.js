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

	var currentPath = null;
	var currentItem = null;
	var currentSelectedItems = {};

	$(function() {
		$( "#popup_yn_page" ).enhanceWithin().popup();
	});

	function pillaUpdateMainList(items) {
		$("#pilla_list_main").empty();
		currentSelectedItems = {};
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
					var path = item.Path;
					$(selector).children("a:nth-child(2)").on("click", function(e) {
						$.get('/files?path=' + path).then(function(data) {
							pillaUpdateMainList(data);
							currentPath = path;
						});
					});
				})(liEntry, items[i]);
			} else {
				(function (selector, item) {
					var path = item.Path;
					var thisItem = item;
					$(selector).children("a:nth-child(2)").on("click", function(e) {
						pillaUpdateItemInfo(thisItem);
					});
				})(liEntry, items[i]);
			}

			$("#pilla_list_main").append(liEntry);
		}
		$("#pilla_list_main").listview('refresh');
	}

	function pillaUpdateItemInfo(item) {
		currentItem = item;
		$("#itemPageHeader").text(item.Name);
		$("#itemPageContent").html("<h2> File path :" + item.Path + "</h2><h2> File size :" + humanFileSize(item.fileSize) + "</h2><h2> Last modified time : XXXXXX </h2>");
	}

	$(document).ready(function(){
		// First run, load the list
		$.get("/files",function(data,status){
			pillaUpdateMainList(data);
		});

		$(".pilla_btn_home").on("click", function(e){
			$.get("/files",function(data,status){
				pillaUpdateMainList(data);
			});
		});

		$(".pilla_btn_up").on("click", function(e){
			if (!currentPath) return;
			var idx = currentPath.lastIndexOf("/");
			var path = currentPath.substr(0, idx);
			$.get('/files?path=' + path).then(function(data) {
				pillaUpdateMainList(data);
				currentPath = path;
			});
		});
		
		$(".pilla_btn_copy").on("click", function(e){
			alert(Object.keys(currentSelectedItems));
		});
		
		$(".pilla_btn_move").on("click", function(e){
			alert(Object.keys(currentSelectedItems));
		});
	});

	/*	
	var options = {
	"order": [[1, 'asc']],
	"searching": false,
	"processing": true,
	"serverSide": false,
	"paging": false,
	"autoWidth": true,
	//"scrollY":"400px",
	"dom": '<"toolbar">frtip',
	"createdRow": function(row, data, dataIndex) {
	if (!data.IsDirectory) return;
	var path = data.Path;
	console.log(path);
	$(row).on("click", "a", function(e) {
	$.get('/files?path=' + path).then(function(fData) {
	table.api().clear();
	table.api().rows.add(fData).draw();
	currentPath = path;
	});
	e.preventDefault();
	});

	},

	$("#h-chk-items").on("click", function(e) {
	var allRow$ = $("#fileTable tbody input.t-chk-item");
	if ($(this).is(':checked')) {
	console.log("checked");
	allRow$.each(function() {
	$(this).prop("checked", "checked");
	});
	table.api().draw();
	} else {
	console.log("no check");
	allRow$.each(function() {
	$(this).removeProp("checked", "checked");
	});
	table.api().draw();
	}
	});

	$("#h-btn-copy").on("click", function(e) {
	var selectedRow$ = $("#fileTable tbody input.t-chk-item:checked");
	var count = 0;
	selectedRow$.each(function() {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();
	console.log("copy " + count + "th data: " + data.Name);
	count++;
	});
	});

	$("#h-btn-move").on("click", function(e) {
	var selectedRow$ = $("#fileTable tbody input.t-chk-item:checked");
	var count = 0;
	selectedRow$.each(function() {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();
	console.log("move " + count + "th data: " + data.Name);
	count++;
	});
	});

	$("#h-btn-delete").on("click", function(e) {
	var selectedRow$ = $("#fileTable tbody input.t-chk-item:checked");
	var count = 0;
	selectedRow$.each(function() {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();
	console.log("delete " + count + "th data: " + data.Name);
	count++;
	});
	});

	// Request from table to do individual file action
	$("#fileTable tbody").on("click", ".t-btn-info", function(e) {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();

	console.log("info: " + data.Name);
	});

	$("#fileTable tbody").on("click", ".t-btn-del", function(e) {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();

	console.log("del: " + data.Name);
	});

	$("#fileTable tbody").on("click", ".t-btn-move", function(e) {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();

	console.log("move: " + data.Name);
	});

	$("#fileTable tbody").on("click", ".t-btn-copy", function(e) {
	var td = $(this).closest('tr').children('td').next();
	var cell = table.api().cell(td);
	var data = cell.data();

	console.log("copy: " + data.Name);
	});
	*/
})(jQuery);

