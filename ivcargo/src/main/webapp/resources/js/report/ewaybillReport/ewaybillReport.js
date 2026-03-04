define(['JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/report/ewaybillReport/ewaybillReportfilepath.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,'selectizewrapper'
	,'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'focusnavigation'
	],
	function(JsonUtility, MessageUtility, FilePath, Lingua, Language, NodValidation,Selectizewrapper , slickGridWrapper2, BootstrapModal,Selection,ElementFocusNavigation) {
	'use strict';
	var jsonObject = new Object(),gridObject, myNod, 
	SEARCH_BY_DATE = 1,
	SEARCH_BY_EWAYBILL_NUMBER = 2,
	SEARCH_BY_GSTIN = 3,  
	_this = '', 
	masterLangObj, 
	masterLangKeySet, 
	transporterId='',
	options='',
	filter=0
	,filter_EwaybillNumber_Wise = 1,
	filter_EwaybillDate_Wise = 2,
	filter_Search_Other_Party = 3, 
	filter_Trip_Sheet_Deatils = 4,
	filter_Gstin_Details = 5,
	filter_Transporter_Details = 6,
	EwaybillErrorCodesConstant,
	searchByAllState = false,
	finalJson= null;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ewaybillReportWS/getEwaybillReportElement.do?',	_this.setEwaybillReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setEwaybillReportElements : function(response) {
			console.log(response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			var jsonObject 				= new Object();
			EwaybillErrorCodesConstant	= response.EwaybillErrorCodesConstant;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/report/ewaybillReport/ewaybillReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var elementConfiguration	= new Object();
				var dateSelection			= response.inputProperties.date.show;
				var ewaybillNoSelection		= response.inputProperties.ewaybillno.show;
				elementConfiguration.singleDateElement	= $('#dateEle');
				response.elementConfiguration			= elementConfiguration;
				response.isCalenderForSingleDate		= true;
				transporterId							= response.transporterId;
				searchByAllState						= response.searchByAllState
				Selection.setSelectionToGetData(response);
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				/*var stateAutoComplete = new Object();
				stateAutoComplete.primary_key = 'stateGSTCode';
				//stateAutoComplete.callBack = _this.onRegionSelect;
				stateAutoComplete.field = 'stateName';
				$("#stateEle").autocompleteCustom(stateAutoComplete);
				if (executive.executiveType == 1) {
					var autoStateName = $("#stateEle").getInstance();
					$(autoStateName).each(function() {
						this.option.source = response.stateArrList;
					});
				}*/
				
				if(searchByAllState){
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.stateArrList,
						valueField		:	'stateGSTCode',
						labelField		:	'stateName',
						searchField		:	'state',
						elementId		:	'stateEle',
						create			: 	false,
						maxItems		: 	29
					});
				}else{
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.stateArrList,
						valueField		:	'stateGSTCode',
						labelField		:	'stateName',
						searchField		:	'state',
						elementId		:	'stateEle',
						create			: 	false,
						maxItems		: 	1
					});
					
				}
				
				if(!ewaybillNoSelection){
					$("#searchByOption option[value="+SEARCH_BY_EWAYBILL_NUMBER+"]").remove();
				}
				if(!dateSelection){
					$("#searchByOption option[value="+SEARCH_BY_DATE+"]").remove();
				}
				hideLayer();
				$('select').on('change',function(){
					
					if(Number($('#searchByOption').val()) == SEARCH_BY_DATE){
						$('#dateElement').removeClass('hide');
						$('#searchOtherPartyBtn').removeClass('hide');
						$('#findBtn').removeClass('hide');
						$('#tripSheetDetailsBtn').addClass('hide');
						$('#ewaybillElement').addClass('hide');
						$('#consignorGstNoElement').addClass('hide');
						$('#consignorGstnDetailsBtn').addClass('hide');
						$('#transporterDetailsBtn').addClass('hide');
						$('#stateDivId').removeClass('hide');

					} else if (Number($('#searchByOption').val()) == SEARCH_BY_EWAYBILL_NUMBER){
						$('#dateElement').addClass('hide');
						$('#searchOtherPartyBtn').addClass('hide');
						$('#tripSheetDetailsBtn').removeClass('hide');
						$('#ewaybillElement').removeClass('hide');
						$('#findBtn').removeClass('hide');
						$('#consignorGstNoElement').addClass('hide');
						$('#consignorGstnDetailsBtn').addClass('hide');
						$('#transporterDetailsBtn').addClass('hide');

					} else if (Number($('#searchByOption').val()) == SEARCH_BY_GSTIN){
						$('#dateElement').addClass('hide');
						$('#searchOtherPartyBtn').addClass('hide');
						$('#ewaybillElement').addClass('hide');
						$('#tripSheetDetailsBtn').addClass('hide');
						$('#findBtn').addClass('hide');
						$('#consignorGstNoElement').removeClass('hide');
						$('#consignorGstnDetailsBtn').removeClass('hide');
						$('#transporterDetailsBtn').removeClass('hide');
					} else {
						$('#dateElement').addClass('hide');
						$('#ewaybillElement').addClass('hide');
						$('#searchOtherPartyBtn').addClass('hide');
						$('#findBtn').addClass('hide');
						$('#tripSheetDetailsBtn').addClass('hide');
						$('#consignorGstnDetailsBtn').addClass('hide');
						$('#consignorGstNoElement').addClass('hide');
						$('#transporterDetailsBtn').addClass('hide');
						$('#stateDivId').addClass('hide');
					}
				})
				$("#findBtn").click(function() {

					jsonObject.filter		 	= filter_EwaybillNumber_Wise;
					_this.checkValidInputsAndInsert(jsonObject);
				});
				$("#genEWaybillBtn").click(function() {
					showLayer();
					var dispatchId	= 48195;
					_this.generateConsolitadeEWaybill(dispatchId);
				});
				$("#searchOtherPartyBtn").click(function() {

					jsonObject.filter		 	= filter_Search_Other_Party;
					_this.checkValidInputsAndInsert(jsonObject);
				});
				$("#tripSheetDetailsBtn").click(function() {

					jsonObject.filter		 	= filter_Trip_Sheet_Deatils;
					_this.checkValidInputsAndInsert(jsonObject);
				});
				$("#consignorGstnDetailsBtn").click(function() {

					jsonObject.filter		 	= filter_Gstin_Details;
					_this.checkValidInputsAndInsert(jsonObject);
				});
				/*$("#transporterDetailsBtn").click(function() {

					jsonObject.filter		 	= filter_Transporter_Details;
					_this.checkValidInputsAndInsert(jsonObject);
				});*/
			});
		}, checkValidInputsAndInsert : function(jsonObject){

			myNod = nod();
			myNod.configure({
				parentClass:'validation-message'
			});
			jsonObject.ewaybillNumber 	= $('#ewaybillNoEle').val();
			jsonObject.transporterId 	= transporterId;
			if($('#dateEle').is(":visible")){
				var endDate = $('#dateEle').val();
				var dateFormatForServer 	= endDate.split("-").join("/");
				jsonObject.toDate			= dateFormatForServer;
				jsonObject.filter		 	= filter_EwaybillDate_Wise;
				
				/*myNod.add({
					selector: '#stateEle',
					validate: 'validateAutocomplete:#stateEle_primary_key',
					errorMessage: 'Select proper State !'
				});*/
				if(searchByAllState){
					jsonObject.stateCode 		= $('#stateEle').val();
					myNod.add({
						selector: '#stateEle_wrapper',
						validate: 'validateAutocomplete:#stateEle',
						errorMessage: 'Select proper State !'
					});
				}
			} else {
				jsonObject.toDate			= "";
			}
			if($('#consignorGstNoEle').is(":visible")){
				jsonObject.gstNumber = $('#consignorGstNoEle').val();
				myNod.add({
					selector		: '#consignorGstNoEle',
					validate		: 'presence',
					errorMessage	: 'Enter GST Number'
				});
			}

			console.log('jsonObject',jsonObject);
			if($('#ewaybillNoEle').is(":visible")){
				myNod.add({
					selector		: '#ewaybillNoEle',
					validate		: 'presence',
					errorMessage	: 'Enter E-Waybill Number'
				});
			}

			myNod.performCheck();
			if(myNod.areAll('valid')) {
				_this.onSubmit(jsonObject);								
			}
		} , onSubmit : function(jsonObject) {
		
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ewaybillReportWS/getEwaybillReportDetails.do?',	_this.setResponseFromEwaybillServer, EXECUTE_WITH_ERROR);
		
		} , setResponseFromEwaybillServer : function(response) {
			hideLayer();
			if(response.message != undefined){
				$('#print_ewaybillReportDiv').hide();
					showMessage("error",response.message.description);
					hideLayer();
					return false;
			}
			console.log('<>response<>',response)
			if(searchByAllState){
				if(response.exceptionCode == 405){
					$("#ewaybillReportDiv").empty();
					$('#middle-border-boxshadow').css('display','none');
					showMessage("info","DATA NOT FOUND FOR THIS STATE !");
					hideLayer();
					return false;
				}
			}
			$("#ewaybillReportDiv").empty();
			$('#middle-border-boxshadow').css('display','block');
			//console.log('response.exceptionCode>>',response.exceptionCode)
			if(response.filter == filter_EwaybillDate_Wise && response.exceptionCode == EwaybillErrorCodesConstant.INVALID){
				$('#middle-border-boxshadow').css('display','none');
				return showMessage('info',response.serviceResult);
			}
			if(response.filter == filter_EwaybillNumber_Wise && response.exceptionCode == EwaybillErrorCodesConstant.INVALID){
				$('.middle-border-boxshadow').css('display','none');
				return showMessage('info','No Records For This E-Waybill !!');
			}
			if(response.filter == filter_EwaybillNumber_Wise){
				if(typeof response.failure != 'undefined' && response.failure != undefined){
					if(response.failure == true){
						return showMessage('error','Access Token expired or server not found !!');
					}
				}
			}
				if(typeof response.success != 'undefined' &&  response.success != undefined) {
					//var jsonObj = JSON.parse(response.success); 
				//	delete jsonObj.results.message.VehiclListDetails;
					//delete jsonObj.results.message.itemList;
					var responseForSingleEwaybillArr = new Array();
					//responseForSingleEwaybillArr[0]=jsonObj.results.message;
					
//					if(response.filter == filter_EwaybillNumber_Wise && jsonObj != undefined){
//						response.GenerateEWaybillConfig.CorporateAccount	= responseForSingleEwaybillArr;
//					}
					$('#print_ewaybillReportDiv').show();
					if(searchByAllState){
						finalJson 							= response.json.htData.FINALJSONLIST;
						console.log('<>finalJson----<>',finalJson)
						var finalobj 						= new Object();
						var finalList 						= new Array();
						var filterFinalAllEwaybillFromGovtServer 	= new Array();
						if(finalJson != undefined){
							for(var n = 0 ; n < finalJson.length ; n++){
								if(finalJson[n].htData != undefined){
									finalobj = finalJson[n].htData;
									if(!filterFinalAllEwaybillFromGovtServer.includes(parseInt(finalobj.eway_bill_number))) { // logic to remove duplicates E-Waybills
										filterFinalAllEwaybillFromGovtServer.push(parseInt(finalobj.eway_bill_number));
										finalList.push(finalobj);
									}
								}
							}
						}
					}
					
					
					if(response.filter == filter_EwaybillDate_Wise){
						var filterEwaybillFromGovtServer 	= new Array();
						var filterEwaybillNumberArrayList 	= new Array();
						var ewaybillNumberArrayList		 	= response.ewaybillNumberArrayList;
						var responseEwaybillFromGovtServer	= new Array();
						if(searchByAllState){
							responseEwaybillFromGovtServer		= finalList;
						}else{
							responseEwaybillFromGovtServer		= jsonObj.results.message;
						}
						for (var i = 0; i < responseEwaybillFromGovtServer.length; i++) {
							filterEwaybillFromGovtServer.push(parseInt(responseEwaybillFromGovtServer[i].eway_bill_number));
							responseEwaybillFromGovtServer[i].lrGenerated = 'No';
							responseEwaybillFromGovtServer[i].waybillNumber = 'NA';
							responseEwaybillFromGovtServer[i].waybillStatusName = 'NA';
							responseEwaybillFromGovtServer[i].consolidatedEwaybillNumber = 'NA';
							responseEwaybillFromGovtServer[i].vehicleNumber = 'NA';
						}

						if(ewaybillNumberArrayList != undefined){
						if(ewaybillNumberArrayList.length == 0){
							_this.isValueExistInArray(responseEwaybillFromGovtServer,0 , 0);
						}
							for(var l = 0 ; l < ewaybillNumberArrayList.length ; l++){
								_this.isValueExistInArray(responseEwaybillFromGovtServer,parseInt(ewaybillNumberArrayList[l].ewaybillNumber) , ewaybillNumberArrayList[l]);
							}
						}
						
						if(searchByAllState){
							response.GenerateEWaybillConfig.CorporateAccount = finalList;
						}else{
							response.GenerateEWaybillConfig.CorporateAccount = responseEwaybillFromGovtServer;
						}
					}
				}
			if(response != undefined){
				var responseCode = response.exceptionCode;
			}
			if(response.GenerateEWaybillConfig != undefined){
				var generateEWaybillConfigColumnConfig 	 = response.GenerateEWaybillConfig.columnConfiguration;
				var generateEWaybillConfigColumnKeys		 = _.keys(generateEWaybillConfigColumnConfig);

				for (var k = 0; k < generateEWaybillConfigColumnKeys.length ; k++) {

					var bObj	= generateEWaybillConfigColumnConfig[generateEWaybillConfigColumnKeys[k]];
					if(bObj != null){
						if (bObj.show == true) {
							generateEWaybillConfigColumnConfig[generateEWaybillConfigColumnKeys[k]] = bObj;
						}
					}
				}
				response.GenerateEWaybillConfig.columnConfiguration							= generateEWaybillConfigColumnConfig;
				response.GenerateEWaybillConfig.Language									= masterLangKeySet;
			}
			if(response.GenerateEWaybillConfig != undefined  && response.GenerateEWaybillConfig.CorporateAccount) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				gridObject = slickGridWrapper2.setGrid(response.GenerateEWaybillConfig);
				$('.slick-pane-top').css('top','50px');
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			hideLayer();
				if(responseCode == EwaybillErrorCodesConstant.HTTPOK && finalJson!=undefined && finalList!=undefined && finalList.length > 0){
					showMessage('success','Successfully Data Fetched From The Server!!');
			}
		} ,isValueExistInArray : function (responseEwaybillFromGovtServer, commonEwaybillsFound , ewaybillNumberObj) {

			for(var i = 0; i < responseEwaybillFromGovtServer.length; i++) {
				if (Number(responseEwaybillFromGovtServer[i].eway_bill_number) == Number(commonEwaybillsFound)) {
					responseEwaybillFromGovtServer[i].lrGenerated = 'Yes';
					if(ewaybillNumberObj.waybillNumber === ""){
						responseEwaybillFromGovtServer[i].waybillNumber = 'NA';
					}else{
						responseEwaybillFromGovtServer[i].waybillNumber = ewaybillNumberObj.waybillNumber;
					}
					responseEwaybillFromGovtServer[i].waybillStatusName = ewaybillNumberObj.waybillStatusName;
					if(ewaybillNumberObj.vehicleNumber != undefined){
						responseEwaybillFromGovtServer[i].vehicleNumber 	= ewaybillNumberObj.vehicleNumber;
					}
					responseEwaybillFromGovtServer[i].wayBillId = ewaybillNumberObj.wayBillId;
					if(ewaybillNumberObj.consolidatedEwaybillNumber != null && typeof ewaybillNumberObj.consolidatedEwaybillNumber != 'undefined' && ewaybillNumberObj.consolidatedEwaybillNumber != undefined) {
						responseEwaybillFromGovtServer[i].consolidatedEwaybillNumber = ewaybillNumberObj.consolidatedEwaybillNumber;
					} else {
						responseEwaybillFromGovtServer[i].consolidatedEwaybillNumber = 'NA';
					}
					
				}
				/* else {
					responseEwaybillFromGovtServer[i].lrGenerated = 'No';
					responseEwaybillFromGovtServer[i].waybillNumber = 'NA';
					responseEwaybillFromGovtServer[i].waybillStatusName = 'NA';
					responseEwaybillFromGovtServer[i].consolidatedEwaybillNumber = 'NA';
				}*/
			}
		},generateConsolitadeEWaybill:function(dispatchId){
			var jsonObject = new Object();
			
			jsonObject.dispatchIdString	= dispatchId;
			jsonObject.moduleId			= GENERATE_CONSOLIDATE_EWAYBILL_FROM_LS_REGI_REPORT; //ewaybillDetails
			console.log("jsonObject ",jsonObject)
			getJSON(jsonObject, WEB_SERVICE_URL+'/generateConsolidateEWayBillWS/generateAutoConsolidateEWaybill.do', _this.setDataEWaybill, EXECUTE_WITH_ERROR);
			
		}, setDataEWaybill : function(response){
			console.log("response",response);
			if(response.message != undefined){
				showMessage('error', response.message.description);
				hideLayer();
				return false;
			}
			hideLayer();
			if(response.ConsolidateEWaybillGenerated == true){
				
				var consolidateEwaybill = response.consolidateEWayBillNumber; 
			
				$("#conEWaybillNumberLabel").html(consolidateEwaybill).removeClass("hide");
				$("#genEWaybillBtn").addClass("hide");
				
			} else {
				var errorCode = 0;
				if(typeof response.exceptionString == 'string' && response.exceptionString.includes('errorCodes')){
					var messegeCode = JSON.parse(response.exceptionString); 
					errorCode 		= messegeCode.errorCodes.substring(0,(messegeCode.errorCodes.length -1));
				}
				if(errorCode == '311'){
					showMessage('error', "Validity period lapsed, you cannot update vehicle details");
					return false;
				}else if(response.exceptionCode == EwaybillErrorCodesConstant.INVALID){
					showMessage('error', response.exceptionString);
					return false;
				} else {
					showMessage('error', "Could not generate consolidated eway bill");
					return false;
				}
				
			}
		}
	});
});

function wayBillSearch(grid, dataView, row) {
	if(dataView.getItem(row).wayBillId != undefined) {
		window.open('SearchWayBillAction.do?pageId=3&eventId=8&wayBillId=' + dataView.getItem(row).wayBillId + '&id=search');
	} 
}
function setEwaybillDataOnBookingPage(grid, dataView, row) {
	if(dataView.getItem(row).eway_bill_number != undefined && dataView.getItem(row).wayBillId == undefined ) {
			 var myWindow = window.open('CreateWayBill.do?pageId=2&eventId=1&ewNo=' + dataView.getItem(row).eway_bill_number );
			 var doc = myWindow.document;
			 setTimeout(function(){
				 $("#ewaybill0").val(dataView.getItem(row).eway_bill_number);
			 },2000);
			 
	} 
}