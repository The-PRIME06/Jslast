const KEY = "users";
const defaultImg = "https://thumbs.dreamstime.com/b/scenic-limassol-seafront-modern-skyscrapers-background-typical-sunny-day-cyprus-469976939.jpg";
const box = document.querySelector(".main-list");
const form = document.getElementById("add-form");
let users = [];

function save() {
  sessionStorage.setItem(KEY, JSON.stringify(users));
}

async function load() {
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    users = JSON.parse(saved);
    return;
  }

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await res.json();
    
    users = data.map((u) => ({
      id: u.id,
      img: defaultImg,
      name: u.name,
      username: u.username,
      email: u.email,
      adress: { city: u.address ? u.address.city : "Noma'lum" },
    }));
    save();
  } catch (error) {
    console.log("xatolik yuz berdi", error);
  }
}

function render() {
  if (!box) return;
  box.innerHTML = users.map((i) => `
    <li class="main-list__item">
      <img class="cart-img" src="${i.img || defaultImg}" alt="${i.name}">
      <ul class="cart-ul">
        <li>Name: ${i.name}</li>
        <li>Username: ${i.username}</li>
        <li>Email: ${i.email}</li>
        <li>Address: ${i.adress?.city}</li>
        <li>
          <button class="cart-btn delete-btn" data-id="${i.id}">Delete</button>
          <button class="cart-btn edit-btn" data-id="${i.id}">Edit</button>
        </li>
      </ul>
    </li>`).join("");
}

if (box) {
  load().then(render);

  box.addEventListener("click", (e) => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains("delete-btn")) {
      users = users.filter((u) => u.id !== id);
      save();
      render();
    }

    if (e.target.classList.contains("edit-btn")) {
      window.location.href = `./add.html?edit=${id}`;
    }
  });
}

if (form) {
  const editId = Number(new URLSearchParams(window.location.search).get("edit"));

  load().then(() => {
    if (editId) {
      const user = users.find((u) => u.id === editId);
      if (user) {
        form.image.value = user.img || defaultImg;
        form.name.value = user.name;
        form.username.value = user.username;
        form.email.value = user.email;
        form.address.value = user.adress?.city;

        document.getElementById("form-title").textContent = "Edit user";
        document.getElementById("submit-btn").textContent = "Save";
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const userData = {
      img: data.get("image") || defaultImg,
      name: data.get("name"),
      username: data.get("username"),
      email: data.get("email"),
      adress: { city: data.get("address") },
    };

    if (editId) {
      users = users.map((u) => (u.id === editId ? { ...u, ...userData } : u));
    } else {
      users.push({ id: Date.now(), ...userData });
    }

    save();
    window.location.href = "./index.html";
  });
}