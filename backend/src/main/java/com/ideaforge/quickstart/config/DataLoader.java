package com.ideaforge.quickstart.config;

import com.ideaforge.quickstart.model.Requirement;
import com.ideaforge.quickstart.repository.RequirementRepository;
import java.io.InputStream;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/** Seeds requirements from PRD.json on startup (only if DB is empty). */
@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final RequirementRepository repository;
    private final ObjectMapper mapper;

    public DataLoader(RequirementRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() > 0) {
            log.info("Requirements already loaded, skipping seed.");
            return;
        }

        ClassPathResource resource = new ClassPathResource("PRD.json");
        if (!resource.exists()) {
            log.info("No PRD.json found in classpath, skipping seed.");
            return;
        }

        try (InputStream is = resource.getInputStream()) {
            JsonNode root = mapper.readTree(is);
            JsonNode reqNode = root.get("requirements");
            if (reqNode == null || !reqNode.isArray()) {
                log.warn("PRD.json does not contain a 'requirements' array.");
                return;
            }

            List<Requirement> requirements =
                    mapper.convertValue(reqNode, new TypeReference<List<Requirement>>() {});

            repository.saveAll(requirements);
            log.info("Seeded {} requirements from PRD.json", requirements.size());
        }
    }
}
