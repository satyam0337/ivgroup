let hideSummaryInPrint = false;
define([
			'slickGridWrapper2'
			,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
			,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
			,'JsonUtility'
			,'messageUtility'
			,'autocomplete'
			,'autocompleteWrapper'
			,'nodvalidation'
			,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			,'focusnavigation'//import in require.config
			//,PROJECT_IVUIRESOURCES+'/resources/js/module/saveReportRequest.js'
		], function(slickGridWrapper2, Selection, UrlParameter) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', gridObject, fromDate = null, toDate = null, regionId = 0, subRegionId = 0, sourceBranchId = 0,isCSV = false,
	isBookingRegisterrport		= false,
	isFromBookingSummaryReport	= false,
	showExecutiveSelection		= false,
	paymentType					= 0,
	showOnlyHamaliLrs        	= false,
	regionList,
	bookingRegisterConfiguration;
	return Marionette.LayoutView.extend({
		initialize : function() {
			isBookingRegisterrport		= UrlParameter.getModuleNameFromParam("isBookingRegisterrport")
			fromDate 					= UrlParameter.getModuleNameFromParam("fromDate")
			toDate 						= UrlParameter.getModuleNameFromParam("toDate")
			regionId 					= UrlParameter.getModuleNameFromParam("regionId")
			subRegionId 				= UrlParameter.getModuleNameFromParam("subRegionId")
			sourceBranchId 				= UrlParameter.getModuleNameFromParam("sourceBranchId")
			isFromBookingSummaryReport	= UrlParameter.getModuleNameFromParam("isFromBookingSummaryReport")
			showOnlyHamaliLrs			= UrlParameter.getModuleNameFromParam("showOnlyHamaliLrs")

			paymentType 				= 0
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bookingRegisterReportWS/getBookingRegisterReportElement.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingRegisterReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			let executive				= response.executive;
			let showDownloadExcelButton = response.showDownloadExcelButton;
			isCSV						= response.isCSV;

			bookingRegisterConfiguration = response;
			hideSummaryInPrint			 = bookingRegisterConfiguration.hideSummaryInPrint;

			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/module/bookingregisterreport/BookingRegisterReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (!response[element])
						$("*[data-attribute="+ element+ "]").addClass("hide");
						
					if(element == 'executiveEle')
						showExecutiveSelection	= response[element];
				}
				
				_this.setSelectType();	
				
				let selectUserTypeDiv = $("#selectUserType").closest(".col-xs-5");

				if(response.isActiveTCEGroup) {
					selectUserTypeDiv.show(); 
					_this.setSelectUserType();		
				} else
					selectUserTypeDiv.hide(); 
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.executiveElement	= $('#executiveEle');
				elementConfiguration.divisionElement	= $('#divisionEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.isOneYearCalenderSelection	= false;
				response.monthLimit					= bookingRegisterConfiguration.monthLimitToShowDate;
				response.sourceAreaSelection		= true;
				response.divisionSelection			= response.division;
				response.isPhysicalBranchesShow		= !(isBookingRegisterrport == 'true' || isFromBookingSummaryReport == 'true');
				
				if (isCSV) {
					$('#downloadExcel').removeClass('hide').attr('data-tooltip', 'Download CSV'); 
					$('#downloadExcel span[data-selector="excel"]').text('Download CSV'); // update button text
				} else if (showDownloadExcelButton)
					$('#downloadExcel').removeClass('hide');
				else
					$('#downloadExcel').remove();

				if(response.showDownloadExcelButtonForTally)
					$('#downloadExcelTally').removeClass('hide');
				else
					$('#downloadExcelTally').remove();
				
				if(!response.dataFromDRServer)
					$("#note").hide();
					
				if(showExecutiveSelection && executive.executiveType != EXECUTIVE_TYPE_EXECUTIVE) {
					response.executiveListByBranch			= showExecutiveSelection;
					response.AllOptionsForExecutive			= true;
				} else
					$("#executiveEleSelection").remove();
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				if(showExecutiveSelection && executive.executiveType != EXECUTIVE_TYPE_EXECUTIVE) {
					addAutocompleteElementInNode(myNod, 'executiveEle', 'Select proper Executive !');
					$("*[data-attribute=executive]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
				
				if(isBookingRegisterrport != null && isBookingRegisterrport == 'true') {
					$("#dateEle").attr('data-startdate', fromDate);
					$("#dateEle").attr('data-enddate', toDate); 

					$("#dateEle").val(fromDate + ' - ' + toDate);

					$('#subRegionEle_primary_key').val(subRegionId);
					$('#branchEle_primary_key').val(branchId);

					if(response.regionList != undefined)
						regionList	= response.regionList;

					if(regionList != null ) {
						for(const element of regionList) {
							if(element.regionId == regionId) {
								$("#regionEle").val(element.regionName);
								$('#regionEle_primary_key').val(element.regionId);
							}
						}
					}

					let bookingRegister 	= new Object();

					bookingRegister.isFromCashStatement		= isBookingRegisterrport;
					bookingRegister.regionId				= regionId;
					bookingRegister.subRegionId				= subRegionId;
					bookingRegister.branchId				= sourceBranchId;
					bookingRegister.subRegionEle			= $('#subRegionEle');
					bookingRegister.branchEle				= $('#branchEle');
					bookingRegister.isGroupAdmin			= response.isGroupAdmin;
					bookingRegister.isRegionAdmin			= response.isRegionAdmin;
					bookingRegister.isSubRegionAdmin		= response.isSubRegionAdmin;
					bookingRegister.isNormalUser			= response.isNormalUser;

					if(isBookingRegisterrport == true || isBookingRegisterrport == "true") {
						$("#selectTypeEle").val("OUTGOING");
						$("#selectTypeEle_primary_key").val(2);
					}

					Selection.setDropDownForCashStatementLink(bookingRegister);
					_this.onSubmit(_this);
					
				} else if(isFromBookingSummaryReport != null && isFromBookingSummaryReport == 'true') {
					$("#dateEle").attr('data-startdate', fromDate);
					$("#dateEle").attr('data-enddate', toDate); 

					$("#dateEle").val(fromDate + ' - ' + toDate);

					$('#branchEle_primary_key').val(branchId);
					
					$("#selectTypeEle").val("OUTGOING");
					$("#selectTypeEle_primary_key").val(2);
					
					_this.onSubmitFromBookingSummary(_this);
				}
				
				hideLayer();
				
				$("#lrCheckBoxLabel").css('display', response.doNotShowCancelLR ? 'block' : 'none');
				$('#lrCheckbox').prop('checked', response.doNotShowCancelLR);
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$('#maxDaysToFindReport').val(bookingRegisterConfiguration.maxDaysToFindReport);

				$("#dateEle").change(function() {
					//checkDate();
				});
				
				$("#sendRequest").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						saveReportRequest(1);	
				});
				
				if(showDownloadExcelButton || isCSV) {
					$("#downloadExcel").click(function() {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.setExcelData();								
					});
				}
				
				$("#downloadExcelTally").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.setExcelForTally();
				});
			});
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').hide();
				$('#bottom-border-boxshadow').hide();

				$("#bookedLRsDiv").hide();
				$("#bookedSummaryDiv").hide();
				return;
			}

			let isFromBookingSummaryReport	= response.isFromBookingSummaryReport;
			let region						= response.region;
			let subRegion					= response.subRegion;
			let branchModel					= response.branchModel;

			$("#bookedLRsDiv").empty();
			$("#bookedSummaryDiv").empty();
			
			if(typeof isFromBookingSummaryReport !== 'undefined' && isFromBookingSummaryReport && typeof region !== 'undefined' && region != null && typeof subRegion !== 'undefined' && subRegion != null
					&& typeof branchModel !== 'undefined' && branchModel != null) {
				
				$("#regionEle").val(region.regionName);
				$('#regionEle_primary_key').val(region.regionId);
				
				$('#subRegionEle').val(subRegion.subRegionName);
				$('#subRegionEle_primary_key').val(subRegion.subRegionId);
				
				$('#branchEle').val(branchModel.branchName);
				$('#branchEle_primary_key').val(branchModel.branchId);
			}

			if(response.BookedBookingRegister != undefined && response.BookedBookingRegister.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').show();
				$("#bookedLRsDiv").show();
				hideAllMessages();
				
				let bookingChargesNameHM	= response.chargesNameHM;
				let multiGroupDtosHM		= response.BookedBookingRegister.multiGroupDtosHM;
				
				if(bookingChargesNameHM != undefined) {
					for(const element of response.BookedBookingRegister.CorporateAccount) {
						let obj			= element;
						let chargesMap	= obj.chargesCollection;
						
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
							
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
						}
					}
				}

				gridObject = slickGridWrapper2.setGrid(response.BookedBookingRegister);

				if(multiGroupDtosHM == undefined)
					_this.cancelLRColour(gridObject);
					
				//slickGridWrapper2.updateRowColor(gridObject, 'isTceBooking', true, 'highlight-row-lightBlue');
			} else {
				$('#middle-border-boxshadow').hide();
				$("#bookedLRsDiv").hide();
			}

			if(response.AutoManaulSummary != undefined) {
				$('#bottom-border-boxshadow').show();
				$("#bookedSummaryDiv").show();
				hideAllMessages();
				
				let totalCharges = {};
			
				for (let k in response.chargesNameHM) {
					totalCharges[k] = 0;
				}
			
				let table = $('<table class="table table-bordered" />'); 
				let totalPaid		= 0;
				let totalTopay		= 0;
				let totalTBB		= 0;
				let totalFreight	= 0;
				let totalGST		= 0;
				let grandTotal		= 0;

				let trHead 	=  $('<tr class="danger"/>'); 

				trHead.append('<th>Type</th>');
				trHead.append('<th>Paid</th>');
				trHead.append('<th>To Pay</th>');
				trHead.append('<th>Billing</th>');
				
				if(bookingRegisterConfiguration.showChargesInSummary) {
					for(let k in response.chargesNameHM) {
						trHead.append('<th>' + response.chargesNameHM[k] + '</th>')
					}
				}

				trHead.append('<th>Total Amount</th>');
				trHead.append('<th>GST</th>');
				trHead.append('<th>Grand Total</th>');
				table.append(trHead);
	
				for (let i = 0; i < response.AutoManaulSummary.length; i++) {
					const obj = response.AutoManaulSummary[i];
					let trBody = $('<tr/>');
					trBody.append('<td>' + obj.wayBillType + '</td>');
					trBody.append('<td>' + obj.paid + '</td>');
					trBody.append('<td>' + obj.topay + '</td>');
					trBody.append('<td>' + obj.tbb + '</td>');
				
					if(bookingRegisterConfiguration.showChargesInSummary) {
						let chargesMap = response.autoManualChargeSummHM[i + 1]; 
			
						for (let k in response.chargesNameHM) {
							let charge = chargesMap[k] || 0; 
							trBody.append('<td>' + charge + '</td>');
							totalCharges[k] += charge;
						}
					}
		
					trBody.append('<td>' + obj.totalFreight + '</td>');
					trBody.append('<td>' + obj.totalGST + '</td>');
					trBody.append('<td>' + obj.grandTotal + '</td>');
					table.append(trBody);
				
					totalPaid 		+= obj.paid;
					totalTopay 		+= obj.topay;
					totalTBB 		+= obj.tbb;
					totalFreight 	+= obj.totalFreight;
					totalGST 		+= obj.totalGST;
					grandTotal 		+= obj.grandTotal;
				}
		
				let trFoot 	=  $('<tr class="danger"/>');

				trFoot.append('<th>Total</th>');
				trFoot.append('<th>' + toFixedWhenDecimal(totalPaid) + '</th>');
				trFoot.append('<th>' + toFixedWhenDecimal(totalTopay) + '</th>');
				trFoot.append('<th>' + toFixedWhenDecimal(totalTBB) + '</th>');
		
				if(bookingRegisterConfiguration.showChargesInSummary) {
					for(let k in response.chargesNameHM) {
						trFoot.append('<th>' + totalCharges[k] + '</th>');
					}
				}
				
				trFoot.append('<th>' + toFixedWhenDecimal(totalFreight) + '</th>');
				trFoot.append('<th>' + toFixedWhenDecimal(totalGST) + '</th>');
				trFoot.append('<th>' + toFixedWhenDecimal(grandTotal) + '</th>');
				table.append(trFoot);
				$('#bookedSummaryDiv').append(table);
			} else {
				$('#bottom-border-boxshadow').hide();
				$("#bookedSummaryDiv").hide();
				$("#summary").hide();
			}

			hideLayer();
		}, setExcelData : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			jsonObject["selectTypeId"] 				= $('#selectTypeEle_primary_key').val();
			jsonObject["isExcel"] 					= true;
			jsonObject["isCSV"] 					= isCSV;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingRegisterReportWS/getBookingRegisterReportDetails.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
		},onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			
			jsonObject["showOnlyHamaliLrs"]				= showOnlyHamaliLrs;
			
			if(isBookingRegisterrport != null && isBookingRegisterrport == 'true') {
				if(fromDate != null)
					jsonObject["fromDate"] 		= fromDate; 
				
				if(toDate != null)
					jsonObject["toDate"] 		= toDate; 
				
				jsonObject["regionId"] 						= regionId;
				jsonObject["subRegionId"] 					= subRegionId;
				jsonObject["sourceBranchId"] 				= sourceBranchId;
				jsonObject["paymentTypeId"] 				= paymentType;
				jsonObject["selectTypeId"] 					= $('#selectTypeEle_primary_key').val();
				jsonObject["billSelectionId"] 				= $('#billSelectionEle').val();
			} else {
				if($("#dateEle").attr('data-startdate') != undefined)
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

				if($("#dateEle").attr('data-enddate') != undefined)
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate');

				jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
				jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
				jsonObject["sourceBranchId"] 	= $('#branchEle_primary_key').val();
				jsonObject["selectTypeId"] 		= $('#selectTypeEle_primary_key').val();
				jsonObject["billSelectionId"] 	= $('#billSelectionEle').val();
				jsonObject["selectUserTypeId"]  = $('#selectUserTypeEle_primary_key').val();
				
				if($('#executiveEle_primary_key').val() > 0)
					jsonObject["selectedExecutiveId"]= $('#executiveEle_primary_key').val();
			}
			
			jsonObject["isExcel"] 						= false;
			jsonObject["lrCheckbox"]					= $('#lrCheckbox').is(':checked');
			jsonObject["divisionId"]					= $('#divisionEle_primary_key').val();
				
			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingRegisterReportWS/getBookingRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setExcelForTally : function() {
			showLayer();
			let jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
			jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
			jsonObject["selectTypeId"] 				= $('#selectTypeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingRegisterReportWS/getBookingDeliveryDataForTally.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
		},onSubmitFromBookingSummary : function() {
			showLayer();
			let jsonObject = new Object();

			if(fromDate != null)
				jsonObject["fromDate"] 		= fromDate; 
			
			if(toDate != null)
				jsonObject["toDate"] 		= toDate; 

			jsonObject["regionId"] 						= regionId;
			jsonObject["subRegionId"] 					= subRegionId;
			jsonObject["sourceBranchId"] 				= sourceBranchId;
			jsonObject["paymentTypeId"] 				= paymentType;

			jsonObject["isExcel"] 						= false;
			jsonObject["isFromBookingSummaryReport"]	= isFromBookingSummaryReport;

			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingRegisterReportWS/getBookingRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);

		}, setSelectType : function(){
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#selectTypeEle").getInstance();
			
			let SelectTYPE = [
				{ "selectTypeId":1, "selectTypeName": "INCOMING" },
				{ "selectTypeId":2, "selectTypeName": "OUTGOING" },
			]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}, cancelLRColour : function(gridObject){
			slickGridWrapper2.updateRowColor(gridObject, 'billStatus', 5, 'highlight-row-onchange');
		}, responseForExcel : function(data) {
			let errorMessage = data.message;
			
			if(errorMessage.messageId == 21 || errorMessage.messageId == 491) {
				hideLayer();
				return false;
			}
			
			hideLayer();
				
			generateFileToDownload(data);
		}, setSelectUserType : function(){
			_this.setSelectUserTypeAutocompleteInstance();
			
    		let autoSelectUserType = $("#selectUserTypeEle");

			
			let SelectUserTYPE = [
				{ "selectUserTypeId":1, "selectUserTypeName": "IVCargo" },
				{ "selectUserTypeId":2, "selectUserTypeName": "TranCE" }
			    //{ "selectUserTypeId":0, "selectUserTypeName": "BOTH" },
			]

			//autoSelectUserType.val("BOTH");

			autoSelectUserType.getInstance().each(function() {
				this.option.source = SelectUserTYPE;
			})
		},setSelectUserTypeAutocompleteInstance : function() {
			let autoSelectUserTypeName 			= new Object();
			autoSelectUserTypeName.primary_key 	= 'selectUserTypeId';
			autoSelectUserTypeName.field 		= 'selectUserTypeName';

			$("#selectUserTypeEle").autocompleteCustom(autoSelectUserTypeName)
		}
	});
});

function setJsonData(jsonObject){
	if($("#dateEle").attr('data-startdate') != undefined)
		jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
	if($("#dateEle").attr('data-enddate') != undefined)
		jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
	jsonObject["regionId"] 					= $('#regionEle_primary_key').val();
	jsonObject["subRegionId"] 				= $('#subRegionEle_primary_key').val();
	jsonObject["sourceBranchId"] 			= $('#branchEle_primary_key').val();
	jsonObject["selectTypeId"] 				= $('#selectTypeEle_primary_key').val();
	jsonObject["isExcel"] 					= true;
	jsonObject.filter						= 2;
}

function ValidateFormElement(type){
	if(type == 1 && !validateSelectedDate()){
		showMessage('error',"You can not find report for more than "+$('#maxDaysToFindReport').val()+" days , Please use request option !");
		return false;
	}
	return true;
}
