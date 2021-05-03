# World Search App

![Image of World Search Demo World](https://cdn-content-ingress.altvr.com/uploads/space_template/banner_image/1288724542314774905/rooftopGames2_noBanner.jpg)

World Search is an MRE app that allows Altspace users to search public Worlds. You can search for words in the name or description. You can even search for a particular user's worlds using their username. Fuzzy matching is available.

There's a demo Altspace world here: https://account.altvr.com/worlds/1046572460192825569/spaces/1597073609157771872

# Usage

This app is featured so you can place it in your Worlds using the World Editor:

![Image of World Editor](https://cdn-content-ingress.altvr.com/uploads/photo/image/1728674263445013123/Jimmy2021-05-02_17-18-07.png)

You can also place it manually using:

> wss://mankindforward-world-search.herokuapp.com

You can pass a parameter to preconfigure a search:

> wss://mankindforward-world-search.herokuapp.com?q=jimmy

# Development
* Fork this repo
* Create a Heroku app and link it to your github repo
* Enable auto deploys from github
* In Altspace:
  * Open World Editor > Altspace > Basics > SDK App
  * `ws://<your subdomain>.herokuapp.com` (port 80)
  * Click Confirm
