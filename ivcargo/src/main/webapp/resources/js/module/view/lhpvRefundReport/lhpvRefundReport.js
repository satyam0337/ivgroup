define([  
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
          ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lhpvRefundReportWS/getLHPVRefundReportElement.do?',	_this.setLHPVRefundElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},setLHPVRefundElements : function(response){
			console.log(response)
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lhpvRefundReport/lhpvRefundReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();

				let keyObject = Object.keys(response);

				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);

				hideLayer();

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();
				});
			});
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/lhpvRefundReportWS/getLHPVRefundReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}
	});
});