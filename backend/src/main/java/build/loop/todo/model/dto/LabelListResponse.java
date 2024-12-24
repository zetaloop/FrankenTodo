package build.loop.todo.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class LabelListResponse {
    private List<String> labels;

    public static LabelListResponse of(List<String> labels) {
        LabelListResponse response = new LabelListResponse();
        response.setLabels(labels);
        return response;
    }
} 