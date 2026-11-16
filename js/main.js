var productName = document.getElementById("productName");
var productPrice = document.getElementById("productPrice");
var productQuantity = document.getElementById("productQuantity");
var productDesc = document.getElementById("productDesc");
var productImage = document.getElementById("productImage");
var addProductBtn = document.getElementById("addProductBtn");
var updateProductBtn = document.getElementById("updateProductBtn");
var productList = [];
var ind = -1;
var currentList = [];   


if (localStorage.getItem("productList") != null) {
    productList = JSON.parse(localStorage.getItem("productList"));
}
displayProduct(productList);
clearForm();

function compressImage(file, maxWidth, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement("canvas");
            var scale = Math.min(1, maxWidth / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            callback(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function addProduct() {
    var product = {
        name: productName.value.trim(),
        price: productPrice.value,
        quantity: productQuantity.value,
        desc: productDesc.value.trim(),
        image: ""
    };

    if (!product.name) { alert("Enter a product name"); return; }

    if (productImage.files[0]) {
        compressImage(productImage.files[0], 150, function (base64) {
            product.image = base64;
            productList.push(product);
            localStorage.setItem("productList", JSON.stringify(productList));
            clearForm();
            displayProduct(productList);
        });
    } else {
        productList.push(product);
        localStorage.setItem("productList", JSON.stringify(productList));
        clearForm();
        displayProduct(productList);
    }
}

function clearForm() {
    productName.value = "";
    productPrice.value = "";
    productQuantity.value = "";
    productDesc.value = "";
    productImage.value = "";
}

function displayProduct(list) {
     currentList = list;  
    var cartona = ``;
    for (var i = 0; i < list.length; i++) {
        cartona += `<tr>
            <td>${i + 1}</td>
            <td>
                ${list[i].image
                    ? `<img src="${list[i].image}" width="50" height="50" style="object-fit:cover;border-radius:5px;">`
                    : "—"}
            </td>
            <td>${list[i].newName ? list[i].newName : list[i].name}</td>
            <td>${list[i].price}</td>
            <td>${list[i].quantity}</td>
            <td>${list[i].desc}</td>
            <td><button onclick="getUpdateProduct(${i})" class="btn btn-warning">Update</button></td>
            <td><button onclick="deleteProduct(${i})" class="btn btn-danger">Delete</button></td>
        </tr>`;
    }
    document.getElementById("tBody").innerHTML = cartona;
}

function deleteProduct(index) {
    productList.splice(index, 1);
    localStorage.setItem("productList", JSON.stringify(productList));
    displayProduct(productList);
}

function searchProduct(term) {
    var field = document.getElementById("searchField").value;
    var foundedItems = [];

    for (var i = 0; i < productList.length; i++) {
        var value = String(productList[i][field]).toLowerCase();

        if (value.includes(term.toLowerCase())) {
            // Highlight only when searching by name (HTML highlighting on price/quantity looks weird)
            if (field === "name") {
                productList[i].newName = productList[i].name.replace(
                    new RegExp(term, "gi"),
                    `<span class="text-danger">${term}</span>`
                );
            } else {
                delete productList[i].newName;
            }
            foundedItems.push(productList[i]);
        } else {
            delete productList[i].newName;
        }
    }

    displayProduct(term ? foundedItems : productList);
}

function getUpdateProduct(index) {
    addProductBtn.classList.add("d-none");
    updateProductBtn.classList.replace("d-none", "d-block");

    productName.value = productList[index].name;
    productPrice.value = productList[index].price;
    productQuantity.value = productList[index].quantity;
    productDesc.value = productList[index].desc;
    productImage.value = ""; 

    ind = index;
}

function updateProduct() {
    if (ind === -1) return;

    productList[ind].name     = productName.value.trim();
    productList[ind].price    = productPrice.value;
    productList[ind].quantity = productQuantity.value;
    productList[ind].desc     = productDesc.value.trim();

    if (productImage.files[0]) {
        compressImage(productImage.files[0], 150, function (base64) {
            productList[ind].image = base64;
            finishUpdate();
        });
    } else {
        finishUpdate();
    }

    function finishUpdate() {
        localStorage.setItem("productList", JSON.stringify(productList));
        addProductBtn.classList.replace("d-none", "d-block");
        updateProductBtn.classList.replace("d-block", "d-none");
        clearForm();
        displayProduct(productList);
        ind = -1;
    }
}

document.getElementById("searchField").addEventListener("change", function () {
    searchProduct(document.getElementById("searchInput").value);
});

function sortProduct(option) {
    if (!option) {
        displayProduct(currentList);   
        return;
    }

    var parts = option.split("-");
    var field = parts[0];
    var direction = parts[1];

    var sorted = currentList.slice();   

    sorted.sort(function (a, b) {
        var valA = a[field];
        var valB = b[field];

        if (field === "price" || field === "quantity") {
            valA = Number(valA) || 0;
            valB = Number(valB) || 0;
            return direction === "asc" ? valA - valB : valB - valA;
        } else {
            valA = String(valA).toLowerCase();
            valB = String(valB).toLowerCase();
            if (valA < valB) return direction === "asc" ? -1 : 1;
            if (valA > valB) return direction === "asc" ? 1 : -1;
            return 0;
        }
    });

    // displayProduct will update currentList itself
    displayProduct(sorted);
}


function updateClock() {
    var now = new Date();

    var dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    document.getElementById("liveDate").textContent =
        now.toLocaleDateString("en-GB", dateOptions);

    // Time: e.g. "14:05:09" (24-hour)
    var h = String(now.getHours()).padStart(2, "0");
    var m = String(now.getMinutes()).padStart(2, "0");
    var s = String(now.getSeconds()).padStart(2, "0");
    document.getElementById("liveClock").textContent = `${h}:${m}:${s}`;
}

updateClock();                  
setInterval(updateClock, 1000); 