package com.mockinterview.mock_interview.service;

import com.mockinterview.mock_interview.dto.company.CompanyDto;
import com.mockinterview.mock_interview.dto.company.JobRoleDto;

import java.util.List;

public interface CompanyService {
    List<CompanyDto> getAllCompanies();
    CompanyDto getCompanyById(Integer companyId);
    CompanyDto createCompany(CompanyDto companyDto);
    CompanyDto updateCompany(Integer companyId, CompanyDto companyDto);
    void deleteCompany(Integer companyId);
    JobRoleDto addRoleToCompany(Integer companyId, JobRoleDto roleDto);
    void deleteRole(Integer roleId);
}
