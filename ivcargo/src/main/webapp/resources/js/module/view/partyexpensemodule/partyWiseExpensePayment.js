define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyexpensemodule/partyExpensePaymentModuleFilepath.js'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyexpensemodule/partyExpenseModuleHandle.js'
          ,'jquerylingua'
          ,'language'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'slickGridWrapper2'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/populatesubregionandbranch.js'//PopulateAutocomplete
          ,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
          ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,PopulateAutocomplete,UrlParameter) {
	'use strict';
	var jsonObject = new Object(),isFromPartyOutStanding, CreditorName, corporateAccountId = 0,myNod, tab = "createTab", _this = '', gridObject,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet ,reciveButtonRowId;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
			corporateAccountId		=  UrlParameter.getModuleNameFromParam("corporateAccountId");
			CreditorName			=  UrlParameter.getModuleNameFromParam("CreditorName");
			isFromPartyOutStanding	= UrlParameter.getModuleNameFromParam("isFromPartyOutStanding");
		},render : function(masterObj) {
			if(isFromPartyOutStanding){
				jsonObject.corporateAccountId = corporateAccountId;
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyExpenseModuleWS/getPartyExpenseDetailsByCorporateAccountId.do?',	_this.setPartyExpenseDetailsData,	EXECUTE_WITHOUT_ERROR);
			}else{
				getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyExpenseModuleWS/getPartyExpensePaymentElements.do?',	_this.setPaymentReceiveElements,	EXECUTE_WITHOUT_ERROR);
			}
			return _this;
		},setPartyExpenseDetailsData : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			//var executive	= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/partyexpensemodule/partywiseexpensepayment.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
				//masterLangObj = FilePath.loadLanguage();
				//masterLangKeySet = loadLanguageWithParams(masterLangObj);
				loadLanguageWithParams(FilePath.loadLanguage());
				var autoPartyName 			= new Object();
				autoPartyName.primary_key 	= 'corporateAccountId';
				autoPartyName.field 		= 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(autoPartyName);
				_this.setPartyName(decodeURI(CreditorName),corporateAccountId);
				if(response.message != undefined){
					hideLayer();
					$('#reportTable').hide();
					var errorMessage = response.message;
					showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
					return;
				}
				if(isFromPartyOutStanding){
					setExpenseDetailsData(response);	
				}
				//setExpenseDetailsData(response);
				$('#bottom-border-boxshadow').show();
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				$("#findBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onFind(_this);								
					}
				});
				$(".saveBtn").click(function() {
					_this.receivePartyExpensePayment(_this);
				});
				hideLayer();
			});

		},receivePartyExpensePayment : function() {
			var jsonObject = new Object();
			var isAllowFlag	= false;
			var table 					= document.getElementById('reportTable');
			var rowCount 				= table.rows.length;
			var noOfVoucherSelected		= 0;
			
			for(var i = 1; i < rowCount; i++){
				if(document.getElementById('checkBox_'+i) != null){
					if(document.getElementById('checkBox_'+i).checked){
						noOfVoucherSelected++;
					}	
				}
			}
			
			for (var i = 1; i < rowCount; i++) {
				if(noOfVoucherSelected == 0){
					showMessage('error','Please select atleast one party expense voucher to Clear Payment');
				}else{
					if(document.getElementById('checkBox_'+i) != null){
					if(document.getElementById('checkBox_'+i).checked){
						if(Number($('#receivedAmt_'+i).val()) > 0) {
							if(!formValidation(document.getElementById('receivedAmt_'+i))) {
								return false;
							}
							
							isAllowFlag	= true;
						} else if(Number($('#receivedAmt_'+i).val()) < 0) {
						
							if(!formValidation(document.getElementById('receivedAmt_'+i))) {
								return false;
							}
							
							isAllowFlag	= true;
						}
					}	
				}
				}
			}
				
				if(isAllowFlag) {
					disableButtons();
					
					if(confirm('Are you sure you want to clear these Party Expense Voucher ?')) {
						
						disableButtons();
						
						var jsonObject 				= new Object();
						var expenseVoucherData		= null;
						
						var totalVoucherArr		= new Array();
						
						for(var i = 1; i <rowCount; i++) {
								expenseVoucherData				= new Object();
								//var previousRemark			= $('#previousRemark'+i).html();
								if(document.getElementById('checkBox_'+i) != null){
								if(document.getElementById('checkBox_'+i).checked){
									expenseVoucherData.partyWiseExpenseDetailsId			= Number($('#partyWiseExpenseDetailsId'+i).html());
									expenseVoucherData.partyExpenseNumber					= Number($('#partyExpenseNumber'+i).html());
									expenseVoucherData.corporateAccountId					= Number($('#corporateAccountId'+i).html());
									expenseVoucherData.corporateAccountName					= $('#corporateAccountName'+i).html();
									expenseVoucherData.paymentMode							= $('#paymentMode_'+i).val();
									expenseVoucherData.chequeDate							= $('#chequeDate_'+i).val();
									expenseVoucherData.chequeNumber							= $('#chequeNumber_'+i).val();
									expenseVoucherData.remark								= $('#remark_'+i).val();
									expenseVoucherData.amount								= Number($('#receivedAmt_'+i).val());
									expenseVoucherData.bankName								= $('#bankName_'+i).val();
									totalVoucherArr.push(expenseVoucherData);
									var grandTotal  = (Number($('#total').html())- Number($('#receivedAmt_'+i).val()));
									$('#total').html(grandTotal);
									$('#'+i).remove();
								}
							}
						}
						
						var jsonObjectData		= new Object();
						
						jsonObjectData.ExpenceDataArr		= JSON.stringify(totalVoucherArr);
						
						getJSON(jsonObjectData, WEB_SERVICE_URL + '/partyExpenseModuleWS/clearPartyExpenceVoucher.do', _this.getResponseData, EXECUTE_WITH_ERROR);
						showLayer();
					}
					
					enableButtons();
				} else {
					enableButtons();
					showMessage('error', partyExpenseForReceiveErrMsg);
				}
		},getResponseData(response){
		var rowLength	=	document.getElementById('reportTable').rows.length;
		 if(rowLength <= 2){
			 $('#bottom-border-boxshadow').hide();
			// setTimeout(function(){ showMessage('info', "All Expense Voucher Payment Are Setteled successfully!"); }, 2000);
			$('.messageDiv').html("<h3 style='color:blue;'>All Expense Voucher Payment Are Setteled successfully for this party!</h3>"); 
		 }
			if(response.success != undefined) {
				hideLayer();
				var successMessage = response.success;
				showMessage('info', successMessage);
				
			}
			hideLayer();
		},onFind : function() {
			showLayer();
			var jsonObject = new Object();
			console.log($('#partyNameEle_primary_key').val());
			jsonObject["corporateAccountId"] 		= $('#partyNameEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyExpenseModuleWS/getPartyExpenseDetailsByCorporateAccountId.do', _this.setTableData, EXECUTE_WITH_ERROR);
		},setPaymentReceiveElements : function(response){
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/partyexpensemodule/partywiseexpensepayment.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				var options					= new Object();
				options.minDate				= response.minDateString;
				var autoPartyName 			= new Object();
				autoPartyName.primary_key 	= 'corporateAccountId';
				autoPartyName.url 			= response.corporateAccountArr;
				autoPartyName.field 		= 'corporateAccountDisplayName';
				$("#partyNameEle").autocompleteCustom(autoPartyName);
					
				masterLangObj = FilePath.loadLanguage();
				masterLangKeySet = loadLanguageWithParams(masterLangObj);
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#partyNameEle',
					validate: 'validateAutocomplete:#partyNameEle_primary_key',
					errorMessage: 'Select proper Party Name !'
				});
				hideLayer();
				$("#findBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onFind(_this);								
					}
				});
				$(".saveBtn").click(function() {
					_this.receivePartyExpensePayment(_this);
				});
			});

		},setTableData : function(response){
			setExpenseDetailsData(response);
			hideLayer();
		},setPartyName:function(partyName,corporateAccountId){
			 $("#partyNameEle").val(partyName);
			 $('#partyNameEle_primary_key').val(corporateAccountId)
		}
		});
});