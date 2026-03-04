//initialize your variables outside the function 
var count = 0; var clearTime; var seconds = 0, minutes = 0, hours = 0; 
var clearState; var secs, mins, gethours ; 

function showLayer() {
	$("#shadow").show();
	$("#question").show();
	//$(".questionLayer").html("Please wait...");
	//$(".questionLayer").show();
	$(".ivloader").show();
	startTime();
}

function hideLayer() {
	 setTimeout(() => {
        $("#shadow, #question, .questionLayer, .arrow, .bounce, .ivloader").hide();
        if (typeof resetTime === "function") {
            resetTime();
        }
    }, 500);
	$("#shadow").hide();
	$("#question").hide();
	$(".questionLayer").hide();
	$(".arrow").hide();
	$(".bounce").hide();
	$(".ivloader").hide();
	resetTime();
}

function showUpperSignLayer(message) {
	$("#shadow").show();
	$("#question").show();
	$(".bounce").show();
	$(".arrow").show();
	$(".questionLayer").html(message);
	$(".questionLayer").show();
}

function startWatch( ) { /* check if seconds is equal to 60 and add a +1 to minutes, and set seconds to 0 */ 
	if ( seconds === 60 ) {
		seconds = 0; minutes = minutes + 1; 
	} /* you use the javascript tenary operator to format how the minutes should look and add 0 to minutes if less than 10 */ 
	
	mins = ( minutes < 10 ) ? ( '0' + minutes + ' : ' ) : ( minutes + ' : ' ); 
	/* check if minutes is equal to 60 and add a +1 to hours set minutes to 0 */ 
	if ( minutes === 60 ) { 
		minutes = 0; hours = hours + 1; 
	} 
	/* you use the javascript tenary operator to format how the hours should look and add 0 to hours if less than 10 */ 
	gethours = ( hours < 10 ) ? ( '0' + hours + ' : ' ) : ( hours + ' : ' ); 
	secs = ( seconds < 10 ) ? ( '0' + seconds ) : ( seconds ); 
	
	// display the stopwatch 
	
	var x = document .getElementById("timer"); 
	
	if(x != null)
		x.innerHTML = 'Time: ' + gethours + mins + secs;
	
	/* call the seconds counter after displaying the stop watch and increment seconds by +1 to keep it counting */ 
	seconds++; 
	/* call the setTimeout( ) to keep the stop watch alive ! */ 
	clearTime = setTimeout("startWatch()", 1000 ); 
} // startWatch( ) //create a function to start the stop watch 

function startTime() { /* check if seconds, minutes, and hours are equal to zero and start the stop watch */ 
	if ( seconds === 0 && minutes === 0 && hours === 0 ) { 
		/* call the startWatch( ) function to execute the stop watch whenever the startTime( ) is triggered */ 
		startWatch( ); 
	} // if () } // 
	
	$("#timer").show();
}

//create a function to stop the time 
function resetTime() { 
	/* check if seconds, minutes and hours are not equal to 0 */ 
	if ( seconds !== 0 || minutes !== 0 || hours !== 0 ) { 
		// reset the stop watch 
		seconds = 0; minutes = 0; hours = 0; 
		secs = '0' + seconds; 
		mins = '0' + minutes + ' : '; 
		gethours = '0' + hours + ' : '; 
		/* display the stopwatch after it's been stopped */ 
		var x = document.getElementById ("timer"); 
		var stopTime = 'Time : ' + gethours + mins + secs; 
		
		if(x != null) x.innerHTML = stopTime; 
		/* clear the stop watch using the setTimeout( ) return value 'clearTime' as ID */ 
		clearTimeout( clearTime ); 
	}  
	
	$("#timer").hide();
}