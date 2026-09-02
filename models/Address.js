function buildAddressDocument({ userId, line1, city, province, postalCode }) {
  return { userId, line1, city, province, postalCode };
}

module.exports = { buildAddressDocument };