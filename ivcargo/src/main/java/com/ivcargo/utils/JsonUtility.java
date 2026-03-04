package com.ivcargo.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.iv.logsapp.LogWriter;
import com.iv.utils.dataObject.ValueObject;
import com.iv.utils.exception.ExceptionProcess;

@SuppressWarnings("unchecked")
public class JsonUtility {

	private static final String TRACE_ID = "JsonUtility";

	private JsonUtility() {}

	// convert json object all data into value object
	public static ValueObject convertJsontoValueObject (JSONObject jsonObject) throws Exception {
		try {
			final var	valueObject		= new ValueObject();
			final Iterator<?> keys = jsonObject.keys();

			while (keys.hasNext()) {
				final var key = (String) keys.next();
				valueObject.put(key, jsonObject.get(key));
			}

			return valueObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static ValueObject convertJsonObjectsToValueObject(JSONObject jsonObject) throws Exception {
		try {
			final var	valueObject		  = new ValueObject();
			final Iterator<?> keys  = jsonObject.keys();

			while (keys.hasNext()) {
				final var key = (String) keys.next();
				final var obj	= jsonObject.get(key);

				if(isJSONObject(obj)) {
					final var	jsonObjectData = (JSONObject) jsonObject.get(key);
					final var	inValueObj 	   = convertJsontoValueObject(jsonObjectData);
					valueObject.put(key, inValueObj);
				} else
					valueObject.put(key, jsonObject.get(key));
			}

			return valueObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	// set error for json class
	public static JSONObject setError(int code, String description) throws Exception {
		try {
			final var	jsonObject	= new JSONObject();
			jsonObject.put("errorCode", code);
			jsonObject.put("errorDescription", description);
			return jsonObject;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	/*
	 * convertion for value object to json object for response
	 * it will convert hasmap, valueobject, dto arrays and array list to simple json objects and json arrays
	 */
	public static JSONObject convertionToJsonObjectForResponse(ValueObject object) throws Exception {
		try {
			for (final Object key : object.keySet()) {
				final var obj	= object.get(key);

				if (isValueObject(obj) || isHashMap(obj)) {
					final var valObj1 = checkandSetInstance(obj);

					for (final Object key3 : valObj1.keySet()) {
						final var obj1 = valObj1.get(key3);

						if (isValueObject(obj1) || isHashMap(obj1)) {
							final var valObj2 = checkandSetInstance(obj1);

							for (final Object key4 : valObj2.keySet()) {
								final var obj2 = valObj2.get(key4);
								valObj1.put(key3, new JSONObject(finalConversionForValuObjectadnHashMap(valObj2, obj2, key4).getHtData()));
							}
						} else if (isArrayList(obj1)) {
							final var arrayList4 = (ArrayList<Object>) obj1;
							final var arrayList5 = new ArrayList<>();

							for (final Object obj2 : arrayList4)
								finalConversionForArrayListandObjectArray(arrayList5, obj2);
						} else if (isObjectArray(obj1)) {
							final var objects2 = (Object[]) obj1;
							final var arrayList5 = new ArrayList<>();

							for (final Object obj2 : objects2)
								finalConversionForArrayListandObjectArray(arrayList5, obj2);
						}
					}

					object.put(key, new JSONObject(valObj1.getHtData()));
				} else if (isArrayList(obj))
					object.put(key, new JSONArray(iterateArrayList(obj)));
				else if (isObjectArray(obj))
					object.put(key, new JSONArray(iterateArrayObject(obj)));
				else
					object.put(key, obj);
			}

			return new JSONObject(object.getHtData());
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private static ValueObject checkandSetInstance(Object obj) throws Exception {
		try {
			if (isValueObject(obj))
				return (ValueObject) obj;

			if (isHashMap(obj))
				return new ValueObject((HashMap<Object, Object>) obj);

			return (ValueObject) obj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private static ValueObject finalConversionForValuObjectadnHashMap(ValueObject valObj, Object obj, Object key) throws Exception {
		try {
			if (isValueObject(obj))
				valObj.put(key, new JSONObject(new ValueObject((HashMap<Object, Object>) obj).getHtData()));
			else if (isHashMap(obj))
				valObj.put(key, new JSONObject((HashMap<Object, Object>) obj));
			else if (isArrayList(obj))
				valObj.put(key, new JSONArray(iterateArrayList(obj)));
			else if (isObjectArray(obj))
				valObj.put(key, new JSONArray(iterateArrayObject(obj)));
			else
				valObj.put(key, obj);

			return valObj;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private static void finalConversionForArrayListandObjectArray(ArrayList<Object> arrayList, Object obj) throws Exception {
		try {
			if (isValueObject(obj))
				arrayList.add(new JSONObject(new ValueObject((HashMap<Object, Object>) obj).getHtData()));
			else if (isHashMap(obj))
				arrayList.add(new JSONObject((HashMap<Object, Object>) obj));
			else if (isArrayList(obj))
				arrayList.add(new JSONArray(iterateArrayList(obj)));
			else if (isObjectArray(obj))
				arrayList.add(new JSONArray(iterateArrayObject(obj)));
			else
				arrayList.add(obj);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private static ArrayList<Object> iterateArrayList(Object obj) throws Exception {
		try {
			final var	arrayList = (ArrayList<Object>) obj;
			return new ArrayList<>(arrayList);
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	private static ArrayList<Object> iterateArrayObject(Object obj) throws Exception {
		try {
			final var	objects		= (Object[]) obj;
			final var	arrayList	= new ArrayList<>();

			for (final Object object : objects)
				arrayList.add(new JSONObject(new ValueObject((HashMap<Object, Object>) object).getHtData()));

			return arrayList;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}

	public static boolean isValueObject(Object object) {
		return object instanceof ValueObject;
	}

	public static boolean isHashMap(Object object) {
		return object instanceof HashMap;
	}

	public static boolean isArrayList(Object object) {
		return object instanceof ArrayList;
	}

	public static boolean isObjectArray(Object object) {
		return object instanceof Object[];
	}

	public static boolean isJSONObject(Object  object) {
		return object instanceof JSONObject;
	}

	public static JSONArray sortJsonArrayByValue(JSONArray jsonArr , String value) throws Exception {
		try {
			final var sortedJsonArray = new JSONArray();
			final List<JSONObject> jsonValues = new ArrayList<>();

			if(jsonArr != null) {
				for (var i = 0; i < jsonArr.length(); i++)
					jsonValues.add(jsonArr.getJSONObject(i));

				jsonValues.sort( (a, b) -> {
					Long valA = null ;
					Long valB = null ;

					try {
						try {
							valA = Long.parseLong(StringUtils.trim(a.get(value).toString()));
							valB = Long.parseLong(StringUtils.trim(b.get(value).toString()));
						} catch (final NumberFormatException e) {
							LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, "Number Format Exception");
							throw e;
						}
					} catch (final JSONException e) {
						LogWriter.writeLog(TRACE_ID, LogWriter.LOG_LEVEL_ERROR, e);
						throw e;
					}

					return valA.compareTo(valB);
				});

				for (var i = 0; i < jsonArr.length(); i++)
					sortedJsonArray.put(jsonValues.get(i));
			}

			return sortedJsonArray;
		} catch (final Exception e) {
			throw ExceptionProcess.execute(e, TRACE_ID);
		}
	}
}
