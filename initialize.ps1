################################################################################
# File: Initialize.ps1
# Author: Tyler Matijevich
# Date: 2022-07-14
################################################################################

#######
# Usage
#######
# In File Explorer, right-click on this file and select Run with PowerShell to provide output file
# In Automation Studio, this step can be performed automatically by add the follow pre-build event:
# PowerShell -ExecutionPolicy ByPass -File $(WIN32_AS_PROJECT_PATH)\Logical\User\web\log\initialize.ps1
# Users are responsible to adjust the path according, an incorrect path will result in a build error
# To run multiple pre-build commands use: 

$ScriptName = $MyInvocation.MyCommand.Name
Write-Host "WebLogClient: Running $ScriptName powershell script"

############
# Parameters
############
# Modify values accordingly to update the JSON request structure
$RecordMax = 20 # Number of rows in table
$ProgramName = "WebLog" # PLC program to read data from
$StructureName = "display" # PLC variable
$ProjectPath = "\Logical\User\web\log" # Relative path in project to WebLogClient package

##########
# Argument
##########
if($args.Length -lt 1) {
    Write-Warning "WebLogClient: Missing project path.  Add arguments to pre-build event field"
    $OutputFile = "table.asp"
}
else {
    $OutputDirectory = $args[0] + $ProjectPath
    $OutputFile = $OutputDirectory + "\table.asp"
    if(-not [System.IO.Directory]::Exists($OutputDirectory)) {
        Write-Warning "WebLogClient: Directory to WebLogClient package does not exist.  Data table cannot be generated"
        exit 0
    }
    else {
        Write-Host "WebLogClient: Successfully found WebLogClient package"
    }
}

function NewEntry {
    param ([String]$Member, [Int]$Index)
    return "`"" + $Member + "`": `"<% ReadPLC(`"" + $ProgramName + ":" + $StructureName + "[" + $Index + "]." + $Member + "`"); %>`""
}

Set-Content $OutputFile "[ {`"tableOffset`": `"<% ReadPLC(`"WebLog:displayOffset`"); %>`"},"

for($i = 0; $i -lt $RecordMax; $i++) {
    $OutputContent = "{"
    $OutputContent += NewEntry event $i
    $OutputContent += ", "
    $OutputContent += NewEntry severity $i
    $OutputContent += ", "
    $OutputContent += NewEntry errorNumber $i
    $OutputContent += ", "
    $OutputContent += NewEntry logbook $i
    $OutputContent += ", "
    $OutputContent += NewEntry sec $i
    $OutputContent += ", "
    $OutputContent += NewEntry nsec $i
    $OutputContent += ", "
    $OutputContent += NewEntry description $i
    $OutputContent += ", "
    $OutputContent += NewEntry asciiData $i
    $OutputContent += ", "
    $OutputContent += NewEntry object $i
    $OutputContent += "}"
    if($i -eq $RecordMax - 1) {$OutputContent += "]"}
    else {$OutputContent += ","}
    Add-Content $OutputFile $OutputContent
}

Write-Host "WebLogClient: Successfully generated $OutputFile"
Write-Host "WebLogClient: $RecordMax entires in $StructureName structure of $ProgramName program"
