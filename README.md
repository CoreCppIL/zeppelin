# Project Zeppelin / GDG DevFest 2014 site template

### About
Project Zeppelin allows you to setup awesome GDG DevFest site in 5 minutes.

Project is built on top of [Jekyll](http://jekyllrb.com/) - simple, blog-aware, static site generator. Jekyll also happens to be the engine behind GitHub Pages, which means you can use Jekyll to host your website from GitHub’s servers for free. [Learn more about Jekyll](http://jekyllrb.com/).

Template is brought by [GDG Lviv](http://lviv.gdg.org.ua/) team.

### Live demo http://gdg-x.github.io/zeppelin/

#### Automated version with Grunt <https://github.com/gdg-x/zeppelin-grunt>

### Features
* Easy to setup
* Simple and responsive design
* Integrated speakers and sessions management
* SVG icons
* SEO friendly


### Quick-start guide
1. [Fork](https://github.com/gdg-x/zeppelin/fork) this repo
2. Clone locally
3. Update ```_config.yml```
4. Select what content blocks do you need
5. Push changes to ```gh-pages``` branch
6. Enjoy your awesome DevFest site at ```http://[your github name].github.io/zeppelin/```

Or watch project presentation from [GDG[x] Townhall meeting](http://www.youtube.com/watch?v=xYmhheoLjcI). Slides available [here](https://docs.google.com/presentation/d/19aM7yNl_orDaCNND5LpCY3fShb6PyMltnzYfKvV8R_8/edit?usp=sharing)


## Local development

The site is a [Jekyll](http://jekyllrb.com/) project built with the
`github-pages` gem, so a local build matches what GitHub Pages produces. It
needs **Ruby ≥ 2.7** (the `github-pages` gem won't run on older Rubies — note
that the system Ruby shipped with macOS is too old). The repo pins a known-good
version in `.ruby-version`, so the steps below use [rbenv](https://github.com/rbenv/rbenv)
to install exactly that.

### macOS

```bash
# 1. Ruby toolchain (Homebrew assumed installed)
brew install rbenv ruby-build
echo 'eval "$(rbenv init - zsh)"' >> ~/.zshrc && exec zsh   # one-time shell setup
rbenv install        # installs the version from .ruby-version

# 2. Project gems
gem install bundler
bundle install

# 3. Build + serve with live reload
bundle exec jekyll serve -w
```

The site runs at http://localhost:4000 and rebuilds on every file change. Stop
it with `Ctrl-C` (or `pkill -f jekyll` if you started it detached).

> **Note:** changes to HTML and `_data` files are regenerated automatically, but
> after editing `_config.yml` you must restart the server.

### Windows (via WSL2)

Install WSL2 ([instructions](https://docs.microsoft.com/en-us/windows/wsl/install))
from an Administrator PowerShell:

```powershell
wsl --install
```

Reboot if prompted, then check the distro is WSL **version 2** with `wsl -l -v`.
From the Ubuntu console, install the build tools, then follow the same rbenv flow
as macOS (using `~/.bashrc` instead of `~/.zshrc`):

```bash
sudo apt update
sudo apt install -y git curl build-essential libssl-dev libreadline-dev zlib1g-dev

# rbenv + ruby-build
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/HEAD/bin/rbenv-installer | bash
echo 'eval "$(~/.rbenv/bin/rbenv init - bash)"' >> ~/.bashrc && exec bash

rbenv install          # installs the version from .ruby-version
gem install bundler
bundle install
bundle exec jekyll serve -w
```

### Styling / Sass

SCSS sources live in `_sass/` with `css/main.scss` as the entry point. It is
compiled to `css/main.css` automatically by Jekyll's built-in
`jekyll-sass-converter` — both locally (`jekyll serve`/`build`) and on GitHub
Pages. **Do not edit or commit `css/main.css`; it is generated output**
(git-ignored). Edit the partials under `_sass/` instead.

> This project previously compiled Sass with **Compass** via a custom plugin in
> `_plugins/`, which required committing the built CSS by hand. That pipeline has
> been removed in favor of Jekyll's native Sass support.


### Resource optimizations (optional)

You can optimize images and minify css and javascript automatically (for now only on Windows).
But for Mac OS users available amazing tool - [imageoptim](https://imageoptim.com/). Thanks [@raphaelsavina](https://github.com/raphaelsavina) for link.
Optimize all images by running this script from `/automation/images/` folder:
```bash
    all_image_optimization.bat -d -jtran -pout -pquant -optip -gsicle -svgo
```

To minify CSS and JS run `minify_js.bat` (for Windows) and `minify_js.sh` (for Linux and MacOS) from `/automation/minifying/` folder:
```bash
    minify_js.bat
```

Learn more about available optimization options from [documentation](https://github.com/gdg-x/zeppelin/wiki/Resources-optimizations).

### Documentation
Quick-start guide is not enough? Checkout [full documentation](https://github.com/gdg-x/zeppelin/wiki).

### Used libraries
* [Bootstrap](https://github.com/twbs/bootstrap)
* [Animate.css](https://github.com/daneden/animate.css)
* [Waves](https://github.com/publicis-indonesia/Waves)
* [jquery.appear](https://github.com/bas2k/jquery.appear)
* [jQuery countTo Plugin](https://github.com/mhuggins/jquery-countTo)
* [Typed.js](https://github.com/mattboldt/typed.js)
* [Sticky-kit](https://github.com/leafo/sticky-kit)

### Who is using template?
Going to use template? Go on! The only thing we ask - let us know at [*lviv@gdg.org.ua*](mailto:lviv@gdg.org.ua) so we can include you to this list, or make a pull request.

| | | |
|------|------|------|
| [GDG DevFest Ukraine 2014](http://devfest.gdg.org.ua/) | [GDG DevFest Istanbul 2014](http://2014.devfesttr.com/) | [GDG Bangalore Site](http://gdgbangalore.github.io/) |
| [GDG DevFest Omsk 2014](http://gdg-devfest-omsk.org/) | [2014 南阳 GDG Devfest 大会](http://devfest.gdgny.org) | [DevFest Nordeste 2014](http://2014.devfestne.com.br/) |
| [GDG DevFest The Netherlands](http://www.devfest.nl/) | [DevFest Centro-Oeste 2014](http://www.devfestcentrooeste.com.br/) | [Android DevFest Space Coast](http://gdg-space-coast.github.io/zeppelin/) |
| [DevFest SP 2014](http://sp.devfest.com.br/) | [DevFest in Baroda](http://devfest.gdgbaroda.com/) | [GDG Hi Pic (France)](http://maximemularz.github.io/zeppelin/) |
| [GDG DevFest Córdoba 2014](http://gdgcordoba.github.io/zeppelin/) | [GDG DevFest Düsseldorf 2014](http://www.gdg-dus.de/DevFest2014/) | [GDG Makerere DevFest 2014](http://gdgmakerere.github.io/) |
| [GDG Dublin DevFest 2014](http://gdg-dublin.appspot.com/) | [GDG Busitema DevFest 2014](http://gdgbusitema.github.io/) | [DevFest Vienna 2014](http://www.devfest.at/) |
| [Android Wear DevFest](http://devfest.gdgnorthjersey.com/wear2014/) | [GDG SLAU DevFest 2014](http://gdgslau.github.io/) | [Lima DevFest](http://limadevfest.com/) |
| [GDG Korea DevFair 2014](http://devfair2014.gdg.kr/) | [GDG DevFest Kota Kinabalu 2014](http://devfest.gdgkk.info/) | [GDG DevFest Belgium](http://gdg-brussels.org/DevFest2014/) |
| [DevFest Praha 2014](http://devfest.cz/) | [GDG DevFest Kosice](http://devfest.sk/) | [GDG DevFest Cagayan de Oro](http://devfest.gdgcdo.org/) |
| [DevFest Birgunj](http://gdgbirgunj.github.io/DevFest2014/) | [GDG DevFest Poland](http://devfest.pl/) | [GDG DevFest Silicon Valley](http://devfest2014.gdgsv.com/) |
| [DevFest Chennai 2014](http://devfest.gdgchennai.com/) | [GDG DevFest Bari](http://gdgbari.github.io/zeppelin/) | [GDG DevFest Ahmedabad](http://devfest.gdgahmedabad.com/) |
| [GDG DevFest Sri Lanka](http://www.devfestlk.org/) | [GDG DevFest Tunis](http://devfest.gdgtunis.org/) | [GDG DevFest Kozhikode](http://devfest.gdgkozhikode.org/) |
| [GDG DevFest Argentina](http://devfest.gdg.com.ar/) | [GDG DevFest Bhubaneswar](http://devfest2014.gdgbbsr.com/) | [GDG DevFest Miage Gi](http://gdgmiagegilab.github.io/) |
| [GDG DevFest NORTE](http://norte.devfest.com.br/) | [GDG Devfest Nyeri 2014](http://devfest.gdgkimathiuniversity.com/) | [GDG DevFest Paris](http://devfest.gdgparis.com/) |
| [GDG Akure](http://gdgakure.github.io/)|[MENAT GDG Summit 2014](http://summit.gdg-menat.com/)|[Women Techmakers Istanbul 2015](http://2015.wtmistanbul.com) |
| [GDG DevFest Mallorca](http://devfest.gdgmallorca.com/)| [Michigan GDG DevFest 2015](http://michigandevfest.com/) | [International Women's Day](http://iwd.gdgnorthjersey.com/womeninnovation/) |
| [Women Techmakers Tbilisi 2015](http://womentechmakers.ge/) | [Android Xtended](http://www.androidxtended.com/) |[GDG Bingham University](http://binghamuni.edu.ng/gdg)|
| [JSday Maceio 2015](http://jsday.com.br) | [DevFest Nordeste 2015](http://2015.devfestne.com.br) | [GDG DevFest Vijayawada 2015](http://devfest.gdg-vijayawada.org) |
| [Geek Night Recife](http://geeknightrecife.github.io/) | [IO Extended 2016 Madrid ](http://io.gdg.es/) | [AngularCamp](http://angularcamp.org/) |
| [Mobile Era 2016](http://mobileera.rocks/) | [GDG Francisco Beltrão](http://gdg-fb.github.io) | [Women Techmakers Istanbul 2016](http://2016.wtmistanbul.com) |
| [Droidcon Paris 2015](http://droidcon.fr) | [Android Makers Paris 2017](http://androidmakers.fr) | [Heidelberger Symposium 2017](https://heidelberger-symposium.de/) |
| [DevFest Foumban website](http://devfestfoumban.org) | [NorthSec 2018](https://nsec.io/) | [SwiftFest 2018](http://swiftfest.io) |


### Contributors
* Design and web development: [Oleh Zasadnyy](https://github.com/ozasadnyy)
* Idea: [Vitaliy Zasadnyy](https://github.com/zasadnyy)

See [list of contributors](https://github.com/gdg-x/zepplin/graphs/contributors)

Maintainers: [@tasomaniac](https://github.com/tasomaniac) and [@ozasadnyy](https://github.com/ozasadnyy).

### License
Project is published under the [MIT license](https://github.com/gdg-x/zeppelin/blob/master/LICENSE.txt). Feel free to clone and modify repo as you want, but don't forget to add reference to authors :)
