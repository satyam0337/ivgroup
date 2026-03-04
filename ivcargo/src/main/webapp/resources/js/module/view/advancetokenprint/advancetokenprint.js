var RANGEWISE_QR_PRINT  = 3;
var ZERO                = 0;
var isSrcToDesntWIseSubRegion = false;
var largeTemplateArray =[];
var printedColl = [];
var markQRIsPrinted = {};
var txnInPrint      = {};
var  lastIndex = 0;
var  branchCode = "";
var branchCodeWiseWayBillNumberGeneration = false;
define([ 'marionette'
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'jquerylingua'
         ,'language'
         ,'nodvalidation'
         ,'focusnavigation'
         ,'autocomplete'
         ,'selectizewrapper'
         ,'/ivcargo/resources/js/module/redirectAfterUpdate.js',
         ],
		function(Marionette, JsonUtility, MessageUtility, UrlParameter, jquerylingua, language, NodValidation, FocusNavigation,AutoComplete,Selectizewrapper) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(),
			wayBillId,
			myNod,
			_this = '',
			redirectFilter = 0;
	var fromRange  = 0;
	var toRange    = 0;
	var subRegionList	    = new Array();
	var selectedDestnSubRegion = 0;
	var srsDestnMap;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
		//initialize is the first function called on call new view()
		_this = this;
	},
		render: function() {
		var jsonObject	= new Object();
		getJSON(jsonObject, WEB_SERVICE_URL + '/advanceTokenBookingWS/getInitialDetailsForAdvanceTokenPrint.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
		return _this;
	},
		setGroup : function(response){
		 largeTemplateArray = [];
		 printedColl        = [];
		 markQRIsPrinted    = {};
		 txnInPrint         = {};
		 lastIndex          = 0;
		if(response!=undefined){
			isSrcToDesntWIseSubRegion = response.isSrcToDesntWIseSubRegion;
			branchCodeWiseWayBillNumberGeneration = response.branchCodeWiseWayBillNumberGeneration;
			branchCode				  = response.branchCode;	
			if(isSrcToDesntWIseSubRegion){
				subRegionList = response.sourceTodestnWiseSeqList;
				srsDestnMap   = response.uniqueSrcDestnMap;
			}else{
				var obj =  new Object();
				obj.destinationSubRegionId = 0;
				obj.destSubRegionName      = 'ALL';
				subRegionList.push(obj);
				if(response.sequenceCouterList!= undefined && response.sequenceCouterList.length > 0){
					var seqCount = response.sequenceCouterList[0];
				}
				if(typeof seqCount !== 'undefined') {
					setTimeout(function(){
						$('#seqRangeString').removeClass('hide');
						$('#seqRangeString').html("Sequence Range : "+seqCount.minRange + "-" +seqCount.maxRange);
					}, 200);	
				}
				if(typeof response.sequenceCounterPrevRange !== 'undefined') {
					setTimeout(function(){
						$('#prevRangeString').removeClass('hide');
						$('#prevRangeString').html("Recent Sequence Entry : "+response.sequenceCounterPrevRange.fromRange + "-" +response.sequenceCounterPrevRange.toRange);
					}, 200);	
				}else{
					showMessage('info', "Previous Sequence Range Not Found"); 
					$('#prevRangeString').addClass('hide');
				}
			}
		}
		var loadelement = new Array();
		var baseHtml 	= new $.Deferred();

		loadelement.push(baseHtml);

		$("#mainContent").load("/ivcargo/html/module/advancetokenprint/advancetokenprint.html",
				function() {
			baseHtml.resolve();
		});
		$.when.apply($, loadelement).done(function() {
			initialiseFocus();
			hideLayer();
			$('#destSubRegionNameTypeEle').focus();
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	 subRegionList,
				valueField		:	'destinationSubRegionId',
				labelField		:	'destSubRegionName',
				searchField		:	'destSubRegionName',
				elementId		:	'destSubRegionNameTypeEle',
				create			: 	false,
				maxItems		: 	1

			});
			$("#printqrCode").click(function() {
				_this.validateAndPrintQRCode();
			});

			$("#destSubRegionNameTypeEle").change(function() {
				_this.ondestnSubRegionSelect(this.value);
			});
		});
	},
		validateAndPrintQRCode :  function(){
		if(isSrcToDesntWIseSubRegion  && selectedDestnSubRegion <= 0){
			showMessage('error','Please Select Subregion');
			return;
		}
		if($('#fromRange').val() == '' || $('#fromRange').val().length == 0)
		{
			showMessage('error','Please Enter From Range');
			return;
		}
		if($('#toRange').val() == '' || $('#toRange').val().length == 0)
		{
			showMessage('error','Please Enter To Range');
			return;
		}
		if($('#fromRange').val() <= 0){
			showMessage('error','From Range Should Be Grater Than 0');
			return;
		}
		if($('#toRange').val() <= 0){
			showMessage('error','To Range Should Be Grater Than 0');
			return;
		}
		if($('#fromRange').val()<=0){
			showMessage('error','From Range Should Be Grater Than 0');
			return;
		}
		if($('#toRange').val()<=0){
			showMessage('error','To Range Should Be Grater Than 0');
			return;
		}
		if(Number($('#toRange').val()) < Number($('#fromRange').val())){
			showMessage('error','To Range Should Be Grater Than From Range');
			return;
		}
		if(Number($('#toRange').val()) == Number($('#fromRange').val())){
			showMessage('error',' From Range and To Range Should Not  Be Equal');
			return;
		}
		_this.printQRCode();
	},
		ondestnSubRegionSelect : function(value){
		selectedDestnSubRegion = value;
		if(isSrcToDesntWIseSubRegion){
			var obj = srsDestnMap[selectedDestnSubRegion];
			if(typeof obj !== 'undefined') {
				$('#seqRangeString').removeClass('hide');
				$('#seqRangeString').html("Sequence Range : "+obj.minRange + "-" +obj.maxRange);
			}
		}
		var jsonObject = new Object();
		showLayer();
		jsonObject["isSrcToDesntWIseSubRegion"]        = isSrcToDesntWIseSubRegion;
		if(!isSrcToDesntWIseSubRegion){
			jsonObject["subRegionId"]                      = 0;
		}else{
			jsonObject["subRegionId"]                      = selectedDestnSubRegion;
		}
		getJSON(jsonObject, WEB_SERVICE_URL + "/advanceTokenBookingWS/getPreviousRangeForAdvTokenBooking.do?", _this.setPrevRange, EXECUTE_WITHOUT_ERROR);	
	},
		setPrevRange : function(response){
		hideLayer();
		if(response !=undefined && response.sequenceCounter!== undefined){
			if(typeof response.sequenceCounter !== 'undefined') {
				$('#prevRangeString').removeClass('hide');
				$('#prevRangeString').html("Recent Sequence Entry : "+response.sequenceCounter.fromRange + "-" +response.sequenceCounter.toRange);
			}else{
				showMessage('info', "Previous Sequence Range Not Found"); 
				$('#prevRangeString').addClass('hide');
			}
		}else{
			$('#prevRangeString').addClass('hide');
			showMessage('info', "Previous Sequence Range Not Found"); 
		}
	},
		printQRCode : function(){
		var jsonObject = new Object();
		showLayer();
		jsonObject["fromRange"]          = $('#fromRange').val();
		jsonObject["toRange"]            = $('#toRange').val();
		if(!isSrcToDesntWIseSubRegion){
			jsonObject["subRegionId"]        = 0;
		}else{
			jsonObject["subRegionId"]        = selectedDestnSubRegion;
		}
		getJSON(jsonObject, WEB_SERVICE_URL + "/advanceTokenBookingWS/printAdvanceQRCode.do?", _this.afterUpdate, EXECUTE_WITHOUT_ERROR );	
	}, afterUpdate : function(response){
		hideLayer();
		if (!response || jQuery.isEmptyObject(response)) {
			_this.clearTextfieldData();
			showMessage('error', "System error"); // show message to show system processing error massage on top of the window.
			hideLayer();
		}
		if(response.isRangeIsValid!=undefined && response.isRangeIsValid){
			_this.printqrCodeData(response);
		}else{
			_this.clearTextfieldData();
			showMessage('error', "Invalid Range Please Enter Valid Range");  
		}
	},
		clearTextfieldData:function(){
		$('#fromRange').val('');
		$('#toRange').val('');
	},
		printqrCodeData:function(response){
		if(response!= undefined && response.isRangeIsValid!=undefined && response.isRangeIsValid){
			if(response.isRangeAlreadyExist!= undefined && response.isRangeAlreadyExist){
				showMessage('info', "Range Already Exist But You Can Print QRCode"); 
			}
			var fromRange    =  response.fromRange;
			var toRange      =  response.toRange;
			var acGroupname  =  response.AccountGroupName;
			var acGroupId    =  response.accountGroupId;

			var dataObjectColl 							= new Object();
			dataObjectColl.qrCodeSize 					= 13;
			dataObjectColl.bodyStyle 					= "white-space: nowrap;width:100%;font-size:45px;margin:0;padding:0;font-weight:20px;font-weight:bold;font-family:sans-serif;";
			var templateArray = new Array();
			_this.clearTextfieldData();
			var today = new Date();
			var currentDate = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
			for(var i = fromRange;i<=toRange;i++){
				var dataObject = new Object();
				var data = i;
				
				if(branchCodeWiseWayBillNumberGeneration){
					data = branchCode+"-"+data;
				}
				_.map(dataObjectColl,function(val,key){
					dataObject[key] = val;
				})
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="border-bottom: solid 1px; font-size: 42px;padding: 0px 10px 0px 10px;">'+acGroupname+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+data+'</td></tr><tr><td style="border-bottom: solid 1px; font-size: 42px;border-right: solid 1px; padding: 0px 10px 0px 10px;">Date</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+currentDate+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; font-size: 42px; padding: 0px 10px 0px 10px;"><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
				dataObject.htmlTemplate = _.template('<table style="margin-left:10px; border: solid 1px;"><tr><td colspan="2" style="word-wrap: break-word;word-break: break-all;border-bottom: solid 1px; font-size: 42px;padding: 0px 10px 0px 10px;">'+acGroupname+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; padding: 0px 10px 0px 10px;">LR No</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+data+'</td></tr><tr><td style="border-bottom: solid 1px; font-size: 42px;border-right: solid 1px; padding: 0px 10px 0px 10px;">Date</td><td style="border-bottom: solid 1px; padding: 0px 10px 0px 10px;">'+currentDate+'</td></tr><tr><td style="border-bottom: solid 1px; border-right: solid 1px; font-size: 42px; padding: 0px 10px 0px 10px;"><td style="text-align:right; padding: 0px 10px 0px 10px;">IVCARGO</td></tr></table>')({dataObject : dataObject});
				dataObject.qrCodeString = ZERO + "~"+acGroupId+ "_"+data+"~"+RANGEWISE_QR_PRINT;
                templateArray.push(dataObject);
			}
			var finalObj = new Object();
			finalObj.templateArray = templateArray;
			if(response.isRangeAlreadyExist!= undefined && !response.isRangeAlreadyExist){
				showMessage('success', "QRCode Generated Sucessfully!"); 
			}
			if(templateArray.length > 50){
				var startingIndex = 1;
				largeTemplateArray = 	splitArrayData(templateArray , 50);
				if(largeTemplateArray!=undefined){
					var  value = largeTemplateArray[startingIndex];
					var finalObj = new Object();
					finalObj.templateArray = value;
					printedColl.push(startingIndex);
					printQRCodeDataPrint(finalObj,startingIndex);
				}
			}else{
				$.ajax({
					url : "http://127.0.0.1:60080/printQrCode",
					data : finalObj,
					success : function(result) {
				}
				});
			}
			hideLayer();
			setTimeout(function(){
				getJSON(jsonObject, WEB_SERVICE_URL + '/advanceTokenBookingWS/getInitialDetailsForAdvanceTokenPrint.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			}, 100);	
			setTimeout(function(){
				showMessage('success', "QRCode Generated Sucessfully!"); 
			}, 100);	
			
		}else{
			showMessage('error', "Invalid Range Please Enter Valid Range"); 
			$("#destSubRegionNameTypeEle").val(0);
		}
	}
	});
});
function breakArrays(myArray, chunk_size){

	var results = [];

	while (myArray.length) {
		results.push(myArray.splice(0, chunk_size));
	}

	return results;

}

function splitArrayData(myArray,chunk_size){
	var results = [];
	var dataRes = {};
	if(myArray!= undefined && myArray.length > 0){
		var j =1;
		for(var i = 0;i<myArray.length;i++){
			results.push(myArray[i]);
			var z = i % chunk_size;
			if(z == 0 && i!=0){
				dataRes[j] = results;
				j++;
				results =[];
			}
		}
		dataRes[j] = results;
		lastIndex = j;
		return dataRes;
	}
}

function printQRCodeDataPrint(qrCodeObj,index){
	showLayer();
	$.ajax({
		url : "http://127.0.0.1:60080/printQrCode",
		data : qrCodeObj,
		async: false,
		success : function(response) {
			if(response!= undefined){
				markQRIsPrinted[index] = true;
				txnInPrint[key] = true;
				for (var key in largeTemplateArray) {
					if(key != 1 && (markQRIsPrinted[key] == undefined || !markQRIsPrinted[key])){
						if (largeTemplateArray.hasOwnProperty(key)) {
							var  value = largeTemplateArray[key];
							if(value.length > 0 && !markQRIsPrinted[key]){
								txnInPrint[key] = false;
								var finalObj = new Object();
								finalObj.templateArray = value;
								printQRCodeDataPrint(finalObj,key);
							}
						}
					}
				}
			}
	}
	});
}
function checkExistInArray(key){
	var res = printedColl.includes(key);
	return res;
}
