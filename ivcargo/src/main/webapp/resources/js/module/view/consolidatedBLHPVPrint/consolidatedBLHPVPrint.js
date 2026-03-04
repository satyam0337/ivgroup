define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/consolidatedBLHPVPrint/consolidatedBLHPVPrintsetup.js',
	'JsonUtility',
	'messageUtility',
	'jquerylingua',
	'language'
	],
	function(UrlParameter, consolidatedBLHPVPrintsetup) {
	'use strict';// this basically give strictness to this specific js
	let 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	customGroupLogoAllowed			= false,
	removeHeader					= false,
	_this = '',
	consolidatedBLHPData, branchPhnNumber = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {

			jsonObject.consolidatedBLHPVId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/consolidatedBLHPVPrintWS/getConsolidatedBLHPVPintData.do?', _this.setPrintDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		},setPrintDetails : function(response) {
			hideLayer();
			customGroupLogoAllowed		 = response.customGroupConfig.htData.customGroupLogoAllowed;
			removeHeader				 = response.FlavorConfiguration.removeHeader;
			let headerFooterData		= _this.getHeaderAndFooterObject(response.PrintHeaderModel);
			let blhpvcharges			= _this.getArrayForBLHPVChargesDetails(response.lhpvSettlementCharges);
			consolidatedBLHPData		= _this.getConsolidatedBLHPData(response);			 
			let tableData				= _this.getArrayForTableDetails(response.consolidatedBLHPlist, blhpvcharges, consolidatedBLHPData);

			tableData 	= _this.setSrNumber(tableData);
			
			require([consolidatedBLHPVPrintsetup.getConfiguration(response.FlavorConfiguration),
				consolidatedBLHPVPrintsetup.getFilePathForLabel(response.FlavorConfiguration)], function(View,FilePath){
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length/pageBreaker);

				let lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				
				var pageNumber = 0;

				if (pageCounter <= 0) {
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					consolidatedBLHPVPrintsetup.setHeadersForPrint(headerFooterData, pageNumber, removeHeader, customGroupLogoAllowed);
					consolidatedBLHPVPrintsetup.setInformationDivs(consolidatedBLHPData);
					tableData.push(lastItrObj);
					consolidatedBLHPVPrintsetup.setDataTableDetails(tableData);
					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					consolidatedBLHPVPrintsetup.setFooterDiv(headerFooterData);
					tableData.push(consolidatedBLHPData);
				} else {
					for (let j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
						
						if (j + pageBreaker >= tableData.length)
							lastItrObj.lastITR = true;
						
						let chunkArray = tableData.slice(j,j+pageBreaker);
						consolidatedBLHPVPrintsetup.setHeadersForPrint(headerFooterData, pageNumber, removeHeader, customGroupLogoAllowed);
						consolidatedBLHPVPrintsetup.setInformationDivs(consolidatedBLHPData);
						chunkArray.push(lastItrObj);
						consolidatedBLHPVPrintsetup.setDataTableDetails(chunkArray);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
					
					consolidatedBLHPVPrintsetup.setFooterDiv(headerFooterData);
					tableData.push(consolidatedBLHPData);
				}
				
				loadLanguageWithParams(FilePath.loadLanguage());
			});
		}, getArrayForTableDetails : function(consolidatedBLHPlist, blhpvchargesObj, consolidatedBLHPData) {
				let totalAdvancePaid		= 0;
				let totalLorryHire			= 0;
				let totalLhpvBalanceAmount	= 0;
				let totalRefundAmount		= 0;
				let totalOtherAddAmount		= 0;
				let totalTDSAmount		= 0;
							
				for (const element of consolidatedBLHPlist) {
					let dataObj	= element;
					dataObj.overrun					= 0;
					dataObj.policepenalty			= 0;
					dataObj.deliveryCancellation	= 0;
					dataObj.other					= 0;
					dataObj.lhpvBalanceAmount		= dataObj.lhpvBalance;
					dataObj.lhpvDate				= dataObj.lHPVDateString;
					
					totalAdvancePaid					+= dataObj.advancePaid;
					totalLorryHire						+= dataObj.totalAmount;
					totalLhpvBalanceAmount				+= dataObj.lhpvBalance;
					totalRefundAmount					+= dataObj.refund;
					totalOtherAddAmount					+= dataObj.otherAddAmount;
					totalTDSAmount						+= dataObj.tds;
										
					let blhpvcharges					= blhpvchargesObj[dataObj.bLHPVId];
					
					if(blhpvcharges != undefined) {
						for(const element1 of blhpvcharges) {
							if(element1.overrun != undefined)
								dataObj.overrun			= element1.overrun;
							else if(element1.policepenalty != undefined)
								dataObj.policepenalty	= element1.policepenalty;
							else if(element1.deliveryCancellation != undefined)
								dataObj.deliveryCancellation	= element1.deliveryCancellation;
							else if(element1.other != undefined)
								dataObj.other			= element1.other;
						}
					}

					dataObj.blhpvCreationDateTime	= consolidatedBLHPData.creationDateTime;
					consolidatedBLHPData.paymentMadeTo = dataObj.paymentMadeTo;
				}
				
			consolidatedBLHPData.totalAdvancePaid			= totalAdvancePaid;
			consolidatedBLHPData.totalLorryHire				= totalLorryHire;
			consolidatedBLHPData.totalLhpvBalanceAmount		= totalLhpvBalanceAmount;
			consolidatedBLHPData.totalRefundAmount			= totalRefundAmount;
			consolidatedBLHPData.totalOtherAddAmount		= totalOtherAddAmount;
			consolidatedBLHPData.totalTDSAmount				= totalTDSAmount;
						
			return consolidatedBLHPlist;
		},getHeaderAndFooterObject : function(printHeaderModel) {
			printHeaderModel.name					= printHeaderModel.accountGroupName;
			printHeaderModel.branchMobileNumber		= printHeaderModel.branchContactDetailMobileNumber;
			branchPhnNumber							= printHeaderModel.branchContactDetailMobileNumber;

			return printHeaderModel;
		},getConsolidatedBLHPData : function(response) {
			let consolidatedBLHPData		= response.consolidatedBLHP;
			
			consolidatedBLHPData.consolidatedBLHPVNo	= consolidatedBLHPData.consolidatedBLHPVNumber;
			consolidatedBLHPData.paymentModeStr			= consolidatedBLHPData.paymentModeString;
			consolidatedBLHPData.creationDateTime		= consolidatedBLHPData.creationDateTimeString;
			consolidatedBLHPData.creationTime	 		= consolidatedBLHPData.creationTimeString;
			consolidatedBLHPData.driverMobileNumber		= consolidatedBLHPData.driver1MobileNumber1;
			consolidatedBLHPData.branchName				= consolidatedBLHPData.branchNameStr;
			consolidatedBLHPData.totalAmount			= (consolidatedBLHPData.refund - consolidatedBLHPData.balanceAmount);
			consolidatedBLHPData.currentDate			= response.currentDate;
			consolidatedBLHPData.currentTime			= response.currentTime;
			consolidatedBLHPData.executiveName			= response.executiveName;
			consolidatedBLHPData.branchPhnNumber		= branchPhnNumber;
			
			return consolidatedBLHPData;		
		}, getArrayForBLHPVChargesDetails : function(blhpvcharges) {
			let blhpvChargeArray = new Array();
			let blhpvChargeObj	 = new Object();

			if(blhpvcharges != undefined) {
				for(const element of blhpvcharges) {
					if(element.bLHPVId in blhpvChargeObj) {
						let blhpvchargesObject			= new Object();
						
						if(element.lhpvChargeTypeMasterId == OVER_RUN)
							blhpvchargesObject.overrun = element.chargeAmount;
						
						if(element.lhpvChargeTypeMasterId == POLICE_CHALLANS)
							blhpvchargesObject.policepenalty = element.chargeAmount;
						
						if(element.lhpvChargeTypeMasterId == DELIVERY_CANCELLATION)
							blhpvchargesObject.deliveryCancellation = element.chargeAmount;
						
						if(element.lhpvChargeTypeMasterId == OTHER_NEGATIVE)
							blhpvchargesObject.other = element.chargeAmount;
						
						blhpvChargeArray.push(blhpvchargesObject);
					} else {
						blhpvChargeArray = new Array();
					}

					blhpvChargeObj[element.bLHPVId]	= blhpvChargeArray;
				}
			}
			return blhpvChargeObj;
		},setSrNumber : function(dataArray){
			for(let i = 0; dataArray.length > i; i++){
				dataArray[i].srNumber	= i+1;
			}
			return dataArray;

		}
	});
});
