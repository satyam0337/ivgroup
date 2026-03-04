define(
		[
			'slickGridWrapper2',
			PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES+'/resources/js/module/view/customeraccess/customeraccessdetails.js',
			'JsonUtility',
			'messageUtility',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		],//PopulateAutocomplete

		function(slickGridWrapper2, UrlParameter, CustomerAccessDetails) {
			'use strict';

			let jsonObject = new Object(), 
			myNod, myNod2, _this = '', showViewAllCustomerAccess = false, dataUpdated = false, dataDeleted = false, customerAccessId = 0;

			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					showViewAllCustomerAccess 			= UrlParameter.getModuleNameFromParam('updateCount');
					dataUpdated 						= UrlParameter.getModuleNameFromParam('dataUpdate');
					dataDeleted 						= UrlParameter.getModuleNameFromParam('dataDelete');
 
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/customerAccessWS/getCustomerAccessElement.do?',	_this.setCustomerElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setCustomerElements : function(response) {
					showLayer();

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/customeraccess/CustomerAccess.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();

						$("#middle-border-boxshadow").hide();
						$("#bottom-border-boxshadow").css("opacity", 0);

						let customerAutoComplete 			= new Object();
						customerAutoComplete.primary_key 	= 'corporateAccountId';
						customerAutoComplete.callBack 		= _this.onCustomerSelect;
						customerAutoComplete.field 			= 'customerAccessName';
						$("#customerEle").autocompleteCustom(customerAutoComplete);

						let autoCustomerName = $("#customerEle").getInstance();
						
						$(autoCustomerName).each(function() {
							this.option.source = response.CorporateAccount;
						});
						
						let configuration = response;

						let corporateAccountAutoComplete = new Object();
						
						if(configuration.showAllPartiesToCreateAccount)
							corporateAccountAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?billing=0';
						else
							corporateAccountAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?billing=4';
						
						corporateAccountAutoComplete.primary_key 	= 'corporateAccountId';
						corporateAccountAutoComplete.field 			= 'corporateAccountDisplayName';
						$("#corporateNameEle").autocompleteCustom(corporateAccountAutoComplete);

						corporateAccountAutoComplete = new Object();
						corporateAccountAutoComplete.primary_key 	= 'corporateAccountId';
						corporateAccountAutoComplete.field 			= 'corporateAccountDisplayName';
						$("#selectedCorporateNameEle").autocompleteCustom(corporateAccountAutoComplete);

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector		: '#corporateNameEle',
							validate		: 'validateAutocomplete:#corporateNameEle_primary_key',
							errorMessage	: 'Select Corporate Account !'
						});
						
						myNod.add({
							selector		: '#loginNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Login Name !'
						});
						
						myNod.add({
							selector		: '#loginPasswordEle',
							validate		: 'presence',
							errorMessage	: 'Enter Password !'
						});

						myNod2 = nod();
						myNod2.configure({
							parentClass:'validation-message'
						});

						myNod2.add({
							selector		: '#selectedCorporateNameEle',
							validate		: 'validateAutocomplete:#selectedCorporateNameEle_primary_key',
							errorMessage	: 'Select Corporate Account !'
						});
						
						myNod2.add({
							selector		: '#loginNameEle',
							validate		: 'presence',
							errorMessage	: 'Enter Login Name !'
						});
						
						myNod2.add({
							selector		: '#loginPasswordEle',
							validate		: 'presence',
							errorMessage	: 'Enter Password !'
						});

						$("#loginNameEle").keyup(function() {
							$('#updateBtn').attr("disabled", false);
						});

						$("#loginPasswordEle").keyup(function() {
							$('#updateBtn').attr("disabled", false);
						});

						$("#saveBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.saveCustomerAccess();
						});

						$("#updateBtn").click(function() {
							myNod2.performCheck();
							
							if(myNod2.areAll('valid'))
								_this.updateCustomerAccess();
						});

						$("#deleteBtn").click(function() {
							_this.deleteCustomerAccess();
						});

						$("#viewAllCustomer").click(function() {
							_this.viewAllCustomerAccess();
						});

						$("#add").click(function(){
							_this.addCustomerAccess();
						});

						if(showViewAllCustomerAccess == 'true' || showViewAllCustomerAccess == true)
							_this.viewAllCustomerAccess();
						
						if(dataUpdated == 'true' || dataUpdated == true)
							showMessage('success', 'Data Updated Successfully !');
						else if(dataDeleted == 'true' || dataDeleted == true)
							showMessage('success', 'Data Deleted Successfully !');
					});
				}, onCustomerSelect : function () {
					showLayer();
					let jsonObject = new Object();

					jsonObject.corporateAccountId				= $('#customerEle_primary_key').val();
					
					customerAccessId = 0;

					getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/getCustomerAccessDetailsByCorporateAccountId.do', _this.setCustomer, EXECUTE_WITH_ERROR);
				}, setCustomer : function (response) {
					$("#selectedCorporateName").removeClass("hide");
					$("#corporateName").addClass("hide");

					$('#selectedCorporateNameEle').attr("disabled", true);
					$('#updateBtn').attr("disabled", true);

					customerAccessId	= response.CustomerAccess.customerAccessId;
					
					$('#selectedCorporateNameEle').val(response.CustomerAccess.customerAccessName);
					$('#selectedCorporateNameEle_primary_key').val(response.CustomerAccess.corporateAccountId);
					$('#loginNameEle').val(response.CustomerAccess.customerAccessLogin);
					$('#loginPasswordEle').val(response.CustomerAccess.customerAccessPassword);

					$("#saveBtn").addClass("hide");
					$("#updateBtn").removeClass("hide");
					$("#deleteBtn").removeClass("hide");

					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "right" }, 500);

					hideLayer();
				}, saveCustomerAccess : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.customerAccessName				= $('#corporateNameEle').val();
					jsonObject.corporateAccountId				= $('#corporateNameEle_primary_key').val();
					jsonObject.customerAccessLogin				= $('#loginNameEle').val();
					jsonObject.customerAccessPassword			= $('#loginPasswordEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/addCustomerAccess.do', _this.afterSave, EXECUTE_WITH_ERROR);
				}, afterSave	: function() {
					_this.resetCustomerFeilds();
					hideLayer();
				}, updateCustomerAccess : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.corporateAccountId				= $('#selectedCorporateNameEle_primary_key').val();
					jsonObject.customerAccessName				= $('#selectedCorporateNameEle').val();
					jsonObject.customerAccessLogin				= $('#loginNameEle').val();
					jsonObject.customerAccessPassword			= $('#loginPasswordEle').val();
					jsonObject.customerAccessMfd				= false;
					jsonObject.customerAccessId					= customerAccessId;

					getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/updateCustomerAccess.do', _this.afterUpdate, EXECUTE_WITH_ERROR);
				}, afterUpdate : function(response) {
					let jsonObject = new Object();

					if(response.CorporateAccountId != undefined && response.CorporateAccountId > 0) {
						jsonObject.corporateAccountId				= response.CorporateAccountId;
						getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/getCustomerAccessDetailsByCorporateAccountId.do', _this.setCustomer, EXECUTE_WITH_ERROR);
					}
					
					showMessage('success','Data Updated Successfully !');
					hideLayer();
				}, deleteCustomerAccess : function() {
					showLayer();
					let jsonObject = new Object();

					jsonObject.corporateAccountId				= $('#selectedCorporateNameEle_primary_key').val();
					jsonObject.customerAccessName				= $('#selectedCorporateNameEle').val();
					jsonObject.customerAccessLogin				= $('#loginNameEle').val();
					jsonObject.customerAccessPassword			= $('#loginPasswordEle').val();
					jsonObject.customerAccessMfd				= true;
					jsonObject.customerAccessId					= customerAccessId;

					getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/updateCustomerAccess.do', _this.afterDelate, EXECUTE_WITH_ERROR);
				}, afterDelate	: function() {
					let MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=customerAccessMaster&updateCount='+false+'&dataUpdate='+false+'&dataDelete='+true);
					location.reload();
				}, resetCustomerFeilds : function() {
					$('#corporateNameEle').val("");
					$('#corporateNameEle_primary_key').val(0);
					$('#loginNameEle').val("");
					$('#loginPasswordEle').val("");
				}, viewAllCustomerAccess	: function() {
					showLayer();
					let jsonObject = new Object();

					getJSON(jsonObject, WEB_SERVICE_URL + '/customerAccessWS/viewAllCustomerAccessData.do', _this.setDataOfCustomerAccess, EXECUTE_WITH_ERROR);
				}, setDataOfCustomerAccess : function(response) {
					if(response.message != undefined){
						hideLayer();
						return;
					}

					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
						response.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
						let gridObject = slickGridWrapper2.setGrid(response);
						
						gridObject.onDblClick.subscribe(function (e, args) {
							let cell		= gridObject.getCellFromEvent(e)
							let dataView	= gridObject.getData();
							let item 		= dataView.getItem(cell.row);
							_this.getDataPopForUpdate(item);
						});
					}
					
					hideLayer();
					
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 1);
					$("#bottom-border-boxshadow").toggle("slide", { direction: "up" }, 500);
					
				}, addCustomerAccess : function() {
					_this.resetCustomerFeilds();
					$("#selectedCorporateName").addClass("hide");
					$("#corporateName").removeClass("hide");
					$("#saveBtn").removeClass("hide");
					$("#updateBtn").addClass("hide");
					$("#deleteBtn").addClass("hide");
					$('#corporateNameEle').attr("disabled",false);
					$("#middle-border-boxshadow").hide();
					$("#bottom-border-boxshadow").css("opacity", 0);
					$("#middle-border-boxshadow").removeClass("hide");
					$("#middle-border-boxshadow").toggle("slide", { direction: "left" }, 500);
				}, getDataPopForUpdate : function(item) {
					let jsonObject = new Object();

					if(item.corporateAccountId != undefined && item.corporateAccountId > 0)
						jsonObject["corporateAccountId"] 		= item.corporateAccountId;

					let object 			= new Object();
					object.elementValue = jsonObject;

					let btModal = new Backbone.BootstrapModal({
						content: new CustomerAccessDetails(object),
						modalWidth : 60,
						title:'Update Customer Details'

					}).open();
					object.btModal = btModal;
					new CustomerAccessDetails(object)
					btModal.open();
				}
			});
		});