define([
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
	'JsonUtility',
	'messageUtility',
	'bootstrapSwitch',
	'nodvalidation',
	'focusnavigation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],
	function(Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, myNodLRNo,  _this = '', allowToStockOutForMultipleLR = false, allowBackDate = false, latestDate = null, headerCreated = false,
			totalQuantity = 0, deliveryTotal = 0, grandTotal = 0, lrNo = 0, wayBillIds = [];
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/deliveryWayBillWS/loadMultipleOutForDeliveryLRs.do?', _this.renderOutForDeliveryElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderOutForDeliveryElements : function(response) {
					showLayer();

					var loadelement = new Array();
					var baseHtml	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/stockOutLRs/stockoutlrs.html", function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						allowBackDate					= response.allowBackDate;
						allowToStockOutForMultipleLR	= response.allowToStockOutForMultipleLR;

						$("#wayBillNumberEle").focus();
						
						if(allowToStockOutForMultipleLR) {
							$('#branchLabel').addClass('hide');
							$('#findBtn').remove();
						} else {
							var elementConfiguration	= new Object();
	
							elementConfiguration.branchElement		= $('#branchEle');
	
							response.elementConfiguration	= elementConfiguration;
							response.executiveTypeWiseBranch	= true;
	
							Selection.setSelectionToGetData(response);
						}

						myNod = nod();
						myNodLRNo = nod();
						
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNodLRNo.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#wayBillNumberEle',
							validate: 'presence',
							errorMessage: 'Enter LR Number !'
						});
						
						myNodLRNo.add({
							selector: '#wayBillNumberEle',
							validate: 'presence',
							errorMessage: 'Enter LR Number !'
						});

						myNod.add({
							selector: '#branchEle',
							validate: 'presence',
							errorMessage: 'Select Branch !'
						});
										
						if(allowToStockOutForMultipleLR) {
							$("#wayBillNumberEle").keypress(function(e){
								if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
									myNodLRNo.performCheck();
									
									if(myNodLRNo.areAll('valid'))
										_this.onFind(_this);
								}
							});
						}

						$("#findBtn").click(function() {
							myNod.performCheck();

							if(myNod.areAll('valid'))
								_this.onFind(_this);
						});
						
						$("#stockOutDateEle").datepicker({
							showAnim: "fold",
							dateFormat: 'dd-mm-yy',
							onSelect: function(date) {
								$("#stockOutDateEle").datepicker('setDate', new Date(date.split("-")[2], date.split("-")[1] - 1, date.split("-")[0]));
								$("#stockOutDateEle").trigger("blur");
							},
						});

						$("#outForDelivery").click(function() {
							_this.outForDeliveryLRs();
						});
					});
				}, onFind : function() {
					showLayer();
					var jsonObject = new Object();

					var wayBillNumber				= $('#wayBillNumberEle').val();

					jsonObject.wayBillNumber		= wayBillNumber.replace(/\s+/g, "");

					if(allowToStockOutForMultipleLR)
						jsonObject.branchId				= 0;
					else
						jsonObject.branchId				= $('#branchEle_primary_key').val();
						
					jsonObject.allowToStockOutForMultipleLR	= allowToStockOutForMultipleLR;

					getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryWayBillWS/getDataOutForDeliveryLRs.do', _this.setMultipleDeliveredLRDetailsData, EXECUTE_WITH_ERROR);
				}, setMultipleDeliveredLRDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						
						if(!allowToStockOutForMultipleLR) {
							$('#bottom-border-boxshadow').addClass('hide');
							$('#appendedLRDetails').empty();
							$('#appendedLRDetailsHeader').empty();
							$('#appendedLRDetailsFooter').empty();
							headerCreated 	= false;
							wayBillIds 		= [];
							lrNo			= 0;
						}
						
						return;
					}
					
					$('#bottom-border-boxshadow').removeClass('hide');
					
					let lrDetailsList		= response.deliveryContactDetailsList;
					
					if(!lrDetailsList || lrDetailsList.length === 0)
						return;
					
					var obj = lrDetailsList[0];
					
					if(wayBillIds.includes(obj.wayBillId)) {
						showAlertMessage('error', "This LR " + obj.deliveryContactDetailsWayBillNumber + " is already added.");
						return;
					}
					wayBillIds.push(obj.wayBillId);
					
					if(allowToStockOutForMultipleLR)
						_this.setLrAppendData(lrDetailsList);
					else
						_this.setMultipleLRDetails(lrDetailsList);

					hideLayer();
				}, setMultipleLRDetails : function(lrDetailsList) {
					$('#appendedLRDetails').empty();
					$('#appendedLRDetailsHeader').empty();
					$('#appendedLRDetailsFooter').empty();
										
					_this.createHeader();
					_this.setData(lrDetailsList);
					_this.createFooter();
					
					$('#totalQuantity').html(totalQuantity);
					$('#deliveryTotal').html(deliveryTotal);
					$('#grandTotal').html(grandTotal);
				}, setLrAppendData : function(lrDetailsList) {
					hideLayer();
					
					if(allowBackDate)
						_this.showStockOutDateField();

					if(!headerCreated) {
						_this.createHeader();
					}
					
					_this.setData(lrDetailsList);

					if(!headerCreated)
						_this.createFooter();
						
					$('#totalQuantity').html(totalQuantity);
					$('#deliveryTotal').html(deliveryTotal);
					$('#grandTotal').html(grandTotal);
					
					$('#appendedLRDetails').on('change', 'input[type="checkbox"]:not(#selectAll)', function() {
						var totalCheckboxes		= $('#appendedLRDetails input[type="checkbox"]:not(#selectAll)').length;
						var checkedCheckboxes	= $('#appendedLRDetails input[type="checkbox"]:not(#selectAll):checked').length;

						$("#selectAll").prop('checked', totalCheckboxes === checkedCheckboxes);
						
						latestDate = null;
						_this.updateStockOutDateBasedOnChecked();
					});
					
					$("#wayBillNumberEle").val('');
					$("#wayBillNumberEle").focus();
				}, createHeader : function() {
					var columnArray = [];

					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='selectAll' id='selectAll' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> SR.No. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> LR No. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Delivery To Name </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Delivery To No. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Delivery Date </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Total Quantity </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Delivery Total </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Grand Total </b></td>");

					$('#appendedLRDetailsHeader').append('<tr class="danger">' + columnArray.join(' ') + '</tr>');
					
					$("#selectAll").click(function() {
						$('input:checkbox').not(this).prop('checked', $(this).is(":checked"));
						_this.updateStockOutDateBasedOnChecked();
					});
				}, createFooter : function() {
					var columnArray = [];
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total : </b> </td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='totalQuantity'>0</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='deliveryTotal'>0</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='grandTotal'>0</td>");
	
					$('#appendedLRDetailsFooter').html('<tr>' + columnArray.join(' ') + '</tr>');
					headerCreated = true;
				}, setData : function(lrDetailsList) {
					for (var i = 0; i < lrDetailsList.length; i++) {
						var obj	= lrDetailsList[i];
						lrNo  += 1;

						let columnArray = [];
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' id='check_" + obj.wayBillId + "' name='outForDeliveryLr' value='" + obj.wayBillId + "'/></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + lrNo + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber_" + obj.wayBillId + "'><b>" + obj.deliveryContactDetailsWayBillNumber + "<b></a></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryContactDetailsDeliveredToName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryContactDetailsDeliveredToNumber + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryContactDetailsDateStr + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.quantity + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryContactDetailsDeliveryTotal + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.deliveryContactDetailsGrandTotal  + "</td>");
	
						$('#appendedLRDetails').append('<tr>' + columnArray.join(' ') + '</tr>');
					
						totalQuantity += obj.quantity;
						deliveryTotal += obj.deliveryContactDetailsDeliveryTotal;
						grandTotal	  += obj.deliveryContactDetailsGrandTotal;
						
						$("#wayBillNumber_" + obj.wayBillId).bind("click", function() {
							var elementId = $(this).attr('id');
							var wayBillId = elementId.split('_')[1];
							_this.viewWayBillDetails(wayBillId, obj.deliveryContactDetailsWayBillNumber);
						});
					}
				}, outForDeliveryLRs : function() {
					var checkBoxArray = getAllCheckBoxSelectValue('outForDeliveryLr');

					if (checkBoxArray.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR to Stock Out !');
						return false;
					}
					
					var jsonObject = new Object();
						
					var btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want to Delivered the Goods of Selected LRs ?",
						modalWidth	:	30,
						title		:	'Delivered the Goods',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();
						
					jsonObject["wayBills"]				= checkBoxArray.join(',');
					
					if(allowBackDate)
						jsonObject["stockOutDate"]			= $('#stockOutDateEle').val();
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryWayBillWS/updateOutForDeliveryStatus.do', _this.responseAfterOutForDelivery, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, responseAfterOutForDelivery : function(response) {
					hideLayer();
									
					if(response.message != undefined) {
						$('#bottom-border-boxshadow').addClass('hide');
						$('#appendedLRDetails').empty();
						$('#appendedLRDetailsHeader').empty();
						$('#appendedLRDetailsFooter').empty();
						$('#stockOutDateDiv').addClass('hide');
						wayBillIds				= [];
						let lrDetailsList		= null;
						latestDate				= null;
						headerCreated			= false;
						lrNo					= 0;
						totalQuantity 			= 0;
						deliveryTotal			= 0;
						grandTotal 				= 0;
												
						if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null)
							btModalConfirm.close();
							
					}
				}, viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, showStockOutDateField: function() {
					if (!$('#stockOutDateEle').is(':visible')) {
						$('#stockOutDateDiv').removeClass('hide');
						_this.setStockOutDatePicker();
					}
				}, setStockOutDatePicker: function() {
					var curDate = new Date();
					var minDate;

					if (latestDate != null) {
						var latestMinDate = new Date(latestDate);
						minDate = new Date(latestMinDate);
						minDate.setDate(latestMinDate.getDate());
					} else {
						minDate = new Date(curDate);
						minDate.setDate(curDate.getDate() - 30);
					}

					$("#stockOutDateEle").datepicker("option", {
						minDate: minDate,
						maxDate: curDate
					});

					$('#stockOutDateEle').val(_this.dateWithDateFormatForCalender(curDate, "-"));
				}, dateWithDateFormatForCalender:function(date, separator) {
					var day = ("0" + date.getDate()).slice(-2);
					var month = ("0" + (date.getMonth() + 1)).slice(-2);
					var year = date.getFullYear();
					return day + separator + month + separator + year;
				}, updateStockOutDateBasedOnChecked : function() {
					let allDates = [];
					latestDate = null;
					
					$('#appendedLRDetails input[type="checkbox"]:not(#selectAll):checked').each(function() {
						var rowDateStr = $(this).closest('tr').find('td:nth-child(6)').text().trim();
						var rowDate = parseDate(rowDateStr, "-");
						allDates.push(rowDate);
					});
										
					if (allDates.length > 0) {
						latestDate = new Date(Math.max.apply(null, allDates));
						allDates = []
					}
										
					_this.setStockOutDatePicker();
				}
			});
		});