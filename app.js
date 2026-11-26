
/* ==========================================
   FOODIEHUB - MAIN JAVASCRIPT
========================================== */

const CART_KEY = "foodieHubCart";
const ORDER_KEY = "foodieHubOrder";
const PROMO_KEY = "foodieHubPromo";

let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];

let appliedPromo = localStorage.getItem(PROMO_KEY) === "true";

/* ==========================================
   COMMON FUNCTIONS
========================================== */

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function getFood(id) {
    return foodData.find(food => food.id === Number(id));
}

function formatPrice(amount) {
    return "₹" + Number(amount).toFixed(2);
}

function getCartCount() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartCount() {
    const countElement = document.getElementById("cart-count");

    if (countElement) {
        countElement.textContent = getCartCount();
    }
}

function getSubtotal() {
    return cart.reduce((total, item) => {
        return total + item.unitPrice * item.quantity;
    }, 0);
}

function getDeliveryCharge(subtotal) {
    return subtotal >= 499 || subtotal === 0 ? 0 : 40;
}

function getTax(subtotal) {
    return subtotal * 0.05;
}

function getDiscount(subtotal) {
    return appliedPromo ? subtotal * 0.10 : 0;
}

function getGrandTotal() {
    const subtotal = getSubtotal();
    const tax = getTax(subtotal);
    const delivery = getDeliveryCharge(subtotal);
    const discount = getDiscount(subtotal);

    return Math.max(0, subtotal + tax + delivery - discount);
}


/* ==========================================
   MOBILE NAVIGATION
========================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("show");
        });
    });
}


/* ==========================================
   ADD FOOD TO CART
========================================== */


function addToCart(foodId) {
    const food = getFood(foodId);

    if (!food) {
        alert("Food item not found.");
        return;
    }

    // Get selected quantity from the menu
    const quantityElement = document.getElementById("menuQty-" + foodId);
    const quantity = quantityElement
        ? Math.max(1, Number(quantityElement.textContent) || 1)
        : 1;

    const existingItem = cart.find(item =>
        item.id === food.id &&
        !item.size &&
        !item.extras
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: food.id,
            name: food.name,
            price: food.price,
            unitPrice: food.price,
            image: food.image,
            quantity: quantity,
            size: "",
            spice: "Regular",
            extras: ""
        });
    }

    saveCart();

    // Reset menu quantity to 1 after adding
    if (quantityElement) {
        quantityElement.textContent = "1";
    }

    alert(quantity + " x " + food.name + " added to your cart!");
}



/* ==========================================
   FOOD DETAILS PAGE
========================================== */


function loadFoodDetails() {
    const params = new URLSearchParams(window.location.search);
    const foodId = Number(params.get("id")) || 1;
    const food = getFood(foodId);

    if (!food) {
        alert("Food item not found!");
        return;
    }

    // Get HTML elements using the correct IDs
    const image = document.getElementById("detailImage");
    const name = document.getElementById("detailName");
    const price = document.getElementById("detailPrice");
    const rating = document.getElementById("detailRating");
    const description = document.getElementById("detailDescription");
    const ingredients = document.getElementById("detailIngredients");

    // Display selected food details
    if (image) {
        image.src = food.image;
        image.alt = food.name;
    }

    if (name) name.textContent = food.name;
    if (price) price.textContent = formatPrice(food.price);
    if (rating) rating.textContent = food.rating;
    if (description) description.textContent = food.description;

    if (ingredients) {
        ingredients.textContent = food.ingredients;
    }

    // Add selected food to cart
    const addButton = document.getElementById("addDetailToCart");

    if (addButton) {
        addButton.addEventListener("click", () => {
            addCustomizedFood(food);
        });
    }
}


function addCustomizedFood(food) {
    const sizeElement = document.getElementById("foodSize");
    const spiceElement = document.getElementById("foodSpice");
    const extrasElement = document.getElementById("foodExtras");
    const quantityElement = document.getElementById("foodQuantity");

    const sizePrice = sizeElement ? Number(sizeElement.value) || 0 : 0;
    const spice = spiceElement ? spiceElement.value : "Regular";
    const extrasPrice = extrasElement ? Number(extrasElement.value) || 0 : 0;
    const quantity = quantityElement
    ? Math.max(1, Number(quantityElement.textContent) || 1)
    : 1;

    const sizeName = sizeElement
        ? sizeElement.options[sizeElement.selectedIndex].text
        : "";

    const extrasName = extrasElement
        ? extrasElement.options[extrasElement.selectedIndex].text
        : "";

    const unitPrice = food.price + sizePrice + extrasPrice;

    cart.push({
        id: food.id,
        name: food.name,
        price: food.price,
        unitPrice: unitPrice,
        image: food.image,
        quantity: quantity,
        size: sizeName,
        spice: spice,
        extras: extrasName
    });

    saveCart();

    alert(food.name + " added to your cart!");
}


/* ==========================================
   FOOD QUANTITY CONTROLS
========================================== */


/* ==========================================
   FOOD QUANTITY CONTROLS
========================================== */

const decreaseButton = document.getElementById("decreaseQty");
const increaseButton = document.getElementById("increaseQty");
const quantityInput = document.getElementById("foodQuantity");

if (decreaseButton && quantityInput) {
    decreaseButton.addEventListener("click", () => {
        const current = Number(quantityInput.textContent) || 1;
        quantityInput.textContent = Math.max(1, current - 1);
    });
}

if (increaseButton && quantityInput) {
    increaseButton.addEventListener("click", () => {
        const current = Number(quantityInput.textContent) || 1;
        quantityInput.textContent = current + 1;
    });
}


/* ==========================================
   MENU PAGE - SEARCH AND FILTER
========================================== */

function setupMenu() {
    const container = document.getElementById("foodContainer");

    if (!container) return;

    const cards = Array.from(container.querySelectorAll(".food-card"));

// Add quantity controls to every menu food card
cards.forEach(card => {
    const addButton = card.querySelector(".add-btn");

    if (!addButton) return;

    const match = addButton.getAttribute("onclick").match(/\d+/);

    if (!match) return;

    const foodId = Number(match[0]);

    const quantityControls = document.createElement("div");

    quantityControls.className = "menu-quantity";

    quantityControls.innerHTML = `
        <button type="button"
            onclick="changeMenuQuantity(${foodId}, -1)">−</button>

        <span id="menuQty-${foodId}">1</span>

        <button type="button"
            onclick="changeMenuQuantity(${foodId}, 1)">+</button>
    `;

    addButton.parentElement.insertBefore(
        quantityControls,
        addButton
    );
});

function changeMenuQuantity(foodId, change) {
    const quantityElement =
        document.getElementById("menuQty-" + foodId);

    if (!quantityElement) return;

    let quantity = Number(quantityElement.textContent) || 1;

    quantity += change;

    quantityElement.textContent = Math.max(1, quantity);
}


    const searchInput = document.getElementById("foodSearch");
    const sortSelect = document.getElementById("sortFood");
    const filterButtons = document.querySelectorAll(".filter-btn");
    const noFoodMessage = document.getElementById("noFoodMessage");

    let selectedCategory = "All";

    function filterFoods() {
        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        let visibleCount = 0;

        cards.forEach(card => {
            const name = card.textContent.toLowerCase();
            const category = card.dataset.category || "All";

            const matchesSearch = name.includes(searchText);
            const matchesCategory =
                selectedCategory === "All" ||
                category.toLowerCase() === selectedCategory.toLowerCase();

            const shouldShow = matchesSearch && matchesCategory;

            card.style.display = shouldShow ? "" : "none";

            if (shouldShow) visibleCount++;
        });

        if (noFoodMessage) {
            noFoodMessage.style.display =
                visibleCount === 0 ? "block" : "none";
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterFoods);
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(item => item.classList.remove("active"));

            button.classList.add("active");

            selectedCategory = button.dataset.category || "All";

            filterFoods();
        });
    });

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            const sortValue = sortSelect.value;

            const sortedCards = [...cards].sort((a, b) => {
                const priceA = Number(a.dataset.price) || 0;
                const priceB = Number(b.dataset.price) || 0;

                if (sortValue === "low-high") {
                    return priceA - priceB;
                }

                if (sortValue === "high-low") {
                    return priceB - priceA;
                }

                return 0;
            });

            sortedCards.forEach(card => container.appendChild(card));
        });
    }

    filterFoods();
}


/* ==========================================
   CART PAGE
========================================== */

function renderCart() {
    const cartItems = document.getElementById("cartItems");

    if (!cartItems) return;

    const emptyCart = document.getElementById("emptyCart");
    const cartSummary = document.getElementById("cartSummary");
    const checkoutButton = document.getElementById("checkoutButton");

    if (cart.length === 0) {
        cartItems.innerHTML = "";

        if (emptyCart) emptyCart.style.display = "block";
        if (cartSummary) cartSummary.style.display = "none";
        if (checkoutButton) checkoutButton.style.pointerEvents = "none";

        updateCartCount();
        return;
    }

    if (emptyCart) emptyCart.style.display = "none";
    if (cartSummary) cartSummary.style.display = "block";
    if (checkoutButton) checkoutButton.style.pointerEvents = "auto";

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">

            <img src="${item.image}" alt="${item.name}">

            <div class="cart-item-info">
                <h3>${item.name}</h3>
                <p>${formatPrice(item.unitPrice)} each</p>
                <p>Quantity: ${item.quantity}</p>
                <p>${item.size || ""} ${item.spice || ""} ${item.extras || ""}</p>
            </div>

            <div>
                <strong>${formatPrice(item.unitPrice * item.quantity)}</strong>

                <div class="quantity-control">
                    <button type="button" onclick="changeCartQuantity(${index}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="changeCartQuantity(${index}, 1)">+</button>
                </div>

                <button type="button" onclick="removeCartItem(${index})">
                    Remove
                </button>
            </div>

        </div>
    `).join("");

    updateCartSummary();
}

function changeCartQuantity(index, change) {
    if (!cart[index]) return;

    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    renderCart();
}

function removeCartItem(index) {
    cart.splice(index, 1);

    saveCart();
    renderCart();
}

function updateCartSummary() {
    const subtotal = getSubtotal();
    const tax = getTax(subtotal);
    const delivery = getDeliveryCharge(subtotal);
    const discount = getDiscount(subtotal);
    const total = Math.max(0, subtotal + tax + delivery - discount);

    const subtotalElement = document.getElementById("cartSubtotal");
    const taxElement = document.getElementById("cartTax");
    const deliveryElement = document.getElementById("deliveryCharge");
    const totalElement = document.getElementById("cartTotal");

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (taxElement) taxElement.textContent = formatPrice(tax);

    if (deliveryElement) {
        deliveryElement.textContent = delivery === 0
            ? "FREE"
            : formatPrice(delivery);
    }

    if (totalElement) totalElement.textContent = formatPrice(total);

    const discountRow = document.getElementById("cartDiscount");

    if (discountRow) {
        discountRow.textContent = formatPrice(discount);
    }
}


/* ==========================================
   PROMO CODE
========================================== */

/* ==========================================
   PROMO CODE
========================================== */

const applyPromoButton = document.getElementById("applyPromo");

if (applyPromoButton) {

    applyPromoButton.addEventListener("click", () => {

        const promoInput = document.getElementById("promoCode");

        const promoMessage = document.getElementById("promoMessage");

        const code = promoInput
            ? promoInput.value.trim().toUpperCase()
            : "";

        if (code === "FOODIE10") {

            appliedPromo = true;

            localStorage.setItem(PROMO_KEY, "true");

            if (promoMessage) {

                promoMessage.textContent =
                    "10% discount applied successfully!";

                promoMessage.style.color = "#65dc8b";

            }

        } else {

            appliedPromo = false;

            localStorage.removeItem(PROMO_KEY);

            if (promoMessage) {

                promoMessage.textContent =
                    "Invalid promo code. Try FOODIE10.";

                promoMessage.style.color = "#ff7777";

            }

        }

        updateCartSummary();

    });

}


/* ==========================================
   CHECKOUT PAGE
========================================== */

function loadCheckout() {
    const checkoutItems = document.getElementById("checkoutItems");

    if (!checkoutItems) return;

    if (cart.length === 0) {
        checkoutItems.innerHTML = "<p>Your cart is empty.</p>";

        const form = document.getElementById("checkoutForm");
        if (form) form.style.display = "none";

        return;
    }

    checkoutItems.innerHTML = cart.map(item => `
        <div class="summary-row">
            <span>${item.name} × ${item.quantity}</span>
            <strong>${formatPrice(item.unitPrice * item.quantity)}</strong>
        </div>
    `).join("");

    const subtotal = getSubtotal();
    const tax = getTax(subtotal);
    const delivery = getDeliveryCharge(subtotal);
    const discount = getDiscount(subtotal);
    const total = Math.max(0, subtotal + tax + delivery - discount);

    const subtotalElement = document.getElementById("checkoutSubtotal");
    const taxElement = document.getElementById("checkoutTax");
    const deliveryElement = document.getElementById("checkoutDelivery");
    const totalElement = document.getElementById("checkoutTotal");

    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (taxElement) taxElement.textContent = formatPrice(tax);

    if (deliveryElement) {
        deliveryElement.textContent = delivery === 0
            ? "FREE"
            : formatPrice(delivery);
    }

    if (totalElement) totalElement.textContent = formatPrice(total);
}


/* ==========================================
   PLACE ORDER
========================================== */

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", event => {
        event.preventDefault();

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        if (!checkoutForm.reportValidity()) {
            return;
        }

        const selectedPayment = document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!selectedPayment) {
            alert("Please select a payment method.");
            return;
        }

        const customer = {
            name: document.getElementById("customerName").value.trim(),
            phone: document.getElementById("customerPhone").value.trim(),
            email: document.getElementById("customerEmail").value.trim(),
            address: document.getElementById("customerAddress").value.trim(),
            city: document.getElementById("customerCity").value.trim(),
            pincode: document.getElementById("customerPincode").value.trim(),
            instructions: document.getElementById("deliveryInstructions").value.trim()
        };

        
const order = {
    orderId: "FH" + Date.now(),
    customer: customer,
    payment: selectedPayment.value,
    items: cart,
    subtotal: getSubtotal(),
    tax: getTax(getSubtotal()),
    delivery: getDeliveryCharge(getSubtotal()),
    discount: getDiscount(getSubtotal()),
    total: getGrandTotal(),

    orderDate: new Date().toLocaleDateString("en-IN"),

    orderTime: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })
};

localStorage.setItem(ORDER_KEY, JSON.stringify(order));

cart = [];
saveCart();

appliedPromo = false;
localStorage.removeItem(PROMO_KEY);

window.location.href = "confirmation.html";

    });
}
    


/* ==========================================
   ORDER CONFIRMATION PAGE
========================================== */


/* ==========================================
   ORDER CONFIRMATION PAGE
========================================== */

function loadConfirmation() {

    const orderIdElement =
        document.getElementById("confirmationOrderId");

    if (!orderIdElement) return;

    const order = JSON.parse(
        localStorage.getItem(ORDER_KEY)
    );

    if (!order) {
        orderIdElement.textContent = "No order found";
        return;
    }

    // Customer Information
    const customerElement =
        document.getElementById("confirmationCustomer");

    const phoneElement =
        document.getElementById("confirmationPhone");

    const paymentElement =
        document.getElementById("confirmationPayment");

    const dateElement =
        document.getElementById("confirmationDate");
    const timeElement =
    document.getElementById("confirmationTime");    

    if (customerElement) {
        customerElement.textContent = order.customer.name;
    }

    if (phoneElement) {
        phoneElement.textContent = order.customer.phone;
    }

    if (paymentElement) {
        paymentElement.textContent = order.payment;
    }

    if (dateElement) {
    dateElement.textContent = order.orderDate || "Date not available";
    }
    if (timeElement) {
    timeElement.textContent = order.orderTime;
    }

    // Order ID
    orderIdElement.textContent = order.orderId;

    // Delivery Address
    const addressElement =
        document.getElementById("confirmationAddress");

    if (addressElement) {

        const customer = order.customer;

        const addressParts = [
            customer.address,
            customer.city,
            "PIN Code: " + customer.pincode,
            customer.instructions
                ? "Delivery Instructions: " + customer.instructions
                : ""
        ].filter(Boolean);

        addressElement.textContent = addressParts.join(", ");
    }

    // Ordered Food Items
    const itemsElement =
        document.getElementById("confirmationItems");

    if (itemsElement) {

        if (order.items && order.items.length > 0) {

            itemsElement.innerHTML = order.items.map(item => {

                const itemTotal =
                    Number(item.unitPrice) * Number(item.quantity);

                return `
                    <div class="confirmation-item">

                        <div>
                            <strong>${escapeHTML(item.name)}</strong>

                            <p>Quantity: ${Number(item.quantity)}</p>

                            <p>
                                Price: ${formatPrice(item.unitPrice)} each
                            </p>

                            ${item.size ? `<p>Size: ${escapeHTML(item.size)}</p>` : ""}

                            ${item.spice ? `<p>Spice: ${escapeHTML(item.spice)}</p>` : ""}

                            ${item.extras ? `<p>Extras: ${escapeHTML(item.extras)}</p>` : ""}

                        </div>

                        <strong>${formatPrice(itemTotal)}</strong>

                    </div>
                `;

            }).join("");

        } else {

            itemsElement.textContent = "No food items found.";

        }
    }

    // Payment Summary
    const subtotalElement =
        document.getElementById("confirmationSubtotal");

    const taxElement =
        document.getElementById("confirmationTax");

    const deliveryElement =
        document.getElementById("confirmationDelivery");

    const discountElement =
        document.getElementById("confirmationDiscount");

    const totalElement =
        document.getElementById("confirmationTotal");

    if (subtotalElement) {
        subtotalElement.textContent = formatPrice(order.subtotal);
    }

    if (taxElement) {
        taxElement.textContent = formatPrice(order.tax);
    }

    if (deliveryElement) {
        deliveryElement.textContent =
            order.delivery === 0
                ? "FREE"
                : formatPrice(order.delivery);
    }

    if (discountElement) {
        discountElement.textContent =
            "-" + formatPrice(order.discount);
    }

    if (totalElement) {
        totalElement.textContent = formatPrice(order.total);
    }

}



/* ==========================================
   HTML ESCAPE FUNCTION
========================================== */

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


/* ==========================================
   CONTACT FORM
========================================== */

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", event => {
        event.preventDefault();

        if (!contactForm.reportValidity()) return;

        const status = document.getElementById("contactMessageStatus");

        if (status) {
            status.textContent =
                "Thank you! Your message has been received in this demo.";
            status.style.color = "#65dc8b";
        }

        contactForm.reset();
    });
}


/* ==========================================
   INITIALIZE WEBSITE
========================================== */

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    loadFoodDetails();
    setupMenu();
    renderCart();
    loadCheckout();
    loadConfirmation();
});
