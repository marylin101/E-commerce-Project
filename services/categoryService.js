const categoryRepository = require('../repositories/categoryRepository');
const { badReq, notFound } = require('../utils/badRequests');

const getAllCategories = async () => {
    const getCategory = await categoryRepository.getAllCategories()
  return getCategory;
};

const getCategoryById = async (id) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw notFound(`Category with ID ${id} was not found.`);
  }
  return category;
};

const createCategory = async (categoryData) => {
  if (!categoryData || !categoryData.name || typeof categoryData.name !== 'string' || !categoryData.name.trim()) {
    throw badReq('Category name is required.');
  }
  const newCategory = await categoryRepository.createCategory({
    name: categoryData.name.trim(),
    slug: categoryData.slug ? categoryData.slug.trim() : undefined,
  });
  return newCategory;
};

module.exports = {getAllCategories, getCategoryById, createCategory,};
