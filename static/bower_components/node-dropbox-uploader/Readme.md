# Node Dropbox Uploader

Node Dropbox Uploader uploads files to a Dropbox folder form the command line. The tool has been designed for usage on remote servers as part of an automated script such as database backups.

## Install
```bash
npm install node-dropbox-uploader
```

## Run
You will need a Dropbox Application key and secret for an application created at [www.dropbox.com/developers/apps](http://www.dropbox.com/developers/apps)

Provide these together with the file you wish to upload when running the command line tool

```bash
node-dropbox-uploader --dropbox-key <key> --dropbox-secret <secret> --filename <upload>
```

## First Time Configuration

If a valid .token file isn't present then you will need to authorise the backup application with your dropbox account. After executing the command you will be given a dropbox URL which will provide you with an authorisation code. Once entered, a .token file will be cached for future execution.

```bash
1) Visit: https://www.dropbox.com/1/oauth2/authorize?client_id=.....
2) Authorise Application
3) Enter Code Below
Dropbox Code>
```