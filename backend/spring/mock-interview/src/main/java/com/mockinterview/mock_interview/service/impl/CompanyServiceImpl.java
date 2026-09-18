package com.mockinterview.mock_interview.service.impl;

import com.mockinterview.mock_interview.dto.company.CompanyDto;
import com.mockinterview.mock_interview.dto.company.HiringProcessDto;
import com.mockinterview.mock_interview.dto.company.JobRoleDto;
import com.mockinterview.mock_interview.entity.Company;
import com.mockinterview.mock_interview.entity.HiringProcess;
import com.mockinterview.mock_interview.entity.JobRole;
import com.mockinterview.mock_interview.repository.CompanyRepository;
import com.mockinterview.mock_interview.repository.JobRoleRepository;
import com.mockinterview.mock_interview.service.CompanyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final JobRoleRepository jobRoleRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository, JobRoleRepository jobRoleRepository) {
        this.companyRepository = companyRepository;
        this.jobRoleRepository = jobRoleRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyDto getCompanyById(Integer companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));
        return mapToDto(company);
    }

    @Override
    public CompanyDto createCompany(CompanyDto companyDto) {
        Company company = mapToEntity(companyDto);
        Company saved = companyRepository.save(company);
        return mapToDto(saved);
    }

    @Override
    public CompanyDto updateCompany(Integer companyId, CompanyDto companyDto) {
        Company existing = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

        existing.setCompanyName(companyDto.getCompanyName());
        existing.setCompanyWebsite(companyDto.getCompanyWebsite());
        existing.setCompanyLogo(companyDto.getCompanyLogo());
        existing.setHeadquarters(companyDto.getHeadquarters());
        existing.setEmployees(companyDto.getEmployees());
        existing.setRating(companyDto.getRating());
        existing.setDifficulty(companyDto.getDifficulty());
        existing.setInsiderTips(companyDto.getInsiderTips());

        // Update Job Roles
        if (companyDto.getJobRoles() != null) {
            existing.getJobRoles().clear();
            for (JobRoleDto roleDto : companyDto.getJobRoles()) {
                JobRole role = mapRoleDtoToEntity(roleDto, existing);
                existing.getJobRoles().add(role);
            }
        }

        Company saved = companyRepository.save(existing);
        return mapToDto(saved);
    }

    @Override
    public void deleteCompany(Integer companyId) {
        if (!companyRepository.existsById(companyId)) {
            throw new RuntimeException("Company not found with id: " + companyId);
        }
        companyRepository.deleteById(companyId);
    }

    @Override
    public JobRoleDto addRoleToCompany(Integer companyId, JobRoleDto roleDto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found with id: " + companyId));

        JobRole role = mapRoleDtoToEntity(roleDto, company);
        company.getJobRoles().add(role);
        companyRepository.save(company);

        return mapRoleToDto(role);
    }

    @Override
    public void deleteRole(Integer roleId) {
        if (!jobRoleRepository.existsById(roleId)) {
            throw new RuntimeException("Role not found with id: " + roleId);
        }
        jobRoleRepository.deleteById(roleId);
    }

    // ─── Helper Mapping Methods ─────────────────────────────────────────────

    private CompanyDto mapToDto(Company entity) {
        if (entity == null) return null;

        List<JobRoleDto> rolesDto = new ArrayList<>();
        if (entity.getJobRoles() != null) {
            rolesDto = entity.getJobRoles().stream()
                    .map(this::mapRoleToDto)
                    .collect(Collectors.toList());
        }

        return CompanyDto.builder()
                .companyId(entity.getCompanyId())
                .companyName(entity.getCompanyName())
                .companyWebsite(entity.getCompanyWebsite())
                .companyLogo(entity.getCompanyLogo())
                .headquarters(entity.getHeadquarters())
                .employees(entity.getEmployees())
                .rating(entity.getRating())
                .difficulty(entity.getDifficulty())
                .insiderTips(entity.getInsiderTips())
                .jobRoles(rolesDto)
                .build();
    }

    private Company mapToEntity(CompanyDto dto) {
        if (dto == null) return null;

        Company company = Company.builder()
                .companyId(dto.getCompanyId())
                .companyName(dto.getCompanyName())
                .companyWebsite(dto.getCompanyWebsite())
                .companyLogo(dto.getCompanyLogo())
                .headquarters(dto.getHeadquarters())
                .employees(dto.getEmployees())
                .rating(dto.getRating())
                .difficulty(dto.getDifficulty())
                .insiderTips(dto.getInsiderTips())
                .jobRoles(new ArrayList<>())
                .build();

        if (dto.getJobRoles() != null) {
            for (JobRoleDto roleDto : dto.getJobRoles()) {
                JobRole role = mapRoleDtoToEntity(roleDto, company);
                company.getJobRoles().add(role);
            }
        }

        return company;
    }

    private JobRoleDto mapRoleToDto(JobRole role) {
        if (role == null) return null;

        List<HiringProcessDto> processDtos = new ArrayList<>();
        if (role.getHiringProcesses() != null) {
            processDtos = role.getHiringProcesses().stream()
                    .map(hp -> HiringProcessDto.builder()
                            .processId(hp.getProcessId())
                            .roundNumber(hp.getRoundNumber())
                            .roundName(hp.getRoundName())
                            .description(hp.getDescription())
                            .build())
                    .collect(Collectors.toList());
        }

        return JobRoleDto.builder()
                .roleId(role.getRoleId())
                .companyId(role.getCompany() != null ? role.getCompany().getCompanyId() : null)
                .roleName(role.getRoleName())
                .location(role.getLocation())
                .salary(role.getSalary())
                .experience(role.getExperience())
                .eligibility(role.getEligibility())
                .technicalTopics(role.getTechnicalTopics())
                .description(role.getDescription())
                .isOpen(role.getIsOpen() != null ? role.getIsOpen() : true)
                .hiringProcesses(processDtos)
                .build();
    }

    private JobRole mapRoleDtoToEntity(JobRoleDto dto, Company company) {
        if (dto == null) return null;

        JobRole role = JobRole.builder()
                .roleId(dto.getRoleId())
                .company(company)
                .roleName(dto.getRoleName())
                .location(dto.getLocation())
                .salary(dto.getSalary())
                .experience(dto.getExperience())
                .eligibility(dto.getEligibility())
                .technicalTopics(dto.getTechnicalTopics())
                .description(dto.getDescription())
                .isOpen(dto.getIsOpen() != null ? dto.getIsOpen() : true)
                .hiringProcesses(new ArrayList<>())
                .build();

        if (dto.getHiringProcesses() != null) {
            for (HiringProcessDto hpDto : dto.getHiringProcesses()) {
                HiringProcess hp = HiringProcess.builder()
                        .processId(hpDto.getProcessId())
                        .jobRole(role)
                        .roundNumber(hpDto.getRoundNumber() != null ? hpDto.getRoundNumber() : 1)
                        .roundName(hpDto.getRoundName())
                        .description(hpDto.getDescription())
                        .build();
                role.getHiringProcesses().add(hp);
            }
        }

        return role;
    }
}
