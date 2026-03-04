 function CloseCal()
 {
 	document.getElementById("CalFrame").style.visibility = "hidden";
 }
 
 function OpenTravelDateFrame(textDate,anchorDate,formatDate)
 {
	 	document.getElementById("CalFrame").style.visibility = "visible";
		top.frames["CalFrame"].OpenCal(textDate,anchorDate,formatDate);
			
  } 