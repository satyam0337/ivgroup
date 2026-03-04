define([  
		'slickGridWrapper2'
		,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
		,'JsonUtility'
		,'messageUtility'
		,'autocomplete'
		,'autocompleteWrapper'
		,'nodvalidation'
		,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
		,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
		,'focusnavigation'//import in require.config
          ],function(slickGridWrapper2, Selection) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '';
	return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
		},render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/bookingAndTrackingReportWS/getbookingAndTrackingReportElement.do?',	_this.setBookingAndTrackingReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setBookingAndTrackingReportsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/module/bookingAndTrackingReport/BookingAndTrackingReport.html",function() {
				baseHtml.resolve();
			});
		
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);

				for (let i = 0; i < keyObject.length; i++) {
					if (response[keyObject[i]])
						$("*[data-attribute="+ keyObject[i]+ "]").removeClass("hide");
				}
				
				_this.setSelectType();				
				
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				response.sourceAreaSelection		= true;

				$('#downloadExcel').removeClass('hide');

				if(!response.dataFromDRServer)
					$("#note").hide();
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
				
				hideLayer();
			
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});

				$("#downloadExcel").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.setExcelData();								
				});
			});
			
		},setReportData : function(response) {
			if(response.message != undefined) {
				hideLayer();
				$('#middle-border-boxshadow').addClass('hide');
				$('#bottom-border-boxshadow').addClass('hide');

				let errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}

			$("#bookedLRsDiv").empty();
			$("#bookedSummaryDiv").empty();
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			let bookingChargesNameHM	= response.chargesNameHM;
				
			if(bookingChargesNameHM != undefined) {
				for(const obj of response.BookedBookingAndTracking.CorporateAccount) {
					let chargesMap	= obj.bookingCharges;
						
					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
							
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? Math.round(chargesMap[chargeId]) : 0) : 0;
					}
				}
			}
			
			let gridObject	= slickGridWrapper2.setGrid(response.BookedBookingAndTracking);
			_this.cancelLRColour(gridObject);

			if(response.AutoManaulSummary != undefined) {
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();

				let table = $('<table class="table table-bordered" />'); 
				let totalPaid		= 0;
				let totalTopay		= 0;
				let totalTBB		= 0;
				let totalFreight	= 0;
				let totalGST		= 0;
				let grandTotal		= 0;

				for (let i = 0; i < response.AutoManaulSummary.length; i++){
					if(i == 0) {
						let tr 	=  $('<tr class="info"/>'); 

						let th1 	=  $('<th/>');
						let th2 	=  $('<th/>');
						let th3 	=  $('<th/>');
						let th4 	=  $('<th/>');
						let th5 	=  $('<th/>');
						let th6 	=  $('<th/>');
						let th7 	=  $('<th/>');

						th1.append("Type");
						th2.append("Paid");
						th3.append("To Pay");
						th4.append("Billing");
						th5.append("Total Amount");
						th6.append("GST");
						th7.append("Grand Total");

						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);
						tr.append(th5);
						tr.append(th6);
						tr.append(th7);

						table.append(tr);
					} 
					let tr 	=  $('<tr/>'); 

					let td1 	=  $('<td/>');
					let td2 	=  $('<td/>');
					let td3 	=  $('<td/>');
					let td4 	=  $('<td/>');
					let td5 	=  $('<td/>');
					let td6 	=  $('<td/>');
					let td7 	=  $('<td/>');

					td1.append(response.AutoManaulSummary[i].wayBillType);
					td2.append(response.AutoManaulSummary[i].paid);
					td3.append(response.AutoManaulSummary[i].topay);
					td4.append(response.AutoManaulSummary[i].tbb);
					td5.append(response.AutoManaulSummary[i].totalFreight);
					td6.append(response.AutoManaulSummary[i].totalGST);
					td7.append(response.AutoManaulSummary[i].grandTotal);

					tr.append(td1);
					tr.append(td2);
					tr.append(td3);
					tr.append(td4);
					tr.append(td5);
					tr.append(td6);
					tr.append(td7);

					table.append(tr);

					totalPaid		+=	response.AutoManaulSummary[i].paid;
					totalTopay		+=	response.AutoManaulSummary[i].topay;
					totalTBB		+=	response.AutoManaulSummary[i].tbb;
					totalFreight	+=	response.AutoManaulSummary[i].totalFreight;
					totalGST		+=	response.AutoManaulSummary[i].totalGST;
					grandTotal		+=	response.AutoManaulSummary[i].grandTotal;

					if(i == (response.AutoManaulSummary.length - 1)) {
						let tr 	=  $('<tr class="info"/>');

						let th1 	=  $('<th/>');
						let th2 	=  $('<th/>');
						let th3 	=  $('<th/>');
						let th4 	=  $('<th/>');
						let th5 	=  $('<th/>');
						let th6 	=  $('<th/>');
						let th7 	=  $('<th/>');

						th1.append("Total");
						th2.append(totalPaid);
						th3.append(totalTopay);
						th4.append(totalTBB);
						th5.append(totalFreight);
						th6.append(totalGST);
						th7.append(grandTotal);

						tr.append(th1);
						tr.append(th2);
						tr.append(th3);
						tr.append(th4);
						tr.append(th5);
						tr.append(th6);
						tr.append(th7);

						table.append(tr);
					}
				}
				$('#bookedSummaryDiv').append(table);
			} else {
				$('#bottom-border-boxshadow').addClass('hide');
			}

			hideLayer();
		}, setExcelData : function() {
			showLayer();
			let jsonObject = Selection.getElementData();

			jsonObject["selectTypeId"] 		= $('#selectTypeEle_primary_key').val();
			jsonObject["isExcel"] 			= true;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingAndTrackingReportWS/getBookingAndTrackingReportDetails.do', _this.responseForExcel, EXECUTE_WITH_ERROR);
		}, onSubmit : function() {
			showLayer();
			let jsonObject	= Selection.getElementData();
			
			jsonObject["selectTypeId"] 		= $('#selectTypeEle_primary_key').val();
			jsonObject["isExcel"] 			= false;
			
			getJSON(jsonObject, WEB_SERVICE_URL+'/bookingAndTrackingReportWS/getBookingAndTrackingReportDetails.do', _this.setReportData, EXECUTE_WITH_ERROR);
		}, setSelectType : function() {
			_this.setSelectTypeAutocompleteInstance();
			
			let autoSelectType = $("#selectTypeEle").getInstance();
			
			let SelectTYPE = [
			        { "selectTypeId":1, "selectTypeName": "INCOMING" },
			        { "selectTypeId":2, "selectTypeName": "OUTGOING" },
			    ]
			
			$( autoSelectType ).each(function() {
				this.option.source = SelectTYPE;
			})
		}, setSelectTypeAutocompleteInstance : function() {
			let autoSelectTypeName 			= new Object();
			autoSelectTypeName.primary_key 	= 'selectTypeId';
			autoSelectTypeName.field 		= 'selectTypeName';

			$("#selectTypeEle").autocompleteCustom(autoSelectTypeName)
		}, cancelLRColour : function(gridObject){
			slickGridWrapper2.updateRowColor(gridObject,'billStatus',5,'highlight-row-onchange');
		}, responseForExcel : function(data) {
			let errorMessage = data.message;
			
        	showMessage(errorMessage.typeName, errorMessage.typeSymble + ' ' + errorMessage.description);
        	hideLayer();

			if(errorMessage.messageId == 21 || errorMessage.messageId == 491)
				return false;
				
			generateFileToDownload(data);
		}
	});
});