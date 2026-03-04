function populateData( divid, service){
	//alert('asd');
	var xmlHttp;
	try
	  {
	  // Firefox, Opera 8.0+, Safari
	  xmlHttp=new XMLHttpRequest();
	  }
	catch (e)
	  {
	  // Internet Explorer
	  try
	    {
	    xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
	    }
	  catch (e)
	    {
	    try
	      {
	      xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
	      }
	    catch (e)
	      {
	      alert("Your browser does not support AJAX!");
	      return false;
	      }
	    }
	  }
	  xmlHttp.onreadystatechange=function()
	    {
	    if(xmlHttp.readyState==4)
	      {
	    		pageLoad(xmlHttp.responseText);
	    		document.getElementById(divid).innerHTML=xmlHttp.responseText;
	      }
	    }
	  xmlHttp.open("GET",service,true);
	  xmlHttp.send(null);
	
}