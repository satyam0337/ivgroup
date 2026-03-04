define(
		[
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',//PopulateAutocomplete
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editCollectionPerson.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editAdditionalCharge.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editInvoiceRemark.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editBillDate.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editPartyNameForPrint.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editBillingPartyName.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editLRBillRemark.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editBillSubmissionDate.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editSACCode.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editVCode.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editPONumber.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editPODate.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editHSNCode.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/editAdditionalDiscount.js',
			'JsonUtility',
			'messageUtility',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			,PROJECT_IVUIRESOURCES + '/resources/js/module/createInvoice/createInvoice.js'

		],
			function(UrlParameter, Selection, EditCollectionPerson, EditAdditionalCharge, EditInvoiceRemark, EditBillDate, EditPartyNameForPrint, EditBillingPartyName,
			EditLRBillRemark, EditBillSubmissionDate, EditInvoiceSACCode, EditInvoiceVCode, EditInvoicePONumber, EditBillPODate, EditInvoiceHSNCode, EditAdditionalDiscount) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', editInvoiceConfiguration, isPrintBillGroup = false, isAllowToEditBill = true, btModalConfirm,
			transportationModeId = 1,billId = 0, billNumber = null, billServiceTaxonBill = 0, 
			appendLrBillSummaries = new Array(),isWSInvoicePrintNeeded = false,editBillSubmissionDate= false,taxTypeId = 0,taxCalculateOnFreightAmount = false,
			validatePodUploadedToCreateInvoice = false, uploadPOD = false, showOnlyAlertMessageForPODUploadedOrNot = false,transportationModeIdList = [],
			additionalChargeLable = '', restrictBillOnAirTransportationMode = false, totalInsurancePremium = 0, allowToUploadDownloadExcelFile = false, eventsBinded = false,
			seperateMonthWiseSequenceForNonGstInvoice = false,doNotAllowEditWhenGSTWiseSequenceEnabled = false, selectDefaultBranchId = 0, branchList = [], billDivisionId = 0;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					billId			= UrlParameter.getModuleNameFromParam('billId');
					billNumber		= UrlParameter.getModuleNameFromParam('billNumber');
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditorInvoiceWS/loadEditCreditorInvoice.do?',	_this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/creditorInvoice/EditCreditorInvoice.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						hideLayer();

						editInvoiceConfiguration					= response;
						isPrintBillGroup							= response.isPrintBillGroup;
						isWSInvoicePrintNeeded						= response.isWSInvoicePrintNeeded
						taxCalculateOnFreightAmount					= response.taxCalculateOnFreightAmount;
						validatePodUploadedToCreateInvoice			= response.validatePodUploadedToCreateInvoice;
						showOnlyAlertMessageForPODUploadedOrNot		= response.showOnlyAlertMessageForPODUploadedOrNot;
						restrictBillOnAirTransportationMode			= response.restrictBillOnAirTransportationMode;
						uploadPOD									= response.uploadPOD;
						additionalChargeLable						= response.additionalChargeLable;
						allowToUploadDownloadExcelFile				= response.allowToUploadDownloadExcelFile;
						seperateMonthWiseSequenceForNonGstInvoice	= response.seperateMonthWiseSequenceForNonGstInvoice;
						doNotAllowEditWhenGSTWiseSequenceEnabled	= response.doNotAllowEditWhenGSTWiseSequenceEnabled;
						branchList									= response.branchList;
						selectDefaultBranchId 						= response.selectDefaultBranchId;
						
						if(billId > 0 && $('#datasaved').exists()) {
							$('#datasaved').html('<b style="font-size: 16px;"> Billing Party Updated ! Bill No :</b> is <b>' + billNumber + '</b>&emsp;<button type="button" name="printBill" id="printBill" class="btn btn-success" data-tooltip="Reprint">Print Bill</button><div class="row">&nbsp;</div>');
							$("#printBill").bind("click", function() {
								_this.printBill(billId);
							});
						}

						$("#billNumberEle").focus();
						
						document.getElementById('billNumberEle').addEventListener("keydown", _this.KeyCheck);

						response.executiveTypeWiseBranch	= true;

						let elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						
						if (response.showDefaultBranch) {
							const defaultBranch = branchList?.find(
								b => b.branchId == selectDefaultBranchId
							);
							
							if (defaultBranch) {
								$('#branchEle').val(defaultBranch.branchName);
								$('#branchEle_primary_key').val(defaultBranch.branchId);
							}
						}
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#billNumberEle',
							validate: 'presence',
							errorMessage: 'Enter Bill Number !'
						});

						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});

						$("#findBtn").click(function() {
							myNod.performCheck();
							
							/*if(seperateMonthWiseSequenceForNonGstInvoice && doNotAllowEditWhenGSTWiseSequenceEnabled){
								showMessage('info', iconForInfoMsg + ' Editing is not allowed. Kindly cancel and generate a new bill. !');
								return;
							}*/

							if(myNod.areAll('valid'))
								_this.onFind(_this);
						});
					});
				}, KeyCheck : function(event) {
					let KeyID = event.keyCode;
					
					if(KeyID == 8 || KeyID == 46) {
						$('#editLinks').empty();
						$( "#lrNumberEle" ).unbind( "keydown" );
						$( "#findBtnForAppendLR").unbind( "click" );
						$( "#appendBtn").unbind( "click" );
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						$('#taxTypeDiv').addClass('hide');
					}
				}, onFind : function() {
					showLayer();
					let jsonObject = new Object();

					let BillNumber				= $('#billNumberEle').val();

					jsonObject.billNumber		= BillNumber.replace(/\s+/g, "");
					jsonObject.branchId			= $('#branchEle_primary_key').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillDetailsForUpdate.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, getBillDetailsByBillId : function(billId) {
					showLayer();
					let jsonObject = new Object();

					jsonObject.billId	= billId;

					getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillDetailsForUpdateByBillId.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, setBillDetailsData : function(response) {
					hideLayer();
					refreshAndHidePartOfPage('right-border-boxshadow', 'hide');

					if(response.message != undefined) {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						$('#taxTypeDiv').addClass('hide');
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('middle-border-boxshadow');
					showPartOfPage('left-border-boxshadow');
					removeTableRows('billDetails', 'table');
					$('#reportTable tfoot').empty();
					$('#datasaved').remove();

					$( "#lrNumberEle" ).unbind( "keydown" );
					$( "#findBtnForAppendLR").unbind( "click" );
					$( "#appendBtn").unbind( "click" );
					
					let billDetailsList			= response.billList;
					let showMultipleBillRecords	= response.showMultipleBillRecords;
					
					if(showMultipleBillRecords)
						_this.setMultipleBillDetails(billDetailsList);
					else
						_this.setDataInTable(response);
				}, setDataInTable : function(data) {
					changeDisplayProperty('billdetailspannel', 'block');
					$('#right1-border-boxshadow').addClass('hide');
					
					let columnArray							= new Array();
					let bill								= data.bill;
					let billSummaries						= data.billSummaries;
					let totalGrandTotal						= 0.0;
					let messegeToEditInvoice				= data.messegeToEditInvoice;
					isAllowToEditBill						= data.isAllowToEditBill;
					let supplementaryBill					= data.supplementaryBill;
					let showEditConsignmentColumn			= data.showEditConsignmentColumn;
					let showEditTransportationModeColumn	= data.showEditTransportationModeColumn;
					editBillSubmissionDate					= data.editBillSubmissionDate;
					let billtaxArrayList					= data.billtaxArrayList;
					let showEditDestinationColumn			= data.showEditDestinationColumn;
					let roundOffBillAmount					= editInvoiceConfiguration.roundOffBillAmount;
					totalInsurancePremium					= data.totalInsurancePremium;
					let packingTypeTotal					= 0;
					billDivisionId							= bill.divisionId;

					if(bill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID) {
						showAlertMessage('warning', 'You cannot edit this supplementary bill !');
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						return;
					}
					
					$('#editLinks').empty();
					$('#taxDiv').empty();
					$('#BillDate').html(bill.billCreationDateString);
					
					if(editBillSubmissionDate) {
						$('.billSubmissionDate').removeClass('hide');
						$('#billSubmissionDateTd').html(bill.billSubmissionDateString);
					}
					
					$('#CreditorName').html(bill.billCreditorName);
					$('#CollectionPersonName').html(bill.billCollectionPersonName);
					$('#Remark').html(bill.billRemark);
					$('#AdditionalCharge').html(bill.billAdditionalCharge);
					$('#additionalChargeLable').html(additionalChargeLable);
					$('#PrintPartyName').html(bill.billPartyNameForPrint);
					
					if(editInvoiceConfiguration.editAdditionalDiscount) {
						$('.additionalDiscount').removeClass('hide');
						$('#additionalDiscount').html(bill.billAdditionalDiscount);
					}
					
					transportationModeIdList	= data.transportationModeIdList;
					
					$('#billServiceTaxonBill').val(bill.billServiceTaxonBill);
					
					billServiceTaxonBill	= Number($('#billServiceTaxonBill').val());
					let billTotal			= bill.billGrandTotal + bill.billAdditionalCharge;
					
					if(billServiceTaxonBill > 0) {
						$('#taxDetailsTable').removeClass('hide');
						$('#BillTotal').html((roundOffBillAmount ? Math.round(billTotal) : billTotal.toFixed(2)) + " (GST " + billServiceTaxonBill.toFixed(2) + " Included)");
					} else {
						$('#BillTotal').html(roundOffBillAmount ? Math.round(billTotal) : billTotal.toFixed(2));
						$('#sgst').html(0);
						$('#cgst').html(0);
						$('#igst').html(0);
						$('#taxDetailsTable').addClass('hide');
					}
					
					if(typeof billtaxArrayList != 'undefined') {
						for(const billTaxTxn of billtaxArrayList) {
							let taxMasterId = billTaxTxn.taxMasterId;

							if(taxMasterId == SGST_MASTER_ID)
								$('#sgst').html(billTaxTxn.taxAmount);
							else if (taxMasterId == CGST_MASTER_ID)
								$('#cgst').html(billTaxTxn.taxAmount);
							else if (taxMasterId == IGST_MASTER_ID)
								$('#igst').html(billTaxTxn.taxAmount);
						}

						$('#totaltaxamount').html(billServiceTaxonBill);
					}
					
					$('#creditorId').val(bill.billCreditorId);
					
					if(showEditConsignmentColumn)
						$('#showEditConsignmentColumn').removeClass('hide');

					if(showEditDestinationColumn)
						$('#showEditDestinationColumn').removeClass('hide');

					if(editInvoiceConfiguration.isTaxTypeDropDownAllow)
						$('#taxType').removeClass('hide');
					
					if(showEditTransportationModeColumn)
						$('#showEditTransportationModeColumn').removeClass('hide');
					
					if(editInvoiceConfiguration.editLrWiseBillRemark)
						$('#showEditlrBillRemarkModeColumn').removeClass('hide');
					
					if(editInvoiceConfiguration.isTransportationModeDropDownAllow) {
						transportationModeId	   = bill.transportationModeId;
						$('.transportationMode').removeClass('hide');
						$('#transportationModeId').html(bill.transportationModeStirng);
					}

					if(editInvoiceConfiguration.editPartyNameForPrint)
						$('.editPartyPrintName').removeClass('hide');
					else
						$('#remarkCol').attr('colspan', 5);

					if(typeof messegeToEditInvoice != 'undefined') {
						$('#settledMessege').html(messegeToEditInvoice);
						$('#messegeToEditInvoice').removeClass('hide');
					}
					
					if(editInvoiceConfiguration.showPackingTypeWithQtyColumn)
						$('.packingTypeWithQtyColumn').removeClass('hide');
						
					if(editInvoiceConfiguration.editDropdownWiseInformation) {
						$('#editLinks').append('<div class="btn-group containerForList"></div>');
						$('<button type="button" class="btn btn-danger">Edit Other Information</button>').appendTo( ".containerForList" );
						$('<button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" data-tooltip="Edit Other Information"><span class="caret"></span></button>').appendTo( ".containerForList" );
						$('<ul class="dropdown-menu dropdown-menu1" role="menu"></ul>').appendTo( ".containerForList" );
						
						if(editInvoiceConfiguration.editCollectionPerson)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Collection Person" id="editCollectionPerson_' + bill.billBillId + '">Edit Collection Person</a></li>').appendTo( ".dropdown-menu1" );
						
						$('<li><a style="cursor:pointer;" data-tooltip="Edit Remark" id="editRemark_' + bill.billBillId + '">Edit Remark</a></li>').appendTo( ".dropdown-menu1" );
						$('<li><a style="cursor:pointer;" data-tooltip="Edit ' + additionalChargeLable + '" id="editAdditionalAmount_' + bill.billBillId + '">Edit ' + additionalChargeLable + '</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.editAdditionalDiscount)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Additional Discount" id="editAdditionalDiscount_' + bill.billBillId + '">Edit Additional Discount</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.editHSNCode)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit HSN Code" id="editHSNCode_' + bill.billBillId + '">Edit HSN Code</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.editSACCode)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit SAC Code" id="editSACCode_' + bill.billBillId + '">Edit SAC Code</a></li>').appendTo( ".dropdown-menu1" );
						
						if(editInvoiceConfiguration.editVCode)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit V Code" id="editVCode_' + bill.billBillId + '">Edit V Code</a></li>').appendTo( ".dropdown-menu1" );
						
						if(editInvoiceConfiguration.editPONumber)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit PO Number" id="editPONumber_' + bill.billBillId + '">Edit PO Number</a></li>').appendTo( ".dropdown-menu1" );
						
						if(editInvoiceConfiguration.editPODate)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Bill PO Date" id="editBillPODate_' + bill.billBillId + '">Edit Bill PO Date</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.editBillDate)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Bill Date" id="editBillDate_' + bill.billBillId + '">Edit Bill Date</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.editPartyNameForPrint)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Party Name" id="editPartyNameForPrint_' + bill.billBillId + '">Edit Print Party Name</a></li>').appendTo( ".dropdown-menu1" );
						
						if(editInvoiceConfiguration.editBillingPartyName)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Billing Party Name" id="editBillingPartyName_' + bill.billBillId + '">Edit Billing Party Name</a></li>').appendTo( ".dropdown-menu1" );
						
						if(editBillSubmissionDate)
							$('<li><a style="cursor:pointer;" data-tooltip="Edit Bill Submission Date" id="editBillSubmissionDate_' + bill.billBillId + '">Edit Bill Submission Date</a></li>').appendTo( ".dropdown-menu1" );

						if(editInvoiceConfiguration.addLRsIntoBill)
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into Bill">Append LR Into Bill</button></span>');

						if(editInvoiceConfiguration.removeLRFromBill)
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from Bill">Remove LR from Bill</button></span>');

						if(editInvoiceConfiguration.cancelBill) {
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelBill" data-tooltip="Cancel Bill">Cancel Bill</button></span>');

							if(typeof supplementaryBill != 'undefined' && supplementaryBill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID)
								$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelSupplementaryBill" data-tooltip="Cancel Supplementary Bill">Cancel Supp. Bill</button></span>');
						}
						
						if(editInvoiceConfiguration.applyTaxOnBill) {
							$('#editLinks').append('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="applyTax" data-tooltip="Apply Tax">Apply Tax</button></span>');
							$('#editLinks').append('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" id="removeTax" data-tooltip="Remove Tax">Remove Tax</button></span>');
						}

						$('#editLinks').append('<span style="float: right; margin-left: 10px;"><button type="button" class="btn btn-primary" id="printBill" data-tooltip="Print Bill">Print</button></span>');

						if(typeof supplementaryBill != 'undefined' && supplementaryBill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID)
							$('#editLinks').append('<span style="float: right;"><button type="button" class="btn btn-info" id="printSupplementaryBill" data-tooltip="Supplementary Print">Supplementary Print</button></span>');
					
						if(allowToUploadDownloadExcelFile) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="downloadToExcel" data-tooltip="Download To Excel">Download Excel</button></span>').appendTo( ".containerForList" );
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="uploadExcel" data-tooltip="Upload Excel">Upload Excel</button> <input type="file" id="fileInput" style="display: none;" accept=".xls, .xlsx, .csv" /></span>').appendTo( ".containerForList" );
						}
					} else {
						$('#editLinks').append('<div class="btn-group btn-group-justified containerForList"></div>');
						
						if(editInvoiceConfiguration.editCollectionPerson)
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" data-tooltip="Edit Collection Person" id="editCollectionPerson_' + bill.billBillId + '">Edit Collection Person</button></span>').appendTo( ".containerForList" );
						
						$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit Remark" id="editRemark_' + bill.billBillId + '">Edit Remark</button></span>').appendTo( ".containerForList" );
						$('<span style="margin-left: 20px;"><button type="button" class="btn btn-success" data-tooltip="Edit ' + additionalChargeLable + '" id="editAdditionalAmount_' + bill.billBillId + '">Edit ' + additionalChargeLable + '</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.editHSNCode)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit HSN Code" id="editHSNCode_' + bill.billBillId + '">Edit HSN Code</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.editSACCode)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit SAC Code" id="editSACCode_' + bill.billBillId + '">Edit SAC Code</button></span>').appendTo( ".containerForList" );
						
						if(editInvoiceConfiguration.editVCode)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit V Code" id="editVCode_' + bill.billBillId + '">Edit V Code</button></span>').appendTo( ".containerForList" );
						
						if(editInvoiceConfiguration.editPONumber)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" data-tooltip="Edit PO Number" id="editPONumber_' + bill.billBillId + '">Edit PO Number</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.editPODate)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-primary" data-tooltip="Edit Bill PO Date" id="editBillPODate_' + bill.billBillId + '">Edit Bill PO Date</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.editBillDate)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-primary" data-tooltip="Edit Bill Date" id="editBillDate_' + bill.billBillId + '">Edit Bill Date</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.editPartyNameForPrint)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-primary" data-tooltip="Edit Party Name" id="editPartyNameForPrint_' + bill.billBillId + '">Edit Print Party Name</button></span>').appendTo( ".containerForList" );
						
						if(editInvoiceConfiguration.editBillingPartyName)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-primary" data-tooltip="Edit Billing Party Name" id="editBillingPartyName_' + bill.billBillId + '">Edit Billing Party Name</button></span>').appendTo( ".containerForList" );
						
						if(editBillSubmissionDate)
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-primary" data-tooltip="Edit Bill Submission Date" id="editBillSubmissionDate_' + bill.billBillId + '">Edit Bill Submission Date</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.addLRsIntoBill)
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-info" id="addLRs" data-tooltip="Add LR Into Bill">Append LR Into Bill</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.removeLRFromBill)
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="removeLRs" data-tooltip="Remove LR from Bill">Remove LR from Bill</button></span>').appendTo( ".containerForList" );

						if(editInvoiceConfiguration.cancelBill) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelBill" data-tooltip="Cancel Bill">Cancel Bill</button></span>').appendTo( ".containerForList" );

							if(typeof supplementaryBill != 'undefined' && supplementaryBill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID)
								$('<span style="margin-left: 40px;"><button type="button" class="btn btn-danger" id="cancelSupplementaryBill" data-tooltip="Cancel Supplementary Bill">Cancel Supplementary Bill</button></span>').appendTo( ".containerForList" );
						}
						
						if(editInvoiceConfiguration.applyTaxOnBill) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="applyTax" data-tooltip="Apply Tax">Apply Tax</button></span>').appendTo( ".containerForList" );
							$('<span style="margin-left: 20px;"><button type="button" class="btn btn-danger" id="removeTax" data-tooltip="Remove Tax">Remove Tax</button></span>').appendTo( ".containerForList" );
						}

						$('<span style="float: right; margin-left: 10px;"><button type="button" class="btn btn-primary" id="printBill" data-tooltip="Print Bill">Print</button></span>').appendTo( ".containerForList" );

						if(typeof supplementaryBill != 'undefined' && supplementaryBill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID)
							$('<span style="float: right;"><button type="button" class="btn btn-primary" id="printSupplementaryBill" data-tooltip="Supplementary Print">Supplementary Print</button></span>').appendTo( ".containerForList" );
						
						if(allowToUploadDownloadExcelFile) {
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="downloadToExcel" data-tooltip="Download To Excel">Download Excel</button></span>').appendTo( ".containerForList" );
							$('<span style="margin-left: 40px;"><button type="button" class="btn btn-primary" id="uploadExcel" data-tooltip="Upload Excel">Upload Excel</button> <input type="file" id="fileInput" style="display: none;" accept=".xls, .xlsx, .csv" /></span>').appendTo( ".containerForList" );
						}
					}
					
					if(editInvoiceConfiguration.applyTaxOnTaxTypeId && ($('#billServiceTaxonBill').val() == 0 || editInvoiceConfiguration.isTaxTypeDropDownAllowByPercentWise)) 
						_this.setTaxType(data.taxTypeStrHm);
					
					if(editInvoiceConfiguration.showSgstOrCgstAndIgstDropDown && ($('#billServiceTaxonBill').val() == 0 || editInvoiceConfiguration.isTaxTypeDropDownAllowByPercentWise))
						_this.setSelectGstTaxType();

					$("#printBill").bind("click", function() {
						if(bill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID)
							_this.printBill(bill.referenceBillId);
						else
							_this.printBill(bill.billBillId);
					});

					if(typeof supplementaryBill != 'undefined' && supplementaryBill.billTypeId == SUPPLEMENTARY_BILL_TYPE_ID) {
						$("#printSupplementaryBill").off("click").on("click", function() {
							_this.printSupplementaryBill(supplementaryBill.billBillId);
						});
					}

					if(editInvoiceConfiguration.editCollectionPerson) {
						$("#editCollectionPerson_" + bill.billBillId).off("click").on("click", function() {
							_this.editCollectionPerson(bill);
						});
					}

					$("#editRemark_" + bill.billBillId).off("click").on("click", function() {
						_this.editRemark(bill);
					});
					
					$("#editHSNCode_" + bill.billBillId).off("click").on("click", function() {
						_this.editHSNCode(bill);
					});
					
					$("#editSACCode_" + bill.billBillId).off("click").on("click", function() {
						_this.editSACCode(bill);
					});
					
					$("#editVCode_" + bill.billBillId).off("click").on("click", function() {
						_this.editVCode(bill);
					});
					
					$("#editPONumber_" + bill.billBillId).off("click").on("click", function() {
						_this.editPONumber(bill);
					});
					
					$("#editBillPODate_" + bill.billBillId).off("click").on("click", function() {
						_this.editBillPODate(bill);
					});
					
					$("#editAdditionalAmount_" + bill.billBillId).off("click").on("click", function() {
						_this.editAdditionalAmount(bill);
					});
					
					$("#editAdditionalDiscount_" + bill.billBillId).off("click").on("click", function() {
						_this.editAdditionalDiscount(bill, billSummaries);
					});
					
					$(document).on("click", "#isPercentagee", function() {
						const isChecked = $(this).is(":checked");
						showPercentageForAdditionalDiscount(isChecked)
					});

					$(document).on("input", "#percentagee", function() {
						let totalGrandTotal = billSummaries.reduce((sum, bill) => sum + bill.billGrandTotal, 0);

						let percentagee = $('#percentagee').val();
						let percentageeVal = (totalGrandTotal / 100) * percentagee;

						let modal = $('#photoModal'); 
						let additionalDiscountInput = modal.find('#additionalDiscount');
						additionalDiscountInput.val(percentageeVal.toFixed(0));
					});

					$("#editBillDate_" + bill.billBillId).off("click").on("click", function() {
						_this.editBillDate(bill);
					});

					$("#editPartyNameForPrint_" + bill.billBillId).off("click").on("click", function() {
						_this.editPartyNameForPrint(bill);
					});
					
					$("#editBillingPartyName_" + bill.billBillId).off("click").on("click", function() {
						_this.editBillingPartyName(bill);
					});
					
					$("#editBillSubmissionDate_" + bill.billBillId).off("click").on("click", function() {
						_this.editBillSubmissionDate(bill);
					});
					
					if(editInvoiceConfiguration.cancelBill) {
						$("#cancelBill").bind("click", function() {
							_this.cancelBill(bill, supplementaryBill);
						});

						$("#cancelSupplementaryBill").bind("click", function() {
							_this.cancelSupplementaryBill(supplementaryBill);
						});
					}

					$("#addLRs").bind("click", function() {
						_this.addLRs(bill, billSummaries);
					});

					$("#removeLRs").bind("click", function() {
						_this.removeLRs(bill, billSummaries);
					});
					
					if(editInvoiceConfiguration.applyTaxOnBill) {
						$("#applyTax").bind("click", function() {
							_this.applyTax(bill);
						});
						
						$("#removeTax").bind("click", function() {
							_this.removeTax(bill);
						});
					}
					
					if(allowToUploadDownloadExcelFile) {
						$("#downloadToExcel").bind("click", function() {
							_this.downloadToExcel(bill, billSummaries);
						});
					
						$("#uploadExcel").bind("click", function() {
							_this.preUploadActions(bill, billSummaries);
						});
					}

					for (let i = 0; i < billSummaries.length; i++) {
						let obj	= billSummaries[i];
						
						if(editInvoiceConfiguration.removeLRFromBill) {
							$('#checkBoxtoRemoveLR').removeClass('hide');
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><input type='checkbox' name='lrToRemove' id='lrToRemove' value='"+ obj.wayBillId +"'/></td>");
						}

						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber_" + obj.wayBillId + "'><b>" + obj.wayBillNo + "<b></a></td>");						
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillBookingDateTimeString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillSourceBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.wayBillDestinationBranchName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.consignorName + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.consigneeName + "</td>");
						
						if(editInvoiceConfiguration.showPackingTypeWithQtyColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.packingTypeName + "</td>");
						
						columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;' id='creditWayBillPaymentModuleGrandTotal_" + obj.wayBillId + "'>" + obj.billGrandTotal.toFixed(2)+ "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editLrRate_" + obj.wayBillId + "'><b style='font-size: 14px'>Edit LR Rate</b></a></td>");
						
						if(showEditConsignmentColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editConsignment_" + obj.wayBillId + "'><b style='font-size: 14px'>Edit Consignment</b></a></td>");
						
						if(showEditDestinationColumn)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editDestination_" + obj.wayBillId + "'><b style='font-size: 14px'>Edit Destination</b></a></td>");
								
						if(showEditTransportationModeColumn) {
							if(obj.status == WAYBILL_STATUS_BOOKED || obj.status == WAYBILL_STATUS_DISPATCHED 
								|| obj.status == WAYBILL_STATUS_RECEIVED || obj.status == WAYBILL_STATUS_DUEUNDELIVERED
								|| obj.status == WAYBILL_STATUS_DELIVERED || obj.status == WAYBILL_STATUS_CANCELLED_DELIVERY)
								columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editTransportationMode_" + obj.wayBillId + "'><b style='font-size: 14px'>Edit Transportation Mode</b></a></td>")
							 else
								columnArray.push("<td style='text-align: center; vertical-align: middle;'>LR is <b>"+obj.statusString+"</b></td>")
						}
						
						if(editInvoiceConfiguration.editLrWiseBillRemark)
							columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='editLrBillRemark_" + obj.wayBillId + "'><b style='font-size: 14px'>Edit LR Bill Remark</b></a></td>")
						
						if(editInvoiceConfiguration.isTaxTypeDropDownAllow) {
							columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + obj.taxTypeName + "</td>");
							taxTypeId = obj.taxTypeId;
						}
					
						$('#reportTable tbody').append('<tr id="editInvoiceTr_' + obj.wayBillId + '">' + columnArray.join(' ') + '</tr>');

						$("#editLrRate_" + obj.wayBillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.editWayBillCharges(bill, wayBillId);
						});
						
						if(editInvoiceConfiguration.isTaxTypeDropDownAllow && taxTypeId == TAX_TYPE_EXEMPTED)
							$('#applyTax').prop('disabled', true);

						if(showEditConsignmentColumn) {
							$("#editConsignment_" + obj.wayBillId).bind("click", function() {
								let elementId		= $(this).attr('id');
								let wayBillId		= elementId.split('_')[1];
								_this.editConsignment(bill, wayBillId);
							});
						}
						
						if(showEditDestinationColumn) {
							$("#editDestination_" + obj.wayBillId).bind("click", function() {
								let elementId		= $(this).attr('id');
								let wayBillId		= elementId.split('_')[1];
								_this.editDestination(bill, wayBillId);
							});
						}
						
						if(showEditTransportationModeColumn) {
							$("#editTransportationMode_" + obj.wayBillId).bind("click", function() {
								let elementId		= $(this).attr('id');
								let wayBillId		= elementId.split('_')[1];
								_this.editTransportationMode(bill, wayBillId);
							});
						}

						$("#wayBillNumber_" + obj.wayBillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let wayBillId		= elementId.split('_')[1];
							_this.viewWayBillDetails(wayBillId, obj.wayBillNumber);
						});
						
						if(editInvoiceConfiguration.editLrWiseBillRemark) {
							$("#editLrBillRemark_" + obj.wayBillId).bind("click", function() {
								let elementId		= $(this).attr('id');
								let wayBillId		= elementId.split('_')[1];
								_this.editLRBillRemark(bill, wayBillId,obj.wayBillNo);
							});
						}
						
						totalGrandTotal		+= obj.billGrandTotal;
						packingTypeTotal	+= obj.quantity;

						columnArray	= [];
					}

					columnArray	= [];

					if(editInvoiceConfiguration.removeLRFromBill)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");		

					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b>Total</b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					if(editInvoiceConfiguration.showPackingTypeWithQtyColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + packingTypeTotal + "</td>");
					
					columnArray.push("<td style='text-align: right; vertical-align: middle; background-color: #E6E6FA;' id='creditWayBillPaymentModuleGrandTotal'>" + (roundOffBillAmount ? Math.round(totalGrandTotal) : totalGrandTotal.toFixed(2)) + "</td>");					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					if(showEditConsignmentColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					if(showEditDestinationColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					if(showEditTransportationModeColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					if(editInvoiceConfiguration.editLrWiseBillRemark)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
						
					if(editInvoiceConfiguration.isTaxTypeDropDownAllow)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'></td>");
					
					$('#reportTable tfoot').append('<tr>' + columnArray.join(' ') + '</tr>');
				}, setMultipleBillDetails : function(billList) {
					changeDisplayProperty('billdetailspannel','none');
					
					$('#right1-border-boxshadow').removeClass('hide');
					
					refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
					refreshAndHidePartOfPage('left-border-boxshadow', 'hide');

					$('#multipleBillDetails').empty();
					
					let columnArray	= new Array();

					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> BILL No. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> BILL Date. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> PARTY NAME. </b></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><b> Total Amount </b></td>");
					$('#multipleBillDetails').append('<tr class="danger">' + columnArray.join(' ') + '</tr>');

					columnArray	= [];
					
					for(const element of billList) {
						let bill	= element;
						columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='bill_" + bill.billBillId + "'>"+ bill.billBillNumber +"</a></td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bill.billCreationDateString + "</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ bill.billCreditorName +"</td>");
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>"+ bill.billGrandTotal +"</td>");

						$('#multipleBillDetails').append('<tr>' + columnArray.join(' ') + '</tr>');

						columnArray	= [];

						$("#bill_" + bill.billBillId).bind("click", function() {
							let elementId		= $(this).attr('id');
							let billId			= elementId.split('_')[1];
							_this.getBillDetailsByBillId(billId);
						});
					}
				}, printBill : function(billBillId) {
					if(isWSInvoicePrintNeeded)
						window.open('printWayBill.do?pageId=340&eventId=10&modulename=InvoicePrint&masterid=' + billBillId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					else if(isPrintBillGroup)
						window.open('BillPrint.do?pageId=215&eventId=5&billId=' + billBillId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
					else
						window.open('BillPrint.do?pageId=215&eventId=6&billId=' + billBillId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, printSupplementaryBill : function(billId) {
					window.open('printWayBill.do?pageId=340&eventId=10&modulename=supplementrybillprint&masterid=' + billId, 'newwindow', 'config=height=610,width=1000, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
				}, viewWayBillDetails : function(wayBillId, wayBillNumber) {
					window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + 1 + '&wayBillNumber=' + wayBillNumber);
				}, editWayBillCharges : function(bill, wayBillId) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let creditorId		= bill.billCreditorId;
					let billId			= bill.billBillId;
					window.open('editWayBillCharges.do?pageId=340&eventId=2&modulename=editLRRate&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+billId+'&redirectFilter=12','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
				}, editConsignment : function(bill, wayBillId) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let creditorId		= bill.billCreditorId;
					let billId			= bill.billBillId;
					window.open('updateConsignment.do?pageId=340&eventId=2&modulename=editConsignment&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+billId+'&redirectFilter=12','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
				}, editDestination : function(bill, wayBillId) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let creditorId		= bill.billCreditorId;
					let billId			= bill.billBillId;
					window.open('updateDestination.do?pageId=25&eventId=17&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+billId+'&redirectFilter=12','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
				}, editTransportationMode : function(bill, wayBillId) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}
					
					billServiceTaxonBill = $('#billServiceTaxonBill').val();
					
					if(billServiceTaxonBill > 0) {
						btModalConfirm = new Backbone.BootstrapModal({
							content		:	"GST Applied, do you want to update transportation Mode ?",
							modalWidth	:	30,
							title		:	'Update transportation Mode',
							okText		:	'YES',
							showFooter	:	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							let creditorId		= bill.billCreditorId;
							let billId			= bill.billBillId;
							window.open('updateTransportationMode.do?pageId=340&eventId=2&modulename=updateTransportationMode&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+billId+'&redirectFilter=12','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
						});
					} else {
						let creditorId		= bill.billCreditorId;
						let billId			= bill.billBillId;
						window.open('updateTransportationMode.do?pageId=340&eventId=2&modulename=updateTransportationMode&wayBillId='+wayBillId+'&creditorId='+creditorId+'&billId='+billId+'&redirectFilter=12','mywin','left=100,top=70,width=1100,height=900,toolbar=no,resizable=no,scrollbars=yes');
					}
				}, editCollectionPerson : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateCollectionPerson	= editInvoiceConfiguration.editCollectionPerson;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditCollectionPerson(object),
						modalWidth	: 30,
						title		: 'Update Collection Person for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditCollectionPerson(object);
					btModal.open();
				}, editRemark : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateRemark				= editInvoiceConfiguration.editRemark;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditInvoiceRemark(object),
						modalWidth	: 30,
						title		: 'Update Remark for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditInvoiceRemark(object);
					btModal.open();
				}, editSACCode : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateSACCode			= editInvoiceConfiguration.editSACCode;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditInvoiceSACCode(object),
						modalWidth	: 30,
						title		: 'Update SAC Code for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditInvoiceSACCode(object);
					btModal.open();
				}, editHSNCode : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateHSNCode			= editInvoiceConfiguration.editHSNCode;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditInvoiceHSNCode(object),
						modalWidth	: 30,
						title		: 'Update HSN Code for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditInvoiceHSNCode(object);
					btModal.open();
				}, editVCode : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateVCode				= editInvoiceConfiguration.editVCode;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditInvoiceVCode(object),
						modalWidth	: 30,
						title		: 'Update V Code for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditInvoiceVCode(object);
					btModal.open();
				}, editPONumber : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updatePONumber			= editInvoiceConfiguration.editPONumber;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditInvoicePONumber(object),
						modalWidth	: 30,
						title		: 'Update PO Number for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditInvoicePONumber(object);
					btModal.open();
				}, editLRBillRemark : function(bill, wayBillId, wayBillNumber) {
					let object						= new Object();
					object.bill						= bill;
					object.wayBillId				= wayBillId;
					object.updateRemark				= editInvoiceConfiguration.editLrWiseBillRemark;
					
					let btModal = new Backbone.BootstrapModal({
						content		: new EditLRBillRemark(object),
						modalWidth	: 30,
						title		: 'Update LR Bill Remark for LR No. <b>' + wayBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditLRBillRemark(object);
					btModal.open();
				}, editAdditionalAmount : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateAdditionalCharge	= editInvoiceConfiguration.editAdditionalCharges;
					object.additionalChargeLable	= additionalChargeLable;
					
					let btModal = new Backbone.BootstrapModal({
						content		: new EditAdditionalCharge(object),
						modalWidth	: 30,
						title		: 'Update ' + additionalChargeLable + ' for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});
					
					new EditAdditionalCharge(object);
					btModal.open();
				}, editBillDate : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object				= new Object();
					object.bill				= bill;
					object.updateBillDate	= editInvoiceConfiguration.editBillDate;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditBillDate(object),
						modalWidth	: 30,
						title		: 'Update Bill Date for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditBillDate(object);
					btModal.open();
				}, editBillPODate : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object				= new Object();
					object.bill				= bill;
					object.updateBillPODate	= editInvoiceConfiguration.editPODate;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditBillPODate(object),
						modalWidth	: 30,
						title		: 'Update Bill PO Date for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
						btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditBillPODate(object);
					btModal.open();
				}, editPartyNameForPrint : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.editPartyNameForPrint	= editInvoiceConfiguration.editPartyNameForPrint;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditPartyNameForPrint(object),
						modalWidth	: 30,
						title		: 'Update Party Name for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
					
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditPartyNameForPrint(object);
					btModal.open();
				}, editBillingPartyName : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.editBillingPartyName		= editInvoiceConfiguration.editBillingPartyName;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditBillingPartyName(object),
						modalWidth	: 30,
						title		: 'Update Billing Party Name for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditBillingPartyName(object);
					btModal.open();
				}, editBillSubmissionDate : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object						= new Object();
					object.bill						= bill;
					object.updateBillSubmissionDate	= editBillSubmissionDate;

					let btModal = new Backbone.BootstrapModal({
						content		: new EditBillSubmissionDate(object),
						modalWidth	: 30,
						title		: 'Update Bill Submission Date for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();

					object.btModal = btModal;
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});

					new EditBillSubmissionDate(object);
					btModal.open();
				}, cancelBill : function(bill, supplementaryBill) {
					let content = null;
					
					if(typeof supplementaryBill != 'undefined')
						content		= "It you will Cancel This Bill, Supplementary Bill will be also cancel ?";
					else
						content		= "Are you sure you want to Cancel This Bill ?"; 

					btModalConfirm = new Backbone.BootstrapModal({
						content		:	content,
						modalWidth	:	30,
						title		:	'Cancel Bill',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();

					let billDetailsArr			= [];

					let billObject			= new Object();

					billObject['billId']					= bill.billBillId;
					billObject['billNumber']				= bill.billBillNumber;
					billObject['preExecutiveId']			= bill.billExecutiveId;
					billObject['billTypeId']				= bill.billTypeId;

					billDetailsArr.push(billObject);

					if(typeof supplementaryBill != 'undefined') {
						billObject			= new Object();
						
						billObject['billId']					= supplementaryBill.billBillId;
						billObject['billNumber']				= supplementaryBill.billBillNumber;
						billObject['preExecutiveId']			= supplementaryBill.billExecutiveId;
						billObject['billTypeId']				= supplementaryBill.billTypeId;
						billObject['referenceBillId']			= bill.billBillId;
						billObject['referenceBillNumber']		= bill.billBillNumber;
						billDetailsArr.push(billObject);
					}

					let jsonObject					= new Object();

					jsonObject.billDetailsArr		= JSON.stringify(billDetailsArr);

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/cancelBill.do', _this.responseAfterCancelBill, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, cancelSupplementaryBill : function(supplementaryBill) {
					 btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want to Cancel This Supplementary Bill ?",
						modalWidth	:	30,
						title		:	'Cancel Supplementary Bill',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();

					let billDetailsArr			= [];

					let billObject			= new Object();

					billObject['billId']					= supplementaryBill.billBillId;
					billObject['billNumber']				= supplementaryBill.billBillNumber;
					billObject['billTypeId']				= supplementaryBill.billTypeId;
					billObject['referenceBillId']			= supplementaryBill.referenceBillId;
					billObject['referenceBillNumber']		= supplementaryBill.referenceBillNumber;
					billObject['preExecutiveId']			= supplementaryBill.billExecutiveId;

					billDetailsArr.push(billObject);

					let jsonObject					= new Object();

					jsonObject.billDetailsArr		= JSON.stringify(billDetailsArr);

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/cancelBill.do', _this.responseAfterCancelBill, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, removeLRs : function(bill, billSummaries) {
					let flag					= false;
					let transportationModeId	= 0;
					let transportationString;
					
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let checkBoxArray	= new Array();

					$.each($("input[name=lrToRemove]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});

					if(billSummaries.length == 1) {
						showAlertMessage('error', 'Please, Cancel this Bill if bill has only 1 LR !');
						return false;
					}

					if(checkBoxArray.length == 0) {
						showAlertMessage('error', 'Please, Select atleast 1 LR to Remove !');
						return false;
					}

					if(billSummaries.length == checkBoxArray.length) {
						showAlertMessage('error', 'Please, Cancel this Bill if you want to Remove all LR !');
						return false;
					}
					
					let jsonObject = new Object();
					let preWayBillIdArray			= new Array();

					if(editInvoiceConfiguration.isTransportationModeDropDownAllow) {
						let removeLrBillSummaries		= new Array();
						
						for(const element of billSummaries) {
							if(! _this.finalList(Number(element.wayBillId), checkBoxArray))
								removeLrBillSummaries.push(element);
							
							if (taxCalculateOnFreightAmount && !isValueExistInArray(checkBoxArray, element.wayBillId))
								preWayBillIdArray.push(element.wayBillId);
						}
												
						let removeLrTransportModeObj	= _this.getTransportationModeIdToUpdate(removeLrBillSummaries, flag);
						flag							= removeLrTransportModeObj.flag;
						transportationString			= removeLrTransportModeObj.transportationString;
						transportationModeId			= removeLrTransportModeObj.transportationMode;
						
						if(flag) {
							 btModalConfirm = new Backbone.BootstrapModal({
								content		:	"Bill TransportationMode is Changes To <b>" + transportationString + "</b></br> Are you sure you want to remove selected LRs ?",
								modalWidth	:	30,
								title		:	'Remove Seleted LRs',
								okText		:	'YES',
								showFooter	:	true,
								okCloses	:	true
							}).open();
							
							transportationString	= null;	
						}
					} else {
						 btModalConfirm = new Backbone.BootstrapModal({
							content		:	"Are you sure you want to remove selected LRs ?",
							modalWidth	:	30,
							title		:	'Remove Seleted LRs',
							okText		:	'YES',
							showFooter	:	true,
							okCloses	:	true
						}).open();
					}
					
					jsonObject["wayBills"]				= checkBoxArray.join(',');
					jsonObject.billId					= bill.billBillId;
					jsonObject.transportationModeId		= transportationModeId;
					jsonObject.totalInsurancePremium	= totalInsurancePremium;
					
					if(preWayBillIdArray.length > 0)
						jsonObject["preWaybillIds"]			= preWayBillIdArray.join(',');
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/removeLRSFromBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, applyTax : function(bill) {
					let	applyTaxTypeId = $('#applyTaxTypeName_primary_key').val();
					let	taxId		   = $('#taxName_primary_key').val();
					
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}
					
					billServiceTaxonBill = $('#billServiceTaxonBill').val();
					
					if(billServiceTaxonBill > 0) {
						showAlertMessage("info", "Tax Already applied !");
						return false;
					}
					
					if(editInvoiceConfiguration.applyTaxOnTaxTypeId && (applyTaxTypeId == 0 || applyTaxTypeId == undefined)) {
						showAlertMessage("error", "Please Select Tax Type");
						$('#applyTaxTypeId').focus();
						return false;
					}
					
					if(editInvoiceConfiguration.showSgstOrCgstAndIgstDropDown && (taxId == 0 || taxId == undefined)) {
						showAlertMessage("error", "Please Select Tax !");
						$('#taxId').focus();
						return false;
					}
					
					if(bill.transportationModeId > 0 && bill.transportationModeId == TRANSPORTATION_MODE_MIXED_ID) {
						showAlertMessage("info", "You cannot apply tax on Mixed transportation Mode !");
						return false;
					}

					 btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want to Apply Tax ?",
						modalWidth	:	30,
						title		:	'Apply Tax',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();
					
					let jsonObject				= new Object();
					jsonObject.billId			= bill.billBillId;
					jsonObject.applyTaxTypeId	= applyTaxTypeId;
					jsonObject.taxId			= taxId;

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/applyTaxOnBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, removeTax : function(bill) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}
					
					billServiceTaxonBill = $('#billServiceTaxonBill').val();
					
					if(billServiceTaxonBill == 0) {
						showAlertMessage("info", "Tax not found !");
						return false;
					}

					 btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want to Remove Tax ?",
						modalWidth	:	30,
						title		:	'Remove Tax',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();
					
					let jsonObject			= new Object();
					jsonObject.billId		= bill.billBillId;

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/removeTaxFromBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, responseAfterCancelBill : function(response) {
					if(response.message != undefined) {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('left-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('right-border-boxshadow', 'hide');
						$('#taxTypeDiv').addClass('hide');
						
						hideLayer();
						
					}
				}, responseAfterRemoveLR : function(response) {
					if(response.message != undefined) {
						$('#lrDetails').addClass('hide');
						$('#lrDetailsTable tbody').empty();
						$( "#lrNumberEle").unbind( "keydown" );
						$( "#findBtnForAppendLR").unbind( "click" );
						$( "#appendBtn").unbind( "click" );
						$('#taxTypeDiv').addClass('hide');
						
						if (typeof btModalConfirm !== 'undefined' && btModalConfirm != null)
							btModalConfirm.close();
						
						_this.onFind(_this);
						hideLayer();
					}
				}, addLRs : function(bill, billSummaries) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					showPartOfPage('right-border-boxshadow');
					$('#lrNumberEle').focus();
					goToPosition('right-border-boxshadow', 'slow');

					$("#lrNumberEle").bind("keydown", function(event) {
						_this.getWayBillDetailsToAppend(event, bill);
					});

					$("#findBtnForAppendLR").bind("click", function() {
						_this.findWayBillDetailsToAppend(bill);
					});

					$("#appendBtn").bind("click", function() {
						_this.appendLRInBill(bill, billSummaries);
					});
				}, getWayBillDetailsToAppend : function(e, bill) {
					if(e.which == $.ui.keyCode.ENTER || e.keyCode == $.ui.keyCode.ENTER) {
						let lrNumberEle		= $('#lrNumberEle').val();

						if(lrNumberEle == '') {
							showAlertMessage('info', 'Enter LR Number !');
							return false;
						}

						let jsonObject = new Object();

						jsonObject.corporateAccountId		= bill.billCreditorId;
						jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
						jsonObject.creationDateTimeStamp	= toDateTimeString(new Date(bill.billCreationDateTimeStamp));

						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getLRToAppendInBill.do', _this.addLRToAppendInBill, EXECUTE_WITH_ERROR);
						showLayer();
					}
				}, findWayBillDetailsToAppend : function(bill) {
					let lrNumberEle		= $('#lrNumberEle').val();

					if(lrNumberEle == '') {
						showAlertMessage('info', 'Enter LR Number !');
						return false;
					}

					let jsonObject = new Object();

					jsonObject.corporateAccountId		= bill.billCreditorId;
					jsonObject.wayBillNumber			= lrNumberEle.replace(/\s+/g, "");
					jsonObject.creationDateTimeStamp	= toDateTimeString(new Date(bill.billCreationDateTimeStamp));

					getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getLRToAppendInBill.do', _this.addLRToAppendInBill, EXECUTE_WITH_ERROR);
					showLayer();
				}, addLRToAppendInBill : function(response) {
					let divisionId = response.bills[0].divisionId;
					
					if(response.message != undefined) {
						$('#lrNumberEle').val('');
						hideLayer();
						return;
					}

					if(editInvoiceConfiguration.isDivisionWiseBillCreationAllow && billDivisionId > 0 && divisionId > 0 && billDivisionId != divisionId) {
						showAlertMessage('error', 'You cannot append LR of different division !');
						$('#lrNumberEle').val('');
						$('#lrNumberEle').focus();
						hideLayer();
						return; 
					}
					
					let bills				 = response.bills;
					
					if (bills.length > 1)
						_this.showLRSelectionModal(bills);
					 else
						_this.addLRToAppendInBillProcessAndValidation(bills[0]);
				}, setLRDetailsToAppend : function(bills) {
					let columnArray		= new Array();

					columnArray.push("<td style='text-align: center; vertical-align: middle; display: none;'><input type='checkbox' name='lrToAppend' id='lrToAppend' value='" + bills.wayBillId + "' checked='checked'/></td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;' id='wayBillNumber1_" + bills.wayBillId + "'>" + bills.wayBillNumber + "</a></td>");						
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.bookingDateTimeString + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.sourceBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.destinationBranch + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consignorName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + bills.consigneeName + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;' id='creditWayBillPaymentModuleGrandTotal1_" + bills.wayBillId + "'>" + bills.grandTotal + "</td>");
					$('#lrDetailsTable tbody').append('<tr>' + columnArray.join(' ') + '</tr>');

					$("#wayBillNumber1_" + bills.wayBillId).bind("click", function() {
						let elementId		= $(this).attr('id');
						let wayBillId		= elementId.split('_')[1];
						_this.viewWayBillDetails(wayBillId, bills.wayBillNumber);
					});

					hideLayer();
				}, appendLRInBill : function(bill, billSummaries) {
					let flag					= false;
					let transportationString;
					let transportationModeId	= 0;
					let checkBoxArray			= new Array();
					let preWayBillIdArr			= new Array();

					$.each($("input[name=lrToAppend]:checked"), function() { 
						checkBoxArray.push($(this).val());
					});
					
					for(const element of billSummaries) {
						let billSummaryObj	= new Object();
						
						billSummaryObj.wayBillId				= element.wayBillId;
						billSummaryObj.transportationModeId		= element.transportationModeId;
						
						preWayBillIdArr.push(element.wayBillId);
						appendLrBillSummaries.push(billSummaryObj);
					}
					
					if(taxCalculateOnFreightAmount)
						checkBoxArray.push(preWayBillIdArr);
					
					if(editInvoiceConfiguration.isTransportationModeDropDownAllow) {
						let appendLrTransportModeObj	= _this.getTransportationModeIdToUpdate(appendLrBillSummaries, flag);
						transportationString			= appendLrTransportModeObj.transportationString;
						transportationModeId			= appendLrTransportModeObj.transportationMode;
						flag							= appendLrTransportModeObj.flag;
					}
					
					let jsonObject				= new Object();

					jsonObject["wayBills"]			= checkBoxArray.join(',');
					jsonObject.billId				= bill.billBillId;
					jsonObject.billNumber			= $('#billNumberEle').val();
					jsonObject.transportationModeId = transportationModeId;
					jsonObject.totalInsurancePremium= totalInsurancePremium;
					
					if(flag) {
						 btModalConfirm = new Backbone.BootstrapModal({
							content		:	"Bill TransportationMode is Changes To <b>" + transportationString + "</b></br> Are you sure you want to Add selected LRs ?",
							modalWidth	:	30,
							title		:	'Add Seleted LRs',
							okText		:	'YES',
							showFooter	:	true,
							okCloses	:	true
						}).open();
						
						transportationString = null;	
						appendLrBillSummaries	 = [];
					} else {
						 btModalConfirm = new Backbone.BootstrapModal({
							content		:	"Are you sure you want to Add selected LRs ?",
							modalWidth	:	30,
							title		:	'Add Seleted LRs',
							okText		:	'YES',
							showFooter	:	true,
							okCloses	:	true
						}).open();
					}
					
					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/appendLRInBill.do', _this.responseAfterRemoveLR, EXECUTE_WITH_ERROR);
						showLayer();
					});
					
				}, finalList : function(waybillId,checkBoxArray) {
					for (const element of checkBoxArray) {
						if (waybillId == Number(element))
							return true;
					}
					
					return false;
				}, getTransportationModeIdToUpdate : function(newbillSummaries, flag) {
					let countRoad			= 0;
					let countRail			= 0;
					let countAir			= 0;
					let countRoadExpress	= 0;
					let countRoadQuicker	= 0;

					let transportationMode	= 1;
					let transportationString;

					for (const element of newbillSummaries) {
						if(element.transportationModeId == TRANSPORTATION_MODE_ROAD_ID)
							++countRoad;
						else if(element.transportationModeId == TRANSPORTATION_MODE_RAIL_ID)
							++countRail;
						else if(element.transportationModeId == TRANSPORTATION_MODE_AIR_ID)
							++countAir;
						else if(element.transportationModeId == TRANSPORTATION_MODE_ROAD_EXPRESS_ID) 
							++countRoadExpress;
						else if(element.transportationModeId == TRANSPORTATION_MODE_ROAD_QUICKER_ID)
							++countRoadQuicker;
					}

					if(countRoad == newbillSummaries.length) {
						transportationMode		= TRANSPORTATION_MODE_ROAD_ID;
						transportationString	= TRANSPORTATION_MODE_ROAD_NAME;
						flag					= true;
					} else if(countRail == newbillSummaries.length) {
						transportationMode		= TRANSPORTATION_MODE_RAIL_ID;
						transportationString	= TRANSPORTATION_MODE_RAIL_NAME;
						flag					= true;
					} else if(countAir == newbillSummaries.length) {
						transportationMode		= TRANSPORTATION_MODE_AIR_ID;
						transportationString	= TRANSPORTATION_MODE_AIR_NAME;
						flag					= true;
					} else if(countRoadExpress == newbillSummaries.length) {
						transportationMode		= TRANSPORTATION_MODE_ROAD_EXPRESS_ID;
						transportationString	= TRANSPORTATION_MODE_ROAD_EXPRESS_NAME;
						flag					= true;
					} else if(countRoadQuicker == newbillSummaries.length) {
						transportationMode		= TRANSPORTATION_MODE_ROAD_QUICKER_ID;
						transportationString	= TRANSPORTATION_MODE_ROAD_QUICKER_NAME;
						flag					= true;
					} else if(countRail <= 0 && countAir <= 0) {
						transportationMode		= TRANSPORTATION_MODE_ROAD_MIXED_ID;
						transportationString	= TRANSPORTATION_MODE_ROAD_MIXED_NAME;
						flag					= true;
					} else if((countAir > 0 || countRail > 0) && (countRoad > 0 || countRoadExpress > 0 || countRoadQuicker > 0)) {
						transportationMode		= TRANSPORTATION_MODE_MIXED_ID;
						transportationString	= TRANSPORTATION_MODE_MIXED_NAME;
						flag					= true;	
					}
					
					let transportModeToUpdateObj = new Object();
					
					transportModeToUpdateObj.transportationMode		= transportationMode;
					transportModeToUpdateObj.transportationString	= transportationString;
					transportModeToUpdateObj.flag					= flag;
					
					return transportModeToUpdateObj;
				}, setTaxType : function(taxTypeStrHm) {
					$('#taxTypeDiv').removeClass('hide');
					$('#taxDiv').append('<div class="panel-group"><div class="col-xs-5"><div class="left-inner-addon"><i class="glyphicon glyphicon-th"></i><input class="form-control" type="text" name="applyTaxTypeName" data-tooltip="Select Type" placeholder="Select Tax Type" id="applyTaxTypeId" /></div></div>');
					
					_this.setSelectTaxTypeAutocompleteInstance();
					
					let autoSelectType = $("#applyTaxTypeId").getInstance();
					let taxTypeArray = new Array();
					
					if(taxTypeStrHm != null) {
						for(let key in taxTypeStrHm) {
							taxTypeArray.push({ "taxTypeId":key, "taxTypeName": taxTypeStrHm[key] });
						}
					}

					$( autoSelectType ).each(function() {
						this.option.source = taxTypeArray;
					})

				}, setSelectGstTaxType : function() {
					$('#taxTypeDiv').removeClass('hide');
					$('#taxDiv').append('<div class="left-inner-addon"><div class="col-xs-5"><i class="glyphicon glyphicon-th"></i><input class="form-control" type="text" name="taxName" data-tooltip="Select Type" placeholder="Select Tax" id="taxId" /></div></div></div>');
					
					_this.setSelectGstTypeAutocompleteInstance();
					
					let autoSelectType = $("#taxId").getInstance();
					
					let SelectTYPE = [
							{ "gstTaxId":2, "taxName": "SGST-CGST" },
							{ "gstTaxId":4, "taxName": "IGST" },
						]
					
					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				}, setSelectGstTypeAutocompleteInstance : function() {
					let autoSelectTypeName			= new Object();
					autoSelectTypeName.primary_key	= 'gstTaxId';
					autoSelectTypeName.field		= 'taxName';
					$("#taxId").autocompleteCustom(autoSelectTypeName);
				}, setSelectTaxTypeAutocompleteInstance : function() {
					let autoSelectTypeName			= new Object();
					autoSelectTypeName.primary_key	= 'taxTypeId';
					autoSelectTypeName.field		= 'taxTypeName';
					$("#applyTaxTypeId").autocompleteCustom(autoSelectTypeName);
				}, downloadToExcel : function(bill) {
					let jsonObject			= new Object();
					jsonObject['billId']					= bill.billBillId;
					jsonObject['billNumber']				= bill.billBillNumber;
					jsonObject['preExecutiveId']			= bill.billExecutiveId;
					jsonObject['billTypeId']				= bill.billTypeId;
					
					 btModalConfirm = new Backbone.BootstrapModal({
						content		:	"Are you sure you want download Excel ?",
						modalWidth	:	30,
						title		:	'Remove Tax',
						okText		:	'YES',
						showFooter	:	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/downloadExcelForEditBillLrRate.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, responseForExcel : function(data) {
					hideLayer();
					var errMessage = data.message;
					
					if(errMessage != undefined && errMessage.messageId == 21)
						return;
					
					generateFileToDownload(data);
				}, preUploadActions : function(bill) {
					$("#fileInput").click();  
					
					var excelFile = "";
					var excelFileName = "";
					
					$("#fileInput").change(function(event) {
						const file = event.target.files[0];	 // Get the selected file
						
						let FR	= new FileReader();
						excelFileName	 = this.files[0]['name'];
					
						FR.addEventListener("load", function(e) {
							excelFile = e.target.result;
						}); 

						FR.readAsDataURL(file);
						
						if (file) {
							// Validate if the file is an Excel file based on the extension
							const fileExtension = file.name.split('.').pop().toLowerCase();
							const validExtensions = ['xls', 'xlsx', 'csv'];
			
							if (validExtensions.includes(fileExtension)) {
								// Ask for confirmation to upload the file
								const confirmUpload = confirm(`Are you sure you want to upload the file: ${file.name}?`);
								
								if (confirmUpload) {
									// If user confirms, call saveExcelFile function
									_this.saveExcelFile(bill, excelFile, excelFileName);
								}
							} else {
								// If the file is not an Excel file, show an alert
								alert("Please select a valid Excel file (xls, xlsx, csv).");
							}
						}
					});
				}, saveExcelFile : function(bill, excelFile, excelFileName){
					let jsonObject			= new Object();
					
					jsonObject['excelFile']					= excelFile;
					jsonObject['fileName']					= excelFileName;
					jsonObject['billId']					= bill.billBillId;
					jsonObject['billNumber']				= bill.billBillNumber;
					jsonObject['preExecutiveId']			= bill.billExecutiveId;
					jsonObject['billTypeId']				= bill.billTypeId;
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/readExcelWS/readExcelFileForEditInvoiceLrRate.do', _this.responseForUploadExcel, EXECUTE_WITH_ERROR);
					showLayer();
				}, responseForUploadExcel : function(data){
					hideLayer();
					return false;
				},editAdditionalDiscount : function(bill, billSummaries) {
					if(!isAllowToEditBill) {
						showAlertMessage('warning', 'You cannot edit this bill as time over !');
						return;
					}

					let object 						= new Object();
					object.bill 					= bill;
					object.updateAdditionalDiscount	= editInvoiceConfiguration.showEditAdditionalDiscount;
					object.showAdditionalDiscountOptionWithPercentage	= editInvoiceConfiguration.showAdditionalDiscountOptionWithPercentage;
					object.billSummaries			= billSummaries;
					
					let btModal = new Backbone.BootstrapModal({
						content		: new EditAdditionalDiscount(object),
						modalWidth 	: 30,
						title		: 'Update Additional Discount for Bill No. <b>' + bill.billBillNumber + '</b>',
						okText		: 'Update',
						showFooter	: true,
						modalBodyId	: 'photoModal'
					}).open();
					
					object.btModal = btModal;
					btModal.on('hidden', function() {
						$('.modal-backdrop').remove();
					});
					new EditAdditionalDiscount(object);
				}, addLRToAppendInBillProcessAndValidation : function(bills) {
					
					$('#lrDetails').removeClass('hide');
					let appendLRMessage		 = bills.appendLRMessage;
					
					if(restrictBillOnAirTransportationMode) {
						if((isValueExistInArray(transportationModeIdList, TRANSPORTATION_MODE_AIR_ID) && bills.transportationModeId != TRANSPORTATION_MODE_AIR_ID) || transportationModeIdList.length > 0 && (!isValueExistInArray(transportationModeIdList, TRANSPORTATION_MODE_AIR_ID) && bills.transportationModeId == TRANSPORTATION_MODE_AIR_ID)) {
							showAlertMessage("error", "You cannot MIX AIR transportation Mode LR  with OTHER transportation Mode LR !");
							return;
						}
					}	

					if(typeof appendLRMessage != 'undefined' && !confirm(appendLRMessage)) {
						$('#lrNumberEle').val('');
						$('#lrNumberEle').focus();
						hideLayer();
						return;
					}
					
					let appendLrObj = new Object();
					
					appendLrObj.wayBillId				= bills.wayBillId;
					appendLrObj.transportationModeId	= bills.transportationModeId;
				
					appendLrBillSummaries.push(appendLrObj);
					
					if(editInvoiceConfiguration.isTaxTypeDropDownAllow && taxTypeId != bills.taxTypeId) {
						showAlertMessage('error', 'Please Select Same Tax Type Lrs ! ');
						hideLayer();
						return;
					}
					
					if(editInvoiceConfiguration.isTransportationModeDropDownAllow) {
						if(transportationModeId != bills.transportationModeId) {
							let message	= 'Are you sure	 want to Add Different transportation Mode LR Number in Current Bill ?';
							
							billServiceTaxonBill = $('#billServiceTaxonBill').val();
							
							if(billServiceTaxonBill > 0)
								message	= 'GST will be removed if adding Different transportation Mode LR Number. Are you sure	want to Add ?';
							
							btModalConfirm = new Backbone.BootstrapModal({
								content		:	message,
								modalWidth	:	30,
								title		:	'Add Different transportation Mode',
								okText		:	'YES',
								showFooter	:	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								transportationModeId = 0;
							});
							
							btModalConfirm.on('cancel', function() {
								$('#lrDetailsTable tbody').empty();
								btModalConfirm.close();
							});
						}
					}	

					let preLRNumber		= $('#wayBillNumber1_' + bills.wayBillId).html();

					if(typeof preLRNumber != 'undefined' && preLRNumber != '') {
						showAlertMessage('info', 'Already Added LR Number !');
						$('#lrNumberEle').val('');
						hideLayer();
						return;
					}
					
					if(uploadPOD && validatePodUploadedToCreateInvoice && !bills.podUploaded ) {
						if(!showOnlyAlertMessageForPODUploadedOrNot) {
							showAlertMessage('info', 'You can not append LR ' + openFontTag + bills.wayBillNumber + closeFontTag + ' because POD was not uploaded !');
							hideLayer();
							return;
						} else {
							let btModalConfirm = new Backbone.BootstrapModal({
								content		:	"<b style='font-size:18px; color:DodgerBlue;'>POD is not Uploaded For LR No - " + bills.wayBillNumber + "</b>",
								modalWidth	:	30,
								title		:	'Alert message for POD Uploaded or Not',
								okText		:	'OK',
								showFooter	:	true,
								okCloses	:	true
							}).open();
							
							btModalConfirm.on('ok', function() {
								_this.setLRDetailsToAppend(bills);
								 showAlertMessage('info', 'LR Added Sussecfullly for Apend ');
							});
						}
					} else{
						_this.setLRDetailsToAppend(bills);
						showAlertMessage('info', 'LR Added Sussecfullly for Apend ');
					}
					
					$('#lrNumberEle').val('');
					$('#lrNumberEle').focus();
					$(".add-lr-btn[data-waybill-id='" + bills.wayBillId + "']").prop("disabled", true).css({ background: "#6c757d", cursor: "not-allowed" });

					hideLayer();
				}, showLRSelectionModal: function(bills) {
					let modalContent = "<h4 style='color:DodgerBlue; font-weight:bold;'>Click ‘Add’ to Append LRs in Append List</h4>";
					modalContent += "<table class='table table-bordered'><thead><tr><th>Action</th><th>WayBill Number</th><th>Booking Date</th><th>Source Branch</th><th>Destination Branch</th><th>Consignor Name</th><th>Consignee Name</th><th>Grand Total</th></tr></thead><tbody>";

					bills.forEach(bill => {
						modalContent += "<tr>";
						modalContent += "<td><button class='add-lr-btn' data-waybill-id='" + bill.wayBillId + "' style='background:#28a745;color:#fff;padding:3px 8px;border:none;border-radius:4px;cursor:pointer;'>Add</button></td>";
						modalContent += "<td>" + bill.wayBillNumber + "</td>";
						modalContent += "<td>" + bill.bookingDateTimeString + "</td>";
						modalContent += "<td>" + bill.sourceBranch + "</td>";
						modalContent += "<td>" + bill.destinationBranch + "</td>";
						modalContent += "<td>" + bill.consignorName + "</td>";
						modalContent += "<td>" + bill.consigneeName + "</td>";
						modalContent += "<td>" + bill.grandTotal + "</td>";
						modalContent += "</tr>";
					});
					
					modalContent += "</tbody></table>";
					
					let btModal = new Backbone.BootstrapModal({
						content: modalContent,
						modalWidth: 70,
						title: "<b>Same LR Numer Found In Financial Year. Click 'Add' To Append LR.</b>",
						okText: "Close",
						cancelText: "Cancel",
						showFooter: true,
						okCloses: true
					}).open();
					
					btModal.$el.find(".add-lr-btn").on("click", function() {
						let wayBillId = $(this).data("waybill-id");
						let selectedBill = bills.find(b => b.wayBillId == wayBillId);
						if (!selectedBill) return;
						
						let preLRNumber = $('#wayBillNumber1_' + selectedBill.wayBillId).html();
						
						if (typeof preLRNumber !== 'undefined' && preLRNumber !== '') {
							$(this).prop("disabled", true).css({ background: "#6c757d", cursor: "not-allowed" });
							showAlertMessage("info", "This LR is already added in the table for Append !");
							return;
						}
						
						_this.addLRToAppendInBillProcessAndValidation(selectedBill);
					});
				}
			});
	});