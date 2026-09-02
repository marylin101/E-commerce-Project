function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildCategoryDocument({ name, slug }) {
  return { name, slug: slug || slugify(name) };
}

module.exports = { buildCategoryDocument, slugify };
