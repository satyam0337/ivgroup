/**
 * 
 */

var jsonData			= null;
var grupSubRegionArr	= null;

function getGrupSubRegionArrList() {
	var jsonObject		= new Object();
	
	jsonObject.filter	= 6;
	
	var jsonStr = JSON.stringify(jsonObject);
	//alert(jsonStr);
	$.getJSON("AjaxActionToGetDataById.do?pageId=314&eventId=1",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', data.errorDescription); // show message to show system processing error massage on top of the window.
					
				} else { 
					jsonData		= data;
					
					grupSubRegionArr	= jsonData.grupSubRegionArr;
					
					setGrupSubRegionArrList();
				}
			}
			);
}

function setGrupSubRegionArrList() {
	if(grupSubRegionArr != null) {
		operationOnSelectTag('selectSubRegion', 'addNew', 'ALL', 0);

		for(var i = 0; i < grupSubRegionArr.length; i++) {
			operationOnSelectTag('selectSubRegion', 'addNew', grupSubRegionArr[i].name, grupSubRegionArr[i].subRegionId);
		}
	}
}