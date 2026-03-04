define([  
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/generateconsolidateewaybill/consolidatedewaybill.js'
	,'JsonUtility'
	,'messageUtility'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/module/generateconsolidateewaybill/generateconsolidateewaybill.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	],function(slickGridWrapper3, Selection, consolidatedEwayBill) {
	'use strict';
	var jsonObject = new Object(),myNod,_this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/ddmRegisterReportWS/getDdmRegisterReportElementConfiguration.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response){
			var loadelement 				= new Array();
			var baseHtml 				    = new $.Deferred();

			var isShowVehicleNumberWiseData	= false;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/ddmRegisterReport/ddmRegisterReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						
					isShowVehicleNumberWiseData	= response['vehicle'];
				}
			
				var elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');
				
				if(isShowVehicleNumberWiseData) {
					response.vehicleSelection			= true;
					elementConfiguration.vehicleElement		= $('#vehicleNumberEle');
				}

				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				response.isCalenderSelection			= true;
				
				var statusAutoComplete = new Object();
				statusAutoComplete.primary_key 	= 'deliveryRunSheetLedgerStatus';
				statusAutoComplete.field 		= 'deliveryRunSheetLedgerStatusName';
				$("#statusEle").autocompleteCustom(statusAutoComplete);
				
				var autoStatusName = $("#statusEle").getInstance();
				
				$(autoStatusName).each(function() {
					this.option.source = response.statusArr;
				});
				
				var lorryHireStatusAutoComplete = new Object();
				lorryHireStatusAutoComplete.primary_key = 'deliveryRunSheetLedgerStatus';
				lorryHireStatusAutoComplete.field 		= 'deliveryRunSheetLedgerStatusName';
				$("#lorryHireStatusEle").autocompleteCustom(lorryHireStatusAutoComplete);
				
				var autoStatusName = $("#lorryHireStatusEle").getInstance();
				
				$(autoStatusName).each(function() {
					this.option.source = response.lorryHirestatusArr;
				});
				
				Selection.setSelectionToGetData(response);

				hideLayer();
				
				myNod	= Selection.setNodElementForValidation(response);

				if($('#statusEle').is(":visible"))
					addAutocompleteElementInNode1(myNod, 'statusEle', 'Select Proper Status !');
					
				if(response.billSelectionList != undefined)
					addAutocompleteElementInNode1(myNod, 'billSelectionEle', 'Select Proper Bill Selection !');
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
				
				$("#btnGCR").click(function() {
					consolidatedEwayBill.generateConsolidatedEwaybill(response);
				});
			
			if(response.vehicleWiseMultipleDDMPrint)
				$("#multipleDDMPrint").removeClass("hide");
			
				$("#multipleDDMPrint").click(function() {
					var deliveryRunSheetLedgerIds = [];
					var selectionMsg = ' Please, Select Atleast 1 DDM for Print !';
					var selectedDDMDetails = slickGridWrapper3.getValueForSelectedData({ InnerSlickId: 'editReportDivInner' }, selectionMsg);
					if (typeof selectedDDMDetails == 'undefined')
						return;

					var selectedDDMDetailsLength = selectedDDMDetails.length;
					
					if(selectedDDMDetailsLength > response.noOfSelectDDMForDDMPrint){
						showMessage("error", "Select Only "+ response.noOfSelectDDMForDDMPrint+" DDMS !");
								return;
					}
					

					if (selectedDDMDetailsLength > 0) {
						for (var i = 0; i < selectedDDMDetailsLength; i++) {
							if (selectedDDMDetails[0].vehicleNumber != selectedDDMDetails[i].vehicleNumber) {
								showMessage("error", "Select Same Vehicle Number DDMS !");
								return;
							}

							if (selectedDDMDetails[i].deliveryRunSheetLedgerId != undefined)
								deliveryRunSheetLedgerIds.push(selectedDDMDetails[i].deliveryRunSheetLedgerId);
						}
					window.open('prints.do?pageId=340&eventId=10&modulename=ddmPrint&&deliveryRunSheetLedgerIds='+deliveryRunSheetLedgerIds.join(','));

					}
				});
			
			});	
		}, setReportData : function(response) {
			hideLayer();
			$("#ddmRegisterReportDiv").empty();
			$("#SummaryDiv").empty();

			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			response.Language				= {"partialheader" : "Print DDM"};

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#middle-border-boxshadow').removeClass('hide');
				
				var tableProperties	= response.tableProperties;
				
				slickGridWrapper3.applyGrid({
						ColumnHead					: _.values(response.columnConfiguration), // *compulsory // for table headers
						ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
						Language					: response.Language, 			// *compulsory for table's header row language
						tableProperties				: response.tableProperties,
						SerialNo:[{						// optional field // for showing Row number
							showSerialNo	: tableProperties.showSerialNumber,
							SearchFilter	: false,	// for search filter on serial no
							ListFilter		: false,	// for list filter on serial no
							title			: "Sr No."
						}],
						NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					});
			}
			
			_this.getSummaryData(response);
									
			hideLayer();
		}, onSubmit : function() {
			showLayer();
			
			var jsonObject = Selection.getElementData();
			
			jsonObject["ddmStatusId"] 						= $('#statusEle_primary_key').val();
			jsonObject["lorryHireAmountSettlementStatusId"] = $('#lorryHireStatusEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/ddmRegisterReportWS/getDdmRegisterReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, getSummaryData : function(response) {
			var ddmRegisterSummaryModel	= response.ddmRegisterSummaryModel;
			
			var table = $('<table class="table table-bordered" />'); 
			
			var headerColumnArray		= [];
			
			headerColumnArray.push("<th></th>");
			headerColumnArray.push("<th>Settled</th>");
			headerColumnArray.push("<th>Pending</th>");
			headerColumnArray.push("<th>Total</th>");
			
			var tr 	=  $('<tr class="danger"/>'); 
			$(tr).append(headerColumnArray.join(' '));
			table.append(tr);
			
			headerColumnArray		= [];
			
			headerColumnArray.push("<td style='font-weight:bold'>No. of LRs</td>");
			headerColumnArray.push("<td>" + ddmRegisterSummaryModel.settledLRs + "</td>");
			headerColumnArray.push("<td>" + ddmRegisterSummaryModel.pendingLRs + "</td>");
			headerColumnArray.push("<td>" + (ddmRegisterSummaryModel.settledLRs + ddmRegisterSummaryModel.pendingLRs) + "</td>");
			
			var tr 	=  $('<tr/>'); 
			$(tr).append(headerColumnArray.join(' '));
			table.append(tr);
		
			var footerColumnArray		= [];
				
			footerColumnArray.push("<td style='font-weight:bold'>Amount</td>");
			footerColumnArray.push("<td>" + ddmRegisterSummaryModel.settledAmount + "</td>");
			footerColumnArray.push("<td>" + ddmRegisterSummaryModel.pendingAmount + "</td>");
			footerColumnArray.push("<td>" + (ddmRegisterSummaryModel.settledAmount + ddmRegisterSummaryModel.pendingAmount) + "</td>");
			
			var tr 	=  $('<tr/>'); 
			$(tr).append(footerColumnArray.join(' '));
			table.append(tr);
			
			$('#SummaryDiv').append(table);
		}
	});
});

function getddmSettlement(grid, dataView, row) {
	if(dataView.getItem(row).ddmNumber != null) {
		window.open('DoorDeliveryMemo.do?pageId=305&eventId=1&ddmNumber='+ dataView.getItem(row).ddmNumber+'&Branch="'+dataView.getItem(row).sourceBranchName+'"&branchId='+dataView.getItem(row).sourceBranchId);
	}
}