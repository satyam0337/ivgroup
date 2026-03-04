function noNumbers(evt){
	if (evt.ctrlKey ==1){
		return true;
	}else{
		var keynum = null;
		if(window.event){ // IE
			keynum = evt.keyCode;
		} else if(evt.which){ // Netscape/Firefox/Opera
			keynum = evt.which;
		}
		if(keynum!=null){
			if(keynum == 8){
				return true;
			}else if (keynum < 48 || keynum > 57 ) {
				return false;
			}
		}
		return true;
	}
}

function charsForDate(e){
	var keynum;
	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which){ // Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8 || keynum == 45){
		return true;
	}
	if (keynum < 48 || keynum > 57 ) {
		return false;
	}
	return true;
}

function noSpclChars(e){

	var keynum =null;

	if(window.event){ // IE
		keynum = e.keyCode;
	} else if(e.which) {// Netscape/Firefox/Opera
		keynum = e.which;
	}
	if(keynum == 8 || keynum == 95 ){
		return true;
	}
	if ((keynum > 32 && keynum < 48)|| (keynum > 57 && keynum < 65)|| (keynum > 90 && keynum < 97)|| (keynum > 122 && keynum < 127) ) {
		return false;
	}
	return true;
}