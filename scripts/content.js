// Function to convert an address to its 6-digit representation
function convertAddressTo6Digits(address) {
    return address.slice(-6).toLowerCase();
  }
  
  // Function to replace addresses with names
  function replaceAddressWithName(element, processedAddressList) {
    // For the first table structure (chakra-link)
    if (element.classList.contains('chakra-link')) {
        const fullAddress = element.href.split('/').pop().toLowerCase();
        if (processedAddressList.hasOwnProperty(fullAddress)) {
            const name = processedAddressList[fullAddress];
            if (element.textContent !== name) {
                element.textContent = name;
                element.dataset.originalAddress = fullAddress;
                
                // Update associated span if it exists
                const span = element.querySelector('span.chakra-text.custom-17xn0nd');
                if (span) {
                    span.textContent = name;
                }
            }
        }
    }
    
    // For the custom-17xn0nd elements (usually containing the truncated address)
    if (element.classList.contains('chakra-text') && element.classList.contains('custom-17xn0nd')) {
        const truncatedAddress = element.textContent;
        const parentLink = element.closest('a');
        if (parentLink) {
            const fullAddress = parentLink.href.split('/').pop().toLowerCase();
            if (processedAddressList.hasOwnProperty(fullAddress)) {
                const name = processedAddressList[fullAddress];
                if (element.textContent !== name) {
                    element.dataset.originalAddress = truncatedAddress;
                    element.textContent = name;
                    
                    // Update the parent link text as well
                    parentLink.textContent = name;
                    parentLink.dataset.originalAddress = fullAddress;
                }
            }
        }
    }
  
    // New condition for truncated addresses in the first column
    if (element.classList.contains('chakra-text') && element.title && element.title.startsWith('0x')) {
        const fullAddress = element.title.toLowerCase();
        if (processedAddressList.hasOwnProperty(fullAddress)) {
            const name = processedAddressList[fullAddress];
            if (element.textContent !== name) {
                element.dataset.originalAddress = element.textContent;
                element.textContent = name;
            }
        }
    }
  }
  
  // Function to process the addressList
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
                processedAddressList[fullAddress.toLowerCase()] = details.name;
            }
            resolve(processedAddressList);
        });
    });
  }
  
  // Function to replace all matching addresses on the page
  function replaceAllAddresses(processedAddressList) {
    document.querySelectorAll('a.chakra-link, .chakra-text.custom-17xn0nd, .chakra-text[title^="0x"]').forEach(element => {
        replaceAddressWithName(element, processedAddressList);
    });
  }
  
  // Set up the mutation observer
  function setupObserver(processedAddressList) {
    const observer = new MutationObserver((mutations) => {
        let shouldReplace = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList.contains('chakra-link') || 
                            (node.classList.contains('chakra-text') && node.classList.contains('custom-17xn0nd'))) {
                            shouldReplace = true;
                        } else {
                            const hasRelevantChildren = node.querySelector('a.chakra-link, .chakra-text.custom-17xn0nd');
                            if (hasRelevantChildren) shouldReplace = true;
                        }
                    }
                });
            }
        });
        if (shouldReplace) {
            replaceAllAddresses(processedAddressList);
        }
    });
  
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
  }
  
  // Main execution
  function init() {
    processAddressList().then(processedAddressList => {
        replaceAllAddresses(processedAddressList);
        setupObserver(processedAddressList);
        
        // Add event listener for page changes (for single-page applications)
        window.addEventListener('popstate', () => {
            setTimeout(() => replaceAllAddresses(processedAddressList), 500);
        });
    }).catch(error => {
        console.error("Failed to process address list:", error);
    });
  }
  
  // Run the script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }