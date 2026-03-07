package com.example.serviceapp.dto;

public class ResponseDTO {
    private boolean status;
    private Object response;
    private boolean error;
    private String errorMsg;
    private String errorCode;

    public ResponseDTO(boolean status, Object response, boolean error, String errorMsg, String errorCode) {
        this.status = status;
        this.response = response;
        this.error = error;
        this.errorMsg = errorMsg;
        this.errorCode = errorCode;
    }

    public static ResponseDTO success(Object response) {
        return new ResponseDTO(true, response, false, null, null);
    }

    public static ResponseDTO failed(String errorMsg, String errorCode) {
        return new ResponseDTO(false, null, true, errorMsg, errorCode);
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public Object getResponse() {
        return response;
    }

    public void setResponse(Object response) {
        this.response = response;
    }

    public boolean isError() {
        return error;
    }

    public void setError(boolean error) {
        this.error = error;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
}
