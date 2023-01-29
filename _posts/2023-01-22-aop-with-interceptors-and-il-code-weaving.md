---
layout: post
title:  "AOP with Interceptors and IL Code Weaving in .NET Applications"
date:   2023-01-29 00:00:00 +0000
categories: AOP Aspect-Oriented-Programming Interceptors Code-Weaving IL-Weaving .NET
---

In this article, I will briefly mention about what Aspect Oriented Programming (AOP) is, how it can improve our applications' modularity, and how we can achieve it.

I aim to create this article as a practical guide. Therefore, instead of talking about Aspect Oriented Programming in depth, I will briefly describe it in a few sentences and then show you the common approaches (**Interceptors** and **IL/Code Weaving**) while applying this programming paradigm.

## Aspect Oriented Programming (AOP)

Wikipedia defines [Aspect-oriented programming](https://en.wikipedia.org/wiki/Aspect-oriented_programming) as:

> In computing, aspect-oriented programming (AOP) is a programming paradigm that aims to increase modularity by allowing the separation of cross-cutting concerns.

This description pretty much describes itself, but let's describe it in a more practical way for real-world use.

We usually structure our applications as layered applications. This helps us to separate concerns into projects and thus we can build better and more maintainable applications. Also, we know which project our code should be in.

After we go with layered architectures, we can notice there are some **concerns** that we need to use in our multiple projects. For example, **Validation**, **Exception Handling**, **Logging**, and more... These common application requirements are called as *Cross-Cutting Concerns*. They can be used in any project (independently).

At that point, **Aspect Oriented Programming** comes into play and helps us to achieve this kind of requirement in a central place and use it conventionally. Thus, we can say the main purpose of the AOP is *to separate cross-cutting concerns*, *improve modularity*, and *don't repeat ourselves*.

> With Aspect Oriented Programming, we use the [Decorator Pattern](https://en.wikipedia.org/wiki/Decorator_pattern) in a way. *"This pattern is a structural design pattern that lets you attach new behaviors to objects by placing these objects inside special wrapper objects."*

**Intercepting** and **IL/Code Weaving** are common approaches for this purpose and we'll see them in action, in the next sections.

## Interceptors

*Intercepting* is a technic that helps us to intercept method calls and take additional actions to our needs. By using this technic, we can take additional actions for class methods/properties. We can log before even the method is executed, handle if an error is raised while executing the method, and many more...

This approach usually involves an IoC container. In the .NET word, we have integrations for Castle Windsor, Ninject, and Autofac for example. 

**No post-compilation changes to assemblies** are required with this approach. 

You can see the main logic of this approach, in the following image:

![](/assets/images/aop/interceptors.png)

* First, let's assume we inject `IMyInterface` and use one of its methods in our code.
* In a default case, IoC Containers are responsible to give us an implementation of the `IMyInterface` which is `MyClass` in our example.
* When **Interceptors** and **Dynamic Proxy** terms come into play, this behaviour inverted and new class which is `ProxyInterceptor` returned by IoC Containers.
* In other words, when we inject `IMyInterface` the `ProxyInterceptor` class returns to us as a implementaion instead of `MyClass`.

### Interceptors in action

For this article, we will use [Autofac](https://github.com/autofac/Autofac) as Ioc Container and [it's dynamic proxy package](https://github.com/autofac/Autofac.Extras.DynamicProxy) for interception (uses **Castle.Windsor** under the hook).

Create a web-api project and install the following packages into the project with the CLI command below:

```bash
dotnet add package Autofac.Extras.DynamicProxy --version 6.0.1
dotnet add package Autofac.Extensions.DependencyInjection --version 8.0.0
```

### 1. Creating the Interceptor

Let's create an interceptor class that logs before on our method execution, after the method executed and an exception occured.

Create a class named `LoggingInterceptor` and implement the `IInterceptor.Intercept` method as below:

```csharp
public class LoggingInterceptor : IInterceptor
{
    public void Intercept(IInvocation invocation)
    {
        try
        {
            Console.WriteLine("OrdersController.Get executing...");

            invocation.Proceed();
            
            Console.WriteLine("OrdersController.Get executed...");
        }
        catch (Exception e)
        {
            Console.WriteLine("An error occured");
            throw;
        }
    }
}
```

This method has an `IInvocation` interface as its parameter. We use the `Proceed` method of this parameter, which represents the method call of the attached class methods. As you noticed, we added some logs before and after our method calls. Also, if an error occurs, we catch it in the `catch` block, log "An error occurred" and re-throw the exception (not losing the stack trace).

### 2. Attaching the Interceptor

After we created our interceptor, now we can configure our IoC container and set in which classes this interceptor should work on.

Open your `Program.cs` file and update it with the below content:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory())
    .ConfigureContainer<ContainerBuilder>(builder =>
    {
        builder.RegisterModule(new AutofacModule());
    });
```

Here, we configured our IoC Container and said, to use the `AutofacModule` class for service registrations. But, we haven't created this class yet. So, let's create it and register our services.

> To keep the article as short as possible, assume we have the `IOrderRepository` interface and `OrderRepository` as its implementation class.

```csharp
public class AutofacModule : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        
        builder.RegisterType<OrderRepository>()
            .As<IOrderRepository>()
            .InstancePerDependency()
            .EnableInterfaceInterceptors()
            .InterceptedBy(typeof(LoggingInterceptor)); //intercept methods of OrderRepository

        builder.Register(c => new LoggingInterceptor());
    }
}
```

If we examine the `AutofacModule` class, two lines are important for interception configuration:

* `EnableInterfaceInterceptors`: Enables interceptors for injected interface types.
* `InterceptedBy`: Attach an interceptor with the registered types.

After these configurations, now we can inject the `IOrderRepository` service and use its methods. When we do that, we should be able to see the related log records.

### 3. Calling in a method

```csharp
[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;

    public OrdersController(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    [HttpGet(Name = "")]
    public string Get()
    {
        _orderRepository.Get();

        return "";
    }
}
```

When we debug our code, we will see the `IOrderRepositoryProxy` is being in use, instead of our original `IOrderRepository` service. The `IOrderRepositoryProxy` service includes our interceptor so it's a modified version of our original `IOrderRepository` service.

![](/assets/images/aop/dynamic-proxy.png)

When we run the application, we should see the logs coming from our interceptor:

![](/assets/images/aop/interceptors-output.png)

Instead of repeating this logging logic (logs before, after, and on exception), interceptors do this on our behalf of us, whenever we inject the `IOrderRepository` interface and use one of its methods (for this example).


> We can use **reflection** and create a more generic convention. So we can make it applied for all of our services. For example, we can create an interface like `IInterceptService`, make our services implement this interface, find all services that implement this interface via *reflection*, and attach our interceptors to these services.


## IL/Code Weaving

Let me quote the definition from my ["What is Code/IL Weaving?"](https://engincanv.github.io/code-weaving/il-weaving/compile-time/run-time/2022/06/12/what-is-code-il-weaving.html) article:


> After our application code is compiled and converted to IL code, injecting (changing the code or adding a new piece of code) any code block (it can be a frequently repeated code block in each class) to this created IL is called Assembly/Code/IL Weaving.


So, there is **post compilation** and it **modifies the code execution**. 

### IL/Code Weaving in action

First of all, we need to install the [PostSharp](https://www.postsharp.net/) package into our project. You can use the following CLI command to install it:

```bash
dotnet add package PostSharp --version 2023.0.3
```

### 1. Creating an aspect

First, we need to create a base class for our aspect. Logging is our aspect for this example. So, let's create a class named `LoggingAspect.cs`:

```csharp
using PostSharp.Aspects;
using PostSharp.Serialization;

[PSerializable]
public class LoggingAspect : OnMethodBoundaryAspect
{
    public override void OnEntry(MethodExecutionArgs args)
    {
        Console.WriteLine("On Entry");
    }

    public override void OnExit(MethodExecutionArgs args)
    {
        Console.WriteLine("On Exit");
    }

    public override void OnSuccess(MethodExecutionArgs args)
    {
        Console.WriteLine("On Success");
    }

    public override void OnException(MethodExecutionArgs args)
    {
        Console.WriteLine("On Success");
    }
}
```

* We created a class that inherits from the `OnMethodBoundaryAspect`. This class is a base class for aspects and inserts some code before/after our methods (post-compilation). Also, this base class is an attribute, so we can use our `LoggingAspect` class as an attribute as well.
* This allows us to use this aspect explicitly. If we want to use this aspect, we can simply define it above of our service methods (we will do this in the next section).
* Also, notice we used the `PSerializable` attribute on our aspect class.

### 2. Attaching the aspect

To attach an aspect to any service we want, we just need to use it as an attribute. 


> Also, it's possible to make it convenient and use it for all services but for simplicity, we use it as an attribute for this example.


```csharp
public interface IOrderRepository
{
    void Get();
}

[LoggingAspect]
public class OrderRepository : IOrderRepository
{
    public void Get()
    {
        Console.WriteLine("GET");
    }
}
```

### 3. Calling in a method

```csharp
[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;

    public OrdersController(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    [HttpGet(Name = "")]
    public string Get()
    {
        _orderRepository.Get();

        return "";
    }
}
```

We injected the `IOrderRepository` interface, so when we make a request to this endpoint we should see our logging aspect is working:

![](/assets/images/aop/weaving-output.png)

## Conclusion

In this article, I tried describing what AOP is and how it can help us to improve our application modularity. We saw common approaches such as **Intercepting** and **IL/Code Weaving**. 

*Interceptors* don't make post-compilation changes to assemblies, on other hand, *IL/Code Weaving* does. These approaches have so many pros and cons to each others, so it depends on the context.

---

Thanks for reading this article. I hope you found the article helpful and give a thumb-up :) 

See you in the next one.