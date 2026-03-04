define([  
	
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/module/view/partyagentcommisionreport/LRDetails.js'//ModelUrls
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
	,'errorshow'
	],function(slickGridWrapper2, Selection, LRDetails) {
	'use strict';
	var jsonObject = new Object()
	, myNod
	,  _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/partyAgentCommissionReportWS/getPartyAgentCommissionReportElement.do?',_this.setElementDetails,	EXECUTE_WITH_ERROR);
			return _this;
		},setElementDetails : function(response){
			//focus navigation initiates through this function
			initialiseFocus();
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/partyAgentCommissionReport/PartyAgentCommissionReport.html",function() {
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
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.partyAgentNameElement	= $("#partyAgentEle");
				
				response.elementConfiguration			= elementConfiguration;
				response.sourceAreaSelection			= true;
				response.isCalenderSelection			= true;
				response.isPhysicalBranchesShow			= true;
				response.partyAgentNameSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
			});

		},onSubmit:function(){
			showLayer();
			
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/partyAgentCommissionReportWS/getPartyAgentCommissionReportDetails.do?', _this.setData, EXECUTE_WITH_ERROR);
		},setData : function(response) {
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				hideLayer();
				return;
			}
			
			hideLayer();
			$('#bottom-border-boxshadow').removeClass('hide');
			response.tableProperties.partialButtonLableName		= 'LR Details';
			response.tableProperties.callBackFunctionForPartial = _this.getLRDetails;
			slickGridWrapper2.setGrid(response);
				
			hideLayer();
		},getLRDetails : function (grid, dataView,row) {
			hideLayer();
			
			let jsonObject = new Object();
			jsonObject["partyAgentSummaryId"] 		= dataView.getItem(row).partyAgentCommisionSummaryId;
			
			let object 			= new Object();
			object.jsonObject	= jsonObject;
			
			let btModal = new Backbone.BootstrapModal({
				content: new LRDetails(object),
				modalWidth : 60,
				title:'LR Details'

			}).open();
			
			object.btModal = btModal;
			new LRDetails(object)
			btModal.open();
			
		}
	});
});

function printPartyAgentCommision(grid, dataView,row) {
	if(dataView.getItem(row).partyAgentCommisionSummaryId != undefined){
		childwin = window.open ('viewDetails.do?pageId=340&eventId=2&modulename=partyAgentCommisionPrint&masterid='+dataView.getItem(row).partyAgentCommisionSummaryId,'newwindow', config='height=400,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
	} 
}