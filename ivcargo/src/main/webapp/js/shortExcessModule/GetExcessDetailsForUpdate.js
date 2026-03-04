/**
 * @Author Anant Chaudhary	16-11-2015
 */

function getExcessDetailsForUpdate() {
	
	var excessNumber	= $("#excessNumber").val();
	
	if(excessNumber == '') {
		showMessage('error', excessNumberErrMsg);
		return false;
	}
	
	var jsonObjectData 	= new Object();
	
	jsonObjectData.ExcessNumber	= excessNumber;

	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/excessReceiveWS/getExcessDetailsForUpdate.do',
		data		:	jsonObjectData,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.message != undefined) {
				var errorMessage = data.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
				hideLayer();
				return;
			}
			
			toogleElement('bottom-border-boxshadow', 'block');
			
			if(data.excessReceive) {
				 var excessReceive = data.excessReceive;

				 var lrNumber				= excessReceive.wayBillNumber;
				 var lsNumber				= excessReceive.lsNumber;
				 var turNumber				= excessReceive.turNumber;
				 
				 $('#excessReceiveId').val(excessReceive.excessReceiveId);
				 $('#excessWayBillId').val(excessReceive.wayBillId);
				 $('#privateMark').val(excessReceive.privateMark);
				 $('#excessArticleType').val(excessReceive.packingType);
				 $('#packingTypeMasterId').val(excessReceive.packingTypeMasterId);
				 $('#excessArticle').val(excessReceive.excessArticle);
				 $('#excessWeight').val(excessReceive.weight);
				 $('#excessArticleId5').val(excessReceive.packingTypeMasterId);
				 $('#excessDispatchLedgerId').val(excessReceive.dispatchLedgerId);
				 $('#saidToContain').val(excessReceive.saidToContain);
				 
				 $('#excessLRNumber').val(lrNumber);
				 
				 if(lrNumber != null && lrNumber != '') {
					 document.getElementById("excessLRNumber").readOnly		= true;
				 } else {
					 document.getElementById("excessLRNumber").readOnly	= false;
				 }
				 
				 $('#excessLSNumber').val(lsNumber);
				 
				 if(lsNumber != null && lsNumber != '') {
					 document.getElementById("excessLSNumber").readOnly		= true;
				 } else {
					 document.getElementById("excessLSNumber").readOnly		= false;
				 }
				 
				 $('#turNumber').val(turNumber);
				 
				 if(turNumber != null && turNumber != '') {
					 document.getElementById("turNumber").readOnly	= true;
				 } else {
					 document.getElementById("turNumber").readOnly	= false;
				 }
				 
				 document.getElementById("packingTypeMasterId").style.display	= 'block';
				 document.getElementById("excessArticleType").style.display		= 'none';
				 document.getElementById("excessArticleId").style.display		= 'none';
				 document.getElementById("saveExcessButton").style.display		= 'none';
				 document.getElementById("addExcessButton").style.display		= 'none';
				 document.getElementById("excessArticleId5").style.display		= 'none';
				 document.getElementById("updateExcessButton").style.display	= 'block';
				 document.getElementById("deleteExcessButton").style.display	= 'block';
				 document.getElementById("excessArticleType").readOnly			= true;
			}
			
			setPackingTypeForExcess(); //defined in ShortExcess.js
			
			if( $("#excessLRNumber").val() != null && $("#excessLRNumber").val() != ""){
				checkWayBillNoForExcessReceive();
			}
			showHideDeleteExcessBtn(data);
			hideLayer();
		}
	});
}

function showHideDeleteExcessBtn (data){
		if(data.showDeleteExcessEntryBtn == true || data.showDeleteExcessEntryBtn == 'true' ){
			$('#deleteExcessButton').css('display' , 'inline');
		}else{
			$('#deleteExcessButton').css('display' , 'none');
		}
}