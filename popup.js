function exportTranscript() {
    console.log("exportTranscript");
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let url = tabs[0].url;
      chrome.runtime.sendMessage({ action: 'exportTranscript', url: url });
    });
  }

document.addEventListener('DOMContentLoaded', () => {
    const exportButton = document.getElementById('exportButton');
    exportButton.addEventListener('click', exportTranscript);
  });