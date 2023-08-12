# chrome-extension
This project aims to export the summary of a youtube video you are currently watching into your notion notebook. It aims to use OpenAI API
to get summary of the youtube video.

#Setup
You would need to generate your own api key for access to the OpenAI API. It
is fairly straightforward on the OpenAI website. Replace your API key in the
script.py file.
For Notion, you would need to add a new integration from
"https://www.notion.so/my-integrations" and add the integration to your
notion page. From their you could get the block id of your notion page and
replace it in app.js with ur notion page ID. The block ID is the
alphanumeric text after the link of your page
"https://www.notion.so/{THIS_IS_YOUR_PAGE_BLOCK_ID}". I have my Notion API key
setup in my local environment as NOTION_KEY.

#Running
You can start the node app using "node app.js". Load the hello extension
using chrome extension developer mode and pointing to the top folder of this
project and chrome should do everything for you. Be sure to give it
permissions. Now you can just use the extension transcribe button to export
summary to your Notion workspace!
Notion has a limit of 2000 characters in the API so the summary unfortunately
cant be too long. But according to their documentation they might be working
on higher limits so that would be super useful. You could change the
system_prompt in script.py to accomodate any future change.
