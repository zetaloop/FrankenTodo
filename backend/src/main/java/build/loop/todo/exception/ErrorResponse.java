package build.loop.todo.exception;

import lombok.Getter;

@Getter
public class ErrorResponse {
    private final Error error;

    public ErrorResponse(String code, String message) {
        this.error = new Error(code, message, null);
    }

    public ErrorResponse(String code, String message, ErrorDetails details) {
        this.error = new Error(code, message, details);
    }

    @Getter
    public static class Error {
        private final String code;
        private final String message;
        private final ErrorDetails details;

        public Error(String code, String message, ErrorDetails details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }
    }

    @Getter
    public static class ErrorDetails {
        private final String field;
        private final String reason;

        public ErrorDetails(String field, String reason) {
            this.field = field;
            this.reason = reason;
        }
    }
} 