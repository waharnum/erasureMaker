# ErasureMaker

A web application for making [erasures](https://en.wikipedia.org/wiki/Erasure_(artform)) from public domain texts, mostly sourced from [Project Gutenberg](https://www.gutenberg.org).

At the moment uses very basic filesystem-based storage and indexing for erasures made with it.

If you're interested in running your own version, you may be most interested in modifying the available texts, which are currently in one file in `client/json/texts-gutenberg.json`.

# Running Using Docker

## Building the Container

`docker build -t aharnum/erasuremaker .`

## Docker (Volatile Storage)

`docker run -p 8081:8081 aharnum/erasuremaker`

## Docker With a Persistent Storage Volume

`docker volume create erasure-maker-storage`

`docker run -d -p 8081:8081 --env-file ./erasureMaker_env.ini --name erasuremaker-running -v erasure-maker-storage:/erasuremaker/storage aharnum/erasuremaker`

(Mailgun settings will need to be configured in `erasureMaker_env.ini`)
