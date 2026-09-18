package com.mockinterview.mock_interview.controller;

import com.mockinterview.mock_interview.dto.company.CompanyDto;
import com.mockinterview.mock_interview.dto.company.JobRoleDto;
import com.mockinterview.mock_interview.service.CompanyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    /**
     * GET /api/companies
     * Retrieves all companies with their job roles and hiring processes.
     */
    @GetMapping
    public ResponseEntity<List<CompanyDto>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    /**
     * GET /api/companies/{id}
     * Retrieves a single company by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanyDto> getCompanyById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    /**
     * POST /api/companies
     * Creates a new company record along with its job roles and hiring process.
     */
    @PostMapping
    public ResponseEntity<CompanyDto> createCompany(@RequestBody CompanyDto companyDto) {
        CompanyDto created = companyService.createCompany(companyDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/companies/{id}
     * Updates an existing company record.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanyDto> updateCompany(
            @PathVariable("id") Integer id,
            @RequestBody CompanyDto companyDto) {
        CompanyDto updated = companyService.updateCompany(id, companyDto);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/companies/{id}
     * Deletes a company record by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable("id") Integer id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/companies/{companyId}/roles
     * Adds a new job role to a company.
     */
    @PostMapping("/{companyId}/roles")
    public ResponseEntity<JobRoleDto> addRoleToCompany(
            @PathVariable("companyId") Integer companyId,
            @RequestBody JobRoleDto roleDto) {
        JobRoleDto created = companyService.addRoleToCompany(companyId, roleDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * DELETE /api/companies/roles/{roleId}
     * Deletes a job role by ID.
     */
    @DeleteMapping("/roles/{roleId}")
    public ResponseEntity<Void> deleteRole(@PathVariable("roleId") Integer roleId) {
        companyService.deleteRole(roleId);
        return ResponseEntity.noContent().build();
    }
}
