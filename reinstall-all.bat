@echo off

echo Cleaning node_modules folders...
rd /s /q node_modules
rd /s /q packages\icons\node_modules
rd /s /q apps\admin\node_modules
rd /s /q apps\web\node_modules
rd /s /q apps\shop\node_modules

echo Cleaning pnpm store...
call pnpm store prune

echo Reinstalling dependencies...
call pnpm install

echo Done! All dependencies have been reinstalled.
