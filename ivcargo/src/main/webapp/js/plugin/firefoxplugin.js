function plugin0() {
	return document.getElementById('plugin0');
}

plugin = plugin0;

function pluginLoaded() {
	load();
}

function save() {

	var fileName = document.getElementById('filename').innerHTML;
	var fileText = document.getElementById('registerfilecontent').innerHTML;
	var result = plugin().save(fileName, fileText);

	if(result == "Error Occured in File Writing") {
		alert('Check the Plugin Installed Properly or Reload The Page and Allow Plugin to run');
		document.getElementById('filecontent').value = 'Not_Registerd';
	} else {
		console.log('Machine Registered');
	}
}

function load() {
	var fileName = document.getElementById('filename').innerHTML;
	var result = plugin().load(fileName);

	if(result == "Error Occured in File Loading") {
		document.getElementById('filecontent').value = 'Not_Registerd';
		$("#loadchk").html('This Machine is UnRegistered');

		if ($("#saveFileChrome")) {
			if (typeof checkContent !== 'undefined') {
				checkContent();
			}
		}

	} else {

		var part = result.split('_');
		var pcname = part[1];

		$("#loadchk").html('This Machine is Registered under '+pcname);
		document.getElementById('filecontent').value = result;

		if ($("#saveFileChrome")) {
			if (typeof checkContent !== 'undefined') {
				checkContent();
			}
		}

		if (document.getElementById('pcname')) {
			document.getElementById('pcname').removeAttribute("hidden");
			document.getElementById('pcname').innerHTML = pcname;
		}
		console.log('Machine Loaded');
	}
}

function deletef() {

	var fileName = document.getElementById('filename').innerHTML;
	var result = plugin().deletef(fileName);

	if(result == "File cant be deleted") {
		document.getElementById('filecontent').value = 'Del_UnRegisterd';
	} else {
		//document.getElementById('filecontent').value = 'Not_Registerd';
		console.log('Machine Unregistered');
	}
}
