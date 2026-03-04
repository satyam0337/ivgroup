define([
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/podwaybills/poddispatchprint/poddispatchview.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language',
	],
	function(UrlParameter, poddispatchview) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	isHeaderDisplayOnNextPage		= false,
	customGroupConfig,
	showPrintByInsertOrderInDB		= false,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			jsonObject.podDispatchId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/podDispatchWS/getDispatchedPodLRDetailsForPrintByPODDispatchId.do?', _this.setDispatchedPodLrDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, setDispatchedPodLrDetails : function(response) {
			hideLayer();
			
			showPrintByInsertOrderInDB	= response.showPrintByInsertOrderInDB;
			
			var tableData			= _this.getArrayForTableDetails(response.PodLrDetails);
			
				tableData	= _.sortBy(tableData, 'lrNumber');
				tableData 	= _this.setSrNumber(tableData);
			
			if(showPrintByInsertOrderInDB) {
				tableData	= _.sortBy(tableData, 'podDispatchSummaryId');
				tableData	= tableData.reverse();
				tableData 	= _this.setSrNumber(tableData);
			}
			
			var headerFooterData	= _this.getHeaderAndFooterObject(response.PodDispatchHeader);
			
			customGroupConfig	= response.customGroupConfig;
			
			require([poddispatchview.getConfiguration(response.podDispatchPrintFlavor),
				poddispatchview.getFilePathForLabel()], function(View, FilePath) {
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length / pageBreaker);

				var lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				
				if (pageCounter <= 0) {
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					poddispatchview.setHeadersForPrint(headerFooterData, isHeaderDisplayOnNextPage, pageNumber, customGroupConfig.htData.customGroupLogoAllowed);
					poddispatchview.setInformationDivs(headerFooterData);
					tableData.push(lastItrObj);
					poddispatchview.setDataTableDetails(tableData);

					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter + 1);
					poddispatchview.setFooterDiv(headerFooterData);
				} else {
					var pageNumber = 0;
					
					for (var j = 0; j < tableData.length; j += pageBreaker) {
						_this.$el.append(_.template(View));
						
						if (j + pageBreaker >= tableData.length)
							lastItrObj.lastITR = true;
						
						var chunkArray = tableData.slice(j, j + pageBreaker);
						poddispatchview.setHeadersForPrint(headerFooterData, isHeaderDisplayOnNextPage, pageNumber, customGroupConfig.htData.customGroupLogoAllowed);
						poddispatchview.setInformationDivs(headerFooterData);
						chunkArray.push(lastItrObj);
						poddispatchview.setDataTableDetails(chunkArray);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
					
					poddispatchview.setFooterDiv(headerFooterData);
				}
				
				loadLanguageWithParams(FilePath.loadLanguage(response.podDispatchPrintFlavor));
			});
		}, getArrayForTableDetails : function(podLrDetails) {
			var dataArray	= new Array();
			var srNo		= 1;
			
			for (var j = 0; j < podLrDetails.length; j++) {
				var dataObj	= podLrDetails[j];
				
				var dataObject	= new Object();
				dataObject.srNumber						= srNo;
				dataObject.lrNumber						= dataObj.wayBillNumber;
				dataObject.lrType						= dataObj.wayBillType;
				dataObject.bookingDate					= dataObj.wayBillBookingDateTimeStr;
				dataObject.consignor					= dataObj.wayBillConsignorName;
				dataObject.consignee					= dataObj.wayBillConsigneeName;
				dataObject.lrSourceBranch				= dataObj.wayBillSourceBranchName;
				dataObject.lrDestinationBranch			= dataObj.wayBillDestinationBranchName;
				dataObject.podDispatchSummaryId			= dataObj.podDispatchSummaryId;
				
				srNo++;
				dataArray.push(dataObject)
			}
			
			return dataArray;
		}, getHeaderAndFooterObject : function(PodDispatchHeader) {
			var headerObject					= new Object();
			
			headerObject.name					= PodDispatchHeader.podDispatchAccountGroupName;
			headerObject.branchAddress			= PodDispatchHeader.podDispatchBranchAddress;
			headerObject.branchPhoneNumber		= PodDispatchHeader.podDispatchBranchPhoneNumber;
			headerObject.branchMobileNumber		= PodDispatchHeader.podDispatchBranchMobileNumber;
			headerObject.podDispatchNumber		= PodDispatchHeader.podDispatchLedgerNumber;
			headerObject.podDispatchDate		= PodDispatchHeader.txnDateTimeStr;
			headerObject.podDispatchFromBranch	= PodDispatchHeader.dispatchByBranchName;
			headerObject.podDispatchToBranch	= PodDispatchHeader.dispatchToBranchName;
			headerObject.imagePath				= PodDispatchHeader.imagePath;
			headerObject.accountGroupName		= PodDispatchHeader.accountGroupName;

			return headerObject;
		}, setSrNumber : function(dataArray){
			for(var i = 0; dataArray.length > i; i++){
				dataArray[i].srNumber	= i+1;
			}
			
			return dataArray;
	
		}
	});
});