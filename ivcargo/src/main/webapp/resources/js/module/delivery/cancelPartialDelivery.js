define([
		'slickGridWrapper3',
		'JsonUtility',
		'messageUtility',
		'/ivcargo/resources/js/generic/urlparameter.js',
		'bootstrapSwitch',
		'nodvalidation',
		'focusnavigation',
		PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
		PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	], function(slickGridWrapper3) {
			'use strict';
			let jsonObject = new Object(), myNod, _this = '';
			return Marionette.LayoutView.extend({
				initialize : function() {
					_this = this;
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/generatePartialCRWS/loadPartialDelivery.do?',	_this.renderPartialDeliveryElements, EXECUTE_WITHOUT_ERROR);
					return _this;
				}, renderPartialDeliveryElements : function(response) {
					showLayer();
					
					$('#middle-border-boxshadow').addClass('hide');

					let loadelement = new Array();
					let baseHtml 	= new $.Deferred();
					
					loadelement.push(baseHtml);

					$("#mainContent").load("/ivcargo/html/module/delivery/cancelPartialDelivery.html",
							function() {
						baseHtml.resolve();
					});
					
					$.when.apply($, loadelement).done(function() {
						hideLayer();
						$("#lrNumberEle").focus();
						$('#bottom-border-boxshadow').addClass('hide');

						myNod = nod();
						myNod.configure({
							parentClass:'validation-message'
						});
						
						myNod.add({
							selector: '#lrNumberEle',
							validate: 'presence',
							errorMessage: 'Enter Lr Number !'
						});

						$("#lrNumberEle").keyup(function(event) {
							let key	= getKeyCode(event);
							
							if (key == 8 || key == 46) {
								$('#bottom-border-boxshadow').addClass('hide');
								return;
							}
							
							myNod.performCheck();

							if(myNod.areAll('valid') && key == 13)
								_this.onFind();
						});
					});
				},onFind : function() {
					showLayer();
					let jsonObject = new Object();
					jsonObject.wayBillNumber		= $('#lrNumberEle').val();

					getJSON(jsonObject, WEB_SERVICE_URL + '/cancelPartialCRWS/getPartialDeliveredData.do', _this.setArtDetailsData, EXECUTE_WITH_ERROR);
				},setArtDetailsData : function(response) {
					if(response.message != undefined) {
						hideLayer();
						$('#bottom-border-boxshadow').addClass('hide');
						return;
					}
					
					response.Language				= {"partialheader" : "Partial Consignment", "serialnumberheader" : "Sr. No."};
					
					if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
						$('#bottom-border-boxshadow').removeClass('hide');
						$('#middle-border-boxshadow').removeClass('hide');
						
						slickGridWrapper3.applyGrid({
							ColumnHead			:	response.columnConfigurationList, // *compulsory // for table headers
							ColumnData			:	_.values(response.CorporateAccount), 	// *compulsory // for table's data
							Language			:	response.Language, 			// *compulsory for table's header row language
							DivId				:	'viewPartialArticleDetails',				// *compulsary field // division id where slickgrid table has to be created
							InnerSlickId		:	'viewPartialConsignmentDetails',		//	*compulsary field // unique Key for id to be set in slickgrid table
							SerialNo			:[{					// optional field // for showing Row number
								showSerialNo	:	true,
								SearchFilter	:	false,          // for search filter on serial no
								ListFilter		:	false				// for list filter on serial no
							}],
							//FetchDataButtonId : '.ok',//Add button in modal pop-up
							ShowCheckBox 				: 	true,
							CallBackFunctionToFetchData : 	_this.setDataInTable,
							EditableColumn				: 	false,
							RemoveSelectAllCheckBox		:	true
						});
					}
					
					$("#cancelBtn").click(function() {
						var selectionMsg		= ' Please, Select atleast one Partial CR For Cancellation !';
						var selectedVal 		= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'viewPartialConsignmentDetails'}, selectionMsg);

						if(selectedVal == undefined)
							return false;
							
						_this.cancelPartialDly(selectedVal);
					});
				},afterPartialDeliveryCancel : function(res) {
					hideLayer();
					
					if(res.message != undefined ){
						$('#bottom-border-boxshadow').addClass('hide');
						setTimeout(function() {
							hideLayer();
						}, 200);
					}
					
				}, cancelPartialDly : function(dataArr){
					var ans = confirm("Are you sure you want to Partial cancel CR ?");
					
					if (ans) {
						showLayer();
						let jsonObject = new Object();
						jsonObject.partialDlyCancelArr = JSON.stringify(dataArr);
						getJSON(jsonObject, WEB_SERVICE_URL + '/cancelPartialCRWS/cancelPartialDelivery.do', _this.afterPartialDeliveryCancel, EXECUTE_WITH_ERROR);
					} else
						hideLayer();
				}
			});
		});