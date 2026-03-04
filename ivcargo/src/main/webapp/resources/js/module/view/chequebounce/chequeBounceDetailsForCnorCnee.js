function setChequeBounceDetailsForBothParty(chequeBounceDetails) {
	var chequeBounceData		= chequeBounceDetails.chequeBounceDetailsModel;
	$('#chequeBounceDetails1 tbody').empty();
	var partyName 		= '';
	var partyId   		= 0;
	var flag 			= false;
	for(var i = 0; i < chequeBounceData.length; i++){
		var	chequeBounceDetails = chequeBounceData[i];
		var creditorName	= chequeBounceDetails.partyName;
		var chequeNumber	= chequeBounceDetails.chequeNumber;
		var chequeDate		= chequeBounceDetails.chequeDateString;
		var bankName		= chequeBounceDetails.bankName;
		var chequeAmount	= chequeBounceDetails.chequeAmount;
		var bookingDate		= chequeBounceDetails.creationDateString;
		var from			= chequeBounceDetails.sourceBranchName;
		var to				= chequeBounceDetails.destinationBranchName;
		var moduleId		= chequeBounceDetails.moduleIdentifier;
		var number = 0;
		var moduleName;

		if(!flag){
			if(partyId == 0){
				partyId 	= chequeBounceDetails.corporateAccountId; 
				partyName 	= chequeBounceDetails.partyName;
			} else {
				if(partyId != chequeBounceDetails.corporateAccountId){
					partyName = partyName+' and '+chequeBounceDetails.partyName;
					flag = true;
				}
			} 
		}

		if(moduleId == ModuleIdentifierConstant.GENERATE_CR){
			number 			= "CR No : "+chequeBounceDetails.crNumber;
			moduleName 		= "Generate CR"
		}else if(moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT) {
			number 			= "LR No : "+chequeBounceDetails.lrNumber;
			moduleName 		= "Booking"
		} else if(moduleId == ModuleIdentifierConstant.BILL_PAYMENT){
			number 			= "Bill No : "+chequeBounceDetails.billNumber;
		}

		var tr	= $('<tr id="chequeData">');
		var td1	= $("<td style='width:40%; background: lightblue;'>"+ creditorName +"</td>");
		var td2	= $("<td style='width:40%;'>"+ chequeNumber +"</td>");
		var td3	= $("<td style='width:40%;'>"+ chequeDate +"</td>");
		var td4	= $("<td style='width:40%;'>"+ bankName +"</td>");
		var td5	= $("<td style='width:40%;'>"+ chequeAmount +"</td>");
		var td6	= $("<td style='width:40%;'>"+ moduleName +"</td>");
		var td7	= $("<td style='width:40%;'>"+ number +"</td>");
		var td8	= $("<td style='width:40%;'>"+ bookingDate +"</td>");
		var td9	= $("<td style='width:40%;'>"+ from +"</td>");
		if(moduleId != 12){
			var td10	= $("<td style='width:40%;'>"+ to +"</td>");
		}

		$(tr).append(td1);
		$(tr).append(td2);
		$(tr).append(td3);
		$(tr).append(td4);
		$(tr).append(td5);
		$(tr).append(td6);
		$(tr).append(td7);
		$(tr).append(td8);
		$(tr).append(td9);
		if(moduleId != 12){
			$(tr).append(td10);
		}

		$('#chequeBounceDetails1 tbody').append(tr);
	}
	$("#chequeBounceMsg1").html("Cheque of the "+partyName+" has been bounced.")

	$("#chequeBounceModal1").modal({
		backdrop: 'static',
		keyboard: false
	});
}

function chequeBounceCheckingForBothParty(accountgroupid,consignorCorpAccId,consigneeCorpAccId){
	var jsonObject			= new Object();

	jsonObject["accountGroupId"]		= accountgroupid;
	jsonObject["consignorCorpAccId"]	= consignorCorpAccId;
	jsonObject["consigneeCorpAccId"]	= consigneeCorpAccId;
	
	var jsonStr = JSON.stringify(jsonObject);
		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/chequeBounceWS/getChequeBounceDetailsByBothPartyId.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				console.log('data',data)
				
				if(data.message != undefined) {
					return;
				}
				
				if(data != null || data != undefined) {
					chequeBounceDetails = data;

					setChequeBounceDetailsForBothParty(chequeBounceDetails);
					$(".close").click(function(){
						$('#deliver').hide();
						$("#deliveryPaymentType").prop("disabled", true);
					})
				}
			}
		});
	//} 
}