define(['JsonUtility',
	//jsonutility consist of ajax calls to send json object as an ajax hit to the url specified and get call back as specified
	'messageUtility',
	PROJECT_IVUIRESOURCES+'/resources/js/generic/urlparameter.js',
	// to get parameter from url to send it to ws
	'jquerylingua',
	'language',

	PROJECT_IVUIRESOURCES+'/resources/js/generic/genericfunctions.js',
	],
	function(JsonUtility, MessageUtility, UrlParameter, jquerylingua, language) {
	'use strict';// this basically give strictness to this specific js
	var 
	masterId = "0",
	jsonObject	= new Object(),
	pageCounter,
	pageBreaker,
	_this = '';
	//this is used to get the access of key in onRender because this keyword is not found in onRender function
	return Marionette.LayoutView.extend({
		initialize: function(masterObj){
			//masterid is fetched and passed when the view is called and it is set to fetch it from webservice
			masterId = UrlParameter.getModuleNameFromParam(MASTERID)

			//initialize is the first function called on call new view()
			_this = this;
		}, render: function() {
			jsonObject.crId = masterId;

			getJSON(jsonObject, WEB_SERVICE_URL + '/crPrintWS/getMultipleLrInSingleCRPrintByCRId.do?', _this.getResponseForPrint, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getResponseForPrint : function(response) {
			
			hideLayer()
			var responseOut = response;
			var configuration 		= responseOut.configuration;
			var tableData			= _this.getArrayForTableDetails(responseOut);
			var crprintList	 		= responseOut.crprintls[0];
			tableData 				= _this.setSrNumber(tableData);
			var isMultiple = 0;
			var isSingleCrPrintNeededForSingleLrDelivery = configuration.isSingleCrPrintNeededForSingleLrDelivery;
			
			for(var i = 0; i < tableData.length; i++) {
				isMultiple = tableData[i].isMultiple;
			}
			
			require(['/ivcargo/resources/js/module/print/singlecrmultilrprintsetup.js'], function(crprintsetup){
				require([crprintsetup.getConfiguration(configuration, isMultiple, isSingleCrPrintNeededForSingleLrDelivery),
					crprintsetup.getFilePathForLabel(configuration)], function(View,FilePath){

					pageBreaker		= configuration.noOfLrsInSingleCrMultiLrPrint;
					pageCounter		= Math.round(tableData.length/pageBreaker);
					var lastItrObj	= new Object();
					lastItrObj.lastITR	= false;
					var totalFreight	= 0;
					var totalDeliverySumCharges	= 0;
					var totalNoOfArticle	= 0;
					var count				= 0;
					var deliveryDiscount	= 0;
					var deliveryDiscount	= 0;
					var tdsAmount			= 0;
					var totalChargeWeight	= 0;
					var totalActualWeight	= 0;
					
					for (var i = 0; i < tableData.length; i++) {
						if(tableData[i].wayBillTypeId != WAYBILL_TYPE_PAID && tableData[i].wayBillTypeId != WAYBILL_TYPE_CREDIT)
							totalFreight		+= tableData[i].bookingChargesSum;
						
						totalDeliverySumCharges	+= tableData[i].deliverySumCharges;
						totalNoOfArticle		+= tableData[i].quantity;
						deliveryDiscount 		+= tableData[i].deliveryDiscount;
						tdsAmount        		+= tableData[i].tdsAmount;
						totalChargeWeight       += tableData[i].chargeWeight;
						totalActualWeight       += tableData[i].actualWeight;
					}
					
					if (pageCounter <= 0){
						var pageNumber = 0;
						lastItrObj.lastITR	= true;
						_this.$el.html(_.template(View));
						$("#header").removeClass('page-break');

						$("*[data-cr='bookingTotal']").html(Math.round(totalFreight));
						$("*[data-cr='deliverySumCharges']").html(Math.round(Number(totalDeliverySumCharges)));
						$("*[data-cr='totalNoOfArticle']").html(totalNoOfArticle);
						$("*[data-cr='total']").html(Math.round(totalDeliverySumCharges + totalFreight - deliveryDiscount));
						$("*[data-cr='totalInWords']").html(convertNumberToWord(Math.round(totalDeliverySumCharges + totalFreight - deliveryDiscount)));
						$("*[data-cr='consignorName']").html(crprintList.consignerName);
						$("*[data-selector='deliveryGrandTotalInWords']").html(convertNumberToWord(Math.round(totalDeliverySumCharges + totalFreight - deliveryDiscount)));
						$("*[data-cr='bookingDateOnly']").html(crprintList.bookingDate);
						$("*[data-cr='totalChargeWeight']").html(totalChargeWeight);
						$("*[data-cr='totalActualWeight']").html(totalActualWeight);
						
						if(deliveryDiscount > 0)
							$("*[data-cr='deliveryDiscount']").html(deliveryDiscount);
						
						if(tdsAmount > 0)
							$("*[data-cr='tdsAmount']").html(tdsAmount);
					
						$("*[data-cr='grandTotalForBatco']").html(Math.round(totalFreight + totalDeliverySumCharges - (deliveryDiscount + tdsAmount)));
						$("*[data-cr='grandTotalForndtc']").html(Math.round(totalFreight + totalDeliverySumCharges - deliveryDiscount));

						var totalAmount = totalFreight + totalDeliverySumCharges - deliveryDiscount;
						var igstFivePercent = Math.round(totalAmount * 0.05);
						$("*[data-cr='igst5per']").html(igstFivePercent);


						if(crprintList.eWayBillStatus != null)
							$("*[data-cr='eWayBillStatus']").html(crprintList.eWayBillStatus);
			
						crprintsetup.setHeaderDetails(responseOut);
						crprintsetup.disableRightClick();
						crprintsetup.setConsignorname(responseOut,count);
						tableData.push(lastItrObj);
						crprintsetup.setCrDetails(responseOut,tableData);
						crprintsetup.setDeliveryCharges(configuration, responseOut);
						crprintsetup.showHideTable(responseOut);

						pageNumber++;
						
						$("*[data-footerpage='pageNo']").last().html(pageNumber);
						$("[data-footerpage='pagecounter']").html(pageCounter+1);

						setTimeout(function(){window.print();window.close();},200);
					}else{
						var pageNumber = 0;
						var size=tableData.length;
						
						for (var j = 0; j < size; j += pageBreaker) {
							_this.$el.append(_.template(View));
							
							if (j + pageBreaker >= size)
								lastItrObj.lastITR = true;
							
							if(j == 0)
								$("#header").removeClass('page-break');
							
							var chunkArray = tableData.slice(j,j+pageBreaker);
							$("*[data-cr='bookingTotal']").html(Math.round(totalFreight));
							$("*[data-cr='deliverySumCharges']").html(Math.round(Number(totalDeliverySumCharges)));
							$("*[data-cr='totalNoOfArticle']").html(totalNoOfArticle);
							$("*[data-cr='total']").html(Math.round(totalDeliverySumCharges + totalFreight - deliveryDiscount));
							$("*[data-cr='totalInWords']").html(convertNumberToWord(Math.round(totalDeliverySumCharges + totalFreight - deliveryDiscount)));
							$("*[data-cr='bookingcharges']").html(crprintList.bookingChargesSum);
							$("*[data-cr='totalChargeWeight']").html(totalChargeWeight);
							$("*[data-cr='totalActualWeight']").html(totalActualWeight);
							
							if(deliveryDiscount > 0)
								$("*[data-cr='deliveryDiscount']").html(deliveryDiscount);
							
							if(tdsAmount > 0)
								$("*[data-cr='tdsAmount']").html(tdsAmount);
							
							 $("*[data-cr='grandTotalForBatco']").html(Math.round(totalFreight + totalDeliverySumCharges - (deliveryDiscount + tdsAmount)));
							 
							if(crprintList.eWayBillStatus != null)
								$("*[data-cr='eWayBillStatus']").html(crprintList.eWayBillStatus);
			
							crprintsetup.setHeaderDetails(responseOut);
							crprintsetup.disableRightClick();
							crprintsetup.setConsignorname(responseOut,count);
							chunkArray.push(lastItrObj);
							crprintsetup.setCrDetails(responseOut, chunkArray);
							crprintsetup.showHideTable(responseOut);
							pageNumber++;
							$("*[data-footerpage='pageNo']").last().html(pageNumber);
							$("[data-footerpage='pagecounter']").html(pageCounter);
							tableData.push(responseOut);

							count++;
						}
						setTimeout(function(){window.print();window.close();},200);
					}
					
					let crPrintType	= configuration.crPrintType;
					
					if(crPrintType.includes('singleCrMultiLrPrint'))
						crPrintType	= 'crprint_' + crPrintType.split("_")[1];
					
					loadLanguageWithParams(FilePath.loadLanguage(crPrintType));

				})
			});
		}, getArrayForTableDetails : function(responseOut) {
			var wayBillIdList		= responseOut.wayBillIdList;
			var crprintHm			= responseOut.crprintHm;
			var deliveryChargeHm	= responseOut.deliveryChargeHm;
			var tableData=[];
			
			for (var i = 0; i < wayBillIdList.length; i++) {
				tableData[i]		= crprintHm[responseOut.wayBillIdList[i]][0];
				
				if(deliveryChargeHm != undefined)
					tableData[i].deliveryChargeList    	= deliveryChargeHm[responseOut.wayBillIdList[i]];
			}
			
			return tableData;
		}, setSrNumber : function(dataArray){
			for(var i = 0; dataArray.length > i; i++) {
				dataArray[i].srNumber	= i + 1;
			}
			
			return dataArray;
		}
	});
});