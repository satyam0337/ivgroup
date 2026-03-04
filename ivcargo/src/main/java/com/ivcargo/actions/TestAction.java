package com.ivcargo.actions;

//~--- non-JDK imports --------------------------------------------------------

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Action;

public class TestAction implements Action {
	public void execute(HttpServletRequest request, HttpServletResponse response) {
		/*        try {
            if (request.getParameter("wayBillId") != null) {
                request.setAttribute("wayBillId", JSPUtility.GetLong(request, "wayBillId"));
            }

            if (request.getParameter("dispatchLedgerId") != null) {
                request.setAttribute("dispatchLedgerId", JSPUtility.GetLong(request, "dispatchLedgerId"));
            }
        } catch (Exception e) {

            e.printStackTrace();
        }

        Hashtable error = (Hashtable) request.getAttribute("error");
        if ((error.size() > 0) && error.containsKey("errorCode")) {
           request.setAttribute("cargoError", error);
            request.setAttribute("nextPageToken", "needlogin");
        }
        else{
        	System.out.println("not fnd err");
        	 request.setAttribute("nextPageToken", "success");
        }


    }*/
		request.setAttribute("nextPageToken", "success");
	}
}