function setChequeBounceDetails(chequeBounceDetails) {
	chequeBounceDetails		= chequeBounceDetails.chequeBounceDetailsModel;
	$('#chequeBounceDetails tbody').empty();
	
	var partyName		= chequeBounceDetails.partyName;
	var chequeNumber	= chequeBounceDetails.chequeNumber;
	var chequeDate		= chequeBounceDetails.chequeDateString;
	var bankName		= chequeBounceDetails.bankName;
	var chequeAmount	= chequeBounceDetails.chequeAmount;
	var bookingDate		= chequeBounceDetails.creationDateString;
	var from			= chequeBounceDetails.sourceBranchName;
	var to				= chequeBounceDetails.destinationBranchName;
	var moduleId		= chequeBounceDetails.moduleIdentifier;
	var number = 0;
	
	if(moduleId == ModuleIdentifierConstant.GENERATE_CR){
		$(".moduleWiseNo").removeClass("hide");//put this inside in each condition
		$('.moduleWiseNo').html('CR No');
		number = chequeBounceDetails.crNumber;
	}else if(moduleId == ModuleIdentifierConstant.BOOKING || moduleId == ModuleIdentifierConstant.SHORT_CREDIT_PAYMENT) {
		$(".moduleWiseNo").removeClass("hide");//put this inside in each condition
		$('.moduleWiseNo').html('LR No');
		number = chequeBounceDetails.lrNumber;
	} else if(moduleId == ModuleIdentifierConstant.BILL_PAYMENT){
		$(".moduleWiseNo").removeClass("hide");//put this inside in each condition
		$(".moduleWiseNo").html('Bill No');
		$(".fromBranch").html('Branch');
		$(".toBranch").addClass("hide");
		number = chequeBounceDetails.billNumber;
	}
	
	var tr	= $('<tr id="chequeData">');
	var td1	= $("<td style='width:40%;'>"+ partyName +"</td>");
	var td2	= $("<td style='width:40%;'>"+ chequeNumber +"</td>");
	var td3	= $("<td style='width:40%;'>"+ chequeDate +"</td>");
	var td4	= $("<td style='width:40%;'>"+ bankName +"</td>");
	var td5	= $("<td style='width:40%;'>"+ chequeAmount +"</td>");
	var td6	= $("<td style='width:40%;'>"+ number +"</td>");
	var td7	= $("<td style='width:40%;'>"+ bookingDate +"</td>");
	var td8	= $("<td style='width:40%;'>"+ from +"</td>");
	if(moduleId != 12){
		var td9	= $("<td style='width:40%;'>"+ to +"</td>");
	}
	
	$(tr).append(td1);
	$(tr).append(td2);
	$(tr).append(td3);
	$(tr).append(td4);
	$(tr).append(td5);
	$(tr).append(td6);
	$(tr).append(td7);
	$(tr).append(td8);
	if(moduleId != 12){
		$(tr).append(td9);
	}
	
	$('#chequeBounceDetails tbody').append(tr);
	
	$("#chequeBounceMsg").html("Cheque of the "+partyName+" has been bounced.")
	
	$("#chequeBounceModal").modal({
		backdrop: 'static',
		keyboard: false
	});
}

function checkObjectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) 
        	size++;
    }
    return size;
}

function chequeBounceChecking(accountgroupid,partyid,type,branchId){
	var jsonObject			= new Object();
	
	jsonObject["accountGroupId"]		= accountgroupid;
	jsonObject["corporateAccountId"]	= partyid;
	jsonObject["type"]					= type;
	jsonObject["branchId"]				= branchId;
	console.log('jsonObject',jsonObject)
	corporateId	= partyid;
	
	var jsonStr = JSON.stringify(jsonObject);
	
	if(corporateId > 0){
		$.ajax({
			type		: 	"POST",
			url			: 	WEB_SERVICE_URL + '/chequeBounceWS/getChequeBounceDetailsByParty.do',
			data		:	jsonObject,
			dataType	: 	'json',
			success		: 	function(data) {
				console.log('data',data)
				if(data != null || data != undefined) {
					chequeBounceDetails = data;
				}
			}
		});
	} 
}