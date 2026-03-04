var _thisRender;
var LangKeySet;
var myNode;
var collectionNode;
var vehicleHisabNode;
var localNode;
var totalFuelFilled	= 0;
var totalFuel		= 0;
var totalLR			= 0;
var totalWeight		= 0;
var totalDDLR		= 0;
var totalKilometer	= 0;
var vehicleAverage	= 0;
var columnArray	= new Array();
var voucherDateString;
var voucherNumber;
var routeFromBranchName;
var routeToBranchName;
var voucherTotalKilometer;
var voucherRemark;
var pendingFuelReceipt;
var pendingFuelReceiptKeys;
var pendingLHPV;
var pendingLHPVKeys;
var pendingDDM;
var pendingDDMKeys;
var pendingIntBranchLS;
var pendingIntBranchLSKeys;
var collectionFinalObject	= new Object();
var localFinalObject		= new Object();
var pendingFuelReceiptDetails		= new Object();
var lhpvDetails						= new Object();
var ddmDetails						= new Object();
var intLSDetails					= new Object();
var vehicleNumberMasterId;
var localCounter		= 1;
var iconForWarningMsg		= '<i class="fa fa-warning"></i>';
var alphaNumericAllowWarningMsg		= iconForWarningMsg+' Only A-Z and 0-9 allowed, No other Character Allowed !';
var doneTheStuff					= false;

define([ 'JsonUtility'
		 ,'messageUtility'
		 ,'jquerylingua'
         ,'language'
         ,'/ivcargo/resources/js/module/view/fuelhisabsettlement/fuelhisabsettlementfilepath.js'
         ,'focusnavigation'
         ,'nodvalidation'
         ,'autocomplete'
         ,'autocompleteWrapper'
         ],function (JsonUtility, MessageUtility, jquerylingua, Language, FilePath, Focusnavigation, Validation, AutoComplete, AutoCompleteWrapper) {
	return Marionette.LayoutView.extend({
		initialize : function(masterObj) {
			_thisRender = this;
		}, render : function() {
			getJSON(null, WEB_SERVICE_URL + '/dieselHisabSettlementWS/loadFuelHisabSettlement.do?',	_thisRender.loadViewForDieselHisab, EXECUTE_WITHOUT_ERROR);
			return _thisRender;
		},loadViewForDieselHisab:function(response) {
			hideLayer();
			
			var loadelement				= new Array();
			var loadVehicle				= new $.Deferred();

			loadelement.push(loadVehicle);

			$( "#mainContent" ).load( "/ivcargo/template/fuelHisabSettlement/fuelHisabSettlement.html", function() {
				loadVehicle.resolve();
			});

			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
				myNode = nod();
				myNode.configure({
					parentClass:'validation-message'
				});
				myNode.add([{
					selector: '#vehicleNumberEle',
					validate: 'validateAutocomplete:#vehicleNumberEle_primary_key',
					errorMessage: 'Select proper Vehicle'
				}]);

				$("#searchBtn").click(function() {
					if(_thisRender.validateElements()){
						_thisRender.onSubmit();
					}
				});
				
				LangKeySet = loadLanguageWithParams(FilePath.loadLanguage());
				
				var vehicleNumberAutoComplete = new Object();
				vehicleNumberAutoComplete.url = WEB_SERVICE_URL+'/autoCompleteWS/getVehicleNumberAutocomplete.do?isAllOwnVehicleRequire=true';
				vehicleNumberAutoComplete.primary_key = 'vehicleNumberMasterId';
				vehicleNumberAutoComplete.field = 'vehicleNumber';
				$("#vehicleNumberEle").autocompleteCustom(vehicleNumberAutoComplete);

				$('#collectionLocalTab a').click(function(e) {
					e.preventDefault();
					$(this).tab('show');
				});

				$(function() {
					$('#collectionLocalTab a:first').tab('show');
				});

				$(function() {
					$("#collectionDateEle").datepicker({
						maxDate : 0,
						dateFormat: 'dd-mm-yy'
					});
					$("#localDateEle").datepicker({
						maxDate : 0,
						dateFormat: 'dd-mm-yy'
					});
				});

				$("#fuelHisabDateEle").datepicker({dateFormat: 'dd-mm-yy',minDate:0,maxDate:0}).datepicker("setDate", new Date());
				$("#uptoDateEle").datepicker({dateFormat: 'dd-mm-yy',minDate:0,maxDate:0}).datepicker("setDate", new Date());

				collectionNode = nod();
				
				collectionNode.configure({
					parentClass:'validation-message'
				});
				
				collectionNode.add([{
					selector: '#collectionDateEle',
					validate: 'presence',
					errorMessage: 'Select Proper Date'
				},{
					selector: '#collectionLRNumberEle',
					validate: 'exact-length:8',
					errorMessage: 'Enter Proper LR Number'
				},{
					selector: '#collectionLRNumberEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				},/*{
					selector: '#collectionFromEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Source'
				},{
					selector: '#collectionToEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Destination'
				},*/{
					selector: '#collectionKilometerEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Kilometer'
				},{
					selector: '#collectionKilometerEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				},{
					selector: '#waybillId',
					validate: 'presence',
					errorMessage: 'Enter Valid WayBill Number'
				}]);

				localNode = nod();
				
				localNode.configure({
					parentClass:'validation-message'
				});
				
				localNode.add([{
					selector: '#localDateEle',
					validate: 'presence',
					errorMessage: 'Select Proper Date'
				},{
					selector: '#localFromEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Source'
				},{
					selector: '#localToEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Destination'
				},{
					selector: '#localKilometerEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Kilometer'
				},{
					selector: '#localKilometerEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				}]);

				$("#appendCollection").click(function() {
					/*if(_thisRender.validateCollectionElement()){
					}*/
					collectionNode.performCheck();
					if(collectionNode.areAll('valid'))
						_thisRender.appendCollection();
				});

				$("#appendLocal").click(function() {
					/*if(_thisRender.validateLocalElement()){
					}*/
					localNode.performCheck();
					if(localNode.areAll('valid'))
						_thisRender.appendLocal();
				});

				vehicleHisabNode = nod();
				
				vehicleHisabNode.configure({
					parentClass:'validation-message'
				});
				
				vehicleHisabNode.add([{
					selector: '#startKMEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Start Kilometer'
				},{
					selector: '#kilometerDiffEle',
					validate: 'between-length:1:5',
					errorMessage: 'Maximum Diffrence Allowed Is 9999'
				},{
					selector: '#endKMEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				},{
					selector: '#endKMEle',
					validate: 'presence',
					errorMessage: 'Enter Proper End Kilometer'
				},{
					selector: '#endKMEle',
					validate: 'between-length:1:8',
					errorMessage: 'Enter Valid Kilometer. 0-99999999'
				},{
					selector: '#closingFuelBalanceEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				},{
					selector: '#closingFuelBalanceEle',
					validate: 'presence',
					errorMessage: 'Enter Proper End Kilometer'
				},{
					selector: '#closingFuelBalanceEle',
					validate: 'between-length:1:4',
					errorMessage: 'Enter Valid Fuel Balance. 0-9999'
				},{
					selector: '#averageEle',
					validate: 'presence',
					errorMessage: 'Enter Proper Average'
				},{
					selector: '#startKMEle',
					validate: 'integer',
					errorMessage: 'Enter Numerics Only'
				},{
					selector: '#startKMEle',
					validate: 'between-length:1:8',
					errorMessage: 'Enter Valid Kilometer. 0-99999999'
				},{
					selector: '#finalFuelClosingEle',
					validate: 'integer',
					errorMessage: 'Invalid Value'
				},{
					selector: '#finalFuelClosingEle',
					validate: 'presence',
					errorMessage: 'Invalid Value'
				},{
					selector: '#finalFuelClosingEle',
					validate: 'between-length:1:4',
					errorMessage: 'Provide Valid Details. 0-9999'
				},{
					selector: '#balanceFuelEle',
					validate: 'between-length:1:4',
					errorMessage: 'Provide Valid Details. 0-9999'
				},{
					selector: '#deductionEle',
					validate: 'between-number:-999:999',
					errorMessage: 'Provide Valid Details. -999:999'
				},{
					selector: '#averageEle',
					validate: 'float',
					errorMessage: 'Enter Numerics Only'
				},{
					selector: '#averageEle',
					validate: 'between-length:1:4',
					errorMessage: 'Enter Valid Average. Max 4 Char.'
				},{
					selector: '#driverEle',
					validate: 'validateAutocomplete:#driverEle_primary_key',
					errorMessage: 'Select proper Driver'
				}]);
				
				$( "#remarkEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#deductionRemarkEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#averageRemarkEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#collectionRemarkEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#localRemarkEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#localFromEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#localToEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				$( "#collectionToEle" ).keypress(function( event ) {
					_thisRender.allowOnlyAlphanumeric(event);
				});
				
				var driverAutoComplete 			= new Object();
				
				driverAutoComplete.url 			= WEB_SERVICE_URL+'/autoCompleteWS/getDriverWithLicenceNumber.do';
				driverAutoComplete.primary_key 	= 'driverMasterId';
				driverAutoComplete.field 		= 'driverName';
				driverAutoComplete.sub_as 		= {licenceNumber:'Lic. No.'};
				driverAutoComplete.show_field 	= 'licenceNumber';
				driverAutoComplete.sub_info 	= true;			
				
				$("#driverEle").autocompleteCustom(driverAutoComplete);

				$("#closingFuelBalanceEle").change(function(){
					totalFuel	= totalFuelFilled + parseInt($('#closingFuelBalanceEle').val());
					$('#totalFuelLtrEle').val(totalFuel);
					_thisRender.fuelCalculation();
				});

				$("#averageEle").keyup(function(){
					_thisRender.fuelCalculation();
				});

				$("#endKMEle").keyup(function(){
					_thisRender.fuelCalculation();
				});

				$("#startKMEle").keyup(function(){
					_thisRender.fuelCalculation();
				});

				$("#deductionEle").keyup(function(){
					_thisRender.fuelDeduction();
				});

				$("#collectionLRNumberEle").blur(function(){
					_thisRender.validateLRNumber();
				});

				$("#averageEle").change(function(){
					$("#averageRemarkDiv").removeClass("hide");
					
					vehicleHisabNode.add([{
						selector: '#averageRemarkEle',
						validate: 'presence',
						errorMessage: 'Enter Remark For Average'
					}]);
				});

				$("#submitbtn").click(function() {
					myNode.performCheck();
					vehicleHisabNode.performCheck();
					if(myNode.areAll('valid') && vehicleHisabNode.areAll('valid')){
						_thisRender.createFuelHisabVoucher();
					}
				});
			});

		},validateElements : function() {

			//this will check all the elements which have been added in configuration
			if(!myNode.areAll('valid')) {
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			myNode.performCheck();
			//this will give true if all elements validation is true
			return myNode.areAll('valid');

		},validateCollectionElement : function() {
			if(!collectionNode.areAll('valid')) {
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			collectionNode.performCheck();
			//this will give true if all elements validation is true
			return collectionNode.areAll('valid');
		},validateLocalElement : function() {
			if(!localNode.areAll('valid')) {
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			localNode.performCheck();
			//this will give true if all elements validation is true
			return localNode.areAll('valid');
		},validateVehicleHisabElement : function() {
			if(!vehicleHisabNode.areAll('valid')) {
				showMessage('error', nod.constants.VALIDATIONMESSAGE);
			}
			vehicleHisabNode.performCheck();
			//this will give true if all elements validation is true
			return vehicleHisabNode.areAll('valid');
		},onSubmit : function() {
			_thisRender.resetData();
			showLayer();
			vehicleNumberMasterId	= $("#vehicleNumberEle_primary_key").val();
			var filter	= 1;
			var requestDataObject = ['{"vehicleNumberMasterId":"'+$("#vehicleNumberEle_primary_key").val()+'", "dataFilter":"'+filter+'"}']
		
			$.ajax({
				type:		"POST",
				url: 		"fuelHisabSettlementGetDetails.do?pageId=345&eventId=3&requestDataObject="+encodeURIComponent(requestDataObject),
				dataType :	"json",
				success : function(data, textStatus, jqXHR) {
					if (!data || jQuery.isEmptyObject(data) || data.message) {
						showMessage('error', data.message.description); // show message to show system processing error massage on top of the window.
						hideLayer();
						return false;
					}
					if(jQuery.isEmptyObject( data.pendingLHPVFuelHisabDetails) && jQuery.isEmptyObject(data.pendingDDMFuelHisabDetails) 
							&& jQuery.isEmptyObject( data.pendingInterBranchLSFuelHisabDetails) 
							&& jQuery.isEmptyObject( data.pendingFuelReceiptDetails)) {
						showMessage('error', "No Records Found !!!"); // show message to show system processing error massage on top of the window.
						$("#bottom-border-boxshadow").addClass("hide");
						$("#right-border-boxshadow").addClass("hide");
						$("#right1-border-boxshadow").addClass("hide");
						$("#fuelHisabDateDiv").addClass("hide");
						$("#uptoDateDiv").addClass("hide");
						$("#left-border-boxshadow").addClass("hide");
						$("#pendingLHPVDDM tbody").empty();
						$("#pendingFuelReceipt tbody").empty();
						$("#middle-border-boxshadow").addClass("hide");
						hideLayer();
						return false; 
					}
					_thisRender.renderDataOnUI(data);
					hideLayer();
				},
				error : function(jqXHR, textStatus, errorThrown) {
					console.log("Something really bad happened " + textStatus);
					alert(jqXHR.responseText);
				}
			});
		},resetData : function(){
			$('#closingFuelBalanceEle').val(0);
			$('#runningKilometerEle').val("");
			$('#voucherTotalKilometerEle').val("");
			$('#kilometerDiffEle').val("");
			$('#startKMEle').val("");
			$('#endKMEle').val("");
			$('#averageEle').val("");
			$('#fuelConsumptionEle').val("");
			$('#totalFuelLtrEle').val("");
			$('#balanceFuelEle').val("");
			$('#deductionEle').val("");
			$('#finalFuelClosingEle').val("");
			$('#deductionRemarkEle').val("");
			$('#remarkEle').val("");
			$('#averageRemarkEle').val("");
			
			$('#collectionLRNumberEle').val("");
			$('#collectionFromEle').val("");
			$('#collectionToEle').val("");
			$('#collectionKilometerEle').val("");
			$('#collectionRemarkEle').val("");
			
			$('#localFromEle').val("");
			$('#localToEle').val("");
			$('#localKilometerEle').val("");
			$('#localRemarkEle').val("");
			
		}, renderDataOnUI : function(responseData) {
			
			$("#bottom-border-boxshadow").removeClass("hide");
			$("#fuelHisabDateDiv").removeClass("hide");
			$("#uptoDateDiv").removeClass("hide");
			$("#left-border-boxshadow").removeClass("hide");
			$("#pendingLHPVDDM tbody").empty();
			$("#pendingFuelReceipt tbody").empty();
			$("#middle-border-boxshadow").addClass("hide");
			//$("#searchBtn").addClass("hide");
			totalFuel		= 0;
			totalFuelFilled	= 0;
			vehicleAverage	= 0;
			
			if ('fuelHisabSettlement' in responseData) {
				var previousHisab	= responseData.fuelHisabSettlement;
				
				if (previousHisab.creationDateTimeString != null) {
					$('#lastHisabDateEle').val(previousHisab.creationDateTimeString);
					$("#lastHisabDateDiv").removeClass("hide");
				}
				
				if (previousHisab.fuelBalance != 0) {
					$('#closingFuelBalanceEle').val(previousHisab.fuelBalance);
					$("#closingFuelBalanceDiv").removeClass("hide");
					$('#closingFuelBalanceEle').attr('readonly', 'readonly');
					totalFuel	= previousHisab.fuelBalance;
				} else {
					$("#closingFuelBalanceDiv").removeClass("hide");
				}
				
				if (previousHisab.voucherKilometer != 0) {
					$('#startKMEle').val(previousHisab.voucherKilometer);
					$('#startKMEle').attr('readonly', 'readonly');
				}
				
				if (previousHisab.vehicleAverage != 0) {
					$('#averageEle').val(previousHisab.vehicleAverage);
					vehicleAverage	= previousHisab.vehicleAverage;
				}
			} else {
				$("#closingFuelBalanceDiv").removeClass("hide");
			}
			
			console.log("responseData --> ", responseData)
			
			pendingFuelReceipt		= responseData.pendingFuelReceiptDetails;
			pendingFuelReceiptKeys	= Object.keys(pendingFuelReceipt);
			
			var columnArray	= new Array();
			
			if (pendingFuelReceiptKeys.length > 0) {
				$("#middle-border-boxshadow").removeClass("hide");
				
				for (var i=0; i<pendingFuelReceiptKeys.length; i++) {
					var fuelReceipt	= pendingFuelReceipt[pendingFuelReceiptKeys[i]];
					columnArray.push("<td class='center'>" + fuelReceipt.createDateTimeString + "</td>");
					columnArray.push("<td class='center'>" + fuelReceipt.branchName + "</td>");
					columnArray.push("<td class='center'><a style='cursor:pointer;' data-fuelReceiptDetailsPrimaryKey='"+fuelReceipt.pumpReceiptDetailsId+"' data-fuelReceiptPrimaryKey='"+pendingFuelReceiptKeys[i]+"' id='getFuelReceiptDetails_" + pendingFuelReceiptKeys[i] + "'>" + fuelReceipt.pumpReceiptNumber + "</a></td>");
					columnArray.push("<td class='center'>" + fuelReceipt.pumpName + "</td>");
					columnArray.push("<td class='right'>" + fuelReceipt.fuelToFillUp + "</td>");
					columnArray.push("<td class='center'>" + fuelReceipt.remark + "</td>");
					$('#pendingFuelReceipt tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
					totalFuelFilled += fuelReceipt.fuelToFillUp;
					columnArray	= [];
					fuelReceipt.remark	= "";
					pendingFuelReceiptDetails[pendingFuelReceiptKeys[i]] = fuelReceipt;
					
					$("#getFuelReceiptDetails_" + pendingFuelReceiptKeys[i]).bind("click", function() {
						var elementId			= $(this).attr('id');
						var pumpReceiptId		= elementId.split('_')[1];
						_thisRender.getFuelReceiptDetails(pumpReceiptId, fuelReceipt.pumpReceiptDetailsId);
					});
				}
				
				totalFuel = totalFuelFilled + totalFuel;
				
				$('#blankRowFuelReceipt').remove();
				
				columnArray.push("<td class='tableFooters'>" + "&nbsp;" + "</td>");
				columnArray.push("<td class='tableFooters'>" + "&nbsp;" + "</td>");
				columnArray.push("<td class='tableFooters'>" + "&nbsp;" + "</td>");
				columnArray.push("<td class='right tableFooters'>" + "Total Litres :" + "</td>");
				columnArray.push("<td class='right tableFooters'>" + totalFuelFilled + "</td>");
				columnArray.push("<td class='tableFooters'>" + "&nbsp;" + "</td>");
				
				$('#pendingFuelReceipt tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				
				$("#totalFuelLtrEle").val(totalFuel)
				
				columnArray	= [];
			}
			
			$('#totalFuelLtrEle').val(totalFuel);
			pendingLHPV			= responseData.pendingLHPVFuelHisabDetails;
			pendingLHPVKeys		= Object.keys(pendingLHPV);
			
			for (var i=0; i<pendingLHPVKeys.length; i++) {
				var lhpv	= pendingLHPV[pendingLHPVKeys[i]];
				columnArray.push("<td class='center'>" + "LHPV" + "</td>");
				columnArray.push("<td class='center'>" + lhpv.voucherDateString + "</td>");
				columnArray.push("<td class='center'><a style='cursor:pointer;' data-lhpvPrimaryKey='"+lhpv.voucherId+"' id='showLHPVDetails_" + lhpv.voucherId + "' title='"+lhpv.lhpvRouteString+"'>" + lhpv.voucherNumber + "</a></td>");
				columnArray.push("<td class='center'>" + lhpv.routeFromBranchName + "</td>");
				columnArray.push("<td class='center'>" + lhpv.routeToBranchName + "</td>");
				columnArray.push("<td class='right' data-lr='lrcount'>" + lhpv.voucherTotalLRCount + "</td>");
				columnArray.push("<td class='right' data-weight='totalWeight'>" + lhpv.voucherTotalWeight + "</td>");
				columnArray.push("<td class='right' data-ddLR='ddLRCount'>" + lhpv.voucherTotalDDLRCount + "</td>");
				columnArray.push("<td class='right' data-km='totalKM'>" + lhpv.voucherTotalKilometer + "</td>");
				columnArray.push("<td class='center'><a style='cursor:pointer;' data-thvPrimaryKey='"+lhpv.truckHisabVoucherId+"' id='showTHVDetails_"+ lhpv.truckHisabVoucherId +"'>" + lhpv.truckHisabVoucherNumber + "</a></td>");
				columnArray.push("<td class='center'>" + lhpv.voucherRemark + "</td>");
				columnArray.push("<td class='center'>&nbsp;</td>");
				$('#pendingLHPVDDM tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				lhpv.voucherRemark	= "";
				lhpvDetails[pendingLHPVKeys[i]]	= lhpv;
				
				$("#showLHPVDetails_" + lhpv.voucherId).bind("click", function() {
					var elementId		= $(this).attr('id');
					var voucherId		= elementId.split('_')[1];
					_thisRender.showLHPVDetails(voucherId, lhpv.voucherNumber);
				});
				
				$("#showTHVDetails_" + lhpv.truckHisabVoucherId).bind("click", function() {
					var elementId				= $(this).attr('id');
					var truckHisabVoucherId		= elementId.split('_')[1];
					_thisRender.showTHVDetails(truckHisabVoucherId, lhpv.truckHisabVoucherNumber);
				});
			}
			
			pendingDDM			= responseData.pendingDDMFuelHisabDetails;
			pendingDDMKeys		= Object.keys(pendingDDM);
			
			for (var i=0; i<pendingDDMKeys.length; i++) {
				var ddm	= pendingDDM[pendingDDMKeys[i]];
				columnArray.push("<td class='center'>" + "DDM" + "</td>");
				columnArray.push("<td class='center'>" + ddm.voucherDateString + "</td>");
				columnArray.push("<td class='center'><a style='cursor:pointer;' data-ddmPrimaryKey='"+ddm.voucherId+"' id='showDDMDetails_" + ddm.voucherId + "' title='"+ddm.routeFromBranchName+"'>" + ddm.voucherNumber + "</a></td>");
				columnArray.push("<td class='center'>" + ddm.routeFromBranchName + "</td>");
				columnArray.push("<td class='center'>" + ddm.routeToBranchName + "</td>");
				columnArray.push("<td class='right' data-lr='lrcount'>" + ddm.voucherTotalLRCount + "</td>");
				columnArray.push("<td class='right' data-weight='totalWeight'>" + ddm.voucherTotalWeight + "</td>");
				columnArray.push("<td class='right' data-ddLR='ddLRCount'>" + ddm.voucherTotalDDLRCount + "</td>");
				columnArray.push("<td class='right' data-km='totalKM'>" + ddm.voucherTotalKilometer + "</td>");
				columnArray.push("<td class='center'>" + "--" + "</td>");
				columnArray.push("<td class='center'>" + ddm.voucherRemark + "</td>");
				columnArray.push("<td class='center'>&nbsp;</td>");
				$('#pendingLHPVDDM tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				ddm.voucherRemark	= "";
				ddmDetails[pendingDDMKeys[i]]	= ddm;
				
				$("#showDDMDetails_" + ddm.voucherId).bind("click", function() {
					var elementId	= $(this).attr('id');
					var voucherId	= elementId.split('_')[1];
					_thisRender.showDDMDetails(voucherId, ddm.voucherNumber, ddm.routeFromBranchId);
				});
			}
			
			pendingIntBranchLS		= responseData.pendingInterBranchLSFuelHisabDetails;
			pendingIntBranchLSKeys	= Object.keys(pendingIntBranchLS);
			
			for (var i=0; i<pendingIntBranchLSKeys.length; i++) {
				var interBranchLS	= pendingIntBranchLS[pendingIntBranchLSKeys[i]];
				
				columnArray.push("<td class='center'>" + "Inter Branch LS" + "</td>");
				columnArray.push("<td class='center'>" + interBranchLS.voucherDateString + "</td>");
				columnArray.push("<td class='center'><a style='cursor:pointer;' data-IntLSBranchName ='"+interBranchLS.routeFromBranchName+"' data-IntLSBranchPrimaryKey='"+interBranchLS.routeFromBranchId+"' data-IntLSPrimaryKey='"+interBranchLS.dispatchLedgerId+"' id='showIntLSDetails_" + interBranchLS.voucherId + "'>" + interBranchLS.voucherNumber + "</a></td>")
				columnArray.push("<td class='center'>" + interBranchLS.routeFromBranchName + "</td>");
				columnArray.push("<td class='center'>" + interBranchLS.routeToBranchName + "</td>");
				columnArray.push("<td class='right' data-lr='lrcount'>" + interBranchLS.voucherTotalLRCount + "</td>");
				columnArray.push("<td class='right' data-weight='totalWeight'>" + interBranchLS.voucherTotalWeight + "</td>");
				columnArray.push("<td class='right' data-ddLR='ddLRCount'>" + interBranchLS.voucherTotalDDLRCount + "</td>");
				columnArray.push("<td class='right' data-km='totalKM'>" + interBranchLS.voucherTotalKilometer + "</td>");
				columnArray.push("<td class='center'>" + "--" + "</td>"); 
				columnArray.push("<td class='center'>" + interBranchLS.voucherRemark + "</td>");
				columnArray.push("<td class='center'>&nbsp;</td>");
				
				$('#pendingLHPVDDM tbody').append('<tr>' + columnArray.join(' ') + '</tr>');
				columnArray	= [];
				interBranchLS.voucherRemark	= "";
				intLSDetails[pendingIntBranchLSKeys[i]]	= interBranchLS;
				
				$("#showIntLSDetails_" + interBranchLS.voucherId).bind("click", function() {
					var elementId				= $(this).attr('id');
					var dispatchLedgerId		= elementId.split('_')[1];
					_thisRender.showIntLSDetails(dispatchLedgerId, interBranchLS.voucherNumber);
				});
			}
			_thisRender.calculateTotals();
			$('#blankRowLHPVDDM').remove();
			$("#left-border-boxshadow").removeClass("hide");
			$("#right-border-boxshadow").removeClass("hide");
			$("#right1-border-boxshadow").removeClass("hide");
		},appendCollection : function() {
			var columnArray	= [];
			voucherDateString		= $('#collectionDateEle').val();
			voucherNumber			= $('#collectionLRNumberEle').val();
			routeFromBranchName		= $('#collectionFromEle').val();
			routeToBranchName		= $('#collectionToEle').val();
			voucherTotalKilometer	= $('#collectionKilometerEle').val();
			voucherRemark			= $('#collectionRemarkEle').val();
			var collectionObject	= new Object();
			collectionObject.voucherDateString		= voucherDateString;
			collectionObject.voucherNumber			= voucherNumber;
			collectionObject.wayBillId				= $('#waybillId').val();
			collectionObject.routeFromBranchName	= routeFromBranchName;
			collectionObject.collectionSourceId		= $('#sourceBranchId').val();
			collectionObject.routeToBranchName		= routeToBranchName;
			collectionObject.voucherTotalKilometer	= voucherTotalKilometer;
			collectionObject.voucherRemark			= voucherRemark;
			collectionObject.vehicleNumberMasterId	= vehicleNumberMasterId;
			collectionFinalObject[collectionObject.wayBillId]	= collectionObject;
			
			columnArray.push("<td class='center'>" + "Collection" + "</td>");
			columnArray.push("<td class='center'>" + voucherDateString + "</td>");
			columnArray.push("<td class='center'>" + voucherNumber + "</td>");
			columnArray.push("<td class='center'>" + routeFromBranchName + "</td>");
			columnArray.push("<td class='center'>" + routeToBranchName + "</td>");
			columnArray.push("<td class='right' data-lr='lrcount'>" + "1" + "</td>");
			columnArray.push("<td class='right' data-weight='totalWeight'>" + "--" + "</td>");
			columnArray.push("<td class='right' data-ddLR='ddLRCount'>" + "--" + "</td>");
			columnArray.push("<td class='right' data-km='totalKM'>" + voucherTotalKilometer + "</td>");
			columnArray.push("<td class='center'>" + "--" + "</td>");
			columnArray.push("<td class='center'>" + voucherRemark + "</td>");
			columnArray.push("<td class='center'><button data-collection ='"+collectionObject.wayBillId+"' id='removeBtn' class='btn btn-primary' onclick='_thisRender.removeCollectionRow(this)'><span data-selector='remove'>Remove</button></td>");			
			
			$('#pendingLHPVDDM tr:last').after('<tr>' + columnArray.join(' ') + '</tr>');
			$('#collectionLocalDetails').find('input:text').val('');
		
			columnArray	= [];
			_thisRender.calculateTotals();
			_thisRender.fuelCalculation();
		},appendLocal : function() {
			var columnArray	= [];
			voucherDateString		= $('#localDateEle').val();
			routeFromBranchName		= $('#localFromEle').val();
			routeToBranchName		= $('#localToEle').val();
			voucherTotalKilometer	= $('#localKilometerEle').val();
			voucherRemark			= $('#localRemarkEle').val();
			var localObject	= new Object();
			localObject.voucherDateString		= voucherDateString;
			localObject.routeFromBranchName		= routeFromBranchName;
			localObject.routeToBranchName		= routeToBranchName;
			localObject.voucherTotalKilometer	= voucherTotalKilometer;
			localObject.voucherRemark			= voucherRemark;
			localObject.vehicleNumberMasterId	= vehicleNumberMasterId;
			localFinalObject[localCounter]	= localObject;
		
			columnArray.push("<td class='center'>" + "Local" + "</td>");
			columnArray.push("<td class='center'>" + voucherDateString + "</td>");
			columnArray.push("<td class='center'>" + "--" + "</td>");
			columnArray.push("<td class='center'>" + routeFromBranchName + "</td>");
			columnArray.push("<td class='center'>" + routeToBranchName + "</td>");
			columnArray.push("<td class='right' data-lr='lrcount'>" + "--" + "</td>");
			columnArray.push("<td class='right' data-weight='totalWeight'>" + "--" + "</td>");
			columnArray.push("<td class='right' data-ddLR='ddLRCount'>" + "--" + "</td>");
			columnArray.push("<td class='right' data-km='totalKM'>" + voucherTotalKilometer + "</td>");
			columnArray.push("<td class='center'>" + "--" + "</td>");
			columnArray.push("<td class='center'>" + voucherRemark + "</td>");
			columnArray.push("<td class='center'><button data-local ='"+localCounter+"' id='removeBtn' class='btn btn-primary' onclick='_thisRender.removeLocalRow(this)'><span data-selector='remove'>Remove</button></td>");
		
			$('#pendingLHPVDDM tr:last').after('<tr>' + columnArray.join(' ') + '</tr>');
			$('#collectionLocalDetails').find('input:text').val('');
		
			columnArray	= [];
			_thisRender.calculateTotals();
			_thisRender.fuelCalculation();
			localCounter++;
		},fuelCalculation : function() {
			var startKM			= $('#startKMEle').val();
			var endKM			= $('#endKMEle').val();
			var average			= $('#averageEle').val();
		
			if (startKM >= 0 && endKM > 0 && average > 0) {
				var kilometerDiff	= parseInt(endKM) - parseInt(startKM);
				if (kilometerDiff > 0) {
					$('#runningKilometerEle').val(kilometerDiff);
					$('#fuelConsumptionEle').val(Math.round(kilometerDiff/average));
					$('#balanceFuelEle').val(totalFuel - (Math.round(kilometerDiff/average)));
					$('#finalFuelClosingEle').val(totalFuel - (Math.round(kilometerDiff/average)));
					$("#kilometerDifferenceDiv").removeClass("hide");
					$('#kilometerDiffEle').val(kilometerDiff - totalKilometer);
				} else {
					$('#fuelConsumptionEle').val("0");
					$('#balanceFuelEle').val(totalFuel);
					$('#finalFuelClosingEle').val(totalFuel);
				}
			}
			
			_thisRender.fuelDeduction();
		},fuelDeduction : function() {
			var balanceFuel 	= parseInt($('#balanceFuelEle').val());
			var deductionFuel 	= parseInt($('#deductionEle').val());
			
			if(isNaN(deductionFuel)){
				$('#finalFuelClosingEle').val(balanceFuel);
			}
			
			if(balanceFuel < 0 && (deductionFuel > -999 || deductionFuel < 999)) {
				$('#finalFuelClosingEle').val(balanceFuel + deductionFuel);
			}

			if(balanceFuel > 0 && (deductionFuel > -999 || deductionFuel < 999)) {
				$('#finalFuelClosingEle').val(balanceFuel + deductionFuel);
			}
		},createFuelHisabVoucher : function() {
			//$("#submitbtn").addClass("hide");
			//$("#submitbtn").attr("disabled", true);
			
			if (confirm('Are you sure you want to save?')) {
				//$("#submitbtn").addClass("hide");
				//$("#submitbtn").attr("disabled", true);
				
				showLayer();
				var hisabDetails					= new Object();			
				hisabDetails.vehicleNumberMasterId	= vehicleNumberMasterId;
				hisabDetails.driverMasterId			= $('#driverEle_primary_key').val();
				hisabDetails.startKilometer			= $('#startKMEle').val();
				hisabDetails.endKilometer			= $('#endKMEle').val();
				hisabDetails.vehicleAverage			= $('#averageEle').val();
				hisabDetails.vehicleAverageRemark	= $('#averageRemarkEle').val();
				hisabDetails.fuelConsumption		= $('#fuelConsumptionEle').val();
				hisabDetails.deduction				= $('#deductionEle').val();
				hisabDetails.deductionRemark		= $('#deductionRemarkEle').val();
				hisabDetails.finalFuelClosing		= $('#finalFuelClosingEle').val();
				hisabDetails.remark					= $('#remarkEle').val();
				hisabDetails.totalRunning			= totalKilometer;
				hisabDetails.fuelFillings			= pendingFuelReceiptKeys.length;
				hisabDetails.fuelOpening			= $('#closingFuelBalanceEle').val();

				var dataObject = {"pendingFuelReceipt":pendingFuelReceiptDetails,"lhpvDetails":lhpvDetails, "ddmDetails":ddmDetails, "collectionDetails":collectionFinalObject, "localDetails":localFinalObject, "voucherHisabDetails":hisabDetails, "intLSDetails":intLSDetails}
				
				if(!doneTheStuff){
					doneTheStuff = true
					$.ajax({
						type:		"POST",
						url: 		"fuelHisabSettlementGetDetails.do?pageId=345&eventId=4&dataObject=''",
						data:		"requestDataObject="+JSON.stringify(dataObject),
						dataType :	"json",
						success : function(data, textStatus, jqXHR) {
							if (!data || jQuery.isEmptyObject(data) || data.message.typeName == "error") {
								showMessage('error', data.message.description); // show message to show system processing error massage on top of the window.
								hideLayer();
								return false;
							}
							_thisRender.showResponse(data);
							hideLayer();
						},
						error : function(jqXHR, textStatus, errorThrown) {
							console.log("Something really bad happened " + textStatus);
							alert(jqXHR.responseText);
						}
					});
				}
			} else {
				$("#submitbtn").removeClass("hide");
				$("#submitbtn").attr("disabled", false);
				doneTheStuff = false;
			}
		},showResponse : function(response) {
			hideLayer();
			showMessage('success', "Fuel Hisab Voucher "+ response.fuelHisabVoucher + " Generated Successfully!!!");
			var filter	= 3;
			var id = response.fuelHisabSettlementId;
			childwin = window.open('fuelHisabSettlementGetDetails.do?pageId=345&eventId=5&fuelHisabSettlementId='+id+'&dataFilter='+filter, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
			setTimeout(function(){
				location.reload();
			},4000);

		},validateLRNumber : function(response) {
			$('#waybillId').val(0);
			$('#sourceBranchId').val(0);
			$('#collectionFromEle').val("");
			$('#collectionToEle').val("");
			$('#collectionFromEle').attr('readonly', false);
			$('#collectionToEle').attr('readonly', false);
			var wayBillNumber	= $("#collectionLRNumberEle").val();
			var filter	= 2;
			var requestDataObject = ['{"wayBillNumber":"'+wayBillNumber+'", "dataFilter":"'+filter+'"}']
			$.ajax({
				type:		"POST",
				url: 		"fuelHisabSettlementGetDetails.do?pageId=345&eventId=3&requestDataObject="+encodeURIComponent(requestDataObject),
				dataType :	"json",
				success : function(data, textStatus, jqXHR) {
					if (!data || jQuery.isEmptyObject(data) || data.message) {
						showMessage('error', data.message.description); // show message to show system processing error massage on top of the window.
						hideLayer();
						return false;
					}
					_thisRender.setWayBillId(data);
					hideLayer();
				},
				error : function(jqXHR, textStatus, errorThrown) {
					console.log("Something really bad happened " + textStatus);
					alert(jqXHR.responseText);
				}
			});
		},setWayBillId : function(response) {
			$('#waybillId').val(response.wayBill.wayBillId);
			$('#collectionFromEle').val(response.wayBill.sourceBranch);
			$('#collectionToEle').val(response.wayBill.destinationBranch);
			$('#collectionFromEle').attr('readonly', 'readonly');
			$('#collectionToEle').attr('readonly', 'readonly');
			$('#sourceBranchId').val(response.wayBill.sourceBranchId);
		},getFuelReceiptDetails : function(fuelReceiptId, fuelReceiptDetailsId) {
			var jsonObject 		= null;
			var jsonOutObject	= null;
			var printNo			= 0;
			jsonObject  = new Object();
			jsonOutObject  = new Object();
			jsonObject.pumpReceiptDetailsId	= fuelReceiptDetailsId;
			jsonObject.pumpReceiptId		= fuelReceiptId;
			jsonObject.Filter				= 7;
			showLayer();
			jsonOutObject = jsonObject;

			var jsonStr	  = JSON.stringify(jsonOutObject);
			$.getJSON("PrintReceiptAjaxAction.do?pageId=346&eventId=2", 
					{json:jsonStr}, function(data) {
						printJsonForPumpRecipt	= data.printForPumpRecipt;
						_thisRender.printWindowPumpReceipt(printNo);
						hideLayer();
					});	
		},printWindowPumpReceipt : function(printId) {
			childwin = window.open('pumpReceiptPrint.do?pageId=347&eventId=3&Printno='+printId, 'newwindow', config='height=600,width=850, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		},showLHPVDetails : function (lhpvId, lhpvNumber) {
			var LHPV_SEARCH_TYPE_ID = 3;
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+lhpvId+'&wayBillNumber='+lhpvNumber+'&TypeOfNumber='+LHPV_SEARCH_TYPE_ID+'&BranchId=0&CityId=0&searchBy=0');
		},showDDMDetails : function (ddmId, ddmMunmber, branchId) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+ddmId+'&wayBillNumber='+ddmMunmber+'&TypeOfNumber='+13+'&BranchId='+branchId+'&CityId=0&searchBy=0');
		},showIntLSDetails : function (dispatchLedgerId, lsNumber) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+dispatchLedgerId+'&wayBillNumber='+lsNumber+'&TypeOfNumber=2&BranchId=0&CityId=0&searchBy=');
		},showTHVDetails : function (truckHisabVoucherId, truckHisabVoucherNumber) {
			window.open('TransportSearchWayBillAction.do?pageId=5&eventId=3&wayBillId='+truckHisabVoucherId+'&wayBillNumber='+truckHisabVoucherNumber+'&TypeOfNumber='+16+'&BranchId='+0+'&CityId='+0+'&searchBy='+'null');
		},removeCollectionRow : function(el) {
			var row	= $(el).parent().parent();
			var waybillId = ($(el).attr('data-collection'));
			delete collectionFinalObject[waybillId];
			$(el).parent().parent().remove();
			_thisRender.calculateTotals();
		},removeLocalRow : function(el) {
			var row	= $(el).parent().parent();
			var localId = ($(el).attr('data-local'));
			delete localFinalObject[localId];
			$(el).parent().parent().remove();
			_thisRender.calculateTotals();
		},calculateTotals : function() {
			var lrcount	= new Array();
			$("[data-lr='lrcount']").each( function(index) {
				lrcount.push($(this).html());
			});
			var weight	= new Array();
			$("[data-weight='totalWeight']").each( function(index) {
				weight.push($(this).html());
			});
			var ddLR	= new Array();
			$("[data-ddLR='ddLRCount']").each( function(index) {
				ddLR.push($(this).html());
			});
			var km		= new Array();
			$("[data-km='totalKM']").each( function(index) {
				km.push($(this).html());
			});
			$('#totalRow').remove();
			totalLR			= _thisRender.sum(lrcount);
			totalWeight		= _thisRender.sum(weight);
			totalDDLR		= _thisRender.sum(ddLR);
			totalKilometer	= _thisRender.sum(km);
			var columnArray	= [];
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='right tableFooters'>" + "Total :" + "</td>");
			columnArray.push("<td class='right tableFooters'>" + totalLR + "</td>");
			columnArray.push("<td class='right tableFooters'>" + totalWeight + "</td>");
			columnArray.push("<td class='right tableFooters'>" + totalDDLR + "</td>");
			columnArray.push("<td class='right tableFooters'>" + totalKilometer + "</td>");
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='center tableFooters'>" + "&nbsp;" + "</td>");
			columnArray.push("<td class='center'>&nbsp;</td>");
			$('#pendingLHPVDDM tr:last').after('<tr id="totalRow">' + columnArray.join(' ') + '</tr>');
			$('#voucherTotalKilometerEle').val(totalKilometer);
			
			columnArray	= [];
		},sum : function (array) {
			var total = 0;
			var i = array.length; 
			while (i--) {
				if(!isNaN(parseInt(array[i]))){
					total += parseInt(array[i]);
				}
			}
			return total;
		},allowOnlyAlphanumeric : function (evt) {
			if (evt.ctrlKey == 1) {
				return true;
			} else {
				var keynum = null;

				if(window.event){ // IE
					keynum = evt.keyCode;
				} else if(evt.which){ // Netscape/Firefox/Opera
					keynum = evt.which;
				}

				if(keynum == 8) {
					return true;
				}

				var charStr = String.fromCharCode(keynum);
				if (/^[a-zA-Z0-9\-\s]+$/.test(charStr)) {
					hideAllMessages();
					return true;
				} else {
					showMessage('warning', alphaNumericAllowWarningMsg);
					return false;
				}
			}
		}
	});
});