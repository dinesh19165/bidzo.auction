package com.bidzo.dto.auction;

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
public class AuctionUpdateDto implements Serializable {

    private static final long serialVersionUID = 1L;
    private Long id;
    private String name;
}
