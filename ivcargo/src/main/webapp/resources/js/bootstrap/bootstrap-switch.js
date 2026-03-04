(function ( $ ) {
	$.fn.bootstrapSwitch = function( options ) {
		var settings = $.extend({
			on: 'ACTIVE',
			off: 'INACTIVE',
			onLabel: 'ACTIVATE',
			offLabel: 'DEACTIVATE',
			same: false,//same labels for on/off states
			size: 'md',
			onClass: 'warning',
			offClass: 'success',
			deactiveTittle : 'Deactivate',
			deactiveContent : 'Are you sure you want to deactivate?',
			activeTittle : 'Activate',
			activeContent : 'Are you sure you want to activate?',
		}, options );

		settings.size = ' btn-'+settings.size;
		if (settings.same){
			settings.onLabel = settings.on;
			settings.offLabel = settings.off;
		}

		return this.each(function(e) {
			var c = $(this);
			if(c.css('display') != 'none'){
				var disabled = c.is(":disabled") ? " disabled" : "";

				var div = $('<div class=" btn-group btn-toggle" style="white-space: nowrap;"></div>').insertAfter(this);
				var on = $('<button class="btn btn-primary '+settings.size+disabled+'" style="float: none;display: inline-block;"></button>').html(settings.on).css('margin-right', '0px').appendTo(div);
				var off = $('<button class="btn btn-danger '+settings.size+disabled+'" style="float: none;display: inline-block;"></button>').html(settings.off).css('margin-left', '0px').appendTo(div);

				function applyChange(b) {
					if(b) {
						on.attr('class', 'btn active btn-' + settings.onClass+settings.size+disabled).html(settings.on).blur();
						off.attr('class', 'btn btn-default '+settings.size+disabled).html(settings.offLabel).blur();
						on.attr('disabled','disabled');
						off.removeAttr('disabled',false);
					}
					else {
						on.attr('class', 'btn btn-default '+settings.size+disabled).html(settings.onLabel).blur();
						off.attr('class', 'btn active btn-' + settings.offClass+settings.size+disabled).text(settings.off).blur();
						off.attr('disabled','disabled');
						on.attr('disabled',false);
					}
				}
				applyChange(c.is(':checked'));
				on.click(function(e) {
					//this library is used to get the modal automatically
					var modal = new Backbone.BootstrapModal({
						content: settings.deactiveContent,//content will show the main content of modal 
						showFooter : true,//show footer consist of ok and cancel button if true then only footer would be shown
						title : settings.deactiveTittle,//this is the header of modal which needs to be provided
						okText:'Yes'//this should be given if not provided then it will show ok as save button
					}).open();
					modal.on('ok', function() {
						e.preventDefault();c.prop("checked", !c.prop("checked")).trigger('change')
					});
				});
				off.click(function(e) {
					var modal = new Backbone.BootstrapModal({
						content: settings.activeContent,//content will show the main content of modal 
						showFooter : true,//show footer consist of ok and cancel button if true then only footer would be shown
						title : settings.activeTittle,//this is the header of modal which needs to be provided
						okText:'Yes'//this should be given if not provided then it will show ok as save button
					}).open();
					modal.on('ok', function() {
						e.preventDefault();c.prop("checked", !c.prop("checked")).trigger('change')	
					});
				});
				$(this).hide().on('change', function() {
					applyChange(c.is(':checked'))
				});
			}
		});
	};
} ( jQuery ));
