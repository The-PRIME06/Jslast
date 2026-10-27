const KEY = "todos";
const defaultImg = "https://thumbs.dreamstime.com/b/scenic-limassol-seafront-modern-skyscrapers-background-typical-sunny-day-cyprus-469976939.jpg";
const box = document.querySelector(".todo-list");
const form = document.getElementById("add-form");
let todos = [];

function save() {
  sessionStorage.setItem(KEY, JSON.stringify(todos));
}

async function load() {
  const saved = sessionStorage.getItem(KEY);
  if (saved) {
    todos = JSON.parse(saved);
    return;
  }

  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos");
    const data = await res.json();
    
    // XATO TO'G'RILANDI: posts o'rniga todos ishlatildi
    todos = data.slice(0, 20).map((u) => ({
      id: u.id,
      img: defaultImg, // Todo'da rasm yo'q, shuning uchun defaultImg beramiz
      name: u.title,   // Todoning title'ini name sifatida olamiz
      completed: u.completed
    }));
    
    save();
  } catch (error) {
    console.log("xatolik yuz berdi", error);
  }
}

function render() {
  if (!box) return;
  box.innerHTML = todos.map((i) => `
    <li class="todo-list__item">
      <img class="cart-img" src="${i.img || defaultImg}" alt="${i.name}">
      <ul class="cart-ul">
        <li>Name: ${i.name}</li>
        <li>Completed: ${i.completed}</li>
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
      todos = todos.filter((u) => u.id !== id);
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
      const todoItem = todos.find((u) => u.id === editId);
      if (todoItem) {
        if (form.image) form.image.value = todoItem.img || defaultImg;
        if (form.name) form.name.value = todoItem.name;
        if (form.completed) form.completed.value = todoItem.completed;

        const formTitle = document.getElementById("form-title");
        const submitBtn = document.getElementById("submit-btn");
        if (formTitle) formTitle.textContent = "Edit Todo";
        if (submitBtn) submitBtn.textContent = "Save";
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const todoData = {
      img: data.get("image") || defaultImg,
      name: data.get("name"),
      completed: data.get("completed"),
    };

    if (editId) {
      todos = todos.map((u) => (u.id === editId ? { ...u, ...todoData } : u));
    } else {
      todos.push({ id: Date.now(), ...todoData });
    }

    save();
    window.location.href = "./todos.html";
  });
}