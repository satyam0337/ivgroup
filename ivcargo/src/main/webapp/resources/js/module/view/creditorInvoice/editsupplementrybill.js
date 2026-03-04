define(
		[
		 'JsonUtility',
		 'messageUtility',
		 PROJECT_IVUIRESOURCES + '/resources/js/module/view/creditorInvoice/supplementarybillinvoicefilepath.js',
		 'jquerylingua',
		 'language',
		 'autocomplete',
	     'autocompleteWrapper',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		 PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'],
		 function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
				 BootstrapModal, Selection) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '', btModalConfirm;
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/creditorInvoiceWS/loadSupplementaryBillInvoice.do?', _this.renderCreditorInvoiceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderCreditorInvoiceElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/creditorInvoice/SuppleMentryBillInvoice.html?v=1.0",
							function() {
								baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						
						$("#billNumberEle").focus();
						
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
							selector		: '#billNumberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Bill Number !'
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
					
					let BillNumber				= $('#billNumberEle').val();
					
					jsonObject.billNumber		= BillNumber.replace(/\s+/g, "");
					jsonObject.branchId			= $('#branchEle_primary_key').val();
					
					getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/getBillDetailsForSupplementaryBill.do', _this.setBillDetailsData, EXECUTE_WITH_ERROR);
				},setBillDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						refreshAndHidePartOfPage('middle-border-boxshadow', 'hide');
						return;
					}
					showPartOfPage('bottom-border-boxshadow');
					showPartOfPage('middle-border-boxshadow');
					$('#reportTable tfoot').empty();
					_this.setDataInTable(response);
					hideLayer();
				},setDataInTable : function(data) {
					let billArrayList			= data.billArrayList;
					let bill					= billArrayList[0];
					
					$('#editLinks').empty();
					$('#BillDate').html(bill.billCreationDateString);
					$('#CreditorName').html(bill.billCreditorName);
					$('#CollectionPersonName').html(bill.billCollectionPersonName);
					$('#Remark').html(bill.billRemark);
					$('#AdditionalCharge').html(bill.billAdditionalCharge);
					$('#BillTotal').html(bill.billGrandTotal);
					$('#creditorId').val(bill.billCreditorId);
					
					/*myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					
					myNod.add({
						selector		: '#description',
						validate		: 'presence',
						errorMessage	: 'Enter Description !'
					});
					
					myNod.add({
						selector		: '#amount',
						validate		: 'presence',
						errorMessage	: 'Enter Amount !'
					});*/
					
					$("#addNewRecord").bind("click", function() {
					    _this.addNewRecord();
					});
					
					$("#btSubmit").bind("click", function() {
					    _this.makeBill(bill);
					});
				}, addNewRecord : function() {
					$('#billDetails tr:last').after(
						'<tr id="billDetails' + $("tr:last")[0].rowIndex + '">' + 
							'<td><textarea name="description' + $("tr:last")[0].rowIndex + '" id="description' + $("tr:last")[0].rowIndex + '" class="form-control" maxlength="250" cols="10" style="width: 300px;" placeholder="Description" ></textarea></td>' + 
							'<td><input type="text" name="amount' + $("tr:last")[0].rowIndex + '" id="amount' + $("tr:last")[0].rowIndex + '"  class="form-control" maxlength="10" style="width: 150px;" onkeypress="return noNumbers(event)" placeholder="Amount"/></td>' + 
							'<td><input type="text" name="remark' + $("tr:last")[0].rowIndex + '" id="remark' + $("tr:last")[0].rowIndex + '"  class="form-control" maxlength="250" style="width: 250px;" placeholder="Remark"/></td>' +
							/*'<td><button type="button" class="btn btn-danger" id="btRemove' + $("tr:last")[0].rowIndex + '">Remove</button></td>' +*/
						'</tr>'
					 )
					
					/*let tBody = document.getElementById("reportTable").getElementsByTagName("TBODY")[0];
					let tBodyLength				= $('#billDetails tr').length;
					//Add Row.
					let row = tBody.insertRow(-1);

					//Add Name cell.
					let cell = row.insertCell(-1);
					cell.innerHTML = $('#description').val();
					
					$('#description').val('');

					//Add Country cell.
					cell = row.insertCell(-1);
					cell.innerHTML = $('#amount').val();
					$('#amount').val('');
					cell = row.insertCell(-1);
					cell.innerHTML = $('#remark').val();
					$('#remark').val('');
					//Add Button cell.
					cell = row.insertCell(-1);
					let btnRemove = document.createElement("INPUT");
					btnRemove.type = "button";
					btnRemove.value = "Remove";
					btnRemove.id	= "remove_" + tBodyLength;
					btnRemove.className	= "btn btn-danger";
					btnRemove.setAttribute("onclick", "Remove(this);");
					cell.appendChild(btnRemove);
					*/
					 
					$("#remove_" + $("tr:last")[0].rowIndex).bind("click", function() {
					    _this.remove(this);
					});
				}, remove : function(button) {
					 let row 	= button.parentNode.parentNode;
					 let name 	= row.getElementsByTagName("TD")[0].innerHTML;
					 
					 if (confirm("Do you want to delete: " + name)) {
						 //Get the reference of the Table.
						 let table = document.getElementById("reportTable");

						 //Delete the Table row using it's Index.
						 table.deleteRow(row.rowIndex);
					 }
				}, makeBill : function(bill) {
					let jsonObject 				= new Object();
					
					let billSummaryList			= new Array();
					
					let tBodyLength				= $('#billDetails tr').length;
					
					for(let i = 0; i < tBodyLength; i++) {
						let obj		= new Object();
						
						if($('#description' + i).val() != '' && $('#amount' + i).val() > 0) {
							obj['description']		= $('#description' + i).val();
							obj['totalAmount']		= $('#amount' + i).val();
							obj['remark']			= $('#remark' + i).val();
							
							billSummaryList.push(obj);
						}
					}
					
					jsonObject.billId				= bill.billBillId;
					jsonObject.billNumber			= bill.billBillNumber;
					jsonObject.corporateAccountId	= bill.billCreditorId;
					jsonObject.billSummaryList		= JSON.stringify(billSummaryList);
					
					btModalConfirm = new Backbone.BootstrapModal({
						content		: 	"Are you sure you want to Make this Bill ?",
						modalWidth 	: 	30,
						title		:	'Make Bill',
						okText		:	'YES',
						showFooter 	: 	true,
						okCloses	:	true
					}).open();

					btModalConfirm.on('ok', function() {
						getJSON(jsonObject, WEB_SERVICE_URL + '/creditorInvoiceWS/makeSupplementaryBill.do', _this.responseAfterMakeBill, EXECUTE_WITH_ERROR);
						showLayer();
					});
				}, responseAfterMakeBill : function(response) {
					if(response.message != undefined) {
						let errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						setTimeout(function(){ location.reload(); }, 1000);
						btModalConfirm.close();
						hideLayer();
						return;
					}
				}
			});
		});