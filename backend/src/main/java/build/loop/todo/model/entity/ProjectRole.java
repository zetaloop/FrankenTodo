package build.loop.todo.model.entity;

public enum ProjectRole {
    OWNER("owner"),
    MEMBER("member");

    private final String value;

    ProjectRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ProjectRole fromValue(String value) {
        for (ProjectRole role : ProjectRole.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role value: " + value);
    }
} 