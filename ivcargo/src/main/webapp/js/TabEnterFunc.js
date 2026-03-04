
next = ""; // name of first box on page
callfunction = "";
netscape = "";
formname = "";

ver = navigator.appVersion; len = ver.length;
for(iln = 0; iln < len; iln++) if (ver.charAt(iln) == "(") break;
netscape = (ver.charAt(iln+1).toUpperCase() != "C");

function keyDown(DnEvents) { // handles keypress
// determines whether Netscape or Internet Explorer

k = (netscape) ? DnEvents.which : window.event.keyCode;

if (k == 13) { // enter key pressed
if (next == 'done') return true; // submit, we finished all fields
else { // we're not done yet, send focus to next box
eval('document.'+ next + '.focus()');
return false;
      }
   }
if (k == 32) { // space key pressed
	if(callfunction!=''){
	eval(callfunction);
	return false;
	}
	return false;
}
if (k == 27) { // esc key pressed
	eval('document.'+ prev + '.focus()');
	return false;
}
}
document.onkeydown = keyDown; // work together to analyze keystrokes
if (netscape) document.captureEvents(Event.KEYDOWN|Event.KEYUP);
//  End -->
