next = ""; // name of first box on page
prev= "";
callfunction = "";
netscape = "";
formname = "";
ver = navigator.appVersion; len = ver.length;
for(iln = 0; iln < len; iln++) if (ver.charAt(iln) == "(") break;
netscape = (ver.charAt(iln+1).toUpperCase() != "C");

function keyDown(DnEvents) { // handles keypress
// determines whether Netscape or Internet Explorer
k = (netscape) ? DnEvents.which : window.event.keyCode;
if (typeof isValidationError != 'undefined'){
if (k == 13 && !isValidationError) { // enter key pressed
if (next == 'done') return true; // submit, we finished all fields
else { // we're not done yet, send focus to next box
	try{
eval('document.'+ formname +'.' + next + '.focus()');
	}
	catch(e){
	}
return false;
      }
   }
}else{
	if (k == 13) { // enter key pressed
		if (next == 'done') return true; // submit, we finished all fields
		else { // we're not done yet, send focus to next box
			try{
				eval('document.'+ formname +'.' + next + '.focus()');
			}
			catch(e){
			}
			return false;
		}
	}
   }
if (k == 32) { // space key pressed
	if(callfunction!=''){
	eval(callfunction);
	return false;
	}
	return true;
}
if (k == 27) { // esc key pressed
	eval('document.'+ formname +'.' + prev + '.focus()');
	return false;
}
}

//Script to Detect User Browser

var BrowserDetect = {
	init: function () {
		this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "an unknown version";
		this.OS = this.searchString(this.dataOS) || "an unknown OS";
	},
	searchString: function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
	    },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
 
};
BrowserDetect.init();
//Check Browser and assign the function keyDown accordingly 
if(BrowserDetect != null){
	if(BrowserDetect.browser == 'Firefox'){
		document.onkeyup = keyDown; // work together to analyze keystrokes	
	}else{
		document.onkeydown = keyDown; // work together to analyze keystrokes	
	}
}else{
	document.onkeydown = keyDown; // work together to analyze keystrokes	
}