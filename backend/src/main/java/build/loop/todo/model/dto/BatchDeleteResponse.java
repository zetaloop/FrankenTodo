package build.loop.todo.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BatchDeleteResponse {
    private int deleted_count;

    public static BatchDeleteResponse of(int count) {
        BatchDeleteResponse response = new BatchDeleteResponse();
        response.setDeleted_count(count);
        return response;
    }
} 