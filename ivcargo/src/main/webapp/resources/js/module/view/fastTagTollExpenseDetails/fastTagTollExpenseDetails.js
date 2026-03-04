var PaymentTypeConstant;
var BillTypeConstant;
var newPartyBkngReprtData;
var ownerWiseCollectionProperties;
var allOptionsForFromSubRegion;
var allOptionsForFromBranch;
var allOptionsForTOSubRegion;
var allOptionsForTOBranch;
var ownerWiseCollectionReportConfig;
var allowLrTypeAmntAsLink;
var tollMasterArrays;
var fastTagtollArrays;
var	rowCount = 0;
var TOLL_EXPENSE_PAID_ID = 1;
var TOLL_EXPENSE_NOT_PAID_ID = 0;
var vehicleNumber ;
var lastSettlementDate ;
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/js/truckhisabmodule/TruckHisabVoucherSettlement.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper2'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper'
	 ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper2, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,Selectizewrapper,UrlParameter) {
	'use strict';
	var jsonObject = new Object(),myNod,_this = '',gridObject,masterLangObj,masterLangKeySet,btModal,PrintHeaderModel;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			//jsonObject	= jsonObjectData.jsonObject;
			btModal			= masterObj.btModal;
			vehicleNumber		 = 		UrlParameter.getModuleNameFromParam("vehicleNumber")
			lastSettlementDate		 = 		UrlParameter.getModuleNameFromParam("lastSettlementDate")
		},render : function() {
			
			jsonObject.vehicleNumber = vehicleNumber;
			jsonObject.lastSettlementDate = lastSettlementDate;
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/tollExpensesDetailsWS/getFastTagTollDetails.do?',_this.setReportData,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setReportData : function(response) {
			var loadelement				= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/fastTagTollDetails/fastTagTollDetails.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				hideLayer();
				console.log("innn--00---",response)
				if(response.message != undefined){
					$('#bottom-border-boxshadow').addClass('hide');
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
					return;
				}
				
			
				
			
			
			$('#bottom-border-boxshadow').removeClass('hide');
			$('#reportData1 tbody').empty();
			$('#ownerWiseCollectionReport').empty();
			
			
			
			var tollExpenseDetailsList 	= response.TollExpenseDetails;
			console.log("--88888-----",tollExpenseDetailsList);
			if(tollExpenseDetailsList != undefined && tollExpenseDetailsList.length > 0) {
				var columnArray		= new Array();
				var count			= 0;
				var paidGrandTotal	= 0;
				var topayGrandTotal	= 0;
				var tbbGrandTotal	= 0;
				var paidServiceChargeTotal 	=0;
				var topayServiceChargeTotal =0;
				var tbbServiceChargeTotal 	=0;
				var commissionAmount 		=0;
				var hamaliTotal 			=0;
				var doorDeliveryTotal 		=0;
				var paidOtherCharge			=0;
				var toPayOtherCharge		=0;
				var tbbOtherCharge			=0;
				console.log("-------",response.tollMasterList);
				var tollNameAutoComplete 			= new Object();
				tollNameAutoComplete.primary_key 	= 'tollTypeMasterId';
				tollNameAutoComplete.url 			= response.tollMasterList;
				tollNameAutoComplete.field 			= 'name';
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				for (var i = 0; i < tollExpenseDetailsList.length; i++) {
					var obj = tollExpenseDetailsList[i];
					count =count + 1;
			
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>" + (i + 1) + "</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''><input type='checkbox' id='check_"+i+"'  value='check_"+obj.fastTagTollExpenseDetailsId+"' checked> </td>");
					columnArray.push("<td class='datatd ' style='text-align: center; vertical-align: middle; font-size:15px;height:50px;display:none;'><input name='fastTagtollId_"+obj.fastTagTollExpenseDetailsId+"' id='fastTagtollId_"+i+"' value='fastTagtollId_"+obj.fastTagTollExpenseDetailsId+"' type='textbox' ></td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;''>"+obj.tollplazaname+"</td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;' ><input style='border: 0px solid;text-align:center;' id='TotTollAmount_"+i+"' value='"+ obj.txnAmount +"' type='text' readonly></td>");
					columnArray.push("<td class='datatd ' style='text-align: center; vertical-align: middle; font-size:15px;height:50px;' id='demo_"+i+"'><input name='tolltype_"+i+"' id='tolltype_"+i+"' type='textbox' ></td>");
					columnArray.push("<td class='datatd' style='text-align: center; vertical-align: middle; font-size:15px;' ><input style='border: 0px solid;text-align:center;' id='remark_"+i+"' placeholder='Enter Remark'  type='text' ></td>");
					columnArray.push("<td class='datatd ' style='text-align: center; vertical-align: middle; font-size:15px;height:50px;display:none;'><input name='tolltype_"+i+"' id='tolltype_"+i+"' type='textbox' ></td>");
					
					$('#reportData1 tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					
				
					columnArray	= [];
					
					Selectizewrapper.setAutocomplete({
						jsonResultList	: 	response.tollMasterList,
						valueField		:	'tollTypeMasterId',
						labelField		:	'name',
						searchField		:	'name',
						elementId		:	'tolltype_'+i+'',
						create			: 	false,
						maxItems		: 	1
					});
					
				}
				rowCount = $('#reportData1 tbody tr').length;
				$("#searchBtn").click(function() {
					if(validToll()){
						AddData();
					}
				});
			
			
		}
			});
	}
	});		
});

function AddData(){
	
	tollMasterArrays						= new Array();
	fastTagtollArrays						= new Array();
	var totalSelectedTollAmt = 0;
	
	if(confirm("Do You Want To Add Toll Details?")) {
	for(var i = 0; i < rowCount; i++) {
			var tollData = new Object();
			
			tollData.fastTagtollId			= Number($("#fastTagtollId_"+i).val().split('_')[1]);
			tollData.TollMasterAmt			= parseInt($("#TotTollAmount_"+i).val());
			tollData.TollMasterTypeId		= $("#tolltype_"+i).val();
			tollData.TollMasteName			= $('#demo_'+i+' div div div').html();
			tollData.isChecked				= $("#check_"+i).prop("checked");
			tollData.TollMasterRemark		= $("#remark_"+i).val();
			
		
			
			if(tollData.isChecked){
				tollData.isTollExpensePaid = TOLL_EXPENSE_PAID_ID;
				tollMasterArrays.push(tollData);
				totalSelectedTollAmt += 	tollData.TollMasterAmt;	
			}else{
				tollData.isTollExpensePaid = TOLL_EXPENSE_NOT_PAID_ID;
			}
			fastTagtollArrays.push(tollData);
					
	}
	localStorage.setItem('tollMasterArray',JSON.stringify(tollMasterArrays));
	localStorage.setItem('fastTagtollArray',JSON.stringify(fastTagtollArrays));
	localStorage.setItem('totalSelectedTollAmt',JSON.stringify(totalSelectedTollAmt));
	window.close();
	}
	
}

function validToll() {
	for(var i = 0; i < rowCount; i++) {
		var tollName = $('#demo_'+i+' div div div').html();
		if(tollName == '<div>No results found.</div>' && $("#check_"+i).prop("checked")){
			showMessage("error", DailyTollNameErrMsg);
			toogleElement('error','block');
			changeTextFieldColor('tolltype_'+i+'_wrapper', '', '', 'red');
			return false;
			}
		changeTextFieldColor('tolltype_'+i+'_wrapper', '', '', 'white');
	}
	return true;
}
