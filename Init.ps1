New-Item -ItemType Directory posts, .github\workflows | Out-Null
#Copy-Item ..\Build-TypstSite.js .
#Copy-Item ..\website.typ posts\
#Copy-Item ..\pages.yml .github\workflows\pages.yml
Set-Content .gitignore "dist/"
