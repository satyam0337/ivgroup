/**
 * 
 */
define([
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	// to get parameter from url to send it to ws
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/preloadingsheetmoduleprint/preloadingsheetmoduleprintview.js',
	'jquerylingua',
	'language'
],function(JsonUtility, MessageUtility, UrlParameter, preloadingSheetPrintview, jquerylingua, language){
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	showHeader,
	removeHeader,
	WayBillTypeConstant,
	_this = '';
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)
			//initialize is the first function called on call new view()
			_this = this;
		},
		render: function() {

			jsonObject.preLoadingSheetLedgerId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/preloadingSheetModulePrintWS/getPreloadingSheetModuleLRDetailsForPrintByPreloadingSheetLedgerId.do?', _this.setDispatchedLrDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		},setDispatchedLrDetails : function(response) {
			
			console.log("response : " ,response);
			
			hideLayer();
			
			showHeader			= response.FlavorConfiguration.showHeader;
			removeHeader		= response.FlavorConfiguration.removeHeader;
			WayBillTypeConstant			= response.WayBillTypeConstant;
			var tableData			= _this.getArrayForTableDetails(response.PreloadingSheetModulePrint);
			
			var headerFooterData	= _this.getHeaderAndFooterObject(response.PreloadingSheetPrintHeader);
			
			require([preloadingSheetPrintview.getConfiguration(response.FlavorConfiguration),
				preloadingSheetPrintview.getFilePathForLabel(response.FlavorConfiguration)], function(View,FilePath){
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length/pageBreaker);

				var lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				if (pageCounter <= 0){
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					preloadingSheetPrintview.setHeadersForPrint(headerFooterData,pageNumber,showHeader,removeHeader);
					preloadingSheetPrintview.setInformationDivs(headerFooterData);
					tableData.push(lastItrObj);
					preloadingSheetPrintview.setDataTableDetails(tableData,WayBillTypeConstant);
					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					preloadingSheetPrintview.setFooterDiv(headerFooterData);

				}else {
					var pageNumber = 0;
					for (var j=0; j<tableData.length; j+=pageBreaker) {
						_this.$el.append(_.template(View));
						if (j+pageBreaker >= tableData.length){
							lastItrObj.lastITR = true;
						}
						var chunkArray = tableData.slice(j,j+pageBreaker);
						preloadingSheetPrintview.setHeadersForPrint(headerFooterData,pageNumber,showHeader,removeHeader);
						preloadingSheetPrintview.setInformationDivs(headerFooterData);
						chunkArray.push(lastItrObj);
						preloadingSheetPrintview.setDataTableDetails(chunkArray);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
					preloadingSheetPrintview.setFooterDiv(headerFooterData);
				}
				loadLanguageWithParams(FilePath.loadLanguage());
			});
			
		},getArrayForTableDetails : function(LrDetails) {
			var dataArray	= new Array();
			var srNo		= 1;
			
			for (var j=0; j<LrDetails.length; j++) {
				var dataObj	= LrDetails[j];
				
				var dataObject	= new Object();
				dataObject.srNumber						= srNo;
				dataObject.lrNumber						= dataObj.wayBillNumber;
				dataObject.lrSourceBranch				= dataObj.wayBillSourceBranchName;
				dataObject.quantity						= dataObj.consignmentSummaryQuantity;
				dataObject.weight						= dataObj.consignmentSummaryWeight;
				dataObject.bookingTotal					= dataObj.bookingTotal;
			    dataObject.Consignor			        = dataObj.consignorName;
				dataObject.Consignee			        = dataObj.consigneeName;
				dataObject.wayBillTypeName				= dataObj.wayBillTypeName;
				
				srNo++;
				dataArray.push(dataObject)
			}
			
			return dataArray;
		},getHeaderAndFooterObject : function(DispatchHeader) {
			var headerObject					= new Object();
			
			headerObject.name					= DispatchHeader.accountGroupName;
			headerObject.branchAddress			= DispatchHeader.branchAddress;
			headerObject.branchPhoneNumber		= DispatchHeader.branchPhoneNumber;
			headerObject.branchMobileNumber		= DispatchHeader.branchMobileNumber;
			headerObject.DispatchNumber			= DispatchHeader.plsNumber;
			headerObject.DispatchDate			= DispatchHeader.txnDateTimeStr;
			headerObject.DispatchFromBranch		= DispatchHeader.branchName;
			headerObject.accountGroupName		= DispatchHeader.accountGroupName;
		

			return headerObject;
		}
	});
});