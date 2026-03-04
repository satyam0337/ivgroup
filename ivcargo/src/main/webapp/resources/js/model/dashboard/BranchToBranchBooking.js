const DATA_FREQUENCY_TODAY = 1;
const DATA_FREQUENCY_WEEKLY = 2;
const DATA_FREQUENCY_MONTHLY = 3;
const DATA_FREQUENCY_QUARTERLY = 4;
const DATA_FREQUENCY_HALF_YEARLY = 5;
const DATA_FREQUENCY_YEARLY = 6;
const DATA_FREQUENCY_ALL = -1;

const DATA_TYPE_BOOKING_AMOUNT 			= 1;
const DATA_TYPE_ACTUAL_WEIGHT 	= 2;
const DATA_TYPE_ARTICLE 		= 3;
const DATA_TYPE_LR_COUNT 		= 4;
const DATA_TYPE_TOTALAMOUNT 	= 5;
const DATA_TYPE_CHARGE_WEIGHT 	= 6;

let resultObject = null;
let globalArrayForYearCheckbox=null;
let lastOneYear=false;
let forOtherYear=false;
let thisMonthOrLastMonth=false;
define([
    PROJECT_IVUIRESOURCES + '/resources/js/populateautocomplete/selectoption.js'
    ,'selectizewrapper',
   /* ,JS_RESOURCES + '/resources/js/dashboard/html2canvas.min.js'*/
    ,'JsonUtility'
    ,'messageUtility'
    ,'autocomplete'
    ,'autocompleteWrapper'
    ,'slickGridWrapper2'
    ,'nodvalidation'
    ,PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
    ,'focusnavigation'//import in require.config
], function (Selection, Selectizewrapper) {
    'use strict';
    var jsonObject = new Object(), myNod, _this = '';

	return Marionette.LayoutView.extend({
		initialize: function () {
			_this = this;
		}, render: function () {
			getJSON(jsonObject, WEB_SERVICE_URL + '/branchToBranchMisDashboardWS/getDashboardBranchToBranchElementConfiguration.do?', _this.getElementConfigDetails, EXECUTE_WITHOUT_ERROR);
			return _this;
		}, yearCheckBoxes : function() {
			$(".insideSelectedBoxs").empty();
			let fromDate=($("#dateEle").attr('data-startdate')).split('-');
			fromDate=+fromDate[fromDate.length-1];
			let toDate=($("#dateEle").attr('data-enddate')).split("-");
			toDate=+toDate[toDate.length-1];
				
			for(let i=fromDate;i<=toDate;i++){
				let printYear=(i)+"-"+(i+1);
				var div = document.createElement('div');
				div.className="mainSelectedbox";
				
				var input = document.createElement('input');
				input.type = 'checkbox';
				input.name = 'selectedCheckBox';
				input.id = 'selectedCheckBox';
				input.className = 'checkboxforyear';
				
				// Create the label element
				var label = document.createElement('label');
				label.htmlFor = 'selectedCheckBox';
				label.textContent = printYear;
				div.append(input)
				div.append(label)
				$(".insideSelectedBoxs").append(div);
			}
		}, getElementConfigDetails: function (response) {
			var loadelement = new Array();
			var baseHtml = new $.Deferred();

			loadelement.push(baseHtml);

			$("#mainContent").load("/ivcargo/html/dashboard/BranchToBranchBooking.html", function () {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function () {
				initialiseFocus();
			// this is for when User Select All to region
				$("#regionEle").on("change",function(){
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
			
				// this is for selct random year
				$(".dialboxpopup").hide("slow");
				$("#dialcheckbox").on("change",function(){
					if($("#dialcheckbox").prop("checked")){
						$(".dialboxpopup").show("slow");
						_this.yearCheckBoxes();
					} else {
						$(".dialboxpopup").hide("slow");
					}
				})
				
				$(".iconforclose").click(function(){
					$(".dialboxpopup").toggle("slow");
				})
				
			/*	document.addEventListener("click",function(event){
					let div=document.getElementsByClassName("dialboxpopup")[0];
					
					if(!div.contains(event.target)){
						$(".dialboxpopup").hide("slow");
					}
				})*/

				$("body").on('click', function () {
					let valueStr = $("#dateEle").val();
					valueStr = valueStr.split("-");
					let startyear = valueStr[2].trim();
					let endyear = valueStr[valueStr.length - 1].trim();
					
					if (startyear != endyear) {
						$("#dateEle").val(`01-04-${startyear} - 31-03-${endyear}`)
						$("#dateEle").attr('data-startdate', `01-04-${startyear}`)
						$("#dateEle").attr('data-enddate', `31-03-${endyear}`)
					}
				})

				let autoBillSelectionTypeName = new Object();
				autoBillSelectionTypeName.primary_key = 'wayBillTypeId';
				autoBillSelectionTypeName.field = 'wayBillType';

				$("#lrTypesEle").autocompleteCustom(autoBillSelectionTypeName)
				let autoPaymentType = $("#lrTypesEle").getInstance();

				$(autoPaymentType).each(function () {
					this.option.source = response.LrTypeLists;
				})

				//dataFrequencyEle
				_this.dataFrequencyInputBox(response.DataFrequencyList);

				// hiding the selectize of data frequency
				function clickHandler() {
 					$('#controlinput_dataFrequencyEle').blur();				  
				}

				setTimeout(clickHandler,100);

				$("#dateEle").on("change",function(){		
					let val =$("#dataFrequencyEle").parent();
					$('#dataFrequencyEle').val(val.find(".item[data-value]").attr("data-value")); 							
				})

				// dataTypeEle
				let dataTypeSelection 			= new Object();
				dataTypeSelection.primary_key 	= 'dataTypeConstantId';
				dataTypeSelection.field 		= 'value';

				$("#dataTypeEle").autocompleteCustom(dataTypeSelection)

				let DataType = $("#dataTypeEle").getInstance();
				$(DataType).each(function () {
					this.option.source = response.DataTypeList;
				})

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
				elementConfiguration.regionElement 			= $('#regionEle');
				elementConfiguration.subregionElement 		= $('#subRegionEle');
				elementConfiguration.dataTypeElement 		= $('#dataTypeEle');
				elementConfiguration.lrTypeElement 			= $('#lrTypesEle');
				elementConfiguration.dataFrequenceElement 	= $('#dataFrequencyEle');
				elementConfiguration.barselectionElement 	= $('#barselectionEle');
				elementConfiguration.branchElement 			= $('#branchEle');
				elementConfiguration.dateElement			= $("#dateEle");
				
				
				elementConfiguration.destRegionElement		= $('#toRegionEle');
				elementConfiguration.destSubregionElement	= $('#toSubRegionEle');
				elementConfiguration.destBranchElement		= $('#toBranchEle');
				// elementConfiguration.periodElement			= $('#periodEle');

				response.elementConfiguration = elementConfiguration;
				response.sourceAreaSelection 		= true;
				response.isCalenderSelection 		= true;
				response.destinationAreaSelection			= true;

				response.lastFinancialOneYear		= true;
				response.AllOptionsForDestSubRegion			= true;
				response.AllOptionForDestinationBranch		= true;
				
				Selection.setSelectionToGetData(response);

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
				
				$('.ranges li').each(function() {
					    $(this).click(function(){
					    if($(this).text()=="Last Month" || $(this).text()=="This Month"){
							$('#dataFrequencyEle').val(-1);
							$('#dataFrequencyEle_primary_key').val(-1)
							thisMonthOrLastMonth=true
						}
						else{
							thisMonthOrLastMonth=false;
						}
						})
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


				if($('#toRegionEle').is(":visible")){
					myNod.add({
						selector		: '#toRegionEle',
						validate		: 'validateAutocomplete:#toRegionEle_primary_key',
						errorMessage	: 'Select proper Region !'
					});
				}
				if($('#toSubRegionEle').is(":visible")){
					myNod.add({
						selector		: '#toSubRegionEle',
						validate		: 'validateAutocomplete:#toSubRegionEle_primary_key',
						errorMessage	: 'Select proper Area !'
					});
				}

				if($('#toBranchEle').is(":visible")){
					myNod.add({
						selector		: '#toBranchEle',
						validate		: 'validateAutocomplete:#toBranchEle_primary_key',
						errorMessage	: 'Select proper Branch !'
					});
				}

				hideLayer();

				$("#searchBtn").click(function () {
					myNod.performCheck();

					if (myNod.areAll('valid'))
						_this.onSubmit(_this);
				});
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
            jsonObject["index"] = index;
            getJSON(jsonObject, WEB_SERVICE_URL + '/branchToBranchMisDashboardWS/getTheBarChartEvent.do', _this.setTheBarChartEvent, EXECUTE_WITH_ERROR);
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
                    
                    if (resultObject.dataType == DATA_TYPE_BOOKING_AMOUNT)
                        chartData.push(insideData.totalAmount);
                    else if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT)
                        chartData.push(insideData.totalActualWeight);
                    else if (resultObject.dataType == DATA_TYPE_ARTICLE)
                        chartData.push(insideData.totalNoOfArticles);
                    else if (resultObject.dataType == DATA_TYPE_LR_COUNT)
                        chartData.push(insideData.totalNoOfLR);
                    else if (resultObject.dataType == DATA_TYPE_TOTALAMOUNT)
                        chartData.push(insideData.totalAmount);

                    monthData.push(insideData.year);
                })
            })

            const div = document.createElement("div");
            const div1 = document.createElement("div");

            div1.style.width = "60%";
            div1.style.height = "50%"
            div1.style.margin = "auto";

            let infodataDiv 	= document.createElement("div");
            let buttonsDiv 		= document.createElement("div");
            let firstOneDiv 	= document.createElement("div");
            let desDiv 			= document.createElement("div");
            let execelDwBtn 	= document.createElement("button");
            let pdfDwBtn 		= document.createElement("button");
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
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
			      <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
			      <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
			      <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
			    
			      <h3>Data Frequency- <span>${$("#dataFrequencyEle").val()}</span></h3>
			      <h3>Period- <span> All The Years  </span></h3>
			      <h3>Lr Type- <span>${$('#lrTypesEle').val()}</span></h3>
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
			$('#bottom-border-boxshadow').removeClass('hide');
			
			let data=response;
			const colors = ["rgba(54, 162, 235, 0.7)", "rgba(255, 99, 132, 0.7)", "rgba(75, 192, 192, 0.7)","rgba(252, 227, 3)","rgba(3, 32, 252)","rgba(153,50,204)","rgba(47,79,79)"];
			const years = Object.keys(data).sort((a, b) => a.localeCompare(b));
			let monthsNameWithLable = [ 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December','January', 'February', 'March'];
			let weekData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
			let quarterData = ["Q1", "Q2", "Q3", "Q4"];
			let halfYearData = ["H1", "H2"];
			let monthNamewithNumber = [4, 5, 6, 7, 8, 9, 10, 11, 12,1,2,3];
			let cl=-1;   
			let avgCaptionToolTip="";
			let barType="line";
			let rotation=270;
			const chartContainer = document.getElementById('mychartmis');
			let labless=[];
			let growthLabel="";
			let avgFlagInsteadAmount=false;
			let avgLrCountLabel="totalNoOfLR";
			
			 $("#mychartmis").empty();
			let dataType="totalNoOfArticles";
            if (resultObject.dataType == DATA_TYPE_BOOKING_AMOUNT){
            	dataType="totalAmount";
            	avgCaptionToolTip="Avg Booking Value Amount";
            	
            	}
            else if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT){
                dataType="totalActualWeight";
                avgFlagInsteadAmount=true;
                avgCaptionToolTip="Avg ActualWeight Value";

                }
            else if (resultObject.dataType == DATA_TYPE_ARTICLE){
                dataType="totalNoOfArticles";
                avgFlagInsteadAmount=true;
                avgCaptionToolTip="Avg Article Value ";

                }
            else if (resultObject.dataType == DATA_TYPE_LR_COUNT){
                dataType="totalNoOfLR";
                avgFlagInsteadAmount=true;
                avgCaptionToolTip="Avg LR Value ";

                }
            else if (resultObject.dataType == DATA_TYPE_TOTALAMOUNT){
                dataType="totalAmount";
                avgCaptionToolTip="Avg  Value Amount";              
                }

                if (resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY) {
                    labless=monthsNameWithLable;
                    barType="line";
                    rotation=360;
                    growthLabel="MOM"
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY) {
                		labless=quarterData;
                		barType="bar";
                		rotation=270;
                		growthLabel="QOQ";
                   
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY) {
					labless=halfYearData;
					barType="bar";
					rotation=270;
					growthLabel="HOH"
                    
                }  
                else if (resultObject.dataFrequency == DATA_FREQUENCY_YEARLY) {
					labless=years;
					barType="bar";
					rotation=270;
					growthLabel="YOY"
                    
                }  
      
      
 				let datasets= years.map((year,index)=>{
 				
 			   if (resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY) {
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
                   
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY) {
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
                    
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY) {
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
                else if (resultObject.dataFrequency == DATA_FREQUENCY_YEARLY) {
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

            let infodataDiv 	= document.createElement("div");
            let dataFrequency	="Daily";
            let buttonsDiv 		= document.createElement("div");
            let firstOneDiv 	= document.createElement("div");
            let desDiv 			= document.createElement("div");
            let execelDwBtn 	= document.createElement("button");
            let pdfDwBtn 		= document.createElement("button");
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
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
			      <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
			      <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
			      <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
			    
			      <h3>Data Frequency- <span>${dataFrequency}</span></h3>
			      <h3>Period- <span> ${jsonObject.fromDate} </span> TO <span>${jsonObject.toDate}</span> </h3>
			      <h3>Lr Type- <span>${$('#lrTypesEle').val()}</span></h3>
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
            
            function kgToTon(kg) {
			    if(kg!=undefined)
					return Number((kg / 1000).toFixed(2));
						
					return undefined;
			}
			
			if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT){

				datasets.forEach(function (item) {
					
				    item.data = item.data.map(kgToTon);
				});
			}
            
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
									
								}
							 var sum = arr.reduce(function (acc, value) {
							    if (typeof value === 'number' && !isNaN(value)) {
							        return acc + value;
							    }
							    return acc;
							}, 0);
							let firstAvg=datasets[context.datasetIndex].data[context.dataIndex] 
							let secAvg  =datasets[context.datasetIndex].dataForAvgLr[context.dataIndex]
							let avgValue=((datasets[context.datasetIndex].data[context.dataIndex] / datasets[context.datasetIndex].dataForAvgLr[context.dataIndex]).toFixed(1)).toLocaleString('en-IN');
							let divideByDays=0;
							if(avgFlagInsteadAmount){
								const getDays = (year, month) => {
								    return new Date(year, month, 0).getDate();
								};
								
								divideByDays = getDays(new Date().getFullYear(), new Date().getMonth() + 1);
								avgValue=((datasets[context.datasetIndex].data[context.dataIndex] / divideByDays).toFixed(1)).toLocaleString('en-IN');
							
							}
							let showLabel=context.dataset.label.split("-")[0];
							if(resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY){
								if(context.dataIndex>=9)
									showLabel=context.dataset.label.split("-")[1];
							}
							
							let yearlyAvgdivide= arr.length;
							if(showLabel==new Date().getFullYear()){
								yearlyAvgdivide=new Date().getMonth();
								
							}
                            var current = "Current Year "+growthLabel+" Growth  - " + ' ' +crtPercentageGrowthData.toFixed(1) + '%';
                            var preious = "Previous Year YOY Growth - " + ' ' + prPercentageGrowthData.toFixed(1) + '%';
                            var curAvg = ""+avgCaptionToolTip+" -  "+ _this.convertTheNumberToIndinan(avgValue);
                            var avg = "Yearly Avg -  " + '' + _this.convertTheNumberToIndinan((sum / yearlyAvgdivide).toFixed(1)) + '';
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
			
		},convertTheNumberToIndinan:function(value){
			
			return Intl.NumberFormat('en-IN').format(value)
			
		}
		, printChartFirst : function(response){
			if(forOtherYear)
				_this.setChartforOtherYear(response);
			else
				_this.setChartOnyear(response);
		}, setChartOnyear: function (response) {
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			$('#bottom-border-boxshadow').removeClass('hide');
			
			response=_this.chagneTheResponseForYear(response);
            let years = Object.keys(response);
            
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
            years.forEach((d, index) => {
                let insidelist = response[d];
                if (insidelist == null || insidelist.messageId != undefined) { hideLayer(); return; }
                
                insidelist.forEach((insideData) => {                                        
                   if (resultObject.dataType == DATA_TYPE_BOOKING_AMOUNT){
                        chartData.push(insideData.totalAmount);
                        avgCaptionToolTip="Avg Booking Value Amount";

                        
                        }
                    else if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT){
                        	chartData.push(insideData.totalActualWeight);
                        	avgFlagInsteadAmount=true;
               			 	avgCaptionToolTip="Avg ActualWeight Value";
                        
                        }
                    else if (resultObject.dataType == DATA_TYPE_ARTICLE){
                        	chartData.push(insideData.totalNoOfArticles);
                        	avgFlagInsteadAmount=true;
                			avgCaptionToolTip="Avg Article Value ";
                        
                        }
                    else if (resultObject.dataType == DATA_TYPE_LR_COUNT){
                       		 chartData.push(insideData.totalNoOfLR);
                      		 avgFlagInsteadAmount=true;
               			 	 avgCaptionToolTip="Avg LR Value ";
                        
                        }
                    else if (resultObject.dataType == DATA_TYPE_TOTALAMOUNT){
                        chartData.push(insideData.totalAmount);
                         avgCaptionToolTip="Avg  Value Amount";
                        
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

                if (resultObject.dataFrequency == DATA_FREQUENCY_TODAY) {
					
                    hours.forEach((hour) => {
                        if (!monthData.includes(hour))
                            monthData.push(hour);
                    })
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_WEEKLY) {
                    weekData.forEach((week) => {
                        if (!monthData.includes(week))
                            monthData.push(week);
                    });
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY) {
					 growthLabel="MON";
                    monthNamewithNumber.forEach((month) => {
                        if (!monthData.includes(month))
                            monthData.push(month);
                    });
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY) {
					 growthLabel="QOQ";
                    quarterData.forEach((quater) => {
                        if (!monthData.includes(quater))
                            monthData.push(quater);
                    });
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY) {
					 growthLabel="HOH";
                    halfYearData.forEach((half) => {
                        if (!monthData.includes(half))
                            monthData.push(half);
                    });
                } else if (resultObject.dataFrequency == DATA_FREQUENCY_ALL) {
                    days.forEach((day) => {
                        if (!monthData.includes(day))
                            monthData.push(day);
                    });
                }
                
                if(resultObject.dataFrequency == DATA_FREQUENCY_ALL){
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
					
					  if(resultObject.dataFrequency == DATA_FREQUENCY_WEEKLY)
					     newArray.push("w" + monthNames[i]);
					   
					  if(resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY)
					  	 newArray.push("Q" + monthNames[i]);

					  if(resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY)
					  	newArray.push("H" + monthNames[i]);
					}

				if(newArray.length!=0)
					monthNames=newArray;

                if (dataList.length != monthNames.length) {
                    for (let i = dataList.length; i < monthNames.length; i++) {
                        dataList.push(undefined);
                        avgByYear.push(undefined);
                    }
                }

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
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
			      <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
			      <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
			      <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
			    
			      <h3>Data Frequency- <span>${dataFrequency}</span></h3>
			      <h3>Period- <span>${jsonObject.fromDate} </span> To <span>${jsonObject.toDate}</span></h3>
			      <h3>Lr Type- <span>${$('#lrTypesEle').val()}</span></h3>
				  `;
				  
				if(resultObject.dataType=="2"){
					 firstOneDiv.innerHTML+=`<h3>Weight:-  <span>1Ton=1000KG</span></h3>`
				}
                infodataDiv.append(buttonsDiv);
                infodataDiv.append(firstOneDiv);
                
                div.append(infodataDiv);

                const canvas = document.createElement('canvas');
                canvas.className = 'chartCanvas';
                div2.style.width = (resultObject.dataFrequency == DATA_FREQUENCY_WEEKLY)?"100%":"72%";
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
					
					if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT){
						    dataList = dataList.map(kgToTon);
						    
						
					}
                // Create the chart
                Chart.register(ChartDataLabels);
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
                            if (clickedBarIndex != -1 && resultObject.dataFrequency != DATA_FREQUENCY_ALL && dataList[clickedBarIndex] != undefined)
                                event.native.target.style.cursor = "pointer";

                            if (chartElements.length == 0 || dataList[clickedBarIndex] == undefined)
                                event.native.target.style.cursor = "default";
                        }, onClick: function (event, chartElements) {
                            let clickedBarIndex = (chartElements[0]) == undefined ? -1 : (chartElements[0]).index;

                            if (clickedBarIndex != -1 && resultObject.dataFrequency != DATA_FREQUENCY_ALL && dataList[clickedBarIndex] != undefined){
                               if(resultObject.dataFrequency== DATA_FREQUENCY_MONTHLY){
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
                        },  plugins: {
							tooltip: {
                        enabled: true,
                        callbacks: {
                            label: function (context) {
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
								avgNodeData=((arr[context.dataIndex]/ divideByDays).toFixed(1)).toLocaleString('en-IN');
							
							}
							
							let showLabel=context.dataset.label.split("-")[0];
							
							if(resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY){
								if(context.dataIndex>=9)
									showLabel=context.dataset.label.split("-")[1];
							}
							let yearlyAvgdivide= arr.length;
							if(showLabel==new Date().getFullYear()){
								yearlyAvgdivide=new Date().getMonth();
								
							}
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
        }, setComparisonData: function (response) {
			if(response.message != undefined) {
				var errorMessage = response.message;
				showMessage(errorMessage.typeName, errorMessage.typeSymble +  ' ' + errorMessage.description);
				return;
			}
			
			response=_this.chagneTheResponseForYear(response);
            let monthsNameWithLable = ['-1', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            let getDataValue = "";

            if (resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY)
                getDataValue = ".monthOfTheYear"
            else if (resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY)
                getDataValue = ".quateroftheyear";
            else if (resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY)
                getDataValue = ".halfyearlyno";
            
            let result = [];

            let resultData = Object.keys(response);

            resultData.forEach((dt, index) => {
                let insidelist = response[dt];

                insidelist.forEach((inDt, inIndex) => {
                    result.push(inDt);
                })
            })
            let hm = {};
            result.forEach((dt, index) => {
                let value = 0;
                if (dt.monthOfTheYear != undefined)
                    value = dt.monthOfTheYear;

                if (dt.quaterOfTheYear != undefined)
                    value = dt.quaterOfTheYear;

                if (dt.halfYearlyNo != undefined)
                    value = dt.halfYearlyNo;

                if (hm[value] == undefined) {
                    let ar = [];
                    ar.push(dt);
                    hm[value] = ar;
                } else {
                    let list = hm[value];
                    list.push(dt);
                    hm[value] = list;
                }
            })

            let years = Object.keys(hm);
           
            if (years.length == 0) { 
				hideLayer(); 
   				$("#mychartmis").empty();
            	return; 
            }

            let chartData = [];
            let monthData = [];

            let count = 0;

            if (window.myChart !== undefined)
                window.myChart.destroy();

            const colorScheme = ['rgba(50, 168, 82, 0.5)', 'rgba(42, 53, 150, 0.5)', 'rgba(150, 100, 42, 0.5)', 'rgba(215, 237, 12, 0.5)', 'rgba(237, 12, 222, 0.5)'];
            const chartContainer = document.getElementById('mychartmis');
            $("#mychartmis").empty();
            let flag = false;
            
			if(resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY){
				let value="";
				value=years.shift();
				years.push(value);
				value=years.shift();
				years.push(value);
				value=years.shift();
				years.push(value);	
			}
			
            years.forEach((d, index) => {
                let lb = "Yearly  ";

                if (resultObject.dataFrequency == DATA_FREQUENCY_MONTHLY)
                    lb = monthsNameWithLable[years[index]] + " Month"
                else if (resultObject.dataFrequency == DATA_FREQUENCY_QUARTERLY)
                    lb = years[index] + " Quater"
                else if (resultObject.dataFrequency == DATA_FREQUENCY_HALF_YEARLY)
                    lb = years[index] + " Half Year"

                let insidelist = hm[d];

                if (insidelist == null || insidelist.messageId != undefined) { hideLayer(); return; }

                insidelist.forEach((insideData) => {
                    if (resultObject.dataType == DATA_TYPE_BOOKING_AMOUNT)
                        chartData.push(insideData.totalAmount);
                    else if (resultObject.dataType == DATA_TYPE_ACTUAL_WEIGHT)
                        chartData.push(insideData.totalActualWeight);
                    else if (resultObject.dataType == DATA_TYPE_ARTICLE)
                        chartData.push(insideData.totalNoOfArticles);
                    else if (resultObject.dataType == DATA_TYPE_LR_COUNT)
                        chartData.push(insideData.totalNoOfLR);
                    else if (resultObject.dataType == DATA_TYPE_TOTALAMOUNT)
                        chartData.push(insideData.totalAmount);

                    // inserting data of month
                    if (insideData.year != undefined)
                        monthData.push(insideData.financialYearStr.split("-")[0]);
                })

                const dataList = chartData;
                let monthNames = [];


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
                            swapped = true;


                            let temp1 = dataList[j];
                            dataList[j] = dataList[j + 1];
                            dataList[j + 1] = temp1;
                            swapped = true;
                        }
                    }

                    if (swapped == false)
                        break;
                }

                monthNames = monthData;

                const div = document.createElement("div");
                let div1 = document.createElement("div");
                let div2 = document.createElement("div");
                let infodataDiv = document.createElement("div");
                let buttonsDiv = document.createElement("div");
                let firstOneDiv = document.createElement("div");
                let execelDwBtn = document.createElement("button");
                let pdfDwBtn = document.createElement("button");
                let printBtn=document.createElement("button");
                let desDiv = document.createElement("div");
                execelDwBtn.className = "btn"
                execelDwBtn.innerText = "Download Excel"
                
                pdfDwBtn.className="btn";
                pdfDwBtn.innerText="Download Pdf File"
                printBtn.className="btn";
                printBtn.innerText="Print";
                infodataDiv.className = "infodata";
                buttonsDiv.className = "buttons";
                firstOneDiv.className = "firstOne";
                desDiv.className="desDiv"
				desDiv.innerHTML=`<h4> You are currently viewing <span class="highliteHeading"> ${lb} </span> comparision data from <span class="highliteHeading">${monthData[0]} <span> To  <span class="highliteHeading"> ${monthData[monthData.length-1]}</span> </h4>`
				
                
                buttonsDiv.append(execelDwBtn);
                buttonsDiv.append(pdfDwBtn);
                buttonsDiv.append(printBtn);


				pdfDwBtn.addEventListener("click",function(){
			       div1.remove();
					 buttonsDiv.remove();
						       html2canvas(div).then(canvas => {
								    const pdf = new jsPDF('landscape');
								    const imageData = canvas.toDataURL('image/png');
								    pdf.addImage(imageData, 'PNG', 10, 10, 250, 150); // Adjust the position and size as needed
								    pdf.save('chart_with_text.pdf');
								  });
					div.prepend(div1);
					infodataDiv.prepend(buttonsDiv);
					
				})
				
                execelDwBtn.addEventListener("click", function () {
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
                })

                jsonObject = new Object();

                if ($("#dateEle").attr('data-startdate') != undefined) {
                    jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');
                }

                if ($("#dateEle").attr('data-enddate') != undefined) {
                    jsonObject["toDate"] = $("#dateEle").attr('data-enddate');
                }

                firstOneDiv.innerHTML = `
				  <h3>Region- <span>${$('#regionEle').val()}</span></h3>
			      <h3>Sub Region- <span>${$('#subRegionEle').val()}</span></h3>
			      <h3>Branch- <span>${$('#branchEle').val()}</span> </h3>
			      <h3>Data Type - <span>${$('#dataTypeEle').val()}</span></h3>
			    
			      <h3>Data Frequency- <span>${$("#dataFrequencyEle").val()}</span></h3>
			      <h3>Period- <span>${jsonObject.fromDate} </span> To <span>${jsonObject.toDate}</span></h3>
			      <h3>LR Type- <span>${$('#lrTypesEle').val()}</span></h3>
				  `;
                infodataDiv.append(buttonsDiv);
                infodataDiv.append(desDiv);
                infodataDiv.append(firstOneDiv);

                div1.className = "clickme"
                let span = document.createElement("span");
                span.innerHTML = `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M21.883 12l-7.527 6.235.644.765 9-7.521-9-7.479-.645.764 7.529 6.236h-21.884v1h21.883z"/></svg>`;
                let h3 = document.createElement("h3");
                $(span).children().css(" transition", " all 0.5s ease-in-out")
                $(span).children().css("transform", "rotate(1deg)");
                h3.innerText = "expand " + lb;
                h3.style.marginRight = "15px";
                 h3.style.fontSize="1.2rem"
                span.style.marginTop = "0px";
                div1.append(h3);
                div1.append(span);
                div.append(div1);
                div.append(infodataDiv);


                const canvas = document.createElement('canvas');
                canvas.className = 'chartCanvas';
                div2.style.width = "72%";
                div2.style.margin = "auto";
                div2.append(canvas);
                div.append(div2);
                chartContainer.appendChild(div);
                const ctx = canvas.getContext('2d');
                $(canvas).hide();
                $(infodataDiv).hide();

                $(div1).click(() => {
                    if ($(canvas).is(':visible')) {
                        $(canvas).hide();
                        $(infodataDiv).hide();

                        h3.innerText = "expand " + lb;
                        $(span).children().css("transform", "rotate(1deg)");
                    } else {
                        $(canvas).show();
                        h3.innerText = "collapse " + lb;
                        $(span).children().css("transform", "rotate(90deg)");
                        $(infodataDiv).show();
                    }
                })

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
                        },
                        {
                            label: lb,
                            data: dataList,
                            backgroundColor: "rgba(4, 2, 5, 0.1)",
                            borderColor: "rgba(4, 2, 5, 0.1)",
                            borderWidth: 0.1,
                            maxBarThickness: 100,
                            minBarLength: Math.max(...dataList.filter((value) => typeof value === 'number')),
                        }
                        ]
                    },
                    options: {
                        onHover: function (event, chartElements) {
                            const clickedBarIndex = (chartElements[0]) == undefined ? -1 : (chartElements[0]).index;
                            if (clickedBarIndex != -1 && resultObject.dataFrequency != DATA_FREQUENCY_ALL && dataList[clickedBarIndex] != undefined)
                                event.native.target.style.cursor = "pointer";

                            if (chartElements.length == 0 || dataList[clickedBarIndex] == undefined)
                                event.native.target.style.cursor = "default";
                        },
                        responsive: true,
                        scales: {
                            x: {
                                stacked: true,
                            },
                            y: {
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
                        }
                        ,
                        plugins: {
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
                            },
                        },
                    },
                });
               printBtn.addEventListener("click",function(){
			       div1.remove();
				   buttonsDiv.remove();
				    window.myChart.render();
				   setTimeout(()=>{
					div.prepend(div1);
					infodataDiv.prepend(buttonsDiv);
				   },1000);
               		_this.printChart(infodataDiv,canvas);
	
				})
                count++;
                chartData = [];
                monthData = [];

            })
            hideLayer();
        },printChart:function(div,canvas){
				    var mywindow = window.open('',  '_blank');
             
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

            jsonObject["dataType"] 		= $('#dataTypeEle_primary_key').val();
            jsonObject["lrType"] 		= $('#lrTypesEle_primary_key').val();
            jsonObject["dataFrequency"] = $('#dataFrequencyEle_primary_key').val();
            
            jsonObject["destinationRegionId"] 				= $('#toRegionEle_primary_key').val();
			jsonObject["destinationSubRegionId"] 			= $('#toSubRegionEle_primary_key').val();
			jsonObject["destinationBranchId"] 				= $('#toBranchEle_primary_key').val();
			
            
           if(thisMonthOrLastMonth){
				jsonObject["dataFrequency"]="-1"
			}
            resultObject = jsonObject;
            _this.getTheglobalArraycheckboxvalue();
            
            if ($("#compareCheck").prop("checked"))
                getJSON(jsonObject, WEB_SERVICE_URL + '/branchToBranchMisDashboardWS/getTheChart.do', _this.setComparisonData, EXECUTE_WITH_ERROR);
            else
                getJSON(jsonObject, WEB_SERVICE_URL + '/branchToBranchMisDashboardWS/getTheChart.do', _this.printChartFirst, EXECUTE_WITH_ERROR);
        }
    });
});