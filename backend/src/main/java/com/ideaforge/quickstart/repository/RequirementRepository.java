package com.ideaforge.quickstart.repository;

import com.ideaforge.quickstart.model.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RequirementRepository extends JpaRepository<Requirement, Long> {}
