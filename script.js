document.addEventListener("DOMContentLoaded", function() {
  // Изменение шапки при скролле
  const header = document.querySelector(".header");

  function checkScroll() {
    if (window.scrollY > 100) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  checkScroll();
  window.addEventListener("scroll", checkScroll);

  // Мобильное меню
  const mobileToggle = document.querySelector(".mobile-toggle");
  const navMenu = document.querySelector(".nav-menu");

  mobileToggle.addEventListener("click", function() {
    this.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Табы меню и фильтрация по категориям
  const menuTabs = document.querySelectorAll(".menu-tab");
  const menuItems = document.querySelectorAll(".menu-item");

  function animateItems(items) {
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add("show");
      }, index * 50);
    });
  }

  function filterMenu(category) {
    menuItems.forEach(item => {
      item.classList.remove("show");
      setTimeout(() => {
        item.style.display = "none";
      }, 300);
    });

    setTimeout(() => {
      let itemsToShow = [];

      if (category === "Все") {
        itemsToShow = Array.from(menuItems);
      } else {
        itemsToShow = Array.from(menuItems).filter(item => {
          const itemCategory = item.querySelector(".menu-item-category").textContent.trim();
          return itemCategory === category ||
                 (category === "Хот-доги" && itemCategory.includes("хот дог")) ||
                 (category === "Соусы" && itemCategory.includes("соус"));
        });
      }

      itemsToShow.forEach(item => {
        item.style.display = "block";
      });

      animateItems(itemsToShow);
    }, 300);
  }

  menuTabs.forEach(tab => {
    tab.addEventListener("click", function() {
      menuTabs.forEach(t => t.classList.remove("active"));
      this.classList.add("active");

      const category = this.textContent.trim();
      filterMenu(category);
    });
  });

  setTimeout(() => {
    menuItems.forEach(item => {
      item.style.display = "block";
    });
    animateItems(menuItems);
  }, 300);

  // Плавная прокрутка
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      if (this.getAttribute("href") === "#") return;

      const targetElement = document.querySelector(this.getAttribute("href"));
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth"
        });

        if (navMenu.classList.contains("active")) {
          mobileToggle.classList.remove("active");
          navMenu.classList.remove("active");
        }
      }
    });
  });

  // Корзина
  const cartModal = document.getElementById("cartModal");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalPrice = document.getElementById("cartTotalPrice");
  const orderTotal = document.getElementById("orderTotal");
  const closeModal = document.querySelector(".close-modal");
  const cartIcon = document.querySelectorAll(".cart-icon");
  const cartCount = document.querySelector(".cart-count");
  const checkoutForm = document.getElementById("checkoutForm");
  const orderTypeBtns = document.querySelectorAll(".order-type-btn");
  const addressGroup = document.getElementById("addressGroup");
  const pickupGroup = document.getElementById("pickupGroup");
  const paymentMethods = document.querySelectorAll(".payment-method");
  const submitOrder = document.getElementById("submitOrder");

  let cart = [];
  let totalPrice = 0;
  let orderType = "delivery";
  let paymentMethod = "cash";

  cartIcon.forEach(icon => {
    icon.addEventListener("click", function(e) {
      e.preventDefault();
      updateCartModal();
      cartModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  closeModal.addEventListener("click", function() {
    cartModal.style.display = "none";
    document.body.style.overflow = "auto";
  });

  window.addEventListener("click", function(e) {
    if (e.target === cartModal) {
      cartModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  // Выбор типа заказа
  orderTypeBtns.forEach(btn => {
    btn.addEventListener("click", function() {
      orderTypeBtns.forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      orderType = this.dataset.type;

      if (orderType === "delivery") {
        addressGroup.style.display = "block";
        pickupGroup.style.display = "none";
      } else {
        addressGroup.style.display = "none";
        pickupGroup.style.display = "block";
      }
    });
  });

  // Выбор способа оплаты
  paymentMethods.forEach(method => {
    method.addEventListener("click", function() {
      paymentMethods.forEach(m => m.classList.remove("active"));
      this.classList.add("active");
      paymentMethod = this.dataset.method;
    });
  });

  // Обновление корзины в модальном окне
  function updateCartModal() {
    cartItemsContainer.innerHTML = "";
    totalPrice = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="empty-cart">Ваша корзина пуста</div>';
      cartTotalPrice.textContent = "0 TJS";
      orderTotal.textContent = "0 TJS";
      submitOrder.disabled = true;
      return;
    }

    cart.forEach((item, index) => {
      const cartItemElement = document.createElement("div");
      cartItemElement.className = "cart-item";
      cartItemElement.innerHTML = `
        <div class="cart-item-image-container">
          <img src="${item.img}" alt="${item.name}" class="cart-item-image">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price} TJS</div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn minus" data-index="${index}">-</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-btn plus" data-index="${index}">+</button>
        </div>
        <div class="remove-item" data-index="${index}">
          <i class="fas fa-trash"></i>
        </div>
      `;
      cartItemsContainer.appendChild(cartItemElement);
      totalPrice += item.price * item.quantity;
    });

    cartTotalPrice.textContent = `${totalPrice} TJS`;
    orderTotal.textContent = `${totalPrice} TJS`;
    submitOrder.disabled = false;

    document.querySelectorAll(".quantity-btn.minus").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = parseInt(this.dataset.index);
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
          showToast(`Уменьшено количество "${cart[index].name}"`);
        } else {
          const removedItem = cart[index].name;
          cart.splice(index, 1);
          showToast(`Удалено "${removedItem}" из корзины`);
        }
        updateCart();
      });
    });

    document.querySelectorAll(".quantity-btn.plus").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = parseInt(this.dataset.index);
        cart[index].quantity++;
        showToast(`Увеличено количество "${cart[index].name}"`);
        updateCart();
      });
    });

    document.querySelectorAll(".remove-item").forEach(btn => {
      btn.addEventListener("click", function() {
        const index = parseInt(this.dataset.index);
        const removedItem = cart[index].name;
        cart.splice(index, 1);
        showToast(`Удалено "${removedItem}" из корзины`);
        updateCart();
      });
    });
  }

  function updateCart() {
    let count = 0;
    cart.forEach(item => {
      count += item.quantity;
    });

    cartCount.textContent = count;
    updateCartModal();
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCart();
    }
  }

  function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === "success" ? "check" : type === "error" ? "times" : "exclamation"}"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  checkoutForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const phoneInput = document.getElementById("phone");
    if (!phoneInput.checkValidity()) {
      showToast("Пожалуйста, введите корректный номер телефона (9 цифр)", "error");
      phoneInput.focus();
      return;
    }

    const name = document.getElementById("name").value;
    const phone = "+992" + document.getElementById("phone").value;
    const address = orderType === "delivery" 
      ? document.getElementById("address").value 
      : document.getElementById("pickupLocation").value;
    const comments = document.getElementById("comments").value;

    let message = `Новый заказ из SaFar:\n\n`;
    message += `Имя: ${name}\nТелефон: ${phone}\nТип заказа: ${orderType === "delivery" ? "Доставка" : "Самовывоз"}\nАдрес: ${address}\nСпособ оплаты: ${getPaymentMethodName(paymentMethod)}\nКомментарий: ${comments || "нет"}\n\nЗаказ:\n`;

    cart.forEach(item => {
      message += `${item.name} - ${item.quantity} x ${item.price} TJS = ${item.quantity * item.price} TJS\n`;
    });

    message += `\nИтого: ${totalPrice} TJS`;

    const botToken = "8491592583:AAGMhSt8TYXgbgpYkOdwzhSb8xMhfmlQgIs";
    const chatId = "6699477803";
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

    showToast("Отправляем ваш заказ...", "warning");

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          showToast("Ваш заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.");
          cart = [];
          updateCart();
          cartModal.style.display = "none";
          document.body.style.overflow = "auto";
          checkoutForm.reset();
        } else {
          showToast("Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.", "error");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        showToast("Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.", "error");
      });
  });

  function getPaymentMethodName(method) {
    switch(method) {
      case "cash": return "Наличные";
      case "ds": return "Душанбе Сити";
      case "alif": return "Алиф";
      default: return "Неизвестно";
    }
  }

  // Добавление товаров в корзину с фото
  const addButtons = document.querySelectorAll(".menu-item-btn");

  addButtons.forEach(button => {
    button.addEventListener("click", function() {
      const productCard = this.closest(".menu-item");
      const productName = productCard.querySelector(".menu-item-name").textContent;
      const productPrice = parseFloat(productCard.querySelector(".menu-item-price").textContent);

      let imgStyle = productCard.querySelector(".menu-item-img").style.backgroundImage;
      let productImg = imgStyle.slice(5, -2);

      const existingItemIndex = cart.findIndex(item => item.name === productName);

      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity++;
        showToast(`Добавлено еще "${productName}" в корзину`);
      } else {
        cart.push({
          name: productName,
          price: productPrice,
          quantity: 1,
          img: productImg
        });
        showToast(`"${productName}" добавлен в корзину`);
      }

      updateCart();

      this.style.transform = "scale(1.2)";
      setTimeout(() => {
        this.style.transform = "";
      }, 200);

      if (productImg) {
        const productImgElement = document.createElement("div");
        productImgElement.style.position = "fixed";
        productImgElement.style.width = "50px";
        productImgElement.style.height = "50px";
        productImgElement.style.borderRadius = "50%";
        productImgElement.style.backgroundImage = `url(${productImg})`;
        productImgElement.style.backgroundSize = "cover";
        productImgElement.style.backgroundPosition = "center";
        productImgElement.style.zIndex = "1000";

        const rect = productCard.getBoundingClientRect();
        productImgElement.style.top = rect.top + "px";
        productImgElement.style.left = rect.left + "px";
        productImgElement.className = "flying-item";

        document.body.appendChild(productImgElement);

        setTimeout(() => {
          productImgElement.remove();
        }, 600);
      }
    });
  });

  // Поиск по меню
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  searchInput.addEventListener("input", function() {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm.length === 0) {
      searchResults.classList.remove("active");
      return;
    }

    const matchingItems = Array.from(menuItems).filter(item => {
      const itemName = item.querySelector(".menu-item-name").textContent.toLowerCase();
      const itemDesc = item.querySelector(".menu-item-description").textContent.toLowerCase();
      const itemCategory = item.querySelector(".menu-item-category").textContent.toLowerCase();

      return itemName.includes(searchTerm) || 
             itemDesc.includes(searchTerm) || 
             itemCategory.includes(searchTerm);
    });

    searchResults.innerHTML = "";

    if (matchingItems.length > 0) {
      matchingItems.forEach(item => {
        const itemName = item.querySelector(".menu-item-name").textContent;
        const itemPrice = item.querySelector(".menu-item-price").textContent;
        const itemCategory = item.querySelector(".menu-item-category").textContent;

        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";
        resultItem.innerHTML = `
          <div>
            <div class="menu-item-category">${itemCategory}</div>
            <div class="menu-item-name">${itemName}</div>
          </div>
          <div class="menu-item-price">${itemPrice}</div>
        `;

        resultItem.addEventListener("click", function() {
          item.scrollIntoView({ behavior: "smooth", block: "center" });
          item.style.boxShadow = "0 0 0 3px rgba(231, 76, 60, 0.5)";
          setTimeout(() => { item.style.boxShadow = ""; }, 2000);

          searchResults.classList.remove("active");
          searchInput.value = "";
        });

        searchResults.appendChild(resultItem);
      });

      searchResults.classList.add("active");
    } else {
      searchResults.innerHTML = '<div class="no-results">Извините, но по вашему запросу ничего не найдено.</div>';
      searchResults.classList.add("active");
    }
  });

  document.addEventListener("click", function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove("active");
    }
  });

  // Кнопка "Наверх"
  const scrollToTopBtn = document.getElementById("scrollToTop");

  window.addEventListener("scroll", function() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.display = "flex";
    } else {
      scrollToTopBtn.style.display = "none";
    }
  });

  scrollToTopBtn.addEventListener("click", function() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  // Загрузка корзины при загрузке страницы
  loadCart();

  // Маска для телефона
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("input", function() {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
  });

  // Открытие корзины по клику на "Заказать онлайн"
  const openCartButtons = document.querySelectorAll(".open-cart");
  openCartButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault();
      updateCartModal();
      cartModal.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Логика для кнопки "Заказать доставку"
  const orderDeliveryButtons = document.querySelectorAll(".order-delivery");
  orderDeliveryButtons.forEach(button => {
    button.addEventListener("click", function(e) {
      e.preventDefault();
      if (cart.length === 0) {
        showToast("Ваша корзина пуста. Выберите товар.", "warning");
        document.querySelector("#menu").scrollIntoView({ behavior: "smooth" });
      } else {
        updateCartModal();
        cartModal.style.display = "flex";
        document.body.style.overflow = "hidden";
      }
    });
  });
});     