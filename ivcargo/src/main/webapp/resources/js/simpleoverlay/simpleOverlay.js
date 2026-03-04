function showOverlay(){
var over = '<div id="overlay" style=" position: absolute; left: 0; top: 0;  bottom: 0; right: 0; background: #000; opacity: 0.8; filter: alpha(opacity=80);">' +
	            '<img id="loading" src="/ivuiresources/resources/images/loading4.gif" style="  width: 50px;  height: 57px; position: absolute; top: 50%;left: 50%;margin: -28px 0 0 -25px;">' +'</div>';
	        $(over).appendTo('body');
}			
function hideOverlay(){
$('#overlay').remove();
}			