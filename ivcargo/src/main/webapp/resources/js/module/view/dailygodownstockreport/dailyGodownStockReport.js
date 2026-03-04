define(['JsonUtility',
	 'messageUtility',
	 PROJECT_IVUIRESOURCES + '/resources/js/module/view/dailygodownstockreport/dailyGodownStockReportfilepath.js',
	 'jquerylingua',
	 'language',
	 'bootstrapSwitch',
	 'slickGridWrapper3',
	 'nodvalidation',
	 'focusnavigation',
	 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js',
	 PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	],function(JsonUtility, MessageUtility, FilePath, Lingua, Language, BootstrapSwitch, slickGridWrapper3, 
			NodValidation, FocusNavigation,BootstrapModal, Selection){
	'use strict';
	var jsonObject = new Object(), myNod, masterLangObj, masterLangKeySet, gridObject,  _this;
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/DailyGodownStockReportWS/getDailyGodownStockReportElement.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		},setReportsElements : function(response){

			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();
			var executive				= response.executive;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/godownstockreport/DailyGodownStockReport.html",function() {
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
				
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				
				response.elementConfiguration	        = elementConfiguration;
				response.sourceAreaSelection	        = true;
				response.isCalenderSelection	        = true;
				response.isPhysicalBranchesShow	        = true;
				response.AllOptionsForRegion  	        = false,
				response.AllOptionsForSubRegion         = false,
				response.AllOptionsForBranch 	        = false;
				
				Selection.setSelectionToGetData(response);
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				if (executive.executiveType == EXECUTIVE_TYPE_GROUPADMIN) {
					myNod.add({
						selector: '#regionEle',
						validate: 'validateAutocomplete:#regionEle_primary_key',
						errorMessage: 'Select proper Region !'
					});

					myNod.add({
						selector: '#subRegionEle',
						validate: 'validateAutocomplete:#subRegionEle_primary_key',
						errorMessage: 'Select proper Area !'
					});

					myNod.add({
						selector: '#branchEle',
						validate: 'validateAutocomplete:#branchEle_primary_key',
						errorMessage: 'Select proper Branch !'
					});
				}
				
				hideLayer();
				//$("#saveBtn").parent().append("<button type='button' class='btn btn-danger' id='pojo'>POJO</button>");
				//$("#pojo").click(function() {
				//	getJSON(jsonObject, WEB_SERVICE_URL+'/DailyGodownStockWS/insertOpeningClosingGodownStockEntry.do?', _this.setReportData, EXECUTE_WITH_ERROR);
				//})

				$("#saveBtn").click(function() {
				myNod.performCheck();
				
				if(myNod.areAll('valid')) {
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
			jsonObject["regionId"] 			= $('#regionEle_primary_key').val();
			jsonObject["subRegionId"] 		= $('#subRegionEle_primary_key').val();
			jsonObject["branchId"] 			= $('#branchEle_primary_key').val();
			console.log('jsonObject ',jsonObject)
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/DailyGodownStockReportWS/getDailyGodownStockReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
	
		},setReportData : function(response){
			console.log("response",response)
			$("#dailyGodownStockDetailsDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				
				var errorMessage = response.message;
				showMessage('error', errorMessage.description);
				return;
			}
			
			if(response.bookinggodownstock_ != undefined) {
				var dailyGodownStockColumnConfig = response.bookinggodownstock_.columnConfiguration;
				var dailyGodownStockColumnKeys	= _.keys(dailyGodownStockColumnConfig);
				var dailyGodownStockConfig		= new Object();
				
				for (var i = 0; i < dailyGodownStockColumnKeys.length; i++) {

					var bObj	= dailyGodownStockColumnConfig[dailyGodownStockColumnKeys[i]];
					
					if (bObj != undefined && bObj.show == true) {
						dailyGodownStockColumnConfig[dailyGodownStockColumnKeys[i]] = bObj;
					}
				}
			
				response.bookinggodownstock_.columnConfiguration	= dailyGodownStockColumnConfig;
				response.bookinggodownstock_.Language				= masterLangKeySet;
			}
			
			console.log("dddd>>", response.bookinggodownstock_.CorporateAccount)
			if(response.bookinggodownstock_ != undefined && response.bookinggodownstock_.CorporateAccount != undefined
					&& response.bookinggodownstock_.CorporateAccount.length > 0) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				//gridObject = slickGridWrapper2.applyGrid(response.DailyGodownStock);
				gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead		    : _.values(response.bookinggodownstock_.columnConfiguration), 
							ColumnData		    : _.values(response.bookinggodownstock_.CorporateAccount), 	
							Language		    : response.bookinggodownstock_.Language, 			
							ShowPrintButton	    : true,
							ShowCheckBox		: false,
							fullTableHeight		: false,
							rowHeight 			: 30,
							DivId			    : 'dailyGodownStockDetailsDiv',
							SerialNo		    : [{						
								showSerialNo    : true,
								searchFilter    : false,       
								ListFilter	    : false			
							}],
							InnerSlickId		: 'dailyGodownStockDetailsDivInner', 
							InnerSlickHeight	: '300px',
							NoVerticalScrollBar	: false 
						});
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}
			
			if(response.deliverygodownstock_ != undefined) {
				var dailyGodownStockColumnConfig = response.deliverygodownstock_.columnConfiguration;
				var dailyGodownStockColumnKeys	= _.keys(dailyGodownStockColumnConfig);
				var dailyGodownStockConfig		= new Object();
				
				for (var i = 0; i < dailyGodownStockColumnKeys.length; i++) {

					var bObj	= dailyGodownStockColumnConfig[dailyGodownStockColumnKeys[i]];
					
					if (bObj != undefined && bObj.show == true) {
						dailyGodownStockColumnConfig[dailyGodownStockColumnKeys[i]] = bObj;
					}
				}
			
				response.deliverygodownstock_.columnConfiguration	= dailyGodownStockColumnConfig;
				response.deliverygodownstock_.Language				= masterLangKeySet;
			}
			if(response.deliverygodownstock_ != undefined && response.deliverygodownstock_.CorporateAccount != undefined
					&& response.deliverygodownstock_.CorporateAccount.length > 0) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();
				console.log("response.deliverygodownstock_.CorporateAccount",response.deliverygodownstock_.CorporateAccount)
				//gridObject = slickGridWrapper2.applyGrid(response.DailyGodownStock);
				gridObject = slickGridWrapper3.applyGrid(
						{
							ColumnHead		    : _.values(response.deliverygodownstock_.columnConfiguration), 
							ColumnData		    : _.values(response.deliverygodownstock_.CorporateAccount), 	
							Language		    : response.deliverygodownstock_.Language, 			
							ShowPrintButton	    : true,
							ShowCheckBox		: false,
							fullTableHeight		: false,
							rowHeight 			: 30,
							DivId			    : 'dailyGodownStockDetailsDiv1',
							SerialNo		    : [{						
								showSerialNo    : true,
								searchFilter    : false,       
								ListFilter	    : false			
							}],
							InnerSlickId		: 'dailyGodownStockDetailsDivInner1', 
							InnerSlickHeight	: '300px',
							NoVerticalScrollBar	: false 
						});
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			//$('#left-border-boxshadow').removeClass('hide');
			$('#dailyGodownStockDetailsDiv').css('font-size','14px');
			$('#dailyGodownStockDetailsDiv1').css('font-size','14px');
			$('#dailyGodownStockDetailsDiv2').css('font-size','14px');
			
			var row = $("</tr>");
			row.append("<td>Date :</td>");
			row.append("<td>Branch :</td>");
			$('#dailyGodownStockDetailsDiv2').append(row);
			$('#dailyGodownStockDetailsDiv2').append("<span>span</span>");
			hideLayer();
		}
	});
});
