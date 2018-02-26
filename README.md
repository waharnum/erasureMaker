# Browser Sync

`browser-sync start --no-open --proxy localhost:8081 --files "**"`

# Docker

docker run -p 8081:8081 erasuremaker

# Docker With Persistent Storage

docker volume create erasure-maker-storage

docker run -p 8081:8081 -v erasure-maker-storage:/erasuremaker/storage erasuremaker
