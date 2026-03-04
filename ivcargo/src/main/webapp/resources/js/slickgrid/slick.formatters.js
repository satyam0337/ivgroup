/***
 * Contains basic SlickGrid formatters.
 * 
 * NOTE:  These are merely examples.  You will most likely need to implement something more
 *        robust/extensible/localizable/etc. for your use!
 * 
 * @module Formatters
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Formatters": {
        "PercentComplete": PercentCompleteFormatter,
        "PercentCompleteBar": PercentCompleteBarFormatter,
        "YesNo": YesNoFormatter,
        "Checkmark": CheckmarkFormatter,
        "SerialNumber":SerialNumberFormatter,
        "SwitchActiveDeactive":SwitchActiveDeactiveFormatter,
        "Button":ButtonFormatter,
        "DefaultValues":DefaultValueFormatter,
        "Input":InputFormatter,
      }
    }
  });

  function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "-";
    } else if (value < 50) {
      return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
    } else {
      return "<span style='color:green'>" + value + "%</span>";
    }
  }

  function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "";
    }

    var color;

    if (value < 30) {
      color = "red";
    } else if (value < 70) {
      color = "silver";
    } else {
      color = "green";
    }

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
  }

  function YesNoFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "Yes" : "No";
  }

  function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "<img src='../images/tick.png'>" : "";
  }
  function SerialNumberFormatter(row, cell, value, columnDef, dataContext) {
	  return row+1;
  }
  function SwitchActiveDeactiveFormatter(row, cell, value, columnDef, dataContext) {
		if(dataContext.statusChange=='ACTIVE'){
			return "<input type='checkbox' checked data-primaryId='"+dataContext.masterId+"' >";
		}
		else{
			return "<input type='checkbox' data-primaryId='"+dataContext.masterId+"' >";
		}
	}
  function ButtonFormatter(row, cell, value, columnDef, dataContext) {
		return "<button type='button' id='"+columnDef.name+row+"' class='"+columnDef.buttonCss+"' data-tooltip='"+columnDef.name+"'>"+columnDef.name+"</button>";
	}
  function InputFormatter(row, cell, value, columnDef, dataContext) {
	  if(typeof value=='undefined'){
		  value='';
	  }
	  return "<input type='text' id='"+columnDef.name+row+"' class='"+columnDef.buttonCss+"' data-tooltip='"+columnDef.name+"' value='"+value+"' placeholder='"+columnDef.name+"' maxlength='"+columnDef.maxLength+"'>";
  }
  function DefaultValueFormatter(row, cell, value, columnDef, dataContext) {
	  if(value == null || value === "" || typeof value == 'undefined'){
		  if(columnDef.valueType == 'number' || columnDef.dataType =='number'){
			  value = 0;
		  }
	  }
	  return value;
  }
})(jQuery);
