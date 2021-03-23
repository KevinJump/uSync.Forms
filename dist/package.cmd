@echo off 

SET config=release
REM SET config=debug


call dotnet build ..\uSync.Forms\uSync.Forms.csproj -p:Configuration=%config% -clp:Verbosity=minimal;Summary

@Echo Packaging for %config%
nuget pack ..\uSync.Forms\uSync.Forms.nuspec -build  -OutputDirectory .\dist\%1 -version %1 -properties "depends=%1;Configuration=%config%"

REM call .\dist\CreatePackages %1

@ECHO Copying to LocalGit Folder
XCOPY .\dist\%1\*.nupkg c:\source\localgit /y

ECHO Packaging Complete (%config% build)

