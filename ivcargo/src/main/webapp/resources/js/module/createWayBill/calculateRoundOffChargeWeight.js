/**
 * @Author Nikhil Saujani	12-05-2016
 */

function checkRoundOffChargeWeightDB() {
	if(configuration.allowCustomRoundOffChargeWeight == 'false')
		return;

	let jsonObject 			= new Object();
	jsonObject["branchId"] 	= getSourceBranchForRate();

	$.ajax({
		type: "POST",
		url: WEB_SERVICE_URL + '/rateMasterWS/getAllChargeWeightConfigToRoundOff.do',
		data: jsonObject,
		dataType: 'json',
		success: function(data) {
			if(data.chargeWeightConfigArr != null)
				calculateRoundOffChargeWeight(data.chargeWeightConfigArr);
		}
	});
}

function calculateRoundOffChargeWeight(partyWiseChargeWeightArr) {
    if (partyWiseChargeWeightArr.length === 0)
		return;
		
	var srcBranchId 	= getSourceBranchForRate();
	var billingPartyId 	= Number($('#billingPartyId').val());
	var consignorId 	= Number($('#partyMasterId').val());
	var consigneeId 	= Number($('#consigneePartyMasterId').val());
	var actualWeight	= $('#actualWeight').val();

    let newArray = [];
	
	if($('#wayBillType').val() == WAYBILL_TYPE_CREDIT) {
		newArray = partyWiseChargeWeightArr.filter(function (el) {
			return el.branchId == srcBranchId && el.corporateAccountId == billingPartyId;
		});
	} else if($('#wayBillType').val() == WAYBILL_TYPE_PAID) {
		newArray = partyWiseChargeWeightArr.filter(function (el) {
			return el.branchId == srcBranchId && el.corporateAccountId == consignorId;
		});
		
		if(newArray.length == 0) {
			newArray = partyWiseChargeWeightArr.filter(function (el) {
				return el.branchId == srcBranchId && el.corporateAccountId == consigneeId;
			});
		}
	} else if($('#wayBillType').val() == WAYBILL_TYPE_TO_PAY) {
		newArray = partyWiseChargeWeightArr.filter(function (el) {
			return el.branchId == srcBranchId && el.corporateAccountId == consigneeId;
		});
		
		if(newArray.length == 0) {
			newArray = partyWiseChargeWeightArr.filter(function (el) {
				return el.branchId == srcBranchId && el.corporateAccountId == consignorId;
			});
		}
	}
	
	if(newArray.length == 0) {
		newArray = partyWiseChargeWeightArr.filter(function (el) {
			return el.branchId == srcBranchId && el.corporateAccountId == 0;
		});
	}

 	if(newArray.length > 0) {
		let roundOffChargeWeightDB = newArray[0].chargeWeightRoundOffAmt;
		$('#chargedWeight').val(Math.ceil(actualWeight / roundOffChargeWeightDB) * roundOffChargeWeightDB);
	}
}