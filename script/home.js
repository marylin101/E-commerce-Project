//sample of the items from database member can change this
const items = [
      { tag: "Notebooks", name: "A5 Dot Grid Hardcover Journal", price: "R 240.00", stock: "18 in stock" },
      { tag: "Writing", name: "Heavyweight Brass Fountain Pen", price: "R 390.00", stock: "6 in stock" },
      { tag: "Art Supplies", name: "Archival Fineliners (Set of 6)", price: "R 185.00", stock: "12 in stock" },
      { tag: "Desk Tools", name: "Solid Brass Metric Ruler (30cm)", price: "R 140.00", stock: "14 in stock" },
      { tag: "Notebooks", name: "Smyth-Sewn Hardcover Sketchbook", price: "R 210.00", stock: "9 in stock" },
      { tag: "Writing", name: "0.38mm Ultra-Fine Gel Pen Pack", price: "R 95.00", stock: "30 in stock" },
      { tag: "Desk Tools", name: "Charcoal Wool Felt Desk Pad", price: "R 320.00", stock: "8 in stock" },
      { tag: "Art Supplies", name: "12-Pan Half-Palette Watercolor Set", price: "R 280.00", stock: "5 in stock" }
    ];

    document.getElementById("catalogGrid").innerHTML = items.map(p => `
      <div class="item-card">
        <div class="image-container">
          <span>[ ${p.name} ]</span>
          <button class="hover-btn">+ Add to Tray</button>
        </div>
        <span class="tag">${p.tag}</span>
        <div class="title">${p.name}</div>
        <div class="bottom-row">
          <span class="price">${p.price}</span>
          <span class="stock">${p.stock}</span>
        </div>
      </div>
    `).join('');