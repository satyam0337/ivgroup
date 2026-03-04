/**
 * Anant 07-Mar-2025 12:35:33 pm 2025
 */
define([
		PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		'JsonUtility',
		'messageUtility',
		'autocomplete',
		'autocompleteWrapper',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		'nodvalidation',
		'focusnavigation'
	], function(Selection) {
		'use strict';
		let jsonObject = new Object(), _this = '', isDuplicateLS = false, checkedManualLS = '';
		return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
				}, render : function() {
					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/loadManualLS.do?', _this.renderDetails, EXECUTE_WITH_ERROR);
					return _this;
				}, renderDetails : function(response) {
					let loadelement = new Array();
					let baseHtml	= new $.Deferred();
					loadelement.push(baseHtml);
					
					$("#mainContent").load("/ivcargo/html/module/createManualLS/createManualLS.html", function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();
						
						let keyObject = Object.keys(response);
						
						for (const element of keyObject) {
							if (response[element])
								$("*[data-attribute="+ element+ "]").removeClass("hide");
						}
						
						let elementConfiguration	= new Object();

						elementConfiguration.singleDateElement			= $('#lsDateEle');
						elementConfiguration.crossingAgentSrcElement	= 'crossingAgentEle';
						elementConfiguration.vehicleElement				= 'vehicleNumberEle';
						elementConfiguration.destBranchElement			= 'destinationBranchEle';
						elementConfiguration.branchElement				= 'sourceBranchEle';
						
						response.elementConfiguration		= elementConfiguration;
						response.crossingAgentSrcSelection		= true;
						response.isCalenderForSingleDate		= false;
						response.vehicleSelectionWithSelectize	= true;
						response.crossingAgentType				= '1,3';
						
						Selection.setSelectionToGetData(response);
						Selection.setSourceBranchAutocomplete(elementConfiguration);
						Selection.setDeliveryDestinationAutocomplete(elementConfiguration);
						
						if(response.isCrossingHireShow)
							$("*[data-attribute=crossingHire]").remove();
						
						$('#isCrossingAgent').click(function() {
							_this.hideShowCrossingAgent(this.checked);
							_this.destroySource();
							
							if(!this.checked)
								Selection.setSourceBranchAutocomplete(elementConfiguration);
						});
						
						$('#crossingAgentEle').change(function() {
							_this.destroySource();
							Selection.setCrossingAgentBookingSourceMap(elementConfiguration, $('#crossingAgentEle').val());
						});
						
						$('#lsDateEle').keydown(function(event) {
							if (event.key === 'Enter') {
								if (!_this.chkDate(this.id))
									$('#lsDateEle').val('');
							}
						});
						
						$('#createLs').click(function() {
							if(_this.validateBasicDetails())
								_this.onSubmit();
						});
					});
				}, destroySource : function() {
					if($('#sourceBranchEle').selectize() != undefined)
						$('#sourceBranchEle').selectize()[0].selectize.destroy();
				}, hideShowCrossingAgent : function(isChecked) {
					if(isChecked) {
						$("*[data-attribute=crossingAgent]").removeClass("hide");
						$("*[data-attribute=crossingHire]").removeClass("hide");
						$('#crossingAgentEle').focus();
					} else {
						$("*[data-attribute=crossingAgent]").addClass("hide");
						$("*[data-attribute=crossingHire]").addClass("hide");
						$('#crossingAgentEle').val('');
						$('#crossingHireEle').val('');
					}
				}, chkDate : function(elementId) {
					let date = document.getElementById(elementId);
					
					if(date.value.length > 0) {
						if(isValidDate(date.value)) {
							if(!chkFutureDate(elementId)) return false;
						} else {
							showMessage('error',iconForErrMsg + ' ' + 'Please, Enter Valid Date !');
							return false;
						}
					}
					
					return true;
				}, validateBasicDetails : function() {
					let isAgentCheck	= $('#isCrossingAgent').prop('checked');
					
					if(isAgentCheck) {
						if($('#crossingAgentEle').val() == '' || $('#crossingAgentEle').val() == 0) {
							showAlertMessage('error', 'Select Proper Crossing Agent !');
							return false;
						}
					}
					
					if($('#lsNumberEle').val() == '') {
						showAlertMessage('error', 'Enter LS Number !');
						return false;
					}
					
					if($('#lsDateEle').val() == '') {
						showAlertMessage('error', 'Enter LS Date !');
						return false;
					}
					
					if (!_this.chkDate('lsDateEle')) {
						$('#lsDateEle').val('');
						return false;
					}
					
					if(!isAgentCheck) {
						if($('#vehicleNumberEle').val() == '' || $('#vehicleNumberEle').val() == 0) {
							showAlertMessage('error', 'Select Proper Vehicle Number !');
							return false;
						}
						
						if($('#sourceBranchEle').val() == $('#destinationBranchEle').val()) {
							showAlertMessage('error', 'Source and Deastination cannot be same !');
							return false;
						}
					}
					
					if($('#sourceBranchEle').val() == '' || $('#sourceBranchEle').val() == 0) {
						showAlertMessage('error', 'Enter Source Branch !');
						return false;
					}
					
					if($('#destinationBranchEle').val() == '' || $('#destinationBranchEle').val() == 0) {
						showAlertMessage('error', 'Enter Destination Branch !');
						return false;
					}
					
					return true;
				}, onSubmit	 : function() {
					jsonObject = new Object();
					
					jsonObject.manualLSNumber			= $('#lsNumberEle').val();
					jsonObject.lsDate					= $('#lsDateEle').val();
					jsonObject.crossingAgentId			= $('#crossingAgentEle').val();
					jsonObject.crossingHire				= $('#crossingHireEle').val();
					jsonObject.vehicleNumberMasterId	= $('#vehicleNumberEle').val();
					jsonObject.sourceBranchId			= $('#sourceBranchEle').val();
					jsonObject.destinationBranchId		= $('#destinationBranchEle').val();
					
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL + '/dispatchWs/createManualLS.do?',_this.afterSave, EXECUTE_WITH_ERROR);
				}, afterSave  : function(response) {
					hideLayer();
					
					if (response.message != undefined && response.message.type != MESSAGE_TYPE_SUCCESS)
						return;
					
					_this.resetElement();
					
					setTimeout(function() {
						window.location.href	= manualBookingPageUrl + '&dispatchLedgerId=' + response.dispatchLedgerId;
					}, 200);
				}, validateField : function() {
					return true;
				}, resetElement : function() {
					$('#lsNumberEle').val('');
				}
			});
		});
