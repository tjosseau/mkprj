#!/bin/bash

# mkprj Project Architecture Generator - Shell launcher
#
# @author      Thomas Josseau
# @version     1.2.2
# @date        2014.01.26
# @link        https://github.com/tjosseau/mkprj
# 
# @description
#       Shell & JavaScript library to build files and folders architectures,
#       defined in a Yaml config file and parsed with Node.js.
#       Yaml syntax allows you to have a nice overview of your application structure.

#--------------------------------#
DIR=$(dirname ${BASH_SOURCE[0]})
LOCATION=`pwd`

# Dependencies
source $DIR/lib/colors.sh

# Constants
archbase_dir=$DIR"/ARCHBASE"
modules_dir=$DIR"/MODULES"
#--------------------------------#

# Checking if Node.js is installed.
if ! type "node" > /dev/null ; then
    echo -e $red"Node.js is required to run this script."$_def_
    exit 1
fi

case $1 in

    dir)
        echo $DIR
        ;;

	*)
		echo -e $cyan"Build new architecture at : "$_def_$LOCATION

        # Architecture config file found
		if [ -f "architecture.yml" ] ; then
            echo -e $green"Architecture config file found."$_def_

        # Architecture config initialization
        else
            echo -e $cyan"Creating architecture..."$_def_
            
            echo -e "\nChoose a base architecture (or none to create an empty file) :\n"$green
            ls $archbase_dir
            echo -en $_def_"\n> "
            read choice
            if [ "$choice" = "" ] ; then
                archfile="default.yml"
            elif [ -f $archbase_dir/$choice ] ; then
                archfile=$choice
            else
                echo -e $red"Architecture base file not found."$_def_
                archfile="none"
            fi
            
            if [ "$archfile" = "none" ] ; then
                touch architecture.yml
            else
                cp $archbase_dir/$archfile ./architecture.yml
            fi
            
            # Editing config file
            echo -en "\nDefine a config file editor ('vim', 'explorer', ...) :\n> "
            read editor
            if [ "$editor" = "" ] ; then
                echo -e $cyan"No editor given."$_def_
            elif type $editor > /dev/null ; then
                $editor architecture.yml
            else
                echo -e $red"Command '"$editor"' not found."$_def_
            fi

            echo -e $cyan"\nAvailable modules :"$green
            ls $modules_dir
            echo -e $_def_

            # Bower components
            # You could prefer to copy sources from bower_components instead of using them when it comes to publish a production version.
            if [ -d bower_components ] ; then
                echo -e $cyan"Available bower components :"$green
                ls bower_components
                echo -e $_def_
            fi

            echo -en "Edit your architecture config file and press enter to continue."
            read
        fi
        
        # Executing architecture build
        node $DIR/mkarch.js
		;;

esac
