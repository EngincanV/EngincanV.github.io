---
layout: post
title:  "Working with ValueTask in C#"
date:   2023-04-23 00:00:00 +0000
categories: C# ValueTask Async-Await
---

In this post, I will be mentioning about `ValueTask` and `ValueTask<TResult>` classes, which represent asynchronous operations like other task based classes such as `Task` and `Task<TResult>`. 

We will be seeing its uses and benefits in the next sections. We will first see an example asynchronous method, inspect it and talk about its possible problems. Then, we will be talking about what we can do to overcome those problems. After that, to see the effect of our changes we will compare the benchmark results of both approaches and assess the results. 

## Task (A simple asynchronous method)

`Task` class is a representation of an asynchronous operation. It's a "promise" and represents the eventual completion of some operation. It basically provides a mechanism to manage the state (faulted, canceled, completed, etc.) of code execution that will complete in the future.

With C# 5, `async` and `await` keywords came into our lives and make it easy to implement asynchronous methods by following the [TAP (Task-based asynchronous pattern)](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap).

An asynchronous method that is based on TAP, can be seen as follows:

```csharp
public async Task<int> GetTotalCountAsync()
{
    if(_countCache == 0)
    {
        _countCache = await _postRepository.GetTotalCountAsync();
    }

    return _countCache;
}
```

Calling the asynchronous method:

```csharp
var count = await GetTotalCountAsync();
```

When we create such a method, we can call it by using the `await` keyword as can be seen in the example, and prevent blocking the current thread. This makes our application responsive and prevents our app to be frozen. It allows users to perform other operations in our application while waiting for the asynchronous application has been completed. For example, in a todo application, while waiting to load todo list, you can still take notes, so the UI thread has not been blocked.

This is how we can easily create and use an asynchronous method in C# without worrying about threads that created (doesn't have to create new threads, it could use the current thread according to the current async operation state, or other aspects) and managed. 

However, let's inspect our method flow again and see if the framework offers us a better solution that we can use:

```csharp
public async Task<int> GetTotalCountAsync()
{
    if(_countCache == 0)
    {
        _countCache = await _postRepository.GetTotalCountAsync();
    }

    return _countCache;
}
```

* When we inspect our code again, we can see that our method can be completed synchronously if the total count has been already cached and passed to the `_countCache` variable. In that case, it will not be executed asynchronously and will just return the value.
* Actually, most of the time this method will be executed synchronously as you might guess. It's the hot path of our code. (**The hot path is a section of our code that executes frequently**)
* Nevertheless, a `Task<TResult>` object will be created on the **heap memory** even if it just needs to return a single value (because the `Task` object will be wrapped in the value) and this will be a burden on GC (Garbage Collector.)
* This can become a problem when instances of `Task` objects are created a lot in methods where **high-throughput** and **performance** is a primary concerns.
* As a result, we know there is no need to create an instance of a `Task` object (if a method can be run synchronously - if it has a hot path). This lead us to find a solution that don't allocate in heap memory and if the method is just returning a value, directly returns it. In that point, `ValueTask<TResult>` comes into play.

## ValueTask<TResult>

`ValueTask` was introduced in .NET Core 2.0 as a **struct** capable of wrapping either a `TResult` or a `Task<TResult>`. It's a **value-type**, which is stored in the *stack memory* instead of the *heap memory* and as you may know CPU is responsible for managing the stack memory and clearing it periodically. So, this means GC will not be working on it to dispose of it. Returning just the value will result in fewer allocations in memory which will improve not only the memory consumption of the method but the executing performance as well.

Let's update our method and make its return type as `ValueTask<int>`:

```csharp
public async ValueTask<int> GetTotalCountAsValueTaskAsync()
{
    if(_countCache == 0)
    {
        _countCache = await _postRepository.GetTotalCountAsync();
    }

    return _countCache;
}
```

That's it. We have just changed the method type `Task<int>` to `ValueTask<int>`. This gives us the following advantages:

* Fewer allocations. (When the method is `ValueTask`, a `Task` object will be created when we do an asynchronous call and in the case of a synchronous call, it will directly return the result object without creating a `Task` object)
* Better performance in most cases. (After the memory allocations are reduced, it will give us more space in memory to perform operations)
* More awareness of the code. (By inspecting the hot paths in a method and concerning to use `ValueTask` class, will give us more awareness on code implementation and usage).

> `ValueTask` is suitable for an asynchronous operation that involves synchronous hot paths.

Let's list some of limitations of the `ValueTask`:

* Should not use await keyword on the same `ValueTask` object. (The problem here, after the first call it might be disposed and can be deleted from the stack memory, therefore it might throw an exception. If you need to await the same `ValueTask` object multiple times, you should re-consider it or use the `AsTask` extension method to obtain a `Task` object)
* It can't be accessed from multiple threads concurrently. For such use cases, `Task` should be used.
* Using `ValueTask` introduces additional overhead.

In conclusion, we should use `ValueTask` only if it gives us significant performance gains and if performance and memory allocation is our primary concern. In general use, `Task` provides more flexibility.

## Benchmark Results

So far, we have seen the both `Task` and `ValueTask` types and their use cases. Now, let's see the benchmark results of our methods and compare them.

I created a console application and installed the `BenchmarkDotNet` package to the project and after that, I executed our methods 10000000 times in a loop to see the real effect when this methods called multiple times. The results of the benchmarks will be logged to the console, when we run the application. So, let's run the application and compare the results:

![](/assets/images/value-task/benchmark.png)

As can be seen in the image, the method that returns `Task<int>` is allocated almost twice the memory as the `ValueTask<int>` method. This can be a problem if the related method is called a lot. As a result, using the `ValueTask<int>` as the return type of method is more performant and allocates fewer bytes. 

## Conclusion

In this post, we have seen the `Task` and `ValueTask` types and their pros/cons to each other. As a summary:

* `Task` as a class is very flexible and has great benefits. For example, you can await it multiple times, from any number of consumers concurrently. You can use it without the need to worry about it. It only has a potential downside, where instances are created a lot and where high-throughput and performance are primary concerns. Because, it's class and any operation which needs to create and allocate an object, and the more objects that are allocated, the more work the GC needs to do, and the more resources we spend on it that could be spent doing other things.
* `ValueTask` only should be used if there is a sync hot-path in methods and significant performance gains are needed.

Most of the time, it's better to go with `Task` class. If you had bottlenecks, then you can change the return type to `ValueTask`.

---

Thanks for reading the post, see you in the next one.
