console.log("Content3.js loaded - Using mutation locking and CSS classes");

let addressList = [];
const REPLACED_CLASS = 'solana-address-replaced';
let isProcessing = false;

// Add custom styles to the document
function addCustomStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .${REPLACED_CLASS} {
      color: #ff000d !important;
      font-weight: bold !important;
      transition: color 0.3s ease, font-weight 0.3s ease;
    }
  `;
  document.head.appendChild(style);
}

// Function to process the addressList
function processAddressListForAnchors() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["addressList"], ({ addressList: storedList }) => {
      if (!storedList) {
        console.log("Content3: No addressList found in storage.");
        reject("No addressList found in storage.");
        return;
      }

      addressList = Object.entries(storedList).map(([address, name]) => ({
        address: address,
        name: name,
        start: address.slice(0, 3),
        end: address.slice(-3)
      }));

      console.log("Content3: Processed address list for anchors");
      resolve();
    });
  });
}

// Function to replace truncated addresses with names in anchor tags
function replaceAnchorAddress(element) {
  if (element.classList.contains(REPLACED_CLASS)) return; // Skip if already replaced

  const fullAddress = element.href.split('/').pop();
  const truncatedAddress = element.textContent;
  
  if (truncatedAddress.includes('...')) {
    const [start, end] = truncatedAddress.split('...');
    
    const match = addressList.find(item => 
      item.address === fullAddress || (item.start === start && item.end === end)
    );

    if (match) {
      console.log(`Content3: Replacing ${truncatedAddress} with ${match.name}`);
      element.textContent = match.name;
      element.title = fullAddress; // Set full address as title for reference
      element.classList.add(REPLACED_CLASS);
    }
  }
}

// Function to replace all matching addresses
function replaceAllAddresses() {
  if (isProcessing) return;
  isProcessing = true;

  document.querySelectorAll('a[href^="https://solscan.io/account/"]:not(.' + REPLACED_CLASS + ')').forEach(replaceAnchorAddress);

  isProcessing = false;
}

// Set up a MutationObserver to watch for changes
function setupObserver() {
  const observer = new MutationObserver((mutations) => {
    if (isProcessing) return;
    isProcessing = true;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const anchors = node.querySelectorAll('a[href^="https://solscan.io/account/"]:not(.' + REPLACED_CLASS + ')');
            anchors.forEach(replaceAnchorAddress);
          }
        });
      }
    });

    isProcessing = false;
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Main function to initialize the script
async function init() {
  try {
    addCustomStyles();
    await processAddressListForAnchors();
    replaceAllAddresses(); // Initial replacement
    setupObserver(); // Set up observer for future changes
    
    // Periodically check for new addresses
    setInterval(replaceAllAddresses, 500); // Check every 500ms
  } catch (error) {
    console.error("Content3: Initialization failed:", error);
  }
}

// Run the initialization
init();