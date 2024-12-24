package build.loop.todo.model.entity;

public enum TaskPriority {
    LOW("low", 0),
    MEDIUM("medium", 1),
    HIGH("high", 2);

    private final String value;
    private final int weight;

    TaskPriority(String value, int weight) {
        this.value = value;
        this.weight = weight;
    }

    public String getValue() {
        return value;
    }

    public int getWeight() {
        return weight;
    }

    public static TaskPriority fromValue(String value) {
        for (TaskPriority priority : TaskPriority.values()) {
            if (priority.value.equals(value)) {
                return priority;
            }
        }
        throw new IllegalArgumentException("Unknown priority value: " + value);
    }
} 