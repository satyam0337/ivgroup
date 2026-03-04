define(
		[
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
			], function(UrlParameter) {
			'use strict';
			let jsonObject = new Object(), waybillId = "0", myNod, PODRequiredConstant,  _this, wayBillTypeId;

			return Marionette.LayoutView.extend({
				initialize : function() {
					waybillId 		= UrlParameter.getModuleNameFromParam(MASTERID);
					_this = this;
					this.$el.html(this.template);
				}, render : function() {
					jsonObject.waybillId = waybillId;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/editPODRequiredWS/getEditPODRequiredElement.do?', _this.setEditPODRequiredElement, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, setEditPODRequiredElement : function(response) {
					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/podwaybills/editpodrequired/EditPODRequired.html",function() {
						baseHtml.resolve();
					});

					$.when.apply($, loadelement).done(function() {
						initialiseFocus();

						PODRequiredConstant			= response.PODRequiredConstant;
						let executive				= response.executive;
						wayBillTypeId				= response.wayBillTypeId;

						if(response.consignmentSummary.podRequired) {
							$("#podRequiredEle").val(PODRequiredConstant.POD_REQUIRED_YES_ID);
							$('#actualPODRequired').val(PODRequiredConstant.POD_REQUIRED_YES_ID);
						} else {
							$("#podRequiredEle").val(PODRequiredConstant.POD_REQUIRED_NO_ID);
							$('#actualPODRequired').val(PODRequiredConstant.POD_REQUIRED_NO_ID);
						}
						
						if(response.lockToChangePodRequiredForTBBLrExceptGroupAdmin) {
							$('#podRequiredEle').change(function() {
								if(wayBillTypeId == WAYBILL_TYPE_CREDIT && Number($('#podRequiredEle').val()) == PODRequiredConstant.POD_REQUIRED_NO_ID && executive.executiveType != EXECUTIVE_TYPE_GROUPADMIN) {
									$("#podRequiredEle").val(PODRequiredConstant.POD_REQUIRED_YES_ID);
									showMessage('error', 'You Cannot Change POD Required !');
								}
							});
						}

						hideLayer();

						myNod = nod();

						myNod.configure({
							parentClass:'validation-message'
						});

						myNod.add({
							selector: '#remarkEle',
							validate: 'presence',
							errorMessage: 'Enter Remark !'
						});

						$("#updateBtn").click(function() {
							if(Number($('#podRequiredEle').val()) == Number($('#actualPODRequired').val())) {
								showMessage('error', 'Change POD Required !');
								return;
							}
							
							myNod.performCheck();
							
							if(myNod.areAll('valid'))
								_this.onUpdate();								
						});
					});
				}, onUpdate : function() {
					showLayer();

					jsonObject["podRequired"] 		= $('#podRequiredEle').val();
					jsonObject["remark"] 			= $('#remarkEle').val();
					jsonObject["waybillId"] 		= waybillId;

					getJSON(jsonObject, WEB_SERVICE_URL+'/editPODRequiredWS/updatePODRequiredDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
				}, setReportData : function(response) {
					redirectToAfterUpdate(response);
				}
			});
		});