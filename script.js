// App state / Stato dell'app
// products stores the JSON catalog; cart is the single source of truth for the cart.
// products salva il catalogo JSON; cart e' la fonte di verita' del carrello.
let products = [];
let cart = [];

// Product card elements / Elementi delle card prodotto
// These NodeLists are matched by index with the products array.
// Queste NodeList corrispondono per indice all'array products.
const addButtons = document.querySelectorAll(".add-to-cart-btn");
const quantityControls = document.querySelectorAll(".quantity-controls");
const quantityLabels = document.querySelectorAll(".quantity");
const decreaseButtons = document.querySelectorAll(".decrease-btn");
const increaseButtons = document.querySelectorAll(".increase-btn");

// Cart elements / Elementi del carrello
// cartCount updates "Your Cart (0)", cartContent is the area rebuilt by renderCart().
// cartCount aggiorna "Your Cart (0)", cartContent e' l'area ricostruita da renderCart().
const cartCount = document.querySelector("aside h2 span");
const cartContent = document.querySelector("aside > div");

// Load product catalog / Carica il catalogo prodotti
// After the JSON is available, attach events and render the initial empty cart.
// Dopo aver ricevuto il JSON, collega gli eventi e mostra il carrello vuoto iniziale.
fetch("./data.json")
  .then((response) => response.json())
  .then((data) => {
    products = data;
    initializeApp();
  })
  .catch(() => {
    products = getProductsFromPage();
    initializeApp();
  });

// Attach click handlers / Collega gli eventi click
// Each button uses its index as the product id because data.json has no explicit id.
// Ogni bottone usa il proprio indice come id prodotto, perche' data.json non ha un id esplicito.
function initializeApp() {
  setupProductButtons();
  renderCart();
}

function setupProductButtons() {
  for (let i = 0; i < addButtons.length; i++) {
    addButtons[i].addEventListener("click", () => {
      addToCart(i);
    });

    increaseButtons[i].addEventListener("click", () => {
      addToCart(i);
    });

    decreaseButtons[i].addEventListener("click", () => {
      removeOneFromCart(i);
    });
  }
}

// Add one product to the cart / Aggiunge un prodotto al carrello
// If the product is already in cart, increase quantity; otherwise create a new cart item.
// Se il prodotto e' gia' nel carrello, aumenta la quantita'; altrimenti crea un nuovo elemento.
function addToCart(productId) {
  const product = products[productId];
  if (product === undefined) {
    return;
  }

  const cartItem = findCartItem(productId);

  if (cartItem === undefined) {
    const newCartItem = {
      id: productId,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image.thumbnail
    };

    cart.push(newCartItem);
  } else {
    cartItem.quantity++;
  }

  updateProductControl(productId);
  renderCart();
}

// Remove one product from the cart / Rimuove un prodotto dal carrello
// When quantity reaches zero, remove the item and restore the white add button.
// Quando la quantita' arriva a zero, rimuove l'elemento e ripristina il bottone bianco.
function removeOneFromCart(productId) {
  const cartItem = findCartItem(productId);

  if (cartItem === undefined) {
    return;
  }

  cartItem.quantity--;

  if (cartItem.quantity === 0) {
    cart = cart.filter((item) => item.id !== productId);
  }

  updateProductControl(productId);
  renderCart();
}

// Find an item in the cart / Cerca un elemento nel carrello
// Returns the cart object when found, otherwise returns undefined.
// Restituisce l'oggetto del carrello se lo trova, altrimenti undefined.
function findCartItem(productId) {
  for (const item of cart) {
    if (item.id === productId) {
      return item;
    }
  }

  return undefined;
}

// Sync card quantity / Sincronizza la quantita' nella card
// Updates the number shown inside the orange quantity control.
// Aggiorna il numero mostrato dentro il controllo arancione della card.
function updateProductControl(productId) {
  const cartItem = findCartItem(productId);

  if (cartItem !== undefined) {
    quantityLabels[productId].textContent = cartItem.quantity;
    addButtons[productId].classList.add("hidden");
    quantityControls[productId].classList.remove("hidden");
    quantityControls[productId].classList.add("flex");

    return;
  }

  quantityLabels[productId].textContent = "1";
  addButtons[productId].classList.remove("hidden");
  quantityControls[productId].classList.add("hidden");
  quantityControls[productId].classList.remove("flex");
}

// File fallback / Piano B per apertura diretta del file
// Browsers can block fetch("./data.json") on file://, so read the visible card data.
// I browser possono bloccare fetch("./data.json") su file://, quindi leggiamo i dati dalle card.
function getProductsFromPage() {
  const cards = document.querySelectorAll("section .grid > div");

  return Array.from(cards).map((card) => {
    const category = card.querySelector("p:first-of-type").textContent;
    const name = card.querySelector("h4").textContent;
    const priceText = card.querySelector("p:last-of-type").textContent;
    const price = Number(priceText.replace("$", ""));
    const image = card.querySelector("img").getAttribute("src");

    return {
      category: category,
      name: name,
      price: price,
      image: {
        thumbnail: image
      }
    };
  });
}

// Render cart UI / Disegna l'interfaccia del carrello
// The aside is rebuilt only from cart, so the cart array drives the UI.
// L'aside viene ricostruito solo da cart, quindi l'array cart guida la UI.
function renderCart() {
  cartCount.textContent = getTotalItems();

  // Empty state / Stato carrello vuoto
  // If there are no products in cart, show the illustration and stop the function.
  // Se non ci sono prodotti nel carrello, mostra l'illustrazione e ferma la funzione.
  if (cart.length === 0) {
    cartContent.className = "flex min-h-64 flex-col items-center justify-center gap-4 py-4 text-center";
    cartContent.innerHTML = `
      <img src="./assets/images/illustration-empty-cart.svg" alt="a tasty cake slice" class="w-32">
      <p class="font-semibold text-[#87635A]">Your added items will appear here</p>
    `;

    return;
  }

  let cartHTML = "";

  // Cart list wrapper / Contenitore della lista carrello
  // cartHTML collects the markup before one single innerHTML update.
  // cartHTML raccoglie il markup prima di un unico aggiornamento con innerHTML.
  cartHTML += `<div class="flex flex-col gap-4">`;

  // Cart items / Prodotti nel carrello
  // Each item shows quantity, single price, and subtotal.
  // Ogni prodotto mostra quantita', prezzo singolo e subtotale.
  for (const item of cart) {
    const itemTotal = item.price * item.quantity;

    cartHTML += `
      <div class="border-b border-[#F5EEEC] pb-4">
        <h3 class="mb-2 font-semibold">${item.name}</h3>

        <div class="flex items-center gap-3 text-sm">
          <span class="font-semibold text-[#C73B0F]">${item.quantity}x</span>
          <span class="text-[#87635A]">@ $${item.price.toFixed(2)}</span>
          <span class="font-semibold text-[#87635A]">$${itemTotal.toFixed(2)}</span>
        </div>
      </div>
    `;
  }

  // Cart summary / Riepilogo carrello
  // The order total comes from getOrderTotal(), not from renderCart() itself.
  // Il totale ordine arriva da getOrderTotal(), non viene calcolato direttamente da renderCart().
  cartHTML += `
      <div class="flex items-center justify-between py-2">
        <span>Order Total</span>
        <strong class="text-2xl">$${getOrderTotal().toFixed(2)}</strong>
      </div>

      <div class="flex items-center gap-2 rounded-md bg-[#F5EEEC] p-4">
        <img src="./assets/images/icon-carbon-neutral.svg" alt="carbon-neutral">
        <p>This is a <span class="font-bold">carbon-neutral</span> delivery</p>
      </div>

      <button class="w-full rounded-full bg-[#C73B0F] py-4 font-semibold text-white transition-colors hover:bg-[#952C0C]">
        Confirm Order
      </button>
    </div>
  `;

  cartContent.className = "";
  cartContent.innerHTML = cartHTML;
}

// Count all items / Conta tutti gli elementi
// Sums quantities, so two waffles count as 2 items.
// Somma le quantita', quindi due waffle contano come 2 elementi.
function getTotalItems() {
  let totalItems = 0;

  for (const item of cart) {
    totalItems += item.quantity;
  }

  return totalItems;
}

// Calculate order total / Calcola il totale ordine
// Sums price * quantity for every cart item.
// Somma prezzo * quantita' per ogni elemento del carrello.
function getOrderTotal() {
  let total = 0;

  for (const item of cart) {
    total += item.price * item.quantity;
  }

  return total;
}
