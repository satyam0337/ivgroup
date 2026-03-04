define([
	 'slickGridWrapper2',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	 'messageUtility',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
],function(slickGridWrapper2, Selection){
	'use strict';
	var jsonObject = new Object(), myNod,  _this;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/missingLRNumberReportWS/getMissingLrNumberReportElement.do?', _this.setMissingLrNumberReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setMissingLrNumberReportsElements : function(response){
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/report/missinglrnumber/missingLrNumberReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function(){
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	= elementConfiguration;
				response.sourceAreaSelection	= true;
				response.isPhysicalBranchesShow	= true;
				response.AllOptionsForRegion  	= false;
				response.AllOptionsForSubRegion = false;
				response.AllOptionsForBranch 	= false;
				Selection.setSelectionToGetData(response);
				
				var lrModeComplete 			= new Object();
				lrModeComplete.primary_key 	= 'sequenceTypeId';
				lrModeComplete.field 		= 'sequenceTypeName';
				$("#lrModeEle").autocompleteCustom(lrModeComplete);
				
				var lrModeComplete = $("#lrModeEle").getInstance();
				
				$(lrModeComplete).each(function() {
					this.option.source = response.sequenceTypeTypeArr;
				});
				
				myNod	= Selection.setNodElementForValidation(response);
				
				myNod.add({
					selector: '#fromRangeEle',
					validate: 'checkForNumber:#fromRangeEle',
					errorMessage: 'Enter Min Range !'
				});
				
				myNod.add({
					selector: '#toRangeEle',
					validate: 'checkForNumber:#toRangeEle',
					errorMessage: 'Enter Max Range !'
				});
				
				myNod.add({
					selector		: '#toRangeEle',
					validate 		: 'checkGreater:#fromRangeEle:#toRangeEle',
					errorMessage	: 'Should Be Gretaer Than Min Range'
				});
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid') && _this.validateRange())
						_this.onSubmit();
				});
			});
		}, validateRange: function() {
			var minRange = $('#fromRangeEle').val();
			var maxRange = $('#toRangeEle').val();
			
			if((maxRange - minRange) > 1000) {
				showMessage('info', 'Please Enter range Up to 1000 !');
				return false;
			}
			
			return true;
		}, onSubmit : function() {
			showLayer();
			var jsonObject = Selection.getElementData();
			
			jsonObject["minRange"] 			= $('#fromRangeEle').val();
			jsonObject["maxRange"] 			= $('#toRangeEle').val();
			jsonObject["lrMode"] 			= $('#lrModeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/missingLRNumberReportWS/getMissingLrReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			$("#missingLRDetailsDiv").empty();
			$("#otherBranchLRDetailsDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			
			if(response.missingLRNumber != undefined && response.missingLRNumber.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.missingLRNumber);
			} else
				$('#middle-border-boxshadow').addClass('hide');
			
			if(response.lrBookedByOtherBranch != undefined && response.lrBookedByOtherBranch.CorporateAccount != undefined && response.lrBookedByOtherBranch.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				slickGridWrapper2.setGrid(response.lrBookedByOtherBranch);
			} else
				$('#bottom-border-boxshadow').addClass('hide');
			
			hideLayer();
		}
	});
});