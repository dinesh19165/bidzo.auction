package com.bidzo.dto.franchise;

import java.io.Serializable;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FranchiseResponseDto implements Serializable {

    private static final long serialVersionUID = 1L;
    private Long id;
    private String status;
}
