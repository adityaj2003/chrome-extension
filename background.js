chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'exportTranscript') {
      // Get the URL from the message
      const url = request.url;
  
      // Send the URL to your backend server
      fetch('http://localhost:3000/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Handle the response from the server here, if needed
        })
        .catch((error) => console.error('Error:', error));
    }
  });
  