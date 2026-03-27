package com.ideaforge.quickstart.service;

import com.ideaforge.quickstart.model.Requirement;
import com.ideaforge.quickstart.repository.RequirementRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business logic for {@link Requirement}. Keep controllers thin — put logic here. */
@Service
@Transactional
public class RequirementService {

    private final RequirementRepository repository;

    public RequirementService(RequirementRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Requirement> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Requirement findById(Long id) {
        return repository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", id));
    }

    public Requirement create(Requirement requirement) {
        return repository.save(requirement);
    }

    public Requirement updateStatus(Long id, Requirement.Status status) {
        Requirement req = findById(id);
        req.setStatus(status);
        return repository.save(req);
    }
}
