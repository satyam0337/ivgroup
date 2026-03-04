var BranchExpenseConfiguration		= null;
var moduleId						= 0;
var	ModuleIdentifierConstant		= null;
var PaymentTypeConstant				= null;
var	incomeExpenseModuleId			= 0;
var GeneralConfiguration			= null;
var totalAmount						= 0;
var totalAmountLS					= 0;

define(
		[
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 '/ivcargo/resources/js/generic/urlparameter.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
		 'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 'moment',
		 '/ivcargo/resources/js/confirm/jquery.confirm.min.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	 ], function(Selection) {
			'use strict';
			let jsonObject = new Object(), _this = '',
			paymentStatusArrForSelection, balanceAmount,count = 0 ,lsNumberArrCount = new Array(),
			exepenseVoucherDetailsIdArr=new Array(),PaymentVoucherSequenceNumberArr = new Array(),
			paymentTypeArr = new Array(),option_1=1,option_2=2,doneTheStuff=false,
			loadingHamaliSettlementconfiguration = null;
			
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/loadingHamaliSettlementWS/getLoadingHamaliSettlementElements.do?', _this.renderLoadingHamaliSettlementElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderLoadingHamaliSettlementElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml	= new $.Deferred();
					let paymentHtml	= new $.Deferred();

					$("#mainContent").load("/ivcargo/html/module/expense/hamaliSettlement.html", function() {
						baseHtml.resolve();
					});
					
					loadelement.push(baseHtml);
					
					$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelectionTce.html", function() {
						paymentHtml.resolve();
					});
					
					loadelement.push(paymentHtml);
					
					$.when.apply($, loadelement).done(function() {
						setIssueBankAutocomplete();
						setAccountNoAutocomplete();	
						
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('lsHamaliDetailsBtn', 'hide');
						refreshAndHidePartOfPage('lsHamaliSummaryTableDivBtn', 'hide');
						$("#viewAddedPaymentDetailsCreate").addClass("hide");

						hideLayer();
						BranchExpenseConfiguration			= response.BranchExpenseConfiguration;
						paymentStatusArrForSelection		= response.paymentStatusArrForSelection;
						paymentTypeArr						= response.paymentTypeArr;
						moduleId							= response.moduleId;
						ModuleIdentifierConstant			= response.ModuleIdentifierConstant;
						PaymentTypeConstant					= response.PaymentTypeConstant;
						incomeExpenseModuleId				= response.incomeExpenseModuleId;
						GeneralConfiguration				= response.GeneralConfiguration;
						loadingHamaliSettlementconfiguration = response;

						$("#number").focus();
						response.executiveTypeWiseBranch	= true;
						
						if(loadingHamaliSettlementconfiguration.allowHamaliTypeLoading) 
							$("#hideLoading").show();
						
						if(loadingHamaliSettlementconfiguration.allowHamaliTypeUnLoading) 
							$("#hideUnLoading").show();
							
						$("#hamaliTypeLoading").on("change", function() {
							_this.resetDataOnChangeHamaliType();
							
							if ($(this).is(":checked")) {
								$("#searchDivLoading").removeClass("hide");
								$("#searchDivUnloading").addClass("hide");
								$(".numberAndBranchDiv").removeClass("hide");
								$("#searchByOption").val("0");
								$(".numberAndBranchDiv").addClass("hide");
								$(".vehicleNumberDiv").addClass("hide");
								$("#number").attr("placeholder","INSERT LS NUMBER");
								$("#numberLabel").text('LS No.');
								$("[data-selector='reportType']").html("LS");
								$("#viewAddedPaymentDetailsCreate").addClass("hide");
								$("#reprintOption").addClass("hide");
							}
						})
						
						$("#hamaliTypeLoading").trigger("change")
						
						$("#hamaliTypeUnloading").on("change", function() {
							_this.resetDataOnChangeHamaliType();
							
							if ($(this).is(":checked")) {
								$("#searchDivLoading").addClass("hide");
								$("#searchDivUnloading").removeClass("hide");
								$(".numberAndBranchDiv").addClass("hide");
								$(".vehicleNumberDiv").addClass("hide");
								$("#searchByOptionUnloading").val("0");
								$("#number").attr("placeholder","INSERT TUR NUMBER");
								$("#numberLabel").text('TUR No.');
								$("[data-selector='reportType']").html("TUR");
								$("#viewAddedPaymentDetailsCreate").addClass("hide");
								$("#reprintOption").addClass("hide");
							}
						})

						$('#searchByOption, #searchByOptionUnloading').on('change',function(){
							_this.resetDataOnChangeHamaliType();
							$("#branchEle").data("selectize").setValue(0);
							$("#number").val("");
							$("#vehicleNumber").val("");
							
							if(Number($(this).val()) == option_1) {
								$('.numberAndBranchDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('.vehicleNumberDiv').addClass('hide');
								$('#dateDiv').addClass('hide');
								$('#viewAllEle').attr('checked',false);	
							} else if (Number($(this).val()) == option_2) {
								$('.numberAndBranchDiv').addClass('hide');
								$('.vehicleNumberDiv').removeClass('hide');
								$('#searchBtnDiv').removeClass('hide');
								$('#dateDiv').removeClass('hide');
							} else {
								$('.numberAndBranchDiv').addClass('hide');
								$('.vehicleNumberDiv').addClass('hide');
								$('#searchBtnDiv').addClass('hide');
							}
						});

						let autoVehicleNumber			= new Object();
						autoVehicleNumber.url			= WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?viewAll=true';

						autoVehicleNumber.primary_key	= 'vehicleNumberMasterId';
						autoVehicleNumber.field			= 'vehicleNumber';
						$("#vehicleNumber").autocompleteCustom(autoVehicleNumber);

						response.isCalenderSelection	= true;

						let elementConfiguration	= new Object();
						elementConfiguration.branchElement		= $('#branchEle');
						elementConfiguration.dateElement		= $('#dateEle');
						response.elementConfiguration			= elementConfiguration;
						Selection.setSelectionToGetData(response);

						$("#findBtn").click(function() {
							
							if(!_this.validateFindForm())
								return false;
															
							_this.onFind();
						});
					});
				},validateFindForm: function() {
					
					const searchByOption			= Number($('#searchByOption').val());
					const searchByOptionUnloading	= Number($('#searchByOptionUnloading').val() || 0);
	
					_this.resetDataOnChangeHamaliType();

					if(searchByOption <= 0 && searchByOptionUnloading <= 0) {
						showAlertMessage('error', 'Please Select From Dropdown For Search !');
						return false;
					}

					if(searchByOption === option_1 || searchByOptionUnloading === option_1) {
						const lsNumber = $("#number").val().trim();
						const branch = $("#branchEle").val().trim();

						if(!lsNumber){
							showAlertMessage('error', 'Please Enter Valid LS Number !');
							$("#number").focus();
							return false;
						}

						if(!branch){
							showAlertMessage('error', 'Please Select Valid Branch !');
							$("#branchEle").focus();
							return false;
						}
					}

					if (searchByOption === option_2 || searchByOptionUnloading === option_2) {
						const vehicleKey = $("#vehicleNumber_primary_key").val().trim();

						if (!vehicleKey) {
							showAlertMessage('error', 'Please Select Valid Vehicle Number !');
							$("#vehicleNumber").focus();
							return false;
						}
					}
					
					return true;
				}, resetDataOnChangeHamaliType : function() {
					lsNumberArrCount = [];
					$("#reportTable tbody").empty();
					$("#reportTable tfoot").empty();
					$("#lsDetails tbody").empty();
					$('#totalTable tbody').empty();
					$("#lsHamaliSummaryTable tbody").empty();
					$('#bottom-border-boxshadow').addClass('hide');
					$('#middle-border-boxshadow').addClass('hide');
					$('#left-border-boxshadow').addClass('hide');
					$("#viewAddedPaymentDetailsCreate").addClass("hide");
					$("#lsHamaliDetailsBtn").addClass("hide");
					
				}, onFind : function() {
					showLayer();
					
					let jsonObject 	= new Object();
					let lsNumber	= $('#number').val();
									
					if ($("#hamaliTypeLoading").is(":checked")) {
						jsonObject.lsNumber = lsNumber.replace(/\s+/g, "");
						jsonObject.searchBy = Number($('#searchByOption').val());
					}

					if ($("#hamaliTypeUnloading").is(":checked")) {
						jsonObject.TURNumber = lsNumber.replace(/\s+/g, "");
						jsonObject.searchBy = Number($('#searchByOptionUnloading').val());
					}

					jsonObject.branchId = $('#branchEle').val();
					jsonObject.vehicleNumberMasterId = $('#vehicleNumber_primary_key').val();

					if ($('#dateDiv').is(":visible")) {
						if ($("#dateEle").attr('data-startdate') != undefined)
							jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');

						if ($("#dateEle").attr('data-enddate') != undefined)
							jsonObject["toDate"] = $("#dateEle").attr('data-enddate');

						jsonObject.filter = 1;
					} else
						jsonObject.filter = 0;
					
										
					if(lsNumber != "" && (Number($('#searchByOption').val()) == option_1 || Number($('#searchByOptionUnloading').val()) == option_1)) {
						if ($("#hamaliTypeLoading").is(":checked"))
							getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/getLoadingHamaliAmountSettlementData.do', _this.setHamaliData, EXECUTE_WITH_ERROR);
						else if($("#hamaliTypeUnloading").is(":checked"))
							getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/getUnloadingHamaliAmountSettlementData.do', _this.setHamaliData, EXECUTE_WITH_ERROR);
					} else {
						if($("#hamaliTypeLoading").is(":checked"))						
							getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/getLoadingHamaliAmountSettlementData.do', _this.setHamaliDetailsDataSearchedByVehicle, EXECUTE_WITH_ERROR);
							
						if($("#hamaliTypeUnloading").is(":checked"))
							getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/getUnloadingHamaliAmountSettlementData.do', _this.setHamaliDetailsDataSearchedByVehicle, EXECUTE_WITH_ERROR);
					}
				}, setHamaliData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						_this.resetDataOnChangeHamaliType();
						return;
					}
					
					if ($("#hamaliTypeUnloading").is(":checked"))
						response = _this.mapReponseUnloadingtoLoading(response);
					
					$('#lsHamaliDetailsBtn').removeClass('hide');
					$('#lsHamaliDetailsBtn').show();
					$('#lsHamaliSummaryTableDivBtn').removeClass('hide');
					$('#middle-border-boxshadow').removeClass('hide');
					$('#left-border-boxshadow').removeClass('hide');
					
					_this.setDataInTable(response);
					hideLayer();
				}, setDataInTable : function(data) {
					hideLayer();
					
					const loadingHamaliSettlementList = data.loadingHamaliSettlementList;
					if (!loadingHamaliSettlementList || loadingHamaliSettlementList.length === 0) return;

					$('#middle-border-boxshadow, #bottom-border-boxshadow, #left-border-boxshadow').removeClass("hide");
					$('#reportTable tfoot').empty();
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					
					_this.setHamaliSummaryDetails(loadingHamaliSettlementList);
					
					$(".paymentTypeSelection").removeClass("hide");
					$('#paymentType'+' option[value]').remove();
					$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));
					$('#paymentMode'+' option[value]').remove();
					$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));
					
					$(paymentTypeArr).each(function() {
						$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
					});

					$(paymentStatusArrForSelection).each(function() {
						$('#paymentType').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
					});
						
					$("#paymentType").change(function() {
						$('.selectAllPaymentType').prop('selectedIndex', $(this).prop('selectedIndex'))
					});
						
					$("#paymentMode").change(function() {
						$('.selectAllPaymentMode').prop('selectedIndex', $(this).prop('selectedIndex'))
					});

					let	columnArray = new Array();
					let hamaliAmount = 0;
					
					for (const element of loadingHamaliSettlementList) {
						count++;
						let obj							= element;
						
						balanceAmount					= obj.dueAmount;
						let pendingHamaliDetailsId	= obj.pendingHamaliDetailsId;
						hamaliAmount				+= obj.totalHamaliAmount;	
						
						if(isValueExistInArray(lsNumberArrCount, pendingHamaliDetailsId)) {
							showAlertMessage('info','LS already added , Please Reload (F5) !');
							return false;
						}
						
						lsNumberArrCount.push(pendingHamaliDetailsId);
						totalAmountLS += balanceAmount;
						
						columnArray.push("<td style='width: 5%; text-align: center; vertical-align: middle;'>" + "<input type='checkbox' " + "id='singleCheckBox" + obj.pendingHamaliDetailsId + "' " + "name='singleCheckBox' " + "class='form-check-input singleCheckBox' " + "value='" + obj.pendingHamaliDetailsId + "' " + "style='transform: scale(1.2);'/>" + "</td>" );
						columnArray.push("<td style='width: 13%;'><input type='text' id='LSNumber" + obj.pendingHamaliDetailsId + "' name='pickupNumber' class='form-control' value='" + obj.lsNumber + "' style='width: 100%; text-align: center; background-color: #9bd6f2; font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='lorryHireAmount" + obj.pendingHamaliDetailsId + "' name='lorryHireAmount' value='" + obj.totalHamaliAmount + "' class='form-control' maxlength='7' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='paymentTypeSelection' style='width: 13%;'><select name='paymentType' id='paymentType" + obj.pendingHamaliDetailsId + "' class='form-control selectAllPaymentType' onchange='changeClearPayment(" + obj.pendingHamaliDetailsId + ",this," + obj.dueAmount + ")'></select></td>");
						columnArray.push("<td class='paymentModeSelection' style='width: 13%;'><select name='paymentMode' id='paymentMode" + obj.pendingHamaliDetailsId + "' onchange='onPaymentModeSelect(" + obj.pendingHamaliDetailsId + ",this);' class='form-control selectAllPaymentMode'></select></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='amount" + obj.pendingHamaliDetailsId + "' name='amount' placeholder='Amount' value='0' maxlength='7' class='inputAmount inputAmt form-control' oninput='calculateTotal()' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onfocus=\"if(this.value.trim() === '0') this.value='';\" /></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_" + obj.pendingHamaliDetailsId + "' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control dueAmount' style='display: none; width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='balanceAmount" + obj.pendingHamaliDetailsId + "' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + obj.pendingHamaliDetailsId + "' name='balanceAmount1' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td style='width: 15%;'><input type='text' id='remark" + obj.pendingHamaliDetailsId + "' name='remark' placeholder='Remark' class='form-control' style='width: 100%; text-transform: uppercase;' maxlength='250'></td>");

						$('#reportTable tbody').append("<tr id='billDetails" + obj.pendingHamaliDetailsId + "'>" + columnArray.join(' ') + '</tr>');
						
						columnArray	= [];
						
						$(".paymentTypeSelection").removeClass("hide");
						$('#paymentType' + obj.pendingHamaliDetailsId +' option[value]').remove();
						$('#paymentType' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
						$('#paymentMode' + obj.pendingHamaliDetailsId +' option[value]').remove();
						$('#paymentMode' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
						});
						
						$(paymentTypeArr).each(function() {
							$('#paymentMode' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});
						
						$("#amount" + obj.pendingHamaliDetailsId).bind("blur", function() {
							_this.validateReceiveAmount(obj);
						});

						$("#amount" + obj.pendingHamaliDetailsId).bind("keyup", function() {
							_this.validateReceiveAmount(obj);
						});
					}

					if (loadingHamaliSettlementconfiguration.centralizedPaymentModeSelectionForAll)
						$(".allPaymentType").removeClass("hide");
					
					columnArray.push("<td style='width: 5%; text-align: center;'>Total</td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 14%;'><input id='lorryhirchg' class='form-control' style='width: 100%; text-align: right;' readonly value='" + hamaliAmount + "' /></td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 14%;'><input id='sumtotal1' class='form-control' style='width: 100%; text-align: right;' readonly value='0'/></td>");
					columnArray.push("<td style='width: 14%;'><input id='balancetotal1' class='form-control' style='width: 100%; text-align: right;' readonly value='" + hamaliAmount + "'/></td>");
					columnArray.push("<td style='width: 15%;'></td>");

					$('#reportTable tfoot').append("<tr>" + columnArray.join(' ') + '</tr>');

					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmount').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmts =index.value;
						
							if (paymentTypeVal == 2) {
								$('#amount' + id).val(dueAmts);
								$('#balanceAmount' + id).val(0);	
								$('#sumtotal1').val(totalAmountLS);	
								$('#balancetotal1').val(0);
							} else {
								$('#balanceAmount' + id).val(dueAmts);
								$('#amount' + id).val(0);
								$('#balancetotal1').val(totalAmountLS);
								$('#sumtotal1').val(0);	
							}
						});
					});
				
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					removeTableRows('lsHamaliSummaryTable', 'tbody');

					if(loadingHamaliSettlementList.length > 0) {
						$("#btSubmit").on("click" ,function() {
							if($('#reportTable :input[type="checkbox"]:checked').length >= Number(loadingHamaliSettlementconfiguration.maxNoOfLSForSettlement)) {
								showAlertMessage('info', 'Can Not Settle More Than ' + Number(loadingHamaliSettlementconfiguration.maxNoOfLSForSettlement) + ' LS');
								return false;
							}
							
							_this.settleHamali();
						});
					}
				}, validateReceiveAmount : function(obj) {
					if(Number($('#lorryHireAmount' + obj.pendingHamaliDetailsId).val()) == Number($('#balanceAmount1' + obj.pendingHamaliDetailsId).val())){
						if(Number($('#amount' + obj.pendingHamaliDetailsId).val()) > Number($('#lorryHireAmount' + obj.pendingHamaliDetailsId).val())) {
							showAlertMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + obj.pendingHamaliDetailsId).val()));
							return false;
						}

						$('#balanceAmount' + obj.pendingHamaliDetailsId).val(Number($('#lorryHireAmount' + obj.pendingHamaliDetailsId).val()) - Number($('#amount' + obj.pendingHamaliDetailsId).val()));
					} else if(Number($('#lorryHireAmount' + obj.pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + obj.pendingHamaliDetailsId).val())){
						if(Number($('#amount' + obj.pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + obj.pendingHamaliDetailsId).val())) {
							showAlertMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + obj.pendingHamaliDetailsId).val()));
							return false;
						}
						
						$('#balanceAmount' + obj.pendingHamaliDetailsId).val(Number($('#balanceAmount1' + obj.pendingHamaliDetailsId).val()) - Number($('#amount' + obj.pendingHamaliDetailsId).val()));
					}
					
					calculateTotal();
				}, validateReceiveAmountForVehicleSearch : function(obj) {
					totalAmountLS		= 0;
					
					let table	= $("#reportTable");
					let count	= parseFloat(table[0].rows.length - 1);

					for (let row = count; row > 0; row--) {
						let pendingHamaliDetailsId = table[0].rows[row].cells[0].firstChild.value;
					
						if(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) == Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
							if(Number($('#amount' + pendingHamaliDetailsId).val()) > Number($('#lorryHireAmount' + pendingHamaliDetailsId).val())) {
								showAlertMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()));
								return false;
							}

							$('#balanceAmount' + pendingHamaliDetailsId).val(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) - Number($('#amount' + pendingHamaliDetailsId).val()));
						} else if(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + pendingHamaliDetailsId).val())) {
							if(Number($('#amount' + pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + pendingHamaliDetailsId).val())) {
								showAlertMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + pendingHamaliDetailsId).val()));
								return false;
							}
							
							$('#balanceAmount' + pendingHamaliDetailsId).val(Number($('#balanceAmount1' + pendingHamaliDetailsId).val()) - Number($('#amount' + pendingHamaliDetailsId).val()));
						}
					}
				}, setHamaliDetailsDataSearchedByVehicle : function(response) {
					if(response.message != undefined) {
						hideLayer();
						_this.resetDataOnChangeHamaliType();
						return;
					}
					
					if ($("#hamaliTypeUnloading").is(":checked"))
						response = _this.mapReponseUnloadingtoLoading(response);
					
					setTimeout(function() { 
						$("#lsHamaliSummaryTableDivBtn").css('display','none');
					}, 500);
					
					$('#lsHamaliDetailsBtn').removeClass('hide');
					$('#lsHamaliDetailsBtn').show();
					$('#lsDetails tbody').empty();
					$('#reportTable tbody').empty();
					$('#reportTable tfoot').empty();

					hideLayer();
					let loadingHamaliSettlementList		= response.loadingHamaliSettlementList;
					
					if(loadingHamaliSettlementList.length > 0) {
						$("#middle-border-boxshadow").removeClass("hide");
						$("#bottom-border-boxshadow").removeClass("hide");
						$("#left-border-boxshadow").removeClass("hide");
					}
					
					$("*[data-attribute=manualDate]").removeClass("hide");
					$(".paymentTypeSelection").removeClass("hide");
					$('#paymentType'+' option[value]').remove();
					$('#paymentType').append($("<option>").attr('value', 0).text("-- Please Select-----"));
					$('#paymentMode'+' option[value]').remove();
					$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));

					$(paymentTypeArr).each(function() {
						$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
					});

					$(paymentStatusArrForSelection).each(function() {
						$('#paymentType').append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
					});
						
					$("#paymentType").change(function() {
						$('.selectAllPaymentType').prop('selectedIndex', $(this).prop('selectedIndex'))
					});
					
					$("#paymentMode").change(function() {
						$('.selectAllPaymentMode').prop('selectedIndex', $(this).prop('selectedIndex'))
					});

					_this.setHamaliSummaryDetails(loadingHamaliSettlementList);
					
					let columnArray			= new Array();
					let lorryhirecharges 	= 0;
					totalAmount				= 0;
					
					for (const element of loadingHamaliSettlementList) {
						let obj					= element;
						
						balanceAmount			= obj.dueAmount;
						lorryhirecharges		+= obj.totalHamaliAmount;
	
						totalAmount += balanceAmount;
						
						columnArray.push("<td style='width: 5%; text-align: center; vertical-align: middle;'>" + "<input type='checkbox' " + "id='singleCheckBox" + obj.pendingHamaliDetailsId + "' " + "name='singleCheckBox' " + "class='form-check-input singleCheckBox' " + "value='" + obj.pendingHamaliDetailsId + "' " + "style='transform: scale(1.2);'/>" + "</td>" );
						columnArray.push("<td style='width: 13%;'><input type='text' id='LSNumber" + obj.pendingHamaliDetailsId + "' name='pickupNumber' class='form-control' value='" + obj.lsNumber + "' style='width: 100%; text-align: center; background-color: #9bd6f2; font-weight:bold' onkeypress='return noNumbers(event);' readonly='readonly' /></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='lorryHireAmount" + obj.pendingHamaliDetailsId + "' name='lorryHireAmount' value='" + obj.totalHamaliAmount + "' class='form-control' maxlength='7' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='paymentTypeSelection' style='width: 13%;'><select name='paymentType' id='paymentType" + obj.pendingHamaliDetailsId + "' class='form-control selectAllPaymentType' onchange='changeClearPayment(" + obj.pendingHamaliDetailsId + ",this," + obj.dueAmount + ")'></select></td>");
						columnArray.push("<td class='paymentModeSelection' style='width: 13%;'><select name='paymentMode' id='paymentMode" + obj.pendingHamaliDetailsId + "' onchange='onPaymentModeSelect(" + obj.pendingHamaliDetailsId + ",this);' class='form-control selectAllPaymentMode'></select></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='amount" + obj.pendingHamaliDetailsId + "' name='amount' placeholder='Amount' value='0' maxlength='7' class='inputAmount inputAmt form-control' oninput='calculateTotal()' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' onblur='clearIfNotNumeric(this,0);' onfocus=\"if(this.value.trim() === '0') this.value='';\" /></td>");
						columnArray.push("<td class='hide'><input type='text' id='dueAmount_" + obj.pendingHamaliDetailsId + "' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control dueAmount' style='display: none; width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td style='width: 14%;'><input type='text' id='balanceAmount" + obj.pendingHamaliDetailsId + "' name='balanceAmount' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td class='hide'><input type='hidden' id='balanceAmount1" + obj.pendingHamaliDetailsId + "' name='balanceAmount1' value='" + obj.dueAmount + "' maxlength='7' class='form-control' style='width: 100%; text-align: right;' onkeypress='return noNumbers(event);' readonly='readonly'/></td>");
						columnArray.push("<td style='width: 15%;'><input type='text' id='remark" + obj.pendingHamaliDetailsId + "' name='remark' placeholder='Remark' class='form-control' style='width: 100%; text-transform: uppercase;' maxlength='250'></td>");

						$('#reportTable tbody').append("<tr id='billDetails" + obj.pendingHamaliDetailsId+"'>" + columnArray.join('') + "</tr>");
				
						columnArray	= [];
						
						$(".paymentTypeSelection").removeClass("hide");
						$('#paymentType' + obj.pendingHamaliDetailsId+' option[value]').remove();
						$('#paymentType' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));
						$('#paymentMode' + obj.pendingHamaliDetailsId+' option[value]').remove();
						$('#paymentMode' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

						$(paymentStatusArrForSelection).each(function() {
							$('#paymentType' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', this.paymentStatusId).text(this.paymentStatusName));
						});
							
						$(paymentTypeArr).each(function() {
							$('#paymentMode' + obj.pendingHamaliDetailsId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
						});

						$("#amount" + obj.pendingHamaliDetailsId).bind("blur", function() {
							_this.validateReceiveAmountForVehicleSearch(obj);
						});

						$("#amount" + obj.pendingHamaliDetailsId).bind("keyup", function() {
							_this.validateReceiveAmountForVehicleSearch(obj);
						});
					}
					
					if (loadingHamaliSettlementconfiguration.centralizedPaymentModeSelectionForAll)
						$(".allPaymentType").removeClass("hide");
					
					columnArray.push("<td style='width: 5%; text-align: center;'>Total</td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 14%;'><input id='lorryhirchg' class='form-control' style='width: 100%; text-align: right;' readonly value='" + lorryhirecharges + "' /></td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 13%;'></td>");
					columnArray.push("<td style='width: 14%;'><input id='sumtotal1' class='form-control' style='width: 100%; text-align: right;' readonly value='0'/></td>");
					columnArray.push("<td style='width: 14%;'><input id='balancetotal1' class='form-control' style='width: 100%; text-align: right;' readonly value='" + lorryhirecharges + "'/></td>");
					columnArray.push("<td style='width: 15%;'></td>");
					
					$('#reportTable tfoot').empty();
					$('#reportTable tfoot').append("<tr>" + columnArray.join(' ') + "</tr>");
										
					$('#paymentType').on('change', function() {
						let paymentTypeVal = $('#paymentType').val(); 
						
						$('.dueAmounts').each((el, index) => {
							let id	= index.id.split('_')[1];
							let dueAmt = index.value;
						
							if (paymentTypeVal == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID) {
								$('#amount' + id).val(dueAmt);
								$('#balanceAmount' + id).val(0);	
								$('#sumtotal1').val(totalAmount);	
								$('#balancetotal1').val(0);
							} else {
								$('#balanceAmount' + id).val(dueAmt);
								$('#amount' + id).val(0);
								$('#balancetotal1').val(totalAmount);
								$('#sumtotal1').val(0);	
							}
						});
					});

					$("#btSubmit").on("click" ,function() {
						if($('#reportTable :input[type="checkbox"]:checked').length >= Number(loadingHamaliSettlementconfiguration.maxNoOfLSForSettlement)){
							showAlertMessage('info','Can Not Settle More Than '+ Number(loadingHamaliSettlementconfiguration.maxNoOfLSForSettlement) + 'LS');
							return false;
						}
						
						_this.settleHamali();
					});
				}, mapReponseUnloadingtoLoading : function(response) {
					return {
							loadingHamaliSettlementList:
								response.unloadingHamaliSettlementList
								.map(r => ({
								  lsNumber: r.turNumber,
								  lsDate: r.receivedLedgerDate,
								  lsSource: r.lsSource,
								  lsDestination: r.lsDestination,
								  truckNumber: r.truckNumber,
								  lsSourceBranchId: r.lsSourceBranchId,
								  destinationBranchId: r.lsDestinationBranchId,
								  lsCreationDateString: r.receivedLedgerDateString,
								  pendingHamaliDetailsId: r.pendingUnloadingHamaliDetailsId,
								  dueAmount: r.dueAmount,
								  settleAmount: r.settleAmount,
								  paymentStatusId: r.paymentStatusId,
								  totalHamaliAmount: r.totalUnloadingHamaliAmount,
								  pendingHamaliSettlementStatus: r.status
								}))
						}
				}, responseAfterSettle : function(response) {
					exepenseVoucherDetailsIdArr		= response.exepenseVoucherDetailsIdArr;
					PaymentVoucherSequenceNumberArr = response.PaymentVoucherSequenceNumberArr;
					doneTheStuff	= false;

					$("#lsHamaliDetailsBtn").addClass('hide');
					$("#dateDiv").addClass('hide');
					$("#middle-border-boxshadow").addClass('hide');
					$("#bottom-border-boxshadow").addClass('hide');
					$("#left-border-boxshadow").addClass('hide');
					$("#searchBy").addClass('hide');
					$(".numberAndBranchDiv").addClass('hide');
					$(".vehicleNumberDiv").addClass('hide');
					$("#vehicleAgentNameDiv").addClass('hide');
					$("#searchBtnDiv").addClass('hide');
					$("#lsHamaliSummaryTableDivBtn").addClass('hide');
					$("#bottom-border-boxshadow").addClass('hide');
					$("#viewAddedPaymentDetailsCreate").addClass('hide');
					$("#searchByOption").val(0)
					$("#searchByOptionUnloading").val(0);
					$("#viewAddedPaymentDetailsCreate").addClass("hide");
					hideLayer();
					
					if(response.message != undefined) {
						if(exepenseVoucherDetailsIdArr != null && exepenseVoucherDetailsIdArr.length > 0) {
							$("#reprintOption").removeClass("hide");
							$("#reprintOption").empty();
							
							for(let m = 0 ; m < exepenseVoucherDetailsIdArr.length ; m++) {
								if(exepenseVoucherDetailsIdArr[m] > 0 && PaymentVoucherSequenceNumberArr != null) {
									let	printBtn = $('<b>Voucher No :</b> ' + PaymentVoucherSequenceNumberArr[m] + '&emsp;<button type="button" onclick="openPrint('+exepenseVoucherDetailsIdArr[m]+')" value="'+exepenseVoucherDetailsIdArr[m]+'" name="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" id="reprintBtn'+exepenseVoucherDetailsIdArr[m]+'" class="btn btn-success" data-tooltip="Reprint">Reprint</button><div class="row">&nbsp;</div>')
									$('#reprintOption').append(printBtn);
								}
							}
						}
				
						lsNumberArrCount = new Array();
					}
				}, setHamaliSummaryDetails : function(loadingHamaliSettlementList) {
					let columnArray						= new Array();

					for (const element of loadingHamaliSettlementList) {
						let obj					= element;

						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsCreationDateString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsSource + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.lsDestination + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.truckNumber + "</td>");
						$('#lsDetails tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];
					}
				}, settleHamali : function(){
					let table	= $("#reportTable");
					let count	= parseFloat(table[0].rows.length-1);
					let _this	= this;
					let lsObj	= new Object;

					let jsonObject		= new Object();
					let checkBoxArray	= new Array();

					$.each($("input[name=singleCheckBox]:checked"), function(){
						checkBoxArray.push($(this).val());
					});
					
					if(checkBoxArray.length == 0) {
						showAlertMessage('error', 'Please Select At least One Check Box !');
						hideLayer();
						return;
					}
					
					for (let row = count; row > 0; row--) {
						if(table[0].rows[row].cells[0].firstChild.checked) {
							let pendingHamaliDetailsId = table[0].rows[row].cells[0].firstChild.value;

							if(!validateInputTextFeild(1, 'amount' + pendingHamaliDetailsId, 'amount' + pendingHamaliDetailsId, 'error', amountEnterErrMsg))
								return false;
							
							if($('#paymentType' + pendingHamaliDetailsId).val() == 0 ){
								$("#paymentType" + pendingHamaliDetailsId).focus();
								showAlertMessage('error', ' Please Select Payment Type');
								return false
							}
								
							if(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) == Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
								if(Number($('#amount' + pendingHamaliDetailsId).val()) > Number($('#lorryHireAmount' + pendingHamaliDetailsId).val())){
									showAlertMessage('info', 'You can not enter greater value than ' + Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()));
									return false;
								}
									
								if(Number($('#amount' + pendingHamaliDetailsId).val()) > Number($('#lorryHireAmount' + pendingHamaliDetailsId).val())) {
									$("#amount" + pendingHamaliDetailsId).css("border-color", "red");
									$("#amount" + pendingHamaliDetailsId).focus();
									showAlertMessage('info', 'You can not enter greater value than ' + $('#lorryHireAmount' + pendingHamaliDetailsId).val());
									return false;
								}
							} else if(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
								if(Number($('#amount' + pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
									showAlertMessage('info', 'You can not enter greater value than ' + Number($('#balanceAmount1' + pendingHamaliDetailsId).val()));
									$("#amount" + pendingHamaliDetailsId).css("border-color", "red");
									$("#amount" + pendingHamaliDetailsId).focus();
									return false;
								}
							}

							if(Number($('#paymentType' + pendingHamaliDetailsId).val()) == PAYMENT_TYPE_STATUS_CLEAR_PAYMENT_ID){
								if(Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) == Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
									if(Number($('#amount' + pendingHamaliDetailsId).val()) < Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
										showAlertMessage('info', 'You can not enter less value than ' + Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()));
										return false;
									}
								} else if (Number($('#lorryHireAmount' + pendingHamaliDetailsId).val()) > Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
									if(Number($('#amount' + pendingHamaliDetailsId).val()) < Number($('#balanceAmount1' + pendingHamaliDetailsId).val())){
										showAlertMessage('info', 'You can not enter less value than ' + Number($('#balanceAmount1' + pendingHamaliDetailsId).val()));
										return false;
									}
								}
							}

							if(!validateInputTextFeild(1, 'remark' + pendingHamaliDetailsId, 'remark' + pendingHamaliDetailsId, 'error', ramarkErrMsg)) {
								return false;
							}

							if($('#paymentMode' + pendingHamaliDetailsId).val() == 0){
								$("#paymentMode" + pendingHamaliDetailsId).focus();
								showAlertMessage('info', 'Please select Payment Mode ');
								return false;
							}

							let lsDetailsObject = new Object();
							
							if ($("#hamaliTypeLoading").is(":checked")) {
								lsDetailsObject.pendingHamaliDetailsId		= pendingHamaliDetailsId;
								lsDetailsObject.lsNumber					= $('#LSNumber' + pendingHamaliDetailsId).val();
							} else {
								lsDetailsObject.pendingUnloadingHamaliDetailsId		= pendingHamaliDetailsId;
								lsDetailsObject.TURNumber					= $('#LSNumber' + pendingHamaliDetailsId).val();
							}
							
							lsDetailsObject.balanceAmount				= $('#balanceAmount' + pendingHamaliDetailsId).val();
							lsDetailsObject.Amount						= $('#amount' + pendingHamaliDetailsId).val();
							lsDetailsObject.tdsOnAmount					= $('#amount' + pendingHamaliDetailsId).val();
							lsDetailsObject.tdsAmount					= $('#tdsamount' + pendingHamaliDetailsId).val();
							lsDetailsObject.tdsRate						= $('#tdsRate' + pendingHamaliDetailsId).val();
							lsDetailsObject.PanNumber					= $('#panNumber' + pendingHamaliDetailsId).val();
							lsDetailsObject.TanNumber					= $('#tanNumber' + pendingHamaliDetailsId).val();
							lsDetailsObject.lorryHireAmount				= $('#lorryHireAmount' + pendingHamaliDetailsId).val();
							lsDetailsObject.remark						= $('#remark' + pendingHamaliDetailsId).val();
							lsDetailsObject.paymentType					= $('#paymentMode' + pendingHamaliDetailsId).val();
							lsDetailsObject.branchId					= $("#branchEle").val();
							lsDetailsObject.paymentStatus				= $('#paymentType' + pendingHamaliDetailsId).val();
							
							if ($("#hamaliTypeLoading").is(":checked")) {
								lsObj['pendingHamaliDetails_' + pendingHamaliDetailsId]	= lsDetailsObject;
							} else {
								lsObj['pendingUnloadingHamaliDetailsId_' + pendingHamaliDetailsId]	= lsDetailsObject;
							}
						}
					}
					
					jsonObject["lsObjData"]						= JSON.stringify(lsObj);
					jsonObject["loadingSheetIds"]				= checkBoxArray.join(',');
					
					let paymentValues		  = new Array();
					
					$('input[name=singleCheckBox]:checked').each(function() {
						let pendingHamaliDetailsId = this.value;
					
						if($("#paymentDataTr_" + pendingHamaliDetailsId +' #paymentCheckBox').val() != undefined) {
							paymentValues.push($("#paymentDataTr_" + pendingHamaliDetailsId +' #paymentCheckBox').val());
						}
					});
					
					jsonObject["paymentValues"]						= paymentValues.join(',');
					
					$.confirm({
						content: 'Confirm!',
						modalWidth	:	30,
						confirmButtonClass	: 'btn-success',
						title		:	'Settle Hamali Amount',
					});
				
					$(".confirm").css({ 'width' : '5%', 'transform': 'translate(-0%, -0%)','position' : 'initial','min-width':'90px' }).attr('data-bs-dismiss', 'modal');
					$('.cancel').attr('data-bs-dismiss', 'modal');
					$('.close').attr('data-bs-dismiss', 'modal');
					
					$(".confirmation-modal").each(function() {
						if ($(this).data("fixed")) return;
						$(this).find(".close").addClass("btn-close").text("");
						$(this).find(".modal-header").prepend($(this).find(".modal-title"));
						$(this).data("fixed", true)
					})
					
					setTimeout(function() { 
						$('.confirm').focus();
					}, 600);
					
					$(document).ready(function() {
						$('.confirm').off('click').one('click', function() {
							$('#lsHamaliDetails').addClass('collapse');
							$('#lsHamaliDetails').removeClass('show');
							$('#lsHamaliDetailsBtn').hide()
							$('#bottom-border-boxshadow').hide();
							$("#viewAddedPaymentDetailsCreate").addClass("hide");
						   
							if (!doneTheStuff) {
								$('.confirm').modal('hide');
								
								doneTheStuff = true;
								
								if ($("#hamaliTypeLoading").is(":checked")) {
									getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/settleLoadingHamali.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
									hideLayer();
								} else if($("#hamaliTypeUnloading").is(":checked")) {
									getJSON(jsonObject, WEB_SERVICE_URL + '/loadingHamaliSettlementWS/settleUnloadingHamali.do', _this.responseAfterSettle, EXECUTE_WITH_ERROR);
									hideLayer();
								}
							}
						});
					});
				}
			});
		});

function calculateTotal() {
    let inputs 		= document.querySelectorAll('.inputAmount');
    let sumAmounts 	= 0;
    let sumBalances = 0;

	inputs.forEach(function(input) {
		let id = input.id.replace('amount', '');
		let amountVal = parseFloat(input.value) || 0;
		let balanceVal = parseFloat($('#balanceAmount' + id).val()) || 0;

		sumAmounts 	+= amountVal;
		sumBalances += balanceVal;
	});

    $('#sumtotal1').val(sumAmounts);
    $('#balancetotal1').val(sumBalances);
}

function selectAllData(param){
	$(".singleCheckBox").prop('checked', param)
}

function openPrint(exepenseVoucherDetailsId){
	if(BranchExpenseConfiguration != null && BranchExpenseConfiguration.branchExpensePrintNewFlowAllow) {
		window.open('BranchExpensePrint.do?pageId=25&eventId=43&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} else {
		window.open('BranchExpensePrint.do?pageId=25&eventId=16&voucherDetailsId=' + exepenseVoucherDetailsId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	}
}

function onPaymentModeSelect(billId,obj){
	$('#uniqueWayBillId').val(billId);
	$('#uniqueWayBillNumber').val($('#LSNumber' + billId).val());
	$('#uniquePaymentType').val($('#paymentMode' + billId).val());
	$('#uniquePaymentTypeName').val($("#paymentMode" + billId + " option:selected").text());
		
	hideShowBankPaymentTypeOptions(obj);
}

function changeClearPayment(id, obj, input2) {
	let options = obj.value

	if (options == 2) {
		let input1 = $(`#amount${id}`);
		input1.val(input2)
		let input2Field = $(`#balanceAmount${id}`);
		input2Field.val('0') 
		calculateTotal()
	} else {
		let input1 = $(`#amount${id}`);
		input1.val('0')
		let input2Field = $(`#balanceAmount${id}`);
		input2Field.val(input2)
		calculateTotal()
	}				
}