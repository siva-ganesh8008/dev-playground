document.getElementById('start').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('export.html') });
  window.close();
});
