## Run at home

```bash
# Install docker with package manager of your choice
# Install git with package manager of your choice
git clone https://github.com/grzegorzk/grzegorzk.github.io.git
cd grzegorzk.github.io
make run # This will build docker container and expose port 3000
```

## Where is the code

 * All react code is located within `passstore` directory
 * Project was started with `create-react-app` (3.1.1)
 * Project makes use of `bootstrap` css framework (4.3.1)
 * Work with `passstore/{src,public}`, do not modify `passstore/build` (see next section)
 * You should be able to see changes by visiting `localhost:3000`

### google API primer

 * [quick start with google sheets api](https://developers.google.com/sheets/api/quickstart/js)
 * enable google sheets api here: https://console.developers.google.com/apis/library/sheets.googleapis.com?q=sheets
 * create credentials (OAuth client ID and API key) here: https://console.developers.google.com/apis/credentials
 * whitelist your origin (i.e. your domain or localhost if you are testing locally)
 * if after doing all of the above you see errors related with whitelisting origin try to load the app in incognito mode, if it works there then clear cache
 * if error is still there then open dev tools and in network tab check `disable cache`, then refresh and then uncheck `disable cache` 
## Build production version

```bash
# Assuming you are already able to successfully execute `make run`
make build
```

## Deployment

The easiest way to deploy this is to use github pages.

If you are new to github simply create a repository called `your_user_name.github.io` and github will automatically deploy once you `git push` there.

If you already run your blog on github then create new repository, go to `settings -> GitHub Pages` section and select `master branch` from `source` dropdown.

## TODO

 * Each time `make build` is invoked lots of individual files from `passstore/build` must be `git rm` and `git add`
