const categoryRepository = require('../repositories/categoryRepository');
const ApiError = require('../utils/ApiError');

const getAllCategories = async () => {
  const categories = await categoryRepository.getAllCategories();
  return categories;
};

const getCategoryById = async (id) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw ApiError.notFound(`Category with ID ${id} was not found.`);
  }
  return category;
};

const createCategory = async (categoryData) => {
  if (!categoryData || !categoryData.name || typeof categoryData.name !== 'string' || !categoryData.name.trim()) {
    throw ApiError.badRequest('Category name is required.');
  }
  const newCategory = await categoryRepository.createCategory({
    name: categoryData.name.trim(),
    slug: categoryData.slug ? categoryData.slug.trim() : undefined,
    description: categoryData.description ? categoryData.description.trim() : undefined,
  });
  return newCategory;
};

const updateCategory = async (id, updateData) => {
  if (!updateData || (updateData.name !== undefined && !updateData.name.trim())) {
    throw ApiError.badRequest('Valid category details are required for update.');
  }
  const updatedCategory = await categoryRepository.updateCategory(id, updateData);
  if (!updatedCategory) {
    throw ApiError.notFound(`Category with ID ${id} was not found.`);
  }
  return updatedCategory;
};

const deleteCategory = async (id) => {
  const deleted = await categoryRepository.deleteCategory(id);
  if (!deleted) {
    throw ApiError.notFound(`Category with ID ${id} was not found.`);
  }
  return true;
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
