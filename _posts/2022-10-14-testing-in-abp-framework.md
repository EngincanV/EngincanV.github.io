---
layout: post
title:  "Testing in ABP Framework"
date:   2022-10-14 00:00:00 +0300
categories: ABP Test
---

In this post, we will take a brief look at the testing infrastructure of ABP Framework and cover some common requirements (such as mocking the [CurrentUser](https://docs.abp.io/en/abp/latest/CurrentUser)). I intend to give brief instructions and show codes for common test requirements.

## Testing Infrastructure of ABP Framework

ABP Framework uses [xUnit](https://xunit.net/) as the testing framework, [NSubstitute](https://nsubstitute.github.io/) as the mocking library and [Shouldly](https://github.com/shouldly/shouldly) as the assertion library. These libraries are pre-installed and pre-configured in the test projects. So, you don't need to make any configurations most of the time.

### Test Projects

ABP Framework contains test projects for each layers. If you create an application startup template, you'll be having these test projects:

![](/assets/images/testing-in-abp/test-projects.png)

> I've created an application template with v6.0.0 (default: MVC as UI and EF Core as database provider). So, if you create an application template with different options or in a different version, your test projects might be slightly different. For example, `.Web.Tests` project only exists for MVC / Razor Page applications and if you choose another UI you'll not be seeing the project.

All of these test projects correspond to the related layer of your project. So, you can test your domain layer in `.Domain.Tests` project (for example Domain Services and Entities), test your application services in `.Application.Tests` project and so on...

**TL;DR:** We can perform Unit Tests, Application Tests and UI Tests (in `.Web.Tests` project) in these pre-configured test projects.

### Data Seeding for Testing

If you take a quick look back at the test projects, you would notice the `.TestBase` project. Let's take a close at this project and see what it offers us.

![](/assets/images/testing-in-abp/test-base.png)

The `.TestBase` project contains some classes that are shared by the other test projects. If you want to add a class that you need to use in multiple test projects, it's the right place to go.

Wile writing tests, we usually need some initial data to query and proceed on. For example, if we want to test a method that returns a list of books, we need some initial data to check.

`BookStoreTestDataSeedContributor` class can be used to seed initial data for testing purposes:

```csharp
public class BookStoreTestDataSeedContributor : IDataSeedContributor, ITransientDependency
    {
        private readonly IIdentityUserRepository _identityUserRepository;

        public BookStoreTestDataSeedContributor(IIdentityUserRepository identityUserRepository)
        {
            _identityUserRepository = identityUserRepository;
        }

        public async Task SeedAsync(DataSeedContext context)
        {
            await _identityUserRepository.InsertAsync(
                new IdentityUser(
                    Guid.NewGuid(),
                    "User 1",
                    "user1@mail.com")
            );

            await _identityUserRepository.InsertAsync(
                new IdentityUser(
                    Guid.NewGuid(),
                    "User 2",
                    "user2@mail.com")
            );
        }
    }
```

* You can inject any repository you want and seed initial data for your tests in this class.
* In the example, I've just injected the `IIdentityUserRepository` interface and created two users.

If we examine the `BookStoreTestBaseModule` class below, we'll see the seeding test data code. 

```csharp
    [DependsOn(
        typeof(AbpAutofacModule),
        typeof(AbpTestBaseModule),
        typeof(AbpAuthorizationModule),
        typeof(BookStoreDomainModule)
        )]
    public class BookStoreTestBaseModule : AbpModule
    {
        //...

        public override void OnApplicationInitialization(ApplicationInitializationContext context)
        {
            SeedTestData(context);
        }

        private static void SeedTestData(ApplicationInitializationContext context)
        {
            AsyncHelper.RunSync(async () =>
            {
                using (var scope = context.ServiceProvider.CreateScope())
                {
                    await scope.ServiceProvider
                        .GetRequiredService<IDataSeeder>()
                        .SeedAsync();
                }
            });
        }
    }
```

The `.TestBase` project is used by the `.EntityFrameworkCore.Tests` project. And this project is configured to use an **in-memory SQLite** database. So, all of your queries will be performed against a real database.

A new fresh database is created for each test case by keeping the **Testing in Isolation** principle in mind. 

> Other words, all of your tests are independent from each other as it's supposed to be.

## Covering Common Requirements with Examples

So far, we have taken a brief look at the testing infrastructure of the ABP Framework. Now, we can cover common requirements with examples.

### Mocking the Current User

Let's assume a scenario and say a book can only be deleted by its creator. We can write code for this use case as below:

```csharp
public async Task DeleteAsync(Guid bookId)
{
    var book = await _bookRepository.GetAsync(bookId);

    if(book.CreatorId != CurrentUser.Id)
    {
        throw new UserFriendlyException("Only the creator of this book, can delete the book from BookStore");
    }

    await _bookRepository.DeleteAsync(bookId);
}
```

For this application service method, we would probably write two tests:

**1-)** Delete by the creator of the book (should successfully delete the book)

**2-)** Try to delete the book by another user (should throw `UserFriendlyException`)

```csharp
public class BookStoreAppService_Tests : BookStoreApplicationTestBase
{
    protected IBookAppService _bookAppService;
    protected ICurrentUser _currentUser;

    public BookStoreAppService_Tests()
    {
        _bookAppService = GetRequiredService<IBookAppService>();
    }

    protected override void AfterAddApplication(IServiceCollection services)
    {
        //Mock the current user
        _currentUser = Substitute.For<ICurrentUser>();
        services.AddSingleton(_currentUser);
    }

    [Fact]
    public async Task DeleteAsync()
    {
        Login(userId: BookCreatorId); //mocking the logged in as book creator

        await _bookAppService.DeleteAsync(bookId);
    }

    [Fact]
    public async Task DeleteAsync_Should_Throw_UserFriendlyException()
    {
        Should.Throw<UserFriendlyException>(async () => 
        {
            Login(userId: Guid.NewGuid()); //random user id

            await _bookAppService.DeleteAsync(bookId);
        });
    }

    private void Login(Guid userId)
    {
        _currentUser.Id.Returns(userId);
        _currentUser.IsAuthenticated.Returns(true);
    }
}
```

* Here, we have overridden the `AfterAddApplication` method, mock the `ICurrentUser` and set its lifetime as **singleton**. 
* Now, we can change the current user's id and set it as authenticated. (`Login` method).
* Let's take a look at the first test method. Here, we need to log in as the user who created the book to be able to delete the book. So, we set the current user's id as the *BookCreatorId* and we expect our test to succeed since our scenario was that only the creator can delete the book.
* On another side, if we log in with another account than the creator of the book, the book must not be deleted and the method should throw an exception. You can check the `DeleteAsync_Should_Throw_UserFriendlyException` method for this test scenario.

### Changing the Tenant Id

In our tests, we might need to change the current tenant id. In that case, we can use the [`ICurrentTenant.Change`](https://docs.abp.io/en/abp/latest/Multi-Tenancy#change-the-current-tenant) method:

```csharp
[Fact]
public async Task GetListAsync()
{
    using(_currentTenant.Change(TenantId1)) //change the tenant id
    {
        var list = await _bookAppService.GetListAsync(new GetBookInput());

        list.TotalCount.ShouldBeGreaterThan(0);
    }
}
```

> See a sample test from ABP Framework that use the `ICurrentTenant.Change` method: https://github.com/abpframework/abp/blob/dev/framework/test/Volo.Abp.Features.Tests/Volo/Abp/Features/FeatureChecker_Tests.cs#L25-L28

### Creating a Test Data Class

Creating a test data class might be helpful. We can use its properties in both while seeding test data and querying over in the test methods.

**1-)** We can create a test data class as static and use it:

*`TestData.cs`* (in `*.TestBase` project)

```csharp
public static class TestData
{
    public static Guid UserId1 = Guid.Parse("f6819bee-281a-4b82-b8ec-86ebc0cd7499");
    public static string UserName1 = "User 1";
}
```

* while seeding data,

```csharp
public class BookStoreTestDataSeedContributor : IDataSeedContributor, ITransientDependency
{
    private readonly IIdentityUserRepository _identityUserRepository;

    public BookStoreTestDataSeedContributor(IIdentityUserRepository identityUserRepository)
    {
        _identityUserRepository = identityUserRepository;
    }

    public async Task SeedAsync(DataSeedContext context)
    {
        await _identityUserRepository.InsertAsync(
            new IdentityUser(
                TestData.UserId1, //set the id over TestData class
                TestData.UserName1, //set the name over TestData class
                "user1@mail.com")
        );
    }
}
```

* and in our test code:

```csharp
[Fact]
public async Task GetAsync()
{
    //Act
    var user1 = await _userAppService.GetAsync(TestData.UserId1);
            
    //Assert
    user1.UserName.ShouldBe(TestData.UserName1);
}
```

**2-)** Alternatively, we can create a test data class as **singleton**:

*`TestData.cs`* (in `*.TestBase` project)

```csharp
public class TestData : ISingletonDependency
{
    public Guid UserId1 { get; } = Guid.NewGuid();
    public string UserName1 { get; } = "User 1";
}
```

* and use it in our test code:

```csharp
private TestData _testData;

public BookAppServiceTests()
{
    _testData = GetRequiredService<TestData>();
}

[Fact]
public async Task GetAsync()
{
    //Act
    var user1 = await _userAppService.GetAsync(_testData.UserId1);
            
    //Assert
    user1.UserName.ShouldBe(_testData.UserName1);
}
```

## See More

To learn more about Testing in ABP Framework, you can check the following documentation:

* https://docs.abp.io/en/abp/latest/Testing
* https://docs.abp.io/en/abp/latest/UI/AspNetCore/Testing
* https://docs.abp.io/en/abp/latest/UI/Angular/Testing
* https://docs.abp.io/en/abp/latest/UI/Blazor/Testing

## Conclusion

In this post, I've talked about the testing infrastructure of ABP and tried to give brief instructions about it.

I hope you find the post helpful and gave a thumbs-up already :), see you in the next one.
