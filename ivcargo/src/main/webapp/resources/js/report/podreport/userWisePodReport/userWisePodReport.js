define([
			'slickGridWrapper2'
			,PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js'
			,PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js'
			,PROJECT_IVUIRESOURCES+'/resources/js/report/podreport/userWisePodReport/userWisePodBranchReport.js'
			,'JsonUtility'
			,'messageUtility'
			,'autocomplete'
			,'autocompleteWrapper'
			,'nodvalidation'
			,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
			,PROJECT_IVUIRESOURCES +'/resources/js/datepicker/datepickerwrapper.js'//ModelUrls
			,'focusnavigation'//import in require.config
		], function(slickGridWrapper2, Selection, UrlParameter, UserWisePodBranchReport) {
	'use strict';
	let jsonObject = new Object(), myNod, _this = '', gridObject,showExecutiveSelection	= true, showPendingDetailsInSeparateTab = false, selectedFromDate = null,
	selectedToDate = null;
	return Marionette.LayoutView.extend({
		initialize : function() {
			
			_this = this;
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/userWisePodReportWS/getUserWisePodReportElementConfiguration.do?',	_this.setBookingRegisterReportsElements, EXECUTE_WITHOUT_ERROR);
			return _this;

		}, setBookingRegisterReportsElements : function(response) {
			let loadelement 			 	 = new Array();
			let baseHtml 					 = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/report/podreport/userWisePodReport/userWisePodReport.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				let keyObject = Object.keys(response);
				
				for (const element of keyObject) {
					if (response[element])
						$("*[data-attribute="+ element+ "]").removeClass("hide");
						
					if(element == 'executiveEle' && response[element])
						showExecutiveSelection	= true;
				}				

				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');
				elementConfiguration.regionElement		= $('#regionEle');
				elementConfiguration.subregionElement	= $('#subRegionEle');
				elementConfiguration.branchElement		= $('#branchEle');
				elementConfiguration.executiveElement	= $('#executiveEle');

				response.elementConfiguration		= elementConfiguration;
				
				if(showExecutiveSelection) {
					response.executiveListByBranch			= true;
					response.AllOptionsForExecutive			= true;
				} else
					$("#executiveEleSelection").remove();
				
				Selection.setSelectionToGetData(response);
				
				myNod = Selection.setNodElementForValidation(response);
						
				if(showExecutiveSelection) {
					addAutocompleteElementInNode(myNod, 'executiveEle', 'Select proper Executive !');
					$("*[data-attribute=executive]").find('label').append("<span data-attribute='red-color' style='color:red;font-size:20px;'>*</span>");
				}
				
				hideLayer();
				
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSubmit();								
				});
			});
		}, onSubmit : function() {
			showLayer();

			let jsonObject 		   	= Selection.getElementData();
			
			selectedFromDate		= jsonObject["fromDate"];
			selectedToDate			= jsonObject["toDate"];

			getJSON(jsonObject, WEB_SERVICE_URL	+ '/userWisePodReportWS/getUserWisePodReportData.do?',	_this.setPODWayBillDetailsData, EXECUTE_WITHOUT_ERROR);
		}, setPODWayBillDetailsData: function(response) {
			hideLayer();

			if (response.message != undefined || response.CorporateAccount == undefined) {
				$('#middle-border-boxshadow').addClass('hide');
				return;
			}
			
			$('#middle-border-boxshadow').removeClass('hide');
			
			let bookingChargesNameHM	= response.chargesNameHM;
			let wayBillChargeHm	= response.lrWiseChargesHm;
			
			if(bookingChargesNameHM != undefined) {
				for(const element of response.CorporateAccount) {
					let obj			= element;
					let chargesMap	= wayBillChargeHm[obj.wayBillId]
					
					for(let chargeId in bookingChargesNameHM) {
						let chargeName	= bookingChargesNameHM[chargeId].replace(/[' ',.,/]/g,"");
						
						obj[chargeName]	= chargesMap != undefined ? (chargesMap[chargeId] != undefined ? chargesMap[chargeId] : 0) : 0;
					}
				}
			}
			gridObject = slickGridWrapper2.setGrid(response);

			gridObject.onClick.subscribe(function (e, args){
				let cell 		= gridObject.getCellFromEvent(e)
				let row 		= cell.row;
				let dataView 	= gridObject.getData();
				let item 		= dataView.getItem(row);
				let id 			= gridObject.getColumns()[cell.cell].id;


				if(id == 'podBranchCount')
					_this.getPodBranchWiseLRDeatils(item);
			});					
		}, getPodBranchWiseLRDeatils : function(item) {
			let jsonObject = new Object();

			jsonObject["sourceBranchId"] 	= item.podBranchId;
			jsonObject["sourceBranchName"] 	= item.podBranchName;
			jsonObject["fromDate"]			= selectedFromDate;
			jsonObject["toDate"]			= selectedToDate;

			if(showPendingDetailsInSeparateTab) {
				localStorage.setItem("userWisePodBranchReportDetailsJsonObject", JSON.stringify(jsonObject));
				window.open("reports.do?pageId=340&eventId=3&modulename=userWisePodBranchReportDetailsJsonObject&tab=" + "_blank");
			} else {
				let object 			= new Object();
				object.elementValue = jsonObject;
				object.gridObj 		= gridObject;
			
				let btModal = new Backbone.BootstrapModal({
					content: new UserWisePodBranchReport(object),
					modalWidth : 70,
					modalHeight : 160,
					title : 'LR Wise Details'
				}).open();
						
				object.btModal = btModal;
				new UserWisePodBranchReport(object)
				btModal.open();
			}	
		}
	});
});