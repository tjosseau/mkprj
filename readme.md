
# mkprj - Project Architecture Generator

Shell & JavaScript library to build files and folders architectures, defined in a Yaml config file and parsed with Node.js.

## Sample

```yaml
#### Sample architecture ####

# Dependencies #
    # Frontend package manager
bower.json: 0
bower_components: 0
    # Server package manager
package.json: 0
node_modules: 0
    # Installation
!install.sh: |
    bower install -save jquery
    npm install -save socket.io

# Documentation #
README.md: @README.md
Sample.todo: @blank.todo

# Root files #
index.html: @index.html     # Client index
index.js: 1                 # Server index

# Application #
app:
    Sample.js: 1

    library:
        jQuery.js: ~bower_components/jquery/jquery.min.js

    model:
        Machin.js: 1
        Chouette.js: 1

    view:
        style:
            reset.css: @style/reset.css
            theme.css: @style/theme.css
        template:
            Machin.html: 1

# End of architecture
```

## Installation

* **Node.js** is required to use this library. http://nodejs.org/

* After having cloned or copied **mkprj** project, open a terminal and change directory to its root.

    ```sh
    cd /path/to/mkprj
    ```

    Then install the JS dependencies this way :

    ```sh
    ./install.sh
    ```

    This will install 3 libraries :
    - **fs-extra** : A powerful extension to the native file system manager **fs**. https://github.com/jprichardson/node-fs-extra
    - **yamljs** : The best Yaml file parser for Node.js. https://github.com/jeremyfa/yaml.js
    - **colors** : A great library to easily add colors to your terminal. https://github.com/Marak/colors.js

### Adding alias command `mkprj` (facultative)

To add the command `mkprj` to execute this library, go to your session directory :

```sh
cd /home/myname
```

Then open a hidden file called `.bash_profile` or `.bashrc` and add this line at the bottom :

```sh
alias mkprj='/path/to/mkprj/mkprj.sh'
```

Re-open your terminal and check if the alias is correctly initialized :

```sh
mkprj dir
```

You should get an echo of the absolute path of the mkprj library.

## Creating a new project architecture

Create a folder for your new project and go inside with a terminal.

```sh
cd /home/prj
mkdir patate
cd patate
```

Then just execute the shell script :

```sh
mkprj
# or if not aliased :
/path/to/mkprj/mkprj.sh
```

This will initialize your project with a Yaml configuration file called `architecture.yml` interactively chosen.
The prompt will pause to let you edit the configuration file, and then will parse it and generate your project architecture with files and folders.

## Setting `architecture.yml`

### Why Yaml ?

Yaml files are easy and pleasant to read, besides Json files looks rougher. The key precedes `:`, and deepness is based on indentation (spaces or tabs).
Thus it is important to have a clean configuration file.

```yaml
config: 123
root:
    folder:
        a:
            A: file
        b:
            B1: file
            B2: file
    test:
        file: true
```

This looks quite nice to read, and it is useful for concepting your application architecture.

In JavaScript, after having parsed this example, you would get :

```js
var result = yaml.parse(fs.readFileSync('architecture.yml', 'utf8')) ;

console.log(typeof result.config) ; // number
console.log(result.root.folder.a.A) ; // "file"
console.log(typeof result.root.test.file) ; // boolean
```

__Note :__ This Yaml parser ables to have no unique key root, both `config` and `root` are key roots. It is not the case to some other Yaml parsers...

### Managing files and folders

* **Optional values**

    Values given defines the action or the content of each element. Here is an exhaustive list of values :

    - `0` : Skips the element, like a facultative file/folder but useful to write in the architecture.

    - `1` `true` : Generates an empty file if it does not exist.

    - `2` ` ` : Generates a folder if it does not exist.

    - `false` : Deletes the file/folder if it exists.

    - `>` : Generates a file with the following as inline content.

    ```yaml
    file: >
        This is inline content.
    ```

    - `|` : Generates a file with the following as block content.

    ```yaml
    file: |
        This is content
        with multiple lines.
    ```

    - `@path/to/file` : Copy the file from mkprj modules `mkprj/MODULES/path/to/file` if the destination does not exist.

    This is useful when having previously wrote default scripts/templates/config stored in global modules.

    Example :

    ```yaml
    reset.css: @style/reset.css
    theme.css: @style/default.css
    index.html: @template/default.html
    loader.js: @script/loader.js
    ```

    - `~path/to/file` : Copy the file from the project's root `/home/prj/patate/path/to/file` if the destination does not exist.

    This is useful for instance when you use [Bower](http://bower.io/). Bower is a client-side package manager, but when you install a package, it downloads the full repository which can be heavy.
    Copying a script inside your own project allows you to clone the only required script and put it in your application.

    Example :

    ```yaml
    app:
        lib:
            jquery.js: ~/bower_components/jquery/jquery.min.js
    ```

    _Applying for those who don't want to use heavy client web application managers such as [Yeoman](http://yeoman.io/)._

* **Optional key prefixes**

    You can also execute a pre-operation by adding a prefix to your key.

    - `!key:` : Delete the file before creating it anew.

    This is useful if you wish to write directly the content of the file in the architecture config (thus it will "replace" that file).
    But it is also useful to reset files such as logs.

    ```yaml
    !init.sh: |
        rm ._*
        rm .DS_STORE
        rm .somethinghidden

    !bugs.log: 1
    ```

## Note

ReadMe documentation in progress !
