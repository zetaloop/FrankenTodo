package build.loop.todo.model;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.id.IdentifierGenerator;
import org.hibernate.id.factory.spi.CustomIdGeneratorCreationContext;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicLong;

public class CustomIdGenerator implements IdentifierGenerator {
    private static final AtomicLong counter = new AtomicLong(System.currentTimeMillis());
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    public Object generate(SharedSessionContractImplementor session, Object object) throws HibernateException {
        String timestamp = LocalDateTime.now().format(formatter);
        long sequence = counter.incrementAndGet();
        return timestamp + "-" + sequence;
    }

    @Override
    public boolean supportsJdbcBatchInserts() {
        return true;
    }
} 