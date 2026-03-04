$(document).ready(function() {
	
	$("#close").click(function() {
		$(this).parent().parent().hide();
		});
	$("#lsPrintCookieSettingOverlay").click(function() {
		$(this).parent().parent().hide();
		});
	
	
		});
	
$(document).ready(function() {
		
	 $("#b1").click(function(){
	    
		 	/* here we are collecting the check box data from user  */
		 	var tbb = $('#tbb:checked').val();	
		 	var paid = $('#paid:checked').val();
		 
			var jsonObject				= new Object();
			var jsonObjectdata;
		 	jsonObjectdata = new Object();
		 	/* if user is not selecting any check box then we are setting  value as false*/
			if(tbb!=undefined){
		 		jsonObjectdata.tbb = 'true';
			}else{
				jsonObjectdata.tbb = 'false';
			}
			if(paid!=undefined){
		 		jsonObjectdata.paid ='true';
			}else{
				
				jsonObjectdata.paid ='false';
			}
		 	jsonObject=jsonObjectdata;
			var jsonStr = JSON.stringify(jsonObject);
			
    		/* Here we are sending ajax request to save the cookies */
    		
	 	 	$.getJSON("JalaramPrint.do.do?pageId=311&eventId=1&filter=1",
					{json:jsonStr}, function(data) {
					/* Here after ading cookie data we are hiding the overlay  */	
					 HideLsPrintCookieSettingDialog();
					
 					
				});
		 });
	 
});
	 
var lsPrintCookieSettingOverlay		= new $.Deferred();	//	said to contain overlay
	function populateSortedData(tblCount,totalLRs,lrPerTable){
		var mainTable = document.getElementById('mainTable');
		var copiedRows = 1;
		for(var p=1; p <= tblCount; p++ ){
			var tbl = document.getElementById('table_'+p);
			var totalTblRows = tbl.rows.length;
			for(var i=0; i < totalTblRows; i++){
				if(tbl.rows[i].id == "headerRow_"+p){
					//Do nothing	
				}else{
					tbl.rows[i].innerHTML = mainTable.rows[copiedRows].innerHTML;
					copiedRows++;
				}
				
			}
		}
	};	
	 function ShowLsPrintCookieSetting(modal){
		$('#lsPrintCookieSettingOverlay').switchClass("show", "hide");
		//$("#saidToContainOverlay").show();
		$("#lsPrintCookieSettingDialog").fadeIn(300);
		$('#newSaidToConatainName').focus();
		if (modal){
			$("#lsPrintCookieSettingOverlay").unbind("click");
		} else {
			$("#lsPrintCookieSettingOverlay").click(function (e) {
				HideLsPrintCookieSettingDialog();
			});
		}
	}

	function HideLsPrintCookieSettingDialog() {
		$('#lsPrintCookieSettingOverlay').switchClass("hide", "show");
		//$("#saidToContainOverlay").hide();
		$("#lsPrintCookieSettingDialog").fadeOut(300);
	}
	function getKeyCode(event) {
		return event.which || event.keyCode;
	}

	
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function printDirect(){
	$('#lsPrintCookieSettingOverlay').hide();
	$('#lsPrintCookieSettingDialog').hide();
	window.print();
	
}
function printPage(){
	$.getJSON("JalaramPrint.do?pageId=311&eventId=1&filter=2",
			 function(data) {
			if(data.isAllowCookies&&data.isAllowExecutive){
				var tbb=readCookie('tbb'+data.executive);
				if(tbb==null){
					ShowLsPrintCookieSetting(true);
					return;
				}else{
					 window.print();
					 return;
				}

			}else{
				
				 window.print();
			}
			/*Here after ading cookie data we are hiding the overlay  */	
			 HideLsPrintCookieSettingDialog();
	
				
		});
	
}