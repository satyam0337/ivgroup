package com.ivcargo.validators;

import java.util.HashMap;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.framework.Validator;

public class LoginValidator  implements Validator {

	public HashMap<String,Object> validate(HttpServletRequest request,HttpServletResponse response) {
		HashMap<String,Object> error = new HashMap<String,Object>();
		return error;
	}
}