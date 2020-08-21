const readline = require('readline')
const fs = require('fs');
const path = require('path');
const process = require("process")
const { exec } = require('child_process');
const crypto = require('crypto');
const { resolve } = require('path');

//私有全局变量
let __config = {
    //控制台模块变量
    console_color: {
        "red": "\x1b[31m",
        "green": "\x1b[32m",
        "blue": "\x1b[34m",
        "white": "\x1b[37m",
        "black": "\x1b[30m",
        "yellow": "\x1B[33m",
        "reset": "\x1b[0m",
    },
}

function print(color, text) {//print
    if (!color) {//cls
        process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
    } else if (!text) {
        print("reset", color)
    } else {
        process.stdout.write((__config.console_color[color] || __config.console_color["reset"]) + text + __config.console_color["reset"])
        //console.log('%s%s\x1b[0m',__config.console_color[color]||__config.console_color["reset"],text);
    }
    return text
}

//readLine模块
async function readLine(color, text) {
    let res = "";
    let readlineIO;
    await new Promise((resolve) => {
        if (color) print(color, text)
        readlineIO = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
        readlineIO.on('line', (str) => {
            res = str;
            resolve(str);
        })
    }).then((str) => {
        readlineIO.close();
    }).catch((err) => {
        console.error(err)
    })
    return res;
}


//file模块
const file = {
    list: file_list,
    info: file_info,
    rename: file_rename,
    read: file_read,
    write: file_write,
    json: file_json,
    encrypt: file_encrypt,
    decrypt: file_decrypt,
}

function file_list(dir, deepth = -1) {
    let fileList = [], folderList = []
    if (deepth == 0) return fileList
    fs.readdirSync(dir).forEach((base, index) => {
        let fullPath = path.join(dir, base)
        let info = fs.statSync(fullPath)
        if (info.isDirectory()) folderList.push(fullPath)
        else if (info.isFile()) fileList.push(fullPath)
        else throw new Error("未知的信息类型(非文件非文件夹)")
    })
    if (deepth == 1) return fileList
    folderList.forEach((e) => {
        fileList = fileList.concat(file_list(e, deepth - 1))
    })
    return fileList
}

function file_info(filePath) {
    let info = fs.statSync(filePath)
    return {
        size: info.size,
        baseName: path.basename(filePath),
        extName: path.extname(filePath),//.toLowerCase(),
        dirName: path.dirname(filePath),
        "访问时间": info.atime,
        "修改时间": info.mtime,
        "创建时间": info.birthtime,
    }
}


/**
 * @param {*} filePath
 * @param {function} rename 1.func: (baseName,filePath)=>newName    2.string: newName
 * @return {string} newName 
 */
function file_rename(filePath, rename) {
    let newBase = typeof (rename) == 'function' ? rename(path.basename(filePath),filePath) : rename
    newBase = path.join(path.dirname(filePath), newBase)
    fs.renameSync(filePath, newBase)
    return newBase
}

function file_read(file) {
    return fs.readFileSync(file, 'utf8')
}

function file_write(file, data) {
    fs.writeFileSync(file, data)
    return data
}

function file_json(file) {
    let data = file_read(file)
    data = data ? JSON.parse(data) : {}
    return {
        "set": (key, value) => {
            switch (typeof (key)) {
                case 'string':
                    data[key] = value
                    break
                case 'object': //{a:..}
                    for (e in key) data[e] = key[e]
                    break
                default:
                    throw new Error("未知的key类型")
            }
            file_write(file, JSON.stringify(data))
        },
        "get": (key) => {
            switch (typeof (key)) {
                case 'string':
                    return data[key]
                case 'undefined':
                    data = file_read(file)
                    data = JSON.parse(data)
                    return data
                case 'object': //array
                    return key.map(v => data[v])
                default: throw new Error("未知的key类型")
            }
        },
        "clear": () => {
            file_write(file, JSON.stringify({}))
        }
    }
}

async function file_encrypt(file, pwd, newFile = file) {
    let tmpFile = null
    if (newFile === file) {
        tmpFile = file
        do { newFile += "0" } while (fs.existsSync(newFile))

    }
    await new Promise((resolve, reject) => {
        const cipher = crypto.createCipheriv(
            'aes-192-cbc',
            crypto.scryptSync(pwd, "salt", 24),
            Buffer.alloc(16, 0)
        )
        const input = fs.createReadStream(file)
        const output = fs.createWriteStream(newFile)
        input
            .pipe(cipher)
            .pipe(output)
            .on('finish', () => {
                if (tmpFile) {
                    fs.unlinkSync(file)
                    fs.renameSync(newFile, file)
                }
                return resolve()
            })
    })
}

async function file_decrypt(file, pwd, newFile = file) {
    let tmpFile = null
    if (newFile === file) {
        tmpFile = file
        do { newFile += "0" } while (fs.existsSync(newFile))

    }
    await new Promise((resolve, reject) => {
        const decipher = crypto.createDecipheriv(
            'aes-192-cbc',
            crypto.scryptSync(pwd, "salt", 24),
            Buffer.alloc(16, 0)
        )
        const input = fs.createReadStream(file)
        const output = fs.createWriteStream(newFile)
        input
            .pipe(decipher)
            .pipe(output)
            .on('finish', () => {
                if (tmpFile) {
                    fs.unlinkSync(file)
                    fs.renameSync(newFile, file)
                }
                return resolve()
            })
    })
}

// execSync
async function execSync(cmd) {
    let res = await new Promise((resolve, reject) => {
        exec(cmd, { encoding: 'binary' }, async (error, stdout, stderr) => {
            if (error) {
                return reject(error)
            }
            console.log({ stdout: stdout, stderr: stderr })
            return resolve({ stdout: stdout, stderr: stderr })
        })
    })
}

function encrypt(str, pwd) {
    const cipher = crypto.createCipheriv(
        'aes-192-cbc',
        crypto.scryptSync(pwd, "salt", 24),
        Buffer.alloc(16, 0)
    )
    let encrypted = cipher.update(str, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted
}

function decrypt(encrypted, pwd) {
    const decipher = crypto.createDecipheriv(
        'aes-192-cbc',
        crypto.scryptSync(pwd, "salt", 24),
        Buffer.alloc(16, 0)
    )
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}



module.exports = {
    print,
    readLine,
    file,
    execSync,
    encrypt,
    decrypt,
}
