#### print( color , text )

向控制台输出一串字符串(默认不换行)

+ color: 可选，输出字符串的颜色

  ```javascript
  color = {
  	red, green, blue, white, black, yellow, reset
  }
  ```

+ text: 输出的文本

+ return: text

+ 示例

  ```javascript
  print("red","这是红色的信息")
  print("这是默认颜色的信息")
  print("这是换行的信息\n")
  ```

  ---

#### readLine ( color , text )

从控制台读取一行字符串

+ color: 可选,同`print()`的`color`参数

+ text: 提示文本
+ return: 读取的字符串(不含结尾的`\n`)

+ 示例

  ```javascript
  let name = await readLine("输入你的名字：")
  let stst = await readLine("red","确定退出吗？\n")
  await readLine()
  ```

  

---

#### file.list( dir, deepth )

遍历path目录

+ dir: 遍历的目录
+ deepth: 递归遍历文件夹的深度，默认遍历所有子文件夹，为`1`时只遍历dir文件夹
+ return: 文件路径数组

+ 示例

  ```javascript
  file.list('./')
  file.list('./',2)
  ```



---

#### file.info ( filePath )

文件信息（选取于fs.stat）

+ filePath: 文件路径

+ return: 

  ```json
  {
  	size, 
  	baseName, extName, dirName, 
  	访问时间, 修改时间, 创建时间,
  }
  ```

  <font color="red">注意，extName默认被转为小写字母格式</font>

+ 示例

  ```javascript
  file.info('./baseTool.js')
  ```

  结果：

  ```json
  {
    size: 3158,
    baseName: 'baseTool.js',
    extName: '.js',
    dirName: '.',
    '访问时间': 2020-08-12T08:06:49.695Z,
    '修改时间': 2020-08-12T08:06:49.480Z,
    '创建时间': 2020-08-12T04:16:35.553Z
  }
  ```

---

#### file.rename ( filePath , rename )

重命名文件

+ filePath: 文件路径
+ rename: 
  + ( filePath ) => newName
  + string: newName
+ return: 改名后的文件路径

+ 示例

  ```javascript
  file.rename('./a.txt','b.txt')
  file.rename('./a.txt',(v)=>'b.txt')
  
  //批量重命名当前文件夹的png图片
  file.list('./',1)
      .filter(v=>file.info(v).extName==".png")
  	.forEach((v,i)=>file.rename(v,i+".png"))
  ```

---

#### file.read ( file )

以utf8格式读取文件

+ file: 文件路径
+ return: 文件内容

#### file.write ( file )

以utf8重写文件

+ file: 文件路径
+ return: 写入内容

---

#### file.json( file )

创建file.json对象

+ file: 文件路径

+ return: Object

  + Object: 

    + set : (key,value)

      设置json[key]=value

    + get: (key)

      获取json[key]

    + clear: ()

      清除json

+ 示例

  ```javascript
  let a = file.json('./a.json')
  // set
  a.set({a:23,b:"hello"})
  a.set("c",23)
  
  // get
  a.get("c") // 23
  a.get(["a","b","c"]) // [23,"hello",23]
  json_a=a.get() // {a,b,c}
  
  // clear
  a.clear() // {}
  ```

---

#### execSync ( cmd )

执行cmd命令

+ cmd: 命令

+ return {stdout,stderr}

+ 示例

  ```javascript
  await execSync("echo | npm --version")
  ```

---

