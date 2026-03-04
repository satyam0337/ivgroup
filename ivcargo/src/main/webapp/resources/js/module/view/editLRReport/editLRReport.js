define([ 
		'marionette'
         ,PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
         ,'selectizewrapper'
		 ,'slickGridWrapper2',
         ,'JsonUtility'
         ,'messageUtility'
         ,'/ivcargo/resources/js/generic/urlparameter.js'
         ,'nodvalidation'
		 ,'focusnavigation'
         ],
         function(Marionette, Selection, Selectizewrapper, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	var jsonObject	= new Object(), _this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function() {
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			getJSON(jsonObject, WEB_SERVICE_URL + '/editLRReportWS/getEditLRReportElements.do?', _this.setEditLRReportElements, EXECUTE_WITHOUT_ERROR);
		}, setEditLRReportElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/waybill/editLRReport/editLRReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
			
				var keyObject = Object.keys(response);
			
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				_this.setModuleType(response);
				
				response.sourceAreaSelection				= true;
				response.isCalenderSelection				= true;
				response.isThreeMonthsCalenderSelection 	= true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');
				
				response.elementConfiguration			= elementConfiguration;
				response.isPhysicalBranchesShow			= true;
				
				Selection.setSelectionToGetData(response);
				
				let myNod = Selection.setNodElementForValidation(response);
			
				myNod.add({
					selector: '#moduleTypeEle',
					validate: 'validateAutocomplete:#moduleTypeEle',
					errorMessage: 'Select Module Type !'
				});
				
				hideLayer();
				
				$("#find").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();

			jsonObject["moduleId"] 			= $('#moduleTypeEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/editLRReportWS/getEditLRReport.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			response.CorporateAccount.sort(function(x, y) {
			    return x.editedDateTime - y.editedDateTime;
			})
			
			slickGridWrapper2.setGrid(response);
			hideLayer();
		}, setModuleType : function(response) {
			Selectizewrapper.setAutocomplete({
				jsonResultList	: 	response.moduleList,
				valueField		:	'moduleId',
				labelField		:	'moduleName',
				searchField		:	'moduleName',
				elementId		:	'moduleTypeEle',
				create			: 	false,
				maxItems		: 	1,
			});
		}
	});
});

function viewEditBookingCharges(grid, dataView, row) {
	if(dataView.getItem(row).waybillId != undefined)
		window.open('editLrRateHistory.do?pageId=340&eventId=2&modulename=editLrRateHistory&wayBillId='+dataView.getItem(row).waybillId,'newwindow', config='height=400,width=800, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}

function viewConsignmentDetails(grid, dataView, row) {
	if(dataView.getItem(row).waybillId != undefined)
		window.open ('editLrHistory.do?pageId=340&eventId=2&modulename=editLrHistory&filter=true&wayBillId=' + dataView.getItem(row).waybillId,'newwindow', config='left=200,top=130,width=1055,height=490, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
}