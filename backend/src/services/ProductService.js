const Product = require('../models/Product');
const { HTTP_STATUS } = require('../config/constants');

class ProductService {
  static async getAllProducts(filters) {
    try {
      // Support both old format (type as string) and new format (filters object)
      const filterObj = typeof filters === 'string' 
        ? { type: filters } 
        : (filters || {});
      const products = await Product.findAll(filterObj);
      return { success: true, data: products };
    } catch (error) {
      throw error;
    }
  }

  static async getProductById(id) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy sản phẩm'
        };
      }
      return { success: true, data: product };
    } catch (error) {
      throw error;
    }
  }

  static async createProduct(productData) {
    try {
      // Validate required fields
      if (!productData.name || !productData.type) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Tên sản phẩm và loại sản phẩm là bắt buộc'
        };
      }

      // Validate price
      if (productData.price && productData.price < 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0'
        };
      }

      // Validate type
      const validTypes = ['popcorn', 'drink', 'combo', 'other'];
      if (!validTypes.includes(productData.type)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Loại sản phẩm không hợp lệ'
        };
      }

      const result = await Product.create(productData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateProduct(id, updateData) {
    try {
      // Check if product exists
      const product = await Product.findById(id);
      if (!product) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy sản phẩm'
        };
      }

      // Validate price if provided
      if (updateData.price !== undefined && updateData.price < 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Giá sản phẩm phải lớn hơn hoặc bằng 0'
        };
      }

      // Validate type if provided
      if (updateData.type) {
        const validTypes = ['popcorn', 'drink', 'combo', 'other'];
        if (!validTypes.includes(updateData.type)) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Loại sản phẩm không hợp lệ'
          };
        }
      }

      const result = await Product.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated product
      const updatedProduct = await Product.findById(id);
      return {
        success: true,
        data: updatedProduct
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteProduct(id) {
    try {
      // Check if product exists
      const product = await Product.findById(id);
      if (!product) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy sản phẩm'
        };
      }

      // Soft delete: set is_active = FALSE
      const result = await Product.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa sản phẩm'
        };
      }

      return {
        success: true,
        message: 'Xóa sản phẩm thành công'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductService;

