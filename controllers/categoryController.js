const categoryService = require('../services/categoryService');
const { sucResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');


const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getAllCategories();
  return sucResponse(res, { categories }, 200);
});


const getCategoryById = asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  const category = await categoryService.getCategoryById(categoryId);
  return sucResponse(res, { category }, 200);
});


const createCategory = asyncHandler(async (req, res) => {
  const categoryData = req.body;
  const category = await categoryService.createCategory(categoryData);
  return sucResponse(res, { category }, 201);
});

module.exports = { getAllCategories, getCategoryById, createCategory};
