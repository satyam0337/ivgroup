define([ 'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/podwaybills/podreceive/pendingLrForPODReceive.js'
	,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(slickGridWrapper2, PendingLrForPODReceive, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod,myNod1,  _this = '', PODWaybillSelectionConstant;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/podReceiveWS/getPODReceiveElement.do?',_this.setElementDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setElementDetails : function(response){
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/podwaybills/podReceive/podReceive.html",function() {
				baseHtml.resolve();
				$( "#podNumberEle" ).keydown(function(e) {
					if (e.which == 13) {
						_this.searchPODByNumber();
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
				
				response.isCalenderSelection	= response['date'];
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.elementConfiguration	= elementConfiguration;
				
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

				var podBranchAutoComplete 			= new Object();
				podBranchAutoComplete.primary_key 	= 'branchId';
				podBranchAutoComplete.field 		= 'branchName';
				$("#podBranchEle").autocompleteCustom(podBranchAutoComplete);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#podBranchEle',
					validate		: 'validateAutocomplete:#podBranchEle_primary_key',
					errorMessage	: 'Select POD Branch !'
				});

				myNod1 = nod();
				myNod1.configure({
					parentClass:'validation-message'
				});
				
				myNod1.add({
					selector		: '#podNumberEle',
					validate		: 'presence',
					errorMessage	: 'Enter POD Number !'
				});

				hideLayer();

				$("#findNumberBtn").click(function() {
					if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.BRANCH_SELECTION) {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.searchPODByBranch();							
					} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.POD_NUMBER_SELECTION) {
						myNod1.performCheck();
						
						if(myNod1.areAll('valid'))
							_this.searchPODByNumber();								
					} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.DATE_SELECTION)
						_this.searchPODByDate();
				});
			});
		}, onSearchBySelect : function() {
			if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.BRANCH_SELECTION) {
				$('.podBranch').removeClass('hide');
				$('.date').addClass('hide');
				$('.podNumber').addClass('hide');
				getJSON(null,	WEB_SERVICE_URL + '/selectOptionsWS/getAllPhysicalBranchOptionByAccountGroupId.do', _this.setBranch, EXECUTE_WITHOUT_ERROR);
			} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.DATE_SELECTION) {
				$('.date').removeClass('hide');
				$('.podBranch').addClass('hide');
				$('.podNumber').addClass('hide');
			} else if($('#searchByOptionEle_primary_key').val() == PODWaybillSelectionConstant.POD_NUMBER_SELECTION) {
				$('.podNumber').removeClass('hide');
				$('.date').addClass('hide');
				$('.podBranch').addClass('hide');
			}
		}, setBranch : function (response) {
			var podBranchName = $("#podBranchEle").getInstance();
			$(podBranchName).each(function() {
				this.option.source = response.sourceBranch;
			});
		}, searchPODByNumber : function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject["PODDispatchLedgerNumber"] = $('#podNumberEle').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/getPodDetailsForReceiveByPODNumber.do?', _this.setData, EXECUTE_WITH_ERROR);
			
		}, searchPODByBranch : function() {
			showLayer();
			var jsonObject = new Object();
			jsonObject["DispatchByBranchId"] = $('#podBranchEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/getPodDetailsForReceiveByBranchId.do?', _this.setData, EXECUTE_WITH_ERROR);
			
		}, searchPODByDate : function() {
			showLayer();
			
			var jsonObject = new Object();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/podReceiveWS/getPodDetailsForReceiveByDate.do?', _this.setData, EXECUTE_WITH_ERROR);
		}, setData : function(response) {
			if(response.message != undefined){
				$('#bottom-border-boxshadow').addClass('hide');
				$('#podReceiveDetailDiv').empty();
				hideLayer();
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				response.tableProperties.callBackFunctionForPartial = _this.getLRDetailsByPodDispatchId;
				slickGridWrapper2.setGrid(response);
			}
			
			hideLayer();

		}, getLRDetailsByPodDispatchId : function (grid, dataView, row) {
			var btModalConfirm = new Backbone.BootstrapModal({
				content		: 	"Are you sure you want to Receive or Receive And Approve ?",
				modalWidth 	: 	30,
				title		:	'Receive or Receive And Approve',
				okText		:	'Receive',
				showExtraButtonText	:	'Receive And Approve',
				showFooter 	: 	true,
				okCloses	:	true,
				showExtraButton: true
			}).open();
			
			hideLayer();
			btModalConfirm.on('ok', function() {
				var jsonObject = new Object();
				jsonObject["podDispatchId"] 	= dataView.getItem(row).podDispatchId;
				jsonObject["receive"] 	= true;
				jsonObject["receiveAndApprove"] 	= false;
				var object 			= new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content		: 	new PendingLrForPODReceive(object),
					modalWidth 	: 	100,
					title		:	'LR Details',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();

				object.btModal = btModal;
				new PendingLrForPODReceive(object)
				btModal.open();
				
				var item = dataView.getItem(row);//RowNum is the number of the row
				dataView.deleteItem(item.id);//RowID is the actual ID of the row and not the row number
				grid.invalidate();
				grid.render();
			});	
			
			btModalConfirm.on('extraButton', function() {
				var jsonObject = new Object();
				jsonObject["podDispatchId"] 	= dataView.getItem(row).podDispatchId;
				jsonObject["receive"] 			= false;
				jsonObject["receiveAndApprove"] = true;
				
				var object 			= new Object();
				object.elementValue = jsonObject;

				var btModal = new Backbone.BootstrapModal({
					content		: 	new PendingLrForPODReceive(object),
					modalWidth 	: 	100,
					title		:	'LR Details',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				object.btModal = btModal;
				new PendingLrForPODReceive(object)
				btModal.open();
				
				var item = dataView.getItem(row);//RowNum is the number of the row
				var rowID = item.id
	
				dataView.deleteItem(rowID);//RowID is the actual ID of the row and not the row number
				grid.invalidate();
				grid.render();
			});
		}
	});
});