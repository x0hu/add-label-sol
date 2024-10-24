const solanaAddressRegex = /^[1-9a-hj-np-za-km-z]{32,44}$/i;
const truncatedSolanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]+\.{3}[1-9A-HJ-NP-Za-km-z]+$/;
const processedElements = new Set();

if (!window.addressCache) {
  window.addressCache = {};
}

const replaceWithNickname = (name, element, address) => {
  if (processedElements.has(element)) return;
  
  element.textContent = name;
  element.title = address;
  element.style.fontWeight = 'bold';
  
  processedElements.add(element);
};

const findFullAddress = (element) => {
  const text = element.textContent;
  return solanaAddressRegex.test(text.toLowerCase()) ? text : null;
};

const replaceAddressesInElement = (element) => {
  if (processedElements.has(element)) return;
  
  const fullAddress = findFullAddress(element);
  
  if (fullAddress) {
    const addressKey = fullAddress.toLowerCase();
    if (window.addressCache[addressKey]) {
      const name = window.addressCache[addressKey];
      if (name) replaceWithNickname(name, element, fullAddress);
    } else {
      chrome.storage.local.get(["addressList"], ({ addressList }) => {
        const matchingAddress = Object.keys(addressList).find(addr => addr.toLowerCase() === addressKey);
        const name = matchingAddress ? addressList[matchingAddress] : undefined;
        window.addressCache[addressKey] = name;
        if (name) {
          replaceWithNickname(name, element, fullAddress);
        }
      });
    }
  } else {
    const text = element.textContent;
    const matches = text.match(truncatedSolanaAddressRegex);
    if (matches) {
      matches.forEach(address => {
        const [start, end] = address.split('...');
        chrome.storage.local.get(["addressList"], ({ addressList }) => {
          const matchedAddress = Object.keys(addressList).find(fullAddr => 
            fullAddr.toLowerCase().startsWith(start.toLowerCase()) && 
            fullAddr.toLowerCase().endsWith(end.toLowerCase())
          );
          if (matchedAddress) {
            const name = addressList[matchedAddress];
            window.addressCache[matchedAddress.toLowerCase()] = name;
            if (name) replaceWithNickname(name, element, matchedAddress);
          }
        });
      });
    }
  }
};

const scanAndReplaceAddresses = () => {
  const elements = document.querySelectorAll('*');
  elements.forEach(element => {
    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
      const text = element.textContent.trim();
      if (solanaAddressRegex.test(text) || truncatedSolanaAddressRegex.test(text)) {
        replaceAddressesInElement(element);
      }
    }
  });
};

const runInitialScan = () => {
  let scanCount = 0;
  const maxScans = 50;
  const scanInterval = 100; // ms

  const intervalId = setInterval(() => {
    scanAndReplaceAddresses();
    scanCount++;
    if (scanCount >= maxScans) clearInterval(intervalId);
  }, scanInterval);
};

runInitialScan();
document.addEventListener('DOMContentLoaded', runInitialScan);

const observer = new MutationObserver(mutations => {
  let shouldScan = false;
  mutations.forEach(mutation => {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      shouldScan = true;
    }
  });
  if (shouldScan) {
    scanAndReplaceAddresses();
  }
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });

window.addEventListener('load', () => {
  setTimeout(scanAndReplaceAddresses, 1000);
});

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    runInitialScan();
  }
}).observe(document, {subtree: true, childList: true});
