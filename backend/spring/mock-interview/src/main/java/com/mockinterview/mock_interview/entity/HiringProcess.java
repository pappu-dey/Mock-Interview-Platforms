package com.mockinterview.mock_interview.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hiring_process")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiringProcess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "process_id")
    private Integer processId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private JobRole jobRole;

    @Column(name = "round_number", nullable = false)
    private Integer roundNumber;

    @Column(name = "round_name", nullable = false, length = 100)
    private String roundName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
