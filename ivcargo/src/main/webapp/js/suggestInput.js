/**
* @author Natalia Bazhenova www.fh54.de (c) 2005-2007
*/
	
/*******start config****************/
//array with suggest texts
//id of the textbox element
var inputID="vehicleNumber";
//max size of "selectbox"
var maxcount=50 ;
/**********end config***********/

var scripting=false;
//initialize:
//for mozilla
if (window.captureEvents) {
    window.captureEvents(Event.LOAD);
    window.onload=suggestInput_init;
	}
//for ie
document.onreadystatechange=ieInit;
function ieInit(){
if (document.readyState=="complete"){
      document.body.onload=function() {suggestInput_init();}
   }
}
var SIs; //initially invisible select box
var SItxt; //the main input text element
var newdiv=document.createElement("DIV"); //a visible pendant to select box
newdiv.id='VehicleNoDiv';
var globalN=0; //how much options scrolled up
//for ie
if (document.attachEvent)
	document.attachEvent("onclick",hideSelect);
// for Mozilla
if (document.captureEvents) {
	document.captureEvents(Event.CLICK | Event.KEYUP);
	document.onclick = hideSelect;
	document.onkeyup = function(event) { if(event.keyCode==13) hideSelect(); }
}
function hideSelect() {
	newdiv.style.display="none";
}
function suggestInput_init() {
	if (document.createElement("DIV")) { //otherwise nothing happens
		scripting=true;
		SIs=document.createElement("SELECT");
		SIs.onkeyup=function(e){
			if(!e) e=event; setInputValue(this.selectedIndex,e);
		}
		SIs.className="select_input"
		SIs.setAttribute("id","selectInput");
		SIs.style.position="absolute";
		SIs.style.top="-9999px";
		SIs.style.left="-9999px";
		SIs.style.visibility="hidden";
		document.body.appendChild(SIs);
		SItxt =document.getElementById(inputID);
		SItxt.setAttribute("autocomplete","OFF");
		SItxt.onkeyup=function(e){
			if (!e) e=event; showSelection(this,e);
		}
		if(opttext != null && opttext.length > 0){
			for (var i=0;i<opttext.length;i++) {
				o=document.createElement("OPTION");;
				o.innerHTML=opttext[i];
				SIs.appendChild(o);
				SIs.style.visibility="visible"; // for Opera
			}
		}
		elt=SItxt;
		if(	SItxt.style.visibility == 'visible'){
		SItxt.focus();
		}
		//find coords where the suggest div will appear
		pos2=findPos(elt); pos2.push(elt.offsetHeight); pos2.push(elt.offsetWidth);
		
		newdiv.style.top=(pos2[1]+pos2[2])+'px';
		newdiv.style.left=pos2[0]+'px';
		newdiv.style.width=pos2[3]+'px';
		newdiv.className="suggestBoxContainer";
		newdiv.style.display="none";
		buildDiv(0);
		document.body.appendChild(newdiv);
	 }
} 
 
function buildDiv(n) {
	if (n>SIs.childNodes.length) 
		return false; 
	for (i=0;i<newdiv.childNodes.length;i++) {
		newdiv.removeChild(newdiv.childNodes[i]);i--
	}
	if (n>0) {// insert top "..." - div
		d1=document.createElement("DIV");
		d1.id="lessDiv";
		d1.style.width="100%";
		d1.style.fontSize="0.8em";
		d1.onmouseover=function() {this.className="suggest_mouse_over";}
		d1.onmouseout=function() {this.className="suggestBox";}
		d1.onclick=function() {
			buildDiv(n-1);
			d1.className="suggest_mouse_over";
		} 
		d1.innerHTML="......"; 
		newdiv.appendChild(d1); 
	}
	m=(maxcount<SIs.childNodes.length)?(maxcount):(SIs.childNodes.length);
	for(i=0;i<m;i++) {
		d=document.createElement("DIV");
		d.style.width="100%";
		d.style.fontSize="0.8em";
		d.onmouseover=function() {
			this.className="mouse_over";
			SItxt.value=this.innerHTML;
		}
		d.onmouseout=function() {
			this.className='suggestBox';
		}
		d.onclick=function() {
			SItxt.value=this.innerHTML;
			newdiv.style.display="none";
		}
		try {
			d.innerHTML=SIs.childNodes[i+n].innerHTML;
		}
		catch(err) {}
		newdiv.appendChild(d);
	};
	globalN=n;
	if (SIs.childNodes.length-n>maxcount) {// insert bottom "..." - div
		d2=document.createElement("DIV");
		d2.id="moreDiv";
		d2.style.width="100%";
		d2.style.fontSize="0.8em";
		d2.onmouseover=function() {this.className="suggest_mouse_over";}
		d2.onmouseout=function() {this.className="suggestBox";}
		d2.onclick=function() {
			buildDiv(n+1); 
			d2.className="suggest_mouse_over";
		}
		d2.innerHTML="......"; 
		d2.className="suggestBox";
		newdiv.appendChild(d2) ;
	 } 
 }
 
function setInputValue(m,ev) {
	if (!scripting) return;
	isLess=(document.getElementById("lessDiv"))?(1):(0);
	if (m>globalN+maxcount+isLess+1) {
		m=globalN+maxcount;SIs.selectedIndex=m;
	}
	if (m<isLess) {
		m=globalN-1;SIs.selectedIndex=globalN-1;
	}
	a=SIs.childNodes[m].innerHTML;
	SItxt.value=a;
	try {
		if (newdiv.childNodes[m-globalN+isLess]) {  
			if (newdiv.childNodes[m-globalN+isLess].id=="moreDiv") { 
				buildDiv(globalN+1);  
				newdiv.childNodes[maxcount].className="suggest_mouse_over";
				return;
			}
		}
	} catch (err) {}
	try {
		if (newdiv.childNodes[m-globalN+isLess]) {  
			if (newdiv.childNodes[m-globalN+isLess].id=="lessDiv") {  
				buildDiv(globalN-1);
				isLess_new=(document.getElementById("lessDiv"))?(1):(0);
		 		newdiv.childNodes[isLess_new].className="suggest_mouse_over";
		 		return;
			}
		}
	} catch (err) {}
	try {
		for (i=0;i<newdiv.childNodes.length;i++)
			newdiv.childNodes[i].className="suggestBox";
		 newdiv.childNodes[m-globalN+isLess].className="suggest_mouse_over";
	} catch(err) {}; 
	if ((ev.keyCode!=40) && (ev.keyCode!=38) && (ev.keyCode!=0)) { // if not arrow down, arrow up or mouseclick  
		newdiv.style.display="none";
		SItxt.focus();
	}
}
 
function showSelection(textbox,ev) {
	var t= textbox.value;
	
	if (!scripting) return;
	if (ev.keyCode==40) { // by arrow down comes into suggestion select
		 if (SIs.childNodes.length>0) {
			  newdiv.childNodes[0].className="suggest_mouse_over";
			  SItxt.value=SIs.childNodes[0].innerHTML; 
			  try {
			  	SIs.focus();
			  } catch(err){}
			  SIs.childNodes[0].selected=true;
		 }
		 return            
	}
	if (t=="") 
		return ;
	t=t.toUpperCase();
	l=t.length; 
	for (i=0;i<SIs.childNodes.length;i++) {
		SIs.removeChild(SIs.childNodes[i]);
		i--;
	}
	if(opttext != null && opttext.length > 0){
		for(i=0;i<opttext.length;i++) {
			
			 if (opttext[i].indexOf(t)>-1) {
			
			  	oOption = document.createElement("OPTION");
			  	SIs.appendChild(oOption);
			 	 oOption.innerHTML = opttext[i];
			 }
		}
	}
	if (SIs.childNodes.length>0)  {
		newdiv.style.display="";
		buildDiv(0);
	} 
	else{
		//newdiv.style.display="none";
		//textbox.value=t.substring(0,l-1);
		t=textbox.value;
		if(opttext != null && opttext.length > 0){
			if (opttext[i].indexOf(t)>-1) {
				
				oOption = document.createElement("OPTION");
				SIs.appendChild(oOption);
				oOption.innerHTML = opttext[i];
			}
		}
		newdiv.style.display="";
		buildDiv(0);
	}
	SItxt.focus();
}

/** Source: http://www.quirksmode.org/js/findpos.html - is better than my own**/
 function findPos(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		curleft = obj.offsetLeft;
		curtop = obj.offsetTop;
		while (obj = obj.offsetParent) {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		}
	} 
	return [curleft,curtop];
} 