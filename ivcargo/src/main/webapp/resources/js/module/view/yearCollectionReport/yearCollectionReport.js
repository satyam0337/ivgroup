define(['JsonUtility'
	,'messageUtility'
	,PROJECT_IVUIRESOURCES + '/resources/js/module/view/yearCollectionReport/yearCollectionReportfilepath.js'
	//,PROJECT_IVUIRESOURCES + '/resources/js/highChart/highcharts.js'
	//,PROJECT_IVUIRESOURCES + '/resources/js/highChart/highchartTable-min.js'
	,'jquerylingua'
	,'language'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	 ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],
	function(JsonUtility, MessageUtility, FilePath, Lingua, Language, NodValidation, BootstrapModal , ElementFocusNavigation,Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, corporateAccountId = 0,  _this = '', gridObject, corporateAccountId = 0,crossingTypeComboBoxShow = false, customerAccessId = 0, masterLangObj, masterLangKeySet, caLangObj, caLangKeySet, totalBookingAmount;
	console.log('jsonObject',jsonObject)
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/yearCollectionReportWS/getYearCollectionReportElement.do?',	_this.setYearCollectionReportElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setYearCollectionReportElements : function(response) {
			console.log(response)
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/yearCollectionReport/yearCollectionReport.html",function() {
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
				
				var elementConfiguration	= new Object();

				elementConfiguration.yearElement		= $('#yearEle');
				elementConfiguration.regionElement		= $('#regionEle');
				response.elementConfiguration	= elementConfiguration;
				
				if(elementConfiguration.regionElement != undefined){
					var regionAutoComplete 				= new Object();
					regionAutoComplete.primary_key 		= 'regionId';
					regionAutoComplete.url 				= response.regionList;
					regionAutoComplete.field 			= 'regionName';
					$(elementConfiguration.regionElement).autocompleteCustom(regionAutoComplete);
				}

				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});

				myNod.add({
					selector: '#yearEle',
					validate		: ['presence','min-length:4','max-length:4','integer','min-number:2018','max-number:'+new Date().getFullYear()+''],
					errorMessage	: ['Select Proper Year','Select Proper Year','Select Proper Year','Select Proper Year','No Data Found','Future Date Not Allowed']
				});
				
				if($('#regionEle').exists() && $('#regionEle').is(":visible")){
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});
				}

				hideLayer();
				$("#saveBtn").click(function() {
					myNod.performCheck();
					console.log('check')
					if(myNod.areAll('valid')) {
						_this.onSubmit();								
					}

				});
			});
		},setReportData : function(response) {

			if(response.message != undefined) {
				hideLayer();
				var infoMessage = response.message;
				showMessage(infoMessage.typeName, iconForInfoMsg + infoMessage.description);
				changeDisplayProperty('bottom-border-boxshadow', 'none');
				$("#yearCollectionDetails tr").remove();
				$("#yearCollectionReportDetails tr").remove();
				return;
			}
			$('#middle-border-boxshadow').removeClass("hide");
			$("#yearCollectionReport").empty();
			$("#reportData").empty();
			console.log("Getting Data",response);

			var yearCollectionHM 	= response.yearCollectionReport;
			var monthArrayList 		= response.monthArrayList;
			
			var monthWiseTotalHM 	= response.monthWiseTotalHM;
			var finalTotal	 		= response.finalTotal;
			
			var table 				= $("<table class='table' id='reportData1' width='100%' border='2'></table>");
			var year				= response.year;
			var tr					= $("<tr class='danger' style='position: sticky;top: 0px;'></tr>");

			tr.append("<td><b>Branches</b></td>");
			for(var i=0; i<monthArrayList.length; i++){
				var monthName	=	 monthArrayList[i];
				tr.append("<th><b>"+monthName+"</b></th>");
			}
			tr.append("<td><b>Total</b></td>");
			table.append(tr);
			var columnTotal = 0;
			var i=0,j = 0;
			totalBookingAmount = 0;
			for(var key in yearCollectionHM){
				var tr2			= $("<tr></tr>");
				var	rowTotal 	= 0;
				j = 0;
				if(yearCollectionHM.hasOwnProperty(key)){
					var srcBranchYearCollectionDetails	= yearCollectionHM[key];
					var srcBranchname 					= key.split("_")[0];
					
					tr2.append("<th><b>"+srcBranchname+"</b></th>");

					for(var i=0; i<monthArrayList.length; i++){

						totalBookingAmount = 0;
						if(srcBranchYearCollectionDetails != undefined && typeof srcBranchYearCollectionDetails != 'undefined'){
							var model = srcBranchYearCollectionDetails[i+1];
							if(model != undefined && typeof model != 'undefined'){
								totalBookingAmount	= 	 model.totalBookingAmount;
							}
						}
						
						tr2.append("<td id = '"+i+"_"+j+"'class='text-right' value='"+totalBookingAmount+"'>"+totalBookingAmount+"</td>");
						rowTotal =	rowTotal + totalBookingAmount;
					}

					tr2.append("<td class='text-right'><b>"+rowTotal+"</b></td>");i++;
				}
				table.append(tr2);
			}
			var tr3		= $("<tr></tr>");
			tr3.append("<td><b>Total</b></td>");
			table.append(tr3);

			for(var i=0; i<monthArrayList.length; i++){
				var columnTotal 	= 0;
				if(monthWiseTotalHM[i+1] != null && monthWiseTotalHM[i+1] != undefined){
					columnTotal = monthWiseTotalHM[i+1] ;
				}
				tr3.append("<td class='text-right'><b>"+columnTotal+"</b></td>");
				table.append(tr3);
			}
			
			tr3.append("<td class='text-right'><b>"+finalTotal+"</b></td>");
			table.append(tr3);
			$("#reportData").append(table);
			$("#header1").html('<b>Year Collection Report of '+year + '</b>');
			var data = new Object();
			data.accountGroupNameForPrint	= response.accountGroupName;
			data.branchAddress				= response.accountGroupAdd;
			data.branchPhoneNumber			= response.accountGroupPhone;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'true';
			//data.isGraphNeeded			= 'true';
			printTable(data, 'reportData', 'yearCollectionReport', 'Year Collection Report', 'yearCollectionReport');

			hideLayer();

		},onSubmit : function() {
			showLayer();
			var jsonObject = new Object();

			jsonObject["year"] 			= $('#yearEle').val();
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			getJSON(jsonObject, WEB_SERVICE_URL+'/yearCollectionReportWS/getYearCollectionReportDetails.do',_this.setReportData, EXECUTE_WITH_ERROR);
		}
	});
});