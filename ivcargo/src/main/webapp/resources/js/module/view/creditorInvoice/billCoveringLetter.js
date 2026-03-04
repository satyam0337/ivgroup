define(
		[
		'marionette',//Marionette
	      //marionette JS framework
	     'selectizewrapper',
		 PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'],
		 function(Marionette, Selectizewrapper, UrlParameter, Selection) {
			'use strict';
			var jsonObject = new Object(), myNod, billCoveringLetterId = 0, billCoveringLetterNo = 0, _this = '', typeOfSelectionList,
			 btModalConfirm, billModelArray, billIdArrayList = new Array(), commonCreditorId = 0, configuration;
			var TotalBalanceAmt      		= 0;
			var TotalReceivedAmt     		= 0;
			var FinalGrandTotal 		    = 0;
			var noOfRow 		    		= 0;
			
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this 					= this;
					billCoveringLetterId 	= UrlParameter.getModuleNameFromParam(MASTERID);
					billCoveringLetterNo   	= UrlParameter.getModuleNameFromParam(MASTERID2);
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditorInvoiceWS/initializeBillCoveringLetter.do?', _this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();
					
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/creditorInvoice/BillCoveringLetter.html",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						
						if(billCoveringLetterId != undefined && billCoveringLetterId > 0) {
							$("#billCoverLetterNo").append(billCoveringLetterNo);
							$("#reprint").removeClass('hide');
						
							$("#reprintBtn").click(function(){
								_this.showPrint(billCoveringLetterId);
							})
						
							_this.showPrint(billCoveringLetterId);
						} else
							$("#reprint").addClass('hide');
						
						hideLayer();
						
						$("#partyNameEle").css("width","500px");
						
						typeOfSelectionList				= response.SelectionTypeList;
						configuration					= response.configuration;
												
						if(configuration.showDispatchByDropdown) {
							$("[data-attribute='dispatchBy']").removeClass("hide");
							_this.setDispatchBy(response);	
						} else
							$("[data-attribute='dispatchBy']").remove();
						
						if(configuration.showPersonName) {
							$("[data-attribute='personName']").removeClass("hide");
						} else
							$("[data-attribute='personName']").remove();
						
						if(configuration.showManualDateFeild){
							$("#manualBillDiv").removeClass('hide');
							
							$("#manualBillDateEle").SingleDatePickerCus({
								minDate 	: response.minDate,
								maxDate		: response.maxDate,
								startDate 	: response.maxDate
							});
						} else
							$("#manualBillDiv").remove();

						Selectizewrapper.setAutocomplete({
							jsonResultList		: typeOfSelectionList,
							valueField			: 'selectionTypeId',
							labelField			: 'selectionTypeName',
							searchField			: 'selectionTypeName',
							elementId			: 'typeOfSelection',
							onChange			: _this.getSelection
						});
						
						response.partySelection					= true;
						response.executiveTypeWiseBranch		= true;
						
						let elementConfiguration	= new Object();
						
						elementConfiguration.branchElement		= $('#branchEle');
						response.elementConfiguration			= elementConfiguration;
						
						Selection.setSelectionToGetData(response);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						$("#findBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.searchData();
						});
						
						$(".saveBtn").click( function(dd){
							_this.submitData();
						});

						$("#billNumberEle").keyup(function(event) {
							if(event.which && $("#typeOfSelection").val() == SEARCH_BY_MULTIPLE_BILL){ // Netscape/Firefox/Opera
								var keycode 	= event.which;
								
								if(keycode == 13){
									myNod.performCheck();
									
									if(myNod.areAll('valid'))
										_this.searchData();
								}
							}
						});
					});
				}, setDispatchBy : function(response) {
					Selectizewrapper.setAutocomplete({
						jsonResultList		: response.DispatchedByList,
						valueField			: 'dispatchedById',
						labelField			: 'dispatchedByName',
						searchField			: 'dispatchedByName',
						elementId			: 'dispatchByEle'
					});
				}, getSelection : function (){
					$("#billNumberEle").val("");
					commonCreditorId = 0;
					//$("#branchEle").val("");
					//$("#controlinput_branchEle").prev().text("");
					//$("#branchEle_wrapper").val("");
					//$("#partyNameEle").val("");
					//$("#controlinput_partyNameEle").prev().text("");
					//$("#billCovLetterTable").children().empty();
					refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					removeTableRows('BillDetails', 'tbody');
					removeTableRows('BillDetails', 'tfoot');
					myNod.add({
						selector		: '#billNumberEle',
						validate		: 'presence',
						errorMessage	: 'Enter Bill Number !'
					});
					myNod.add({
						selector		: '#branchEle_wrapper',
						validate		: 'validateAutocomplete:#branchEle',
						errorMessage	: 'Select Branch !'
					});
					myNod.add({
						selector		: '#partyNameEle_wrapper',
						validate		: 'validateAutocomplete:#partyNameEle',
						errorMessage	: 'Please Select Party Name !'
					});
					
					if($("#typeOfSelection").val() == SEARCH_BY_MULTIPLE_BILL ){
						$("[data-attribute='billNumberLabel']").removeClass("hide");
						$("[data-attribute='branchNameLabel']").removeClass("hide");
						$("[data-attribute='buttonFind']").addClass("hide");
						$("[data-attribute='partyNameLabel']").addClass("hide");
						
						myNod.add({
							selector		: '#billNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Bill Number !'
						});
						myNod.add({
							selector		: '#branchEle_wrapper',
							validate		: 'validateAutocomplete:#branchEle',
							errorMessage	: 'Select Branch !'
						});
						myNod.remove('#partyNameEle_wrapper');
					} else if($("#typeOfSelection").val() == SEARCH_BY_BILL_NO ){
						$("[data-attribute='billNumberLabel']").removeClass("hide");
						$("[data-attribute='branchNameLabel']").removeClass("hide");
						$("[data-attribute='buttonFind']").removeClass("hide");
						$("[data-attribute='partyNameLabel']").addClass("hide");
						
						myNod.add({
							selector		: '#billNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Bill Number !'
						});
						myNod.add({
							selector		: '#branchEle_wrapper',
							validate		: 'validateAutocomplete:#branchEle',
							errorMessage	: 'Select Branch !'
						});
						myNod.remove('#partyNameEle_wrapper');
					} else if($("#typeOfSelection").val() == SEARCH_BY_CREDITOR ){
						$("[data-attribute='partyNameLabel']").removeClass("hide");
						$("[data-attribute='billNumberLabel']").addClass("hide");
						$("[data-attribute='branchNameLabel']").addClass("hide");
						$("[data-attribute='buttonFind']").removeClass("hide");
						
						myNod.remove('#billNumberEle');
						myNod.remove('#branchEle_wrapper');
						myNod.add({
							selector		: '#partyNameEle_wrapper',
							validate		: 'validateAutocomplete:#partyNameEle',
							errorMessage	: 'Please Select Party Name !'
						});
					} else {
						$("[data-attribute='buttonFind']").addClass("hide");
						$("[data-attribute='billNumberLabel']").addClass("hide");
						$("[data-attribute='branchNameLabel']").addClass("hide");
						$("[data-attribute='partyNameLabel']").addClass("hide");
					}
					
				}, searchData : function() {
					showLayer();
					var jsonObject 				= new Object();
					var typeOfSelection			= $("#typeOfSelection").val();
					var BillNumber				= $('#billNumberEle').val();
					
					jsonObject.typeOfSelection	= typeOfSelection;
					
					jsonObject.branchId			= 0;
					jsonObject.CreditorId		= 0;
					
					if(typeOfSelection == SEARCH_BY_CREDITOR)
						jsonObject.CreditorId 	= $('#partyNameEle').val();
					else {
						jsonObject.billNumber	= BillNumber.replace(/\s+/g, "");
					
						if($('#branchEle').val() != "")
							jsonObject.branchId	= $('#branchEle').val();
					}
					
					if(_this.validateBillNumber())
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillDetailsForBillCoveringLtter.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				}, validateBillNumber : function(){
					var tbl  		= document.getElementById('billCovLetterTable');
					var billNumber	= $('#billNumberEle').val().trim();
					var rowCount 	= 0;

					if(tbl.rows != undefined)
						rowCount 	= tbl.rows.length - 1;
					
					for (var i = 1; i < rowCount; i++) {
						var addedBillNo = null;

						if(tbl.rows[i].cells[2] != undefined) {
							var child	= $(tbl.rows[i].cells[2]).children()[0];
							addedBillNo = $(child).text();
						}

						if(addedBillNo == billNumber) {
							showMessage('info', billNumberAlreadyAddedInfoMsg(billNumber));
							hideLayer();
							return false;
						} else
							hideAllMessages();
					}

					return true;
				}, setBillDetailsData : function(response) {
					hideLayer();
					
					var searchOperation			= $("#typeOfSelection").val();
					
					if(response.message != undefined) {
						var errorMessage = response.message;
					
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);;
						
						if(Number(searchOperation) != SEARCH_BY_MULTIPLE_BILL) {
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							removeTableRows('BillDetails', 'tbody');
							removeTableRows('BillDetails', 'tfoot');
						}
					
						return;
					}
					
					showPartOfPage('bottom-border-boxshadow');
					
					$('#billNumberEle').val('');
					$('#reportTable tfoot').empty();
					
					var columnArray					= new Array();
					
					billModelArray   				= response.bills;
					
					var columnHeadArray				= new Array();
					var columnArray					= new Array();
					var columnTotalArray			= new Array();
					var alreadyExistsBillNumber     = '';
					
					if(Number(searchOperation) != SEARCH_BY_MULTIPLE_BILL) {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						removeTableRows('BillDetails', 'tbody');
						billIdArrayList				= [];
						commonCreditorId			= 0;
						TotalBalanceAmt      		= 0; 
						TotalReceivedAmt     		= 0; 
						FinalGrandTotal 		    = 0; 
						noOfRow 		    		= 0; 
						$("#billCovLetterTable").children().empty();
					}

					removeTableRows('BillDetails', 'tfoot');

					if(commonCreditorId == undefined || commonCreditorId == 0)
						commonCreditorId			= billModelArray[0].creditorId;
					
					if(billModelArray[0].creditorId != commonCreditorId){
						showMessage('error','Please Enter Bill Number Of Same TBB Party !');
						return false;
					}
					
					$('#BillDetails').removeClass('hide');
					$('#bottom-border-boxshadow').css("display", "block");
					$('#bottom-border-boxshadow').removeClass('hide');
					$('#BillCovSaveButton').removeClass('hide');
					$('#BillCovSaveButton1').removeClass('hide');

					$("#CreditorName").val(billModelArray[0].creditorName);
					
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>#</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'><input type='checkbox' name='selectAll' id='selectAll' value='reportTable' onclick='selectAllCheckBox(this.checked,this.value);'/>Select All</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Bill Number</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Date</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Branch</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Status</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Grand Total</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Received Amt</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Balance Amount</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>No Of Days</th>");
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>Collection Person</th>");
					
					if(configuration.showPodUploadButton) 
					columnHeadArray.push("<th style='text-align: center; vertical-align: middle;'>POD</th>");
				
					if(!$('#BillDetailsHeader').exists()){	
						$('#BillDetails thead').append('<tr id="BillDetailsHeader" class="text-info text-center">' + columnHeadArray.join(' ') + '</tr>');
					}

					for(var i = 0 ; i< billModelArray.length; i++){
						if(billModelArray[i].creditorId == commonCreditorId){
							billIdArrayList.push(billModelArray[i].billId);
							
							var grandTotal 				= billModelArray[i].grandTotal + billModelArray[i].additionalCharge + billModelArray[i].incomeAmount;
							var receivedAmount			= grandTotal - billModelArray[i].balAmount;
							
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + (noOfRow + 1) + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '><input type='checkbox' name='billToAdd' id='billToAdd_"+billModelArray[i].billId+"' data-tooltip='"+billModelArray[i].billNumber +"' value='"+ billModelArray[i].billId +"' /></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '><a href='javascript:viewBillSummary(" + billModelArray[i].billId + ","+"&#39;"+ billModelArray[i].billNumber +"&#39;"+ "," + billModelArray[i].status + "," + "&#39;" + billModelArray[i].creditorName + "&#39;)'&quot;'>" + billModelArray[i].billNumber + "</a></td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + billModelArray[i].creationDateTimeStampString + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + billModelArray[i].branchName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + billModelArray[i].clearanceStatusName + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + grandTotal + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + receivedAmount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; ' id='balAmt_"+ billModelArray[i].billId +"' >" + billModelArray[i].balAmount + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + billModelArray[i].noOfDays + "</td>");
							columnArray.push("<td style='text-align: center; vertical-align: middle; '>" + billModelArray[i].collectionPersonName + "</td>");
							
							if(configuration.showPodUploadButton) 
							columnArray.push(`<td class="datatd" align="left"><input type="button" value="Upload Pod" class='btn btn-success' onclick="javascript:window.open('viewDetails.do?pageId=340&eventId=2&modulename=uploadPodBill&billId=${billModelArray[i].billId}&billNumber=${billModelArray[i].billNumber}', '', 'location=0, status=0, scrollbars=no, width=825, height=520, resizable=no');"/></td>`);

							
							if(!$('#billId_'+ billModelArray[i].billId ).exists()){
								$('#BillDetails tbody').append('<tr id="billId_'+ billModelArray[i].billId +'">' + columnArray.join(' ') + '</tr>');
							}else{
								alreadyExistsBillNumber = billModelArray[i].billNumber + ',' + alreadyExistsBillNumber;
							}	
							
							TotalBalanceAmt 	+= Number(billModelArray[i].balAmount);
							TotalReceivedAmt	+= Number(receivedAmount);
							FinalGrandTotal 	+= Number(grandTotal);
							
							columnArray = [];
							Number(noOfRow++);
						} else {
							showMessage('error','Please Enter Bill Number Of Same TBB Party !');
							return false;
						}
					}

					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'>"+ noOfRow +"</th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'>Total</th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'>"+ FinalGrandTotal +"</th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'>"+ TotalReceivedAmt +"</th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'>"+ TotalBalanceAmt +"</th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					
					if(configuration.showPodUploadButton) 
					columnTotalArray.push("<th style='text-align: center; vertical-align: middle;'></th>");
					
					if(!$('#BillDetailsFooter').exists()){	
						$('#BillDetails tfoot').append('<tr id="BillDetailsFooter" class="text-info text-center">' + columnTotalArray.join(' ') + '</tr>');
					}
					
					if(alreadyExistsBillNumber != ''){
						showMessage('error','Bill Number '+alreadyExistsBillNumber+' Already Added !');
						return false;
					}
					
					goToPosition('bottom-border-boxshadow', 'slow');
					
					$('#selectAll').bind("click", function() {
						_this.selectAllCheckBox(this.checked);
					});
					
					$(billIdArrayList).each(function() {
						$('#billToAdd_'+this).bind("click", function() {
							_this.reCalculateAmount();
							_this.unSelectAllCheckBox(this.checked);
						});
					});

					hideLayer();
				
					$("#addNewRecord").bind("click", function() {
					    _this.addNewRecord();
					});
					
					$("#btSubmit").bind("click", function() {
					    _this.makeBill(bill);
					});
				}, selectAllCheckBox : function(param) {
					var tab 	= document.getElementById('billCovLetterTable');
					for(var row = 1 ; row < tab.rows.length; row++) {
						if(tab.rows[row].cells[1].firstChild != null)
							tab.rows[row].cells[1].firstChild.checked = param;
					}

					_this.reCalculateAmount();
				}, unSelectAllCheckBox : function(param) {
					if(!param)
						document.getElementById('selectAll').checked = false;;
					
					_this.reCalculateAmount();
				}, reCalculateAmount : function() {
					var totalBalanceAmount = 0;

					$('input[name=billToAdd]:checked').each(function() {
						var billId					= this.value;

						if(parseInt($('#balAmt_'+billId).text()) > 0)
							totalBalanceAmount += parseInt($('#balAmt_'+billId).text());
					});

					if(totalBalanceAmount > 0) {
						$('#totalBalanceAmount').val(Math.abs(totalBalanceAmount));
						$('#totalBalanceAmount1').val(Math.abs(totalBalanceAmount));
					} else {
						$('#totalBalanceAmount').val(0);
						$('#totalBalanceAmount1').val(0);
					}
				}, submitData : function() {
					let checkBoxArray	= getAllCheckBoxSelectValue('billToAdd');

					if(checkBoxArray.length == 0) {
						showMessage('error', 'Please Select At least One Bill !');
						return;
					}
					
					if(configuration.showManualDateFeild && $('#manualBillDateEle').is(":visible") && !(_this.validateManualBillDate(billModelArray, checkBoxArray)))
						return false;

					if($("#remark").val() == undefined || $("#remark").val() == ''){
						showMessage('error', ramarkErrMsg);
						$("#remark").focus();
						return;
					}
				
					if(configuration.showDispatchByDropdown && ($("#dispatchByEle").val() == undefined || $('#dispatchByEle').val() === '')) {
						showMessage('error', 'Please Select Dispatch By Type !');
						$("#dispatchByEle").focus();
						return;
					}
					
					if(configuration.showPersonName && ($("#personNameEle").val() == undefined || $('#personNameEle').val() === '')) {
						showMessage('error', 'Please enter Person Name!');
						$("#personNameEle").focus();
						return;
					}

					var jsonObject		= new Object();
					
					jsonObject.remark					= $('#remark').val();
					jsonObject["billIds"]				= checkBoxArray.join(',');
					jsonObject["dispatchById"] 			= $('#dispatchByEle').val();
					jsonObject["manualBillDate"]		= $('#manualBillDateEle').val();
					jsonObject["contactPersonName"] 	= $('#personNameEle').val();
									
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Do You want to Create Bill Covering Letter ?",
						modalWidth 	: 	30,
						title		:	'Bill Covering Letter',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();
					
					btModalConfirm.on('ok', function() {
						showLayer();
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/makeBillCoveringLetter.do', _this.responseAfterMakeBillCovLetter, EXECUTE_WITH_ERROR);
					});
					
					btModalConfirm.on('cancel', function() {
						hideLayer();
					});
				}, responseAfterMakeBillCovLetter : function(response) {
					hideLayer();
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						
						if(errorMessage.typeName == 'success') {
							showMessage(errorMessage.typeName, 'Bill Covering Letter '+response.billNumber+' Successfully Created');
							refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
							
							var MyRouter = new Marionette.AppRouter({});
							MyRouter.navigate('&modulename=billCoveringLetter&masterid='+response.billCoveringLetterId+'&masterid2='+response.billNumber);
							setTimeout(function(){ location.reload(); }, 1000);
						} else
							showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
				}, validateManualBillDate : function(billModelArray, checkBoxArray) {
					var filteredBillModels = billModelArray.filter(function(billModel) {
					 	if (checkBoxArray.includes((""+billModel.billId)))
							return true; // Keep the object
						    
						return false; // Discard the object
					});
											
					for(var w = 0 ; w < filteredBillModels.length ; w++){
						var billDate  = filteredBillModels[w].creationDateTimeStampString;
						
						billDate  = billDate.split("-");
						billDate = new Date(billDate[2], parseInt(billDate[1],10) - 1, billDate[0]);
						
						var manualBillDate = $('#manualBillDateEle').val().split("-");
						manualBillDate = new Date(manualBillDate[2], parseInt(manualBillDate[1],10) - 1, manualBillDate[0]);
						
						if(billDate > manualBillDate) {
							showMessage('error', 'Manual Bill Date earlier than Creation Date of Bill Number ' + filteredBillModels[w].billNumber);
							return false;
						}
					}
				
				return true;
			}, showPrint : function (billCoveringLetterId) {
				var newwindow=window.open('BillCoveringLetter.do?pageId=340&eventId=10&modulename=billCoveringLetterPrint&billCoveringLetterId='+billCoveringLetterId+'&isSearchModule=false&msg=0', 'newwindow', 'config=height=610,width=815, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			}
		});
});

function viewBillSummary(billId, billNo, billStatusId, creditorName) {
	window.open('viewBillSummary.do?pageId=216&eventId=4&billId='+billId+'&billNo='+billNo+'&billStatusId='+billStatusId+'&creditorName='+creditorName,'mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}
