const wineTypes = ["Riesling","Cava","Moscato","Merlot","Xinomavro","Shiraz"];

/* -- Classes -- */
class Wine {
    constructor(id,name,year,type,status) {
        this.id = id;
        this.name = name;
        this.year = year;
        this.type = type;
        this.status = status;
    }
}

class Collection {
    constructor() {
        this.wines = [];
        this.nextId = 1;
    }
    addWine(name,year,type,status) {
        const newWine = new Wine(this.nextId++,name,year,type,status);
        this.wines.push(newWine);
        this.saveCollection();
    }
    createRandomCollection(amt) {
        // creates a random collection based on amount
        // year range is 1900-2026
        this.wines = [];
        for (let i = 1; i <= amt; i++) {
            const randomYear = Math.floor(Math.random() * (2026 - 1900 + 1)) + 1900;
            const randomType = wineTypes[Math.floor(Math.random() * wineTypes.length)];
            const randomStatus = Math.random() < 0.5 ? "Open" : "Sealed";

            this.addWine(
                "Wine " + (this.nextId),
                randomYear,
                randomType,
                randomStatus
            );
        }
    }
    deleteWine(id) {
        this.wines = this.wines.filter(wine => wine.id != id);
        this.saveCollection();
    }
    editWine(id,updatedInfo) {
        const tempWine = this.wines.find(wine => wine.id === id);
        if (tempWine) {
            Object.assign(tempWine,updatedInfo);
            this.saveCollection();
        }
    }
    fillCollection(){
        // fills collection for CRUD project
        // either loads from local storage or generates randomly
        this.loadCollection();
        if (!this.wines || this.wines.length === 0) {
            this.createRandomCollection(30);
        }

    }
    getOneWine(id) {
        return this.wines.find(wine => wine.id === id);
    }
    getAllWines() {
        return this.wines;
    }
    loadCollection(){
        //loads collection from local storage
        const stored = localStorage.getItem("wineCollection");
        this.wines = stored ? JSON.parse(stored) : [];
        this.nextId = this.wines.length > 0 
            ? Math.max(...this.wines.map(w => w.id)) + 1 
            : 1;
    }
    saveCollection() {
        //saves collection to local storage
        localStorage.setItem("wineCollection",JSON.stringify(this.wines));
    }
}

/* -- Functions -- */
// Shows whole wine collection via table
function showCollection() {
    const wineTable = document.getElementById("wineTableBody");
    wineTable.innerHTML = "";

    // refreshes collection everytime collection is pulled up
    collection.getAllWines().forEach(wine => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${wine.name}</td>
            <td>${wine.year}</td>
            <td>${wine.type}</td>
            <td>${wine.status}</td>
            <td>
                <button class="editBtn">Edit</button>
                <button class="deleteBtn">Delete</button>
            </td>`;

        tr.querySelector(".editBtn").addEventListener("click", () => {
            populateForm(wine.id);
            showView("form-view");
        });

        tr.querySelector(".deleteBtn").addEventListener("click", () => {
            if (confirm("Delete this wine?")) {
                collection.deleteWine(wine.id);
                showCollection();
            }
        });
    
        wineTable.appendChild(tr);
    })
}

// Updates Stats
function updateStats() {
    // Stats of the inventory: total wines & percent of open wines
    const wines = collection.getAllWines();
    const total = wines.length;
    const opened = wines.filter(wine => wine.status === "Open").length;
    const percentOpen = total > 0 ? ((opened / total) * 100).toFixed(1) : 0;

    const statsHTML = `
        <li><strong>Total wines:</strong> ${total}</li>
        <li><strong>Opened wines:</strong> ${opened} (${percentOpen}%)</li>
    `;

    document.getElementById('stats-list').innerHTML = statsHTML;
}

// Updates Wine Types
function updateWineTypes() {
    const typeSelect = document.getElementById("type");
    typeSelect.innerHTML = "";

    wineTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}

// Populates Form with Wine Info
function populateForm(id) {
    const wine = collection.getOneWine(id);
    if (!wine) return;

    document.getElementById("name").value = wine.name;
    document.getElementById("year").value = wine.year;
    document.getElementById("type").value = wine.type;
    document.getElementById("status").value = wine.status;

    // store editing id on the form
    document.getElementById("wineForm").dataset.editingId = id;
}

// Clears Wine Form
function clearForm() {
    const form = document.getElementById("wineForm");
    
    form.reset();
    //removes edit mode
    delete form.dataset.editingId;
}

// Add/Edit Wine
document.getElementById("wineForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const form = e.target;
    const editingId = form.dataset.editingId;

    const name = document.getElementById("name").value;
    const year = parseInt(document.getElementById("year").value);
    const type = document.getElementById("type").value;
    const status = document.getElementById("status").value;

    if (editingId) {
        collection.editWine(parseInt(editingId), { name, year, type, status });
        delete form.dataset.editingId; // clear edit mode
    } else {
        collection.addWine(name, year, type, status);
    }

    form.reset();
    showCollection();
    showView("table-view");
});

document.getElementById("addBtn").addEventListener("click",() => {clearForm();});

/* View Handler */
// Switches between different views
function showView(viewId) {
    // Hide all views
    const views = document.querySelectorAll("#table-view, #form-view, #stats-view");
    views.forEach(div => div.style.display = "none");

    // Show the selected view
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
        if (viewId !== "form-view") clearForm();
        viewToShow.style.display = "block";
        const title = document.getElementById("page-view");

        if (viewId === "table-view") {
            showCollection();
            title.textContent = "Inventory"
        } else if (viewId === "stats-view") {
            updateStats();
            title.textContent = "Statistics"
        } else if (viewId === 'form-view') {
            title.textContent = "Add/Edit Wine";
        }

        setLastView(viewId);
    }
}

function setLastView(viewId) {
    localStorage.setItem("lastView", viewId);
}

function getLastView() {
    return localStorage.getItem("lastView") || "table-view";
}


/* Init */
const collection = new Collection();
updateWineTypes();
document.addEventListener("DOMContentLoaded", () => {
    collection.fillCollection();
    const lastView = getLastView();
    showView(lastView);
});