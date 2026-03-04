define([
	
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	PROJECT_IVUIRESOURCES+'/resources/js/module/view/partyAgentCommisionPrint/partyAgentCommisionPrintView.js',
	'JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language'
	],
	function(UrlParameter, partyagentcommisionview) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	headerTopMargin	= 0,
	jsonObject	= new Object(),
	pageBreaker,
	pageCounter,
	isHeaderDisplayOnNextPage		= false,
	partyAgentCommisionPrintFlavor = '',
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

			jsonObject.partyAgentSummaryId = masterId;
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyAgentCommissionModuleWS/getPartyAgentCommissionDetailsForPrintById.do?', _this.setDispatchedPodLrDetails, EXECUTE_WITHOUT_ERROR);

			return _this;
		},setDispatchedPodLrDetails : function(response) {
			hideLayer();
			
			partyAgentCommisionPrintFlavor	= response.partyAgentCommisionPrintFlavor;
			
			var tableData			= _this.getArrayForTableDetails(response.PartyAgentCommisionDetails);
			var headerFooterData	= _this.getHeaderAndFooterObject(response.PartyAgentCommisionHeader);
			
			require(['text!' + partyagentcommisionview.getConfiguration(response),
				partyagentcommisionview.getFilePathForLabel(response)], function(View,FilePath){
				pageBreaker		= 42;

				pageCounter		= Math.round(tableData.length/pageBreaker);

				var lastItrObj	= new Object();
				lastItrObj.lastITR	= false;
				if (pageCounter <= 0){
					var pageNumber = 0;
					lastItrObj.lastITR	= true;
					_this.$el.html(_.template(View));
					partyagentcommisionview.setHeadersForPrint(headerFooterData,headerTopMargin,isHeaderDisplayOnNextPage,pageNumber);
					partyagentcommisionview.setInformationDivs(headerFooterData);
					tableData.push(lastItrObj);
					partyagentcommisionview.setDataTableDetails(tableData);

					pageNumber++;
					$("*[data-footerpage='pageNo']").last().html(pageNumber);
					$("[data-footerpage='pagecounter']").html(pageCounter+1);
					partyagentcommisionview.setFooterDiv(headerFooterData);

				}else {
					var pageNumber = 0;
					for (var j=0; j<tableData.length; j+=pageBreaker) {
						_this.$el.append(_.template(View));
						if (j+pageBreaker >= tableData.length){
							lastItrObj.lastITR = true;
						}
						var chunkArray = tableData.slice(j,j+pageBreaker);
						partyagentcommisionview.setHeadersForPrint(headerFooterData,headerTopMargin,isHeaderDisplayOnNextPage,pageNumber);
						partyagentcommisionview.setInformationDivs(headerFooterData);
						chunkArray.push(lastItrObj);
						partyagentcommisionview.setDataTableDetails(chunkArray);
						pageNumber++;
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter);
					}
					partyagentcommisionview.setFooterDiv(headerFooterData);
				}
				
				loadLanguageWithParams(FilePath.loadLanguage(partyAgentCommisionPrintFlavor));
			});
		},getArrayForTableDetails : function(PartyAgentCommisionDetails) {
			var dataArray	= new Array();
			var srNo		= 1;
			
			for (var j=0; j<PartyAgentCommisionDetails.length; j++) {
				var dataObj	= PartyAgentCommisionDetails[j];

				var dataObject	= new Object();
				dataObject.srNumber						= srNo;
				dataObject.lrNumber						= dataObj.wayBillNumber;
				dataObject.quantity						= dataObj.noOfArticle;
				dataObject.actualWeight					= dataObj.actualWeight;
				dataObject.chargedWeight				= dataObj.chargedWeight;
				dataObject.chargeAmount					= dataObj.chargeValue;
				
				srNo++;
				dataArray.push(dataObject)
			}
			
			return dataArray;
		},getHeaderAndFooterObject : function(PartyAgentCommisionHeader) {
			var headerObject							= new Object();
			
			headerObject.name							= PartyAgentCommisionHeader.partyAgentCommisionAccountGroupName;
			headerObject.branchAddress					= PartyAgentCommisionHeader.partyAgentCommisionBranchAddress;
			headerObject.branchPhoneNumber				= PartyAgentCommisionHeader.partyAgentCommisionBranchPhoneNumber;
			headerObject.branchMobileNumber				= PartyAgentCommisionHeader.partyAgentCommisionBranchMobileNumber;
			headerObject.partyAgentCommisionNumber		= PartyAgentCommisionHeader.partyAgentCommisionNumber;
			headerObject.partyAgentName					= PartyAgentCommisionHeader.partyAgentName;
			headerObject.partyAgentCommisionDate		= PartyAgentCommisionHeader.partyAgentCommisionCreationDateTimeStr;

			return headerObject;
		},setSrNumber : function(dataArray){
			for(var i = 0; dataArray.length > i; i++){
				dataArray[i].srNumber	= i+1;
			}
			return dataArray;
	
		}
	});
});