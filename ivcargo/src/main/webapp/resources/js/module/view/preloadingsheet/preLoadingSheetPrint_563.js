define(['elementTemplateJs'
	],function(elementTemplateJs){
	var rowsPerPage	=300;
	var _this;
	var headerCollection,
	currentDateTime,destBrnachesNameCommaSep="";
	return ({
		renderElements : function(response){
			_this = this;
			var pendingSheet 			= response.pendingDispatchArraylist;
			headerCollection 			= response.PrintHeaderModel;
			currentDateTime 			= response.currentDateTime;
			destBrnachesNameCommaSep	= response.destBrnachesNameCommaSep;
			
			this.setDataForView(pendingSheet);
		}, setDataForView : function(finalJsonObj) {
			require(['text!/ivcargo/template/preloading/preLoadingSheetPrint_563.html'],function(PreLoadingSheet){
				$("#myGrid").addClass('visible-print-block');
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				var totalNoOfLR = 0;
				var totalNoOfQuantity = 0;
				var totalBookingTotal = 0;
				
				for(var i = 0; i < finalJsonObj.length; i++) {
					var pendingDispatchModel  = finalJsonObj[i];

					if(pendingDispatchModel.pendingQuantity > 0) {
						totalNoOfQuantity += pendingDispatchModel.pendingQuantity;
						totalBookingTotal += pendingDispatchModel.bookingTotal;
						totalNoOfLR++;
					}
				}
				
				$("#myGrid").append(PreLoadingSheet);
				var columnObjectForDetails		= $("[data-row='divTableRow']").children();
				var columnObjectForDetails1		= $("[data-row='divTableRow1']").children();
			
				for(var key in chunkArray) {
					_this.renderTableValues(chunkArray[key], columnObjectForDetails, columnObjectForDetails1);
					$('.pageInfo').last().html("Page " + (parseInt(key) + parseInt(1)) + " of " + TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				
				_this.setHeaderData(headerCollection);
				var tableFoot	= $("#divTableFoot");
				var html		= "<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent totalNoOfLr'>LRs- " + totalNoOfLR + "</td>" + 
								"<td class='divTableCell fontbold textIndent totalNoOfArticle alignRightt' >" + totalNoOfQuantity + "</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td><td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent totalBookingTotal alignRightt' >" + totalBookingTotal + "</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>" + 
								"<td class='divTableCell fontbold textIndent'>&nbsp;</td>";
				$(tableFoot).append(html);
				hideLayer();	
				_this.showPrintOnPopup();
			})
		}, setHeaderData : function(headerCollection){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-heading='heading']").html('Pre Loading Sheet');
			$("*[data-branch='destinationBranch']").html(destBrnachesNameCommaSep);
			
			$(".preloadingSheetPage").each(function(i) {
				if(i != 0) {$(this).addClass("page-break");}
			});
				
		}, renderTableValues : function(chunkArray, columnObjectForDetails, columnObjectForDetails1) {
			var srNum = 0;
			var eWaybillCount = 0;
			var tbody = $("*[data-tableBody='']");
			var tbody1 = $("*[data-tableFoot='']");

			for(var chunk in chunkArray) {
				srNum ++;
				var newtr = $("<tr width='90%'></tr>");

				for(var j = 0; j < columnObjectForDetails.length; j++) {
					
					var newtd = $("<td></td>");
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObjectForDetails[j]).attr("data-cell");
					$(newtd).attr("class",$(columnObjectForDetails[j]).attr("class"));
					$(newtd).attr("data-cell",dataPicker);
				
					if(dataPicker == 'srNum')
						newtd.append(srNum);
				
					if(dataPicker == 'wayBillNumber')
						newtd.append(chunkArray[chunk].wayBillNumber);
				
					if(dataPicker == 'pendingQuantity')
						newtd.append(chunkArray[chunk].pendingQuantity);
				
					if(dataPicker == 'consignmentSummaryActualWeight')
						newtd.append(chunkArray[chunk].consignmentSummaryActualWeight);
				
					if(dataPicker == 'consigneeMobileNumber')
						newtd.append(chunkArray[chunk].consigneeMobileNumber);
				
					if(dataPicker == 'consigneeName')
						newtd.append(chunkArray[chunk].consigneeName);
				
					if(dataPicker == 'consignorName')
						newtd.append(chunkArray[chunk].consignorName);
				
					if(dataPicker == 'destinationSubRegionWithBranch')
						newtd.append(chunkArray[chunk].destinationSubRegionWithBranch);
				
					if(dataPicker == 'incomingDateTimeStampString')
						newtd.append(chunkArray[chunk].incomingDateTimeStampString);
				
					if(dataPicker == 'wayBillSourceBranchName')
						newtd.append(chunkArray[chunk].wayBillSourceBranchName);
				
					if(dataPicker == 'wayBillRemark')
						newtd.append(chunkArray[chunk].wayBillRemark);
				
					if(dataPicker == 'consignmentSummaryPrivateMark')
						newtd.append(chunkArray[chunk].consignmentSummaryPrivateMark);
				
					$(newtr).append($(newtd));
				}
				
				$(tbody).append(newtr);		
			}

			for(var chunk in chunkArray) {
				var newtr1 = $("<tr width='70%'></tr>");
				
				for(var j = 0; j < columnObjectForDetails1.length; j++) {
					var newtd1 = $("<td></td>");
					var dataPicker = $(columnObjectForDetails1[j]).attr("data-cell1");
					$(newtd1).attr("class", $(columnObjectForDetails1[j]).attr("class"));
					$(newtd1).attr("data-cell", dataPicker);
					
					if(dataPicker == 'EWaybillNumber') {
						if(typeof chunkArray[chunk].ewaybillNumber != 'undefined' && chunkArray[chunk].ewaybillNumber != '--'){
							eWaybillCount++;
							newtd1.append(chunkArray[chunk].ewaybillNumber);
						} else {
							newtr1 = "";
						}
					}
					
					if(dataPicker == 'wayBillNumber1')
						newtd1.append(chunkArray[chunk].wayBillNumber);
					
					$(newtr1).append($(newtd1));
				}
				
				$(tbody1).append(newtr1);		
			}

			if(eWaybillCount == 0)
				$('#eWaybillDetails').remove();
		}, showPrintOnPopup : function() {
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