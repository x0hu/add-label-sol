// Allow additional special characters such as $, +, ?, @, _, *, (, ), /, ", :, %, ', *, and spaces in the whitelist
const csvWhitelistRegex = /[^a-zA-Z0-9",.\-\s\u4E00-\u9FFF$+?@_*()\/":%'*]{1,100}/

// Solana address regex pattern
const addressRegex = /^[A-HJ-NP-Za-km-z1-9]{32,44}$/;

// Extend the nameRegex to include $, +, ?, @, _, *, (, ), /, ", :, %, ', *, and spaces and increase the length limit if needed
const nameRegex = /^[a-zA-Z0-9,.\-\s\u4E00-\u9FFF$+?@_*()\/":%'*]{1,100}$/;

const generateTable = (addressList) => {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // thead
<<<<<<< HEAD
  const tr = document.createElement("tr");
  for (const header of ["address", "name"]) {
    const th = document.createElement("th");
    th.textContent = header;
    tr.appendChild(th);
=======
  const tr = document.createElement("tr")

  for (const header of ["address", "name"]) {
    const th = document.createElement("th")
    th.textContent = header
    tr.appendChild(th)
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
  }
  thead.appendChild(tr);

  // tbody
<<<<<<< HEAD
  for (const [address, name] of Object.entries(addressList)) {
    const tr = document.createElement("tr");
    for (const text of [address, name]) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
=======
  for (const [address, { name }] of Object.entries(addressList)) {
    const tr = document.createElement("tr")

    for (const text of [address, name]) {
      const td = document.createElement("td")
      td.textContent = text
      tr.appendChild(td)
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
    }
    tbody.appendChild(tr);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  table.className = "table is-bordered is-fullwidth is-size-7";
  return table;
};

// Add this new function
const filterAddressList = (addressList, filter) => {
  const filteredList = {};
  for (const [address, data] of Object.entries(addressList)) {
    if (address.includes(filter) || data.name.toLowerCase().includes(filter.toLowerCase())) {
      filteredList[address] = data;
    }
  }
  return filteredList;
}

const toastMsg = (msg, isError) => {
  Toastify({
    text: msg,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    style: {
      background: isError ? "red" : undefined,
    },
  }).showToast();
};

const csvToJSON = (csv) => {
  if (csvWhitelistRegex.test(csv)) {
    console.error("CSV contains invalid characters");
    return false;
  }

  let jsonObj = {};
  const rows = csv.split(/\r\n|\n|\r/).filter(row => row.trim() !== '');

<<<<<<< HEAD
  // Skip the header row
  for (let i = 1; i < rows.length; i++) {
    const [address, name] = rows[i].split(',').map(item => item.trim());
    console.log(`Processing row: ${address}, ${name}`); // Debug log

    if (address && name && addressRegex.test(address) && nameRegex.test(name)) {
      jsonObj[address] = name;
    } else {
      console.error(`Invalid row: ${rows[i]}`); // Debug log
      if (!addressRegex.test(address)) {
        console.error(`Invalid address: ${address}`);
      }
      if (!nameRegex.test(name)) {
        console.error(`Invalid name: ${name}`);
=======
  rows.slice(1).forEach((row) => {
    const [address, name] = row.split(",")
    const _address = address?.replaceAll('"', "").toLowerCase()
    const _name = name?.replaceAll('"', "")
    if (_address?.match(addressRegex) && _name?.match(nameRegex)) {
      jsonObj[_address] = {
        name: _name,
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
      }
    }
  }

  console.log("Parsed JSON object:", jsonObj); // Debug log
  return Object.keys(jsonObj).length > 0 ? jsonObj : false;
};

const jsonToCsv = (jsonObj) => {
<<<<<<< HEAD
  let csvString = "address,name\n";
  for (const [address, name] of Object.entries(jsonObj)) {
    csvString += `${address},${name}\n`;
=======
  let csvString = "address,name\n"

  // Convert the object to an array of [address, name] pairs
  const entries = Object.entries(jsonObj).map(([address, { name }]) => [address, name]);

  // Custom sorting function
  const customSort = (a, b) => {
    const nameA = a[1].toLowerCase();
    const nameB = b[1].toLowerCase();

    // If both names start with '@', sort them alphabetically
    if (nameA.startsWith('@') && nameB.startsWith('@')) {
      return nameA.localeCompare(nameB);
    }

    // If only one name starts with '@', put it first
    if (nameA.startsWith('@')) return -1;
    if (nameB.startsWith('@')) return 1;

    // For other cases, use standard alphabetical sorting
    return nameA.localeCompare(nameB);
  };

  // Sort the entries
  entries.sort(customSort);

  // Create the CSV string from the sorted entries
  for (const [address, name] of entries) {
    csvString += `${address},${name}\n`
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
  }
  return csvString;
};

// Add this debounce function at the top of the file
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

document.addEventListener("DOMContentLoaded", () => {
  const inputFile = document.getElementById("input-file");
  const inputAddress = document.getElementById("input-address");
  const inputName = document.getElementById("input-name");
  const checkboxAutoScan = document.getElementById("input-checkbox-auto-scan");
  const btnImport = document.getElementById("btn-import");
  const btnExport = document.getElementById("btn-export");
  const btnSubmit = document.getElementById("btn-submit");
  const btnClean = document.getElementById("btn-clean");
  const boxAddressList = document.getElementById("address-list");
  const searchInput = document.getElementById("search-input");
  
  // Function to save input values
  function saveInputs() {
    chrome.storage.local.set({
      'partialAddress': inputAddress.value,
      'partialName': inputName.value
    });
  }

  // Function to load saved input values
  function loadSavedInputs() {
    chrome.storage.local.get(['partialAddress', 'partialName'], (result) => {
      if (result.partialAddress) inputAddress.value = result.partialAddress;
      if (result.partialName) inputName.value = result.partialName;
    });
  }

  // Load saved inputs when popup opens
  loadSavedInputs();

  // Save inputs as user types
  inputAddress.addEventListener('input', saveInputs);
  inputName.addEventListener('input', saveInputs);

<<<<<<< HEAD
  searchInput.addEventListener("input", () => {
    const table = document.getElementById("address-list").getElementsByTagName("table")[0];
    searchTable(searchInput, table);
  });
=======
  // Replace the existing search input event listener with this
  searchInput.addEventListener("input", debounce(() => {
    const filter = searchInput.value.trim();
    if (filter.length > 0) {
      chrome.storage.local.get(["addressList"], ({ addressList }) => {
        const filteredList = filterAddressList(addressList, filter);
        boxAddressList.innerHTML = "";
        boxAddressList.appendChild(generateTable(filteredList));
      });
    } else {
      boxAddressList.innerHTML = "";
    }
  }, 300));
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52

  // onChange event - Input file
  inputFile.addEventListener("change", () => {
    btnImport.disabled = !inputFile?.files?.length;
  });

  // Import
  btnImport.addEventListener("click", () => {
    const file = inputFile?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const addressList = csvToJSON(e.target.result);
      if (addressList) {
        chrome.storage.local.set({ addressList: addressList }, () => {
          boxAddressList.innerHTML = "";
          boxAddressList.appendChild(generateTable(addressList));
          toastMsg("CSV File Uploaded!");
        });
      } else {
        console.error("CSV parsing failed:", e.target.result); // Debug log
        toastMsg("CSV File format Invalid", true);
      }
    };
    reader.onerror = (e) => {
      console.error("FileReader error:", e);
      toastMsg("CSV File Import Failed", true);
    };
    reader.readAsText(file);
  });

  // Export
  btnExport.addEventListener("click", () => {
    chrome.storage.local.get(["addressList"], ({ addressList }) => {
      const csvString = jsonToCsv(addressList);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "address-list.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  });

  // Submit
  btnSubmit.addEventListener("click", () => {
<<<<<<< HEAD
    const address = inputAddress.value.trim();
    const name = inputName.value.trim();
=======
    const address = inputAddress.value.toString()
    const name = inputName.value.toString()
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52

    if (!addressRegex.test(address) || !nameRegex.test(name)) {
      toastMsg("Invalid Address Or Name", true);
      return;
    }

<<<<<<< HEAD
    chrome.storage.local.get(["addressList"], ({ addressList = {} }) => {
      addressList[address] = name;
      chrome.storage.local.set({ addressList: addressList }, () => {
        boxAddressList.innerHTML = "";
        boxAddressList.appendChild(generateTable(addressList));
        toastMsg("New Address Added!");
        
        // Clear inputs and saved partial inputs after successful submission
        inputAddress.value = '';
        inputName.value = '';
        chrome.storage.local.remove(['partialAddress', 'partialName']);
      });
    });
  });

  // Clean
  btnClean.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all addresses?")) {
      chrome.storage.local.remove(["addressList", "partialAddress", "partialName"], () => {
        boxAddressList.innerHTML = "";
        inputAddress.value = '';
        inputName.value = '';
        toastMsg("Address List Cleaned!");
      });
    }
  });
  
  // Search table
  const searchTable = (input, table) => {
    const filter = input.value.toUpperCase();
=======
    chrome.storage.local.get(["addressList"], ({ addressList }) => {
      if (!addressList) addressList = {}
      addressList[address.toLowerCase()] = { name }

      chrome.storage.local.set({ addressList: addressList }, () => {
        boxAddressList.innerHTML = ""
        boxAddressList.appendChild(generateTable(addressList))
        toastMsg("New Address Added!")
        
        // Clear inputs and saved partial inputs after successful submission
        inputAddress.value = ''
        inputName.value = ''
        chrome.storage.local.remove(['partialAddress', 'partialName'])
      })
    })
  })

  // Clean
  btnClean.addEventListener("click", () => {
    const result = confirm("Are you sure?")
    if (!result) return

    chrome.storage.local.remove(["addressList", "partialAddress", "partialName"], () => {
      boxAddressList.innerHTML = ""
      inputAddress.value = ''
      inputName.value = ''
      toastMsg("Address List Cleaned!")
    })
  })

  // searchtable
  const searchTable = (searchInput, table) => {
    const filter = searchInput.value.toUpperCase();
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
    const rows = table.getElementsByTagName("tr");
  
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName("td");
      let match = false;
      for (let j = 0; j < cells.length; j++) {
        if (cells[j].textContent.toUpperCase().indexOf(filter) > -1) {
          match = true;
          break;
        }
      }
      rows[i].style.display = match ? "" : "none";
    }
  };

  // Checkbox auto scan
  checkboxAutoScan.addEventListener("change", () => {
    chrome.storage.local.set({ isAutoScan: checkboxAutoScan.checked });
    toastMsg(checkboxAutoScan.checked ? "Enable Auto Scan" : "Disable Auto Scan");
  });

  // Modify the Default display section
  chrome.storage.local.get(
<<<<<<< HEAD
    ["addressList", "isAutoScan"],
    ({ addressList, isAutoScan }) => {
      if (addressList) boxAddressList.appendChild(generateTable(addressList));
      if (isAutoScan) checkboxAutoScan.checked = true;
=======
    ["isAutoScan"],
    ({ isAutoScan }) => {
      try {
        if (isAutoScan) checkboxAutoScan.checked = true;
        // Remove the initial table generation
      } catch (e) {
        console.error("[Address Tagger] Display address", e);
        toastMsg("Display address error", true);
      }
>>>>>>> cccc3c5a463a361878edda7c4bf4dab913dc8b52
    }
  );
});