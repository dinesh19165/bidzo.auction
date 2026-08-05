package com.bidzo.dto.support;

import java.io.Serializable;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;
import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportCreateDto implements Serializable {

    private static final long serialVersionUID = 1L;
    @NotBlank
    private String name;
}
