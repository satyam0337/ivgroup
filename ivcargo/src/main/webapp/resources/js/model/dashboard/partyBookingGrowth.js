let resultObject = null;
let globalArrayForYearCheckbox=null;
let lastOneYear=false;
let forOtherYear=false;
let thisMonthOrLastMonth=false;
let selectedDateRangeLabel = null;
define([
	'slickGridWrapper2',
	PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
	,'selectizewrapper',
   /* ,JS_RESOURCES + '/resources/js/dashboard/html2canvas.min.js'*/
	,'JsonUtility'
	,'messageUtility'
	,'autocomplete'
	,'autocompleteWrapper'
	,'nodvalidation'
	,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	,'focusnavigation'//import in require.config
], function (slickGridWrapper2,Selection, Selectizewrapper) {
	'use strict';
	var jsonObject = new Object(), gridObject,myNod, _this = '';

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyBookingMisDashboardWS/getDashboardElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, getElementConfigDetails: function (response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/dashboard/partyBookingGrowth.html", function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
				
				$("#dateEle").prop('readonly', true).css('background-color', '#f5f5f5');
				setTimeout(function() {
					$('.ranges li:contains("This Month")').click();
				}, 50);

			// this is for when User Select All to region
				$("#regionEle").on("change",function(){
					console.log("hello");
					let ALLTEXT="ALL";
					let setId="-1";
					if($("#regionEle").val()==ALLTEXT){
						$("#subRegionEle").val(ALLTEXT);
						$("#subRegionEle_primary_key").val(setId);
						$("#branchEle").val(ALLTEXT);
						$("#branchEle_primary_key").val(setId);
					}
					
				})
				// this si for when user select subregion
				$("#subRegionEle").on("change",function(){
					let ALLTEXT="ALL";
					let setId="-1";
				
					if($("#subRegionEle").val()==ALLTEXT){
						$("#subRegionEle").val(ALLTEXT);
						$("#subRegionEle_primary_key").val(setId);
						$("#branchEle").val(ALLTEXT);
						$("#branchEle_primary_key").val(setId);
						
					}
					
				})
				
				// this si for when user select branch
				$("#branchEle").on("change",function(){
					let ALLTEXT="ALL";
					let setId="-1";
				
					if($("#branchEle").val()==ALLTEXT){
						$("#branchEle").val(ALLTEXT);
						$("#branchEle_primary_key").val(setId);
						
					}
					
				})
				
				/*setTimeout(function(){
				document.getElementById("controlinput_gstornameEle").addEventListener('input', function () {
					console.log("hello");		
					if(this.value!=""){
						document.querySelector('[data-attribute="consigneeorconsignor"]').parentElement.classList.remove("hide");
					}	
					else{
						document.querySelector('[data-attribute="consigneeorconsignor"]').parentElement.classList.add("hide");

					}	   
				});
				},1000);*/
							
			/*	document.addEventListener("click",function(event){
					let div=document.getElementsByClassName("dialboxpopup")[0];
					
					if(!div.contains(event.target)){
						$(".dialboxpopup").hide("slow");
					}
				})*/

				$("body").on('click', function () {
					const selectedLabel = selectedDateRangeLabel;
					if (!selectedLabel) return;

					const today = new Date();
					const isAfterMarch = (today.getMonth() + 1) >= 4;
					const currentFYStartYear = isAfterMarch ? today.getFullYear() : today.getFullYear() - 1;

					// Helper: pad 0 to single-digit numbers
					const pad = n => n < 10 ? '0' + n : n;

					// Helper: format date as DD-MM-YYYY
					const formatDate = date => `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;

					// Yesterday�s date
					const yesterday = new Date(today);
					yesterday.setDate(today.getDate() - 1);
					const endDateStr = formatDate(yesterday);

					let startDateStr = null;

					switch (selectedLabel) {
						case "This Month":
							const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
							startDateStr = formatDate(startOfMonth);
							break;

						case "This Year":
							startDateStr = `01-04-${currentFYStartYear}`;
							break;

						case "Last Financial Year":
							startDateStr = `01-04-${currentFYStartYear - 1}`;
							// Overwrite end date for full last FY
							const endFY = new Date(currentFYStartYear, 2, 31); // 31 March of currentFYStartYear
							$("#dateEle").val(`${startDateStr} - ${formatDate(endFY)}`);
							$("#dateEle").attr('data-startdate', startDateStr);
							$("#dateEle").attr('data-enddate', formatDate(endFY));
							return;

						case "Last Two Year":
							startDateStr = `01-04-${currentFYStartYear - 1}`;
							break;

						case "Last Three Year":
							startDateStr = `01-04-${currentFYStartYear - 2}`;
							break;

						case "Last Four Year":
							startDateStr = `01-04-${currentFYStartYear - 3}`;
							break;

						case "Last Five Year":
							startDateStr = `01-04-${currentFYStartYear - 4}`;
							break;

						// No action for "Last Month" or unknown labels
						default:
							return;
					}

					// Final assignment
					$("#dateEle").val(`${startDateStr} - ${endDateStr}`);
					$("#dateEle").attr('data-startdate', startDateStr);
					$("#dateEle").attr('data-enddate', endDateStr);
				});		

				let autoBillSelectionTypeName = new Object();
				autoBillSelectionTypeName.primary_key = 'wayBillTypeId';
				autoBillSelectionTypeName.field = 'wayBillType';
				
				//lrTypesEle
				$("#lrTypesEle").autocompleteCustom(autoBillSelectionTypeName);
				let autoPaymentType = $("#lrTypesEle").getInstance();

				$(autoPaymentType).each(function () {
					this.option.source = response.LrTypeLists;
				})
				
				//dataFrequencyEle
				_this.dataFrequencyInputBox(response.DataFrequencyList);

				// hiding the se																																																																																									lectize of data frequency
				function clickHandler() {
					$('#controlinput_dataFrequencyEle').blur();				  
				}

				setTimeout(clickHandler,100);

				$("#dateEle").on("change",function(){		
					let val =$("#dataFrequencyEle").parent();
					$('#dataFrequencyEle').val(val.find(".item[data-value]").attr("data-value"));							
				})

				// dataTypeEle
				let dataTypeSelection			= new Object();
				dataTypeSelection.primary_key	= 'dataTypeConstantId';
				dataTypeSelection.field			= 'value';

				$("#dataTypeEle").autocompleteCustom(dataTypeSelection)

				let DataType = $("#dataTypeEle").getInstance();
				$(DataType).each(function () {
					this.option.source = response.DataTypeList;
				})
				
				// Consginee Or Consgineer
				let Consginee			= new Object();
				Consginee.primary_key	= 'dataFrequencyConstantId';
				Consginee.field			= 'value';

				/*$("#consigneeorconsignorEle").autocompleteCustom(Consginee)

				let ConsgineeType = $("#consigneeorconsignorEle").getInstance();
				$(ConsgineeType).each(function () {
					this.option.source = response.consigneeOrConsigneer;
				})*/

				//barselection
				let barselectionSelection = new Object();
				barselectionSelection.primary_key = 'key';
				barselectionSelection.field = 'value';

				$("#barselectionEle").autocompleteCustom(barselectionSelection)

				let barselection = $("#barselectionEle").getInstance();

				$(barselection).each(function () {
					this.option.source = response.barselection;
				})

				$('#barselectionEle').val('Bar');

				var elementConfiguration = new Object();
				
				elementConfiguration.lrTypeElement 			= $('#lrTypesEle');
				elementConfiguration.regionElement			= $('#regionEle');
				elementConfiguration.subregionElement		= $('#subRegionEle');
				elementConfiguration.dataTypeElement		= $('#dataTypeEle');
				elementConfiguration.dataFrequenceElement	= $('#dataFrequencyEle');
				elementConfiguration.barselectionElement	= $('#barselectionEle');
				elementConfiguration.branchElement			= $('#branchEle');
				//elementConfiguration.ConsgineeElement			= $('#consigneeorconsignorEle');
				
				elementConfiguration.dateElement			= $("#dateEle");
				// elementConfiguration.periodElement			= $('#periodEle');

				response.elementConfiguration = elementConfiguration;
				response.sourceAreaSelection		= true;
				response.isCalenderSelection		= true;
				response.lastFinancialOneYear		= true;
				response.isTwoYearCalenderSelection = false;
				response.isThreeYearCalenderSelection = false;
				response.isFourYearCalenderSelection = false;
				response.isFiveYearCalenderSelection = false;				
				let option={
					minDate:"01-04-2018"
				}
				response.option=option;
				
				Selection.setSelectionToGetData(response);
				
//				_this.setPartyAutoComplete();

				$("#dateEle").on("change",function(){
					
					
					if($('div[data-attribute="dataFrequency"]').first().css("display")==="none"){
						$('#dataFrequencyEle').val(-1);
						$('#dataFrequencyEle_primary_key').val(-1)
					}
					else{
						$('#dataFrequencyEle').val(null);
						$('#dataFrequencyEle_primary_key').val(null);
					}
				})				
					
				$('.ranges li').each(function () {
					$(this).click(function () {
						selectedDateRangeLabel = $(this).text().trim();
						if (selectedDateRangeLabel === "Last Month" || selectedDateRangeLabel === "This Month") {
							$('#dataFrequencyEle').val(-1);
							$('#dataFrequencyEle_primary_key').val(-1);
							thisMonthOrLastMonth = true;
						} else {
							thisMonthOrLastMonth = false;
						}
					});
				});
					
				$("ul li").each(function (value, data) {
					
					if(data.innerText=="Choose Date"){
						$(data).hide();
						$(".calendar").hide();
					}

					if ((data.innerText) === "This Month" || data.innerText === "Last Month") {
						$(data).click(function () {
							forOtherYear=false;
							$("#compareCheck").prop("checked", false)
							
							$(".dialbox").hide("slow");
							$("#dialcheckbox").prop("checked",false);
							$('div[data-attribute="dataFrequency"]').first().css("display", "none")
							$('div[data-attribute="barselection"]').first().css("display", "flex")
							$("#compareCheck").parent().parent().parent().addClass("hide")
							$('#dataFrequencyEle').val(-1);
							$('#dataFrequencyEle_primary_key').val(-1)
						})
					} else if((data.innerText) ==="This Year"){
						$(data).click(function () {
							forOtherYear=false;
							$(".dialbox").show("slow");
							$('div[data-attribute="dataFrequency"]').first().css("display","flex")
							$('div[data-attribute="barselection"]').first().css("display", "flex")
							$("#compareCheck").parent().parent().parent().removeClass("hide")
							$('#dataFrequencyEle').val(null);
							$('#dataFrequencyEle_primary_key').val(null)
						});
					} else {
						$(data).click(function () {
							forOtherYear=true;
							$(".dialbox").show("slow");
							$('div[data-attribute="dataFrequency"]').first().css("display","flex")
							$("#compareCheck").parent().parent().parent().removeClass("hide")
							$('div[data-attribute="barselection"]').first().css("display", "none")

							$('#dataFrequencyEle').val(null);
							$('#dataFrequencyEle_primary_key').val(null)
						});
					}
				});
				
				_this.bindLRTypeChange();

				Selectizewrapper.setAutocomplete({
					url				:	WEB_SERVICE_URL+'/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false&billing=4',
					valueField		:	'corporateAccountId',
					labelField		:	'corporateAccountDisplayName',
					searchField		:	'corporateAccountDisplayName',
					elementId		:	'gstornameEle',
					responseObjectKey : 'result',
					create			:	false,
					maxItems		:	1
				});

				myNod = Selection.setNodElementForValidation(response);

				myNod.add({
					selector: '#dataTypeEle',
					validate: 'validateAutocomplete:#dataTypeEle_primary_key',
					errorMessage: 'Select Data Type !'
				});
				
				myNod.add({
					selector: '#lrTypesEle',
					validate: 'validateAutocomplete:#lrTypesEle_primary_key',
					errorMessage: 'Select LR Type !'
				});
			
				myNod.add({
					selector: '#dataFrequencyEle',
					validate: 'validateAutocomplete:#dataFrequencyEle',
					errorMessage: 'Select Data Frequency !'
				});
				
				/*myNod.add({
					selector: '#consigneeorconsignorEle',
					validate: 'validateAutocomplete:#consigneeorconsignorEle',
					errorMessage: 'Select Value!'
				});*/
				
				//topPartyLimitEle
				myNod.add({
					selector: '#topPartyLimitEle',
					validate: 'validateAutocomplete:#topPartyLimitEle',
					errorMessage: 'Select Top Limit !'
				});

				hideLayer();

				$("#searchBtn").click(function() {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onSubmit(_this);
				});
				
				$('#lrTypesEle').change(function() {	
					_this.bindLRTypeChange();
				});
				
				$('#gstornameEle').change(function () {
					const value = $("#controlinput_gstornameEle").siblings(".item").data("value");

					if (value !== undefined) {
						// Hide the input
						$('#topPartyLimitEle').closest('.col').hide();

						// Remove it from validation
						myNod.remove('#topPartyLimitEle');
					} else {
						// Show the input
						$('#topPartyLimitEle').closest('.col').show();

						// Re-add it to validation
						myNod.add({
							selector: '#topPartyLimitEle',
							validate: 'validateAutocomplete:#topPartyLimitEle',
							errorMessage: 'Select Top Limit !'
						});
					}
				});
				
				//topPartyLimitEle
				
				let topPartyLimit 		  =  new Object();
				topPartyLimit.primary_key = 'partyLimitId';
				topPartyLimit.field 	  = 'partyLimitName';
				
				$("#topPartyLimitEle").autocompleteCustom(topPartyLimit);
				let topPartyLimitEle = $("#topPartyLimitEle").getInstance();

				$(topPartyLimitEle).each(function () {
					this.option.source = response.PartyLimitList;
				})
			});
        }, bindLRTypeChange : function () {
			if($('#gstornameEle').selectize() != undefined)
				$('#gstornameEle').selectize()[0].selectize.destroy();
								
			var url = WEB_SERVICE_URL + '/autoCompleteWS/getPartyDetailsAutocomplete.do?isSearchByAllParty=true&isShowDeactivateParty=false';
			var finalUrl = ($("#lrTypesEle").val() == 'TBB') ? url + '&billing=4' : url;
				    
			Selectizewrapper.setAutocomplete({
				url: finalUrl,
				valueField: 'corporateAccountId',
				labelField: 'corporateAccountDisplayName',
				searchField: 'corporateAccountDisplayName',
				elementId: 'gstornameEle',
				responseObjectKey: 'result',
				create: false,
				maxItems: 1
			});
		}, dataFrequencyInputBox : function (DataFrequencyList) {
			let autoBillSelectionTypeName = new Object();
			autoBillSelectionTypeName.primary_key = 'dataFrequencyConstantId';
			autoBillSelectionTypeName.field = 'value';

			$("#dataFrequencyEle").autocompleteCustom(autoBillSelectionTypeName)
			let autoPaymentType = $("#dataFrequencyEle").getInstance();

			$(autoPaymentType).each(function () {
				this.option.source = DataFrequencyList;
			});
		}, barclickedEvent: function (jsonObject, index) {
			showLayer();
			console.log(jsonObject);
			jsonObject["index"] = index;
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyBookingMisDashboardWS/getTheBarChartEvent.do', _this.setTheBarChartEvent, EXECUTE_WITH_ERROR);
		}, setTheBarChartEvent: function (response) {
		   let monthsNameWithLable = ['-1','January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			hideLayer();
			let years = Object.keys(response);
			let chartData = [];
			let monthData = [];
			let count = 0;

			if (window.myChart !== undefined) {
				window.myChart.destroy();
			}

			const colorScheme = ['rgba(50, 168, 82, 0.5)', 'rgba(42, 53, 150, 0.5)', 'rgba(150, 100, 42, 0.5)', 'rgba(215, 237, 12, 0.5)', 'rgba(237, 12, 222, 0.5)'];
			const chartContainer = document.getElementById('mychartmis');
			$("#mychartmis").empty();

			if (years.length == 0)
				return;

			years.sort();
			let lb="Zoomed Bar";

			years.forEach((d) => {
				let insidelist = response[d];
				insidelist.forEach((insideData) => {
					if (insideData.monthOfTheYear != undefined)
						lb = monthsNameWithLable[insideData.monthOfTheYear] +" Month";
					else if (insideData.weekOfTheMonth != undefined)
						lb = insideData.weekOfTheMonth + " Week"						
					else if (insideData.quaterOfTheYear != undefined)
						lb = insideData.quaterOfTheYear + " Quater"						   
					else if (insideData.halfYearlyNo != undefined)
						lb = insideData.halfYearlyNo + " Halfyear"						  
					else if (insideData.year != undefined)
						lb = insideData.year + " Year"			 
					else if (insideData.day != undefined)
						lb = insideData.day + " Day"						
					else if (insideData.hour != undefined)
						lb = insideData.hour + " Hour"						  
					
					if (resultObject.dataType == "1")
						chartData.push(insideData.totalAmount);
					else if (resultObject.dataType == "2")
						chartData.push(insideData.totalActualWeight);
					else if (resultObject.dataType == "3")
						chartData.push(insideData.totalNoOfArticles);
					else if (resultObject.dataType == "4")
						chartData.push(insideData.totalNoOfLR);
					else if (resultObject.dataType == "5")
						chartData.push(insideData.totalAmount);
					else if (resultObject.dataType == "6")
						chartData.push(insideData.totalNoOfCr);
					 else if (resultObject.dataType == "7")
						chartData.push(insideData.totalDeliverytotal);	

					monthData.push(insideData.year);
				})
			})

			const div = document.createElement("div");
			const div1 = document.createElement("div");

			div1.style.width = "60%";
			div1.style.height = "50%"
			div1.style.margin = "auto";

			let infodataDiv		= document.createElement("div");
			let buttonsDiv		= document.createElement("div");
			let firstOneDiv		= document.createElement("div");
			let desDiv			= document.createElement("div");
			let execelDwBtn		= document.createElement("button");
			let pdfDwBtn		= document.createElement("button");
			let printBtn		= document.createElement("button");
			
			printBtn.className="btn";
			printBtn.innerText="Print";

			execelDwBtn.className = "btn"
			execelDwBtn.innerText = "Download Excel"
			pdfDwBtn.className="btn";
			pdfDwBtn.innerText="Download Pdf File"
			infodataDiv.className = "infodata";
			buttonsDiv.className = "buttons";
			firstOneDiv.className = "firstOne";
			execelDwBtn.style.display="none";
			desDiv.className="desDiv"
			desDiv.innerHTML=`<h4> You are currently viewing <span class="highliteHeading"> ${lb} </span> data of <span class="highliteHeading"> all the years </span> </h4>`

				buttonsDiv.append(execelDwBtn);
				buttonsDiv.append(pdfDwBtn);
				buttonsDiv.append(printBtn);
				
				pdfDwBtn.addEventListener("click",function(){
					buttonsDiv.remove();
					html2canvas(div).then(canvas => {
						const pdf = new jsPDF('landscape');
						const imageData = canvas.toDataURL('image/png');
						pdf.addImage(imageData, 'PNG', 10, 10, 250, 150); // Adjust the position and size as needed
						pdf.save('chart_with_text.pdf');
					});
					
					infodataDiv.prepend(buttonsDiv);
								
				})

				execelDwBtn.addEventListener("click", function () {
					let jsonObjectXlarr =[];
					let obj={
						region:$('#regionEle').val(),
						subregion:$('#regionEle').val(),
						branch:$('#subRegionEle').val(),
						dataType:$('#dataTypeEle').val(),
						lrType:$('#lrTypesEle').val(),
						DataFrequency:$("#dataFrequencyEle").val(),
						period:$("#dateEle").attr('data-startdate') + " TO " + $("#dateEle").attr('data-enddate'),
					}
					jsonObjectXlarr.push(obj);
					monthNames.forEach((elementInsidefor,index)=>{
						let obj2={
							dataType:dataList[index],
							DataFrequency:monthNames[index]
						}
						jsonObjectXlarr.push(obj2);
					});

					_this.downloadExcelfile(jsonObjectXlarr);
				})

			jsonObject = new Object();

			if ($("#dateEle").attr('data-startdate') != undefined) {
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
			}

			if ($("#dateEle").attr('data-enddate') != undefined) {
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			}

			firstOneDiv.innerHTML = `
				  <h3>Report Name - <span>${$('[data-selector="header"]').text().trim()}</span></h3>
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
				  <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
				  <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
				  <h3>Party Name - <span>${$('#gstornameEle_wrapper .selectize-input').text().trim()}</span></h3>
				  <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
				
				  <h3>Data Frequency- <span>${$("#dataFrequencyEle").val()}</span></h3>
				  <h3>Period- <span> All The Years	</span></h3>
				  <h3>LR Type- <span>${$('#lrTypesEle').val()}</span></h3>
				  `;
			infodataDiv.append(buttonsDiv);
			infodataDiv.append(desDiv);
			infodataDiv.append(firstOneDiv);

			const canvas = document.createElement('canvas');
			canvas.className = 'chartCanvas';
			div1.append(canvas);
			div.append(infodataDiv)
			div.append(div1);
			chartContainer.appendChild(div);

			const ctx = canvas.getContext('2d');
			// Create the chart
			let monthNames = monthData;
			let dataList = chartData;
			Chart.register(ChartDataLabels);

			window.myChart = new Chart(ctx, {
				type: $('#barselectionEle').val().toLowerCase(),
				data: {
					labels: monthNames,
					datasets: [{
						label: lb,
						data: dataList,
						backgroundColor: dataList.map((value, index) => {
							if (value === Math.max(...dataList.filter((value) => typeof value === 'number'))) {
								return 'rgba(0, 255, 69, 1)';
							} else if (value === Math.min(...dataList.filter((value) => typeof value === 'number'))) {
								return 'rgba(255, 0, 0, 1)';
							} else {
								return colorScheme[index % colorScheme.length];
							}
						}),
						borderColor: dataList.map((value, index) => {
							if (value ===Math.max(...dataList.filter((value) => typeof value === 'number'))) {
								return 'rgba(0, 255, 69, 1)';
							} else if (value === Math.min(...dataList.filter((value) => typeof value === 'number'))) {
								return 'rgba(255, 0, 0, 1)';
							} else {
								return colorScheme[index % colorScheme.length];
							}
						}),
						borderWidth: 1,
						maxBarThickness: 100,
						// minBarLength:100
					},
					{
						label: lb,
						data: dataList,
						backgroundColor: "rgba(4, 2, 5, 0.1)",
						borderColor: "rgba(4, 2, 5, 0.1)",
						borderWidth: 0.1,
						maxBarThickness: 100,
						minBarLength: Math.max(...dataList.filter((value) => typeof value === 'number')),
						// barThickness: 50 
					}
					]
				},
				options: {
					onClick: function (event, chartElements) {
					},
					responsive: true,
					scales: {
						y: {
							// max: Math.max(...dataList.filter((value) => typeof value === 'number')),

							stacked: true,
							beginAtZero: true,
							 grace: "50%",
							grid: {
								color: '#ccc'
							},
							ticks: {
								font: {
									family: 'Arial',
									size: 12,
									color: '#333'
								}
							}
						},
						x: {
							stacked: true,
							ticks: {
								font: {
									family: 'Arial',
									size: 12,
									color: '#333'
								}
							}
						}
					}, plugins: {
						datalabels: {
							anchor: 'end',
							align: 'top',
							rotation:270,
							anchor: (context) => {
								return context.datasetIndex === 0 ? 'end' : 'start';
							}, formatter: (value, context) => {
								  if(context.datasetIndex === 0) {
										if(value>0){
										if (typeof value === 'number' && !isNaN(value)){
											  const formatter = new Intl.NumberFormat('en-IN');
												return formatter.format(value);
											  }
										 }
									}
									return "";
								},
						},
					},
				},
			});
			printBtn.addEventListener("click",function(){
				   buttonsDiv.remove();
					window.myChart.render();					
					 setTimeout(()=>{
					infodataDiv.prepend(buttonsDiv);
				   },1000);
					_this.printChart(infodataDiv,canvas);
				})
			count++;
			chartData = [];
			monthData = [];
		}, setChartforOtherYear : function(response){
						console.log("hello this is for set chart for Other year");

			$('#bottom-border-boxshadow').removeClass('hide');
			
			let data=response;
			const colors = ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)", "rgba(75, 192, 192, 0.7)","rgba(252, 227, 3)","rgba(3, 32, 252)","rgba(153,50,204)","rgba(47,79,79)"];
			const years = Object.keys(data).sort((a, b) => a.localeCompare(b));
			let monthsNameWithLable = [ 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December','January', 'February', 'March'];
			let weekData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
			let quarterData = ["Q1", "Q2", "Q3", "Q4"];
			let halfYearData = ["H1", "H2"];
			let monthNamewithNumber = [4, 5, 6, 7, 8, 9, 10, 11, 12,1,2,3];
			let growthLabel="";
			let cl=-1;	 
			let barType="line";
			let rotation=270;
			let avgCaptionToolTip="";
			const chartContainer = document.getElementById('mychartmis');
			let labless=[];
			let avgFlagInsteadAmount=false;
			let avgLrCountLabel="totalNoOfLR";
			
			 $("#mychartmis").empty();
			let dataType="totalNoOfArticles";
			if (resultObject.dataType == "1"){
				dataType="totalAmount";
				avgCaptionToolTip="Avg Booking Value Amount";
				
				}
			else if (resultObject.dataType == "2"){
				dataType="totalActualWeight";
				avgFlagInsteadAmount=true;
				avgCaptionToolTip="Avg ActualWeight Value";

				}
			else if (resultObject.dataType == "3"){
				dataType="totalNoOfArticles";
				avgFlagInsteadAmount=true;
				avgCaptionToolTip="Avg Article Value ";

				}
			else if (resultObject.dataType == "4"){
				dataType="totalNoOfLR";
				avgFlagInsteadAmount=true;
				avgCaptionToolTip="Avg LR Value ";

				}
			else if (resultObject.dataType == "5"){
				dataType="totalAmount";
				avgCaptionToolTip="Avg	Value Amount";

				
				
				}
			else if (resultObject.dataType == "6"){
				dataType="totalNoOfCr";
				avgFlagInsteadAmount=true;
				avgCaptionToolTip="Avg CR Value ";

				}
				
			else if (resultObject.dataType == "7"){
				dataType="totalDeliverytotal";
				avgCaptionToolTip="Avg TotalDelivery Value Amount";

				}
			 
			  
			  if (resultObject.dataFrequency == "3") {
					labless=monthsNameWithLable;
					barType="line";
					rotation=360;
					growthLabel="MOM"
				} else if (resultObject.dataFrequency == "4") {
						labless=quarterData;
						barType="bar";
						rotation=270;
						growthLabel="QOQ";
				   
				} else if (resultObject.dataFrequency == "5") {
					labless=halfYearData;
					barType="bar";
					rotation=270;
					growthLabel="HOH"
					
				}  
				else if (resultObject.dataFrequency == "6") {
					labless=years;
					barType="bar";
					rotation=270;
					growthLabel="YOY"
					
				}  
	  
				let datasets= years.map((year,index)=>{
				
			   if (resultObject.dataFrequency == "3") {
					//month
					return	({
							label: year,
							data: monthNamewithNumber.map((month, index) => {
								const monthData = data[year].find(entry => entry.monthOfTheYear === month);
								return monthData ? monthData[dataType] : 0;
							}),
							backgroundColor: colors[++cl],
							borderColor:  colors[cl],
							borderWidth: 2.5,
							minBarLength:100,
							dataForAvgLr:monthNamewithNumber.map((month, index) => {
								const monthData = data[year].find(entry => entry.monthOfTheYear === month);
								return monthData ? monthData[avgLrCountLabel] : 0;
							}),
							
							
						  })
				   
				} else if (resultObject.dataFrequency == "4") {
					// quarterData
					return	({
							label: year,
							data: quarterData.map((qd, index) => {
								const quaterDatamap = data[year].find(entry => entry.quaterOfTheYear === index+1);
								return quaterDatamap ? quaterDatamap[dataType] : 0;
							}),
							backgroundColor: colors[++cl],
							borderColor:  colors[cl],
							borderWidth: 2.5,
							dataForAvgLr: quarterData.map((qd, index) => {
								const quaterDatamap = data[year].find(entry => entry.quaterOfTheYear === index+1);
								return quaterDatamap ? quaterDatamap[avgLrCountLabel] : 0;
							}),
							//minBarLength:100
						})
					
				} else if (resultObject.dataFrequency == "5") {
					// halfyeardata
					return	({
						label: year,
						data: halfYearData.map((hf, index) => {
							const halfYearDataMap = data[year].find(entry => entry.halfYearlyNo === index+1);
							return halfYearDataMap ? halfYearDataMap[dataType] : 0;
						}),
						backgroundColor: colors[++cl],
						borderColor:  colors[cl],
						borderWidth: 2.5,
						dataForAvgLr:halfYearData.map((hf, index) => {
							const halfYearDataMap = data[year].find(entry => entry.halfYearlyNo === index+1);
							return halfYearDataMap ? halfYearDataMap[avgLrCountLabel] : 0;
						}),
						//minBarLength:100
					 })

				}
				else if (resultObject.dataFrequency == "6") {
					// halfyeardata
					return	({
						label: year,
						data: years.map((yr, index) => {
							const yearDataMap = data[year].find(entry => entry.financialYearStr === yr);
							return yearDataMap ? yearDataMap[dataType] : 0;
						}),
						backgroundColor: colors[++cl],
						borderColor:  colors[cl],
						borderWidth: 2.5,
						dataForAvgLr:years.map((yr, index) => {
							const yearDataMap = data[year].find(entry => entry.financialYearStr === yr);
							return yearDataMap ? yearDataMap[avgLrCountLabel] : 0;
						})
						//minBarLength:100
					 })
					 

				}
				
				return 0;
				
				})
				// years loop end
				
				if (window.myChart !== undefined) {
					window.myChart.destroy();
				}

			const div = document.createElement("div");
			const div1 = document.createElement("div");

			div1.style.width = "90%";
			div1.style.height = "80%"
			div1.style.margin = "auto";

			let infodataDiv		= document.createElement("div");
			let dataFrequency	="Daily";
			let buttonsDiv		= document.createElement("div");
			let firstOneDiv		= document.createElement("div");
			let desDiv			= document.createElement("div");
			let execelDwBtn		= document.createElement("button");
			let pdfDwBtn		= document.createElement("button");
			let printBtn		= document.createElement("button");
			
			printBtn.className="btn";
			printBtn.innerText="Print";

			execelDwBtn.className = "btn"
			execelDwBtn.innerText = "Download Excel"
			pdfDwBtn.className="btn";
			pdfDwBtn.innerText="Download Pdf File"
			infodataDiv.className = "infodata";
			buttonsDiv.className = "buttons";
			firstOneDiv.className = "firstOne";
			desDiv.className="desDiv"
			execelDwBtn.style.display="none";
			//desDiv.innerHTML=`<h4> You are currently viewing <span class="highliteHeading"> ${lb} </span> data of <span class="highliteHeading"> all the years </span> </h4>`

				buttonsDiv.append(execelDwBtn);
				buttonsDiv.append(pdfDwBtn);
				buttonsDiv.append(printBtn);
				
				pdfDwBtn.addEventListener("click",function(){
					 buttonsDiv.remove();
							   html2canvas(div).then(canvas => {
									const pdf = new jsPDF('landscape');
									const imageData = canvas.toDataURL('image/png');
									pdf.addImage(imageData, 'PNG', 10, 10, 250, 150); // Adjust the position and size as needed
									pdf.save('chart_with_text.pdf');
								  });
					infodataDiv.prepend(buttonsDiv);
								
				})

			   /* execelDwBtn.addEventListener("click", function () {
				   let jsonObjectXlarr =[];
				   let obj={
					   region:$('#regionEle').val(),
					   subregion:$('#regionEle').val(),
					   branch:$('#subRegionEle').val(),
					   dataType:$('#dataTypeEle').val(),
					   DataFrequency:$("#dataFrequencyEle").val(),
					   period:$("#dateEle").attr('data-startdate')+" TO "+$("#dateEle").attr('data-enddate'),
					   lrType:$('#lrTypesEle').val()
				   }
					jsonObjectXlarr.push(obj);
				   monthNames.forEach((elementInsidefor,index)=>{
					   let obj2={
						   dataType:dataList[index],
						   DataFrequency:monthNames[index]
						   
					   }
					   jsonObjectXlarr.push(obj2);
				   })

					_this.downloadExcelfile(jsonObjectXlarr);
				})*/

			jsonObject = new Object();

			if ($("#dateEle").attr('data-startdate') != undefined) {
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
			}

			if ($("#dateEle").attr('data-enddate') != undefined) {
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
			}
			if($("#dataFrequencyEle").val()!=-1){
					dataFrequency=$("#dataFrequencyEle").val();
				}

			firstOneDiv.innerHTML = `
				  <h3>Report Name - <span>${$('[data-selector="header"]').text().trim()}</span></h3>
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
				  <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
				  <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
				  <h3>Party Name - <span>${$('#gstornameEle_wrapper .selectize-input').text().trim()}</span></h3>
				  <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
				
				  <h3>Data Frequency- <span>${dataFrequency}</span></h3>
				  <h3>Period- <span> ${jsonObject.fromDate} </span> TO <span>${jsonObject.toDate}</span> </h3>
				  <h3>LR Type- <span>${$('#lrTypesEle').val()}</span></h3>
				  `;
			if(resultObject.dataType=="2"){
				 firstOneDiv.innerHTML+=`<h3>Weight:-  <span>1Ton=1000KG</span></h3>`
			}
			infodataDiv.append(buttonsDiv);
			infodataDiv.append(desDiv);
			infodataDiv.append(firstOneDiv);

			const canvas = document.createElement('canvas');
			canvas.className = 'chartCanvas';
			div1.append(canvas);
			div.append(infodataDiv)
			div.append(div1);
			chartContainer.appendChild(div);

			const ctx = canvas.getContext('2d');
			Chart.register(ChartDataLabels);
			console.log("=========================");
			console.log(labless);
			console.log(datasets);
			
			function kgToTon(kg) {
				if(kg!=undefined)
					return Number((kg / 1000).toFixed(2));
						
					return undefined;
			}
			
			if (resultObject.dataType == "2"){

				datasets.forEach(function (item) {
					
					item.data = item.data.map(kgToTon);
					console.log("item",item)
				});
			}
			
			// puting the space between bar and chart 
			/*datasets.forEach(function (item) {
					item.data.push(null)
					item.data.unshift(null);
					item.dataForAvgLr.push(null)
					item.dataForAvgLr.unshift(null);
					 console.log("item",item)
					 console.log(labless);
				});
		   labless.push(" ");
		   labless.unshift(" ");*/
			window.myChart = new Chart(ctx, {
				type: barType,
				  data: {
					labels: labless,
					datasets: datasets,
				  },
				options: {
					responsive: true,
					scales: {
						y: {
							beginAtZero: true,
							 grace: "50%",
							grid: {
								color: '#ccc'
							},
							ticks: {
								font: {
									family: 'Arial',
									size: 12,
									color: '#333'
								}
							}
						},
						x: {
							ticks: {
								font: {
									family: 'Arial',
									size: 12,
									color: '#333'
								}
							}
						}
					}, plugins: {
						 
						tooltip: {
						enabled: true,
						callbacks: {
							label: function (context) {
								console.log(context)
								let crtPercentageGrowthData=0;
								let prPercentageGrowthData=0;
								let oldValue=0;
								let newValue=0;
								let arr		=context.dataset.data;
								
								if(context.dataIndex>0){
									oldValue=arr[context.dataIndex-1];
									newValue=arr[context.dataIndex];
									 if (oldValue !== 0) {
										crtPercentageGrowthData = ((newValue - oldValue) / oldValue) * 100;
									} else {
										crtPercentageGrowthData =100;
									}
									

								}
								if(context.datasetIndex>0){
									oldValue=datasets[context.datasetIndex-1].data[context.dataIndex]
									newValue=datasets[context.datasetIndex].data[context.dataIndex]
									if (oldValue !== 0) {
										prPercentageGrowthData = ((newValue - oldValue) / oldValue) * 100;
									} else {
										prPercentageGrowthData = 100;
									}
									console.log(prPercentageGrowthData,newValue,oldValue);
									console.log(datasets[context.datasetIndex-1])
									
								}
							 var sum = arr.reduce(function (acc, value) {
								if (typeof value === 'number' && !isNaN(value)) {
									return acc + value;
								}
								return acc;
							}, 0);
							console.log(context);
							console.log("hello")
							let firstAvg=datasets[context.datasetIndex].data[context.dataIndex] 
							let secAvg	=datasets[context.datasetIndex].dataForAvgLr[context.dataIndex]
							let avgValue=((datasets[context.datasetIndex].data[context.dataIndex] / datasets[context.datasetIndex].dataForAvgLr[context.dataIndex]).toFixed(1)).toLocaleString('en-IN');
							let divideByDays=0;
							if(avgFlagInsteadAmount){
								const getDays = (year, month) => {
									return new Date(year, month, 0).getDate();
								};
								
								divideByDays = getDays(new Date().getFullYear(), new Date().getMonth() + 1);
								console.log("hello",divideByDays);
								avgValue=((datasets[context.datasetIndex].data[context.dataIndex] / divideByDays).toFixed(1)).toLocaleString('en-IN');
							
							}
							
						  let showLabel=context.dataset.label.split("-")[0];
							if(resultObject.dataFrequency == "3"){
								if(context.dataIndex>=9)
									showLabel=context.dataset.label.split("-")[1];
							}
							
							let yearlyAvgdivide= arr.length;
							if(showLabel==new Date().getFullYear()){
								yearlyAvgdivide=new Date().getMonth();
								
							}
							var current = "Current Year "+growthLabel+" Growth	- " + ' ' +crtPercentageGrowthData.toFixed(1) + '%';
							var preious = "Previous Year YOY Growth - " + ' ' + prPercentageGrowthData.toFixed(1) + '%';
							var curAvg = ""+avgCaptionToolTip+" -  "+ _this.convertTheNumberToIndinan(avgValue);
							var avg = "Yearly Avg -	 " + '' + _this.convertTheNumberToIndinan((sum / yearlyAvgdivide).toFixed(1)) + '';
							if(firstAvg==0&&secAvg==0)curAvg=""+avgCaptionToolTip+"-  "+ ""+0 +"";
							
							
							return [context.label+" ("+showLabel+") Data - "+context.formattedValue,current, preious,curAvg,avg]
						 },
					  
						
						
						},
						
					},
						datalabels: {
							anchor: 'end',
							align: 'end',
							
							
							rotation:rotation,
							formatter: (value, context) => {
								 
										if(value>0){
										if (typeof value === 'number' && !isNaN(value)){
											  const formatter = new Intl.NumberFormat('en-IN');
												return formatter.format(value);
											  }
										 }
									
									return "";
								},
						   color: function (context) {
								
								
							  return context.dataset.backgroundColor;
							},
								
						},
					},
				},
			});
			printBtn.addEventListener("click",function(){
				   buttonsDiv.remove();
					window.myChart.render();					
					 setTimeout(()=>{
					infodataDiv.prepend(buttonsDiv);
				   },1000);
					_this.printChart(infodataDiv,canvas);
				})
			
		},tableData:function(response){
			 $("#mychartmis").empty();

					if(response.message != undefined) {
						hideLayer();
						refreshAndHidePartOfPage('bottom-border-boxshadow', 'hide');
						return;
					}
					
					
					if(response.CorporateAccount != undefined) {
						hideAllMessages();
						$('#bottom-border-boxshadow').show();
						
						slickGridWrapper2.setGrid(response);
					}
					
					hideLayer();
			
		}
		, printChartFirst : function(response1){
			console.log("==================================================")
			console.log(response1);
			console.log($('#controlinput_gstornameEle').val());
			if($("#controlinput_gstornameEle").siblings(".item").data("value")==undefined){
				_this.tableData(response1)
			}
			else if(forOtherYear)
				_this.setChartforOtherYear(response1);
			else
				_this.setChartOnyear(response1);
		}, setChartOnyear: function (response) {
			console.log("hello this is for setChartOnYear");
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			response=_this.chagneTheResponseForYear(response);
			let years = Object.keys(response);
			
			console.log(response,years);
			
			if (years.length == 0) { 
				hideLayer(); 
				$("#mychartmis").empty();
				return; 
			}

			let chartData = [];
			let monthData = [];

			let monthsNameWithLable = ['-1', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			let weekData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
			let quarterData = [1, 2, 3, 4];
			let halfYearData = [1, 2];
			let days = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
			let hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];
			let monthNamewithNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
			let count = 0;
			let avgByYear=[];
			let avgCaptionToolTip="";
			let growthLabel="";
			let avgFlagInsteadAmount=false;
			
			

			if (window.myChart !== undefined) {
				window.myChart.destroy();
			}

			const colorScheme = ['rgba(50, 168, 82, 0.5)', 'rgba(42, 53, 150, 0.5)', 'rgba(150, 100, 42, 0.5)', 'rgba(215, 237, 12, 0.5)', 'rgba(237, 12, 222, 0.5)'];
			const chartContainer = document.getElementById('mychartmis');

			$("#mychartmis").empty();
			let flag = false;
			years.sort();
			years.reverse();
			console.log(years);
			years.forEach((d, index) => {
				let insidelist = response[d];
				if (insidelist == null || insidelist.messageId != undefined) { hideLayer(); return; }
				
				insidelist.forEach((insideData) => {
					if (resultObject.dataType == "1"){
						chartData.push(insideData.totalAmount);
						avgCaptionToolTip="Avg Booking Value Amount";

						
						}
					else if (resultObject.dataType == "2"){
							chartData.push(insideData.totalActualWeight);
							avgFlagInsteadAmount=true;
							avgCaptionToolTip="Avg ActualWeight Value";
						
						}
					else if (resultObject.dataType == "3"){
							chartData.push(insideData.totalNoOfArticles);
							avgFlagInsteadAmount=true;
							avgCaptionToolTip="Avg Article Value ";
						
						}
					else if (resultObject.dataType == "4"){
							 chartData.push(insideData.totalNoOfLR);
							 avgFlagInsteadAmount=true;
							 avgCaptionToolTip="Avg LR Value ";
						
						}
					else if (resultObject.dataType == "5"){
						chartData.push(insideData.totalAmount);
						 avgCaptionToolTip="Avg	 Value Amount";
						
						}
					else if (resultObject.dataType == "6"){
						chartData.push(insideData.totalNoOfCr);
						avgFlagInsteadAmount=true;
						avgCaptionToolTip="Avg CR Value ";
						
						}
					 else if (resultObject.dataType == "7"){
						chartData.push(insideData.totalDeliverytotal);	
						avgCaptionToolTip="Avg TotalDelivery Value Amount";
						}
						
					   

					avgByYear.push(insideData.totalNoOfLR);
					// inserting data of month
					if (insideData.monthOfTheYear != undefined) {
						monthData.push(insideData.monthOfTheYear);
						flag = true;
					}  else if (insideData.weekOfTheMonth != undefined)
						monthData.push(insideData.weekOfTheMonth);
					else if (insideData.quaterOfTheYear != undefined)
						monthData.push(insideData.quaterOfTheYear);
					else if (insideData.halfYearlyNo != undefined)
						monthData.push(insideData.halfYearlyNo);
					else if (insideData.year != undefined)
						monthData.push(d.split("-")[1]);
					else if (insideData.day != undefined)
						monthData.push(insideData.day);
					else if (insideData.hour != undefined)
						monthData.push(insideData.hour);
				})

				// here we will create the chart 

				let dataList = chartData;
				let monthNames = [];
				const dataByLabel = {};

				if (resultObject.dataFrequency == "1") {
					hours.forEach((hour) => {
						if (!monthData.includes(hour))
							monthData.push(hour);
					})
				} else if (resultObject.dataFrequency == "2") {
					weekData.forEach((week) => {
						if (!monthData.includes(week))
							monthData.push(week);
					});
				} else if (resultObject.dataFrequency == "3") {
					growthLabel="MON";
					monthNamewithNumber.forEach((month) => {
						if (!monthData.includes(month))
							monthData.push(month);
					});
				} else if (resultObject.dataFrequency == "4") {
					 growthLabel="QOQ";
					quarterData.forEach((quater) => {
						if (!monthData.includes(quater))
							monthData.push(quater);
					});
				} else if (resultObject.dataFrequency == "5") {
					 growthLabel="HOH";
					halfYearData.forEach((half) => {
						if (!monthData.includes(half))
							monthData.push(half);
					});
				} else if (resultObject.dataFrequency == "-1") {
					days.forEach((day) => {
						if (!monthData.includes(day))
							monthData.push(day);
					});
				}
				
				if(resultObject.dataFrequency == "-1"){
					growthLabel="YOY";
				}

				var i, j, temp;
				var swapped;
				var n = monthData.length;
			   
				for (i = 0; i < n - 1; i++) {
					swapped = false;
			   
					for (j = 0; j < n - i - 1; j++) {
						if (monthData[j] > monthData[j + 1]) {
							temp = monthData[j];
							monthData[j] = monthData[j + 1];
							monthData[j + 1] = temp;

							let temp1 = dataList[j];
							dataList[j] = dataList[j + 1];
							dataList[j + 1] = temp1;
							
							
							 let temp2 = avgByYear[j];
							avgByYear[j] = avgByYear[j + 1];
							avgByYear[j + 1] = temp2;
							swapped = true;
						}
					}

			console.log("datalist====================")
			console.log(dataList);
			console.log("avgbyyear")
			console.log(avgByYear);
					if (swapped == false)
						break;
				}

				monthNames = monthData;

				if (flag) {
					let monthnamesinside = [];
					monthNames.forEach((mt) => {
						monthnamesinside.push(monthsNameWithLable[mt]);
					})
					
					monthNames=monthnamesinside;
				   let arr1=  monthNames.slice(3, monthNames.length);
				   arr1.push("January");
				   arr1.push("February");
				   arr1.push("March");
				  
				   try{

						const firstThreeDataList = dataList.splice(0, 3)
						dataList.push(...firstThreeDataList); 
						const firstThreeAvg = avgByYear.splice(0, 3)
						avgByYear.push(...firstThreeAvg); 
				   
					   /*let value=0;
					   value=dataList.shift();
					   arr2.push(value);
					   value=dataList.shift();
					   arr2.push(value);
					   value=dataList.shift();
					   arr2.push(value);*/
	   
				   } catch(error){}
				   monthNames=arr1;
				}
				  
					const newArray = [];
					for (let i = 0; i < monthNames.length; i++) {
					
					  if(resultObject.dataFrequency == "2")
						 newArray.push("w" + monthNames[i]);
					   
					  if(resultObject.dataFrequency == "4")
						 newArray.push("Q" + monthNames[i]);

					  if(resultObject.dataFrequency == "5")
						newArray.push("H" + monthNames[i]);
					}

				if(newArray.length!=0)
					monthNames=newArray;

				console.log("==== avgByYear>=== ",avgByYear)
				if (dataList.length != monthNames.length) {
					for (let i = dataList.length; i < monthNames.length; i++) {
						dataList.push(undefined);
						avgByYear.push(undefined);
					}
				}
				console.log("==== avgByYear>=== ",avgByYear)

				const div = document.createElement("div");
				let dataFrequency="Daily";
				let div2 = document.createElement("div");
				let infodataDiv = document.createElement("div");
				let buttonsDiv = document.createElement("div");
				let firstOneDiv = document.createElement("div");
				let desDiv=document.createElement("div");
				let execelDwBtn = document.createElement("button");
				let printBtn=document.createElement("button");
				let pdfDwBtn = document.createElement("button");
				printBtn.className="btn";
				printBtn.innerText="Print";
				execelDwBtn.className = "btn"
				execelDwBtn.innerText = "Download Excel"
				pdfDwBtn.className="btn";
				pdfDwBtn.innerText="Download Pdf File"
				infodataDiv.className = "infodata";
				buttonsDiv.className = "buttons";
				firstOneDiv.className = "firstOne";
				execelDwBtn.style.display="none";
				buttonsDiv.append(execelDwBtn);
				buttonsDiv.append(pdfDwBtn);
				buttonsDiv.append(printBtn)
			 pdfDwBtn.addEventListener("click",function(){
					 buttonsDiv.remove();
							   html2canvas(div).then(canvas => {
									const pdf = new jsPDF('landscape');
									const imageData = canvas.toDataURL('image/png');
									pdf.addImage(imageData, 'PNG', 10, 10, 250, 150); // Adjust the position and size as needed
									pdf.save('chart_with_text.pdf');
								  });
					infodataDiv.prepend(buttonsDiv);
			})
			
			execelDwBtn.addEventListener("click", function () {
				   let jsonObjectXlarr =[];
				   let obj={
					   region:$('#regionEle').val(),
					   subregion:$('#regionEle').val(),
					   branch:$('#subRegionEle').val(),
					   dataType:$('#dataTypeEle').val(),
					   lrType:$('#lrTypesEle').val(),
					   DataFrequency:$("#dataFrequencyEle").val(),
					   period:$("#dateEle").attr('data-startdate')+" TO "+$("#dateEle").attr('data-enddate'),
				   }
				  
					jsonObjectXlarr.push(obj);
				   monthNames.forEach((elementInsidefor,index)=>{
					   let obj2={
						   dataType:dataList[index],
						   DataFrequency:monthNames[index]
						   
					   }
					   jsonObjectXlarr.push(obj2);
				   })

					_this.downloadExcelfile(jsonObjectXlarr);
				})
				
				jsonObject = new Object();

				if ($("#dateEle").attr('data-startdate') != undefined) {
					jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
				}

				if ($("#dateEle").attr('data-enddate') != undefined) {
					jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
				}
				
				if($("#dataFrequencyEle").val()!=-1){
					dataFrequency=$("#dataFrequencyEle").val();
				}
				firstOneDiv.innerHTML = `
				  <h3>Report Name - <span>${$('[data-selector="header"]').text().trim()}</span></h3>
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
				  <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
				  <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
				  <h3>Party Name - <span>${$('#gstornameEle_wrapper .selectize-input').text().trim()}</span></h3>
				  <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
				
				  <h3>Data Frequency- <span>${dataFrequency}</span></h3>
				  <h3>Period- <span>${jsonObject.fromDate} </span> To <span>${jsonObject.toDate}</span></h3>
				  <h3>LR Type- <span>${$('#lrTypesEle').val()}</span></h3>
				  `;
				  
				if(resultObject.dataType=="2"){
					 firstOneDiv.innerHTML+=`<h3>Weight:-  <span>1Ton=1000KG</span></h3>`
				}
				infodataDiv.append(buttonsDiv);
				infodataDiv.append(firstOneDiv);
				
				div.append(infodataDiv);

				const canvas = document.createElement('canvas');
				canvas.className = 'chartCanvas';
				div2.style.width = (resultObject.dataFrequency == "2")?"100%":"72%";
				div2.style.margin = "auto";
				div2.append(canvas);
				div.append(div2);
				chartContainer.appendChild(div);
				const ctx = canvas.getContext('2d');
				function kgToTon(kg) {
					 if(kg!=undefined)
						return Number((kg / 1000).toFixed(2));
						
					return undefined;
					}
					
					if (resultObject.dataType == "2"){
							console.log("hello");
							dataList = dataList.map(kgToTon);
							
						
					}
				// Create the chart
				console.log(years,"==================");
				Chart.register(ChartDataLabels);
			   
				console.log(monthNames,dataList);
				const allUndefinedOrZero = dataList.every(element => element === undefined || element === 0);
				 if (allUndefinedOrZero || dataList.length==0) {
						showMessage('error','Data Not Found' );
						$("#mychartmis").empty();
						return;				
					}
				  
				   
				window.myChart = new Chart(ctx, {
					type: $('#barselectionEle').val().toLowerCase(),
					data: {
						labels: monthNames,
						datasets: [{
							label: years[count],
							data: dataList,
							backgroundColor: dataList.map((value, index) => {
								if (value === Math.max(...dataList.filter((value) => typeof value === 'number'))) {
									return 'rgba(0, 255, 69, 1)';
								} else if (value === Math.min(...dataList.filter((value) => typeof value === 'number'))) {
									return 'rgba(255, 0, 0, 1)';
								} else {
									return colorScheme[index % colorScheme.length];
								}
							}),
							borderColor: dataList.map((value, index) => {
								if (value === Math.max(...dataList.filter((value) => typeof value === 'number'))) {
									return 'rgba(0, 255, 69, 1)';
								} else if (value === Math.min(...dataList.filter((value) => typeof value === 'number'))) {
									return 'rgba(255, 0, 0, 1)';
								} else {
									return colorScheme[index % colorScheme.length];
								}
							}),
							borderWidth: 1,
							maxBarThickness: 100,
							//minBarLength: 100,

							// barThickness: 50 
						},
						{
							label: years[count],
							data: dataList,
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							borderColor: "rgba(255, 255, 255, 0.1)",
							borderWidth: 0.1,
							maxBarThickness: 100,
							minBarLength: Math.max(...dataList.filter((value) => typeof value === 'number')),

							// barThickness: 50 
						}

						]
					},
					options: {
						
						
						onHover: function (event, chartElements) {
							const clickedBarIndex = (chartElements[0]) == undefined ? -1 : (chartElements[0]).index;
							if (clickedBarIndex != -1 && resultObject.dataFrequency != "-1" && dataList[clickedBarIndex] != undefined)
								event.native.target.style.cursor = "pointer";

							if (chartElements.length == 0 || dataList[clickedBarIndex] == undefined)
								event.native.target.style.cursor = "default";
						}, onClick: function (event, chartElements) {
							let clickedBarIndex = (chartElements[0]) == undefined ? -1 : (chartElements[0]).index;

							if (clickedBarIndex != -1 && resultObject.dataFrequency != "-1" && dataList[clickedBarIndex] != undefined){
							   if(resultObject.dataFrequency=="3"){
								   let obj={"11":3,"10":2,"9":1,"8":12,"7":11,"6":10,"5":9,"4":8,"3":7,"2":6,"1":5,"0":4};
								   clickedBarIndex=obj[clickedBarIndex];
							   }  else{
								   clickedBarIndex+=1;
							   }
								_this.barclickedEvent(resultObject, clickedBarIndex);
							 }
						},
						responsive: true,
						
						
						
						scales: {
							x: {
								stacked: true,
							},
							y: {
								//max: Math.max(...dataList.filter((value) => typeof value === 'number')),
								stacked: true,
								beginAtZero: true,
								grace: "50%",
								grid: {
									color: '#ccc'
								},
								ticks: {
									font: {
										family: 'Arial',
										size: 12,
										color: 'white'
									}
								}
							},
						},	plugins: {
							tooltip: {
						enabled: true,
						callbacks: {
							label: function (context) {
								console.log(context)
								let crtPercentageGrowthData=0;
								let oldValue=0;
								let newValue=0;
								let arr=context.dataset.data;
								let divideByDays=0;
								
								
								if(context.dataIndex>0){
									oldValue=arr[context.dataIndex-1];
									newValue=arr[context.dataIndex];
									 if (oldValue !== 0) {
										crtPercentageGrowthData = ((newValue - oldValue) / oldValue) * 100;
									} else {
										crtPercentageGrowthData =100;
									}
							   }
								var sum = arr.reduce(function (acc, value) {
								if (typeof value === 'number' && !isNaN(value)) {
									return acc + value;
								}
								return acc;
							}, 0);
							
							let avgNodeData=(arr[context.dataIndex]/ avgByYear[context.dataIndex]).toFixed(2);
							if(avgFlagInsteadAmount){
								const getDays = (year, month) => {
									return new Date(year, month, 0).getDate();
								};
								divideByDays = getDays(new Date().getFullYear(),new Date().getMonth() + 1);
								avgNodeData=((datasets[context.datasetIndex].data[context.dataIndex] / divideByDays).toFixed(1)).toLocaleString('en-IN');
							
							}
							
							let showLabel=context.dataset.label.split("-")[0];
							
							if(resultObject.dataFrequency == "3"){
								if(context.dataIndex>=9)
									showLabel=context.dataset.label.split("-")[1];
							}
							let yearlyAvgdivide= arr.length;
							if(showLabel==new Date().getFullYear()){
								console.log(yearlyAvgdivide,"343434343");
								yearlyAvgdivide=new Date().getMonth();
								
							}
							console.log("arr ===== ",arr[context.dataIndex],"avgbyyear==>",avgByYear[context.dataIndex],"avgbyyaer arr",avgByYear);
							var current = "Current Year "+growthLabel+" Growth -  " +(crtPercentageGrowthData.toFixed(1))+"%";
							var avgNode = avgCaptionToolTip+ '- ' + _this.convertTheNumberToIndinan(avgNodeData);
							var avg = "Yearly Avg " + '- ' + _this.convertTheNumberToIndinan((sum / yearlyAvgdivide).toFixed(1));
							
							 return [context.label+" ("+showLabel+")  Data - "+context.formattedValue,current,avgNode,avg];
						 },
					  
						
						
						},
						
					},
							
							legend: {
								display: false, 
							 },
							datalabels: {
								anchor: 'end',
								align: 'top',
								rotation:270,
								anchor: (context) => {
									return context.datasetIndex === 0 ? 'end' : 'start';
								},
								formatter: (value, context) => {
								   if(context.datasetIndex === 0) {
										if(value>0){
										if (typeof value === 'number' && !isNaN(value)){
											  const formatter = new Intl.NumberFormat('en-IN');
												return formatter.format(value);
											  }
										 }
									}
									return "";
								},
								color: function (context) {								
							  return context.dataset.backgroundColor;
							},
						  },
							
						},
					},
				});
				printBtn.addEventListener("click",function(){
				   buttonsDiv.remove();
					window.myChart.render();
				 setTimeout(()=>{
					infodataDiv.prepend(buttonsDiv);
				   },1000);
					_this.printChart(infodataDiv,canvas);
				})
				count++;
				chartData = [];
				monthData = [];

			})
			hideLayer();
		},convertTheNumberToIndinan:function(value){
			
			return Intl.NumberFormat('en-IN').format(value)
			
		},printChart:function(div,canvas){
			console.log(div);
					var mywindow = window.open('',	'_blank');
			 
				var is_chrome = Boolean(mywindow.chrome);
					let url=canvas.toDataURL();
					mywindow.document.write("<html><head><title>Check Your Past Moment</title>");
					 mywindow.document.write(`<style>img { max-width: 100%; max-height: 100%; }
							 .firstOne{
									justify-content: space-between;
									align-items: center;
									margin-top: 19px;
									grid-auto-rows: 9px 68px;
									display: grid;
									grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
									  }
									  .firstOne h3{
										border: 2px solid #d9d3d3;
										padding: 4px 6px;
										font-weight: 500;
										font-size: 1rem;
										color: #4c4c4c;
									}									
									.desDiv{
									  text-align: center;
									  
									  }
					 </style>`);
					 mywindow.document.write('</head><body >');
					
					mywindow.document.write(div.innerHTML);
					mywindow.document.write('<img src="' + url + '" />');
					mywindow.document.write('</body></html>');
					mywindow.document.close(); 
			  if (is_chrome) {
					mywindow.onload = function() { 
					mywindow.focus();
					mywindow.print(); 
					 mywindow.close();

			 };
				 } else {
				mywindow.document.close(); 
				mywindow.focus(); 
				 mywindow.print();
				mywindow.close();
				}
				
		},downloadExcelfile:function(result){
				  const yourData = result 
				  const workbook = XLSX.utils.book_new();
				  const worksheet = XLSX.utils.json_to_sheet(yourData);
				  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
				  const excelBuffer = XLSX.write(workbook, { type: 'array' });
				  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
				  const url = URL.createObjectURL(blob);
				  const a = document.createElement('a');
				  a.href = url;
				  a.download = 'data.xlsx';
				  a.click();
						
				} 
				,getTheglobalArraycheckboxvalue:function(){
					 if ($("#dialcheckbox").prop("checked") == true) {
							globalArrayForYearCheckbox=[];
							$(".mainSelectedbox #selectedCheckBox").each((el,val)=>{
							   
							   if($(val).prop("checked")==true){
									globalArrayForYearCheckbox.push($(".mainSelectedbox label").eq(el).text())
							   }
							})
					 } else {
						 globalArrayForYearCheckbox=null;	 
					 }
				},
				chagneTheResponseForYear: function(response) {
					if (globalArrayForYearCheckbox != null) {
						for (const year in response) {
							if (!globalArrayForYearCheckbox.includes(year)) {
								delete response[year];
							}
						}
						return response;
					}
					return response;
				}
				
				,checkDisplayNone:function(){
					if( $(`div[data-attribute="dataFrequency"]`).css("display") == "none" ){
							$('#dataFrequencyEle_primary_key').val(-1);
					}
		}, onSubmit: function () {
			showLayer();
			jsonObject = Selection.getElementData();
			
			jsonObject["lrType"] 				= $('#lrTypesEle_primary_key').val();
			jsonObject["dataType"]				= $('#dataTypeEle_primary_key').val();
			jsonObject["dataFrequency"]			= $('#dataFrequencyEle_primary_key').val();
			//jsonObject["consigneeorconsginor"]	= $('#consigneeorconsignorEle_primary_key').val();
			jsonObject["consigneeorconsginor"]	= "-1";
			jsonObject["GetTheTopParty"]		= $("#controlinput_gstornameEle").siblings(".item").data("value");
			jsonObject["topPartyLimit"] 		= $('#topPartyLimitEle_primary_key').val();
			
		   if(thisMonthOrLastMonth)
				jsonObject["dataFrequency"] = "-1"
			
			resultObject = jsonObject;
			_this.getTheglobalArraycheckboxvalue();
			
			getJSON(jsonObject, WEB_SERVICE_URL + '/partyBookingMisDashboardWS/getTheChart.do', _this.printChartFirst, EXECUTE_WITH_ERROR);
		}
	});
});