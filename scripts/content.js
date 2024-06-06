// Function to convert an address to its 5-digit representation
function convertAddressTo5Digits(address) {
    // Assuming the address is a hexadecimal string starting with '0x'
    // and you want to take the last 5 characters after '0x'
    return address.slice(2).slice(-6).toLowerCase();
}

// Function to replace specific addresses with names in the page
const replaceAddressWithName = (element, processedAddressList) => {
 for (const [address, name] of Object.entries(processedAddressList)) {
    // Convert both the address and the href attribute to lowercase for case-insensitive comparison
    const lowerCaseAddress = address.toLowerCase();
    const lowerCaseHref = element.href.toLowerCase();

    // Check if the href attribute ends with the address
    if (lowerCaseHref.endsWith(lowerCaseAddress)) {
      console.log(`Matching: ${address} with ${name}`); // Debugging log
      element.textContent = name;
      console.log(`Replaced ${address} with ${name}`);
      break; // Stop checking once a match is found
    }
 }
};

// Function to process the addressList and return a promise
function processAddressList() {
  return new Promise((resolve, reject) => {
      chrome.storage.local.get(["addressList"], ({ addressList }) => {
          if (!addressList) {
              console.log("No addressList found in storage.");
              reject("No addressList found in storage.");
              return;
          }

          const processedAddressList = {};

          for (const [fullAddress, details] of Object.entries(addressList)) {
              const shortAddress = convertAddressTo5Digits(fullAddress);
              processedAddressList[shortAddress] = details.name;
          }

          console.log(processedAddressList);
          resolve(processedAddressList);
      });
  });
}


// Callback function to execute when mutations are observed
const mutationCallback = (mutationsList, observer) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Include both class selectors
                    node.querySelectorAll('a.chakra-link.custom-1fg3dzk, a.chakra-link').forEach(node => replaceAddressWithName(node, processedAddressList));
                }
            });
        }
    }
};

// Options for the mutation observer
const mutationOptions = {
    childList: true,
    subtree: true
};

// Function to observe and replace addresses as the page loads more content
function observeAndReplace(processedAddressList) {
  const observer = new MutationObserver(mutationCallback);
  observer.observe(document.body, { childList: true, subtree: true });

  function mutationCallback(mutationsList, observer) {
      for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
              mutation.addedNodes.forEach(node => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      node.querySelectorAll('a.chakra-link.custom-1fg3dzk, a.chakra-link').forEach(node => replaceAddressWithName(node, processedAddressList));
                  }
              });
          }
      }
  }
}

// Process the addressList before starting the mutation observer
processAddressList().then(processedAddressList => {
  // Now you can use processedAddressList in replaceAddressWithName
  // For example, call replaceAddressWithName for each link after the list is processed
  document.querySelectorAll('a.chakra-link.custom-1fg3dzk, a.chakra-link').forEach(node => replaceAddressWithName(node, processedAddressList));
  observeAndReplace(processedAddressList); // Pass processedAddressList to observeAndReplace
}).catch(error => {
  console.error("Failed to process address list:", error);
});
