# Netlify Function and Build

This repository is the cleaned version of a Netlify function and build process that accepts a request from an iOS shortcut and processes it via a netlify form to create a list of status updates from data in a static site generator.

You can view a completed version at [bryanlrobinson.com/bryan-sight](https://bryanlrobinson.com/bryan-sight)


## Requirements
- Currently set up to deploy to [Netlify](https://netlify.com)
- Needs 3 environment variables:
    - APPROVED_COMMENTS_FORM_ID (form ID from netlify)
    - POST_FORM (form action)
    - API_AUTH (your netlify api auth key)
- Imgur account (for iOS shortcut integration and photo uploading)