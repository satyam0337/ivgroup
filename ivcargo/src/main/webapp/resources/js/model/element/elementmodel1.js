define(
		function(require) {
			var 
			Backbone = require('backbone');
			
			var model = Backbone.Model.extend({
				defaults:{
					elementId				:"",
					elementGlyphicon		:"glyphicon glyphicon-th",
					elementImageUrl			:"",
					elementName				:"",
					elementType				:"",
					tooltipName				:"",
					labelId					:"",
					elementDefaultValue		:"",
					dataDtoKey				:"",//table name is same as db name to compare with ws data
					primaryIdDtoName		:"",//table name is same as primary key of table name to compare with ws data
					openInNewTab			:false,//table name is same as primary key of table name to compare with ws data
					viewDetailsByIdUrl		:"",
					isActionButtton			:false,
					columnDisplayCssClass	:'column-data-left-align',// default set to left align
					columnWidth				:150,
					columnMinWidth			:100,
					displayColumnTotal			:false,
					divRegion				:"region",
					parentDivCss			:"col-xs-5",
					labelCss				:"col-xs-3",
					elementDivCss			:"col-xs-8 validation-message",//validation-message should always be set when inherited to get validation at side of that element
					elementImageTag			:"<i class='glyphicon glyphicon-th'></i>",
					columnPrintWidthInPercentage	:20// specify Column width on printing in milimeters
					,labelTag				:"",
					showLabel				:true,
					inputElement 			: "input",
					elementValueMaxLength	:"",
					buttonCallback			:"",
					buttonCss				:"btn btn-primary",
					labelValue				:"",
					dataType				:"text",
					elementOnKeyup			:"",
					elementOnFocus			:"",
					elementOnBlur			:"",
					elementOnKeypress		: "",
					setDefaultLabel 		: false,
					elementStyle			: ""
				}
			});
			return model;
		}
);
