---
layout: post
title:  "How to Create Custom Route Constraints in .NET Core? - IRouteConstraint"
date:   2023-02-05 00:00:00 +0000
categories: .NET .NET-Core
image: "/assets/images/route-constraint/list.png"
---

In this article, I will introduce the `IRouteConstraint` interface, which allows us to determine whether a route contains a valid value for a specified constraint. Before, digging into the code and showing how we can create a custom route constraint, first I want to mention why we even need to use a route constraint. 

## Why we might need to create a custom route constraint?

Recently, I created a custom route constraint to achieve conventional route matching. You can check the related issue [here](https://github.com/abpframework/abp/issues/15397). The problem was, some irrelevant URLs were also handled by a razor page router handler that it should not suppose to be handled. For example, I had a route convention such as `/{blog-name}/{post-name}`. If you look at this convention, this is not an identical form of a route which means `/blog/my-post` and `/policies/privacy` endpoints would be handled by the same route handler. Because, the handler can not determine which URLs should be ignored. 

```csharp
Configure<RazorPagesOptions>(options =>
{
	options.Conventions.AddPageRoute("/Blogs/Posts/Detail", "/{blogShortName}/{postUrl}");
});
```

As you can imagine, if the URL is like `/blog/my-post`, then we need to check the relevant blog and blog post, and retrieve its content if we found it from the database (these operations are performed in the *OnGet* method of the `/Blogs/Posts/Detail` page). But for other URLs, for example for the privacy policy page (*/policies/policy* in our example) we don't need these controls and it should not be handled by the same route handler. 

In order to avoid handling URLs that we shouldn't, we must somehow distinguish between them. In that point, we can create custom route constraints and attach them to our route mappings. 

> The better approach would be adding a route prefix to our route convention, such as `/blog/{blogShortName}/{postUrl}`. But this is not possible all the time, so in such cases, we can define custom route constraints and attach them to routes.

## Defining custom route constraints

To create a route constraint, we can create a class that implements the `IRouteConstraint` interface. This interface has only one method and that is the `Match` method, which returns *true* or *false* according to our checks. 

> Route handlers proceed the request according to the result of this method.

Let's create a class named as `BloggingRouteConstraint` and implement the *Match* method as below:

```csharp
public class BloggingRouteConstraint : IRouteConstraint
{
    public virtual bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values, RouteDirection routeDirection)
    {
        var ignoredPaths = new List<string> { "/policies/", "<other-page-urls...>" };
        var displayUrl = httpContext.Request.GetDisplayUrl();

        if (ignoredPaths.Any(path => displayUrl.Contains(path, StringComparison.InvariantCultureIgnoreCase)))
        {
            return false;
        }

        return true;
    }
}
```

* Here, we defined some paths that need to ignored, so from now on a route like */policies/privacy* will not be handled by a route handler that applies this constraint.
* You can check for headers, cookies, and all other things by using the parameters of this method. 

### Configuring the RouteOptions

After defining a custom route constraint, now we need to add it to the *ConstraintMap* dictionary of the `RouteOptions`. 

> By doing this, we simply say to the routing system, take my constraint into account and apply it when I defined it for a route.

```csharp
Configure<RouteOptions>(options =>
{
    options.ConstraintMap.Add("blogNameConstraint", typeof(BloggingRouteConstraint));
});
```

For the final step, we need to attach this route constraint to one of our routes. Let's do it in the next section.

### Attaching the route constraint to a route

Let's change the route convention that we shown in the previous sections as below:

```csharp
Configure<RazorPagesOptions>(options =>
{
	options.Conventions.AddPageRoute("/Blogs/Posts/Detail", "/{blogShortName:blogNameConstraint}/{postUrl}");
});
```

* As you can see, we just added *:blogNameConstraint* text next to our route. Thus, whenever a request matches with this route, it will run the `Match` method of the `BloggingRouteConstraint` class and if it's not matched with our constraint, it will not be handled by our razor page handler, which is the **OnGet** method of our */Blogs/Posts/Detail* page. 
* For example, the */policies/privacy* route will not be handled by our razor page handler anymore, so it will not make a blog and blog post check unnecessarily.


## Additional Notes

* Most of the time, you would not need to create/define custom route constraints. Rather you (probably) need to reconsider your route convention.
* You should not create route constraints frequently, it can be cumbersome your system and can be hard to remember to use it for new route conventions if you use it much. I personally only used it once.
* There are some pre-defined route constraints, so before starting to create a custom one, it can be good to check the existing constraints. You can see the list of some constraints at https://www.c-sharpcorner.com/blogs/asp-net-core-route-constraints.

![](/assets/images/route-constraint/list.png)

---

Thanks for reading the article, I hope you liked it. See you in the next one...