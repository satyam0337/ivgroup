define(
		[	'JsonUtility',
			'messageUtility',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/searchLRUsingPhoneNumberReport/searchLRUsingPhoneNumberReportFilePath.js',
			'jquerylingua',
			'language',
			'autocomplete',
			'autocompleteWrapper',
			'slickGridWrapper3',
			'bootstrapSwitch',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
			'nodvalidation',
			'focusnavigation'],
			function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper, slickGridWrapper3, BootstrapSwitch,
					BootstrapModal, Selection, NodValidation, ElementFocusNavigation) {
					'use strict';
			
			var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject , _this;
			
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				},
				render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/searchLRByPhoneNumberWS/loadDataForSearchLRByPhoneNumber.do?', _this.renderDataForSearchLRByPhoneNumber, EXECUTE_WITHOUT_ERROR);
					return _this;
				},
				renderDataForSearchLRByPhoneNumber : function(response) {
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();
					var partTypeList = response.PartyTypeObject;
				
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/searchLRUsingPhoneNumberReport/searchLRUsingPhoneNumberReport.html",function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						masterLangObj = FilePath.loadLanguage();
						masterLangKeySet = loadLanguageWithParams(masterLangObj);
						
						$("#viewAllLRDetails").on('click', function(){
							if($(this).prop("checked") == true){
								$('#fromToDate').hide();
							} else{
								$('#fromToDate').show();
							}
						});
						
						$('#allLRDetailsUsingPhoneNumberDiv').hide();
						
						//party type auto complete
						var partyTypeAutoComplete 			= new Object();
						partyTypeAutoComplete.primary_key 	= 'partyTypeId';
						partyTypeAutoComplete.url 			= partTypeList;
						partyTypeAutoComplete.field 		= 'partyTypeName';
						$("#partyTypeId").autocompleteCustom(partyTypeAutoComplete);
						
						//date picker
						var options		= new Object();
						$("#dateEle").DatePickerCus(options);
						
						//find button activities
						$("#find").on('click',function(){
							_this.inputFeildValidation();
							
							showLayer();
							//Take data from front-end
							var jsonObject 				= new Object();
							jsonObject.PhoneNumber 		= $("#phoneNumber").val();
							jsonObject.partyTypeId 		= $("#partyTypeName_primary_key").val();
							jsonObject.viewAll 			= $("#viewAllLRDetails").prop("checked");
							
							if($("#dateEle").attr('data-startdate') != undefined){
								jsonObject.fromDate = $("#dateEle").attr('data-startdate'); 
							}
							if($("#dateEle").attr('data-enddate') != undefined){
								jsonObject.toDate = $("#dateEle").attr('data-enddate'); 
							}
							
							//Get all LR details
							getJSON(jsonObject, WEB_SERVICE_URL + '/searchLRByPhoneNumberWS/allLRDetails.do?', _this.allLRDetails, EXECUTE_WITH_ERROR);
							return _this;
						});
						
					});
					
					hideLayer();
				},
				inputFeildValidation : function() {
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					myNod.add({
						selector		: '#phoneNumber',
						validate		: 'presence',
						errorMessage	: 'Please enter phone number'
					});
					myNod.add({
						selector		: '#partyTypeId',
						validate		: 'validateAutocomplete:#partyTypeName_primary_key',
						errorMessage	: 'Please select party type'
					});
					myNod.add({
						selector		: '#dateEle',
						validate		: 'presence',
						errorMessage	: 'Please select date'
					});
					myNod.performCheck();
				},
				allLRDetails : function(response){
					
					if(response.message != undefined) {
						var errorMessage = response.message;
						showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
						hideLayer();
						$('#allLRDetailsUsingPhoneNumberDiv').hide();
						return;
					}
					
					var ColumnConfig = response.searchLRByPhoneNumber.columnConfiguration;
					var columnKeys	= _.keys(ColumnConfig);
					var bcolConfig	= new Object();
					for (var i=0; i<columnKeys.length; i++) {
						var bObj	= ColumnConfig[columnKeys[i]];
						if (bObj != null) {
							if (bObj.show == true) {
								bcolConfig[columnKeys[i]] = bObj;
							}
						}
					}
					response.searchLRByPhoneNumber.columnConfiguration	= _.values(bcolConfig);
					response.searchLRByPhoneNumber.Language				= masterLangKeySet;

					if(response.searchLRByPhoneNumber.CorporateAccount != undefined) {
						response.searchLRByPhoneNumber.CorporateAccount =	_.sortBy(response.searchLRByPhoneNumber.CorporateAccount, 'tripDateTimeForString');
						
						$('#allLRDetailsUsingPhoneNumberDiv').show();
						
						gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead					: response.searchLRByPhoneNumber.columnConfiguration, // *compulsory // for table headers
							ColumnData					: _.values(response.searchLRByPhoneNumber.CorporateAccount), 	// *compulsory // for table's data
							Language					: response.searchLRByPhoneNumber.Language, 			// *compulsory for table's header row language
							ShowPrintButton				: true,
							ShowCheckBox				: false,
							removeSelectAllCheckBox		: 'false',
							fullTableHeight				: false,
							rowHeight 					: 	30,
							DivId						: 'viewAllLRDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
							SerialNo:[{							// optional field // for showing Row number
								showSerialNo	: true,
								searchFilter	: false,        // for search filter on serial no
								ListFilter		: false			// for list filter on serial no
							}],
							InnerSlickId				: 'editReportDivInner', // Div Id
							InnerSlickHeight			: '280px',
							NoVerticalScrollBar			: false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
						
					}
					
					hideLayer();
				}
			});
		});