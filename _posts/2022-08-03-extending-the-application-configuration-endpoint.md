---
layout: post
title:  "Extending the Application Configuration Endpoint"
date:   2022-08-03 00:00:00 +0300
categories: ABP
image: "/assets/images/application-configuration-article/application-configuration-endpoint.png"
---

In this article, I'll show you how you can add extra-properties to the [Application Configuration](https://docs.abp.io/en/abp/latest/API/Application-Configuration) endpoint. 

Let's start by defining what **Application Configuration** is.

## What is Application Configuration Endpoint?

ABP Framework provides a standard endpoint that contains some useful information about the application, such as **localization values**, **current user information**, **granted permissions**, etc. That endpoint called as **Application Configuration Endpoint**.

This endpoint is called when the application is first initialized and used in services provided by the ABP Framework. For example, **Localizations** are determined on the backend side and Angular UI gets the localizations from the `/application-configuration` endpoint. It caches after the first initialization and invalidates when the value of a configuration is changed. So it doesn't cause any performance issues.

If you navigate to the `/api/abp/application-configuration` endpoint, you can see the all information provided by this endpoint.

![](/assets/images/application-configuration-article/application-configuration-endpoint.png)

You can also use these values on the client side and perform common application requirements (like getting the id of the current user or checking a setting). We can use the global `abp` object on the client-side to reach these values.

![](/assets/images/application-configuration-article/application-configuration-js.png)

## Extending the Endpoint

We may want to add some extra-properties to the endpoint. It's possible and pretty straightforward. We just need to create an **Application Configuration Contributor** and configure it in the `AbpApplicationConfigurationOptions`.

> `IApplicationConfigurationContributor` is [introduced in **v6.0**](https://github.com/abpframework/abp/pull/13100). So, if you want to extend the `/api/abp/application-configuration` endpoint, ensure your package version is **v6.0+**.

Let's assume a simple scenario  and implement it. We may want to add a version number to the endpoint to specify the deployment version and show it on the footer of the page. I know it might not be a good scenerio but stick with me :)

> For the rest of the article, I assume that you already created an application and then started to follow this article. If you haven't created an application yet, please [create an application](https://docs.abp.io/en/abp/latest/CLI#new) by using the ABP CLI and then continue to the article. In this article, I go with an application with MVC (so I'll be doing the configurations in the web layer) but it's also applicable for all UI types.

### 1-) Creating an Application Configuration Contributor

Create a class in your ***.Web** project that implements the `IApplicationConfigurationContributor` interface as below:

```csharp
using System.Threading.Tasks;
using Volo.Abp.AspNetCore.Mvc.ApplicationConfigurations;
using Volo.Abp.Data;

namespace Acme.BookStore.Web
{
    public class MyApplicationConfigurationContributor : IApplicationConfigurationContributor
    {
        public Task ContributeAsync(ApplicationConfigurationContributorContext context)
        {
            var deploymentVersion = "v1.0.0"; //for simplicity, I set an random version number

            context.ApplicationConfiguration.SetProperty("deploymentVersion", deploymentVersion);

            return Task.CompletedTask;
        }
    }
}
```

* Here, I've created a class named **MyApplicationConfigurationContributor** that implements the `IApplicationConfigurationContributor` interface and simply sets a new property named "deploymentVersion" with a dummy version number in the `ContributeAsync` method.

### 2-) Configuring the AbpApplicationConfigurationOptions

After creating an **Application Configuration Contributor**, we need to define it as a contributor by configuring the `AbpApplicationConfigurationOptions`. So, open your module class and configure the `AbpApplicationConfigurationOptions` as follows:

```csharp
using Volo.Abp.AspNetCore.Mvc.ApplicationConfigurations;
using System.Collections.Generic;

public override void ConfigureServices(ServiceConfigurationContext context)
{
    //other configurations

    Configure<AbpApplicationConfigurationOptions>(options => 
    {
        options.Contributors.AddIfNotContains(new MyApplicationConfigurationContributor());
    });
}
```

### Run the Application and See the Result

That was all! Within the two steps above, now we can run the application and navigate to the `/api/abp/application-configuration` endpoint to see whether our **deploymentVersion** property can be seen on the response or not.

![](/assets/images/application-configuration-article/deployment-version.png)

You can see the response of the **Application Configuration** endpoint above. As you may notice, our **deploymentVersion** is seen on the response, under the **extraProperties** section. 

We can also reach the **deploymentVersion** on the client-side and use it on our client application. We only need to use the `abp.extraProperties.deploymentVersion` and the **deploymentVersion** will be returned.

![](/assets/images/application-configuration-article/deployment-version-console.png)


#### Conclusion

In this article, we've seen what is the **Application Confuration Endpoint** and how we can extend it. I hope you find the article helpful. See you in the next article.
