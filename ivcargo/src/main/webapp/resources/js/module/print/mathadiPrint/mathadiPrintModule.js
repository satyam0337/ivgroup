define([ PROJECT_IVUIRESOURCES+'/resources/js/populateautocomplete/selectoption.js',
		'slickGridWrapper3',
		 'JsonUtility',
		 'messageUtility',
		 'bootstrapSwitch',
		 'nodvalidation',
		 'focusnavigation',
		 PROJECT_IVUIRESOURCES + '/resources/js/backbone/backbone.bootstrap-modal.js'
	], function(Selection, slickGridWrapper) {
		let jsonObject = new Object();
		return Marionette.LayoutView.extend({
		initialize : function() {
			_this = this;
			this.$el.html(this.template);
		}, render : function() {
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/mathadiPrintModuleWS/getMathadiPrintModuleElement.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderAllDetailsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/print/mathadiPrint/mathadiPrintModule.html",function() {
				baseHtml.resolve();
			});
			
			$.when.apply($, loadelement).done(function() {
				initialiseFocus();
							
				let elementConfiguration				= new Object();
				elementConfiguration.dateElement		= $('#dateEle');

				response.elementConfiguration		= elementConfiguration;
				response.isCalenderSelection		= true;
				Selection.setSelectionToGetData(response);

				myNod = Selection.setNodElementForValidation(response);
		
				hideLayer();
			
				$("#findBtn").click(function() {
					myNod.performCheck();
					
					if(myNod.areAll('valid'))
						_this.onSearch();								
				});
				
				$("#printBtn").click(function() {
					_this.showPrint();								
				});
			});
		}, onSearch : function() {
			$('#bottom-border-boxshadow').addClass('hide');
			let jsonObject	= new Object();
			showLayer();
			
			if ($("#dateEle").attr('data-startdate') != undefined)
				jsonObject["fromDate"] = $("#dateEle").attr('data-startdate');

			if ($("#dateEle").attr('data-enddate') != undefined)
				jsonObject["toDate"] = $("#dateEle").attr('data-enddate'); 

			getJSON(jsonObject, WEB_SERVICE_URL+'/mathadiPrintModuleWS/getMathadiDetails.do', _this.setMathadiData, EXECUTE_WITH_NEW_ERROR);
		}, setMathadiData : function(response) {
			hideLayer();
			if(response.message != undefined) {
				$('#bottom-border-boxshadow').addClass('hide');
				return;
			}
			
			let language	= {'partialheader' : 'Print Mathadi'};

			if(response.CorporateAccount != undefined) {
				let tableProperties	= response.tableProperties;
					
				$('#bottom-border-boxshadow').removeClass('hide');
				hideAllMessages();

				slickGridWrapper.applyGrid({
					ColumnHead					: response.columnConfigurationList, // *compulsory // for table headers
					ColumnData					: response.CorporateAccount, 	// *compulsory // for table's data
					Language					: language, 			// *compulsory for table's header row language
					tableProperties				: tableProperties,
					SerialNo:[{						// optional field // for showing Row number
						showSerialNo	: tableProperties.showSerialNumber,
						SearchFilter	: false,	// for search filter on serial no
						ListFilter		: false,	// for list filter on serial no
						title			: "Sr No."
					}],
					NoVerticalScrollBar			: false
				});
			} else
				$('#bottom-border-boxshadow').addClass('hide');
					
			hideLayer();
		}, showPrint	: function() {
			let jsonObject	= {};
			let selectionMsg	= ' Please, Select atleast 1 checkbox for Print !';
			let selectedLRDetails	= null;

			selectedLRDetails = slickGridWrapper.getValueForSelectedData({InnerSlickId : 'data'}, selectionMsg);

			if(typeof selectedLRDetails == 'undefined')
				return;
					
			let selectedLRDetailsLength	= selectedLRDetails.length;
				
			if(selectedLRDetailsLength > 1) {
				showAlertMessage('info', 'Only 1 selection is allow !');
				return;
			}
			jsonObject.creationDateTime		= selectedLRDetails[0].lhpvCreationDateTimeStr;
					
			localStorage.setItem("creationDateTime", jsonObject.creationDateTime);
			childwin = window.open('mathadiDataPrint.do?pageId=340&eventId=10&modulename=mathadiDataPrint&isReprint=true','newwindow', config='height=400,width=625, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');
		}
	});
});
