# ErasureMaker

A web application for making [erasures](https://en.wikipedia.org/wiki/Erasure_(artform)) from public domain texts, mostly sourced from [Project Gutenberg](https://www.gutenberg.org).

At the moment uses very basic filesystem-based storage and indexing for erasures made with it.

If you're interested in running your own version, you may be most interested in modifying the available texts, which are currently in one file in `client/json/texts.json`.

# Running Using Docker

## Building the Container

`docker build -t erasuremaker .`

## Docker (Volatile Storage)

`docker run -p 8081:8081 erasuremaker`

## Docker With a Persistent Storage Volume

`docker volume create erasure-maker-storage`

`docker run -p 8081:8081 -v erasure-maker-storage:/erasuremaker/storage erasuremaker`
