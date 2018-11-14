# Netlify Function and Build

This repository is the cleaned version of a Netlify function and build process that accepts a request from an iOS Shortcut and processes it via a netlify form to create a list of status updates from data in a static site generator.

You can view a completed version at [bryanlrobinson.com/bryan-sight](https://bryanlrobinson.com/bryan-sight)

You can read the [blog post here](https://bryanlrobinson.com/blog/2018/11/12/ios-shortcuts-pushing-data-to-netlify-static-site/)


## Requirements
- Currently set up to deploy to [Netlify](https://netlify.com)
- Needs 3 environment variables:
    - STATUS_FORM_ID (form ID from netlify; navigate to the form in Netlify and grab the last piece of the URL)
    - POST_FORM (form action: any page on the site where the form exists; this should be a full URL including protocol) 
    - FORM_NAME (the name of the form in your form-stub; by default this is `netlify-shortcut-demo`)
    - API_AUTH (your netlify api auth key)
- Imgur account (for iOS shortcut integration and photo uploading)
- Static Site Generator that can accept a JSON file (Jekyll uses _data/data.json)


## Installation
1. Clone/fork the repo and publish to Netlify (or click the one-click button below... thanks Phil!)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/brob/netlify-shortcut-statuses)
2. Create Environment Variables listed above
3. Set up a "Deploy Hook" to rebuild the site and deploy
4. Add a "Notification" to the form to trigger the deploy hook created in 2
5. Manually trigger a build to populate your environment variables into your Lambda Function
6. Submit a query to `<site-url>/.netlify/functions/update-status/?doing=<your status>&imgUrl=<img url>`


This is mostly meant as a proof of concept and to be extended in other ways. Feel free to fork and use it for all sorts of crazy dynamically static stuff!