let countriesData = [];

const API_URL =
  "https://restcountries.com/v3.1/all?fields=name,flags,capital,region,subregion,population,languages,currencies,cca2,cca3";

fetch(API_URL)
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch countries");
    return res.json();
  })
  .then((data) => {
    countriesData = data.sort((a, b) => {
      return a.name.common.localeCompare(b.name.common);
    });
    console.log("Fetched Countries:", countriesData);

    populateRegionFilter();
    displayAllFlags();
  })
  .catch((err) => console.error(err));

/* ------------------ CONVERTS THE TEXT TO LOWERCASE ------------------ */

function normalize(str) {
  return str ? str.toLowerCase().trim() : "";
}

/* ------------------ REGION FILTER ------------------ */

function populateRegionFilter() {
  const filterSelectEl = document.getElementById("filter-select");

  filterSelectEl.innerHTML = '<option value=""  selected>All Regions</option>';

  const regions = [
    ...new Set(countriesData.map((c) => c.region).filter(Boolean)),
  ].sort();

  regions.forEach((region) => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    filterSelectEl.appendChild(option);
  });
}

//------------------ FILTER AND DISPLAY FLAGS ------------------ */
function displayAllFlags(region = "", searchTerm = "") {
  let container = document.getElementById("flags-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "flags-container";
    document.body.appendChild(container);
  }

  container.innerHTML = "";

  const regionNorm = normalize(region);
  const searchNorm = normalize(searchTerm);

  const filteredCountries = countriesData.filter((country) => {
    const regionMatch = regionNorm
      ? normalize(country.region) === regionNorm
      : true;

    const searchMatch = searchNorm
      ? normalize(country.name?.common).includes(searchNorm) ||
        normalize(country.capital?.[0]).includes(searchNorm)
      : true;

    return regionMatch && searchMatch;
  });

  filteredCountries.forEach((country) => {
    const card = document.createElement("div");
    card.id = "country-details";

    card.innerHTML = `
      <img 
        src="${country.flags?.svg || country.flags?.png}" 
        alt="Flag of ${country.name?.common}" 
        style="width:120px; height:70px; margin: 10px;"
      />

      <p style="font-size: 20px;"><strong>${country.name?.common}</strong></p>
      <p><strong>Capital : </strong>${country.capital?.[0] || "N/A"}</p>
      <p><strong>Region : </strong>${country.region || "N/A"}</p>
      <p><strong>Population : </strong>${
        country.population?.toLocaleString() || "N/A"
      }</p>
    `;

    card.addEventListener("click", () => {
      openDetailsModal(country);
    });

    container.appendChild(card);
  });
}

/* ------------------ EVENTS ------------------ */

document.getElementById("filter-select").addEventListener("change", (e) => {
  const region = e.target.value;
  const searchValue = document.querySelector(".search-container input").value;
  displayAllFlags(region, searchValue);
});

document.querySelector(".search-container input").addEventListener(
  "input",
  debounce((e) => {
    const searchTerm = e.target.value;
    const region = document.getElementById("filter-select").value;
    displayAllFlags(region, searchTerm);
  }, 300)
);

/* ------------------ SORT BY SELECTION ------------------ */

document.getElementById("sort-by").addEventListener("change", (e) => {
  const sortValue = e.target.value;
  const region = document.getElementById("filter-select").value;
  const searchValue = document.querySelector(".search-container input").value;

  applySorting(sortValue);
  displayAllFlags(region, searchValue);
});

function applySorting(sortBy) {
  if (sortBy === "a-z") {
    countriesData.sort((a, b) => a.name.common.localeCompare(b.name.common));
  } else if (sortBy === "z-a") {
    countriesData.sort((a, b) => b.name.common.localeCompare(a.name.common));
  } else if (sortBy === "least-population") {
    countriesData.sort((a, b) => a.population - b.population);
  } else if (sortBy === "most-population") {
    countriesData.sort((a, b) => b.population - a.population);
  }
}

/* ------------------ DEBOUNCE ------------------ */

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function toggleTheme() {
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-theme");

  if (currentTheme === "dark") {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
}

/* ------------------ DETAILS MODAL ------------------ */
const overlay = document.getElementById("details-overlay");
const closeBtn = document.getElementById("close-details");

function openDetailsModal(country) {
  document.getElementById("details-flag").src =
    country.flags?.svg || country.flags?.png;

  document.getElementById("details-name").textContent = country.name.common;

  document.getElementById("details-capital").textContent =
    country.capital?.[0] || "N/A";

  document.getElementById("details-region").textContent =
    country.region || "N/A";

  document.getElementById("details-subregion").textContent =
    country.subregion || "N/A";

  document.getElementById("details-population").textContent =
    country.population.toLocaleString();

  document.getElementById("details-languages").textContent = country.languages
    ? Object.values(country.languages).join(", ")
    : "N/A";

  document.getElementById("details-currencies").textContent = country.currencies
    ? Object.values(country.currencies)
        .map((c) => c.name)
        .join(", ")
    : "N/A";

  document.getElementById("details-cca2").textContent = country.cca2;
  document.getElementById("details-cca3").textContent = country.cca3;

  overlay.classList.remove("hidden");
}

/*------------------- TOGGLE THEME ------------------*/

closeBtn.addEventListener("click", closeModal);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) closeModal();
});

function closeModal() {
  overlay.classList.add("hidden");
}

function toggleTheme() {
  const root = document.documentElement;
  const icon = document.getElementById("theme-icon");

  if (root.getAttribute("data-theme") === "dark") {
    root.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
    icon.src = "dark_mode.svg"; // show moon
  } else {
    root.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
    icon.src = "light_mode.svg"; // show sun
  }
}

(function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const icon = document.getElementById("theme-icon");

  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (icon) icon.src = "./assets/light_mode.svg";
  } else {
    if (icon) icon.src = "./assets/dark_mode.svg";
  }
})();