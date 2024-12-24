package build.loop.todo.model.entity;

public enum TaskStatus {
    BACKLOG("backlog", 0),
    TODO("todo", 1),
    IN_PROGRESS("in progress", 2),
    DONE("done", 3),
    CANCELED("canceled", 4);

    private final String value;
    private final int weight;

    TaskStatus(String value, int weight) {
        this.value = value;
        this.weight = weight;
    }

    public String getValue() {
        return value;
    }

    public int getWeight() {
        return weight;
    }

    public static TaskStatus fromValue(String value) {
        for (TaskStatus status : TaskStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown status value: " + value);
    }
} 