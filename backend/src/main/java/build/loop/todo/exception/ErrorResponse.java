package build.loop.todo.exception;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;

import java.util.Map;

@Getter
public class ErrorResponse {
    private final Error error;

    public ErrorResponse(String code, String message) {
        this.error = new Error(code, message, null);
    }

    public ErrorResponse(String code, String message, Map<String, String> details) {
        this.error = new Error(code, message, details);
    }

    @Getter
    public static class Error {
        private final String code;
        private final String message;
        private final Map<String, String> details;

        public Error(String code, String message, Map<String, String> details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }
    }
} 