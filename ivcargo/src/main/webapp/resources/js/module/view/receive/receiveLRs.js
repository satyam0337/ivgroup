define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
	 ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'JsonUtility'
	,'messageUtility'
	 ,'jquerylingua'
	 ,'language'
	 ,'slickGridWrapper2'
	 ,"selectizewrapper"
	 ,"focusnavigation"
	 ,'/ivcargo/resources/js/backbone/backbone.bootstrap-modal.js'
], function(UrlParameter) {
	'use strict';
	var jsonObject = new Object(),_this = '',receiveAndDelivery = false,doneTheStuff = false, isDelivery = false,dispatchLedgerId=0,receivedLedgerId=0,
	TOKEN_VALUE	= "",TOKEN_KEY="";
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			dispatchLedgerId				= UrlParameter.getModuleNameFromParam(MASTERID);
			jsonObject.dispatchLedgerId 	= dispatchLedgerId;
			jsonObject.moduleId 			= UrlParameter.getModuleNameFromParam('moduleId');
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/receiveWs/getLRDetailsByDispatchLedgerToReceive.do?', _this.setDetailsForReceive, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDetailsForReceive : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/receive/receiveLRs.html", function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute=" + keyObject[i] + "]").removeClass("hide");
				}
				
				removeTableRows('loadingSheet', 'tbody');
				removeTableRows('results', 'thead');
				removeTableRows('results', 'tbody');
				removeTableRows('results', 'tfoot');
				
				if(!isDelivery)
					$('#receiveDeliveryButton').html('Receive');
				
				_this.setLoadingSheetDetails(response.dispatchLedger);
				_this.setWayBillReceivableModel(response);
				_this.displayRemark(response);
				_this.displayBackDateOption(response);
				
				TOKEN_KEY				= response.TOKEN_KEY;
				TOKEN_VALUE				= response.TOKEN_VALUE;
				
				$("#receiveDeliveryButton").click(function() {
					_this.receiveAndDeliveryLRs();
				});	
				
				$("#printPreloadingSheet").bind("click", function(event) {
					event.preventDefault();
					window.open('/ivcargo/SearchWayBill.do?pageId=340&eventId=10&modulename=preunloadingsheet&masterid=' + dispatchLedgerId,  'newwindow', 'config=height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				});

				hideLayer();
			});
		}, setLoadingSheetDetails : function(dispatchLedger) {
			if(dispatchLedger != null) {
				var dataColumnArray		= new Array();
				
				dataColumnArray.push("<td>" + dispatchLedger.lsNumber + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.tripDateTimeForString + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.vehicleNumber + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.sourceBranch + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.destinationBranch + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.driverName + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.driver1MobileNumber1 + "</td>");
				dataColumnArray.push("<td>" + dispatchLedger.cleanerName + "</td>");
				
				$('#loadingSheet tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
		}, createHeader : function() {
			var headerColumnArray		= new Array();
			
			headerColumnArray.push("<th id = 'selectAllCol'>Receive<input type='checkbox' value='wayBillsAll' name='wayBillsAll' id='wayBillsAll' /></th>");
			
			if(isDelivery)
				headerColumnArray.push("<th id = 'selectAllDlyCol'>Receive/<br>Delivery<input type='checkbox' name='wayBillsAllRcvDly' id='wayBillsAllRcvDly' value='wayBillsAllRcvDly'/></th>");
				
			headerColumnArray.push("<th>LR No.</th>");
			headerColumnArray.push("<th>From</th>");
			headerColumnArray.push("<th>To</th>");
			headerColumnArray.push("<th>LR Type</th>");
			headerColumnArray.push("<th>Amt</th>");
			headerColumnArray.push("<th>Art.</th>");
			headerColumnArray.push("<th>Act. Weight</th>");
			headerColumnArray.push("<th>Chrg Weight</th>");
			headerColumnArray.push("<th>C/nee Name</th>");
			headerColumnArray.push("<th>C/nee No</th>");
			
			$('#results thead').append('<tr>' + headerColumnArray.join(' ') + '</tr>');
		}, setWayBillReceivableModel : function(response) {
			var noOfPackages		= 0;
			var totalAmount			= 0;
			var totalActWeight		= 0;
			var totalChargeWeight	= 0;
			
			var wayBillReceivableModel	= response.wayBillReceivableModel;
			isDelivery					= response.isDelivery;
			receivedLedgerId			= response.receivedLedgerId;
			
			_this.createHeader();
			
			$('#wayBillsAll').bind("click", function() {
				_this.validateSelectChecbox(this.id, this.value);
				_this.selectAllWayBills(this.checked, this.value);
			});

			$('#wayBillsAllRcvDly').bind("click", function() {
				_this.validateSelectChecbox(this.id, this.value);
				_this.selectAllWayBills(this.checked, this.value);
			});

			if(wayBillReceivableModel != null) {
				var dataColumnArray			= [];
				
				for(var i = 0; i < wayBillReceivableModel.length; i++) {
					var wbc		= wayBillReceivableModel[i];
					
					var wayBillNumber					= wbc.wayBillNumber;
					var grandTotal						= parseInt(wbc.grandTotal);
					var dispatchedWeight				= wbc.dispatchedWeight;
					var wayBillId						= wbc.wayBillId;
					var chargeWeight					= wbc.chargeWeight;
					
					noOfPackages				+= wbc.dispatchedQuantity;
					totalAmount					+= wbc.grandTotal;
					totalActWeight				+= wbc.dispatchedWeight;
					totalChargeWeight			+= wbc.chargeWeight;

					//Column creation end
					
					dataColumnArray.push("<td class='textAlignCenter'><input type = 'checkbox'  class = 'wayBills' name = 'wayBills' id = 'wayBills_" + wayBillId + "' value='" + wayBillId + "'/></td>");
					
					if(isDelivery) {
						if(wbc.isDeliveryAllow)
							dataColumnArray.push("<td class='textAlignCenter'><input type = 'checkbox'  class= 'wayBillsDly' name = 'wayBillsDly' id = 'wayBillsDly_" + wayBillId + "' value='" + wayBillId + "'/></td>");
						else
							dataColumnArray.push("<td></td>");
					}
					
					dataColumnArray.push("<td><a style='cursor:pointer;' id='lrview_" + wayBillId + "' class='link-primary'><b>" + wbc.wayBillNumber + "<b></a></td>");
					dataColumnArray.push("<td>" + wbc.sourceBranch + "</td>");
					dataColumnArray.push("<td>" + wbc.destinationBranch + "</td>");
					dataColumnArray.push("<td>" + wbc.wayBillType + "</td>");
					dataColumnArray.push("<td class='textAlignRight'>" + grandTotal + "</td>");
					dataColumnArray.push("<td>" + wbc.packageDetails + "</td>");
					dataColumnArray.push("<td class='textAlignRight'>" + dispatchedWeight + "</td>");
					dataColumnArray.push("<td class='textAlignRight'>" + chargeWeight + "</td>");
					dataColumnArray.push("<td>" + wbc.consigneeName + "</td>");
					dataColumnArray.push("<td>" + wbc.consigneePhoneNumber + "</td>");
					
					$('#results tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
					
					dataColumnArray	= [];
					
					$("input select").focus(function(){
						showInfo(this, this.placeholder);
					});
					
					$("#lrview_" + wayBillId).bind("click", function() {
						var elementId		= $(this).attr('id');
						var wayBillId		= elementId.split('_')[1];
						viewWayBillDetails(wayBillId, wayBillNumber);
					});
					
					$('.wayBills').on('click', function() {
						if ($('.wayBills:checked').length == $('.wayBills').length)
							$('#wayBillsAll').prop('checked', true);
						else
							$('#wayBillsAll').prop('checked', false);
		
						if ($('.wayBills:checked').length == 0)
							$('#wayBillsAllRcvDly').show();
						else if ($('.wayBills:checked').length < $('.wayBills').length) 
							$('#wayBillsAllRcvDly').hide();
						else
							$('#wayBillsAllRcvDly').show();				
					});
					
					$('.wayBillsDly').on('click', function() {
						if ($('.wayBillsDly:checked').length == $('.wayBillsDly').length)
							$('#wayBillsAllRcvDly').prop('checked', true);
						else 
							$('#wayBillsAllRcvDly').prop('checked', false);
						
						if ($('.wayBillsDly:checked').length == 0) 
							$('#wayBillsAll').show();
						else if ($('.wayBillsDly:checked').length < $('.wayBillsDly').length) 
							$('#wayBillsAll').hide();
						else
							$('#wayBillsAll').show();						
					});

					
					$("#wayBills_" + wayBillId).bind("click", function() {
						_this.validateSelectChecbox(this.id, this.value);
					});
					
					$("#wayBillsDly_" + wayBillId).bind("click", function() {
						_this.validateSelectChecbox(this.id, this.value);
					});
					
					$("#viewConsignment_" + wayBillId).bind("click", function() {
						_this.viewConsignmentDetails((this.id).split('_')[1]);
					});
				}
				
				_this.setFooter(noOfPackages, totalAmount, totalActWeight, totalChargeWeight);
			}
		}, setFooter : function(noOfPackages, totalAmount, totalActWeight, totalChargeWeight) {
			var footerColumnArray		= new Array();
		
			footerColumnArray.push("<th>Total</th>");
			
			if(isDelivery)
				footerColumnArray.push("<th></th>");
			
			footerColumnArray.push("<th></th>");
			footerColumnArray.push("<th></th>");
			footerColumnArray.push("<th></th>");
			footerColumnArray.push("<th></th>");
			footerColumnArray.push("<th class='textAlignRight'>" + Math.round(totalAmount) + "</th>");
			footerColumnArray.push("<th class='textAlignRight'>" + noOfPackages + "</th>");
			footerColumnArray.push("<th class='textAlignRight'>" + totalActWeight + "</th>");
			footerColumnArray.push("<th class='textAlignRight'>" + totalChargeWeight + "</th>");
			footerColumnArray.push("<th></th>");
			footerColumnArray.push("<th></th>");
			
			$('#results tfoot').append('<tr style = "background-color: lightgrey">' + footerColumnArray.join(' ') + '</tr>');
		}, viewConsignmentDetails : function(wayBillId) {
			childwin = window.open ('consignmentDetails.do?pageId=340&eventId=2&modulename=consignmentDetails&wayBillId=' + wayBillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, validateSelectChecbox : function(eleId, wayBillId) {
			if(eleId == ('wayBills_' + wayBillId) && $('#wayBillsDly_' + wayBillId).is(":checked")) {
				$('#' + eleId).prop('checked', false);
				showMessage('warning', iconForWarningMsg + ' LR is already selected for Receive and Delivery !');

				if ($('.wayBills:checked').length == 0) {
					$('#wayBillsAllRcvDly').show();
					$('#wayBillsAll').prop('checked', false);
				}
				
			} else if(eleId == ('wayBillsDly_' + wayBillId) && $('#wayBills_' + wayBillId).is(":checked")) {
				$('#' + eleId).prop('checked', false);
				showMessage('warning', iconForWarningMsg + ' LR is already selected for Receive only !');

				if ($('.wayBillsDly:checked').length == 0) {
					$('#wayBillsAll').show();
					$('#wayBillsAllRcvDly').prop('checked', false);
				}
			}

			if (eleId == ('wayBillsAll') && $('#wayBillsAllRcvDly').is(":checked")) {
				$('#' + eleId).prop('checked', false);
				showMessage('warning', iconForWarningMsg + ' LR is already selected for Receive and Delivery !');
			} else if (eleId == ('wayBillsAllRcvDly') && $('#wayBillsAll').is(":checked")) {
				$('#' + eleId).prop('checked', false);
				showMessage('warning', iconForWarningMsg + ' LR is already selected for Receive only !');
			}
		}, receiveAndDeliveryLRs : function() {
			var jsonObject	= {};
			
			var wayBillIdList		= getAllCheckBoxSelectValue('wayBills');
			var wayBillIdListForDly	= getAllCheckBoxSelectValue('wayBillsDly');
			
			if(wayBillIdList.length == 0 && wayBillIdListForDly.length == 0) {
				showMessage('error', selectLrToReceiveErrMsg);
				return false;
			}

			$("#receiveDeliveryButton").addClass('hide');
			$('#receiveDeliveryButton').addClass('disabled');
						
			if(wayBillIdList.length > 0)
				jsonObject['wayBillIdList']			= wayBillIdList.join(',');
				
			if(wayBillIdListForDly.length > 0)
				jsonObject['wayBillIdListForDly']	= wayBillIdListForDly.join(',');
				
			jsonObject['dispatchLedgerId']		= dispatchLedgerId;
			jsonObject['manualTURDate']			= $("#manualTURDateEle").val();
			jsonObject['isManualTUR']			= true;
			jsonObject['receivedLedgerId']		= receivedLedgerId;
			jsonObject['TOKEN_KEY']				= TOKEN_KEY;
			jsonObject['TOKEN_VALUE']			= TOKEN_VALUE;
			
			if(!doneTheStuff) {
				if(confirm('Are you sure you want to Receive / Deliver Selected LR ?')) {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/receiveWs/receiveAndDeliverCrossingAgentLR.do?', _this.setResponseAfterReceive, EXECUTE_WITH_ERROR);
					doneTheStuff = true;
					showLayer();
				} else {
					doneTheStuff = false;
					$("#receiveDeliveryButton").removeClass('hide');
					$('#receiveDeliveryButton').removeClass('disabled');
					hideLayer();
				}
				
				/*var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Receive / Delivery LR ?",
					modalWidth 	: 	30,
					title		:	'Receive',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				btModalConfirm.on('ok', function() {
					if(!doneTheStuff) {
						getJSON(jsonObject, WEB_SERVICE_URL	+ '/receiveWs/receiveAndDeliverCrossingAgentLR.do?', _this.setResponseAfterReceive, EXECUTE_WITHOUT_ERROR);
						doneTheStuff = true;
						showLayer();
					}
				});
						
				btModalConfirm.on('cancel', function() {
					$("#receiveDeliveryButton").removeClass('hide');
					$('#receiveDeliveryButton').removeClass('disabled');
					doneTheStuff = false;
					hideLayer();
				});*/
			}
		}, setResponseAfterReceive : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				
				if(errorMessage.type != MESSAGE_TYPE_SUCCESS) {
					doneTheStuff = false;
					TOKEN_KEY			= response.TOKEN_KEY;
					TOKEN_VALUE			= response.TOKEN_VALUE;
					$("#receiveDeliveryButton").removeClass('hide');
					$('#receiveDeliveryButton').removeClass('disabled');
					return;
				}
			}

			removeTableRows('loadingSheet', 'tbody');
			removeTableRows('results', 'thead');
			removeTableRows('results', 'tbody');
			removeTableRows('results', 'tfoot');
			$('#bottom-border-boxshadow').remove();
			$('#loadingSheet').remove();
			
			$('#reprintOption').html('<b>TUR Number :</b> ' + response.TURNumber + '&emsp;<button type="button" name="reprintBtn" id="reprintBtn" class="btn btn-success" data-tooltip="Reprint">Reprint</button> <button name="button" type="button" id="" onclick="javascript: window.close()" class="btn btn-danger">Close</button><div class="row">&nbsp;</div>');
			$("*[data-selector='headerLS']").html('All selected WayBills are Received successfully !');
			
			$("#reprintBtn").click(function() {
				_this.printTUR(response.dispatchLedgerId);
			});	
			
			_this.printTUR(response.dispatchLedgerId);
		}, printTUR : function(dispatchLedgerId) {
			window.open ('TURPrint.do?pageId=221&eventId=5&dispatchLedgerId='+dispatchLedgerId,'newwindow','config=height=600,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}, displayRemark : function(response) {
			if(response.isRemarkFeildDisplay && receivedLedgerId == undefined) {
				$('#remark').append('<b>Remark</b><br>');
				$('#remark').append('<textarea rows="2.8" cols="27" maxlength="512" id="narrationRemark" class="form-control" name="narrationRemark" data-tooltip="Remark"></textarea>');
			} else
				$('#remark').remove();
		}, displayBackDateOption : function(response) {
			$('#backDate').append('<input readonly="readonly" class="form-control" name="manualTURDateEle" type="text" id="manualTURDateEle"/>');
		
			$("#manualTURDateEle").SingleDatePickerCus({
				minDate 	: response.minDate,
				maxDate		: response.maxDate,
				startDate 	: response.maxDate
			});
		}, selectAllWayBills: function(param, tabName) {
			var selectAllRcvchk  	= document.getElementById("wayBillsAll");
			var selectAllRcvDlychk  = document.getElementById("wayBillsAllRcvDly");
			var tab = document.getElementById('results');
			var count = parseFloat(tab.rows.length - 1);
			var row;

			if (param == true) {
				for (row = count; row > 0; row--) {
					if (tabName == 'wayBillsAll') {
						if (tab.rows[row].cells[0].firstElementChild && (selectAllRcvDlychk == null ||  !selectAllRcvDlychk.checked)) {
							tab.rows[row].cells[0].firstElementChild.checked = param;
						}
					} else if (tabName == 'wayBillsAllRcvDly') {
						if (tab.rows[row].cells[1].firstElementChild && (selectAllRcvchk == null || !selectAllRcvchk.checked)) {
							tab.rows[row].cells[1].firstElementChild.checked = param;
						}
					}
				}
			} else if (param == false) {
				for (row = count; row > 0; row--) {
					if (tabName == 'wayBillsAll') {
						if (tab.rows[row].cells[0].firstElementChild)
							tab.rows[row].cells[0].firstElementChild.checked = param;
					} else if (tabName == 'wayBillsAllRcvDly') {
						if (tab.rows[row].cells[1].firstElementChild)
							tab.rows[row].cells[1].firstElementChild.checked = param;
					}
				}
			};
		}
	});
});
