const KEY = "posts";
const defaultImg = "https://thumbs.dreamstime.com/b/scenic-limassol-seafront-modern-skyscrapers-background-typical-sunny-day-cyprus-469976939.jpg";
const box = document.querySelector(".post-list");
const form = document.getElementById("add-form");
let posts = [];

function save() {
  sessionStorage.setItem(KEY, JSON.stringify(posts));
}

async function load() {
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    posts = JSON.parse(saved);
    return;
  }

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await res.json();
    
    
    posts = data.slice(0, 20).map((u) => ({
      id: u.id,
      img: u.url || defaultImg,
      name: u.title, 
      body: u.body,
    }));
    save();
  } catch (error) {
    console.log("xatolik yuz berdi", error);
  }
}

function render() {
  if (!box) return;
  box.innerHTML = posts.map((i) => `
    <li class="post-list__item">
      <img class="cart-img" src="${i.img || defaultImg}" alt="${i.name}">
      <ul class="cart-ul">
        <li>Name: ${i.name}</li>
         <li>Body: ${i.body}</li>

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
      posts = posts.filter((u) => u.id !== id);
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
      const photoItem = posts.find((u) => u.id === editId);
      if (photoItem) {

        if (form.image) form.image.value = photoItem.img || defaultImg;
        if (form.name) form.name.value = photoItem.name;
         if (form.body) form.body.value = photoItem.body;

        const formTitle = document.getElementById("form-title");
        const submitBtn = document.getElementById("submit-btn");
        if (formTitle) formTitle.textContent = "Edit photo";
        if (submitBtn) submitBtn.textContent = "Save";
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const photoData = {
      img: data.get("image") || defaultImg,
      name: data.get("name"),
      body: data.get("body"),
    };

    if (editId) {
      posts = posts.map((u) => (u.id === editId ? { ...u, ...photoData } : u));
    } else {
      posts.push({ id: Date.now(), ...photoData });
    }

    save();
    window.location.href = "./posts.html";
  });
}