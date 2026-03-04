define(
		[
		 'slickGridWrapper2',
		 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		 'JsonUtility',
		 'messageUtility',
		 'nodvalidation',
		 'focusnavigation',
	 ],//PopulateAutocomplete
	 function(slickGridWrapper2, Selection) {
		'use strict';
		var jsonObject = new Object(), myNod,  _this;
		return Marionette.LayoutView.extend({
			initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lhpvPaymentDetailsReportWS/getLHPVPaymentElement.do?',	_this.setElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setElements : function(response) {
			showLayer();
			var loadelement 	= new Array();
			var baseHtml 		= new $.Deferred();
			loadelement.push(baseHtml);
				
			$("#mainContent").load("/ivcargo/html/report/dispatchreport/lhpvPaymentDetailsReport/lhpvPaymentDetailsReport.html",
					function() {
					baseHtml.resolve();
			});
					
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
						
				var keyObject 		= Object.keys(response);
			
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
						
				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.AllOptionsForRegion    = false;
						
				var elementConfiguration	= new Object();
						
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');
						
				response.elementConfiguration	= elementConfiguration;
				response.isPhysicalBranchesShow	= true;
				Selection.setSelectionToGetData(response);
						
				myNod = nod();
						
				if($('#regionEle').exists() && $('#regionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'regionEle', 'Select proper Region !');
				
				if($('#subRegionEle').exists() && $('#subRegionEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'subRegionEle', 'Select proper Area !');
				
				if($('#branchEle').exists() && $('#branchEle').is(":visible"))
					addAutocompleteElementInNode(myNod, 'branchEle', 'Select proper Branch !');
				
				hideLayer();
					
				$("#findBtn").click(function() {
					myNod.performCheck();
							
					if(myNod.areAll('valid'))
						_this.onFind();
				});
			});
		}, onFind : function() {
			showLayer();
			var jsonObject = Selection.getElementData();
			getJSON(jsonObject, WEB_SERVICE_URL+'/lhpvPaymentDetailsReportWS/getLHPVPaymentDetails.do', _this.setResultData, EXECUTE_WITH_ERROR);
		}, setResultData : function(response) {
			hideLayer();

			if (response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				response.Language	= {};
				slickGridWrapper2.setGrid(response);
			}
		}
	});
});