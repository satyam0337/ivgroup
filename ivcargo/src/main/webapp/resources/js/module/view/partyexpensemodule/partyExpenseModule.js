define([  'JsonUtility'
          ,'messageUtility'
          ,PROJECT_IVUIRESOURCES + '/resources/js/module/view/partyexpensemodule/partyExpenseModuleFilepath.js'
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
          ],function(JsonUtility, MessageUtility, FilePath, Handle, Lingua, Language, AutoComplete, AutoCompleteWrapper,
        		  slickGridWrapper2, NodValidation, BootstrapModal,datePickerUI,ElementFocusNavigation,PopulateAutocomplete) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0, tab = "createTab", _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet ,reciveButtonRowId;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyExpenseModuleWS/getPartyExpenseSaveElements.do?',	_this.setPendingPaymentElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setPendingPaymentElements : function(response){
			console.log(response)
			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/partyexpensemodule/partyexpensemodule.html",function() {
				baseHtml.resolve();
			});
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					/*if (keyObject[i] == 'crossingType' && response[keyObject[i]].show == true) {
						crossingTypeComboBoxShow = true;
					}*/
					if (response[keyObject[i]].show == false) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("hide");
					}
				}
				var options		= new Object();
				options.minDate	= response.minDateString;
				var autoPartyName = new Object();
				autoPartyName.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
				autoPartyName.primary_key 	= 'corporateAccountId';
				autoPartyName.field 		= 'corporateAccountDisplayName';
				//autoPartyName.callBack 		= _this.setPartyName;
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
				myNod.add({
					selector		: '#amountEle',
					validate		: 'integer',
					errorMessage	: 'Should be numeric'
				});
				myNod.add({
					selector		: '#remarkEle',
					validate		: 'presence',
					errorMessage	: 'Cannot be left blank'
				});
				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},onSubmit : function() {
			if(confirm('Are you sure to Save these Expense ?')) {
				showLayer();
				var jsonObject = new Object();
				

				jsonObject["corporateAccountId"] 		= $('#partyNameEle_primary_key').val();
				jsonObject["amount"] 					= $('#amountEle').val();
				jsonObject["remark"] 					= $('#remarkEle').val();
				
				getJSON(jsonObject, WEB_SERVICE_URL+'/partyExpenseModuleWS/savePartyExpenseDetails.do', _this.setPendingPaymentTableData, EXECUTE_WITH_ERROR);

			}
		},setPendingPaymentTableData : function(response) {
			$('#partyNameEle').val('');
			$('#amountEle').val('');
			$('#remarkEle').val('');
			hideLayer();
			showMessage('success','Party Expense Details saved successfully ! with Party Expense Voucher NO: '+response.partyWiseExpenseDetailsId);
		}/*,setPartyName:function(response){
			 var jsonValue 	= $('#'+$(this).attr('id')).attr('sub_info');
			 console.log(jsonValue);
			 console.log(response);
			 var obj 		= eval( '(' + jsonValue + ')' );
			 
			 $("#partyNameEle").val(obj.corporateAccountDisplayName);
			// $("#driverMobileNumberEle").val(obj.mobileNumber);
		
			var partyNameArr	=	$('#partyNameEle').val().split('(');
			$("#partyNameEle").val(partyNameArr[0]);
		}*/
	});
});