
function moduleDidLoad() {
	chromeplugin.hideModule();
	loadFile();
}

//Called by the chromeplugin.js module.
function domContentLoaded(name, tc, config, width, height) {

	if (typeof navigator.webkitPersistentStorage == 'undefined') {

	} else {
		navigator.webkitPersistentStorage.requestQuota(1024 * 1024,
				function(bytes) {
			chromeplugin.updateStatus('Allocated ' + bytes + ' bytes of persistant storage.');
			chromeplugin.attachDefaultListeners();
			chromeplugin.createNaClModule(name, tc, config, width, height);
		},
		function(e) { alert('Please Reload the Page and Accept Storage Option from Chrome'); });
	}

}

function makeMessage(command, path) {
	// Package a message using a simple protocol containing:
	// command <path length> <path> <space-separated extra args>
	var msg = command;
	msg += ' ';
	msg += path.length;
	msg += ' ';
	msg += path;
	// Maybe add extra args
	for (var i = 2; i < arguments.length; ++i) {
		msg += ' ' + arguments[i];
	}
	return msg;
}

function saveFile() {
	if (chromeplugin.naclModule) {
		var fileName = document.getElementById('filename').innerHTML;
		var fileText = document.getElementById('registerfilecontent').innerHTML;
		chromeplugin.naclModule.postMessage(makeMessage('sv', fileName, fileText));
	}
}

function loadFile() {
	if (chromeplugin.naclModule) {
		var fileName = document.getElementById('filename').innerHTML; //document.querySelector('#filename').value;
		// clear the editor first (in case there is an error and there is no output).
		chromeplugin.naclModule.postMessage(makeMessage('ld', fileName));
	}
}

function deleteFileOrDirectory() {
	if (chromeplugin.naclModule) {
		var fileName = document.getElementById('filename').innerHTML; //document.querySelector('#delete input').value;
		chromeplugin.naclModule.postMessage(makeMessage('de', fileName));
	}
}

//Called by the chromeplugin.js module.
function handleMessage(message_event) {
	var msg = message_event.data;
	var parts = msg.split('|');
	var command = parts[0];
	var args = parts.slice(1);

	if (command == 'ERR') {
		//chromeplugin.logMessage('Error: ' + args[0]);
		if (args[0] == 'File not found -- Error #: -20') {
			document.getElementById('filecontent').value = 'Not_Registerd';
			$("#loadchk").html('This Machine is UnRegistered');
			if ($("#saveFileChrome")) {
				if (typeof checkContent !== 'undefined') {
					checkContent();
				}
			}
		}
	} else if (command == 'STAT') {
		//chromeplugin.logMessage(args[0]);
		if (args[0] == 'File/Directory not found') { // while deleting
			document.getElementById('filecontent').value = 'Del_UnRegisterd';
		} else if (args[0] == 'Load success') {
			//document.getElementById('filecontent').textContent = '';
			console.log('Machine Loaded');
		} else if (args[0] == 'Save success') {
			console.log('Machine Registered');
		} else if (args[0] == 'Delete success') {
			//document.getElementById('filecontent').value = 'Not_Registerd';
			console.log('Machine Unregistered');
		}
	} else if (command == 'READY') {
		chromeplugin.logMessage('Filesystem ready!');
	} else if (command == 'DISP') {
		//chromeplugin.logMessage(args.join('|'));
		var ms = args.join('|');
		var part = ms.split('_');
		var pcname = part[1];

		document.getElementById('filecontent').value = ms;
		$("#loadchk").html('This Machine is Registered under '+pcname);

		if ($("#saveFileChrome")) {
			if (typeof checkContent !== 'undefined') {
				checkContent();
			}
		}

		if (document.getElementById('pcname')) {
			document.getElementById('pcname').removeAttribute("hidden");
			document.getElementById('pcname').innerHTML = pcname;
		}
	}
}
