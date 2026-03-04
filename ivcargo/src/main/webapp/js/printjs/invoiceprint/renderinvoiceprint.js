document.onkeydown = function(e) {
    if (e.ctrlKey) {//Ctrl key disabled.
        alert('Not Allowed !');
    	return false;
    }
}
function rtclickcheck(keyp) {
	var rightClickMsg = 'Not Allowed !';
	if (navigator.appName == "Netscape" && keyp.which == 3) {
		alert(rightClickMsg);
		return false;
	}
	if (navigator.appVersion.indexOf("MSIE") != -1 && event.button == 2) {
		alert(rightClickMsg);
		return false;
	}
}
document.getElementById('fullPageDiv').onmousedown = rtclickcheck;
function checkCookie() {
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if(cookieValue == "laser") {
		HideSaidToContainDialog();
	} else if(cookieValue == "dotmatrix") {
		setDotMatrixPrint();
	} else {		
	ShowDialogForPrint()
	}
}

function setLaserPrint(){
	var cookieValue = document.cookie.replace(/(?:(?:^|.*;\s*)print\s*\=\s*([^;]*).*$)|^.*$/, "$1");
	if (cookieValue == ""){		
		document.cookie	= "print=laser; expires=Fri, 31 Dec 9999 23:59:59 GMT";
	}
	HideSaidToContainDialog();
}

function ShowDialogForPrint(){
    $("#companyNameOverlay").show();
    $("#companyNameDialog").fadeIn(300);
}

function ShowDialogForPrint_details(){
	$("#companyNameOverlay_details").show();
    $("#companyNameDialog_details").fadeIn(300);
}

function HideSaidToContainDialog(){
    $("#companyNameOverlay").hide();
    $("#companyNameDialog").fadeOut(0);
    ShowDialogForPrint_details()
}

function HideDialog(){
    $("#companyNameOverlay_details").hide();
    $("#companyNameDialog_details").fadeOut(0);
    printBillWindow();
}

function printBillWindow() {
	window.resizeTo(0,0);
	window.moveTo(0,0);
	window.setTimeout(printAfterDelay, 100);
}

function printAfterDelay() {
	window.print();
	window.close();
}