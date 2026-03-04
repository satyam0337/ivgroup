define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
	'JsonUtility',
	'messageUtility',
	'bootstrapSwitch',
	'nodvalidation',
	'focusnavigation',
	'selectizewrapper',
	PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), 
	myNod, 
	_this, 
	branch,
	accountGroup;
	let showPaidAmountColumn;
	let showTopayAmountColumn;
	let showTBBAmountColumn;
	let showAllCharges;

	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mergedGroupStatementReportWS/getMergedGroupStatementReportElement.do?',_this.setReportsElements, EXECUTE_WITH_ERROR);
			return _this;
		}, setReportsElements : function(response) {
			let loadelement			= new Array();
			let baseHtml			= new $.Deferred();
			branch					= response.branch;
			accountGroup			= response.accountGroup;
			showPaidAmountColumn	= response.showPaidAmountColumn;
			showTopayAmountColumn	= response.showTopayAmountColumn;
			showTBBAmountColumn		= response.showTBBAmountColumn;
			showAllCharges			= response.showAllCharges;

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/mergedgroupstatementreport/mergedGroupStatementReport.html",function() {
				baseHtml.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				
				if(!showPaidAmountColumn) $('.paidTh').remove();
				if(!showTopayAmountColumn) $('.toPayTh').remove();
				if(!showTBBAmountColumn) $('.tbbTh').remove();
				if(showAllCharges) $('.freightTh').remove();

				_this.setTxnType();

				let elementConfiguration			= new Object();
				elementConfiguration.dateElement	= $('#dateEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;

				Selection.setSelectionToGetData(response);

				myNod = nod();
				myNod.configure({
					parentClass:'validation-message'
				});
				
				myNod.add({
					selector		: '#accountGroupEle',
					validate		: 'validateAutocomplete:#accountGroupEle_primary_key',
					errorMessage	: 'Please Select Group'
				});
				
				myNod.add({
					selector		: '#txnTypeEle',
					validate		: 'validateAutocomplete:#txnTypeEle_primary_key',
					errorMessage	: 'Please Select Transaction Type'
				});

				getJSON(jsonObject, WEB_SERVICE_URL	+ '/mergedGroupStatementReportWS/getAllAssignedAccountGroupByConfigAccountGroup.do?',	_this.setAccountGroup, EXECUTE_WITHOUT_ERROR);

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if(myNod.areAll('valid'))
						_this.onSubmit(_this);								
				});
			});
		}, setAccountGroup : function(response) {
			_this.setAccountGroupAutocompleteInstance();

			let accountgroup = $("#accountGroupEle").getInstance();

			$(accountgroup).each(function() {
				this.option.source = response.accountGroupNetworkConfigurationsList;
			})
		},setTxnType : function() {
			_this.setTxnTypeAutocompleteInstance();

			let txnType = $("#txnTypeEle").getInstance();

			let txnTypeObj = [
				{ "txnTypeId":1, "txnTypeName": "INCOMING" },
				{ "txnTypeId":2, "txnTypeName": "OUTGOING" },
			]

			$(txnType).each(function() {
				this.option.source = txnTypeObj;
			})

		}, setAccountGroupAutocompleteInstance : function() {
			let accountGroupListArr	= new Object();

			accountGroupListArr.primary_key		= 'assignBranchAccountGroupId';
			accountGroupListArr.field			= 'assignedAccountGroupName';

			$("#accountGroupEle").autocompleteCustom(accountGroupListArr)

		}, setTxnTypeAutocompleteInstance : function() {
			let txnTypeOptions			= new Object();
			txnTypeOptions.primary_key	= 'txnTypeId';
			txnTypeOptions.field		= 'txnTypeName';

			$("#txnTypeEle").autocompleteCustom(txnTypeOptions)
		}, onSubmit : function() {
			showLayer();

			let jsonObject = new Object();

			if($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate'); 

			if($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 

			jsonObject["assignedAccountGroupId"]	= $('#accountGroupEle_primary_key').val();
			jsonObject["txnTypeId"]					= $('#txnTypeEle_primary_key').val()
			getJSON(jsonObject, WEB_SERVICE_URL+'/mergedGroupStatementReportWS/getMergedGroupStatementReportData.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			$("#mergedGroupStatementReportDiv").empty();
			$("#printCrossingDetails").empty();
			$("#mergedGroupStatementCancellationDetails").empty();

			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');
				$('#left-border-boxshadow').addClass('hide');
				return;
			}

			if(response.mergedGroupStatementBookingDetailsList != undefined && response.mergedGroupStatementBookingDetailsList.CorporateAccount != undefined) {
				$('#middle-border-boxshadow').removeClass('hide');
				hideAllMessages();
				let bookingChargesNameHM	=	response.chargesNameHM

				if(bookingChargesNameHM != undefined) {
					for(const element of response.mergedGroupStatementBookingDetailsList.CorporateAccount) {
						let obj			= element;
						let chargesMap	= obj.chargesCollection;
						
						for(let chargeId in bookingChargesNameHM) {
							let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
						}
					}
				}
				
				slickGridWrapper2.setGrid(response.mergedGroupStatementBookingDetailsList);
			} else {
				$('#middle-border-boxshadow').addClass('hide');
			}

			$('#mergedGroupStatementCancellationDetails').empty();
			$('#mergedGroupStatementCrossingDetails').empty();
			
			if(response.mergedGroupStatementCancellationDetailsList != undefined && response.mergedGroupStatementCancellationDetailsList.length > 0) {
				let cancelChargesHm = response.cancelChargesHm; 

				$('#bottom-border-boxshadow').removeClass('hide');
				
				let mergedGroupStatementCancellationDetailsList	= response.mergedGroupStatementCancellationDetailsList;

				let columnArray		= new Array();

				for (let i = 0; i < mergedGroupStatementCancellationDetailsList.length; i++) {
					
					let obj		= mergedGroupStatementCancellationDetailsList[i];
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'><a style='cursor:pointer;'id='wayBillId_" + obj.wayBillId + "'><b style='font-size: 14px'>"+obj.wayBillNumber+"</b></a></td>");	
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.bookingDateTimeStampString) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.sourceBranch) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.destinationBranch) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.wayBillType) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.consignmentQuantity) + "</td>");

					if(showPaidAmountColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.paidTotal) + "</td>");
					
					if(showTopayAmountColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.toPayTotal) + "</td>");
					
					if(showTBBAmountColumn)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.tbbTotal) + "</td>");

					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.statusString) + "</td>");
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.cancellationDateTimeString) + "</td>");

					if(!showAllCharges)
						columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.freight) + "</td>");
					
					columnArray.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.commission) + "</td>");
				
					if(showAllCharges) {
						if(cancelChargesHm != undefined) {
							let charges = obj.chargesCollection;
							
							$("#cancellationDetailsTable thead tr .chargeHeader").remove();
	
							for(let element in cancelChargesHm) {
 								let chargeAmt = charges[element] != undefined ? charges[element] : 0;
 								columnArray.push("<td style='text-align: center; vertical-align: middle; id='charge_" + element + "' value='"+ chargeAmt+"'>" + (chargeAmt) + "</td>");
								let chargeName = cancelChargesHm[element].replace(/[' ',.,/]/g, ""); 
								$("#cancellationDetailsTable thead tr").append(
								 `<th style="width: 8%; text-align: center;" class="chargeHeader">${chargeName}</th>`
								);
							}
						}
					}
					
					$('#cancellationDetailsTable tbody').append('<tr id="mergedGroupStatementCancellationDetails_'+ obj.bookingWayBillTxnId +'">' + columnArray.join(' ') + '</tr>');
					
					$("#wayBillId_" + obj.wayBillId).bind("click", function() {
						let elementId				= $(this).attr('id');
						let wayBillId				= elementId.split('_')[1];
						
						if(wayBillId != undefined) {
							window.open('SearchWayBillAction.do?pageId=5&eventId=3&wayBillId=' + wayBillId + '&NumberType=' + LR_SEARCH_TYPE_ID + '&BranchId=0');
						} 
					});
					
					columnArray	= [];
				}
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}
			
			if(response.finalMergedGroupStatementCrosssingDetailsList != undefined && response.finalMergedGroupStatementCrosssingDetailsList.length > 0) {
				let totalNoOfArticle = 0;
				let totalPaidAmount = 0;
				let totalToPayAmount = 0;
				let totalTBBAmount = 0;
				let freightTotal = 0;
				let commissionTotal = 0;
				
				$('#left-border-boxshadow').removeClass('hide');
				let crossingChargesHm = response.crossingChargesHm; 

				let finalMergedGroupStatementCrosssingDetailsList	= response.finalMergedGroupStatementCrosssingDetailsList;
				
				let columnArray1		= new Array();

				for (let i = 0; i < finalMergedGroupStatementCrosssingDetailsList.length; i++) {
					let obj		= finalMergedGroupStatementCrosssingDetailsList[i];
					
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (i + 1) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'><b style='font-size: 14px'>" + obj.wayBillNumber + "</b></td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.bookingDateTimeStampString) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.sourceBranch) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.destinationBranch) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.wayBillType) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.consignmentQuantity) + "</td>");
					
					if(showPaidAmountColumn)
						columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.paidTotal) + "</td>");
					
					if(showTopayAmountColumn)	
						columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.toPayTotal) + "</td>");
					
					if(showTBBAmountColumn)	
						columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.tbbTotal) + "</td>");
						
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.statusString) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.tripDateTimeStr) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.vehicleNumber) + "</td>");
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.deliveryDateTimeString) + "</td>");
						  
					if(!showAllCharges)
						columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.freight) + "</td>");
					
					columnArray1.push("<td style='text-align: center; vertical-align: middle;'>" + (obj.commission) + "</td>");
					
					if(showAllCharges && crossingChargesHm != undefined) {
						let charges = obj.chargesCollection;
						
						$("#crossingDetailsTable thead tr .chargeHeader").remove();

						for(let element in crossingChargesHm) {
							let chargeAmt = charges[element] ;
							columnArray1.push("<td style='text-align: center; vertical-align: middle; id='charge_" + element + "'>" + (chargeAmt) + "</td>");
							let chargeName = cancelChargesHm[element].replace(/[' ',.,/]/g, "");
							$("#cancellationDetailsTable thead tr").append(
							`<th style="width: 8%; text-align: center;" class="chargeHeader">${chargeName}</th>`
							);
						}
					}
					
					$('#crossingDetailsTable tbody').append('<tr id="mergedGroupStatementCrossingDetails_'+ obj.bookingWayBillTxnId +'">' + columnArray1.join(' ') + '</tr>');
					
					totalNoOfArticle	+= obj.consignmentQuantity;
					totalPaidAmount		+= obj.paidTotal;
					totalToPayAmount	+= obj.toPayTotal;
					totalTBBAmount		+= obj.tbbTotal;
					freightTotal		+= obj.freight;
					commissionTotal		+= obj.commission;
					columnArray1	= [];
				}
				
				$("#totalNoOfArticle").html(totalNoOfArticle);
				$("#totalPaidAmount").html(totalPaidAmount);
				$("#totalToPayAmount").html(totalToPayAmount);
				$("#totalTBBAmount").html(totalTBBAmount);
				$("#freightTotal").html(freightTotal);
				$("#commissionTotal").html(commissionTotal);
			}else{
				$('#left-border-boxshadow').addClass('hide');
			}
			
			hideLayer();
			let data = new Object();
			data.accountGroupNameForPrint	= accountGroup.accountGroupDescription;
			data.branchAddress				= branch.branchAddress;
			data.branchPhoneNumber			= branch.branchContactDetailPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'false';
			data.isExcelButtonDisplay		= 'true';
			data.isPdfButtonDisplay			= 'false';
			printTable(data, 'reportData', 'printCrossingDetails', 'Crossing Details', 'printCrossingDetails');
		}
	});
});
