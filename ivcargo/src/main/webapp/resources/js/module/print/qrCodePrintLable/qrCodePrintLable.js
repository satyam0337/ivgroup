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
			getJSON(jsonObject, WEB_SERVICE_URL	+ '/qrCodePrintLableWS/getQRCodePrintLableElement.do?', _this.renderAllDetailsElements, EXECUTE_WITHOUT_ERROR);
			return _this;
		},renderAllDetailsElements : function(response) {
			let loadelement 			= new Array();
			let baseHtml 				= new $.Deferred();
			loadelement.push(baseHtml);
			
			$("#mainContent").load("/ivcargo/html/print/qrCodePrintLable/qrCodePrintLable.html",function() {
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
			
				$("#printQRBtn").click(function() {
					_this.validateAndPrintQRCode();								
				});
			});
		}, validateAndPrintQRCode	: function() {
			if($('#fromRange').val() == '' || $('#fromRange').val().length == 0){
				showMessage('error','Please Enter From Range');
				return;
			}
			
			if($('#toRange').val() == '' || $('#toRange').val().length == 0){
				showMessage('error','Please Enter To Range');
				return;
			}
			
			if($('#fromRange').val() <= 0){
				showMessage('error','From Range Should Be Grater Than 0');
				return;
			}
			
			if($('#toRange').val() <= 0){
				showMessage('error','To Range Should Be Grater Than 0');
				return;
			}
			
			if(Number($('#toRange').val()) < Number($('#fromRange').val())){
				showMessage('error','To Range Should Be Grater Than From Range');
				return;
			}
		
			if ($("#dateEle").attr('data-startdate') != undefined)
				localStorage.setItem("fromDate", $("#dateEle").attr('data-startdate'));

			if ($("#dateEle").attr('data-enddate') != undefined)
				localStorage.setItem("endDate", $("#dateEle").attr('data-endDate'));
		
			localStorage.setItem("fromRange", $('#fromRange').val());
			localStorage.setItem("toRange", $('#toRange').val());
			childwin = window.open('qrCodeDataPrintLable.do?pageId=340&eventId=10&modulename=qrCodeDataPrintLable&isReprint=true','newwindow', config='fullscreen=yes, toolbar=no, menubar=no, scrollbars=yes, resizable=no,location=no, directories=no, status=no');		
		
		}
	});
});
