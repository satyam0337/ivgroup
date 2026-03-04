define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	// to get parameter from url to send it to ws
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/doorpickuploadingsheetprint/doorpickupdispatchview.js',
	'jquerylingua',
	'language',
	],
	function(JsonUtility, MessageUtility, UrlParameter, doorPickupdispatchview, jquerylingua, language) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	showHeader,
	removeHeader = false,
	pickupChargeData,
	PickupChargeTypeConstant,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			jsonObject.doorPickupLedgerId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/doorPickupDispatchWS/getDoorPickupDispatchedLRDetailsForPrintByDoorPickupLedgerId.do?', _this.setDispatchedLrDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		}, setDispatchedLrDetails : function(response) {
			hideLayer();
			showHeader			= response.FlavorConfiguration.showHeader;
			removeHeader		= response.FlavorConfiguration.removeHeader;
			
			PickupChargeTypeConstant	= response.PickupChargeTypeConstant;
			let tableData			= _this.getArrayForTableDetails(response.DoorPickupDispatchLSPrint);
			pickupChargeData		= _this.getArrayForPickupCharges(response.pickupChargeList,PickupChargeTypeConstant,response.DoorPickupDispatchHeader);
			
			if(response.FlavorConfiguration.allowSortingOnDoorPickupDetailsId) {
				tableData				= _.sortBy(tableData, 'doorPickupDetailsId');
				tableData				= tableData.reverse();
			}

			tableData 				= _this.setSrNumber(tableData);
			
			let headerFooterData	= _this.getHeaderAndFooterObject(response.DoorPickupDispatchHeader, response.PrintHeaderModel);
			
			require(['text!' + doorPickupdispatchview.getConfiguration(response.FlavorConfiguration),
				doorPickupdispatchview.getFilePathForLabel()], function(View,FilePath){
				pageBreaker		= 2000;
				
				pageCounter		= Math.round(tableData.length/pageBreaker);

				let lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				
				if (pageCounter <= 0) {
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					doorPickupdispatchview.setHeadersForPrint(headerFooterData, pageNumber, showHeader, removeHeader);
					doorPickupdispatchview.setInformationDivs(headerFooterData);
					tableData.push(lastItrObj);
					doorPickupdispatchview.setDataTableDetails(tableData);
					doorPickupdispatchview.setPickupChargesDetails(pickupChargeData);
					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter + 1);
					doorPickupdispatchview.setFooterDiv(headerFooterData);
				} else {
					var pageNumber = 0;
				
					for (let j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
					
						if (j + pageBreaker >= tableData.length)
							lastItrObj.lastITR = true;
					
						let chunkArray = tableData.slice(j, j + pageBreaker);
						doorPickupdispatchview.setHeadersForPrint(headerFooterData,pageNumber,showHeader,removeHeader);
						doorPickupdispatchview.setInformationDivs(headerFooterData);
						chunkArray.push(lastItrObj);
						doorPickupdispatchview.setDataTableDetails(chunkArray);
						doorPickupdispatchview.setPickupChargesDetails(pickupChargeData);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
				
					doorPickupdispatchview.setFooterDiv(headerFooterData);
				}
				
				let printHeaderModel	= response.PrintHeaderModel;
					
				if(printHeaderModel != undefined)
					setLogo(printHeaderModel.accountGroupId);
					
				loadLanguageWithParams(FilePath.loadLanguage(response.FlavorConfiguration.doorPickupDispatchPrintFlavor));
			});
		}, getArrayForTableDetails : function(lrDetails) {
			let srNo		= 1;
			
			for (const element of lrDetails) {
				element.srNumber			= srNo;
				element.lrNumber			= element.wayBillNumber;
				element.lrSourceBranch		= element.wayBillSourceBranchName;
				element.quantity			= element.consignmentSummaryQuantity;
				element.weight				= element.consignmentSummaryWeight;
				element.bookingTotal		= element.wayBillBookingTotal;
			    element.Consignor			= element.consignorName;
				element.Consignee			= element.consigneeName;
				element.lrDestBranch		= element.pickUpDestination;
				element.lorryHireAmnt		= element.doorPickupDetailsLorryHireAmount;
				
				//do not add anything here, just use same variable as coming from server side
		        
				srNo++;
			}
			
			return lrDetails;
		}, getHeaderAndFooterObject : function(DispatchHeader, PrintHeaderModel) {
			DispatchHeader.name						= DispatchHeader.doorPickupDispatchAccountGroupName;
			DispatchHeader.branchAddress			= DispatchHeader.doorPickupDispatchBranchAddress;
			DispatchHeader.branchPhoneNumber		= DispatchHeader.doorPickupDispatchBranchPhoneNumber;
			DispatchHeader.branchMobileNumber		= DispatchHeader.doorPickupDispatchBranchMobileNumber;
			DispatchHeader.DispatchNumber			= DispatchHeader.doorPickupDispatchLedgerNumber;
			DispatchHeader.DispatchDate				= DispatchHeader.txnDateTimeStr;
			DispatchHeader.DispatchFromBranch		= DispatchHeader.dispatchByBranchName;
			DispatchHeader.DispatchToBranch			= DispatchHeader.dispatchToBranchName;
			DispatchHeader.dispatchDateTime			= DispatchHeader.txnDateTimeString;
			DispatchHeader.divisionName				= DispatchHeader.divisionName;
			/*
				do not write anything here , just use same variable as coming from server side
			*/
			
			return Object.assign(DispatchHeader, PrintHeaderModel);;
		}, getArrayForPickupCharges : function(pickupChargeList, PickupChargeTypeConstant, DoorPickupDispatchHeader) {
			let dataObject	= new Object();
			
			if(pickupChargeList != undefined) {
				for (const element of pickupChargeList) {
					if(element.pickupChargeMasterId == PickupChargeTypeConstant.LORRY_HIRE)
						dataObject.lorryHire 	= element.chargeAmount;
					else if(element.pickupChargeMasterId == PickupChargeTypeConstant.EXTRA)
						dataObject.extra 		= element.chargeAmount;
				}
			}
			
			dataObject.lorryHireAmount		= DoorPickupDispatchHeader.lorryHire;
			dataObject.lorryHireAdvance		= DoorPickupDispatchHeader.settledAmount;
			dataObject.lorryHireBalance		= DoorPickupDispatchHeader.balanceAmount;
			
			return dataObject;
		}, setSrNumber : function(dataArray){
			for(let i = 0; dataArray.length > i; i++){
				dataArray[i].srNumber	= i+1;
			}
			
			return dataArray;
	
		}
	});
});