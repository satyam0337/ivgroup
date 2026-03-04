define([   
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(),  _this = '';
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/branchCommisionReportWS/getBranchCommisionElement.do?',_this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/accountreport/branchCommisionReport/branchCommisionReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				if(response.showBranchCmsnLrDetails)
					$("#lrDetailId").css('display','block');

				let elementConfiguration		= new Object();
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.branchElement			= $('#branchEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.destBranchElement		= $('#destBranchEle');
				elementConfiguration.destSubregionElement	= $('#destSubRegionEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.isPhysicalBranchesShow		= true;
				response.sourceSubRegionBranchSelection			= response.subRegion && response.branch
				response.destinationSubRegionBranchSelection	= response.destSubRegion && response.destBranch
				response.toSubRegionList						= response.subRegionList;
				
				if(!response.sourceSubRegionBranchSelection && !response.destinationSubRegionBranchSelection) {
					response.executiveTypeWiseBranch			= true;
					response.destinationBranchSelection			= true;
				}
				
				Selection.setSelectionToGetData(response);
				
				let myNod = Selection.setNodElementForValidation(response);

				hideLayer();
				
				$("#searchBtn").click(function() {
					myNod.performCheck();
				
					if(myNod.areAll('valid'))
						_this.onSubmit();	
				});
				
				$("#lrDetailId").click(function() {
					_this.getBranchCmsnLRDetails();
				});

			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/branchCommisionReportWS/getBranchCommisionDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
					
			$('#bottom-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
		}, getBranchCmsnLRDetails : function() {
			let jsonObject = Selection.getElementData();
			
			require([PROJECT_IVUIRESOURCES + '/resources/js/report/accountreport/branchCommisionReport/branchCommsnLrDetails.js'], function(LRDetails){
				let btModal = new Backbone.BootstrapModal({
					content		: new LRDetails(jsonObject),
					modalWidth 	: 80,
					modalHeight : 80,
					okText		: 'Close',
					showFooter 	: true,
					title		: '<center>LR Details</center>'
				}).open();
			});
		}
	});
});