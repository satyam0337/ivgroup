define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/updateddmdetailsfilepath.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMDriverDetails.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMTruckNumber.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMRemark.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMDestination.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMLorryHire.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/ddm/editDDMVehicleAgentName.js'],
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal, Selection, EditDDMDriverDetails, EditDDMTruckNumber, EditDDMRemark, EditDDMDestination, EditDDMLorryHire,EditDDMVehicleAgentName,preDivisionId) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', ddmUpdateConfiguration, isAllLRSettled = true, isLorryHireSettled = false, isPermissionForLorryHireEdit = false, btModalConfirm, isLRSettledCounter =0 ,activeDeliveryCharges;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/deliveryRunsheetWS/loadDDMDetailsForUpdate.do?',	_this.renderDDMUpdateElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderDDMUpdateElements : function(response) {
					showLayer();
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/ddm/UpdateDDMDetails.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						
						ddmUpdateConfiguration	= response;
						
						$("#ddmNumberEle").focus();
						
						response.executiveTypeWiseBranch	= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.branchElement		= $('#branchEle');
						
						response.elementConfiguration	= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#ddmNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter DDM Number !'
						});
						
						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.onFind(_this);
							}
						});
					});
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();
					$('#lrDetails').addClass("hide")
					let DDMNumber				= $('#ddmNumberEle').val();
					
					jsonObject.DDMNumber		= DDMNumber.replace(/\s+/g, "");
					jsonObject.sourceBranchId	= $('#branchEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/getDDMDetailsForUpdate.do', _this.setDDMDetailsData, EXECUTE_WITH_ERROR);
				},setDDMDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						return;
					}
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('left-border-boxshadow');
					removeTableRows('billDetails', 'table');
					$('#reportTable tfoot').empty();
					refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
					removeTableRows('lrDetailsTable', 'tbody');
					$('#lrNumberEle').val('');
					$( "#appendBtn").addClass('hide');
					
					_this.setDataInTable(response);
					hideLayer();
				},setDataInTable : function(data) {
					let columnArray					= new Array();
					let deliveryRunSheetLedger		= data.DeliveryRunSheetLedger;
					let wayBillModelArr				= data.wayBillModelArr;
					let totalGrandTotal				= 0;
					let deliveryRunSheetLedgerObj	= null;
					isAllLRSettled					= data.isAllLRSettled;
					isLorryHireSettled				= data.isLorryHireSettled;
					isPermissionForLorryHireEdit	= data.isPermissionForLorryHireEdit;
					
					$('#editLinks').empty();
					
					if(deliveryRunSheetLedger.length == 1) {
						deliveryRunSheetLedgerObj	= deliveryRunSheetLedger[0];
					}
					
					$('#DDMDate').html(deliveryRunSheetLedgerObj.ddmDate);
					$('#FromBranch').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerSourceBranchName);
					$('#ToBranch').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerDestinationBranchName);
					$('#TruckNumber').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerVehicleNumber);
					$('#DriverName').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerDriverName);
					$('#DriverNumber').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerDriverMobileNo);
					$('#LorryHireAmout').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerLorryHireAmount);
					$('#Remark').html(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerRemark);
					
					if(isAllLRSettled) {
						$('#settledMessege').html('DDM already Settled !');
						$('#messegeToEditDDM').removeClass('hide');
					}else{
						$('#messegeToEditDDM').hide();
					}
					
					if(ddmUpdateConfiguration.editDropdownWiseInformation) {
						$('#editLinks').append('<div class="btn-group containerForList"></div>');
						$('<button type="button" class="btn btn-danger">Edit Other Information</button>').appendTo( ".containerForList" );
						$('<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" data-tooltip="Edit Other Information"><span class="caret"></span></button>').appendTo( ".containerForList" );
						$('<ul class="dropdown-menu" role="menu"></ul>').appendTo( ".containerForList" );
						
						if(ddmUpdateConfiguration.editTruckNumber) {
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Truck Number" id="editTruckNumber_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Truck Number</a></li>').appendTo( ".dropdown-menu" );
						}
						
						if(ddmUpdateConfiguration.editDriverDetails) {
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Driver Details" id="editDriverDetails_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Driver Details</a></li>').appendTo( ".dropdown-menu" );
						}
						
						if(ddmUpdateConfiguration.editVehicleAgentName)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Vehicle Agent Name" id="editVehicleAgentName_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Vehicle Agent Name</a></li>').appendTo( ".dropdown-menu" );
						
						if(ddmUpdateConfiguration.editDestination) {
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Destination" id="editDestination_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Destination</a></li>').appendTo( ".dropdown-menu" );
						}
						
						$('<li><a style="cursor:pointer;" data-tooltip="Edit Remark" id="editRemark_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Remark</a></li>').appendTo( ".dropdown-menu" );
						
						if(ddmUpdateConfiguration.editLorryHire) {
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Lorry Hire" id="editLorryHire_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Lorry Hire</a></li>').appendTo( ".dropdown-menu" );
						}
						
						if(ddmUpdateConfiguration.addLRsIntoDDM) {
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into DDM">Append LR Into DDM</button></span>');
						}
						
						if(ddmUpdateConfiguration.removeLRFromDDM) {
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from DDM">Remove LR from DDM</button></span>');
						}
						
						if(ddmUpdateConfiguration.cancelDDM) {
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelDDM" data-tooltip="Cancel DDM">Receive At Godown</button></span>');
						}
						
						$('#editLinks').append('<span style="float: right;"><button type="button" class="btn btn-primary" id="printDDM" data-tooltip="Print DDM">Print</button></span>');
					} else {
						$('#editLinks').append('<div class="btn-group btn-group-justified containerForList"></div>');
						
						if(ddmUpdateConfiguration.editTruckNumber) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" data-tooltip="Edit Truck Number" id="editTruckNumber_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Truck Number</button></span>').appendTo( ".containerForList" );
						}
						
						if(ddmUpdateConfiguration.editVehicleAgentName)
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" data-tooltip="Edit Vehicle Agent Name" id="editVehicleAgentName_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Vehicle Agent Name</button></span>').appendTo( ".containerForList" );
						
						if(ddmUpdateConfiguration.editDriverDetails) {
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit Driver Details" id="editDriverDetails_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Driver Details</button></span>').appendTo( ".containerForList" );
						}
						
						if(ddmUpdateConfiguration.editDestination) {
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-success" data-tooltip="Edit Destination" id="editDestination_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Destination</button></span>').appendTo( ".containerForList" );
						}
						
						$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit Remark" id="editRemark_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Remark</button></span>').appendTo( ".containerForList" );
						
						if(ddmUpdateConfiguration.editLorryHire) {
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-success" data-tooltip="Edit Lorry Hire" id="editLorryHire_' + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId + '">Edit Lorry Hire</button></span>').appendTo( ".containerForList" );
						}
						
						if(ddmUpdateConfiguration.addLRsIntoDDM) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into Bill">Append LR Into DDM</button></span>').appendTo( ".containerForList" );
						}
						
						if(ddmUpdateConfiguration.removeLRFromDDM) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from Bill">Remove LR from DDM</button></span>').appendTo( ".containerForList" );
						}
						
						if(ddmUpdateConfiguration.cancelDDM) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelDDM" data-tooltip="Cancel DDM">Receive At Godown</button></span>').appendTo( ".containerForList" );
						}
						
						$('<span style="float: right;"><button type="button" class="btn btn-primary" id="printDDM" data-tooltip="Print DDM">Print</button></span>').appendTo( ".containerForList" );
					}
					
					$("#printDDM").bind("click", function() {
					    _this.printDDM(deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId);
					});
					
					$(document).on("click", "#editRemark_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editRemark(deliveryRunSheetLedgerObj);
					});
					
					$(document).on("click", "#editTruckNumber_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editTruckNumber(deliveryRunSheetLedgerObj);
					});

					$(document).on("click", "#editDriverDetails_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editDriverDetails(deliveryRunSheetLedgerObj);
					});
	
	
					$(document).on("click", "#editVehicleAgentName_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editVehicleAgentName(deliveryRunSheetLedgerObj);
					});


					$(document).on("click", "#editLorryHire_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editLorryHire(deliveryRunSheetLedgerObj);
					});


					$(document).on("click", "#editDestination_" + deliveryRunSheetLedgerObj.deliveryRunSheetLedgerId, function() {
						_this.editDestination(deliveryRunSheetLedgerObj);
					});

					if(ddmUpdateConfiguration.cancelDDM) {
						$("#cancelDDM").bind("click", function() {
						    _this.cancelDDM(deliveryRunSheetLedgerObj,wayBillModelArr);
						});
					}
					
					if(ddmUpdateConfiguration.addLRsIntoDDM) {
						$("#addLRs").bind("click", function() {
						    _this.addLRs(deliveryRunSheetLedgerObj);
						});
					}
					
					if(ddmUpdateConfiguration.removeLRFromDDM) {
						$("#removeLRs").bind("click", function() {
						    _this.removeLRs(deliveryRunSheetLedgerObj, wayBillModelArr);
						});
					}
					isLRSettledCounter = 0;
					
					if(wayBillModelArr.length > 0)
						preDivisionId = wayBillModelArr[0].divisionId;
						
					for (let i = 0; i < wayBillModelArr.length; i++) {
						let obj	= wayBillModelArr[i];
						if(ddmUpdateConfiguration.removeLRFromDDM) {
							$('#checkBoxtoRemoveLR').removeClass('hide');
							if(obj.paymentType <= 0) {
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lrToRemove' id='lrToRemove' value='"+ obj.wayBillId +"'/></td>");
							} else {
								isLRSettledCounter++;
								columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
							}
						}
							
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber_" + obj.wayBillId + "'><b>" + obj.wayBillNumber + "<b></a></td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.sourceBranch + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.destinationBranch + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.consigneeName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillType + "</td>");
						
						if(ddmUpdateConfiguration.setBookingAmountInAmountColumn)
							columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;'>" + obj.bookingAmount + "</td>");
						else
							columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;'>" + obj.grandTotal + "</td>");
						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.packageDetails + "</td>")
						$('#reportTable tbody').append("<tr id='existsWayBillId_"+obj.wayBillId+"'>" + columnArray.join(' ') + "</tr>");
						
						$("#wayBillNumber_" + obj.wayBillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
						    _this.viewWayBillDetails(wayBillId, obj.wayBillNumber);
						});
						
						
						if(ddmUpdateConfiguration.setBookingAmountInAmountColumn)
						 	totalGrandTotal	= totalGrandTotal + obj.bookingAmount
						 else 
						 	totalGrandTotal	= totalGrandTotal + obj.grandTotal;
						 
						columnArray	= [];
					}
					
					columnArray	= [];
					
					if(ddmUpdateConfiguration.removeLRFromDDM) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");		
					}
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>")
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;'>" + totalGrandTotal + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>")
					$('#reportTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
				}, printDDM : function(deliveryRunSheetLedgerId) {
					window.open('DDMView.do?pageId=304&eventId=5&deliveryRunSheetLedgerId='+deliveryRunSheetLedgerId+'&isSearchModule=true', 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, editRemark : function(deliveryRunSheetLedger) {
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.updateRemark				= true;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMRemark(object),
						modalWidth 	: 30,
						title		: 'Update Remark for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMRemark(object);
					btModal.open();
				}, editTruckNumber : function(deliveryRunSheetLedger) {
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.updateTruckNumber		= ddmUpdateConfiguration.editTruckNumber;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMTruckNumber(object),
						modalWidth 	: 30,
						title		: 'Update Truck Number for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMTruckNumber(object);
					btModal.open();
				}, editVehicleAgentName : function(deliveryRunSheetLedger) {
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.updateVehicleAgentName	= ddmUpdateConfiguration.editVehicleAgentName;
					
					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMVehicleAgentName(object),
						modalWidth 	: 30,
						title		: 'Update Vehicle Agent Name for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMVehicleAgentName(object);
					btModal.open();
				}, editDriverDetails : function(deliveryRunSheetLedger) {
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.editDriverDetails		= ddmUpdateConfiguration.editDriverDetails;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMDriverDetails(object),
						modalWidth 	: 30,
						title		: 'Update Driver Details for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMDriverDetails(object);
					btModal.open();
				}, editLorryHire : function(deliveryRunSheetLedger) {
					if(!isPermissionForLorryHireEdit) {
						showMessage('warning', iconForWarningMsg + ' You donot have permission to Edit Lorry Hire !');
						return;
					} else if(ddmUpdateConfiguration.dontAllowEditLorryHireAmtAfterSettlement && isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit Lorry Hire as DDM already Settled !');
						return;
					} else if(isLorryHireSettled) {
						showMessage('warning', iconForWarningMsg + ' Lorry Hire already Settled !');
						return;	
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.updateLorryHire			= ddmUpdateConfiguration.editLorryHire;
					object.updateRemark				= ddmUpdateConfiguration.allowToInsertRemark;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMLorryHire(object),
						modalWidth 	: 30,
						title		: 'Update Lorry Hire for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMLorryHire(object);
					btModal.open();
				}, editDestination : function(deliveryRunSheetLedger) {
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let object 						= new Object();
					object.deliveryRunSheetLedger	= deliveryRunSheetLedger;
					object.updateDestination		= ddmUpdateConfiguration.editDestination;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditDDMDestination(object),
						modalWidth 	: 30,
						title		: 'Update Destination for DDM No. <b>' + deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					
					new EditDDMDestination(object);
					btModal.open();
				}, cancelDDM : function(deliveryRunSheetLedger,wayBillModelArr) {
					
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					if(isLorryHireSettled) {
						showMessage('warning', iconForWarningMsg + 'You cannot Remove LR as Lorry Hire already Settled  Please cancel Lorry Hire Settlement !');
						return;
					}
					let checkBoxArray	= new Array();
					
					$.each($("input[name=lrToRemove]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});
					
					if((wayBillModelArr.length-isLRSettledCounter) != checkBoxArray.length) {
						showMessage('error', iconForErrMsg + ' Please, Select All Lr !');
						return false;
					}
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Receive At Godown This DDM ?",
						modalWidth 	: 	30,
						title		:	'Receive At Godown This DDM',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					let jsonObject 									= new Object();
					jsonObject["wayBills"]							= checkBoxArray.join(',');
					jsonObject.deliveryRunSheetLedgerId				= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					jsonObject.deliveryRunSheetLedgerDDMNumber		= deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber;
										
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/cancelDDM.do', _this.responseAftercancelDDM, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, removeLRs : function(deliveryRunSheetLedger, wayBillModelArr) {
										
					if(isAllLRSettled) {
						showMessage('warning', iconForWarningMsg + ' You cannot edit this DDM as DDM already Settled !');
						return;
					}
					
					let checkBoxArray	= new Array();
					
					$.each($("input[name=lrToRemove]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});
					
					if(checkBoxArray.length == 0) {
						showMessage('warning', iconForErrMsg + ' Please, Select atleast 1 LR to Receive  At Godown !');
						return false;
					}
					
					let jsonObject = new Object();
					
					jsonObject["wayBills"]							= checkBoxArray.join(',');
					jsonObject.deliveryRunSheetLedgerId				= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					jsonObject.deliveryRunSheetLedgerDDMNumber		= deliveryRunSheetLedger.deliveryRunSheetLedgerDDMNumber;
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to  Receive LRs At Godown ?",
						modalWidth 	: 	30,
						title		:	'Remove Seleted LRs',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						console.log(jsonObject);
							getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/removeLRSFromDDM.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
				}, responseAftercancelDDM : function(response) {
					if(response.message != undefined) {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						btModalConfirm.close();
						hideLayer();
					}
				}, responseAfterRemoveLR : function(response) {
					if(response.message != undefined) {
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						btModalConfirm.close();
						_this.onFind(_this);
						hideLayer(); 
					}
				}, addLRs : function(deliveryRunSheetLedger) {
					showPartOfPage('right-border-boxshadow');
					$('#lrNumberEle').focus();
					goToPosition('right-border-boxshadow', 'slow');
					
					$("#lrNumberEle").bind("keydown", function(event) {
					    _this.getWayBillDetailsToAppend(event, deliveryRunSheetLedger);
					});
					
					$("#findBtnForAppendLR").bind("click", function(event) {
					    _this.findWayBillDetailsToAppend(deliveryRunSheetLedger);
					});
					
					$("#appendBtn").bind("click", function() {
					    _this.appendLRInDDM(deliveryRunSheetLedger);
					});
				}, getWayBillDetailsToAppend : function(e, deliveryRunSheetLedger) {
					
					if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
						let lrNumberEle		= $('#lrNumberEle').val();
						
						if(lrNumberEle == '') {
							showMessage('info', iconForInfoMsg + ' Enter LR Number !');
							return false;
						}
						
						let jsonObject = new Object();
						jsonObject.corporateAccountId		= deliveryRunSheetLedger.deliveryRunSheetLedgerAccountGroupId;
						jsonObject.deliveryRunSheetLedgerId	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
						jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
						jsonObject.creationDateTimeStamp	= toDateTimeString(deliveryRunSheetLedger.ddmDate);
						
						if(preDivisionId > 0)
							jsonObject.divisionId	= preDivisionId;
						
						getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/getWayBillDetails.do', _this.addLRToAppendInBill, EXECUTE_WITH_ERROR);
						showLayer();
					}
				}, findWayBillDetailsToAppend : function(deliveryRunSheetLedger) {
					let lrNumberEle		= $('#lrNumberEle').val();
					
					if(lrNumberEle == '') {
						showMessage('info', iconForInfoMsg + ' Enter LR Number !');
						return false;
					}
					
					let tbl  =  document.getElementById('lrDetailsTable');
					let rowCount = tbl.rows.length;
					
					let wbNo = lrNumberEle.replace(/\s+/g, '');
					for(let i = 1; i < rowCount; i++){
						let addedWbNo = tbl.rows[i].cells[1].innerHTML;
						if(addedWbNo == wbNo){
							showMessage('info', lrNumberAlreadyAdded(wbNo));
							hideLayer();
							return;
						}
					}
					
					let jsonObject = new Object();
					
					jsonObject.corporateAccountId		= deliveryRunSheetLedger.deliveryRunSheetLedgerAccountGroupId;
					jsonObject.deliveryRunSheetLedgerId	= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
					jsonObject.creationDateTimeStamp	= toDateTimeString(deliveryRunSheetLedger.ddmDate);
					
					if(preDivisionId > 0)
							jsonObject.divisionId	= preDivisionId;
							
					getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/getWayBillDetails.do', _this.addLRToAppendInBill, EXECUTE_WITH_ERROR);
					showLayer();
				}, addLRToAppendInBill : function(response) {
					
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						return;
					}
					
					$('#lrDetails').removeClass('hide');
					$('#lrDetailsDiv').removeClass('hide');
					
					let pendingLRArray				= new Array();
					let checkBoxArray				= new Array();	
									
					let pendingLRColl				= response.pendingLRColl;
					pendingLRArray	  				= response.pendingLRColl;
					let pendingLR					= new Array();
					let rowCount					= 0;
													
					if(pendingLRArray.length > 1){
						pendingLR	  = [];	
						
						for(const element of pendingLRArray){
							if(!$('#existsWayBillId_' + element.wayBillId).exists()) {
								pendingLR.push(element);
							}else{
								showMessage('info', iconForInfoMsg +'LR Number '+element.wayBillNumber+' Already  Added  !');
							}
						}
						
						if(pendingLR.length > 1){
							setTimeout(function(){
								_this.addDuplicatedWayBillNumber(pendingLR);
							},200);
							
							$("#appendLrInTable").click(function() {
								rowCount = $('#duplicatedLRTable tbody tr').length;
							$.each($("input[name=ddmWaybill]:checked"), function() {
								$('#duplicatedWayBillId_'+$(this).val()).addClass("hide")
								checkBoxArray.push($(this).val());
							});
							
							if($("input[name=ddmWaybill]:checked").length > 0 ){
								if(rowCount == $("input[name=ddmWaybill]:checked").length ) {
									$('#duplicatedLRDetails').addClass('hide');
									$('#appendLrInTable tbody').empty();
								}
								$.each($("input[name=ddmWaybill]:checked"), function() { 
										checkBoxArray.push($(this).val());
								});
								
								pendingLRColl =  new Array();	
							
								for(const wayBillId of checkBoxArray) {
									for(const element of pendingLRArray) {
										if(wayBillId == element.wayBillId)
											pendingLRColl.push(element);
									}
								}
							} else {
								showMessage('info', "Please Select At Least One LR");
								return;
							}
							
							_this.setLRInTable(response,pendingLRColl);
						});
							
						}else{
							showMessage('info', iconForInfoMsg +'LR Number '+pendingLRColl[0].wayBillNumber+' Already  Added  !');
							_this.setLRInTable(response,pendingLR)
							hideLayer();
							return ;
						}
						
					}else{
						pendingLRColl  = response.pendingLRColl;
						if($('#wayBillNumber_' + pendingLRColl[0].wayBillId).exists() 
							|| $('#existsWayBillId_' + pendingLRColl[0].wayBillId).exists()) {
							hideLayer();
							showMessage('info', iconForInfoMsg +'LR Number '+pendingLRColl[0].wayBillNumber+' Already  Added  !');
							return false;
						} 
						_this.setLRInTable(response,pendingLRColl)
					}
				},appendLRInDDM : function(deliveryRunSheetLedger) {
					let checkBoxArray	= new Array();
				
					$.each($("input[name=lrToAppend]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});
					
					if(checkBoxArray.length == 0) {
						showMessage('info', 'Please Select At least One LR!');
						hideLayer();
						return;
					}
					
					let jsonObject 				= new Object();
					
					jsonObject["wayBills"]						= checkBoxArray.join(',');
					jsonObject["deliveryRunSheetLedgerId"]		= deliveryRunSheetLedger.deliveryRunSheetLedgerId;
					jsonObject["DDMNumber"]						= $('#ddmNumberEle').val();
					jsonObject["totalNoOfWayBills"]				= checkBoxArray.length;
					jsonObject["wbWiseObj"]						= JSON.stringify(_this.getWBOtherData());
									
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure want to Add selected LRs ?",
						modalWidth 	: 	30,
						title		:	'Add Seleted LRs',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/deliveryRunsheetWS/appendLrInDDM.do', _this.responseAfterAddLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
				},getWBOtherData(){
					
					let wayBillId 	= 0;
					let wbWiseObj	= new Object;

					$('input[name=lrToAppend]:checked').each(function() {

						wayBillId			= this.value;
						let wbDetailsObj	= new Object();
												
						wbDetailsObj.deliveredToName			= $('#deliveredToName_'+wayBillId).val();
						wbDetailsObj.deliveredToPhoneNo			= $('#deliveredToPhoneNo_'+wayBillId).val();
						wbDetailsObj.remark						= $('#remark_'+wayBillId).val();
						wbDetailsObj.wbCharges					= JSON.stringify(_this.getWBChargesData(wayBillId));
						wbWiseObj['wayBillId_' + wayBillId]		= wbDetailsObj;
					});

					return wbWiseObj;
					
				},getWBChargesData(wayBillId){
					let wbCharges		= new Object;
					for (let sequence in activeDeliveryCharges) {
						wbCharges['delCharges_' + activeDeliveryCharges[sequence].chargeTypeMasterId +'_'+ wayBillId] = $('#delCharges_' + activeDeliveryCharges[sequence].chargeTypeMasterId +'_'+ wayBillId).val();
					}
					return wbCharges;

				},noNumbers(evt){
					if (evt.ctrlKey ==1){
						return true;
					}else{
						let keynum = null;
						if(window.event){ // IE
							keynum = evt.keyCode;
						} else if(evt.which){ // Netscape/Firefox/Opera
							keynum = evt.which;
						}
						if(keynum!=null){
							if(keynum == 8){
								return true;
							} else if(keynum == 45 || keynum == 47) {
								return true;
							} else if (keynum < 48 || keynum > 57 ) {
								return false;
							}
						}
						return true;
					}
				},responseAfterAddLR : function(response) {
					hideLayer();
					if(response.message != undefined) {
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						$('#lrDetails').addClass('hide');
						$('#lrDetailsDiv').addClass('hide');
						removeTableRows('duplicatedLRTable', 'tbody');
						$('#duplicatedLRDetails').addClass('hide');
						$('#appendLrInTable tbody').empty();
						$('#classTable tbody').empty();
						$( "#lrNumberEle").unbind( "keydown" );
						$( "#findBtnForAppendLR").unbind( "click" );
						$( "#appendBtn").unbind( "click" );
						btModalConfirm.close();
						_this.onFind(_this);

						btModalConfirm.close();
						_this.onFind(_this);
						hideLayer();
					}
				},addDuplicatedWayBillNumber : function(pendingLRArray) {
					hideLayer();
					showMessage('info', "Duplicated LR Number Found Please Select One LR which you want add in DDM");
					
					$('#duplicatedLRDetails').removeClass('hide');
					$('#appendLrInTable').removeClass('hide');
							
					let columnHeadArray		= new Array();
					
					columnHeadArray.push("<th><input name='selectAll' id='selectAll'  type='checkbox' value='classTable' onclick='selectAllCheckBox(this.checked,this.value);'></th>");
					columnHeadArray.push("<th>LR No</th>");	
					columnHeadArray.push("<th>Bkg Date</th>");
					columnHeadArray.push("<th>Receive Date</th>");
					columnHeadArray.push("<th>Amount</th>");
					columnHeadArray.push("<th>Source</th>");
					columnHeadArray.push("<th>Destination</th>");
					columnHeadArray.push("<th>Consignor</th>");
					columnHeadArray.push("<th>Consignee</th>");
					
					if(!$("#dupLrcloumn").exists()){
						$('#duplicatedLRTable thead').append('<tr id="dupLrcloumn">' + columnHeadArray.join(' ') + '</tr>');
					}
					
					for(const element of pendingLRArray){
						let columnArray			= new Array();
						if(!$("#duplicatedWayBillId_"+element.wayBillId).exists()){						
							
							columnArray.push("<td ><input type='checkbox' name='ddmWaybill' id='lrToAppend_"+element.wayBillId+"' value='" + element.wayBillId +"' /></td>");						
							columnArray.push("<td >" + element.wayBillNumber + "</td>");
							columnArray.push("<td >" + element.wayBillCreationDateTimeStampString + "</td>");
							columnArray.push("<td >" + element.wayBillType + "</td>");
							columnArray.push("<td >" + element.wayBillInfoBookingTotal + "</td>");
							columnArray.push("<td >" + element.wayBillInfoSourceBranchName + "</td>");
							columnArray.push("<td >" + element.wayBillInfoDestinationBranchName + "</td>");
							columnArray.push("<td >" + element.consignorName + "</td>");
							columnArray.push("<td >" + element.consigneeName + "</td>");
							
							$('#duplicatedLRTable tbody').append("<tr id='duplicatedWayBillId_"+element.wayBillId+"' >" + columnArray.join(' ') + "</tr>");
						}
					}
			},setLRInTable:function(response,pendingLRColl){
				
				activeDeliveryCharges			= new Array();
				let wbIdWiseDeliveryCharges		= new Array();
				let appendLRMessage	  			= response.appendLRMessage;
				let wayBillId;
										
				$('#appendBtn').removeClass('hide');
				$('#classTable tbody').empty();
				activeDeliveryCharges			= response.activeDeliveryCharges;
				activeDeliveryCharges.sort(function (a, b) {
					  return a.chargeMasterForGroupSequenceNumber - b.chargeMasterForGroupSequenceNumber;
					});
				
				for(const element of pendingLRColl){
					wayBillId		= element.wayBillId;
					if(response.wbIdWiseDeliveryCharges != undefined){
						wbIdWiseDeliveryCharges			= response.wbIdWiseDeliveryCharges[wayBillId];
					}
					
					if(typeof appendLRMessage != 'undefined') {
						if(!confirm(appendLRMessage)) {
							$('#lrNumberEle').val('');
							$('#lrNumberEle').focus();
							return;
						}
					}
						
					$('#lrNumberEle').val('');
					$('#lrNumberEle').focus();
					$('#lrDetails').removeClass('hide');
					$('#lrDetailsDiv').removeClass('hide');
					
					let columnArray			= new Array();
					let columnHeadArray		= new Array();
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Select <br> <input name='lrDetailsSelectAll' id='lrDetailsSelectAll'  type='checkbox' value='lrDetailsTable' onclick='selectAllCheckBox(this.checked,this.value);'></th>");
					columnHeadArray.push("<th style='width: 6%; text-align: center;'>Remove</th>");	
					columnHeadArray.push("<th style='width: 6%; text-align: center;'>Lr No.</th>");	
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>LR Type</th>");
					columnHeadArray.push("<th style='width: 6%; text-align: center;'>Booking Date</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>From</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>To</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Art</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Weight</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Grand Total</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Delivery To</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Consignor</th>");
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Consignee</th>");
					
					if(ddmUpdateConfiguration.deliveredTo) {
						columnHeadArray.push("<th style='width: 12%; text-align: center;' id='DdmDeliveryDetailsTh' >Delivery Details</th>");
					}
					if(ddmUpdateConfiguration.ddmCharges){
						for(const element of activeDeliveryCharges){
							columnHeadArray.push("<th style='width: 8%; text-align: center;' id='delCharges_" + element.chargeTypeMasterId+ "'>" + element.chargeTypeMasterName + "</td>");
						}
					}
					
					columnHeadArray.push("<th style='width: 8%; text-align: center;'>Remark</th>");
					if(!$("#lrDetailsTable").children().find('#lrcloumn').exists()){
						$('#lrDetailsTable thead').append('<tr id="lrcloumn">' + columnHeadArray.join(' ') + '</tr>');
					}
					if(!$("#wayBillId_"+element.wayBillId).exists()){
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lrToAppend' id='lrToAppend' value='" + element.wayBillId + "' /></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' ><button type='button' id='remove_"+element.wayBillId+"' class='btn btn-danger'  >Remove</button></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillNumber + "</td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillType + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillCreationDateTimeStampString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillInfoSourceBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillInfoDestinationBranchName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.consignmentSummaryQuantity + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='lrActualWeight_"+element.wayBillId+"'>" + element.consignmentSummaryActualWeight + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.wayBillInfoBookingTotal + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.consignmentSummaryDeliveryToString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.consignorName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + element.consigneeName + "</td>");
					if(ddmUpdateConfiguration.deliveredTo) {
						columnArray.push("<td style='text-align: center; vertical-align: middle;'  class='' id='DdmDeliveryDetailsTr' >"
								+ "<input class='form-control hide' value='' name='deliveredToName' id='deliveredToName_"+ element.wayBillId +"' type='text' class='width-100px text-uppercase' maxlength='30'  placeholder='Delivered To Name'/>"
								+"&nbsp;&nbsp;"
									+"<input class='form-control hide' value='' name='deliveredToPhoneNo' id='deliveredToPhoneNo_"+ element.wayBillId +"' type='text'	class='width-100px' maxlength='10'  placeholder='Delivered To Phone No' /></td>");
					}
					if(ddmUpdateConfiguration.ddmCharges){
						for(let i = 0; i < activeDeliveryCharges.length; i++){
							columnArray.push("<td  style='text-align: center; vertical-align: middle; '><input class='form-control' type='text' name='lrToAppend' onkeypress='return noNumbers(event)' id='delCharges_" + activeDeliveryCharges[i].chargeTypeMasterId +"_"+  element.wayBillId + "' placeholder='0' /></td>");
						}
					}
											
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><input class='form-control' type='text' name='remark' id='remark_"+ element.wayBillId +"' /></td>");
					$('#lrDetailsTable tbody').append("<tr id='wayBillId_"+element.wayBillId+"' >" + columnArray.join(' ') + "</tr>");
					if(ddmUpdateConfiguration.ddmCharges){
						if(typeof wbIdWiseDeliveryCharges != 'undefined'){
							for(let Id  in wbIdWiseDeliveryCharges){
								$('#delCharges_'+Id+'_'+element.wayBillId).val(wbIdWiseDeliveryCharges[Id]);
							}
						}
					}
					if(ddmUpdateConfiguration.deliveredTo) {
						$('#deliveredToName_'+ element.wayBillId).removeClass('hide');
						$('#deliveredToPhoneNo_'+ element.wayBillId).removeClass('hide');
						if(ddmUpdateConfiguration.deliveredToAutoFill){
							$('#deliveredToName_'+ element.wayBillId).val(element.consigneeName);
								$('#deliveredToPhoneNo_'+ element.wayBillId).val(element.consigneeMobileNumber);
							}
						}
						$("#wayBillNumber_" + element.wayBillId).bind("click", function(){
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
						    _this.viewWayBillDetails(wayBillId, element.wayBillNumber);
						});
						
						$("#remove_" + element.wayBillId).bind("click", function(){
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.removeRow(wayBillId);
						});
						
					}	
				 }
				hideLayer();
			},removeRow(wayBillId){
				console.log("wayBillId "+wayBillId)
				$('#wayBillId_'+wayBillId).remove();
				
			}
	});
});

function selectAllCheckBox(param,tabName){
	let tabletbodyExists = false;
	if($("#duplicatedLRTable").exists() && !$("#duplicatedLRTable tbody").is(":empty")  && (tabName == 'classTable')){
		var tab 		 = document.getElementById('duplicatedLRTable');
		tabletbodyExists = true;
	}else if($("#lrDetailsTable").exists() && !$("#lrDetailsTable tbody").is(":empty") && (tabName == 'lrDetailsTable')){
		var tab 		 = document.getElementById('lrDetailsTable');
		tabletbodyExists = true;
	}else if($("#reportTable").exists() && !$("#reportTable tbody").is(":empty") && (tabName == 'reportTable')){
		var tab 		 = document.getElementById('reportTable');
		tabletbodyExists = true;
	}
	
	if(tabletbodyExists) {
		for(let row = 1 ; row < tab.rows.length; row++){
			if(tab.rows[row].cells[0].firstChild != null){	
				tab.rows[row].cells[0].firstChild.checked = param;
			}
		}
	}
}