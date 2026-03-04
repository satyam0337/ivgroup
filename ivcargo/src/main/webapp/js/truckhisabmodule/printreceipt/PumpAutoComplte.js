/**
 *Created By : shailesh Khanadare 
 **/

/**
 * New Drop down plus autocomplete 
 **/
var pumpName 			= new Array();	 
var pumpObjectGobal 	= null;

/*get Pump name data*/
function getPetrolPump(){
	var jsonObject		= new  Object();
	var jsonOutObject	= new  Object();
	pumpObjectGobal 	= new Object();
	jsonObject.Filter	= 3;
	jsonOutObject		= jsonObject;
	var jsonStr			= JSON.stringify(jsonOutObject);
	
	$.getJSON("printReceiptAjaxAction.do?pageId=346&eventId=2",
			{json:jsonStr}, function(data) {
				var pumpNameArr = data.pumpNameMasterArr;
				for(var i = 0; i < pumpNameArr.length; i++ ){
					var pModel = pumpNameArr[i];
					pumpObjectGobal[pModel.pumpNameMasterId] = pModel.fuelAmount;   
				}
				setPump(data);
			})
}


/**
 * Petrol Pump auto complete 
 * */
var pumparr  = new Array();
function setPump(data) {
	ele = 'petrolPumpName';
	
	var pumpNameMasterArr = data.pumpNameMasterArr;

	for(var i = 0 ; i < pumpNameMasterArr.length ; i++){
		var pumpData	= new Object();
		var pumpModel = pumpNameMasterArr[i];
		pumpData.id = pumpModel.pumpNameMasterId; 
		pumpData.name = pumpModel.name;
		pumparr.push(pumpData);
	}
	
	$("#"+ele).ajaxComboBox(
			pumparr,
			  {
				  lang: 'en',
				  sub_info: false,
				  sub_as: {
			      name: 'name',
			      post: 'Post',
			      position: 'Position'
			    },
			    primary_key: 'id'
			  }
			);
	
}

function getPumpMasterId() {
	$("#petrolPumpNameId").val(getPumpTypeId('petrolPumpName')); 
	getPumpFuelRate(getPumpTypeId('petrolPumpName'));
}

function getPumpTypeId(id) {
	if($('#' + id + '_primary_key').val() != ""){
		var  primaryId =   $('#' + id + '_primary_key').val();
		return primaryId; 
	}else{
		return null;
	}
}