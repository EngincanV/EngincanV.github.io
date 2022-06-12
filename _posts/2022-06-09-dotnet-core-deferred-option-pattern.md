---
title: "Asp.Net Core - Deferred Option Pattern"
author: Engincan Veske
date:   2022-06-09 00:00:00 +0300
categories: [.NET Core, Options Pattern]
tags: [options-pattern, dotnet-core]
math: true
mermaid: true
---

In this article, I will try to explain how we can define the settings in our applications in a deferred way by using the `IConfigureOptions<TOptions>` interface.

In an application I am developing, I decided to add the **sitemap.xml** file, thinking that adding the **sitemap.xml** file would give good results so that the links of the relevant website would be better indexed and produce more efficient SEO scores. Later on, while I was browsing whether there were packages that I could easily configure the **sitemap.xml** and **robots.txt** files to add to the application, I came across a package named [Winton.AspNetCore.Seo](https://github.com/wintoncode/Winton.AspNetCore.Seo). Thanks to this package, I was able to add the **sitemap.xml** file to my application simply by specifying the relevant urls. 

Then, by examining the documents of the relevant package, I could simply view the URLs of the relevant website statically on the **/sitemap.xml** route. While performing this operation, 

I created a simple web application and then I started to make the necessary settings by installing the [Winton.AspNetCore.Seo](https://github.com/wintoncode/Winton.AspNetCore.Seo) package on the relevant web project. First, I defined the **appsettings.json** file with the links I wanted to appear on the /sitemap.xml route. Likewise, it is possible to make settings in the robots.txt file too. 

```json
{
  //...
  "Seo": {
    "Sitemap": {
      "Urls": [
        {
          "Priority": 1,
          "RelativeUrl": "/article/what-is-new-in-csharp"
        },
        {
          "Priority": 1,
          "RelativeUrl": "/article/dotnet-5"
        }
      ]
    },
    "RobotsTxt": {
      "AddSitemapUrl": true
    }
  },
  //...
}
```

* Then I updated the `ConfigureServices` method in the **Startup.cs** file as follows. In this way, I applied the process of defining the dependencies (dependency registration) required to be able to use the relevant package. 

```csharp
public class Startup {
  //...
  private IConfiguration Configuration { get; }
  
  public void ConfigureServices(IServiceCollection services)
  {
    services.AddSeo(Configuration);
             
    services.AddSeoWithDefaultRobots(options =>
    {
      options.Urls = new List<SitemapUrlOptions>
      {
        new SitemapUrlOptions { Priority = 1, RelativeUrl = "/article/what-is-new-in-csharp" },
        new SitemapUrlOptions { Priority = 1, RelativeUrl = "/article/dotnet-5" }
      };
    });
  }
  
  //...
}
```

* Later, when I ran the application and navigates to the **/sitemap.xml** and **/robots.txt** routes, I saw that the relevant links were listed as defined in **appsettings.json**. 

![sitemap.xml](/assets/images/deferred-option-pattern-article/sitemap.jpeg)

![robots.txt](/assets/images/deferred-option-pattern-article/robots.jpeg)

* After performing these operations with a simple configuration, I can address the scenario I want to realize.

* What I want to achieve at this point is to get the relevant links by calling the service that returns the relevant links in my application, and to list the relevant links in the /sitemap.xml file thanks to the "Option Pattern" so that search engines can better index the relevant links. 

* The first thing that comes to my mind is: I need to call the relevant service in the `ConfigureServices` method, access the `IServiceProvider` somehow, and call the methods of that service by resolving the relevant service (to use the services), and finally (`services.AddSeoWithDefaultRobots(options => { … })`) I needed to specify these links as options where I defined the method. 

```csharp
public class Startup {
  public void ConfigureServices(IServiceCollection services)
    {
        //...

        services.AddSeoWithDefaultRobots(  
            options =>
            {
                var scopeFactory = services
                    .BuildServiceProvider()
                    .GetRequiredService<IServiceScopeFactory>();

                using (var scope = scopeFactory.CreateScope())
                {
                    var provider = scope.ServiceProvider;
                    using (var myService = provider.GetRequiredService<MyArticleService>())
                    {
                        options.Urls = myService.GetBlogPostLinksAsync().Result;
                    }
                }
            });

        //...
    }
}
```

* In this case, when we examine the related method, we can see that the `ConfigureServices` method, whose main purpose is to register the related dependencies to the container, is out of its definition, and also that unnecessary code crowds are formed. At this point, I came to the idea that I should find another solution and perform the relevant Options after Dependency Registration processes are finished (in other words, delayed configuration (referred configuration)). 

* Later, while researching on this subject, I came across an [article](https://andrewlock.net/access-services-inside-options-and-startup-using-configureoptions/) from **Andrew Lock**. When I examined the article in detail, I saw that we encountered the same situation (we came to the same conclusion) even if the scenario we wanted to realize was different, and I encountered the `IConfigureOptions` interface. When I examined this interface, I saw that it provided the situation I wanted to realize, that is, by injecting the services I wanted, I could simply define the results I obtained for the Options I specified. And I started to the related refactoring business. 

* For this, I first defined a class called **SeoConfiguration** and implemented the `IConfigureOptions<SeoOptions>` interface as follows. 

```csharp

public class SeoConfiguration : IConfigureOptions<SeoOptions>
{
  private readonly IArticleAppService _articleAppService;

  public SeoConfiguration(IArticleAppService articleAppService)
  {
    _articleAppService = articleAppService;
  }
        
  public void Configure(SeoOptions options)
  {
    var articleUrls = _articleAppService.GetArticleLinksAsync().Result;
    var urls = articleUrls.Select(url => new SitemapUrlOptions
    {
      Priority = 1, 
      RelativeUrl = url
    }).ToList();

    options.Sitemap.Urls = urls;
    options.RobotsTxt.AddSitemapUrl = true;
  }
}
```

* If you pay attention here, we do not deal with the `IServiceProvider` interface and resolve the related dependencies. We simply do Constructor Injection and the framework takes care of the rest. When we examine the **Configure** method, we see that it takes the relevant option **(SeoOptions)** as a parameter. In this method, we received the relevant urls from our service and assign a value to this option. In this way, we configure the relevant settings. 

* The last thing we need to do is to inform our application that the value of an Options as deferred configuration of the **SeoConfiguration** class we have created should be done after the relevant dependency registration processes. For this, we can update our **Startup.cs** file as follows. 

```csharp
public class Startup {
  //...
  
  public void ConfigureServices(IServiceCollection services) {
    //...
    
    services.AddSingleton<IConfigureOptions<SeoOptions>, SeoConfiguration>();           
    services.AddSeoWithDefaultRobots();
  }
  
  //...
}
```

* Here, we are saying, **"Defer the relevant configurations until the SeoOptions class needs to be used, and perform the relevant configurations according to the operations performed in the Configure method on the class I have defined (here SeoConfiguration) when it should be used"**.
Now we can run our application and see the result by navigating to the **/sitemap.xml** and **/robots.txt** routes. 

![Generated Robots.txt](/assets/images/deferred-option-pattern-article/generated-robots.jpeg)

![Generated Sitemap.xml](/assets/images/deferred-option-pattern-article/generated-sitemap.jpeg)

* As you can see, we are now freed from a great burden by dynamically defining the relevant urls. In addition, thanks to the `IConfigureOptions` interface, we get rid of the code snippets that we need to define in the **ConfigureServices** method (first solution). 

---

Thanks for reading this article, I hope you've enjoyed it. See you in the next article...

## References

* https://andrewlock.net/access-services-inside-options-and-startup-using-configureoptions/
* https://benjamincollins.com/blog/using-dependency-injection-while-configuring-services/