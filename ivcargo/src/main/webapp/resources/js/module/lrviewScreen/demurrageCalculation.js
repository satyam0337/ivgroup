function getModelData() {
	$("#damarageDetails").load("/ivcargo/jsp/viewwaybill/InfoPopUpForDemurrage.html", function() {
		setModelData();
	})
}

function setModelData(){
	
	if(typeof demarageJsonObject === 'undefined' || demarageJsonObject == null) return;
	
	var lessFeesDays	= demarageJsonObject.lessFeesDays;
	var chargeableDays	= demarageJsonObject.chargeableDays;
	var storageDays		= demarageJsonObject.storageDays;
	var	articalRateList	= demarageJsonObject.articalRateList;
	var otherRateList	= demarageJsonObject.otherRateList;
	var configTypeId	= demarageJsonObject.configTypeId;
	
	var	CONFIG_TYPE_WEIGHT_ID	= 1;
	var	CONFIG_TYPE_FIXED_ID	= 2;
	var	CONFIG_TYPE_QUANTITY_ID	= 3;
	var	CONFIG_TYPE_AMOUNT_ID	= 4;
	
	var	configTypeId		= configTypeId;
	var lessFeesDays		= lessFeesDays;
	var chargeableDays		= chargeableDays;
	var storageDays			= storageDays;
	var amount				= otherRateList != undefined ? otherRateList.amount : "" ;
	var rate				= otherRateList != undefined ? otherRateList.rate : "" ;
	var rateDetails			= otherRateList != undefined ? otherRateList.rateDetails : "" ;
	var chargeWeight		= 0;
	var articleAmount		= 0;
	var articleRateDetails	= "";
	var articleQuantity		= 0;
	
	if(articalRateList != undefined){
		for(var i = 0; i < articalRateList.length; i++) {
			articleAmount		+=	articalRateList[i].amount;
			if(i != (articalRateList.length - 1)){
				articleRateDetails	+=	articalRateList[i].rateDetails + ",</br>"; 
			}else{
				articleRateDetails	+=	articalRateList[i].rateDetails; 
			}
			articleQuantity		+=	articalRateList[i].quantity;
		}
	}
	
	$('.lessFeesDays').append(lessFeesDays);
	$('.chargeableDays').append(chargeableDays);
	$('.storageDays').append(storageDays);
	
	if(!(configTypeId == CONFIG_TYPE_QUANTITY_ID)){
		$('.amount').append(amount);
		$('.rate').append(rate);
		$('.rateDetails').append(rateDetails);
	}
	
	if(configTypeId == CONFIG_TYPE_QUANTITY_ID){
		$('#chargeWeightOrQtyRow').show();
		$('.amount').append(articleAmount);
		$('.rateDetails').append(articleRateDetails);
		$('#chargeWeightOrQuantity').html('Quantity')
		$('.chargeWeightOrQuantity').append(articleQuantity);
		$('#otherRate').html('Article Rate')
	} else if(configTypeId == CONFIG_TYPE_WEIGHT_ID){
		$('#chargeWeightOrQtyRow').show();
		$('#rateRow').show();
		chargeWeight	= otherRateList != undefined ? otherRateList.chargeWeight : "" ;
		$('#chargeWeightOrQuantity').html('Charge Weight')
		$('.chargeWeightOrQuantity').append(chargeWeight);
		$('#otherRate').html('Weight Rate')
	}else if(configTypeId == CONFIG_TYPE_FIXED_ID){
		$('#rateRow').show();
		$('#otherRate').html('Fix Rate')
	}else if(configTypeId == CONFIG_TYPE_AMOUNT_ID){
		$('#otherRate').html('On Amount Rate')
		$('#rateRow').show();
	}
}
