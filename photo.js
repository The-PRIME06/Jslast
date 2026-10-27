const KEY = "photos";
const defaultImg = "https://thumbs.dreamstime.com/b/scenic-limassol-seafront-modern-skyscrapers-background-typical-sunny-day-cyprus-469976939.jpg";
const box = document.querySelector(".photo-list");
const form = document.getElementById("add-form");
let photos = [];

function save() {
  sessionStorage.setItem(KEY, JSON.stringify(photos));
}

async function load() {
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    photos = JSON.parse(saved);
    return;
  }

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/photos");
    const data = await res.json();
    
    
    photos = data.slice(0, 20).map((u) => ({
      id: u.id,
      img: u.url || defaultImg,
      name: u.title, // Photos'da name yo'q, shuning uchun title'ni name sifatida olamiz
    }));
    save();
  } catch (error) {
    console.log("xatolik yuz berdi", error);
  }
}

function render() {
  if (!box) return;
  box.innerHTML = photos.map((i) => `
    <li class="photos-list__item">
      <img class="cart-img" src="${i.img || defaultImg}" alt="${i.name}">
      <ul class="cart-ul">
        <li>Name: ${i.name}</li>
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
      photos = photos.filter((u) => u.id !== id);
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
      const photoItem = photos.find((u) => u.id === editId);
      if (photoItem) {

        if (form.image) form.image.value = photoItem.img || defaultImg;
        if (form.name) form.name.value = photoItem.name;

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
    };

    if (editId) {
      photos = photos.map((u) => (u.id === editId ? { ...u, ...photoData } : u));
    } else {
      photos.push({ id: Date.now(), ...photoData });
    }

    save();
    window.location.href = "./photo.html";
  });
}