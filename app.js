const { spawn } = require('child_process');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@notionhq/client'); 
const { promises: fsPromises } = require('fs');
const { get } = require('express/lib/response');
const notion = new Client({ auth: process.env["NOTION_KEY"] })

const pythonExecutable = '/Library/Frameworks/Python.framework/Versions/3.11/bin/python3';

const app = express();
app.use(bodyParser.json());

function generateTextDataFromYouTube(url) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonExecutable, ['script.py', url]);

    let audioFilePath = 'audio.mp3';
    let error = '';

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      if (code === 0) {
        try {
          const textData = await convertAudioToText(audioFilePath);
          resolve(textData);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Failed to download audio: ${error}`));
      }
    });
  });
}





async function getAllPages() {
  try {
    let continuePagination = true;
    let startCursor = undefined;
    
    while (continuePagination) {
      const response = await notion.search({
        query: "",
        filter: {
          value: "page",
          property: "object"
        },
        page_size: 100,
        start_cursor: startCursor,
      });
      
      response.results.forEach(page => {
        if (page.object === "page") {
          console.log(`Page Name: ${page.properties.title.title[0].plain_text}`);
          console.log(`Page ID: ${page.id}`);
        }
      });

      if (response.next_cursor) {
        startCursor = response.next_cursor;
      } else {
        continuePagination = false;
      }
    }
  } catch (error) {
    console.error("Error retrieving pages:", error);
  }
}



async function addBlockToNotion(notion, text, title) {
  (async () => {
    console.log('Adding block to Notion');
    const blockId = '6a75e7a827f844e2b6fc01ae776ae7e8';
    const response = await notion.blocks.children.append({
      block_id: blockId,
      children: [
        {
          "heading_2": {
            "rich_text": [
              {
                "text": {
                  "content": title
                }
              }
            ]
          }
        },
        {
          "paragraph": {
            "rich_text": [  
              {
                "text": {
                  "content": text,
                }
              }
            ]
          }
        }
      ],
    });
    console.log(response);
  })();
}

async function convertAudioToText(audioFilePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Converting audio to text');
      const client = new speech.SpeechClient();

      const recognizeStream = client.streamingRecognize({
        config: {
          encoding: 'MP3',
          sampleRateHertz: 44100,
          languageCode: 'en-US',
        },
        interimResults: true,
      });

      recognizeStream.on('data', (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          console.log('Streaming Response:', data.results[0].alternatives[0].transcript);
          resolve(data.results[0].alternatives[0].transcript);
        }
      });

      recognizeStream.on('error', (error) => {
        reject(new Error(`Failed to convert audio to text: ${error.message}`));
      });

      fs.createReadStream(audioFilePath).pipe(recognizeStream);
    } catch (error) {
      reject(new Error(`Failed to convert audio to text: ${error.message}`));
    }
  });
}


let summaryText = '';
let title = '';
function generateSummary(url) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(pythonExecutable, [path.join(__dirname, 'script.py'), url]);

    let dataText = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
        dataText += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return reject(new Error(`Python script ended with code ${code}: ${error}`));
        }

        const splitIndex = dataText.indexOf('\n');
        title = dataText.substring(0, splitIndex);
        summaryText = dataText.substring(splitIndex + 1);
        resolve({ title, summaryText });
    });
  });
}

app.post('/export', (req, res) => {
  const url = req.body.url;
  console.log(url);
  generateSummary(url)
    .then(({ title, summaryText }) => addBlockToNotion(notion, summaryText, title))
    .catch(error => console.error(`Error during summary generation: ${error.message}`));

  res.json({ message: 'Transcript exported successfully!' });
});


const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});