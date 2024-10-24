// Function to process the addressList and return a promise
function processAddressListTruncated() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["addressList"], ({ addressList }) => {
      if (!addressList) {
        reject("No addressList found in storage.");
        return;
      }

      const processedList = Object.entries(addressList).map(([address, name]) => ({
        address: address,
        name: name,
        start: address.slice(0, 6),
        end: address.slice(-4)
      }));

      resolve(processedList);
    });
  });
}

// Function to replace truncated addresses with names
function replaceTruncatedAddress(element, addressList) {
  const truncatedAddress = element.textContent;
  const [start, end] = truncatedAddress.split('...');
  
  const match = addressList.find(item => 
    item.start === start && item.end === end
  );

  if (match) {
    element.textContent = match.name;
    element.title = match.address; // Set full address as title for reference
  }
}

// Process the addressList and replace truncated addresses on the page
processAddressListTruncated()
  .then(addressList => {
    function replaceAddresses() {
      document.querySelectorAll('span.chakra-text.custom-17xn0nd').forEach(element => {
        replaceTruncatedAddress(element, addressList);
      });
    }

    // Initial replacement
    replaceAddresses();

    // Observe for future mutations and replace addresses
    const observer = new MutationObserver((mutations) => {
      let shouldReplace = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList.contains('custom-17xn0nd') || 
                  node.querySelector('.custom-17xn0nd')) {
                shouldReplace = true;
              }
            }
          });
        }
      });
      if (shouldReplace) {
        replaceAddresses();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  })
  .catch(error => {
    console.error("Content2: Failed to process address list:", error);
  });