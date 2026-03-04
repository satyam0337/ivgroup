/**
 * Created By Shailesh
 * 
 */
/**
 * Update article type 
 * */
var success = null; 
function updateArticleType(excess){
	var excess = $("#excessNumber").val();

	var JObj 			= new Object();
	var JOutObj			= null;

	JObj.Excess      		= excess;
	JObj.Filter      		= 2;
	JObj.PackingTypes      	= $("#packingTypeMasterId1").val();

	JOutObj= new Object();
	JOutObj =  JObj;

	var JsonStr		    = JSON.stringify(JOutObj);
	$.getJSON("ArticleDetails.do?pageId=330&eventId=22", 
			{json:JsonStr}, function(data) {

				if(!data || jQuery.isEmptyObject(data) || data.errorDescription) {

					showMessage('info', '<i class="fa fa-info-circle"></i> '+data.errorDescription);
				} else {
					success = data.SUCESS;
				}
			})
			if(success == "SUCESS"){
				closeJqueryDialog('updateForm');
				$("#excessArticleType").val( $("#packingTypeMasterId1").val()); 

				updateExcessRegister();
			}
}

/*SetArticleType.js*/
var consignmentDetails 	= null;
var flag 				= false;
var flagFor				= false;

function getArticleDetails1(consingmentDetailsCall) {
	$('#packingTypeMasterId').find('option:gt(0)').remove();
	var conDetails	= consingmentDetailsCall;

	operationOnSelectTag('packingTypeMasterId', 'removeAll', '', '');
	
	if(conDetails.length > 0) {
		for(var i = 0; i < conDetails.length; i++) {
			var dispatchCon = conDetails[i];
			
			operationOnSelectTag('packingTypeMasterId', 'addNew', dispatchCon.packingTypeName, dispatchCon.packingTypeMasterId);
		}
	}	

}