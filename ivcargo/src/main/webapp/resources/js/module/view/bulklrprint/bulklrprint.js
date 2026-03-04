define([  
	'slickGridWrapper3'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,'JsonUtility'
	,'messageUtility'
	,'nodvalidation'
	,'focusnavigation'//import in require.config
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'

	],function(slickGridWrapper3, Selection) {	
	'use strict';
	var jsonObject = new Object(),myNod,_this = '', isAllowFocusOnLrNumberFeild, childwin, appendDataInGrid = false;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bulkLrPrintWS/loadBulkLrPrint.do?',_this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails : function(response) {
			var loadelement = new Array();
			var baseHtml 	= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/bulklrprint/bulklrprint.html", function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				var keyObject = Object.keys(response);
				
				for (var i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				var elementConfiguration	= new Object();

				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration			= elementConfiguration;
				response.isCalenderSelection			= true;
				response.sourceAreaSelection			= true;
				response.isPhysicalBranchesShow			= true;
				response.AllOptionsForRegion  	 		= false;
				response.AllOptionsForSubRegion  		= false;
				response.AllOptionsForBranch 	 		= false;

				Selection.setSelectionToGetData(response);

				hideLayer();

				myNod = Selection.setNodElementForValidation(response);
				
				appendDataInGrid = !(response.showLrNumberRangeFields == true || response.showLrNumberRangeFields == 'true');
				
				if(response.showLrNumberRangeFields) {
					$("#lrNumberEleDiv").addClass("hide");
					$("#lrNumberFromEleDiv, #lrNumberToEleDiv").removeClass("hide");
				}

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid')) {
						if(response.showLrNumberRangeFields && !_this.validateLRNumberRange())
							return;
						
						_this.findBulkLrPrintData();	
					}							
				});
				
				$("#lrNumberEle").bind("blur", function() {
					var lrNumber	= $('#lrNumberEle').val();

					if(lrNumber != null && lrNumber.length > 0) {
						isAllowFocusOnLrNumberFeild = true;
						_this.findBulkLrPrintData();
					} else {
						$('#lrNumberEle').focus();
						showAlertMessage('error', "Please Enter LR Number !");
						return false;
					}
				});
				
				$("#printBtn").click(function() {
					_this.submitDataFromGrid();								
				});
				
				$("#resetBtn").click(function() {
					_this.resetDataFromGrid();								
				});
			});
		}, findBulkLrPrintData : function() {
			showLayer();

			var jsonObject = Selection.getElementData();

			jsonObject["wayBillNumber"] = $('#lrNumberEle').val();
			jsonObject["fromRange"] 	= $("#lrNumberFromEle").val();
			jsonObject["toRange"] 		= $("#lrNumberToEle").val();

			getJSON(jsonObject, WEB_SERVICE_URL+'/bulkLrPrintWS/bulkLrprintDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
      if(response.showLrNumberRangeFields)
			$("#bulkLrPrintDiv").empty();
			
			if(response.message != undefined) {
				$('#middle-border-boxshadow').hide();
				$('#bulkLrPrintDiv').hide();
				hideLayer();
				return;
			}


			$('#middle-border-boxshadow').hide();

			if(response.CorporateAccount != undefined && response.CorporateAccount.length > 0) {
				hideLayer();

				$('#middle-border-boxshadow').show();
				$('#bottom-border-boxshadow').removeClass('hide');
				$('#printBtn').removeClass('hide');
				$('#bulkLrPrintDiv').show();
				$('#lrNumberEle').val("");
				
				if(slickGridWrapper3.checkToAddRowInTable({InnerSlickId : 'editReportDivInner'}, response.CorporateAccount, 'wayBillId')) {
					showAlertMessage('error','LR already added.');
					return false;
				}
					
				if(isAllowFocusOnLrNumberFeild)
					$('#lrNumberEle').focus();

				slickGridWrapper3.applyGrid({
					ColumnHead					: response.columnConfigurationList, // *compulsory // for table headers
					ColumnData					: _.values(response.CorporateAccount), 	// *compulsory // for table's data
					ShowPrintButton				: false,
					ShowCheckBox				: true,
					removeSelectAllCheckBox		: 'false',
					fullTableHeight				: false,
					rowHeight 					: 30,
					DivId						: 'bulkLrPrintDiv',				// *compulsary field // division id where slickgrid table has to be created
					InnerSlickId				: 'editReportDivInner',
					SerialNo:[{						// optional field // for showing Row number
						showSerialNo	: true,
						searchFilter	: true,          // for search filter on serial no
						ListFilter		: true				// for list filter on serial no
					}],
					InnerSlickHeight			: '350px',
					NoVerticalScrollBar			: false, //optional for no vertical scrolling & if set true remove height attribute to Grid Div
					ShowPartialButton	        : false,
					PersistGridToAppend			: appendDataInGrid,
					CallBackFunctionForPartial	: _this.getLsDetails
				});
			}

			hideLayer();
		}, submitDataFromGrid : function () {
			var selectionMsg	= 'Please provide atleast one LR !';

			let selectedGridObject = slickGridWrapper3.getValueForSelectedData({InnerSlickId : 'editReportDivInner'}, selectionMsg);
			
			if(selectedGridObject != undefined && selectedGridObject.length > 70) {
				showAlertMessage('error', 'Please Select Up to 70 LRs Only !');
				return;
			}
			
			if(selectedGridObject != undefined) {
				if(selectedGridObject.length <= 0) {
					showAlertMessage('error', selectionMsg);
					return;
				}
				
				var btModalConfirm = new Backbone.BootstrapModal({
					content		: 	"Do you want To Print of Selected LR'S ?  ",
					modalWidth 	: 	30,
					title		:	'LR Print',
					okText		:	'YES',
					showFooter 	: 	true,
					okCloses	:	true
				}).open();
				
				hideLayer();
				
				btModalConfirm.on('ok', function() {
					var array	 	= new Array();
					
					showLayer();
					
					for(var i = 0; i < selectedGridObject.length; i++) {
						array.push(selectedGridObject[i].wayBillId);
					}

					localStorage.setItem("wayBillids", array.join(','));
					childwin = window.open("printWayBill.do?pageId=340&eventId=10&modulename=multiLrPrint&masterid=","newwin","width=800,height=800");
					
					hideLayer();
				});	
			}
		}, resetDataFromGrid : function () {
			setTimeout(() => {
				location.reload();	
			}, 1000);
		}, validateLRNumberRange : function() {
			let fromVal = parseInt($("#lrNumberFromEle").val(), 10);
			let toVal 	= parseInt($("#lrNumberToEle").val(), 10);
			
			if(isNaN(fromVal) || isNaN(toVal)) {
				showAlertMessage('error', "From and To Range Must Be Numbers !");
				return false;
			}
			
			if(fromVal <= 0 || toVal <= 0) {
				showAlertMessage('error', "From and To Range Cannot Be Negative Or Zero !");
				return false;
			}
			
			if(toVal <= fromVal) {
				showAlertMessage('error', "To Range Cannot Be Less Or Equal To From Range !");
				return false;
			}
			
			if(toVal - fromVal > 30) {
				showAlertMessage('error', "Cannot Print More Than 30 LR's");
				return false;
			}
			
			return true;
		}
	});
});