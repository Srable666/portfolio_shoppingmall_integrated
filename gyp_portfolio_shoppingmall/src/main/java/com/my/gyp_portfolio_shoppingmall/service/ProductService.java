package com.my.gyp_portfolio_shoppingmall.service;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.gyp_portfolio_shoppingmall.dao.ProductDao;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.BulkProductInventoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.CategoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ImageResourceResponse;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductInventoryDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductItemDTO;
import com.my.gyp_portfolio_shoppingmall.dto.ProductDto.ProductSearchDTO;
import com.my.gyp_portfolio_shoppingmall.enums.ProductEnums.ProductInventoryStatus;
import com.my.gyp_portfolio_shoppingmall.exception.ProductException;
import com.my.gyp_portfolio_shoppingmall.support.OptimisticLock;
import com.my.gyp_portfolio_shoppingmall.support.ProductCodeGenerator;
import com.my.gyp_portfolio_shoppingmall.vo.Category;
import com.my.gyp_portfolio_shoppingmall.vo.InventoryHistory;
import com.my.gyp_portfolio_shoppingmall.vo.Product;
import com.my.gyp_portfolio_shoppingmall.vo.ProductInventory;
import com.my.gyp_portfolio_shoppingmall.vo.ProductItem;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ProductService {
    private static final String UPLOAD_DIR = "src/main/resources/static/images/products";
    private final ProductDao productDao;
    
    // 상태 업데이트만 수행하는 낙관적 잠금 전용 메서드
    @OptimisticLock
    public int updateProductItemWithOptimisticLock(ProductItem productItem) {
        return productDao.updateProductItemWithOptimisticLock(productItem);
    }

    // 카테고리 등록    
    public int insertCategory(CategoryDTO categoryDTO) {
        Category category = new Category();
        category.setCode(categoryDTO.getCode());
        category.setName(categoryDTO.getName());

        // DTO에 부모 카테고리 ID가 있으면 부모 카테고리 존재 여부 확인하고 부모 카테고리 ID 세팅
        if (categoryDTO.getParentCategoryId() != null) {
            Category parentCategory = productDao.getCategory(categoryDTO.getParentCategoryId());
            
            if (parentCategory == null) {
                throw new ProductException.ParentCategoryNotFoundException();
            }
            
            category.setParentCategoryId(parentCategory.getCategoryId());
        }

        return productDao.insertCategory(category);
    }

    // 카테고리 정보 수정
    public int updateCategory(CategoryDTO categoryDTO) {
        // 카테고리 존재 여부 확인
        Category existingCategory = productDao.getCategory(categoryDTO.getCategoryId());
        if (existingCategory == null) {
            throw new ProductException.CategoryNotFoundException();
        }

        // 카테고리 수정 정보 세팅
        existingCategory.setCategoryId(categoryDTO.getCategoryId());
        if (categoryDTO.getName() != null) {
            existingCategory.setName(categoryDTO.getName());
        }
        if (categoryDTO.getCode() != null) {
            existingCategory.setCode(categoryDTO.getCode());
        }
        if (categoryDTO.getParentCategoryId() != null) {
            Category parentCategory = productDao.getCategory(categoryDTO.getParentCategoryId());
            
            if (parentCategory == null) {
                throw new ProductException.ParentCategoryNotFoundException();
            }
            existingCategory.setParentCategoryId(parentCategory.getCategoryId());
        }

        return productDao.updateCategory(existingCategory);
    }

    // 카테고리 삭제
    public int deleteCategory(CategoryDTO categoryDTO) {
        // 카테고리 존재 여부 확인
        Category existingCategory = productDao.getCategory(categoryDTO.getCategoryId());
        if (existingCategory == null) {
            throw new ProductException.CategoryNotFoundException();
        }

        Category category = new Category();
        category.setCategoryId(categoryDTO.getCategoryId());
        return productDao.deleteCategory(category);
    }

    // 상품 마스터 등록
    public void insertProduct(ProductDTO productDTO) {
        // 카테고리 존재 여부 확인
        Category category = productDao.getCategory(productDTO.getCategoryId());
        if (category == null) {
            throw new ProductException.CategoryNotFoundException();
        }

        // 상품 마스터 코드 생성 및 중복 여부 확인
        String code;
        do {
            code = ProductCodeGenerator.generateCode();
        } while (productDao.isCodeExists(code));

        // 상품 등록 처리
        Product product = new Product();
        product.setName(productDTO.getName());
        product.setCode(code);
        product.setBasePrice(productDTO.getBasePrice());
        product.setDiscountRate(productDTO.getDiscountRate());
        product.setFinalPrice(productDTO.getFinalPrice());
        product.setCategoryId(category.getCategoryId());
        product.setImageUrl(productDTO.getImageUrl());        
        product.setDescription(productDTO.getDescription());
        product.setIsActive(productDTO.getIsActive());
        productDao.insertProduct(product);
    }

    // 상품 마스터 정보 수정
    public void updateProduct(ProductDTO productDTO) {        
        // 상품 존재 여부 확인
        Product existingProduct = productDao.getProductById(productDTO.getProductId());
        if (existingProduct == null) {
            throw new ProductException.ProductNotFoundException();
        }

        // 카테고리 존재 여부 확인
        Category category = productDao.getCategory(productDTO.getCategoryId());
        if (category == null) {
            throw new ProductException.CategoryNotFoundException();
        }

        // 기존 목록 중 새로운 목록에 없는 이미지 삭제
        List<String> oldImageUrls = parseImageUrls(existingProduct.getImageUrl());
        List<String> newImageUrls = parseImageUrls(productDTO.getImageUrl());
        oldImageUrls.stream()
            .filter(oldUrl -> !newImageUrls.contains(oldUrl))
            .forEach(this::deleteImage);

        // 상품 마스터 정보 수정
        if (productDTO.getName() != null) {
            existingProduct.setName(productDTO.getName());
        }
        if (productDTO.getBasePrice() != null) {
            existingProduct.setBasePrice(productDTO.getBasePrice());
        }
        if (productDTO.getDiscountRate() != null) {
            existingProduct.setDiscountRate(productDTO.getDiscountRate());
        }
        if (productDTO.getFinalPrice() != null) {
            existingProduct.setFinalPrice(productDTO.getFinalPrice());
        }
        if (productDTO.getCategoryId() != null) {
            existingProduct.setCategoryId(productDTO.getCategoryId());
        }
        if (productDTO.getImageUrl() != null) {
            existingProduct.setImageUrl(productDTO.getImageUrl());
        }
        if (productDTO.getDescription() != null) {
            existingProduct.setDescription(productDTO.getDescription());
        }
        if (productDTO.getIsActive() != null) {
            existingProduct.setIsActive(productDTO.getIsActive());
        }
        if (productDTO.getIsDeleted() != null) {
            existingProduct.setIsDeleted(productDTO.getIsDeleted());
        }
        
        productDao.updateProduct(existingProduct);
    }

    // 상품 품목 등록
    public void insertProductItem(ProductItemDTO productItemDTO) {
        // 상품 존재 여부 확인
        Product product = productDao.getProductById(productItemDTO.getProductId());
        if (product == null) {
            throw new ProductException.ProductNotFoundException();
        }

        // 상품 품목 등록
        ProductItem productItem = new ProductItem();
        productItem.setProductId(productItemDTO.getProductId());
        productItem.setSize(productItemDTO.getSize());
        productItem.setColor(productItemDTO.getColor());
        productItem.setIsActive(productItemDTO.getIsActive());
        productDao.insertProductItem(productItem);
    }

    // 상품 품목 정보 수정
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    @OptimisticLock
    public void updateProductItem(ProductItemDTO productItemDTO) {
        // 상품 품목 존재 여부 확인
        ProductItem productItem = productDao.getProductItemForUpdate(productItemDTO.getProductItemId());
        if (productItem == null) {
            throw new ProductException.ProductItemNotFoundException();
        }

        // 상품 품목 수정
        if (productItemDTO.getSize() != null) {
            productItem.setSize(productItemDTO.getSize());
        }
        if (productItemDTO.getColor() != null) {
            productItem.setColor(productItemDTO.getColor());
        }
        if (productItemDTO.getIsActive() != null) {
            productItem.setIsActive(productItemDTO.getIsActive());
        }
        if (productItemDTO.getIsDeleted() != null) {
            productItem.setIsDeleted(productItemDTO.getIsDeleted());
        }
        productItem.setVersion(productItemDTO.getVersion());

        updateProductItemWithOptimisticLock(productItem);
    }

    // 상품 품목 입고(단일 품목)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void insertProductInventory(ProductInventoryDTO productInventoryDTO) {
        // 상품 품목 존재 여부 확인
        ProductItem productItem = productDao.getProductItemForUpdate(productInventoryDTO.getProductItemId());
        if (productItem == null) {
            throw new ProductException.ProductItemNotFoundException();
        }

        // 상품 품목 입고 저장
        ProductInventory productInventory = new ProductInventory();
        productInventory.setProductItemId(productInventoryDTO.getProductItemId());
        productInventory.setBarcode(productInventoryDTO.getBarcode());
        productInventory.setStatus(ProductInventoryStatus.IN_STOCK);
        productDao.insertProductInventory(productInventory);

        // 상품 품목 입고 시 재고 1 증가
        productDao.increaseOneStock(productItem.getProductItemId());

        // 재고 변동 이력 등록
        ProductInventory productInventoryCheck = productDao.getProductInventoryForUpdate(productInventory);
        InventoryHistory inventoryHistory = new InventoryHistory();
        inventoryHistory.setProductInventoryId(productInventoryCheck.getProductInventoryId());
        inventoryHistory.setStatusTo(ProductInventoryStatus.IN_STOCK);
        productDao.insertInventoryHistory(inventoryHistory);
    }

    // 상품 품목 입고(대량 입고)
    @Transactional(
        isolation = Isolation.REPEATABLE_READ,
        timeout = 5
    )
    public void insertBulkProductInventory(BulkProductInventoryDTO bulkProductInventoryDTO) {
        // 상품 품목 존재 여부 확인
        ProductItem productItem = productDao.getProductItemForUpdate(bulkProductInventoryDTO.getProductItemId());
        if (productItem == null) {
            throw new ProductException.ProductItemNotFoundException();
        }

        // 대량 입고 저장
        for (String barcode : bulkProductInventoryDTO.getBarcodes()) {
            ProductInventory productInventory = new ProductInventory();
            productInventory.setProductItemId(productItem.getProductItemId());
            productInventory.setBarcode(barcode);
            productInventory.setStatus(ProductInventoryStatus.IN_STOCK);
            productDao.insertProductInventory(productInventory);

            // 상품 품목 입고 시 재고 1 증가
            productDao.increaseOneStock(productItem.getProductItemId());

            // 재고 변동 이력 등록
            ProductInventory productInventoryCheck = productDao.getProductInventoryForUpdate(productInventory);
            InventoryHistory inventoryHistory = new InventoryHistory();
            inventoryHistory.setProductInventoryId(productInventoryCheck.getProductInventoryId());
            inventoryHistory.setStatusTo(ProductInventoryStatus.IN_STOCK);
            productDao.insertInventoryHistory(inventoryHistory);
        }
    }

    // 상품 마스터 목록 조회
    @Transactional(readOnly = true)
    public List<ProductDTO> getProductListBySearch(ProductSearchDTO productSearchDTO) {
        List<ProductDTO> productList = productDao.getProductListBySearch(productSearchDTO);
        return productList;
    }

    // 최상위 카테고리 목록 조회
    @Transactional(readOnly = true)
    public List<Category> getTopCategories() {
        return productDao.getTopCategories();
    }

    // 하위 카테고리 목록 조회
    @Transactional(readOnly = true)
    public List<Category> getSubCategories(Integer categoryId) {
        return productDao.getSubCategories(categoryId);
    }

    // 모든 상품 목록 조회
    @Transactional(readOnly = true)
    public List<ProductDTO> getAllProducts() {
        return productDao.getAllProducts();
    }

    // 카테고리 목록 조회
    @Transactional(readOnly = true)
    public List<Category> getCategories() {
        return productDao.getCategories();
    }

    // 상품 품목 목록 조회
    @Transactional(readOnly = true)
    public List<ProductItem> getProductItemsByProductId(Integer productId) {
        // 상품 존재 여부 확인
        Product product = productDao.getProductById(productId);
        if (product == null) {
            throw new ProductException.ProductNotFoundException();
        }
        return productDao.getProductItemsByProductId(productId);
    }

    // 상품 품목 재고 목록 조회
    @Transactional(readOnly = true)
    public List<ProductInventory> getProductInventories(Integer productItemId) {
        // 상품 품목 존재 여부 확인
        ProductItem productItem = productDao.getProductItemForUpdate(productItemId);
        if (productItem == null) {
            throw new ProductException.ProductItemNotFoundException();
        }
        return productDao.getProductInventories(productItemId);
    }

    // 재고 변동 이력 목록 조회
    @Transactional(readOnly = true)
    public List<InventoryHistory> getInventoryHistories(Integer productInventoryId) {
        return productDao.getInventoryHistories(productInventoryId);
    }

    // 새로운 상품 목록 조회
    @Transactional(readOnly = true)
    public List<ProductDTO> getNewProducts(Integer limit) {
        return productDao.getNewProducts(limit);
    }

    // 인기 상품 목록 조회
    @Transactional(readOnly = true)
    public List<ProductDTO> getPopularProducts(Integer limit) {
        return productDao.getPopularProducts(limit);
    }
    
    // 단일 상품 조회(code 기준)
    @Transactional(readOnly = true)
    public Product getProductByCode(String code) {
        return productDao.getProductByCode(code);
    }

    // 카테고리 경로 조회
    @Transactional(readOnly = true)
    public List<Category> getCategoryPath(Integer categoryId) {
        return productDao.getCategoryPath(categoryId);
    }

    // 이미지 업로드
    public String uploadImage(MultipartFile file) throws IOException {
        validateImage(file);
        ensureUploadDirectory();
        String fileName = generateFileName(file);
        saveImage(file, fileName);
        return fileName;
    }

    // 이미지 유효성 검사
    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }
    }

    // 업로드 디렉토리 생성
    private void ensureUploadDirectory() throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created) {
                throw new IOException("업로드 디렉토리 생성에 실패했습니다.");
            }
            log.info("업로드 디렉토리 생성 완료: {}", uploadDir.getAbsolutePath());
        }
    }

    // 파일 이름 생성
    private String generateFileName(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + fileExtension;
    }

    // 파일 저장
    private void saveImage(MultipartFile file, String fileName) throws IOException {
        Path filePath = Paths.get(UPLOAD_DIR, fileName);
        Files.write(filePath, file.getBytes());
        log.info("파일 저장 완료: {}", filePath);
    }
    
    // 이미지 리소스 조회
    public ImageResourceResponse getImageResource(String fileName) throws IOException {
        Path filePath = getImagePath(fileName);
        Resource resource = createImageResource(filePath);
        validateResource(resource);
        String contentType = determineContentType(filePath);
        
        return new ImageResourceResponse(resource, contentType);
    }

    // 이미지 경로 조회
    private Path getImagePath(String fileName) {
        return Paths.get(UPLOAD_DIR, fileName);
    }

    // 이미지 리소스 생성
    private Resource createImageResource(Path filePath) throws IOException {
        return new UrlResource(filePath.toUri());
    }

    // 이미지 리소스 유효성 검사
    private void validateResource(Resource resource) throws IOException {
        if (!resource.exists() || !resource.isReadable()) {
            throw new FileNotFoundException("이미지 파일을 찾을 수 없거나 읽을 수 없습니다.");
        }
    }

    // 이미지 컨텐트 타입 결정
    private String determineContentType(Path filePath) throws IOException {
        return Files.probeContentType(filePath);
    }

    // 이미지 삭제
    private void deleteImage(String fileName) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.deleteIfExists(filePath);
            log.info("이미지 파일 삭제 완료: {}", filePath);
        } catch (IOException e) {
            log.error("이미지 파일 삭제 중 오류 발생: {}", e.getMessage());
            throw new ProductException.ImageDeleteException();
        }
    }

    // 이미지 URL 파싱
    private List<String> parseImageUrls(String imageUrlJson) {
        try {
            if (imageUrlJson == null || imageUrlJson.trim().isEmpty()) {
                return new ArrayList<>();
            }
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(imageUrlJson);
            List<String> urls = new ArrayList<>();
            if (root.has("urls") && root.get("urls").isArray()) {
                root.get("urls").forEach(url -> {
                    if (url.isTextual()) {
                        urls.add(url.asText());
                    }
                });
            }
            return urls;
        } catch (JsonProcessingException e) {
            log.error("이미지 URL 파싱 중 오류 발생: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
