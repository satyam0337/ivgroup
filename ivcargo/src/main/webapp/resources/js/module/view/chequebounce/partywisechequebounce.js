var doneTheStuff	= false;
define(
		[
			'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/chequebounce/chequebouncefilepath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',
			'selectizewrapper',
			'/ivcargo/resources/js/module/redirectAfterUpdate.js',
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			],
			
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, BootstrapSwitch, NodValidation, FocusNavigation,
					BootstrapModal,UrlParameter,Selection,Selectizewrapper,datePickerUI) {
			'use strict';
			var 
			myNod, 
			corporateAccountId = 0,
			_this = '',
			masterLangObj,
			masterLangKeySet,
			chequeBounceDetailsList,
			billIdIdArrayList =new Array();
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render : function() {
					getJSON(null, WEB_SERVICE_URL	+ '/chequeBounceWS/getChequeBounceElement.do?',_this.renderChequeBounceElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderChequeBounceElements : function(response) {
					showLayer();
					var jsonObject 			= new Object();
					var loadelement			= new Array();
					var baseHtml 			= new $.Deferred();
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/chequebounce/partyWiseChequeBounce.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();

						masterLangObj 		= FilePath.loadLanguage();
						masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

						response.executiveTypeWiseBranch	= true;

						var elementConfiguration	= new Object();

						elementConfiguration.branchElement		= $('#branchEle');

						response.elementConfiguration	= elementConfiguration;

						Selection.setSelectionToGetData(response);
						
						
						var partyNameAutoComplete = new Object();
						partyNameAutoComplete.primary_key = 'corporateAccountId';
						partyNameAutoComplete.url = WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do';
						partyNameAutoComplete.callBack = _this.onFind;
						partyNameAutoComplete.field = 'corporateAccountDisplayName';
						$("#partyNameEle").autocompleteCustom(partyNameAutoComplete);
						
						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector		: '#numberEle',
							validate		: 'presence',
							errorMessage	: 'Enter Number !'
						});
						myNod.add({
							selector		: '#branchEle',
							validate		: 'presence',
							errorMessage	: 'Select Branch !'
						});
						myNod.add({
							selector		: '#searchType',
							validate		: 'presence',
							errorMessage	: 'Select Type !'
						});

						$("#saveBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid')) {
								_this.savePartyWiseChequeBounceDetails();
							}
						});
						
						$("#add").click(function(){
							_this.addParty();
						});

					});
				},savePartyWiseChequeBounceDetails : function(){
					//showLayer();
					var jsonObject = new Object();

					jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
					jsonObject["partyId"] 			= $('#partyNameEle_primary_key').val();
					jsonObject["remark"] 			= $('#remarkEle').val();

					if(!doneTheStuff){
						doneTheStuff = true;
						var btModalConfirm = new Backbone.BootstrapModal({
							content		: 	'Are you sure you want to Save ?',
							modalWidth 	: 	30,
							title		:	'Save Cheque Bounce Entry',
							okText		:	'YES',
							showFooter 	: 	true,
							okCloses	:	true
						}).open();
						
						btModalConfirm.on('ok', function() {
							getJSON(jsonObject, WEB_SERVICE_URL+'/chequeBounceWS/addPartyWiseChequeBounceDetails.do?', _this.afterResponce, EXECUTE_WITH_ERROR);
							
							doneTheStuff = false;
							btModalConfirm.close();
							showLayer();
							
						});
						btModalConfirm.on('cancel', function() {
							doneTheStuff = false;
						});
					}
				},afterResponce : function(response){
					hideLayer();
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
					}
					
					_this.resetElement();
					
				},addParty : function(){
					$("#middle-border-boxshadow").toggle(900);
					
					if($("#bottom-border-boxshadow").css('display') != 'none'){
						$("#bottom-border-boxshadow").toggle(900);
					}
				},resetElement  : function() {
					
					$("#branchEle").val("");
					$("#partyNameEle").val("");
					$("#remarkEle").val("");
				}
			});
		});