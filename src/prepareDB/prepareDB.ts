export function copyDatabaseFile(dbName: string) {
    // @ts-ignore: Unreachable code error
    const sourceFileName = cordova.file.applicationDirectory + 'www/' + dbName;
    console.log({ sourceFileName });
    // @ts-ignore: Unreachable code error
    const targetDirName = cordova.file.dataDirectory;
    return Promise.all([
        new Promise((resolve, reject) => {
            // @ts-ignore: Unreachable code error
            resolveLocalFileSystemURL(sourceFileName, resolve, reject);
        }),
        new Promise((resolve, reject) => {
            // @ts-ignore: Unreachable code error
            resolveLocalFileSystemURL(targetDirName, resolve, reject);
        })
    ]).then((files) => {
        const sourceFile = files[0];
        const targetDir = files[1];
        return new Promise((resolve, reject) => {
            // @ts-ignore: Unreachable code error
            targetDir.getFile(dbName, {}, resolve, reject);
        }).then(() => {
            console.log(`file already copied`);
        }).catch(() => {
            console.log(`file doesn't exist, copying it`);
            return new Promise((resolve, reject) => {
                // @ts-ignore: Unreachable code error
                sourceFile.copyTo(targetDir, dbName, resolve, reject);
            }).then(() => {
                console.log(`database file copied`);
            });
        });
    });
}
