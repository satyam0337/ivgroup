 function CloseCal2()
 {
 	document.getElementById("CalFrame2").style.visibility = "hidden";
 }
 
 function OpenTravelDateFrame2(textDate,anchorDate,formatDate)
 {
	 	document.getElementById("CalFrame2").style.visibility = "visible";
		top.frames["CalFrame2"].OpenCal(textDate,anchorDate,formatDate);
			
  } 