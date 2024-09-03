# sfcc-wildcard

![sfcc-wildcard](https://github.com/alimoncul/sfcc-wildcard/blob/main/demos/icon.png?raw=true)

https://open-vsx.org/extension/alimoncul/sfcc-wildcard
https://marketplace.visualstudio.com/items?itemName=alimoncul.sfcc-wildcard

## Overview

The SFCC Wildcard is a tool designed to enhance developer efficiency by dynamically resolving paths in Salesforce Commerce Cloud (SFCC) projects and highlighting overridden files. This functionality ensures that developers can quickly identify and manage file overrides, streamlining the development process.

## Features

### Path Resolving

Automatically resolves `require` paths using cartridge paths found in the project directory or through manual configuration.

![Path Resolving](https://github.com/alimoncul/sfcc-wildcard/blob/main/demos/dynamic_path_resolver.gif?raw=true)

### Show Overrides

Provides a shortcut to identify where a specific file has been overridden and navigate quickly.

![Show Overrides](https://github.com/alimoncul/sfcc-wildcard/blob/main/demos/override.gif?raw=true)

## Configurations

`sfcc.wildcard.cartridgePath` - Example: `payment_cartridge_custom:payment_cartridge:my_cartridge`

This extension utilizes `site.xml` files located in the metadata folder. If these files are not found, or if you prefer manual configuration, you can use this option to set it up.
