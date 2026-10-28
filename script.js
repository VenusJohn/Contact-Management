
const form = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const searchInput = document.getElementById("search");
const contactList = document.getElementById("contactList");
const count = document.getElementById("count");

// Singly linked list
class Node {
  constructor(contact) {
    this.contact = contact;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
  }

  add(contact) {
    const node = new Node(contact);
    if (!this.head) {
      this.head = node;
      return;
    }

    let current = this.head;
    while (current.next) current = current.next;
    current.next = node;
  }

  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.contact);
      current = current.next;
    }
    return result;
  }

  remove(id) {
    while (this.head && this.head.contact.id === id) {
      this.head = this.head.next;
      return true;
    }

    let current = this.head;
    while (current && current.next) {
      if (current.next.contact.id === id) {
        current.next = current.next.next;
        return true;
      }
      current = current.next;
    }
    return false;
  }
}

const contacts = new LinkedList();

// Restore contacts saved in this browser
try {
  const saved = JSON.parse(
    localStorage.getItem("myContacts") || "[]"
  );
  if (Array.isArray(saved)) {
    saved.forEach(c => {
      if (c && typeof c.id === "string" &&
          typeof c.name === "string" &&
          typeof c.phone === "string" &&
          typeof c.email === "string") {
        contacts.add(c);
      }
    });
  }
} catch {
  console.log("Could not load saved contacts.");
}

function saveContacts() {
  localStorage.setItem(
    "myContacts",
    JSON.stringify(contacts.toArray())
  );
}

function renderContacts() {
  const query = searchInput.value.trim().toLowerCase();
  const visible = contacts.toArray()
    .filter(c => c.name.toLowerCase().includes(query))
    .sort((a, b) => a.name.localeCompare(b.name));

  contactList.replaceChildren();
  count.textContent = `${visible.length} contact(s)`;

  if (!visible.length) {
    const message = document.createElement("p");
    message.className = "empty";
    message.textContent = "No contacts found.";
    contactList.appendChild(message);
    return;
  }

  visible.forEach(c => {
    const card = document.createElement("div");
    card.className = "contact";

    const details = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = c.name;

    const phone = document.createElement("p");
    phone.textContent = c.phone;

    const email = document.createElement("p");
    email.textContent = c.email;

    details.append(title, phone, email);

    const button = document.createElement("button");
    button.className = "delete";
    button.textContent = "Delete";
    button.addEventListener("click", () => {
      contacts.remove(c.id);
      saveContacts();
      renderContacts();
    });

    card.append(details, button);
    contactList.appendChild(card);
  });
}

form.addEventListener("submit", event => {
  event.preventDefault();

  const contact = {
    id: crypto.randomUUID(),
    name: nameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim()
  };

  if (!contact.name || !contact.phone || !contact.email) {
    alert("Please fill in all fields.");
    return;
  }

  contacts.add(contact);
  saveContacts();
  form.reset();
  renderContacts();
});

searchInput.addEventListener("input", renderContacts);

document.getElementById("sortBtn").addEventListener("click", () => {
  const sorted = contacts.toArray().sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  // Rebuild linked list in sorted order
  contacts.head = null;
  sorted.forEach(c => contacts.add(c));
  saveContacts();
  renderContacts();
});

renderContacts();
    