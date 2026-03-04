define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	// to get parameter from url to send it to ws
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/multilrprint/multiLrPrint_def_FilePath.js'
	
	,'jquerylingua'
	,'language'
	,PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js'
	],
	function(JsonUtility, MessageUtility, UrlParameter,FilePath, jquerylingua, language) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			
			masterId	= localStorage.getItem("wayBillids");
			localStorage.removeItem("wayBillids");
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {
			
			jsonObject.waybillIds = masterId;	
			getJSON(jsonObject, WEB_SERVICE_URL + '/lrPrintWS/getMultiLRPrintByWaybillIds.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);

			return _this;
		},getResponseForPrint : function(response) {
			
			
			var lrPrintConfig					= response.lrPrintConfig;
			var isMultipleCopyAllow				= lrPrintConfig.isMultipleCopyAllow;
			var isMultipleCopyAllowOnMarginTop	= lrPrintConfig.isMultipleCopyAllowOnMarginTop;
			
			require(['/ivcargo/resources/js/module/print/multilrprintsetup.js'], function(lrprintsetup){
				
				var loadelement = new Array();
				var waybillList = response.waybillList;
				var consignmentDetailsHM = response.consignmentDetailsHM;
				var formTypesList = response.formTypesList;
				var currentTime = response.currentTime;
				var currentDate = response.currentDate;
				var destBranchHM = response.destBranchHM;
				var sourceBranchHM = response.sourceBranchHM;
				var wayBillHm = response.wayBillHm;
				var printHeaderModel	= 	response.PrintHeaderModel;
				var wayBillIdWiseBookingchargesHM = response.wayBillIdWiseBookingchargesHM;
				var k = 0;
				var wayBill	= 0;
								
				var headerKey 			= Object.keys(wayBillHm);
				var firstWaybIllId= headerKey[0];
						
				for(var key = 0;key<waybillList.length;key++) {
					var baseHtml = new $.Deferred();
					loadelement.push(baseHtml);
					k++;
					
					if(k > 1 && isMultipleCopyAllow){
						$("#mainContent").append('<div id=data_'+waybillList[key].wayBillId+' class="page-break"></div>');
					} else {
						$("#mainContent").append('<div id=data_'+waybillList[key].wayBillId+'></div>');
					}
					
					if(isMultipleCopyAllowOnMarginTop){
						if(waybillList[key].wayBillId!=firstWaybIllId){
							$('#data_'+waybillList[key].wayBillId).css('padding-Top','103px');
						}else{
							$('#data_'+waybillList[key].wayBillId).css('padding-Top','93px');
						}
					 }
					
					if(wayBill != waybillList[key].wayBillId){
						wayBill = waybillList[key].wayBillId;
						
						let path	= "/ivcargo/html/print/multiLr/" + response.accountGroupId + "_multiLrPrint.html";
						
						if(response.accountGroupId == 740 && printHeaderModel.branchId == 64027)
							path	= "/ivcargo/html/print/multiLr/" + response.accountGroupId + "_1_multiLrPrint.html"	
							
						if(!urlExists(path))
							path	= "/ivcargo/html/print/multiLr/default_multiLrPrint.html";
							
						$("#data_" + waybillList[key].wayBillId).load(path, function() {
							baseHtml.resolve();
						});
						
						lrprintsetup.setLRDetails(waybillList[key],waybillList[key].wayBillId,lrPrintConfig);
						lrprintsetup.setConsignmentDetails(consignmentDetailsHM[waybillList[key].wayBillId],waybillList[key].wayBillId);
						lrprintsetup.setConsignorDetails(waybillList[key],waybillList[key].wayBillId);
						lrprintsetup.setConsigneeDetails(waybillList[key],waybillList[key].wayBillId);
						lrprintsetup.setFormTypeDetails(formTypesList[key],waybillList[key].wayBillId);
						lrprintsetup.setCurrentDateTime(currentTime,currentDate,waybillList[key].wayBillId);
						lrprintsetup.setBranchDetails(destBranchHM[waybillList[key].wayBillId],sourceBranchHM[waybillList[key].wayBillId],waybillList[key].wayBillId);
						lrprintsetup.setPrintHeaderModel(printHeaderModel,waybillList[key].wayBillId);
						
						if(response.wayBillIdWiseBookingchargesHM != undefined)
						lrprintsetup.setBookingCharges(wayBillIdWiseBookingchargesHM[waybillList[key].wayBillId], waybillList[key].wayBillId,waybillList[key]);
						
						if(response.invoiceDetails != undefined)
							lrprintsetup.setInvoiceDetails(response.invoiceDetails[waybillList[key].wayBillId], waybillList[key].wayBillId);
						
						if(response.formTypesList != undefined)
							lrprintsetup.setEwayBillDetails(response.formTypesList, waybillList[key].wayBillId);
					}
				}
				
				if(accountGroupId == 669)
					lrprintsetup.showPopUp();
				else{
					setTimeout(function(){window.print();window.close();
				},500);
				}
			});
		
		}
	});
});
