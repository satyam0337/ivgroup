define([
	'/ivcargo/resources/js/generic/urlparameter.js' 
	,'slickGridWrapper3'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/bootstrap/bootstrap.min.js'
	], function(UrlParameter, slickGridWrapper3) {
	'use strict';
	var jsonObject = new Object(),  _this = '', doorPickupNumber, doorPickupLedgerId;

	return Marionette.LayoutView.extend({
		initialize : function() {
			doorPickupNumber 				= UrlParameter.getModuleNameFromParam('doorPickupNumber');
			doorPickupLedgerId				= UrlParameter.getModuleNameFromParam('doorPickupledgerId');
			
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			jsonObject["doorPickupLedgerId"] = doorPickupLedgerId;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/pickupLsReceiveWS/getPickupLSDetailsForReceiveByPickupId.do?', _this.setElementDetails, EXECUTE_WITH_ERROR);
			return _this;
		}, setElementDetails : function(response) {
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/pickupLsReceive/pickupSingleLsReceive.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				_this.setReceiveData(response);
				
				$('#receive').click(function() { //bt
					_this.receivePickupLS();
				});
			});
		}, setReceiveData : function(response) {	
			hideLayer();
			
		 	if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
									
			let tableProperties	= response.tableProperties;
						
			slickGridWrapper3.applyGrid({
				ColumnHead					: response.columnConfigurationList, // *compulsory // for table headers
				ColumnData					: response.pickupReceiveLrList, 	// *compulsory // for table's data
				Language					: "", 			// *compulsory for table's header row language
				tableProperties				: tableProperties,
				SerialNo:[{						// optional field for showing Row number
					showSerialNo	: tableProperties.showSerialNumber,
					SearchFilter	: false,	// for search filter on serial no
					ListFilter		: false,	// for list filter on serial no
					title			: "Sr No."
				}],
				NoVerticalScrollBar			: false
			});
		}, receivePickupLS : function() {
			showLayer();
			let jsonObject = _this.getDataToSave();
									
			if(jsonObject == null || jsonObject == undefined)
				return;
							
			getJSON(jsonObject, WEB_SERVICE_URL + '/pickupLsReceiveWS/insertPickupLsReceiveDetails.do?' ,_this.setResponse, EXECUTE_WITHOUT_ERROR);
		}, setResponse : function(response) {
			hideLayer();

			if(response.message != undefined) {
				var errorMessage = response.message;
				
				if(errorMessage.type == MESSAGE_TYPE_SUCCESS) {
					//refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
					let list = slickGridWrapper3.getValueForSelectedData({ InnerSlickId: 'pickupSingleLsReceiveDetails' }, '');

					if(list != null) {
						list.forEach((item, index) => {
							let divSelector = `_checkbox_selector_${index}`;
							let divElement = document.getElementById(divSelector);

							if (divElement) {
								let checkbox = divElement.querySelector('input[type="checkbox"]');
								if (checkbox) {
									checkbox.checked = false;
									checkbox.style.display = 'none';
									
								} else {
									console.error(`Checkbox not found inside div with id: ${divSelector}`);
								}
							} else {
								console.error(`Div not found with id: ${divSelector}`);
							}
						});
					}

					if (response.ledgerStatus == 2 && typeof opener.document.getElementById('dpl_' + doorPickupLedgerId) !== 'undefined')
						opener.document.getElementById('dpl_' + doorPickupLedgerId).innerHTML = 'Received';

					var MyRouter = new Marionette.AppRouter({});
					MyRouter.navigate('&modulename=pickupLsReceiveId='+response.pickupLsReceiveLedgerId+'&masterid2='+response.pickupLsReceiveNumber);
					setTimeout(function(){$('#receive').addClass('hide')  }, 1000);
					setTimeout(function(){ window.close(); }, 6000);
				}
			}

			//_this.onSubmit();
		}, getDataToSave : function() {
			let jsonObject 			= new Object();
			let selectionMsg	= ' Please, Select atleast 1 checkbox !';
			let list = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'pickupSingleLsReceiveDetails'}, selectionMsg);
						
			if(list == null) {
				showAlertMessage('info', 'Select atleast 1 checkbox !');
				hideLayer();
				return;
			}
		
			let pickupLsDetailsArray = new Array();
			
			for(let i = 0; i < list.length; i++) {
				let pickupLsData	= {};
				pickupLsData.wayBillId				= list[i].wayBillId;
				pickupLsData.sourceBranchId		  	= list[i].sourceBranchId;
				pickupLsData.destinationBranchId	= list[i].destinationBranchId;
				pickupLsData.actualWeight  			= list[i].actualWeight;
				pickupLsData.quantity  				= list[i].quantity;
				pickupLsData.doorPickupledgerId		= list[i].doorPickupledgerId;
				pickupLsData.doorPickupDetailsId  	= list[i].doorPickupDetailsId;
				pickupLsDetailsArray.push(pickupLsData);
			}
			
			jsonObject.pickupLsDetails = JSON.stringify(pickupLsDetailsArray);
			
			return jsonObject;
		}
	});
});