package com.bidzo.repository;

import com.bidzo.entity.ProductDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductDocumentRepository extends JpaRepository<ProductDocument, Long> {
}
