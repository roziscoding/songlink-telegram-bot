song.link telegram chatbot
========

> This project uses [song.link](https://song.link)'s API. Thanks for the great work, guys!

# Usage
Just hit it [on Telegram](https://t.me/odeliscobot). It'll tell you what to do

# What is it
Telegram chatbot created to generate nice song.link URLs from a song or album link.

Everytime you call it on inline mode with a valid link to a supported platform, it will give you the option
to create URLs for the supported platforms

More info on [song.link](https://song.link)

# How to run it
The first thing you'll need is an authorization token to communicate with Telegram's bot API. You can get it from [BotFather](https://t.me/botfather).
Then, choose one of the methods below and follow the instructions.

## Locally
- Clone this repo and cd into it
- Run `npm install`
- Run `npm run build`
- Set all environment variables described in the [sample envs file](.envrc.sample)
- Run `npm start`

## Using Docker
- Clone this repo and cd into it
- Run `docker build . -t IMAGE_TAG` replacing IMAGE_TAG with the desired local tag for this image
- - Set all environment variables described in the [sample envs file](.envrc.sample)
- Run `docker run` command mapping the environment variables

## On Heroku

Just click the button below, set the envs and that's it.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

# Contributing
See [this](CONTRIBUTING.md)
