define(['elementTemplateJs'],function(elementTemplateJs){
	var rowsPerPage	=90;
	var _this;
	var headerCollection,
	dispatchLSHeader,
	currentDateTime;
	return ({
		renderElements : function(response){
			_this = this;
			var preUnloadingSheetList = _.uniq(response.preUnloadingSheetList, function(preUnloadingSheet){
			    return preUnloadingSheet.wayBillId;
			});
			
			var destObj = new Array();
			
			_.each(preUnloadingSheetList, function(preUnloadingSheet){
				destObj.push(preUnloadingSheet.wayBillDestinationBranchName);
			});
						
			var uniqDestBranch = _.uniq(destObj);
			
			var destWiseColl = new Object();
			var arrList	= null;
			_.each(uniqDestBranch, function(destBranch){
				arrList = _.where(preUnloadingSheetList, {wayBillDestinationBranchName: destBranch});
				destWiseColl[destBranch] = arrList;
			});
			
			console.log(destWiseColl);
			
			headerCollection = response.PrintHeaderModel;
			dispatchLSHeader = response.dispatchLSHeader;
			currentDateTime = response.currentDateTime;
			var finalJsonObj = new Array();
			this.setSortedDestination(destWiseColl,finalJsonObj);
			this.setDataForView(finalJsonObj,destWiseColl);
			
		},setDataForView:function(finalJsonObj,destWiseColl){
			var fileref = document.createElement("link");
			fileref.rel = "stylesheet";
			fileref.type = "text/css";
			fileref.href = "/ivcargo/resources/css/module/dispatch/preunloadingsheet.css";
			document.getElementsByTagName("head")[0].appendChild(fileref)

			require(['text!/ivcargo/template/preunloading/preunloadingsheet_5.html'],function(PreLoadingSheet){  // preunloadingsheet_4.html  has been created for ATS 
				var noOfLr		 	= 0;
				var noOfArticle 	= 0;
				var actualWeight 	= 0;
				var chargeWeight	= 0;
				var totalnoOfLr		 	= 0;
				var totalnoOfArticle 	= 0;
				var totalactualWeight 	= 0;
				var totalchargeWeight	= 0;
				var chunkArray = finalJsonObj.splitArray(rowsPerPage);
				var TotalCount = Object.keys(chunkArray).length;
				for(var key in chunkArray){
					$("#myGrid").append(PreLoadingSheet);
					_this.renderTable(chunkArray[key]);
					$('.pageInfo').last().html("Page "+(parseInt(key)+parseInt(1))+" of "+TotalCount);
					$('.currentDateTime').last().html(currentDateTime);
				}
				
				var dataKey		= Object.keys(destWiseColl);
				dataObject	= new Array(); // Object For Processing Received
				for (var i=0; i<dataKey.length; i++){
					var obj	= destWiseColl[dataKey[i]]; // Derived Array Object From Received ValueObject
					noOfLr += obj.length;
					for (var l=0; l<obj.length; l++){
						var dataObj	= obj[l];
						
						noOfArticle = noOfArticle+dataObj.consignmentSummaryQuantity;
						actualWeight = actualWeight + dataObj.consignmentSummaryActualWeight;
						chargeWeight = chargeWeight + dataObj.consignmentSummaryChargeWeight;
					}
				}
				totalnoOfLr = totalnoOfLr + noOfLr;
				totalnoOfArticle = totalnoOfArticle + noOfArticle;
				totalactualWeight = totalactualWeight + actualWeight;
				totalchargeWeight = totalchargeWeight + chargeWeight;
				$("*[data-cell='totalNoOfLr']").html(totalnoOfLr);
				$("*[data-cell='totalNoOfArticle']").html(totalnoOfArticle);
				$("*[data-cell='totalActualWeight']").html(totalactualWeight);
				$("*[data-cell='totalChargeWeight']").html(totalchargeWeight);
				
				_this.setHeaderData(headerCollection,dispatchLSHeader);
				window.print();
			})
		},setHeaderData:function(headerCollection,dispatchLSHeader){
			$("*[data-accountgroup='name']").html(headerCollection.accountGroupName);
			$("*[data-branch='name']").html(headerCollection.branchName);
			$("*[data-branch='address']").html(headerCollection.branchAddress);
			$("*[data-branch='phonenumber']").html(headerCollection.branchContactDetailPhoneNumber);
			$("*[data-lsBranch='lsBranch']").html(dispatchLSHeader.dispatchLSSourceBranchName);
			$("*[data-lsVehicle='lsVehicle']").html(dispatchLSHeader.vehicleNumber);
			$("*[data-lsDate='lsDate']").html(dispatchLSHeader.actualDispatchDateTimeString);
			if(dispatchLSHeader.truckArrivalNumber != undefined){
				$("*[data-truckArrival='truckArrivalNumber']").html(dispatchLSHeader.truckArrivalNumber);
			} else {
				$("#truckArrivalNumber").hide();
			}
			
			$(".preloadingSheetPage").each(function(i) {if(i!=0){$(this).addClass("page-break");}});
		},setSortedDestination:function(destWiseColl,finalJsonObj){
			var sourceArray = new Array();
			for(sourceBranch in destWiseColl){
				sourceArray.push(sourceBranch);
			}
			sourceArray = sourceArray.sort(function(a, b) {return a.localeCompare(b);});

			for(var index in sourceArray){
				finalJsonObj.push({
					sourcebranch:sourceArray[index]
				})
				var detsinationcollection = destWiseColl[sourceArray[index]];
				detsinationcollection = _.sortBy(detsinationcollection, 'wayBillNumber');
				for(var destkey in detsinationcollection){
					finalJsonObj.push(detsinationcollection[destkey]);
				}
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