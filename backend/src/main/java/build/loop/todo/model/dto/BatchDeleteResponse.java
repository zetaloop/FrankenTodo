package build.loop.todo.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BatchDeleteResponse {
    private int deletedCount;

    public static BatchDeleteResponse of(int count) {
        BatchDeleteResponse response = new BatchDeleteResponse();
        response.setDeletedCount(count);
        return response;
    }
} 