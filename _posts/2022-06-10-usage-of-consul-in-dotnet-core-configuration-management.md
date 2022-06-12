---
title: "Usage of Consul in .NET Core - Configuration Management"
author: Engincan Veske
date:   2022-06-10 00:00:00 +0300
categories: [.NET Core, Configuration Management]
tags: [configuration-management, consul, dotnet-core]
math: true
mermaid: true
---

In this article, I would like to talk about the **Consul** tool, which enables us to change/manage our settings on the .NET Core side from a central point, via the UI. Firstly, let's start by talking about what **Consul** is and what advantages does it provide for us.

![Consul](/assets/images/consul-article/consul.png)

## What is Consul?

Before talking about what **Consul** is and the advantages/conveniences it provides for us, in an application; Let's review the resources where we can keep our application-based settings. 

Let's have a look at where we can store/keep application-based settings: 

**1-)** In application settings (appsettings.json, appsettings.development.json, environment variables etc.),
**2-)** In the database,
**3-)** In a key-value store (Consul comes into play here) 

* Keeping our relevant data in a file like **appsettings.json** will not cause any performance disadvantage for us. By simply storing the relevant settings as key-values in the relevant file, we can then perform the operations on the basis of the relevant settings. However, if this is the case, we will not be able to simply manage these settings via the UI. In addition, each developer will have to commit this in the relevant setting change. 

* When we look at the database option, there is a loss of performance since the relevant setting will be fetched from the database each time and an action will be taken accordingly. Of course, at this point, this performance problem can be improved by using the **cache mechanism**, but we can say that the effort we spend will increase because if a setting is changed, the **cache invalidation** situation will come into play.

* If we consider the option of keeping our settings in a **key-value store**, which is another method, we can use the pub/sub pattern to load the relevant changes in the application runtime, and in this way, we can dynamically access the relevant settings for each change without having to deal with **cache invalidation**. 

When we evaluate our options here, we can see that keeping our settings in the key-value store makes our work easier and allows us to provide a centralized settings management. At this point, we can use Consul as the key-value store option. 

> **Consul** acts as a **distributed key-value store** for us, a choice where we can keep our application settings in a central place and use them easily within the application. 

## Usage of Consul in .NET Core Application

After talking about what Consul is and what advantages it provides for us, we can now create a simple .NET Core Web API project and move on to its use. 

> You can find the source code of the application at [https://github.com/EngincanV/Asp.Net-Core-Consul-Demo](https://github.com/EngincanV/Asp.Net-Core-Consul-Demo). 

Firstly, let's run our Consul application on Docker. We can use the following command for this. 

```bash
docker run -d -p 8500:8500 -p 8600:8600/udp --name=my-consul consul agent -server -ui -node=server-1 -bootstrap-expect=1 -client=0.0.0.0
```

After running this command, if you navigate to [http://localhost:8500](http://localhost:8500), you should see an image similar to the photo below. 

![consul-ui](/assets/images/consul-article/consul-ui.png)

Now that we are running our Consul application via Docker, we can create a simple Web API project. If you want to create it via CLI, you can create a Web API project with the following command. 

```bash
dotnet new webapi --name Consul.Demo --output .
```

After creating our application, we need to install the Consul package on our application via Nuget. You can add the relevant package to the Web API project with the following command via the CLI. 

```bash
dotnet add package Consul --version 1.6.10.3
```

After adding the relevant package, we now need to make the necessary configurations so that we can use the settings we defined on Consul (which we will define in the next step) in our application.

Firstly, let's create a folder named **Extensions** and add the following codes by creating a class named **ServiceCollectionExtensions.cs** in this folder. 

```csharp
namespace Consul.Demo.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddConsulConfig(this IServiceCollection services, string configKey)
        {
            if(services == null)
            {
                throw new ArgumentNullException(nameof(services));
            }

            services.AddSingleton<IConsulClient>(consul => new ConsulClient(consulConfig =>
            {
                consulConfig.Address = new Uri(configKey);
            }));

            return services;
        }
    }
}
```

Then, **Startup.cs** or **Program.cs** (Since I created the project with .NET 6, there is no **Startup.cs** class and all settings are provided through this class, if you have created a .NET 6 project, you can add the following codes to this class), let's open our file and provide the relevant configurations. 

```csharp
using Consul.Demo.Extensions;

var builder = WebApplication.CreateBuilder(args);

var consulHost = "http://localhost:8500";
builder.Services.AddConsulConfig(configKey: consulHost);
builder.Services.AddControllers();

//...
```

After completing the relevant configuration, let's create a simple provider class and write a method that returns the type of value we want according to the key value we passed to the method. For this, let's create a folder named **Helpers**, add a class called **ConsulKeyValueProvider** and fill this class with the following codes. 

```csharp
using System.Text;
using System.Text.Json;

namespace Consul.Demo.Helpers
{
    public static class ConsulKeyValueProvider
    {
        public static async Task<T?> GetValueAsync<T>(string key)
        {
            using (var client = new ConsulClient())
            {
                var getPair = await client.KV.Get(key);

                if (getPair?.Response == null)
                {
                    return default(T);
                }

                var value = Encoding.UTF8.GetString(getPair.Response.Value, 0, getPair.Response.Value.Length);

                return JsonSerializer.Deserialize<T>(value);
            }
        }
    }
}
```

* Here, thanks to the **ConsulClient** class, we have created a simple method by communicating with the **Consul** (working at [http://localhost:8500](http://localhost:8500)) where we can get the value we want according to the key. 

* Let's navigate to [http://localhost:8500](http://localhost:8500), select the **Key/Value** section, and then create a key-value from there and test our method. 

![Consul - Key/Value](/assets/images/consul-article/consul-key-value.png)

![Consul - Key/Value - Edit](/assets/images/consul-article/consul-key-value-2.png)

Here I created a key named **ConsulDemoKey** and assigned several values (IsEnabled, ShowMessage and Message) as in the photo above. Now, in my .NET Core application, I need to be able to reach these values by giving the **ConsulDemoKey** key to the helper method that we've created in the previous step. To test this in practice, let's open the **WeatherForecastController** class under the **Controllers** folder and update the **Get** method as follows. 

```csharp
using Consul.Demo.Helpers;
using Consul.Demo.Models;
using Microsoft.AspNetCore.Mvc;

namespace Consul.Demo.Controllers;

[ApiController]
[Route("[controller]")]
public class WeatherForecastController : ControllerBase
{
    [HttpGet(Name = "GetWeatherForecast")]
    public async Task<ActionResult> Get()
    {
        var consulDemoKey = await ConsulKeyValueProvider.GetValueAsync<ConsulDemoKey>(key: "ConsulDemoKey");

        if(consulDemoKey != null && consulDemoKey.IsEnabled)
        {
            return Ok(consulDemoKey);
        }

        return Ok("ConsulDemoKey is null");
    }
}
```

* If we examine the code here, we can see that there is a class named **ConsulDemoKey**. While assigning a value in terms of key-value on the Consul, we can create a class to match (map) the relevant values, since we define value as json. 

* We can define the **ConsulDemoKey** class under the **Models** folder as follows. 

```csharp
namespace Consul.Demo.Models
{
    public class ConsulDemoKey
    {
        public bool IsEnabled { get; set; }

        public bool ShowMessage { get; set; }

        public string Message { get; set; }
    }
}
```

Now that we have completed everything we want to do, we can now run the application and see the result. 

![result](/assets/images/consul-article/result-1.png)

When we run our application and send a request to the **/WeatherForecast** route, the relevant values are read from **Consul** and printed on the screen as we expected.

Here, without closing our application, if we change a relevant value via **Consul** (For example: We can change the Message to "Dynamic Configuration with Consul"), we can see that the relevant change is reflected on the screen dynamically. 

![result 2](/assets/images/consul-article/result-2.png)

--- 

Thank you for reading my article. See you in my next post. 
