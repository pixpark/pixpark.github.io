---
outline: deep
---

2018年8月4日第三次更新，详细介绍了RTMP协议与遇到的坑，另外纯Java重写了RTMP协议，做了个Android 推流项目，包含安卓相机采集，编码和RTMP推流，上传到github了。  
项目地址：[https://github.com/gezhaoyou/SimpleLivePublisherLite](https://links.jianshu.com/go?to=https%3A%2F%2Fgithub.com%2Fgezhaoyou%2FSimpleLivePublisherLite)  
参考文章：

> 1. Android RTMP直播推流Demo： <https://www.jianshu.com/p/0318ff29ac32>
> 2. 带你吃透RTMP：[http://mingyangshang.github.io/2016/03/06/RTMP%E5%8D%8F%E8%AE%AE/](https://links.jianshu.com/go?to=http%3A%2F%2Fmingyangshang.github.io%2F2016%2F03%2F06%2FRTMP%E5%8D%8F%E8%AE%AE%2F)

###  **1.** **简介**

RTMP协议是`Real Time Message Protocol`(实时信息传输协议)的缩写，它是由Adobe公司提出的一种应用层的协议，用来解决多媒体数据传输流的多路复用（Multiplexing）和分包（packetizing）的问题。随着VR技术的发展，视频直播等领域逐渐活跃起来，RTMP作为业内广泛使用的协议也重新被相关开发者重视起来。本文主要分享对RTMP的一些简介和实际开发中遇到的一些状况。

**RTMP协议基本特点：**

• 基于`TCP`协议的应用层协议

• 默认通信端口`1935`

**RTMP URL格式：**  
`rtmp://ip:[port]/appName/streamName`  
例如： `rtmp://192.168.178.218:1935/live/devzhaoyou`

> 参考：[https://blog.csdn.net/ai2000ai/article/details/72771461](https://links.jianshu.com/go?to=https%3A%2F%2Fblog.csdn.net%2Fai2000ai%2Farticle%2Fdetails%2F72771461)

###  2. **RTMP 握手**

`RTMP` 握手分为简单握手和复杂握手，现在`Adobe`公司使用`RTMP`协议的产品用复杂握手的较多，不做介绍。

### **握手包格式：**

```ruby
 0 1 2 3 4 5 6 7
+-+-+-+-+-+-+-+-+
|     version   |
+-+-+-+-+-+-+-+-+
 C0 and S0 bits

```

C0和S0：`1`个字节，包含了RTMP版本, 当前RTMP协议的版本为 `3`

```ruby
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           time (4 bytes)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           zero (4 bytes)                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           random bytes                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           random bytes                        |
|                               (cont)                          |
|                               ....                            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                        C1 and S1 bits

```

C1和S1：`4`字节时间戳，`4`字节的`0`，`1528`字节的随机数

```ruby
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          time (4 bytes)                       |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          time2 (4 bytes)                      |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          random echo                          |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          random echo                          |
 |                             (cont)                            |
 |                              ....                             |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                            C2 and S2 bits

```

C2和S2：`4`字节时间戳，`4`字节从对端读到的时间戳，`1528`字节随机数

###  **RTMP握手基本过程：**

```ruby
+-------------+                            +-------------+
|   Client    |      TCP/IP Network        |     Server  |
+-------------+             |              +-------------+
       |                    |                     |
Uninitialized               |                Uninitialized
       |        C0          |                     |
       |------------------->|           C0        |
       |                    |-------------------->|
       |        C1          |                     |
       |------------------->|           S0        |
       |                    |<--------------------|
       |                    |           S1        |
  Version sent              |<--------------------|
       |        S0          |                     |
       |<-------------------|                     |
       |        S1          |                     |
       |<-------------------|               Version sent
       |                    |           C1        |
       |                    |-------------------->|
       |        C2          |                     |
       |------------------->|           S2        |
       |                    |<--------------------|
    Ack sent                |                   Ack Sent
       |        S2          |                     |
       |<-------------------|                     |
       |                    |           C2        |
       |                    |-------------------->|
Handshake Done              |               Handshake Done
      |                     |                     |
          Pictorial Representation of Handshake

```

握手开始于客户端发送`C0`、`C1`块。服务器收到`C0`或`C1`后发送`S0`和`S1`。

当客户端收齐`S0`和`S1`后，开始发送`C2`。当服务器收齐`C0`和`C1`后，开始发送`S2`。

当客户端和服务器分别收到`S2`和`C2`后，握手完成。

**注意事项：** 在实际工程应用中，一般是客户端先将`C0`, `C1`块同时发出，服务器在收到`C1` 之后同时将`S0`, `S1`, `S2`发给客户端。`S2`的内容就是收到的`C1`块的内容。之后客户端收到`S1`块，并原样返回给服务器，简单握手完成。按照RTMP协议个要求，客户端需要校验`C1`块的内容和`S2`块的内容是否相同，相同的话才彻底完成握手过程，实际编写程序用一般都不去做校验。

RTMP握手的这个过程就是完成了两件事：

校验客户端和服务器端RTMP协议版本号

是发了一堆随机数据，校验网络状况。

###  **3**. RTMP 消息

RTMP消息格式：

```ruby
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 | Message Type |               Payload length                   |
 |   (1 byte)   |                   (3 bytes)                    |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          Timestamp                            |
 |                          (4 bytes)                            |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          Stream ID            |
 |                          (3 bytes)            |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                         Message Header

```

• 1字节消息类型

• 3字节负载消息长度

• 4字节时间戳

• 3字节 `Stream ID`，区分消息流

**注意事项：** 实际RTMP通信中并未按照上述格式去发送RTMP消息，而是将RTMP 消息分块发送，之后将介绍RTMP消息分块。

####  RTMP 消息分块（chunking）

而对于基于`TCP`的`RTMP`协议而言，协议显得特别繁琐，但是有没有更好的替代方案。同时创建`RTMP`消息分块是比较复杂的地方，涉及到了`AFM`（也是`Adobe`家的东西）格式数据的数据。

####  **3.1RTMP消息块格式：**

```ruby
 +--------------+----------------+--------------------+--------------+
 | Basic Header | Message Header | Extended Timestamp |  Chunk Data  |
 +--------------+----------------+--------------------+--------------+
 |                                                    |
 |<------------------- Chunk Header ----------------->|
                            Chunk Format

```

RTMP消息块构成：

• Basic Header

• Message Header

• Extended Timestamp

• Chunk Data

Chunk Basic header格式有3种:

格式1：

```cpp
   0 1 2 3 4 5 6 7
  +-+-+-+-+-+-+-+-+
  |fmt|   cs id   |
  +-+-+-+-+-+-+-+-+
 Chunk basic header 1

```

格式2：

```ruby
  0                      1
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |fmt|      0    |  cs id - 64   |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
      Chunk basic header 2

```

格式3：

```ruby
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |fmt|         1 |          cs id - 64           |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
             Chunk basic header 3

```

注意事项：

**fmt**: 用于指定`Chunk Header` 里面 `Message Header`的类型，后面会介绍到

**cs id**: 是`chunk stream id`的缩写，同一个`RTMP`消息拆成的 `chunk` 块拥有相同的 `cs id`, 用于区分chunk所属的RTMP消息, `chunk basic header` 的类型`cs id`占用的字节数来确定

#####  **Message Header格式：**

Message Header的类型通过上文`chunk basic header`中的`fmt`指定，共4种:

格式0:

```ruby
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          timestamp            | message length|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |      message length (cont)    |message type id| msg stream id |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |          message stream id (cont)             |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
                Chunk Message Header - Type 0

```

`Message Header`占用`11`个字节， 在`chunk stream`的开始的第一个`chunk`的时候必须采用这种格式。

• **timestamp**：`3`个字节，因此它最多能表示到`16777215=0xFFFFFF=2^24-1`, 当它的值超过这个最大值时，这三个字节都置为1，实际的`timestamp`会转存到`Extended Timestamp`字段中，接受端在判断`timestamp`字段24个位都为1时就会去`Extended timestamp`中解析实际的时间戳。

• **message length**：`3`个字节，表示实际发送的消息的数据如音频帧、视频帧等数据的长度，单位是字节。注意这里是Message的长度，也就是chunk属于的Message的总数据长度，而不是chunk本身Data的数据的长度。

• **message type id**：`1`个字节，表示实际发送的数据的类型，如`8`代表音频数据、`9`代表视频数据。

• **msg stream id**：4个字节，表示该chunk所在的流的`ID`，和`Basic Header`的`CSID`一样，它采用小端存储的方式

格式1：

```ruby
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                          timestamp            | message length|
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |      message length (cont)    |message type id|  
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ 
                Chunk Message Header - Type 1 

```

`Message Header`占用7个字节，省去了表示`msg stream id`的4个字节，表示此`chunk`和上一次发的`chunk`所在的流相同。

• **timestamp delta**：3个字节，注意这里和格式0时不同，存储的是和上一个chunk的时间差。类似上面提到的`timestamp`，当它的值超过3个字节所能表示的最大值时，三个字节都置为1，实际的时间戳差值就会转存到`Extended Timestamp`字段中，接受端在判断`timestamp delta`字段24个位都为1时就会去`Extended timestamp`中解析时机的与上次时间戳的差值。

格式2：

```dart
  0                   1                   2     
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ 
 |                          timestamp            |  
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ 
          Chunk Message Header - Type 2 

```

`Message Header`占用3个字节，相对于格式1，又省去了表示消息长度的3个字节和表示消息类型的1个字节，表示此chunk和上一次发送的chunk所在的流、消息的长度和消息的类型都相同。余下的这三个字节表示`timestamp delta`，使用同格式1。

格式3：

0字节，它表示这个chunk的`Message Header`和上一个是完全相同的，无需再次传送

#####  **Extended Timestamp（扩展时间戳）：**

在`chunk`中会有时间戳`timestamp`和时间戳差`timestamp delta`， 只有这两者之一大于3个字节能表示的最大数值`0xFFFFFF＝16777215`时，才会用这个字段来表示真正的时间戳，否则这个字段**不传**（感谢评论区 @[hijiang](https://www.jianshu.com/u/b400a0703f6e)指出错误）。

扩展时间戳占`4`个字节，能表示的最大数值就是`0xFFFFFFFF＝4294967295`。当扩展时间戳启用时，`timestamp`字段或者`timestamp delta`要全置为`1`，表示应该去扩展时间戳字段来提取真正的时间戳或者时间戳差。注意扩展时间戳存储的是完整值，而不是减去时间戳或者时间戳差的值。

**Chunk Data（块数据）**： 用户层面上真正想要发送的与协议无关的数据，长度在(0,chunkSize\]之间, `chunk size`默认为`128`字节。

#####  **RTMP 消息分块注意事项**

• **Chunk Size**:

RTMP是按照`chunk size`进行分块，`chunk size` 指的是 `chunk`的`payload`部分的大小，不包括`chunk basic header` 和 `chunk message header`长度。客户端和服务器端各自维护了两个`chunk size`, 分别是自身分块的`chunk size` 和 对端 的`chunk size`, 默认的这两个`chunk size`都是128字节。通过向对端发送`set chunk size` 消息可以告知对方更改了 `chunk size`的大小。

• **Chunk Type**:

RTMP消息分成的`Chunk`有`4`种类型，可以通过 `chunk basic header`的高两位(`fmt`)指定，一般在拆包的时候会把一个RTMP消息拆成以格式`0`开始的`chunk`，之后的包拆成格式`3` 类型的`chunk`，我查看了有不少代码也是这样实现的，这样也是最简单的实现。

如果第二个`message`和第一个`message`的`message stream ID` 相同，并且第二个`message`的长度也大于了`chunk size`，那么该如何拆包？当时查了很多资料，都没有介绍。后来看了一些源码，如 `SRS`，`FFMPEG`中的实现，发现第二个`message`可以拆成`Type_1`类型一个`chunk`， `message`剩余的部分拆成`Type_3`类型的`chunk`。`FFMPEG`中就是这么做的。

####  3.2 **RTMP 交互消息**

推流RTMP消息交互流程：

- ![img](https://upload-images.jianshu.io/upload_images/1111194-54ff023d7e493ad6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/890/format/webp)
  
    pic\_2.png

关于推流的过程，RTMP的协议文档上给了上图示例，说一下推流注意事项：

#####  **3.2.1** **Connect 消息**

RTMP 命令消息格式：

```ruby
 +----------------+---------+---------------------------------------+
 |  Field Name    |   Type  |               Description             |
 +--------------- +---------+---------------------------------------+
 |   Command Name | String  | Name of the command. Set to "connect".|
 +----------------+---------+---------------------------------------+
 | Transaction ID | Number  |            Always set to 1.           |
 +----------------+---------+---------------------------------------+
 | Command Object | Object  |  Command information object which has |
 |                |         |           the name-value pairs.       |
 +----------------+---------+---------------------------------------+
 | Optional User  | Object  |       Any optional information        |
 |   Arguments    |         |                                       |
 +----------------+---------+---------------------------------------+

```

RTMP握手之后先发送一个`connect`命令消息，命令里面包含什么东西，协议中没有具体规定，实际通信中要携带 rtmp url 中的 `appName` 字段，并且指定一些编解码的信息，并以`AMF`格式发送, 下面是用wireshake抓取`connect`命令需要包含的参数信息：

- ![img](https://upload-images.jianshu.io/upload_images/1111194-5dea339938a56f7c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1200/format/webp)
  
    pic\_3.png

这些信息协议中并没有特别详细说明, 在`librtmp`，`srs-librtmp`这些源码中，以及用wireshark 抓包的时候可以看到。

服务器返回的是一个\_result命令类型消息，这个消息的`payload length`一般不会大于`128`字节，但是在最新的`nginx-rtmp`中返回的消息长度会大于128字节。

消息的`transactionID`是用来标识`command`类型的消息的，服务器返回的`_result`消息可以通过`transactionID`来区分是对哪个命令的回应，`connect` 命令发完之后还要发送其他命令消息，要保证他们的`transactionID`不相同。

发送完`connect`命令之后一般会发一个 `set chunk size`消息来设置`chunk size`的大小，也可以不发。

`Window Acknowledgement Size` 是设置接收端消息窗口大小，一般是`2500000`字节，即告诉对端在收到设置的窗口大小长度的数据之后要返回一个`ACK`消息。在实际做推流的时候推流端要接收很少的服务器数据，远远到达不了窗口大小，所以这个消息可以不发。而对于服务器返回的`ACK`消息一般也不做处理，默认服务器都已经收到了所有消息了。

之后要等待服务器对于`connect`消息的回应的，一般是把服务器返回的`chunk`都读完，组包成完整的`RTMP`消息，没有错误就可以进行下一步了。

#####  **3.2.2** **Create Stream 消息**

创建完`RTMP`连接之后就可以创建`RTMP`流，客户端要想服务器发送一个`releaseStream`命令消息，之后是`FCPublish`命令消息，在之后是`createStream`命令消息。

当发送完`createStream`消息之后，解析服务器返回的消息会得到一个`stream ID`。

- ![img](https://upload-images.jianshu.io/upload_images/1111194-f370aee91bc73c2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1200/format/webp)
  
    pic\_4.png

这个ID也就是以后和服务器通信的 `message stream ID`, 一般返回的是1，不固定。

##### **3.2.3** **Publish Stream**

推流准备工作的最后一步是`Publish Stream`，即向服务器发一个`publish`命令消息，消息中会带有流名称字段，即rtmp url中的 `streamName`，这个命令的`message stream ID` 就是上面 `create stream` 之后服务器返回的`stream ID`，发完这个命令一般不用等待服务器返回的回应，直接发送音视频类型的RTMP数据包即可。有些rtmp库还会发`setMetaData`消息，这个消息可以发也可以不发，里面包含了一些音视频`meta data`的信息，如视频的分辨率等等。

**整个推流过程rtmp 消息抓包**

- ![img](https://upload-images.jianshu.io/upload_images/1111194-2fcba45b9234e725.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1200/format/webp)
  
    rtmp\_pulish\_message.png

###  **4. 推送音视频**

当以上工作都完成的时候，就可以发送音视频了。音视频RTMP消息的Payload(消息体)中都放的是按照`FLV-TAG`格式封的音视频包，具体可以参照`FLV`封装的协议文档。格式必须封装正确，否则会造成播放端不能正常拿到音视频数据，无法播放音视频。

###  **5. 关于RTMP的时间戳**

RTMP的时间戳单位是毫秒`ms`，在发送音视频之前一直为零，发送音视频消息包后时候必须保证时间戳是单调递增的，时间戳必须打准确，否则播放端可能出现音视频不同步的情况。Srs-librtmp的源码中，如果推的是视频文件的话，发现他们是用H264的`dts`作为时间戳的。实时音视频传输的时候是先获取了下某一时刻系统时间作为基准，然后每次相机采集到的视频包，与起始的基准时间相减，得到时间戳，这样可以保证时间戳的正确性。

###  **6. 关于Chunk Stream ID**

RTMP 的`Chunk Steam ID`是用来区分某一个chunk是属于哪一个`message`的 ，0和1是保留的。每次在发送一个不同类型的RTMP消息时都要有不用的chunk stream ID, 如上一个Message 是command类型的，之后要发送视频类型的消息，视频消息的`chunk stream ID` 要保证和上面 `command`类型的消息不同。每一种消息类型的起始chunk 的类型必须是 `Type_0` 类型的，表明新的消息的起始。

###  **总结：**

RTMP协议是个比较啰嗦的协议，实现起来也比较复杂，但通信过程过程相对简单。在直播的实际工程应用中，协议上很多地方都没有详细说明，注意了以上提到几点，基本能够保证RTMP音视频的通信正常。以上就是对RTMP协议的简介和一些注意事项，希望能帮到有需要的朋友，另外本文难免有错误或说的不够详细的地方，欢迎指正，一起交流探讨。

- - - - - -

###  本篇文章2017年版本

前一段时间写过一篇文章: [iOS直播视频数据采集、硬编码保存h264文件](https://www.jianshu.com/p/337830891996)，比较详细的记录了在做iOS端进行视频数据采集和编码的过程，下一步要做的就是RTMP协议推流。因为在公司将RTMP协议用Java 和 Swift 分别实现了一遍，所以对这块比较了解，中间遇到了不少坑，记录下来也怕自己忘掉。  
RTMP协议是 Adobe 公司开发的一个基于TCP的应用层协议，Adobe 公司也公布了关于RTMP的规范，但是这个协议规范介绍的有些地方非常模糊，很多东西和实际应用是有差别的。网上也有不少关于这个协议的介绍，但都不是太详细。我遇到的比较好的参考资料就是这篇：[带你吃透RTMP](https://links.jianshu.com/go?to=http%3A%2F%2Fmingyangshang.github.io%2F2016%2F03%2F06%2FRTMP%E5%8D%8F%E8%AE%AE%2F), 这篇文章只是在理论上对RTMP进行了比较详细的解释，很多东西还是和实际应用有出入。我这篇文章只是把遇到的一些坑记录下来，并不是详解RTMP消息的。  
另外懂RTMP消息拆包分包，而不真正的写写的话是很难把RTMP协议弄得的很清楚，关于RTMP协议的实现也是比较麻烦的事，懂和做事两回事。  
另外用wireshark 抓一下包的话可以非常直观的看到RTMP通信的过程，对理解RTMP非常有帮助，在调试代码的时候也大量借助wireshark排错，是一个非常有用的工具。

###  1. RTMP 握手

RTMP 握手分为简单握手和复杂握手，现在Adobe公司使用RTMP协议的产品应该用的都是复杂握手，这里不介绍，只说简单握手。 按照网上的说法RTMP握手的过程如下

> 1. 握手开始于客户端发送C0、C1块。服务器收到C0或C1后发送S0和S1。

1. 当客户端收齐S0和S1后，开始发送C2。当服务器收齐C0和C1后，开始发送S2。
2. 当客户端和服务器分别收到S2和C2后，握手完成。

在实际工程应用中，一般是客户端先将`C0`, `C1`块同时发出，服务器在收到`C1` 之后同时将`S0`, `S1`, `S2`发给客户端。S2的内容就是收到的C1块的内容。之后客户端收到S1块，并原样返回给服务器，简单握手完成。按照RTMP协议个要求，客户端需要校验C1块的内容和S2块的内容是否相同，相同的话才彻底完成握手过程，实际编写程序用一般都不去做校验。  
RTMP握手的这个过程就是完成了两件事：1. 校验客户端和服务器端RTMP协议版本号，2. 是发了一堆数据，猜想应该是测试一下网络状况，看看有没有传错或者不能传的情况。RTMP握手是整个RTMP协议中最容易实现的一步，接下来才是大头。

###  2. RTMP 分块

创建RTMP连接算是比较难的地方，开始涉及消息分块（chunking）和 AFM（也是Adobe家的东西）格式数据的一些东西，在上面提到的文章中也有介绍为什要进行RTMP分块。

####  Chunk Size

RTMP是按照chunk size进行分块，chunk size指的是 chunk的payload部分的大小，不包括chunk basic header 和 chunk message header，即chunk的body的大小。客户端和服务器端各自维护了两个chunk size, 分别是自身分块的chunk size 和 对端 的chunk size, 默认的这两个chunk size都是128字节。通过向对端发送`set chunk size` 消息告知对方更改了 chunk size的大小，即告诉对端：我接下来要以xxx个字节拆分RTMP消息，你在接收到消息的时候就按照新的chunk size 来组包。  
在实际写代码的时候一般会把chunk size设置的很大，有的会设置为4096，FFMPEG推流的时候设置的是 60\*1000，这样设置的好处是避免了频繁的拆包组包，占用过多的CPU。设置太大的话也不好，一个很大的包如果发错了，或者丢失了，播放端就会出现长时间的花屏或者黑屏等现象。

####  Chunk Type

RTMP 分成的Chunk有4中类型，可以通过 chunk basic header的 高两位指定，一般在拆包的时候会把一个RTMP消息拆成以 Type\_0 类型开始的chunk，之后的包拆成 Type\_3 类型的chunk，我查看了有不少代码也是这样实现的，这样也是最简单的实现。  
RTMP 中关于Message 分chunk只举了两个例子，这两个例子不是很具有代表性。假如第二个message和第一个message的message stream ID 相同，并且第二个message的长度也大于了chunk size，那么该如何拆包？当时查了很多资料，都没有介绍。后来看了一些源码，发现第二个message可以拆成Type\_1类型一个chunk, message剩余的部分拆成Type\_3类型的chunk。FFMPEG中好像就是这么做的。

###  3. RTMP 消息

关于推流的过程，RTMP的协议文档上给了一个示例，而真实的RTMP通信过程和它有较大的差异，只说推流，RTMP播放端我没有做过。

#### Connect消息

握手之后先发送一个connect 命令消息，命令里面包含什么东西，协议中没有说，真实通信中要指定一些编解码的信息，这些信息是以AMF格式发送的, 下面是用swift 写的connect命令包含的参数信息：

```csharp
       transactionID += 1 // 0x01
        let command:RTMPCommandMessage = RTMPCommandMessage(commandName: "connect", transactionId: transactionID, messageStreamId: 0x00)
        let objects:Amf0Object = Amf0Object()
        objects.setProperties("app", value: rtmpSocket.appName)
        objects.setProperties("flashVer",value: "FMLE/3.0 (compatible; FMSc/1.0)")
        objects.setProperties("swfUrl", value:"")
        objects.setProperties("tcUrl", value: "rtmp://" + rtmpSocket.hostname + "/" + rtmpSocket.appName)
        objects.setProperties("fpad", value: false)
        objects.setProperties("capabilities", value:239)
        objects.setProperties("audioCodecs", value:3575)
        objects.setProperties("videoCodecs", value:252)
        objects.setProperties("videoFunction",value: 1)
        objects.setProperties("pageUrl",value: "")
        objects.setProperties("objectEncoding",value: 0)

```

这些信息具体什么意思我也不太明白，协议中也没有，都是我在看librtmp，srs-librtmp这些源码，以及用wireshark 抓包的时候看到的。其中参数少一两个貌似也没问题，但是`audioCodecs`和`videoCodecs`这两个指定音视频编码信息的不能少。  
服务器返回的是一个\_result命令类型消息，这个消息的payload length一般不会大于128字节，但是在最新的nginx-rtmp中返回的消息长度会大于128字节，所以一定要做好收包，组包的工作。  
关于消息的transactionID是用来标识command类型的消息的，服务器返回的\_result消息可以通过 transactionID来区分是对哪个命令的回应，connect 命令发完之后还要发送其他命令消息，要保证他们的transactionID不相同。  
发送完connect命令之后一般会发一个 set chunk size消息来设置chunk size 的大小，也可以不发。  
Window Acknowledgement Size 是设置接收端消息窗口大小，一般是2500000字节，即告诉客户端你在收到我设置的窗口大小的这么多数据之后给我返回一个ACK消息，告诉我你收到了这么多消息。在实际做推流的时候推流端要接收很少的服务器数据，远远到达不了窗口大小，所以基本不用考虑这点。而对于服务器返回的ACK消息一般也不做处理，我们默认服务器都已经收到了这么多消息。  
之后要等待服务器对于connect的回应的，一般是把服务器返回的chunk都读完组成完整的RTMP消息，没有错误就可以进行下一步了。

####  Create Stream 消息

创建完RTMP连接之后就可以创建RTMP流，客户端要想服务器发送一个`releaseStream`命令消息，之后是`FCPublish`命令消息，在之后是`createStream`命令消息。当发送完`createStream`消息之后，解析服务器返回的消息会得到一个`stream ID`, 这个ID也就是以后和服务器通信的 `message stream ID`, 一般返回的是1，不固定。

#### <a aria-hidden="true" class="anchor" id="publish-stream"><span class="octicon octicon-link"></span></a>Publish Stream

推流准备工作的最后一步是 Publish Stream，即向服务器发一个`publish`命令，这个命令的message stream ID 就是上面 create stream 之后服务器返回的stream ID，发完这个命令一般不用等待服务器返回的回应，直接下一步发送音视频数据。有些rtmp库 还会发`setMetaData`消息，这个消息可以发也可以不发，里面包含了一些音视频编码的信息。

### 4. 发布音视频

当以上工作都完成的时候，就可以发送音视频了。音视频RTMP消息的Payload中都放的是按照FLV-TAG格式封的音视频包，具体可以参照FLV协议文档。

### 5. 关于RTMP的时间戳

RTMP的时间戳在发送音视频之前都为零，开始发送音视频消息的时候只要保证时间戳是单增的基本就可以正常播放音视频。我读Srs-librtmp的源码，发现他们是用h264的dts作为时间戳的。我在用java写的时候是先获取了下当前系统时间，然后每次发送消息的时候都与这个起始时间相减，得到时间戳。

### 6. 关于Chunk Stream ID

RTMP 的Chunk Steam ID是用来区分某一个chunk是属于哪一个message的 ,0和1是保留的。每次在发送一个不同类型的RTMP消息时都要有不用的chunk stream ID, 如上一个Message 是command类型的，之后要发送视频类型的消息，视频消息的chunk stream ID 要保证和上面 command类型的消息不同。每一种消息类型的起始chunk 的类型必须是 Type\_0 类型的，表明我是一个新的消息的起始。

- - - - - -

另外这篇文章有些地方还是说的模糊，以后有时间慢慢丰富吧。

