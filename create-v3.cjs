// Version 3 uses index.html with the established version 2 design.
const fs=require('node:fs'),path=require('node:path');
const alias="<!doctype html><html lang=\"id\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>SIPANTIP</title><script>location.replace(\"./index.html\"+location.search+location.hash)</script></head><body><a href=\"index.html\">Buka SIPANTIP</a></body></html>\n";
fs.writeFileSync(path.join(__dirname,'v3.html'),alias);
fs.copyFileSync(path.join(__dirname,'v3.html'),path.join(__dirname,'dist/v3.html'));
