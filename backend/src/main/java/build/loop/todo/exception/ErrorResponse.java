package build.loop.todo.exception;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponse {
    private Error error;

    @Getter
    @Setter
    public static class Error {
        private String code;
        private String message;
        private ErrorDetails details;
    }

    @Getter
    @Setter
    public static class ErrorDetails {
        private String field;
        private String reason;
    }

    public static ErrorResponse of(String code, String message) {
        ErrorResponse response = new ErrorResponse();
        Error error = new Error();
        error.setCode(code);
        error.setMessage(message);
        response.setError(error);
        return response;
    }

    public static ErrorResponse of(String code, String message, String field, String reason) {
        ErrorResponse response = new ErrorResponse();
        Error error = new Error();
        error.setCode(code);
        error.setMessage(message);
        
        ErrorDetails details = new ErrorDetails();
        details.setField(field);
        details.setReason(reason);
        error.setDetails(details);
        
        response.setError(error);
        return response;
    }
} 