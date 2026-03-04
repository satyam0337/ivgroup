define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=5000;
	var _this;
	var headerCollection,dispatchLSHeader,
	numberOfLr = 0,
	currentDateTime,destBrnachesNameCommaSep="";
	
	var finalJsonObj;
	var totalNoOfArticle         = 0;;
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			headerCollection = response.PrintHeaderModel;
			dispatchLSHeader = response.dispatchLSHeader;

			currentDateTime = response.currentDateTime;

			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			 finalJsonObj = new Array();
			this.setSortedSources(pendingSheet,finalJsonObj);
			this.setDataForView(finalJsonObj);
		},setDataForView:function(finalJsonObj){
			
			require(['text!/ivcargo/template/preloading/preLoadingSheetPrint_22.html'],function(PreLoadingSheet){
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
						bookingTotalToPay	   	+= pendingDispatchModel.topayFreightTotal;
						
					}
					
					

					if(pendingDispatchModel.wayBillTypeId == WAYBILL_TYPE_CREDIT){
						noOfLRTBB++;
						totalNoOfArticleTBB += pendingDispatchModel.pendingQuantity;
						totalChargedWeightTBB += pendingDispatchModel.consignmentSummaryChargedWeight;
						totalActualWeightTBB  += pendingDispatchModel.consignmentSummaryActualWeight;
						bookingTotalTBB	   	  += pendingDispatchModel.bookingTotal;

						
					}
					
					
					allTypeBookingTotal = Math.round(bookingTotalPaid + bookingTotalToPay + bookingTotalTBB) ;
					allTypeChargedWeightTotal = totalChargedWeightPaid + totalChargedWeightToPay + totalChargedWeightTBB ; 
					allTypeActualWeightTotal = totalActualWeightPaid + totalActualWeightToPay + totalActualWeightTBB ;
					totalNoOfLRAllType = noOfLRPaid + noOfLRToPay + noOfLRTBB

					totalNoOfArticle  = totalNoOfArticlePaid + totalNoOfArticleToPay + totalNoOfArticleTBB
					
				}	
				
				/*TOTAL DATA*/
				$("*[data-total='totalActualWeight']").html(allTypeActualWeightTotal);
				$("*[data-total='totalNoOfArticle']").html(totalNoOfArticle);
				$("*[data-total='allTypeChargedWeightTotal']").html(allTypeChargedWeightTotal);
				$("*[data-total='bookingTotalToPay']").html(bookingTotalToPay);

				
					$("#myGridCustom").html('')
				for(var key in chunkArray){
					$("#myGridCustom").append(PreLoadingSheet);
					_this.renderTableValues(chunkArray[key],'.leftdivTableBody');
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
					$("*[data-date='date']").html(currentDateTime);

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
				$("#totalAMtTotal").text(totalNoOfArticle);
				
				_this.setHeaderData(headerCollection);
				_this.setTableRowData(finalJsonObj,allTypeChargedWeightTotal,allTypeActualWeightTotal,totalNoOfQuantity,bookingTotalToPay,allTypeBookingTotal,noOfLRPaid,noOfLRToPay,noOfLRTBB);
				hideLayer();	
				_this.showPrintOnPopup();
			})
			
		},setTableRowData:function(tableData,allTypeChargedWeightTotal,allTypeActualWeightTotal,totalNoOfQuantity,bookingTotalToPay,allTypeBookingTotal,noOfLRPaid,noOfLRToPay,noOfLRTBB){
			hideLayer();
			$('#mainTable').empty();
		
			    let headerColumnArray = [
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Sr<br>No</th>',			  
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">WB No </th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Pkgs</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Destination<br>(Drop Point)</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">WB<br>Type</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Amt</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Sender</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Receiver</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black;border-bottom: 1px solid black;">Receiver No</th>',
			        '<th style="text-align: center;font-size:13px; border-bottom: 1px solid black; border-bottom: 1px solid black; ">Origin<br>(Branch)</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Remark</th>',
			        '<th style="text-align: center;font-size:13px;  border-right: 1px solid black; border-bottom: 1px solid black;">Booking Date</th>',
			        
			    ];
			
			    let thead = $('<thead>').append('<tr>' + headerColumnArray.join('') + '</tr>');
			
			    $('#mainTable').append(thead);
	       
			let index = 0;
          for (var i = 1; i < tableData.length; i++) {
   				let el = tableData[i]
   			function formatEwaybillNumbers(ewaybillNumber) {
				let numbers = ewaybillNumber.split(',');
                   if(numbers.length<3){
					return numbers ;
				   }
				return numbers.map((num, index) =>
					(index > 0 && index % 3 === 0 ? '<br>' : '') + num
				).join(', ');
			}
				let dataColumnArray = new Array();
				if(el.wayBillNumber != undefined){
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ (++index) +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.wayBillNumber +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.pendingQuantity +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.wayBillDestinationBranchName +"</td>");
			    dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.wayBillType +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.bookingTotal +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.consignorName +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black; max-width: 100px;'>"+ el.consigneeName +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.consigneeMobileNumber +"</td>");
			    dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.wayBillSourceBranchName +"</td>");
			    dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.wayBillRemark +"</td>");
				dataColumnArray.push("<td style='text-align: center; border-right: 1px solid black; border-bottom: 1px solid black;'>"+ el.incomingDateTimeStampString +"</td>");
				
				$("#mainTable").append('<tr>' +dataColumnArray.join(' ')+ '</tr>');

				}
				
	
			}
				
			

		    let totalDataArray = [];
		    for (let i=1; i <=headerColumnArray.length; i++) {
				if(i==6){
				  totalDataArray.push("<td style='text-align: center; font-weight: bold;'>" + allTypeBookingTotal + "</td>");
				}else if(i==2){
			      totalDataArray.push("<td style='text-align: center; border-left: 1px solid black; border-right: 1px solid black; font-weight: bold;'>"+ 'TOTAL'+ "</td>");
				}else if(i==3){
			      totalDataArray.push("<td style='text-align: center; border-left: 1px solid black; border-right: 1px solid black; font-weight: bold;'>" + totalNoOfQuantity + "</td>");
				}else{
			      totalDataArray.push("<td style='text-align: center; border-right: 1px solid black;' > </td>");
				}
		        
		    }
		    $("#mainTable tbody").append('<tr>' + totalDataArray.join('') + '</tr>');
		   
		},setHeaderData:function(headerCollection,tableData){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='branchGSTN']").html(headerCollection.branchGSTN);
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
		},showPrintOnPopup: function() {
			var width = 1000;
			var height = 600;
			var left = parseInt((screen.availWidth / 2) - (width / 2));
			var top = parseInt((screen.availHeight / 2) - (height / 2));
			childwin = window.open('', 'newwindow', config = 'height=' + height + ',width=' + width + ',left=' + left + ',top=' + top + ', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
			 var clonedElement = $("#myGridCustom").clone(true);
		  clonedElement.removeClass("hide");
		  childwin.document.write(clonedElement.html());
		  childwin.document.write('</body></html>');
			if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
				childwin.print();
				//	childwin.close();
				doneTheStuff = false;
				childwin.opener.setValue(doneTheStuff);
			} else {
				setTimeout(function() {
					childwin.print();
					//	childwin.close();
					doneTheStuff = false;
					childwin.opener.setValue(doneTheStuff);
				}, 200)
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