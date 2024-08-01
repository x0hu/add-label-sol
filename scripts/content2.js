// Function to convert an address to its 5-digit representation
function convertAddressTo5Digits(address) {
  return address.slice(2).slice(-6).toLowerCase();
}

// Encapsulate the functions within a closure
const addressReplacementModule = (function() {
  // Function to replace specific addresses with names in the page
  function replaceAddressWithName(processedAddressList) {
    const linkElements = document.querySelectorAll('a.chakra-link.custom-1hhf88o');
    const textElements = document.querySelectorAll('span.chakra-text.custom-17xn0nd');

    linkElements.forEach((linkElement, index) => {
      const textElement = textElements[index];
      const address = linkElement.href.split('/').pop().toLowerCase();
      const shortAddress = convertAddressTo5Digits(address);

      if (processedAddressList.hasOwnProperty(shortAddress)) {
        const name = processedAddressList[shortAddress];
        linkElement.textContent = name;
        if (textElement) {
          textElement.textContent = name;
        }
      }
    });
  }

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

  // Process the addressList and replace addresses on the page
  processAddressList()
    .then(processedAddressList => {
      replaceAddressWithName(processedAddressList);

      // Observe for future mutations and replace addresses
      const observer = new MutationObserver(() => {
        replaceAddressWithName(processedAddressList);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    })
    .catch(error => {
      console.error("Failed to process address list:", error);
    });

  // Return an object with the public functions
  return {
    replaceAddressWithName,
    processAddressList
  };
})();
