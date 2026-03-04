
define([  
    'slickGridWrapper2'
    , PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'//PopulateAutocomplete
	,'JsonUtility'
    ,'messageUtility'
          ,'autocomplete'
          ,'autocompleteWrapper'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
], function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/lhpvAverageReportWS/getLHPVAverageReportElement.do?', _this.renderLHPVRegisterReportElements,	EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderLHPVRegisterReportElements : function(response) {
			let loadelement = new Array();
			let baseHtml = new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/lhpvAverageReport/lhpvAverageReport.html",function() {
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
				elementConfiguration.destBranchElement	= $('#destBranchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;
				response.destinationBranchSelection	= true;
				
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
			getJSON(jsonObject, WEB_SERVICE_URL+'/lhpvAverageReportWS/getLHPVAverageReportDetails.do', _this.setReportData, EXECUTE_WITH_NEW_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			let lhpvAverageColumnConfig = response.columnConfiguration;
			let lhpvAverageColumnKeys	= _.keys(lhpvAverageColumnConfig);
			let lhpvAverageConfig		= new Object();
				
			let NewlhpvAverageColumnKeys	= new Array();
				
			for(let i = 0;lhpvAverageColumnKeys.length > i; i++) {
				if(lhpvAverageColumnKeys[i] != 'totalLorryHire') {
					NewlhpvAverageColumnKeys.push(lhpvAverageColumnKeys[i]);
				} else {
					break;
				}
			}
				
			let lhpvAverageColl 	= response.CorporateAccount;
			let hirechargesHead 	= new Array();
				
			for(let key in lhpvAverageColl) {
				let costTypeHM			= lhpvAverageColl[key]["costTypeHM"];

				for(let costTypeId in costTypeHM){
					hirechargesHead.push("Hire" + costTypeId);
					hirechargesHead.push("Average" + costTypeId);
				}
			}
				
			if(hirechargesHead != undefined) {
				for(let j in hirechargesHead) {
					if(hirechargesHead[j] != null) {
						let showTotal = !(/Average/i.test(hirechargesHead[j].replace(/[' ',.,/]/g,"")));
						
						NewlhpvAverageColumnKeys.push(hirechargesHead[j].replace(/[' ',.,/]/g,""));
						lhpvAverageColumnConfig[hirechargesHead[j].replace(/[' ',.,/]/g,"")] = {	 
								"dataDtoKey":hirechargesHead[j].replace(/[' ',.,/]/g,"")
								,"dataType":"number"
								,"title":hirechargesHead[j].replace(/[' ',.,/]/g,"")
								,"searchFilter":false
								,"listFilter":false
								,"columnHidden":false
								,"displayColumnTotal":showTotal
								,"columnMinimumDisplayWidthInPx":70
								,"columnInitialDisplayWidthInPx":90
								,"columnMaximumDisplayWidthInPx":120
								,"columnPrintWidthInPercentage":8
								,"elementCssClass":""
								,"columnDisplayCssClass":""
								,"columnPrintCssClass":""
								,"sortColumn":true
								,"show":true
						};
					}
				}
			}
				
			NewlhpvAverageColumnKeys = _.union(NewlhpvAverageColumnKeys, lhpvAverageColumnKeys);

			for (let i = 0; i < NewlhpvAverageColumnKeys.length; i++) {
				let bObj	= lhpvAverageColumnConfig[NewlhpvAverageColumnKeys[i]];
				
				if (bObj.show != undefined && bObj.show == true) {
					lhpvAverageConfig[NewlhpvAverageColumnKeys[i]] = bObj;
				}
			}
				
			response.columnConfiguration	= _.values(lhpvAverageConfig);
			
			for(let i = 0; response.CorporateAccount.length > i; i++) {
				for(let k in hirechargesHead) {
					if(hirechargesHead[k] != null) {
						response.CorporateAccount[i][hirechargesHead[k].replace(/[' ',.,/]/g,"")] = 0;
					}
				}
				
				if(response.CorporateAccount[i].costTypeHM != undefined) {
					let costTypeHM				= response.CorporateAccount[i].costTypeHM;
					let costTypeAverageHM		= response.CorporateAccount[i].costTypeAverageHM;
					
					for(let costTypeId in costTypeHM) {
						response.CorporateAccount[i]["Hire" + costTypeId.replace(/[' ',.,/]/g,"")] 	= costTypeHM[costTypeId]+'';
						response.CorporateAccount[i]["Average" + costTypeId.replace(/[' ',.,/]/g,"")] = costTypeAverageHM[costTypeId]+'';
					} 
				}
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			slickGridWrapper2.setGrid(response);
			
			hideLayer();
		}
	});
});
