let LRDetailsData,
finalWaybillIdHm;
define([  
          PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
          ,PROJECT_IVUIRESOURCES+'/resources/js/report/collectionreport/allBranchWiseBkgDlyStockAmountReport/lrDetails.js'
		  ,'JsonUtility'
          ,'messageUtility'
          ,'nodvalidation'
          ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
          ,'focusnavigation'//import in require.config
          ],function(Selection, LRDetails) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', PrintHeaderModel;
	
	return Marionette.LayoutView.extend({
		initialize : function() {
			LRDetailsData = LRDetails;
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/allBranchWiseBkgDlyStockAmountReportWS/getAllBranchWiseBkgDlyStockAmountReportElement.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingRegisterReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
		
			$("#mainContent").load("/ivcargo/html/report/collectionreport/allBranchWiseBkgDlyStockAmountReport/allBranchWiseBkgDlyStockAmountReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
				}
				
				if(response.type) {
					$('#selectType').removeClass('hide');
					_this.setSelectType();
				}
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement			= $('#dateEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.branchElement			= $('#branchEle');

				response.elementConfiguration					= elementConfiguration;
				response.sourceAreaSelection					= true;
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
				
				$("#saveBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, setSelectType : function() {
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#typeEle").getInstance();
			
			let SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "LR WISE" },
			        { "selectTypeId":2, "selectTypeName": "AMOUNT WISE" },
			    ]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#typeEle").autocompleteCustom(autoSelectTypeName)
		}, onSubmit : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			jsonObject["searchType"] 			= $('#typeEle_primary_key').val();
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/allBranchWiseBkgDlyStockAmountReportWS/getAllBranchWiseBkgDlyStockAmountReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setReportData : function(response) {
			hideLayer();
			$('#dispatchtable tbody').empty();
			$('#dispatchtable thead').empty();
			$('#dispatchtable tfoot').empty();
			$('#allBranchWiseBkgDlyStockAmountReport').empty();	
					
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			let headerColumnArray		= new Array();
			let footerColumnarray		= new Array();
			let counter				= 0;
			
			let finalDataList 	= response.finalDataList;
			finalWaybillIdHm 	= response.finalWaybillIdHm;
			$('#bottom-border-boxshadow').removeClass('hide');
			
			headerColumnArray.push("<th colspan=2 class='textAlignCenter bgcolor'></th>")
			headerColumnArray.push("<th colspan=3 class='textAlignCenter'>Source Booking</th>")
			headerColumnArray.push("<th colspan=5 class='textAlignCenter'></th>")
			headerColumnArray.push("<tr style='background-color: #f2dede;' class='textAlignCenter'><th>Sr No</th><th>Branch Name</th><th>PAID</th><th>TOPAY</th><th>TBB</th><th>Other Branch <br>ToPay</th><th>Delivered</th><th>Pending Dly</th><th>Old ToPay<br> Pending Dly</th><th>Cash in Hand</th></tr>")
		
			for(let data of finalDataList) {
				let dataColumnArray		= new Array();
				dataColumnArray.push("<td class='textAlignCenter'>" + (++counter) + "</td>");
				dataColumnArray.push("<td class='textAlignLeft'><a style = 'cursor: pointer;' onclick='getLrDetails("+data.branchId+");'>" + data.branchName + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.paidAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.toPayAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.tbbAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.otherBranchToPayAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.deliveredToPayAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.pendingDlyToPayAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.oldToPayAmount + "</td>");
				dataColumnArray.push("<td class='textAlignRight'>" + data.cashAmount + "</td>");
					
				$('#dispatchtable tbody').append('<tr>' + dataColumnArray.join(' ') + '</tr>');
			}
			
			footerColumnarray.push("<td class='tfoot textAlignRight'></td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>Total</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalPaidAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalToPayAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalTbbAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalOtherTopayAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalToPayDlyAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalPendingOldTopayAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalOldTopayAmt) +"</td>");
			footerColumnarray.push("<td class='tfoot textAlignRight'>"+ Math.round(response.totalCashAmt) +"</td>");
			
			$('#dispatchtable thead').append('<tr class="danger">' + headerColumnArray.join(' ') + '</tr>');
			$('#dispatchtable tfoot').append('<tr class="textAlignCenter">' + footerColumnarray.join(' ') + '</tr>');
			
			PrintHeaderModel 	= response.PrintHeaderModel;
			
			let data = new Object();
			data.accountGroupNameForPrint	= PrintHeaderModel.accountGroupName;
			data.branchAddress				= PrintHeaderModel.branchAddress;
			data.branchPhoneNumber			= PrintHeaderModel.branchPhoneNumber;
			data.isLaserPrintAllow			= 'true';
			data.isPlainPrintAllow			= 'true';
			data.isExcelButtonDisplay		= 'false';
			data.showFromAndToDateInReportData		= true;
			printTable(data, 'reportData', 'allBranchWiseBkgDlyStockAmountReport', 'All Branch Wise Booking Delivery Stock Report', 'allBranchWiseBkgDlyStockAmountReport');
			
			hideLayer();
		}
	});
});

function getLrDetails(branchId) {
	let jsonObject = new Object();
	
	jsonObject["wayBillIds"] 	= finalWaybillIdHm[branchId];

	let object 			= new Object();
	object.elementValue = jsonObject;

	let btModal = new Backbone.BootstrapModal({
		content: new LRDetailsData(object),
		modalWidth : 70,
		title:'LR Details'

	}).open();
	object.btModal = btModal;
	new LRDetailsData(object)
	btModal.open();
}