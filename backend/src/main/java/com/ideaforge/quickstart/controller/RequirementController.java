package com.ideaforge.quickstart.controller;

import com.ideaforge.quickstart.model.Requirement;
import com.ideaforge.quickstart.service.RequirementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for {@link Requirement}.
 *   GET    /api/requirements            → list all
 *   GET    /api/requirements/{id}       → get one
 *   PATCH  /api/requirements/{id}/status → update status
 */
@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    private final RequirementService service;

    public RequirementController(RequirementService service) {
        this.service = service;
    }

    @GetMapping
    public List<Requirement> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public Requirement get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PatchMapping("/{id}/status")
    public Requirement updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Requirement.Status status = Requirement.Status.valueOf(body.get("status"));
        return service.updateStatus(id, status);
    }
}
