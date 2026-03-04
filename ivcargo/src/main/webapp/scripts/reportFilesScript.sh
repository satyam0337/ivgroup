#!/bin/bash

# Define variables
folderPath="/home/naveen/IVWORKSPACE/gittags/ivworkspace/"
folderFirstPath="/home/naveen/IVWORKSPACE/gittags/ivworkspace/ivcargo/src/main/resources/properties"
folderSecondPath="/home/naveen/IVWORKSPACE/gittags/ivworkspace/akkaresources/src/main/resources/com/iv/configuration"

commitMessage="for testing "
username="naveen"  # Replace with your Git username
password="naveen@123"  # Replace with your Git password

# Change directory to the repository
cd "$folderPath" || exit


# Set the Git credentials for this session
git config credential.username "$username"
git config credential.helper 'store --file ~/.git-credentials'
 

# Add all changes to the staging area
git add "$folderFirstPath"
git add "$folderSecondPath"


# Commit changes with the provided message
git commit -m "$commitMessage"

# Push changes to the remote repository (assuming the remote is named "origin")

git push origin naveen/55827
