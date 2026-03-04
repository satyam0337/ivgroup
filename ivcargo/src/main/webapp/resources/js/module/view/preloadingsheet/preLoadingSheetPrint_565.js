define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			var finalJsonObj = new Array();
			this.setSortedSources(pendingSheet,finalJsonObj);
			this.setDataForView(finalJsonObj);
		},setDataForView:function(finalJsonObj){
			require(['text!/ivcargo/template/preloading/preloadingsheet_565.html'],function(PreLoadingSheet){
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var TotalCount = Object.keys(chunkArray).length;
				var totalNoOfLR = 0;
				var totalNoOfQuantity = 0;
				var totalActualWeight = 0;
				var totalBookingTotal = 0;
				var noOfLRPaid		  = 0;
				var noOfLRToPay		  = 0;
				var noOfLRTBB		  = 0;
				var totalChargedWeightPaid = 0;
				var totalActualWeightPaid  = 0;
				var totalChargedWeightToPay = 0;
				var totalActualWeightToPay  = 0;
				var totalChargedWeightTBB = 0;
				var totalActualWeightTBB  = 0;
				var bookingTotalPaid	  = 0;
				var bookingTotalToPay	  = 0;
				var bookingTotalTBB		  = 0;
				var allTypeBookingTotal   =0;
				var allTypeChargedWeightTotal = 0;
				var allTypeActualWeightTotal = 0;
				var totalNoOfLRAllType		 = 0;
				var totalNoOfArticlePaid     = 0;
				var totalNoOfArticleToPay    = 0;
				var totalNoOfArticleTBB      = 0;
                var totalNoOfArticle         = 0;

				for(var i = 0;i<finalJsonObj.length;i++){
					var pendingDispatchModel  = finalJsonObj[i];
					if(pendingDispatchModel.pendingQuantity > 0){
						totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
						totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
						totalBookingTotal += pendingDispatchModel.bookingTotal;
						totalNoOfLR++;
					}
					if(pendingDispatchModel.wayBillTypeId == WAYBILL_TYPE_PAID){
						noOfLRPaid++;
						totalNoOfArticlePaid += pendingDispatchModel.pendingQuantity;
						totalChargedWeightPaid += pendingDispatchModel.consignmentSummaryChargedWeight;
						totalActualWeightPaid  += pendingDispatchModel.consignmentSummaryActualWeight;
						bookingTotalPaid	   += pendingDispatchModel.bookingTotal;
					}
					if(pendingDispatchModel.wayBillTypeId == WAYBILL_TYPE_TO_PAY){
						noOfLRToPay++;
						totalNoOfArticleToPay += pendingDispatchModel.pendingQuantity;
						totalChargedWeightToPay += pendingDispatchModel.consignmentSummaryChargedWeight;
						totalActualWeightToPay  += pendingDispatchModel.consignmentSummaryActualWeight;
						bookingTotalToPay	   	+= pendingDispatchModel.bookingTotal;
						
					}
					if(pendingDispatchModel.wayBillTypeId == WAYBILL_TYPE_CREDIT){
						noOfLRTBB++;
						totalNoOfArticleTBB += pendingDispatchModel.pendingQuantity;
						totalChargedWeightTBB += pendingDispatchModel.consignmentSummaryChargedWeight;
						totalActualWeightTBB  += pendingDispatchModel.consignmentSummaryActualWeight;
						bookingTotalTBB	   	  += pendingDispatchModel.bookingTotal;
						
					}
					allTypeBookingTotal = bookingTotalPaid + bookingTotalToPay + bookingTotalTBB ;
					allTypeChargedWeightTotal = totalChargedWeightPaid + totalChargedWeightToPay + totalChargedWeightTBB ; 
					allTypeActualWeightTotal = totalActualWeightPaid + totalActualWeightToPay + totalActualWeightTBB ;
					totalNoOfLRAllType = noOfLRPaid + noOfLRToPay + noOfLRTBB
					totalNoOfArticle  = totalNoOfArticlePaid + totalNoOfArticleToPay + totalNoOfArticleTBB
				}
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				
				$('.leftdivTableBody .divTableCell:last').fadeOut();
				$('.divTableFoot:not(:last)').each(function(){$(this).empty()});
				$('.totalNoOfLr').last().html('LRs- '+totalNoOfLR);
				$('.totalNoOfArticle').last().html(totalNoOfQuantity);
				$('.actualweight').html(totalActualWeight);
				$('.totalBookingTotal').html(totalBookingTotal);
				$('.noOfLRPaid').last().html(noOfLRPaid);
				$('.noOfLRToPay').last().html(noOfLRToPay);
				$('.noOfLRTBB').last().html(noOfLRTBB);
				$('.totalChargedWeightPaid').last().html(totalChargedWeightPaid);
				$('.totalChargedWeightToPay').last().html(totalChargedWeightToPay);
				$('.totalChargedWeightTBB').last().html(totalChargedWeightTBB);
				$('.totalActualWeightPaid').last().html(totalActualWeightPaid);
				$('.totalActualWeightToPay').last().html(totalActualWeightToPay);
				$('.totalActualWeightTBB').last().html(totalActualWeightTBB);
				$('.bookingTotalPaid').last().html(bookingTotalPaid);
				$('.bookingTotalToPay').last().html(bookingTotalToPay);
				$('.bookingTotalTBB').last().html(bookingTotalTBB);
				$('.allTypeBookingTotal').last().html(allTypeBookingTotal);
				$('.allTypeChargedWeightTotal').last().html(allTypeChargedWeightTotal);
				$('.allTypeActualWeightTotal').last().html(allTypeActualWeightTotal);
				$('.totalNoOfLRAllType').last().html(totalNoOfLRAllType);
				$('.totalNoOfArticlePaid').last().html(totalNoOfArticlePaid);
				$('.totalNoOfArticleToPay').last().html(totalNoOfArticleToPay);
				$('.totalNoOfArticleTBB').last().html(totalNoOfArticleTBB);
				$('.totalNoOfArticleAll').last().html(totalNoOfArticle);

				
				_this.setHeaderData(headerCollection);
				hideLayer();	
				_this.showPrintOnPopup();
			})
			
		},setHeaderData:function(headerCollection){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},renderTableValues:function(chunkArray,className){
			var htmlVariable = '';
			for(var chunk in chunkArray){
				$.each( $(className).last(), function(i, left) {
					$('div', left).each(function() {
						if(typeof $(this).attr('data-cell') != "undefined" ){
							if(chunkArray[chunk][$(this).attr('data-cell')] != undefined){
								htmlVariable += '<div class="'+$(this).attr('class')+'">'+chunkArray[chunk][$(this).attr('data-cell')]+'</div>'
							}else{
								if($(this).attr('data-fullrow')){
									htmlVariable += '<div class="'+$(this).attr('class')+'"></div>'
								}
							}
						}
					});
				})
			}
			$(className).last().html(htmlVariable);
		},showPrintOnPopup:function(){
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1){
				childwin.print();
				childwin.close();
				doneTheStuff	= false;
				childwin.opener.setValue(doneTheStuff);
			}else{
				setTimeout(function(){
					childwin.print();
					childwin.close();
					doneTheStuff	= false;
					childwin.opener.setValue(doneTheStuff);
				},200)
			}
		},setSortedSources:function(pendingSheet,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in pendingSheet){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				
					for(var i=0;(pendingSheet[sourceArray[index]]).length > i;i++) {
						pendingSheet[sourceArray[index]][i].srNo	= Number(i + 1);
					}
					
					var detsinationcollection = pendingSheet[sourceArray[index]];

				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
			}
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