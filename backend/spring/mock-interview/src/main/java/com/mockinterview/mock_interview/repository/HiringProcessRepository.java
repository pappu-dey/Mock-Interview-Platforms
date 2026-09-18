package com.mockinterview.mock_interview.repository;

import com.mockinterview.mock_interview.entity.HiringProcess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HiringProcessRepository extends JpaRepository<HiringProcess, Integer> {
    List<HiringProcess> findByJobRole_RoleIdOrderByRoundNumberAsc(Integer roleId);
}
