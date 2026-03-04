define([ 'marionette'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'slickGridWrapper2'
	,'JsonUtility'
	,'messageUtility'
	,'focusnavigation'
	,'nodvalidation'
	],
	function(Marionette, Selection, slickGridWrapper2) {
	'use strict';// this basically give strictness to this specific js
	let _this = '', myNod = null;
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			let jsonObject	= new Object();
			getJSON(jsonObject, WEB_SERVICE_URL + '/smsCountReportWS/getInitialDetailsOfSmsCount.do?', _this.setGroup, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setGroup : function(response){
			let loadelement = new Array();
			let baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/accountreport/smscountreport/smsCountReport.html",
					function() {
				baseHtml.resolve();
			});
		
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration	= elementConfiguration;
				response.isCalenderSelection	= true;
				response.accountGroupSelection	= response.showAllGroupsOption;
				response.allOptionsForGroup		= true;
				response.displayAllGroups		= true;

				Selection.setSelectionToGetData(response);

				if(!response.showAllGroupsOption)
					$("*[data-attribute='accountGroup']").remove();
				
				if(response.showAllGroupsOption) {
					myNod = nod();
					myNod.configure({
						parentClass:'validation-message'
					});
					
					myNod.add({
						selector		: '#accountGroupEle',
						validate		: 'validateAutocomplete:#accountGroupEle',
						errorMessage	: 'Select Proper Group !'
					});
				}
				
				$("#getRequestCount").click(function() {
					if(response.showAllGroupsOption) {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.getRequestCount();
					} else
						_this.getRequestCount();
				});
			});
			
			hideLayer();
		}, getRequestCount : function() {
			let jsonObject = new Object();
			showLayer();
			jsonObject["txnAccountGroupId"]   = $('#accountGroupEle').val();
			
			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			
			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			
			getJSON(jsonObject, WEB_SERVICE_URL + "/smsCountReportWS/getDetailsOfSmsCount.do?", _this.setResults, EXECUTE_WITH_ERROR );	
		}, setResults : function(response) {
			hideLayer();
				
			if (response.message != undefined) {
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			hideAllMessages();
			slickGridWrapper2.setGrid(response);
		}
	});
});