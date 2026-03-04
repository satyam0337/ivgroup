define([ 'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(slickGridWrapper3, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,myNod1,  _this = '', PODWaybillSelectionConstant;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/podHardCopyReceiveWS/getPODHardCopyReceiveElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/podwaybills/podHardCopyReceive/podHardCopyReceive.html",function() {
				baseHtml.resolve();
				
				$( "#lrNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchPODByLRNumber();
					}
				});
			});
			
			PODWaybillSelectionConstant	= response.PODWaybillSelectionConstant;

			$.when.apply($, loadelement).done(function() {
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				let elementConfiguration	= {};
				elementConfiguration.branchElement	= $('#branchEle');
				
				response.executiveTypeWiseBranch	= true;
				response.elementConfiguration		= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				var autoSelectionName 			= new Object();
				autoSelectionName.primary_key 	= 'selectionId';
				autoSelectionName.field 		= 'selectionName';
				autoSelectionName.callBack 		= _this.onSearchBySelect;
				$("#searchByOptionEle").autocompleteCustom(autoSelectionName);
				
				var autoSelectionNameInstance 	= $("#searchByOptionEle").getInstance();

				$(autoSelectionNameInstance).each(function() {
					this.option.source 			= response.selectionArr;
				});
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#branchEle',
					validate		: 'validateAutocomplete:#branchEle_primary_key',
					errorMessage	: 'Select Branch !'
				});

				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});
				
				myNod1.add({
					selector		: '#lrNumberEle',
					validate		: 'presence',
					errorMessage	: 'Enter LR Number !'
				});

				hideLayer();

				$("#findBtn").click(function() {
					if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.BRANCH_SELECTION) {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.searchPODByBranch();							
					} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.WAYBILL_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchPODByLRNumber();								
					}
				});
				
				$("#markAsReceive").click(function() {
					_this.markHardCopyReceived(response);
				});
			});
		}, onSearchBySelect : function() {
			if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.BRANCH_SELECTION) {
				$('.branch').removeClass('hide');
				$('.lrNumber').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.WAYBILL_NUMBER_SELECTION) {
				$('.lrNumber').removeClass('hide');
				$('.branch').addClass('hide');
				$('#lrNumberEle').val('');
				$('#bottom-border-boxshadow').addClass('hide');
			}
		}, searchPODByLRNumber : function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject["lrNumber"] = $('#lrNumberEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/podHardCopyReceiveWS/getPODDetailsByLRNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, searchPODByBranch : function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject["sourceBranchId"] = $('#branchEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/podHardCopyReceiveWS/getPODDetailsByBranchId.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				$('#podHardCopyReceiveDetailDiv').empty();
				hideLayer();
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				
				let tableProperties	= response.tableProperties;
				
				slickGridWrapper3.applyGrid({
					ColumnHead					: _.values(response.columnConfiguration),
					ColumnData					: _.values(response.CorporateAccount),
					Language					: {},
					tableProperties				: response.tableProperties,
					SerialNo:[{
						showSerialNo	: tableProperties.showSerialNumber,
						SearchFilter	: false,
						ListFilter		: false,
						title			: "Sr No."
					}],
					NoVerticalScrollBar			: false
				});
			}
			
			hideLayer();
		}, markHardCopyReceived	: function() {
			var doneTheStuff 	  = false;
			let jsonObject		  = {};
			let selectionMsg	  = ' Please, Select atleast 1 LR To Mark As Receive !';
			const limitCheckBox	  = true;
			const maxSelection	  = 150;

			let selectedGridObject 	= slickGridWrapper3.getSlickGridInstance({InnerSlickId : 'podHardCopyReceiveDetails'});
			let selectedLRDetails 	= slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'podHardCopyReceiveDetails'}, selectionMsg);
			
			if(typeof selectedLRDetails == 'undefined')
				return;
					
			let selectedCheckBox  = slickGridWrapper3.limitCheckboxSelection({InnerSlickId : 'podHardCopyReceiveDetails'}, limitCheckBox, maxSelection);
			
			if(!selectedCheckBox)
				return;
					
			let	wayBillIds				= [];

			for(const element of selectedLRDetails)
				wayBillIds.push(element.wayBillId);

			jsonObject.wayBillIds		= wayBillIds.join(',');
			
			if(!doneTheStuff) {
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Are you sure you want to Mark as Receive ?",
					modalWidth 	: 	30,
					title		:	'Mark Hard Copy Received',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
	
				btModalConfirm.on('ok', function() {
					if(!doneTheStuff) {
						getJSON(jsonObject, WEB_SERVICE_URL+'/podHardCopyReceiveWS/updateHardCopyReceived.do', _this.checkResponse, EXECUTE_WITH_ERROR);
						doneTheStuff = true;
					}
					
					if(selectedGridObject != undefined) {
						var dataView 	= selectedGridObject.getData();
						
						for(var i = 0; i < selectedLRDetails.length; i++) {
							dataView.deleteItem(selectedLRDetails[i].id);
							grid.invalidate();
							grid.render();
						}
					}
				});	
	
				btModalConfirm.on('cancel', function() {
					doneTheStuff = false;
					hideLayer();
				});
			}
		}, checkResponse : function(response) {
			hideLayer();
			
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');

				if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.BRANCH_SELECTION)
					_this.searchPODByBranch();
				
				return;
			}
		}
	});
});