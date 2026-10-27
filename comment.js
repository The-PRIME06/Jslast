const KEY = "comments";
const defaultImg = "https://thumbs.dreamstime.com/b/scenic-limassol-seafront-modern-skyscrapers-background-typical-sunny-day-cyprus-469976939.jpg";
const box = document.querySelector(".comment-list");
const form = document.getElementById("add-form");
let comments = [];

function save() {
  sessionStorage.setItem(KEY, JSON.stringify(comments));
}

async function load() {
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    comments = JSON.parse(saved);
    return;
  }

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/comments");
    const data = await res.json();
    
    
    comments= data.slice(0, 20).map((u) => ({
      id: u.id,
      img: u.url || defaultImg,
      name: u.name, 
      email: u.email ,
      body: u.body ,
    }));
    save();
  } catch (error) {
    console.log("xatolik yuz berdi", error);
  }
}

function render() {
  if (!box) return;
  box.innerHTML = comments.map((i) => `
    <li class="comments-list__item">
      <img class="cart-img" src="${i.img || defaultImg}" alt="${i.name}">
      <ul class="cart-ul">
        <li>Name: ${i.name}</li>
         <li>Email: ${i.email}</li>
         <li>body: ${i.body}</li>
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
      comments = comments.filter((u) => u.id !== id);
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
      const comItem = comments.find((u) => u.id === editId);
      if (comItem) {

        if (form.image) form.image.value = comItem.img || defaultImg;
        if (form.name) form.name.value = comItem.name;
        if (form.email) form.email.value = comItem.email;
         if (form.body) form.body.value = comItem.body;

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
    const comData = {
      img: data.get("image") || defaultImg,
      name: data.get("name"),
      email:data.get("email"),
      body: data.get("body")
    };

    if (editId) {
      comments = comments.map((u) => (u.id === editId ? { ...u, ...comData } : u));
    } else {
      comments.push({ id: Date.now(), ...comData });
    }

    save();
    window.location.href = "./comment.html";
  });
}