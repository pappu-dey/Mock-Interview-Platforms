package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, Integer> {
    List<JobRole> findByCompany_CompanyId(Integer companyId);
}
