---
layout: post
title:  "ABP Helper Methods"
date:   2023-06-10 00:00:00 +0000
categories: ABP
image: "/assets/images/abp-logo.svg"
---

While coding we use extension methods and helper methods frequently. They help us to achieve common operations in a declarative way. We use them to split a text to lines, query a collection by conditions, casting from one type to other and for many other purposes...

In this article, I want to show some helpful extension methods that defined and used by ABP Framework. I personally use them frequently in my daily code, and they can be life saving for many cases and prevent duplication.

Here is the list of extension methods and helper methods that we will be taking a look at in this article:

* [`Check`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/Volo/Abp/Check.cs) class (and its methods, such as `NotNullOrWhiteSpace` and `Length`)
* [`OneTimeRunner`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/Volo/Abp/Threading/OneTimeRunner.cs) class
* Some extension methods of the [`AbpCollectionExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/Collections/Generic/AbpCollectionExtensions.cs) class (`AddIfNotContains`, `IsNullOrEmpty` and `RemoveAll`)
* Some extension methods of the [`AbpDictionaryExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/Collections/Generic/AbpDictionaryExtensions.cs) class (`TryGetValue`,  `GetOrDefault`, and `GetOrAdd`)
* Some extension methods of the [`AbpEnumerableExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/Collections/Generic/AbpEnumerableExtensions.cs) class (`JoinAsString` and WhereIf`)
* Some extension methods of the [`AbpStringExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/AbpStringExtensions.cs) class (`EnsureEndsWith`, `EnsureStartsWith`, `NormalizeLineEndings`, `RemovePostFix`, `RemovePreFix`, `SplitToLines`, `ToEnum` and `TruncateWithPostfix`)
* Some extension methods of the [`AbpTypeExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Core/System/AbpTypeExtensions.cs) class (`IsAssignableTo` and `GetBaseClasses`)
* Some extension methods of the [`CurrentUserExtensions`](https://github.com/abpframework/abp/blob/dev/framework/src/Volo.Abp.Security/Volo/Abp/Users/CurrentUserExtensions.cs) class (`GetId` and `FindClaimValue`)

> I aim to keep this article updated, whenever I start using an extension method or helper classes that provided by ABP Framework. You can also comment below the extension/helper methods that you use in your daily code.

## Check Class

## OneTimeRunner Class

## Collection Extensions

## Dictionary Extensions

## String Extensions

## Type Extensions

## Current User Extensions

As you might know, we can get the information about the current user, from the `ICurrentUser` or `CurrentUser` classes. We can get `Id` of the current user, check is the current user authenticated (`IsAuthenticated`) etc. 

`CurrentUser.Id` is a nullable property. Because, the user might be not authenticated yet. However, sometimes you might expect that the current user should be authenticated to see a page and perform some operations according to the current user. For such cases, we know that the `CurrentUser.Id` can't be null. So, we can get the `Id` of the current user as not-nullable `Guid` type by using the `GetId` extension method:

```csharp
Guid? currentUserId = CurrentUser.Id; //we need to check it's null or not to use it etc.

Guid currentUserId = CurrentUser.GetId();
```

Also, there are some other extension methods such as `FindClaimValue` method that might be useful. For example we can obtain the current user's phone number by using this extension method as follows:

```csharp
string phoneNumber = CurrentUser.FindClaimValue(AbpClaimTypes.PhoneNumber);
```

---

Thanks for reading this post, see you in the next one.
