let manualTripHisabSettlement=false,manualTripHisabNumber=false,manualTripHisabDate=false,backDateAllowedForManualTripHisab;
define(
		[
			'slickGridWrapper3',
			'moment',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			 PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'],
			function(SlickGridWrapper3, moment) {
			'use strict';
			let jsonObject = new Object(), tripHisabConfiguration, myNod, tollExpenseNod, miscExpenseNod, miscIncomeNod, dieselPerLitreNod, driverAllowanceNod, kmReadingNod, _this = '', 
				executive, vehicleNumberMaster, dr = 0, doneTheStuff = false, isAllowFuelDetailsByDriver = false, finalDieselUsed = 0, finalDieselAmount = 0 , driverFuelArray, j = 0, l = 0, m = 0, totalMiscAmount = 0, totalMiscIncomeAmount = 0, totalTollAmount = 0, deliveryRunSheetLedgerIds = [], dispatchLedgerIds = [], doorPickUpLedgerIds = [], selectedLSDetails = null, actualDieselAmount=0, totalDieselAmount=0;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/tripHisabSettlementWS/loadTripHisabSettlement.do?', _this.renderTripHisabSettlement, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderTripHisabSettlement : function(response) {
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/tripHisab/tripHisabSettlement.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						tripHisabConfiguration		= response;
						isAllowFuelDetailsByDriver 			= tripHisabConfiguration.isAllowFuelDetailsByDriver;
						manualTripHisabSettlement			= tripHisabConfiguration.manualTripHisabSettlement;
						manualTripHisabNumber				= tripHisabConfiguration.manualTripHisabNumber;
						manualTripHisabDate					= tripHisabConfiguration.manualTripHisabDate;
						backDateAllowedForManualTripHisab	= tripHisabConfiguration.backDateAllowedForManualTripHisab;
						
						if(!tripHisabConfiguration.calculationOnDieselRequired) {
							$("*[data-selector='dieselPerLitre']").addClass('hide');
							$("*[data-selector='kmReading']").addClass('hide');
						}

						let autoVehicleNumber 			= new Object();
						
						autoVehicleNumber.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?isOwnVehicleNumber=' + (tripHisabConfiguration.vehicleOwnerTypeIds == "1");//own vehicle
						autoVehicleNumber.primary_key 	= 'vehicleNumberMasterId';
						autoVehicleNumber.field 		= 'vehicleNumber';
						autoVehicleNumber.callBack 		= _this.getVehicleDataOnVehicleSelect;
						$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);
						
						executive					= response.executive;

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						addAutocompleteElementInNode1(myNod, 'vehicleNumber', 'Select Vehicle Number !')

						hideLayer();

						$("#findBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onFind();
						});
					});
				}, getVehicleDataOnVehicleSelect : function() {
					let jsonObject = new Object();
					jsonObject.vehicleNumberMasterId = $("#" + $(this).attr("id") + "_primary_key").val();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/tripHisabSettlementWS/getOwnVehicleNumberDetailsForTripHisab.do', _this.getVehicleNumberData, EXECUTE_WITHOUT_ERROR);
				}, getVehicleNumberData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						return;
					}
					
					$("#findBtn").removeClass('disabled');
					
					vehicleNumberMaster		= response.vehicleNumberMaster;
					
					$('#vehicleDetailsDiv').html('<b>Truck Type/Capacity : </b>' + vehicleNumberMaster.vehicleTypeName + '(' + vehicleNumberMaster.vehicleTypeCapacity + ')');
				}, getDriverDataOnDriverSelect : function(response) {
					 let jsonValue 	= $('#' + $(this).attr('id')).attr('sub_info');
					 let obj 		= eval( '(' + jsonValue + ')' );

					 $('#driverDetailsDiv').html('<b>Mobile No. </b>' + obj.mobileNumber + ', <b>License No.</b> ' + obj.licenceNumber);
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject["vehicleNumberMasterId"] 		= $('#vehicleNumber_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/tripHisabSettlementWS/getLSDetailsOnVehicleNumber.do', _this.setLSDetailsData, EXECUTE_WITH_ERROR);
				}, setLSDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);

						$('#left-border-boxshadow').addClass('hide');
						$('#middle-border-boxshadow').addClass('hide');
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					let loadelement = [];
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#driverSelection").load("/ivcargo/html/module/tripHisab/driverSelection.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						if(response.CorporateAccount != undefined) {
							hideAllMessages();
							$('#left-border-boxshadow').removeClass('hide');
							$('#middle-border-boxshadow').removeClass('hide');
							
							let autoDriverName 				= new Object();
							autoDriverName.url 				= WEB_SERVICE_URL+'/autoCompleteWS/getDriverAutocomplete.do';
							autoDriverName.primary_key 		= 'driverMasterId';
							autoDriverName.field 			= 'driverName';
							autoDriverName.callBack 		= _this.getDriverDataOnDriverSelect;
							autoDriverName.show_field 		= 'driverName, mobileNumber, licenceNumber';
							autoDriverName.sub_info 		= true;
							autoDriverName.sub_as			= {mobileNumber : 'Driver Number', licenceNumber : 'License Number'};
							$("#driverNameEle").autocompleteCustom(autoDriverName);

							SlickGridWrapper3.applyGrid(
									{
										ColumnHead					: _.values(response.columnConfiguration), // *compulsory // for table headers
										ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
										Language					: {}, 			// *compulsory for table's header row language
										ShowPrintButton				: false,
										ShowCheckBox				: true,
										removeSelectAllCheckBox		: 'false',
										fullTableHeight				: true,
										rowHeight 					: 	30,
										DivId						: 'lsDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
										SerialNo:[{						// optional field // for showing Row number
											showSerialNo	: false,
											searchFilter	: false,          // for search filter on serial no
											ListFilter		: false				// for list filter on serial no
										}],
										InnerSlickId				: 'editReportDivInner', // Div Id
										InnerSlickHeight			: '250px',
										NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
									});
							
							let pendingTripHisabSettlementSummary	= response.pendingTripHisabSettlementSummary;
							
							let	totalDieselByOffice					= pendingTripHisabSettlementSummary.totalDieselByOffice;
							let	totalDieselByDriver					= pendingTripHisabSettlementSummary.totalDieselByDriver;
							let	totalRawanaAmount					= pendingTripHisabSettlementSummary.totalRawanaAmount;
							
							if(!tripHisabConfiguration.calculationOnDieselRequired)
								$('#vehicleDetailsSummaryDiv').html('<b>Total Rawana : Rs. </b>' + totalRawanaAmount);
							else
								$('#vehicleDetailsSummaryDiv').html('<b>Total Rawana : Rs. </b>' + totalRawanaAmount + ', <b>Total Diesel By Office : </b> ' + totalDieselByOffice + ' ltrs, <b>Total Diesel By Driver : </b> ' + totalDieselByDriver + ' ltrs');
							
							$('#rawanaAmount').val(totalRawanaAmount);
							$('#totalDieselByOffice').val(totalDieselByOffice);
							$('#totalDieselByDriver').val(totalDieselByDriver);
						}
						
						if(tripHisabConfiguration.allowTripHisabSettlementPrint)
						 $('#reprintBtn').addClass('hide')

						hideLayer();
						
						$("#addExpense").click(function() {
							_this.getToAddExpense();
						});
					});
				}, getToAddExpense : function() {
				if($("#driverNameEle_primary_key").val() == '') {
						changeTextFieldColor('driverNameEle', '', '', 'red');
						showMessage('error', '<i class="fa fa-times-circle"></i> Select Driver Name !');
						return;
					}
					
					changeTextFieldColorWithoutFocus('driverNameEle', '', '', 'green');
					
					let selectionMsg = '';
					
					if(tripHisabConfiguration.SingleLSSettlementAllow)
						selectionMsg	= ' Please, Select LS for Settlement !';
					else
						selectionMsg	= ' Please, Select atleast 2 LS for Settlement !';
					
					selectedLSDetails = SlickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
					
					if(typeof selectedLSDetails == 'undefined')
						return;
					
					if(executive.branchId != selectedLSDetails[0].sourceBranchId && !tripHisabConfiguration.allowTripHisabSettlementToOtherBranch) {
						showMessage('info', '<i class="fa fa-times-circle"></i> Only Started By Trip Branch can Settle Trip Hisab !');
						return;
					}
					
					let selectedLSDetailsLength	= selectedLSDetails.length;
					
					if(!tripHisabConfiguration.SingleLSSettlementAllow && selectedLSDetailsLength < 2) {
						showMessage('info', '<i class="fa fa-times-circle"></i> Atleast 2 LS required for Trip Hisab Setlement !');
						return;
					}
					
					if (tripHisabConfiguration.doubleLSSettlementAllow && selectedLSDetailsLength > 2) {
						showMessage('info', '<i class="fa fa-times-circle"></i> Exactly 2 LS required for Trip Hisab Settlement!');
						return;
					}

					if(tripHisabConfiguration.autoCalculateDieselRate) {
						for(let s = 0; s < selectedLSDetailsLength; s++) {
							totalDieselAmount += selectedLSDetails[s].dieselAmount;
						}
					}
					
					getJSON(null, WEB_SERVICE_URL + '/tripHisabSettlementWS/getDetailsToAddExpense.do', _this.getDetailsToAddExpense, EXECUTE_WITH_ERROR);
					showLayer();
				}, getDetailsToAddExpense : function(response) {
					$("#bottom-border-boxshadow").removeClass('hide');
					goToPosition('bottom-border-boxshadow', 'slow');
					let loadelement			= new Array();
					let driveAllowanceHtml	= new $.Deferred();
					let tollExpenseHtml 	= new $.Deferred();
					let miscExpenseHtml		= new $.Deferred();
					
					if(tripHisabConfiguration.AddMiscIncome)
						var miscIncomeHtml	= new $.Deferred();
					
					if(tripHisabConfiguration.calculationOnDieselRequired) {
						var dieselPerLitreHtml	= new $.Deferred();
						var kmReadingHtml		= new $.Deferred();
					}
					
					let totalHtml			= new $.Deferred();
					
					loadelement.push(driveAllowanceHtml);
					loadelement.push(tollExpenseHtml);
					loadelement.push(miscExpenseHtml);
					
					if(tripHisabConfiguration.AddMiscIncome)
						loadelement.push(miscIncomeHtml);
					
					if(tripHisabConfiguration.calculationOnDieselRequired) {
						if(!tripHisabConfiguration.hideDieselPerLitre)
							loadelement.push(dieselPerLitreHtml);

						loadelement.push(kmReadingHtml);
					}
					
					loadelement.push(totalHtml);

					$("#driverAllowanceTab").load("/ivcargo/html/module/tripHisab/driveAllowance.html", function() {
						driveAllowanceHtml.resolve();
					});
					
					$("#tollExpenseTab").load("/ivcargo/html/module/tripHisab/tollExpense.html", function() {
						tollExpenseHtml.resolve();
					});
					
					$("#miscExpenseTab").load("/ivcargo/html/module/tripHisab/miscExpense.html", function() {
						miscExpenseHtml.resolve();
					});
					
					if(tripHisabConfiguration.AddMiscIncome) {
						$("#miscIncomeTab").load("/ivcargo/html/module/tripHisab/miscIncome.html", function() {
							miscIncomeHtml.resolve();
						});
					}
					
					if(tripHisabConfiguration.calculationOnDieselRequired) {
						if(!tripHisabConfiguration.hideDieselPerLitre) {
							$("#dieselPerLitreTab").load("/ivcargo/html/module/tripHisab/dieselPerLitre.html", function() {
								dieselPerLitreHtml.resolve();
							});
						}

						$("#kmReadingTab").load("/ivcargo/html/module/tripHisab/kmReading.html", function() {
							kmReadingHtml.resolve();
						});
					}
					
					$("#totalTab").load("/ivcargo/html/module/tripHisab/totalSummary.html", function() {
						totalHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						if(tripHisabConfiguration.calculationOnDieselRequired) {
							if(!tripHisabConfiguration.hideDieselPerLitre)
								$('.dieselPerLitreAmt').removeClass('hide');
							
							$('.totalDriverDieselAmt').removeClass('hide');
							$('#totalSummaryKMTable').removeClass('hide');
						}
						
						if(tripHisabConfiguration.AddMiscIncome) {
							$("*[data-selector='miscIncome']").removeClass('hide');
							$('#miscIncomeCol').removeClass('hide');
						}
						
						if(tripHisabConfiguration.hideDieselPerLitre)
							$("*[data-selector='dieselPerLitre']").addClass('hide');
						
						if(tripHisabConfiguration.manualTripHisabSettlement) {
							$('#manualTripHisab').removeClass('hide');
							
							if(manualTripHisabDate) {
								let dateOption	= new Object();
								dateOption.minDate	= moment().subtract(backDateAllowedForManualTripHisab, 'day').startOf('day');
								$("#manualDateEle").SingleDatePickerCus(dateOption);
							}
						}
						
						let tollNameAutoComplete 			= new Object();
						tollNameAutoComplete.primary_key 	= 'tollTypeMasterId';
						tollNameAutoComplete.url 			= response.tollMasterList;
						tollNameAutoComplete.field 			= 'name';
						$("#tollName").autocompleteCustom(tollNameAutoComplete);
						
						let miscNameAutoComplete 			= new Object();
						miscNameAutoComplete.primary_key 	= 'miscTypeMasterId';
						miscNameAutoComplete.url 			= response.miscTypeExpenseMasterList;
						miscNameAutoComplete.field 			= 'name';
						$("#miscName").autocompleteCustom(miscNameAutoComplete);
						
						let miscIncomeNameAutoComplete 			= new Object();
						miscIncomeNameAutoComplete.primary_key 	= 'miscTypeMasterId';
						miscIncomeNameAutoComplete.url 			= response.miscTypeExpenseMasterList;
						miscIncomeNameAutoComplete.field 		= 'name';
						$("#miscIncomeName").autocompleteCustom(miscIncomeNameAutoComplete);
						
						$('#totalRawanaExpense').html($('#rawanaAmount').val());

						if(typeof selectedLSDetails !== 'undefined') {
							let totalDieselByOffice		= 0;
							let totalDieselByDriver		= 0;
							let totalRawanaExpense		= 0;
							dispatchLedgerIds			= [];
							deliveryRunSheetLedgerIds	= [];
							doorPickUpLedgerIds			= [];
							
							let selectedLSDetailsLength	= selectedLSDetails.length;
							
							for(let i = 0; i < selectedLSDetailsLength; i++) {
								if(selectedLSDetails[i].dieselLiterBy == DEISEL_LITER_BY_BRANCH_ID)
									totalDieselByOffice += selectedLSDetails[i].dieselLiter;
								else
									totalDieselByDriver += selectedLSDetails[i].dieselLiter;
								
								totalRawanaExpense	+= selectedLSDetails[i].totalRawanaAmount;
								
								if(selectedLSDetails[i].typeId == 1)
									dispatchLedgerIds.push(selectedLSDetails[i].dispatchLedgerId);
								else if(selectedLSDetails[i].typeId == 2)
									deliveryRunSheetLedgerIds.push(selectedLSDetails[i].dispatchLedgerId);
								else
									doorPickUpLedgerIds.push(selectedLSDetails[i].dispatchLedgerId);
							}

							$('#totalDieselByOffice').val(totalDieselByOffice);
							$('#totalDieselByDriver').val(totalDieselByDriver);
							$('#totalRawanaExpense').html(totalRawanaExpense);
							$('#startKMReading').html(selectedLSDetails[0].kilometerReading);
						}
						
						tollExpenseNod = nod();
						tollExpenseNod.configure({
							parentClass		: 'validation-message'
						});
						
						addAutocompleteElementInNode(tollExpenseNod, 'tollName', 'Select Toll Name !');
						addElementToCheckEmptyInNode(tollExpenseNod, 'tollAmount', 'Cannot be left blank');
						addElementToCheckNumericInNode(tollExpenseNod, 'tollAmount', 'Should be numeric');
						
						miscExpenseNod = nod();
						miscExpenseNod.configure({
							parentClass		: 'validation-message'
						});
						
						addAutocompleteElementInNode(miscExpenseNod, 'miscName', 'Select Misc. Expense !');
						addElementToCheckEmptyInNode(miscExpenseNod, 'totMiscAmount', 'Cannot be left blank');
						addElementToCheckNumericInNode(miscExpenseNod, 'totMiscAmount', 'Should be numeric');
						
						if(tripHisabConfiguration.AddMiscIncome) {
							miscIncomeNod = nod();
							miscIncomeNod.configure({
								parentClass		: 'validation-message'
							});
							
							addAutocompleteElementInNode(miscIncomeNod, 'miscIncomeName', 'Select Misc. Income !');
							addElementToCheckEmptyInNode(miscIncomeNod, 'totMiscIncomeAmount', 'Cannot be left blank');
							addElementToCheckNumericInNode(miscIncomeNod, 'totMiscIncomeAmount', 'Should be numeric');
						}
						
						dieselPerLitreNod	= nod();
						dieselPerLitreNod.configure({
							parentClass		: 'validation-message'
						});
						
						addElementToCheckEmptyInNode(dieselPerLitreNod, 'dieselPerLitre', 'Cannot be left blank');
						addElementToCheckFloatInNode(dieselPerLitreNod, 'dieselPerLitre', 'Should be float');
						
						driverAllowanceNod	= nod();
						driverAllowanceNod.configure({
							parentClass		: 'validation-message'
						});
						
						addElementToCheckEmptyInNode(driverAllowanceNod, 'driverAllowance', 'Cannot be left blank');
						addElementToCheckNumericInNode(driverAllowanceNod, 'driverAllowance', 'Should be numeric');
						
						kmReadingNod		= nod();
						kmReadingNod.configure({
							parentClass		: 'validation-message'
						});
						
						addElementToCheckEmptyInNode(kmReadingNod, 'endKMReading', 'Cannot be left blank');
						addElementToCheckNumericInNode(kmReadingNod, 'endKMReading', 'Should be numeric');
						
						$("#addNewDriverAllowance").click(function() {
							driverAllowanceNod.performCheck();

							if(driverAllowanceNod.areAll('valid'))
								_this.addDriverAllowanceTable();
						});
						
						$("#addToll").click(function() {
							tollExpenseNod.performCheck();

							if(tollExpenseNod.areAll('valid'))
								_this.addTollExpenseTable();
						});
						
						$("#addNewMisc").click(function() {
							miscExpenseNod.performCheck();

							if(miscExpenseNod.areAll('valid'))
								_this.addMiscExpenseTable();
						});
						
						$("#addNewMiscIncome").click(function() {
							miscIncomeNod.performCheck();

							if(miscIncomeNod.areAll('valid'))
								_this.addMiscIncomeTable();
						});
						
						$("#addNewDieselPerLitre").click(function() {
							dieselPerLitreNod.performCheck();

							if(dieselPerLitreNod.areAll('valid'))
								_this.addDieselPerLitreTable();
						});
						
						$("#addEndKMReading").click(function() {
							kmReadingNod.performCheck();

							if(kmReadingNod.areAll('valid'))
								_this.addKMReadingTable();
						});
						
						$("#dieselPerLitre,#driverAllowance,#tollAmount,#totMiscAmount,#endKMReading").keydown(function() {
							_this.resetCalculation();
						});
						
						if(tripHisabConfiguration.AddMiscIncome) {
							$("#miscIncomeName").change(function() {
								_this.resetCalculation();
							});
						}
						
						$("#miscName").change(function() {
							_this.resetCalculation();
						});
						
						$("#calculateTripHisab").click(function() {
							if(!tripHisabConfiguration.calculationOnDieselRequired)
								_this.calculateTripDetailsWithoutDiesel();
							else
								_this.calculateTripDetails();
						});
						
						$("#settleTrip").click(function() {
							_this.settleTrip();
						});
						
						hideLayer();
					});
				}, addDriverAllowanceTable : function() {
					$('#driverAllowanceInnerTable').empty();
					
					let row 						= createRowInTable('driverAllowanceRow', '', '');
					
					let driverAllowanceCol 			= createColumnInRow(row, 'driverAllowance_1', '', '250px', '', 'letter-spacing:2px', '');
					let driverAllowanceRemarkCol 	= createColumnInRow(row, 'driverAllowanceRemarkCol', '', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(driverAllowanceCol, $("#driverAllowance").val());
					appendValueInTableCol(driverAllowanceRemarkCol, $('#driverAllowanceRemark').val());
					
					$("#driverAllowanceInnerTable").append(row);
					$('#totalDriverAllowance').html($("#driverAllowance").val());
					
					$("#driverAllowance").val('');
					$('#driverAllowanceRemark').val('');
					$("#driverAllowanceDiv").removeClass('hide');
				}, addTollExpenseTable : function() {
					
					$("#tollExpenseDiv").show();
					$("#totalSummary").show();
					$("#tollExpenseFoot").remove();
					$("#grandTotals").show();
					
					let tollName 			= $("#tollName").val();
					let tollAmount			= $("#tollAmount").val();
					let remark 				= $("#tollRemark").val();
					let tollTypeMasterId 	= $("#tollName_primary_key").val();
					
					if($('#TollTypeMasterId_' + tollTypeMasterId).exists()) {
						$('.TollTypeMasterId_' + tollTypeMasterId).html(tollAmount);
						showMessage('error', '<i class="fa fa-times-circle"></i> Already Added !');
						return false;
					}
					
					let srNo 				= (j + 1);
					totalTollAmount 		= Number(tollAmount) + Number(totalTollAmount);
					
					let row 					= createRowInTable('tollExpense' + j, '', '');
					
					let srNoCol 				= createColumnInRow(row, 'srNo1_' + (j + 1), '', '80px', '', 'letter-spacing:2px', '');
					let tollNameCol 			= createColumnInRow(row, 'tolltype_' + (j + 1), '', '250px', '', 'letter-spacing:2px', '');
					let tollAmountCol 			= createColumnInRow(row, 'TotTollAmount_' + (j + 1), 'TollTypeMasterId_' + tollTypeMasterId, '150px', 'right', 'letter-spacing:2px', '');
					let remarkCol	 			= createColumnInRow(row, 'tollRemark_' + (j + 1), '', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(srNoCol, srNo);
					appendValueInTableCol(srNoCol, '<input type ="hidden" id="TollTypeMasterId_' + (j + 1) + '" value= ' + tollTypeMasterId + ' />');
					appendValueInTableCol(tollNameCol, tollName);
					appendValueInTableCol(tollAmountCol, tollAmount);
					appendValueInTableCol(remarkCol, remark);
					
					$("#allTollExpenses").append(row);
					
					let rowFoot 						= createRowInTable('tollExpenseFoot', '', '');
					
					let srNoFootCol 					= createColumnInRow(rowFoot, 'srNo1Foot_' + (j + 1), '', '80px', '', 'letter-spacing:2px', '');
					let tollNameFootCol 				= createColumnInRow(rowFoot, 'tollNameFoot_' + (j + 1), '', '250px', '', 'letter-spacing:2px', '');
					let tollAmountFootCol	 			= createColumnInRow(rowFoot, 'tollAmountFoot_' + (j + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					let remarkFootCol 					= createColumnInRow(rowFoot, 'remarkFoot_' + (j + 1), '', '', '', 'letter-spacing:2px', '');
						
					appendValueInTableCol(srNoFootCol, '');
					appendValueInTableCol(tollNameFootCol, "<b>Total<b>");
					appendValueInTableCol(tollAmountFootCol, '<b>' + totalTollAmount + '</b>');
					appendValueInTableCol(remarkFootCol, '');
					
					$("#tollExpenseGrandTotal").append(rowFoot);
					
					$("#totalTollExpAll").html(totalTollAmount);
					
					$("#finalTollExpense").html(totalTollAmount);
					$("#TollExpenseTypeID1").val(totalTollAmount);
					j = j + 1;
					
					$("#tollAmount").val('');
					$("#tollRemark").val("");
					$("#tollName").val("")
					$("#tollName_primary_key").val('');
					
				}, addMiscExpenseTable : function() {
					
					$("#miscExpenseFoot").remove();
					$("#miscExpenseDiv").removeClass('hide');
					$("#totalSummary").show();
					$("#grandTotals").show();
					
					let srNo 				= (l + 1);
					let miscName 			= $("#miscName").val();
					let miscAmount			= $("#totMiscAmount").val();
					let remark 				= $("#miscRemark").val();
					let tollTypeMasterId 	= $("#miscName_primary_key").val();
					
					totalMiscAmount 		= Number(miscAmount) + Number(totalMiscAmount);
					let row 				= createRowInTable('MiscExpense' + l, '', '');
					
					let srNoCol 			= createColumnInRow(row, 'srNo2_' + (l + 1), '', '80px', '', 'letter-spacing:2px', '');
					let typeOfExpenseCol 	= createColumnInRow(row, 'typeOfExpense_' + (l + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalMiscAmountCol	= createColumnInRow(row, 'TotMISCAmount_' + (l + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					let remarkAmountCol	 	= createColumnInRow(row, 'remarkAmountCol_' + (l + 1), '', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(srNoCol, srNo);
					appendValueInTableCol(srNoCol, '<input type ="hidden" id="miscTypeMasterId_' + (l + 1) + '" value= ' + tollTypeMasterId + ' />');
					appendValueInTableCol(typeOfExpenseCol, miscName);
					appendValueInTableCol(totalMiscAmountCol, miscAmount);
					appendValueInTableCol(remarkAmountCol, remark);
					
					$("#allMiscExpenses").append(row);
					
					let rowFoot 						= createRowInTable('miscExpenseFoot', '', '');
					
					let srNoFootCol 					= createColumnInRow(rowFoot, 'srNo2Foot_' + (l + 1), '', '80px', '', 'letter-spacing:2px', '');
					let tollnameFootCol	 				= createColumnInRow(rowFoot, 'tollnameFoot_' + (l + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalMiscAmountFootCol 			= createColumnInRow(rowFoot, 'TotMISCAmountFoot_' + (l + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					let remarkFootCol 					= createColumnInRow(rowFoot, 'remarkFootFoot_' + (l + 1), '', '', '', 'letter-spacing:2px', '');
						
					appendValueInTableCol(srNoFootCol, '');
					appendValueInTableCol(tollnameFootCol, "<b>Total</b>");
					appendValueInTableCol(totalMiscAmountFootCol, '<b>' + totalMiscAmount + '</b>');
					appendValueInTableCol(remarkFootCol, '');
					
					$("#miscExpensesGrandTotal").append(rowFoot);
					
					$("#finalMiscExpense").html(totalMiscAmount);
					$("#MiscExpenseID1").val(totalMiscAmount);
					$("#totalMiscExpenseAll").html(totalMiscAmount);
					l = l + 1;
					$("#totMiscAmount").val('');
					$("#miscRemark").val("");
					$("#miscName").val("")
					$("#miscName_primary_key").val('');
				}, addMiscIncomeTable : function() {
					
					$("#miscIncomeFoot").remove();
					$("#miscIncomeDiv").removeClass('hide');
					$("#totalSummary").show();
					$("#grandTotals").show();
					
					let srNo 				= (m + 1);
					let miscName 			= $("#miscIncomeName").val();
					let miscAmount			= $("#totMiscIncomeAmount").val();
					let remark 				= $("#miscIncomeRemark").val();
					let tollTypeMasterId 	= $("#miscIncomeName_primary_key").val();
					
					totalMiscIncomeAmount	= Number(miscAmount) + Number(totalMiscIncomeAmount);
					let row 				= createRowInTable('MiscIncome' + m, '', '');
					
					let srNoCol 			= createColumnInRow(row, 'srNo2_' + (m + 1), '', '80px', '', 'letter-spacing:2px', '');
					let typeOfExpenseCol 	= createColumnInRow(row, 'typeOfIncome_' + (m + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalMiscAmountCol	= createColumnInRow(row, 'TotMISCIncomeAmount_' + (m + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					let remarkAmountCol	 	= createColumnInRow(row, 'incomeRemarkAmountCol_' + (m + 1), '', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(srNoCol, srNo);
					appendValueInTableCol(srNoCol, '<input type ="hidden" id="miscIncomeTypeMasterId_' + (m + 1) + '" value= ' + tollTypeMasterId + ' />');
					appendValueInTableCol(typeOfExpenseCol, miscName);
					appendValueInTableCol(totalMiscAmountCol, miscAmount);
					appendValueInTableCol(remarkAmountCol, remark);
					
					$("#allMiscIncome").append(row);
					
					let rowFoot 						= createRowInTable('miscIncomeFoot', '', '');
					
					let srNoFootCol 					= createColumnInRow(rowFoot, 'srNo2Foot_' + (m + 1), '', '80px', '', 'letter-spacing:2px', '');
					let tollnameFootCol	 				= createColumnInRow(rowFoot, 'tollnameFoot_' + (m + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalMiscAmountFootCol 			= createColumnInRow(rowFoot, 'TotMISCAmountFoot_' + (m + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					let remarkFootCol 					= createColumnInRow(rowFoot, 'remarkFootFoot_' + (m + 1), '', '', '', 'letter-spacing:2px', '');
						
					appendValueInTableCol(srNoFootCol, '');
					appendValueInTableCol(tollnameFootCol, "<b>Total</b>");
					appendValueInTableCol(totalMiscAmountFootCol, '<b>' + totalMiscIncomeAmount + '</b>');
					appendValueInTableCol(remarkFootCol, '');
					
					$("#miscIncomeGrandTotal").append(rowFoot);
					
					$("#finalMiscIncome").html(totalMiscIncomeAmount);
					$("#MiscIncomeID1").val(totalMiscIncomeAmount);
					$("#totalMiscIncomeAll").html(totalMiscIncomeAmount);
					m = m + 1;
					$("#totMiscIncomeAmount").val('');
					$("#miscIncomeRemark").val("");
					$("#miscIncomeName").val("")
					$("#miscIncomeName_primary_key").val('');
				}, addDieselPerLitreTable : function() {
					$('#dieselPerLitreInnerTable').empty();
					
					let row 				= createRowInTable('DieselPerLitre1', '', '');
					
					let dieselPerLitreCol 	= createColumnInRow(row, 'DieselPerLitre1_1', 'datatd', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(dieselPerLitreCol, $("#dieselPerLitre").val());
					
					$("#dieselPerLitreInnerTable").append(row);
					
					let totalDieselByDriver		= Number($('#totalDieselByDriver').val());
					let dieselPerLitre			= $("#dieselPerLitre").val();
					let totalDriverDieselAmt	= totalDieselByDriver * dieselPerLitre;
					
					$("#totalDriverDieselAmt").html('Rs. ' + totalDriverDieselAmt + ' ( ' + totalDieselByDriver + ' ltrs * ' + dieselPerLitre + ' rs )');
					$("#dieselPerLitre").val('');
					$('#dieselPerLitreAmt').html(dieselPerLitre);
					$("#dieselPerLitreDiv").removeClass('hide');
				}, addKMReadingTable : function() {
					$('#endKMReadingInnerTable').empty();
					
					let row 				= createRowInTable('endKMReading1', '', '');
					
					let endKMReadingCol 	= createColumnInRow(row, 'endKMReading1_1', 'datatd', '', '', 'letter-spacing:2px', '');
					
					appendValueInTableCol(endKMReadingCol, $("#endKMReading").val());
					
					$("#endKMReadingInnerTable").append(row);
					
					$('#endKiloMeterReading').html($("#endKMReading").val());
					$('#totalRunningKms').html(Number($("#endKMReading").val()) - Number($('#startKMReading').html()));
					$("#endKMReading").val('');
					$("#kmReadingDiv").removeClass('hide');
				}, resetCalculation : function() {
					refreshAndHidePartOfPage('hisabDetails', 'hide');
					$("#TotalAllExpense").val('');
					$('#settlementRemark').val('');
				}, calculateTripDetails : function() {
					$("#tollAmount").val('');
					$("#totMiscAmount").val('');
					$("#dieselPerLitre").val('');
					$("#endKMReading").val('');
					
					let minimumDieselToUse		= 0;
					let ammountGivenMessage		= '';
					let startKMReading			= Number($('#startKMReading').html());
					let endKMReading			= Number($('#endKiloMeterReading').html());
					let vehicleAverage			= vehicleNumberMaster.vehicleAverage;
					let dieselPerLitre			= $('#dieselPerLitreAmt').html();
					
					if(!tripHisabConfiguration.hideDieselPerLitre){
						if(dieselPerLitre == '' || dieselPerLitre == 0 || typeof dieselPerLitre == 'undefined') {
							showMessage('error', '<i class="fa fa-times-circle"></i> Enter Diesel Rate !');
							return;
						}
					}
					if(isNaN(endKMReading) || endKMReading == '' || endKMReading == 0) {
						showMessage('error', '<i class="fa fa-times-circle"></i> Enter End KM Reading !');
						return;
					}
					
					if(!tripHisabConfiguration.SingleLSSettlementAllow) {
						if(endKMReading <= startKMReading) {
							showMessage('error', '<i class="fa fa-times-circle"></i> Enter End KM Reading should be Greater Than Start KM Reading !');
							return;
						}
					}
					
					$("#hisabDetails").removeClass('hide');
					$("#hisabDetails").show();
					$("#hisabDetailsWithoutDiesel").empty();
					
					if(tripHisabConfiguration.AddMiscIncome) {
						$('#totalMiscIncomeAmtRow').removeClass('hide');
					}
					
					let totalRunningKm			= Number($('#totalRunningKms').html());
					
					if(vehicleNumberMaster.vehicleAverage > 0) {
						minimumDieselToUse		= totalRunningKm / vehicleAverage;
					}
					
					let rawanaAmount				= Number($('#totalRawanaExpense').html());
					let actualDieselFilled			= Number($('#totalDieselByOffice').val()) + Number($('#totalDieselByDriver').val());
					let differenceDiesel			= minimumDieselToUse - actualDieselFilled;
					let differenceDieselAmount		= (differenceDiesel * dieselPerLitre).toFixed(2);
					actualDieselAmount				= (actualDieselFilled * dieselPerLitre).toFixed(2);
					let totalDieselAmtByDriver		= Number($('#totalDieselByDriver').val()) * dieselPerLitre;
					let totalDriverExpense			= (totalDieselAmtByDriver + Number($('#totalDriverAllowance').html()) + Number($('#finalTollExpense').html()) + Number($('#finalMiscExpense').html())).toFixed(2);
					let totalMiscIncome				= (Number($('#finalMiscIncome').html())).toFixed(2);
					let amountGivenToDriver			= 0;
					let amountGivenToOffice			= 0;
					let amountGivenToOfficeOrDriver	= 0;
					let rawanaAndExpenseDiff		= 0;
					
					rawanaAndExpenseDiff = (rawanaAmount - totalDriverExpense);
					
					if(differenceDieselAmount > 0) {
						amountGivenToDriver 		= rawanaAndExpenseDiff - differenceDieselAmount + Number(totalMiscIncome);
						
						if(tripHisabConfiguration.IsRoundOffRequiredForAmount) {
							amountGivenToDriver		= Math.round(amountGivenToDriver);
						} else {
							amountGivenToDriver		= amountGivenToDriver.toFixed(2);
						}
						
						amountGivenToOfficeOrDriver	= amountGivenToDriver;
						
						if(amountGivenToDriver > 0) {
							ammountGivenMessage			= 'Rs. ' +  amountGivenToDriver + ' amount is driver given to office. ';
						} else {
							ammountGivenMessage			= 'Rs. ' +  (-amountGivenToDriver) + ' amount is office given to driver.';
						}
					} else {
						amountGivenToOffice			= rawanaAndExpenseDiff - differenceDieselAmount + Number(totalMiscIncome);
						
						if(tripHisabConfiguration.IsRoundOffRequiredForAmount) {
							amountGivenToOffice		= Math.round(amountGivenToOffice);
						} else {
							amountGivenToOffice		= amountGivenToOffice.toFixed(2);
						}
						
						amountGivenToOfficeOrDriver	= amountGivenToOffice;
						
						if(amountGivenToOffice < 0) {
							ammountGivenMessage			= 'Rs. ' +  -amountGivenToOffice + ' amount is office given to driver.';
						} else {
							ammountGivenMessage			= 'Rs. ' +  amountGivenToOffice + ' amount is driver given to office.';
						}
					}
					
					let balanceDriverExpenseAmt		= (Number(totalDriverExpense) + Number(differenceDieselAmount)).toFixed(2);
					
					if(tripHisabConfiguration.IsRoundOffRequiredForAmount) {
						balanceDriverExpenseAmt		= Math.round(balanceDriverExpenseAmt);
						rawanaAmount				= Math.round(rawanaAmount);
						differenceDieselAmount		= Math.round(differenceDieselAmount);
						totalMiscIncome				= Math.round(totalMiscIncome);
					} else {
						balanceDriverExpenseAmt		= balanceDriverExpenseAmt.toFixed(2);
						rawanaAmount				= rawanaAmount.toFixed(2);
						differenceDieselAmount		= Math.round(differenceDieselAmount);
					}
					
					$("#vehicleExpectedMilageCol").empty();
					$("#minimumDieselToUseCol").empty();
					$("#actualDieselFilledCol").empty();
					$("#differenceDieselCol").empty();
					$("#differenceDieselAmountCol").empty();
					$("#totalDriverExpenseCol").empty();
					$("#differenceDieselAmountCol1").empty();
					$("#balanceDriverExpenseAmtCol").empty();
					$("#totalRawanaCollected").empty();
					$("#balanceDriverExpenseAmtCol1").empty();
					$("#totalMiscIncomeAmtCol").empty();
					
					$('#vehicleExpectedMilageCol').append('<span id="vehicleExpectedMilage">' + vehicleNumberMaster.vehicleAverage + ' km per liter</span>');
					$('#minimumDieselToUseCol').append(totalRunningKm + ' / ' + vehicleAverage + ' = ' + '<span id="minimumDieselToUse">' + minimumDieselToUse.toFixed(2) + '</span> ltrs');
					$('#actualDieselFilledCol').append('<span id="actualDieselFilled">' + actualDieselFilled + '</span> ltrs');
					$('#differenceDieselCol').append(minimumDieselToUse.toFixed(2) + ' - ' + actualDieselFilled + ' = ' + '<span id="differenceDiesel">' + differenceDiesel.toFixed(2) + '</span> ltrs');

					if(isAllowFuelDetailsByDriver){
						driverFuelArray 	= [];
						if(differenceDiesel > 0){
							$('#addDriverFuelDetailsDiv').removeClass('hide');
							dr = 0;
							$("#addDriverDetails").click(function() {
								$("#popUpForDriverFuel").modal({
									backdrop: 'static',
									keyboard: false
								});
								
								_this.addDriverFuelDetailsMethod(differenceDiesel);
							});
						} else {
							$('#addDriverFuelDetailsDiv').addClass('hide');
							$('#differenceDieselAmountCol').append(differenceDiesel.toFixed(2) + ' * ' + dieselPerLitre + ' = ' + 'Rs. <span id="differenceDieselAmount">' + differenceDieselAmount + '</span>');
						}
						
					} else {
						$('#differenceDieselAmountCol').append(differenceDiesel.toFixed(2) + ' * ' + dieselPerLitre + ' = ' + 'Rs. <span id="differenceDieselAmount">' + differenceDieselAmount + '</span>');
					}
					$('#totalDriverExpenseCol').append('Rs. <span id="totalDriverExpense">' + totalDriverExpense + '</span>');
					
					if(differenceDieselAmount > 0) {
						$('#differenceDieselAmountCol1').append('Rs. ' + differenceDieselAmount + ' ( + )');
					} else {
						$('#differenceDieselAmountCol1').append('Rs. ' + differenceDieselAmount + ' ( - )');
					}
					
					$('#balanceDriverExpenseAmtCol').append('<span id="balanceDriverExpenseAmt">' + balanceDriverExpenseAmt + '</span>');
					$('#totalRawanaCollected').append('Rs. <span id="totalRawanaExpense">' + rawanaAmount + '</span>');
					$('#balanceDriverExpenseAmtCol1').append('Rs. ' + balanceDriverExpenseAmt + ' ( - )');
					$('#totalMiscIncomeAmtCol').append('Rs. <span id="totalMiscIncome">' + totalMiscIncome + '</span>' + ' ( + )');
					
					$("#TotalAllExpense").val(amountGivenToOfficeOrDriver);
					$('#settlementRemark').val(ammountGivenMessage);
					
				}, addDriverFuelDetailsMethod : function(differenceDiesel) {
					let loadelement 	= new Array();
					let driverFuelHtml 	= new $.Deferred();
					loadelement.push(driverFuelHtml);
					
					finalDieselAmount 	= 0;
					finalDieselUsed 	= 0;
					dr					= 0;
					
					$("#driverFuelDetailsDiv").load("/ivcargo/html/module/tripHisab/driverFuelDetails.html",
							function() {
						driverFuelHtml.resolve();
					});
					$.when.apply($, loadelement).done(function() {
						
						$('#payment-modal-title').html('Driver Fuel Details (upto ' + differenceDiesel.toFixed(2) + ' ltrs.)');
						$("#dieselUsedByDriver").val('');
						$("#driverDieselRate").val('');
						$("#totalDriverDieselAmount").val('');
						
						$("#driverDieselRate").blur(function() {
							_this.calculateDriverDiesel();
						});
						
						$("#addDriverFuelDetails").click(function() {
							_this.setDriverDetailsTable(differenceDiesel);
						});
						
						$("#saveDriverFuelDetails").click(function() {
							_this.saveDriverFuelDetailsFunc();
						});
						
					});
					
				}, setDriverFuelDetailsForView : function() {
					$('#totalDriverFuelDetailsTbody').empty();
					$('#totalDriverFuelDetailsTfoot').empty();
					let columnArray		= new Array();
					let totalDiesel = 0, totalRate = 0, totalAmt = 0;
					
					for (let i = 0; i < driverFuelArray.length; i++) {
						let obj			= driverFuelArray[i];
						
						totalDiesel += Number(obj.dieselUsedByDriver);
						totalRate 	+= Number(obj.driverDieselRate);
						totalAmt 	+= Number(obj.totalDriverDieselAmount);
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+obj.dieselUsedByDriver+"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+obj.driverDieselRate+"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+obj.totalDriverDieselAmount+"</td>");
						$('#totalDriverFuelDetailsTbody').append('<tr>' + columnArray.join(' ') + '</tr>');
						columnArray	= [];
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>"+totalDiesel+"</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>"+totalRate+"</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>"+totalAmt+"</b></td>");
					$('#totalDriverFuelDetailsTfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
					$('#totalDriverFuelDetailsTable').removeClass('hide');
					
				}, saveDriverFuelDetailsFunc : function() {
					driverFuelArray 	= [];
					let count			= $("#allDriverFuelSummaryDiv tr").length;
					
					if(Number(count) > 0) {
						for(let i = 0; i < count; i++) {
							let driverFuelData = {};
	
							driverFuelData.driverDieselRate				= $("#driverDieselRate_" + (i + 1)).val();
							driverFuelData.dieselUsedByDriver			= $("#dieselUsedByDriver_" + (i + 1)).html();
							driverFuelData.totalDriverDieselAmount		= $("#totalDriverDieselAmount_" + (i + 1)).html();
	
							driverFuelArray.push(driverFuelData);
						}
					}
					
					$('#differenceDieselAmountCol').html('');
					$('#differenceDieselAmountCol').append('Rs. <span id="differenceDieselAmount">' + finalDieselAmount + '</span>');
					
					_this.calculateTripHisabAfterDriverDetails();
					
					$('#popUpForDriverFuel').modal('hide');
					setTimeout(() => {
						_this.setDriverFuelDetailsForView();
					}, 1000);
				}, calculateTripHisabAfterDriverDetails : function() {
					let totalRawanaExpense2 = Number($('#totalRawanaExpense').html());
					let totalDriverExpense2 = Number($('#totalDriverExpense').html());
					let totalMiscIncome2 	= Number($('#totalMiscIncome').html());
					
					$('#differenceDieselAmountCol1').html(finalDieselAmount);
					$('#balanceDriverExpenseAmt').html(totalDriverExpense2 + finalDieselAmount);
					$('#balanceDriverExpenseAmtCol1').html(totalDriverExpense2 + finalDieselAmount);
					
					let balanceDriverExpenseAmt = Number($('#balanceDriverExpenseAmtCol1').html());
				
					let rawanaAndExpenseDiff2 = null;
					
					if(totalMiscIncome2 > 0)
						rawanaAndExpenseDiff2	= (totalRawanaExpense2 - balanceDriverExpenseAmt + totalMiscIncome2);
					else
						rawanaAndExpenseDiff2	= (totalRawanaExpense2 - balanceDriverExpenseAmt);
					
					let ammountGivenMessage2;
					
					if(rawanaAndExpenseDiff2 > 0)
						ammountGivenMessage2	= 'Rs. ' +  rawanaAndExpenseDiff2 + ' amount is driver given to office. ';
					else
						ammountGivenMessage2	= 'Rs. ' +  (-rawanaAndExpenseDiff2) + ' amount is office given to driver.';
					
					$('#TotalAllExpense').val(rawanaAndExpenseDiff2);
					$('#settlementRemark').val(ammountGivenMessage2);
				}, calculateDriverDiesel : function() {
					let dieselUsedByDriver			= Number($("#dieselUsedByDriver").val());
					let driverDieselRate			= Number($("#driverDieselRate").val());
					let totalDriverDieselAmount		= dieselUsedByDriver * driverDieselRate;
					$('#totalDriverDieselAmount').val(totalDriverDieselAmount);
					
				}, setDriverDetailsTable : function(differenceDiesel) {
					if($("#dieselUsedByDriver").val() == '') {
						showMessage('info', 'Please enter diesel used by driver!');
						$("#dieselUsedByDriver").focus();
						return;
					}
					
					if($("#driverDieselRate").val() == '') {
						showMessage('info', 'Please enter diesel rate!');
						$("#driverDieselRate").focus();
						return;
					}
					
					let srNo 					= (dr + 1);
					let driverDieselRate		= Number($("#driverDieselRate").val());
					let dieselUsedByDriver		= Number($("#dieselUsedByDriver").val());
					let totalDriverDieselAmount	= Number($("#totalDriverDieselAmount").val());
					
					finalDieselUsed 			= finalDieselUsed 	+ dieselUsedByDriver;
					finalDieselAmount 			= finalDieselAmount + totalDriverDieselAmount;
					
					if(finalDieselUsed > differenceDiesel) {
						showMessage('info', 'Cannot add fuel more than ' + differenceDiesel.toFixed(2) + 'ltr.');
						$("#dieselUsedByDriver").val('');
						$("#driverDieselRate").val('');
						$("#totalDriverDieselAmount").val('');
						finalDieselAmount = finalDieselAmount - totalDriverDieselAmount;
						finalDieselUsed   = finalDieselUsed - dieselUsedByDriver;
						return;
					}
					
					$('#driverFuelSummaryDiv').removeClass('hide');
					$("#driverFuelSummaryFoot").remove();
					
					let row 						= createRowInTable('driverFuelSummary' + dr, '', '');
					let srNoCol 					= createColumnInRow(row, 'srNo2_' + (dr + 1), '', '80px', '', 'letter-spacing:2px', '');
					let dieselUsedByDriverCol 		= createColumnInRow(row, 'dieselUsedByDriver_' + (dr + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalDriverDieselAmountCol	= createColumnInRow(row, 'totalDriverDieselAmount_' + (dr + 1), '', '150px', 'right', 'letter-spacing:2px', '');
					
					appendValueInTableCol(srNoCol, srNo);
					appendValueInTableCol(srNoCol, '<input type ="hidden" id="driverDieselRate_' + (dr + 1) + '" value= ' + driverDieselRate + ' />');
					appendValueInTableCol(dieselUsedByDriverCol, dieselUsedByDriver);
					appendValueInTableCol(totalDriverDieselAmountCol, totalDriverDieselAmount);
					//appendValueInTableCol(srNoCol, '<input type ="button" id="deleteRow_' + (dr + 1) + '" value=Remove />');
					
					$("#allDriverFuelSummaryDiv").append(row);
					
					let rowFoot 						= createRowInTable('driverFuelSummaryFoot', '', '');
					
					let srNoFootCol 					= createColumnInRow(rowFoot, 'srNo2Foot_' + (dr + 1), '', '80px', '', 'letter-spacing:2px', '');
					let dieselUsedByDriverFootCol	 	= createColumnInRow(rowFoot, 'dieselUsedByDriverFoot_' + (dr + 1), '', '250px', '', 'letter-spacing:2px', '');
					let totalDriverDieselAmountFootCol 	= createColumnInRow(rowFoot, 'totalDriverDieselAmountFoot_' + (dr + 1), '', '150px', 'right', 'letter-spacing:2px', '');
						
					appendValueInTableCol(srNoFootCol, '');
					appendValueInTableCol(dieselUsedByDriverFootCol, '<b>' + finalDieselUsed + '</b>');
					appendValueInTableCol(totalDriverDieselAmountFootCol, '<b>' + finalDieselAmount + '</b>');
					
					$("#allDriverFuelGrandTotal").append(rowFoot);
					
					dr = dr + 1;
					setTimeout(() => {
						$("#dieselUsedByDriver").val('');
						$("#driverDieselRate").val('');
						$("#totalDriverDieselAmount").val('');
					}, 500);
					
				}, calculateTripDetailsWithoutDiesel : function() {
					$("#tollAmount").val('');
					$("#totMiscAmount").val('');
					
					let ammountGivenMessage		= '';
					
					$("#hisabDetailsWithoutDiesel").removeClass('hide');
					$("#hisabDetails").empty();
					
					let rawanaAmount			= Number($('#totalRawanaExpense').html());
					let totalDriverExpense		= (Number($('#totalDriverAllowance').html()) + Number($('#finalTollExpense').html()) + Number($('#finalMiscExpense').html())).toFixed(2);
					let totalMiscIncome			= (Number($('#finalMiscIncome').html())).toFixed(2);
					let rawanaAndExpenseDiff	= 0;
					
					if(totalMiscIncome > 0)
						rawanaAndExpenseDiff	= (rawanaAmount - totalDriverExpense + totalMiscIncome);
					else
						rawanaAndExpenseDiff	= (rawanaAmount - totalDriverExpense);
					
					if(tripHisabConfiguration.IsRoundOffRequiredForAmount) {
						rawanaAndExpenseDiff	= Math.round(rawanaAndExpenseDiff);
						rawanaAmount			= Math.round(rawanaAmount);
						totalMiscIncome			= Math.round(totalMiscIncome);
						totalDriverExpense		= Math.round(totalDriverExpense);
					} else {
						rawanaAndExpenseDiff	= rawanaAndExpenseDiff.toFixed(2);
						rawanaAmount			= rawanaAmount.toFixed(2);
					}
					
					if(rawanaAndExpenseDiff > 0)
						ammountGivenMessage		= 'Rs. ' +  rawanaAndExpenseDiff + ' amount is driver given to office. ';
					else
						ammountGivenMessage		= 'Rs. ' +  (-rawanaAndExpenseDiff) + ' amount is office given to driver.';
					
					$("#totalDriverExpenseCol").empty();
					$("#totalRawanaCollected").empty();
					$("#totalMiscIncomeAmtCol").empty();
					
					$("#TotalAllExpense").val(rawanaAndExpenseDiff);
					$('#settlementRemark').val(ammountGivenMessage);
					
					$('#totalDriverExpenseCol').append('Rs. <span id="totalDriverExpense">' + totalDriverExpense + '</span>');
					$('#totalRawanaCollected').append('Rs. <span id="totalRawanaExpense">' + rawanaAmount + '</span>');
					$('#totalMiscIncomeAmtCol').append('Rs. <span id="totalMiscIncome">' + totalMiscIncome + '</span>');
				}, settleTrip : function() {
					if($("#TotalAllExpense").val() == '') {
						goToPosition('left-border-boxshadow', 'slow');
						changeTextFieldColor('TotalAllExpense', '', '', 'red');
						showMessage('error', '<i class="fa fa-times-circle"></i> Please calculate Hisab !');
						return;
					}
					
					if($("#settlementRemark").val() == '') {
						showMessage('error', '<i class="fa fa-times-circle"></i> Enter Remark !');
						changeTextFieldColor('settlementRemark', '', '', 'red');
						return;
					}
					
					if($('#manualTrip').exists() && $('#manualTrip').is(":visible")) {
						if($('#manualTrip').prop("checked")) {
							if($('#manualNumberEle').exists() && $('#manualNumberEle').is(":visible")){
								if($("#manualNumberEle").val() == '' || isNaN($("#manualNumberEle").val())) {
									showMessage('error', '<i class="fa fa-times-circle"></i> Enter Valid Manual Number !');
									$("#manualNumberEle").val('');
									return;
								}
							}

							if($('#manualDateEle').exists() && $('#manualDateEle').is(":visible")){
								if($("#manualDateEle").val() == '') {
									showMessage('error', '<i class="fa fa-times-circle"></i> Enter Manual Date !');
									changeTextFieldColor('manualDateEle', '', '', 'red');
									return;
								}
							}
						}
					}
					
					let jsonObject				= {};
					let tollArray				= [];
					let miscArray				= [];
					let miscIncomeArray			= [];
					
					jsonObject.vehicleNumberMasterId	= $("#vehicleNumber_primary_key").val();
					jsonObject.driverMasterId			= $("#driverNameEle_primary_key").val();
					jsonObject.FinalSettlementAmount	= $("#TotalAllExpense").val();
					jsonObject.SettlementRemark			= $("#settlementRemark").val();
					jsonObject.EndKMReading				= $("#endKiloMeterReading").html();
					jsonObject.TotalRunningKM			= $("#totalRunningKms").html();
					jsonObject.VehicleAverage			= vehicleNumberMaster.vehicleAverage;
					
					let count1	= $("#allTollExpenses tr").length;
					
					if(Number(count1) > 0) {
						for(let i = 0; i < count1; i++) {
							let tollData = {};

							tollData.TollMasterTypeId		= $("#TollTypeMasterId_" + (i + 1)).val();
							tollData.TollMasterAmt			= $("#TotTollAmount_" + (i + 1)).html();
							tollData.TollMasterRemark		= $("#tollRemark_" + (i + 1)).html();
							tollData.TollMasterName			= $("#tolltype_" + (i + 1)).html();
							
							tollArray.push(tollData);
						}
					}

					let count2	= $("#allMiscExpenses tr").length;
					
					if(Number(count2) > 0) {
						for(let i = 0; i < count2; i++) {
							let miscData = {};
	
							miscData.MiscMasterTypeId		= $("#miscTypeMasterId_" + (i + 1)).val();
							miscData.MiscMasterAmt			= $("#TotMISCAmount_" + (i + 1)).html();
							miscData.MiscMasterRemark		= $("#remarkAmountCol_" + (i + 1)).html();
							miscData.MiscMasterName			= $("#typeOfExpense_" + (i + 1)).html();
	
							miscArray.push(miscData);
						}
					}
					
					let count3	= $("#allMiscIncome tr").length;
					
					if(Number(count3) > 0) {
						for(let i = 0; i < count3; i++) {
							let miscData = {};
													
							miscData.MiscMasterTypeId		= $("#miscIncomeTypeMasterId_" + (i + 1)).val();
							miscData.MiscMasterAmt			= $("#TotMISCIncomeAmount_" + (i + 1)).html();
							miscData.MiscMasterRemark		= $("#incomeRemarkAmountCol_" + (i + 1)).html();
							miscData.MiscMasterName			= $("#typeOfIncome_" + (i + 1)).html();
	
							miscIncomeArray.push(miscData);
						}
					}
					
					jsonObject.tollExpenseDataArray		= JSON.stringify(tollArray);
					jsonObject.miscExpenseDataArray	    = JSON.stringify(miscArray);
					jsonObject.miscIncomeDataArray	    = JSON.stringify(miscIncomeArray);
					
					if(driverFuelArray != undefined)
						jsonObject.driverFuelArray		    = JSON.stringify(driverFuelArray);
					
					jsonObject.fuelUsed					= $("#minimumDieselToUse").html();
					jsonObject.differenceDiesel			= $("#differenceDiesel").html();
					jsonObject.fuelBalanace				= $("#differenceDiesel").html();
					jsonObject.dieselPerLiter			= $('#dieselPerLitreAmt').html();
					jsonObject.DriverAllowance			= $('#totalDriverAllowance').html();
					jsonObject.DriverAllowanceRemark	= $('#driverAllowanceRemarkCol').html();
					jsonObject.totalDriverExpense		= $('#totalDriverExpense').html();
					jsonObject.totalRawanaExpense		= $('#totalRawanaExpense').html();
					jsonObject.differenceDieselAmount	= $("#differenceDieselAmount").html();
					jsonObject.totalMiscIncome			= $("#totalMiscIncome").html();
					
					if(dispatchLedgerIds.length > 0)
						jsonObject.dispatchLedgerIds		= dispatchLedgerIds.join(',');
					
					if(deliveryRunSheetLedgerIds.length > 0)
						jsonObject.deliveryRunSheetLedgerIds= deliveryRunSheetLedgerIds.join(',');
					
					if(doorPickUpLedgerIds.length > 0)
						jsonObject.doorPickUpLedgerIds= doorPickUpLedgerIds.join(',');
					
					if(tripHisabConfiguration.autoCalculateDieselRate)
						jsonObject.totalDieselAmount	= totalDieselAmount;
					else
						jsonObject.totalDieselAmount	= actualDieselAmount;
					
					if($('#manualTrip').exists() && $('#manualTrip').is(":visible"))
						jsonObject.isManualTripHisabSettlement	 = $('#manualTrip').prop('checked');
					
					if($('#manualNumberEle').exists() && $('#manualNumberEle').is(":visible"))
						jsonObject.manualTripHisabNumber	= $('#manualNumberEle').val();

					if($('#manualDateEle').exists() && $('#manualDateEle').is(":visible"))
						jsonObject.manualTripHisabDate	= $('#manualDateEle').val();
					
					if(Number(jsonObject.differenceDiesel) > 0){
						if(tripHisabConfiguration.isAllowFuelDetailsByDriver && driverFuelArray == undefined){
							showMessage('error', '<i class="fa fa-times-circle"></i> Please enter driver fuel details !');
							return;
						}
						
						if(tripHisabConfiguration.isAllowFuelDetailsByDriver && driverFuelArray.length <= 0){
							showMessage('error', '<i class="fa fa-times-circle"></i> Please enter driver fuel details !');
							return;
						}
					}

					let r = confirm("Are you sure for Settlement !");
					
					if (r == true) {
						if(!doneTheStuff) {
							doneTheStuff = true;
							getJSON(jsonObject, WEB_SERVICE_URL + '/tripHisabSettlementWS/saveTripHisabSettlementData.do', _this.displayResultAfterSettlement, EXECUTE_WITH_ERROR);
							showLayer();
						}
					} else {
						doneTheStuff = false;
						hideLayer();
					}
				}, displayResultAfterSettlement : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						let tripHisabSettlementId 		= response.TripHisabSettlementId;
						let errorMessage = response.message;
						
						if(errorMessage.typeName == 'success') {
							
							if(tripHisabConfiguration.allowTripHisabSettlementPrint){
								_this.showPrint(tripHisabSettlementId);
		
								$('#reprintBtn').removeClass('hide');
								
								$('#reprintBtn').on('click', function() {
									_this.showPrint(tripHisabSettlementId);
								});
							}
							refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							
							$('#vehicleNumber').val('');
							$('#vehicleNumber_primary_key').val('');
							$('#vehicleDetailsDiv').html('');
							$("#findBtn").addClass('disabled');
							
							$('#printButtonDetailsDiv').html('<b>Previous Trip Hisab No -</b> ' + response.TripHisabSettlementNumber);
							
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'refresh');
						}
						
						j = 0, l = 0, m = 0, totalMiscAmount = 0, totalMiscIncomeAmount = 0, totalTollAmount = 0, doorPickUpLedgerIds = [], deliveryRunSheetLedgerIds = [], dispatchLedgerIds = [], selectedLSDetails = null;
						
						//showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
				}, showPrint: function(tripHisabSettlementId) {
					const printUrl = `print.do?pageId=340&eventId=10&modulename=tripHisabSettlementPrint&tripHisabSettlementId=${tripHisabSettlementId}`;
					window.open(printUrl, 'newwindow', 'config=height=610,width=815,toolbar=no,menubar=no,scrollbars=yes,resizable=no,location=no,directories=no,status=no');
				}
			});
		});

function showManualInput() {
	if($('#manualTrip').prop("checked")) { 
		if(manualTripHisabNumber)
			$('#manualTripHisabNumber').removeClass('hide');
		
		if(manualTripHisabDate)
			$('#manualTripHisabDate').removeClass('hide');
	} else {
		$('#manualNumberEle').val('');
		$('#manualTripHisabNumber').addClass('hide');
		$('#manualTripHisabDate').addClass('hide');
	}
}

function onTotalTabClick() {
	$('#totalDriverFuelDetailsTable').addClass('hide');
}