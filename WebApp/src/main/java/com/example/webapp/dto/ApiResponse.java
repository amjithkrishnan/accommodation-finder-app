package com.example.webapp.dto;

public class ApiResponse {
    private String status;
    private Object response;
    private boolean error;
    private String errorMsg;
    private String errorCode;

    public static ApiResponse success(Object data) {
        ApiResponse res = new ApiResponse();
        res.status = "success";
        res.response = data;
        res.error = false;
        res.errorMsg = null;
        res.errorCode = null;
        return res;
    }

    public static ApiResponse failed(String message, String code) {
        ApiResponse res = new ApiResponse();
        res.status = "failed";
        res.response = null;
        res.error = true;
        res.errorMsg = message;
        res.errorCode = code;
        return res;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Object getResponse() { return response; }
    public void setResponse(Object response) { this.response = response; }
    public boolean isError() { return error; }
    public void setError(boolean error) { this.error = error; }
    public String getErrorMsg() { return errorMsg; }
    public void setErrorMsg(String errorMsg) { this.errorMsg = errorMsg; }
    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }
}
