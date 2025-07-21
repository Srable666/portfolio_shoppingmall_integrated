package com.my.gyp_portfolio_shoppingmall.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.BulkProductInventoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.CategoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ImageResourceResponse;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductInventoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductItemDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductSearchDTO;
import com.my.gyp_portfolio_shoppingmall.exception.OptimisticLockingException;
import com.my.gyp_portfolio_shoppingmall.exception.ProductException;
import com.my.gyp_portfolio_shoppingmall.service.ProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("api/product")
public class ProductController {    
    private final ProductService productService;

    // 카테고리 등록
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/insertCategory")
    public ResponseEntity<?> insertCategory(
        @RequestBody CategoryDTO categoryDTO
    ) {
        try {
            productService.insertCategory(categoryDTO);

            return ResponseEntity.ok("카테고리 등록에 성공했습니다.");
        } catch (ProductException.ParentCategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("카테고리 등록 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 카테고리 등록에 실패했습니다." + e);
        }
    }

    // 카테고리 정보 수정
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateCategory")
    public ResponseEntity<?> updateCategory(
        @RequestBody CategoryDTO categoryDTO
    ) {
        try {
            productService.updateCategory(categoryDTO);

            return ResponseEntity.ok("카테고리 수정에 성공했습니다.");
        } catch (ProductException.ParentCategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.CategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("카테고리 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 카테고리 수정에 실패했습니다.");
        }
    }

    // 카테고리 삭제
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/deleteCategory")
    public ResponseEntity<?> deleteCategory(
        @RequestBody CategoryDTO categoryDTO
    ) {
        try {
            productService.deleteCategory(categoryDTO);

            return ResponseEntity.ok("카테고리 삭제에 성공했습니다.");
        } catch (ProductException.CategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("카테고리 삭제 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 카테고리 삭제에 실패했습니다.");
        }
    }
    
    // 상품 마스터 등록
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/insertProduct")
    public ResponseEntity<?> insertProduct(
        @RequestBody ProductDTO productDTO
    ) {
        try {
            productService.insertProduct(productDTO);

            return ResponseEntity.ok("상품 마스터 등록에 성공했습니다.");
        } catch (ProductException.CategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 마스터 등록 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 마스터 등록에 실패했습니다.");
        }
    }

    // 상품 마스터 정보 수정
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateProduct")
    public ResponseEntity<?> updateProduct(
        @RequestBody ProductDTO productDTO
    ) {
        try {
            productService.updateProduct(productDTO);

            return ResponseEntity.ok("상품 마스터 수정에 성공했습니다.");
        } catch (ProductException.ProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (ProductException.CategoryNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 마스터 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 마스터 수정에 실패했습니다.");
        }
    }

    // 상품 품목 등록
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/insertProductItem")
    public ResponseEntity<?> insertProductItem(
        @RequestBody ProductItemDTO productItemDTO
    ) {
        try {
            productService.insertProductItem(productItemDTO);

            return ResponseEntity.ok("상품 품목 등록에 성공했습니다.");
        } catch (ProductException.ProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 등록 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 등록에 실패했습니다.");
        }
    }

    // 상품 품목 정보 수정
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/updateProductItem")
    public ResponseEntity<?> updateProductItem(
        @RequestBody ProductItemDTO productItemDTO
    ) {
        try {
            productService.updateProductItem(productItemDTO);

            return ResponseEntity.ok("상품 품목 수정에 성공했습니다.");
        } catch (ProductException.ProductItemNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (OptimisticLockingException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 수정 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 수정에 실패했습니다.");
        }
    }

    // 상품 품목 입고(단일 품목)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/insertProductInventory")
    public ResponseEntity<?> insertProductInventory(
        @RequestBody ProductInventoryDTO productInventoryDTO
    ) {
        try {
            productService.insertProductInventory(productInventoryDTO);

            return ResponseEntity.ok("상품 품목 입고에 성공했습니다.");
        } catch (ProductException.ProductItemNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 입고 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 입고에 실패했습니다.");
        }
    }

    // 상품 품목 입고(대량 입고)
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/insertBulkProductInventory")
    public ResponseEntity<?> insertBulkProductInventory(
        @RequestBody BulkProductInventoryDTO bulkProductInventoryDTO
    ) {
        try {
            productService.insertBulkProductInventory(bulkProductInventoryDTO);

            return ResponseEntity.ok("상품 품목 입고에 성공했습니다.");
        } catch (ProductException.ProductItemNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 입고 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 대량 입고에 실패했습니다.");
        }
    }

    // 상품 마스터 목록 조회
    @GetMapping("/getProductList")
    public ResponseEntity<?> getProductList(
        @ModelAttribute ProductSearchDTO productSearchDTO
    ) { 
        try {
            if (productSearchDTO.getCategoryId() != null || productSearchDTO.getKeyword() != null) {
                return ResponseEntity.ok(productService.getProductListBySearch(productSearchDTO));
            } else {
                return ResponseEntity.ok(productService.getAllProducts());
            }
        } catch (Exception e) {
            log.error("상품 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 목록 조회에 실패했습니다.");
        }
    }

    // 최상위 카테고리 목록 조회
    @GetMapping("/getTopCategories")
    public ResponseEntity<?> getTopCategories() {
        try {
            return ResponseEntity.ok(productService.getTopCategories());
        } catch (Exception e) {
            log.error("최상위 카테고리 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 최상위 카테고리 목록 조회에 실패했습니다.");
        }
    }

    // 하위 카테고리 목록 조회
    @GetMapping("/getSubCategories/{categoryId}")
    public ResponseEntity<?> getSubCategories(
        @PathVariable Integer categoryId
    ) {
        try {
            return ResponseEntity.ok(productService.getSubCategories(categoryId));
        } catch (Exception e) {
            log.error("하위 카테고리 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 하위 카테고리 목록 조회에 실패했습니다.");
        }
    }

    // 카테고리 목록 조회
    @GetMapping("/getCategories")
    public ResponseEntity<?> getCategories() {
        try {
            return ResponseEntity.ok(productService.getCategories());
        } catch (Exception e) {
            log.error("카테고리 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 카테고리 목록 조회에 실패했습니다.");
        }
    }

    // 이미지 업로드
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/uploadImage")
    public ResponseEntity<?> uploadImage(
        @RequestParam("file") MultipartFile file
    ) {
        try {
            log.info("이미지 업로드 요청 - 파일명: {}, 크기: {}, 타입: {}", 
                file.getOriginalFilename(), file.getSize(), file.getContentType());

            String fileName = productService.uploadImage(file);

            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("잘못된 이미지 업로드 요청: {}", e.getMessage());
            return ResponseEntity.badRequest().body("잘못된 이미지 파일입니다.");
        } catch (IOException e) {
            log.error("이미지 업로드 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 이미지 업로드에 실패했습니다.");
        }
    }

    // 이미지 조회
    @GetMapping("/serve-image/{fileName:.+}")
    public ResponseEntity<?> serveImage(
        @PathVariable String fileName
    ) {
        try {
            ImageResourceResponse imageResponse = productService.getImageResource(fileName);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, imageResponse.getContentType())
                .body(imageResponse.getResource());

        } catch (FileNotFoundException e) {
            log.warn("이미지 파일을 찾을 수 없음: {}", fileName);
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            log.error("이미지 서비스 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 이미지 서비스에 실패했습니다.");
        }
    }

    // 상품 품목 목록 조회
    @GetMapping("/getProductItemsByProductId/{productId}")
    public ResponseEntity<?> getProductItemsByProductId(
        @PathVariable Integer productId
    ) {
        try {
            return ResponseEntity.ok(productService.getProductItemsByProductId(productId));
        } catch (ProductException.ProductNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 목록 조회에 실패했습니다.");
        }
    }

    // 상품 품목 재고 목록 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/getProductInventories/{productItemId}")
    public ResponseEntity<?> getProductInventories(
        @PathVariable Integer productItemId
    ) {
        try {
            return ResponseEntity.ok(productService.getProductInventories(productItemId));
        } catch (ProductException.ProductItemNotFoundException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("상품 품목 재고 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 상품 품목 재고 목록 조회에 실패했습니다.");
        }
    }

    // 재고 변동 이력 목록 조회
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/getInventoryHistories/{productInventoryId}")
    public ResponseEntity<?> getInventoryHistories(
        @PathVariable Integer productInventoryId
    ) {
        try {
            return ResponseEntity.ok(productService.getInventoryHistories(productInventoryId));
        } catch (Exception e) {
            log.error("재고 변동 이력 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 재고 변동 이력 목록 조회에 실패했습니다.");
        }
    }

    // 새로운 상품 목록 조회
    @GetMapping("/getNewProducts")
    public ResponseEntity<?> getNewProducts(
        @RequestParam(defaultValue = "4") int limit
    ) {
        try {
            return ResponseEntity.ok(productService.getNewProducts(limit));
        } catch (Exception e) {
            log.error("새로운 상품 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 새로운 상품 목록 조회에 실패했습니다.");
        }
    }

    // 인기 상품 목록 조회
    @GetMapping("/getPopularProducts")
    public ResponseEntity<?> getPopularProducts(
        @RequestParam(defaultValue = "4") int limit
    ) {
        try {
            return ResponseEntity.ok(productService.getPopularProducts(limit));
        } catch (Exception e) {
            log.error("인기 상품 목록 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 인기 상품 목록 조회에 실패했습니다.");
        }
    }

    // 단일 상품 조회(code 기준)
    @GetMapping("/getProduct/{code}")
    public ResponseEntity<?> getProduct(
        @PathVariable String code
    ) {
        try {
            return ResponseEntity.ok(productService.getProductByCode(code));
        } catch (Exception e) {
            log.error("단일 상품 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 단일 상품 조회에 실패했습니다.");
        }
    }

    // 카테고리 경로 조회
    @GetMapping("/getCategoryPath/{categoryId}")
    public ResponseEntity<?> getCategoryPath(
        @PathVariable Integer categoryId
    ) {
        try {
            return ResponseEntity.ok(productService.getCategoryPath(categoryId));
        } catch (Exception e) {
            log.error("카테고리 경로 조회 처리 중 알 수 없는 오류가 발생했습니다.", e);
            return ResponseEntity.internalServerError().body("알 수 없는 오류로 카테고리 경로 조회에 실패했습니다.");
        }
    }
}