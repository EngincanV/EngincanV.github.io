---
layout: post
title:  "What is Code/IL Weaving?"
date:   2022-06-12 14:00:00 +0300
categories: Code-Weaving IL-Weaving Compile-Time Run-Time
---

In this article, I'll describe what "Code/IL Weaving" is. But before describing the term of Code Weaving it can be better to examine the compile and runtime stages of a .NET application.

## Compilation Process (Running Stages) of a .NET Application

While creating an application, we write our code in an IDE (or text editor) and simply click the "Run/Execute" button on this IDE or use a CLI command (**dotnet run**, **yarn start** etc.) to run this application. But we ignore what is going on in background.

![Running Stages](/assets/images/weaving-article/running-stages.png)

Let's examine the above image and see what is going on while running a .NET application:

1-) Our code is compiled with **C# Compiler** and converted to a mid-level language named **IL Code**.

2-) **IL (Intermediate Language):** To be able to run our application as platform-independent, our code transforms into this mid-level language and after the transformation, two files are created: **MyProgram.exe**, **MyProgram.dll**.

> In this **IL Code**, **variable definitions**, **how to store variables**, **how to run methods**, **arithmetic operations**, **logical operations**, **memory usages**, **exception handling**, and all sort of these instructions are stored.

3-) Until this point, all of these steps happened in the compile-time. From that point, our application needs to be converted to machine code to be understandable by computers (processors). Because our computer doesn't know the C# code but machine code.

4-) After our code is compiled and ensure there are not any compile-time errors (syntax errors or etc.), then run-time operations (**CLR - Common Language Runtime**) can be started. At this point, **JIT Compiler (JIT - Just in Time)** is used to convert **IL Code** to **machine code**.

5-) After the process of converting IL Code to machine code is completed then the application can be run.

We briefly examined the processes of code compiling/running stages and refresh our memory. So, we can start defining "what Code/IL weaving" is.

## What is Code/IL Weaving?

After our application code is compiled and converted to **IL code**, injecting (changing the code or adding a new piece of code) any code block (it can be a frequently repeated code block in each class) to this created **IL** is called **Assembly/Code/IL Weaving**.

> In other words, the process of manipulating a compiled `*.dll` file to inject/add new code blocks and as a result add extra instructions is called **IL Weaving**.

In the .NET world, there is a package named **Fody** and used for IL Weaving. 

![IL Weaving with Fody](/assets/images/weaving-article/il-weaving-with-fody.png)

> You can see the steps of IL Weaving with **Fody** in the image above.

There are pre-defined packages for some of the methods that we use frequently use while developing an application. For example, the [ToString.Fody](https://github.com/Fody/ToString) package.

After downloading this package and making the necessary configurations in the `FodyWeavers.xml` file,

![TestClass.cs](/assets/images/weaving-article/il-weaving-1.png)

for our **TestClass.cs** that defined above IL code will be manipulated and

![TestClass.cs (Manipulated)](/assets/images/weaving-article/il-weaving-2.png)

converted like the above image. Thanks to **Fody.ToString** package, we don't need to manually override the each class's `ToString` method and change it to our needs with the power of **IL Weaving**, **Fody** doed this on behalf of us.

---

I want to end this article by sharing the frequently used **Fody** packages: [Obsolete](https://github.com/Fody/Obsolete), [NullGuard](https://github.com/Fody/NullGuard), [ConfigureAwait](https://github.com/Fody/ConfigureAwait), [Equals](https://github.com/Fody/Equals) vb.

Thanks for reading this article. See you in the next post.

---

## References

* [C# Compilation Process](https://codeasy.net/lesson/c_sharp_compilation_process)
* [Code Weaving Using Fody](https://codingcanvas.com/code-weaving-using-fody/)
* [Weaving for those who know nothing about net it weaving](https://medium.com/@heytherewill/net-il-weaving-for-those-who-know-nothing-about-net-il-weaving-c0f7e461ef47)