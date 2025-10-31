
const categoryList = document.getElementById('category-list');
const plantsContainer = document.getElementById('plants-container');
const cartList = document.getElementById('cart-list');
const cartTotal = document.getElementById('cart-total');

let cart = [];
let expandedCardId = null;


async function loadCategories() {
  try {
    const res = await fetch('https://openapi.programming-hero.com/api/categories');
    const data = await res.json();

    categoryList.innerHTML = `
      <li>
        <button 
          onclick="setActiveCategory(this); loadAllPlants();" 
          class="w-full text-left px-3 py-2 rounded-lg bg-green-700 text-white font-medium"
        >
          All Trees
        </button>
      </li>
    `;

    data.categories.forEach(cat => {
      const categoryName = cat.category || cat.category_name || cat.name || "Unknown";
      const li = document.createElement('li');
      li.innerHTML = `
        <button 
          onclick="setActiveCategory(this); loadPlantsByCategory(${cat.id});" 
          class="w-full text-left px-3 py-2 rounded-lg text-gray-800 hover:bg-green-100 transition"
        >
          ${categoryName}
        </button>
      `;
      categoryList.appendChild(li);
    });

  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function setActiveCategory(button) {
  document.querySelectorAll('#category-list button').forEach(btn => {
    btn.classList.remove('bg-green-700', 'text-white', 'font-medium');
    btn.classList.add('text-gray-800');
  });
  button.classList.add('bg-green-700', 'text-white', 'font-medium');
  button.classList.remove('text-gray-800');
}

async function loadAllPlants() {
  try {
    const res = await fetch('https://openapi.programming-hero.com/api/plants');
    const data = await res.json();
    displayPlants(data.plants);
  } catch (error) {
    console.error("Error loading all plants:", error);
  }
}


async function loadPlantsByCategory(id) {
  try {
    const res = await fetch(`https://openapi.programming-hero.com/api/category/${id}`);
    const data = await res.json();
    displayPlants(data.data);
  } catch (error) {
    console.error("Error loading category plants:", error);
  }
}


function displayPlants(plants) {
  plantsContainer.innerHTML = '';

  plants.forEach(p => {
    const isExpanded = expandedCardId === p.id;

    const div = document.createElement('div');
    div.className = `
      bg-white rounded-2xl shadow transition-all duration-300 ease-in-out p-4 
      ${isExpanded ? 'col-span-2 scale-105 z-10' : 'hover:shadow-lg'}
    `;
    div.setAttribute('data-id', p.id);

    div.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="w-full object-cover rounded-lg mb-2 ${isExpanded ? 'h-64' : 'h-40'}">
      <h3 class="font-semibold text-lg">${p.name}</h3>
      <p class="text-sm text-gray-500 flex-grow mb-2">
        ${p.description.slice(0, isExpanded ? 180 : 60)}...
      </p>

      <div class="flex justify-between items-center mt-3">
        <span class="text-green-600 font-bold text-lg">৳${p.price}</span>
        <div class="flex gap-2">
          ${
            isExpanded
              ? `<button onclick="collapseCard()" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Close</button>`
              : `<button onclick="expandCard(${p.id})" class="text-sm text-green-600 underline">Details</button>`
          }
          <button onclick="addToCart('${p.name}', ${p.price})" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Add</button>
        </div>
      </div>
    `;

    plantsContainer.appendChild(div);
  });
}


function expandCard(id) {
  expandedCardId = id;
  loadAllPlants(); // reload to render with expanded state
}

function collapseCard() {
  expandedCardId = null;
  loadAllPlants(); // reset view
}

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCart();
}

function updateCart() {
  cartList.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.className = 'flex justify-between items-center bg-green-50 px-2 py-1 rounded';
    li.innerHTML = `
      <span>${item.name} × ${item.qty}</span>
      <button onclick="removeFromCart('${item.name}')" class="text-red-500">✖</button>
    `;
    cartList.appendChild(li);
  });

  cartTotal.textContent = `৳${total}`;
}


function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCart();
}

loadCategories();
loadAllPlants();
