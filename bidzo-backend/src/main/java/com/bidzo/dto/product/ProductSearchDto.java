package com.bidzo.dto.product;

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
public class ProductSearchDto implements Serializable {

    private static final long serialVersionUID = 1L;
    private String query;
    private Integer page;
    private Integer size;
}
