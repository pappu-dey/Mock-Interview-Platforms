package com.mockinterview.mock_interview.dto.question;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionDto {

    private Long id;

    private String question;

    @JsonProperty("option_a")
    @JsonAlias({"optionA", "option_a"})
    private String optionA;

    @JsonProperty("option_b")
    @JsonAlias({"optionB", "option_b"})
    private String optionB;

    @JsonProperty("option_c")
    @JsonAlias({"optionC", "option_c"})
    private String optionC;

    @JsonProperty("option_d")
    @JsonAlias({"optionD", "option_d"})
    private String optionD;

    private String answer;

    private String category;

    @JsonProperty("sub_category")
    @JsonAlias({"subCategory", "sub_category"})
    private String subCategory;

    @JsonProperty("question_type")
    @JsonAlias({"questionType", "question_type"})
    private String questionType;

    private String difficulty;

    private String explanation;

    @JsonProperty("company_tag")
    @JsonAlias({"companyTag", "company_tag"})
    private String companyTag;

    @JsonProperty("created_at")
    @JsonAlias({"createdAt", "created_at"})
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    @JsonAlias({"updatedAt", "updated_at"})
    private LocalDateTime updatedAt;
}

