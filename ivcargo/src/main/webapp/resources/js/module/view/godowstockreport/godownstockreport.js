define([  
	
     PROJECT_IVUIRESOURCES + '/resources/js/module/view/godowstockreport/godownstockfilepath.js'
          ,'slickGridWrapper2'
          ,PROJECT_IVUIRESOURCES+'/resources/js/module/view/godowstockreport/LRDetails.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
          ,'messageUtility'
          ,'jquerylingua'
          ,'language'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
          ,'focusnavigation'//import in require.config
          ],
          function(FilePath, slickGridWrapper2, LRDetails, Selection) {
	'use strict';
	var jsonObject = new Object(), myNod, _this = '', gridObject, masterLangObj, masterLangKeySet,viewAll=true,viewAllRecords=false,sortByLastNumber=false,showGodownStockDetailsInSeparateTab=false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/godownStockReportWS/getGodownStockElement.do?',	_this.setGodownStockReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},setGodownStockReportsElements : function(response) {
			var loadelement 			= new Array();
			var baseHtml 				= new $.Deferred();

			sortByLastNumber 		= response.sortByLastNumber;
			viewAllRecords			= response.viewAllRecords;

			showGodownStockDetailsInSeparateTab = response.showGodownStockDetailsInSeparateTab;
			
			loadelement.push(baseHtml);
			$("#mainContent").load("/ivcargo/html/module/godownstockreport/GodownStockReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				$("*[data-selector=header]").html(response.reportName);
				
				var keyObject = Object.keys(response);
				
				if(response.GODOWN_STOCK_PENDING_DISPATCH_MAIL)
					$("#mailGodownStock").removeClass('hide');

				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}

				response.sourceAreaSelection	= true;
				response.isCalenderSelection	= true;
				response.isThreeMonthsCalenderSelection = true;
				
				var elementConfiguration	= new Object();
				
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.stockTypeElement	= $('#stockTypeEle');
				
				response.elementConfiguration	= elementConfiguration;
				
				Selection.setSelectionToGetData(response);
				
				if(viewAllRecords) {
					$('#viewAllRecords').removeClass('hide');
					$('#date').removeClass('hide');
					
					$('#viewAllCheck').click(function(){
						if ($('#viewAllCheck').prop("checked"))
							$('#date').addClass('hide');
						else
							$('#date').removeClass('hide');
					});
				} else {
					viewAll = true;
					$('#viewAllRecords').remove();
					$('#date').addClass('hide');
				}
				
				masterLangObj 		= FilePath.loadLanguage();
				masterLangKeySet 	= loadLanguageWithParams(masterLangObj);
				
				myNod = Selection.setNodElementForValidation(response);

				myNod.add({
					selector: '#stockTypeEle',
					validate: 'validateAutocomplete:#stockTypeEle_primary_key',
					errorMessage: 'Select Stock Type !'
				});
				
				hideLayer();
			
				$("#mailGodownStock").click(function(){
					showLayer();
					getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingDispatchStockEmailToClientWS/sendPendingDispatchStockEmailToClient.do?',	_this.checkForMailSent, EXECUTE_WITHOUT_ERROR);
				})

				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid')) {
						_this.onSubmit(_this);								
					}
				});
			});
		},checkForMailSent:function(response){
			hideLayer();
			if(response.message != undefined) {
				let message = response.message;
				showMessage('success', message.description);
			}
		},setReportData : function(response) {
			$("#pendingDispatchDiv").empty();
			$("#pendingDeliveryDiv").empty();
			$("#pendingCrossingDiv").empty();
			$("#arrivedLRDiv").empty();
			$("#pendingStockOutDiv").empty();
			
			if(response.message != undefined) {
				hideLayer();
				$('#pendingDispatch').hide();
				$('#pendingDelivery').hide();
				$('#pendingCrossing').hide();
				$('#arrivedLR').hide();
				$('#pendingStockOut').hide();
				
				$('#btnprint_pendingDispatchDetails').hide();
				$('#btnprint_pendingDeliveryDetails').hide();
				$('#btnprint_pendingCrossingDetails').hide();
				$('#btnprint_arrivedLRDetails').hide();
				
				$("#pendingDispatchDiv").hide();
				$("#pendingDeliveryDiv").hide();
				$("#pendingCrossingDiv").hide();
				$('#arrivedLRDiv').hide();
				return;
			}

			if(response.setSeparateGrid == true){
				
				if(response.finalListForRayanPadu != undefined) {
					var PendingDispatchColumnConfig2 = response.finalListForRayanPadu.columnConfiguration;
					var PendingDispatchColumnKeys2	= _.keys(PendingDispatchColumnConfig2);
					var PendingDispatchConfig2		= new Object();
					
					for (var i = 0; i < PendingDispatchColumnKeys2.length; i++) {
						
						var bObj	= PendingDispatchColumnConfig2[PendingDispatchColumnKeys2[i]];
						
						if (bObj.show == true) {
							PendingDispatchConfig2[PendingDispatchColumnKeys2[i]] = bObj;
						}
					}
				
					response.finalListForRayanPadu.columnConfiguration	= PendingDispatchConfig2;
					response.finalListForRayanPadu.Language					= masterLangKeySet;
				}
				
				if(response.finalListForsagarRoad != undefined) {
					var PendingDispatchColumnConfig3 = response.finalListForsagarRoad.columnConfiguration;
					var PendingDispatchColumnKeys3	= _.keys(PendingDispatchColumnConfig3);
					var PendingDispatchConfig3		= new Object();
					
					for (var i = 0; i < PendingDispatchColumnKeys3.length; i++) {
						
						var bObj	= PendingDispatchColumnConfig3[PendingDispatchColumnKeys3[i]];
						
						if (bObj.show == true) {
							PendingDispatchConfig3[PendingDispatchColumnKeys3[i]] = bObj;
						}
					}
					
					response.finalListForsagarRoad.columnConfiguration	= PendingDispatchConfig3;
					response.finalListForsagarRoad.Language				= masterLangKeySet;
				}
			} else{
				
				if(response.PendingDispatch != undefined) {
					var PendingDispatchColumnConfig = response.PendingDispatch.columnConfiguration;
					var PendingDispatchColumnKeys	= _.keys(PendingDispatchColumnConfig);
					var PendingDispatchConfig		= new Object();
					
					for (var i = 0; i < PendingDispatchColumnKeys.length; i++) {
						
						var bObj	= PendingDispatchColumnConfig[PendingDispatchColumnKeys[i]];
						
						if (bObj.show == true) {
							PendingDispatchConfig[PendingDispatchColumnKeys[i]] = bObj;
						}
					}
					
					response.PendingDispatch.columnConfiguration	= PendingDispatchConfig;
					response.PendingDispatch.Language				= masterLangKeySet;
				}
			}
			
			if(response.PendingDelivery != undefined) {
				var PendingDeliveryColumnConfig = response.PendingDelivery.columnConfiguration;
				var PendingDeliveryColumnKeys	= _.keys(PendingDeliveryColumnConfig);
				var PendingDeliveryConfig		= new Object();
				
				for (var i = 0; i < PendingDeliveryColumnKeys.length; i++) {
					
					var bObj	= PendingDeliveryColumnConfig[PendingDeliveryColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingDeliveryConfig[PendingDeliveryColumnKeys[i]] = bObj;
					}
				}
			
				response.PendingDelivery.columnConfiguration	= PendingDeliveryConfig;
				response.PendingDelivery.Language				= masterLangKeySet;
			}

			if(response.PendingCrossing != undefined) {
				var PendingCrossingColumnConfig = response.PendingCrossing.columnConfiguration;
				var PendingCrossingColumnKeys	= _.keys(PendingCrossingColumnConfig);
				var PendingCrossingConfig		= new Object();
				
				for (var i = 0; i < PendingCrossingColumnKeys.length; i++) {
					
					var bObj	= PendingCrossingColumnConfig[PendingCrossingColumnKeys[i]];
					
					if (bObj.show == true) {
						PendingCrossingConfig[PendingCrossingColumnKeys[i]] = bObj;
					}
				}
				
				response.PendingCrossing.columnConfiguration	= PendingCrossingConfig;
				response.PendingCrossing.Language				= masterLangKeySet;
			}
			
			if(response.ArrivedLRData != undefined) {
				var ArrivedLRColumnConfig 		= response.ArrivedLRData.columnConfiguration;
				var ArrivedLRColumnKeys			= _.keys(ArrivedLRColumnConfig);
				var ArrivedLRConfig				= new Object();
				
				for (var i = 0; i < ArrivedLRColumnKeys.length; i++) {
					
					var bObj	= ArrivedLRColumnConfig[ArrivedLRColumnKeys[i]];
					
					if (bObj.show == true) {
						ArrivedLRConfig[ArrivedLRColumnKeys[i]] = bObj;
					}
				}
				
				response.ArrivedLRData.columnConfiguration	= ArrivedLRConfig;
				response.ArrivedLRData.Language				= masterLangKeySet;
			}
			
			if(response.setSeparateGrid){
				var isDisplay = false;
				
				if(response.finalListForRayanPadu != undefined && response.finalListForRayanPadu.CorporateAccount != undefined) {
					$('#print_pendingDispatchDetails').hide();
					$("#pendingDispatchDiv").hide();
					$("#mailGodownStock").show();
					$('#print_pendingDispatchDetails2').show();
					$('#print_pendingDispatchDetails2').addClass('panel-body');
					$("#pendingDispatchDiv2").show();
					hideAllMessages();
					response.finalListForRayanPadu.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
					gridObject = slickGridWrapper2.setGrid(response.finalListForRayanPadu);
									
					if(response.routeSize > 0)
						slickGridWrapper2.setAggregateFunction(gridObject, "destinationSubRegionName");
					
					isDisplay	= true;
				} else {
					$('#print_pendingDispatchDetails').hide();
					$("#pendingDispatchDiv2").hide();
				}
				
				if(response.finalListForsagarRoad != undefined && response.finalListForsagarRoad.CorporateAccount != undefined) {
					$('#print_pendingDispatchDetails').hide();
					$("#pendingDispatchDiv").hide();
					$("#mailGodownStock").show();
					$('#print_pendingDispatchDetails3').show();
					$('#print_pendingDispatchDetails3').addClass('panel-body');
					$("#pendingDispatchDiv3").show();
					hideAllMessages();
					response.finalListForsagarRoad.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
					gridObject = slickGridWrapper2.setGrid(response.finalListForsagarRoad);
					
					if(response.routeSize > 0)
						slickGridWrapper2.setAggregateFunction(gridObject, "destinationSubRegionName");
					
					isDisplay	= true;
				} else {
					$('#print_pendingDispatchDetails').hide();
					$("#pendingDispatchDiv3").hide();
				}
				
				if(isDisplay) {
					$('#pendingDispatch').show();
					$("#myDiv").show();
				} else {
					$('#pendingDispatch').hide();
					$("#myDiv").hide();
				}
			} else{
				if(response.PendingDispatch != undefined && response.PendingDispatch.CorporateAccount != undefined) {
					$('#pendingDispatch').show();
					$('#print_pendingDispatchDetails').show();
					$("#pendingDispatchDiv").show();
					$("#myDiv").hide();
					hideAllMessages();
					response.PendingDispatch.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
					gridObject = slickGridWrapper2.setGrid(response.PendingDispatch);
									
					if(response.routeSize > 0) {
						slickGridWrapper2.setAggregateFunction(gridObject,"routeId");
					}
				} else {
					$('#pendingDispatch').hide();
					$('#print_pendingDispatchDetails').hide();
					$("#pendingDispatchDiv").hide();
				}
			}
			
			
			if(response.PendingDelivery != undefined && response.PendingDelivery.CorporateAccount != undefined) {
				$('#pendingDelivery').show();
				$('#print_pendingDeliveryDetails').show();
				$("#pendingDeliveryDiv").show();
				hideAllMessages();
				response.PendingDelivery.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
				gridObject = slickGridWrapper2.setGrid(response.PendingDelivery);
			} else {
				$('#pendingDelivery').hide();
				$('#print_pendingDeliveryDetails').hide();
				$("#pendingDeliveryDiv").hide();
			}
			
			if(response.PendingCrossing != undefined && response.PendingCrossing.CorporateAccount != undefined) {
				$('#pendingCrossing').show();
				$('#print_pendingCrossingDetails').show();
				$("#pendingCrossingDiv").show();
				hideAllMessages();
				response.PendingCrossing.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
				gridObject = slickGridWrapper2.setGrid(response.PendingCrossing);
			} else {
				$('#pendingCrossing').hide();
				$('#print_pendingCrossingDetails').hide();
				$("#pendingCrossingDiv").hide();
			}
			
			if(response.ArrivedLRData != undefined && response.ArrivedLRData.CorporateAccount != undefined) {
				$('#arrivedLR').show();
				$('#print_arrivedLRDetails').show();
				$("#arrivedLRDiv").show();
				hideAllMessages();
				response.ArrivedLRData.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
				gridObject = slickGridWrapper2.setGrid(response.ArrivedLRData);
			} else {
				$('#arrivedLR').hide();
				$('#print_arrivedLRDetails').hide();
				$("#arrivedLRDiv").hide();
			}
			
			if(response.PendingStockOut != undefined && response.PendingStockOut.CorporateAccount != undefined) {
				$('#pendingStockOut').show();
				hideAllMessages();
				response.PendingStockOut.tableProperties.callBackFunctionForPartial = _this.getPendingLRDetailsForGodownStock;
				slickGridWrapper2.setGrid(response.PendingStockOut);
			} else {
				$('#pendingStockOut').hide();
			}			
			hideLayer();
		},onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();
			
			if(viewAllRecords)
				viewAll = $('#viewAllCheck').prop("checked");
			
			jsonObject["viewAll"] = viewAll;
			jsonObject["stockTypeId"] 		= $('#stockTypeEle_primary_key').val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/godownStockReportWS/getGodownStockDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, getPendingLRDetailsForGodownStock:function(grid, dataView, row) {
			let jsonObject = Selection.getElementData();
			
			if(dataView.getItem(row).pendingDispatchStockId != undefined && dataView.getItem(row).pendingDispatchStockId > 0)
				jsonObject["stockTypeId"] 	= 1;
			else if(dataView.getItem(row).truckArrivalDetailsId != undefined && dataView.getItem(row).truckArrivalDetailsId > 0)
				jsonObject["stockTypeId"] 	= 4;
			else if(dataView.getItem(row).godownId > 0)
				jsonObject["stockTypeId"] 	= 2;
			else if(dataView.getItem(row).pendingGoodUndeliveredStockId > 0)
				jsonObject["stockTypeId"] 	= 5;
			else
				jsonObject["stockTypeId"] 	= 3;
		
			jsonObject["destinationBranchId"] 	= dataView.getItem(row).destinationBranchId;
			jsonObject["godownId"] 				= dataView.getItem(row).godownId;
			jsonObject.sortByLastNumber 		= sortByLastNumber;

			if(viewAllRecords)
				viewAll = $('#viewAllCheck').prop("checked");
				
			jsonObject.viewAll 					= viewAll;			
		
			let object 			= new Object();
			object.elementValue = jsonObject;
			
			if(showGodownStockDetailsInSeparateTab) {
				hideLayer();

				localStorage.setItem("godownStockreportjsonObject", JSON.stringify(object));
				window.open("Reports.do?pageId=340&eventId=3&modulename=godownStockReportLRDetails&tab=4" , jsonObject["stockTypeId"] ,"_blank");
			} else {
				let btModal = new Backbone.BootstrapModal({
					content: new LRDetails(object),
					modalWidth : 90,
					title:'LR Details'
				}).open();
				object.btModal = btModal;
				new LRDetails(object)
				btModal.open();
			}
		}
	});
});