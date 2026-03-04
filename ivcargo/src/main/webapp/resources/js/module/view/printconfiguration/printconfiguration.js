define(
		[
			'JsonUtility',
			'messageUtility',
			'/ivcargo/resources/js/generic/urlparameter.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/stockOutLRs/stockoutlrsfilepath.js',
			

			'jquerylingua',
			'language',
			'bootstrapSwitch',
			'nodvalidation',
			'focusnavigation',
			PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
			PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js',// PopulateAutocomplete
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/printconfiguration/lrprintconfiguration.js',
			PROJECT_IVUIRESOURCES + '/resources/js/module/view/printconfiguration/lsprintconfiguration.js',
			],

			function(JsonUtility, MessageUtility, UrlParameter, FilePath, Lingua, Language,  BootstrapSwitch, NodValidation, FocusNavigation,BootstrapModal, Selection,lrprintconfiguration,lsprintconfiguration) {
			'use strict';
			var jsonObject = new Object(), myNod,  _this = '';
			return Marionette.LayoutView.extend({
				initialize : function(masterObj) {
					_this = this;
				}, render: function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/printConfigurationWS/getLRPrintConfigurationElement.do?', _this.setPrintElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				},
				setSelectType : function(){

					_this.setSelectTypeAutocompleteInstance();

					var autoSelectType = $("#selectPrintFormat").getInstance();

					var SelectTYPE = [
						{ "selectTypeId":1, "selectPrintFormat": "LR PrintConfiguration" },
						{ "selectTypeId":3, "selectPrintFormat": "LS PrintConfiguration" },
						]


					$( autoSelectType ).each(function() {
						this.option.source = SelectTYPE;
					})
				},
				setSelectTypeAutocompleteInstance : function() {
					var autoSelectTypeName 			= new Object();
					autoSelectTypeName.primary_key 	= 'selectTypeId';
					autoSelectTypeName.field 		= 'selectPrintFormat';
					autoSelectTypeName.callBack		= callBackFunction;

					$(document).ready(function(){
						$('#selectPrintFormat').val("Select PrintConfiguration");
					});
					function callBackFunction() {
						var selectedText = $("#selectPrintFormat").find("option:selected").text();
						var selectedValue = $("#selectPrintFormat").val();
						switch(selectedValue){ 
						case "LR PrintConfiguration" :
							lrprintconfiguration.getLrData();
							break;
						case "LS PrintConfiguration":
							lsprintconfiguration.getLsData(); 
							break;
						}
						}

					$("#selectPrintFormat").autocompleteCustom(autoSelectTypeName)
				},
				setPrintElements : function(response) {
					var jsonObject 	= new Object();
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();	
					$("*[data-selector='AccountGroupName'").html(response.AccountGroupName);
					loadelement.push(baseHtml);
					$("#mainContent").load("/ivcargo/html/module/printconfiguration/printconfiguration.html",
							function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						hideLayer();
						loadLanguageWithParams(FilePath.loadLanguage());
						_this.setSelectType();
						});
					},
			});
		});