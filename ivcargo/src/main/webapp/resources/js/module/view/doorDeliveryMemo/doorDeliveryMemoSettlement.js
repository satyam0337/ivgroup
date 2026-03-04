let tableData					= new Array(),
branchList,
chargesNameHM = {},
chargIdWiseHM = {},
paymentTypeArr	= null,
paymentTypeRcvAtGodownArr	= null,
PaymentTypeConstant	= {},
ModuleIdentifierConstant  = {},
deliveryRunSheetSummaryList = null,
deliveryChargesHm		=	{};
var moduleId = 0;
var waybillStatusMap	= null;
define([  
          'selectizewrapper'
		  ,'JsonUtility'
		  ,'autocomplete'
		  ,'autocompleteWrapper'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES + '/resources/js/filterTable/excel-bootstrap-table-filter-bundle.js'
         , '/ivcargo/js/generic/CreateDOM.js'
		],
          function(Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(), _this = '', deliveryRunSheetLedgerVehicleId = 0, deliveryRunSheetLedgerVehicleNumber = null,
	deliveryRunSheetLedgerId = 0, wayBillIdList = null, ddmSettlementAllow = true;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/doorDeliveryMemoSettlementWS/getConfigurationForDDMSettlement.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			let paymentHtml 			= new $.Deferred();
					
			loadelement.push(baseHtml);
			loadelement.push(paymentHtml);
					
			tableData					= response.tableConfig.columnConfigurationList;
			branchList					= response.branchList;
			chargesNameHM 				= response.chargesNameHM;
			chargIdWiseHM				= response.chargIdWiseHM;
			paymentTypeArr				= response.paymentTypeArr;
			PaymentTypeConstant			= response.PaymentTypeConstant;
			ModuleIdentifierConstant	= response.ModuleIdentifierConstant;
			moduleId					= ModuleIdentifierConstant.DDM_SETTLEMENT;
			paymentTypeRcvAtGodownArr	= response.paymentTypeRcvAtGodownArr;
			
			$("#mainContent").load("/ivcargo/html/module/ddm/doorDeliveryMemoSettlement.html", function() {
				baseHtml.resolve();
			});
			
			$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelection.html", function() {
				paymentHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				setIssueBankAutocomplete();
				setAccountNoAutocomplete();
				
				_this.setDDMBranch();

				hideLayer();
				
				$("#searchBtn").click(function() {
					_this.onSubmit();								
				});
				
				$("#receive").click(function() {
					_this.forwardToDDMSettlement();
				});
				
			});
		}, setDDMBranch : function() {
			_this.setDDMDestBranchAutocompleteInstance();
			
			let autoSelectType = $("#ddmBranchEle").getInstance();
			
			$( autoSelectType ).each(function() {
				this.option.source = branchList;
			})
		}, setDDMDestBranchAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'branchId';
			autoSelectTypeName.field 		= 'branchName';

			$("#ddmBranchEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();

			jsonObject["DDMNumber"] 	= $('#DDMNumberEle').val();
			jsonObject["branchId"] 			= $('#ddmBranchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/doorDeliveryMemoSettlementWS/getDataForDDMSettlement.do', _this.setDdmData, EXECUTE_WITH_ERROR);
		}, setDdmData : function(response) {
			showLayer();
			$('#reportData1 tbody').empty();
			$('#DDMSettlementLedgerDetailsTbl thead').empty();
			$('#DDMSettlementLedgerDetailsTbl tbody').empty();
			$('#DDMSettlementLedgerDetailsTbl tfoot').empty();
			$('#lrDetailsForDDMSettle thead').empty();
			$('#lrDetailsForDDMSettle tbody').empty();
			$('#lrDetailsForDDMSettle tfoot').empty();
			$('#showHideDDMDetailsButtonDiv').addClass('hide');
			$('#deliveryDataTable').addClass('hide');
			resetPaymentModel();
			
			if(response.message != undefined) {
				hideLayer();
				return;
			}
		
			if(response.deliveryRunSheetLedgerList != undefined) {
				let	deliveryRunSheetLedgerList 		= response.deliveryRunSheetLedgerList;
				deliveryRunSheetSummaryList 	= response.deliveryRunSheetSummaryList;
				deliveryChargesHm 		= response.wbIdWiseDeliveryCharges;
				ddmSettlementAllow		= response.ddmSettlementAllow;
				wayBillIdList			= response.wayBillIdList;
				waybillStatusMap		= response.waybillStatusMap;
				
				$('#DDMSettlementLedgerDetailsDiv').removeClass('hide');
				$('#showHideDDMDetailsButtonDiv').removeClass('hide');
				
				if(deliveryRunSheetLedgerList.length > 1){
					_this.setDeliveryRunSheetData(deliveryRunSheetLedgerList, true);
					
					$('.settleDdm').click(function(event) {
						_this.viewDdmDetails((event.target.id));
					});
				} else {
					let deliveryRunSheetLedger = deliveryRunSheetLedgerList[0];
					deliveryRunSheetLedgerId	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					deliveryRunSheetLedgerVehicleId	= deliveryRunSheetLedger.deliveryRunSheetLedgerVehicleId;
					deliveryRunSheetLedgerVehicleNumber	= deliveryRunSheetLedger.deliveryRunSheetLedgerVehicleNumber;
					
					$('#deliveryDataTable').removeClass('hide');
					
					_this.setDeliveryRunSheetData(deliveryRunSheetLedgerList, false);
					/*Header data Start*/
					 _this.setHeaderRow(false,'lrDetailsForDDMSettle'); 
					/*header data End*/
					
					/*Table data Start*/		
					_this.setTableDataRow(deliveryRunSheetSummaryList,false,'lrDetailsForDDMSettle'); 
					$('#dispatchtable').excelTableFilter();
					/*Table data End*/	  
			
					/*Footer data Start*/
					_this.setFooterRow(deliveryRunSheetSummaryList,false,'lrDetailsForDDMSettle');
					/*Foor data End*/	
				}
			}				
		}, setDeliveryRunSheetData : function(dlyRunSheetLedgerList, isMultiple) {
			let columnArray				= [];
					
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> DDM No.</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> Date</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> From</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> To</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> Truck No.</th>");
			columnArray.push("<th style='text-align: left; vertical-align: middle;'> Driver Name</th>");
			
			if(isMultiple)
				columnArray.push("<th style='text-align: left; vertical-align: middle;'> Settle</th>");
			
			$('#DDMSettlementLedgerDetailsTbl thead').append('<tr>' + columnArray.join(' ') + '</tr>');
			columnArray	= [];
			
			for(const element of dlyRunSheetLedgerList) {
				let dlyObj = element;
				
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.deliveryRunSheetLedgerDDMNumber +"</td>");
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.creationDateTimeString +"</td>");
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.deliveryRunSheetLedgerSourceBranchName +"</td>");
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.deliveryRunSheetLedgerDestinationBranchName +"</td>");
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.deliveryRunSheetLedgerVehicleNumber +"</td>");
				columnArray.push("<td style='text-align: left; vertical-align: middle;' class='bold fontSize15px'> "+ dlyObj.deliveryRunSheetLedgerDriverName +"</td>");
				
				if(isMultiple)
					columnArray.push("<td style='text-align: left; vertical-align: middle;'> <button type='button' class='btn btn-danger btn-sm settleDdm' id='settle_"+ dlyObj.deliveryRunSheetLedgerId +"_"+ dlyObj.deliveryRunSheetLedgerVehicleId +"_"+  dlyObj.deliveryRunSheetLedgerVehicleNumber+"' ></button></td>");
				
				$('#DDMSettlementLedgerDetailsTbl tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
			}
				
		}, viewDdmDetails : function(ddmValues) {
			let dlyRunSheetLedgerId = ddmValues.split('_')[0];
			let vehicleId = ddmValues.split('_')[1];
			let vehicleNo = ddmValues.split('_')[2];
			
			let jsonObject		= new Object();
			jsonObject.deliveryRunSheetLedgerId	= Number(dlyRunSheetLedgerId);
			jsonObject.vehicleNumberId			= Number(vehicleId);
			jsonObject.vehicleNumber			= vehicleNo;
			jsonObject.branchId					= $('#ddmBranchEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/doorDeliveryMemoSettlementWS/getDataForDDMSettlement.do', _this.setDdmData, EXECUTE_WITH_ERROR);
		}, setHeaderRow: function(showCheckBox, tableId) {
			let headerColumnArray		= new Array();
			$('#'+tableId+' thead').empty();
					
			headerColumnArray.push("<th class='checkBox'  style='width:px;font-size:px;'><input type='checkBox' onclick='selectAllWayBills(this.checked);' id='selectAll'></th>");
					
			for (const element of tableData) {
				let showColumn				= element.show;
				let value					= element.dataDtoKey;
				let columnDisplayCssClass	= element.columnDisplayCssClass;
				let columnWidth				= element.columnWidth;
				let fontSize				= element.fontSize;
				let header					= element.title;
								
				if(showColumn) {
					if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined){
						let chargeId = chargIdWiseHM[value];
								
						if(chargeId != undefined && chargeId != 'undefined' && Number(chargeId) > 0)
							columnWidth	= 60;
					}
					
					headerColumnArray.push("<th class='"+columnDisplayCssClass+" "+value+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>"+header+"</th>");
				}
			}
			
			headerColumnArray.push("<th class='' style='width:100px'> Rcv Dly AS </th>");
			headerColumnArray.push("<th class='' style='width:'> Delivery Details </th>");
			headerColumnArray.push("<th class='' style='width:'> Receiver Name </th>");
			headerColumnArray.push("<th class='' style='width:'> Delivery Amount </th>");
			
			$('#' + tableId + ' thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
		}, setTableDataRow: function(deliveryFinalArr, showCheckBox, tableId) {
			let columnArray				= new Array();
			let count					= 0;
			
			for (const element of deliveryFinalArr) {
				let obj			= element;
				let chargesMap	= deliveryChargesHm[Number(obj["deliveryRunSheetSummaryWayBillId"])];
				
				if(chargesNameHM != undefined && chargesNameHM != null) {
					for(let chargeId in chargesNameHM) {
						let chargeName	= chargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
					}
				}
			}
			
			$('#' + tableId + ' tbody').empty();
					
				for (const element of deliveryFinalArr) {
					let obj = element;
					count = count + 1;
					let wayBillId 		= obj.deliveryRunSheetSummaryWayBillId;
					let wayBillNumber 	= obj.wayBillNumber;
					
					let chargesHm	= {};
					let wayBillStatusCheck			= false;
					
					let wayBillStatus 					= obj.wayBillStatus;
					let deliveryRunSheetSummaryStatus	= obj.deliveryRunSheetSummaryStatus;
					let isAllowPaymentType 				= obj.allowPaymentType;
					let isNormalWayBill					= wayBillStatus == WAYBILL_STATUS_DUEDELIVERED;
					let dlyAmt 							= obj.deliveryRunSheetSummaryDeliveryAmount;
					let bookingTotal = 0.00;
					
					if(obj.wayBillTypeId == WAYBILL_TYPE_TO_PAY)
						bookingTotal = obj.bookingTotal;
					
					let disabledAttr  = isAllowPaymentType ? "" : "disabled";
					
					if(deliveryRunSheetSummaryStatus == WAYBILL_STATUS_DUEDELIVERED || deliveryRunSheetSummaryStatus == WAYBILL_STATUS_PARTIAL_DUEDELIVERED)
						wayBillStatusCheck = true;
						
					if(deliveryChargesHm != null)
						chargesHm	= deliveryChargesHm[wayBillId];
					
					let checkboxHtml = wayBillStatusCheck ? "<input type='checkbox' id='checkBox_" + wayBillId + "' value='" + wayBillId + "' onclick='onCheckBoxClick(this, " + wayBillId + ")'>" : "";
					
					columnArray.push("<td class='checkBoxdatatd' style='text-align: center; vertical-align: middle; font-size:15px;'>" + checkboxHtml + "</td>");
					columnArray.push("<td style='display: none;'><input type='hidden' id='wayBillStatus_" + wayBillId + "' value='" + wayBillStatus + "' /></td>");
					columnArray.push("<td style='display: none;'><input type='hidden' id='deliveryRunSheetSummaryStatus_" + wayBillId + "' value='" + deliveryRunSheetSummaryStatus + "' /></td>");
					columnArray.push("<td style='display: none;'><input type='hidden' id='allowPaymentType_" + wayBillId + "' value='" + isAllowPaymentType + "' /></td>");

					for (const element1 of tableData) {
						let showColumn				= element1.show;
						let value					= element1.dataDtoKey;
						let columnDisplayCssClass	= element1.columnDisplayCssClass;
						let columnWidth				= element1.columnWidth;
						let fontSize				= element1.fontSize;

						if(showColumn) {
							let cellContent;
							
							if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined) {
								let chargeId = chargIdWiseHM[value];
								let chargeValue = 0;
								
								if(chargeId != undefined && chargeId != 'undefined' && Number(chargeId) > 0) {
									if (chargesHm && chargesHm != undefined && Object.keys(chargesHm).length != 0) {
										chargeValue = chargesHm[chargeId];
										
										if(chargeValue == undefined || chargeValue == 'undefined')
											chargeValue	= 0;
									}
										
									columnWidth	= 60;
									cellContent = "<input type='text' " +
								    "id='charges_" + wayBillId + "_" + chargeId + "' value='" + chargeValue + "' maxlength='4' " +
								    "oninput='this.value=this.value.replace(/[^0-9]/g, \"\").slice(0,6); if(this.value === \"\") this.value = \"0\";' " +
								    "onkeyup='calculateTotal(" + wayBillId + ","+ bookingTotal +"); calculateSingleChargeTotal("+ chargeId+")' "+ disabledAttr +" />";
								} else {
						       		cellContent = obj[value];
						    	}
							} else {
						        cellContent = obj[value];
						    }
						
						    columnArray.push( "<td class='" + columnDisplayCssClass + " bold fontSize15px' id='" + value + "_" + obj["deliveryRunSheetSummaryWayBillId"] + "' " +
						        "style='width:" + columnWidth + "px;font-size:" + fontSize + "px;'>" + cellContent +"</td>" );
						 }
					}	
					
					columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:15px; width:190px;'><select style='width: 200px;' name='paymentType_" + wayBillId + "' id='paymentType_" + wayBillId + "' onchange=\"setValueToInnerTableOnPaymentModeChange(" + wayBillId + ", '" + wayBillNumber + "');\" class='form-control width-150px form-select' data-tooltip='Payment Type'></select></td>");
					columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:15px;' id='dlyCell_"+wayBillId +"'><input type='text' id='dlyToName_" + wayBillId + "' value='" + obj.consigneeName + "'><input type='text' id='dlyToPhoneNo_" + wayBillId + "' value='" + obj.consigneePhoneNo + "' oninput='this.value = this.value.replace(/[^0-9]/g, \"\").slice(0, 10);' maxlength='10'></td>");
					columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' id='receiverName_" + wayBillId + "' value=''></td>");
					columnArray.push("<td class='' style='text-align: center; vertical-align: middle; font-size:15px;'><input type='text' id='deliveryAmt_" + wayBillId + "' value='" + dlyAmt + "' disabled></td>");

					$('#' + tableId + ' tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					columnArray	= [];
					
					$('#paymentType_' + wayBillId).on('change', function () {
					    _this.setCreditorName(wayBillId);
					    toggleChargesOnPaymentType(wayBillId);
					});

					if(isAllowPaymentType)
						_this.setPaymentMode("paymentType_" + wayBillId, obj.wayBillTypeId, isNormalWayBill);
					else
						_this.setReceiveAtGodown("paymentType_" + wayBillId);
				}
		}, setFooterRow: function(deliveryFinalArr, showCheckBox, tableId) {
			let totalColumnArray		= new Array();
			$('#' + tableId + ' tfoot').empty();
				
			let totalDeliveryAmount = deliveryFinalArr.reduce((sum, obj) => {
			    return sum + (parseFloat(obj.deliveryRunSheetSummaryDeliveryAmount) || 0);
			}, 0);
		
			totalColumnArray.push("<td><b>Total</b></td>");
						 
			$('.checkBox').children("div").css({"width": '40px',"display":"none"});
			$('.srNo').children("div").css({"width": '60px',"display":"none"});
				
			$(".dropdown-filter-menu-search").after("<button style='margin-top:10px;' class='closeFilter'><b>Close</b></button>");
		
			let id = 0;
			
			for (const element of tableData) {
				let showColumn				= element.show;
				let value					= element.dataDtoKey;
				let columnDisplayCssClass	= element.columnDisplayCssClass;
				let columnWidth				= element.columnWidth;
				let fontSize				= element.fontSize;
				let displayColumnTotal		= element.displayColumnTotal;
						
				if(showColumn) {		
					$('.' + value + ' .dropdown-filter-dropdown').addClass('' + columnDisplayCssClass + '');
				 	$('.' + value).children("div").css("width", ''+columnWidth+'px');
					
					if(chargIdWiseHM != undefined && chargIdWiseHM != null && chargIdWiseHM[value] != undefined)
						 id = chargIdWiseHM[value];
						
					if(displayColumnTotal) {
						let total =	deliveryFinalArr.reduce((a, b) => a + (b[value] || 0), 0);
						totalColumnArray.push("<td class='"+columnDisplayCssClass+" bold fontSize15px 'id='chargeTotal_"+ id+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'> "+total+" </td>");
					} else
						totalColumnArray.push("<td class='"+columnDisplayCssClass+"' style='width:"+columnWidth+"px;font-size:"+fontSize+"px;'>  </td>");
				}
			}
			
			totalColumnArray.push("<td class='' style=''>  </td>");
			totalColumnArray.push("<td class='' style=''>  </td>");
			totalColumnArray.push("<td class='' style=''>  </td>");
			totalColumnArray.push("<td class='bold fontSize15px' style='' id='totalDly'> "+ totalDeliveryAmount +" </td>");
					
			$('#' + tableId + ' tfoot').append('<tr>' + totalColumnArray.join(' ') + '</tr>');
						
			$('td').css("padding", '4px');
		}, setReceiveAtGodown : function(elementId) {
			removeOption(elementId, null);
			createOption(elementId, 0, '---Select Mode---');
			
			if(!jQuery.isEmptyObject(paymentTypeRcvAtGodownArr)) {
				for(const element of paymentTypeRcvAtGodownArr) {
					if(element != null)
						$('#' + elementId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
				}
			}
				
			$("#" + elementId).change(function() {
				_this.setValueToTableOnPaymentModeChange(this);
				removeError(elementId);
			});
					
			$("#" + elementId).keypress(function() {
				_this.hideShowPaymentTypeDetailsNew(this, elementId);
				removeError(elementId);
			});
				
			$('#viewAddedPaymentDetailsCreate').addClass('hide');
		}, setValueToTableOnPaymentModeChange : function(obj) {
			hideShowBankPaymentTypeOptions(obj);
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
		}, hideShowPaymentTypeDetailsNew : function(obj, elementId) {
			hideShowBankPaymentTypeOptions(obj);
					
			$(document).keypress(function(e) { 
				if (e.keyCode == 27) { 
					hideBTModel();
					setTimeout(function() {
						$('#' + elementId).focus();
					}, 1000);
				} 
			});
					
			if($("#selectedDeliveryCreditorPanel").exists()) {
				if(Number(obj.value) == PAYMENT_TYPE_BILL_CREDIT_ID) {
					$('#selectedDeliveryCreditorPanel').removeClass("hide");
				} else {
					$('#selectedDeliveryCreditorPanel').addClass("hide");
					$("#billingPartyNameEle").val(0);
				}
			}
				
			$("#viewAddedPaymentDetailsCreate").removeClass("hide");
		}, setPaymentMode : function(elementId, wayBillTypeId, isNormalWayBill) {
			removeOption(elementId, null);
			createOption(elementId, 0, '---Select Mode---');
			
			if(!jQuery.isEmptyObject(paymentTypeArr)) {
				for(const element of paymentTypeArr) {
					if (wayBillTypeId != WAYBILL_TYPE_TO_PAY && element.paymentTypeId == PAYMENT_TYPE_BILL_CREDIT_ID) {
						continue; // Skip BILL_CREDIT for non TO_PAY waybills
					}
						
					if(isNormalWayBill && element.paymentTypeId == PAYMENT_TYPE_PENDING_AMOUNT_ID)
						continue;
						
					if(element != null)
						$('#' + elementId).append('<option value="' + element.paymentTypeId + '" id="' + element.paymentTypeId + '">' + element.paymentTypeName + '</option>');
				}
			}
				
			$("#" + elementId).change(function() {
				_this.setValueToTableOnPaymentModeChange(this);
				removeError(elementId);
			});
					
			$("#" + elementId).keypress(function() {
				_this.hideShowPaymentTypeDetailsNew(this, elementId);
				removeError(elementId);
			});
				
			$('#viewAddedPaymentDetailsCreate').addClass('hide');
		}, forwardToDDMSettlement : function() {
			if(!ddmSettlementAllow) {
				showMessage('error', 'You cannot settle other Branch DDM !');
				return false;
			}
			
			let newWayBillIdList = [];

			for (let wayBillId of wayBillIdList) {
			    let checkbox = document.getElementById("checkBox_" + wayBillId);
				
			    if (checkbox && checkbox.checked)
			        newWayBillIdList.push(wayBillId);
			}
			
			if (newWayBillIdList.length === 0) {
			    showMessage('error', 'Please, Select atleast one LR to Receive!');
				return false;
			}
			
			for (let wayBillId of newWayBillIdList) {
			     let selectElem 			= document.getElementById("paymentType_" + wayBillId);
				 let allowPaymentType 		= document.getElementById("allowPaymentType_" + wayBillId);
   				 let paymentTypeId 			= selectElem ? selectElem.value : 0;
   				 let allowPaymentTypeFlag 	= allowPaymentType ? allowPaymentType.value : false;
   				 
			    if ((allowPaymentTypeFlag == true || allowPaymentTypeFlag == 'true') && paymentTypeId <= 0) {
			        showMessage('error', 'Please, Select Payment Type!');
			        selectElem.focus();
			        selectElem.style.border = "2px solid red";
			        return false;
			    } else {
					selectElem.style.border = "";
				}
				
				let lrPaymentMode	= $('#paymentType_' + wayBillId).val();
				
				if(isValidPaymentMode(lrPaymentMode) && !$('#paymentDataTr_' + wayBillId).exists()) {
					showMessage('info', '<i class="fa fa-info-circle"></i> Please, Add Payment details for this Lr <font size="5" color="red">' + $('#wayBillNumber_' + wayBillId).text() + '</font> !');
					return false;
				}
			}
			
			if(confirm("Are you sure you want to Settle DDM ?")) {
				let jsonObj	= _this.generateJSONDataForSettlement(newWayBillIdList);
				showLayer();
				
				getJSON(jsonObj, WEB_SERVICE_URL+'/doorDeliveryMemoSettlementWS/createDoorDeliveryMemoSettelement.do', _this.setAfterSettlement, EXECUTE_WITH_ERROR);
			}
		}, setCreditorName : function(id) {
			const $targetCell = $('#dlyCell_' + id); // ID for the <td> must be set!

			const selectedPaymentType = $('#paymentType_' + id).val();
			
			if (selectedPaymentType == PAYMENT_TYPE_BILL_CREDIT_ID) {
				$targetCell.html(
			           "<div class='' id='selectedDeliveryCreditorPanel_" + id + "'>" +
			               "<b>Billing Party</b>" +
			               "<input type='hidden' id='selectedDeliveryCreditorId_" + id + "' name='selectedDeliveryCreditorId_" + id + "' value='0'/>" +
			               "<input value='' name='billingPartyNameEle_" + id + "' id='billingPartyNameEle_" + id + "' type='text' size='30' maxlength='30' " +
			               "placeholder='Creditor Name' class='form-control' " +
			           "</div>"
			       );
				
				_this.setPartyAutocomplete(id);
			} else {
				const consigneeName = $('#dlyToName_' + id).val() || ''; 
				const consigneePhone = $('#dlyToPhoneNo_' + id).val() || '';

		 		$targetCell.html(
			         "<input type='text' id='dlyToName_" + id + "' value='" + consigneeName + "'>" +
			          "<input type='text' id='dlyToPhoneNo_" + id + "' value='" + consigneePhone + "' " +
			          "oninput='this.value = this.value.replace(/[^0-9]/g, \"\").slice(0, 10);' maxlength='10'>"
			      );
			}
		}, setPartyAutocomplete : function (id) {
			Selectizewrapper.setAutocomplete({
				url				: 	WEB_SERVICE_URL+'/autoCompleteWS/getTBBPartyDetailsAutocomplete.do?',
				valueField		:	'corporateAccountId',
				labelField		:	'corporateAccountDisplayName',
				searchField		:	'corporateAccountDisplayName',
				elementId		:	'billingPartyNameEle_' + id,
				responseObjectKey : 'result',
				create			: 	false,
				maxItems		: 	1
			});
		}, generateJSONDataForSettlement : function(newWayBillIdList){
			let jsonObj	= new Object();
			jsonObj.deliveryRunSheetLedgerId	= deliveryRunSheetLedgerId;
			jsonObj.vehicleNumberMasterId		= deliveryRunSheetLedgerVehicleId;
			jsonObj.vehicleNo					= deliveryRunSheetLedgerVehicleNumber;
			jsonObj.deliveryPaymentType0		= 0;;
		
			let wbWiseObj	= new Array();
			let chargeValues = [];
			
			newWayBillIdList.forEach(function(uniqueId) {
				let wbDetailsObj	= new Object();
				
				wbDetailsObj.wayBillId					= uniqueId; 
				wbDetailsObj.deliveryContactDetailsWayBillNumber	= $('#wayBillNumber_' + uniqueId).text();
				wbDetailsObj.deliveryContactDetailsPaymentType		= $('#paymentType_' + uniqueId).val();
				wbDetailsObj.deliveryContactDetailsDeliveredToName	= $('#dlyToName_' + uniqueId).val();
				wbDetailsObj.deliveryContactDetailsDeliveredToNumber= $('#dlyToPhoneNo_' + uniqueId).val();
				wbDetailsObj.deliveryContactDetailsreceiverToName	= $('#receiverName_' + uniqueId).val();
				wbDetailsObj.wayBillStatus							= $('#wayBillStatus_' + uniqueId).val();
				wbDetailsObj.deliveryRunSheetSummaryStatus			= $('#deliveryRunSheetSummaryStatus_' + uniqueId).val();
				wbDetailsObj.deliveryTdsOnAmount					= getTDSOnAmount(uniqueId);
				
				let billingPartyId = $('#billingPartyNameEle_' + uniqueId).val();
				
				if(isNaN(billingPartyId))
					billingPartyId = 0;
				
				wbDetailsObj.billingCreditorId						= billingPartyId;
				
				if(chargesNameHM != undefined && chargesNameHM != null) {
					for(let chargeId in chargesNameHM) {
						let chargeVal = $('#charges_' + uniqueId + '_' + chargeId).val();
						
						if(chargeVal != undefined && Number(chargeVal) > 0) {
						    chargeValues.push({
						        wayBillId: uniqueId,
						        wayBillDeliveryChargesId: chargeId,
						        wayBillDeliverychargeAmount: chargeVal
						    });
						}
					}
				}
				
				wbWiseObj.push(wbDetailsObj);
			});
			
			jsonObj.wayBillColl					= JSON.stringify(wbWiseObj);
			jsonObj.chargeValues				= JSON.stringify(chargeValues);
			
			let rowCount 		= $('#storedPaymentDetails tr').length;
			
			if(!$('#storedPaymentDetails').is(':empty') && rowCount > 0) {
				let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');
		
				jsonObj.paymentValues	= paymentCheckBoxArr.join(',');
			}
			
			return jsonObj; 
		}, setAfterSettlement : function(response) {
			if(response.message != undefined) {
				var message = response.message;
				hideLayer();
				
				if(message != undefined && message.typeName	 != undefined && response.message.typeName == 'success'){
					let deliveryRunSheetId	= response.deliveryRunSheetLedgerId;
					setTimeout(function() { 
						window.open('DDMSettlementPrint.do?pageId=305&eventId=4&deliveryRunSheetLedgerId='+deliveryRunSheetId);
					}, 100);
					
					setTimeout(function(){ 
						location.reload(); 
					}, 1000);
				} else
					return;
			}
		}
	});
});

function setValueToInnerTableOnPaymentModeChange (id, wayBillNumber) {
	$('#uniqueWayBillId').val(id);
	$('#uniqueWayBillNumber').val(wayBillNumber);
	$('#uniquePaymentType').val($('#paymentType_' + id).val());
	$('#uniquePaymentTypeName').val($("#paymentType_" + id + " option:selected").text());
}

function showHideDDMDetailsDiv(){
	$('#DDMSettlementLedgerDetailsTbl').toggle(1000);
}

function removeError(id){
	$(id).css({"border-color": ""});
}

function calculateTotal(wayBillId, bookingTotal) {
	let dlyAmt = 0;
	
	for(let chargeId in chargesNameHM) {
		let chargeVal = $('#charges_' + wayBillId + '_' + chargeId).val();
		
		if(chargeVal != undefined && Number(chargeVal) > 0)
			dlyAmt	+= Number(chargeVal);
	}
	
	$('#deliveryAmt_'+wayBillId).val(dlyAmt + bookingTotal);
	
	let dlyFinalTotal = 0;
	
	for(const element of deliveryRunSheetSummaryList) {
		dlyFinalTotal += Number($('#deliveryAmt_' + element.deliveryRunSheetSummaryWayBillId).val());
	}
	
	$('#totalDly').text(dlyFinalTotal);
}

function calculateSingleChargeTotal(chargeId) {
	let totalChargeAmt = 0;
	
	for(const element of deliveryRunSheetSummaryList){
		totalChargeAmt += Number($('#charges_' + element.deliveryRunSheetSummaryWayBillId + '_' + chargeId).val());
	}
	
	$('#chargeTotal_' + chargeId).text(totalChargeAmt);
}

function selectAllWayBills(param) {
	let tab 	= document.getElementById("lrDetailsForDDMSettle");
	let count 	= parseFloat(tab.rows.length - 1);
	let row;

	for (row = count; row > 0; row--) {
		if(tab.rows[row].cells[0].firstElementChild)
			tab.rows[row].cells[0].firstElementChild.checked = param;
	}
}

function onCheckBoxClick(checkbox, id){
	let isNotAllow = waybillStatusMap[id];
	let paymentId = $('#paymentType_' + id).val();
	
	/*if (isNotAllow != undefined && isNotAllow != 'undefined' && isNotAllow && paymentId > 0 && paymentId != PAYMENT_TYPE_RECEIVE_AT_GODOWN_ID) {
		checkbox.checked = false;
	    alert("Please first Settle Other DDM, On This Lrs!"); 
	}*/
}

function getTDSOnAmount(wayBillId) {
	let deliveryPaymentType		= $('#paymentType_' + wayBillId).val();
	let dlyAmt		= 0;
	
	if(deliveryPaymentType == PAYMENT_TYPE_BILL_CREDIT_ID)
		return 0;
	
	if(deliveryPaymentType == PAYMENT_TYPE_CASH_ID
			|| deliveryPaymentType == PAYMENT_TYPE_CHEQUE_ID
			|| deliveryPaymentType == PAYMENT_TYPE_ONLINE_RTGS_ID
			|| deliveryPaymentType == PAYMENT_TYPE_ONLINE_NEFT_ID
			|| deliveryPaymentType == PAYMENT_TYPE_CREDIT_CARD_ID
			|| deliveryPaymentType == PAYMENT_TYPE_DEBIT_CARD_ID
			|| deliveryPaymentType == PAYMENT_TYPE_IMPS_ID
			|| deliveryPaymentType == PAYMENT_TYPE_PAYTM_ID
			|| deliveryPaymentType == PAYMENT_TYPE_UPI_ID
			|| deliveryPaymentType == PAYMENT_TYPE_PHONE_PAY_ID
			|| deliveryPaymentType == PAYMENT_TYPE_GOOGLE_PAY_ID
			|| deliveryPaymentType == PAYMENT_TYPE_WHATSAPP_PAY_ID) {
	
		dlyAmt		= $('#deliveryAmt_'+wayBillId).val();
		
		if(isNaN(dlyAmt))
			dlyAmt	= 0;
	}
	
	return dlyAmt;
}

function toggleChargesOnPaymentType(wayBillId) {

    const paymentTypeId = $('#paymentType_' + wayBillId).val();
    const isCrossingCredit = (paymentTypeId == PAYMENT_TYPE_CROSSING_CREDIT_ID);

	if(isCrossingCredit){
    	$("input[id^='charges_" + wayBillId + "_']").val(0).prop("disabled", true);
	} else
    	$("input[id^='charges_" + wayBillId + "_']").prop("disabled", false);
}
