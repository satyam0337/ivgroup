define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	'JsonUtility',
	'messageUtility',
	'autocomplete',
	'autocompleteWrapper',
	'bootstrapSwitch',
	'slickGridWrapper2',
	'nodvalidation',
	'focusnavigation',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	'/ivcargo/resources/js/module/redirectAfterUpdate.js'
	],
	function(UrlParameter) {
		'use strict';
		var jsonObject = new Object(), podDispatchId = 0, dispatchToBranchId = 0, myNod, _this;

			return Marionette.LayoutView.extend({
				initialize : function() {
					podDispatchId 			= UrlParameter.getModuleNameFromParam(MASTERID);
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					jsonObject.podDispatchId	= podDispatchId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/podDispatchWS/getEditPODDestinationElement.do?', _this.setEditPODRequiredElement, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setEditPODRequiredElement : function(response) {
					var loadelement = new Array();
					var baseHtml 	= new $.Deferred();

					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/podwaybills/editpoddestination/EditPODDestination.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						var keyObject = Object.keys(response);
						
						for (var i = 0; i < keyObject.length; i++) {
							if (response[keyObject[i]])
								$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
						}

						var destinationBranchAutoComplete 			= new Object();
						destinationBranchAutoComplete.primary_key 	= 'branchId';
						destinationBranchAutoComplete.field 		= 'branchName';
						$("#destinationBranchEle").autocompleteCustom(destinationBranchAutoComplete);

						_this.setBranch(response);
						
						dispatchToBranchId	= response.dispatchToBranchId;

						hideLayer();

						myNod = nod();

						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#destinationBranchEle',
							validate: 'validateAutocomplete:#destinationBranchEle_primary_key',
							errorMessage: 'Select proper Branch !'
						});
						
						myNod.add({
							selector: '#remarkEle',
							validate: 'presence',
							errorMessage: 'Enter Remark !'
						});

						$("#updateBtn").click(function() {
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onUpdate();								
						});
					});
				}, setBranch : function (response) {
					var destinationBranchName = $("#destinationBranchEle").getInstance();
					
					$(destinationBranchName).each(function() {
						this.option.source = response.sourceBranch;
					});
				}, onUpdate : function() {
					showLayer();

					jsonObject["PODDispatchId"] 			= podDispatchId;
					jsonObject["preDispatchToBranchId"] 	= dispatchToBranchId;
					jsonObject["DispatchToBranchId"] 		= $('#destinationBranchEle_primary_key').val();
					jsonObject["remark"] 					= $('#remarkEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL+'/podDispatchWS/updatePODDestination.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}, setReportData : function(response) {
					hideLayer();
					response.redirectTo = 2;
					redirectToAfterUpdate(response);
				}
			});
		});