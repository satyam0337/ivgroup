define(function(){
	var dispatchCollection;
	var pageCollection;
	var headerCollection;
	var boolCheck 	= false;
	var headerCheck	= false;
	var $table;
	var $trObj;
	var rowsPerPage	= 80;
	var printPageMainHeader;
	var printPageSubHeader;
	var headerCount	= 0;
	var preloading		= 1;
	var preunloading	= 2;
	return ({
		renderElements : function(response,_parentObject,flag){
			headerCheck = false;
			if (flag == preloading) {				
				dispatchCollection	= response.pendingDispatchmodelColl;				
			}
			if (flag == preunloading) {
				dispatchCollection	= response.preUnLoadingSheet;				
			}
			//headerCollection	= response.dispatchLSHeader;
			headerCollection	= response.PrintHeaderModel;
			
			this.setPrintPageHeader(flag, _parentObject,'')
			
			var keys	= Object.keys(dispatchCollection);
			for (var i=0; i<keys.length; i++) {
				var dataArray	= dispatchCollection[keys];
				for (var j=0; j<dataArray.length; j+=rowsPerPage) {
					if (headerCheck) {						
						this.setPrintPageHeader(flag, _parentObject,'page-break')
					}
					pageCollection	= new Object();
					var chunkArray = dataArray.slice(j,j+rowsPerPage);
					pageCollection[keys[i]]	= chunkArray;
					var counter = 0;
					$table = $("<table id='printMainTable' cellpadding='0' cellspacing='0' border='1'/>");
					$trObj = $("<tr/>");
					boolCheck = true;			
					this.innerTable($table,counter,flag);
					if (flag == preloading) {				
						$("#myGrid").append($table);
					}
					if (flag == preunloading) {
						_parentObject.$el.append($table);
					}
					headerCheck	= true;
				}
				
			}
			this.applyCSS();
			hideLayer();
			//this.onPrint();
		},innerTable : function($table,counter,flag) {
			var dispatchData = pageCollection;
			var splitData = 0;
			for (var key in dispatchData) {
				splitData = parseInt(splitData)+ parseInt(dispatchData[key].length);
			}

			var leftTableRows = parseInt(splitData / 2);
			
			this.dispatchheaders(dispatchData,leftTableRows,counter,$table,flag);
			
		},dispatchheaders : function(dispatchData,leftTableRows,counter,$table,flag){
			var $tableinner = $("<table id='innerTable'/>");
			var $tHead = $("<thead/>");
						var $trHeadObj = $("<tr/>");

						var $thLRObject = $("<th class='width15per'>LR No</th>");
						var $thObjectArt = $("<th class='width15per'>Art.</th>");
						var $thObjectPvtMrk = $("<th class='width25per'>Pvt. Mrk.</th>");
						var $thObjectBkgDt = $("<th class='width25per'>Bkg. Dt.</th>");
						if (flag == preloading) {				
							var $thObjectLoad = $("<th>Loaded</th>");
						}
						if (flag == preunloading) {
							var $thObjectLoad = $("<th>UnLoaded</th>");
						}
					
						$trHeadObj.append($thLRObject);
						$trHeadObj.append($thObjectArt);
						$trHeadObj.append($thObjectPvtMrk);
						$trHeadObj.append($thObjectBkgDt);
						$trHeadObj.append($thObjectLoad);

						$tHead.append($trHeadObj); 

						$tableinner.append($tHead);
						
					for (var key in dispatchData) {
						var $tBody = $("<tbody/>");
						var $trData = $("<tr/>");
						var $tdData = $("<td colspan='4' class='alignLeft'>"+key+"</td>");
						
						var data = dispatchData[key];
						$trData.append($tdData);
						$tBody.append($trData);
						
						this.InnerData(dispatchData,counter,data,$tBody,leftTableRows,flag)
						}
						
				
				var $tdObj = $("<td/>");
				$($tdObj).attr('valign', 'top');
				
				$tableinner.append($tBody);
				
				$tdObj.append($tableinner);
				
				$trObj.append($tdObj);
				$table.append($trObj);
				
			},InnerData : function(dispatchData,counter,data,$tBody,leftTableRows,flag){
				for(var i=counter;i<data.length;i++){
					counter++;
					var lrData = data[i];
					
					var $trDataTable = $("<tr/>");
					if(lrData.wayBillNumber == null ){
					lrData.wayBillNumber = "--";
					}
					if (flag == preloading) {				
						if(lrData.pendingDispatchArticleQuantity == null ){
							lrData.pendingDispatchArticleQuantity = "--";
						}
					}
					if (flag == preunloading) {
						if(lrData.consignmentSummaryQuantity == null ){
							lrData.consignmentSummaryQuantity = "--";
						}
					}
					if(lrData.consignmentSummaryPrivateMark == null ){
					lrData.consignmentSummaryPrivateMark = "--";
					}
					if(lrData.consignmentSummaryActualWeight == null ){
						lrData.consignmentSummaryActualWeight = "--";
					}
					if(lrData.incomingDateTimeStampString == null ){
					lrData.incomingDateTimeStampString = "--";
					}
					
					if(lrData.godownName == null ){
						lrData.godownName = "--";
					}
					var $waybillNumber = $("<td>"+lrData.wayBillNumber+"</td>");
					if (flag == preloading) {
						var $waybillQuantity = $("<td>"+lrData.pendingDispatchArticleQuantity+"</td>");
					}
					if (flag == preunloading) {
						var $waybillQuantity = $("<td>"+lrData.consignmentSummaryQuantity+"</td>");
					}
					var $waybillPvtMrk = $("<td>"+lrData.consignmentSummaryPrivateMark+"</td>");
					var $waybillActWgt = $("<td>"+lrData.consignmentSummaryActualWeight+"</td>");
					var $waybillCreation = $("<td>"+lrData.incomingDateTimeStampString+"</td>");
					var $godownName		 = $("<td>"+lrData.godownName+"</td>");

					$trDataTable.append($waybillNumber);
					$trDataTable.append($waybillQuantity);
					$trDataTable.append($waybillPvtMrk);
					$trDataTable.append($waybillActWgt);
					$trDataTable.append($waybillCreation);
					$trDataTable.append($godownName);
					$tBody.append($trDataTable);
					if((counter % leftTableRows) == 0){
						if(boolCheck ){
							boolCheck = false;
							this.innerTable($table,counter,flag);
							break;
						}
					}
			}
		},setPrintPageHeader : function(flag, _parentObject,className){
			printPageMainHeader	= new Array();
			printPageSubHeader	= new Array();
			
			printPageMainHeader.push(headerCollection.accountGroupName);
			printPageSubHeader.push(headerCollection.branchName);
			printPageSubHeader.push(headerCollection.branchAddress);
			printPageSubHeader.push(headerCollection.branchContactDetailPhoneNumber);
			
			var mainHeaderTag;
			var subHeaderTag
			var headerArray	=	new Array();
			for (var i=0; i<printPageMainHeader.length; i++) {
				var div			= $("<div />");
				div.attr('data-headerDiv', "headerDiv");
				div.addClass(className);
				mainHeaderTag		= $("<h1 />");
				if (headerCount > 0) {				
					mainHeaderTag.attr('data-header', "mainHeader");
					$("*[data-header]").addClass("alignCenter");
				}else {
					mainHeaderTag.attr('data-header', "mainHeader");				
				}
				mainHeaderTag.append(printPageMainHeader[i]);
				div.append(mainHeaderTag)
				headerArray.push(div);
				
			}

			for (var i=0; i<printPageSubHeader.length; i++) {
				var div			= $("<div />");
				div.attr('data-headerDiv', "headerDiv");
				subHeaderTag		= $("<h4 />");
				subHeaderTag.attr('data-header', "subHeader");
				subHeaderTag.append(printPageSubHeader[i]);
				div.append(subHeaderTag)
				headerArray.push(div);
			}

			for (var i=0; i<headerArray.length; i++) {
				if (flag == preloading) {				
					$("#myGrid").append(headerArray[i]);
				}
				if (flag == preunloading) {
					_parentObject.$el.append(headerArray[i]);
				}
			}
			headerCount++;
		},applyCSS:function(SetUpConfig, _parentObject) { // Function To Apply CSS
			this.loadCss(); // To Load CSS Files
			var functionName	= "defaultCSS";//SetUpConfig.cssConfiguration; // Derived Function Name From Configuration
			eval("this."+functionName+"()"); // Call To Function
		},
		loadCss:function() { // Function To Load CSS
		    var link = document.createElement("link"); // Create link
		    link.type = "text/css"; // Set Type
		    link.rel = "stylesheet"; // Set Relativity
		    link.href = "/ivcargo/resources/css/module/dispatch/preloadingsheet.css"; // Path To File
		    document.getElementsByTagName("head")[0].appendChild(link); // Append To Document		    
		},defaultCSS:function() {
			$("*[data-header]").addClass("alignCenter");
		},
		onPrint:function() {
			var width = 800;
			var height = 500;
			var left = parseInt((screen.availWidth/2) - (width/2));
			var top = parseInt((screen.availHeight/2) - (height/2));
			childwin = window.open ('', 'newwindow', config='height='+height+',width='+width+',left='+left+ ',top='+top+', toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
			childwin.document.write('<html><head><title>Print it!</title><link rel="stylesheet" type="text/css" href="/ivcargo/resources/css/module/dispatch/preloadingsheet.css"></head><body>')
			childwin.document.write($("#myGrid").html());
			childwin.document.write('</body></html>');
			hideLayer();
			setTimeout(function(){childwin.close();childwin.print();},500);
		}
	});
});