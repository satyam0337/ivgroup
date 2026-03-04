
define([  'JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/dispatchandcrossingamountreport/dispatchandcrossingamountreportfilepath.js'
	,'jquerylingua'
	,'language'
	,'autocomplete'
	,'autocompleteWrapper'
	,'slickGridWrapper3'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, AutoComplete, AutoCompleteWrapper,
			slickGridWrapper3, NodValidation, BootstrapModal,ElementFocusNavigation,Selection,Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), 
	myNod,  
	_this = '', 
	gridObject, 
	masterLangObj, 
	masterLangKeySet, 
	caLangObj, 
	caLangKeySet;
	
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/dispatchAndCrossingamountReportWS/getDispatchAndCrossingamountReportElement.do?',_this.getElementConfigDetails,	EXECUTE_WITHOUT_ERROR);
			return _this;
		},getElementConfigDetails : function(response){

			var loadelement = new Array();
			var baseHtml = new $.Deferred();
			var executive	= response.executive;

			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/dispatchandcrossingamountreport/DispatchAndCrossingAmountReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				var keyObject = Object.keys(response);
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]].show == true) {
						$("*[data-attribute="+ keyObject[i]+ "]").addClass("show");
					}
				}
				
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.subRegionList,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'sourceSubRegionEle',
					create			: 	false,
					maxItems		: 	1
				});
				Selectizewrapper.setAutocomplete({
					jsonResultList	: 	response.subRegionList,
					valueField		:	'subRegionId',
					labelField		:	'subRegionName',
					searchField		:	'subRegionName',
					elementId		:	'destSubRegionEle',
					create			: 	false,
					maxItems		: 	1
				});
				
				var elementConfiguration					= new Object();

				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.vehicleElement			= $('#vehicleNumberEle');

				response.elementConfiguration				= elementConfiguration;
				response.isCalenderSelection				= true;
				response.vehicleSelection					= true;
				console.log(response);
				Selection.setSelectionToGetData(response);

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();

				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
					errorMessage: 'Select proper Vehicle !'
				});
				
				myNod.add({
					selector: '#sourceSubRegionEle',
					validate: 'validateAutocomplete:#sourceSubRegionEle',
					errorMessage: 'Select Source SubRegion !'
				});
				
				myNod.add({
					selector: '#destSubRegionEle',
					validate: 'validateAutocomplete:#destSubRegionEle',
					errorMessage: 'Select Dest SubRegion !'
				});
				
				hideLayer();

				$("#find").click(function() {
					myNod.performCheck();
					if(myNod.areAll('valid')){
						_this.onSubmit(_this);								
					}
				});
			});

		},onSubmit : function() {
			
			showLayer();
			var jsonObject = new Object();
			if($("#dateEle").attr('data-startdate') != undefined){
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 
			}

			if($("#dateEle").attr('data-enddate') != undefined){
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 
			}
			
			jsonObject["vehicleNumberMasterId"] 		= $('#vehicleNumberEle_primary_key').val();
			jsonObject["sourceSubRegionId"] 			= $('#sourceSubRegionEle').val();
			jsonObject["destinationSubRegionId"] 		= $('#destSubRegionEle').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/dispatchAndCrossingamountReportWS/getDispatchAndCrossingAmountReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		},setReportData : function(response){
			if(response.message != undefined) {
				hideLayer();
				$('#bottom-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);;
				return;
			}
			if(response.dispatchAndCrossingAmount != undefined) {
				var dispatchAndCrossingAmountColumnConfig = response.dispatchAndCrossingAmount.columnConfiguration;
				var dispatchAndCrossingAmountColumnKeys	= _.keys(dispatchAndCrossingAmountColumnConfig);
				var dispatchAndCrossingAmountConfig		= new Object();

				for (var i = 0; i < dispatchAndCrossingAmountColumnKeys.length; i++) {
					var bObj	= dispatchAndCrossingAmountColumnConfig[dispatchAndCrossingAmountColumnKeys[i]];

					if (bObj != null && bObj.show != undefined && bObj.show == true) {
						dispatchAndCrossingAmountColumnConfig[dispatchAndCrossingAmountColumnKeys[i]] = bObj;
					}
				}

				response.dispatchAndCrossingAmount.columnConfiguration	= _.values(dispatchAndCrossingAmountColumnConfig);
				response.dispatchAndCrossingAmount.Language			= masterLangKeySet;
			}
			
			if(response.dispatchAndCrossingAmount != undefined && response.dispatchAndCrossingAmount.CorporateAccount != undefined) {

				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();

				gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead:response.dispatchAndCrossingAmount.columnConfiguration, // *compulsory // for table headers
							ColumnData:_.values(response.dispatchAndCrossingAmount.CorporateAccount), 	// *compulsory // for table's data
							Language:response.dispatchAndCrossingAmount.Language, 			// *compulsory for table's header row language
							ShowPrintButton:true,
							DivId:'dispatchAndCrossingAmountDetailsDiv',				// *compulsary field // division id where slickgrid table has to be created
							SerialNo:[{						// optional field // for showing Row number
								showSerialNo:true,
								searchFilter:false,          // for search filter on serial no
								ListFilter:false				// for list filter on serial no
							}],
							InnerSlickId:'dispatchAndCrossingAmountDetailsDivInner', // Div Id
							InnerSlickHeight	: '300px',
							NoVerticalScrollBar:false //optional for no vertical scrolling & if set true remove height attribute to Grid Div
						});
			}
			
			hideLayer();
		}
	});
});