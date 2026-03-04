/**
 * 
 */
 
 
 function checkDate(){
	setTimeout(function(){

	var fromDate,toDate;
        if($('.fromDate').val() != undefined && $('.toDate').val() != undefined){
		 fromDate 	= new Date($('.fromDate').val().replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
		 toDate		= new Date($('.toDate').val().replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
		}else if($("#dateEle").attr('data-startdate') != undefined && $("#dateEle").attr('data-enddate') != undefined){
			 fromDate = new Date($("#dateEle").attr('data-startdate').replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
            toDate=    new Date($("#dateEle").attr('data-enddate').replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
        }
	var diff 		= diffBetweenTwoDate(fromDate, toDate);
	
	if(diff > Number($('#maxDaysToFindReport').val())){
		$('#sendRequest').show();
		$('#findBtn').hide();
		$('#saveBtn').hide();
		$('#downloadExcel').hide();
	}else{
		$('#sendRequest').hide();
		$('#findBtn').show();
		$('#downloadExcel').show();
		$('#saveBtn').show();
	}
	
	},200);
}

function validateSelectedDate(){
	var fromDate 	= new Date($('.fromDate').val().replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
	var toDate		= new Date($('.toDate').val().replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"))
	var diff 		= diffBetweenTwoDate(fromDate, toDate);
	if(diff > Number($('#maxDaysToFindReport').val())){
		return false;
	}
	return true;
}
 
function saveReportRequest(filter) {
	
	if(!ValidateFormElement(2)){
			return false
		}
	
	var jsonObject	= new Object();
	
	setJsonData(jsonObject);
	

	
	showLayer();
	$.ajax({
        type	: "POST",
        url		: WEB_SERVICE_URL+'/reportRequestWS/saveReportRequestDetails.do?',
        dataType: 'json',
		data	:jsonObject,
        success: function (data) {
        	if(data.message != undefined && data.message.messageId == 21) {
        		var errorMessage = data.message;
        		showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
        		hideLayer();
        		return false;
        	}else if(data.duplicateRequest != undefined && data.duplicateRequest){
				showMessage("error", "Duplicate Request, You Will Get Report In Your Mail Within 24 Hour !");
			}else if(data.noEmail != undefined && data.noEmail){
				showMessage("error", "Cannot save request as no email address for Executive !");
			}else if(data.success != undefined && data.success){
        		showMessage("success", "Request Data Saved Successfully, You Will Get Report In Your Mail Within 24 Hour !");
			}
        	hideLayer();
        },
        error: function (e) {
        	console.log('dataLog ---rerre ')
            hideLayer();
        }
    });
}