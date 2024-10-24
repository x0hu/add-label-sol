// Function to convert an address to its 6-digit representation
function convertAddressTo6Digits(address) {
    return address.slice(-6).toLowerCase();
}

// Function to replace addresses with names
function replaceAddressWithName(element, processedAddressList) {
    if (element.classList.contains('chakra-link')) {
        const fullAddress = element.href.split('/').pop().toLowerCase();
        const shortAddress = convertAddressTo6Digits(fullAddress);
        
        if (processedAddressList.hasOwnProperty(fullAddress)) {
            const name = processedAddressList[fullAddress];
            if (element.textContent !== name) {
                element.textContent = name;
                element.title = fullAddress; // Set the full address as a title for reference
                element.dataset.originalAddress = fullAddress;
            }
        } else if (processedAddressList.hasOwnProperty(shortAddress)) {
            // If we don't find a match for the full address, try matching the last 6 digits
            const name = processedAddressList[shortAddress];
            if (element.textContent !== name) {
                element.textContent = name;
                element.title = fullAddress; // Set the full address as a title for reference
                element.dataset.originalAddress = fullAddress;
            }
        }
    }
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

            for (const [fullAddress, name] of Object.entries(addressList)) {
                const shortAddress = convertAddressTo6Digits(fullAddress);
                processedAddressList[fullAddress] = name;
                processedAddressList[shortAddress] = name;
            }

            console.log(processedAddressList);
            resolve(processedAddressList);
        });
    });
}

// Process the addressList and replace addresses on the page
processAddressList()
    .then(processedAddressList => {
        function replaceAddresses() {
            document.querySelectorAll('a.chakra-link').forEach(element => {
                replaceAddressWithName(element, processedAddressList);
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
                            if (node.classList.contains('chakra-link') || node.querySelector('.chakra-link')) {
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
        console.error("Failed to process address list:", error);
    });