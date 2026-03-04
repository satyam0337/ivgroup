/**
 * @Author Anant Chaudhary	12-05-2016
 */

/*
Called in input feild of Charge Weight to Append Charge Configure from Rate Master By Packing Type
*/
var partyMasterId	= 0;
function getChargeWeightToAppend() {
	var increasedValue	= 0;
	var totalQuatity	= 0;
	
	if(configuration.IncreaseChargeWeight == 'true') {
		var actualWeight	= $('#actualWeight').val();
		
		if(increaseChargeWeight == 0 && $('#typeofPackingId1').html() > 0)
			getChargeWeightByPackingTypeAndParty($('#typeofPackingId1').html());
		
		/*
		 * increaseChargeWeight coming from this method
		 * getChargeWeightByPackingTypeAndParty(packingTypeId)
		 */
		if(actualWeight > 0 && increaseChargeWeight > 0) {
			//showMessage('info', chargeWeightIncreases(Number(increaseChargeWeight)));
			
			if(configuration.increaseChargeWeightOnAddedQuantity == 'true'){
				
				for(var i = 0; i < consigAddedtableRowsId.length; i++) {
					if($('#typeofPackingId' + consigAddedtableRowsId[0]).html() == $('#typeofPackingId' + consigAddedtableRowsId[i]).html()){
						totalQuatity += parseInt($('#quantity' + consigAddedtableRowsId[i]).html());
					}
				}
				increasedValue = Math.round(Number(actualWeight) + Number(totalQuatity * increaseChargeWeight));
			} else {
				increasedValue = Number(actualWeight) + Number(increaseChargeWeight);
			}
			
			roundOffIncreasedChargedWeightValue(increasedValue);	
		}
	}
}

/*
 * Function For Increase the Charged Weight
 */
function roundOffIncreasedChargedWeightValue(increasedValue) {
	
	var rndOffChrgdWghtByTensForBrnchs = configuration.roundOffChargedWeightByTensForBranchs;
	var branches	= new Array();
	branches 		= rndOffChrgdWghtByTensForBrnchs.split(",");
	
	if(configuration.roundOffIncreasedChargedWeightValue == 'true') {
		if(configuration.roundOffChargedWeightByTens == 'true') {
			for(var i = 0 ; i < branches.length ; i++){
				if(branches[i] == branchId){
					$('#chargedWeight').val(Math.round(increasedValue / 10) * 10);
				}else {
					$('#chargedWeight').val(Math.ceil(increasedValue / 5) * 5);
				}
			}
		} 
	} else {
		$('#chargedWeight').val(increasedValue);
	}
}
/*
* Function to get All Charge Weight to increase by party 
*/
function getChargeWeightToIncrease(customerId, partyType) {
	if(configuration.IncreaseChargeWeight == 'false') {
		return;
	}
	
	var jsonObject					= new Object();
	
	jsonObject["branchId"]				= branchId;
	jsonObject["corporateAccountId"]	= customerId;
	jsonObject["chargeWeightFlavour"]	= configuration.chargeWeightFlavour;
	jsonObject["partyType"]				= partyType;
	
	if(isConsignorIncreaseChargeWeight || isConsigneeIncreaseChargeWeight)
		return;
	
	$.ajax({
		type		: 	"POST",
		url			: 	WEB_SERVICE_URL + '/rateMasterWS/getAllIncreaseChargeWeightConfigDetailsOnBooking.do',
		data		:	jsonObject,
		dataType	: 	'json',
		success		: 	function(data) {
			if(data.chargeWeightConfig) {
				chargeWeightConfig				= data.chargeWeightConfig;
				isConsignorIncreaseChargeWeight	= data.isConsignorIncreaseChargeWeight;
				isConsigneeIncreaseChargeWeight	= data.isConsigneeIncreaseChargeWeight;
			}
		}
	});
}

/*
* Function to get Charge Weight to increase in inserted by User By Packing Type and Party Wise
*/
function getChargeWeightByPackingTypeAndParty(packingTypeId) {
	increaseChargeWeight	= 0;	// Globally Defined
	
	/*
	 * chargeWeightConfig coming from this method
	 * getChargeWeightToIncrease(customerId)
	 */
	if(chargeWeightConfig != undefined) {
		for(var i = 0; i < chargeWeightConfig.length; i++) {
			var chargeWeightConfiguration	= chargeWeightConfig[i];
			
			if(Number(chargeWeightConfiguration.packingTypeId) == Number(packingTypeId))
				increaseChargeWeight	= chargeWeightConfiguration.chargeWeight;
		}
	}
}

/*
* Called in setPartyAutocomplete function in autocomplete.js
* Get Charge Weight to append in charge weight inserted by user based on party
*/
function getFlavourWiseChargeWeightToIncrease(customerId, partyType) {

	chargeWeightFlavour	= configuration.chargeWeightFlavour;
	
	switch(chargeWeightFlavour) {			//chargeWeightFlavour globally defined
	case '1':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)
			getChargeWeightToIncrease(customerId, partyType);
		break;
	case '2':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)
			getChargeWeightToIncrease(customerId, partyType);
		break;
	case '3':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)
			isConsignorIncreaseChargeWeight	= false;
		else if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID)
			isConsigneeIncreaseChargeWeight	= false;
		
		getChargeWeightToIncrease(customerId, partyType);
		break;
	default:
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID)
			getChargeWeightToIncrease(customerId, partyType);
		break;
	}
}

/*
* Called in setPartyAutocomplete function in autocomplete.js
* Get Article Wise Weight Difference by Party to apply rate if Charge Weight is greater than Weight Slab
*/
function getFlavourWiseArticleWiseWeightConfig(customerId, partyType) {
	switch(articleWiseWeightFlavour) {			//chargeWeightFlavour globally defined
	case '1':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID) {
			getArticleWiseWeightDifferenceConfig(customerId);
		}
		break;
	case '2':
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNEE_ID) {
			getArticleWiseWeightDifferenceConfig(customerId);
		}
		break;
	default:
		if(partyType == CustomerDetails.CUSTOMER_TYPE_CONSIGNOR_ID) {
			getArticleWiseWeightDifferenceConfig(customerId);
		}
		break;
	}
}

function getArticleWiseWeightDifferenceConfig(customerId) {
	if(configuration.ArticleWiseWeightDifference == 'false') {
		return;
	}
	
	var jsonObject					= new Object();
	jsonObject.srcBranchId			= branchId;  //branchId globally defined
	jsonObject.corporateAccountId	= customerId;
	jsonObject.destinationBranchId 	= Number($('#destinationBranchId').val());
	
	var jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("GetAllArticleWiseWeightDifferenceDetailsAjaxAction.do?pageId=9&eventId=20",
			{json:jsonStr, filter:10}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					if (data.errorDescription) {
						showMessage('error', iconForErrMsg + ' ' + data.errorDescription);
					}
				} else {
					articleWiseWeightDiffConfig		= null;
					articleWiseWeightDiffConfig		= data.articleWiseWeightDiffConfig;
					console.log(articleWiseWeightDiffConfig);
				}
			});
}

/*
 * This function get the Article wise weight difference configure from Rate Master by Packing type
 */
function getArticleWiseWeightDifferenceConfigByPackingType(packingTypeId) {
	
	var corporateAccountId								= 0;
	var branchListForArticleWiseWeightDifference		= null;
	var isBranchExistsForArticleWiseWeightDifference	= false;
	var isGroupWiseArticleWiseWeightDifference			= false;
	
	setTimeout(function() {
		if(articleWiseWeightDiffConfig != null) {
			if(billingPartyWayBillRates) {
				corporateAccountId	= $('#billingPartyId').val();
			} else if(consignorPartyWayBillRates) {
				corporateAccountId	= $('#partyMasterId').val();
			} else if(consigneeWayBillRates) {
				corporateAccountId	= $('#consigneePartyMasterId').val();
			}
		}
	},200);
	
	aticleWiseMinWeight		= 0;
	aticleWiseMaxWeight		= 0;
	
	/*	articleWiseWeightDiffConfig coming from this
	 * getArticleWiseWeightDifferenceConfig(customerId)
	 */
	
	if(corporateAccountId == 0) {
		if(articleWiseWeightDiffConfig == null) {
			getArticleWiseWeightDifferenceConfig(0);
		}
	}
	
	if(configuration.isAllowBranchWiseArticleWiseWeightDifference == true || configuration.isAllowBranchWiseArticleWiseWeightDifference == 'true') {
		branchListForArticleWiseWeightDifference	= configuration.branchIdsToCalculateArticleWiseWeightDifference;
		
		if(branchListForArticleWiseWeightDifference != null) {
			var articleWiseWeightDifferenceBranchArr = branchListForArticleWiseWeightDifference.split(',').map(function(item) {
				return parseInt(item.trim(), 10);
			});
			
			if(articleWiseWeightDifferenceBranchArr != null) {
				if(articleWiseWeightDifferenceBranchArr.includes(branchId)){
					isBranchExistsForArticleWiseWeightDifference = true;
				}
			}
		}
	}
	
	if((configuration.ArticleWiseWeightDifference == 'true' || configuration.ArticleWiseWeightDifference == true )
		&& (configuration.isAllowBranchWiseArticleWiseWeightDifference == 'false' || configuration.isAllowBranchWiseArticleWiseWeightDifference == false)){
		isGroupWiseArticleWiseWeightDifference = true;
	}
	
	setTimeout(function() {
		
		if(isBranchExistsForArticleWiseWeightDifference && !isGroupWiseArticleWiseWeightDifference){
			
			if(articleWiseWeightDiffConfig != null) {
				
				for(var i = 0; i < articleWiseWeightDiffConfig.length; i++) {
					var articleWiseWeightDiffConfiguration	= articleWiseWeightDiffConfig[i];

					if(Number(articleWiseWeightDiffConfiguration.accountGroupId) == Number(accountGroupId)
							&& Number(articleWiseWeightDiffConfiguration.branchId) == Number(branchId)
							&& Number(articleWiseWeightDiffConfiguration.corporateAccountId) == Number(corporateAccountId)
							&& Number(articleWiseWeightDiffConfiguration.packingTypeId) == Number(packingTypeId)
					) {
						aticleWiseMinWeight	= articleWiseWeightDiffConfiguration.minWeight;
						aticleWiseMaxWeight	= articleWiseWeightDiffConfiguration.maxWeight;
					}
				}
			}
		} else if(isGroupWiseArticleWiseWeightDifference && !isBranchExistsForArticleWiseWeightDifference){
			
			if(articleWiseWeightDiffConfig != null) {

				for(var i = 0; i < articleWiseWeightDiffConfig.length; i++) {
					var articleWiseWeightDiffConfiguration	= articleWiseWeightDiffConfig[i];

					if(Number(articleWiseWeightDiffConfiguration.accountGroupId) == Number(accountGroupId)
							&& Number(articleWiseWeightDiffConfiguration.branchId) == Number(branchId)
							&& Number(articleWiseWeightDiffConfiguration.corporateAccountId) == Number(corporateAccountId)
							&& Number(articleWiseWeightDiffConfiguration.packingTypeId) == Number(packingTypeId)
					) {
						aticleWiseMinWeight	= articleWiseWeightDiffConfiguration.minWeight;
						aticleWiseMaxWeight	= articleWiseWeightDiffConfiguration.maxWeight;
					}
				}
			}
		} else {
			return false;
		}
		
	},200);
}

/*
 * This function checked the difference between max charge weight configure from Rate Master
 *  and Charge Weight Inserted by User 
 *  if difference is greater than 0 then apply rate
 */
function checkMaxChargeWeightAndAllowRate() {
	var chargedWeight	= $('#chargedWeight').val();
	var chargeType		= $('#chargeType').val();
	
	//weightFromDb - globally defined
	
	var weightAmount	= 0;
	
	if(chargeType == TransportCommonMaster.CHARGETYPE_ID_QUANTITY && weightFromDb > 0) {
		/*aticleWiseMaxWeight Coming from this method 
		 * getArticleWiseWeightDifferenceConfigByPackingType(packingTypeId);
		*/
		if(aticleWiseMaxWeight > 0 && chargedWeight > aticleWiseMaxWeight) {
			weightAmount	= (Number(chargedWeight) - Number(aticleWiseMaxWeight)) * weightFromDb;
		}
	}
	
	return weightAmount;
}

/*
 * This function get the extra amount added after apply rate in difference of Max charge weight and Charge Weight Insertd by user
 */
function totalWithExtraAddedAmount() {
	var totalAmt			= 0;
	
	if(configuration.ArticleWiseWeightDifference == 'true') {
		var weightAmount	= checkMaxChargeWeightAndAllowRate();
		
		if(weightAmount > 0) {
			var freight			= Number($('#charge' + ChargeTypeMaster.FREIGHT).val());
			totalAmt 			= Number(weightAmount) + Number(freight);
		
			$('#charge' + ChargeTypeMaster.FREIGHT).val(totalAmt);
			$('#totalAmt').val(totalAmt);
			$('#grandTotal').val(totalAmt);
		} 
	}
}