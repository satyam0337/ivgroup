define([
	'slickGridWrapper2'
	,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
	,PROJECT_IVUIRESOURCES+'/resources/js/module/view/pendingbranchoperations/lrDetails.js'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
	],function(slickGridWrapper2, Selection, LRDetails) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', gridObject,childwin, showPendingDetailsInSeparateTab = false, selectedFromDate, selectedToDate;
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			showLayer();
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/pendingBranchOperationsWS/loadPendingBranchOperationsElement.do?', _this.renderPendingBranchOperationsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, renderPendingBranchOperationsElements : function(response){
			let loadelement = new Array();
			let baseHtml	= new $.Deferred();
			let executive	= response.executive;
			let branchId	= executive.branchId;
			
			showPendingDetailsInSeparateTab = response.showPendingDetailsInSeparateTab;
			
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/module/pendingbranchoperations/PendingBranchOperations.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				if(response.messageForPendingData) {
					$('#marqueeMessage').removeClass('hide');
					$('#marqueeMessage').text(response.messageForPendingData);
				} else
					$('#pendingMarquee').remove();
					
				response.isCalenderSelection = response.allowSearchByDateOption;
				
				let elementConfiguration	= new Object();

				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration	= elementConfiguration;
				
				let options		= new Object();
				options.minDate	= response.minDateForPendingData;
				
				response.options = options;
				
				if(response.showSearchBySelection)
					$("#showSearchBySelectionDiv").removeClass('hide');
				   
				if(response.sourceAreaSelection) {
					$('#selectionDiv').removeClass('hide');
					$('#buttonDiv').removeClass('hide');
					Selection.setSelectionToGetData(response);
				} else if(response.allowSearchByDateOption) {
					$('#selectionDiv').remove();
					$('#buttonDiv').removeClass('hide');
					Selection.setSelectionToGetData(response);
				} else
					$('#ElementDiv').remove();
				
				hideLayer();
				
				if(!response.allowSearchByDateOption)
					$('#dateRangeDiv').remove();
				
				$("#dateCheckEle").click(function() {
					if ($('#dateCheckEle').prop('checked'))
						$("#dateSelection").removeClass('hide');
					else
						$("#dateSelection").addClass('hide');
				});
				
				if(response.sourceAreaSelection) {
					myNod = Selection.setNodElementForValidation(response);
					
					$("#findBtn").click(function() {
						myNod.performCheck();
						
						if(myNod.areAll('valid'))
							_this.onSubmit();								
					});
				} else if(branchId > 0 && response.showDirectPendingData) {
					$('#details').remove();
					_this.onSubmit();
					
					$("#findBtn").click(function() {
						_this.onSubmit();								
					});							
				} else {
					$("#findBtn").click(function() {
						_this.onSubmit();								
					});
				}
			  	
				$("input[name='amountWise']").change(function() {
					_this.onSubmit();
				});
			});
		}, onSubmit : function() {
			showLayer();
			
			let jsonObject = Selection.getElementData();
			
			jsonObject["dateWise"]		= $('#dateCheckEle').prop('checked');
			jsonObject["amountWise"]	= $("#amountWise").is(":checked");

			selectedFromDate		= jsonObject["fromDate"];
			selectedToDate			= jsonObject["toDate"];
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/pendingBranchOperationsWS/getPendingBranchOperationsDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			if(response.CorporateAccount != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				gridObject = slickGridWrapper2.setGrid(response);
			}

			gridObject.onClick.subscribe(function (e, args){
				let cell		= gridObject.getCellFromEvent(e)
				let row			= cell.row;
				let dataView	= gridObject.getData();
				let item		= dataView.getItem(row);
				let gridObj		= args.grid;
				let id			= gridObj.getColumns()[cell.cell].id;

				if(id == 'pendingDispatchTotalLr' && item.pendingDispatchTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 1, item.sourceBranch);
				else if (id == 'pendingReceiveTotalLr' && item.pendingReceiveTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 2, item.sourceBranch);
				else if (id == 'pendingDeliveryTotalLr' && item.pendingDeliveryTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 3, item.sourceBranch);
				else if (id == 'pendingDoorDeliveryLr' && item.pendingDoorDeliveryLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 4, item.sourceBranch);
				else if (id == 'pendingCreditWayBillTxnAmt' && item.pendingCreditWayBillTxnAmt > 0)
					_this.setOutStandingdetails(item.sourceBranchId, item.sourceBranch, response.fromDate);
				else if (id == 'lrBookedNotDispatched' && item.lrBookedNotDispatched > 0) 
					_this.getPendingLRDetails(item.sourceBranchId, 5, item.sourceBranch);
				else if (id == 'pendingReceivePickupTotalLr' && item.pendingReceivePickupTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 7, item.sourceBranch);
				else if (id == 'pendingPODUploadTotalLr' && item.pendingPODUploadTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 8, item.sourceBranch);
				else if (id == 'pendingPODDispatchTotalLr' && item.pendingPODDispatchTotalLr > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 9, item.sourceBranch);
				else if (id == 'pendingSTBSBillAmt' && item.pendingSTBSBillAmt > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 10, item.sourceBranch);
				else if (id == 'pendingFundReceive' && item.pendingFundReceive > 0)
					_this.getPendingLRDetails(item.sourceBranchId, 11, item.sourceBranch);
			});
		}, getPendingLRDetails : function(sourceBranchId, filter, sourceBranchName) {
			let jsonObject = new Object();

			jsonObject["sourceBranchId"]	= sourceBranchId;
			jsonObject["filter"]			= filter;
			jsonObject["sourceBranchName"]	= sourceBranchName;
			jsonObject["dateWise"]			= $('#dateCheckEle').prop('checked');
			jsonObject["fromDate"]			= selectedFromDate;
			jsonObject["toDate"]			= selectedToDate;
			
			if(showPendingDetailsInSeparateTab) {
				localStorage.setItem("PendingBranchOperationsJsonObject", JSON.stringify(jsonObject));
				window.open("Reports.do?pageId=340&eventId=3&modulename=pendingBranchOperationsDetails&tab=" + filter, "_blank");
			} else {
				let object			= new Object();
				object.elementValue = jsonObject;
				object.gridObj		= gridObject;
				
				let inBranch	= 'In ' + sourceBranchName;
			
				let titleMap = {
					1: 'Pending Dispatch LR Details ' + inBranch,
					2: 'Pending Receive LR Details ' + inBranch,
					3: 'Pending Delivery LR Details ' + inBranch,
					4: 'Pending DDM Settlement Details ' + inBranch,
					5: 'Pending LR Booked But Not Dispatch Details ' + inBranch,
					7: 'Pending Receive Pickup LR Details ' + inBranch,
					8: 'Pending POD Upload LR Details ' + inBranch,
					9: 'Pending POD Dispatch LR Details ' + inBranch,
					10: 'Pending STBS Bill Details ' + inBranch,
					11: 'Pending Fund Receive Details ' + inBranch
				};

				let titleText = titleMap[filter] || 'Pending LR Details';

				let btModal = new Backbone.BootstrapModal({
					content: new LRDetails(object),
					modalWidth: 70,
					modalHeight: 160,
					title: titleText
				}).open();

				object.btModal = btModal;
				new LRDetails(object)
				btModal.open();
			}	
		}, setOutStandingdetails : function(sourceBranchId, sourceBranchName, fromDate) {
			let jsonObj = new Object();
			jsonObj["sourceBranchId"]			= sourceBranchId;
			jsonObj["sourceBranchName"]			= sourceBranchName;
			jsonObj["isFromPendingBellIcon"]	= true;	
			
			
			if($('#dateCheckEle').prop('checked')) {
				jsonObj["fromDate"]			= selectedFromDate;
				jsonObj["toDate"]			= selectedToDate;
			} else {
				jsonObj["fromDate"]				= fromDate;
				jsonObj["toDate"]				= getCurrrentDate();
			}

			localStorage.setItem("jsonObject", JSON.stringify(jsonObj));
			childwin = window.open("Reports.do?pageId=340&eventId=3&modulename=partyWiseShortCreditOutStanding&tab=5","_blank");
		}
	});
});
