/**
 * Anant 11-05-2024
 */

 function showClock() {
	let localTime = new Date();
	let timeDiff = localTime.getTime() - curDate.getTime();

	if( clientAndSysDateTimeDiff < timeDiff)
		curDate.setMilliseconds(curDate.getMilliseconds() + (timeDiff - clientAndSysDateTimeDiff));
	else
		curDate.setMilliseconds(curDate.getMilliseconds() + (clientAndSysDateTimeDiff - timeDiff));
	
	let month  = curDate.getMonth() + 1;
	let date   = curDate.getDate();
	let year   = curDate.getYear() + 1900;
	let hours  = curDate.getHours(); 
	let minutes= curDate.getMinutes();
	let seconds= curDate.getSeconds();
	let dn = "AM"; 
	
	if (hours >= 12) { dn = "PM"; hours = hours - 12}; 
	if (hours == 0) hours = 12;
	if (minutes <= 9) minutes = "0" + minutes;
	if (seconds <= 9) seconds = "0" + seconds;
	
	if (date < 10) date	= "0" + date;
	if (month < 10) month = "0" + month;

	document.getElementById('clockbox').innerHTML = "" + date + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + seconds + " " + dn + "";
	
	if(document.getElementById('clockbox').style.color == "blue")
		document.getElementById('clockbox').style.color = "firebrick"; 
	else
		document.getElementById('clockbox').style.color = "blue";

	setTimeout(showClock, 1000);
}

function startTimer(countDownDateTime) {
	$('#countDownMessage').html(headerConfig.countDownTimerMessage + " On " + countDownDateTime);
	
	//example - Oct 12, 2024 12:40:00, MMM d, yyyy HH:mm:ss
	let countDownDate = new Date(countDownDateTime).getTime();
	//let countDownDate = new Date("Oct 10, 2024 11:45:00").getTime();
	// Update the count down every 1 second
	let countDownClock = setInterval(function() {
		// Get today's date and time
		let now = new Date().getTime();
		
		// Find the distance between now and the count down date
		let distance = countDownDate - now;
	
		// Time calculations for days, hours, minutes and seconds
		let days	= Math.floor(distance / (1000 * 60 * 60 * 24));
		let hours	= Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		let minutes	= Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		let seconds	= Math.floor((distance % (1000 * 60)) / 1000);
	
		// Output the result in an element with id="demo"
		document.getElementById("countDownClock").innerHTML = " ( Time left-> " +  days + ":" + hours + ":" + minutes + ":" + seconds + " )";
		
		// If the count down is over, write some text 
		if (distance < 0) {
			clearInterval(countDownClock);
			document.getElementById("countDownClock").innerHTML = "";
			$('.count-down-timer').remove();
	  	} else
	  		$('.count-down-timer').removeClass('hide');
	}, 1000);
}