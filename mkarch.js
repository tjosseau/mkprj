
/**
 * mkprj Project Architecture Generator - JavaScript engine
 *
 * @author      Thomas Josseau
 * @version     1.2.2
 * @date        2014.01.26
 * @link        https://github.com/tjosseau/mkprj
 *
 * @description
 *     Shell & JavaScript library to build files and folders architectures,
 *     defined in a Yaml config file and parsed with Node.js
 *     Yaml syntax allows you to have a nice overview of your application structure.
 */

// Dependencies //

var SRC_VERSION = "1.2.2",
    VERSION = parseFloat(SRC_VERSION, 10),
    src = {
        MODULES : __dirname + '/MODULES/',
        ROOT : './'
    },
    colors = require('colors'),
    echo = function(value) {
        console.log(value) ;
        return value ;
    },
    fs = require('fs-extra'),
    yaml = require('yamljs') ;

// Initialization //
 
echo(("\n#### mkprj Engine "+SRC_VERSION+" ####\n").cyan) ;

var arch = yaml.parse(fs.readFileSync('architecture.yml', 'utf8')) ;
if (!arch) return echo("\nArchitecture is empty".cyan) ;

var filev = arch._VERSION_,
    tree = [] ;

if (!filev || typeof filev !== 'number')
    echo(("Your 'architecture.yml' config file has no version, "
       + "please check if it is up-to-date and add 'VERSION: "+VERSION+"' at the top of your config.\n").yellow) ;
else if (filev < VERSION)
    return echo(("Your 'architecture.yml' config file is outdated ("+filev+").").red
              + "\nPlease update it and set the 'VERSION:' to "+VERSION+"."
              + "\nDocumentation : https://github.com/tjosseau/mkprj".cyan) ;
else if (filev > VERSION)
    return echo(("Your mkprj library version ("+VERSION+") no longer matches your 'architecture.yml' config file ("+filev+").").red
              + "\nPlease get the last version of mkprj : "+"https://github.com/tjosseau/mkprj".cyan
              + "\nIf you already have the last version check if your config file is up-to-date and set the 'VERSION:' to "+VERSION+".") ;

delete arch._VERSION_ ;

// Functions //

function mkfile(dir, content, callback) {
    content = content || "" ;
    
    fs.exists(dir, function(exists) {
        if (exists) {
            echo('mkfile '.grey + dir.white) ;
            return callback && callback() ;
        }
        else echo('mkfile '.green + dir.white + (' ('+content.length+' char)').blue) ;
        
        fs.outputFile(dir, content, 'utf8', function(error) {
            if (error) echo(error.red) ;
            if (callback) callback() ;
        }) ;
    }) ;
}

function mkdir(dir, callback) {
    fs.exists(dir, function(exists) {
        if (exists) {
            echo('mkdir '.grey + dir.white) ;
            return callback && callback() ;
        }
        else echo('mkdir '.green + dir.white) ;

        fs.mkdirs(dir, function(error) {
            if (error) echo(error.red) ;
            if (callback) callback() ;
        }) ;
    }) ;
}

function cp(dir, from, name, callback) {
    if (!src[from]) {
        echo('cp '.red + dir.grey + (' (undefined source "'+from+'")').red) ;
        return callback && callback() ;
    }
    
    fs.exists(src[from] + name, function(source) {
        if (!source) {
            echo('cp '.red + dir.grey + (' (resource "'+src[from]+name+'" not found)').cyan) ;
            return callback && callback() ;
        }
    
        fs.exists(dir, function(exists) {
            if (exists) {
                echo('cp '.grey + dir.white + (' (copy from '+from+':'+name+')').cyan) ;
                return callback && callback() ;
            }
            else echo('cp '.green + dir.white + (' (copy from '+from+':'+name+')').cyan) ;
            
            fs.copy(src[from] + name, dir, function(error) {
                if (error) echo(error.red) ;
                if (callback) callback() ;
            }) ;
        }) ;
    }) ;
}

function rm(dir, callback) {
    fs.exists(dir, function(exists) {
        if (!exists) {
            echo('rm '.grey + dir.white) ;
            return callback && callback() ;
        }
        else echo('rm '.green + dir.grey) ;
        
        fs.remove(dir, function(error) {
            if (error) echo(error.red) ;
            if (callback) callback() ;
        }) ;
    }) ;
}

function generate(object, callback) {
    var i = 0,
        keys = [],
        o = '',
        dir = "" ;
    
    for (var p in object) keys.push(p) ;
    
    for (var b=0, bl=tree.length ; b<bl ; b++)
        dir += tree[b]+"/" ;

    var next = function() {
            if (keys[++i] != null) perform() ;
            else if (callback) callback() ;
        },
        perform = function() {
            o = keys[i] ;

            if (!o) return next() ;
            
            if (o[0] === '!') {
                var cache = object[o] ;
                delete object[o] ;
                o = o.substring(1) ;
                object[o] = cache ;
                
                return rm(dir + o, function() {
                    keys[i] = o ;
                    perform() ;
                }) ;
            }
            
            switch (typeof object[o]) {
                        
                case 'object' :
                    if (!object[o]) {
                        mkdir(dir + o, next) ;
                    }
                    else if (!object[o].length) {
                        mkdir(dir + o, function() {
                            tree.push(o) ;
                            generate(object[o], function() {
                                tree.pop() ;
                                next() ;
                            }) ;
                        }) ;
                    }
                    else {
                        for (var f=0, fl=[o].length ; f<fl ; f++)
                            mkfile(dir + object[o][f], null, function() {
                                if (f === fl-1) next() ;   
                            }) ;
                    }
                    break ;
                        
                case 'string' :
                    if (object[o][0] === "~")
                        cp(dir + o, 'ROOT', object[o].substring(1), next) ;
                    else if (object[o][0] === "@")
                        cp(dir + o, 'MODULES', object[o].substring(1), next) ;
                    else
                        mkfile(dir + o, object[o], next) ;
                    break ;
                        
                case 'number' :
                    switch (object[o]) {
                    case 1 :
                        mkfile(dir + o, null, next) ;
                        break ;
                    case 2 :
                        mkdir(dir + o, next) ;
                        break ;
                    default:
                        next() ;
                    }
                    break ;
                        
                case 'boolean' :
                    if (object[o]) mkfile(dir + o, null, next) ;
                    else rm(dir + o, next) ;
                    break ;
            }
        } ;
    perform() ;
}

// Execution //

echo('Building architecture...'.white + '\n') ;

generate(arch, function() {
    echo('\n' + 'Architecture built.'.green) ;
}) ;
