// DOM Elements
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const totalDisplay = document.getElementById("total");
const toast = document.getElementById("toast");

// Modal Elements
const modal = document.getElementById("productModal");
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalDescription = document.getElementById("modalDescription");
const modalPrice = document.getElementById("modalPrice");
const modalRating = document.getElementById("modalRating");
const modalAddToCart = document.getElementById("modalAddToCart");
const modalClose = document.querySelector(".close");

let allProducts = [];
let total = 0;
let cart = [];

// Load giỏ hàng từ localStorage nếu có
function loadCart() {
  const saved = localStorage.getItem("cart");
  if (saved) {
    cart = JSON.parse(saved);
    total = 0;
    cartItems.innerHTML = "";
    cart.forEach(item => {
      addToCart(item.name, item.price, false); // false = không lưu lại lần nữa
    });
    updateTotal();
  }
}

// Lưu giỏ hàng vào localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Hiển thị toast thông báo
function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

// Cập nhật tổng tiền
function updateTotal() {
  totalDisplay.textContent = total.toLocaleString();
}

// Thêm sản phẩm vào giỏ
function addToCart(name, price, save = true) {
  const li = document.createElement("li");
  li.textContent = `${name} - ${parseInt(price).toLocaleString()} đ`;

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.style.marginLeft = "10px";
  removeBtn.style.background = "transparent";
  removeBtn.style.color = "#d00";
  removeBtn.style.border = "none";
  removeBtn.style.cursor = "pointer";

  removeBtn.onclick = () => {
    cartItems.removeChild(li);
    total -= price;
    updateTotal();
    cart = cart.filter(item => !(item.name === name && item.price === price));
    saveCart();
  };

  li.appendChild(removeBtn);
  cartItems.appendChild(li);

  total += price;
  updateTotal();

  if (save) {
    cart.push({ name, price });
    saveCart();
    showToast(`✔️ Đã thêm ${name} vào giỏ hàng!`);
  }
}

// Modal popup
let currentModalProduct = null;

modalClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

// Tạo sản phẩm từ API
function renderProducts(products) {
  productList.innerHTML = "";

  products.forEach(product => {
    const productEl = document.createElement("div");
    productEl.classList.add("product");

    productEl.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-img">
      <div class="product-body">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price">${parseInt(product.price).toLocaleString()}đ</div>
        <div class="rating">${"★".repeat(product.rating || 4)}</div>
        <button>Thêm vào giỏ</button>
      </div>
    `;

    // Gắn modal
    productEl.querySelector("img").addEventListener("click", () => {
      currentModalProduct = product;
      modalImage.src = product.image;
      modalName.textContent = product.name;
      modalDescription.textContent = product.description;
      modalPrice.textContent = parseInt(product.price).toLocaleString() + "đ";
      modalRating.innerHTML = "★".repeat(product.rating || 4);
      modal.style.display = "block";
    });

    // Gắn thêm vào giỏ
    productEl.querySelector("button").addEventListener("click", () => {
      addToCart(product.name, product.price);
    });

    productList.appendChild(productEl);
  });
}

// Lọc + tìm kiếm
function filterAndSearch() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const priceFilter = document.getElementById("priceFilter").value;
  const ratingFilter = parseInt(document.getElementById("ratingFilter").value) || 0;

  const filtered = allProducts.filter(p => {
    const matchName = p.name.toLowerCase().includes(searchText);
    const matchPrice =
      priceFilter === "lt200" ? p.price < 200000 :
      priceFilter === "200to400" ? p.price >= 200000 && p.price <= 400000 :
      priceFilter === "gt400" ? p.price > 400000 :
      true;
    const matchRating = p.rating >= ratingFilter;

    return matchName && matchPrice && matchRating;
  });

  renderProducts(filtered);
}

// Gắn sự kiện cho các bộ lọc
document.getElementById("searchInput").addEventListener("input", filterAndSearch);
document.getElementById("priceFilter").addEventListener("change", filterAndSearch);
document.getElementById("ratingFilter").addEventListener("change", filterAndSearch);

// Gọi API từ Google Sheet
fetch("https://api.sheetbest.com/sheets/5f884621-7b81-43c0-884b-704a8fa397b1")
  .then(res => res.json())
  .then(data => {
    allProducts = data.map(p => ({
      name: p.name,
      description: p.description,
      price: parseInt(p.price),
      image: p.image,
      rating: parseInt(p.rating) || 4
    }));
    renderProducts(allProducts);
    loadCart(); // load lại giỏ hàng từ localStorage
  })
  .catch(err => {
    console.error("Lỗi khi gọi API:", err);
    productList.innerHTML = "<p>⚠️ Không thể tải sản phẩm. Vui lòng thử lại sau.</p>";
  });

// Nút thêm từ modal
modalAddToCart.onclick = () => {
  if (currentModalProduct) {
    addToCart(currentModalProduct.name, currentModalProduct.price);
    modal.style.display = "none";
  }
};
const contactSubmit = document.getElementById("contactSubmit");

contactSubmit.addEventListener("click", () => {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const message = document.getElementById("contactMessage").value.trim();

  if (!name || !email || !message) {
    showToast("⚠️ Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const payload = {
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  fetch("https://sheet.best/api/sheets/YOUR_SHEET_ID_HERE", { // ⬅️ đổi lại URL của bạn
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })
  .then(res => {
    if (res.ok) {
      showToast("✅ Gửi liên hệ thành công!");
      document.getElementById("contactName").value = "";
      document.getElementById("contactEmail").value = "";
      document.getElementById("contactMessage").value = "";
    } else {
      throw new Error("Gửi thất bại");
    }
  })
  .catch(() => showToast("❌ Gửi liên hệ thất bại. Vui lòng thử lại."));
});
