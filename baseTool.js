const readline = require('readline')
const fs = require('fs');
const path = require('path');
const process = require("process")
const { exec } = require('child_process');
const { resolve } = require('path');
const { stdout, stderr } = require('process');


//控制台模块
let console_color = {
    "red": "\x1b[31m",
    "green": "\x1b[32m",
    "blue": "\x1b[34m",
    "white": "\x1b[37m",
    "black": "\x1b[30m",
    "yellow": "\x1B[33m",
    "reset": "\x1b[0m",
};
function print(color, text) {//print
    if (!color) {//cls
        process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
    } else if (!text) {
        print("reset", color)
    } else {
        process.stdout.write((console_color[color] || console_color["reset"]) + text + console_color["reset"])
        //console.log('%s%s\x1b[0m',console_color[color]||console_color["reset"],text);
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
        extName: path.extname(filePath).toLowerCase(),
        dirName: path.dirname(filePath),
        "访问时间": info.atime,
        "修改时间": info.mtime,
        "创建时间": info.birthtime,
    }
}


function file_rename(filePath, rename) {
    let newBase = typeof (rename) == 'function' ? rename(filePath) : rename
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

// execSync
async function execSync(cmd){
    let res = await new Promise((resolve,reject)=>{
        exec(cmd,{ encoding: 'binary' },async(error,stdout,stderr)=>{
            if(error){
                return reject(error)
            }
            console.log({stdout:stdout,stderr:stderr})
            return resolve({stdout:stdout,stderr:stderr})
        })
    })
}


module.exports = {
    print,
    readLine,
    file,
    execSync,
}
