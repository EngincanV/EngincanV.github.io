---
layout: post
title:  "ABP Helper Methods"
date:   2023-06-10 00:00:00 +0000
categories: ABP
image: "/assets/images/abp-logo.svg"
---

While coding we use extension methods and helper methods frequently. They help us to achieve common operations in a declarative way. We use them to split a text into lines, query a collection by conditions, cast from one type to another, and for many other purposes...

In this article, I want to show some helpful extension methods that are defined and used by ABP Framework. I personally use them frequently in my daily code, and they can be life-saving for many cases and prevent duplication.

Here is the list of extension methods and helper methods that we will be taking a look at in this article:

* [`Check`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/Volo/Abp/Check.cs) class (and its methods, such as `NotNullOrWhiteSpace` and `Length`)
* [`OneTimeRunner`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/Volo/Abp/Threading/OneTimeRunner.cs) class
* Some extension methods of the [`AbpDictionaryExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/Collections/Generic/AbpDictionaryExtensions.cs) class (`TryGetValue`,  `GetOrDefault`, and `GetOrAdd`)
* Some extension methods of the [`AbpEnumerableExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/Collections/Generic/AbpEnumerableExtensions.cs) class (`JoinAsString` and WhereIf`)
* Some extension methods of the [`AbpStringExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/AbpStringExtensions.cs) class (`EnsureEndsWith`, `EnsureStartsWith`, `NormalizeLineEndings`, `RemovePostFix`, `SplitToLines`, and `TruncateWithPostfix`)
* Some extension methods of the [`AbpTypeExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/AbpTypeExtensions.cs) class (`IsAssignableTo` and `GetBaseClasses`)
* Some extension methods of the [`CurrentUserExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Security/Volo/Abp/Users/CurrentUserExtensions.cs) class (`GetId` and `FindClaimValue`)

I aim to make this article a practical guide so there will be no long descriptions of the methods, instead, I will describe them within a sentence and then shows an example of usage. Also, I aim to keep this article updated, whenever I start using an extension method or helper classes, I will try to add it to this article. You can also comment below on the extension/helper methods that you use in your daily code, so I can add them to the article.

## Check Class

`Check.NotNull` and `Check.NotNullOrWhiteSpace` methods can be used in a constructor of an entity to ensure the integrity of the entity as follows:

```csharp
public class Book : AggregateRoot<Guid>
{
    public string Name { get; set; }

    public string Description { get; set; }

    //...

    public Book(Guid id, string name, string description) : base(id) 
    {
        Name = Check.NotNullOrWhiteSpace(name, nameof(name)); //checks if the string is null or white space and throws an exception if it is

        Description = Check.Length(description, nameof(description), BookConsts.MaxDescriptionLength); //checks the max length of the given description and throws an exception if it exceeds the length
    }
}
```

In addition to these two methods, the `Check` class provides many other useful methods, such as `Check.NotNull<>`, `Check.NotNullOrEmpty`, `AssignableTo<>`, `Range` and `Positive`. You can see the [Check](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/Volo/Abp/Check.cs) class for other methods.

## OneTimeRunner Class

`OneTimeRunner` is a utility class that guarantees to execute a code block only one time per application even if it is called multiple times.

```csharp
private readonly static OneTimeRunner OneTimeRunner = new OneTimeRunner();

for(int i = 1; i < 10; i++) 
{
    OneTimeRunner.Run(() => 
    {
        Console.WriteLine("it's called: " + i + " time(s)");
    });
}

//Prints: "it's called 1 time(s)"
```

ABP Framework uses this class in many places. For example, ABP Framework uses this class in the module classes to configure [Global Features](https://docs.abp.io/en/abp/latest/Global-Features) as follows:

```csharp
private static readonly OneTimeRunner OneTimeRunner = new OneTimeRunner();
public override void PreConfigureServices(ServiceConfigurationContext context)
{
  OneTimeRunner.Run(() =>
  {
  	GlobalFeatureManager.Instance.Enable<PaymentFeature>();
  });
}
```

You can use this class whenever you need to ensure a code-block to only run once (it might be useful to use this class on application startup for instance).

## Dictionary Extensions

`AbpDictionaryExtensions` class provides helpful methods such as `TryGetValue`, `GetOrDefault`, and `GetOrAdd`.

**Example:**

```csharp
//check if the item exists in the dictionary
if(JobQueues.TryGetValue(jobName, our var jobQueue)) 
{
    //perform operations on the job queue
}

JobQueues.GetOrDefault(jobName): //return the jobQueue if exists otherwise returns null

//tries to get the job queue, if it can not find adds a new item to the dictionary and returns it.
JobQueues.GetOrAdd(
    jobName, 
    () => new JobQueue(jobName)
);
```

* `TryGetValue`: Used to try to get a value in a dictionary if it exists. If the value exists, it returns `true` with the value of the dictionary item. Otherwise, returns `false` with the default value for the dictionary items (null for reference types, 0 for numeral values etc.).
* `GetOrDefault`: Gets a value from the dictionary with the given key. Returns default value if can not find.
* `GetOrAdd`: Get a value from the dictionary with the given key. If it can not find a value, it creates a new one according to the factory method that provided it as an argument.

## Enumerable Extensions

`AbpEnumerableExtensions` class provides helpful methods such as `JoinAsString` and `WhereIf`. Also, there are other extension methods defined in this class. They are especially helpful to use in queries.

**Examples:**

```csharp
//Concatenates the book names separated with comma
var bookNamesSeperatedWithComma = bookNames.JoinAsString(",");

//if startTime is not null, then apply the filter 
var identitySecurityLog = securityLogs.WhereIf(
            startTime.HasValue, //condition
            securityLog => securityLog.CreationTime >= startTime.Value //filter
        )
        .First();
```

* `JoinAsString`: Concatenates the members of a collection, using the specified separator between each member. In the example above, we have used it to store all bookNames in a `string` field, separated with a comma ("bookName1,bookName,...").
* `WhereIf`: Filters the list by given predicate if the given condition is true.

## String Extensions

I frequently use the extension methods of the `AbpStringExtension` class. Here are some of them:

* `EnsureEndsWith`: Adds a char to the end of a given string if it does not end with the char.
* `EnsureStartsWith`: Adds a char to the beginning of a given string if it does not start with the char.
* `NormalizeLineEndings`: Converts line endings in the string to `Environment.NewLine`.
* `RemovePostFix`: Removes the first occurrence of the given postfixes from the end of the given string.
* `SplitToLines`: Uses string.Split method to split given string by `Environment.NewLine`.
* `TruncateWithPostfix`: Gets a substring of a string from the beginning of the string if it exceeds the maximum length. It adds a "..." postfix to the end of the string if it's truncated.

**Examples:**

```csharp
var detailPage = url.EnsureEndsWith("/") + "Detail"; //add the /detail to the end of the URL

var urlWithHttps = url.EnsureStartsWith("https://"); //ensure the given URL starts with "https://"

//uses the Environment.NewLine for line endings, replaces \n with Environment.NewLine (makes it environment agnostic)
var normalizedContent = fileContent.NormalizeLineEndings(); 

//removes post fix according to the given string
var classNameWithoutManagerPostfix = nameof(MyDomainManager).RemovePostFix("Manager");

//splits a string content to lines, to a string array
string[] lines = fileContent.SplitToLines();

//if the description's length exceeds 247, it truncates the string and adds postfix (...)
var truncatedDescription = post.Description.TruncateWithPostfix(247, "...");
```

## Type Extensions

`AbpTypeExtensions` class provides helpful type extensions such as `GetFullNameWithAssemblyName` and `IsAssignableTo` methods. 

For example, we can use the `GetFullNameWithAssemblyName` method to output a type's assembly full name in an exception message to make it easy to diagnose errors:

```csharp
throw new ArgumentException($"should be assignable to {typeof(MyBaseClass).GetFullNameWithAssemblyName()}");
```

On the other hand, the `IsAssignableTo` extension method can be used to check if a class inherits from a base class or implements an interface:

```csharp
if(typeof(TEntity).IsAssignableTo<IHasCreationTime>())
{
    //TEntity should implement IHasCreationTime
}
```

> It uses `Type.IsAssignableFrom` method internally.

## Current User Extensions

As you might know, we can get the information about the current user, from the `ICurrentUser` or `CurrentUser` classes. We can get the `Id` of the current user, check if the current user is authenticated (`IsAuthenticated`) etc. 

`CurrentUser.Id` is a nullable property. Because the user might be not authenticated yet. However, sometimes you might expect that the current user should be authenticated to see a page and perform some operations according to the current user. For such cases, we know that the `CurrentUser.Id` can't be null. So, we can get the `Id` of the current user as a not-nullable `Guid` type by using the `GetId` extension method:

```csharp
Guid? currentUserId = CurrentUser.Id; //we need to check if it's null or not to use it

Guid currentUserId = CurrentUser.GetId();
```

Also, there are some other extension methods such as the `FindClaimValue` method that might be useful. For example, we can obtain the current user's phone number by using this extension method as follows:

```csharp
string phoneNumber = CurrentUser.FindClaimValue(AbpClaimTypes.PhoneNumber);
```

---

Thanks for reading this post, see you in the next one.
