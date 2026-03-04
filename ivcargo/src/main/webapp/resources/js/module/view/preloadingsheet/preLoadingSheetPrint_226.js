define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=300;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet = response.pendingDispatchmodelColl;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			headerCollection = response.PrintHeaderModel;
			currentDateTime = response.currentDateTime;
			var finalJsonObj = new Array();
			this.setSortedSources(pendingSheet,finalJsonObj);
			this.setDataForView(finalJsonObj);
		},setDataForView:function(finalJsonObj){
			
			//var sortedJsonObj	= _.sortBy(finalJsonObj,'wayBillNumber');
			/*console.log("check=====>",('#tblPtPrtDtl').exists())*/
		
		
			require(['text!/ivcargo/template/preloading/preloadingsheet_21.html'],function(PreLoadingSheet){
				$("#myGrid").empty();
				console.log("myGrid",$("#myGrid").empty())
				$("#myGrid").addClass('visible-print-block');
				console.log("myGrid",$("#myGrid").addClass('visible-print-block'))
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var totalNoOfLR = 0;
				var totalNoOfQuantity = 0;
				var totalActualWeight = 0;
				var totalBookingTotal = 0;
				for(var i = 0;i<finalJsonObj.length;i++){
					var pendingDispatchModel  = finalJsonObj[i];
					if(pendingDispatchModel.pendingQuantity > 0){
						totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
						totalActualWeight += pendingDispatchModel.consignmentSummaryActualWeight;
						totalBookingTotal += pendingDispatchModel.bookingTotal;
						totalNoOfLR++;
					}
				}
				
				$("#myGrid").append(PreLoadingSheet);
				var columnObjectForDetails		= $("[data-row='divTableRow']").children();
				var columnObjectForDetails1		= $("[data-row='divTableRow1']").children();
				for(var key in chunkArray){
					
					_this.renderTableValues(chunkArray[key],columnObjectForDetails,columnObjectForDetails1);
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').html(currentDateTime);
				}
				
				_this.setHeaderData(headerCollection);
				var tableFoot	= $("#divTableFoot");
				var html	= "<td class='divTableCell fontbold    textIndent '>&nbsp;</td><td class='divTableCell fontbold    textIndent  totalNoOfLr'>LRs- "+totalNoOfLR+"</td><td class='divTableCell fontbold    textIndent  totalNoOfArticle alignRightt' >"+totalNoOfQuantity+"</td>			<td class='divTableCell fontbold     textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent totalBookingTotal alignRightt' >"+totalBookingTotal+"</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td><td class='divTableCell fontbold    textIndent' >&nbsp;</td>"
				$(tableFoot).append(html);
				hideLayer();	
				_this.showPrintOnPopup();
			})
		},setHeaderData:function(headerCollection){
			console.log("headerCollection",headerCollection)
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			$("*[data-branch='date']").html(currentDateTime);
			$(".preloadingSheetPage").each(function(i) {
				if(i!=0){
					$(this).addClass("page-break");
					}
				});
				
		}, renderTableValues:function(chunkArray,columnObjectForDetails,columnObjectForDetails1){
			var srNum = 0;
			var eWaybillCount = 0;
			console.log("chunkArray",chunkArray)
			var tbody = $("*[data-tableBody='']");
			var tbody1 = $("*[data-tableFoot='']");
			for(var chunk in chunkArray){
				srNum ++;
				var newtr = $("<tr width='90%'></tr>");
				for(var j=0;j<columnObjectForDetails.length;j++){
					
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-cell");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-cell",dataPicker);
					if(dataPicker == 'srNum' ){
						newtd.append(srNum);
					}
					if(dataPicker == 'wayBillNumber'){
						newtd.append(chunkArray[chunk].wayBillNumber);
					}
					if(dataPicker == 'pendingQuantity'){
						newtd.append(chunkArray[chunk].pendingQuantity);
					}
					if(dataPicker == 'bookingTotal'){
						newtd.append(chunkArray[chunk].bookingTotal);
					}
					if(dataPicker == 'consigneeMobileNumber'){
						newtd.append(chunkArray[chunk].consigneeMobileNumber);
					}
					if(dataPicker == 'consigneeName'){
						newtd.append(chunkArray[chunk].consigneeName);
					}
					if(dataPicker == 'consignorName'){
						newtd.append(chunkArray[chunk].consignorName);
					}
					if(dataPicker == 'destinationSubRegionWithBranch'){
						newtd.append(chunkArray[chunk].destinationSubRegionWithBranch);
					}
					if(dataPicker == 'incomingDateTimeStampString'){
						newtd.append(chunkArray[chunk].incomingDateTimeStampString);
					}
					if(dataPicker == 'sourceSubRegionWithBranch'){
						newtd.append(chunkArray[chunk].sourceSubRegionWithBranch);
					}
					if(dataPicker == 'wayBillRemark'){
						newtd.append(chunkArray[chunk].wayBillRemark);
					}
					if(dataPicker == 'wayBillType'){
						newtd.append(chunkArray[chunk].wayBillType);
					}
					if(dataPicker == 'consignmentSummaryChargedWeight'){
						newtd.append(chunkArray[chunk].consignmentSummaryChargedWeight);
					}
					$(newtr).append($(newtd));
				}
				$(tbody).append(newtr);		
				
			}

			for(var chunk in chunkArray){
				var newtr1 = $("<tr width='70%'></tr>");
				for(var j=0;j<columnObjectForDetails1.length;j++){
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObjectForDetails1[j]).attr("data-cell1");
					$(newtd1).attr("class",$(columnObjectForDetails1[j]).attr("class"));
					$(newtd1).attr("data-cell",dataPicker);
					if(dataPicker == 'EWaybillNumber'){
						if(typeof chunkArray[chunk].ewaybillNumber != 'undefined' && chunkArray[chunk].ewaybillNumber != '--'){
							eWaybillCount++;
						newtd1.append(chunkArray[chunk].ewaybillNumber);
						}else{
						newtr1 = "";
						}
					}
					if(dataPicker == 'wayBillNumber1'){
							newtd1.append(chunkArray[chunk].wayBillNumber);
					}
					$(newtr1).append($(newtd1));
				}
				$(tbody1).append(newtr1);		
				
			}
			if(eWaybillCount == 0){
				$('#eWaybillDetails').remove();
			}
		},showPrintOnPopup:function(){
			var width = 1300;
			var height = 600;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('','newWindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
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
				},5000)
			}
		},setSortedSources:function(pendingSheet,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in pendingSheet){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){

				for(var i=0;(pendingSheet[sourceArray[index]]).length > i;i++) {
					var wayBillNumber	= pendingSheet[sourceArray[index]][i].wayBillNumber;
					var lastNumberArr	= wayBillNumber.split("/");
					pendingSheet[sourceArray[index]][i].sortWithSlash	= lastNumberArr.length;
				}
				pendingSheet[sourceArray[index]] =  _.sortBy(pendingSheet[sourceArray[index]],'sortWithSlash');

				for(var i=0;(pendingSheet[sourceArray[index]]).length > i;i++) {
					var wayBillNumber	= pendingSheet[sourceArray[index]][i].wayBillNumber;
					if(pendingSheet[sourceArray[index]][i].sortWithSlash > 1){
						pendingSheet[sourceArray[index]][i].sortWithOutSlash				= 1;
						pendingSheet[sourceArray[index]][i].wayBillNumberWithoutBranchCode	= Number(wayBillNumber.substr(wayBillNumber.indexOf("/") + 1));
					} else {
						pendingSheet[sourceArray[index]][i].sortWithOutSlash				= 0;
						pendingSheet[sourceArray[index]][i].wayBillNumberWithoutBranchCode	= Number(wayBillNumber);
					}
				}
				
				var detsinationcollection	= _.sortBy(pendingSheet[sourceArray[index]],'wayBillNumberWithoutBranchCode');
				var sortWithOutSlash 		= _.sortBy(detsinationcollection,'sortWithOutSlash');

				for(var destkey in sortWithOutSlash){
					finalJsonObj.push(sortWithOutSlash[destkey]);
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