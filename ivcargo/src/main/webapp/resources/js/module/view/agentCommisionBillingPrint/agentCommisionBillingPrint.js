define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/agentCommisionBillingPrint/agentcommisionbillingview.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language',
	],
	function(UrlParameter, AgentCommisionBillingView) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	headerTopMargin	= 0,
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	pageCounterTwo,
	agentCommisionBillingPrintFlavor		= '',
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {

			jsonObject.agentCommisionBillingSummaryId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/agentCommissionBillingModuleWS/getAgentCommissionBillingDetailsForPrintById.do?', _this.setDispatchedPodLrDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		},setDispatchedPodLrDetails : function(response) {
			hideLayer();
			
			var tableData			= _this.getArrayForTableDetails(response.AgentCommisionBillingModel);
			var bookingtableData	= _this.getArrayForBookingTableDetails(response.agentCommissionBillingModalBkgArrList);
			var deliverytableData	= _this.getArrayForDeliveryTableDetails(response.agentCommissionBillingModalDlyArrList);
			var headerFooterData	= _this.getHeaderAndFooterObject(response.AgentCommisionBillingHeader);
			
			agentCommisionBillingPrintFlavor	= response.agentCommisionBillingPrintFlavor;
			
			require(['text!' + AgentCommisionBillingView.getConfiguration(response),
				AgentCommisionBillingView.getFilePathForLabel(response)], function(View, FilePath) {
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length / pageBreaker);
				pageCounterTwo	= (tableData.length / pageBreaker);
				
				if(pageCounterTwo > pageCounter)
					pageCounter = pageCounter + 1;
				
				var lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				
				if (pageCounter <= 0) {
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					
					AgentCommisionBillingView.setHeadersForPrint(headerFooterData, headerTopMargin);
					AgentCommisionBillingView.setInformationDivs(headerFooterData);
					
					tableData.push(lastItrObj);
					bookingtableData.push(lastItrObj);
					deliverytableData.push(lastItrObj);
					
					AgentCommisionBillingView.setDataTableDetails(tableData);
					AgentCommisionBillingView.setBookingDataTableDetails(bookingtableData);
					AgentCommisionBillingView.setDeliveryDataTableDetails(deliverytableData);
					AgentCommisionBillingView.setDataTableTotals(tableData, lastItrObj);

					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					AgentCommisionBillingView.setFooterDiv(headerFooterData);
				} else {
					var pageNumber = 0;
					
					for (var j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
						
						if (j + pageBreaker >= tableData.length || (j + pageBreaker >= bookingtableData.length) || (j + pageBreaker >= deliverytableData.length))
							lastItrObj.lastITR = true;
						
						var chunkArray 			= tableData.slice(j, j + pageBreaker);
						var bookingchunkArray 	= bookingtableData.slice(j, j + pageBreaker);
						var deliverychunkArray 	= deliverytableData.slice(j, j + pageBreaker);
						
						AgentCommisionBillingView.setHeadersForPrint(headerFooterData, headerTopMargin);
						AgentCommisionBillingView.setInformationDivs(headerFooterData);
						
						chunkArray.push(lastItrObj);
						bookingchunkArray.push(lastItrObj);
						deliverychunkArray.push(lastItrObj);
						
						AgentCommisionBillingView.setDataTableDetails(chunkArray);
						AgentCommisionBillingView.setBookingDataTableDetails(bookingchunkArray);
						AgentCommisionBillingView.setDeliveryDataTableDetails(deliverychunkArray);
						
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
						AgentCommisionBillingView.setDataTableTotals(tableData, lastItrObj);
					}
					
					AgentCommisionBillingView.setFooterDiv(headerFooterData);
				}
				
				let path	= '/ivcargo/resources/data/languages/module/agentCommisionBillingPrint/' + agentCommisionBillingPrintFlavor + '-en-GB.txt';
			
				if(!urlExists(path))
					agentCommisionBillingPrintFlavor	= 'agentCommisionBillingPrint';
				
				loadLanguageWithParams(FilePath.loadLanguage(agentCommisionBillingPrintFlavor));
			});
		}, getArrayForTableDetails : function(agentCommisionBillingModel) {
			var srNo		= 1;
			
			for (var j = 0; j < agentCommisionBillingModel.length; j++) {
				var dataObj	= agentCommisionBillingModel[j];

				dataObj.srNumber						= srNo;
				dataObj.lrNumber						= dataObj.wayBillNumber;
				dataObj.deliveryDate					= dataObj.deliveryDateTimeString;
				
				srNo++;
			}
			
			return agentCommisionBillingModel;
		}, getArrayForBookingTableDetails : function(agentCommissionBillingModalBkgArrList) {
			var srNo		= 1;
		
			for (var j = 0; j < agentCommissionBillingModalBkgArrList.length; j++) {
				var dataObj	= agentCommissionBillingModalBkgArrList[j];
				
				dataObj.srNumber						= srNo;
				dataObj.lrNumber						= dataObj.wayBillNumber;
				dataObj.deliveryDate					= dataObj.deliveryDateTimeString;
				
				var 	bookingCharges					= dataObj.wayBillBookingCharges;
				dataObj.collection					= 0;
				dataObj.handlingCharges				= 0;
				
				for(var i = 0; i < bookingCharges.length; i++) {
					if(bookingCharges[i].chargeTypeMasterId == COLLECTION)
						dataObj.collection 		= bookingCharges[i].wayBillBookingChargeChargeAmount;
					else if(bookingCharges[i].chargeTypeMasterId == SRS_HAMALI_BOOKING)
						dataObj.handlingCharges = bookingCharges[i].wayBillBookingChargeChargeAmount;
				}
				
				dataObj.grandTotal	= (dataObj.freightAmt + dataObj.wayBillBookingCommission + dataObj.handlingCharges + dataObj.collection);
				
				srNo++;
			}
			
			return agentCommissionBillingModalBkgArrList;
		}, getArrayForDeliveryTableDetails : function(agentCommissionBillingModalDlyArrList) {
			var srNo		= 1;
			
			for (var j = 0; j < agentCommissionBillingModalDlyArrList.length; j++) {
				var dataObj	= agentCommissionBillingModalDlyArrList[j];
				
				dataObj.srNumber						= srNo;
				dataObj.lrNumber						= dataObj.wayBillNumber;
				dataObj.deliveryDate					= dataObj.deliveryDateTimeString;
				
				var 	bookingCharges					= dataObj.wayBillBookingCharges;
				dataObj.collection					= 0;
				dataObj.handlingCharges				= 0;
				
				for(var i = 0; i < bookingCharges.length; i++) {
					if(bookingCharges[i].chargeTypeMasterId == COLLECTION)
						dataObj.collection 		= bookingCharges[i].wayBillBookingChargeChargeAmount;
					else if(bookingCharges[i].chargeTypeMasterId == SRS_HAMALI_BOOKING)
						dataObj.handlingCharges = bookingCharges[i].wayBillBookingChargeChargeAmount;
				}
				
				dataObj.grandTotal	= (dataObj.freightAmt + dataObj.wayBillDeliveryCommission + dataObj.handlingCharges + dataObj.collection);
				
				srNo++;
			}
			
			return agentCommissionBillingModalDlyArrList;
		},getHeaderAndFooterObject : function(agentCommisionBillingHeader) {
			agentCommisionBillingHeader.name											= agentCommisionBillingHeader.agentCommisionBillingAccountGroupName;
			agentCommisionBillingHeader.branchAddress									= agentCommisionBillingHeader.agentCommisionBillingBranchAddress;
			agentCommisionBillingHeader.branchPhoneNumber								= agentCommisionBillingHeader.agentCommisionBillingBranchPhoneNumber;
			agentCommisionBillingHeader.branchMobileNumber								= agentCommisionBillingHeader.agentCommisionBillingBranchMobileNumber;

			return agentCommisionBillingHeader;
		}
	});
});