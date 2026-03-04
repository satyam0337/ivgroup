var activeDeliveryCharges	= null;
var wayBillData				= null;
var wayBillIdWiseChargeArr		= new Array();
var wayBillIdWiseObj		= new Object();
var paymentTypeArr = new Array()
var	ModuleIdentifierConstant	= null;
var PaymentTypeConstant			= null;
var moduleId = 0;
var initialiseFocusId = 0;

define([
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	 ,"selectizewrapper"
	 ,'messageUtility'
	 ,'JsonUtility'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'
	 ,"focusnavigation"
	 ,'nodvalidation'
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
	 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'
], function(Selection, Selectizewrapper) {
	'use strict';
	let jsonObject = new Object(),_this = '', myNod, myNodDly, myNodBranch, myNodTruck, myNodLS, doneTheStuff = false, configuration = null,
	sourceAreaSelectionWithSelectize = false, reportModelHM = null, sendOTPForDelivery = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/receiveWs/loadCrossingAgentReceiveModule.do?', _this.setDetailsForReceive, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDetailsForReceive : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			moduleId	= response.moduleId;
			ModuleIdentifierConstant		= response.ModuleIdentifierConstant;
			PaymentTypeConstant				= response.PaymentTypeConstant;
			configuration					= response
			
			let loadelement				= new Array();
			let baseHtml				= new $.Deferred();
			let paymentHtml				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/receive/crossingAgentReceive.html", function() {
				baseHtml.resolve();
			});
			
			if (configuration.showPaymentModeOption) {
				$("#bankPaymentOperationPanel").load("/ivcargo/html/module/paymentTypeSelection/paymentTypeSelectionTce.html", function() {
					paymentHtml.resolve();
				});

				loadelement.push(paymentHtml);
			}
			
			$.when.apply($, loadelement).done(function() {
				let keyObject = Object.keys(response);
				
				if (configuration.showPaymentModeOption) {
					setIssueBankAutocomplete();
					setAccountNoAutocomplete();
					$("#viewAddedPaymentDetailsCreate").css("display", "block");
				}

				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute=" + element + "]").removeClass("hide");
				}
				
				sourceAreaSelectionWithSelectize		= response.sourceAreaSelectionWithSelectize;

				let elementConfiguration				= new Object();
				
				if(sourceAreaSelectionWithSelectize) {
					elementConfiguration.regionElement		= $('#regionEle');
					elementConfiguration.subregionElement	= $('#subRegionEle');
				}
				
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration				= elementConfiguration;
				response.crossingAgentSelectionWithSelectize= true;
				response.agentBranchSelection				= response.executiveTypeWiseBranch;
				response.executiveTypeWiseBranch			= false;
				response.vehicleSelectionWithSelectize		= true;
				response.isOperationalBranchSelection		= response.locationBranch;
				response.AllOptionsForOperationalBranch		= true;

				Selection.setSelectionToGetData(response);
				
				if(!sourceAreaSelectionWithSelectize) {
					$("#regionCol").remove();
					$("#subRegionCol").remove();
				}
				
				_this.makeSelection(response);
				
				$('#limitMessage').html('Only top ' + response.limit + ' Loading Sheet will be allow to receive !');
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNodBranch = nod();
				myNodBranch.configure({
					parentClass:'validation-message'
				});
				
				myNodTruck = nod();
				myNodTruck.configure({
					parentClass:'validation-message'
				});
				
				myNodLS = nod();
				myNodLS.configure({
					parentClass:'validation-message'
				});
				
				myNodDly = nod();
				myNodDly.configure({
					parentClass:'validation-message'
				});
				
				addAutocompleteElementInNode1(myNod, 'categoryEle', 'Select Proper Category !');
				
				addAutocompleteElementInNode1(myNodBranch, 'categoryEle', 'Select Proper Category !');
				addAutocompleteElementInNode1(myNodBranch, 'dispatchedFromEle', 'Select Proper Dispatched Branch !');
				
				if (sourceAreaSelectionWithSelectize) {
					addAutocompleteElementInNode1(myNodBranch, 'regionEle', 'Select Proper Region !');
					addAutocompleteElementInNode1(myNodBranch, 'subRegionEle', 'Select Proper SubRegion !');
				}
				
				addAutocompleteElementInNode1(myNodBranch, 'branchEle', 'Select Proper Source Branch !');
				
				if (sourceAreaSelectionWithSelectize) {
					addAutocompleteElementInNode1(myNodDly, 'regionEle', 'Select Proper Region !');
					addAutocompleteElementInNode1(myNodDly, 'subRegionEle', 'Select Proper SubRegion !');
				}
				
				addAutocompleteElementInNode1(myNodDly, 'branchEle', 'Select Proper Source Branch !');
				
				addAutocompleteElementInNode1(myNodTruck, 'vehicleNumberEle', 'Select Proper Truck Number !');
				addAutocompleteElementInNode1(myNodTruck, 'dispatchedFromEle', 'Select Proper Dispatched Branch !');
				
				addElementToCheckEmptyInNode1(myNodLS, 'lsNumberEle', 'Select Proper LS Number !');
				addAutocompleteElementInNode1(myNodLS, 'dispatchedFromEle', 'Select Proper Dispatched Branch !');
				
				$("#findData").click(function() {
					$('#centralizedDeliveryCreditorPanel').hide();

					if ($('#pendingDeliveryEle').is(":checked")) {
						myNodDly.performCheck();
					
						if(myNodDly.areAll('valid'))
							_this.onSubmit();
					} else if($('#categoryEle').val() == SEARCH_TYPE_BRANCH) {
						myNodBranch.performCheck();
					
						if(myNodBranch.areAll('valid'))
							_this.onSubmit();
					} else if($('#categoryEle').val() == SEARCH_TYPE_TRUCK_NUMBER) {
						myNodTruck.performCheck();
					
						if(myNodTruck.areAll('valid'))
							_this.onSubmit();
					} else if($('#categoryEle').val() == SEARCH_TYPE_LS_NUMBER) {
						myNodLS.performCheck();
					
						if(myNodLS.areAll('valid'))
							_this.onSubmit();
					} else {
						myNod.performCheck();
					
						if(myNod.areAll('valid'))
							_this.onSubmit();
					}
				});	
				
				$("#branchEle").change(function() {
					_this.hideAndResetDetails();
				});
				
				$("#pendingDeliveryEle").click(function() {
					_this.displayBranchSelectionForPendingDelivery(this);
				});
				
				$("#deliveryButton").click(function() {
					myNodDly.performCheck();
					
					if(myNodDly.areAll('valid'))
						_this.deliveryLRs();
				});

				hideLayer();
			});
		}, makeSelection : function(response) {
			let searchByOptions		= response.searchByOptions;
				
			let searchByArray		= [];
				
			for (let [key, value] of Object.entries(searchByOptions)) {
				let searchBy	= {};
					
				searchBy['searchType']		= key;
				searchBy['searchTypeName']	= value;
					
				searchByArray.push(searchBy);
			}
				
			response.searchByArray	= searchByArray;
				
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.searchByArray,
				valueField		: 'searchType',
				labelField		: 'searchTypeName',
				searchField		: 'searchTypeName',
				elementId		: 'categoryEle',
				onChange		: _this.onSearchTypeSelect
			});
			
			if($('#categoryEle').val() == SEARCH_TYPE_BRANCH) {
				$("#srcBranchSelection").removeClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			} else if($('#categoryEle').val() == SEARCH_TYPE_TRUCK_NUMBER) {
				$("#truckNumberCol").removeClass("hide");
				$("#srcBranchSelection").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			} else if($('#categoryEle').val() == SEARCH_TYPE_LS_NUMBER) {
				$("#srcBranchSelection").addClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").removeClass("hide");
			} else {
				$("#srcBranchSelection").addClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			}
			
			Selectizewrapper.setAutocomplete({
				jsonResultList	: response.dispatchedSubRegion,
				valueField		: 'subRegionId',
				labelField		: 'subRegionName',
				searchField		: 'subRegionName',
				elementId		: 'dispatchedFromEle'
			});
		}, onSearchTypeSelect : function() {
			if($('#categoryEle').val() == SEARCH_TYPE_BRANCH) {
				$("#srcBranchSelection").removeClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			} else if($('#categoryEle').val() == SEARCH_TYPE_TRUCK_NUMBER) {
				$("#truckNumberCol").removeClass("hide");
				$("#srcBranchSelection").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			} else if($('#categoryEle').val() == SEARCH_TYPE_LS_NUMBER) {
				$("#srcBranchSelection").addClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").removeClass("hide");
			} else {
				$("#srcBranchSelection").addClass("hide");
				$("#truckNumberCol").addClass("hide");
				$("#lsNumberCol").addClass("hide");
				$('#lsNumberEle').val('');
			}
		}, displayBranchSelectionForPendingDelivery : function(obj) {
			if(obj.checked) {
				$('#categorySelection').addClass('hide');
				$('#truckNumberCol').addClass('hide');
				$('#lsNumberCol').addClass('hide');
				$('#lsNumberEle').val('');
				$('#categoryEle')[0].selectize.clear();
				$('#dispatchedFromCol').addClass('hide');
				$('#srcBranchSelection').removeClass('hide');
			} else {
				$('#categorySelection').removeClass('hide');
				$('#dispatchedFromCol').removeClass('hide');
				$('#srcBranchSelection').addClass('hide');
			}
			
			_this.hideAndResetDetails();
		}, hideAndResetDetails : function() {
			$('#middle-border-boxshadow').addClass('hide');
			$('#bottom-border-boxshadow').addClass('hide');
			$('#left-border-boxshadow').addClass('hide');
			removeTableRows('results', 'tbody');
			removeTableRows('resultsSummaryOfTotal', 'tbody');
			removeTableRows('deliveryResults', 'tbody');
		}, onSubmit : function() {
			showLayer();
			let jsonObject = new Object();
			
			jsonObject["destinationRegionId"]		= $('#regionEle').val();
			jsonObject["destinationSubRegionId"]	= $('#subRegionEle').val();
			jsonObject["destinationBranchId"]		= Number($('#branchEle').val());
			jsonObject["operationalBranchId"]		= $('#locationBranchEle').val();
			jsonObject["sourceSubRegionId"]			= $('#dispatchedFromEle').val();
			jsonObject["vehicleNumberMasterId"]		= $('#vehicleNumberEle').val();
			jsonObject["crossingAgentId"]			= $('#crossingAgentEle').val();
			jsonObject["delvieryCrossingAgentId"]	= $('#crossingAgentEle').val();
			jsonObject["lsNumber"]					= $('#lsNumberEle').val();
			jsonObject["moduleId"]					= moduleId;
			
			if ($('#pendingDeliveryEle').is(":checked"))
				getJSON(jsonObject, WEB_SERVICE_URL + '/generateCRWS/getPendingLRsForCrossingAgentDelivery.do', _this.setPendingDeliveryReportData, EXECUTE_WITH_ERROR);
			else
				getJSON(jsonObject, WEB_SERVICE_URL + '/receiveWs/getLoadingSheetToReceive.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setPendingDeliveryReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#left-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#left-border-boxshadow').removeClass('hide');
			removeTableRows('deliveryResults', 'thead');
			removeTableRows('deliveryResults', 'tbody');
			
			goToPosition('left-border-boxshadow', 'slow');
			
			_this.setWayBillDetailsForDelivery(response);
			
			$("#deliveryButton").removeClass('hide');
			$('#deliveryButton').removeClass('disabled');
		}, setReportData : function(response) {
			hideLayer();

			if(response.message != undefined) {
				_this.hideAndResetDetails();
				return;
			}
			
			removeTableRows('results', 'thead');
			removeTableRows('results', 'tbody');
				
			//Header for total summary.
			removeTableRows('resultsSummaryOfTotal', 'thead');
			removeTableRows('resultsSummaryOfTotal', 'tbody');
			
			_this.createHeader();
			_this.setResult(response);
				
			$('#middle-border-boxshadow').removeClass('hide');
			$('#bottom-border-boxshadow').removeClass('hide');
			goToPosition('bottom-border-boxshadow', 'slow');
		}, createHeader : function() {
			let headerColumnArray		= new Array();
			
			headerColumnArray.push("<th>Sr No.</th>");
			headerColumnArray.push("<th>Truck No.</th>");
			headerColumnArray.push("<th>LS No.</th>");
			headerColumnArray.push("<th>LS Date/Time</th>");
			headerColumnArray.push("<th>From Branch</th>");
			headerColumnArray.push("<th>To Branch</th>");
			headerColumnArray.push("<th>No. of LR</th>");
			headerColumnArray.push("<th>Pending LRs</th>");
			headerColumnArray.push("<th>No. of Art</th>");
			headerColumnArray.push("<th>Actual Weight</th>");
			headerColumnArray.push("<th>Driver1 (Name / Lic No)</th>");
			headerColumnArray.push("<th>Receive</th>");
			headerColumnArray.push("<th>Print TUR</th>");

			$('#results thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			
			headerColumnArray	= [];
			
			headerColumnArray.push("<th>LR Count</th>");
			headerColumnArray.push("<th>Total Quantity</th>");
			headerColumnArray.push("<th>Total Receivable Weight</th>");
			headerColumnArray.push("<th>Paid</th>");
			headerColumnArray.push("<th>To-Pay</th>");
			headerColumnArray.push("<th>TBB</th>");
			
			$('#resultsSummaryOfTotal thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
			
			//Header for total summary END
		}, setResult : function(response) {
			let receivablesModelList	= response.receDispatchLedgers;
			reportModelHM				= response.reportModelHM;
			
			if(receivablesModelList != null) {
				let dataColumnArray			= [];
				
				for(let i = 0; i < receivablesModelList.length; i++) {
					let receivablesModelObj			= receivablesModelList[i];
					let srNo						= i + 1;
		
					let dispatchLedgerId			= receivablesModelObj.dispatchLedgerId;
					let lsNumber					= receivablesModelObj.lsNumber;
						
					if(lsNumber == null)
						lsNumber = dispatchLedgerId;
					
					dataColumnArray.push("<td>" + srNo + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.vehicleNumber + "</td>");
					dataColumnArray.push("<td><a id='receiveLink_" + dispatchLedgerId + "' style='cursor: pointer' class='link-primary'>" + lsNumber + "</a></td>");
					dataColumnArray.push("<td>" + receivablesModelObj.dispatchDateTime + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.sourceBranch + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.destinationBranch + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.totalNoOfWayBills + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.totalNoOfPendingWayBills + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.totalNoOfPackages + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.totalActualWeight + "</td>");
					dataColumnArray.push("<td>" + receivablesModelObj.driverName + "</td>");
					dataColumnArray.push("<td><button type='button' id='receiveButton_" + dispatchLedgerId + "' class='btn btn-primary'>Receive</button></td>");
					dataColumnArray.push("<td><button type='button' id='printButton_" + dispatchLedgerId + "' class='btn btn-secondary'>Print</button></td>");
					
					$('#results tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					
					$("#receiveLink_" + dispatchLedgerId).bind("click", function() {
						_this.openWindowForReceivables(this);
					});
					
					$("#receiveButton_" + dispatchLedgerId).bind("click", function() {
						_this.openWindowForReceivables(this);
					});
					
					$("#printButton_" + dispatchLedgerId).bind("click", function() {
						_this.printTUR((this.id).split('_')[1]);
					});
					
					dataColumnArray			= [];
				}
				
				dataColumnArray.push("<td>" + response.totalLRS + "</td>");
				dataColumnArray.push("<td>" + response.totalDispatchQuantity + "</td>");
				dataColumnArray.push("<td>" + response.totalDispatchedWeight + "</td>");
				dataColumnArray.push("<td>" + response.paidBookingTotal + "</td>");
				dataColumnArray.push("<td>" + response.toPayBookingTotal + "</td>");
				dataColumnArray.push("<td>" + response.tbbBookingTotal + "</td>");
				
				$('#resultsSummaryOfTotal tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				//Data for total summary END.
			}
		}, openWindowForReceivables : function(obj) {
			let dispatchLedgerId	= (obj.id).split('_')[1];
			
			if(reportModelHM == null || reportModelHM == undefined || !reportModelHM.hasOwnProperty(dispatchLedgerId))
				return;
			
			let	receivablesModelObj	= reportModelHM[dispatchLedgerId];
			let lhpvId				= receivablesModelObj.lhpvId;
			
			if(configuration.validateLhpvForUnloadLS && lhpvId == 0) {
				showAlertMessage('error', "LHPV Not Created, Please Create LHPV First Then Unload the Vehicle");
				return false;
			}

			let parameters = '&selecteFilter=1&masterid='+dispatchLedgerId+'&flag='+true+'&isForceReceive='+false+'&moduleId='+moduleId;
			
			window.open ('Receive.do?pageId=340&eventId=1&modulename=receiveLRs' + parameters , 'config=height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, printTUR : function(dispatchLedgerId) {
			let jsonObject					= new Object();

			jsonObject["dispatchLedgerId"]	= dispatchLedgerId;
			
			showLayer();
			
			$.ajax({
				type		: "POST",
				url			: WEB_SERVICE_URL + '/receiveWs/checkLSIsReceived.do',
				data		: jsonObject,
				dataType	: 'json',
				success		: function(response) {
					hideLayer();
		
					if(response.message != undefined)
						return;
		
					childwin = window.open ('TURPrint.do?pageId=221&eventId=5&dispatchLedgerId='+dispatchLedgerId,'newwindow','config=height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}
			});
		}, setWayBillDetailsForDelivery : function(response) {
			let pendingDeliveryStock	= response.pendingDeliveryStock;
			activeDeliveryCharges		= response.activeDeliveryCharges;
			paymentTypeArr				= response.paymentTypeArr;
			sendOTPForDelivery			= response.sendOTPForDelivery;

			_this.createHeaderForDelivery(response);
			
			$('#dlyAllWaybills').bind("click", function() {
				_this.selectAllBills(this.checked);
			});
			
			if (configuration.showPaymentModeOption) {
				$(".allPaymentType").removeClass("hide");
				$('#paymentMode' + ' option[value]').remove();
				$('#paymentMode').append($("<option>").attr('value', 0).text("-- Please Select-----"));
	
				$(paymentTypeArr).each(function() {
					$('#paymentMode').append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
				});

				$("#paymentMode").change(function() {
				
					let selectedPaymentTypeValue = Number($(this).val());
					if (selectedPaymentTypeValue == PAYMENT_TYPE_BILL_CREDIT_ID) {
						$('#centralizedDeliveryCreditorPanel').show();
						setDeliveryCreditorAutoCompleteForAll();
						
					} else {
						$('#centralizedDeliveryCreditorPanel').hide();
						$('#centralizedDelCreditorId').val('0');
					}

					$('.selectAllPaymentMode').each(function() {
						let $this = $(this);
						let wayBillId = $this.attr('id').replace('paymentMode', '');
						let wayBillTypeId = Number($this.data('waybilltype'));

						if (selectedPaymentTypeValue == PAYMENT_TYPE_BILL_CREDIT_ID && wayBillTypeId != WAYBILL_TYPE_TO_PAY) {
							$this.val(0);
							toggleDeliveryCreditorInput(wayBillId, wayBillTypeId, 0);
						} else {
							$this.val(selectedPaymentTypeValue);
							toggleDeliveryCreditorInput(wayBillId, wayBillTypeId, selectedPaymentTypeValue);
						}
					});
				});
			}

			let dataColumnArray			= new Array();

			for(const element of pendingDeliveryStock) {
				let pds		= element;
					
				dataColumnArray.push("<td class='textAlignCenter'><input type='checkbox' class='wayBills'  name='wayBills' value='" + pds.wayBillId + "'/></td>");
				dataColumnArray.push("<td><a style='cursor:pointer;' id='lrview_" + pds.wayBillId + "' class='link-primary'><b>" + pds.wayBillNumber + "</b></a><input type='hidden' id = 'lrNumber_" + pds.wayBillId + "' value = '" + pds.wayBillNumber + "'></td>")
				dataColumnArray.push("<td>" + pds.creationDateTimeStampstr + "</td>")
				dataColumnArray.push("<td>" + pds.sourceBranch + "</td>")
				dataColumnArray.push("<td>" + pds.destinationBranch + "</td>")
				dataColumnArray.push("<td>" + pds.wayBillType + "</td>")
				dataColumnArray.push("<td>" + pds.consignorName + "</td>")
				dataColumnArray.push("<td>" + pds.consignorPhoneNo + "</td>")
				dataColumnArray.push("<td>" + pds.consigneeName + "</td>")
				dataColumnArray.push("<td>" + pds.consigneePhoneNumber + "</td>")
				dataColumnArray.push("<td>" + parseInt(pds.grandTotal) + "</td>")
				
				if (configuration.showPaymentModeOption) {
					dataColumnArray.push("<td class='paymentModeSelection'><select style='' name='paymentMode' id='paymentMode" + pds.wayBillId + "'  data-waybilltype='" + pds.wayBillTypeId + "'	onchange='onPaymentModeSelect(" + pds.wayBillId + ",this," + pds.wayBillTypeId + ");' class='form-control width-150px selectAllPaymentMode' onchange=''onfocus='' ></select></td>");
					dataColumnArray.push("<td><input class='form-control' id='deliveryCreditor_" + pds.wayBillId + "' type='text' name='deliveryCreditorEle' placeholder='Delivery Creditor' data-tooltip='deliveryCreditorEle' disabled /><input type='hidden' id='selectedDeliveryCreditorId_" + pds.wayBillId + "' name='selectedDeliveryCreditorId_" + pds.wayBillId + "' value='0' /></td>");
				}
				
				dataColumnArray.push("<td><input class='dateEle form-control' id='manualDate_" + pds.wayBillId + "' type='text' name='dateEle' data-tooltip='Date' placeholder='Select Date' readonly/></td>")
				dataColumnArray.push("<td style='display:none;'><input class='' id='turDate_" + pds.wayBillId + "' value='" + pds.creationDateTimeStampstr + "' /></td>")
				dataColumnArray.push("<td style='display:none;'><input class='' id='crossingAgentId_" + pds.wayBillId + "' value='" + pds.bookingCrossingAgentId + "' /></td>")
				
				if (configuration.allowToEnterDeliveryCharges)
					 dataColumnArray.push("<td> <button type='button' class='btn btn-primary btn-sm' style='font-size:9px;' onclick='showPopUpWindow(" + JSON.stringify(pds.wayBillNumber) + "," + pds.wayBillId +","+ pds.wayBillTypeId+")' id='DelyChrgesBtn_" + pds.wayBillId + "'>Del Charge</button></td>");

				if (sendOTPForDelivery && configuration.sendOTPForLrDelivery) {
					if (pds.otpNumber != undefined)
						dataColumnArray.push("<td><input class='form-control' id='lrOtp_" + pds.wayBillId + "' type='text' name='lrOtp' placeholder='Enter Otp'/></td>");
					else
						dataColumnArray.push("<td>&nbsp;</td>");
				}

				$('#deliveryResults tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
				dataColumnArray = [];
				
				if (configuration.showPaymentModeOption)			   
					setDeliveryCreditorAutoComplete(pds.wayBillId);

				$("input select").focus(function() {
					showInfo(this, this.placeholder);
				});
				
				$('.wayBills').on('click', function() {
					$('#dlyAllWaybills').prop('checked', $('.wayBills:checked').length == $('.wayBills').length);
				});
				
				if (configuration.showPaymentModeOption) {
					$(".viewAddedPaymentDetails").removeClass("hide");

					$('#paymentMode' + pds.wayBillId + ' option[value]').remove();
					$('#paymentMode' + pds.wayBillId).append($("<option>").attr('value', 0).text("-- Please Select-----"));

					$(paymentTypeArr).each(function() {
						$('#paymentMode' + pds.wayBillId).append($("<option>").attr('value', this.paymentTypeId).text(this.paymentTypeName));
					});
				}
					
				$("#lrview_" + pds.wayBillId).bind("click", function() {
					let elementId		= $(this).attr('id');
					let wayBillId		= elementId.split('_')[1];
					viewWayBillDetails(wayBillId, pds.wayBillNumber);
				});
				
				$("#lrOtp_" + pds.wayBillId).bind("blur", function() {
					let elementId		= $(this).attr('id');
					let wayBillId		= elementId.split('_')[1];
					_this.validateOtpInput(wayBillId, pds.otpNumber);
				});
			}
			
			$('.dateEle').SingleDatePickerCus({});
			$(".dateEle").css("width", "150px");
			$(".dateEle").css("height", "30px");
		}, createHeaderForDelivery : function() {
			let headerColumnArray		= new Array();
			
			headerColumnArray.push("<th>ALL<input type='checkbox' name='dlyAllWaybills' id='dlyAllWaybills' value='dlyAllWaybills'/></th>");
			headerColumnArray.push("<th>LR Number</th>");
			headerColumnArray.push("<th>Receive Date</th>");
			headerColumnArray.push("<th>From</th>");
			headerColumnArray.push("<th>To</th>");
			headerColumnArray.push("<th>LR Type</th>");
			headerColumnArray.push("<th>Consignor Name</th>");
			headerColumnArray.push("<th>Consignor No</th>");
			headerColumnArray.push("<th>Consignee Name</th>");
			headerColumnArray.push("<th>Consignee No</th>");
			headerColumnArray.push("<th>Grand Total</th>");
			
			if (configuration.showPaymentModeOption){
				headerColumnArray.push("<th>Payment Mode</th>");
				headerColumnArray.push("<th>Delivery Creditor</th>");
			}
				
			headerColumnArray.push("<th>Manual Date</th>");
			
			if (configuration.allowToEnterDeliveryCharges)
				headerColumnArray.push("<th>Delivery Charge</th>");
			
			if (sendOTPForDelivery && configuration.sendOTPForLrDelivery)
				headerColumnArray.push("<th>OTP</th>");
				
			$('#deliveryResults thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
		}, deliveryLRs : function() {
			let jsonObject	= {};
			
			let wayBillIdListForDly	= getAllCheckBoxSelectValue('wayBills');
			
			if(wayBillIdListForDly.length == 0) {
				showAlertMessage('error', selectLrToDeliverErrMsg);
				return;
			}
			
			for (const element of wayBillIdListForDly) {
				let wayBillId		= element;
				let manualDateValue = $('#manualDate_' + wayBillId).val().split("-");
				let manualDate		= new Date(manualDateValue[2], manualDateValue[1] - 1, manualDateValue[0]);
				let turDateValue	= $('#turDate_' + wayBillId).val().split("-");;
				let turDate			= new Date(turDateValue[2], turDateValue[1] - 1, turDateValue[0]);

				if (manualDate < turDate) {
					showAlertMessage('error', "Manual Date should not be prior than received date for LR " + $('#lrNumber_' + wayBillId).val());
					return false;
				}
				
				if (configuration.showPaymentModeOption && $('#paymentMode' + wayBillId).val() == 0) {
					$("#paymentMode" + wayBillId).focus();
					showAlertMessage('error', 'Please Select Payment Mode');
					return false
				}

				if (configuration.showPaymentModeOption && $('#paymentMode' + wayBillId).val() == PAYMENT_TYPE_BILL_CREDIT_ID && $('#selectedDeliveryCreditorId_' + wayBillId).val() == 0) {
					$("#deliveryCreditor_" + wayBillId).focus();
					showAlertMessage('error', 'Please Select Delivery Creditor');
					return false
				}
				
				if (sendOTPForDelivery && configuration.sendOTPForLrDelivery && !_this.validateAllOtpInputsBeforeSubmit(wayBillId))
					return false;
				
				jsonObject["manualCRDate_" + wayBillId]		= $('#manualDate_' + wayBillId).val();
				jsonObject["crossingAgentId_" + wayBillId]	= $('#crossingAgentId_' + wayBillId).val();
								
				if ($('#selectedDeliveryCreditorId_' + wayBillId).val() !== undefined) 
					jsonObject["selectedDeliveryCreditorId" + wayBillId]	= $('#selectedDeliveryCreditorId_' + wayBillId).val();

				if (typeof $('#paymentMode' + wayBillId).val() !== "undefined" && $('#paymentMode' + wayBillId).val() !== null)
					jsonObject["deliveryPaymentType" + wayBillId] = $('#paymentMode' + wayBillId).val();
			}
			
			if (wayBillIdWiseChargeArr.length > 0 && wayBillIdWiseChargeArr != null) {
				const result = wayBillIdWiseChargeArr.filter(item => wayBillIdListForDly.includes(item.waybillId.toString()));
				
				if (result.length > 0 && result != null)
					jsonObject['wayBillIdWiseDelChargeArr'] = JSON.stringify(result);
			}
				
			jsonObject['wayBillIdListForDly']	= wayBillIdListForDly.join(',');
			jsonObject["destinationBranchId"]	= Number($('#branchEle').val());
			
			let paymentCheckBoxArr	= getAllCheckBoxSelectValue('paymentCheckBox');
			jsonObject["paymentValues"]		= paymentCheckBoxArr.join(',');
				
			if(!doneTheStuff) {
				if(confirm('Are you sure you want to Deliver Selected LR ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/generateCRWS/deliveryCrossingAgentLR.do?', _this.setResponseAfterDelivery, EXECUTE_WITHOUT_ERROR);
					doneTheStuff = true;
					showLayer();
				} else {
					doneTheStuff = false;
					$("#deliveryButton").removeClass('hide');
					$('#deliveryButton').removeClass('disabled');
					hideLayer();
				}
			}
		}, setResponseAfterDelivery : function(response) {
			hideLayer();

			removeTableRows('deliveryResults', 'thead');
			removeTableRows('deliveryResults', 'tbody');
			$('#left-border-boxshadow').addClass('hide');
			$("[id^='paymentDataTr_']").remove();

			doneTheStuff = false;
		}, selectAllBills : function(param) {
			let tab		= document.getElementById('deliveryResults');
			let count	= parseFloat(tab.rows.length - 1);
			let row;
		
			for (row = count; row > 0; row--) {
				if(tab.rows[row].cells[0].firstElementChild)
					tab.rows[row].cells[0].firstElementChild.checked = param;
			}
		}, validateOtpInput : function(wayBillId, expectedValue) {
			let $inputElem = $('#lrOtp_' + wayBillId);
			let enteredValue = $inputElem.val();

			if (enteredValue != expectedValue) {
				if (enteredValue == "")
					showAlertMessage('error', "Please Enter OTP !");
				else
					showAlertMessage('error', "Please Enter Valid OTP !");

				$inputElem.addClass("is-invalid");
			} else
				$inputElem.removeClass("is-invalid");			
		}, validateAllOtpInputsBeforeSubmit : function(wayBillId) {
			let $input = $("#lrOtp_" + wayBillId);
						
			if ($input.length == 0)
				return;
							
			let value = $input.val().trim();
				
			if (value == "") {
				showAlertMessage('error', "Please Enter OTP !");
				return false;
			}

			if ($input.hasClass("is-invalid")) {
				showAlertMessage('error', "Please Enter Correct OTP !");
				return false;
			}

			return true;	
		}
	});
});

function showPopUpWindow(wayBillNumber, waybillId,wayBillTypeId) {
	$('#popUpOnCenRecDelLoad').bPopup({
	},function(){
		let _thisMod	= this;
		let	 keyCollection = addDeliveryCharges(waybillId,wayBillTypeId);
		$(this).html(
				"<div class='confirmation-modal modal fade in show' tabindex='-1' role='dialog' style='display: block; padding-right: 17px;'><div class='modal-dialog modal-xss'><div class='modal-content' style='width: 80%;'>" +
				"<div class='modal-body'><table width='100%'><tr><th style='text-align:center;font-size:20px;background-color: #31708f;color: white; height:35p;'>Add Delivery Charges<th></tr>" +
				"<tr><td style='text-align: center; font-size:20px;color: red;'>LR Number : " + wayBillNumber + "</td></tr></table></div>" +
				"<div class='modal-body'><table width='100%'align='center'>" + keyCollection + "</table></div>" +
				"<div style=' display: flex; padding-left: 255px;padding-bottom: 10px;'><button id='addButton_" + waybillId + "' class='btn btn-success'>Add</button>&nbsp;&nbsp;<button id='cancelButton' class='btn btn-danger'>Close</button></div>"
			)
		$("#cancelButton").click(function(){
			_thisMod.close();
		})
		
		if (wayBillTypeId == WAYBILL_TYPE_FOC) {
			$("#addButton_" + waybillId).prop("disabled", true);
		}

		$("#addButton_" + waybillId).click(function() {
			if (confirm("Are you sure you want to add delivery charges ? ")) {
				storeCharges(waybillId);
				_thisMod.close();
			}
		})
	});
}

function addDeliveryCharges(waybillId,wayBillTypeId) {
	let dataKey = Object.keys(activeDeliveryCharges);
	let collection = '';
	let wayBillIdWiseChargelist = null;
	let isFoc = wayBillTypeId == WAYBILL_TYPE_FOC;

	if (typeof dataKey !== 'undefined') {
		if (wayBillIdWiseObj != null) {
			wayBillIdWiseChargelist = wayBillIdWiseObj['wayBillId_' + waybillId];

			for (let i = 0; i < dataKey.length; i++) {
				let obj = activeDeliveryCharges[dataKey[i]];
				let objKey = Object.keys(obj);
				
				for (const chargeId of objKey) {
					let chargeName = obj[chargeId];
				
					if (i == 0)
						initialiseFocusId = chargeId
					
					setTimeout(function() {
						$('#charge_' + initialiseFocusId).focus();
						initialiseFocus();
					}, 500);
					
					if (typeof wayBillIdWiseChargelist != 'undefined' || wayBillIdWiseChargelist != undefined) {
						if (wayBillIdWiseChargelist != null && wayBillIdWiseChargelist.length > 0) {
							for (const obj of wayBillIdWiseChargelist) {
								if (obj.chargeId == chargeId) {
									$('#' + waybillId + '_charge_' + chargeId).val(obj.Amount)
									collection += "<tr><td class='color: #31708f; text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>" + chargeName + "</td>"
									collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='" + waybillId + "_charge_" + chargeId + "' id='" + waybillId + "_charge_" + chargeId + "'  value ='" + obj.Amount + "'" + (isFoc ? " disabled" : "") + "/></td></tr>"
								}
							}
						} else {
							collection += "<tr><td class='text-center' style=' color: #31708f; text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>" + chargeName + "</td>"
							collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='" + waybillId + "_charge_" + chargeId + "' id='" + waybillId + "_charge_" + chargeId + "' value ='0'" + (isFoc ? " disabled" : "") + "/></td></tr>"
						}
					} else {
						collection += "<tr><td class=' text-center' style=' color: #31708f;text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>" + chargeName + "</td>"
						collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='" + waybillId + "_charge_" + chargeId + "' id='" + waybillId + "_charge_" + chargeId + "' value ='0'" + (isFoc ? " disabled" : "") + "/></td></tr>"
					}
				}
			}
		} else {
			for (let i = 0; i < dataKey.length; i++) {
				let obj = activeDeliveryCharges[dataKey[i]];
				let objKey = Object.keys(obj);

				for (const chargeId of objKey) {
					let chargeName = obj[chargeId];
					
					if (i == 0)
						initialiseFocusId = chargeId
					
					setTimeout(function() {
						initialiseFocus();
					}, 500);

					collection += "<tr><td class='text-info text-center' style='text-align: center; vertical-align: middle;background-color: #fdc8bf;font-weight: bold;'>" + chargeName + "</td>"
					collection += "<td style='text-align: center; vertical-align: middle;'><input style='text-align: right;height: 30px;width:45%' class='form-control height30px' onkeypress='return allowOnlyNumeric(event);' onfocus='setBlankAmount(this);' onblur='clearIfNotNumeric(this,0);' onkeyup='clearIfNotNumeric(this,0);' type='text' name='" + waybillId + "_charge_" + chargeId + "' id='" + waybillId + "_charge_" + chargeId + "' value ='0'" + (isFoc ? " disabled" : "") + "/></td></tr>"
				}
			}
		}
	}

	return collection;
}

function setBlankAmount(obj) {
	if (obj.value == '0')
		obj.value = '';
}

function storeCharges(waybillId) {
	let dataKey = Object.keys(activeDeliveryCharges);
	let localWayBillIdWiseChargeArr = new Array();

	for (const element of dataKey) {
		let obj = activeDeliveryCharges[element];

		let objKey = Object.keys(obj);

		for (const chargeId of objKey) {
			let dataObj = new Object();
			dataObj.chargeId = chargeId;
			dataObj.waybillId = waybillId;
			dataObj.Amount = $('#' + waybillId + '_charge_' + chargeId).val();
			wayBillIdWiseChargeArr.push(dataObj);
			localWayBillIdWiseChargeArr.push(dataObj);
		}
	}
	
	wayBillIdWiseObj["wayBillId_" + waybillId] = localWayBillIdWiseChargeArr;
}

function onPaymentModeSelect(billId, obj,wayBillTypeId ) {
	 let paymentModeId = Number($('#paymentMode' + billId).val());

	if (paymentModeId == PAYMENT_TYPE_BILL_CREDIT_ID && wayBillTypeId != WAYBILL_TYPE_TO_PAY) {
		showAlertMessage('error', 'Only To Pay LR Allowed While Selected Bill Credit Payment Type !');
		$('#paymentMode' + billId).val('0');
	}

	$('#uniqueWayBillId').val(billId);
	$('#uniqueWayBillNumber').val($('#lrNumber_' + billId).val());
	$('#uniquePaymentType').val($('#paymentMode' + billId).val());
	$('#uniquePaymentTypeName').val($("#paymentMode" + billId + " option:selected").text());

	hideShowBankPaymentTypeOptions(obj);

	toggleDeliveryCreditorInput(billId, wayBillTypeId, paymentModeId);
}

function setDeliveryCreditorAutoComplete(id) {
	$("#deliveryCreditor_" + id).autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType=2&billing=4",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if (ui.item && ui.item.id !== 0) {
				$('#selectedDeliveryCreditorId_' + id).val(ui.item.id);
				$('#deliveryCreditor_' + id).val(ui.item.label);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui); 
		}
	});

	$("#deliveryCreditor_" + id).on('input', function() {
		if (!$(this).val().trim())
			$('#selectedDeliveryCreditorId_' + id).val("0");
	});
}


function setDeliveryCreditorAutoCompleteForAll() {
	$("#centralizedDeliveryCreditor").autocomplete({
		source: "PartyAutocompleteAjaxAction.do?pageId=9&eventId=18&creditorType=2&billing=4",
		minLength: 2,
		delay: 10,
		autoFocus: false,
		select: function(event, ui) {
			if (ui.item && ui.item.id !== 0) {
				$('#centralizedDelCreditorId').val(ui.item.id);

				$('.selectAllPaymentMode').each(function() {
					let wayBillId = this.id.replace('paymentMode', '');
					let wayBillTypeId = Number($(this).data('waybilltype'));

					if (wayBillTypeId == WAYBILL_TYPE_TO_PAY) {
						let deliveryCreditorInput = $('#deliveryCreditor_' + wayBillId);
						let selectedDeliveryCreditorHidden = $('#selectedDeliveryCreditorId_' + wayBillId);

						if (!deliveryCreditorInput.data('userModified')) {
							deliveryCreditorInput.val(ui.item.label);
							selectedDeliveryCreditorHidden.val(ui.item.id);
						}
					}
				});
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});

	$("#centralizedDeliveryCreditor").on('input', function() {
		if (!$(this).val().trim()) {
			$('#centralizedDelCreditorId').val("0");

			$('.selectAllPaymentMode').each(function() {
				let wayBillId = this.id.replace('paymentMode', '');
				$('#deliveryCreditor_' + wayBillId).val("").prop('readonly', false);
				$('#selectedDeliveryCreditorId_' + wayBillId).val("0");

			});
		}
	});

}

function resetOnDelete(e) {
	var keynum = getKeyCode(e);

	if (keynum == 8 || keynum == 46) {
		$('#selectedDeliveryCreditorId').val(0);
	}
}

function setLogoutIfEmpty(ui) {
	if (ui.content) {
		if (ui.content.length < 1) {
			ui.content.push({
				"label": "You are logged out, Please login again !",
				"id": "0"
			});
		}
	}
}

function toggleDeliveryCreditorInput(wayBillId, waybilltypeId, deliveryPaymentType) {
	let deliveryCreditor = document.getElementById('deliveryCreditor_' + wayBillId);
	
	if (!deliveryCreditor) return;
		let shouldEnable = deliveryPaymentType == PAYMENT_TYPE_BILL_CREDIT_ID && waybilltypeId == WAYBILL_TYPE_TO_PAY;
		deliveryCreditor.disabled = !shouldEnable;
	
	if (!shouldEnable) {
		deliveryCreditor.value = "";
		let selectedDeliveryCreditor = document.getElementById('selectedDeliveryCreditorId_' + wayBillId);
		if (selectedDeliveryCreditor) selectedDeliveryCreditor.value = "0";
	}
}
