next = ""; // name of first box on page
prev= "";
callfunction = "";
netscape = "";
formname = "";
ver = navigator.appVersion; len = ver.length;
for(iln = 0; iln < len; iln++) if (ver.charAt(iln) == "(") break;
netscape = (ver.charAt(iln+1).toUpperCase() != "C");
var globalNextPrevObj = new Object();

function setNextPreviousNavigationForElements(data){
	if(data != undefined && data.length>0){
		for(var i=0;i<data.length;i++){
				globalNextPrevObj = setValuesInNextPrev(globalNextPrevObj,data[i].elementId,data[i].nextElementId,data[i].previousElementId);
		}
	}
}

//initialising for all elemnttypes that needs a specific funtion to be applied
function initialiseFocus(parentElem){
	applyFunction('input',parentElem);
	applyFunction('select',parentElem);
	applyFunction('button',parentElem);
}
//apply blue border css on focus of slected element 
function applyFunction(type,parentElem){
	$(type).each(function(){
		if(!$(this).hasClass("uneditable-input")){
			$(this).focus(function(event) {setPrevNext(this,parentElem); $(this).addClass( "uneditable-input" ); showTooltip(this)} );
			$(this).blur(function(event) {hideTooltip();} );
		}
	})
}
//onfocus checking and setting next value if not specified or specified in globalNextPrevObj
function setPrevNext(obj,parentElem) {
	var id = obj.id;
	var eleIdArray	= new Array();
	var prevEle=null;
	var nextEle=null;
	var currEle=null;

	if(parentElem == undefined){
		$('body').find('input, select, button').each(function(index) {
			if($(this).attr("id")){
				eleIdArray.push($(this).prop("id"));
			}
		});
	}else{
		$(parentElem).last().find('input, select, button').each(function(index) {
			if($(this).attr("id")){
				eleIdArray.push($(this).prop("id"));
			}
		});
	}
	for(var i=0; i < eleIdArray.length; i++) {
		var curEleId	= eleIdArray[i];

		if (curEleId == id && checkDisplayConditions(curEleId)) {
			currEle = curEleId;
		}

		for(var j=1;j<eleIdArray.length;j++){
			var prevEleId	= eleIdArray[i-j];
			if (prevEle == null && currEle != null && checkDisplayConditions(prevEleId)) {
				prevEle = prevEleId;
				break;
			}
		}

		for(var k=1;k<eleIdArray.length;k++){
			var nextEleId	= eleIdArray[i+k];
			if (nextEle == null && currEle != null && checkDisplayConditions(nextEleId)) {
				nextEle = nextEleId;
				break;
			}
		}
	}
	if(prevEle == null){
		prevEle = currEle;
	}

	if(nextEle == null){
		nextEle = 'done';
	}

	if (typeof globalNextPrevObj != "undefined") {
		if(checkCondition(id) && checkCondition(globalNextPrevObj) ){
			var objPrevNext = globalNextPrevObj[id];
			if(checkCondition(objPrevNext)){
				if(!checkDisplayConditions(objPrevNext.next)){
					console.log('Check Next Element');
				}
				if(!checkDisplayConditions(objPrevNext.prev)){
					console.log('Check Previous Element');
				}
				setNextAndPrevValue(objPrevNext.next,objPrevNext.prev)
			}else{
				setNextAndPrevValue(nextEle,prevEle)
			}
		}else{
			setNextAndPrevValue(nextEle,prevEle)
		}
	}else{
		setNextAndPrevValue(nextEle,prevEle)
	}
}
//set the value to done if it is blank and if found set the next value and previous value
function setNextAndPrevValue(NextVal,PrevVal){
	if(NextVal==''||NextVal == undefined){
		next='done';
	}else{
		next=NextVal;
	}
	prev=PrevVal;
}

function checkDisplayConditions(eleId){
	if($('#'+eleId).isDisabled() || $('#'+eleId).isReadOnly() || $('#'+eleId).isHidden()){
		return false;
	}
	return true;
}

//get next and previous value from globalNextPrevObj
function setValuesInNextPrev(globalNextPrevObj,eleId,nextVal,prevVal){
	var nextAndPrev;
	if(globalNextPrevObj[eleId] == undefined){
		nextAndPrev = new Object();
	}else{
		nextAndPrev = globalNextPrevObj[eleId];
	}
	if(checkCondition(nextVal)){
		nextAndPrev.next = nextVal;
	}
	if(checkCondition(prevVal)){
		nextAndPrev.prev = prevVal;
	}
	
	globalNextPrevObj[eleId] = nextAndPrev;
	return globalNextPrevObj;
}

//check for all error handling
function checkCondition(object){
	if( typeof(object) === "undefined" || object == null || object == 'undefined'){
		return false;
	}
	return true;
}

function keyDown(DnEvents) { // handles keypress
	if(DnEvents.srcElement == undefined || typeof DnEvents.srcElement == 'undefined' || DnEvents.srcElement == null)
		return true;
	
if(DnEvents.srcElement.id === "chat-input"){return true}
//	determines whether Netscape or Internet Explorer
	k = (netscape) ? DnEvents.which : window.event.keyCode;
	
	if (typeof isValidationError != 'undefined') {
		if (k == 13 && !isValidationError) { // enter key pressed
			if (next == 'done') return true; // submit, we finished all fields
			else { // we're not done yet, send focus to next box
				try {
					if(document.getElementById( next )) {
						eval(document.getElementById( next ).focus());
					}
				}
				catch(e){
				}
				return false;
			}
		}
	} else{
		if (k == 13) { // enter key pressed
			if (next == 'done') return true; // submit, we finished all fields
			else { // we're not done yet, send focus to next box
				try{
					if(document.getElementById( next )){
						eval(document.getElementById( next ).focus());
					}
				}
				catch(e){
				}
				return false;
			}
		}
	}
	if (k == 32) { // space key pressed
		if(callfunction!='') {
			eval(callfunction);
			return false;
		}
		return true;
	}
	if (k == 27) { // esc key pressed
		if(document.getElementById( prev )) {
			eval(document.getElementById( prev ).focus());
		}
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
function showTooltip(elObj) {
	div = document.getElementById('info');
	if(div){
		$("#info").show();
		var elPos = findPos(elObj);
		div.style.left = elPos[0]+'px';
		div.style.top = elPos[1] -36 +'px';
		var valueOfToolTip = elObj.getAttribute("data-tooltip") ;
		if(valueOfToolTip == null){
			div.innerHTML = elObj.id ;
		}else{
			div.innerHTML = elObj.getAttribute("data-tooltip") ;
		}
	}
}

function hideTooltip() {
	$("#info").hide();
}

function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	}
	return [curleft,curtop];
}