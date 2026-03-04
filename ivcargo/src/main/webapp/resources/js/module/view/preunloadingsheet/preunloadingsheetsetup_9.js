define(['elementTemplateJs'],function(elementTemplateJs){
	var rowsPerPage	=24;
	var _this;
	var headerCollection,
	dispatchLSHeader,
	currentDateTime;
	return ({
		renderElements : function(response){
			_this = this;
			var preUnloadingSheetList = response.preUnloadingSheetList;
			var preUnloadingSheetSummary =  response.preUnloadingSheetSummary;
			
			var destObj = new Array();
			
			_.each(preUnloadingSheetList, function(preUnloadingSheet){
				destObj.push(preUnloadingSheet.wayBillNumber);
			});
						
			var uniqDestBranch = _.uniq(destObj);
			
			var sourceWiseColl = new Object();
			var arrList	= null;
			_.each(uniqDestBranch, function(destBranch){
				arrList = _.where(preUnloadingSheetList, {wayBillNumber: destBranch});
				sourceWiseColl[destBranch] = arrList;
			});
			
			console.log(sourceWiseColl);
			
			headerCollection = response.PrintHeaderModel;
			dispatchLSHeader = response.dispatchLSHeader;
			currentDateTime = response.currentDateTime;
			var finalJsonObj = new Array();
			this.setSortedSources(sourceWiseColl,finalJsonObj);
			this.setDataForView(finalJsonObj,sourceWiseColl,preUnloadingSheetSummary );
			
		},setDataForView:function(finalJsonObj,sourceWiseColl,preUnloadingSheetSummary ){
			
			var fileref = document.createElement("link");
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preunloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)

			require(['text!/ivcargo/template/preunloading/preunloadingsheet_9.html'],function(PreLoadingSheet){
				var noOfLr		 	= 0;
				var noOfArticle 	= 0;
				var actualWeight 	= 0;
				var chargeWeight	= 0;
				var bookingAmount	= 0;
				var bookingFreight	= 0;
				var doorPickup		= 0;
				var doorDelivery	= 0;
				var other			= 0;
				var paidAmnt		= 0;
				var toPayAmnt		= 0;
				var tbbAmnt			= 0;
				var	lorryHire		= 0;
				var balanceAmnt		= 0;
				var advanceAmnt		= 0;
				var	lsNumber		= 0;
				var lsSrcBranchName = "";
				var lsDestBranchName = "";
				
				var totalnoOfLr		 	= 0;
				var totalnoOfArticle 	= 0;
				var totalactualWeight 	= 0;
				var totalchargeWeight	= 0;
				var totalBookingTotal 	= 0;
				var totalBookingFreight	= 0;
				var totalDoorPickup		= 0;
				var totalDoorDelivery	= 0;
				var totalToPayAmnt		= 0;
				var totalPaidAmnt		= 0;
				var totalTbbAmnt		= 0;
				var totalOther	= 0;
				
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				
				var TotalCount = Object.keys(chunkArray).length;
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				
				var dataKey		= Object.keys(sourceWiseColl);
				dataObject	= new Array(); // Object For Processing Received
				for (var i=0; i<dataKey.length; i++){
					var obj	= sourceWiseColl[dataKey[i]]; // Derived Array Object From Received ValueObject
					noOfLr += obj.length;
					for (var l=0; l<obj.length; l++){
						var dataObj	= obj[l];
						
						noOfArticle = noOfArticle+dataObj.consignmentSummaryQuantity;
						actualWeight = actualWeight + dataObj.consignmentSummaryActualWeight;
						chargeWeight = chargeWeight + dataObj.consignmentSummaryChargeWeight;
						bookingAmount = bookingAmount + dataObj.bookingAmount;
						bookingFreight	= bookingFreight + dataObj.wayBillFreightCharge;
						doorPickup		= doorPickup + dataObj.wayBillDoorPickupCharge;
						doorDelivery	= doorDelivery + dataObj.wayBillDoorDeliveryCharge;
						other			= other + dataObj.wayBillOtherCharge;
						lsNumber		= dataObj.lsNumber;
					}
				}
				totalnoOfLr = totalnoOfLr + noOfLr;
				totalnoOfArticle = totalnoOfArticle + noOfArticle;
				totalactualWeight = totalactualWeight + actualWeight;
				totalchargeWeight = totalchargeWeight + chargeWeight;
				totalBookingTotal 	= totalBookingTotal + bookingAmount;
				totalBookingFreight	= totalBookingFreight+ bookingFreight;
				totalDoorPickup		= totalDoorPickup + doorPickup;
				totalDoorDelivery	= totalDoorDelivery + doorDelivery;
				totalOther	= totalOther + other;
				totalToPayAmnt = preUnloadingSheetSummary.topayAmnt;
				totalPaidAmnt  = preUnloadingSheetSummary.paidAmnt;
				totalTbbAmnt   = preUnloadingSheetSummary.tbbAmnt;
				lorryHire		= preUnloadingSheetSummary.lorryHire;
				balanceAmnt		= preUnloadingSheetSummary.lhpvBalanceAmnt;
				advanceAmnt		= preUnloadingSheetSummary.lhpvAdvanceAmnt;
				lsSrcBranchName	= preUnloadingSheetSummary.lsSrcBranchStr;
				lsDestBranchName = preUnloadingSheetSummary.lsDestBranchStr;
				
				$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
				$('.divFooter:not(:last)').each(function(){$(this).empty()});
				$('.summaryinfo:not(:last)').each(function(){$(this).empty()});
				$('.summaryTable:not(:last)').each(function(){$(this).empty()});
				$("*[data-cell='totalNoOfLr']").html(totalnoOfLr);
				$("*[data-cell='totalNoOfArticle']").html(totalnoOfArticle);
				$("*[data-cell='totalActualWeight']").html(totalactualWeight);
				$("*[data-cell='totalChargeWeight']").html(totalchargeWeight);
				$("*[data-cell='totalBookingTotal']").html(totalBookingTotal);
				$("*[data-cell='totalToPayAmnt']").html(Math.round(totalToPayAmnt));
				$("*[data-cell='totalPaidAmnt']").html(Math.round(totalPaidAmnt));
				$("*[data-cell='totalTbbAmnt']").html(Math.round(totalTbbAmnt));
				$("*[data-cell='lorryHire']").html(lorryHire);
				$("*[data-cell='balanceAmnt']").html(balanceAmnt);
				$("*[data-cell='advanceAmnt']").html(advanceAmnt);
				$("*[data-cell='lsNumber']").html(lsNumber);
				$("*[data-cell='lsSrcBranchName']").html(lsSrcBranchName);
				$("*[data-cell='lsDestBranchName']").html(lsDestBranchName);
				$('.totalNoOfLr').last().html('LRs- '+totalnoOfLr);
				$('.totalNoOfArticle').last().html(totalnoOfArticle);
				$('.actualweight').html(totalactualWeight);
				$('.totalBookingTotal').html(totalBookingTotal);
				$('.totalBookingFreight').html(totalBookingFreight);
				$('.totalDoorPickup').html(totalDoorPickup);
				$('.totalDoorDelivery').html(totalDoorDelivery);
				$('.totalOther').html(totalOther);
				_this.setHeaderData(headerCollection,dispatchLSHeader);
				window.print();
			})
		},setHeaderData:function(headerCollection,dispatchLSHeader){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre UnLoading Sheet');
			$("*[data-current='datetime']").html(currentDateTime);
			$("*[data-lsVehicle='lsVehicle']").html(dispatchLSHeader.vehicleNumber);
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},setSortedSources:function(sourceWiseColl,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in sourceWiseColl){
				sourceArray.push(sourceBranch);
			}
			var indexArray = new Array();
			var wayBillArray = new Array();
			for(var index in sourceArray){
				indexArray.push(sourceWiseColl[sourceArray[index]]);
			}
			for(var f=0;indexArray.length > f;f++){
				var temp = indexArray[f];
				for(var t=0;temp.length > t;t++){
					wayBillArray.push(temp[t]);
				}
			}

			for(var i=0;(wayBillArray).length > i;i++) {
				var wayBillNumber	= wayBillArray[i].wayBillNumber;
				wayBillArray[i].wayBillNumberWithoutBranchCode = Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
				wayBillArray[i].srNo = Number(i+1);
			}
			
			var detsinationcollection	= _.sortBy(wayBillArray,'wayBillNumberWithoutBranchCode');
			for(var destkey in detsinationcollection){
				finalJsonObj.push(detsinationcollection[destkey]);
			}
		},renderTable:function(chunkArray){
			var leftDataChunk = chunkArray.splitArray(Math.ceil(chunkArray.length/2));
			for(var leftData in leftDataChunk){
				if(leftData % 2 == 0){
					this.renderTableValues(leftDataChunk[leftData],'.leftdivTableBody');
				}else{
					this.renderTableValues(leftDataChunk[leftData],'.rightdivTableBody');
				}
			}
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						
						if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
							htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
                        }else{
                            htmlVariable += '<div class="'+$(this).attr('class')+'"></div>';
                        }
					});
				})
			}
			$(className).last().html(htmlVariable);
		}
	});
});
Object.defineProperty(Array.prototype, 'splitArray', {
	value: function(chunkSize) {
		var array=this;
		return [].concat.apply([],
				array.map(function(elem,i) {
					return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
				})
		);
	}
});