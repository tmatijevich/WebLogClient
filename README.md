# WebLogClient

WebLogClient is a front-end package to display log records in an easy to read table format.  The client requests and receives information from the required [WebLog](https://github.com/tmatijevich/WebLog) program.  WebLogClient uses http requests written in javascript with active webpage elements (ASP) to communicate with a server.  Controllers programmed in Automation Studio have an intergrated web server included and enabled by default.  This package is designed for Automation Studio, is not an official package, and is provided as-in under the [GNU GPL v3.0](https://choosealicense.com/licenses/gpl-3.0/) license.

## Features

- All [WebLog](https://github.com/tmatijevich/WebLog) features
    - Refresh
    - Seek backward (down)
    - Seek forward (up) requests
    - Filtering (planned)

## Installation

- Download and unarchive the WebLogClient package
- Create two directies `User\web\` in the Logical View of the Automation Studio project
- Add the WebLogClient package to the web directory
    - This directory may be renamed, through the name will be used to access the web page
- Specify the user directory under installation settings
    - The installation settings are accessed once the project is built and prompted to download
- Add pre-build event to generate ASP data
    - `PowerShell -ExecutionPolicy ByPass -File $(WIN32_AS_PROJECT_PATH)\Logical\User\web\log\initialize.ps1 $(WIN32_AS_PROJECT_PATH)`
    - Access the CPU properties, under the Build Events tab, populate the Pre-Build Step with the command above
- Install the project and access the web page with `<ip_address>/log`
- All directories `User`, `web`, `log`, may be renamed
    - **Note** changes to settings when changing the names of the directories
    - The integrated web server's default root directory is `web\`, changing the directory name will require the user to change the integrated web server's root directory path.

## Customization

Modifications such as number of records (number of rows in table) can be made in the `script.js` and `initialize.ps1` files.

- `script.js`
    - `numRecords` (default 20) Number of records (table rows)
    - `taskName` (default "WebLog") Name of program in Automation Studio project
- `initialize.ps1`
    - `$RecordMax` (default 20) Number of records (table rows)
    - `$ProgramName` (default "WebLog") Name of program in Automation Studio project
    - `$ProjectPath` (default "\Logical\User\web\log") Relative path in project to WebLogClient

## Dependencies

- [WebLog](https://github.com/tmatijevich/WebLog)
- Integrated web server in Automation Studio project (enabled by default with root path `web\`)

## Acknowledgements

- [Stephan](https://github.com/br-automation-com/mappView-Logbook)
- [Christoph](https://github.com/hilch)
